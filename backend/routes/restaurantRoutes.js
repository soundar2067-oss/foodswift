import express from 'express';
import {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  getRestaurantMenu,
  addFoodItem,
  updateFoodItem,
  deleteFoodItem,
  addReview,
  getReviews,
  getAllFoodItems,
} from '../controllers/restaurantController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.route('/').get(getRestaurants).post(protect, authorize('admin'), createRestaurant);
router.route('/menu/items').get(getAllFoodItems);
router.route('/:id').get(getRestaurantById);
router.route('/:id/menu').get(getRestaurantMenu).post(protect, authorize('admin'), addFoodItem);
router.route('/menu/:foodId').put(protect, authorize('admin'), updateFoodItem).delete(protect, authorize('admin'), deleteFoodItem);

// Review routes
router.route('/:id/reviews').get(getReviews).post(protect, authorize('customer'), addReview);

export default router;
