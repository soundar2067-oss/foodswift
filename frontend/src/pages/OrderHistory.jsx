import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ClipboardList, RefreshCw, Clock, MapPin, Truck, ChevronRight, X, User } from 'lucide-react';

const OrderHistory = ({ selectedOrder, setSelectedOrder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiUrl, getAuthHeaders } = useAuth();
  const { formatPrice } = useCart();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/orders/myorders`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const refreshTrackerOrder = async (orderId) => {
    try {
      const response = await fetch(`${apiUrl}/orders/${orderId}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setSelectedOrder(data.data);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const getStatusDetails = (status) => {
    const details = {
      pending: { label: 'Placed', percentage: '12.5%' },
      accepted: { label: 'Accepted', percentage: '37.5%' },
      preparing: { label: 'Preparing', percentage: '62.5%' },
      out_for_delivery: { label: 'Out for Delivery', percentage: '87.5%' },
      delivered: { label: 'Delivered', percentage: '100%' },
      cancelled: { label: 'Cancelled', percentage: '0%' },
    };
    return details[status] || { label: status, percentage: '0%' };
  };

  const renderTracker = (order) => {
    const steps = ['pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered'];
    const currentIdx = steps.indexOf(order.deliveryStatus);
    const statusInfo = getStatusDetails(order.deliveryStatus);

    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}
      >
        <div 
          className="glass-panel"
          style={{
            width: '100%',
            maxWidth: '680px',
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
          }}
        >
          {/* Tracker Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <span className="pulse-badge" style={{ marginRight: '6px' }}></span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>
                Live Order Tracker
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>Order #{order._id.substring(18)}</h2>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => refreshTrackerOrder(order._id)}
                style={{ padding: '8px 12px', display: 'flex', gap: '6px', fontSize: '0.8rem' }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setSelectedOrder(null)}
                style={{ padding: '8px' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Status Tracker Graphic */}
          <div className="status-tracker">
            <div className="status-progress-bar" style={{ width: statusInfo.percentage }}></div>
            {steps.map((step, idx) => {
              const label = getStatusDetails(step).label;
              const isActive = step === order.deliveryStatus;
              const isCompleted = idx < currentIdx;
              
              return (
                <div 
                  key={step} 
                  className={`status-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                >
                  <div className="status-dot">
                    {idx + 1}
                  </div>
                  <span className="status-label">{label}</span>
                </div>
              );
            })}
          </div>

          {/* Details Panels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '30px' }}>
            {/* Delivery address */}
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <MapPin size={14} color="var(--primary)" /> Address
              </h4>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{order.shippingAddress}</p>
            </div>

            {/* Delivery Driver */}
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Truck size={14} color="var(--primary)" /> Delivery Driver
              </h4>
              {order.deliveryPartner ? (
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{order.deliveryPartner.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone: {order.deliveryPartner.phone}</p>
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Waiting to assign driver...</p>
              )}
            </div>
          </div>

          {/* Items Checklist Summary */}
          <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '24px', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>Order Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '120px', overflowY: 'auto' }}>
              {order.orderItems.map((item) => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>{item.quantity}x {item.name}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', marginTop: '12px', paddingTop: '12px', fontWeight: 800, color: 'var(--primary)' }}>
              <span>Total Price</span>
              <span>{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, display: 'flex', gap: '10px', alignItems: 'center' }}>
          <ClipboardList size={32} color="var(--primary)" /> Your Order History
        </h1>
        <button 
          className="btn btn-secondary" 
          onClick={fetchOrders}
          style={{ padding: '8px 16px', display: 'flex', gap: '6px' }}
        >
          <RefreshCw size={14} /> Refresh List
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem' }}>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
            const statusInfo = getStatusDetails(order.deliveryStatus);

            return (
              <div 
                key={order._id}
                className="glass-card"
                style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {order.restaurant?.name || 'Restaurant'}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '4px 0 8px' }}>
                    Total: {formatPrice(order.totalPrice)}
                  </h3>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {formattedDate}
                    </span>
                    <span>Method: {order.paymentMethod}</span>
                  </div>
                  {/* Item List inline */}
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {order.orderItems.map((item) => `${item.quantity}x ${item.name}`).join(', ')}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: order.deliveryStatus === 'delivered' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: order.deliveryStatus === 'delivered' ? 'var(--secondary)' : 'var(--accent)',
                    }}>
                      {statusInfo.label}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Payment: <span style={{ textTransform: 'capitalize' }}>{order.paymentStatus}</span>
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary" 
                    onClick={() => setSelectedOrder(order)}
                    style={{ padding: '8px 16px', display: 'flex', gap: '6px', fontSize: '0.85rem' }}
                  >
                    Track <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Render overlay tracker modal */}
      {selectedOrder && renderTracker(selectedOrder)}
    </div>
  );
};

export default OrderHistory;
