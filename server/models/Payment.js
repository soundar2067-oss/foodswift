const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'razorpay', 'upi', 'upi_qr', 'card', 'netbanking'],
      required: true,
    },
    upiTransactionRef: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded', 'pending_cod', 'collected_cod'],
      default: 'created',
    },
    collectedByDelivery: {
      type: Boolean,
      default: false,
    },
    collectedAt: Date,
    rawMetadata: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
