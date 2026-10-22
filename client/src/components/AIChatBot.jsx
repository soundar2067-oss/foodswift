import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  X,
  Send,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Tag,
  Clock,
  RotateCcw,
  Plus,
  Minimize2,
  CheckCircle2,
  UtensilsCrossed,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function AIChatBot() {
  const navigate = useNavigate();
  const { addItem, setCartDrawerOpen, applyCoupon } = useCart();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'bot',
      text: "Vanakkam! 🙏 I'm **SwiftBot**, your Salem AI Food Concierge. Ask me for recommendations, cravings, iconic Salem specialties like Thattuvadai Sets, or track your orders!",
      quickReplies: [
        'Top Biryani in Salem',
        'Salem Thattuvadai Sets',
        'Pure Veg in Fairlands',
        'Show Active Coupons',
        'Where is my order?',
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-ai-chat', handleOpenChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenChat);
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const message = textToSend || inputText;
    if (!message || message.trim() === '') return;

    const userMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: message,
    };

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
          text: "I'm having a brief connection hiccup. Please ask me again or browse Salem's 200+ restaurants directly!",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddFoodFromChat = async (food) => {
    await addItem({
      foodItem: food,
      quantity: 1,
    });
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

  return (
    <>
      {/* Floating Widget Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-40">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center space-x-2.5 bg-gradient-to-r from-orange-500 via-brand-600 to-amber-600 hover:from-brand-600 hover:to-orange-600 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl hover:shadow-brand-500/50 hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-white/40"
            title="Chat with SwiftBot AI Assistant"
          >
            <div className="relative">
              <Bot className="w-6 h-6 animate-bounce" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-brand-600 rounded-full" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-extrabold text-xs tracking-tight leading-none">SwiftBot AI</span>
              <span className="text-[10px] text-orange-100 font-semibold mt-0.5">Salem Food Guide</span>
            </div>
            <Sparkles className="w-4 h-4 text-amber-300 hidden sm:inline" />
          </button>
        </div>
      )}

      {/* Main Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-orange-400 flex items-center justify-center text-white shadow-md relative">
                <Bot className="w-5 h-5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-extrabold text-sm tracking-tight">SwiftBot AI</h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-brand-500/30 text-brand-300 px-1.5 py-0.5 rounded">
                    Salem 24/7
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">Your Personal Food Assistant</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: 'welcome_1',
                      sender: 'bot',
                      text: "Vanakkam! 🙏 I'm **SwiftBot**, your Salem AI Food Concierge. Ask me for recommendations, cravings, iconic Salem specialties like Thattuvadai Sets, or track your orders!",
                      quickReplies: [
                        'Top Biryani in Salem',
                        'Salem Thattuvadai Sets',
                        'Pure Veg in Fairlands',
                        'Show Active Coupons',
                      ],
                    },
                  ])
                }
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Reset Chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Message Bubble */}
                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-br-xs shadow-xs font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
                </div>

                {/* Embedded Active Order Card */}
                {msg.orderInfo && (
                  <div className="mt-2 w-full bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-brand-600 bg-orange-50 px-2 py-0.5 rounded">
                        {msg.orderInfo.orderNumber}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {msg.orderInfo.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800">
                      Bill Total: ₹{msg.orderInfo.totalAmount}
                    </div>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/orders/${msg.orderInfo._id}/tracking`);
                      }}
                      className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-1.5 rounded-xl text-[11px] shadow-xs cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <span>Open Live Salem Map Tracking</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Embedded Food Dishes with 1-Click Add to Cart */}
                {msg.recommendedFoods && msg.recommendedFoods.length > 0 && (
                  <div className="mt-2 w-full space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Recommended Dishes (1-Click Add):
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.recommendedFoods.map((food) => (
                        <div
                          key={food._id}
                          className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 hover:border-brand-300 transition-colors"
                        >
                          <div className="flex items-center space-x-2.5 truncate flex-1">
                            <img
                              src={
                                food.imageUrl ||
                                (food.isVeg
                                  ? 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=100'
                                  : 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100')
                              }
                              alt={food.name}
                              className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                            />
                            <div className="truncate">
                              <div className="flex items-center space-x-1">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    food.isVeg ? 'bg-emerald-600' : 'bg-rose-700'
                                  }`}
                                />
                                <span className="font-bold text-slate-900 text-xs truncate">
                                  {food.name}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                ₹{food.price} • {food.restaurant?.name || 'Salem Spot'}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleAddFoodFromChat(food)}
                            className="bg-brand-50 hover:bg-brand-600 text-brand-600 hover:text-white border border-brand-200 font-extrabold text-[10px] uppercase px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-0.5 flex-shrink-0"
                          >
                            <Plus className="w-3 h-3" />
                            <span>ADD</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Embedded Salem Restaurants */}
                {msg.recommendedRestaurants && msg.recommendedRestaurants.length > 0 && (
                  <div className="mt-2 w-full space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Top Salem Restaurants:
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.recommendedRestaurants.map((r) => (
                        <div
                          key={r._id}
                          onClick={() => {
                            setIsOpen(false);
                            navigate(`/restaurant/${r.slug || r._id}`);
                          }}
                          className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 hover:border-brand-500 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center space-x-2.5 truncate">
                            <img
                              src={r.bannerUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100'}
                              alt={r.name}
                              className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                            />
                            <div className="truncate">
                              <div className="font-bold text-slate-900 text-xs truncate">
                                {r.name}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {r.locality}, Salem • {r.rating} ★
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-brand-600 flex items-center space-x-1 flex-shrink-0">
                            <span>Menu</span>
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Embedded Active Promo Coupons */}
                {msg.coupons && msg.coupons.length > 0 && (
                  <div className="mt-2 w-full grid grid-cols-1 gap-1.5">
                    {msg.coupons.map((c) => (
                      <div
                        key={c._id}
                        className="bg-orange-50 border border-orange-200 p-2.5 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <span className="font-extrabold text-brand-700 text-xs block">
                            {c.code}
                          </span>
                          <span className="text-[10px] text-slate-600">{c.title}</span>
                        </div>
                        <button
                          onClick={() => handleApplyCouponFromChat(c.code)}
                          className="bg-brand-600 text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-lg cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Reply Pills */}
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {msg.quickReplies.map((reply) => (
                      <button
                        key={reply}
                        onClick={() => handleSendMessage(reply)}
                        className="bg-white hover:bg-orange-50 text-slate-700 hover:text-brand-600 border border-slate-200 hover:border-brand-300 font-semibold text-[10px] px-2.5 py-1 rounded-full shadow-2xs transition-colors cursor-pointer"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-1.5 bg-white border border-slate-200 p-3 rounded-2xl w-24">
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" />
                <span
                  className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
                <span
                  className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask for dishes, best places, or offers in Salem..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-50 text-xs pl-3.5 pr-2 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white p-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
