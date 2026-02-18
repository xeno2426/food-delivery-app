import { useState, useEffect, useCallback } from 'react';
import type { CartItem, MenuItem, Addon } from '@/types';

const CART_STORAGE_KEY = 'food_delivery_cart';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      setCartItems(parsed.items || []);
      setRestaurantId(parsed.restaurantId || null);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: cartItems, restaurantId }));
  }, [cartItems, restaurantId]);

  const addToCart = useCallback((menuItem: MenuItem, quantity: number = 1, specialInstructions: string = '', selectedAddons: Addon[] = []) => {
    // If cart is empty or from same restaurant, allow adding
    if (cartItems.length === 0 || restaurantId === menuItem.restaurantId) {
      setRestaurantId(menuItem.restaurantId);
      
      setCartItems((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.menuItem.id === menuItem.id && 
                   item.specialInstructions === specialInstructions &&
                   JSON.stringify(item.selectedAddons) === JSON.stringify(selectedAddons)
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex].quantity += quantity;
          return updated;
        }

        return [...prev, { menuItem, quantity, specialInstructions, selectedAddons }];
      });
      return true;
    }
    return false; // Different restaurant - need to clear cart first
  }, [cartItems, restaurantId]);

  const removeFromCart = useCallback((index: number) => {
    setCartItems((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      if (updated.length === 0) {
        setRestaurantId(null);
      }
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCartItems((prev) => {
      const updated = [...prev];
      updated[index].quantity = quantity;
      return updated;
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setRestaurantId(null);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const addonsTotal = item.selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
      return total + (item.menuItem.price + addonsTotal) * item.quantity;
    }, 0);
  }, [cartItems]);

  const getItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  return {
    cartItems,
    restaurantId,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemCount,
  };
};
