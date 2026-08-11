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
  isRealClient?: boolean;
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

const INITIAL_VISITORS: VisitorSession[] = [
  {
    id: "vis-1092",
    ip: "103.21.12.94",
    location: { city: "Mumbai", country: "India", flag: "🇮🇳", code: "IN" },
    page: "/product/cap",
    pageTitle: "Studio Twill Cap",
    device: { type: "mobile", browser: "Chrome", os: "Android" },
    action: "Rotating 3D Cap 360°",
    activeGarment: "Studio Twill Cap",
    cartCount: 1,
    cartTotal: 999,
    startedAt: Date.now() - 145000,
    lastActive: Date.now() - 2000,
    avatarColor: "#0f6e56",
  },
  {
    id: "vis-3841",
    ip: "185.220.101.5",
    location: { city: "London", country: "United Kingdom", flag: "🇬🇧", code: "GB" },
    page: "/customizer",
    pageTitle: "3D Configurator",
    device: { type: "desktop", browser: "Safari", os: "macOS" },
    action: "Uploading Custom Logo on Hoodie",
    activeGarment: "Oversized Hoodie",
    cartCount: 2,
    cartTotal: 5698,
    startedAt: Date.now() - 320000,
    lastActive: Date.now() - 1000,
    avatarColor: "#6366f1",
  },
  {
    id: "vis-7492",
    ip: "157.245.192.2",
    location: { city: "New York", country: "United States", flag: "🇺🇸", code: "US" },
    page: "/product/restday-sweatpants",
    pageTitle: "Restday Fleece Sweatpants",
    device: { type: "desktop", browser: "Chrome", os: "Windows" },
    action: "Inspecting Fabric & Fit Details",
    activeGarment: "Restday Sweatpants",
    cartCount: 0,
    cartTotal: 0,
    startedAt: Date.now() - 85000,
    lastActive: Date.now() - 4000,
    avatarColor: "#f59e0b",
  },
  {
    id: "vis-9201",
    ip: "49.207.198.14",
    location: { city: "Bengaluru", country: "India", flag: "🇮🇳", code: "IN" },
    page: "/shop",
    pageTitle: "Shop Collection",
    device: { type: "mobile", browser: "Safari", os: "iOS" },
    action: "Filtering by Hoodies & Sweatshirts",
    cartCount: 1,
    cartTotal: 2499,
    startedAt: Date.now() - 210000,
    lastActive: Date.now() - 3000,
    avatarColor: "#ec4899",
  },
  {
    id: "vis-5510",
    ip: "103.14.26.88",
    location: { city: "Tokyo", country: "Japan", flag: "🇯🇵", code: "JP" },
    page: "/product/tech-zip-hoodie",
    pageTitle: "Tech Bonded Zip Hoodie",
    device: { type: "desktop", browser: "Edge", os: "Windows" },
    action: "Changing Garment Color (Forest)",
    activeGarment: "Tech Zip Hoodie",
    cartCount: 1,
    cartTotal: 3699,
    startedAt: Date.now() - 410000,
    lastActive: Date.now() - 1000,
    avatarColor: "#10b981",
  },
  {
    id: "vis-8234",
    ip: "198.51.100.42",
    location: { city: "Toronto", country: "Canada", flag: "🇨🇦", code: "CA" },
    page: "/checkout",
    pageTitle: "Checkout",
    device: { type: "desktop", browser: "Chrome", os: "macOS" },
    action: "Entering Shipping Information",
    activeGarment: "Warmup Hoodie + Cap",
    cartCount: 2,
    cartTotal: 4198,
    startedAt: Date.now() - 520000,
    lastActive: Date.now() - 2000,
    avatarColor: "#8b5cf6",
  },
  {
    id: "vis-4109",
    ip: "91.218.114.12",
    location: { city: "Berlin", country: "Germany", flag: "🇩🇪", code: "DE" },
    page: "/product/heritage-polo",
    pageTitle: "Heritage Pique Polo Shirt",
    device: { type: "tablet", browser: "Safari", os: "iPadOS" },
    action: "Viewing 360° Interactive Studio",
    activeGarment: "Heritage Polo Shirt",
    cartCount: 0,
    cartTotal: 0,
    startedAt: Date.now() - 60000,
    lastActive: Date.now() - 5000,
    avatarColor: "#06b6d4",
  },
];

