import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, UtensilsCrossed, Store, Sparkles, X } from 'lucide-react';
import api from '../services/api';
import FoodItemCard from '../components/FoodItemCard';
import RestaurantCard from '../components/RestaurantCard';

export default function FoodSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [foods, setFoods] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [vegOnly, setVegOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('dishes'); // 'dishes' | 'restaurants'
  const [loading, setLoading] = useState(false);

  const popularSuggestions = [
    'Chicken Biryani',
    'Mutton Biryani',
    'Masala Dosa',
    'Salem Thattuvadai Set',
    'Chicken 65',
    'Bun Parotta',
    'Paneer Butter Masala',
    'Shawarma',
    'Pizza',
  ];

  useEffect(() => {
    if (query.trim()) {
      executeSearch(query.trim());
    } else {
      setFoods([]);
      setRestaurants([]);
    }
  }, [query, vegOnly]);

  const executeSearch = async (searchTerm) => {
    try {
      setLoading(true);
      const res = await api.get(`/foods/search?q=${encodeURIComponent(searchTerm)}&isVeg=${vegOnly}`);
      if (res.data.success) {
        setFoods(res.data.foods);
        setRestaurants(res.data.restaurants);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setSearchParams({ q: suggestion });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-screen">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Search Salem Foods & Restaurants
        </h1>

        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
          <input
            type="text"
            autoFocus
            placeholder="Search for biryani, dosa, shawarma, thattuvadai, pizza, or restaurant..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchParams(e.target.value ? { q: e.target.value } : {});
            }}
            className="w-full bg-white text-sm pl-12 pr-10 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand-500 shadow-sm"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSearchParams({});
              }}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Popular chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-400 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Trending in Salem:</span>
          </span>
          {popularSuggestions.map((item) => (
            <button
              key={item}
              onClick={() => handleSuggestionClick(item)}
              className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-orange-50 hover:text-brand-600 px-3 py-1 rounded-full border border-slate-200 transition-colors cursor-pointer"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs & Veg Filter */}
      {query && (
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('dishes')}
              className={`flex items-center space-x-1.5 text-sm font-bold pb-1 cursor-pointer transition-colors ${
                activeTab === 'dishes'
                  ? 'text-brand-600 border-b-2 border-brand-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Dishes ({foods.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('restaurants')}
              className={`flex items-center space-x-1.5 text-sm font-bold pb-1 cursor-pointer transition-colors ${
                activeTab === 'restaurants'
                  ? 'text-brand-600 border-b-2 border-brand-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Restaurants ({restaurants.length})</span>
            </button>
          </div>

          {/* Veg Only Toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
              vegOnly
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${vegOnly ? 'bg-white' : 'bg-emerald-600'}`} />
            <span>Pure Veg</span>
          </button>
        </div>
      )}

      {/* Results View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 h-32 animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : query && activeTab === 'dishes' ? (
        foods.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-slate-500 text-sm">No dishes found matching "{query}".</p>
            <p className="text-xs text-slate-400">Try searching for Biryani, Dosa, Meals, Parotta or Burgers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {foods.map((food) => (
              <FoodItemCard
                key={food._id}
                item={food}
                restaurant={food.restaurant}
              />
            ))}
          </div>
        )
      ) : query && activeTab === 'restaurants' ? (
        restaurants.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-slate-500 text-sm">No restaurants found matching "{query}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((rest) => (
              <RestaurantCard key={rest._id} restaurant={rest} />
            ))}
          </div>
        )
      ) : (
        <div className="py-16 text-center text-slate-400 text-xs">
          Type above to explore 2,500+ dishes and 200+ restaurants across Salem.
        </div>
      )}
    </div>
  );
}
