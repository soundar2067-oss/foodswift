import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  Flame,
  Percent,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Leaf,
  Beef,
  Coffee,
  Pizza,
  UtensilsCrossed,
} from 'lucide-react';
import api from '../services/api';
import FoodItemCard from '../components/FoodItemCard';

// 12 Main Navigation Categories recommended for Swiggy & Zomato style FoodSwift
const MAIN_CATEGORIES = [
  { id: 'all', label: 'All Foods', icon: '🍽️' },
  { id: 'pure_veg', label: 'Pure Veg', icon: '🌱', isVeg: true },
  { id: 'non_veg', label: 'Non-Veg', icon: '🍗', isVeg: false },
  { id: 'south indian', label: 'South Indian', icon: '🥘' },
  { id: 'north indian', label: 'North Indian', icon: '🍲' },
  { id: 'biryani', label: 'Biryani', icon: '🍚' },
  { id: 'fast food', label: 'Fast Food', icon: '🍔' },
  { id: 'chinese', label: 'Chinese', icon: '🍜' },
  { id: 'bakery & desserts', label: 'Bakery & Desserts', icon: '🍰' },
  { id: 'beverages', label: 'Beverages', icon: '☕' },
  { id: 'healthy food', label: 'Healthy Food', icon: '🥗' },
  { id: 'offers & combos', label: 'Offers & Combos', icon: '🏷️' },
];

const SUB_CUISINES = [
  { id: 'street food', label: 'Street Food & Chaat' },
  { id: 'starters & grill', label: 'Starters & Grill' },
  { id: 'seafood', label: 'Seafood' },
  { id: 'breakfast', label: 'Breakfast' },
];

export default function FoodsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL parameters or defaults
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';
  const initialVeg = searchParams.get('vegOnly') === 'true';
  const initialOffers = searchParams.get('offers') === 'true';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [vegOnly, setVegOnly] = useState(initialVeg);
  const [offersOnly, setOffersOnly] = useState(initialOffers);
  const [sortBy, setSortBy] = useState('popular');
  const [page, setPage] = useState(1);

  const [foods, setFoods] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoods();
  }, [activeCategory, vegOnly, offersOnly, sortBy, page]);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 24,
        sortBy,
      });

      if (activeCategory && activeCategory !== 'all') {
        params.append('category', activeCategory);
      }
      if (vegOnly) {
        params.append('isVeg', 'true');
      }
      if (offersOnly) {
        params.append('offersOnly', 'true');
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const res = await api.get(`/foods?${params.toString()}`);
      if (res.data.success) {
        setFoods(res.data.data);
        setTotalCount(res.data.total);
        setTotalPages(res.data.pages);
      }
    } catch (err) {
      console.error('Failed to load foods:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFoods();
  };

  const handleCategorySelect = (catId) => {
    setActiveCategory(catId);
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (catId === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', catId);
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setVegOnly(false);
    setOffersOnly(false);
    setSortBy('popular');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-orange-100 text-brand-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Salem Food Catalog • Swiggy &amp; Zomato Style</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Explore All Foods &amp; Cuisines
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Over {totalCount > 0 ? `${totalCount.toLocaleString()}+` : '24,000+'} dishes across 210 Salem restaurants • Veg &amp; Non-Veg
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search dish (Biryani, Dosa, Shawarma...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-xs sm:text-sm pl-10 pr-10 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand-500 shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setPage(1);
              }}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* 12 Main Navigation Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Main Categories
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {MAIN_CATEGORIES.length} Cuisines Available
          </span>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {MAIN_CATEGORIES.map((cat) => {
            const isSelected = activeCategory.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-105'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-orange-50/70 hover:border-brand-200'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-Cuisine Quick Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase pr-1">More:</span>
          {SUB_CUISINES.map((sub) => {
            const isSelected = activeCategory.toLowerCase() === sub.id.toLowerCase();
            return (
              <button
                key={sub.id}
                onClick={() => handleCategorySelect(sub.id)}
                className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sub.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters & Sorting Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Pure Veg Toggle */}
          <button
            onClick={() => {
              setVegOnly(!vegOnly);
              setPage(1);
            }}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              vegOnly
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Pure Veg Only</span>
          </button>

          {/* Offers Only Toggle */}
          <button
            onClick={() => {
              setOffersOnly(!offersOnly);
              setPage(1);
            }}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              offersOnly
                ? 'bg-orange-50 text-brand-800 border-orange-300 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Percent className="w-3.5 h-3.5 text-brand-500" />
            <span>Special Discounts</span>
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-semibold">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 text-xs font-bold text-slate-800 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="popular">Bestsellers First</option>
            <option value="rating">Highest Rated</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="name">Dish Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Food Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs animate-pulse flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-full" />
              </div>
              <div className="w-24 h-24 bg-slate-200 rounded-2xl shrink-0" />
            </div>
          ))}
        </div>
      ) : foods.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-brand-600 mx-auto">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900">No matching dishes found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Try adjusting your category filter, clearing your search, or switching off Pure Veg.
          </p>
          <button
            onClick={handleResetFilters}
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-full shadow-md cursor-pointer transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {foods.map((food) => (
              <FoodItemCard
                key={food._id}
                item={food}
                restaurant={food.restaurant}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">
                Showing page <strong className="text-slate-800">{page}</strong> of{' '}
                <strong className="text-slate-800">{totalPages}</strong> ({totalCount.toLocaleString()} items found)
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="hidden sm:flex items-center space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (page <= 3) {
                      pageNum = idx + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = page - 2 + idx;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          page === pageNum
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
