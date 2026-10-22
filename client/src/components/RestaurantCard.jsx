import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, Tag } from 'lucide-react';

export default function RestaurantCard({ restaurant }) {
  if (!restaurant) return null;

  const fallbackBanner = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80';

  return (
    <Link
      to={`/restaurant/${restaurant.slug || restaurant._id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
    >
      {/* Banner Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={restaurant.bannerUrl || fallbackBanner}
          alt={restaurant.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = fallbackBanner;
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          {restaurant.isPureVeg ? (
            <span className="bg-emerald-600/90 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>PURE VEG</span>
            </span>
          ) : (
            <span className="bg-slate-900/70 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
              {restaurant.priceRange || '₹₹'}
            </span>
          )}

          {!restaurant.isOpen && (
            <span className="bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
              CLOSED
            </span>
          )}
        </div>

        {/* Bottom Banner Info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <div className="flex items-center space-x-1.5 font-bold text-xs bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
            <Tag className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-orange-200">50% OFF UP TO ₹100</span>
          </div>

          <div className="flex items-center space-x-1 font-semibold text-xs bg-slate-900/60 backdrop-blur-md px-2 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-slate-300" />
            <span>{restaurant.estimatedDeliveryTime || 30} mins</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-600 transition-colors line-clamp-1">
            {restaurant.name}
          </h3>
          <div className="flex items-center space-x-1 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0">
            <span>{restaurant.rating?.toFixed(1) || '4.2'}</span>
            <Star className="w-3 h-3 fill-white" />
          </div>
        </div>

        {/* Cuisines */}
        <p className="text-xs text-slate-500 line-clamp-1">
          {restaurant.cuisines?.join(', ') || 'South Indian, Fast Food'}
        </p>

        {/* Locality in Salem */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1 truncate max-w-[180px]">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{restaurant.locality || 'Fairlands'}, Salem</span>
          </div>
          <span className="text-slate-600 font-medium">
            Min ₹{restaurant.minOrderAmount || 99}
          </span>
        </div>
      </div>
    </Link>
  );
}
