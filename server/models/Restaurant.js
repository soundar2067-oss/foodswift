const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    cuisines: [
      {
        type: String,
        trim: true,
      },
    ],
    branchAddress: {
      type: String,
      required: [true, 'Branch address is required'],
    },
    locality: {
      type: String,
      required: [true, 'Locality in Salem is required'],
      index: true,
    },
    city: {
      type: String,
      default: 'Salem',
    },
    state: {
      type: String,
      default: 'Tamil Nadu',
    },
    pincode: {
      type: String,
      default: '636001',
    },
    coordinates: {
      lat: { type: Number, default: 11.6643 },
      lng: { type: Number, default: 78.1460 },
    },
    logoUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80',
    },
    bannerUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80',
    },
    phone: {
      type: String,
      default: '+91 427 2445566',
    },
    email: {
      type: String,
      default: '',
    },
    openingHours: {
      type: String,
      default: '10:00 AM - 11:00 PM',
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    minOrderAmount: {
      type: Number,
      default: 99,
    },
    deliveryFee: {
      type: Number,
      default: 30,
    },
    estimatedDeliveryTime: {
      type: Number, // in minutes
      default: 30,
    },
    serviceArea: {
      type: String,
      default: 'Within 8 km radius of branch',
    },
    rating: {
      type: Number,
      default: 4.2,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 50,
    },
    isPureVeg: {
      type: Boolean,
      default: false,
    },
    hasNonVeg: {
      type: Boolean,
      default: true,
    },
    priceRange: {
      type: String,
      enum: ['₹', '₹₹', '₹₹₹', '₹₹₹₹'],
      default: '₹₹',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    commissionRate: {
      type: Number,
      default: 15, // 15%
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: [String],
  },
  { timestamps: true }
);

restaurantSchema.index({ name: 'text', cuisines: 'text', locality: 'text' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
