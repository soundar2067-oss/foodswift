const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['order', 'promo', 'system', 'payment'],
      default: 'order',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
