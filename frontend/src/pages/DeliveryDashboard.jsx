import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Truck, Navigation, CheckCircle, RefreshCw, Clipboard, MapPin, Phone, DollarSign } from 'lucide-react';

const DeliveryDashboard = () => {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiUrl, getAuthHeaders } = useAuth();

  const fetchDriverData = async () => {
    setLoading(true);
    try {
      // 1. Fetch unclaimed orders available for drivers
      const availRes = await fetch(`${apiUrl}/orders/delivery/available`, {
        headers: getAuthHeaders(),
      });
      const availData = await availRes.json();
      if (availData.success) {
        setAvailableOrders(availData.data);
      }

      // 2. Fetch driver's claimed active and past orders
      const tasksRes = await fetch(`${apiUrl}/orders/delivery/my-tasks`, {
        headers: getAuthHeaders(),
      });
      const tasksData = await tasksRes.json();
      if (tasksData.success) {
        setMyTasks(tasksData.data);
      }
    } catch (err) {
      console.error('Error fetching driver data:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDriverData();
  }, []);

  const handleClaimOrder = async (orderId) => {
    try {
      const response = await fetch(`${apiUrl}/orders/${orderId}/claim`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        fetchDriverData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${apiUrl}/orders/${orderId}/deliverystatus`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        fetchDriverData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeDeliveries = myTasks.filter(
    (t) => t.deliveryStatus !== 'delivered' && t.deliveryStatus !== 'cancelled'
  );
  const completedDeliveries = myTasks.filter((t) => t.deliveryStatus === 'delivered');
  const driverEarnings = completedDeliveries.length * 5.0; // Simulated $5 commission per dropoff

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Loading delivery portal data...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>
            Delivery Partner Dashboard
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '4px' }}>Rider Hub</h1>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={fetchDriverData}
          style={{ display: 'flex', gap: '6px' }}
        >
          <RefreshCw size={16} /> Refresh Tasks
        </button>
      </div>

      {/* Driver Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--secondary)', padding: '12px', borderRadius: '12px' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL EARNINGS</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              ${driverEarnings.toFixed(2)}
            </h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255, 110, 48, 0.15)', color: 'var(--primary)', padding: '12px', borderRadius: '12px' }}>
            <Truck size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE TASKS</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {activeDeliveries.length}
            </h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--secondary)', padding: '12px', borderRadius: '12px' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>DELIVERIES</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {completedDeliveries.length}
            </h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {/* Active Deliveries List & Updates (Left) */}
        <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={22} color="var(--primary)" /> Active Deliveries ({activeDeliveries.length})
            </h2>

            {activeDeliveries.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No active deliveries. Claim an order below to start!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {activeDeliveries.map((task) => (
                  <div key={task._id} className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Order #{task._id.substring(18)}</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Status: <strong style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>{task.deliveryStatus}</strong>
                        </span>
                      </div>
                      <span style={{ fontWeight: 800, color: 'var(--secondary)' }}>${task.totalPrice.toFixed(2)}</span>
                    </div>

                    {/* Routing simulation */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <MapPin size={16} color="var(--primary)" style={{ marginTop: '2px' }} />
                        <div>
                          <strong style={{ color: 'var(--text-secondary)' }}>Pickup: </strong>
                          <span>{task.restaurant?.name || 'Restaurant'} - {task.restaurant?.address}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <MapPin size={16} color="var(--secondary)" style={{ marginTop: '2px' }} />
                        <div>
                          <strong style={{ color: 'var(--text-secondary)' }}>Dropoff: </strong>
                          <span>{task.shippingAddress}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Phone size={16} color="var(--text-muted)" />
                        <span>Customer Phone: {task.phone}</span>
                      </div>
                    </div>

                    {/* Mock Routing Map Graphic */}
                    <div style={{
                      marginTop: '20px',
                      height: '100px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '8px',
                      border: '1px dashed var(--border-color)',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        position: 'absolute',
                        width: '80%',
                        height: '2px',
                        backgroundColor: 'rgba(255, 110, 48, 0.2)',
                        zIndex: 1
                      }}></div>
                      {/* Animating driver rider along line */}
                      <div style={{
                        position: 'absolute',
                        left: task.deliveryStatus === 'preparing' ? '10%' : '50%',
                        animation: task.deliveryStatus === 'out_for_delivery' ? 'pulse-live 2s infinite' : 'none',
                        zIndex: 2,
                        background: 'var(--primary)',
                        padding: '6px',
                        borderRadius: '50%',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'left 2s ease-in-out'
                      }}>
                        <Truck size={14} />
                      </div>
                      <span style={{ position: 'absolute', left: '8%', top: '60%', fontSize: '0.7rem', color: 'var(--text-muted)' }}>🍕 Kitchen</span>
                      <span style={{ position: 'absolute', right: '8%', top: '60%', fontSize: '0.7rem', color: 'var(--text-muted)' }}>🏠 Home</span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      {task.deliveryStatus === 'preparing' && (
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleUpdateStatus(task._id, 'out_for_delivery')}
                          style={{ flex: 1, padding: '10px' }}
                        >
                          Out for Delivery
                        </button>
                      )}
                      {task.deliveryStatus === 'out_for_delivery' && (
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleUpdateStatus(task._id, 'delivered')}
                          style={{ flex: 1, padding: '10px', backgroundColor: 'var(--secondary)' }}
                        >
                          Mark as Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Claim Unclaimed Orders Queue (Right) */}
        <div style={{ flex: '1 1 350px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clipboard size={22} color="var(--primary)" /> Available Jobs ({availableOrders.length})
          </h2>

          {availableOrders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No orders waiting for delivery right now.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {availableOrders.map((order) => (
                <div key={order._id} className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h4 style={{ fontWeight: 700 }}>Order #{order._id.substring(18)}</h4>
                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>${order.totalPrice.toFixed(2)}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    <div>🗺️ <strong>From: </strong>{order.restaurant?.name} ({order.restaurant?.address})</div>
                    <div>📍 <strong>To: </strong>{order.shippingAddress}</div>
                  </div>

                  <button 
                    onClick={() => handleClaimOrder(order._id)}
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '8px', fontSize: '0.85rem' }}
                  >
                    Accept Delivery Job
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
