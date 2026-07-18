"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Upload } from "lucide-react";
import type { LogoPlacement, Product } from "@/lib/products";
import {
  LOGO_PLACEMENTS,
  LOGO_PRESETS,
  formatINR,
} from "@/lib/products";
import { useCart } from "@/store/cart";
import { TeeMockup } from "./TeeMockup";

export function ProductConfigurator({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const [colorIdx, setColorIdx] = useState(0);
  const [size, setSize] = useState(product.sizes.includes("M") ? "M" : product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [logoId, setLogoId] = useState<string>(LOGO_PRESETS[0].id);
  const [placement, setPlacement] = useState<LogoPlacement>("chest-center");
  const [customLogo, setCustomLogo] = useState<string | undefined>();
  const [added, setAdded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const color = product.colors[colorIdx];
  const logo = LOGO_PRESETS.find((l) => l.id === logoId) ?? LOGO_PRESETS[0];
  const logoLabel = customLogo ? undefined : logo.label;
  const disabled = Boolean(product.comingSoon);

  const previewKey = useMemo(
    () => `${color.hex}-${placement}-${logoId}-${customLogo ? "c" : "p"}`,
    [color.hex, placement, logoId, customLogo]
  );

  function onUpload(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCustomLogo(String(reader.result));
      setLogoId("custom");
    };
    reader.readAsDataURL(file);
  }

  function handleAdd() {
    if (disabled) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      color: color.name,
      colorHex: color.hex,
      size,
      quantity: qty,
      logoId: customLogo ? "custom" : logoId,
      logoLabel: customLogo ? "Custom logo" : logo.label,
      logoPlacement: placement,
      customLogoDataUrl: customLogo,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="bg-surface relative" key={previewKey}>
        <TeeMockup
          color={color.hex}
          logoLabel={logoLabel ?? "brand"}
          logoDataUrl={customLogo}
          placement={placement}
          showBack={placement === "back"}
        />
        {product.comingSoon && (
          <div className="absolute inset-0 bg-ink/35 flex items-center justify-center">
            <span className="bg-chalk px-4 py-2 text-xs tracking-[0.22em] uppercase font-medium">
              Coming soon
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <div className="animate-fade-up">
          {product.badges?.[0] && (
            <p className="text-[11px] tracking-[0.2em] uppercase text-accent mb-3">
              {product.badges[0]}
            </p>
          )}
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            {product.name}
          </h1>
          <p className="mt-2 text-muted">{product.tagline}</p>
          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-2xl font-semibold">{formatINR(product.price)}</span>
            {product.compareAt && (
              <span className="text-muted line-through">
                {formatINR(product.compareAt)}
              </span>
            )}
            <span className="text-xs text-muted ml-1">incl. GST</span>
          </div>
        </div>

        <p className="mt-6 text-[15px] leading-relaxed text-ink/80 animate-fade-up-delay">
          {product.description}
        </p>

        <div className="mt-8 space-y-7 animate-fade-up-delay-2">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Colour</p>
              <p className="text-sm text-muted">{color.name}</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {product.colors.map((c, i) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setColorIdx(i)}
                  className={`h-9 w-9 rounded-full border-2 transition-transform ${
                    i === colorIdx
                      ? "border-ink scale-110"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  aria-label={c.name}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Size</p>
              <a href="/size-guide" className="text-sm text-muted underline underline-offset-2 hover:text-ink">
                Size guide
              </a>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`min-w-12 h-11 px-3 border text-sm transition-colors ${
                    size === s
                      ? "bg-ink text-chalk border-ink"
                      : "border-line hover:border-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Logo</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LOGO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setLogoId(preset.id);
                    setCustomLogo(undefined);
                  }}
                  className={`border px-3 py-3 text-left transition-colors ${
                    logoId === preset.id && !customLogo
                      ? "border-ink bg-surface"
                      : "border-line hover:border-ink/40"
                  }`}
                >
                  <span className="font-display text-sm font-bold lowercase block">
                    {preset.label}
                  </span>
                  <span className="text-[11px] text-muted mt-1 block">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={`mt-2 w-full border border-dashed px-4 py-3 text-sm flex items-center justify-center gap-2 transition-colors ${
                customLogo
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line hover:border-ink"
              }`}
            >
              <Upload size={16} strokeWidth={1.5} />
              {customLogo ? "Custom logo uploaded — change" : "Upload your logo"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
              onChange={(e) => onUpload(e.target.files?.[0])}
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Placement</p>
            <div className="flex flex-wrap gap-2">
              {LOGO_PLACEMENTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlacement(p.id)}
                  className={`px-4 h-11 border text-sm transition-colors ${
                    placement === p.id
                      ? "bg-ink text-chalk border-ink"
                      : "border-line hover:border-ink"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="inline-flex items-center border border-line h-12">
              <button
                type="button"
                className="w-11 h-full hover:bg-surface"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button
                type="button"
                className="w-11 h-full hover:bg-surface"
                onClick={() => setQty((q) => Math.min(10, q + 1))}
                aria-label="Increase"
              >
                +
              </button>
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={handleAdd}
              className="flex-1 min-w-[180px] h-12 bg-ink text-chalk text-sm font-medium tracking-wide hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
            >
              {disabled ? (
                "Coming soon"
              ) : added ? (
                <>
                  <Check size={16} /> Added to bag
                </>
              ) : (
                "Add to bag"
              )}
            </button>
          </div>
        </div>

        <dl className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-line pt-8 text-sm">
          <div>
            <dt className="text-muted text-xs tracking-[0.16em] uppercase mb-1">
              Fabric
            </dt>
            <dd>{product.fabric}</dd>
          </div>
          <div>
            <dt className="text-muted text-xs tracking-[0.16em] uppercase mb-1">
              Fit
            </dt>
            <dd>{product.fit}</dd>
          </div>
          {product.features.map((f) => (
            <div key={f} className="sm:col-span-2 flex gap-2">
              <Check size={16} className="text-accent mt-0.5 shrink-0" />
              <dd>{f}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
