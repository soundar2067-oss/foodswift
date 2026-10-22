const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  isVeg: { type: Boolean, default: true },
  isBestseller: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, default: 0 }
}, { timestamps: true });

foodSchema.index({ restaurant: 1 });
foodSchema.index({ category: 1 });

module.exports = mongoose.model('Food', foodSchema);
