import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Search,
  Percent,
  ShoppingBag,
  User,
  ChevronDown,
  LogOut,
  Clock,
  Shield,
  UtensilsCrossed,
  Bike,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout, setAuthModalOpen, setAuthMode } = useAuth();
  const { currentLocality, setLocationModalOpen } = useLocation();
  const { itemCount, setCartDrawerOpen } = useCart();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(navSearchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo & Salem Location Picker */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-orange-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 via-orange-600 to-slate-900 bg-clip-text text-transparent">
                  FOODSWIFT
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider -mt-1">
                  Tamil Nadu, India
                </span>
              </div>
            </Link>

            {/* Tamil Nadu Locality Selector */}
            <button
              onClick={() => setLocationModalOpen(true)}
              className="hidden md:flex items-center space-x-2 text-sm text-slate-700 bg-slate-50 hover:bg-orange-50/80 px-3.5 py-2 rounded-full border border-slate-200 hover:border-brand-300 transition-colors cursor-pointer group"
              title="Change Delivery Locality across Tamil Nadu"
            >
              <MapPin className="w-4 h-4 text-brand-500 group-hover:animate-bounce" />
              <div className="text-left">
                <div className="text-[11px] font-medium text-slate-400 leading-none">Delivering to</div>
                <div className="font-semibold text-slate-800 text-xs flex items-center space-x-1">
                  <span className="truncate max-w-[140px]">{currentLocality}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            </button>
          </div>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center flex-1 max-w-md mx-8 relative"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search dishes or restaurants across Tamil Nadu (Biryani, Dosa, Parotta...)"
              value={navSearchQuery}
              onChange={(e) => setNavSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-sm pl-10 pr-4 py-2.5 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all placeholder:text-slate-400"
            />
          </form>

          {/* Right Navigation Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link
              to="/foods"
              className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-orange-50/60 transition-colors"
            >
              <UtensilsCrossed className="w-4 h-4 text-brand-500" />
              <span>Explore Foods</span>
            </Link>

            <Link
              to="/restaurants?offers=true"
              className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-orange-50/60 transition-colors"
            >
              <Percent className="w-4 h-4 text-brand-500" />
              <span>Offers</span>
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="relative flex items-center space-x-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-sm hover:shadow-md hover:shadow-brand-500/20 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="bg-white text-brand-600 text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200/80 p-1.5 sm:px-3 sm:py-2 rounded-full text-slate-700 text-sm font-medium transition-colors cursor-pointer"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-300"
                  />
                  <span className="hidden md:inline font-semibold text-xs text-slate-800">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden md:inline" />
                </button>

                {profileDropdownOpen && (
                  <div
                    onClick={() => setProfileDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-orange-100 text-brand-700 rounded-md">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to="/account"
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-slate-700 hover:bg-orange-50 hover:text-brand-600 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile & Addresses</span>
                    </Link>

                    <Link
                      to="/account#orders"
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-slate-700 hover:bg-orange-50 hover:text-brand-600 transition-colors"
                    >
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>Order History</span>
                    </Link>

                    {/* Role specific portals */}
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-slate-700 hover:bg-orange-50 hover:text-brand-600 transition-colors font-medium"
                      >
                        <Shield className="w-4 h-4 text-purple-500" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    {(user.role === 'restaurant' || user.role === 'admin') && (
                      <Link
                        to="/partner"
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-slate-700 hover:bg-orange-50 hover:text-brand-600 transition-colors font-medium"
                      >
                        <UtensilsCrossed className="w-4 h-4 text-amber-500" />
                        <span>Restaurant Portal</span>
                      </Link>
                    )}

                    {(user.role === 'delivery' || user.role === 'admin') && (
                      <Link
                        to="/delivery"
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-slate-700 hover:bg-orange-50 hover:text-brand-600 transition-colors font-medium"
                      >
                        <Bike className="w-4 h-4 text-emerald-500" />
                        <span>Delivery Rider App</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-red-600 hover:bg-red-50 text-left transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
