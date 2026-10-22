import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import CartDrawer from './components/CartDrawer';
import LocationModal from './components/LocationModal';
import AuthModal from './components/AuthModal';
import ConflictModal from './components/ConflictModal';
import AIChatBot from './components/AIChatBot';
import { CustomerRoute, RoleRoute } from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import RestaurantListingPage from './pages/RestaurantListingPage';
import RestaurantDetailsPage from './pages/RestaurantDetailsPage';
import FoodSearchPage from './pages/FoodSearchPage';
import FoodsPage from './pages/FoodsPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import UserAccountPage from './pages/UserAccountPage';
import RestaurantDashboard from './pages/RestaurantDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AIChatbotPage from './pages/AIChatbotPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-orange-500 selection:text-white">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Authentication pages */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<LoginPage initialMode="register" />} />
                  <Route path="/signin" element={<LoginPage />} />

                  {/* Customer-facing public/customer pages */}
                  <Route path="/" element={<CustomerRoute><HomePage /></CustomerRoute>} />
                  <Route path="/restaurants" element={<CustomerRoute><RestaurantListingPage /></CustomerRoute>} />
                  <Route path="/foods" element={<CustomerRoute><FoodsPage /></CustomerRoute>} />
                  <Route path="/restaurant/:id" element={<CustomerRoute><RestaurantDetailsPage /></CustomerRoute>} />
                  <Route path="/search" element={<CustomerRoute><FoodSearchPage /></CustomerRoute>} />
                  <Route path="/checkout" element={<CustomerRoute><CheckoutPage /></CustomerRoute>} />
                  <Route path="/orders/:id/tracking" element={<CustomerRoute><OrderTrackingPage /></CustomerRoute>} />
                  <Route path="/account" element={<CustomerRoute><UserAccountPage /></CustomerRoute>} />
                  <Route path="/chat" element={<CustomerRoute><AIChatbotPage /></CustomerRoute>} />
                  {/* Role-protected portals */}
                  <Route path="/admin" element={<RoleRoute allowedRoles={['admin']}><AdminDashboard /></RoleRoute>} />
                  <Route path="/partner" element={<RoleRoute allowedRoles={['restaurant', 'admin']}><RestaurantDashboard /></RoleRoute>} />
                  <Route path="/delivery" element={<RoleRoute allowedRoles={['delivery', 'admin']}><DeliveryDashboard /></RoleRoute>} />
                </Routes>
              </main>
              <Footer />
              <MobileBottomNav />
              <CartDrawer />
              <LocationModal />
              <AuthModal />
              <ConflictModal />
              <AIChatBot />
            </div>
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </Router>
  );
}
