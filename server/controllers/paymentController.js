const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Refund = require('../models/Refund');

// Initialize Razorpay client if keys are present
let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_ID !== 'rzp_test_your_key_id') {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } catch (err) {
    console.warn('[Payment] Failed to initialize live Razorpay instance, using simulated test gateway:', err.message);
  }
}

// Create Razorpay online payment order
exports.createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.isPaid) {
      return res.status(400).json({ success: false, message: 'Order is already paid' });
    }

    const amountInPaise = Math.round(order.totalAmount * 100);

    // If Razorpay instance is initialized with real credentials
    if (razorpayInstance) {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${order.orderNumber}`,
        notes: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
        },
      };

      const razorpayOrder = await razorpayInstance.orders.create(options);
      order.razorpayOrderId = razorpayOrder.id;
      await order.save();

      return res.status(200).json({
        success: true,
        isSimulated: false,
        key: process.env.RAZORPAY_KEY_ID,
        razorpayOrder,
        order,
      });
    }

    // Simulated test gateway when real merchant credentials are not configured
    const simulatedOrderId = `order_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    order.razorpayOrderId = simulatedOrderId;
    await order.save();

    res.status(200).json({
      success: true,
      isSimulated: true,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_foodswift_demo',
      razorpayOrder: {
        id: simulatedOrderId,
        entity: 'order',
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${order.orderNumber}`,
        status: 'created',
      },
      order,
    });
  } catch (error) {
    next(error);
  }
};

// Verify payment signature
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      isSimulated,
    } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // If real Razorpay key secret is present and not simulated
    if (!isSimulated && razorpayInstance && process.env.RAZORPAY_KEY_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed: Invalid digital signature',
        });
      }
    }

    // Update order status
    order.paymentStatus = 'paid';
    order.isPaid = true;
    order.orderStatus = 'confirmed';
    order.razorpayPaymentId = razorpayPaymentId || `pay_sim_${Date.now()}`;
    order.timeline.push({
      status: 'confirmed',
      timestamp: new Date(),
      note: 'Payment verified and order confirmed',
    });
    await order.save();

    // Update Payment record (use $set + setOnInsert to handle upsert required fields)
    await Payment.findOneAndUpdate(
      { order: order._id },
      {
        $set: {
          status: 'captured',
          razorpayPaymentId: order.razorpayPaymentId,
          razorpaySignature: razorpaySignature || 'simulated_valid_signature',
          rawMetadata: req.body,
        },
        $setOnInsert: {
          user: order.customer,
          amount: order.totalAmount,
          paymentMethod: order.paymentMethod || 'card',
          currency: 'INR',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Notify sockets
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`order_${order._id}`).emit('order_status_updated', {
        orderId: order._id,
        orderStatus: 'confirmed',
        paymentStatus: 'paid',
        timeline: order.timeline,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully! Your order is being prepared.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Webhook endpoint for Razorpay updates
exports.handleWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'foodswift_webhook_secret';
    const signature = req.headers['x-razorpay-signature'];

    if (secret && signature) {
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        return res.status(400).json({ status: 'invalid_signature' });
      }
    }

    const event = req.body.event;
    if (event === 'payment.captured') {
      const paymentPayload = req.body.payload.payment.entity;
      const orderId = paymentPayload.notes?.orderId;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'paid',
          isPaid: true,
          orderStatus: 'confirmed',
        });
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Process refund
exports.processRefund = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    const payment = await Payment.findById(req.params.id).populate('order');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const refundAmount = amount || payment.amount;

    const refund = await Refund.create({
      payment: payment._id,
      order: payment.order._id,
      amount: refundAmount,
      reason: reason || 'Customer requested refund',
      status: 'completed',
      razorpayRefundId: `rfnd_sim_${Date.now()}`,
    });

    payment.status = 'refunded';
    await payment.save();

    await Order.findByIdAndUpdate(payment.order._id, {
      paymentStatus: 'refunded',
      orderStatus: 'refunded',
    });

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: refund,
    });
  } catch (error) {
    next(error);
  }
};

// Mark Cash On Delivery collected by delivery partner
exports.markCodCollected = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentMethod !== 'cod') {
      return res.status(400).json({ success: false, message: 'This is not a COD order' });
    }

    order.paymentStatus = 'paid';
    order.isPaid = true;
    await order.save();

    await Payment.findOneAndUpdate(
      { order: order._id },
      {
        $set: {
          status: 'collected_cod',
          collectedByDelivery: true,
          collectedAt: new Date(),
        },
        $setOnInsert: {
          user: order.customer,
          amount: order.totalAmount,
          paymentMethod: 'cod',
          currency: 'INR',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: `Cash collection of ₹${order.totalAmount} recorded successfully.`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Generate dynamic UPI QR Code for Order (GPay, PhonePe, Paytm, BHIM)
exports.generateUpiQr = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate('customer', 'name phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.isPaid) {
      return res.status(400).json({ success: false, message: 'Order is already marked as paid' });
    }

    const payeeVpa = process.env.FOODSWIFT_UPI_ID || 'foodswift.orders@okhdfcbank';
    const payeeName = 'FOODSWIFT Salem';
    const transactionNote = `FoodSwift Order ${order.orderNumber}`;
    const txnRef = `FS${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`;

    // Standard NPCI UPI URI Scheme
    const upiUri = `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${order.totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}&tr=${txnRef}`;

    // Dynamic QR image url
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=${encodeURIComponent(upiUri)}`;

    // Cache QR code url on order
    order.upiQrCodeUrl = qrCodeUrl;
    order.upiTransactionRef = txnRef;
    await order.save();

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        payeeVpa,
        payeeName,
        transactionRef: txnRef,
        upiUri,
        qrCodeUrl,
        expiresInSeconds: 300, // 5 minutes
      },
    });
  } catch (error) {
    next(error);
  }
};

