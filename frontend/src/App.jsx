import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import RestaurantDetails from './pages/RestaurantDetails';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/AdminDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import LoginRegister from './pages/LoginRegister';
import AccountDetails from './pages/AccountDetails';
import CategoryDetail from './pages/CategoryDetail';
import CuisineDetail from './pages/CuisineDetail';
import InfoPage from './pages/InfoPage';
import AIChatbot from './components/AIChatbot';

const AppContent = () => {
  const [activePage, setActivePage] = useState('home');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [navbarStyle, setNavbarStyle] = useState('glass'); // 'glass' or 'solid'
  const [redirectMessage, setRedirectMessage] = useState(''); // warnings for guest checkouts

  const { user, loading } = useAuth();

  const toggleCart = () => setCartOpen(!cartOpen);

  const renderPage = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 70px)', color: 'var(--text-muted)' }}>
          <p>Loading application...</p>
        </div>
      );
    }

    // Dynamic Category Routing
    if (activePage.startsWith('category:')) {
      const cat = activePage.split(':')[1];
      return (
        <CategoryDetail 
          categoryName={cat} 
          setActivePage={setActivePage} 
          setSelectedRestaurant={setSelectedRestaurant} 
          setRedirectMessage={setRedirectMessage}
        />
      );
    }

    // Dynamic Cuisine Routing
    if (activePage.startsWith('cuisine:')) {
      const cuisine = activePage.split(':')[1];
      return (
        <CuisineDetail 
          cuisineName={cuisine} 
          setActivePage={setActivePage} 
          setSelectedRestaurant={setSelectedRestaurant} 
          setRedirectMessage={setRedirectMessage}
        />
      );
    }

    // Dynamic Info Routing
    if (activePage.startsWith('info:')) {
      const key = activePage.split(':')[1];
      return <InfoPage pageKey={key} setActivePage={setActivePage} />;
    }

    switch (activePage) {
      case 'home':
        return (
          <Home 
            setSelectedRestaurant={setSelectedRestaurant} 
            setActivePage={setActivePage} 
            setRedirectMessage={setRedirectMessage}
          />
        );
      case 'restaurant':
        return (
          <RestaurantDetails 
            restaurant={selectedRestaurant} 
            setActivePage={setActivePage} 
            setRedirectMessage={setRedirectMessage}
          />
        );
      case 'checkout':
        return (
          <Checkout 
            setActivePage={setActivePage} 
            setSelectedOrder={setSelectedOrder} 
          />
        );
      case 'orders':
        return (
          <OrderHistory 
            selectedOrder={selectedOrder} 
            setSelectedOrder={setSelectedOrder} 
          />
        );
      case 'account':
        return (
          <AccountDetails 
            setSelectedOrder={setSelectedOrder} 
            setActivePage={setActivePage} 
          />
        );
      case 'admin':
        return <AdminDashboard />;
      case 'delivery':
        return <DeliveryDashboard />;
      case 'login':
        return (
          <LoginRegister 
            setActivePage={setActivePage} 
            redirectMessage={redirectMessage} 
            setRedirectMessage={setRedirectMessage} 
          />
        );
      default:
        return <Home setSelectedRestaurant={setSelectedRestaurant} setActivePage={setActivePage} setRedirectMessage={setRedirectMessage} />;
    }
  };

  const footerLinks = [
    { key: 'about', label: 'About Us' },
    { key: 'faq', label: 'FAQs' },
    { key: 'privacy', label: 'Privacy Policy' },
    { key: 'terms', label: 'Terms of Use' },
    { key: 'catering', label: 'Catering Services' },
    { key: 'careers', label: 'Careers' },
    { key: 'partner', label: 'Partner with Us' },
    { key: 'contact', label: 'Contact Us' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        toggleCart={toggleCart}
        navbarStyle={navbarStyle}
        setNavbarStyle={setNavbarStyle}
      />
      
      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>

      {/* Floating AI Assistant */}
      <AIChatbot 
        setActivePage={setActivePage} 
        setSelectedRestaurant={setSelectedRestaurant}
      />

      <CartDrawer 
        isOpen={cartOpen} 
        onClose={toggleCart} 
        setActivePage={setActivePage} 
      />
      
      {/* Detailed Footer with 8+ pages */}
      <footer style={{ borderTop: '1px solid var(--border-color)', backgroundColor: '#090a0d', padding: '40px 0 20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px' }}>
            <div style={{ flex: '1 1 300px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Food<span style={{ color: 'var(--primary)' }}>Swift</span>
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '280px' }}>
                Super fast delivery of 2,400+ delicacies from the top kitchens. Connect, choose, and enjoy.
              </p>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', flex: '2 1 auto' }}>
              <div>
                <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Company</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {footerLinks.slice(0, 4).map(link => (
                    <span 
                      key={link.key} 
                      onClick={() => setActivePage(`info:${link.key}`)}
                      style={{ cursor: 'pointer', transition: 'var(--transition-fast)' }}
                      className="footer-link"
                    >
                      {link.label}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Services</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {footerLinks.slice(4).map(link => (
                    <span 
                      key={link.key} 
                      onClick={() => setActivePage(`info:${link.key}`)}
                      style={{ cursor: 'pointer', transition: 'var(--transition-fast)' }}
                      className="footer-link"
                    >
                      {link.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <p>© 2026 FoodSwift. Built with love using the MERN Stack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
