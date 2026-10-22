const Cart = require('../models/Cart');
const FoodItem = require('../models/FoodItem');
const Restaurant = require('../models/Restaurant');
const { calculateOrderTotals } = require('../utils/orderCalculations');

// Get user cart
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('restaurant', 'name slug locality branchAddress minOrderAmount deliveryFee');

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// Add item to cart or replace cart if switching restaurant
exports.addItemToCart = async (req, res, next) => {
  try {
    const { foodItemId, quantity = 1, portionSize, addOns = [], forceClear = false } = req.body;

    const foodItem = await FoodItem.findById(foodItemId);
    if (!foodItem) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    if (!foodItem.isAvailable) {
      return res.status(400).json({ success: false, message: 'This item is currently sold out' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check restaurant clash
    const targetRestaurantId = foodItem.restaurant.toString();
    if (cart.items.length > 0 && cart.restaurant && cart.restaurant.toString() !== targetRestaurantId) {
      if (!forceClear) {
        const currentRest = await Restaurant.findById(cart.restaurant);
        return res.status(409).json({
          success: false,
          conflict: true,
          currentRestaurant: currentRest ? currentRest.name : 'another restaurant',
          message: `Your cart contains items from ${currentRest ? currentRest.name : 'another restaurant'}. Do you wish to clear your cart and add items from this restaurant instead?`,
        });
      } else {
        // Clear previous restaurant items
        cart.items = [];
        cart.restaurant = targetRestaurantId;
        cart.coupon = undefined;
      }
    }

    cart.restaurant = targetRestaurantId;

    // Check if item already in cart with same portion and addOns
    const existingIndex = cart.items.findIndex(
      (i) => i.foodItem.toString() === foodItemId && i.portionSize === (portionSize || 'Standard')
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        foodItem: foodItem._id,
        name: foodItem.name,
        price: foodItem.discountPrice || foodItem.price,
        quantity: Number(quantity),
        imageUrl: foodItem.imageUrl,
        isVeg: foodItem.isVeg,
        portionSize: portionSize || 'Standard',
        addOns: addOns,
        itemTotal: (foodItem.discountPrice || foodItem.price) * Number(quantity),
      });
    }

    // Recalculate strictly server-side
    const totals = await calculateOrderTotals({
      items: cart.items,
      restaurantId: cart.restaurant,
      couponCode: cart.coupon?.code,
    });

    cart.items = totals.verifiedItems;
    cart.subtotal = totals.subtotal;
    cart.deliveryFee = totals.deliveryFee;
    cart.tax = totals.tax;
    cart.platformFee = totals.platformFee;
    cart.discount = totals.discount;
    cart.finalTotal = totals.finalTotal;

    await cart.save();
    await cart.populate('restaurant', 'name slug locality branchAddress minOrderAmount deliveryFee');

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// Update item quantity
exports.updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (Number(quantity) <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = Number(quantity);
    }

    if (cart.items.length === 0) {
      cart.restaurant = null;
      cart.coupon = undefined;
      cart.subtotal = 0;
      cart.deliveryFee = 0;
      cart.tax = 0;
      cart.platformFee = 0;
      cart.discount = 0;
      cart.finalTotal = 0;
    } else {
      const totals = await calculateOrderTotals({
        items: cart.items,
        restaurantId: cart.restaurant,
        couponCode: cart.coupon?.code,
      });

      cart.items = totals.verifiedItems;
      cart.subtotal = totals.subtotal;
      cart.deliveryFee = totals.deliveryFee;
      cart.tax = totals.tax;
      cart.platformFee = totals.platformFee;
      cart.discount = totals.discount;
      cart.finalTotal = totals.finalTotal;
    }

    await cart.save();
    if (cart.restaurant) {
      await cart.populate('restaurant', 'name slug locality branchAddress minOrderAmount deliveryFee');
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// Remove single item
exports.removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    if (cart.items.length === 0) {
      cart.restaurant = null;
      cart.coupon = undefined;
      cart.subtotal = 0;
      cart.deliveryFee = 0;
      cart.tax = 0;
      cart.platformFee = 0;
      cart.discount = 0;
      cart.finalTotal = 0;
    } else {
      const totals = await calculateOrderTotals({
        items: cart.items,
        restaurantId: cart.restaurant,
        couponCode: cart.coupon?.code,
      });

      cart.items = totals.verifiedItems;
      cart.subtotal = totals.subtotal;
      cart.deliveryFee = totals.deliveryFee;
      cart.tax = totals.tax;
      cart.platformFee = totals.platformFee;
      cart.discount = totals.discount;
      cart.finalTotal = totals.finalTotal;
    }

    await cart.save();
    if (cart.restaurant) {
      await cart.populate('restaurant', 'name slug locality branchAddress minOrderAmount deliveryFee');
    }

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// Clear entire cart
exports.clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.restaurant = null;
      cart.coupon = undefined;
      cart.subtotal = 0;
      cart.deliveryFee = 0;
      cart.tax = 0;
      cart.platformFee = 0;
      cart.discount = 0;
      cart.finalTotal = 0;
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};
