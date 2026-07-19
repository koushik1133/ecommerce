"use client";

import { useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductConfigurator } from "@/components/ProductConfigurator";
import { ProductCard } from "@/components/ProductCard";
import { useAdminProducts } from "@/store/admin";

export default function ProductPage() {
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const slug = params.slug as string;
  const products = useAdminProducts((s) => s.products);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container-brand py-8 md:py-14 min-h-[50vh] flex items-center justify-center">
        <p className="text-sm font-medium tracking-widest uppercase animate-pulse">Loading product...</p>
      </div>
    );
  }

  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const related = products
    .filter((p) => p.id !== product.id && !p.comingSoon)
    .slice(0, 4);

  return (
    <div className="container-brand py-8 md:py-14">
      <nav className="text-xs text-muted mb-8 flex flex-wrap gap-2">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-ink">
          Shop
        </Link>
        <span>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <ProductConfigurator product={product} />

      <section className="mt-20 md:mt-28">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            You may also like
          </h2>
          <Link href="/shop" className="text-sm underline underline-offset-4 hover:text-accent">
            Shop all
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
