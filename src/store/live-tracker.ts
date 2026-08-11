"use client";

import { create } from "zustand";

export type VisitorSession = {
  id: string;
  ip: string;
  location: {
    city: string;
    country: string;
    flag: string;
    code: string;
  };
  page: string;
  pageTitle: string;
  device: {
    type: "desktop" | "mobile" | "tablet";
    browser: string;
    os: string;
  };
  action: string;
  activeGarment?: string;
  cartCount: number;
  cartTotal: number;
  startedAt: number;
  lastActive: number;
  avatarColor: string;
};

export type LiveEvent = {
  id: string;
  sessionId: string;
  location: string;
  flag: string;
  type: "page_view" | "3d_rotate" | "color_change" | "logo_upload" | "add_to_cart" | "checkout_start";
  description: string;
  timestamp: number;
};

export type LivePromoAlert = {
  id: string;
  message: string;
  code: string;
  discount: string;
  timestamp: number;
};

type LiveTrackerStore = {
  sessions: VisitorSession[];
  events: LiveEvent[];
  activePromoAlert: LivePromoAlert | null;
  isLoading: boolean;

  // Actions
  fetchRealTelemetry: () => Promise<void>;
  sendPromoAlert: (message: string, code: string, discount: string) => void;
  clearPromoAlert: () => void;
};

export const useLiveTracker = create<LiveTrackerStore>((set, get) => ({
  sessions: [],
  events: [],
  activePromoAlert: null,
  isLoading: false,

  fetchRealTelemetry: async () => {
    try {
      const res = await fetch("/api/live-visitors", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.success) {
        set({
          sessions: data.sessions || [],
          events: data.events || [],
          isLoading: false,
        });
      }
    } catch {
      // Graceful error fallback
    }
  },

  sendPromoAlert: (message, code, discount) => {
    const alert: LivePromoAlert = {
      id: `alert-${Date.now()}`,
      message,
      code,
      discount,
      timestamp: Date.now(),
    };
    set({ activePromoAlert: alert });
  },

  clearPromoAlert: () => set({ activePromoAlert: null }),
}));
