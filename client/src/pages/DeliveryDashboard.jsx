import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  Bike,
  Power,
  MapPin,
  Clock,
  CheckCircle2,
  Phone,
  DollarSign,
  Banknote,
  Navigation,
  QrCode,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  Smartphone,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Doorstep Collection QR state
  const [doorstepModalOpen, setDoorstepModalOpen] = useState(false);
  const [selectedOrderForQr, setSelectedOrderForQr] = useState(null);
  const [doorstepQrData, setDoorstepQrData] = useState(null);
  const [doorstepVerifying, setDoorstepVerifying] = useState(false);
  const [doorstepSuccess, setDoorstepSuccess] = useState(false);

  useEffect(() => {
    fetchDeliveryData();

    // Listen for real-time payment events from customer
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true,
    });

    socket.on('delivery_order_paid', (data) => {
      console.log('[Delivery Socket] Order paid online via UPI QR:', data);
      fetchDeliveryData();
    });

    socket.on('order_status_updated', () => {
      fetchDeliveryData();
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const fetchDeliveryData = async () => {
    try {
      setLoading(true);
      const [profRes, ordRes] = await Promise.all([
        api.get('/delivery/profile'),
        api.get('/delivery/orders'),
      ]);

      if (profRes.data.success) setProfile(profRes.data.data);
      if (ordRes.data.success) setOrders(ordRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnline = async () => {
    try {
      const res = await api.patch('/delivery/toggle-availability');
      if (res.data.success) {
        setProfile((prev) => ({ ...prev, isAvailable: res.data.isAvailable }));
      }
    } catch (e) {
      alert('Failed to update rider status');
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const res = await api.patch(`/delivery/orders/${orderId}/accept`);
      if (res.data.success) {
        fetchDeliveryData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept order');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus, cashCollected = false) => {
    try {
      const res = await api.patch(`/delivery/orders/${orderId}/status`, {
        status: newStatus,
        cashCollected,
        note: `Order marked ${newStatus} by delivery partner`,
      });
      if (res.data.success) {
        fetchDeliveryData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleOpenDoorstepQr = async (order) => {
    setSelectedOrderForQr(order);
    setDoorstepSuccess(false);
    try {
      const res = await api.post('/payments/generate-upi-qr', { orderId: order._id });
      if (res.data.success) {
        setDoorstepQrData(res.data.data);
        setDoorstepModalOpen(true);
      }
    } catch (e) {
      alert('Failed to generate doorstep UPI QR code');
    }
  };

  const handleConfirmDoorstepPayment = async () => {
    if (!selectedOrderForQr || !doorstepQrData) return;
    setDoorstepVerifying(true);
    try {
      const res = await api.post('/payments/verify-upi-qr', {
        orderId: selectedOrderForQr._id,
        transactionRef: doorstepQrData.transactionRef,
        isDoorstepPayment: true,
      });
      if (res.data.success) {
        setDoorstepSuccess(true);
        setTimeout(() => {
          setDoorstepModalOpen(false);
          fetchDeliveryData();
        }, 1200);
      }
    } catch (e) {
      alert('Failed to confirm doorstep UPI payment');
    } finally {
      setDoorstepVerifying(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-screen">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            <Bike className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Salem Delivery Fleet
              </span>
              <span className="text-xs text-slate-400">TN 30 BD 5521</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {user?.name || 'Karthik (Salem Partner)'}
            </h1>
            <p className="text-xs text-slate-500">Service Coverage: Fairlands, Suramangalam, Gugai, Meyyanur</p>
          </div>
        </div>

        <button
          onClick={handleToggleOnline}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            profile?.isAvailable
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{profile?.isAvailable ? 'ONLINE (READY FOR TRIPS)' : 'OFFLINE'}</span>
        </button>
      </div>

      {/* Earnings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-400">Today's Delivery Pay</div>
          <div className="text-2xl font-black text-slate-900">₹{profile?.todayEarnings || 240}</div>
          <div className="text-[11px] text-emerald-600 font-bold">+₹45 per completed delivery</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-400">Trips Completed</div>
          <div className="text-2xl font-black text-slate-900">{profile?.totalDeliveries || 42}</div>
          <div className="text-[11px] text-slate-500">Rating: 4.8 ★</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-400">COD Cash Collected</div>
          <div className="text-2xl font-black text-slate-900">₹{profile?.cashInHand || 480}</div>
          <div className="text-[11px] text-amber-600 font-bold">To be deposited at Salem hub</div>
        </div>
      </div>

      {/* Assigned and Available Orders in Salem */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 tracking-tight">
          Assigned & Nearby Salem Pickups ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center space-y-2 border border-slate-200">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">No active delivery assignments</p>
            <p className="text-xs text-slate-400">
              Ensure your status is set to ONLINE above to automatically receive nearby Salem orders.
            </p>
          </div>
        ) : (
          orders.map((o) => {
            const isAssignedToMe = o.deliveryPartner === user?._id || o.deliveryPartner?._id === user?._id;

            return (
              <div
                key={o._id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-brand-600 bg-orange-50 px-2.5 py-0.5 rounded">
                      {o.orderNumber}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">
                      {o.restaurant?.name || o.restaurantSnapshot?.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Pickup: {o.restaurant?.branchAddress || `${o.restaurant?.locality}, Salem`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900 block">₹{o.totalAmount}</span>
                    <span className={`text-[11px] uppercase font-bold px-2 py-0.5 rounded ${
                      o.isPaid || o.paymentStatus === 'paid' || o.paymentMethod === 'upi_qr'
                        ? 'text-emerald-800 bg-emerald-100 font-black'
                        : 'text-amber-800 bg-amber-100'
                    }`}>
                      {o.isPaid || o.paymentStatus === 'paid' || o.paymentMethod === 'upi_qr'
                        ? 'PAID ONLINE (UPI QR)'
                        : o.paymentMethod.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* High-visibility payment status alert for delivery partner */}
                {o.isPaid || o.paymentStatus === 'paid' || o.paymentMethod === 'upi_qr' ? (
                  <div className="bg-emerald-50 border-2 border-emerald-500 p-4 rounded-2xl flex items-start space-x-3 text-emerald-950 shadow-xs">
                    <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-sm text-emerald-900 uppercase tracking-tight">
                          ✅ CUSTOMER PAID ONLINE SUCCESSFULLY VIA UPI QR
                        </span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-950 font-black px-2 py-0.5 rounded-full">
                          ZERO CASH TO COLLECT
                        </span>
                      </div>
                      <p className="text-xs font-bold text-emerald-800">
                        ⚠️ DO NOT ASK OR COLLECT ANY MONEY FROM CUSTOMER! Total ₹{o.totalAmount} was paid online.
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-emerald-700 font-mono pt-0.5">
                        <span>UPI Ref: <strong>{o.upiTransactionRef || 'UPI-ONLINE-VERIFIED'}</strong></span>
                        <span>•</span>
                        <span>Status: <strong>PAID & SECURED</strong></span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950">
                    <div className="flex items-center space-x-2.5">
                      <Banknote className="w-5 h-5 text-amber-700 shrink-0" />
                      <div>
                        <span className="font-extrabold text-xs block text-amber-900">
                          Cash on Delivery: Collect ₹{o.totalAmount} from customer
                        </span>
                        <span className="text-[11px] text-amber-700">
                          Customer can pay cash or scan your Doorstep Collection QR code.
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenDoorstepQr(o)}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer whitespace-nowrap"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Show QR to Customer</span>
                    </button>
                  </div>
                )}

                {/* Drop Address */}
                <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-800 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-500" />
                    <span>Customer Drop Location:</span>
                  </div>
                  <p className="text-slate-600">
                    {o.deliveryAddress?.houseNo}, {o.deliveryAddress?.street},{' '}
                    {o.deliveryAddress?.locality}, Salem
                  </p>
                  {o.deliveryInstructions && (
                    <p className="text-brand-600 font-semibold">Note: {o.deliveryInstructions}</p>
                  )}
                </div>

                {/* Status action buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className="text-xs font-semibold text-slate-400">
                    Status: <strong className="text-slate-800 uppercase">{o.orderStatus.replace(/_/g, ' ')}</strong>
                  </span>

                  <div className="flex items-center space-x-2">
                    {!isAssignedToMe ? (
                      <button
                        onClick={() => handleAcceptOrder(o._id)}
                        className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs uppercase px-4 py-2 rounded-xl cursor-pointer"
                      >
                        Accept Delivery
                      </button>
                    ) : (
                      <>
                        {o.orderStatus === 'assigned' && (
                          <button
                            onClick={() => handleUpdateStatus(o._id, 'picked_up')}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                          >
                            Confirm Pickup from Kitchen
                          </button>
                        )}

                        {o.orderStatus === 'picked_up' && (
                          <button
                            onClick={() => handleUpdateStatus(o._id, 'out_for_delivery')}
                            className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                          >
                            Start Navigation (Out for Delivery)
                          </button>
                        )}

                        {o.orderStatus === 'out_for_delivery' && (
                          <div className="flex items-center space-x-2">
                            {!(o.isPaid || o.paymentStatus === 'paid' || o.paymentMethod === 'upi_qr') && (
                              <button
                                onClick={() => handleOpenDoorstepQr(o)}
                                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center space-x-1 cursor-pointer"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>Scan & Pay at Door</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleUpdateStatus(o._id, 'delivered', !(o.isPaid || o.paymentStatus === 'paid' || o.paymentMethod === 'upi_qr'))}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>
                                {o.isPaid || o.paymentStatus === 'paid' || o.paymentMethod === 'upi_qr'
                                  ? 'Mark Delivered (No Cash Needed)'
                                  : `Collect Cash ₹${o.totalAmount} & Mark Delivered`}
                              </span>
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Doorstep Collection UPI QR Modal */}
      {doorstepModalOpen && doorstepQrData && selectedOrderForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5" />
                <h3 className="font-extrabold text-sm">Doorstep UPI QR Collection</h3>
              </div>
              <button
                onClick={() => setDoorstepModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-center">
              {doorstepSuccess ? (
                <div className="py-6 space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-base text-slate-900">Payment Received!</h4>
                  <p className="text-xs text-slate-500">₹{doorstepQrData.amount} paid by customer via UPI QR.</p>
                </div>
              ) : (
                <>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Collect from Customer</span>
                    <div className="text-2xl font-black text-slate-900">₹{doorstepQrData.amount}</div>
                    <span className="text-xs text-brand-600 font-mono font-bold">{selectedOrderForQr.orderNumber}</span>
                  </div>

                  <div className="bg-white p-2 rounded-2xl border-2 border-slate-800 shadow-md inline-block mx-auto">
                    <img
                      src={doorstepQrData.qrCodeUrl}
                      alt="Doorstep QR Code"
                      className="w-48 h-48 object-contain rounded-xl"
                    />
                  </div>

                  <p className="text-xs text-slate-600">
                    Ask customer to scan with <strong>GPay, PhonePe, Paytm, or BHIM</strong>.
                  </p>

                  <button
                    onClick={handleConfirmDoorstepPayment}
                    disabled={doorstepVerifying}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {doorstepVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Confirming UPI Payment...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Customer Paid ₹{doorstepQrData.amount} (Confirm)</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
