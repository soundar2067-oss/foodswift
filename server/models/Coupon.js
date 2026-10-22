const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'free_delivery'],
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: true,
    },
    maxDiscount: {
      type: Number,
      default: 150,
    },
    minOrderValue: {
      type: Number,
      default: 199,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    usageLimit: {
      type: Number,
      default: 1000,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    perUserLimit: {
      type: Number,
      default: 3,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      default: null, // null means platform-wide
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
