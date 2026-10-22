const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllRestaurants,
  toggleRestaurantVerification,
  getAllUsers,
  toggleUserStatus,
  createCoupon,
  deleteCoupon,
  getAllOrders,
  updateOrderStatusAdmin,
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);
router.use(restrictTo('admin'));

router.get('/stats', getDashboardStats);
router.get('/restaurants', getAllRestaurants);
router.patch('/restaurants/:id/toggle-verification', toggleRestaurantVerification);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.post('/coupons', createCoupon);
router.delete('/coupons/:id', deleteCoupon);
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatusAdmin);

module.exports = router;
