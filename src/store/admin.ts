"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/products";
import { products as CATALOG } from "@/lib/products";
import type { Order, Customer, OrderStatus } from "@/lib/admin-data";
import { SEED_ORDERS, SEED_CUSTOMERS } from "@/lib/admin-data";

// ─── Products Store ───────────────────────────────────────────────────────────
type ProductsState = {
  products: Product[];
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
};

export const useAdminProducts = create<ProductsState>()(
  persist(
    (set, get) => ({
      products: CATALOG,
      addProduct: (p) =>
        set((s) => ({
          products: [
            ...s.products,
            { ...p, id: String(Date.now()) },
          ],
        })),
      updateProduct: (id, patch) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
      duplicateProduct: (id) => {
        const product = get().products.find((p) => p.id === id);
        if (!product) return;
        set((s) => ({
          products: [
            ...s.products,
            { ...product, id: String(Date.now()), name: product.name + " (Copy)", slug: product.slug + "-copy" },
          ],
        }));
      },
    }),
    { name: "admin-products-v5" }
  )
);

// ─── Orders Store ─────────────────────────────────────────────────────────────
type OrdersState = {
  orders: Order[];
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  addOrder: (order: Order) => void;
};

export const useAdminOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: SEED_ORDERS,
      updateOrderStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
          ),
        })),
      addOrder: (order) =>
        set((s) => ({
          orders: [order, ...s.orders],
        })),
    }),
    { name: "admin-orders-v2" }
  )
);

// ─── Customers Store ──────────────────────────────────────────────────────────
type CustomersState = {
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
};

export const useAdminCustomers = create<CustomersState>()(
  persist(
    (set) => ({
      customers: SEED_CUSTOMERS,
      addCustomer: (customer) =>
        set((s) => {
          const existing = s.customers.find((c) => c.email === customer.email);
          if (existing) {
            return {
              customers: s.customers.map((c) =>
                c.email === customer.email
                  ? {
                      ...c,
                      totalOrders: c.totalOrders + customer.totalOrders,
                      totalSpend: c.totalSpend + customer.totalSpend,
                      lastOrderAt: customer.lastOrderAt,
                    }
                  : c
              ),
            };
          }
          return { customers: [customer, ...s.customers] };
        }),
    }),
    { name: "admin-customers-v2" }
  )
);

// ─── UI State (not persisted) ─────────────────────────────────────────────────
type AdminUIState = {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
};

export const useAdminUI = create<AdminUIState>()((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
}));

// ─── Settings Store ───────────────────────────────────────────────────────────
export type AdminSettings = {
  storeName: string;
  storeEmail: string;
  currency: string;
  timezone: string;
  shippingFlat: number;
  freeShippingThreshold: number;
  codEnabled: boolean;
  upiEnabled: boolean;
  cardEnabled: boolean;
  orderNotifications: boolean;
  lowStockAlerts: boolean;
  newsletterSignups: boolean;
};

const DEFAULT_SETTINGS: AdminSettings = {
  storeName: "brand",
  storeEmail: "hello@brand.in",
  currency: "INR",
  timezone: "Asia/Kolkata",
  shippingFlat: 79,
  freeShippingThreshold: 1999,
  codEnabled: true,
  upiEnabled: true,
  cardEnabled: true,
  orderNotifications: true,
  lowStockAlerts: false,
  newsletterSignups: true,
};

type SettingsState = {
  settings: AdminSettings;
  updateSettings: (patch: Partial<AdminSettings>) => void;
};

export const useAdminSettings = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (patch) =>
        set((s) => ({
          settings: { ...s.settings, ...patch },
        })),
    }),
    { name: "admin-settings-v2" }
  )
);
