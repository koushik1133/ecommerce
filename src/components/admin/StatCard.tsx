"use client";

import type { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type Props = {
  label: string;
  value: string;
  change?: number; // percent, positive = up
  icon: ReactNode;
  accent?: string;
};

export function StatCard({ label, value, change, icon, accent = "#0f6e56" }: Props) {
  const up = change !== undefined && change > 0;
  const down = change !== undefined && change < 0;

  return (
    <div className="bg-white border border-[#e8e8e5] rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: accent + "18" }}
        >
          <span style={{ color: accent }}>{icon}</span>
        </div>
        {change !== undefined && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
              up
                ? "bg-green-50 text-green-700"
                : down
                ? "bg-red-50 text-red-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {up ? <TrendingUp size={12} /> : down ? <TrendingDown size={12} /> : <Minus size={12} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-[#6b6b6b] text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-[#0f0f14] text-2xl font-bold mt-1">{value}</p>
      </div>
    </div>
  );
}
