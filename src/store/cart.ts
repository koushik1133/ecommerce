"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LogoPlacement } from "@/lib/products";

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  color: string;
  colorHex: string;
  size: string;
  quantity: number;
  logoId?: string;
  logoLabel?: string;
  logoPlacement?: LogoPlacement;
  customLogoDataUrl?: string;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "key" | "quantity"> & { quantity?: number }) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
};

function makeKey(item: {
  productId: string;
  color: string;
  size: string;
  logoId?: string;
  logoPlacement?: string;
  customLogoDataUrl?: string;
}) {
  return [
    item.productId,
    item.color,
    item.size,
    item.logoId ?? "none",
    item.logoPlacement ?? "none",
    item.customLogoDataUrl ? "custom" : "preset",
  ].join("::");
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      addItem: (item) => {
        const key = makeKey(item);
        const quantity = item.quantity ?? 1;
        set((state) => {
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, quantity: i.quantity + quantity } : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { ...item, key, quantity }],
            isOpen: true,
          };
        });
      },
      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      updateQuantity: (key, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.key !== key)
              : state.items.map((i) => (i.key === key ? { ...i, quantity } : i)),
        })),
      clearCart: () => set({ items: [] }),
      itemCount: () => get().items.reduce((n, i) => n + i.quantity, 0),
      subtotal: () => get().items.reduce((n, i) => n + i.price * i.quantity, 0),
    }),
    { name: "brand-cart-v2", partialize: (state) => ({ items: state.items }) }
  )
);
