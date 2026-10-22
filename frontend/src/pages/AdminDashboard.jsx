import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Check, RefreshCw, ChefHat, DollarSign, ShoppingBag, Star, Image } from 'lucide-react';

const AdminDashboard = () => {
  const { user, apiUrl, getAuthHeaders } = useAuth();
  
  // Restaurant state
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // New restaurant form state
  const [restName, setRestName] = useState('');
  const [restDesc, setRestDesc] = useState('');
  const [restCuisine, setRestCuisine] = useState('Italian');
  const [restAddress, setRestAddress] = useState('');
  const [restImage, setRestImage] = useState('');
  const [restError, setRestError] = useState('');

  // New food item form state
  const [foodName, setFoodName] = useState('');
  const [foodDesc, setFoodDesc] = useState('');
  const [foodPrice, setFoodPrice] = useState('');
  const [foodCategory, setFoodCategory] = useState('Pizza');
  const [foodImage, setFoodImage] = useState('');
  const [foodError, setFoodError] = useState('');
  const [foodSuccess, setFoodSuccess] = useState(false);

  const fetchMerchantData = async () => {
    setLoading(true);
    try {
      // 1. Fetch restaurants owned by this merchant
      const resResponse = await fetch(`${apiUrl}/restaurants`);
      const resData = await resResponse.json();
      
      if (resData.success) {
        // Find if this user owns any restaurant
        const myRestaurant = resData.data.find(r => r.owner === user._id);
        
        if (myRestaurant) {
          setRestaurant(myRestaurant);

          // 2. Fetch menu
          const menuRes = await fetch(`${apiUrl}/restaurants/${myRestaurant._id}/menu`);
          const menuData = await menuRes.json();
          if (menuData.success) {
            setMenuItems(menuData.data);
          }

          // 3. Fetch restaurant orders
          const ordersRes = await fetch(`${apiUrl}/orders/restaurant`, {
            headers: getAuthHeaders()
          });
          const ordersData = await ordersRes.json();
          if (ordersData.success) {
            setOrders(ordersData.data);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching merchant data:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMerchantData();
  }, []);

  // Handle Restaurant Registration
  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    setRestError('');
    
    try {
      const response = await fetch(`${apiUrl}/restaurants`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: restName,
          description: restDesc,
          cuisine: restCuisine,
          address: restAddress,
          image: restImage || undefined
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create restaurant');
      }

      setRestaurant(data.data);
      fetchMerchantData();
    } catch (err) {
      setRestError(err.message);
    }
  };

  // Handle Add Food Item
  const handleAddFood = async (e) => {
    e.preventDefault();
    setFoodError('');
    setFoodSuccess(false);

    try {
      const response = await fetch(`${apiUrl}/restaurants/${restaurant._id}/menu`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: foodName,
          description: foodDesc,
          price: Number(foodPrice),
          category: foodCategory,
          image: foodImage || undefined
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add food item');
      }

      setFoodSuccess(true);
      setFoodName('');
      setFoodDesc('');
      setFoodPrice('');
      setFoodImage('');

      // Refresh items list
      fetchMerchantData();
    } catch (err) {
      setFoodError(err.message);
    }
  };

  // Handle Delete Food Item
  const handleDeleteFood = async (foodId) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return;
    try {
      const response = await fetch(`${apiUrl}/restaurants/menu/${foodId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      if (response.ok) {
        fetchMerchantData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${apiUrl}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchMerchantData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Compute Statistics
  const totalSales = orders
    .filter(o => o.deliveryStatus === 'delivered')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Loading merchant dashboard data...</p>
      </div>
    );
  }

  // If merchant has no restaurant yet, show setup page
  if (!restaurant) {
    return (
      <div className="container" style={{ padding: '40px 24px', maxWidth: '600px' }}>
        <div className="glass-panel" style={{ padding: '40px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ background: 'var(--primary)', padding: '12px', borderRadius: '14px', marginBottom: '12px' }}>
              <ChefHat size={32} color="white" />
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Setup Your Restaurant</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px', textAlign: 'center' }}>
              Get started by registering your restaurant details on FoodSwift.
            </p>
          </div>

          {restError && (
            <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '20px', textAlign: 'center' }}>
              {restError}
            </div>
          )}

          <form onSubmit={handleCreateRestaurant}>
            <div className="form-group">
              <label className="form-label">Restaurant Name</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="E.g., Pizza Planet" 
                value={restName}
                onChange={(e) => setRestName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                className="form-control" 
                rows="3"
                placeholder="Tell customers about your kitchen..." 
                value={restDesc}
                onChange={(e) => setRestDesc(e.target.value)}
                required
                style={{ resize: 'none' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cuisine Type</label>
              <select 
                className="form-control"
                value={restCuisine}
                onChange={(e) => setRestCuisine(e.target.value)}
                style={{ background: 'var(--bg-dark)' }}
              >
                <option value="Italian">Italian</option>
                <option value="American">American</option>
                <option value="Asian">Asian</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="E.g., 12 Main Street" 
                value={restAddress}
                onChange={(e) => setRestAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Banner Image URL (Optional)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="https://images.unsplash.com/..." 
                value={restImage}
                onChange={(e) => setRestImage(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }}>
              Launch Restaurant
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
            Merchant Panel
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '4px' }}>{restaurant.name}</h1>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={fetchMerchantData}
          style={{ display: 'flex', gap: '6px' }}
        >
          <RefreshCw size={16} /> Refresh Dashboard
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {/* Sales */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--secondary)', padding: '12px', borderRadius: '12px' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL SALES</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              ${totalSales.toFixed(2)}
            </h3>
          </div>
        </div>

        {/* Orders */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255, 110, 48, 0.15)', color: 'var(--primary)', padding: '12px', borderRadius: '12px' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL ORDERS</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {orders.length}
            </h3>
          </div>
        </div>

        {/* Menu Items */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--secondary)', padding: '12px', borderRadius: '12px' }}>
            <ChefHat size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>MENU DISHES</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {menuItems.length}
            </h3>
          </div>
        </div>

        {/* Rating */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent)', padding: '12px', borderRadius: '12px' }}>
            <Star size={24} fill="var(--accent)" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>RATING</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {restaurant.rating.toFixed(1)} / 5.0
            </h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {/* Orders Queue (Left) */}
        <div style={{ flex: '2 1 500px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>Orders Queue</h2>
          
          {orders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No customer orders placed yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((order) => (
                <div 
                  key={order._id} 
                  className="glass-card" 
                  style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                    <div>
                      <h4 style={{ fontWeight: 700 }}>Order #{order._id.substring(18)}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Customer: {order.user?.name || 'Guest'} | Phone: {order.phone}
                      </span>
                    </div>
                    <div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: order.deliveryStatus === 'delivered' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: order.deliveryStatus === 'delivered' ? 'var(--secondary)' : 'var(--accent)',
                      }}>
                        {order.deliveryStatus}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                    {order.orderItems.map((item) => (
                      <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{item.quantity}x {item.name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>Total: ${order.totalPrice.toFixed(2)}</span>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {order.deliveryStatus === 'pending' && (
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleUpdateOrderStatus(order._id, 'accepted')}
                          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                        >
                          Accept Order
                        </button>
                      )}
                      {order.deliveryStatus === 'accepted' && (
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleUpdateOrderStatus(order._id, 'preparing')}
                          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                        >
                          Start Preparing
                        </button>
                      )}
                      {order.deliveryStatus === 'preparing' && (
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleUpdateOrderStatus(order._id, 'out_for_delivery')}
                          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                        >
                          Mark Ready for Delivery
                        </button>
                      )}
                      {order.deliveryStatus !== 'delivered' && order.deliveryStatus !== 'cancelled' && (
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')}
                          style={{ padding: '6px 14px', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Menu Manager (Right) */}
        <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Add Food Form */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <Plus size={18} color="var(--primary)" /> Add Menu Dish
            </h3>

            {foodError && (
              <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '12px' }}>
                {foodError}
              </div>
            )}
            {foodSuccess && (
              <div style={{ color: 'var(--secondary)', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '12px' }}>
                Dish added to menu!
              </div>
            )}

            <form onSubmit={handleAddFood}>
              <div className="form-group">
                <label className="form-label">Dish Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="E.g., Pepperoni Pizza" 
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  required
                  style={{ padding: '8px 12px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-control" 
                  rows="2"
                  placeholder="Ingredients and prep details..." 
                  value={foodDesc}
                  onChange={(e) => setFoodDesc(e.target.value)}
                  required
                  style={{ resize: 'none', padding: '8px 12px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-control" 
                    placeholder="9.99" 
                    value={foodPrice}
                    onChange={(e) => setFoodPrice(e.target.value)}
                    required
                    style={{ padding: '8px 12px' }}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Category</label>
                  <select 
                    className="form-control"
                    value={foodCategory}
                    onChange={(e) => setFoodCategory(e.target.value)}
                    style={{ background: 'var(--bg-dark)', padding: '8px 12px' }}
                  >
                    <option value="Pizza">Pizza</option>
                    <option value="Burgers">Burgers</option>
                    <option value="Noodles & Rice">Noodles & Rice</option>
                    <option value="Sides">Sides</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Food Image URL (Optional)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="https://images.unsplash.com/..." 
                  value={foodImage}
                  onChange={(e) => setFoodImage(e.target.value)}
                  style={{ padding: '8px 12px' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
                Add to Menu
              </button>
            </form>
          </div>

          {/* Menu Items List */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', maxHeight: '420px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Current Menu ({menuItems.length})</h3>
            
            {menuItems.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No dishes added yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {menuItems.map((item) => (
                  <div 
                    key={item._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBottom: '10px',
                      borderBottom: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                      <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.name}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>${item.price.toFixed(2)}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '6px', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteFood(item._id)}
                      style={{ background: 'transparent', border: 'none', color: 'rgba(239, 68, 68, 0.7)', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
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

export default AdminDashboard;
