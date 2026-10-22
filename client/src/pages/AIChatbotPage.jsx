import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Plus,
  MessageSquare,
  MapPin,
  Tag,
  Clock,
  Search,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const QUICK_STARTS = [
  { icon: '🍖', label: 'Top Biryani in Salem', query: 'Top Biryani in Salem' },
  { icon: '🥗', label: 'Pure Veg Restaurants', query: 'Pure Veg restaurants in Salem' },
  { icon: '🏷️', label: 'Active Coupons', query: 'Show Active Coupons' },
  { icon: '📍', label: 'Restaurants in Fairlands', query: 'Restaurants in Fairlands' },
  { icon: '💰', label: 'Food under ₹150', query: 'food under 150' },
  { icon: '🛵', label: 'Track my order', query: 'Where is my order?' },
];

const BOT_FEATURES = [
  { icon: '🔍', title: 'Smart Food Search', desc: 'Find any dish across 200+ Salem restaurants' },
  { icon: '📍', title: 'Locality Filter', desc: 'Filter by Fairlands, Suramangalam, Gugai & more' },
  { icon: '🛒', title: '1-Click Add to Cart', desc: 'Add recommended dishes directly from chat' },
  { icon: '📦', title: 'Order Tracking', desc: 'Track your active Salem order in real-time' },
  { icon: '🏷️', title: 'Live Coupons', desc: 'Get and apply active promo codes instantly' },
  { icon: '🤖', title: '24/7 AI Assistant', desc: 'Always available for Salem food queries' },
];

