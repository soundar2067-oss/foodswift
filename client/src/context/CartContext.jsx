import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    restaurant: null,
    subtotal: 0,
    deliveryFee: 35,
    tax: 0,
    platformFee: 5,
    discount: 0,
    tip: 0,
    finalTotal: 0,
    coupon: null,
  });
  const [loading, setLoading] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [conflictModal, setConflictModal] = useState({
    isOpen: false,
    pendingItem: null,
    currentRestaurantName: '',
  });

  // Fetch cart from server whenever user is logged in
  useEffect(() => {
    if (user) {
      fetchServerCart();
    } else {
      // Load guest cart from localStorage
      const saved = localStorage.getItem('foodswift_guest_cart');
      if (saved) {
        try {
          setCart(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, [user]);

  // Persist guest cart
  useEffect(() => {
    if (!user) {
      localStorage.setItem('foodswift_guest_cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  const fetchServerCart = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success && res.data.data) {
        setCart(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch cart:', e);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async ({ foodItem, quantity = 1, portionSize = 'Standard', addOns = [], forceClear = false }) => {
    if (user) {
      try {
        setLoading(true);
        const res = await api.post('/cart/items', {
          foodItemId: foodItem._id,
          quantity,
          portionSize,
          addOns,
          forceClear,
        });

        if (res.data.success) {
          setCart(res.data.data);
          setCartDrawerOpen(true);
          return { success: true };
        }
      } catch (err) {
        if (err.response && err.response.status === 409 && err.response.data.conflict) {
          // Restaurant conflict modal
          setConflictModal({
            isOpen: true,
            pendingItem: { foodItem, quantity, portionSize, addOns },
            currentRestaurantName: err.response.data.currentRestaurant || 'another restaurant',
          });
          return { conflict: true };
        }
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      // Guest cart handling
      const targetRestId = foodItem.restaurant?._id || foodItem.restaurant;
      if (cart.items.length > 0 && cart.restaurant && cart.restaurant._id !== targetRestId && !forceClear) {
        setConflictModal({
          isOpen: true,
          pendingItem: { foodItem, quantity, portionSize, addOns },
          currentRestaurantName: cart.restaurant.name || 'another restaurant',
        });
        return { conflict: true };
      }

      let newItems = forceClear ? [] : [...cart.items];
      const existingIdx = newItems.findIndex((i) => i.foodItem === foodItem._id && i.portionSize === portionSize);

      const unitPrice = foodItem.discountPrice || foodItem.price;
      const addOnsTotal = addOns.reduce((acc, a) => acc + (a.price || 0), 0);
      const itemPrice = unitPrice + addOnsTotal;

      if (existingIdx > -1) {
        newItems[existingIdx].quantity += quantity;
        newItems[existingIdx].itemTotal = newItems[existingIdx].price * newItems[existingIdx].quantity;
      } else {
        newItems.push({
          _id: 'guest_item_' + Date.now(),
          foodItem: foodItem._id,
          name: foodItem.name,
          price: itemPrice,
          quantity,
          imageUrl: foodItem.imageUrl,
          isVeg: foodItem.isVeg,
          portionSize,
          addOns,
          itemTotal: itemPrice * quantity,
        });
      }

      const subtotal = newItems.reduce((acc, i) => acc + i.itemTotal, 0);
      const deliveryFee = 35;
      const tax = Math.round(subtotal * 0.05);
      const platformFee = 5;
      const finalTotal = subtotal + deliveryFee + tax + platformFee;

      const updatedCart = {
        items: newItems,
        restaurant: foodItem.restaurant,
        subtotal,
        deliveryFee,
        tax,
        platformFee,
        discount: 0,
        tip: 0,
        finalTotal,
        coupon: null,
      };

      setCart(updatedCart);
      setCartDrawerOpen(true);
      return { success: true };
    }
  };

  const updateQuantity = async (itemId, newQty) => {
    if (user) {
      const res = await api.patch(`/cart/items/${itemId}`, { quantity: newQty });
      if (res.data.success) {
        setCart(res.data.data);
      }
    } else {
      let newItems = [...cart.items];
      const idx = newItems.findIndex((i) => i._id === itemId);
      if (idx > -1) {
        if (newQty <= 0) {
          newItems.splice(idx, 1);
        } else {
          newItems[idx].quantity = newQty;
          newItems[idx].itemTotal = newItems[idx].price * newQty;
        }
      }

      if (newItems.length === 0) {
        clearCart();
        return;
      }

      const subtotal = newItems.reduce((acc, i) => acc + i.itemTotal, 0);
      const tax = Math.round(subtotal * 0.05);
      const finalTotal = Math.max(0, subtotal + cart.deliveryFee + tax + cart.platformFee - (cart.discount || 0));

      setCart({
        ...cart,
        items: newItems,
        subtotal,
        tax,
        finalTotal,
      });
    }
  };

  const removeItem = async (itemId) => {
    await updateQuantity(itemId, 0);
  };

  const clearCart = async () => {
    if (user) {
      await api.delete('/cart');
    }
    setCart({
      items: [],
      restaurant: null,
      subtotal: 0,
      deliveryFee: 35,
      tax: 0,
      platformFee: 5,
      discount: 0,
      tip: 0,
      finalTotal: 0,
      coupon: null,
    });
    localStorage.removeItem('foodswift_guest_cart');
  };

  const applyCoupon = async (code) => {
    if (!code) return;
    try {
      const res = await api.post('/coupons/validate', {
        code,
        subtotal: cart.subtotal,
        restaurantId: cart.restaurant?._id || cart.restaurant,
      });

      if (res.data.success) {
        const { discount, coupon: validatedCoupon } = res.data.data;
        const newTotal = Math.max(0, cart.subtotal + cart.deliveryFee + cart.tax + cart.platformFee + (cart.tip || 0) - res.data.data.discount);
        setCart((prev) => ({
          ...prev,
          discount: res.data.data.discount,
          coupon: res.data.data,
          finalTotal: newTotal,
        }));
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid coupon code',
      };
    }
  };

  const setTip = (amount) => {
    const newTotal = Math.max(0, cart.subtotal + cart.deliveryFee + cart.tax + cart.platformFee + Number(amount) - (cart.discount || 0));
    setCart((prev) => ({
      ...prev,
      tip: Number(amount),
      finalTotal: newTotal,
    }));
  };

  const resolveConflict = async (proceed) => {
    if (proceed && conflictModal.pendingItem) {
      await addItem({ ...conflictModal.pendingItem, forceClear: true });
    }
    setConflictModal({ isOpen: false, pendingItem: null, currentRestaurantName: '' });
  };

  const itemCount = cart.items.reduce((acc, i) => acc + (i.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        loading,
        cartDrawerOpen,
        setCartDrawerOpen,
        conflictModal,
        resolveConflict,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        setTip,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
