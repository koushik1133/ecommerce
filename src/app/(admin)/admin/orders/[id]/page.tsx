"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, Package, IndianRupee } from "lucide-react";
import { useAdminOrders } from "@/store/admin";
import { StatusBadge, PaymentBadge } from "@/components/admin/Badges";
import { formatINR } from "@/lib/products";
import type { OrderStatus } from "@/lib/admin-data";

const STATUS_FLOW: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { orders, updateOrderStatus } = useAdminOrders();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-[#0f0f14] font-bold text-lg">Order not found</p>
          <Link href="/admin/orders" className="text-[#0f6e56] text-sm mt-2 hover:underline block">← Back to orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Back */}
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="p-2 rounded-xl border border-[#e2e2df] bg-white hover:bg-[#f0f0ee] text-[#0f0f14] transition">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-[#0f0f14] font-bold text-xl">{order.orderNumber}</h2>
            <StatusBadge status={order.status} />
            <PaymentBadge method={order.payment} />
          </div>
          <p className="text-[#9b9b9b] text-xs mt-0.5">
            {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}
          </p>
        </div>
      </div>

      {/* Status Stepper */}
      {order.status !== "cancelled" && (
        <div className="bg-white border border-[#e8e8e5] rounded-2xl p-5">
          <p className="text-[#0f0f14] font-semibold text-sm mb-4">Order Timeline</p>
          <div className="flex items-center gap-0">
            {STATUS_FLOW.map((s, i) => {
              const currentIdx = STATUS_FLOW.indexOf(order.status);
              const done = i <= currentIdx;
              const active = i === currentIdx;
              return (
                <div key={s} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${
                        active
                          ? "bg-[#0f6e56] border-[#0f6e56] text-white"
                          : done
                          ? "bg-[#0f6e56]/20 border-[#0f6e56] text-[#0f6e56]"
                          : "bg-white border-[#e2e2df] text-[#c0c0bb]"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                    <p className={`text-xs capitalize text-center ${done ? "text-[#0f0f14] font-semibold" : "text-[#c0c0bb]"}`}>{s}</p>
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div className={`h-0.5 flex-1 -mt-5 ${i < currentIdx ? "bg-[#0f6e56]" : "bg-[#e2e2df]"}`} />
                  )}
                </div>
              );
            })}
          </div>
          {/* Status update buttons */}
          <div className="flex gap-2 flex-wrap mt-5 pt-4 border-t border-[#e8e8e5]">
            <p className="text-[#6b6b6b] text-xs w-full mb-1">Update status:</p>
            {(["pending", "processing", "shipped", "delivered", "cancelled"] as OrderStatus[]).map((s) => (
              <button
                key={s}
                disabled={order.status === s}
                onClick={() => updateOrderStatus(order.id, s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition ${
                  order.status === s
                    ? "bg-[#0f6e56] text-white border-[#0f6e56] cursor-default"
                    : "bg-white text-[#6b6b6b] border-[#e2e2df] hover:bg-[#f0f0ee]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {/* Line Items */}
        <div className="bg-white border border-[#e8e8e5] rounded-2xl overflow-hidden md:col-span-2">
          <div className="px-5 py-4 border-b border-[#e8e8e5]">
            <p className="text-[#0f0f14] font-semibold text-sm">Items</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e8e8e5] bg-[#fafaf9]">
                {["Product", "Variant", "Qty", "Price", "Total"].map((h) => (
                  <th key={h} className="text-left text-[#9b9b9b] text-xs font-semibold uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-[#f0f0ee] last:border-0">
                  <td className="px-5 py-3.5 text-[#0f0f14] font-medium">{item.name}</td>
                  <td className="px-5 py-3.5 text-[#6b6b6b]">{item.color} / {item.size}</td>
                  <td className="px-5 py-3.5 text-[#6b6b6b]">{item.quantity}</td>
                  <td className="px-5 py-3.5">{formatINR(item.price)}</td>
                  <td className="px-5 py-3.5 font-semibold text-[#0f0f14]">{formatINR(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Totals */}
          <div className="px-5 py-4 border-t border-[#e8e8e5] space-y-2">
            <div className="flex justify-between text-sm text-[#6b6b6b]">
              <span>Subtotal</span><span>{formatINR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#6b6b6b]">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? "Free" : formatINR(order.shipping)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#0f0f14] pt-2 border-t border-[#e8e8e5]">
              <span>Total</span><span>{formatINR(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white border border-[#e8e8e5] rounded-2xl p-5">
          <p className="text-[#0f0f14] font-semibold text-sm mb-4">Customer</p>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-[#6b6b6b]">
              <div className="w-9 h-9 rounded-xl bg-[#0f0f14] flex items-center justify-center text-white font-bold text-sm">
                {order.customer[0]}
              </div>
              <div>
                <p className="text-[#0f0f14] font-semibold">{order.customer}</p>
                <p className="text-xs">{order.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#6b6b6b]">
              <Phone size={14} className="text-[#9b9b9b]" />
              {order.phone}
            </div>
            <div className="flex items-center gap-2 text-sm text-[#6b6b6b]">
              <Mail size={14} className="text-[#9b9b9b]" />
              {order.email}
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white border border-[#e8e8e5] rounded-2xl p-5">
          <p className="text-[#0f0f14] font-semibold text-sm mb-4">Shipping Address</p>
          <div className="flex gap-2 text-sm text-[#6b6b6b]">
            <MapPin size={15} className="text-[#9b9b9b] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[#0f0f14] font-medium">{order.customer}</p>
              <p>{order.address}</p>
              <p>{order.city}, {order.state} — {order.pincode}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