const INITIAL_EVENTS: LiveEvent[] = [
  {
    id: "evt-1",
    sessionId: "vis-3841",
    location: "London, UK 🇬🇧",
    flag: "🇬🇧",
    type: "logo_upload",
    description: "Uploaded custom PNG logo in 3D Studio",
    timestamp: Date.now() - 12000,
  },
  {
    id: "evt-2",
    sessionId: "vis-1092",
    location: "Mumbai, IN 🇮🇳",
    flag: "🇮🇳",
    type: "3d_rotate",
    description: "Rotated Studio Twill Cap 360° to visor view",
    timestamp: Date.now() - 28000,
  },
  {
    id: "evt-3",
    sessionId: "vis-8234",
    location: "Toronto, CA 🇨🇦",
    flag: "🇨🇦",
    type: "checkout_start",
    description: "Proceeded to checkout with 2 items (₹4,198)",
    timestamp: Date.now() - 45000,
  },
  {
    id: "evt-4",
    sessionId: "vis-5510",
    location: "Tokyo, JP 🇯🇵",
    flag: "🇯🇵",
    type: "color_change",
    description: "Switched Tech Zip Hoodie to Forest Green",
    timestamp: Date.now() - 62000,
  },
  {
    id: "evt-5",
    sessionId: "vis-9201",
    location: "Bengaluru, IN 🇮🇳",
    flag: "🇮🇳",
    type: "add_to_cart",
    description: "Added Restday Sweatpants (M / Ink) to Bag",
    timestamp: Date.now() - 89000,
  },
];

type LiveTrackerStore = {
  sessions: VisitorSession[];
  events: LiveEvent[];
  activePromoAlert: LivePromoAlert | null;
  simulationEnabled: boolean;

  // Real client telemetry action
  updateRealClientSession: (data: Partial<VisitorSession>) => void;

  // Actions
  toggleSimulation: () => void;
  sendPromoAlert: (message: string, code: string, discount: string) => void;
  clearPromoAlert: () => void;
  tickSimulation: () => void;
  addEvent: (event: Omit<LiveEvent, "id" | "timestamp">) => void;
};

const RANDOM_CITIES = [
  { city: "Delhi", country: "India", flag: "🇮🇳", code: "IN" },
  { city: "Paris", country: "France", flag: "🇫🇷", code: "FR" },
  { city: "Sydney", country: "Australia", flag: "🇦🇺", code: "AU" },
  { city: "Singapore", country: "Singapore", flag: "🇸🇬", code: "SG" },
  { city: "Dubai", country: "UAE", flag: "🇦🇪", code: "AE" },
  { city: "Amsterdam", country: "Netherlands", flag: "🇳🇱", code: "NL" },
  { city: "San Francisco", country: "United States", flag: "🇺🇸", code: "US" },
  { city: "Seoul", country: "South Korea", flag: "🇰🇷", code: "KR" },
];

const RANDOM_PAGES = [
  { page: "/product/oversized-tshirt", title: "Heavyweight Oversized Tee", garment: "Oversized Tee" },
  { page: "/product/warmup-hoodie", title: "Warmup Heavy Hoodie", garment: "Warmup Hoodie" },
  { page: "/product/studio-cap", title: "Studio Twill Cap", garment: "Cap" },
  { page: "/product/heavyweight-joggers", title: "Heavyweight Joggers", garment: "Joggers" },
  { page: "/customizer", title: "3D Garment Configurator", garment: "3D Configurator" },
  { page: "/shop", title: "Shop Collection", garment: undefined },
  { page: "/checkout", title: "Checkout Page", garment: undefined },
];

const RANDOM_ACTIONS = [
  "Rotating 3D Model 360°",
  "Changing Color Swatch",
  "Testing Block-out Stitch preview",
  "Uploading Custom Brand Logo",
  "Reading Fabric Specs (260 GSM)",
  "Selecting Size (L / Ink)",
  "Checking Shipping Calculator",
  "Viewing Product Photo Gallery",
];

const AVATAR_COLORS = ["#0f6e56", "#6366f1", "#f59e0b", "#ec4899", "#10b981", "#8b5cf6", "#06b6d4", "#ef4444"];

