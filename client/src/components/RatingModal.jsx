import React, { useState } from 'react';
import { Star, X, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function RatingModal({ isOpen, onClose, restaurant, orderId, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !restaurant) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/reviews', {
        restaurantId: restaurant._id,
        orderId,
        rating,
        comment,
      });
      setSuccess(true);
      setTimeout(() => {
        if (onReviewSubmitted) onReviewSubmitted();
        onClose();
      }, 1200);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-extrabold text-lg text-slate-900">
            Rate {restaurant.name}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-2 text-emerald-600">
            <CheckCircle2 className="w-12 h-12 mx-auto" />
            <h4 className="font-bold text-base">Thank you for your rating!</h4>
            <p className="text-xs text-slate-500">Your feedback helps fellow food lovers in Salem.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star selector */}
            <div className="flex flex-col items-center justify-center py-3 space-y-2">
              <span className="text-xs font-semibold text-slate-500">How was your meal?</span>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm font-bold text-slate-700">
                {rating === 5 && 'Outstanding! 🌟'}
                {rating === 4 && 'Very Good! 😊'}
                {rating === 3 && 'Average 🙂'}
                {rating === 2 && 'Below Expectation 🙁'}
                {rating === 1 && 'Poor 😞'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Review (Optional)
              </label>
              <textarea
                rows="3"
                placeholder="Tell us what you liked about the food, taste, packaging or delivery in Salem..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-slate-50 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-extrabold py-3 rounded-2xl shadow-md transition-all text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
