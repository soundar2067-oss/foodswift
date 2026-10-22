const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  processRefund,
  markCodCollected,
  generateUpiQr,
  verifyUpiQr,
} = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/webhook', handleWebhook); // public raw webhook callback

router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.post('/generate-upi-qr', protect, generateUpiQr);
router.post('/verify-upi-qr', protect, verifyUpiQr);
router.post('/:id/refund', protect, restrictTo('admin'), processRefund);
router.post('/collect-cod', protect, restrictTo('admin', 'delivery'), markCodCollected);

module.exports = router;