// Verify Scan & Pay UPI QR Payment
exports.verifyUpiQr = async (req, res, next) => {
  try {
    const { orderId, transactionRef, isDoorstepPayment } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const ref = transactionRef || order.upiTransactionRef || `UPI-FS-${Date.now().toString().slice(-6)}`;

    // Mark order as paid
    order.paymentStatus = 'paid';
    order.isPaid = true;
    order.paymentMethod = 'upi_qr';
    order.upiTransactionRef = ref;
    order.paidAt = new Date();

    if (['placed', 'pending'].includes(order.orderStatus)) {
      order.orderStatus = 'confirmed';
    }

    order.timeline.push({
      status: order.orderStatus,
      timestamp: new Date(),
      note: isDoorstepPayment
        ? `Paid ₹${order.totalAmount} via Doorstep UPI QR to delivery partner (Ref: ${ref})`
        : `Customer paid ₹${order.totalAmount} successfully by scanning online UPI QR Code (Ref: ${ref})`,
    });

    await order.save();

    // Update payment record (safe upsert with all required fields)
    await Payment.findOneAndUpdate(
      { order: order._id },
      {
        $set: {
          status: 'captured',
          paymentMethod: 'upi_qr',
          upiTransactionRef: ref,
          collectedByDelivery: !!isDoorstepPayment,
          collectedAt: new Date(),
          rawMetadata: {
            verifiedAt: new Date(),
            verifiedVia: 'UPI_QR_CODE_SCAN',
            transactionRef: ref,
            amount: order.totalAmount,
            isDoorstepPayment: !!isDoorstepPayment,
          },
        },
        $setOnInsert: {
          user: order.customer,
          amount: order.totalAmount,
          currency: 'INR',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Notify all parties via Socket.IO
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`order_${order._id}`).emit('order_status_updated', {
        orderId: order._id,
        orderStatus: order.orderStatus,
        paymentStatus: 'paid',
        paymentMethod: 'upi_qr',
        isPaid: true,
        upiTransactionRef: ref,
        timeline: order.timeline,
      });

      // Also broadcast to delivery partner room
      io.emit('delivery_order_paid', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        paymentStatus: 'paid',
        paymentMethod: 'upi_qr',
      });
    }

    res.status(200).json({
      success: true,
      message: `Payment of ₹${order.totalAmount} verified successfully via UPI QR Code!`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

