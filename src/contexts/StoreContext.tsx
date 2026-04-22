import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Product } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color?: string;
}

interface StoreContextType {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (product: Product, size: string, color?: string) => void;
  removeFromCart: (productId: string, size: string, color?: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number, color?: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  cartTotal: number;
  cartCount: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Track auth state for wishlist persistence
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Load wishlist from DB when user signs in; clear when they sign out
  useEffect(() => {
    if (!userId) { setWishlist([]); return; }
    supabase.from("wishlist_items").select("product_id").eq("user_id", userId).then(({ data }) => {
      setWishlist((data || []).map((r: any) => r.product_id));
    });
  }, [userId]);

  const addToCart = useCallback((product: Product, size: string, color?: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.size === size && i.color === color);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id && i.size === size && i.color === color
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1, size, color }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, size: string, color?: string) => {
    setCart(prev => prev.filter(i => !(i.product.id === productId && i.size === size && i.color === color)));
  }, []);

  const updateQuantity = useCallback((productId: string, size: string, quantity: number, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart(prev =>
      prev.map(i =>
        i.product.id === productId && i.size === size && i.color === color ? { ...i, quantity } : i
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist(prev => {
      const has = prev.includes(productId);
      const next = has ? prev.filter(id => id !== productId) : [...prev, productId];
      // Persist to DB if signed in (fire-and-forget; only for valid UUIDs)
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
      if (userId && isUuid) {
        if (has) {
          supabase.from("wishlist_items").delete().eq("user_id", userId).eq("product_id", productId).then(() => {});
        } else {
          supabase.from("wishlist_items").insert({ user_id: userId, product_id: productId }).then(() => {});
        }
      }
      return next;
    });
  }, [userId]);

  const isInWishlist = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <StoreContext.Provider
      value={{ cart, wishlist, addToCart, removeFromCart, updateQuantity, clearCart, toggleWishlist, isInWishlist, cartTotal, cartCount }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
