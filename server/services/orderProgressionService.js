const Order = require('../models/Order');
const Payment = require('../models/Payment');

/**
 * 30-Minute Standard Delivery Progression Schedule (minutes):
 * 0 min  -> placed
 * 2 min  -> confirmed
 * 5 min  -> accepted
 * 10 min -> preparing
 * 18 min -> ready_for_pickup
 * 24 min -> out_for_delivery
 * 30 min -> delivered
 *
 * Fast Demo Mode Schedule (seconds):
 * 0s  -> placed
 * 5s  -> confirmed
 * 10s -> accepted
 * 15s -> preparing
 * 20s -> ready_for_pickup
 * 25s -> out_for_delivery
 * 30s -> delivered
 */
const STAGES = [
  {
    status: 'placed',
    minMinute: 0,
    fastSec: 0,
    note: 'Order placed by customer in Salem',
  },
  {
    status: 'confirmed',
    minMinute: 2,
    fastSec: 5,
    note: 'Order confirmed & payment verified by FoodSwift system',
  },
  {
    status: 'accepted',
    minMinute: 5,
    fastSec: 10,
    note: 'Salem kitchen acknowledged and accepted the order',
  },
  {
    status: 'preparing',
    minMinute: 10,
    fastSec: 15,
    note: 'Chef is cooking fresh food in the Salem kitchen',
  },
  {
    status: 'ready_for_pickup',
    minMinute: 18,
    fastSec: 20,
    note: 'Order is packed and ready for delivery partner pickup',
  },
  {
    status: 'out_for_delivery',
    minMinute: 24,
    fastSec: 25,
    note: 'Delivery rider Karthik S picked up the package and is on the way',
  },
  {
    status: 'delivered',
    minMinute: 30,
    fastSec: 30,
    note: 'Order safely delivered to your doorstep in Salem! Enjoy your meal',
  },
];

let globalIo = null;
let tickTimer = null;

// Salem rider default details
const DEFAULT_RIDER = {
  name: 'Karthik S (Salem Fleet)',
  phone: '+91 98421 98765',
  vehicleNumber: 'TN 30 BD 5521 (Hero Splendor)',
};

/**
 * Get stage index by status string
 */
const getStageIndex = (status) => {
  return STAGES.findIndex((s) => s.status === status);
};

/**
 * Determine which stage the order should be at based on elapsed time
 */
const getTargetStage = (order) => {
  const isFast = order.progressionSpeed === 'fast';
  const createdAtMs = new Date(order.createdAt).getTime();
  const elapsedSec = (Date.now() - createdAtMs) / 1000;
  const elapsedMin = elapsedSec / 60;

  let matchedStageIdx = 0;
  for (let i = STAGES.length - 1; i >= 0; i--) {
    const threshold = isFast ? STAGES[i].fastSec : STAGES[i].minMinute;
    const current = isFast ? elapsedSec : elapsedMin;
    if (current >= threshold) {
      matchedStageIdx = i;
      break;
    }
  }
  return { stageIdx: matchedStageIdx, stage: STAGES[matchedStageIdx], elapsedMin, elapsedSec };
};

/**
 * Advance an order to a specific stage or the next stage
 */
const advanceOrderToStage = async (order, targetStageIdx, ioInstance = globalIo) => {
  if (!order || ['delivered', 'cancelled', 'refunded'].includes(order.orderStatus)) {
    return null;
  }

  const currentIdx = getStageIndex(order.orderStatus);
  if (targetStageIdx <= currentIdx) {
    return order;
  }

  const newStage = STAGES[targetStageIdx];
  const previousStatus = order.orderStatus;
  order.orderStatus = newStage.status;

  // Add rider details if reaching out_for_delivery or preparing
  if (['ready_for_pickup', 'out_for_delivery', 'delivered'].includes(newStage.status)) {
    if (!order.deliveryPartnerDetails || !order.deliveryPartnerDetails.name) {
      order.deliveryPartnerDetails = {
        ...DEFAULT_RIDER,
        currentLocation: order.restaurantSnapshot?.coordinates || { lat: 11.6643, lng: 78.1460 },
      };
    }
  }

  // Delivery handling
  if (newStage.status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
    if (order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
      order.isPaid = true;
      await Payment.findOneAndUpdate(
        { order: order._id },
        { status: 'collected_cod', collectedByDelivery: true, collectedAt: new Date() },
        { upsert: true }
      );
    }
  }

  // Check if timeline already has this status note
  const hasTimelineEntry = order.timeline.some((t) => t.status === newStage.status);
  if (!hasTimelineEntry) {
    order.timeline.push({
      status: newStage.status,
      timestamp: new Date(),
      note: newStage.note,
    });
  }

  await order.save();

  console.log(`[Order Progression] Order ${order.orderNumber} advanced: ${previousStatus} -> ${newStage.status}`);

  // Broadcast to Socket.IO rooms
  const io = ioInstance || globalIo;
  if (io) {
    io.to(`order_${order._id}`).emit('order_status_updated', {
      orderId: order._id,
      orderStatus: newStage.status,
      timeline: order.timeline,
      paymentStatus: order.paymentStatus,
      isPaid: order.isPaid,
      deliveryPartnerDetails: order.deliveryPartnerDetails,
    });

    io.emit('order_status_updated', {
      orderId: order._id,
      orderStatus: newStage.status,
      timeline: order.timeline,
    });
  }

  return order;
};

