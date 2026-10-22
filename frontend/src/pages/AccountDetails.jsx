import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { User, Mail, Phone, MapPin, ClipboardList, Clock, Shield, RefreshCw } from 'lucide-react';

const AccountDetails = ({ setSelectedOrder, setActivePage }) => {
  const { user, apiUrl, getAuthHeaders } = useAuth();
  const { formatPrice } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/orders/myorders`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.data.slice(0, 5)); // show top 5 recent orders
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Please log in to view your account details.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '30px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <User size={32} color="var(--primary)" /> Profile Dashboard
      </h1>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Account Information Card */}
        <div style={{ flex: '1 1 360px' }}>
          <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
              <div 
                style={{ 
                  width: '90px', 
                  height: '90px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, var(--primary) 0%, #ff8c5a 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white', 
                  fontSize: '2.5rem', 
                  fontWeight: 800,
                  boxShadow: '0 8px 20px var(--primary-glow)',
                  marginBottom: '16px'
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user.name}</h2>
              <span 
                style={{ 
                  marginTop: '6px', 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  backgroundColor: 'rgba(255, 110, 48, 0.15)', 
                  color: 'var(--primary)', 
                  padding: '4px 12px', 
                  borderRadius: 'var(--radius-full)' 
                }}
              >
                {user.role}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ color: 'var(--primary)' }}><Mail size={18} /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>EMAIL ADDRESS</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.email || 'Not Provided'}</div>
                </div>
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ color: 'var(--primary)' }}><Phone size={18} /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PHONE NUMBER</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.phone || 'Not Provided'}</div>
                </div>
              </div>

              {/* Address */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ color: 'var(--primary)' }}><MapPin size={18} /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>DELIVERY ADDRESS</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.address || 'No address set yet'}</div>
                </div>
              </div>

              {/* Role */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ color: 'var(--primary)' }}><Shield size={18} /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACCOUNT TYPE</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, textTransform: 'capitalize' }}>{user.role} Portal Access</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders List */}
        <div style={{ flex: '2 1 500px' }}>
          <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, display: 'flex', gap: '8px', alignItems: 'center' }}>
                <ClipboardList size={22} color="var(--primary)" /> Recent Orders
              </h3>
              <button 
                className="btn btn-secondary" 
                onClick={fetchOrders}
                style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', gap: '4px' }}
              >
                <RefreshCw size={12} /> Reload
              </button>
            </div>

            {loading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading recent orders...</p>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.95rem' }}>No orders placed yet.</p>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setActivePage('home')}
                  style={{ marginTop: '16px', fontSize: '0.8rem', padding: '8px 16px' }}
                >
                  Order Food Now
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.map((order) => (
                  <div 
                    key={order._id} 
                    style={{ 
                      padding: '16px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                        {order.restaurant?.name || 'Restaurant'}
                      </span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '2px 0 6px' }}>
                        Total: {formatPrice(order.totalPrice)}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Clock size={10} />
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span 
                        style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 700, 
                          textTransform: 'uppercase', 
                          padding: '3px 8px', 
                          borderRadius: '4px',
                          backgroundColor: order.deliveryStatus === 'delivered' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: order.deliveryStatus === 'delivered' ? 'var(--secondary)' : 'var(--accent)'
                        }}
                      >
                        {order.deliveryStatus}
                      </span>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => {
                          setSelectedOrder(order);
                          setActivePage('orders');
                        }}
                        style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                      >
                        Track
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
