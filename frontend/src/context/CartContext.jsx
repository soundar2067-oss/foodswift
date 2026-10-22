import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [currency, setCurrency] = useState('USD'); // Default is USD

  // Load cart and currency from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('foodswift_cart');
    const storedRestaurantId = localStorage.getItem('foodswift_cart_restaurant');
    const storedCurrency = localStorage.getItem('foodswift_currency');

    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (err) {
        localStorage.removeItem('foodswift_cart');
      }
    }
    if (storedRestaurantId) {
      setRestaurantId(storedRestaurantId);
    }
    if (storedCurrency) {
      setCurrency(storedCurrency);
    }
  }, []);

  // Sync cart to localStorage
  const saveCart = (items, restId) => {
    setCartItems(items);
    setRestaurantId(restId);
    localStorage.setItem('foodswift_cart', JSON.stringify(items));
    if (restId) {
      localStorage.setItem('foodswift_cart_restaurant', restId);
    } else {
      localStorage.removeItem('foodswift_cart_restaurant');
    }
  };

  // Change currency setting
  const updateCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('foodswift_currency', newCurrency);
  };

  // Price formatter helper
  const formatPrice = (usdPrice) => {
    const price = Number(usdPrice) || 0;
    if (currency === 'INR') {
      const inrPrice = Math.round(price * 83);
      return `₹${inrPrice.toLocaleString('en-IN')}`;
    }
    return `$${price.toFixed(2)}`;
  };

  // Add Item to Cart
  const addToCart = (foodItem, currentRestaurantId) => {
    if (cartItems.length === 0) {
      const updatedCart = [{ ...foodItem, quantity: 1 }];
      saveCart(updatedCart, currentRestaurantId);
      return { success: true };
    }

    if (restaurantId && restaurantId !== currentRestaurantId) {
      return {
        success: false,
        message: 'You can only order from one restaurant at a time. Please clear your cart first.',
      };
    }

    const itemExists = cartItems.find((item) => item.foodItem === foodItem.foodItem);

    let updatedCart;
    if (itemExists) {
      updatedCart = cartItems.map((item) =>
        item.foodItem === foodItem.foodItem
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...cartItems, { ...foodItem, quantity: 1 }];
    }

    saveCart(updatedCart, currentRestaurantId);
    return { success: true };
  };

  // Remove Item from Cart
  const removeFromCart = (foodItemId) => {
    const updatedCart = cartItems.filter((item) => item.foodItem !== foodItemId);
    const newRestaurantId = updatedCart.length === 0 ? null : restaurantId;
    saveCart(updatedCart, newRestaurantId);
  };

  // Update Quantity
  const updateQuantity = (foodItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(foodItemId);
      return;
    }
    const updatedCart = cartItems.map((item) =>
      item.foodItem === foodItemId ? { ...item, quantity: newQty } : item
    );
    saveCart(updatedCart, restaurantId);
  };

  // Clear Cart
  const clearCart = () => {
    saveCart([], null);
  };

  // Calculate totals
  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        restaurantId,
        currency,
        updateCurrency,
        formatPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getSubtotal,
        cartCount: cartItems.reduce((count, item) => count + item.quantity, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
