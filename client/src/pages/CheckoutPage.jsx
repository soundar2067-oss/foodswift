import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  CheckCircle2,
  Plus,
  ShieldCheck,
  CreditCard,
  Banknote,
  Tag,
  ArrowRight,
  Clock,
  QrCode,
  Smartphone,
  Copy,
  Check,
  Loader2,
  X,
  Lock,
  Wifi,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { salemLocalitiesList } from '../context/LocationContext';

// ─── Demo Card Payment Modal ──────────────────────────────────────────────────
function CardPaymentModal({ amount, orderNumber, onSuccess, onClose }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'processing' | 'success'
  const [error, setError] = useState('');

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const getCardBrand = () => {
    const n = cardNumber.replace(/\s/g, '');
    if (n.startsWith('4')) return { label: 'VISA', color: 'text-blue-700' };
    if (/^5[1-5]/.test(n)) return { label: 'MASTER', color: 'text-red-600' };
    if (/^6[0-9]/.test(n)) return { label: 'RUPAY', color: 'text-orange-600' };
    return { label: '', color: '' };
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');

    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length < 16) { setError('Enter a valid 16-digit card number.'); return; }
    if (expiry.length < 5) { setError('Enter card expiry (MM/YY).'); return; }
    if (cvv.length < 3) { setError('Enter a valid CVV.'); return; }
    if (!cardName.trim()) { setError('Enter cardholder name.'); return; }

    // Decline known test-fail cards for demo
    if (digits === '4000000000000002') {
      setError('❌ Transaction declined by bank. Please try a different card.');
      return;
    }

    setStep('processing');

    // Simulate bank processing delay
    await new Promise((r) => setTimeout(r, 2800));
    setStep('success');
    await new Promise((r) => setTimeout(r, 1400));
    onSuccess();
  };

  const brand = getCardBrand();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-100">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/15 rounded-xl">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight">Secure Card Payment</h3>
              <p className="text-[11px] text-slate-300">256-bit SSL Encrypted</p>
            </div>
          </div>
          {step === 'form' && (
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Amount badge */}
        <div className="bg-orange-50 border-b border-orange-100 px-6 py-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Paying for Order</span>
            <div className="font-mono font-bold text-xs text-slate-600">{orderNumber}</div>
          </div>
          <div className="text-2xl font-black text-slate-900">₹{amount}</div>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'form' && (
            <form onSubmit={handlePay} className="space-y-4">
              {/* Card number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="w-full bg-slate-50 text-sm font-mono px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 pr-16"
                  />
                  {brand.label && (
                    <span className={`absolute right-3 top-2.5 text-[11px] font-extrabold ${brand.color}`}>{brand.label}</span>
                  )}
                </div>
              </div>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                    className="w-full bg-slate-50 text-sm font-mono px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CVV</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    placeholder="• • •"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    className="w-full bg-slate-50 text-sm font-mono px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Cardholder name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="Name on card"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 text-xs uppercase font-bold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">{error}</div>
              )}

              {/* Demo hint */}
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 font-medium">
                💳 <strong>Demo Mode:</strong> Enter any 16-digit card number. Use <span className="font-mono">4111 1111 1111 1111</span> to test success.
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-extrabold py-3.5 rounded-2xl shadow-lg flex items-center justify-center space-x-2 cursor-pointer text-sm uppercase tracking-wide"
              >
                <Lock className="w-4 h-4" />
                <span>Pay ₹{amount} Securely</span>
              </button>

              {/* Trust logos */}
              <div className="flex items-center justify-center space-x-3 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] text-slate-400 font-medium">Visa • Mastercard • RuPay • Secure Checkout</span>
              </div>
            </form>
          )}

          {step === 'processing' && (
            <div className="py-10 text-center space-y-5">
              <div className="relative w-16 h-16 mx-auto">
                <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
                <CreditCard className="w-7 h-7 text-slate-700 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900">Processing Payment...</h4>
                <p className="text-xs text-slate-500 mt-1">Connecting to bank. Please wait.</p>
              </div>
              <div className="flex flex-col items-start space-y-1.5 bg-slate-50 rounded-2xl p-4 text-xs text-slate-600 font-medium">
                {['Encrypting card details...', 'Contacting issuing bank...', 'Awaiting authorization...'].map((msg, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>{msg}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400">Do not press back or close this window</p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-extrabold text-xl text-slate-900">Payment Successful!</h4>
                <p className="text-xs text-slate-500 mt-1">₹{amount} charged to your card.</p>
              </div>
              <p className="text-xs text-orange-600 font-semibold animate-pulse">Confirming your order...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, applyCoupon, setTip, clearCart } = useCart();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [newAddressFormOpen, setNewAddressFormOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    houseNo: '',
    street: '',
    locality: 'Fairlands, Salem',
    landmark: '',
    city: 'Salem',
    pincode: '636016',
  });

  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi_qr');
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // UPI QR Modal state
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [upiData, setUpiData] = useState(null);
  const [upiCountdown, setUpiCountdown] = useState(300);
  const [upiVerifying, setUpiVerifying] = useState(false);
  const [upiVerified, setUpiVerified] = useState(false);
  const [vpaCopied, setVpaCopied] = useState(false);

  // Card payment modal state
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [pendingOrderNumber, setPendingOrderNumber] = useState('');

  // UPI countdown timer
  useEffect(() => {
    let interval;
    if (upiModalOpen && upiCountdown > 0 && !upiVerified) {
      interval = setInterval(() => {
        setUpiCountdown((c) => (c > 0 ? c - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [upiModalOpen, upiCountdown, upiVerified]);

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      if (res.data.success && res.data.data.length > 0) {
        setSavedAddresses(res.data.data);
        const def = res.data.data.find((a) => a.isDefault) || res.data.data[0];
        setSelectedAddressId(def._id);
      } else {
        setNewAddressFormOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', newAddress);
      if (res.data.success) {
        setSavedAddresses([res.data.data, ...savedAddresses]);
        setSelectedAddressId(res.data.data._id);
        setNewAddressFormOpen(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handleApplyCoupon = async (code) => {
    const target = code || couponInput;
    if (!target) return;
    const res = await applyCoupon(target);
    setCouponFeedback(res);
  };

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) {
      alert('Your cart is empty');
      navigate('/');
      return;
    }

    const selectedAddr = savedAddresses.find((a) => a._id === selectedAddressId);
    if (!selectedAddr) {
      setErrorMessage('Please add or select a delivery address in Salem.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Create order on backend
      const orderPayload = {
        restaurantId: cart.restaurant?._id || cart.restaurant,
        items: cart.items,
        deliveryAddress: selectedAddr,
        deliveryInstructions,
        paymentMethod,
        couponCode: cart.coupon?.code,
        tip: cart.tip || 0,
      };

      const orderRes = await api.post('/orders', orderPayload);
      if (!orderRes.data.success) throw new Error(orderRes.data.message || 'Order creation failed');

      const createdOrder = orderRes.data.data;

      // ── COD — clear cart then navigate ───────────────────────────────────────
      if (paymentMethod === 'cod') {
        await clearCart();
        navigate(`/orders/${createdOrder._id}/tracking`);
        return;
      }

      // ── UPI QR — show modal FIRST, clear cart only after verify ──────────────
      if (paymentMethod === 'upi_qr') {
        const upiRes = await api.post('/payments/generate-upi-qr', { orderId: createdOrder._id });
        if (upiRes.data.success) {
          setUpiData(upiRes.data.data);
          setUpiCountdown(300);
          setUpiVerified(false);
          setUpiModalOpen(true);
          // cart cleared inside handleVerifyUpiPayment after success
        } else {
          throw new Error('Failed to generate UPI QR code');
        }
        return;
      }

      // ── Card — show modal FIRST, clear cart only after card success ───────────
      if (paymentMethod === 'card') {
        setPendingOrderId(createdOrder._id);
        setPendingOrderNumber(createdOrder.orderNumber);
        setCardModalOpen(true);
        // cart cleared inside handleCardPaymentSuccess after success
        return;
      }

    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Called by CardPaymentModal after animation completes
  const handleCardPaymentSuccess = async () => {
    try {
      const verifyRes = await api.post('/payments/verify', {
        orderId: pendingOrderId,
        razorpayOrderId: `order_demo_${Date.now()}`,
        razorpayPaymentId: `pay_demo_${Date.now()}`,
        razorpaySignature: 'simulated_valid_signature',
        isSimulated: true,
      });
      if (verifyRes.data.success) {
        await clearCart();
        setCardModalOpen(false);
        navigate(`/orders/${pendingOrderId}/tracking`);
      } else {
        setCardModalOpen(false);
        setErrorMessage('Payment verification returned unconfirmed status.');
      }
    } catch (err) {
      setCardModalOpen(false);
      setErrorMessage('Payment captured but confirmation failed. Check your orders.');
    }
  };

  const handleCopyUpiVpa = () => {
    if (!upiData?.payeeVpa) return;
    navigator.clipboard.writeText(upiData.payeeVpa);
    setVpaCopied(true);
    setTimeout(() => setVpaCopied(false), 2000);
  };

  const handleVerifyUpiPayment = async () => {
    if (!upiData) return;
    setUpiVerifying(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const verifyRes = await api.post('/payments/verify-upi-qr', {
        orderId: upiData.orderId,
        transactionRef: upiData.transactionRef,
      });
      if (verifyRes.data.success) {
        setUpiVerified(true);
        await clearCart(); // ← clear cart only after payment confirmed
        setTimeout(() => navigate(`/orders/${upiData.orderId}/tracking`), 1500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment verification failed. Please try again.');
    } finally {
      setUpiVerifying(false);
    }
  };

  if (cart.items.length === 0 && !upiModalOpen && !cardModalOpen && !upiData) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4 px-4">
        <h3 className="font-extrabold text-xl text-slate-800">Your Cart is Empty</h3>
        <p className="text-xs text-slate-500">Add dishes from a restaurant in Salem before checkout.</p>
        <Link to="/" className="inline-block bg-brand-600 text-white font-bold text-xs uppercase px-6 py-2.5 rounded-full shadow-md">
          Explore Salem Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Checkout & Place Order</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Review your items, address in Salem, and select payment method</p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-semibold">{errorMessage}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Step 1: Delivery Address */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                <h3 className="font-extrabold text-base text-slate-900">Delivery Address in Tamil Nadu</h3>
              </div>
              <button onClick={() => setNewAddressFormOpen(!newAddressFormOpen)}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1 cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
                <span>{newAddressFormOpen ? 'Cancel' : 'Add New Address'}</span>
              </button>
            </div>

            {savedAddresses.length > 0 && !newAddressFormOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr._id;
                  return (
                    <div key={addr._id} onClick={() => setSelectedAddressId(addr._id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? 'border-brand-500 bg-orange-50/40 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                      <div className="flex items-center justify-between pb-1">
                        <span className="font-bold text-xs text-slate-900 flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-brand-500" /><span>{addr.label}</span>
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{addr.houseNo}, {addr.street}</p>
                      <p className="text-xs font-semibold text-slate-800">{addr.locality} - {addr.pincode}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {newAddressFormOpen && (
              <form onSubmit={handleSaveNewAddress} className="space-y-3 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Address Label</label>
                    <select value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      className="w-full bg-slate-50 text-xs p-2.5 rounded-xl border border-slate-200">
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Tamil Nadu Locality / District</label>
                    <select value={newAddress.locality} onChange={(e) => setNewAddress({ ...newAddress, locality: e.target.value })}
                      className="w-full bg-slate-50 text-xs p-2.5 rounded-xl border border-slate-200">
                      {salemLocalitiesList.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Door / Flat No.</label>
                    <input type="text" required placeholder="e.g. 14/B, 2nd Floor"
                      value={newAddress.houseNo} onChange={(e) => setNewAddress({ ...newAddress, houseNo: e.target.value })}
                      className="w-full bg-slate-50 text-xs p-2.5 rounded-xl border border-slate-200" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Street / Area</label>
                    <input type="text" required placeholder="e.g. Brindavan Road"
                      value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="w-full bg-slate-50 text-xs p-2.5 rounded-xl border border-slate-200" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Landmark (Optional)</label>
                    <input type="text" placeholder="e.g. Near Sona College"
                      value={newAddress.landmark} onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                      className="w-full bg-slate-50 text-xs p-2.5 rounded-xl border border-slate-200" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">PIN Code</label>
                    <input type="text" required placeholder="636016"
                      value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      className="w-full bg-slate-50 text-xs p-2.5 rounded-xl border border-slate-200" />
                  </div>
                </div>
                <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl cursor-pointer">
                  Save and Use Address
                </button>
              </form>
            )}
          </div>

          {/* Step 2: Delivery Instructions */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">2</span>
              <h3 className="font-extrabold text-base text-slate-900">Delivery Instructions (Optional)</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['Leave at door', 'Ring bell once', 'Call upon arrival'].map((instr) => (
                <button key={instr} type="button" onClick={() => setDeliveryInstructions(instr)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer text-center ${deliveryInstructions === instr ? 'bg-brand-50 border-brand-500 text-brand-900 font-bold' : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'}`}>
                  {instr}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">3</span>
              <h3 className="font-extrabold text-base text-slate-900">Choose Payment Method</h3>
            </div>

            <div className="space-y-3 pt-2">

              {/* UPI QR — Recommended */}
              <label onClick={() => setPaymentMethod('upi_qr')}
                className={`flex items-start space-x-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'upi_qr' ? 'border-brand-500 bg-orange-50/40 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                <div className="pt-0.5">
                  <input type="radio" name="payment" checked={paymentMethod === 'upi_qr'} onChange={() => setPaymentMethod('upi_qr')} className="accent-brand-600" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <QrCode className="w-5 h-5 text-brand-600" />
                    <span className="font-extrabold text-sm text-slate-900">Scan & Pay via UPI QR</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">RECOMMENDED • ZERO FEE</span>
                  </div>
                  <p className="text-xs text-slate-500">Scan with Google Pay, PhonePe, Paytm, or BHIM UPI app.</p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-bold text-slate-600">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-blue-700">GPay</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-purple-700">PhonePe</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-sky-700">Paytm</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-emerald-700">BHIM</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-indigo-700">CRED</span>
                  </div>
                </div>
              </label>

              {/* Debit/Credit Card */}
              <label onClick={() => setPaymentMethod('card')}
                className={`flex items-start space-x-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-brand-500 bg-orange-50/40 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                <div className="pt-0.5">
                  <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="accent-brand-600" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-sm text-slate-900">Debit / Credit Cards & Net Banking</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">Visa / Mastercard / RuPay</span>
                  </div>
                  <p className="text-xs text-slate-500">Secure 256-bit SSL encrypted card checkout — instant confirmation.</p>
                </div>
              </label>

              {/* Cash on Delivery */}
              <label onClick={() => setPaymentMethod('cod')}
                className={`flex items-start space-x-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-brand-500 bg-orange-50/40 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                <div className="pt-0.5">
                  <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-brand-600" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-sm text-slate-900">Cash on Delivery (COD)</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">Doorstep Collection</span>
                  </div>
                  <p className="text-xs text-slate-500">Pay with exact cash to delivery partner at your doorstep.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="font-extrabold text-base text-slate-900 pb-2 border-b border-slate-100">Order Summary</h3>

            {cart.restaurant && (
              <div className="text-xs">
                <span className="font-bold text-slate-800 text-sm block">{cart.restaurant.name}</span>
                <span className="text-slate-500">{cart.restaurant.locality || 'Fairlands'}, Salem</span>
              </div>
            )}

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={item._id || item.foodItem} className="flex justify-between items-center text-xs">
                  <div className="space-y-0.5 truncate max-w-[180px]">
                    <span className="font-semibold text-slate-900 truncate block">{item.quantity} × {item.name}</span>
                    {item.portionSize && item.portionSize !== 'Standard' && (
                      <span className="text-[10px] text-slate-400 block">{item.portionSize}</span>
                    )}
                  </div>
                  <span className="font-bold text-slate-800">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex space-x-2">
                <input type="text" placeholder="Promo Code" value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 text-xs uppercase font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500" />
                <button type="button" onClick={() => handleApplyCoupon()}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 rounded-xl transition-colors cursor-pointer">
                  Apply
                </button>
              </div>
              {couponFeedback && (
                <p className={`text-[11px] font-semibold ${couponFeedback.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {couponFeedback.message}
                </p>
              )}
            </div>

            {/* Bill Details */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between"><span>Item Subtotal</span><span className="font-semibold text-slate-900">₹{cart.subtotal}</span></div>
              <div className="flex justify-between"><span>Delivery Fee</span>
                <span className="font-semibold text-slate-900">{cart.deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${cart.deliveryFee}`}</span>
              </div>
              <div className="flex justify-between"><span>Platform Fee</span><span className="font-semibold text-slate-900">₹{cart.platformFee}</span></div>
              <div className="flex justify-between"><span>GST Tax (5%)</span><span className="font-semibold text-slate-900">₹{cart.tax}</span></div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold"><span>Coupon Discount</span><span>-₹{cart.discount}</span></div>
              )}
              {cart.tip > 0 && (
                <div className="flex justify-between text-slate-700 font-semibold"><span>Delivery Tip</span><span>₹{cart.tip}</span></div>
              )}
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-brand-600">₹{cart.finalTotal}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button onClick={handlePlaceOrder} disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-brand-600 to-orange-500 hover:from-brand-700 hover:to-orange-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 tracking-wide uppercase text-sm">
              <span>{isSubmitting ? 'Processing...' : `Place Order (₹${cart.finalTotal})`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Safe & Secure Salem Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── UPI QR Modal ──────────────────────────────────────────────────────── */}
      {upiModalOpen && upiData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md"><QrCode className="w-5 h-5 text-white" /></div>
                <div>
                  <h3 className="font-black text-base tracking-tight leading-tight">Scan & Pay via UPI QR</h3>
                  <p className="text-[11px] text-orange-100 font-medium">Any UPI App (GPay, PhonePe, Paytm, BHIM)</p>
                </div>
              </div>
              {!upiVerified && (
                <button onClick={() => setUpiModalOpen(false)} className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="p-6 space-y-4 text-center">
              {upiVerified ? (
                <div className="py-6 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-black text-slate-900">Payment Received!</h4>
                    <p className="text-xs text-slate-500 font-medium">₹{upiData.amount} paid via UPI QR Code.</p>
                    <div className="text-[11px] text-emerald-800 bg-emerald-100/80 px-3 py-1.5 rounded-xl font-bold inline-block mt-2">
                      ✅ Delivery partner: DO NOT COLLECT CASH
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">Ref: {upiData.transactionRef}</div>
                  <p className="text-xs text-brand-600 font-semibold animate-pulse">Redirecting to order tracking...</p>
                </div>
              ) : (
                <>
                  <div className="bg-orange-50 border border-orange-200/80 rounded-2xl p-3 flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payable Amount</span>
                      <div className="text-2xl font-black text-slate-900">₹{upiData.amount}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Order No</span>
                      <div className="text-xs font-bold font-mono text-brand-600">{upiData.orderNumber}</div>
                    </div>
                  </div>

                  <div className="relative inline-block mx-auto bg-white p-3 rounded-2xl border-2 border-slate-800 shadow-md">
                    <img
                      src={upiData.qrCodeUrl}
                      alt="FoodSwift UPI QR"
                      className="w-52 h-52 object-contain rounded-xl mx-auto"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(upiData.upiUri)}`;
                      }}
                    />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-md flex items-center space-x-1 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>SCAN WITH ANY UPI APP</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs">
                      <div className="text-left overflow-hidden mr-2">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">FoodSwift Official UPI ID</span>
                        <span className="font-mono font-bold text-slate-800 truncate block">{upiData.payeeVpa}</span>
                      </div>
                      <button onClick={handleCopyUpiVpa}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 text-xs shadow-xs cursor-pointer">
                        {vpaCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{vpaCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="sm:hidden pt-1">
                    <a href={upiData.upiUri}
                      className="w-full bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2">
                      <Smartphone className="w-4 h-4" /><span>Open Installed UPI App</span>
                    </a>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>QR expires in <strong className="text-slate-800 font-mono">
                        {Math.floor(upiCountdown / 60).toString().padStart(2, '0')}:{(upiCountdown % 60).toString().padStart(2, '0')}
                      </strong></span>
                    </div>
                    <button onClick={handleVerifyUpiPayment} disabled={upiVerifying}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 text-sm">
                      {upiVerifying ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /><span>Verifying Payment...</span></>
                      ) : (
                        <><CheckCircle2 className="w-4 h-4" /><span>I Have Paid ₹{upiData.amount} — Verify</span></>
                      )}
                    </button>
                    <p className="text-[10px] text-slate-400">
                      After scanning and paying, click Verify. Delivery partner sees "PAID ONLINE — DO NOT COLLECT CASH".
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Card Payment Modal ────────────────────────────────────────────────── */}
      {cardModalOpen && (
        <CardPaymentModal
          amount={cart.finalTotal}
          orderNumber={pendingOrderNumber}
          onSuccess={handleCardPaymentSuccess}
          onClose={() => setCardModalOpen(false)}
        />
      )}
    </div>
  );
}
