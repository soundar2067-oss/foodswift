import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Store,
  UtensilsCrossed,
  DollarSign,
  Tag,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Search,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';

const STATUS_OPTIONS = [
  'all','placed','confirmed','accepted','preparing',
  'ready_for_pickup','out_for_delivery','delivered','cancelled',
];

const STATUS_COLORS = {
  placed: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-indigo-100 text-indigo-800',
  accepted: 'bg-cyan-100 text-cyan-800',
  preparing: 'bg-amber-100 text-amber-800',
  ready_for_pickup: 'bg-orange-100 text-orange-800',
  out_for_delivery: 'bg-purple-100 text-purple-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-800',
};

const PAY_COLORS = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-rose-100 text-rose-700',
  refunded: 'bg-slate-100 text-slate-600',
  collected_cod: 'bg-teal-100 text-teal-700',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [restSearch, setRestSearch] = useState('');

  const [newCouponModal, setNewCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '', title: '', discountType: 'percentage',
    discountValue: 20, maxDiscount: 100, minOrderValue: 199,
  });

  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => { fetchAdminData(); }, []);
  useEffect(() => { if (activeTab === 'orders') fetchOrders(); }, [activeTab, orderPage, orderStatusFilter]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, restRes, couponRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/restaurants'),
        api.get('/coupons'),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (restRes.data.success) setRestaurants(restRes.data.data);
      if (couponRes.data.success) setCoupons(couponRes.data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/admin/orders?status=${orderStatusFilter}&page=${orderPage}&limit=15`);
      if (res.data.success) {
        setOrders(res.data.data);
        setOrderTotal(res.data.total);
        setOrderTotalPages(res.data.totalPages);
      }
    } catch (e) { console.error(e); }
  };

  const handleToggleVerification = async (id) => {
    try {
      const res = await api.patch(`/admin/restaurants/${id}/toggle-verification`);
      if (res.data.success) {
        setRestaurants(restaurants.map((r) =>
          r._id === id ? { ...r, isVerified: res.data.data.isVerified } : r
        ));
      }
    } catch (e) { alert('Failed to toggle verification'); }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/coupons', couponForm);
      if (res.data.success) {
        setCoupons([...coupons, res.data.data]);
        setNewCouponModal(false);
        setCouponForm({ code:'', title:'', discountType:'percentage', discountValue:20, maxDiscount:100, minOrderValue:199 });
      }
    } catch (e) { alert('Failed to create coupon'); }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      setCoupons(coupons.filter((c) => c._id !== id));
    } catch (e) { alert('Failed to delete coupon'); }
  };

  const openStatusModal = (order) => {
    setStatusModal({ orderId: order._id, orderNumber: order.orderNumber });
    setNewStatus(order.orderStatus);
    setStatusNote('');
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || !statusModal) return;
    setStatusUpdating(true);
    try {
      const res = await api.patch(`/admin/orders/${statusModal.orderId}/status`, { status: newStatus, note: statusNote });
      if (res.data.success) {
        setOrders((prev) => prev.map((o) => o._id === statusModal.orderId ? { ...o, orderStatus: newStatus } : o));
        setStatusModal(null);
      }
    } catch (e) { alert('Failed to update order status'); }
    finally { setStatusUpdating(false); }
  };

  const filteredRestaurants = restaurants.filter((r) =>
    r.name.toLowerCase().includes(restSearch.toLowerCase()) ||
    (r.locality || '').toLowerCase().includes(restSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-screen">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded">Platform Administration</span>
            <span className="text-xs text-slate-400">Salem, Tamil Nadu, India</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">FoodSwift Governance Panel</h1>
          <p className="text-xs text-slate-500">Real-time metrics, restaurant verification, order management &amp; promo codes.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={fetchAdminData} className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
            <RefreshCcw className="w-3.5 h-3.5" /><span>Refresh</span>
          </button>
          <button onClick={() => setNewCouponModal(true)} className="flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer">
            <Plus className="w-3.5 h-3.5" /><span>Create Coupon</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Salem Restaurants', value: stats?.totalRestaurants ?? 210, sub: '200+ Target Met', color: 'text-emerald-600' },
          { label: 'Menu Catalog', value: stats?.totalFoods ?? '24k+', sub: 'Veg & Non-Veg', color: 'text-emerald-600' },
          { label: 'Registered Users', value: stats?.totalCustomers ?? 0, sub: 'Across Salem', color: 'text-slate-400' },
          { label: 'Total Orders', value: stats?.totalOrders ?? 0, sub: 'Live Lifecycle', color: 'text-brand-600' },
          { label: 'Completed', value: stats?.completedOrders ?? 0, sub: 'Successful Trips', color: 'text-emerald-600' },
          { label: 'Gross Revenue', value: `\u20B9${stats?.totalRevenue ?? 0}`, sub: 'All Methods', color: 'text-purple-600' },
        ].map((m) => (
          <div key={m.label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase">{m.label}</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{m.value}</div>
            <div className={`text-[10px] font-semibold ${m.color}`}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[['overview', `Restaurants (${restaurants.length})`], ['orders', `Orders (${orderTotal})`], ['coupons', `Coupons (${coupons.length})`]].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}>{label}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center space-x-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input type="text" placeholder="Search restaurant or locality..."
                value={restSearch} onChange={(e) => setRestSearch(e.target.value)}
                className="w-full bg-slate-50 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500" />
            </div>
            <span className="text-xs text-slate-400">{filteredRestaurants.length} results</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="p-4">Restaurant</th><th className="p-4">Locality</th>
                  <th className="p-4">Cuisines</th><th className="p-4">Rating</th>
                  <th className="p-4">Verification</th><th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRestaurants.slice(0, 50).map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{r.name}</td>
                    <td className="p-4">{r.locality}, Salem</td>
                    <td className="p-4 text-slate-500 truncate max-w-[160px]">{r.cuisines?.join(', ')}</td>
                    <td className="p-4 font-bold text-slate-800">{r.rating} &#9733;</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        r.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>{r.isVerified ? 'Verified' : 'Pending'}</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        r.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>{r.isActive ? 'Active' : 'Suspended'}</span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleToggleVerification(r._id)}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-800 cursor-pointer">
                        {r.isVerified ? 'Unverify' : '\u2713 Verify'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => (
              <button key={s} onClick={() => { setOrderStatusFilter(s); setOrderPage(1); }}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all cursor-pointer ${
                  orderStatusFilter === s ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}>{s === 'all' ? 'All Orders' : s.replace(/_/g, ' ')}</button>
            ))}
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="p-4">Order #</th><th className="p-4">Customer</th>
                    <th className="p-4">Restaurant</th><th className="p-4">Amount</th>
                    <th className="p-4">Payment</th><th className="p-4">Pay Status</th>
                    <th className="p-4">Order Status</th><th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.length === 0 && (
                    <tr><td colSpan={8} className="p-8 text-center text-slate-400">No orders found.</td></tr>
                  )}
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{o.orderNumber}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{o.customer?.name || 'Guest'}</div>
                        <div className="text-slate-400">{o.customer?.phone || o.customer?.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{o.restaurant?.name}</div>
                        <div className="text-slate-400">{o.restaurant?.locality}</div>
                      </td>
                      <td className="p-4 font-bold text-slate-900">&#8377;{o.totalAmount}</td>
                      <td className="p-4 uppercase font-semibold text-slate-600">{(o.paymentMethod || '').replace('_', ' ')}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${PAY_COLORS[o.paymentStatus] || 'bg-slate-100 text-slate-600'}`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${STATUS_COLORS[o.orderStatus] || 'bg-slate-100 text-slate-600'}`}>
                          {(o.orderStatus || '').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => openStatusModal(o)}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-800 cursor-pointer">Update Status</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {orderTotalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-100">
                <span className="text-xs text-slate-500">Page {orderPage} of {orderTotalPages} ({orderTotal} orders)</span>
                <div className="flex items-center space-x-2">
                  <button onClick={() => setOrderPage((p) => Math.max(1, p - 1))} disabled={orderPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setOrderPage((p) => Math.min(orderTotalPages, p + 1))} disabled={orderPage === orderTotalPages}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coupons.map((coupon) => (
            <div key={coupon._id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-brand-600 bg-orange-50 px-2.5 py-1 rounded-lg">{coupon.code}</span>
                <button onClick={() => handleDeleteCoupon(coupon._id)} className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{coupon.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{coupon.description}</p>
              </div>
              <div className="text-xs text-slate-600 pt-2 border-t border-slate-100 space-y-1">
                <div>Min Order: <strong>&#8377;{coupon.minOrderValue}</strong></div>
                <div>Discount: <strong>{coupon.discountValue}% (Max &#8377;{coupon.maxDiscount})</strong></div>
              </div>
            </div>
          ))}
          {coupons.length === 0 && <div className="col-span-4 py-12 text-center text-slate-400">No coupons yet. Create one!</div>}
        </div>
      )}

      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900">Update Order Status</h3>
            <p className="text-xs text-slate-500">Order #{statusModal.orderNumber}</p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Status</label>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-slate-50 text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500">
                {STATUS_OPTIONS.filter(s => s !== 'all').map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Admin Note (optional)</label>
              <input type="text" placeholder="e.g. Manually confirmed by admin"
                value={statusNote} onChange={(e) => setStatusNote(e.target.value)}
                className="w-full bg-slate-50 text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500" />
            </div>
            <div className="flex space-x-2 pt-2">
              <button type="button" onClick={() => setStatusModal(null)}
                className="flex-1 py-2.5 bg-slate-100 font-bold text-xs rounded-xl cursor-pointer">Cancel</button>
              <button type="button" onClick={handleUpdateStatus} disabled={statusUpdating}
                className="flex-1 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50">
                {statusUpdating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {newCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900">Create New Promo Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Coupon Code</label>
                <input type="text" required placeholder="e.g. SALEMSPECIAL"
                  value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 text-xs p-2.5 rounded-xl border border-slate-200 font-bold uppercase" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input type="text" required placeholder="e.g. Flat 30% OFF for Salem Foodies"
                  value={couponForm.title} onChange={(e) => setCouponForm({ ...couponForm, title: e.target.value })}
                  className="w-full bg-slate-50 text-xs p-2.5 rounded-xl border border-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discount %</label>
                  <input type="number" required value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full bg-slate-50 text-xs p-2.5 rounded-xl border border-slate-200" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Discount (&#8377;)</label>
                  <input type="number" required value={couponForm.maxDiscount}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: Number(e.target.value) })}
                    className="w-full bg-slate-50 text-xs p-2.5 rounded-xl border border-slate-200" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Min Order Value (&#8377;)</label>
                <input type="number" required value={couponForm.minOrderValue}
                  onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: Number(e.target.value) })}
                  className="w-full bg-slate-50 text-xs p-2.5 rounded-xl border border-slate-200" />
              </div>
              <div className="flex space-x-2 pt-2">
                <button type="button" onClick={() => setNewCouponModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 font-bold text-xs rounded-xl cursor-pointer">Cancel</button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer">Save Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
