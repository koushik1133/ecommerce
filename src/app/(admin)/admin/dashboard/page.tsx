"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  IndianRupee, ShoppingBag, Package, Users, Clock, ArrowRight
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { SalesChart } from "@/components/admin/SalesChart";
import { StatusBadge } from "@/components/admin/Badges";
import { useAdminOrders } from "@/store/admin";
import { useAdminProducts } from "@/store/admin";
import { useAdminCustomers } from "@/store/admin";
import { formatINR } from "@/lib/products";

export default function DashboardPage() {
  const { orders } = useAdminOrders();
  const { products } = useAdminProducts();
  const { customers } = useAdminCustomers();

  const kpis = useMemo(() => {
    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + o.total, 0);
    const today = new Date().toISOString().split("T")[0];
    const ordersToday = orders.filter((o) => o.createdAt.startsWith(today)).length;
    const nonCancelled = orders.filter((o) => o.status !== "cancelled");
    const avgOrder = nonCancelled.length ? Math.round(totalRevenue / nonCancelled.length) : 0;
    const pending = orders.filter((o) => o.status === "pending" || o.status === "processing").length;
    return { totalRevenue, ordersToday, avgOrder, pending };
  }, [orders]);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
    [orders]
  );

  const analyticsData = useMemo(() => {
    const days = 30;
    const series = [];
    const revenueMap: Record<string, number> = {};
    const ordersMap: Record<string, number> = {};

    orders.forEach((o) => {
      if (o.status === "cancelled") return;
      const date = o.createdAt.split("T")[0];
      revenueMap[date] = (revenueMap[date] ?? 0) + o.total;
      ordersMap[date] = (ordersMap[date] ?? 0) + 1;
    });

    for (let i = days - 1; i >= 0; i--) {
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
  }, [orders]);

  // Top products by simulated sales count
  const topProducts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => o.items.forEach((i) => {
      counts[i.productId] = (counts[i.productId] ?? 0) + i.quantity;
    }));
    return products
      .map((p) => ({ ...p, sold: counts[p.id] ?? 0 }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [orders, products]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={formatINR(kpis.totalRevenue)}
          change={12}
          icon={<IndianRupee size={20} />}
          accent="#0f6e56"
        />
        <StatCard
          label="Orders"
          value={String(orders.length)}
          change={8}
          icon={<ShoppingBag size={20} />}
          accent="#6366f1"
        />
        <StatCard
          label="Customers"
          value={String(customers.length)}
          change={5}
          icon={<Users size={20} />}
          accent="#f59e0b"
        />
        <StatCard
          label="Pending"
          value={String(kpis.pending)}
          change={-3}
          icon={<Clock size={20} />}
          accent="#ef4444"
        />
      </div>

      {/* Chart + Top Products */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SalesChart data={analyticsData} days={30} />
        </div>

        {/* Top Products */}
        <div className="bg-white border border-[#e8e8e5] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-[#0f0f14] text-sm">Top Products</p>
            <Link href="/admin/products" className="text-[#0f6e56] text-xs font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-[#c0c0bb] text-xs font-mono w-4">{i + 1}</span>
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ background: p.colors[0]?.hex ?? "#1A1A1A" }}
                >
                  {p.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#0f0f14] text-sm font-medium truncate">{p.name}</p>
                  <p className="text-[#9b9b9b] text-xs">{p.sold} sold</p>
                </div>
                <p className="text-[#0f0f14] text-sm font-semibold">{formatINR(p.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-[#e8e8e5] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e8e5]">
          <p className="font-semibold text-[#0f0f14] text-sm">Recent Orders</p>
          <Link href="/admin/orders" className="text-[#0f6e56] text-xs font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e8e8e5]">
                {["Order", "Customer", "Items", "Total", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left text-[#9b9b9b] text-xs font-semibold uppercase tracking-wider px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o, i) => (
                <tr
                  key={o.id}
                  className="border-b border-[#f0f0ee] last:border-0 hover:bg-[#fafafa] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/orders/${o.id}`} className="text-[#0f6e56] font-semibold hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-[#0f0f14] font-medium">{o.customer}</td>
                  <td className="px-5 py-3.5 text-[#6b6b6b]">{o.items.length} item{o.items.length > 1 ? "s" : ""}</td>
                  <td className="px-5 py-3.5 text-[#0f0f14] font-semibold">{formatINR(o.total)}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                  <td className="px-5 py-3.5 text-[#9b9b9b] text-xs">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Second row: active products + quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Products"
          value={String(products.filter((p) => !p.comingSoon).length)}
          icon={<Package size={20} />}
          accent="#0f6e56"
        />
        <StatCard
          label="Coming Soon"
          value={String(products.filter((p) => p.comingSoon).length)}
          icon={<Clock size={20} />}
          accent="#f59e0b"
        />
        <StatCard
          label="Avg Order Value"
          value={formatINR(kpis.avgOrder)}
          change={4}
          icon={<IndianRupee size={20} />}
          accent="#6366f1"
        />
        <StatCard
          label="Delivered"
          value={String(orders.filter((o) => o.status === "delivered").length)}
          change={15}
          icon={<ShoppingBag size={20} />}
          accent="#0f6e56"
        />
      </div>
    </div>
  );
}