/**
 * Interpolate rider location between restaurant and customer address
 */
const updateRiderMovement = async (order, ioInstance = globalIo) => {
  if (order.orderStatus !== 'out_for_delivery') return;

  const startLat = order.restaurantSnapshot?.coordinates?.lat || 11.6643;
  const startLng = order.restaurantSnapshot?.coordinates?.lng || 78.1460;
  const endLat = order.deliveryAddress?.coordinates?.lat || 11.6780;
  const endLng = order.deliveryAddress?.coordinates?.lng || 78.1415;

  const isFast = order.progressionSpeed === 'fast';
  const createdAtMs = new Date(order.createdAt).getTime();
  const elapsedSec = (Date.now() - createdAtMs) / 1000;

  // Fraction between out_for_delivery and delivered
  const startSec = isFast ? 25 : 24 * 60;
  const endSec = isFast ? 30 : 30 * 60;
  const fraction = Math.min(1, Math.max(0, (elapsedSec - startSec) / (endSec - startSec)));

  const currentLat = Number((startLat + (endLat - startLat) * fraction).toFixed(6));
  const currentLng = Number((startLng + (endLng - startLng) * fraction).toFixed(6));

  if (!order.deliveryPartnerDetails) {
    order.deliveryPartnerDetails = { ...DEFAULT_RIDER };
  }
  order.deliveryPartnerDetails.currentLocation = { lat: currentLat, lng: currentLng };
  await order.save();

  const io = ioInstance || globalIo;
  if (io) {
    io.to(`order_${order._id}`).emit('driver_location_updated', {
      orderId: order._id,
      currentLocation: { lat: currentLat, lng: currentLng },
    });
  }
};

/**
 * Periodic tick checking all active orders and advancing their status
 */
const tickProgression = async () => {
  try {
    const activeOrders = await Order.find({
      orderStatus: { $in: ['placed', 'confirmed', 'accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery'] },
      autoProgress: { $ne: false },
    });

    for (const order of activeOrders) {
      const { stageIdx } = getTargetStage(order);
      const currentIdx = getStageIndex(order.orderStatus);

      if (stageIdx > currentIdx) {
        // Advance one step forward or catch up
        const nextStepIdx = currentIdx + 1;
        await advanceOrderToStage(order, nextStepIdx);
      } else if (order.orderStatus === 'out_for_delivery') {
        // Animate rider movement
        await updateRiderMovement(order);
      }
    }
  } catch (err) {
    console.error('[Order Progression] Error in tickProgression:', err.message);
  }
};

/**
 * Public: Force advance order to the next immediate stage
 */
const advanceOrderManually = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');
  const currentIdx = getStageIndex(order.orderStatus);
  if (currentIdx >= STAGES.length - 1) {
    return order;
  }
  return await advanceOrderToStage(order, currentIdx + 1);
};

/**
 * Public: Set progression speed ('normal' for 30m, 'fast' for 30s)
 */
const setProgressionSpeed = async (orderId, speed = 'normal') => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');
  order.progressionSpeed = speed;
  order.autoProgress = true;
  await order.save();
  return order;
};

/**
 * Initialize progression background service
 */
const initOrderProgression = (io) => {
  globalIo = io;

  if (tickTimer) {
    clearInterval(tickTimer);
  }

  // Check every 5 seconds for fast response & smooth transitions
  tickTimer = setInterval(tickProgression, 5000);

  console.log('⚡ [Order Progression Service] Active: 30-minute automatic delivery lifecycle initialized (Salem)');
};

module.exports = {
  STAGES,
  initOrderProgression,
  advanceOrderToStage,
  advanceOrderManually,
  setProgressionSpeed,
  tickProgression,
};
