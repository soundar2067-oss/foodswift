import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Clock,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Tag,
  ArrowLeft,
  Share2,
  SlidersHorizontal,
} from 'lucide-react';
import api from '../services/api';
import FoodItemCard from '../components/FoodItemCard';

export default function RestaurantDetailsPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuCategories, setMenuCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // In-menu filter states
  const [vegOnly, setVegOnly] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState('');

  useEffect(() => {
    fetchRestaurantAndMenu();
  }, [id, vegOnly, menuSearch]);

  const fetchRestaurantAndMenu = async () => {
    try {
      setLoading(true);
      const [restRes, menuRes] = await Promise.all([
        api.get(`/restaurants/${id}`),
        api.get(`/restaurants/${id}/menu?vegOnly=${vegOnly}&search=${encodeURIComponent(menuSearch)}`),
      ]);

      if (restRes.data.success) {
        setRestaurant(restRes.data.data);
      }
      if (menuRes.data?.success && Object.keys(menuRes.data.data || {}).length > 0) {
        setMenuCategories(menuRes.data.data);
        const categories = Object.keys(menuRes.data.data);
        if (categories.length > 0) {
          setActiveCategoryTab(categories[0]);
        }
      } else if (restRes.data?.data?._id) {
        // Fallback fetch using the resolved restaurant ObjectId
        const fallbackMenu = await api.get(`/restaurants/${restRes.data.data._id}/menu?vegOnly=${vegOnly}&search=${encodeURIComponent(menuSearch)}`);
        if (fallbackMenu.data.success) {
          setMenuCategories(fallbackMenu.data.data);
          const categories = Object.keys(fallbackMenu.data.data);
          if (categories.length > 0) {
            setActiveCategoryTab(categories[0]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load restaurant details:', err);
      setError('Unable to load restaurant details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !restaurant) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-64 bg-slate-200 rounded-3xl" />
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <h3 className="font-bold text-xl text-slate-800">Restaurant Not Found</h3>
        <p className="text-xs text-slate-500">The restaurant could not be located in Salem.</p>
        <Link
          to="/restaurants"
          className="inline-block bg-brand-600 text-white font-bold text-xs uppercase px-6 py-2.5 rounded-full"
        >
          Back to Salem Directory
        </Link>
      </div>
    );
  }

  const categoryNames = Object.keys(menuCategories);

  return (
    <div className="min-h-screen pb-20">
      {/* Banner & Header */}
      <div className="relative bg-slate-900 text-white">
        <div className="absolute inset-0 overflow-hidden opacity-35">
          <img
            src={restaurant.bannerUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80'}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 relative z-10 space-y-4">
          <Link
            to="/restaurants"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Salem Restaurants</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="bg-brand-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  Salem Verified
                </span>
                {restaurant.isPureVeg && (
                  <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                    Pure Veg
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                {restaurant.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                {restaurant.description || 'Authentic regional taste and swift delivery in Salem.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-400" />
                  <span>{restaurant.branchAddress || `${restaurant.locality}, Salem`}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-brand-400" />
                  <span>{restaurant.phone || '+91 427 2445566'}</span>
                </div>
              </div>
            </div>

            {/* Rating Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex md:flex-col items-center justify-between md:justify-center gap-3 min-w-[140px] text-center">
              <div className="flex items-center space-x-1 bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-black text-sm">
                <span>{restaurant.rating?.toFixed(1) || '4.2'}</span>
                <Star className="w-3.5 h-3.5 fill-white" />
              </div>
              <div className="text-[11px] text-slate-300">
                <div className="font-semibold text-white">{restaurant.reviewCount || 100}+ Ratings</div>
                <div>Salem Verified</div>
              </div>
              <div className="text-xs font-bold text-orange-300 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{restaurant.estimatedDeliveryTime || 30} mins</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* In-Menu Search & Filter Bar */}
      <div className="sticky top-18 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          {/* Veg Only Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                vegOnly
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${vegOnly ? 'bg-white' : 'bg-emerald-600'}`} />
              <span>Veg Only</span>
            </button>
          </div>

          {/* Search inside this restaurant menu */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search dishes in menu..."
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              className="w-full bg-slate-50 text-xs pl-8 pr-3 py-2 rounded-full border border-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Category Pill Tabs */}
        {categoryNames.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {categoryNames.map((cat) => (
              <a
                key={cat}
                href={`#cat-${cat.replace(/\s+/g, '-')}`}
                className="flex-shrink-0 text-xs font-bold text-slate-600 hover:text-brand-600 bg-slate-100/70 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                {cat} ({menuCategories[cat]?.length || 0})
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Menu Categories and Dishes */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {categoryNames.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-slate-500 text-sm">No items match your search or filter.</p>
            <button
              onClick={() => {
                setVegOnly(false);
                setMenuSearch('');
              }}
              className="text-xs font-bold text-brand-600 underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          categoryNames.map((category) => (
            <div
              key={category}
              id={`cat-${category.replace(/\s+/g, '-')}`}
              className="space-y-4 pt-4"
            >
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  {category}
                </h2>
                <span className="text-xs font-semibold text-slate-400">
                  ({menuCategories[category]?.length} items)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuCategories[category]?.map((item) => (
                  <FoodItemCard
                    key={item._id}
                    item={item}
                    restaurant={restaurant}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
