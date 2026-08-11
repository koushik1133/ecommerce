import { type NextRequest } from "next/server";

export type RealVisitorSession = {
  id: string;
  ip: string;
  location: {
    city: string;
    country: string;
    flag: string;
    code: string;
    lat: number;
    lng: number;
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

export type RealLiveEvent = {
  id: string;
  sessionId: string;
  location: string;
  flag: string;
  type: "page_view" | "3d_rotate" | "color_change" | "logo_upload" | "add_to_cart" | "checkout_start";
  description: string;
  timestamp: number;
  lat?: number;
  lng?: number;
};

const activeSessions = new Map<string, RealVisitorSession>();
const realEvents: RealLiveEvent[] = [];

const COUNTRY_FLAGS: Record<string, string> = {
  IN: "🇮🇳",
  US: "🇺🇸",
  GB: "🇬🇧",
  CA: "🇨🇦",
  AU: "🇦🇺",
  DE: "🇩🇪",
  FR: "🇫🇷",
  JP: "🇯🇵",
  SG: "🇸🇬",
  AE: "🇦🇪",
  NL: "🇳🇱",
  LOCAL: "💻",
};

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Delhi: { lat: 28.6139, lng: 77.209 },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  London: { lat: 51.5074, lng: -0.1278 },
  "New York": { lat: 40.7128, lng: -74.006 },
  "San Francisco": { lat: 37.7749, lng: -122.4194 },
  Tokyo: { lat: 35.6762, lng: 139.6503 },
  Toronto: { lat: 43.6532, lng: -79.3832 },
  Berlin: { lat: 52.52, lng: 13.405 },
  Sydney: { lat: -33.8688, lng: 151.2093 },
  Paris: { lat: 48.8566, lng: 2.3522 },
  Singapore: { lat: 1.3521, lng: 103.8198 },
  Dubai: { lat: 25.2048, lng: 55.2708 },
};

const AVATAR_COLORS = ["#0f6e56", "#6366f1", "#f59e0b", "#ec4899", "#10b981", "#8b5cf6", "#06b6d4", "#ef4444"];

export function getRealSessions(): RealVisitorSession[] {
  const now = Date.now();
  const validThreshold = 20000; // 20s active threshold

  const list: RealVisitorSession[] = [];
  for (const [id, session] of activeSessions.entries()) {
    if (now - session.lastActive < validThreshold) {
      list.push(session);
    } else {
      activeSessions.delete(id);
    }
  }

  return list.sort((a, b) => b.lastActive - a.lastActive);
}

export function getRealEvents(): RealLiveEvent[] {
  return realEvents.slice(0, 30);
}

export function recordHeartbeat(req: NextRequest, body: any): RealVisitorSession {
  const now = Date.now();
  const sessionId = body.sessionId || `session-${Math.random().toString(36).substring(2, 9)}`;

  // Extract real IP and headers
  const xForwardedFor = req.headers.get("x-forwarded-for");
  const ip = xForwardedFor ? xForwardedFor.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";

  // Geo headers
  const cityHeader = req.headers.get("x-vercel-ip-city") || req.headers.get("cf-ipcity");
  const countryHeader = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "LOCAL";

  const city = cityHeader
    ? decodeURIComponent(cityHeader)
    : ip === "127.0.0.1" || ip === "::1"
    ? "Local Device"
    : "Online Visitor";

  const country = countryHeader === "LOCAL" ? "Local Traffic" : countryHeader;
  const flag = COUNTRY_FLAGS[countryHeader.toUpperCase()] || "🌐";

  // Resolve lat/lng coordinates
  let coords = CITY_COORDINATES[city] || CITY_COORDINATES["New York"];
  if (ip === "127.0.0.1" || ip === "::1") {
    // Default local demo location near Mumbai/Delhi or SF
    coords = { lat: 19.076, lng: 72.8777 };
  }

  // User agent parsing
  const ua = req.headers.get("user-agent") || "";
  const isMobile = /mobile|iphone|ipad|android/i.test(ua);
  const isTablet = /ipad|tablet/i.test(ua);
  const deviceType: "mobile" | "desktop" | "tablet" = isMobile ? "mobile" : isTablet ? "tablet" : "desktop";

  let browser = "Browser";
  if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edge")) browser = "Edge";

  let os = "OS";
  if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  const existing = activeSessions.get(sessionId);
  const color = existing?.avatarColor || AVATAR_COLORS[Math.abs(hashString(sessionId)) % AVATAR_COLORS.length];

  const updated: RealVisitorSession = {
    id: sessionId,
    ip: ip === "127.0.0.1" || ip === "::1" ? "Local Client (127.0.0.1)" : ip,
    location: {
      city,
      country,
      flag,
      code: countryHeader,
      lat: coords.lat,
      lng: coords.lng,
    },
    page: body.page || "/",
    pageTitle: body.pageTitle || "Browsing Store",
    device: {
      type: deviceType,
      browser,
      os,
    },
    action: body.action || "Viewing Page",
    activeGarment: body.activeGarment,
    cartCount: body.cartCount ?? 0,
    cartTotal: body.cartTotal ?? 0,
    startedAt: existing?.startedAt || now,
    lastActive: now,
    avatarColor: color,
  };

  activeSessions.set(sessionId, updated);

  if (!existing || existing.page !== updated.page || (body.eventDescription && existing.action !== updated.action)) {
    const evtType = body.eventType || "page_view";
    const desc = body.eventDescription || `Navigated to ${updated.pageTitle}`;
    realEvents.unshift({
      id: `evt-${now}-${Math.floor(Math.random() * 1000)}`,
      sessionId,
      location: `${updated.location.city}, ${updated.location.country} ${updated.location.flag}`,
      flag: updated.location.flag,
      type: evtType,
      description: desc,
      timestamp: now,
      lat: coords.lat,
      lng: coords.lng,
    });
    if (realEvents.length > 50) realEvents.pop();
  }

  return updated;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
