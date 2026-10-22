import mongoose from 'mongoose';
import { getModel } from './mockHelper.js';

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a restaurant name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    cuisine: {
      type: String,
      required: [true, 'Please add cuisine type(s)'],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=60',
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Restaurant = getModel('Restaurant', restaurantSchema);
export default Restaurant;
