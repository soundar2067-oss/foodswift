import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { user, setAuthModalOpen } = useAuth();
  const {
    cart,
    cartDrawerOpen,
    setCartDrawerOpen,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    setTip,
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);

  if (!cartDrawerOpen) return null;

  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || couponCodeInput;
    if (!code) return;
    const res = await applyCoupon(code);
    setCouponMsg(res);
    if (res?.success) {
      setCouponCodeInput('');
    }
  };

  const handleCheckoutClick = () => {
    setCartDrawerOpen(false);
    if (!user) {
      setAuthModalOpen(true);
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setCartDrawerOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-brand-600" />
              <h2 className="font-extrabold text-slate-900 text-lg">Your Cart</h2>
            </div>
            <div className="flex items-center space-x-2">
              {cart.items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-500 hover:text-rose-700 font-semibold px-2 py-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  Clear Cart
                </button>
              )}
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {cart.items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-brand-500">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Your cart is empty</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Good food is always cooking! Explore 200+ top Salem restaurants and add your favorites.
                </p>
                <button
                  onClick={() => setCartDrawerOpen(false)}
                  className="bg-brand-600 text-white font-bold text-xs uppercase px-6 py-2.5 rounded-full shadow-md hover:bg-brand-700 transition-all cursor-pointer"
                >
                  Browse Salem Restaurants
                </button>
              </div>
            ) : (
              <>
                {/* Restaurant Banner Info */}
                {cart.restaurant && (
                  <div className="p-3 bg-orange-50/70 border border-orange-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {cart.restaurant.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {cart.restaurant.locality || 'Fairlands'}, Salem
                      </p>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-brand-700 bg-white px-2 py-1 rounded-md border border-orange-200">
                      Single Order
                    </span>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div
                      key={item._id || item.foodItem}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-colors"
                    >
                      <div className="space-y-0.5 max-w-[200px]">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`w-3 h-3 rounded-xs border flex items-center justify-center ${
                              item.isVeg ? 'border-emerald-600' : 'border-rose-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.isVeg ? 'bg-emerald-600' : 'bg-rose-700'
                              }`}
                            />
                          </span>
                          <span className="font-semibold text-slate-900 text-xs truncate">
                            {item.name}
                          </span>
                        </div>
                        {item.portionSize && item.portionSize !== 'Standard' && (
                          <p className="text-[10px] text-slate-400 ml-4.5">
                            Portion: {item.portionSize}
                          </p>
                        )}
                        <p className="text-xs font-extrabold text-slate-800 ml-4.5">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center space-x-2 bg-white border border-slate-200 px-2 py-1 rounded-full shadow-xs">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="hover:text-brand-600 cursor-pointer p-0.5 text-slate-500"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-800 px-1">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="hover:text-brand-600 cursor-pointer p-0.5 text-slate-500"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Coupon Section */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Apply Salem Promo Code
                  </span>

                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="e.g. WELCOME50, SALEM20"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        className="w-full bg-slate-50 text-xs uppercase font-bold pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <button
                      onClick={() => handleApplyCoupon()}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>

                  {/* Quick coupon chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['WELCOME50', 'SALEM20', 'FREEDELIVERY'].map((c) => (
                      <button
                        key={c}
                        onClick={() => handleApplyCoupon(c)}
                        className="text-[10px] font-bold text-brand-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        +{c}
                      </button>
                    ))}
                  </div>

                  {couponMsg && (
                    <p
                      className={`text-xs font-medium flex items-center space-x-1 pt-1 ${
                        couponMsg.success ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {couponMsg.success && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
                      <span>{couponMsg.message}</span>
                    </p>
                  )}
                </div>

                {/* Delivery Tip */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Tip Your Salem Delivery Partner
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 10, 20, 30].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setTip(amount)}
                        className={`py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          cart.tip === amount
                            ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {amount === 0 ? 'None' : `₹${amount}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bill Breakdown */}
                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Item Subtotal</span>
                    <span className="font-semibold text-slate-900">₹{cart.subtotal}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Delivery Partner Fee</span>
                    <span className="font-semibold text-slate-900">
                      {cart.deliveryFee === 0 ? (
                        <span className="text-emerald-600 font-bold">FREE</span>
                      ) : (
                        `₹${cart.deliveryFee}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <span className="font-semibold text-slate-900">₹{cart.platformFee}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>GST Restaurant Tax (5%)</span>
                    <span className="font-semibold text-slate-900">₹{cart.tax}</span>
                  </div>

                  {cart.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Promo Discount ({cart.coupon?.code || 'COUPON'})</span>
                      <span>-₹{cart.discount}</span>
                    </div>
                  )}

                  {cart.tip > 0 && (
                    <div className="flex justify-between text-slate-700 font-medium">
                      <span>Delivery Partner Tip</span>
                      <span>₹{cart.tip}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                    <span>To Pay</span>
                    <span className="text-brand-600">₹{cart.finalTotal}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Action */}
          {cart.items.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-white space-y-2">
              <button
                onClick={handleCheckoutClick}
                className="w-full bg-gradient-to-r from-brand-600 to-orange-500 hover:from-brand-700 hover:to-orange-600 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-brand-500/25 flex items-center justify-between px-6 transition-all cursor-pointer group"
              >
                <div className="text-left">
                  <div className="text-[10px] font-semibold text-orange-100 leading-none">TOTAL PAYABLE</div>
                  <div className="text-lg">₹{cart.finalTotal}</div>
                </div>
                <div className="flex items-center space-x-1.5 font-bold text-sm tracking-wide">
                  <span>CHECKOUT</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
