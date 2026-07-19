"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useCart } from "@/store/cart";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FLAT,
  formatINR,
} from "@/lib/products";
import { Check } from "lucide-react";

import { useAdminOrders, useAdminCustomers, useAdminSettings } from "@/store/admin";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Karnataka",
  "Kerala",
  "Maharashtra",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
  "Other",
];

export default function CheckoutClient() {
  const { items, subtotal, clearCart } = useCart();
  const { addOrder } = useAdminOrders();
  const { addCustomer } = useAdminCustomers();
  const { settings } = useAdminSettings();
  const [mounted, setMounted] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [payment, setPayment] = useState<"cod" | "upi" | "card">("cod");

  useEffect(() => {
    setMounted(true);
    // Set default payment based on what's enabled
    if (!settings.codEnabled) {
      if (settings.upiEnabled) setPayment("upi");
      else if (settings.cardEnabled) setPayment("card");
    }
  }, [settings]);

  if (!mounted) {
    return (
      <div className="container-brand py-20">
        <p className="text-muted">Loading checkout…</p>
      </div>
    );
  }

  const total = subtotal();
  const shipping = total === 0 ? 0 : total >= settings.freeShippingThreshold ? 0 : settings.shippingFlat;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = `${formData.get("address1")} ${formData.get("address2") || ""}`.trim();
    const city = formData.get("city") as string;
    const pincode = formData.get("pincode") as string;
    const state = formData.get("state") as string;

    const ordNum = 10001 + useAdminOrders.getState().orders.length;
    const id = `ord-${Date.now().toString().slice(-4)}`;

    const newOrder = {
      id,
      orderNumber: `#${ordNum}`,
      customer: name,
      email,
      phone,
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: total,
      shipping,
      total: total + shipping,
      status: "pending" as const,
      payment,
      address,
      city,
      state,
      pincode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newCustomer = {
      id: `cus-${Date.now().toString().slice(-4)}`,
      name,
      email,
      phone,
      city,
      state,
      totalOrders: 1,
      totalSpend: total + shipping,
      lastOrderAt: new Date().toISOString(),
      tags: ["New"],
      joinedAt: new Date().toISOString(),
    };

    addOrder(newOrder);
    addCustomer(newCustomer);

    setOrderId(newOrder.orderNumber);
    setPlaced(true);
    clearCart();
  }

  if (placed) {
    return (
      <div className="container-brand py-20 md:py-28 max-w-lg mx-auto text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-accent-soft text-accent flex items-center justify-center mb-6">
          <Check size={28} />
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Order confirmed
        </h1>
        <p className="mt-4 text-muted leading-relaxed">
          Thanks for joining the early access drop. Your order{" "}
          <span className="text-ink font-medium">{orderId}</span> is confirmed.
          We&apos;ll email shipping updates shortly.
        </p>
        <p className="mt-2 text-sm text-muted">
          Payment: {payment === "cod" ? "Cash on Delivery" : payment.toUpperCase()}
        </p>
        <Link
          href="/shop"
          className="mt-10 inline-flex bg-ink text-chalk px-6 py-3.5 text-sm font-medium hover:bg-accent transition-colors"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-brand py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Your bag is empty</h1>
        <Link href="/shop" className="mt-6 inline-flex underline underline-offset-4">
          Shop tees
        </Link>
      </div>
    );
  }

  return (
    <div className="container-brand py-10 md:py-16">
      <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-10">
        Checkout
      </h1>

      <form onSubmit={onSubmit} className="grid gap-12 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="space-y-10">
          <section>
            <h2 className="font-display text-xl font-semibold mb-5">Contact</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" name="name" required className="sm:col-span-2" />
              <Field label="Email" name="email" type="email" required />
              <Field label="Phone" name="phone" type="tel" required placeholder="10-digit mobile" />
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-5">
              Shipping address
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Address line 1" name="address1" required className="sm:col-span-2" />
              <Field label="Address line 2" name="address2" className="sm:col-span-2" />
              <Field label="City" name="city" required />
              <Field label="PIN code" name="pincode" required pattern="[0-9]{6}" />
              <div className="sm:col-span-2">
                <label className="block text-sm mb-1.5" htmlFor="state">
                  State
                </label>
                <select
                  id="state"
                  name="state"
                  required
                  className="w-full border border-line bg-chalk px-4 py-3 text-sm focus:outline-none focus:border-ink"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select state
                  </option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-5">Payment</h2>
            <div className="space-y-3">
              {[
                settings.codEnabled && { id: "cod", label: "Cash on Delivery", hint: "Pay when your order arrives" },
                settings.upiEnabled && { id: "upi", label: "UPI", hint: "GPay, PhonePe, Paytm & more" },
                settings.cardEnabled && { id: "card", label: "Card", hint: "Visa, Mastercard, RuPay" },
              ]
                .filter(Boolean)
                .map((opt: any) => (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3 border p-4 cursor-pointer transition-colors ${
                      payment === opt.id ? "border-ink bg-surface" : "border-line"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="mt-1 accent-[var(--accent)]"
                      checked={payment === opt.id}
                      onChange={() => setPayment(opt.id)}
                    />
                    <span>
                      <span className="block text-sm font-medium">{opt.label}</span>
                      <span className="block text-xs text-muted mt-0.5">{opt.hint}</span>
                    </span>
                  </label>
                ))}
            </div>
            {payment !== "cod" && (
              <p className="mt-3 text-xs text-muted">
                Demo checkout — no real payment is processed. Your order will still
                be confirmed locally.
              </p>
            )}
          </section>
        </div>

        <aside className="h-fit lg:sticky lg:top-28 bg-surface p-6 md:p-8">
          <h2 className="font-display text-xl font-semibold mb-5">Order summary</h2>
          <ul className="space-y-4 mb-6">
            {items.map((item) => (
              <li key={item.key} className="flex justify-between gap-3 text-sm">
                <span>
                  {item.name} × {item.quantity}
                  <span className="block text-xs text-muted">
                    {item.color} / {item.size}
                  </span>
                </span>
                <span className="whitespace-nowrap">
                  {formatINR(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 text-sm border-t border-line pt-4">
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
          <button
            type="submit"
            className="mt-6 w-full bg-ink text-chalk py-3.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            Place order
          </button>
          <p className="mt-3 text-[11px] text-muted leading-relaxed">
            By placing this order you agree to our{" "}
            <Link href="/terms" className="underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  pattern,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  pattern?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm mb-1.5" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        pattern={pattern}
        className="w-full border border-line bg-chalk px-4 py-3 text-sm focus:outline-none focus:border-ink"
      />
    </div>
  );
}
