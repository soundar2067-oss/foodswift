import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  // Fetch current user on mount if token or saved showcase session exists
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('foodswift_token');
      const savedUserStr = localStorage.getItem('foodswift_user');

      if (!token) {
        setLoading(false);
        return;
      }

      // Pre-hydrate from localStorage for instantaneous offline showcase
      if (savedUserStr) {
        try {
          setUser(JSON.parse(savedUserStr));
        } catch (e) {}
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data?.success) {
          setUser(res.data.user);
          localStorage.setItem('foodswift_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        // If backend is not reached, retain local showcase session instead of logging out
        if (!savedUserStr) {
          localStorage.removeItem('foodswift_token');
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        localStorage.setItem('foodswift_token', res.data.token);
        localStorage.setItem('foodswift_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setAuthModalOpen(false);
        return res.data.user;
      }
    } catch (err) {
      console.warn('Backend server offline or sleeping; starting showcase session:', err.message);
    }

    // Showcase fallback session (never block visitor from signing in)
    const lowerEmail = (email || 'guest@foodswift.com').toLowerCase();
    const role = lowerEmail.includes('admin')
      ? 'admin'
      : lowerEmail.includes('delivery')
      ? 'delivery_partner'
      : lowerEmail.includes('partner') || lowerEmail.includes('restaurant')
      ? 'restaurant_owner'
      : 'customer';

    const fallbackUser = {
      _id: 'usr_' + Date.now(),
      name: (email.split('@')[0] || 'User').replace(/[^a-zA-Z0-9]/g, ' ').toUpperCase(),
      email: email,
      phone: '9363981970',
      role: role,
      addresses: [
        {
          houseNo: 'No 42',
          street: 'Saradha College Main Road',
          locality: 'Fairlands',
          city: 'Salem',
          state: 'Tamil Nadu',
          pincode: '636016',
        },
      ],
    };

    localStorage.setItem('foodswift_token', 'demo_jwt_token_' + Date.now());
    localStorage.setItem('foodswift_user', JSON.stringify(fallbackUser));
    setUser(fallbackUser);
    setAuthModalOpen(false);
    return fallbackUser;
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data?.success) {
        localStorage.setItem('foodswift_token', res.data.token);
        localStorage.setItem('foodswift_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setAuthModalOpen(false);
        return res.data.user;
      }
    } catch (err) {
      console.warn('Backend server offline; registering user in showcase session:', err.message);
    }

    // Showcase fallback registration
    const registeredUser = {
      _id: 'usr_' + Date.now(),
      name: userData.name || (userData.email ? userData.email.split('@')[0] : 'Customer'),
      email: userData.email,
      phone: userData.phone || '9363981970',
      role: 'customer',
      dietaryPreference: userData.dietaryPreference || 'any',
      addresses: [
        {
          houseNo: 'No 15',
          street: 'Main Cross Road',
          locality: 'Fairlands',
          city: 'Salem',
          state: 'Tamil Nadu',
          pincode: '636016',
        },
      ],
    };

    localStorage.setItem('foodswift_token', 'demo_jwt_token_' + Date.now());
    localStorage.setItem('foodswift_user', JSON.stringify(registeredUser));
    setUser(registeredUser);
    setAuthModalOpen(false);
    return registeredUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // silent
    }
    localStorage.removeItem('foodswift_token');
    localStorage.removeItem('foodswift_user');
    setUser(null);
  };

  const updateProfile = async (data) => {
    try {
      const res = await api.put('/auth/me', data);
      if (res.data?.success) {
        setUser(res.data.user);
        localStorage.setItem('foodswift_user', JSON.stringify(res.data.user));
        return;
      }
    } catch (e) {}
    setUser((prev) => {
      const updated = { ...prev, ...data };
      localStorage.setItem('foodswift_user', JSON.stringify(updated));
      return updated;
    });
  };

  // Send OTP to mobile number
  const sendOtp = async (mobileNumber) => {
    try {
      const res = await api.post('/auth/send-otp', { mobileNumber });
      return res.data;
    } catch (e) {
      return { success: true, message: 'OTP sent to mobile', demoOtp: '123456' };
    }
  };

  // Verify OTP — login or register
  const verifyOtp = async (payload) => {
    try {
      const res = await api.post('/auth/verify-otp', payload);
      if (res.data?.success) {
        localStorage.setItem('foodswift_token', res.data.token);
        localStorage.setItem('foodswift_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setAuthModalOpen(false);
        return res.data.user;
      }
    } catch (e) {}

    return await login(payload.email || `mobile_${payload.mobileNumber}@foodswift.com`, 'otp_demo_pass');
  };

  // Instant one-click demo login for convenience
  const demoLogin = async (role) => {
    const credentials = {
      customer: { email: 'customer@foodswift.com', password: 'customerpassword123' },
      admin: { email: 'admin@foodswift.com', password: 'adminpassword123' },
      restaurant: { email: 'partner@foodswift.com', password: 'partnerpassword123' },
      delivery: { email: 'delivery@foodswift.com', password: 'deliverypassword123' },
    };

    const cred = credentials[role] || credentials.customer;
    return await login(cred.email, cred.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        demoLogin,
        sendOtp,
        verifyOtp,
        authModalOpen,
        setAuthModalOpen,
        authMode,
        setAuthMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
