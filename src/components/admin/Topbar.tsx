"use client";

import { Menu, Bell, Search } from "lucide-react";
import { useAdminUI } from "@/store/admin";
import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/products": "Products",
  "/admin/products/new": "New Product",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/analytics": "Analytics",
  "/admin/agents": "AI Agents",
  "/admin/settings": "Settings",
};

export function Topbar() {
  const { toggleSidebar } = useAdminUI();
  const pathname = usePathname();

  // Find best matching title
  const title =
    TITLES[pathname] ??
    Object.entries(TITLES)
      .filter(([k]) => pathname.startsWith(k) && k !== "/admin/dashboard")
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ??
    "Admin";

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b"
      style={{ background: "#f9f9f8", borderColor: "#e8e8e5" }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-black/[0.05] text-[#0f0f14] transition"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-[#0f0f14] font-bold text-xl leading-tight">{title}</h1>
          <p className="text-[#6b6b6b] text-xs">{dateStr}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-white border border-[#e2e2df] rounded-xl px-3 py-2 w-60">
          <Search size={15} className="text-[#9b9b9b]" />
          <input
            placeholder="Search…"
            className="flex-1 text-sm outline-none bg-transparent text-[#0f0f14] placeholder:text-[#9b9b9b]"
          />
          <span className="text-[10px] text-[#c0c0bb] font-mono border border-[#e2e2df] rounded px-1 py-0.5">⌘K</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl bg-white border border-[#e2e2df] hover:bg-[#f0f0ee] transition">
          <Bell size={17} className="text-[#0f0f14]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#0f6e56]" />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-[#0f0f14] flex items-center justify-center text-white text-sm font-bold cursor-pointer">
          A
        </div>
      </div>
    </header>
  );
}
