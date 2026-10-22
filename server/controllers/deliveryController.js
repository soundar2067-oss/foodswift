const Order = require('../models/Order');
const DeliveryPartner = require('../models/DeliveryPartner');
const Payment = require('../models/Payment');

// Get or initialize delivery partner profile
exports.getDeliveryProfile = async (req, res, next) => {
  try {
    let partner = await DeliveryPartner.findOne({ user: req.user._id }).populate('user', 'name email phone avatar');
    if (!partner) {
      partner = await DeliveryPartner.create({
        user: req.user._id,
        isAvailable: true,
      });
      await partner.populate('user', 'name email phone avatar');
    }

    res.status(200).json({
      success: true,
      data: partner,
    });
  } catch (error) {
    next(error);
  }
};

// Toggle availability (Online/Offline)
exports.toggleAvailability = async (req, res, next) => {
  try {
    let partner = await DeliveryPartner.findOne({ user: req.user._id });
    if (!partner) {
      partner = await DeliveryPartner.create({ user: req.user._id, isAvailable: true });
    }

    partner.isAvailable = !partner.isAvailable;
    await partner.save();

    res.status(200).json({
      success: true,
      isAvailable: partner.isAvailable,
      message: `Status updated to ${partner.isAvailable ? 'Online (Available for deliveries)' : 'Offline'}`,
    });
  } catch (error) {
    next(error);
  }
};

// Get orders ready for pickup or assigned to current delivery partner
exports.getAssignedOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      $or: [
        { deliveryPartner: req.user._id, orderStatus: { $in: ['assigned', 'picked_up', 'out_for_delivery'] } },
        { orderStatus: 'ready_for_pickup', deliveryPartner: { $exists: false } },
        { orderStatus: 'ready_for_pickup', deliveryPartner: null },
      ],
    })
      .populate('restaurant', 'name branchAddress locality phone coordinates')
      .populate('customer', 'name phone')
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

// Accept delivery assignment
exports.acceptAssignment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.deliveryPartner && order.deliveryPartner.toString() !== req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Order already accepted by another partner' });
    }

    order.deliveryPartner = req.user._id;
    order.deliveryPartnerDetails = {
      name: req.user.name,
      phone: req.user.phone || '+91 98421 55678',
      vehicleNumber: 'TN 30 DF 4455',
      currentLocation: { lat: 11.6643, lng: 78.1460 },
    };
    order.orderStatus = 'assigned';
    order.timeline.push({
      status: 'assigned',
      timestamp: new Date(),
      note: `Delivery partner ${req.user.name} assigned`,
    });
    await order.save();

    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`order_${order._id}`).emit('order_status_updated', {
        orderId: order._id,
        orderStatus: 'assigned',
        deliveryPartnerDetails: order.deliveryPartnerDetails,
        timeline: order.timeline,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order assignment accepted',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Update delivery progress (e.g. picked_up, out_for_delivery, delivered)
exports.updateDeliveryStatus = async (req, res, next) => {
  try {
    const { status, note, cashCollected } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = status;

    if (status === 'delivered') {
      if (order.paymentMethod === 'cod' || cashCollected) {
        order.paymentStatus = 'paid';
        order.isPaid = true;

        await Payment.findOneAndUpdate(
          { order: order._id },
          {
            status: 'collected_cod',
            collectedByDelivery: true,
            collectedAt: new Date(),
          },
          { upsert: true }
        );

        // Update delivery partner earnings
        await DeliveryPartner.findOneAndUpdate(
          { user: req.user._id },
          {
            $inc: {
              cashInHand: order.totalAmount,
              todayEarnings: 45, // Rs.45 delivery incentive per completed trip
              totalDeliveries: 1,
            },
          }
        );
      } else {
        await DeliveryPartner.findOneAndUpdate(
          { user: req.user._id },
          {
            $inc: {
              todayEarnings: 45,
              totalDeliveries: 1,
            },
          }
        );
      }
    }

    order.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Order marked as ${status} by delivery partner`,
    });

    await order.save();

    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`order_${order._id}`).emit('order_status_updated', {
        orderId: order._id,
        orderStatus: status,
        timeline: order.timeline,
      });
    }

    res.status(200).json({
      success: true,
      message: `Delivery status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
