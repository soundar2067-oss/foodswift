const mongoose = require('mongoose');

const portionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 'Half', 'Full', 'Regular', 'Large'
  price: { type: Number, required: true },
});

const addOnSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 'Extra Cheese', 'Raita', 'Mayonnaise'
  price: { type: Number, required: true, default: 0 },
});

const foodItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Food item name is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodCategory',
    },
    categoryName: {
      type: String,
      required: true,
      index: true,
    },
    isVeg: {
      type: Boolean,
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Base price is required'],
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: null,
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isBestseller: {
      type: Boolean,
      default: false,
    },
    prepTime: {
      type: Number, // in minutes
      default: 20,
    },
    portionSizes: [portionSchema],
    addOns: [addOnSchema],
    spiceLevel: {
      type: String,
      enum: ['Mild', 'Medium', 'Spicy', 'Extra Spicy', 'None'],
      default: 'Medium',
    },
    rating: {
      type: Number,
      default: 4.3,
    },
    ratingCount: {
      type: Number,
      default: 25,
    },
    tags: [String],
  },
  { timestamps: true }
);

foodItemSchema.index({ name: 'text', description: 'text', categoryName: 'text' });

module.exports = mongoose.model('FoodItem', foodItemSchema);
