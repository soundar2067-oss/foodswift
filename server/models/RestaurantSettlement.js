const mongoose = require('mongoose');

const restaurantSettlementSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    totalOrders: { type: Number, default: 0 },
    grossSales: { type: Number, default: 0 },
    commissionAmount: { type: Number, default: 0 },
    taxDeducted: { type: Number, default: 0 },
    netPayout: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'on_hold'],
      default: 'pending',
    },
    transactionReference: String,
    settledAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('RestaurantSettlement', restaurantSettlementSchema);
