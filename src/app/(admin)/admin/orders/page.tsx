"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter } from "lucide-react";
import { useAdminOrders } from "@/store/admin";
import { StatusBadge, PaymentBadge } from "@/components/admin/Badges";
import { formatINR } from "@/lib/products";
import type { OrderStatus } from "@/lib/admin-data";

const STATUSES: (OrderStatus | "all")[] = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const { orders } = useAdminOrders();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");

  const filtered = useMemo(() => {
    return [...orders]
      .filter((o) => {
        const matchStatus = status === "all" || o.status === status;
        const matchSearch =
          !search ||
          o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
          o.customer.toLowerCase().includes(search.toLowerCase()) ||
          o.email.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [orders, status, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    orders.forEach((o) => { c[o.status] = (c[o.status] ?? 0) + 1; });
    return c;
  }, [orders]);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-white border border-[#e2e2df] rounded-xl px-3 py-2.5 flex-1 max-w-sm">
          <Search size={15} className="text-[#9b9b9b] flex-shrink-0" />
          <input
            placeholder="Order #, customer, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent text-[#0f0f14] placeholder:text-[#9b9b9b]"
          />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition capitalize ${
              status === s
                ? "bg-[#0f0f14] text-white"
                : "bg-white border border-[#e2e2df] text-[#6b6b6b] hover:bg-[#f0f0ee]"
            }`}
          >
            {s}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                status === s ? "bg-white/20 text-white" : "bg-[#f0f0ee] text-[#6b6b6b]"
              }`}
            >
              {counts[s] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e8e8e5] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e8e8e5] bg-[#fafaf9]">
                {["Order", "Customer", "Items", "Payment", "Total", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left text-[#9b9b9b] text-xs font-semibold uppercase tracking-wider px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-[#9b9b9b]">No orders found.</td>
                </tr>
              )}
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-[#f0f0ee] last:border-0 hover:bg-[#fafafa] transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/orders/${o.id}`} className="text-[#0f6e56] font-semibold hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-[#0f0f14] font-medium">{o.customer}</p>
                    <p className="text-[#9b9b9b] text-xs">{o.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[#6b6b6b]">
                    {o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ").slice(0, 40)}
                    {o.items.length > 1 && "…"}
                  </td>
                  <td className="px-5 py-3.5"><PaymentBadge method={o.payment} /></td>
                  <td className="px-5 py-3.5 text-[#0f0f14] font-semibold">{formatINR(o.total)}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                  <td className="px-5 py-3.5 text-[#9b9b9b] text-xs">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
