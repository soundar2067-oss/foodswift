import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  // Fetch current user on mount if token exists
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('foodswift_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        localStorage.removeItem('foodswift_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('foodswift_token', res.data.token);
      setUser(res.data.user);
      setAuthModalOpen(false);
      return res.data.user;
    }
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      localStorage.setItem('foodswift_token', res.data.token);
      setUser(res.data.user);
      setAuthModalOpen(false);
      return res.data.user;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // silent
    }
    localStorage.removeItem('foodswift_token');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/me', data);
    if (res.data.success) {
      setUser(res.data.user);
    }
  };

  // Send OTP to mobile number (demo: OTP returned in response)
  const sendOtp = async (mobileNumber) => {
    const res = await api.post('/auth/send-otp', { mobileNumber });
    return res.data; // { success, message, demoOtp }
  };

  // Verify OTP — login or register
  const verifyOtp = async (payload) => {
    const res = await api.post('/auth/verify-otp', payload);
    if (res.data.success) {
      localStorage.setItem('foodswift_token', res.data.token);
      setUser(res.data.user);
      setAuthModalOpen(false);
      return res.data.user;
    }
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
