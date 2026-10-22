import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, X, Send, Bot, Sparkles, ShoppingCart } from 'lucide-react';

const AIChatbot = ({ setActivePage, setSelectedRestaurant }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hello! Welcome to FoodSwift's AI Assistant. How can I help you satisfy your cravings today?", time: new Date() },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { user, apiUrl } = useAuth();
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { sender: 'user', text: inputText, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      let reply = "";
      const text = userMsg.text.toLowerCase();
      const userName = user ? user.name.split(' ')[0] : 'Guest';

      if (!user) {
        reply = "I noticed you aren't signed in yet. Please register or log in first so I can access our premium restaurant menus and check orders for you!";
      } else {
        if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
          reply = `Hello, ${userName}! Glad to chat with you. I can recommend some tasty cuisines (Indian, Italian, Chinese), check your active orders, or share special discount coupons. What are you in the mood for?`;
        } else if (text.includes('order') || text.includes('status') || text.includes('track')) {
          reply = `Sure thing, ${userName}! You can check your full order history in the 'My Orders' tab in the navbar. Currently, our delivery partners are fast-tracking all orders to arrive within 30 minutes!`;
        } else if (text.includes('coupon') || text.includes('offer') || text.includes('discount') || text.includes('code')) {
          reply = "You're in luck! Use code 'SWIFT50' at checkout to get a massive 50% discount (up to $15 or ₹1200) on your order today!";
        } else if (text.includes('indian') || text.includes('curry') || text.includes('naan') || text.includes('paneer') || text.includes('chicken')) {
          reply = `Mmm, Indian food is an excellent choice! I highly recommend the Butter Naan paired with Butter Chicken or Paneer Butter Masala from 'Royal Taj' or 'Spice Route'. You can click 'Indian' cuisine on the homepage to explore!`;
        } else if (text.includes('pizza') || text.includes('italian') || text.includes('pasta')) {
          reply = `Italian cravings! Check out 'Pizza Planet' for a Veggie Pizza Supreme or 'Pasta Palace' for Penne Alfredo. Just head over to our 'Italian' cuisine page on the home filters!`;
        } else if (text.includes('burger') || text.includes('fries') || text.includes('american')) {
          reply = `Burger time! You can grab a Double Bacon Cheeseburger and Loaded Waffle Fries from 'Burger Bite' or 'Slider Station'. They are delicious and cook fresh!`;
        } else if (text.includes('chinese') || text.includes('noodle') || text.includes('momo') || text.includes('rice')) {
          reply = `Chinese cravings are best satisfied at 'Wok & Roll' or 'Golden Dragon'. Try the Hakka Noodles or Signature Kung Pao Chicken!`;
        } else if (text.includes('price') || text.includes('currency') || text.includes('dollar') || text.includes('rupee')) {
          reply = "We support both Indian Rupees (₹) and US Dollars ($)! You can switch your preferred currency in the top bar above the navbar anytime.";
        } else if (text.includes('recommend') || text.includes('best') || text.includes('food')) {
          reply = `Hey ${userName}, our top-selling dishes are: Pizza Supreme, Loaded Waffle Fries, Hakka Noodles, and Paneer Tikka. Tell me what type of food you like (spicy, sweet, healthy) and I'll narrow it down!`;
        } else if (text.includes('thank')) {
          reply = "You're very welcome! Enjoy your meal, and feel free to ask me anything else.";
        } else {
          reply = `I'm on it, ${userName}! I searched our menu of 2,400 items. Let me know if you want to order Indian curries, Pizzas, Burgers, or Sushi. I can also help you checkout or suggest coupons!`;
        }
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: reply, time: new Date() }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary) 0%, #ff8c5a 100%)',
          color: 'white',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(255, 110, 48, 0.4)',
          cursor: 'pointer',
          zIndex: 999,
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
        className="btn-chat-trigger"
        title="Chat with AI Assistant"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            background: 'var(--secondary)',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            border: '2px solid white',
            animation: 'pulse-live 2s infinite'
          }}></span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '380px',
            height: '500px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 999,
            border: '1px solid var(--border-color)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
            maxWidth: 'calc(100vw - 48px)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(255, 110, 48, 0.15) 0%, rgba(22, 26, 36, 0.8) 100%)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'var(--primary)', padding: '6px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} color="white" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  FoodSwift Bot <Sparkles size={12} color="var(--accent)" />
                </h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="pulse-badge"></span> Online & Active
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: 'rgba(11, 12, 14, 0.4)',
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: msg.sender === 'user' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                    fontSize: '0.85rem',
                    lineHeight: 1.4,
                  }}
                >
                  <p style={{ margin: 0 }}>{msg.text}</p>
                  <span
                    style={{
                      display: 'block',
                      textAlign: 'right',
                      fontSize: '0.65rem',
                      color: msg.sender === 'user' ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-muted)',
                      marginTop: '4px',
                    }}
                  >
                    {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '14px 14px 14px 2px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                  }}
                >
                  <span className="dot-typing"></span>
                  <span className="dot-typing"></span>
                  <span className="dot-typing"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '12px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-dark)',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              type="text"
              placeholder="Ask for food, coupons, or order status..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '8px 12px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '36px',
                height: '36px',
                padding: 0,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
