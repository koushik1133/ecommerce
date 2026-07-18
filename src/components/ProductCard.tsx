import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatINR } from "@/lib/products";
import { TeeMockup } from "./TeeMockup";

export function ProductCard({ product }: { product: Product }) {
  const color = product.colors[0];

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="relative bg-surface overflow-hidden">
        <TeeMockup
          color={color.hex}
          logoLabel="brand"
          placement="chest-center"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {product.comingSoon && (
          <span className="absolute top-3 left-3 bg-ink text-chalk text-[10px] tracking-[0.18em] uppercase px-2.5 py-1">
            Coming soon
          </span>
        )}
        {product.badges?.[0] && !product.comingSoon && (
          <span className="absolute top-3 left-3 bg-chalk/90 text-ink text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 border border-line">
            {product.badges[0]}
          </span>
        )}
      </div>
      <div className="pt-4 space-y-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-medium text-[15px] group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          <div className="text-right shrink-0">
            <p className="text-sm font-medium">{formatINR(product.price)}</p>
            {product.compareAt && (
              <p className="text-xs text-muted line-through">
                {formatINR(product.compareAt)}
              </p>
            )}
          </div>
        </div>
        <p className="text-sm text-muted">{product.tagline}</p>
        <div className="flex gap-1.5 pt-2">
          {product.colors.slice(0, 5).map((c) => (
            <span
              key={c.slug}
              className="h-3 w-3 rounded-full border border-black/10"
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
