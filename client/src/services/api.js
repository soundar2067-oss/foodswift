import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach token from localStorage if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('foodswift_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // Do not clear immediately on login failure
      if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/partner')) {
        // preserve context if needed
      }
    }
    return Promise.reject(error);
  }
);

export default api;
