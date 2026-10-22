import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Flame,
  ArrowRight,
  Clock,
  ShieldCheck,
  Percent,
  SlidersHorizontal,
  ChevronRight,
  Award,
  Zap,
} from 'lucide-react';
import api from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import FoodItemCard from '../components/FoodItemCard';
import { useLocation } from '../context/LocationContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { currentLocality, setLocationModalOpen } = useLocation();

  const [popularRestaurants, setPopularRestaurants] = useState([]);
  const [vegRestaurants, setVegRestaurants] = useState([]);
  const [biryaniRestaurants, setBiryaniRestaurants] = useState([]);
  const [trendingFoods, setTrendingFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick filters state
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'veg' | 'rating' | 'fast'

  useEffect(() => {
    fetchHomeData();
  }, [currentLocality]);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [restRes, vegRes, biryaniRes, foodsRes] = await Promise.all([
        api.get(`/restaurants?locality=${encodeURIComponent(currentLocality)}&limit=8`),
        api.get('/restaurants?isPureVeg=true&limit=6'),
        api.get('/restaurants?cuisine=Biryani&limit=6'),
        api.get('/foods?limit=8'),
      ]);

      if (restRes.data.success) {
        // If current locality has few restaurants, fallback to general Salem
        if (restRes.data.data.length < 4) {
          const fallback = await api.get('/restaurants?limit=8');
          setPopularRestaurants(fallback.data.data);
        } else {
          setPopularRestaurants(restRes.data.data);
        }
      }

      if (vegRes.data.success) setVegRestaurants(vegRes.data.data);
      if (biryaniRes.data.success) setBiryaniRestaurants(biryaniRes.data.data);
      if (foodsRes.data.success) setTrendingFoods(foodsRes.data.data);
    } catch (err) {
      console.error('Failed to load home page data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Curated Swiggy & Zomato category navigation chips
  const categories = [
    { name: 'South Indian', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=200&auto=format&fit=crop&q=80', query: 'South Indian' },
    { name: 'Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=80', query: 'Biryani' },
    { name: 'North Indian', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&auto=format&fit=crop&q=80', query: 'North Indian' },
    { name: 'Street Food', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=200&auto=format&fit=crop&q=80', query: 'Street Food' },
    { name: 'Fast Food', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80', query: 'Fast Food' },
    { name: 'Chinese', image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=200&auto=format&fit=crop&q=80', query: 'Chinese' },
    { name: 'Starters & Grill', image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=200&auto=format&fit=crop&q=80', query: 'Starters & Grill' },
    { name: 'Seafood', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&auto=format&fit=crop&q=80', query: 'Seafood' },
    { name: 'Bakery & Sweets', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&auto=format&fit=crop&q=80', query: 'Bakery & Desserts' },
    { name: 'Beverages', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80', query: 'Beverages' },
    { name: 'Healthy & Vegan', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&auto=format&fit=crop&q=80', query: 'Healthy Food' },
    { name: 'Offers & Combos', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80', query: 'Offers & Combos' },
  ];

  return (
    <div className="min-h-screen space-y-10 pb-16">
      {/* Hero Banner Section */}
      <section className="relative bg-gradient-to-br from-orange-500 via-brand-600 to-amber-700 text-white overflow-hidden py-12 md:py-16">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>Lightning Delivery Across Tamil Nadu Under 30 Mins</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Your Favourite Food, <br className="hidden sm:inline" />
              <span className="text-amber-200">Delivered Fast.</span>
            </h1>

            <p className="text-sm sm:text-base text-orange-100 font-medium leading-relaxed max-w-xl">
              Order authentic Tamil Nadu delicacies, Madurai kari dosa, Salem thattuvadai sets, Chennai biryani, Chettinad gravies, and Kongu feasts from 200+ top kitchens.
            </p>

            {/* Tamil Nadu Locality Quick Bar */}
            <div className="pt-2 flex items-center space-x-2 text-xs">
              <span className="text-orange-200">Current Area:</span>
              <button
                onClick={() => setLocationModalOpen(true)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full font-bold flex items-center space-x-1 underline cursor-pointer"
              >
                <span>{currentLocality}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Offer Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider bg-black/20 px-2 py-0.5 rounded">
                Salem Exclusive
              </span>
              <h3 className="font-extrabold text-lg">50% OFF First Order</h3>
              <p className="text-xs text-orange-100">Use code: <strong className="text-white">WELCOME50</strong></p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-black text-xl">
              %
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider bg-black/20 px-2 py-0.5 rounded">
                Free Delivery
              </span>
              <h3 className="font-extrabold text-lg">Zero Delivery Fee</h3>
              <p className="text-xs text-emerald-100">Use code: <strong className="text-white">FREEDELIVERY</strong></p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-black text-xl">
              🚚
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider bg-black/20 px-2 py-0.5 rounded">
                Top Rated
              </span>
              <h3 className="font-extrabold text-lg">Flat 20% OFF</h3>
              <p className="text-xs text-purple-100">Use code: <strong className="text-white">SALEM20</strong></p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-black text-xl">
              ⭐
            </div>
          </div>
        </div>
      </section>

      {/* Category Horizontal Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Inspiration For Your First Order
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">Explore curated flavours popular in Salem</p>
          </div>
          <Link
            to="/foods"
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>Explore All Foods</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex items-center space-x-4 overflow-x-auto pb-4 pt-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => navigate(`/foods?category=${encodeURIComponent(cat.query)}`)}
              className="flex flex-col items-center flex-shrink-0 group cursor-pointer focus:outline-none"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-slate-100 p-0.5 border-2 border-transparent group-hover:border-brand-500 shadow-sm group-hover:shadow-md transition-all">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-brand-600 mt-2 text-center max-w-[90px] leading-tight">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Popular Restaurants in Salem */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-brand-600 fill-brand-600" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Top Restaurants in {currentLocality}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Handpicked eateries with the highest customer ratings across Tamil Nadu
            </p>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('veg')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                activeFilter === 'veg'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              Pure Veg
            </button>
            <button
              onClick={() => setActiveFilter('rating')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                activeFilter === 'rating'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              Rating 4.3+
            </button>
          </div>
        </div>

        {/* Restaurant Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 space-y-3 animate-pulse border border-slate-100">
                <div className="aspect-[16/10] bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularRestaurants
              .filter((r) => {
                if (activeFilter === 'veg') return r.isPureVeg;
                if (activeFilter === 'rating') return r.rating >= 4.3;
                return true;
              })
              .map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))}
          </div>
        )}

        <div className="text-center pt-4">
          <Link
            to="/restaurants"
            className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-brand-500 text-slate-800 hover:text-brand-600 font-extrabold text-xs uppercase px-8 py-3.5 rounded-full shadow-xs transition-all"
          >
            <span>Explore All 200+ Salem Restaurants</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Trending Dishes in Salem */}
      {trendingFoods.length > 0 && (
        <section className="bg-slate-100/60 py-12 border-y border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Today's Trending Specials in Salem
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Most ordered biryanis, thattuvadai sets, and meals right now
                </p>
              </div>
              <Link
                to="/search"
                className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
              >
                <span>Search Menu</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendingFoods.slice(0, 6).map((food) => (
                <FoodItemCard
                  key={food._id}
                  item={food}
                  restaurant={food.restaurant}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Salem Pure Vegetarian Specialities */}
      {vegRestaurants.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-600" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Pure Vegetarian Restaurants in Tamil Nadu
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                100% vegetarian kitchens, pure ghee roasts, and traditional meals
              </p>
            </div>
            <Link
              to="/restaurants?vegOnly=true"
              className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
            >
              <span>View All Veg</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vegRestaurants.slice(0, 3).map((restaurant) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>
        </section>
      )}

      {/* Why Choose FoodSwift Tamil Nadu */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Why Tamil Nadu Orders on FoodSwift
            </h2>
            <p className="text-sm text-slate-300">
              Engineered across Tamil Nadu with transparent pricing and real-time moving GPS rider tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-brand-400 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Superfast 30 Min Delivery</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dedicated local delivery fleets operating across Chennai, Coimbatore, Madurai, Trichy, Salem, and all major Tamil Nadu hubs.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Verified Local Kitchens</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Over 200+ authenticated kitchen partners across Tamil Nadu with hygiene standards, ratings, and fresh preparation.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Percent className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Genuine Discounts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No inflated menu prices. Verified promo codes like WELCOME50 applied directly at checkout.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
