import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Power,
  Store,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu'

  // Add Item Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    categoryName: 'Biryani & Rice',
    price: '',
    description: '',
    isVeg: false,
    imageUrl: '',
  });

  useEffect(() => {
    fetchPartnerData();
  }, [user]);

  const fetchPartnerData = async () => {
    try {
      setLoading(true);
      // Fetch restaurants or the user's assigned restaurant
      const restRes = await api.get('/restaurants?limit=1');
      if (restRes.data.success && restRes.data.data.length > 0) {
        const rest = restRes.data.data[0];
        setRestaurant(rest);

        // Fetch menu & orders
        const [menuRes, ordersRes] = await Promise.all([
          api.get(`/restaurants/${rest._id}/menu`),
          api.get('/orders/my-orders'), // fallback list of orders
        ]);

        if (menuRes.data.success) {
          setMenuItems(menuRes.data.rawItems || []);
        }
        if (ordersRes.data.success) {
          setOrders(ordersRes.data.data || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOpenStatus = async () => {
    if (!restaurant) return;
    try {
      const res = await api.patch(`/restaurants/${restaurant._id}/toggle-status`);
      if (res.data.success) {
        setRestaurant({ ...restaurant, isOpen: res.data.isOpen });
      }
    } catch (e) {
      alert('Failed to toggle open status');
    }
  };

  const handleToggleItemAvailability = async (itemId) => {
    try {
      const res = await api.patch(`/foods/${itemId}/toggle-availability`);
      if (res.data.success) {
        setMenuItems(
          menuItems.map((item) =>
            item._id === itemId ? { ...item, isAvailable: res.data.isAvailable } : item
          )
        );
      }
    } catch (e) {
      alert('Failed to update availability');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, {
        status: newStatus,
        note: `Status updated to ${newStatus} by kitchen`,
      });
      if (res.data.success) {
        setOrders(
          orders.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleCreateFoodItem = async (e) => {
    e.preventDefault();
    if (!restaurant) return;
    try {
      const payload = {
        ...newItem,
        price: Number(newItem.price),
        restaurant: restaurant._id,
        imageUrl:
          newItem.imageUrl ||
          (newItem.isVeg
            ? 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80'),
      };

      const res = await api.post('/foods', payload);
      if (res.data.success) {
        setMenuItems([res.data.data, ...menuItems]);
        setAddModalOpen(false);
        setNewItem({
          name: '',
          categoryName: 'Biryani & Rice',
          price: '',
          description: '',
          isVeg: false,
          imageUrl: '',
        });
      }
    } catch (e) {
      alert('Failed to create food item');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-screen">
      {/* Dashboard Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md">
              Restaurant Partner Hub
            </span>
            <span className="text-xs text-slate-400">Salem, Tamil Nadu</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            {restaurant?.name || "Domino's Pizza - Suramangalam"}
          </h1>
          <p className="text-xs text-slate-500">
            {restaurant?.branchAddress || 'Junction Main Road, Suramangalam, Salem'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleOpenStatus}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              restaurant?.isOpen
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-rose-50 text-rose-700 border border-rose-300'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>Kitchen is {restaurant?.isOpen ? 'OPEN' : 'CLOSED'}</span>
          </button>

          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-brand-600 flex items-center justify-center font-bold">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Active Menu Dishes</div>
            <div className="text-xl font-extrabold text-slate-900">{menuItems.length}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Today's Salem Orders</div>
            <div className="text-xl font-extrabold text-slate-900">{orders.length}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Settled Earnings</div>
            <div className="text-xl font-extrabold text-slate-900">₹8,450</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'orders' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Incoming Kitchen Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'menu' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Menu Inventory & Pricing ({menuItems.length})
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center space-y-2 border border-slate-200">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">No active kitchen orders</p>
              <p className="text-xs text-slate-400">Incoming Salem customer orders will alert here in real-time.</p>
            </div>
          ) : (
            orders.map((o) => (
              <div
                key={o._id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-brand-600 bg-orange-50 px-2 py-0.5 rounded">
                      {o.orderNumber}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">
                      Customer Order: ₹{o.totalAmount} ({o.paymentMethod.toUpperCase()})
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      {o.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  {o.items?.map((item) => (
                    <div key={item._id} className="flex justify-between">
                      <span>{item.quantity} × {item.name}</span>
                      <span className="font-semibold text-slate-800">₹{item.itemTotal}</span>
                    </div>
                  ))}
                </div>

                {/* Status action buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-400">Action:</span>
                  {o.orderStatus === 'placed' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(o._id, 'accepted')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Accept Order
                    </button>
                  )}
                  {['placed', 'accepted'].includes(o.orderStatus) && (
                    <button
                      onClick={() => handleUpdateOrderStatus(o._id, 'preparing')}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Mark Preparing
                    </button>
                  )}
                  {['preparing'].includes(o.orderStatus) && (
                    <button
                      onClick={() => handleUpdateOrderStatus(o._id, 'ready_for_pickup')}
                      className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Mark Ready For Pickup
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Menu Tab */}
      {activeTab === 'menu' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <div
              key={item._id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3"
            >
              <div className="space-y-1 flex-1 pr-1 truncate">
                <div className="flex items-center space-x-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-rose-700'}`} />
                  <span className="font-bold text-slate-900 text-xs truncate block">{item.name}</span>
                </div>
                <div className="text-xs font-extrabold text-slate-800">₹{item.price}</div>
                <div className="text-[10px] text-slate-400">{item.categoryName}</div>
              </div>

              <button
                onClick={() => handleToggleItemAvailability(item._id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer flex-shrink-0 ${
                  item.isAvailable
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-rose-50 text-rose-700 border-rose-300'
                }`}
              >
                {item.isAvailable ? 'Available' : 'Sold Out'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Dish Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900">Add New Food Dish</h3>
            <form onSubmit={handleCreateFoodItem} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Salem Mutton Chukka"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full bg-slate-50 text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={newItem.categoryName}
                    onChange={(e) => setNewItem({ ...newItem, categoryName: e.target.value })}
                    className="w-full bg-slate-50 text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="w-full bg-slate-50 text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dietary Classification</label>
                <div className="flex space-x-4 pt-1">
                  <label className="flex items-center space-x-1.5 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      checked={newItem.isVeg === true}
                      onChange={() => setNewItem({ ...newItem, isVeg: true })}
                      className="accent-brand-600"
                    />
                    <span>Pure Vegetarian</span>
                  </label>
                  <label className="flex items-center space-x-1.5 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      checked={newItem.isVeg === false}
                      onChange={() => setNewItem({ ...newItem, isVeg: false })}
                      className="accent-brand-600"
                    />
                    <span>Non-Vegetarian</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full bg-slate-50 text-xs p-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
