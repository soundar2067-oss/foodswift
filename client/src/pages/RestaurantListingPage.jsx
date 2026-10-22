import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react';
import api from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import { salemLocalitiesList } from '../context/LocationContext';

export default function RestaurantListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [restaurants, setRestaurants] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedLocality, setSelectedLocality] = useState(searchParams.get('locality') || 'All Tamil Nadu');
  const [isPureVeg, setIsPureVeg] = useState(searchParams.get('vegOnly') === 'true');
  const [minRating, setMinRating] = useState(searchParams.get('rating') || '');
  const [maxDeliveryTime, setMaxDeliveryTime] = useState(searchParams.get('maxDeliveryTime') || '');
  const [sortBy, setSortBy] = useState('rating');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchRestaurants();
  }, [search, selectedLocality, isPureVeg, minRating, maxDeliveryTime, sortBy, page]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 20,
        sortBy,
      });

      if (search.trim()) params.append('search', search.trim());
      if (selectedLocality && selectedLocality !== 'All Tamil Nadu' && selectedLocality !== 'All Salem') {
        params.append('locality', selectedLocality);
      }
      if (isPureVeg) params.append('isPureVeg', 'true');
      if (minRating) params.append('rating', minRating);
      if (maxDeliveryTime) params.append('maxDeliveryTime', maxDeliveryTime);

      const res = await api.get(`/restaurants?${params.toString()}`);
      if (res.data.success) {
        setRestaurants(res.data.data);
        setTotalCount(res.data.total);
        setTotalPages(res.data.pages);
      }
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedLocality('All Salem');
    setIsPureVeg(false);
    setMinRating('');
    setMaxDeliveryTime('');
    setSortBy('rating');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Restaurants in Salem
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing {restaurants.length} of {totalCount} verified food spots across Salem
          </p>
        </div>

        {/* Search input in listing */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter by restaurant name or cuisine..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white text-xs pl-10 pr-4 py-2.5 rounded-full border border-slate-200 focus:outline-none focus:border-brand-500 shadow-xs"
          />
        </div>
      </div>

      {/* Filter and Sorting Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Locality Dropdown */}
          <select
            value={selectedLocality}
            onChange={(e) => {
              setSelectedLocality(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 py-2 px-3 rounded-xl focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="All Tamil Nadu">All Tamil Nadu Localities</option>
            {salemLocalitiesList.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          {/* Pure Veg Pill */}
          <button
            onClick={() => {
              setIsPureVeg(!isPureVeg);
              setPage(1);
            }}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isPureVeg
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isPureVeg ? 'bg-white' : 'bg-emerald-600'}`} />
            <span>Pure Veg</span>
          </button>

          {/* Rating 4.0+ Pill */}
          <button
            onClick={() => {
              setMinRating(minRating === '4' ? '' : '4');
              setPage(1);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              minRating === '4'
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            Ratings 4.0+
          </button>

          {/* Fast Delivery Pill */}
          <button
            onClick={() => {
              setMaxDeliveryTime(maxDeliveryTime === '30' ? '' : '30');
              setPage(1);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              maxDeliveryTime === '30'
                ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            Fast Delivery (&le;30m)
          </button>

          {(search || selectedLocality !== 'All Salem' || isPureVeg || minRating || maxDeliveryTime) && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 flex items-center space-x-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 py-2 px-3 rounded-xl focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="rating">Highest Rated</option>
            <option value="deliveryTime">Delivery Time</option>
            <option value="costLowToHigh">Cost: Low to High</option>
            <option value="costHighToLow">Cost: High to Low</option>
          </select>
        </div>
      </div>

      {/* Grid */}
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
      ) : restaurants.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 border border-slate-200/70 shadow-sm">
          <div className="w-16 h-16 bg-orange-50 text-brand-600 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">No restaurants found</h3>
          <p className="text-xs text-slate-500">
            No matching restaurants in Salem for your current filters. Try resetting the filters or selecting another locality.
          </p>
          <button
            onClick={handleClearFilters}
            className="bg-brand-600 text-white font-bold text-xs uppercase px-6 py-2.5 rounded-full shadow-md hover:bg-brand-700 cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {restaurants.map((r) => (
            <RestaurantCard key={r._id} restaurant={r} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>
          <span className="text-xs font-semibold text-slate-600 px-3">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
