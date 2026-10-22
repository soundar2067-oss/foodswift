const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');

// Validate and apply coupon
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal, restaurantId } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code' });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
      expiryDate: { $gte: new Date() },
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired promo code',
      });
    }

    // Check minimum order value
    if (subtotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum order of ₹${coupon.minOrderValue}`,
      });
    }

    // Check restaurant specific coupon
    if (coupon.restaurant && coupon.restaurant.toString() !== restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'This coupon is not valid for this restaurant',
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      const calc = Math.round((subtotal * coupon.discountValue) / 100);
      discount = Math.min(calc, coupon.maxDiscount || calc);
    } else if (coupon.discountType === 'fixed') {
      discount = Math.min(coupon.discountValue, subtotal);
    } else if (coupon.discountType === 'free_delivery') {
      discount = 35; // standard delivery waived
    }

    // If user is authenticated, save coupon to their cart
    if (req.user) {
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        {
          coupon: {
            code: coupon.code,
            discount,
            discountType: coupon.discountType,
          },
        }
      );
    }

    res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" applied successfully! You saved ₹${discount}`,
      data: {
        code: coupon.code,
        discount,
        discountType: coupon.discountType,
        description: coupon.description,
      },
    });
  } catch (error) {
    next(error);
  }
};

// List available public coupons
exports.getAvailableCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: new Date() },
    }).sort({ minOrderValue: 1 });

    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};
