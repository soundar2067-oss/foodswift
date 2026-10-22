import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Star, MapPin, Plus } from 'lucide-react';

const CuisineDetail = ({ cuisineName, setActivePage, setSelectedRestaurant, setRedirectMessage }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiUrl, user } = useAuth();
  const { addToCart, formatPrice } = useCart();
  const [localCartError, setLocalCartError] = useState('');

  useEffect(() => {
    const fetchCuisineData = async () => {
      setLoading(true);
      try {
        // Fetch restaurants for this cuisine
        const restRes = await fetch(`${apiUrl}/restaurants?cuisine=${encodeURIComponent(cuisineName)}`);
        const restData = await restRes.json();
        if (restData.success) {
          setRestaurants(restData.data);
          
          // Fetch food items for this cuisine (we can search/filter by cuisine in the backend or load menu items)
          // Since our seeder distributes food items, let's load all foods matching this cuisine
          // We can fetch food items globally, and filter in frontend by restaurant.cuisine, or fetch via API if supported.
          // Let's fetch all food items and filter by matching cuisine in the populated restaurant field!
          const foodRes = await fetch(`${apiUrl}/restaurants/menu/items`);
          const foodData = await foodRes.json();
          if (foodData.success) {
            const filteredFoods = foodData.data.filter(item => 
              item.restaurant && item.restaurant.cuisine && 
              item.restaurant.cuisine.toLowerCase() === cuisineName.toLowerCase()
            );
            setFoodItems(filteredFoods.slice(0, 30)); // limit to 30 items for display
          }
        }
      } catch (err) {
        console.error('Error fetching cuisine details:', err);
      }
      setLoading(false);
    };

    if (cuisineName) {
      fetchCuisineData();
    }
  }, [cuisineName, apiUrl]);

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
      item.restaurant._id
    );

    if (!res.success) {
      setLocalCartError(res.message);
      setTimeout(() => setLocalCartError(''), 4000);
    }
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
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '36px', marginBottom: '40px', border: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(255, 110, 48, 0.15)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
          Culinary Hub
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px', textTransform: 'capitalize' }}>
          {cuisineName} Cuisine
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '6px', maxWidth: '600px' }}>
          Explore the finest, mouth-watering {cuisineName} restaurants and specialty signature dishes.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <p>Loading cuisine database...</p>
        </div>
      ) : (
        <div>
          {/* Section 1: Restaurants */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px' }}>Restaurants Serving {cuisineName}</h2>
            {restaurants.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No restaurants found for this cuisine.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {restaurants.map((restaurant) => (
                  <div 
                    key={restaurant._id} 
                    className="glass-card" 
                    onClick={() => handleRestaurantClick(restaurant)}
                    style={{ cursor: 'pointer', overflow: 'hidden' }}
                  >
                    <div style={{ height: '160px', position: 'relative' }}>
                      <img src={restaurant.image} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(18, 20, 28, 0.85)',
                        backdropFilter: 'blur(4px)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'var(--accent)',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        border: '1px solid var(--border-color)'
                      }}>
                        <Star size={12} fill="var(--accent)" /> {restaurant.rating.toFixed(1)}
                      </div>
                    </div>
                    <div style={{ padding: '20px' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px' }}>{restaurant.name}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '12px', height: '36px', overflow: 'hidden' }}>{restaurant.description}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <MapPin size={12} color="var(--primary)" />
                        <span>{restaurant.address}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Popular Dishes */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px' }}>Popular Dishes</h2>
            {foodItems.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No dishes found in this category.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {foodItems.map((item) => (
                  <div key={item._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
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
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, height: '50px', overflow: 'hidden', marginBottom: '12px' }}>{item.description}</p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{formatPrice(item.price)}</span>
                        {item.isAvailable && (!user || user.role === 'customer') && (
                          <button 
                            className="btn btn-primary" 
                            onClick={() => handleAddToCart(item)}
                            style={{ padding: '6px 10px', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', gap: '4px' }}
                          >
                            <Plus size={12} /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CuisineDetail;
