import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Clock,
  MapPin,
  Heart,
  Plus,
  Trash2,
  ExternalLink,
  RotateCcw,
  Star,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { salemLocalitiesList } from '../context/LocationContext';
import RatingModal from '../components/RatingModal';

export default function UserAccountPage() {
  const { user, updateProfile, logout } = useAuth();
  const { addItem } = useCart();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'addresses' | 'profile'
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dietaryPreference, setDietaryPreference] = useState(user?.dietaryPreference || 'any');
  const [profileSaved, setProfileSaved] = useState(false);

  // Rating modal state
  const [ratingTarget, setRatingTarget] = useState(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchAddresses();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await api.get('/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      if (res.data.success) {
        setAddresses(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    await updateProfile({ name, phone, dietaryPreference });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses(addresses.filter((a) => a._id !== id));
    } catch (e) {
      alert('Failed to delete address');
    }
  };

  const handleReorder = async (order) => {
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        await addItem({
          foodItem: { _id: item.foodItem, name: item.name, price: item.price, restaurant: order.restaurant },
          quantity: item.quantity,
          portionSize: item.portionSize,
          forceClear: true,
        });
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-screen">
      {/* Account Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
            alt={user?.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-brand-500 shadow-sm"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {user?.name}
            </h1>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-orange-100 text-brand-700 rounded-md">
              {user?.role} Account
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 font-bold text-xs rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
        >
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'addresses'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses ({addresses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Settings</span>
        </button>
      </div>

      {/* Orders Tab Content */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-5 h-24 animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-slate-200/80">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No orders placed yet</h3>
              <p className="text-xs text-slate-400">Order from over 200+ top Salem restaurants right now!</p>
              <Link
                to="/restaurants"
                className="inline-block bg-brand-600 text-white font-bold text-xs uppercase px-6 py-2.5 rounded-full"
              >
                Browse Restaurants
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      {order.restaurant?.name || order.restaurantSnapshot?.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {order.restaurant?.locality || 'Salem'} • {new Date(order.createdAt).toLocaleDateString()} at{' '}
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-md ${
                        order.orderStatus === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}
                    >
                      {order.orderStatus.replace(/_/g, ' ')}
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">₹{order.totalAmount}</span>
                  </div>
                </div>

                {/* Items */}
                <p className="text-xs text-slate-600 line-clamp-1">
                  {order.items?.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                </p>

                {/* Actions */}
                <div className="flex items-center space-x-3 pt-2">
                  <Link
                    to={`/orders/${order._id}/tracking`}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-brand-600 hover:text-brand-700 bg-orange-50 px-3.5 py-1.5 rounded-xl border border-orange-200"
                  >
                    <span>Track Order</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <button
                    onClick={() => handleReorder(order)}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reorder</span>
                  </button>

                  {order.orderStatus === 'delivered' && (
                    <button
                      onClick={() => setRatingTarget(order)}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 cursor-pointer"
                    >
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>Rate</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Addresses Tab Content */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900 flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-brand-500" />
                    <span>{addr.label}</span>
                  </span>
                  <button
                    onClick={() => handleDeleteAddress(addr._id)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-600">
                  {addr.houseNo}, {addr.street}
                </p>
                <p className="text-xs font-semibold text-slate-800">
                  {addr.locality}, Salem - {addr.pincode}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Settings Tab Content */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs max-w-xl">
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            {profileSaved && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dietary Preference</label>
              <select
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value)}
                className="w-full bg-slate-50 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="any">Any (Veg & Non-Veg)</option>
                <option value="veg">Pure Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
                <option value="halal">Halal</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs uppercase px-6 py-3 rounded-xl shadow-md cursor-pointer"
            >
              Save Changes
            </button>
          </form>
        </div>
      )}

      {/* Review Modal */}
      {ratingTarget && (
        <RatingModal
          isOpen={Boolean(ratingTarget)}
          onClose={() => setRatingTarget(null)}
          restaurant={ratingTarget.restaurant}
          orderId={ratingTarget._id}
          onReviewSubmitted={fetchOrders}
        />
      )}
    </div>
  );
}
