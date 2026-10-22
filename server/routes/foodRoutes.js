const express = require('express');
const router = express.Router();
const {
  getFoods,
  searchFoods,
  getFoodById,
  getCategories,
  createFood,
  updateFood,
  toggleAvailability,
  deleteFood,
} = require('../controllers/foodController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', getFoods);
router.get('/search', searchFoods);
router.get('/categories', getCategories);
router.get('/:id', getFoodById);

// Protected routes
router.post('/', protect, restrictTo('admin', 'restaurant'), createFood);
router.patch('/:id', protect, restrictTo('admin', 'restaurant'), updateFood);
router.patch('/:id/toggle-availability', protect, restrictTo('admin', 'restaurant'), toggleAvailability);
router.delete('/:id', protect, restrictTo('admin', 'restaurant'), deleteFood);

module.exports = router;
