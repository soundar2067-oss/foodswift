const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: ['Bike', 'Scooter', 'EV', 'Bicycle'],
      default: 'Bike',
    },
    vehicleNumber: {
      type: String,
      default: 'TN 30 AB 1234',
    },
    drivingLicenseNumber: {
      type: String,
      default: 'DL-TN30-2023-0099',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    currentLocation: {
      lat: { type: Number, default: 11.6643 },
      lng: { type: Number, default: 78.1460 },
    },
    activeOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    cashInHand: {
      type: Number,
      default: 0,
    },
    todayEarnings: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
