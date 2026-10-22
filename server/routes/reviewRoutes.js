const express = require('express');
const router = express.Router();
const {
  getRestaurantReviews,
  createReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/', getRestaurantReviews);
router.post('/', protect, createReview);

module.exports = router;
