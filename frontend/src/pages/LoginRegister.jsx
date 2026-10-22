import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChefHat, Mail, Lock, User as UserIcon, MapPin, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react';

const LoginRegister = ({ setActivePage, redirectMessage, setRedirectMessage }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('customer');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    // Clear redirect message when submitting
    if (setRedirectMessage) setRedirectMessage('');

    if (isLogin) {
      const res = await login(emailOrPhone, password);
      setLoading(false);
      if (res.success) {
        setActivePage('home');
      } else {
        setFormError(res.message || 'Login failed');
      }
    } else {
      if (password.length < 6) {
        setFormError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      const res = await register({ 
        name, 
        emailOrPhone, 
        password, 
        role, 
        address: role === 'customer' ? address : '' 
      });
      setLoading(false);
      if (res.success) {
        if (role === 'admin') {
          setActivePage('admin');
        } else if (role === 'delivery') {
          setActivePage('delivery');
        } else {
          setActivePage('home');
        }
      } else {
        setFormError(res.message || 'Registration failed');
      }
    }
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setFormError('');
    if (setRedirectMessage) setRedirectMessage('');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 70px)',
      padding: '40px 24px',
    }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          borderRadius: 'var(--radius-lg)',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ background: 'var(--primary)', padding: '12px', borderRadius: '14px', display: 'inline-flex', marginBottom: '12px' }}>
            <ChefHat size={32} color="white" />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px', textAlign: 'center' }}>
            {isLogin ? 'Log in to place orders and track food' : 'Join FoodSwift to browse and order 2,400+ delicacies'}
          </p>
        </div>

        {/* Warning Redirect Message */}
        {redirectMessage && (
          <div style={{
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            color: 'var(--accent)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '0.85rem',
            textAlign: 'center',
            fontWeight: 600
          }}>
            ⚠️ {redirectMessage}
          </div>
        )}

        {/* Error message */}
        {formError && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '0.85rem',
            textAlign: 'center',
            fontWeight: 500
          }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              {/* Name */}
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <UserIcon size={18} />
                  </span>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="John Doe" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="form-group">
                <label className="form-label">I want to join as</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  {['customer', 'admin', 'delivery'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid',
                        borderColor: role === r ? 'var(--primary)' : 'var(--border-color)',
                        backgroundColor: role === r ? 'rgba(255, 110, 48, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                        color: role === r ? 'var(--primary)' : 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      {r === 'admin' ? 'Merchant' : r}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Email or Phone */}
          <div className="form-group">
            <label className="form-label">Email or Phone Number</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Mail size={18} />
              </span>
              <input 
                type="text" 
                className="form-control" 
                placeholder="email@example.com or 9876543210" 
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={18} />
              </span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-control" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '44px', paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isLogin && role === 'customer' && (
            <>
              {/* Address */}
              <div className="form-group">
                <label className="form-label">Delivery Address</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <MapPin size={18} />
                  </span>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="123 Main St, Apartment 4" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', padding: '14px', marginTop: '10px' }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={handleToggle}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 600,
                cursor: 'pointer',
                marginLeft: '6px'
              }}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </span>
        </div>

        {/* Demo Credentials Box */}
        <div style={{
          marginTop: '32px',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed var(--border-color)',
          fontSize: '0.8rem'
        }}>
          <h4 style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>💡 Quick Testing Logins:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-muted)' }}>
            <div>👨‍💻 <strong>Customer:</strong> <span style={{ color: 'var(--text-primary)' }}>customer@foodswift.com</span> / password: <span style={{ color: 'var(--text-primary)' }}>customer123</span></div>
            <div>🍕 <strong>Merchant (Admin):</strong> <span style={{ color: 'var(--text-primary)' }}>Soundararaj@foodswift.com</span> / password: <span style={{ color: 'var(--text-primary)' }}>Soundararaj123</span></div>
            <div>🛵 <strong>Delivery Partner:</strong> <span style={{ color: 'var(--text-primary)' }}>driver@foodswift.com</span> / password: <span style={{ color: 'var(--text-primary)' }}>driver123</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
