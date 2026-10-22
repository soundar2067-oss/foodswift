import express from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getRestaurantOrders,
  updateOrderStatus,
  getAvailableOrders,
  getDeliveryTasks,
  claimOrder,
  updateDeliveryStatus,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// General / Customer routes
router.route('/')
  .post(protect, authorize('customer'), createOrder);
router.route('/myorders')
  .get(protect, authorize('customer'), getMyOrders);

// Admin restaurant orders
router.route('/restaurant')
  .get(protect, authorize('admin'), getRestaurantOrders);
router.route('/:id/status')
  .put(protect, authorize('admin'), updateOrderStatus);

// Delivery routes
router.route('/delivery/available')
  .get(protect, authorize('delivery'), getAvailableOrders);
router.route('/delivery/my-tasks')
  .get(protect, authorize('delivery'), getDeliveryTasks);
router.route('/:id/claim')
  .put(protect, authorize('delivery'), claimOrder);
router.route('/:id/deliverystatus')
  .put(protect, authorize('delivery'), updateDeliveryStatus);

// Single order details
router.route('/:id')
  .get(protect, getOrderById);

export default router;
