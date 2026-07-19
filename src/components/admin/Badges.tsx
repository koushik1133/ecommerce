"use client";

import type { Order } from "@/lib/admin-data";

type StatusBadgeProps = { status: Order["status"] };

const STATUS_STYLES: Record<Order["status"], string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

export function PaymentBadge({ method }: { method: Order["payment"] }) {
  const labels = { cod: "COD", upi: "UPI", card: "Card" };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#f0f0ee] text-[#6b6b6b] border border-[#e2e2df]">
      {labels[method]}
    </span>
  );
}
