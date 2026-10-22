const FoodItem = require('../models/FoodItem');
const Restaurant = require('../models/Restaurant');
const Coupon = require('../models/Coupon');

/**
 * Recalculates cart/order totals strictly on the server against the database.
 * Prevents client-side price tampering.
 */
const calculateOrderTotals = async ({ items, restaurantId, couponCode, tip = 0 }) => {
  if (!items || items.length === 0) {
    throw new Error('No items in order');
  }

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new Error('Restaurant not found');
  }

  let subtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const foodItem = await FoodItem.findById(item.foodItem || item._id);
    if (!foodItem) {
      throw new Error(`Item "${item.name || 'Unknown'}" is no longer available`);
    }

    if (!foodItem.isAvailable) {
      throw new Error(`Item "${foodItem.name}" is currently sold out`);
    }

    // Determine base unit price
    let unitPrice = foodItem.discountPrice ? foodItem.discountPrice : foodItem.price;

    // Check portion size if specified
    let selectedPortion = item.portionSize || 'Standard';
    if (selectedPortion && selectedPortion !== 'Standard' && foodItem.portionSizes?.length) {
      const matchedPortion = foodItem.portionSizes.find((p) => p.name.toLowerCase() === selectedPortion.toLowerCase());
      if (matchedPortion) {
        unitPrice = matchedPortion.price;
      }
    }

    // Add add-ons price
    let addOnsPrice = 0;
    const verifiedAddOns = [];
    if (item.addOns && Array.isArray(item.addOns)) {
      for (const ao of item.addOns) {
        const matchedAddOn = foodItem.addOns.find((a) => a.name.toLowerCase() === ao.name.toLowerCase());
        if (matchedAddOn) {
          addOnsPrice += matchedAddOn.price;
          verifiedAddOns.push({ name: matchedAddOn.name, price: matchedAddOn.price });
        }
      }
    }

    const itemTotal = (unitPrice + addOnsPrice) * item.quantity;
    subtotal += itemTotal;

    verifiedItems.push({
      foodItem: foodItem._id,
      name: foodItem.name,
      price: unitPrice,
      quantity: item.quantity,
      imageUrl: foodItem.imageUrl,
      isVeg: foodItem.isVeg,
      portionSize: selectedPortion,
      addOns: verifiedAddOns,
      itemTotal,
    });
  }

  // Delivery fee calculation
  let deliveryFee = restaurant.deliveryFee !== undefined ? restaurant.deliveryFee : 35;
  // Platform fee
  const platformFee = 5;
  // GST Tax (5% for restaurants in India)
  const tax = Math.round(subtotal * 0.05);

  let discount = 0;
  let validatedCoupon = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase().trim(),
      isActive: true,
      expiryDate: { $gte: new Date() },
    });

    if (coupon) {
      if (subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'free_delivery') {
          discount = deliveryFee;
          deliveryFee = 0;
        } else if (coupon.discountType === 'percentage') {
          const calcDiscount = Math.round((subtotal * coupon.discountValue) / 100);
          discount = Math.min(calcDiscount, coupon.maxDiscount || calcDiscount);
        } else if (coupon.discountType === 'fixed') {
          discount = Math.min(coupon.discountValue, subtotal);
        }
        validatedCoupon = {
          code: coupon.code,
          discount,
          discountType: coupon.discountType,
        };
      }
    }
  }

  const finalTotal = Math.max(0, subtotal + deliveryFee + tax + platformFee + Number(tip) - discount);

  return {
    verifiedItems,
    restaurant,
    subtotal,
    deliveryFee,
    tax,
    platformFee,
    discount,
    tip: Number(tip) || 0,
    finalTotal,
    coupon: validatedCoupon,
  };
};

module.exports = { calculateOrderTotals };
