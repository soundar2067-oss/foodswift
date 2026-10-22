import Order from '../models/Order.js';
import FoodItem from '../models/FoodItem.js';
import Restaurant from '../models/Restaurant.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const {
      restaurantId,
      orderItems,
      shippingAddress,
      phone,
      paymentMethod,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      res.status(404);
      throw new Error('Restaurant not found');
    }

    // Fetch food items to verify prices and build order item list
    const verifiedOrderItems = [];
    let totalPrice = 0;

    for (const item of orderItems) {
      const foodItem = await FoodItem.findById(item.foodItem);
      if (!foodItem) {
        res.status(404);
        throw new Error(`Food item not found: ${item.foodItem}`);
      }

      const itemPrice = foodItem.price;
      const subtotal = itemPrice * item.quantity;
      totalPrice += subtotal;

      verifiedOrderItems.push({
        foodItem: foodItem._id,
        name: foodItem.name,
        price: itemPrice,
        quantity: item.quantity,
      });
    }

    // Place order
    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurantId,
      orderItems: verifiedOrderItems,
      shippingAddress,
      phone,
      paymentMethod,
      totalPrice,
      paymentStatus: paymentMethod === 'Card' ? 'paid' : 'pending',
      deliveryStatus: 'pending',
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('restaurant', 'name address')
      .populate('deliveryPartner', 'name phone');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Authorize check: user who ordered, restaurant owner, or delivery partner
    const isUser = order.user._id.toString() === req.user._id.toString();
    
    // Check if user is restaurant owner
    const restaurant = await Restaurant.findById(order.restaurant._id);
    const isOwner = restaurant.owner.toString() === req.user._id.toString();

    // Check if delivery partner
    const isDelivery = order.deliveryPartner && order.deliveryPartner._id.toString() === req.user._id.toString();
    const isDeliveryDriverRole = req.user.role === 'delivery';

    if (!isUser && !isOwner && !isDelivery && !isDeliveryDriverRole) {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('restaurant', 'name cuisine image')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders for restaurant owner (Admin)
// @route   GET /api/orders/restaurant
// @access  Private/Admin
export const getRestaurantOrders = async (req, res, next) => {
  try {
    // Find restaurants owned by this user
    const restaurants = await Restaurant.find({ owner: req.user._id });
    const restaurantIds = restaurants.map((r) => r._id);

    const orders = await Order.find({ restaurant: { $in: restaurantIds } })
      .populate('user', 'name')
      .populate('deliveryPartner', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order delivery/prep status by restaurant (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Verify restaurant ownership
    const restaurant = await Restaurant.findById(order.restaurant);
    if (restaurant.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to manage orders for this restaurant');
    }

    order.deliveryStatus = status;
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending/available orders for delivery partners
// @route   GET /api/orders/delivery/available
// @access  Private/Delivery
export const getAvailableOrders = async (req, res, next) => {
  try {
    // Driver can claim orders that are accepted/preparing and don't have driver assigned
    const orders = await Order.find({
      deliveryStatus: { $in: ['accepted', 'preparing'] },
      deliveryPartner: null,
    })
      .populate('restaurant', 'name address')
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active/completed delivery tasks for the driver
// @route   GET /api/orders/delivery/my-tasks
// @access  Private/Delivery
export const getDeliveryTasks = async (req, res, next) => {
  try {
    const orders = await Order.find({ deliveryPartner: req.user._id })
      .populate('restaurant', 'name address')
      .populate('user', 'name address')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Claim order for delivery
// @route   PUT /api/orders/:id/claim
// @access  Private/Delivery
export const claimOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.deliveryPartner) {
      res.status(400);
      throw new Error('Order already claimed by another driver');
    }

    order.deliveryPartner = req.user._id;
    order.deliveryStatus = 'preparing'; // Driver matches status or starts preparing
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery driver status
// @route   PUT /api/orders/:id/deliverystatus
// @access  Private/Delivery
export const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.deliveryPartner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized as the delivery driver for this order');
    }

    order.deliveryStatus = status;
    if (status === 'delivered') {
      order.paymentStatus = 'paid'; // Cash on delivery is now paid
    }
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
