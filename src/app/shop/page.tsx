"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useAdminProducts } from "@/store/admin";
import { ShopFilters } from "@/components/ShopFilters";

function ShopContent() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") ?? "all";
  const products = useAdminProducts((s) => s.products);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container-brand py-10 md:py-16 min-h-[50vh] flex items-center justify-center">
        <p className="text-sm font-medium tracking-widest uppercase animate-pulse">Loading shop...</p>
      </div>
    );
  }

  // Sort products by priority (ascending)
  const sortedProducts = [...products].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  const filtered =
    filter === "all"
      ? sortedProducts
      : sortedProducts.filter((p) => p.category === filter);

  return (
    <div className="container-brand py-10 md:py-16">
      <div className="max-w-2xl mb-10">
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
          Coming soon · Early access
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
          Shop tees
        </h1>
        <p className="mt-3 text-muted leading-relaxed">
          Only T-shirts for now — every piece ships pan-India with COD and logo
          customization options.
        </p>
      </div>

      <ShopFilters active={filter} count={filtered.length} />

      <div className="mt-10 grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-8">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-20 text-center text-muted">No tees in this filter yet.</p>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="container-brand py-10 md:py-16 min-h-[50vh] flex items-center justify-center">
        <p className="text-sm font-medium tracking-widest uppercase animate-pulse">Loading shop...</p>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
