"use client";

import { useState, useMemo } from "react";
import { Search, Users, ShoppingBag, IndianRupee } from "lucide-react";
import { useAdminCustomers } from "@/store/admin";
import { formatINR } from "@/lib/products";

export default function CustomersPage() {
  const { customers } = useAdminCustomers();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      return (
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.city.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [customers, search]);

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpend, 0);
  const avgSpend = customers.length ? Math.round(totalRevenue / customers.length) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Customers", value: String(customers.length), icon: <Users size={18} /> },
          { label: "Total Revenue", value: formatINR(totalRevenue), icon: <IndianRupee size={18} /> },
          { label: "Avg. Spend", value: formatINR(avgSpend), icon: <ShoppingBag size={18} /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white border border-[#e8e8e5] rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#0f6e56]/10 flex items-center justify-center text-[#0f6e56]">
              {icon}
            </div>
            <div>
              <p className="text-[#9b9b9b] text-xs font-medium uppercase tracking-wide">{label}</p>
              <p className="text-[#0f0f14] font-bold text-lg">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-[#e2e2df] rounded-xl px-3 py-2.5 max-w-sm">
        <Search size={15} className="text-[#9b9b9b] flex-shrink-0" />
        <input
          placeholder="Search by name, email or city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm outline-none bg-transparent text-[#0f0f14] placeholder:text-[#9b9b9b]"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e8e8e5] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e8e8e5] bg-[#fafaf9]">
                {["Customer", "Location", "Orders", "Total Spend", "Tags", "Last Order"].map((h) => (
                  <th key={h} className="text-left text-[#9b9b9b] text-xs font-semibold uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-[#9b9b9b]">No customers found.</td></tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-[#f0f0ee] last:border-0 hover:bg-[#fafafa] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#0f0f14] flex items-center justify-center text-white font-bold text-sm">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="text-[#0f0f14] font-semibold">{c.name}</p>
                        <p className="text-[#9b9b9b] text-xs">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[#6b6b6b]">
                    {c.city}, {c.state}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-[#0f0f14]">{c.totalOrders}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[#0f0f14] font-semibold">
                    {formatINR(c.totalSpend)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1 flex-wrap">
                      {c.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            tag === "VIP"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : tag === "Repeat"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-[#f0f0ee] text-[#6b6b6b] border border-[#e2e2df]"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[#9b9b9b] text-xs">
                    {new Date(c.lastOrderAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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
