"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/store/cart";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/configurator", label: "Configurator" },
  { href: "/about", label: "About" },
  { href: "/size-guide", label: "Size guide" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const openCart = useCart((s) => s.openCart);
  const itemCount = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    useCart.getState().closeCart();
  }, [pathname]);

  return (
    <>
      <div className="bg-ink text-chalk text-[11px] tracking-[0.18em] uppercase">
        <div className="overflow-hidden whitespace-nowrap py-2.5">
          <div className="animate-marquee inline-flex min-w-full gap-10">
            {[0, 1].map((copy) => (
              <div key={copy} className="inline-flex gap-10 px-5">
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-soft" />
                  Coming Soon — Early access open
                </span>
                <span>Pan-India shipping · COD available</span>
                <span>Free delivery over ₹1,999</span>
                <span>T-shirts only · More drops ahead</span>
                <span>Custom logo printing available</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-chalk/90 backdrop-blur-md border-b border-line shadow-[0_1px_0_rgba(0,0,0,0.03)]"
            : "bg-chalk/80 backdrop-blur-sm border-b border-transparent"
        }`}
      >
        <div className="container-brand flex h-16 md:h-[4.5rem] items-center justify-between gap-4">
          <button
            type="button"
            className="md:hidden p-2 -ml-2 text-ink"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          <nav className="hidden md:flex items-center gap-7 text-[13px] tracking-wide">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-accent ${
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "text-ink font-medium"
                    : "text-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-display text-[1.65rem] md:text-[1.85rem] font-bold tracking-tight lowercase leading-none"
          >
            brand
          </Link>

          <div className="flex items-center gap-1 ml-auto md:ml-0">
            <Link
              href="/shop"
              className="hidden sm:inline-flex p-2 text-ink hover:text-accent transition-colors"
              aria-label="Search shop"
            >
              <Search size={20} strokeWidth={1.5} />
            </Link>
            <button
              type="button"
              onClick={openCart}
              className="relative p-2 text-ink hover:text-accent transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {mounted && itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-accent text-white text-[10px] font-semibold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-[min(86vw,320px)] bg-chalk p-6 flex flex-col animate-fade-up">
            <div className="flex items-center justify-between mb-10">
              <span className="font-display text-2xl font-bold lowercase">brand</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="p-2 -mr-2"
              >
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>
            <nav className="flex flex-col gap-5">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-display text-3xl font-semibold tracking-tight"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/faq" className="text-muted pt-4 border-t border-line">
                FAQ
              </Link>
              <Link href="/shipping" className="text-muted">
                Shipping & returns
              </Link>
            </nav>
            <p className="mt-auto text-xs tracking-[0.2em] uppercase text-muted">
              Coming Soon · India
            </p>
          </aside>
        </div>
      )}
    </>
  );
}
