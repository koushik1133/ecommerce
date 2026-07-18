import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "About brand — an India-first T-shirt label launching soon.",
};

export default function AboutPage() {
  return (
    <div>
      <section className="noise-bg border-b border-line">
        <div className="container-brand py-16 md:py-24 max-w-3xl">
          <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-3">
            Coming soon
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight lowercase">
            brand is building the everyday tee India actually wants to wear.
          </h1>
        </div>
      </section>

      <section className="container-brand py-14 md:py-20 max-w-3xl space-y-6 text-[15px] leading-relaxed text-ink/85">
        <p>
          We started brand because most tees either felt like merch — stiff, loud,
          forgettable — or like basics that disappear after two washes. We wanted
          something quieter: honest fabric, a clean silhouette, and room to make
          it yours with a logo.
        </p>
        <p>
          Right now we only sell T-shirts. That is intentional. One category,
          done properly, before we expand into hoodies, caps, and seasonal drops.
          Early access is open while we prepare the full launch across India.
        </p>
        <p>
          Every order ships pan-India with GST-ready invoices, COD where available,
          and a simple 7-day exchange window on unused pieces.
        </p>
        <div className="pt-4 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="inline-flex bg-ink text-chalk px-6 py-3.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            Shop early access
          </Link>
          <Link
            href="/contact"
            className="inline-flex border border-ink px-6 py-3.5 text-sm font-medium hover:bg-ink hover:text-chalk transition-colors"
          >
            Talk to us
          </Link>
        </div>
      </section>
    </div>
  );
}
