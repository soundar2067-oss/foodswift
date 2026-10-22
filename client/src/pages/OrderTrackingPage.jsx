import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  Bike,
  UtensilsCrossed,
  ShieldCheck,
  Star,
  ChefHat,
  Package,
  Zap,
  FastForward,
} from 'lucide-react';
import api from '../services/api';
import RatingModal from '../components/RatingModal';
import MovingDeliveryMap from '../components/MovingDeliveryMap';
import { getCoordinatesForLocation } from '../data/tamilNaduLocations';
import { useAuth } from '../context/AuthContext';

const orderSteps = [
  { key: 'placed', label: 'Order Placed', desc: 'Received by FoodSwift' },
  { key: 'confirmed', label: 'Confirmed', desc: 'Payment verified' },
  { key: 'accepted', label: 'Accepted', desc: 'Kitchen acknowledged' },
  { key: 'preparing', label: 'Food Preparing', desc: 'Chef cooking fresh in kitchen' },
  { key: 'ready_for_pickup', label: 'Ready for Pickup', desc: 'Packed and waiting for rider' },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Rider is on the way' },
  { key: 'delivered', label: 'Delivered', desc: 'Arrived at your doorstep' },
];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isDeliveryRider = user?.role === 'delivery_partner';
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  // Live driver position
  const [driverPos, setDriverPos] = useState({ lat: 11.6680, lng: 78.1430 });

  // 30-Minute auto delivery progression states
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [advancingStep, setAdvancingStep] = useState(false);
  const [updatingSpeed, setUpdatingSpeed] = useState(false);

  useEffect(() => {
    fetchOrderDetails();

    // Socket.IO real-time tracking
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true,
    });

    socket.emit('join_order_room', id);

    socket.on('order_status_updated', (data) => {
      if (data.orderId === id) {
        setOrder((prev) => (prev ? {
          ...prev,
          orderStatus: data.orderStatus,
          timeline: data.timeline || prev.timeline,
          paymentStatus: data.paymentStatus || prev.paymentStatus,
          isPaid: data.isPaid !== undefined ? data.isPaid : prev.isPaid,
          deliveryPartnerDetails: data.deliveryPartnerDetails || prev.deliveryPartnerDetails,
        } : prev));
      }
    });

    socket.on('driver_location_updated', (data) => {
      if (data.orderId === id && data.currentLocation) {
        setDriverPos(data.currentLocation);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    if (!order || order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
      setTimeLeftStr('');
      return;
    }

    const calculateRemaining = () => {
      const created = new Date(order.createdAt).getTime();
      const target = created + 30 * 60 * 1000;
      const diffSec = Math.max(0, Math.floor((target - Date.now()) / 1000));
      const mins = Math.floor(diffSec / 60);
      const secs = diffSec % 60;
      setTimeLeftStr(`${mins}m ${secs < 10 ? '0' : ''}${secs}s`);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);
    return () => clearInterval(interval);
  }, [order?.createdAt, order?.orderStatus]);

  const handleAdvanceStep = async () => {
    setAdvancingStep(true);
    try {
      const res = await api.post(`/orders/${id}/advance-step`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      console.error('Failed to advance step:', err);
    } finally {
      setAdvancingStep(false);
    }
  };

  const handleToggleSpeed = async (speed) => {
    setUpdatingSpeed(true);
    try {
      const res = await api.patch(`/orders/${id}/progression-config`, { speed });
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      console.error('Failed to update speed:', err);
    } finally {
      setUpdatingSpeed(false);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.data);
        if (res.data.data.deliveryPartnerDetails?.currentLocation) {
          setDriverPos(res.data.data.deliveryPartnerDetails.currentLocation);
        }
      }
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const res = await api.patch(`/orders/${id}/cancel`, {
        reason: 'Customer requested cancellation',
      });
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Connecting to Salem live order tracking...</p>
      </div>
    );
  }

  // Calculate current step index
  const currentStepIdx = orderSteps.findIndex((s) => s.key === order.orderStatus);
  const isDelivered = order.orderStatus === 'delivered';
  const isCancelled = order.orderStatus === 'cancelled';

  // Dynamic coordinates across all Tamil Nadu (calculated without violating hook rules)
  const restLoc = order.restaurantSnapshot?.locality || order.restaurantSnapshot?.name || 'Salem';
  const restCoordsObj = getCoordinatesForLocation(restLoc);
  const restaurantCoords = (order.restaurantSnapshot?.coordinates?.lat && order.restaurantSnapshot?.coordinates?.lng)
    ? [order.restaurantSnapshot.coordinates.lat, order.restaurantSnapshot.coordinates.lng]
    : [restCoordsObj.lat, restCoordsObj.lng];

  const custLoc = `${order.deliveryAddress?.locality || ''} ${order.deliveryAddress?.city || ''}`;
  const custCoordsObj = getCoordinatesForLocation(custLoc);
  const customerCoords = (order.deliveryAddress?.coordinates?.lat && order.deliveryAddress?.coordinates?.lng)
    ? [order.deliveryAddress.coordinates.lat, order.deliveryAddress.coordinates.lng]
    : [custCoordsObj.lat, custCoordsObj.lng];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-screen">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-brand-600 bg-orange-50 px-2.5 py-1 rounded-lg">
              {order.orderNumber}
            </span>
            <span
              className={`text-xs font-bold uppercase px-2.5 py-1 rounded-lg ${
                isDelivered
                  ? 'bg-emerald-100 text-emerald-800'
                  : isCancelled
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800 animate-pulse'
              }`}
            >
              {order.orderStatus.replace(/_/g, ' ')}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isDelivered
              ? 'Your Food Has Arrived!'
              : isCancelled
              ? 'Order Was Cancelled'
              : 'Tracking Your Tamil Nadu Order'}
          </h1>
          <p className="text-xs text-slate-500">
            Ordered from <strong>{order.restaurantSnapshot?.name || order.restaurant?.name}</strong> in {order.restaurantSnapshot?.locality || order.deliveryAddress?.city || 'Tamil Nadu'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {['placed', 'confirmed'].includes(order.orderStatus) && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}

          {isDelivered && (
            <button
              onClick={() => setRatingModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 fill-white" />
              <span>Rate Food & Restaurant</span>
            </button>
          )}

          <Link
            to="/restaurants"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
          >
            Order More
          </Link>
        </div>
      </div>

      {/* Real-Time Moving Delivery Map across Tamil Nadu */}
      <MovingDeliveryMap
        restaurantCoords={restaurantCoords}
        customerCoords={customerCoords}
        restaurantName={order.restaurantSnapshot?.name || order.restaurant?.name || 'Restaurant Kitchen'}
        localityName={order.restaurantSnapshot?.locality || order.deliveryAddress?.city || 'Tamil Nadu'}
        deliveryAddress={`${order.deliveryAddress?.houseNo || ''}, ${order.deliveryAddress?.street || ''}, ${order.deliveryAddress?.locality || ''}`}
        orderStatus={order.orderStatus}
        riderName={order.deliveryPartnerDetails?.name || order.deliveryPartner?.name || 'Karthik S (FoodSwift Fleet)'}
        riderVehicle={order.deliveryPartnerDetails?.vehicleNumber || 'TN 30 BD 5521 (Hero Splendor)'}
      />

      {/* 30-Minute Auto-Progression Status & Controls */}
      {!isDelivered && !isCancelled && (
        <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 p-5 rounded-3xl border border-orange-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold shadow-md shadow-brand-500/20 animate-pulse flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-600 text-white">
                  30-Min Auto Delivery
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Estimated Delivery in: <span className="text-brand-600 font-extrabold">{timeLeftStr || '30 mins'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Order status automatically updates one by one across the 30-minute delivery lifecycle.
              </p>
            </div>
          </div>

          {/* Speed controls only for rider/admin — not shown to customers */}
          {isDeliveryRider && (
            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              {/* Speed Toggle */}
              <div className="flex bg-white p-1 rounded-xl border border-orange-200 text-xs font-bold shadow-xs">
                <button
                  type="button"
                  onClick={() => handleToggleSpeed('normal')}
                  disabled={updatingSpeed || order.progressionSpeed !== 'fast'}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    order.progressionSpeed !== 'fast'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Status progresses naturally across 30 minutes"
                >
                  ⏱️ 30m Standard
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleSpeed('fast')}
                  disabled={updatingSpeed || order.progressionSpeed === 'fast'}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer ${
                    order.progressionSpeed === 'fast'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-brand-600'
                  }`}
                  title="Speed up progression to 30 seconds for live demo"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>⚡ 30s Fast Demo</span>
                </button>
              </div>

              {/* Instant Next Step Button */}
              <button
                type="button"
                onClick={handleAdvanceStep}
                disabled={advancingStep}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1 transition-colors cursor-pointer disabled:opacity-50"
                title="Immediately advance to next status step"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>{advancingStep ? 'Updating...' : 'Next Step ⏭️'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Customer Order Progress Steps (simplified, customer-facing) */}
      {!isDeliveryRider && !isCancelled && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <h3 className="font-extrabold text-sm text-slate-900 mb-4">Your Order Progress</h3>
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-4 left-0 right-0 h-1 bg-slate-100 rounded-full z-0 mx-6" />
            <div
              className="absolute top-4 left-0 h-1 bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full z-0 mx-6 transition-all duration-700"
              style={{ width: `calc(${Math.min(100, (Math.max(0, currentStepIdx) / (orderSteps.length - 1)) * 100)}% - 48px)` }}
            />
            {orderSteps.map((step, idx) => {
              const done = currentStepIdx >= idx || isDelivered;
              const current = currentStepIdx === idx && !isDelivered;
              return (
                <div key={step.key} className="flex flex-col items-center z-10 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                      done
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : current
                        ? 'bg-brand-500 border-brand-500 text-white animate-pulse'
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}
                  >
                    {done ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[9px] font-bold mt-1.5 text-center leading-tight max-w-[48px] ${done ? 'text-emerald-700' : current ? 'text-brand-600' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Order Timeline — Only visible to Delivery Riders */}
      {isDeliveryRider && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Bike className="w-4 h-4 text-brand-600" />
            <span>Live Status Timeline (Rider View)</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {orderSteps.map((step, idx) => {
              const isCompleted = currentStepIdx >= idx || isDelivered;
              const isCurrent = currentStepIdx === idx && !isDelivered;

              return (
                <div
                  key={step.key}
                  className={`p-3 rounded-2xl border text-center space-y-1 transition-all ${
                    isCompleted
                      ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950 font-bold'
                      : isCurrent
                      ? 'bg-orange-50 border-brand-500 text-brand-950 font-extrabold shadow-sm animate-pulse'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold text-xs bg-white shadow-xs">
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <div className="text-xs leading-tight">{step.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{step.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delivery Partner Details & Order Invoice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rider card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">
            Delivery Partner
          </h3>

          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-lg">
              <Bike className="w-6 h-6" />
            </div>
            <div className="space-y-0.5 flex-1">
              <h4 className="font-bold text-slate-900 text-sm">
                {order.deliveryPartnerDetails?.name || order.deliveryPartner?.name || 'Karthik (Salem Fleet)'}
              </h4>
              <p className="text-xs text-slate-500">
                {order.deliveryPartnerDetails?.vehicleNumber || 'TN 30 BD 5521 (Bike)'}
              </p>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Vaccinated & Temperature Checked
              </span>
            </div>
            <a
              href={`tel:${order.deliveryPartnerDetails?.phone || '+919443200003'}`}
              className="p-3 bg-brand-50 text-brand-600 rounded-full hover:bg-brand-100 transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          <div className="text-xs text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700">Delivery Address:</div>
            <p>
              {order.deliveryAddress?.houseNo}, {order.deliveryAddress?.street},{' '}
              {order.deliveryAddress?.locality} - {order.deliveryAddress?.pincode}
            </p>
            {order.deliveryInstructions && (
              <p className="text-brand-600 font-medium">
                Note: {order.deliveryInstructions}
              </p>
            )}
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="font-extrabold text-base text-slate-900">
            Dishes Ordered
          </h3>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {order.items?.map((item) => (
              <div key={item._id} className="flex items-center space-x-3 py-2 border-b border-slate-100 last:border-0">
                {/* Dish Image */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                  <img
                    src={
                      item.imageUrl ||
                      `https://source.unsplash.com/120x120/?indian-food,${encodeURIComponent(item.name)}`
                    }
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
                {/* Dish Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    {/* Veg/Non-veg indicator */}
                    <span
                      className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center flex-shrink-0 ${
                        item.isVeg !== false
                          ? 'border-emerald-600'
                          : 'border-rose-600'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.isVeg !== false ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}
                      />
                    </span>
                    <span className="font-semibold text-slate-800 text-sm truncate">{item.name}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Qty: <strong>{item.quantity}</strong>
                    {item.portionSize && item.portionSize !== 'Standard' && (
                      <span className="ml-2 text-brand-600">• {item.portionSize}</span>
                    )}
                    {item.addOns?.length > 0 && (
                      <span className="ml-2 text-slate-400">• {item.addOns.map(a => a.name).join(', ')}</span>
                    )}
                  </div>
                </div>
                {/* Price */}
                <span className="font-bold text-slate-900 text-sm flex-shrink-0">₹{item.itemTotal}</span>
              </div>
            ))}
          </div>

          {/* Paid Online Notice or COD notice */}
          {order.isPaid || order.paymentStatus === 'paid' || order.paymentMethod === 'upi_qr' ? (
            <div className="bg-emerald-50 border border-emerald-200/80 p-3 rounded-2xl flex items-start space-x-2.5 text-emerald-950">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <div className="font-black text-emerald-900">
                  PAID ONLINE VIA UPI QR CODE
                </div>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Zero cash to pay at doorstep. Delivery fleet has been notified.
                </p>
                {order.upiTransactionRef && (
                  <p className="text-[10px] text-emerald-600 font-mono">
                    Ref: {order.upiTransactionRef}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-xs text-amber-900 font-medium">
              💵 <strong>Cash on Delivery:</strong> Please keep ₹{order.totalAmount} ready or ask rider for their doorstep collection UPI QR.
            </div>
          )}

          <div className="pt-2 space-y-1 text-xs text-slate-600 border-t border-slate-100">
            <div className="flex justify-between">
              <span>Payment Mode</span>
              <span className="font-bold uppercase text-slate-900">
                {order.paymentMethod === 'upi_qr' ? 'UPI QR (Scan & Pay)' : order.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment Status</span>
              <span className={`font-bold uppercase ${
                order.isPaid || order.paymentStatus === 'paid'
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`}>
                {order.isPaid ? 'PAID & SECURED' : order.paymentStatus}
              </span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1">
              <span>Total Bill</span>
              <span className="text-brand-600">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <RatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        restaurant={order.restaurant}
        orderId={order._id}
        onReviewSubmitted={fetchOrderDetails}
      />
    </div>
  );
}
