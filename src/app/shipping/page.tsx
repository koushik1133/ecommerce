import type { Metadata } from "next";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT, formatINR } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description: "Shipping, COD, and returns policy for brand India.",
};

export default function ShippingPage() {
  return (
    <div className="container-brand py-10 md:py-16 max-w-3xl prose-brand">
      <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
        Shipping & returns
      </h1>

      <section className="mt-10 space-y-4">
        <h2 className="font-display text-2xl font-semibold">Shipping</h2>
        <p className="text-muted leading-relaxed">
          We ship across India. Flat rate {formatINR(SHIPPING_FLAT)} on orders
          under {formatINR(FREE_SHIPPING_THRESHOLD)}. Free shipping above that
          threshold. Most metro orders arrive in 3–5 business days.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-display text-2xl font-semibold">Cash on Delivery</h2>
        <p className="text-muted leading-relaxed">
          COD is available on eligible PIN codes. Please keep the exact amount
          ready for the courier partner.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-display text-2xl font-semibold">Returns & exchanges</h2>
        <p className="text-muted leading-relaxed">
          Unworn items with original tags can be exchanged within 7 days of
          delivery. Custom logo prints are final sale except for print defects
          or manufacturing issues — email hello@brand.in with photos within 48
          hours of delivery.
        </p>
      </section>
    </div>
  );
}
