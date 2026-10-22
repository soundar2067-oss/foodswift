const mongoose = require('mongoose');

const restaurantBranchSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    branchName: {
      type: String,
      required: true,
    },
    locality: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: String,
    isOpen: {
      type: Boolean,
      default: true,
    },
    coordinates: {
      lat: { type: Number, default: 11.6643 },
      lng: { type: Number, default: 78.1460 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RestaurantBranch', restaurantBranchSchema);
