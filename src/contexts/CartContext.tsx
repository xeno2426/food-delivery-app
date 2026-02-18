import { createContext, useContext, type ReactNode } from 'react';
import { useCart } from '@/hooks/useCart';
import type { CartItem, MenuItem, Addon } from '@/types';

interface CartContextType {
  cartItems: CartItem[];
  restaurantId: string | null;
  addToCart: (menuItem: MenuItem, quantity?: number, specialInstructions?: string, selectedAddons?: Addon[]) => boolean;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useCart();

  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
