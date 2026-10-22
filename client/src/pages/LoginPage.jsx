import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, User, Phone, Sparkles, UtensilsCrossed, ShieldCheck, Bike, ArrowRight, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ initialMode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, register, demoLogin } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const isDirectCreator = searchParams.get('admin') === 'true' || searchParams.get('creator') === 'true';
  // Where to go after login (support ?next= param from CustomerRoute redirect)
  const nextPath = searchParams.get('next') || '/';

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dietaryPreference, setDietaryPreference] = useState('any');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreatorLogin, setShowCreatorLogin] = useState(isDirectCreator);

  // If already logged in, redirect based on role
  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'restaurant') navigate('/partner');
      else if (user.role === 'delivery') navigate('/delivery');
      else navigate(nextPath);
    }
  }, [user, navigate]);

  const handleRoleRedirect = (userObj) => {
    if (!userObj) return;
    if (userObj.role === 'admin') navigate('/admin');
    else if (userObj.role === 'restaurant') navigate('/partner');
    else if (userObj.role === 'delivery') navigate('/delivery');
    else navigate(nextPath); // go back to the page they wanted
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      let loggedUser;
      if (mode === 'login') {
        loggedUser = await login(email, password);
      } else {
        loggedUser = await register({ name, email, password, phone, dietaryPreference });
      }
      handleRoleRedirect(loggedUser);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role) => {
    setErrorMsg('');
    setLoading(true);
    try {
      const loggedUser = await demoLogin(role);
      handleRoleRedirect(loggedUser);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 flex flex-col justify-center items-center">
      {/* Brand Logo Header */}
      <div className="text-center mb-6 space-y-1">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-orange-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span className="font-black text-2xl tracking-tight text-slate-900">
            FOOD<span className="text-brand-600">SWIFT</span>
          </span>
        </Link>
        <p className="text-xs text-slate-500">Salem's Premier Fast Food Delivery Network</p>
      </div>

      {/* Main Login Card with smooth scrolling support */}
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-xl border border-slate-200/80 space-y-6">
        <div>
          <h2 className="font-black text-2xl text-slate-900 tracking-tight">
            {mode === 'login' ? 'Sign In to Your Account' : 'Create FoodSwift Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? 'Access 200+ top Salem restaurants, order tracking & coupons'
              : 'Join thousands of Salem food lovers and track live orders'}
          </p>
        </div>

        {/* Mode Switch Pills */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="+91 98421 XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dietary Preference</label>
                <select
                  value={dietaryPreference}
                  onChange={(e) => setDietaryPreference(e.target.value)}
                  className="w-full bg-slate-50 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 cursor-pointer"
                >
                  <option value="any">Any (Veg & Non-Veg)</option>
                  <option value="veg">Pure Vegetarian</option>
                  <option value="non-veg">Non-Vegetarian</option>
                  <option value="halal">Halal</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-2xl shadow-lg transition-all text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to FoodSwift' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Website Creator / Admin Quick Access */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => setShowCreatorLogin(!showCreatorLogin)}
            className="text-[11px] font-semibold text-slate-400 hover:text-purple-600 transition-colors inline-flex items-center space-x-1 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-purple-500" />
            <span>Website Creator & Admin Access</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showCreatorLogin ? 'rotate-180' : ''}`} />
          </button>

          {showCreatorLogin && (
            <div className="mt-2.5 p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50/60 rounded-2xl border border-purple-200 text-left space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs font-bold text-purple-950">
                <span className="flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span>Website Creator / Administrator</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded">
                  Admin Only
                </span>
              </div>
              <p className="text-[11px] text-purple-700 leading-tight">
                Instant 1-click authentication reserved for the website creator / platform admin.
              </p>
              <button
                type="button"
                onClick={() => handleDemoClick('admin')}
                className="w-full py-2.5 px-3 bg-white hover:bg-purple-100/70 border border-purple-300 rounded-xl text-xs font-bold text-purple-950 transition-colors cursor-pointer flex items-center justify-between shadow-2xs"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-base">🛡️</span>
                  <div>
                    <div className="font-extrabold text-slate-900">Admin Login (Website Creator)</div>
                    <span className="text-[10px] text-purple-600 font-mono font-normal">admin@foodswift.com</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-600 text-white px-2.5 py-1 rounded-lg">
                  Instant Login →
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="text-center text-[11px] text-slate-400">
          <span>By signing in, you agree to FoodSwift's Terms of Service & Privacy Policy in Salem.</span>
        </div>
      </div>
    </div>
  );
}
