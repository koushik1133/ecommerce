"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Check, ImageIcon, Sparkles, Upload } from "lucide-react";
import type { LogoPlacement, Product } from "@/lib/products";
import {
  LOGO_PLACEMENTS,
  LOGO_PRESETS,
  formatINR,
} from "@/lib/products";
import { useCart } from "@/store/cart";
import {
  STUDIO_BACKGROUNDS,
  type StudioBackground,
} from "@/lib/studio";
import { PhotoGallery } from "@/components/spin/PhotoGallery";
import { Tee3DViewer } from "@/components/spin/Tee3DViewer";
import {
  readFileAsDataUrl,
  uploadErrorMessage,
  validateImageContents,
} from "@/lib/uploads";

export function ProductConfigurator({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const [colorIdx, setColorIdx] = useState(0);
  const [size, setSize] = useState(product.sizes.includes("M") ? "M" : product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [logoId, setLogoId] = useState<string>(LOGO_PRESETS[0].id);
  const [placement, setPlacement] = useState<LogoPlacement>("chest-center");
  const [customLogo, setCustomLogo] = useState<string | undefined>();
  const [background, setBackground] = useState<StudioBackground>(STUDIO_BACKGROUNDS[0]);
  const [customBg, setCustomBg] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<"photos" | "3d">("photos");
  const [added, setAdded] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);

  const color = product.colors[colorIdx];
  const logo = LOGO_PRESETS.find((l) => l.id === logoId) ?? LOGO_PRESETS[0];
  const logoLabel = customLogo ? undefined : logo.label;
  const disabled = Boolean(product.comingSoon);
  const gallery =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [
          { src: "mock-front", label: "Front" },
          { src: "mock-back", label: "Back" },
          { src: "mock-left", label: "Left side" },
          { src: "mock-right", label: "Right side" },
        ];

  async function onUpload(file: File | undefined) {
    if (!file) return;
    const err = await validateImageContents(file);
    if (err) {
      setUploadError(uploadErrorMessage(err));
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setCustomLogo(dataUrl);
      setLogoId("custom");
      setUploadError(null);
      setViewMode("3d");
    } catch {
      setUploadError("Could not read that logo file.");
    }
  }

  async function onBgUpload(file: File | undefined) {
    if (!file) return;
    const err = await validateImageContents(file);
    if (err) {
      setUploadError(uploadErrorMessage(err));
      return;
    }
    try {
      setCustomBg(await readFileAsDataUrl(file));
      setUploadError(null);
    } catch {
      setUploadError("Could not read that background file.");
    }
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
      {/* Media column — Shopify-style */}
      <div className="relative lg:sticky lg:top-28 lg:self-start space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("photos")}
            disabled={gallery.length === 0}
            className={`px-3.5 py-1.5 text-xs tracking-wide border rounded-full transition-colors disabled:opacity-40 ${
              viewMode === "photos"
                ? "bg-ink text-chalk border-ink"
                : "border-line text-muted hover:border-ink"
            }`}
          >
            Photos{gallery.length ? ` (${gallery.length})` : ""}
          </button>
          <button
            type="button"
            onClick={() => setViewMode("3d")}
            className={`px-3.5 py-1.5 text-xs tracking-wide border rounded-full transition-colors ${
              viewMode === "3d"
                ? "bg-ink text-chalk border-ink"
                : "border-line text-muted hover:border-ink"
            }`}
          >
            360°
          </button>
          <Link
            href={`/configurator?product=${product.slug}`}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-accent-soft px-3.5 py-1.5 text-xs font-medium text-accent hover:bg-accent hover:text-white transition-colors"
          >
            <Sparkles size={13} strokeWidth={1.75} />
            Configure your design
          </Link>
        </div>

        {viewMode === "photos" && gallery.length > 0 ? (
          <PhotoGallery
            images={gallery}
            color={color.hex}
            logoLabel={logoLabel}
            logoDataUrl={customLogo}
            placement={placement}
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <Tee3DViewer
              color={color.hex}
              logoLabel={logoLabel ?? "brand"}
              logoDataUrl={customLogo}
              placement={placement}
              background={background.value}
              customBackgroundUrl={customBg}
              autoRotate
              rotateSpeed={0.85}
              className="!aspect-[4/5] !min-h-[420px] !h-auto"
            />
          </div>
        )}

        {product.comingSoon && (
          <div className="absolute inset-0 top-10 bg-ink/35 flex items-center justify-center z-10 rounded-2xl">
            <span className="bg-chalk px-4 py-2 text-xs tracking-[0.22em] uppercase font-medium rounded-full">
              Coming soon
            </span>
          </div>
        )}
      </div>

      {/* Buy column */}
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
          <p className="mt-5 text-[15px] leading-relaxed text-ink/80">
            {product.description}
          </p>
        </div>

        <div className="mt-8 space-y-7">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs tracking-[0.16em] uppercase text-muted">Colour</p>
              <span className="text-sm">{color.name}</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {product.colors.map((c, i) => (
                <button
                  key={c.slug}
                  type="button"
                  title={c.name}
                  onClick={() => setColorIdx(i)}
                  className={`h-9 w-9 rounded-full border-2 transition-transform ${
                    i === colorIdx
                      ? "border-ink scale-110"
                      : "border-transparent shadow-[0_0_0_1px_rgba(0,0,0,0.12)]"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs tracking-[0.16em] uppercase text-muted">Size</p>
              <Link
                href="/size-guide"
                className="text-xs underline underline-offset-4 text-muted hover:text-ink"
              >
                Size guide
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`h-11 min-w-11 px-3 text-sm border rounded-lg transition-colors ${
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
            <p className="text-xs tracking-[0.16em] uppercase text-muted mb-3">Logo</p>
            <div className="grid grid-cols-2 gap-2">
              {LOGO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setLogoId(preset.id);
                    setCustomLogo(undefined);
                  }}
                  className={`rounded-xl border px-3 py-3 text-left text-sm transition-colors ${
                    logoId === preset.id && !customLogo
                      ? "border-ink bg-surface"
                      : "border-line hover:border-ink/40"
                  }`}
                >
                  <span className="font-medium">{preset.name}</span>
                  <span className="block text-xs text-muted mt-0.5">{preset.label}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={`mt-2 w-full border border-dashed rounded-xl px-4 py-3 text-sm flex items-center justify-center gap-2 transition-colors ${
                customLogo
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line hover:border-ink"
              }`}
            >
              <Upload size={16} strokeWidth={1.5} />
              {customLogo ? "Custom logo — change" : "Upload your logo"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                void onUpload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>

          <div>
            <p className="text-xs tracking-[0.16em] uppercase text-muted mb-3">
              Placement
            </p>
            <div className="flex flex-wrap gap-2">
              {LOGO_PLACEMENTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlacement(p.id)}
                  className={`px-3.5 py-2 text-sm border rounded-full transition-colors ${
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

          <div>
            <p className="text-xs tracking-[0.16em] uppercase text-muted mb-3">
              Studio background
            </p>
            <div className="grid grid-cols-4 gap-2">
              {STUDIO_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => {
                    setBackground(bg);
                    setCustomBg(undefined);
                  }}
                  className={`rounded-xl overflow-hidden border text-left ${
                    background.id === bg.id && !customBg
                      ? "border-ink ring-1 ring-ink"
                      : "border-line"
                  }`}
                >
                  <div className="h-10" style={{ background: bg.value }} />
                  <span className="block px-1.5 py-1 text-[10px] tracking-wide uppercase text-muted">
                    {bg.label}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => bgFileRef.current?.click()}
              className={`mt-2 w-full border border-dashed rounded-xl px-4 py-3 text-sm flex items-center justify-center gap-2 transition-colors ${
                customBg
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line hover:border-ink"
              }`}
            >
              <ImageIcon size={16} strokeWidth={1.5} />
              {customBg ? "Custom background — change" : "Upload background image"}
            </button>
            <input
              ref={bgFileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                void onBgUpload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>

          {uploadError ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {uploadError}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="inline-flex items-center border border-line h-12 rounded-xl overflow-hidden">
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
              className="flex-1 min-w-[180px] h-12 rounded-xl bg-ink text-chalk text-sm font-medium tracking-wide hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
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

          <Link
            href={`/configurator?product=${product.slug}`}
            className="w-full h-12 rounded-xl border border-ink/20 text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-ink hover:text-chalk transition-colors"
          >
            <Sparkles size={16} strokeWidth={1.75} />
            Configure your own design
          </Link>
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
          {product.features.slice(0, 4).map((f) => (
            <div key={f} className="sm:col-span-2 flex gap-2 text-muted">
              <span className="text-accent mt-0.5">✓</span>
              <span>{f}</span>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
