const express = require('express');
const router = express.Router();
const {
  getDeliveryProfile,
  toggleAvailability,
  getAssignedOrders,
  acceptAssignment,
  updateDeliveryStatus,
} = require('../controllers/deliveryController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);
router.use(restrictTo('admin', 'delivery'));

router.get('/profile', getDeliveryProfile);
router.patch('/toggle-availability', toggleAvailability);
router.get('/orders', getAssignedOrders);
router.patch('/orders/:id/accept', acceptAssignment);
router.patch('/orders/:id/status', updateDeliveryStatus);

module.exports = router;
