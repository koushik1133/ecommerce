"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Activity, Eye, Smartphone, Monitor, Tablet, ShoppingCart,
  MapPin, Send, Zap, Filter, RefreshCw, CheckCircle2,
  Box, Sparkles, Clock, Globe
} from "lucide-react";
import { useLiveTracker, type VisitorSession } from "@/store/live-tracker";
import { formatINR } from "@/lib/products";

export function LiveVisitorTracker({ compact = false }: { compact?: boolean }) {
  const {
    sessions,
    events,
    simulationEnabled,
    toggleSimulation,
    sendPromoAlert,
    activePromoAlert,
    tickSimulation,
  } = useLiveTracker();

  const [mounted, setMounted] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [promoMessage, setPromoMessage] = useState("Flash Sale! Get 15% OFF your custom garment order today.");
  const [promoCode, setPromoCode] = useState("FLASH15");
  const [promoDiscount, setPromoDiscount] = useState("15%");
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Interval for ticking live state so times update smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      tickSimulation();
    }, 2000);
    return () => clearInterval(timer);
  }, [tickSimulation]);

  const activeVisitorsCount = sessions.length;

  const viewersIn3D = useMemo(
    () =>
      sessions.filter(
        (s) =>
          s.page.includes("product") ||
          s.page.includes("customizer") ||
          s.page.includes("configurator") ||
          s.action.toLowerCase().includes("3d") ||
          s.action.toLowerCase().includes("rotating")
      ).length,
    [sessions]
  );

  const activeCartsCount = useMemo(
    () => sessions.filter((s) => s.cartCount > 0).length,
    [sessions]
  );

  const totalCartRevenue = useMemo(
    () => sessions.reduce((sum, s) => sum + s.cartTotal, 0),
    [sessions]
  );

  // Group visitors by "What They Are Watching" (Page / Garment)
  const watchingGroups = useMemo(() => {
    const groups: Record<
      string,
      {
        pageTitle: string;
        pagePath: string;
        garment?: string;
        visitors: VisitorSession[];
        count: number;
        has3D: boolean;
      }
    > = {};

    sessions.forEach((s) => {
      const key = s.pageTitle || s.page;
      if (!groups[key]) {
        groups[key] = {
          pageTitle: s.pageTitle,
          pagePath: s.page,
          garment: s.activeGarment,
          visitors: [],
          count: 0,
          has3D: s.page.includes("product") || s.page.includes("customizer") || s.page.includes("configurator"),
        };
      }
      groups[key].visitors.push(s);
      groups[key].count += 1;
    });

    return Object.values(groups).sort((a, b) => b.count - a.count);
  }, [sessions]);

  // Filtered session list
  const filteredSessions = useMemo(() => {
    if (selectedFilter === "all") return sessions;
    if (selectedFilter === "3d")
      return sessions.filter((s) => s.page.includes("product") || s.page.includes("customizer"));
    if (selectedFilter === "carts") return sessions.filter((s) => s.cartCount > 0);
    if (selectedFilter === "checkout") return sessions.filter((s) => s.page.includes("checkout"));
    if (selectedFilter === "real") return sessions.filter((s) => s.isRealClient);
    return sessions;
  }, [sessions, selectedFilter]);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoMessage || !promoCode) return;
    sendPromoAlert(promoMessage, promoCode, promoDiscount);
    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
      setShowPromoModal(false);
    }, 1500);
  };

  if (!mounted) {
    return (
      <div className="p-6 bg-[#0f0f14] text-white rounded-2xl border border-white/10 animate-pulse">
        <p className="text-sm font-medium tracking-wide">Loading Live Visitor Tracker…</p>
      </div>
    );
  }

  // If rendering inside Dashboard (compact view)
  if (compact) {
    return (
      <div className="bg-[#0f0f14] text-white rounded-2xl border border-white/10 p-5 space-y-5 shadow-xl">
        {/* Top Live Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Live Visitor Tracker</h3>
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  REAL-TIME
                </span>
              </div>
              <p className="text-xs text-white/50">Tracking shoppers & 3D viewers right now</p>
            </div>
          </div>

          <Link
            href="/admin/live"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
          >
            <Eye size={14} />
            Full Live View
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/5 border border-white/5 rounded-xl p-3">
            <p className="text-[11px] text-white/50 font-medium">Online Right Now</p>
            <p className="text-xl font-bold text-white mt-0.5 flex items-center gap-1.5">
              {activeVisitorsCount}
              <span className="text-xs text-emerald-400 font-normal">active</span>
            </p>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-3">
            <p className="text-[11px] text-white/50 font-medium">Watching 3D Studio</p>
            <p className="text-xl font-bold text-indigo-400 mt-0.5 flex items-center gap-1.5">
              {viewersIn3D}
              <span className="text-xs text-indigo-300 font-normal">3D viewers</span>
            </p>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-3">
            <p className="text-[11px] text-white/50 font-medium">Active Carts</p>
            <p className="text-xl font-bold text-amber-400 mt-0.5 flex items-center gap-1.5">
              {activeCartsCount}
              <span className="text-xs text-amber-300 font-normal">shoppers</span>
            </p>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-3">
            <p className="text-[11px] text-white/50 font-medium">Potential Cart Value</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{formatINR(totalCartRevenue)}</p>
          </div>
        </div>

        {/* What They Are Watching Density */}
        <div>
          <p className="text-xs font-semibold text-white/40 tracking-wider uppercase mb-2.5">
            What They Are Watching Right Now
          </p>
          <div className="space-y-2">
            {watchingGroups.slice(0, 3).map((group, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                    {group.has3D ? <Box size={14} /> : <Eye size={14} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{group.pageTitle}</p>
                    <p className="text-[10px] text-white/40 truncate">{group.pagePath}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Visitor Avatars */}
                  <div className="flex -space-x-1.5">
                    {group.visitors.slice(0, 4).map((vis) => (
                      <span
                        key={vis.id}
                        title={`${vis.location.city}, ${vis.location.country} - ${vis.action}`}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-[#0f0f14]"
                        style={{ backgroundColor: vis.avatarColor }}
                      >
                        {vis.location.flag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {group.count} watching
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Event Ticker */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
          <div className="flex items-center gap-2 truncate">
            <Zap size={14} className="text-emerald-400 shrink-0" />
            <span className="text-white/40">Latest:</span>
            <span className="text-white/80 truncate">{events[0]?.description || "Tracking website traffic..."}</span>
          </div>
          <span className="text-[10px] text-white/40 shrink-0 ml-2">
            {events[0] ? `${Math.round((Date.now() - events[0].timestamp) / 1000)}s ago` : "Live"}
          </span>
        </div>
      </div>
    );
  }

  // Full Detailed View for `/admin/live`
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Quick Controls */}
      <div className="bg-[#0f0f14] text-white rounded-2xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Live Website Visitor Telemetry</h1>
              <span className="text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                ACTIVE
              </span>
            </div>
            <p className="text-xs md:text-sm text-white/60">
              Real-time monitoring of who is watching your store, which 3D garments they are viewing, and their active shopping behavior.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowPromoModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0f6e56] hover:bg-[#0c5945] text-white transition flex items-center gap-2 shadow-lg shadow-emerald-900/30"
            >
              <Sparkles size={14} />
              Broadcast Flash Deal
            </button>

            <button
              onClick={toggleSimulation}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition flex items-center gap-2 ${
                simulationEnabled
                  ? "bg-white/10 text-white border-white/20 hover:bg-white/15"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/30"
              }`}
            >
              <RefreshCw size={13} className={simulationEnabled ? "animate-spin" : ""} />
              {simulationEnabled ? "Simulation On" : "Simulation Paused"}
            </button>
          </div>
        </div>

        {/* 4 KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10 relative z-10">
          <div className="bg-white/5 border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between text-white/50 mb-1">
              <span className="text-xs font-medium">Online Visitors</span>
              <Globe size={16} className="text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{activeVisitorsCount}</p>
            <p className="text-[10px] text-emerald-400 mt-0.5">● Live sessions on site</p>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between text-white/50 mb-1">
              <span className="text-xs font-medium">Watching 3D Studio</span>
              <Box size={16} className="text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-indigo-300">{viewersIn3D}</p>
            <p className="text-[10px] text-indigo-400 mt-0.5">
              {Math.round((viewersIn3D / Math.max(1, activeVisitorsCount)) * 100)}% of total audience
            </p>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between text-white/50 mb-1">
              <span className="text-xs font-medium">Active Carts</span>
              <ShoppingCart size={16} className="text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-300">{activeCartsCount}</p>
            <p className="text-[10px] text-amber-400 mt-0.5">Items pending checkout</p>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between text-white/50 mb-1">
              <span className="text-xs font-medium">Live Cart Revenue</span>
              <Zap size={16} className="text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">{formatINR(totalCartRevenue)}</p>
            <p className="text-[10px] text-emerald-400/70 mt-0.5">Potential checkout value</p>
          </div>
        </div>
      </div>

      {/* "What They Are Watching Right Now" Density Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0f0f14] flex items-center gap-2">
            <Eye size={18} className="text-[#0f6e56]" />
            What They Are Watching Right Now
          </h2>
          <span className="text-xs text-[#6b6b6b] font-medium">{watchingGroups.length} active pages</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchingGroups.map((group, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 border border-[#e2e2df] shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    {group.has3D ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center gap-1">
                        <Box size={10} /> 3D View
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                        Page View
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-[#0f0f14] truncate">{group.pageTitle}</h3>
                  <p className="text-xs text-[#6b6b6b] font-mono truncate">{group.pagePath}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-lg font-extrabold text-[#0f6e56]">{group.count}</span>
                  <span className="text-xs text-[#9b9b9b] block">watching</span>
                </div>
              </div>

              {/* Progress Density Bar */}
              <div className="w-full bg-[#f0f0ee] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#0f6e56] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (group.count / activeVisitorsCount) * 100)}%` }}
                />
              </div>

              {/* Avatars List */}
              <div className="pt-1 flex items-center justify-between text-xs text-[#6b6b6b]">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5">
                  {group.visitors.map((vis) => (
                    <span
                      key={vis.id}
                      title={`${vis.location.city}, ${vis.location.country} (${vis.device.os}) - ${vis.action}`}
                      className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#f5f5f3] px-2 py-0.5 rounded-lg border border-[#e8e8e5] shrink-0"
                    >
                      <span>{vis.location.flag}</span>
                      <span className="text-[#0f0f14] font-semibold">{vis.location.city}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Live Sessions Table Section */}
      <div className="bg-white rounded-2xl border border-[#e2e2df] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0f0ee] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#0f0f14]">Live Visitor Sessions Stream</h2>
            <p className="text-xs text-[#6b6b6b]">Real-time audit log of active IP addresses and client interactions</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            <Filter size={14} className="text-[#9b9b9b] mr-1 shrink-0" />
            {[
              { id: "all", label: `All (${sessions.length})` },
              { id: "3d", label: `3D Viewers (${viewersIn3D})` },
              { id: "carts", label: `In Cart (${activeCartsCount})` },
              { id: "checkout", label: "In Checkout" },
              { id: "real", label: "Real Session Only" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedFilter === tab.id
                    ? "bg-[#0f0f14] text-white"
                    : "bg-[#f5f5f3] text-[#6b6b6b] hover:bg-[#e8e8e5] hover:text-[#0f0f14]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#f0f0ee] text-[#9b9b9b] uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-3">Visitor / Session</th>
                <th className="py-3 px-3">Location & IP</th>
                <th className="py-3 px-3">Currently Watching</th>
                <th className="py-3 px-3">Live Action</th>
                <th className="py-3 px-3">Device</th>
                <th className="py-3 px-3">Cart Status</th>
                <th className="py-3 px-3 text-right">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0ee]">
              {filteredSessions.map((vis) => {
                const isRecentlyActive = Date.now() - vis.lastActive < 4000;
                return (
                  <tr key={vis.id} className="hover:bg-[#fafaf8] transition group">
                    {/* Visitor ID & Avatar */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0"
                          style={{ backgroundColor: vis.avatarColor }}
                        >
                          {vis.location.flag}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#0f0f14]">{vis.id}</span>
                            {vis.isRealClient && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#9b9b9b] font-mono">{vis.ip}</span>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 font-medium text-[#0f0f14]">
                        <MapPin size={13} className="text-[#0f6e56]" />
                        {vis.location.city}, {vis.location.country}
                      </div>
                    </td>

                    {/* Currently Watching */}
                    <td className="py-3.5 px-3 max-w-[200px]">
                      <div className="font-semibold text-[#0f0f14] truncate">{vis.pageTitle}</div>
                      <div className="text-[10px] text-[#9b9b9b] font-mono truncate">{vis.page}</div>
                    </td>

                    {/* Live Action */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1.5 font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-xl">
                        <Activity size={12} className="animate-pulse" />
                        {vis.action}
                      </span>
                    </td>

                    {/* Device */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 text-[#6b6b6b]">
                        {vis.device.type === "mobile" ? (
                          <Smartphone size={14} />
                        ) : vis.device.type === "tablet" ? (
                          <Tablet size={14} />
                        ) : (
                          <Monitor size={14} />
                        )}
                        <span>
                          {vis.device.browser} / {vis.device.os}
                        </span>
                      </div>
                    </td>

                    {/* Cart Status */}
                    <td className="py-3.5 px-3">
                      {vis.cartCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                          <ShoppingCart size={12} />
                          {vis.cartCount} item ({formatINR(vis.cartTotal)})
                        </span>
                      ) : (
                        <span className="text-[#9b9b9b]">Empty Cart</span>
                      )}
                    </td>

                    {/* Last Active */}
                    <td className="py-3.5 px-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#6b6b6b]">
                        <Clock size={11} className={isRecentlyActive ? "text-emerald-500 animate-spin" : ""} />
                        {isRecentlyActive ? "Active now" : `${Math.round((Date.now() - vis.lastActive) / 1000)}s ago`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Event Stream Log */}
      <div className="bg-white rounded-2xl border border-[#e2e2df] p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0f0f14] flex items-center gap-2">
            <Zap size={18} className="text-amber-500" />
            Live Visitor Event Stream
          </h2>
          <span className="text-xs text-[#6b6b6b]">Real-time user telemetry events</span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="flex items-center justify-between p-3 rounded-xl bg-[#f9f9f8] border border-[#e8e8e5] text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-base">{evt.flag}</span>
                <span className="font-semibold text-[#0f0f14] shrink-0">{evt.location}</span>
                <span className="text-[#6b6b6b] truncate">— {evt.description}</span>
              </div>
              <span className="text-[10px] text-[#9b9b9b] font-mono shrink-0 ml-2">
                {Math.round((Date.now() - evt.timestamp) / 1000)}s ago
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Broadcast Offer Modal */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0f14] text-white p-6 rounded-3xl max-w-md w-full border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Send size={18} className="text-emerald-400" />
                <h3 className="font-bold text-base text-white">Broadcast Flash Deal</h3>
              </div>
              <button onClick={() => setShowPromoModal(false)} className="text-white/40 hover:text-white">
                ✕
              </button>
            </div>

            {broadcastSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 size={40} className="text-emerald-400 mx-auto animate-bounce" />
                <p className="font-bold text-base text-white">Offer Broadcast Live!</p>
                <p className="text-xs text-white/60">Active shoppers on the store received your promo banner.</p>
              </div>
            ) : (
              <form onSubmit={handleBroadcast} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1">Banner Message</label>
                  <input
                    type="text"
                    value={promoMessage}
                    onChange={(e) => setPromoMessage(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Enter flash announcement message…"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">Promo Code</label>
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">Discount Tag</label>
                    <input
                      type="text"
                      value={promoDiscount}
                      onChange={(e) => setPromoDiscount(e.target.value)}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPromoModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0f6e56] hover:bg-[#0c5945] text-white shadow-lg shadow-emerald-900/30 flex items-center gap-2"
                  >
                    <Send size={13} />
                    Send Offer Now
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
