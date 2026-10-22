import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, ShoppingBag, Store, User, UtensilsCrossed } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function MobileBottomNav() {
  const { itemCount, setCartDrawerOpen } = useCart();
  const { user, setAuthModalOpen } = useAuth();
  const navigate = useNavigate();

  const handleProtectedNav = (e, path) => {
    if (!user) {
      e.preventDefault();
      setAuthModalOpen(true);
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-1 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {/* Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2.5 rounded-xl text-[11px] font-semibold transition-colors ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </NavLink>

        {/* Explore Foods */}
        <NavLink
          to="/foods"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2.5 rounded-xl text-[11px] font-semibold transition-colors ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <UtensilsCrossed className="w-5 h-5 mb-0.5" />
          <span>Foods</span>
        </NavLink>

        {/* Floating Cart Trigger */}
        <button
          onClick={() => setCartDrawerOpen(true)}
          className="flex flex-col items-center py-1 px-2.5 rounded-xl text-[11px] font-semibold text-slate-500 hover:text-slate-900 relative cursor-pointer"
        >
          <div className="relative">
            <div className="w-12 h-12 -mt-6 rounded-full bg-gradient-to-tr from-brand-600 to-orange-400 flex items-center justify-center shadow-lg shadow-brand-500/30 border-4 border-white">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center z-10">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </div>
          <span className="text-brand-600 font-bold">Cart</span>
        </button>

        {/* Restaurants */}
        <NavLink
          to="/restaurants"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2.5 rounded-xl text-[11px] font-semibold transition-colors ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span>Dine</span>
        </NavLink>

        {/* Search */}
        <NavLink
          to="/search"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2.5 rounded-xl text-[11px] font-semibold transition-colors ${
              isActive ? 'text-brand-600' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>Search</span>
        </NavLink>

        {/* Account */}
        <NavLink
          to="/account"
          onClick={(e) => handleProtectedNav(e, '/account')}
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2.5 rounded-xl text-[11px] font-semibold transition-colors ${
              isActive ? 'text-brand-600' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover border border-brand-400 mb-0.5" />
          ) : (
            <User className="w-5 h-5 mb-0.5" />
          )}
          <span>{user ? 'Me' : 'Login'}</span>
        </NavLink>
      </div>
    </nav>
  );
}
