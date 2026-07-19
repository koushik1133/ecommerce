import type { Metadata } from "next";
import Link from "next/link";
import { StudioConfigurator } from "@/components/StudioConfigurator";
import { getProduct, products } from "@/lib/products";

export const metadata: Metadata = {
  title: "3D Configurator",
  description:
    "Upload your design, pick garment colour, animate, and export a custom 360° T-shirt mockup.",
};

type SearchParams = Promise<{ product?: string }>;

export default async function ConfiguratorPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { product: slug } = await searchParams;
  const product =
    (slug ? getProduct(slug) : undefined) ??
    getProduct("studio-tee") ??
    products.find((p) => !p.comingSoon);

  if (!product) {
    return (
      <div className="container-brand py-20 text-center">
        <p>Product unavailable.</p>
        <Link href="/shop" className="underline">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container-brand py-4 md:py-6">
      <div className="flex items-center justify-between gap-4 mb-3 px-1">
        <nav className="text-xs text-muted flex flex-wrap gap-2">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <span>/</span>
          <span className="text-ink">Configurator</span>
        </nav>
        <Link
          href={`/product/${product.slug}`}
          className="text-xs text-muted hover:text-ink underline underline-offset-4"
        >
          Back to {product.name}
        </Link>
      </div>
      <StudioConfigurator product={product} />
    </div>
  );
}
