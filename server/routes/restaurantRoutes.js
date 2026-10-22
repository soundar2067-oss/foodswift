const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  getNearbyRestaurants,
  createRestaurant,
  updateRestaurant,
  toggleStatus,
  deleteRestaurant,
} = require('../controllers/restaurantController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', getRestaurants);
router.get('/nearby', getNearbyRestaurants);
router.get('/:id', getRestaurantById);
router.get('/:id/menu', getRestaurantMenu);

// Protected routes
router.post('/', protect, restrictTo('admin', 'restaurant'), createRestaurant);
router.patch('/:id', protect, restrictTo('admin', 'restaurant'), updateRestaurant);
router.patch('/:id/toggle-status', protect, restrictTo('admin', 'restaurant'), toggleStatus);
router.delete('/:id', protect, restrictTo('admin'), deleteRestaurant);

module.exports = router;
