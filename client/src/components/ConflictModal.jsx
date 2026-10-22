import React from 'react';
import { AlertCircle, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ConflictModal() {
  const { conflictModal, resolveConflict } = useCart();

  if (!conflictModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h3 className="font-extrabold text-xl text-slate-900">
          Replace Cart Items?
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed">
          Your cart currently contains dishes from <strong className="text-slate-800">{conflictModal.currentRestaurantName}</strong>.
          FoodSwift orders from one restaurant at a time to guarantee swift delivery and hot food in Salem.
        </p>

        <p className="text-xs text-slate-400 font-medium">
          Do you want to discard your previous items and start a fresh cart with this restaurant?
        </p>

        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={() => resolveConflict(false)}
            className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Keep Previous Cart
          </button>
          <button
            onClick={() => resolveConflict(true)}
            className="flex-1 py-3 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all cursor-pointer flex items-center justify-center space-x-1"
          >
            <span>Start Fresh</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
