const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getAvailableCoupons,
} = require('../controllers/couponController');
const { protect } = require('../middleware/auth');

router.get('/', getAvailableCoupons);
router.post('/validate', protect, validateCoupon);

module.exports = router;
