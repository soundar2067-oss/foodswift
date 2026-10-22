import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Search, Star, MapPin, Sparkles, Tag, ArrowRight, Flame, Plus } from 'lucide-react';

const Home = ({ setSelectedRestaurant, setActivePage, setRedirectMessage }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [trendingFoods, setTrendingFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { apiUrl, user } = useAuth();
  const { addToCart, formatPrice } = useCart();
  const [localCartError, setLocalCartError] = useState('');

  // 30 Categories with icons/emojis for the slider
  const categories = [
    { name: 'Pizza', emoji: '🍕' },
    { name: 'Burgers', emoji: '🍔' },
    { name: 'Pasta', emoji: '🍝' },
    { name: 'Sushi', emoji: '🍣' },
    { name: 'Tandoori Starters', emoji: '🍗' },
    { name: 'Indian Curries', emoji: '🍲' },
    { name: 'Noodles & Rice', emoji: '🍜' },
    { name: 'Spring Rolls & Momos', emoji: '🥟' },
    { name: 'Salads', emoji: '🥗' },
    { name: 'Desserts', emoji: '🍰' },
    { name: 'Beverages', emoji: '🥤' },
    { name: 'Breakfast Specialties', emoji: '🍳' },
    { name: 'Appetizers', emoji: '🍟' },
    { name: 'Soups', emoji: '🥣' },
    { name: 'Mexican Tacos', emoji: '🌮' },
    { name: 'Quesadillas', emoji: '🫓' },
    { name: 'Japanese Ramen', emoji: '🍜' },
    { name: 'Thai Curries', emoji: '🍛' },
    { name: 'Sandwiches & Wraps', emoji: '🥪' },
    { name: 'South Indian Chaat', emoji: '🫓' },
    { name: 'Breads & Naans', emoji: '🫓' },
    { name: 'Chicken Dishes', emoji: '🍗' },
    { name: 'Seafood Specialties', emoji: '🦞' },
    { name: 'Vegan Bowls', emoji: '🥑' },
    { name: 'Kids Meals', emoji: '🍱' },
    { name: 'Pastries & Donuts', emoji: '🍩' },
    { name: 'Coffee & Tea', emoji: '☕' },
    { name: 'Mocktails & Shakes', emoji: '🍹' },
    { name: 'Waffles & Crepes', emoji: '🧇' },
    { name: 'Kebabs & Grills', emoji: '🍢' },
  ];

  // 10 Cuisines with realistic background images
  const cuisines = [
    { name: 'Italian', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=60' },
    { name: 'American', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=60' },
    { name: 'Chinese', image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=300&auto=format&fit=crop&q=60' },
    { name: 'Indian', image: 'https://images.unsplash.com/photo-1585938338392-50a59970d8ee?w=300&auto=format&fit=crop&q=60' },
    { name: 'Mexican', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300&auto=format&fit=crop&q=60' },
    { name: 'Japanese', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&auto=format&fit=crop&q=60' },
    { name: 'Thai', image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=300&auto=format&fit=crop&q=60' },
    { name: 'Healthy/Salads', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=60' },
    { name: 'Bakery/Desserts', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&auto=format&fit=crop&q=60' },
    { name: 'Mediterranean', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&auto=format&fit=crop&q=60' }
  ];

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Restaurants
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      const resResponse = await fetch(`${apiUrl}/restaurants?${queryParams.toString()}`);
      const resData = await resResponse.json();
      if (resData.success) {
        setRestaurants(resData.data);
      }

      // 2. Fetch Trending Foods (top 8)
      const foodResponse = await fetch(`${apiUrl}/restaurants/menu/items`);
      const foodData = await foodResponse.json();
      if (foodData.success) {
        // Shuffle or slice first 8 items
        setTrendingFoods(foodData.data.slice(0, 8));
      }
    } catch (err) {
      console.error('Error fetching home dashboard data:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHomeData();
  };

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setActivePage('restaurant');
  };

  const handleAddToCart = (item) => {
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
      item.restaurant?._id || item.restaurant
    );

    if (!res.success) {
      setLocalCartError(res.message);
      setTimeout(() => setLocalCartError(''), 4000);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      
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

      {/* Hero Header */}
      <div 
        className="glass-panel" 
        style={{
          borderRadius: 'var(--radius-lg)',
          padding: '48px',
          marginBottom: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '30px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ flex: 1, minWidth: '300px', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 110, 48, 0.15)', color: 'var(--primary)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Sparkles size={14} /> 50% Off Your First Order
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
            Super Fast <br />
            <span style={{ color: 'var(--primary)' }}>Food Delivery</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '24px', maxWidth: '440px' }}>
            Order from the best local restaurants and track your meal in real-time right to your doorstep.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', maxWidth: '460px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Search size={18} />
              </span>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search restaurants..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '48px', height: '48px', fontSize: '0.95rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 24px', height: '48px' }}>
              Search
            </button>
          </form>
        </div>

        {/* Hero Promo Banner */}
        <div style={{
          flex: '0 0 320px',
          background: 'linear-gradient(135deg, var(--primary) 0%, #ff8c5a 100%)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          color: 'white',
          boxShadow: '0 10px 30px rgba(255, 110, 48, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '240px',
          zIndex: 1
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={16} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ACTIVE COUPON</span>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>SWIFT50</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '4px' }}>Get 50% discount up to $15 or ₹1200 on all orders.</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Expires: 31st August</span>
            <button className="btn" style={{ background: 'white', color: 'var(--primary)', padding: '6px 12px', fontSize: '0.8rem' }}>
              Apply Code <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* 1. HORIZONTAL CATEGORIES SLIDER (30 Categories) */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          🍔 Browse by Category <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>(30 Varieties)</span>
        </h2>
        <div 
          style={{ 
            display: 'flex', 
            gap: '12px', 
            overflowX: 'auto', 
            paddingBottom: '16px', 
            scrollbarWidth: 'thin'
          }}
          className="horizontal-slider"
        >
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => setActivePage(`category:${cat.name}`)}
              style={{
                flex: '0 0 auto',
                padding: '16px 24px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
              className="glass-card"
            >
              <span style={{ fontSize: '1.5rem' }}>{cat.emoji}</span>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. CUISINE QUICK FILTERS GRID (10 Cuisines) */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px' }}>🧑‍🍳 Explore Cuisines</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '16px'
        }}>
          {cuisines.map((cuisine) => (
            <div
              key={cuisine.name}
              onClick={() => setActivePage(`cuisine:${cuisine.name}`)}
              style={{
                height: '100px',
                borderRadius: 'var(--radius-md)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid var(--border-color)'
              }}
              className="glass-card"
            >
              <img 
                src={cuisine.image} 
                alt={cuisine.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} 
              />
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '12px'
              }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>{cuisine.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. TRENDING DELICACIES GRID (with Add to Cart) */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Flame size={20} color="var(--primary)" /> Hot & Trending Dishes
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {trendingFoods.map((item) => (
            <div 
              key={item._id} 
              className="glass-card" 
              style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}
            >
              <div style={{ height: '150px', position: 'relative' }}>
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span 
                    onClick={() => handleRestaurantClick(item.restaurant)}
                    style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', textTransform: 'uppercase' }}
                  >
                    {item.restaurant?.name || 'Restaurant'}
                  </span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '2px 0 6px' }}>{item.name}</h3>
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--text-secondary)', 
                    lineHeight: 1.4, 
                    height: '50px', 
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    marginBottom: '12px' 
                  }}>
                    {item.description}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{formatPrice(item.price)}</span>
                  {item.isAvailable && (!user || user.role === 'customer') && (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleAddToCart(item)}
                      style={{ padding: '6px 10px', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', gap: '4px' }}
                    >
                      <Plus size={12} /> Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. POPULAR RESTAURANTS SECTION */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Popular Restaurants</h2>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{restaurants.length} kitchens near you</span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <p>Loading tasty options...</p>
          </div>
        ) : restaurants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No restaurants found matching your search.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {restaurants.map((restaurant) => (
              <div 
                key={restaurant._id} 
                className="glass-card" 
                onClick={() => handleRestaurantClick(restaurant)}
                style={{ cursor: 'pointer', overflow: 'hidden' }}
              >
                <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                  <img 
                    src={restaurant.image} 
                    alt={restaurant.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(18, 20, 28, 0.85)',
                    backdropFilter: 'blur(4px)',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--accent)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: '1px solid var(--border-color)'
                  }}>
                    <Star size={14} fill="var(--accent)" /> {restaurant.rating.toFixed(1)}
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {restaurant.cuisine}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '4px 0 8px' }}>
                    {restaurant.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: '16px' }}>
                    {restaurant.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                    <MapPin size={14} color="var(--primary)" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{restaurant.address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Home;
