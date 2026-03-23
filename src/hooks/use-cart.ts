"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Cart } from "@/types";

interface CartStore extends Cart {
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
  isInCart: (productId: string) => boolean;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      updatedAt: Date.now(),

      addItem: (item: CartItem) => {
        const { items } = get();
        
        // Check if item already in cart (shouldn't happen for unique items, but safety check)
        if (items.some((i) => i.productId === item.productId)) {
          return;
        }

        set({
          items: [...items, item],
          updatedAt: Date.now(),
        });
      },

      removeItem: (productId: string) => {
        const { items } = get();
        set({
          items: items.filter((i) => i.productId !== productId),
          updatedAt: Date.now(),
        });
      },

      clearCart: () => {
        set({
          items: [],
          updatedAt: Date.now(),
        });
      },

      getItemCount: () => {
        return get().items.length;
      },

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price, 0);
      },

      isInCart: (productId: string) => {
        return get().items.some((i) => i.productId === productId);
      },
    }),
    {
      name: "thrift-store-cart",
      // Only run on client side
      skipHydration: true,
    }
  )
);