export default function AIChatbotPage() {
  const navigate = useNavigate();
  const { addItem, setCartDrawerOpen, applyCoupon } = useCart();
  const { user } = useAuth();

  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'bot',
      text: "Vanakkam! 🙏 I'm **SwiftBot**, your Salem AI Food Concierge. I can help you discover top restaurants, track orders, find deals, and add food directly to your cart. What are you craving today?",
      quickReplies: ['Top Biryani in Salem', 'Salem Thattuvadai Sets', 'Pure Veg in Fairlands', 'Show Active Coupons'],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFeatures, setShowFeatures] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const message = textToSend || inputText;
    if (!message || message.trim() === '') return;
    setShowFeatures(false);

    const userMessage = { id: 'user_' + Date.now(), sender: 'user', text: message };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await api.post('/ai/chat', { message });
      if (res.data.success) {
        const botMessage = {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: res.data.message,
          recommendedFoods: res.data.recommendedFoods || [],
          recommendedRestaurants: res.data.recommendedRestaurants || [],
          orderInfo: res.data.orderInfo,
          coupons: res.data.coupons || [],
          quickReplies: res.data.quickReplies || [],
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot_err_' + Date.now(),
          sender: 'bot',
          text: "I'm having a brief connection hiccup. Please try asking me again!",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddFoodFromChat = async (food) => {
    await addItem({ foodItem: food, quantity: 1 });
    setCartDrawerOpen(true);
  };

  const handleApplyCouponFromChat = async (code) => {
    const res = await applyCoupon(code);
    if (res?.success) {
      alert(`Coupon ${code} applied successfully!`);
      setCartDrawerOpen(true);
    } else {
      alert(res?.message || 'Could not apply coupon');
    }
  };

  const handleReset = () => {
    setMessages([{
      id: 'welcome_' + Date.now(),
      sender: 'bot',
      text: "Vanakkam! 🙏 I'm **SwiftBot**, your Salem AI Food Concierge. What are you craving today?",
      quickReplies: ['Top Biryani in Salem', 'Salem Thattuvadai Sets', 'Pure Veg in Fairlands', 'Show Active Coupons'],
    }]);
    setShowFeatures(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Page Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center shadow-xl">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-black tracking-tight">SwiftBot AI</h1>
              <p className="text-sm text-slate-300">Salem's 24/7 Food Intelligence Assistant</p>
            </div>
          </div>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Ask me anything about Salem food — I'll find the best dishes, restaurants, ongoing deals, and even track your order live!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {['🍖 Biryani', '🥗 Pure Veg', '🍕 Pizza', '🏷️ Coupons', '📦 Track Order', '💰 Budget Meals'].map((tag) => (
              <span key={tag} className="text-xs bg-white/10 text-slate-200 px-3 py-1 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid (shown until first message) */}
      {showFeatures && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BOT_FEATURES.map((f) => (
              <div key={f.title} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-2xl">{f.icon}</span>
                <div className="font-bold text-slate-900 text-xs">{f.title}</div>
                <div className="text-[11px] text-slate-500">{f.desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Start — Ask me:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUICK_STARTS.map((q) => (
                <button
                  key={q.query}
                  onClick={() => handleSendMessage(q.query)}
                  className="flex items-center space-x-2 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 p-3 rounded-xl text-xs font-semibold text-slate-700 hover:text-brand-600 transition-colors cursor-pointer text-left"
                >
                  <span className="text-base">{q.icon}</span>
                  <span>{q.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pb-32">
        <div className="space-y-5 py-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              {/* Sender label */}
              <div className={`flex items-center space-x-1.5 mb-1 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <span className="text-[10px] font-semibold text-slate-400">
                  {msg.sender === 'bot' ? 'SwiftBot' : user?.name?.split(' ')[0] || 'You'}
                </span>
              </div>

              {/* Message Bubble */}
              <div className={`p-4 rounded-2xl max-w-[85%] sm:max-w-[70%] leading-relaxed text-sm ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-br-none shadow-sm'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
              </div>

              {/* Order Info Card */}
              {msg.orderInfo && (
                <div className="mt-2 w-full max-w-[85%] sm:max-w-[70%] bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{msg.orderInfo.orderNumber}</span>
                    <span className="text-xs font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {msg.orderInfo.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-800">Total: ₹{msg.orderInfo.totalAmount}</div>
                  <button
                    onClick={() => navigate(`/orders/${msg.orderInfo._id}/tracking`)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1"
                  >
                    <span>Live Track Order</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Food Cards */}
              {msg.recommendedFoods && msg.recommendedFoods.length > 0 && (
                <div className="mt-2 w-full max-w-[85%] sm:max-w-lg space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recommended Dishes:</div>
                  {msg.recommendedFoods.map((food) => (
                    <div key={food._id} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 hover:border-orange-300 transition-colors">
                      <div className="flex items-center space-x-3 truncate flex-1">
                        <img
                          src={food.imageUrl || (food.isVeg ? 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=100' : 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100')}
                          alt={food.name}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="truncate">
                          <div className="flex items-center space-x-1.5">
                            <span className={`w-2 h-2 rounded-full ${food.isVeg ? 'bg-emerald-600' : 'bg-rose-700'}`} />
                            <span className="font-bold text-slate-900 text-sm truncate">{food.name}</span>
                          </div>
                          <div className="text-xs text-slate-500">₹{food.price} • {food.restaurant?.name || 'Salem Restaurant'}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddFoodFromChat(food)}
                        className="bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white border border-orange-200 font-extrabold text-xs uppercase px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1 flex-shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Restaurant Cards */}
              {msg.recommendedRestaurants && msg.recommendedRestaurants.length > 0 && (
                <div className="mt-2 w-full max-w-[85%] sm:max-w-lg space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Top Salem Restaurants:</div>
                  {msg.recommendedRestaurants.map((r) => (
                    <div
                      key={r._id}
                      onClick={() => navigate(`/restaurant/${r.slug || r._id}`)}
                      className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 hover:border-orange-500 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <img
                          src={r.bannerUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100'}
                          alt={r.name}
                          className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="truncate">
                          <div className="font-bold text-slate-900 text-sm truncate">{r.name}</div>
                          <div className="text-xs text-slate-400">{r.locality}, Salem • {r.rating} ★</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-orange-600 flex items-center space-x-1 flex-shrink-0">
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Coupon Cards */}
              {msg.coupons && msg.coupons.length > 0 && (
                <div className="mt-2 w-full max-w-[85%] sm:max-w-lg space-y-2">
                  {msg.coupons.map((c) => (
                    <div key={c._id} className="bg-orange-50 border border-orange-200 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-orange-700 text-sm block">{c.code}</span>
                        <span className="text-xs text-slate-600">{c.title}</span>
                      </div>
                      <button
                        onClick={() => handleApplyCouponFromChat(c.code)}
                        className="bg-orange-600 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-lg cursor-pointer hover:bg-orange-700"
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Replies */}
              {msg.quickReplies && msg.quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {msg.quickReplies.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => handleSendMessage(reply)}
                      className="bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200 hover:border-orange-300 font-semibold text-xs px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center space-x-1.5 bg-white border border-slate-200 px-4 py-3 rounded-2xl w-24 shadow-xs">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Bottom Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex items-center space-x-2"
          >
            <button
              type="button"
              onClick={handleReset}
              title="Reset chat"
              className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex-shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask SwiftBot anything about Salem food..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-50 text-sm pl-4 pr-3 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 text-white p-3 rounded-2xl shadow-sm transition-all cursor-pointer flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