export const useLiveTracker = create<LiveTrackerStore>((set, get) => ({
  sessions: INITIAL_VISITORS,
  events: INITIAL_EVENTS,
  activePromoAlert: null,
  simulationEnabled: true,

  toggleSimulation: () => set((state) => ({ simulationEnabled: !state.simulationEnabled })),

  sendPromoAlert: (message, code, discount) => {
    const alert: LivePromoAlert = {
      id: `alert-${Date.now()}`,
      message,
      code,
      discount,
      timestamp: Date.now(),
    };
    set({ activePromoAlert: alert });
    get().addEvent({
      sessionId: "admin",
      location: "Admin Console ⚡",
      flag: "⚡",
      type: "checkout_start",
      description: `Broadcast live flash offer: "${message}" (${code})`,
    });
  },

  clearPromoAlert: () => set({ activePromoAlert: null }),

  updateRealClientSession: (patch) => {
    set((state) => {
      const realId = "client-real-session";
      const existing = state.sessions.find((s) => s.id === realId);
      const updatedPatch: VisitorSession = existing
        ? { ...existing, ...patch, lastActive: Date.now() }
        : {
            id: realId,
            ip: "127.0.0.1 (YOU - Real Session)",
            location: { city: "Your Location", country: "Live Browser", flag: "🟢", code: "YOU" },
            page: patch.page || "/",
            pageTitle: patch.pageTitle || "Browsing Website",
            device: { type: "desktop", browser: "Chrome/Safari", os: "macOS" },
            action: patch.action || "Active on Page",
            activeGarment: patch.activeGarment,
            cartCount: patch.cartCount ?? 0,
            cartTotal: patch.cartTotal ?? 0,
            startedAt: Date.now(),
            lastActive: Date.now(),
            isRealClient: true,
            avatarColor: "#0f6e56",
            ...patch,
          };

      const remaining = state.sessions.filter((s) => s.id !== realId);
      return { sessions: [updatedPatch, ...remaining] };
    });
  },

  addEvent: (event) => {
    set((state) => ({
      events: [
        {
          ...event,
          id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: Date.now(),
        },
        ...state.events.slice(0, 24), // Keep last 25 live events
      ],
    }));
  },

  tickSimulation: () => {
    const state = get();
    if (!state.simulationEnabled) return;

    set((s) => {
      const now = Date.now();
      // Randomly update 1-2 sessions or move them
      const updatedSessions = s.sessions.map((sess) => {
        if (sess.isRealClient) return sess;

        const shouldUpdate = Math.random() < 0.45;
        if (!shouldUpdate) return sess;

        const randomAction = RANDOM_ACTIONS[Math.floor(Math.random() * RANDOM_ACTIONS.length)];
        const movePage = Math.random() < 0.25;

        if (movePage) {
          const nextP = RANDOM_PAGES[Math.floor(Math.random() * RANDOM_PAGES.length)];
          return {
            ...sess,
            page: nextP.page,
            pageTitle: nextP.title,
            activeGarment: nextP.garment ?? sess.activeGarment,
            action: `Navigated to ${nextP.title}`,
            lastActive: now,
          };
        }

        return {
          ...sess,
          action: randomAction,
          lastActive: now,
        };
      });

      // Randomly spawn a new simulated visitor occasionally or refresh low count
      let finalSessions = updatedSessions;
      if (finalSessions.length < 8 && Math.random() < 0.3) {
        const loc = RANDOM_CITIES[Math.floor(Math.random() * RANDOM_CITIES.length)];
        const pg = RANDOM_PAGES[Math.floor(Math.random() * RANDOM_PAGES.length)];
        const newVis: VisitorSession = {
          id: `vis-${Math.floor(1000 + Math.random() * 9000)}`,
          ip: `${Math.floor(50 + Math.random() * 150)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          location: loc,
          page: pg.page,
          pageTitle: pg.title,
          device: {
            type: Math.random() > 0.4 ? "mobile" : "desktop",
            browser: Math.random() > 0.5 ? "Chrome" : "Safari",
            os: Math.random() > 0.5 ? "iOS" : "macOS",
          },
          action: `Started viewing ${pg.title}`,
          activeGarment: pg.garment,
          cartCount: Math.random() > 0.6 ? Math.floor(1 + Math.random() * 3) : 0,
          cartTotal: 0,
          startedAt: now,
          lastActive: now,
          avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        };
        newVis.cartTotal = newVis.cartCount * 1999;
        finalSessions = [newVis, ...finalSessions];
      }

      return { sessions: finalSessions };
    });
  },
}));
