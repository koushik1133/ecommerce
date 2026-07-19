"use client";

import type { DayRevenue } from "@/lib/admin-data";

type Props = {
  data: DayRevenue[];
  days?: 7 | 30 | 90;
};

function formatK(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n}`;
}

export function SalesChart({ data, days = 30 }: Props) {
  const slice = data.slice(-days);
  const maxRevenue = Math.max(...slice.map((d) => d.revenue), 1);
  const totalRevenue = slice.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = slice.reduce((s, d) => s + d.orders, 0);

  const W = 100;
  const H = 60;

  // Build SVG path
  const pts = slice.map((d, i) => {
    const x = (i / (slice.length - 1)) * W;
    const y = H - (d.revenue / maxRevenue) * (H - 4) - 2;
    return `${x},${y}`;
  });

  const linePath = `M ${pts.join(" L ")}`;
  const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`;

  // Labels: first, mid, last date
  const labelIdxs = [0, Math.floor(slice.length / 2), slice.length - 1];

  return (
    <div className="bg-white border border-[#e8e8e5] rounded-2xl p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[#6b6b6b] text-xs font-medium uppercase tracking-wider">Revenue</p>
          <p className="text-[#0f0f14] text-2xl font-bold mt-0.5">{formatK(totalRevenue)}</p>
          <p className="text-[#9b9b9b] text-xs mt-0.5">{totalOrders} orders · last {days} days</p>
        </div>
        <div className="flex gap-2">
          {([7, 30, 90] as const).map((d) => (
            <span
              key={d}
              className={`text-xs px-2.5 py-1 rounded-lg cursor-pointer font-medium transition ${
                d === days
                  ? "bg-[#0f0f14] text-white"
                  : "bg-[#f0f0ee] text-[#6b6b6b] hover:bg-[#e8e8e5]"
              }`}
            >
              {d}d
            </span>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-36"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f6e56" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0f6e56" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Area fill */}
          <path d={areaPath} fill="url(#chartGrad)" />
          {/* Line */}
          <path d={linePath} fill="none" stroke="#0f6e56" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
          {/* Data dots (every ~7th) */}
          {slice.map((d, i) => {
            if (i % Math.max(1, Math.floor(slice.length / 8)) !== 0) return null;
            const x = (i / (slice.length - 1)) * W;
            const y = H - (d.revenue / maxRevenue) * (H - 4) - 2;
            return (
              <circle key={i} cx={x} cy={y} r="0.9" fill="#0f6e56" />
            );
          })}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute top-0 left-0 h-full flex flex-col justify-between pointer-events-none py-1">
          {[maxRevenue, maxRevenue / 2, 0].map((v, i) => (
            <span key={i} className="text-[9px] text-[#c0c0bb] font-mono">{formatK(v)}</span>
          ))}
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between mt-1">
          {labelIdxs.map((idx) => (
            <span key={idx} className="text-[9px] text-[#c0c0bb]">
              {slice[idx]?.date.slice(5) ?? ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
