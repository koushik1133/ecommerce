import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { TeeMockup } from "@/components/TeeMockup";
import { products } from "@/lib/products";

export default function HomePage() {
  const featured = products.filter((p) => !p.comingSoon).slice(0, 4);

  return (
    <>
      <section className="relative min-h-[88vh] md:min-h-[92vh] flex items-center hero-mesh overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-[8%] top-[12%] w-[52%] max-w-xl rotate-6 opacity-50">
            <TeeMockup color="#1A1A1A" logoLabel="brand" placement="chest-center" />
          </div>
          <div className="absolute left-[-8%] bottom-[-2%] w-[38%] max-w-md -rotate-6 opacity-35 hidden md:block">
            <TeeMockup color="#F2F0EB" logoLabel="brand." placement="chest-left" />
          </div>
        </div>

        <div className="container-brand relative z-10 py-24 md:py-28 w-full">
          <p className="animate-fade-up text-[11px] tracking-[0.28em] uppercase text-white/75 mb-5">
            Coming soon · Early access open
          </p>
          <h1 className="animate-fade-up-delay font-display text-[clamp(4rem,14vw,9rem)] font-extrabold leading-[0.88] tracking-tight text-white lowercase max-w-4xl drop-shadow-sm">
            brand
          </h1>
          <p className="animate-fade-up-delay-2 mt-6 max-w-md text-base md:text-lg text-white/80 leading-relaxed">
            Premium T-shirts for India. Clean fits, custom logos, and a first
            drop worth waiting for.
          </p>
          <div className="animate-fade-up-delay-2 mt-9 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-chalk text-ink px-7 py-3.5 text-sm font-semibold tracking-wide hover:bg-white transition-colors"
            >
              Shop the drop
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center border border-white/40 text-white px-7 py-3.5 text-sm font-medium tracking-wide hover:bg-white/10 transition-colors"
            >
              Our story
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-chalk">
        <div className="container-brand py-10 md:py-12 grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Made for India",
              body: "Breathable cottons, monsoon-friendly weights, pan-India shipping with COD.",
            },
            {
              title: "Logo your way",
              body: "Pick a preset mark or upload yours. Live preview on chest or back.",
            },
            {
              title: "T-shirts only — for now",
              body: "We're launching with tees. Hoodies, caps, and more are coming soon.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h2 className="font-display text-xl font-semibold tracking-tight">
                {item.title}
              </h2>
              <p className="mt-2 text-sm text-muted leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-brand py-16 md:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
              Early access
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              The first tees
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-sm font-medium underline underline-offset-4 hover:text-accent"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="noise-bg border-y border-line">
        <div className="container-brand py-16 md:py-24 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase text-accent mb-3">
              Customize
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              Change the logo.
              <br />
              Make it yours.
            </h2>
            <p className="mt-5 text-muted leading-relaxed max-w-md">
              Every customizable tee lets you switch presets, upload a mark, and
              place it chest-left, center, or on the back — with a live preview
              before you add to bag.
            </p>
            <Link
              href="/product/monogram-tee"
              className="mt-8 inline-flex bg-ink text-chalk px-6 py-3.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              Try Monogram Tee
            </Link>
          </div>
          <div className="bg-chalk/70 p-4 md:p-8">
            <div className="grid grid-cols-3 gap-3">
              {[
                { color: "#1A1A1A", label: "brand", place: "chest-center" as const },
                { color: "#F2F0EB", label: "B", place: "chest-left" as const },
                { color: "#1F4D3A", label: "BRAND®", place: "back" as const },
              ].map((tee) => (
                <div key={tee.label + tee.color} className="bg-surface">
                  <TeeMockup
                    color={tee.color}
                    logoLabel={tee.label}
                    placement={tee.place}
                    showBack={tee.place === "back"}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-brand py-16 md:py-24 text-center max-w-2xl mx-auto">
        <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-3">
          Coming soon
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
          More than tees is on the way
        </h2>
        <p className="mt-4 text-muted leading-relaxed">
          Hoodies, caps, and seasonal drops are in the works. Join the list and
          be first when brand expands beyond T-shirts.
        </p>
        <Link
          href="/contact"
          className="mt-8 inline-flex border border-ink px-7 py-3.5 text-sm font-medium hover:bg-ink hover:text-chalk transition-colors"
        >
          Get launch updates
        </Link>
      </section>
    </>
  );
}
