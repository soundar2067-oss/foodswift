const mongoose = require('mongoose');

const orderItemSnapshotSchema = new mongoose.Schema({
  foodItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodItem',
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  imageUrl: { type: String },
  isVeg: { type: Boolean },
  portionSize: { type: String },
  addOns: [{ name: String, price: Number }],
  itemTotal: { type: Number, required: true },
});

const timelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    restaurantSnapshot: {
      name: String,
      branchAddress: String,
      phone: String,
      locality: String,
      coordinates: { lat: Number, lng: Number },
    },
    items: [orderItemSnapshotSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    platformFee: { type: Number, default: 5 },
    discount: { type: Number, default: 0 },
    tip: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    deliveryAddress: {
      houseNo: String,
      street: String,
      locality: String,
      landmark: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: { lat: Number, lng: Number },
      contactPhone: String,
    },
    deliveryInstructions: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'razorpay', 'upi', 'upi_qr', 'card', 'netbanking'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    upiTransactionRef: {
      type: String,
      default: '',
    },
    upiQrCodeUrl: {
      type: String,
      default: '',
    },
    paidAt: {
      type: Date,
    },
    orderStatus: {
      type: String,
      enum: [
        'placed',
        'confirmed',
        'accepted',
        'preparing',
        'ready_for_pickup',
        'assigned',
        'picked_up',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'refund_pending',
        'refunded',
      ],
      default: 'placed',
      index: true,
    },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deliveryPartnerDetails: {
      name: String,
      phone: String,
      vehicleNumber: String,
      currentLocation: {
        lat: { type: Number, default: 11.6643 },
        lng: { type: Number, default: 78.1460 },
      },
    },
    timeline: [timelineSchema],
    cancellationReason: {
      type: String,
      default: '',
    },
    estimatedDeliveryTime: {
      type: Date,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    autoProgress: {
      type: Boolean,
      default: true,
    },
    progressionSpeed: {
      type: String,
      enum: ['normal', 'fast'],
      default: 'normal',
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
