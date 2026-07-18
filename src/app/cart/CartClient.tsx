"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/store/cart";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FLAT,
  formatINR,
} from "@/lib/products";
import { useEffect, useState } from "react";

export default function CartClient() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="container-brand py-20">
        <p className="text-muted">Loading bag…</p>
      </div>
    );
  }

  const total = subtotal();
  const shipping = total === 0 ? 0 : total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;

  return (
    <div className="container-brand py-10 md:py-16">
      <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-10">
        Your bag
      </h1>

      {items.length === 0 ? (
        <div className="py-16 text-center max-w-md mx-auto">
          <p className="font-display text-2xl font-semibold">Nothing here yet</p>
          <p className="mt-3 text-muted">
            Early access tees are live — pick a fit and add your logo.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex bg-ink text-chalk px-6 py-3.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.8fr]">
          <ul className="divide-y divide-line border-y border-line">
            {items.map((item) => (
              <li key={item.key} className="py-6 flex gap-4 md:gap-6">
                <div
                  className="w-24 h-28 md:w-28 md:h-32 shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: item.colorHex }}
                >
                  <span
                    className="font-display font-bold text-sm"
                    style={{
                      color:
                        ["#1a1a1a", "#1b2a41", "#1f4d3a"].includes(
                          item.colorHex.toLowerCase()
                        )
                          ? "#fafaf9"
                          : "#141414",
                    }}
                  >
                    {item.logoLabel?.slice(0, 8) || "brand"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link
                        href={`/product/${item.slug}`}
                        className="font-medium hover:text-accent"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-muted mt-1">
                        {item.color} / {item.size}
                      </p>
                      {item.logoPlacement && (
                        <p className="text-xs text-muted mt-1 capitalize">
                          Logo: {item.logoLabel} · {item.logoPlacement.replace("-", " ")}
                        </p>
                      )}
                    </div>
                    <p className="font-medium whitespace-nowrap">
                      {formatINR(item.price * item.quantity)}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="inline-flex items-center border border-line">
                      <button
                        type="button"
                        className="p-2.5 hover:bg-surface"
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        className="p-2.5 hover:bg-surface"
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      className="text-muted hover:text-ink p-1"
                      aria-label="Remove"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit lg:sticky lg:top-28 bg-surface p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold mb-5">Order summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatINR(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-line text-base font-semibold">
                <span>Total</span>
                <span>{formatINR(total + shipping)}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted">
              Free shipping on orders over {formatINR(FREE_SHIPPING_THRESHOLD)}. COD
              available at checkout.
            </p>
            <Link
              href="/checkout"
              className="mt-6 block w-full text-center bg-ink text-chalk py-3.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              Checkout
            </Link>
            <Link
              href="/shop"
              className="mt-3 block w-full text-center text-sm text-muted hover:text-ink py-2"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
