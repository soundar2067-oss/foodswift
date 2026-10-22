import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose, setActivePage }) => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getSubtotal, formatPrice } = useCart();
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    if (!user) {
      setActivePage('login');
    } else {
      setActivePage('checkout');
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 200,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div 
        className="slide-in-drawer glass-panel"
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
          borderLeft: '1px solid var(--border-color)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Your Cart</h3>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            style={{ padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {cartItems.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              <ShoppingBag size={64} style={{ marginBottom: '16px', opacity: 0.3 }} />
              <p style={{ fontWeight: 500 }}>Your cart is empty</p>
              <button 
                className="btn btn-primary" 
                onClick={onClose} 
                style={{ marginTop: '16px', padding: '8px 20px' }}
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cartItems.map((item) => (
                <div 
                  key={item.foodItem} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px' }}>{item.name}</h4>
                    <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                      {formatPrice(item.price)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', padding: '2px' }}>
                      <button 
                        onClick={() => updateQuantity(item.foodItem, item.quantity - 1)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ width: '24px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.foodItem, item.quantity + 1)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.foodItem)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                {formatPrice(getSubtotal())}
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={clearCart} 
                style={{ flex: 1, display: 'flex', gap: '6px' }}
              >
                Clear Cart
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleCheckout} 
                style={{ flex: 2 }}
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
