const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateMe,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;
