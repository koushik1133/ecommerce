"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag, Users, BarChart3,
  Bot, Settings, ChevronRight, Zap, X, Mail, Radio
} from "lucide-react";
import { useAdminUI } from "@/store/admin";
import { useLiveTracker } from "@/store/live-tracker";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/live", label: "Live Visitors", icon: Radio, live: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/agents", label: "AI Agents", icon: Bot },
  { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
];

const BOTTOM_NAV = [
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, closeSidebar } = useAdminUI();
  const liveCount = useLiveTracker((s) => s.sessions.length);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto`}
        style={{ background: "#0f0f14", borderRight: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.07]">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0f6e56] flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">brand</p>
              <p className="text-white/40 text-[10px] tracking-widest uppercase leading-tight">Admin</p>
            </div>
          </Link>
          <button onClick={closeSidebar} className="lg:hidden text-white/40 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-white/30 text-[10px] font-semibold tracking-[0.12em] uppercase px-2 mb-2">Menu</p>
          {NAV.map(({ href, label, icon: Icon, live }) => {
            const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? "bg-[#0f6e56] text-white"
                    : "text-white/55 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <Icon size={17} className={active ? "text-white" : "text-white/40 group-hover:text-white/70"} />
                <span className="flex-1">{label}</span>
                {live ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    {liveCount}
                  </span>
                ) : active ? (
                  <ChevronRight size={14} className="opacity-60" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/[0.07] space-y-0.5">
          {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? "bg-[#0f6e56] text-white"
                    : "text-white/55 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <Icon size={17} className={active ? "text-white" : "text-white/40 group-hover:text-white/70"} />
                {label}
              </Link>
            );
          })}
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/10 mt-2 bg-white/5"
          >
            <span className="text-sm">←</span>
            Back to Home Store
          </Link>
        </div>
      </aside>
    </>
  );
}
