import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  User, 
  LogOut, 
  LogIn, 
  ChefHat, 
  ClipboardList, 
  Truck, 
  Home as HomeIcon,
  Globe,
  Sliders,
  DollarSign,
  Menu,
  X
} from 'lucide-react';

const Navbar = ({ activePage, setActivePage, toggleCart, navbarStyle, setNavbarStyle }) => {
  const { user, logout } = useAuth();
  const { cartCount, currency, updateCurrency } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const locations = [
    { code: 'IN', label: 'India (₹)', currency: 'INR' },
    { code: 'US', label: 'United States ($)', currency: 'USD' },
    { code: 'GB', label: 'United Kingdom ($)', currency: 'USD' },
    { code: 'AE', label: 'United Arab Emirates ($)', currency: 'USD' }
  ];

  const handleLocationChange = (e) => {
    const loc = locations.find(l => l.code === e.target.value);
    if (loc) {
      updateCurrency(loc.currency);
    }
  };

  const currentCountry = currency === 'INR' ? 'IN' : 'US';

  // Categories list for quick navigation (showing top 6)
  const quickCategories = ['Pizza', 'Burgers', 'Pasta', 'Sushi', 'Tandoori Starters', 'Indian Curries'];

  // Style objects based on active template selection
  const isSolidStyle = navbarStyle === 'solid';
  
  const navContainerStyle = isSolidStyle ? {
    backgroundColor: '#12141c',
    borderBottom: '2px solid #1a1e29',
    boxShadow: 'none',
    backdropFilter: 'none'
  } : {
    background: 'rgba(18, 20, 28, 0.7)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', zIndex: 100 }}>
      {/* 1. TOP HEADER BAR */}
      <div 
        style={{ 
          backgroundColor: '#0a0b0d', 
          borderBottom: '1px solid rgba(255,255,255,0.05)', 
          padding: '8px 24px', 
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0, flexWrap: 'wrap', gap: '10px' }}>
          {/* Style Selector & Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sliders size={12} color="var(--primary)" /> Layout:
              <select 
                value={navbarStyle} 
                onChange={(e) => setNavbarStyle(e.target.value)}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  color: 'white', 
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                <option value="glass" style={{ background: '#12141c' }}>Elegant Glassmorphic</option>
                <option value="solid" style={{ background: '#12141c' }}>Solid Dark Minimal</option>
              </select>
            </span>

            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={12} color="var(--primary)" /> Hub:
              <select 
                value={currentCountry} 
                onChange={handleLocationChange}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  color: 'white', 
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                {locations.map(loc => (
                  <option key={loc.code} value={loc.code} style={{ background: '#12141c' }}>{loc.label}</option>
                ))}
              </select>
            </span>
          </div>

          {/* Currency Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>Currency:</span>
            <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button 
                onClick={() => updateCurrency('USD')}
                style={{ 
                  background: currency === 'USD' ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                  color: 'white',
                  border: 'none',
                  padding: '3px 10px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                USD ($)
              </button>
              <button 
                onClick={() => updateCurrency('INR')}
                style={{ 
                  background: currency === 'INR' ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                  color: 'white',
                  border: 'none',
                  padding: '3px 10px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                INR (₹)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION BAR */}
      <nav 
        className="navbar" 
        style={{ 
          ...navContainerStyle, 
          height: 'auto', 
          padding: '12px 24px', 
          transition: 'var(--transition-smooth)',
          position: 'relative'
        }}
      >
        <div className="container" style={{ display: 'flex', width: '100%', flexDirection: 'column', padding: 0 }}>
          <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Logo */}
            <div 
              onClick={() => setActivePage('home')} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <div style={{ background: 'var(--primary)', padding: '6px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChefHat size={22} color="white" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                Food<span style={{ color: 'var(--primary)' }}>Swift</span>
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="nav-desktop-menu">
              <button 
                className="btn" 
                onClick={() => setActivePage('home')}
                style={{ 
                  background: 'transparent', 
                  color: activePage === 'home' ? 'var(--primary)' : 'var(--text-secondary)',
                  padding: '6px 12px',
                  fontSize: '0.9rem'
                }}
              >
                <HomeIcon size={16} /> Home
              </button>

              {user && user.role === 'customer' && (
                <button 
                  className="btn" 
                  onClick={() => setActivePage('orders')}
                  style={{ 
                    background: 'transparent', 
                    color: activePage === 'orders' ? 'var(--primary)' : 'var(--text-secondary)',
                    padding: '6px 12px',
                    fontSize: '0.9rem'
                  }}
                >
                  <ClipboardList size={16} /> My Orders
                </button>
              )}

              {user && user.role === 'admin' && (
                <button 
                  className="btn" 
                  onClick={() => setActivePage('admin')}
                  style={{ 
                    background: 'rgba(255, 110, 48, 0.1)', 
                    color: 'var(--primary)',
                    border: '1px solid rgba(255, 110, 48, 0.2)',
                    padding: '6px 12px',
                    fontSize: '0.9rem'
                  }}
                >
                  <ChefHat size={16} /> Admin
                </button>
              )}

              {user && user.role === 'delivery' && (
                <button 
                  className="btn" 
                  onClick={() => setActivePage('delivery')}
                  style={{ 
                    background: 'rgba(16, 185, 129, 0.1)', 
                    color: 'var(--secondary)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    padding: '6px 12px',
                    fontSize: '0.9rem'
                  }}
                >
                  <Truck size={16} /> Delivery Portal
                </button>
              )}

              {/* Cart Icon (Customer Only or Guest) */}
              {(!user || user.role === 'customer') && (
                <button 
                  className="btn btn-secondary" 
                  onClick={toggleCart}
                  style={{ position: 'relative', padding: '8px 14px', borderRadius: '12px' }}
                >
                  <ShoppingBag size={18} />
                  {cartCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      background: 'var(--primary)',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 8px var(--primary-glow)'
                    }}>
                      {cartCount}
                    </span>
                  )}
                </button>
              )}

              {/* User Account / Login */}
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setActivePage('account')}
                    style={{ 
                      padding: '8px 14px', 
                      display: 'flex', 
                      gap: '6px', 
                      fontSize: '0.85rem',
                      borderColor: activePage === 'account' ? 'var(--primary)' : 'var(--border-color)',
                      color: activePage === 'account' ? 'var(--primary)' : 'var(--text-primary)'
                    }}
                  >
                    <User size={16} /> Account
                  </button>
                  <button 
                    className="btn" 
                    onClick={logout}
                    style={{ padding: '8px', background: 'transparent', color: 'var(--text-muted)' }}
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={() => setActivePage('login')}
                  style={{ padding: '8px 16px', display: 'flex', gap: '6px', fontSize: '0.85rem' }}
                >
                  <LogIn size={16} /> Sign In
                </button>
              )}
            </div>

            {/* Mobile Hamburger Trigger */}
            <button 
              className="btn btn-secondary nav-mobile-trigger" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ padding: '8px', display: 'none' }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Quick Categories Bar (Desktop only) */}
          <div 
            className="nav-desktop-categories"
            style={{ 
              display: 'flex', 
              gap: '16px', 
              marginTop: '12px', 
              paddingTop: '8px', 
              borderTop: '1px solid rgba(255,255,255,0.05)',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            {quickCategories.map(cat => (
              <span 
                key={cat}
                onClick={() => {
                  setActivePage(`category:${cat}`);
                }}
                style={{ 
                  fontSize: '0.8rem', 
                  color: 'var(--text-secondary)', 
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'var(--transition-fast)'
                }}
                className="category-quicklink"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px', 
                marginTop: '16px', 
                paddingTop: '16px',
                borderTop: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <button className="btn btn-secondary" onClick={() => { setActivePage('home'); setMobileMenuOpen(false); }} style={{ justifyContent: 'flex-start' }}>
                <HomeIcon size={16} /> Home
              </button>
              {user && user.role === 'customer' && (
                <button className="btn btn-secondary" onClick={() => { setActivePage('orders'); setMobileMenuOpen(false); }} style={{ justifyContent: 'flex-start' }}>
                  <ClipboardList size={16} /> My Orders
                </button>
              )}
              {user && (
                <button className="btn btn-secondary" onClick={() => { setActivePage('account'); setMobileMenuOpen(false); }} style={{ justifyContent: 'flex-start' }}>
                  <User size={16} /> My Account
                </button>
              )}
              {user && user.role === 'admin' && (
                <button className="btn btn-secondary" onClick={() => { setActivePage('admin'); setMobileMenuOpen(false); }} style={{ justifyContent: 'flex-start' }}>
                  <ChefHat size={16} /> Admin Dashboard
                </button>
              )}
              {user && user.role === 'delivery' && (
                <button className="btn btn-secondary" onClick={() => { setActivePage('delivery'); setMobileMenuOpen(false); }} style={{ justifyContent: 'flex-start' }}>
                  <Truck size={16} /> Delivery Portal
                </button>
              )}
              {(!user || user.role === 'customer') && (
                <button className="btn btn-secondary" onClick={() => { toggleCart(); setMobileMenuOpen(false); }} style={{ justifyContent: 'flex-start' }}>
                  <ShoppingBag size={16} /> Cart ({cartCount})
                </button>
              )}
              {user ? (
                <button className="btn btn-secondary" onClick={() => { logout(); setMobileMenuOpen(false); }} style={{ justifyContent: 'flex-start', color: '#ef4444' }}>
                  <LogOut size={16} /> Logout
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => { setActivePage('login'); setMobileMenuOpen(false); }} style={{ justifyContent: 'flex-start' }}>
                  <LogIn size={16} /> Sign In
                </button>
              )}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
