"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/store/cart";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FLAT,
  formatINR,
} from "@/lib/products";

export function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } =
    useCart();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const total = subtotal();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const shipping = total === 0 ? 0 : total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;

  return (
    <>
      <div
        className={`fixed inset-0 z-[70] bg-ink/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />
      <aside
        className={`fixed top-0 right-0 z-[80] h-full w-full max-w-md bg-chalk shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        aria-hidden={!isOpen}
        aria-label="Shopping cart"
        inert={!isOpen ? true : undefined}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div>
            <h2 className="font-display text-xl font-semibold">Your bag</h2>
            <p className="text-xs text-muted mt-0.5">
              {items.reduce((n, i) => n + i.quantity, 0)} item
              {items.reduce((n, i) => n + i.quantity, 0) === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="p-2 -mr-2 hover:text-accent"
            aria-label="Close cart"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {total > 0 && (
          <div className="px-5 py-3 bg-accent-soft border-b border-line text-xs">
            {remaining > 0 ? (
              <p>
                Add <span className="font-semibold">{formatINR(remaining)}</span> more
                for free shipping
              </p>
            ) : (
              <p className="text-accent font-medium">You unlocked free shipping</p>
            )}
            <div className="mt-2 h-1 rounded-full bg-white overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-500"
                style={{
                  width: `${Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-16">
              <p className="font-display text-2xl font-semibold">Your bag is empty</p>
              <p className="text-sm text-muted max-w-[240px]">
                Early access tees are live. Pick a cut, choose a logo, and start your drop.
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="mt-2 inline-flex bg-ink text-chalk px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
              >
                Shop tees
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4">
                  <div
                    className="w-20 h-24 shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: item.colorHex }}
                  >
                    <span
                      className="font-display text-sm font-bold"
                      style={{
                        color:
                          item.colorHex.toLowerCase() === "#1a1a1a" ||
                          item.colorHex.toLowerCase() === "#1b2a41" ||
                          item.colorHex.toLowerCase() === "#1f4d3a"
                            ? "#fafaf9"
                            : "#141414",
                      }}
                    >
                      {item.logoLabel?.slice(0, 6) || "brand"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <div>
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="font-medium text-sm hover:text-accent"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-muted mt-1">
                          {item.color} / {item.size}
                          {item.logoPlacement
                            ? ` · ${item.logoPlacement.replace("-", " ")}`
                            : ""}
                        </p>
                      </div>
                      <p className="text-sm font-medium whitespace-nowrap">
                        {formatINR(item.price * item.quantity)}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center border border-line">
                        <button
                          type="button"
                          className="p-2 hover:bg-surface"
                          onClick={() =>
                            updateQuantity(item.key, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          className="p-2 hover:bg-surface"
                          onClick={() =>
                            updateQuantity(item.key, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="text-xs text-muted hover:text-ink underline underline-offset-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line px-5 py-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-medium">{formatINR(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Shipping</span>
              <span className="font-medium">
                {shipping === 0 ? "Free" : formatINR(shipping)}
              </span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t border-line">
              <span className="font-medium">Estimated total</span>
              <span className="font-semibold">{formatINR(total + shipping)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center bg-ink hover:bg-accent text-chalk py-3.5 text-sm font-medium tracking-wide transition-colors"
            >
              Checkout
            </Link>
            <button
              type="button"
              onClick={closeCart}
              className="block w-full text-center text-sm text-muted hover:text-ink py-1"
            >
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
