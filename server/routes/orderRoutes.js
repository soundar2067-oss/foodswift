const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  advanceOrderStep,
  updateProgressionConfig,
} = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelOrder);
router.patch('/:id/status', restrictTo('admin', 'restaurant', 'delivery'), updateOrderStatus);
router.post('/:id/advance-step', advanceOrderStep);
router.patch('/:id/progression-config', updateProgressionConfig);

module.exports = router;
