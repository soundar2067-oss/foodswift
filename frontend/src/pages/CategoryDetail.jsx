import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Sparkles, ArrowLeft, Star, ShoppingBag, Plus } from 'lucide-react';

const CategoryDetail = ({ categoryName, setActivePage, setSelectedRestaurant, setRedirectMessage }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiUrl, user } = useAuth();
  const { addToCart, formatPrice } = useCart();
  const [localCartError, setLocalCartError] = useState('');

  useEffect(() => {
    const fetchCategoryItems = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/restaurants/menu/items?category=${encodeURIComponent(categoryName)}`);
        const data = await response.json();
        if (data.success) {
          setItems(data.data);
        }
      } catch (err) {
        console.error('Error fetching category items:', err);
      }
      setLoading(false);
    };

    if (categoryName) {
      fetchCategoryItems();
    }
  }, [categoryName, apiUrl]);

  const handleAddToCart = (item) => {
    // If not registered, automatically redirect to login/register page
    if (!user) {
      setRedirectMessage('You must register or sign in to add items to your cart and place orders!');
      setActivePage('login');
      return;
    }

    setLocalCartError('');
    const res = addToCart(
      {
        foodItem: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
      },
      item.restaurant._id
    );

    if (!res.success) {
      setLocalCartError(res.message);
      setTimeout(() => setLocalCartError(''), 4000);
    }
  };

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setActivePage('restaurant');
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      {/* Back Button */}
      <button 
        className="btn btn-secondary" 
        onClick={() => setActivePage('home')}
        style={{ marginBottom: '24px', display: 'flex', gap: '6px', padding: '8px 16px' }}
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      {localCartError && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '16px 24px',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
          zIndex: 1000,
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          ⚠️ {localCartError}
        </div>
      )}

      {/* Header */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '36px', marginBottom: '32px', border: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(255, 110, 48, 0.15)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
          Food Category
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px', textTransform: 'capitalize' }}>
          {categoryName} Delights
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '6px', maxWidth: '600px' }}>
          Explore our collection of {categoryName} from the top rated local kitchen hubs in town.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <p>Loading items...</p>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem' }}>No items found in this category.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {items.map((item) => (
            <div key={item._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
              <div style={{ height: '160px', position: 'relative' }}>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(18, 20, 28, 0.85)',
                  backdropFilter: 'blur(4px)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--secondary)',
                  border: '1px solid var(--border-color)'
                }}>
                  {item.isAvailable ? 'Available' : 'Sold Out'}
                </div>
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Restaurant badge link */}
                  <span 
                    onClick={() => handleRestaurantClick(item.restaurant)}
                    style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: 700, 
                      color: 'var(--primary)', 
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      textDecoration: 'underline'
                    }}
                  >
                    {item.restaurant?.name || 'Restaurant'}
                  </span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '4px 0 8px' }}>
                    {item.name}
                  </h3>
                  <p style={{ 
                    fontSize: '0.8rem', 
                    color: 'var(--text-secondary)', 
                    lineHeight: 1.4, 
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    height: '50px'
                  }}>
                    {item.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {formatPrice(item.price)}
                  </span>
                  {item.isAvailable && (!user || user.role === 'customer') && (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleAddToCart(item)}
                      style={{ padding: '8px 12px', borderRadius: '10px', fontSize: '0.8rem', display: 'flex', gap: '4px' }}
                    >
                      <Plus size={14} /> Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryDetail;
