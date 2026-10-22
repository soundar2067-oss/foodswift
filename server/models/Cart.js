const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  foodItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodItem',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  imageUrl: { type: String },
  isVeg: { type: Boolean, default: true },
  portionSize: { type: String, default: 'Standard' },
  addOns: [{ name: String, price: Number }],
  itemTotal: { type: Number, required: true },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      default: null,
    },
    items: [cartItemSchema],
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    platformFee: { type: Number, default: 5 },
    discount: { type: Number, default: 0 },
    coupon: {
      code: String,
      discount: Number,
      discountType: String,
    },
    finalTotal: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
