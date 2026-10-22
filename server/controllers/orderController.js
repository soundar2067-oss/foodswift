const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Restaurant = require('../models/Restaurant');
const Payment = require('../models/Payment');
const { calculateOrderTotals } = require('../utils/orderCalculations');

// Place new order
exports.createOrder = async (req, res, next) => {
  try {
    const {
      restaurantId,
      items,
      deliveryAddress,
      deliveryInstructions,
      paymentMethod,
      couponCode,
      tip = 0,
    } = req.body;

    if (!deliveryAddress || !deliveryAddress.houseNo || !deliveryAddress.locality) {
      return res.status(400).json({
        success: false,
        message: 'A complete delivery address with locality is required',
      });
    }

    // Server-side calculation to prevent tampering
    const totals = await calculateOrderTotals({
      items,
      restaurantId,
      couponCode,
      tip,
    });

    // Check minimum order amount
    if (totals.subtotal < (totals.restaurant.minOrderAmount || 0)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount for ${totals.restaurant.name} is ₹${totals.restaurant.minOrderAmount}`,
      });
    }

    // Unique order number
    const orderNumber = `FS-SLM-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      restaurant: totals.restaurant._id,
      restaurantSnapshot: {
        name: totals.restaurant.name,
        branchAddress: totals.restaurant.branchAddress,
        phone: totals.restaurant.phone,
        locality: totals.restaurant.locality,
        coordinates: totals.restaurant.coordinates,
      },
      items: totals.verifiedItems,
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      tax: totals.tax,
      platformFee: totals.platformFee,
      discount: totals.discount,
      tip: totals.tip,
      totalAmount: totals.finalTotal,
      deliveryAddress,
      deliveryInstructions: deliveryInstructions || '',
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus: 'placed',
      timeline: [
        {
          status: 'placed',
          timestamp: new Date(),
          note: 'Order successfully placed by customer',
        },
      ],
      estimatedDeliveryTime: new Date(Date.now() + (totals.restaurant.estimatedDeliveryTime || 30) * 60 * 1000),
    });

    // Create payment record
    await Payment.create({
      order: order._id,
      user: req.user._id,
      amount: totals.finalTotal,
      paymentMethod,
      status: paymentMethod === 'cod' ? 'pending_cod' : 'created',
    });

    // Clear user cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], restaurant: null, coupon: undefined, subtotal: 0, finalTotal: 0 });

    // Emit Socket.IO notification if global.io available
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`restaurant_${totals.restaurant._id}`).emit('new_order', order);
      io.emit('admin_new_order', order);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('restaurant', 'name slug logoUrl bannerUrl locality rating')
      .populate('deliveryPartner', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// Get single order with live status
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant')
      .populate('customer', 'name email phone')
      .populate('deliveryPartner', 'name phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Role verification
    if (
      req.user.role === 'customer' &&
      order.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order' });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel order
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check cancellation permissions
    const isOwner = order.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    // Customer can only cancel if not yet preparing or dispatched
    if (isOwner && !['placed', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order is already being prepared or out for delivery and cannot be cancelled.',
      });
    }

    order.orderStatus = 'cancelled';
    order.cancellationReason = req.body.reason || 'Cancelled by customer';
    order.timeline.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: order.cancellationReason,
    });

    await order.save();

    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`order_${order._id}`).emit('order_status_updated', {
        orderId: order._id,
        orderStatus: 'cancelled',
        timeline: order.timeline,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Update order status (Restaurant / Delivery / Admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, deliveryPartnerDetails } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const validStatuses = [
      'placed',
      'confirmed',
      'accepted',
      'preparing',
      'ready_for_pickup',
      'assigned',
      'picked_up',
      'out_for_delivery',
      'delivered',
      'cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status transition' });
    }

    order.orderStatus = status;
    if (deliveryPartnerDetails) {
      order.deliveryPartnerDetails = {
        ...order.deliveryPartnerDetails,
        ...deliveryPartnerDetails,
      };
    }

    if (status === 'delivered') {
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'paid';
        order.isPaid = true;
      }
    }

    order.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Order updated to ${status}`,
    });

    await order.save();

    // Broadcast via Socket.IO
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`order_${order._id}`).emit('order_status_updated', {
        orderId: order._id,
        orderStatus: status,
        timeline: order.timeline,
        deliveryPartnerDetails: order.deliveryPartnerDetails,
      });
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Advance order to the next step immediately (manual or demo trigger)
exports.advanceOrderStep = async (req, res, next) => {
  try {
    const { advanceOrderManually } = require('../services/orderProgressionService');
    const order = await advanceOrderManually(req.params.id);
    res.status(200).json({
      success: true,
      message: `Order advanced to ${order.orderStatus}`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Configure auto progression speed (normal: 30 mins, fast: 30 secs)
exports.updateProgressionConfig = async (req, res, next) => {
  try {
    const { speed, autoProgress } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (speed && ['normal', 'fast'].includes(speed)) {
      order.progressionSpeed = speed;
    }
    if (typeof autoProgress === 'boolean') {
      order.autoProgress = autoProgress;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order auto-progression updated (Speed: ${order.progressionSpeed}, Active: ${order.autoProgress})`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

