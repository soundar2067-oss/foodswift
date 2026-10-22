import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, MapPin, Phone, Mail, Heart, ShieldCheck } from 'lucide-react';
import { salemLocalitiesList } from '../context/LocationContext';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-24 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-orange-400 flex items-center justify-center text-white shadow-md">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">FOODSWIFT</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Tamil Nadu's premier online food delivery network connecting you with top local favorites, iconic messes, biryani joints, and pure veg tiffin centers across Chennai, Coimbatore, Madurai, Salem, and overall Tamil Nadu.
            </p>
            <div className="flex items-center space-x-4 text-xs text-slate-400 pt-2">
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span>Tamil Nadu, India</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Hygienic Delivery</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Discover</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/restaurants" className="hover:text-white transition-colors">Restaurants in Tamil Nadu</Link></li>
              <li><Link to="/restaurants?vegOnly=true" className="hover:text-white transition-colors">Pure Vegetarian</Link></li>
              <li><Link to="/search?q=Biryani" className="hover:text-white transition-colors">Tamil Nadu Biryani Centers</Link></li>
              <li><Link to="/search?q=Parotta" className="hover:text-white transition-colors">Madurai Bun Parotta & Meals</Link></li>
              <li><Link to="/restaurants?offers=true" className="hover:text-white transition-colors">Deals & Coupons</Link></li>
            </ul>
          </div>

          {/* Partner & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Portals & Help</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/partner" className="hover:text-white transition-colors">Restaurant Partner Hub</Link></li>
              <li><Link to="/delivery" className="hover:text-white transition-colors">Delivery Fleet Portal</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Admin Governance</Link></li>
              <li><Link to="/account" className="hover:text-white transition-colors">Help & Order Support</Link></li>
              <li><a href="mailto:support@foodswift.com" className="hover:text-white transition-colors">support@foodswift.com</a></li>
            </ul>
          </div>

          {/* Tamil Nadu Coverage Areas */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Tamil Nadu Hubs</h4>
            <div className="flex flex-wrap gap-1.5">
              {['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Tiruppur', 'Thanjavur', 'Dindigul', 'Hosur'].map((city) => (
                <span
                  key={city}
                  className="text-[11px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} FOODSWIFT Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for Salem, Tamil Nadu</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
