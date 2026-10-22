import React, { useState } from 'react';
import { X, MapPin, Navigation, Search, Check, Sparkles, Building2 } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

export default function LocationModal() {
  const {
    locationModalOpen,
    setLocationModalOpen,
    currentLocality,
    currentDistrict,
    selectLocality,
    districts,
  } = useLocation();

  const [activeDistrict, setActiveDistrict] = useState(currentDistrict || 'Salem');
  const [filterText, setFilterText] = useState('');

  if (!locationModalOpen) return null;

  // Find currently active district data
  const districtObj = districts.find((d) => d.name.toLowerCase() === activeDistrict.toLowerCase()) || districts[0];

  // If search query is typed, search across ALL districts
  const isSearching = filterText.trim().length > 0;
  const searchResults = isSearching
    ? districts.flatMap((d) =>
        d.localities
          .filter((loc) =>
            loc.toLowerCase().includes(filterText.toLowerCase()) ||
            d.name.toLowerCase().includes(filterText.toLowerCase())
          )
          .map((loc) => ({ locality: loc, district: d.name, full: `${loc}, ${d.name}` }))
      )
    : [];

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          selectLocality('Fairlands, Salem', 'Salem');
        },
        () => {
          selectLocality('Fairlands, Salem', 'Salem');
        }
      );
    } else {
      selectLocality('Fairlands, Salem', 'Salem');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-brand-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
                Select Delivery Location in Tamil Nadu
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Serving 18+ districts & 200+ major food localities across Tamil Nadu
              </p>
            </div>
          </div>
          <button
            onClick={() => setLocationModalOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS location quick picker */}
        <button
          onClick={handleUseCurrentLocation}
          className="flex-shrink-0 w-full flex items-center space-x-3 p-3 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-brand-200 text-brand-900 hover:from-orange-100 hover:to-amber-100 transition-all text-left cursor-pointer group shadow-2xs"
        >
          <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
            <Navigation className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-xs flex items-center space-x-1.5">
              <span>Use Current GPS Location</span>
              <span className="text-[9px] bg-brand-600 text-white px-1.5 py-0.2 rounded font-extrabold uppercase">
                Auto Detect
              </span>
            </div>
            <div className="text-[11px] text-brand-700 truncate">
              Currently selected: <strong>{currentLocality}</strong>
            </div>
          </div>
        </button>

        {/* Search Input across all Tamil Nadu */}
        <div className="relative flex-shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search any locality or city in Tamil Nadu (e.g. T. Nagar, RS Puram, Fairlands, Anna Nagar)..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-slate-50 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 placeholder:text-slate-400 transition-colors"
          />
          {filterText && (
            <button
              onClick={() => setFilterText('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Main Body */}
        {isSearching ? (
          /* Search Results Across All Tamil Nadu */
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Search Results ({searchResults.length})</span>
              <span>All Tamil Nadu</span>
            </div>
            {searchResults.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No matching location found. Try searching by city name like "Chennai", "Salem", or "Coimbatore".
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {searchResults.map((item) => {
                  const isSelected = currentLocality === item.full || currentLocality === item.locality;
                  return (
                    <button
                      key={item.full}
                      onClick={() => selectLocality(item.full, item.district)}
                      className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold border transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'bg-brand-50 border-brand-500 text-brand-900 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900">{item.locality}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{item.district}, Tamil Nadu</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-brand-600 flex-shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* District Tabs + Localities Grid */
          <div className="flex-1 overflow-hidden flex flex-col space-y-3 min-h-0">
            {/* Horizontal District Pills */}
            <div className="flex-shrink-0 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                <Building2 className="w-3 h-3" />
                <span>Select Tamil Nadu District / City</span>
              </span>
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                {districts.map((d) => {
                  const isActive = activeDistrict.toLowerCase() === d.name.toLowerCase();
                  return (
                    <button
                      key={d.name}
                      onClick={() => setActiveDistrict(d.name)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {d.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected District Info Banner */}
            <div className="flex-shrink-0 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-900">{districtObj.name} District</span>
                <span className="text-[11px] text-slate-500 ml-2">{districtObj.tagline}</span>
              </div>
              <span className="text-[10px] font-bold text-brand-600 bg-orange-100/80 px-2 py-0.5 rounded">
                {districtObj.localities.length} Areas
              </span>
            </div>

            {/* Localities for Selected District */}
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {districtObj.localities.map((loc) => {
                  const fullLocString = `${loc}, ${districtObj.name}`;
                  const isSelected =
                    currentLocality === fullLocString ||
                    currentLocality === loc ||
                    currentLocality.startsWith(loc);
                  return (
                    <button
                      key={loc}
                      onClick={() => selectLocality(fullLocString, districtObj.name)}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold border transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'bg-brand-50 border-brand-500 text-brand-900 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{loc}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 flex-shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 flex-shrink-0">
          <span>Delivery available across all selected Tamil Nadu cities.</span>
          <span className="font-semibold text-slate-600">30-Min Fast Delivery</span>
        </div>
      </div>
    </div>
  );
}
