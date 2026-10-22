import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Requires login — redirects to /login with ?next= if unauthenticated.
// Once logged in, redirects non-customer roles to their portal.
export function CustomerRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  // Not logged in → send to login page, remember where they were going
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  // Wrong role → redirect to their own portal
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'restaurant') return <Navigate to="/partner" replace />;
  if (user.role === 'delivery') return <Navigate to="/delivery" replace />;
  return children;
}

// Only allows specific roles
export function RoleRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
