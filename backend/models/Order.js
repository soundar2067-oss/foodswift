import mongoose from 'mongoose';
import { getModel } from './mockHelper.js';

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    orderItems: [
      {
        foodItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'FoodItem',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    shippingAddress: {
      type: String,
      required: [true, 'Please add a shipping address'],
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    paymentMethod: {
      type: String,
      enum: ['Card', 'Cash on Delivery'],
      default: 'Card',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    deliveryStatus: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'preparing',
        'out_for_delivery',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
    },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Order = getModel('Order', orderSchema);
export default Order;
