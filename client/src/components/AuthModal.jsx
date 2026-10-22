import React, { useState, useEffect, useRef } from 'react';
import {
  X, Lock, Mail, User, Phone, Shield, ChevronDown,
  MessageSquare, RefreshCcw, CheckCircle2, ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── OTP Input ────────────────────────────────────────────────────────────────
function OtpInput({ value, onChange }) {
  const inputs = useRef([]);

  const handleChange = (index, val) => {
    const digits = value.split('');
    digits[index] = val.replace(/\D/, '').slice(-1);
    const next = digits.join('');
    onChange(next);
    if (val && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex justify-center space-x-2" onPaste={handlePaste}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-11 h-12 text-center text-lg font-extrabold bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-orange-50 transition-all"
        />
      ))}
    </div>
  );
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function Countdown({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { clearInterval(id); onExpire(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return (
    <span className={`font-mono font-bold ${remaining < 30 ? 'text-rose-500' : 'text-slate-600'}`}>
      {m}:{s.toString().padStart(2, '0')}
    </span>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function AuthModal() {
  const navigate = useNavigate();
  const { authModalOpen, setAuthModalOpen, authMode, setAuthMode, login, register, demoLogin, sendOtp, verifyOtp } = useAuth();

  // Tabs: 'email' or 'otp'
  const [loginTab, setLoginTab] = useState('email');

  // Email/password fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dietaryPreference, setDietaryPreference] = useState('any');

  // OTP flow state
  const [otpStep, setOtpStep] = useState(1); // 1 = enter mobile, 2 = enter OTP
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpired, setOtpExpired] = useState(false);
  const [countdownKey, setCountdownKey] = useState(0);

  // Register OTP sub-step fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDietary, setRegDietary] = useState('any');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreatorLogin, setShowCreatorLogin] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') setAuthModalOpen(false); };
    if (authModalOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authModalOpen, setAuthModalOpen]);

  // Reset state when modal opens/mode changes
  useEffect(() => {
    setErrorMsg(''); setSuccessMsg(''); setLoading(false);
    setOtpStep(1); setOtp(''); setDemoOtp(''); setOtpSent(false); setOtpExpired(false);
    setLoginTab('email');
  }, [authMode, authModalOpen]);

  if (!authModalOpen) return null;

  const handleRoleRedirect = (user) => {
    if (!user) return;
    if (user.role === 'admin') navigate('/admin');
    else if (user.role === 'restaurant') navigate('/partner');
    else if (user.role === 'delivery') navigate('/delivery');
  };

  // ── Email + Password Login / Register ──────────────────────────────────────
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); setLoading(true);
    try {
      let loggedUser;
      if (authMode === 'login') {
        loggedUser = await login(email, password);
      } else {
        loggedUser = await register({ name, email, password, phone, dietaryPreference });
      }
      handleRoleRedirect(loggedUser);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Authentication failed. Please verify details.');
    } finally {
      setLoading(false);
    }
  };

  // ── Send OTP ───────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    const digits = mobile.replace(/\D/g, '');
    if (digits.length !== 10) {
      setErrorMsg('Enter a valid 10-digit mobile number.'); return;
    }
    setErrorMsg(''); setLoading(true);
    try {
      const data = await sendOtp(mobile);
      if (data.success) {
        setDemoOtp(data.demoOtp || '');
        setOtpSent(true); setOtpExpired(false);
        setOtpStep(2); setOtp('');
        setCountdownKey((k) => k + 1);
        setSuccessMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP (login mode) ────────────────────────────────────────────────
  const handleOtpLogin = async () => {
    if (otp.length !== 6) { setErrorMsg('Enter the 6-digit OTP.'); return; }
    setErrorMsg(''); setLoading(true);
    try {
      const loggedUser = await verifyOtp({ mobileNumber: mobile, otp });
      handleRoleRedirect(loggedUser);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP (register mode) ─────────────────────────────────────────────
  const handleOtpRegister = async () => {
    if (otp.length !== 6) { setErrorMsg('Enter the 6-digit OTP.'); return; }
    if (!regName || !regEmail || !regPassword) {
      setErrorMsg('Please fill in all registration fields.'); return;
    }
    setErrorMsg(''); setLoading(true);
    try {
      const loggedUser = await verifyOtp({
        mobileNumber: mobile, otp,
        name: regName, email: regEmail, password: regPassword, dietaryPreference: regDietary,
      });
      handleRoleRedirect(loggedUser);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Demo login ─────────────────────────────────────────────────────────────
  const handleDemoClick = async (role) => {
    setErrorMsg(''); setLoading(true);
    try {
      const loggedUser = await demoLogin(role);
      handleRoleRedirect(loggedUser);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  // ── UI helpers ─────────────────────────────────────────────────────────────
  const isLoginMode = authMode === 'login';

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) setAuthModalOpen(false); }}
      className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-black/60 backdrop-blur-sm flex min-h-screen items-center justify-center animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 my-auto max-h-[92vh] overflow-y-auto overscroll-contain">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-black text-2xl text-slate-900 tracking-tight">
              {isLoginMode ? 'Welcome Back!' : 'Join FoodSwift'}
            </h3>
            <p className="text-xs text-slate-500">
              {isLoginMode
                ? 'Sign in to order delicious food across Salem'
                : 'Create an account to track orders & save addresses'}
            </p>
          </div>
          <button onClick={() => setAuthModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sign In / Create Account Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button type="button" onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${isLoginMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
            Sign In
          </button>
          <button type="button" onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${!isLoginMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
            Create Account
          </button>
        </div>

        {/* Error / Success banners */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">{errorMsg}</div>
        )}
        {successMsg && !errorMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">{successMsg}</div>
        )}

        {/* ── LOGIN MODE ──────────────────────────────────────────────────────── */}
        {isLoginMode && (
          <>
            {/* Email / OTP sub-tabs */}
            <div className="flex bg-slate-50 border border-slate-200 p-1 rounded-xl text-xs font-bold">
              <button type="button" onClick={() => { setLoginTab('email'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${loginTab === 'email' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <Mail className="w-3.5 h-3.5" /><span>Email & Password</span>
              </button>
              <button type="button" onClick={() => { setLoginTab('otp'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${loginTab === 'otp' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <Phone className="w-3.5 h-3.5" /><span>Mobile OTP</span>
              </button>
            </div>

            {/* Email login form */}
            {loginTab === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 rounded-2xl shadow-md transition-all text-sm uppercase tracking-wider cursor-pointer disabled:opacity-50">
                  {loading ? 'Signing in...' : 'Sign In to FoodSwift'}
                </button>
              </form>
            )}

            {/* OTP login flow */}
            {loginTab === 'otp' && (
              <div className="space-y-4">
                {otpStep === 1 && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                      <div className="flex space-x-2">
                        <div className="bg-slate-100 border border-slate-200 rounded-xl px-3 flex items-center text-xs font-bold text-slate-600 whitespace-nowrap">
                          🇮🇳 +91
                        </div>
                        <input type="tel" inputMode="numeric" maxLength={10} placeholder="9842100000" value={mobile}
                          onChange={(e) => { setMobile(e.target.value.replace(/\D/g, '')); setErrorMsg(''); }}
                          className="flex-1 bg-slate-50 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 font-mono tracking-widest" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Enter the number linked to your FoodSwift account.</p>
                    </div>
                    <button type="button" onClick={handleSendOtp} disabled={loading || mobile.replace(/\D/g,'').length !== 10}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3 rounded-2xl shadow-md transition-all text-sm uppercase tracking-wider cursor-pointer disabled:opacity-40">
                      {loading ? 'Sending OTP...' : 'Send OTP →'}
                    </button>
                  </>
                )}

                {otpStep === 2 && (
                  <>
                    <div className="text-center space-y-1">
                      <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                        <MessageSquare className="w-6 h-6 text-emerald-600" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">OTP Sent!</p>
                      <p className="text-xs text-slate-500">Sent to <span className="font-bold">+91 {mobile.slice(0,5)}XXXXX</span></p>
                    </div>

                    {demoOtp && (
                      <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-center">
                        <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Demo Mode — Your OTP</div>
                        <div className="text-3xl font-black text-amber-800 tracking-[0.4em] mt-1">{demoOtp}</div>
                        <div className="text-[10px] text-amber-600 mt-0.5">In production this is sent via SMS</div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-3 text-center">Enter 6-digit OTP</label>
                      <OtpInput value={otp} onChange={setOtp} />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="text-slate-500">
                        {otpExpired ? (
                          <span className="text-rose-500 font-bold">OTP expired</span>
                        ) : (
                          <span>Expires in <Countdown key={countdownKey} seconds={300} onExpire={() => setOtpExpired(true)} /></span>
                        )}
                      </div>
                      <button type="button" onClick={() => { setOtpStep(1); setOtp(''); setDemoOtp(''); setOtpExpired(false); setSuccessMsg(''); }}
                        className="flex items-center space-x-1 text-orange-600 font-bold hover:text-orange-700 cursor-pointer">
                        <RefreshCcw className="w-3 h-3" /><span>Resend OTP</span>
                      </button>
                    </div>

                    <button type="button" onClick={handleOtpLogin} disabled={loading || otp.length !== 6 || otpExpired}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 rounded-2xl shadow-md transition-all text-sm uppercase tracking-wider cursor-pointer disabled:opacity-40">
                      {loading ? 'Verifying...' : 'Verify & Sign In'}
                    </button>

                    <button type="button" onClick={() => { setOtpStep(1); setOtp(''); setErrorMsg(''); setSuccessMsg(''); }}
                      className="w-full flex items-center justify-center space-x-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer">
                      <ArrowLeft className="w-3.5 h-3.5" /><span>Change number</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* ── REGISTER MODE ────────────────────────────────────────────────────── */}
        {!isLoginMode && (
          <>
            {/* Register sub-tabs */}
            <div className="flex bg-slate-50 border border-slate-200 p-1 rounded-xl text-xs font-bold">
              <button type="button" onClick={() => { setLoginTab('email'); setErrorMsg(''); setSuccessMsg(''); setOtpStep(1); }}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${loginTab === 'email' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <Mail className="w-3.5 h-3.5" /><span>Email Sign Up</span>
              </button>
              <button type="button" onClick={() => { setLoginTab('otp'); setErrorMsg(''); setSuccessMsg(''); setOtpStep(1); }}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${loginTab === 'otp' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <Phone className="w-3.5 h-3.5" /><span>Mobile OTP</span>
              </button>
            </div>

            {/* Email register form */}
            {loginTab === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input type="text" required placeholder="e.g. Ramesh Kumar" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input type="password" required placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (optional)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input type="tel" placeholder="+91 98421 XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dietary Preference</label>
                  <select value={dietaryPreference} onChange={(e) => setDietaryPreference(e.target.value)}
                    className="w-full bg-slate-50 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500">
                    <option value="any">Any (Veg & Non-Veg)</option>
                    <option value="veg">Pure Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                    <option value="halal">Halal</option>
                  </select>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 rounded-2xl shadow-md transition-all text-sm uppercase tracking-wider cursor-pointer disabled:opacity-50">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}

            {/* OTP register flow */}
            {loginTab === 'otp' && (
              <div className="space-y-4">
                {/* Step 1: Mobile + account details */}
                {otpStep === 1 && (
                  <>
                    <p className="text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-xl p-3">
                      📱 Enter your mobile number. We'll send an OTP to verify and create your account.
                    </p>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input type="text" required placeholder="e.g. Ramesh Kumar" value={regName} onChange={(e) => setRegName(e.target.value)}
                          className="w-full bg-slate-50 text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input type="email" required placeholder="name@example.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full bg-slate-50 text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input type="password" required placeholder="Min 6 characters" value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full bg-slate-50 text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                      <div className="flex space-x-2">
                        <div className="bg-slate-100 border border-slate-200 rounded-xl px-3 flex items-center text-xs font-bold text-slate-600 whitespace-nowrap">
                          🇮🇳 +91
                        </div>
                        <input type="tel" inputMode="numeric" maxLength={10} placeholder="9842100000" value={mobile}
                          onChange={(e) => { setMobile(e.target.value.replace(/\D/g, '')); setErrorMsg(''); }}
                          className="flex-1 bg-slate-50 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 font-mono tracking-widest" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Dietary Preference</label>
                      <select value={regDietary} onChange={(e) => setRegDietary(e.target.value)}
                        className="w-full bg-slate-50 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500">
                        <option value="any">Any (Veg & Non-Veg)</option>
                        <option value="veg">Pure Vegetarian</option>
                        <option value="non-veg">Non-Vegetarian</option>
                        <option value="halal">Halal</option>
                      </select>
                    </div>
                    <button type="button" onClick={handleSendOtp}
                      disabled={loading || mobile.replace(/\D/g,'').length !== 10 || !regName || !regEmail || !regPassword}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3 rounded-2xl shadow-md transition-all text-sm uppercase tracking-wider cursor-pointer disabled:opacity-40">
                      {loading ? 'Sending OTP...' : 'Send OTP to Verify →'}
                    </button>
                  </>
                )}

                {/* Step 2: Enter OTP */}
                {otpStep === 2 && (
                  <>
                    <div className="text-center space-y-1">
                      <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                        <MessageSquare className="w-6 h-6 text-emerald-600" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">Verify Your Mobile</p>
                      <p className="text-xs text-slate-500">OTP sent to <span className="font-bold">+91 {mobile.slice(0,5)}XXXXX</span></p>
                    </div>

                    {demoOtp && (
                      <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-center">
                        <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Demo Mode — Your OTP</div>
                        <div className="text-3xl font-black text-amber-800 tracking-[0.4em] mt-1">{demoOtp}</div>
                        <div className="text-[10px] text-amber-600 mt-0.5">In production this is sent via SMS</div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-3 text-center">Enter 6-digit OTP</label>
                      <OtpInput value={otp} onChange={setOtp} />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="text-slate-500">
                        {otpExpired ? (
                          <span className="text-rose-500 font-bold">OTP expired</span>
                        ) : (
                          <span>Expires in <Countdown key={countdownKey} seconds={300} onExpire={() => setOtpExpired(true)} /></span>
                        )}
                      </div>
                      <button type="button" onClick={() => { setOtpStep(1); setOtp(''); setDemoOtp(''); setOtpExpired(false); setSuccessMsg(''); }}
                        className="flex items-center space-x-1 text-orange-600 font-bold hover:text-orange-700 cursor-pointer">
                        <RefreshCcw className="w-3 h-3" /><span>Resend OTP</span>
                      </button>
                    </div>

                    <button type="button" onClick={handleOtpRegister} disabled={loading || otp.length !== 6 || otpExpired}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 rounded-2xl shadow-md transition-all text-sm uppercase tracking-wider cursor-pointer disabled:opacity-40">
                      {loading ? 'Creating Account...' : '✓ Verify & Create Account'}
                    </button>

                    <button type="button" onClick={() => { setOtpStep(1); setOtp(''); setErrorMsg(''); setSuccessMsg(''); }}
                      className="w-full flex items-center justify-center space-x-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer">
                      <ArrowLeft className="w-3.5 h-3.5" /><span>Go back</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Website Creator / Admin Quick Access ───────────────────────────── */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <button type="button" onClick={() => setShowCreatorLogin(!showCreatorLogin)}
            className="text-[11px] font-semibold text-slate-400 hover:text-purple-600 transition-colors inline-flex items-center space-x-1 cursor-pointer">
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
                <span className="text-[9px] font-bold uppercase tracking-wider bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded">Admin Only</span>
              </div>
              <p className="text-[11px] text-purple-700 leading-tight">
                Instant 1-click authentication reserved for the website creator / platform admin.
              </p>
              <button type="button" onClick={() => handleDemoClick('admin')}
                className="w-full py-2.5 px-3 bg-white hover:bg-purple-100/70 border border-purple-300 rounded-xl text-xs font-bold text-purple-950 transition-colors cursor-pointer flex items-center justify-between shadow-2xs">
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
      </div>
    </div>
  );
}
