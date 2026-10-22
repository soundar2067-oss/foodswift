import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CreditCard, Truck, MapPin, Phone, Ticket, ShoppingBag, CheckCircle } from 'lucide-react';

const Checkout = ({ setActivePage, setSelectedOrder }) => {
  const { user, apiUrl, getAuthHeaders } = useAuth();
  const { cartItems, getSubtotal, clearCart, restaurantId, formatPrice } = useCart();

  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subtotal = getSubtotal();
  const deliveryFee = 2.99;
  const discountAmount = (subtotal * discount);
  const total = Math.max(0, subtotal + deliveryFee - discountAmount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponApplied(false);
    setDiscount(0);

    const code = couponCode.trim().toUpperCase();
    if (code === 'SWIFT50' || code === 'FAST50') {
      setDiscount(0.5); // 50% discount
      setCouponApplied(true);
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      setLoading(false);
      return;
    }

    if (!address) {
      setError('Please provide a delivery address');
      setLoading(false);
      return;
    }

    if (!phone) {
      setError('Please provide a contact phone number');
      setLoading(false);
      return;
    }

    // Build items payload
    const orderItems = cartItems.map((item) => ({
      foodItem: item.foodItem,
      quantity: item.quantity,
    }));

    try {
      const response = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          restaurantId,
          orderItems,
          shippingAddress: address,
          phone,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      clearCart();
      setSelectedOrder(data.data);
      setActivePage('orders');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '30px' }}>Secure Checkout</h1>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {/* Delivery Details Form (Left) */}
        <div style={{ flex: '2 1 500px' }}>
          <form onSubmit={handlePlaceOrder}>
            <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                Delivery Information
              </h2>

              <div className="form-group">
                <label className="form-label">Delivery Address</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <MapPin size={18} />
                  </span>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="E.g., 742 Evergreen Terrace, Springfield"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <Phone size={18} />
                  </span>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="E.g., 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-lg)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                Payment Method
              </h2>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                {['Card', 'Cash on Delivery'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      flex: 1,
                      padding: '20px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid',
                      borderColor: paymentMethod === method ? 'var(--primary)' : 'var(--border-color)',
                      backgroundColor: paymentMethod === method ? 'rgba(255, 110, 48, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      color: paymentMethod === method ? 'var(--text-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 600,
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    {method === 'Card' ? <CreditCard size={24} color={paymentMethod === 'Card' ? 'var(--primary)' : 'var(--text-muted)'} /> : <Truck size={24} color={paymentMethod === 'Cash on Delivery' ? 'var(--primary)' : 'var(--text-muted)'} />}
                    <span>{method}</span>
                  </button>
                ))}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '12px', textAlign: 'center' }}>
                {paymentMethod === 'Card' ? '💳 Card payments are simulated automatically. No real cards required.' : '🛵 Pay cash directly to the driver when your food arrives.'}
              </p>
            </div>
          </form>
        </div>

        {/* Order Summary (Right) */}
        <div style={{ flex: '1 1 350px' }}>
          <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              Order Summary
            </h2>

            {/* Cart Items List */}
            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cartItems.map((item) => (
                <div key={item.foodItem} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {item.quantity}x {item.name}
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Application */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Ticket size={16} />
                </span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="E.g., SWIFT50"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{ paddingLeft: '36px', height: '36px', fontSize: '0.85rem' }}
                />
              </div>
              <button type="submit" className="btn btn-secondary" style={{ padding: '0 16px', height: '36px', fontSize: '0.85rem' }}>
                Apply
              </button>
            </form>

            {couponError && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500 }}>⚠️ {couponError}</span>
            )}
            {couponApplied && (
              <span style={{ color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', gap: '4px', alignItems: 'center' }}>
                <CheckCircle size={14} /> Coupon applied! 50% discount saved.
              </span>
            )}

            {/* Price Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--secondary)' }}>
                  <span>Discount (50%)</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Delivery Fee</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', borderTop: '1px dashed var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button 
              onClick={handlePlaceOrder}
              disabled={loading}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px', marginTop: '10px' }}
            >
              {loading ? 'Processing Order...' : 'Confirm & Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
