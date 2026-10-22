const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const FoodItem = require('../models/FoodItem');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const DeliveryPartner = require('../models/DeliveryPartner');
const Coupon = require('../models/Coupon');

// Get overall platform analytics & stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalCustomers,
      totalRestaurants,
      activeRestaurants,
      unverifiedRestaurants,
      totalFoods,
      totalOrders,
      ordersInProgress,
      completedOrders,
      cancelledOrders,
      paymentsSummary,
      activeDrivers,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Restaurant.countDocuments(),
      Restaurant.countDocuments({ isActive: true }),
      Restaurant.countDocuments({ isVerified: false }),
      FoodItem.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: { $in: ['placed', 'confirmed', 'accepted', 'preparing', 'ready_for_pickup', 'assigned', 'picked_up', 'out_for_delivery'] } }),
      Order.countDocuments({ orderStatus: 'delivered' }),
      Order.countDocuments({ orderStatus: 'cancelled' }),
      Order.aggregate([
        { $match: { orderStatus: 'delivered' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalDeliveryFees: { $sum: '$deliveryFee' },
            totalPlatformFees: { $sum: '$platformFee' },
            totalTaxes: { $sum: '$tax' },
          },
        },
      ]),
      DeliveryPartner.countDocuments({ isAvailable: true }),
    ]);

    const revenueStats = paymentsSummary[0] || {
      totalRevenue: 0,
      totalDeliveryFees: 0,
      totalPlatformFees: 0,
      totalTaxes: 0,
    };

    // Calculate online vs COD split
    const paymentMethods = await Order.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$totalAmount' },
        },
      },
    ]);

    // Recent orders for dashboard table
    const recentOrders = await Order.find()
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name locality')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        totalRestaurants,
        activeRestaurants,
        unverifiedRestaurants,
        totalFoods,
        totalOrders,
        ordersInProgress,
        completedOrders,
        cancelledOrders,
        totalRevenue: revenueStats.totalRevenue,
        platformEarnings: revenueStats.totalPlatformFees + Math.round(revenueStats.totalRevenue * 0.15), // platform fee + 15% commission
        activeDrivers,
        paymentMethods,
      },
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

// Manage restaurants (List all, approve/verify, deactivate)
exports.getAllRestaurants = async (req, res, next) => {
  try {
    const { status, verified, search } = req.query;
    const query = {};

    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (verified === 'true') query.isVerified = true;
    if (verified === 'false') query.isVerified = false;

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const restaurants = await Restaurant.find(query).sort({ createdAt: -1 }).limit(100);

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    next(error);
  }
};

// Toggle restaurant verification
exports.toggleRestaurantVerification = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    restaurant.isVerified = !restaurant.isVerified;
    await restaurant.save();

    res.status(200).json({
      success: true,
      message: `Restaurant verification status set to ${restaurant.isVerified ? 'Verified' : 'Unverified'}`,
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

// Manage users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const query = {};
    if (role) query.role = role;

    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).limit(100);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// Toggle user activation
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account is now ${user.isActive ? 'Active' : 'Suspended'}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Create coupon
exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

// Delete coupon
exports.deleteCoupon = async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders with filtering (Admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'all') query.orderStatus = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customer', 'name email phone')
        .populate('restaurant', 'name locality')
        .populate('deliveryPartner', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query),
    ]);
    res.status(200).json({
      success: true,
      data: orders,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) { next(error); }
};

// Admin: update any order status
exports.updateOrderStatusAdmin = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const allowedStatuses = ['placed','confirmed','accepted','preparing','ready_for_pickup','assigned','out_for_delivery','delivered','cancelled','refunded'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    order.orderStatus = status;
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }
    order.timeline.push({ status, timestamp: new Date(), note: note || `Status updated to ${status} by Admin` });
    await order.save();
    if (req.app.get('io')) {
      req.app.get('io').to(`order_${order._id}`).emit('order_status_updated', {
        orderId: order._id, orderStatus: status, timeline: order.timeline,
      });
    }
    res.status(200).json({ success: true, message: `Order status updated to ${status}`, data: order });
  } catch (error) { next(error); }
};
