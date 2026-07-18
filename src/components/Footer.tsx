"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const FOOTER_LINKS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All tees" },
      { href: "/shop?filter=essentials", label: "Essentials" },
      { href: "/shop?filter=premium", label: "Premium" },
      { href: "/shop?filter=graphics", label: "Graphics" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/size-guide", label: "Size guide" },
      { href: "/shipping", label: "Shipping & returns" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About brand" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  const [done, setDone] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setDone(true);
  }

  return (
    <footer className="mt-auto border-t border-line bg-ink text-chalk">
      <div className="container-brand py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="font-display text-3xl font-bold lowercase">
              brand
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
              An India-first T-shirt label. Clean cuts, honest fabrics, and logo
              customization — launching soon with early access open now.
            </p>
            <form className="mt-8 flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
              <label className="sr-only" htmlFor="footer-email">
                Email for launch updates
              </label>
              <input
                id="footer-email"
                type="email"
                required
                disabled={done}
                placeholder="Email for launch updates"
                className="w-full bg-white/5 border border-white/15 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-accent disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={done}
                className="bg-accent hover:bg-accent-hover disabled:bg-accent/70 text-white px-5 py-3 text-sm font-medium tracking-wide transition-colors whitespace-nowrap"
              >
                {done ? "You're on the list" : "Notify me"}
              </button>
            </form>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h3 className="text-[11px] tracking-[0.22em] uppercase text-white/45 mb-4">
                {col.title}
              </h3>
              <ul className="space-y-3 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/75 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-white/45">
          <p>© 2026 brand. Made in India.</p>
          <p>Prices in INR · GST inclusive where applicable</p>
        </div>
      </div>
    </footer>
  );
}
