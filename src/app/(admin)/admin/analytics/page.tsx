"use client";

import { useState, useMemo } from "react";
import { SalesChart } from "@/components/admin/SalesChart";
import { useAdminOrders } from "@/store/admin";
import { useAdminProducts } from "@/store/admin";
import { formatINR } from "@/lib/products";

const RANGES = [7, 30, 90] as const;
type Range = typeof RANGES[number];

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>(30);
  const { orders } = useAdminOrders();
  const { products } = useAdminProducts();

  const analyticsData = useMemo(() => {
    const series = [];
    const revenueMap: Record<string, number> = {};
    const ordersMap: Record<string, number> = {};

    orders.forEach((o) => {
      if (o.status === "cancelled") return;
      const date = o.createdAt.split("T")[0];
      revenueMap[date] = (revenueMap[date] ?? 0) + o.total;
      ordersMap[date] = (ordersMap[date] ?? 0) + 1;
    });

    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      series.push({
        date: dateStr,
        revenue: revenueMap[dateStr] ?? 0,
        orders: ordersMap[dateStr] ?? 0,
      });
    }
    return series;
  }, [orders, range]);

  const totalRevenue = analyticsData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = analyticsData.reduce((s, d) => s + d.orders, 0);
  const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;
  const maxRevenue = Math.max(...analyticsData.map((d) => d.revenue), 1);

  // Category split
  const catRevenue = useMemo(() => {
    const cats: Record<string, number> = {};
    orders.forEach((o) =>
      o.items.forEach((item) => {
        const p = products.find((pr) => pr.id === item.productId);
        const cat = p?.category ?? "other";
        cats[cat] = (cats[cat] ?? 0) + item.price * item.quantity;
      })
    );
    return cats;
  }, [orders, products]);

  const catTotal = Object.values(catRevenue).reduce((s, v) => s + v, 0);
  const CAT_COLORS: Record<string, string> = {
    essentials: "#0f6e56",
    premium: "#6366f1",
    graphics: "#f59e0b",
    other: "#9b9b9b",
  };

  // Top products
  const topProducts = useMemo(() => {
    const counts: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach((o) =>
      o.items.forEach((i) => {
        if (!counts[i.productId]) counts[i.productId] = { name: i.name, qty: 0, revenue: 0 };
        counts[i.productId].qty += i.quantity;
        counts[i.productId].revenue += i.price * i.quantity;
      })
    );
    return Object.entries(counts)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 6);
  }, [orders]);

  const maxProductRev = topProducts[0]?.[1].revenue ?? 1;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Range selector */}
      <div className="flex gap-2">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              range === r
                ? "bg-[#0f0f14] text-white"
                : "bg-white border border-[#e2e2df] text-[#6b6b6b] hover:bg-[#f0f0ee]"
            }`}
          >
            Last {r} days
          </button>
        ))}
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Revenue", value: formatINR(totalRevenue) },
          { label: "Orders", value: String(totalOrders) },
          { label: "Avg Order Value", value: formatINR(avgOrderValue) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-[#e8e8e5] rounded-2xl p-5">
            <p className="text-[#9b9b9b] text-xs font-medium uppercase tracking-wider">{label}</p>
            <p className="text-[#0f0f14] font-bold text-2xl mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <SalesChart data={analyticsData} days={range} />

      <div className="grid md:grid-cols-2 gap-5">
        {/* Top Products Bar Chart */}
        <div className="bg-white border border-[#e8e8e5] rounded-2xl p-5">
          <p className="text-[#0f0f14] font-semibold text-sm mb-5">Top Products by Revenue</p>
          <div className="space-y-3">
            {topProducts.map(([id, { name, qty, revenue }]) => (
              <div key={id}>
                <div className="flex justify-between items-baseline mb-1">
                  <p className="text-[#0f0f14] text-sm font-medium truncate pr-2">{name}</p>
                  <p className="text-[#6b6b6b] text-xs flex-shrink-0">{formatINR(revenue)} · {qty} sold</p>
                </div>
                <div className="h-2 bg-[#f0f0ee] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0f6e56] transition-all"
                    style={{ width: `${(revenue / maxProductRev) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Donut */}
        <div className="bg-white border border-[#e8e8e5] rounded-2xl p-5">
          <p className="text-[#0f0f14] font-semibold text-sm mb-5">Revenue by Category</p>
          {/* Segmented bar as donut alternative */}
          <div className="flex h-4 rounded-full overflow-hidden mb-4">
            {Object.entries(catRevenue).map(([cat, val]) => (
              <div
                key={cat}
                style={{
                  width: `${(val / catTotal) * 100}%`,
                  background: CAT_COLORS[cat] ?? "#9b9b9b",
                }}
              />
            ))}
          </div>
          <div className="space-y-3">
            {Object.entries(catRevenue)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, val]) => (
                <div key={cat} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CAT_COLORS[cat] ?? "#9b9b9b" }} />
                  <p className="flex-1 text-[#0f0f14] text-sm capitalize">{cat}</p>
                  <p className="text-[#6b6b6b] text-sm">{formatINR(val)}</p>
                  <p className="text-[#9b9b9b] text-xs w-10 text-right">
                    {Math.round((val / catTotal) * 100)}%
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Daily Revenue Grid */}
      <div className="bg-white border border-[#e8e8e5] rounded-2xl p-5">
        <p className="text-[#0f0f14] font-semibold text-sm mb-4">Daily Revenue — Last {range} days</p>
        <div className="flex items-end gap-px h-20">
          {analyticsData.map((d, i) => (
            <div
              key={i}
              title={`${d.date}: ${formatINR(d.revenue)}`}
              className="flex-1 rounded-t-sm transition-opacity hover:opacity-80 cursor-default"
              style={{
                height: `${(d.revenue / maxRevenue) * 100}%`,
                background: "#0f6e56",
                opacity: 0.6 + 0.4 * (d.revenue / maxRevenue),
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[9px] text-[#c0c0bb]">{analyticsData[0]?.date}</span>
          <span className="text-[9px] text-[#c0c0bb]">{analyticsData[analyticsData.length - 1]?.date}</span>
        </div>
      </div>
    </div>
  );
}
