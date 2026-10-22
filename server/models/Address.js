const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    label: {
      type: String,
      enum: ['Home', 'Work', 'Other'],
      default: 'Home',
    },
    houseNo: {
      type: String,
      required: [true, 'House/Flat number is required'],
      trim: true,
    },
    street: {
      type: String,
      required: [true, 'Street or Apartment name is required'],
      trim: true,
    },
    locality: {
      type: String,
      required: [true, 'Locality is required'],
      trim: true,
      index: true,
    },
    landmark: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      default: 'Salem',
      trim: true,
    },
    state: {
      type: String,
      default: 'Tamil Nadu',
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'PIN Code is required'],
      trim: true,
    },
    coordinates: {
      lat: { type: Number, default: 11.6643 },
      lng: { type: Number, default: 78.1460 },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Address', addressSchema);
