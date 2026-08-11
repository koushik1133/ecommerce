"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCart } from "@/store/cart";
import { Sparkles, Tag, X } from "lucide-react";
import { useLiveTracker } from "@/store/live-tracker";

function getPageTitle(pathname: string, productParam: string | null): { title: string; garment?: string } {
  if (pathname === "/") return { title: "Home Page" };
  if (pathname === "/shop") return { title: "Shop Collection" };
  if (pathname === "/customizer" || pathname === "/configurator") {
    const garment = productParam ? productParam.replace(/-/g, " ") : "3D Configurator";
    return { title: "3D Garment Studio", garment: garment.charAt(0).toUpperCase() + garment.slice(1) };
  }
  if (pathname.startsWith("/product/")) {
    const slug = pathname.replace("/product/", "");
    const formatted = slug.replace(/-/g, " ");
    const garment = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    return { title: `${garment} 360° View`, garment };
  }
  if (pathname === "/checkout") return { title: "Checkout" };
  if (pathname === "/about") return { title: "About Brand" };
  if (pathname === "/contact") return { title: "Contact Us" };
  return { title: pathname };
}

export function LiveTelemetryTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const productParam = searchParams ? searchParams.get("product") : null;
  const sessionIdRef = useRef<string | null>(null);

  const activePromoAlert = useLiveTracker((s) => s.activePromoAlert);
  const clearPromoAlert = useLiveTracker((s) => s.clearPromoAlert);

  const cartItems = useCart((s) => s.items);
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  // Initialize or get unique persistent Session ID for this browser tab/window
  useEffect(() => {
    if (typeof window === "undefined") return;
    let sid = sessionStorage.getItem("brand_live_session_id");
    if (!sid) {
      sid = `vis-${Math.floor(1000 + Math.random() * 9000)}`;
      sessionStorage.setItem("brand_live_session_id", sid);
    }
    sessionIdRef.current = sid;
  }, []);

  // Function to send real telemetry heartbeat to backend
  const sendRealHeartbeat = (eventType?: string, eventDescription?: string) => {
    if (pathname.startsWith("/admin") || !sessionIdRef.current) return;

    const { title, garment } = getPageTitle(pathname, productParam);
    const actionDesc =
      pathname.includes("customizer") || pathname.includes("configurator")
        ? `Configuring ${garment || "3D Garment"}`
        : pathname.startsWith("/product/")
        ? `Watching 360° ${garment}`
        : pathname === "/checkout"
        ? "In Checkout"
        : `Browsing ${title}`;

    fetch("/api/live-visitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sessionIdRef.current,
        page: pathname,
        pageTitle: title,
        activeGarment: garment,
        action: actionDesc,
        cartCount,
        cartTotal,
        eventType: eventType || "page_view",
        eventDescription: eventDescription || `Browsing ${title}`,
      }),
    }).catch(() => {});
  };

  // Trigger heartbeat on route change
  useEffect(() => {
    sendRealHeartbeat("page_view", `Navigated to ${getPageTitle(pathname, productParam).title}`);
  }, [pathname, productParam]);

  // Periodic heartbeat every 2.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      sendRealHeartbeat();
    }, 2500);

    return () => clearInterval(timer);
  }, [pathname, productParam, cartCount, cartTotal]);

  if (pathname.startsWith("/admin") || !activePromoAlert) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-short max-w-md w-full px-4 pointer-events-auto">
      <div className="bg-[#0f0f14] text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-start gap-3 relative">
        <div className="w-9 h-9 rounded-xl bg-[#0f6e56] flex items-center justify-center shrink-0">
          <Sparkles size={18} className="text-white" />
        </div>
        <div className="flex-1 pr-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0f6e56] text-white">
              FLASH OFFER
            </span>
            <span className="text-xs text-white/50">{activePromoAlert.discount} OFF</span>
          </div>
          <p className="text-xs font-medium text-white/90 leading-snug">{activePromoAlert.message}</p>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 text-white">
              <Tag size={12} className="text-[#0f6e56]" />
              {activePromoAlert.code}
            </span>
            <span className="text-[10px] text-white/40">Use code at checkout</span>
          </div>
        </div>
        <button
          onClick={clearPromoAlert}
          className="absolute top-3 right-3 text-white/40 hover:text-white transition"
          aria-label="Close offer"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
