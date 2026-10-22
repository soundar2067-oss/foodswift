import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Star, MapPin, Plus, ArrowLeft, Send, Sparkles, MessageSquare } from 'lucide-react';

const RestaurantDetails = ({ restaurant, setActivePage, setRedirectMessage }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartError, setCartError] = useState('');
  
  // Review inputs
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const { user, apiUrl, getAuthHeaders } = useAuth();
  const { addToCart, formatPrice } = useCart();

  const fetchRestaurantData = async () => {
    setLoading(true);
    try {
      // Fetch menu
      const menuRes = await fetch(`${apiUrl}/restaurants/${restaurant._id}/menu`);
      const menuData = await menuRes.json();
      if (menuData.success) {
        setMenuItems(menuData.data);
      }

      // Fetch reviews
      const reviewRes = await fetch(`${apiUrl}/restaurants/${restaurant._id}/reviews`);
      const reviewData = await reviewRes.json();
      if (reviewData.success) {
        setReviews(reviewData.data);
      }
    } catch (err) {
      console.error('Error fetching restaurant details:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (restaurant) {
      fetchRestaurantData();
    }
  }, [restaurant]);

  const handleAddToCart = (foodItem) => {
    // If not registered, automatically go to register page
    if (!user) {
      setRedirectMessage('You must register or sign in to add items to your cart and place orders!');
      setActivePage('login');
      return;
    }

    setCartError('');
    const res = addToCart(
      {
        foodItem: foodItem._id,
        name: foodItem.name,
        price: foodItem.price,
        image: foodItem.image,
      },
      restaurant._id
    );

    if (!res.success) {
      setCartError(res.message);
      // Automatically clear message after 4 seconds
      setTimeout(() => setCartError(''), 4000);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);

    if (!user) {
      setReviewError('You must be logged in to leave a review.');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/restaurants/${restaurant._id}/reviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ rating, comment }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      setReviewSuccess(true);
      setComment('');
      setRating(5);
      
      // Re-fetch data to show new review and update average restaurant rating
      fetchRestaurantData();
    } catch (err) {
      setReviewError(err.message);
    }
  };

  if (!restaurant) return null;

  // Group menu items by category
  const categories = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="container" style={{ padding: '30px 24px' }}>
      {/* Back Button */}
      <button 
        className="btn btn-secondary" 
        onClick={() => setActivePage('home')}
        style={{ marginBottom: '24px', display: 'flex', gap: '6px', padding: '8px 16px' }}
      >
        <ArrowLeft size={16} /> Back to Restaurants
      </button>

      {cartError && (
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
          ⚠️ {cartError}
        </div>
      )}

      {/* Restaurant Header */}
      <div 
        className="glass-panel" 
        style={{
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          marginBottom: '40px',
          border: '1px solid var(--border-color)'
        }}
      >
        <div style={{ height: '280px', position: 'relative' }}>
          <img 
            src={restaurant.image} 
            alt={restaurant.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(11, 12, 14, 0.95) 0%, rgba(11, 12, 14, 0.4) 70%, transparent 100%)',
            padding: '30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(255, 110, 48, 0.15)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                {restaurant.cuisine}
              </span>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '10px' }}>{restaurant.name}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '6px', maxWidth: '600px' }}>
                {restaurant.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '12px' }}>
                <MapPin size={16} color="var(--primary)" />
                <span>{restaurant.address}</span>
              </div>
            </div>
            <div style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(8px)',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', color: 'var(--accent)', fontWeight: 800, fontSize: '1.5rem' }}>
                <Star size={20} fill="var(--accent)" /> {restaurant.rating.toFixed(1)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>AVERAGE RATING</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Menu left, Reviews right */}
      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {/* Menu Section (Left) */}
        <div style={{ flex: '3 1 600px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Sparkles size={24} color="var(--primary)" /> Menu Items
          </h2>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading menu items...</p>
          ) : menuItems.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No food items added yet.</p>
          ) : (
            Object.keys(categories).map((categoryName) => (
              <div key={categoryName} style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                  {categoryName}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {categories[categoryName].map((item) => (
                    <div 
                      key={item._id} 
                      className="glass-card" 
                      style={{
                        display: 'flex',
                        gap: '20px',
                        padding: '16px',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          style={{ width: '90px', height: '90px', borderRadius: '10px', objectFit: 'cover' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>{item.name}</h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '8px' }}>
                            {item.description}
                          </p>
                          <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.1rem' }}>
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                      
                      {(!user || user.role === 'customer') && (
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleAddToCart(item)}
                          style={{ padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Add to Cart"
                        >
                          <Plus size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reviews Section (Right) */}
        <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Submit Review */}
          {user && user.role === 'customer' && (
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Leave a Review</h3>
              
              {reviewError && (
                <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '12px' }}>
                  {reviewError}
                </div>
              )}
              {reviewSuccess && (
                <div style={{ color: 'var(--secondary)', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '12px' }}>
                  Review submitted successfully!
                </div>
              )}

              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px' }}
                      >
                        <Star 
                          size={24} 
                          fill={star <= rating ? 'var(--accent)' : 'transparent'} 
                          color={star <= rating ? 'var(--accent)' : 'var(--text-muted)'} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Review Comment</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="How was the food and packaging?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    style={{ resize: 'none', fontSize: '0.9rem' }}
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px', display: 'flex', gap: '6px' }}>
                  Submit Review <Send size={14} />
                </button>
              </form>
            </div>
          )}

          {/* Review List */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', maxHeight: '500px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <MessageSquare size={18} color="var(--primary)" /> Reviews ({reviews.length})
            </h3>
            
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No reviews yet. Be the first to review!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reviews.map((rev) => (
                  <div 
                    key={rev._id} 
                    style={{ 
                      paddingBottom: '14px', 
                      borderBottom: '1px solid var(--border-color)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600 }}>{rev.user?.name || 'Anonymous'}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--accent)' }}>
                        <Star size={12} fill="var(--accent)" /> {rev.rating}
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{rev.comment}</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'inline-block' }}>
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
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

export default RestaurantDetails;
