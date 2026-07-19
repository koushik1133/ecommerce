"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  Check,
  ChevronDown,
  Download,
  Expand,
  ImageIcon,
  Maximize2,
  Minimize2,
  Settings2,
  Shirt,
} from "lucide-react";
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
import { Tee3DViewer, type Tee3DViewerHandle } from "@/components/spin/Tee3DViewer";
import { PhotoGallery } from "@/components/spin/PhotoGallery";
import {
  readFileAsDataUrl,
  uploadErrorMessage,
  validateImageContents,
} from "@/lib/uploads";

function Accordion({
  title,
  open,
  onToggle,
  badge,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-black/5">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3.5 text-left text-[13px] font-medium text-[#1a1a1a]"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2">
          {title}
          {badge ? (
            <span className="text-[9px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-[#5b6cff] text-white">
              {badge}
            </span>
          ) : null}
        </span>
        <ChevronDown
          size={16}
          className={`text-black/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? <div className="pb-4 space-y-3">{children}</div> : null}
    </div>
  );
}

export function StudioConfigurator({
  product,
}: {
  product: Product;
}) {
  const addItem = useCart((s) => s.addItem);
  const [colorIdx, setColorIdx] = useState(0);
  const [size, setSize] = useState(product.sizes.includes("M") ? "M" : product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [logoId, setLogoId] = useState<string>(LOGO_PRESETS[0].id);
  const [placement, setPlacement] = useState<LogoPlacement>("chest-center");
  const [customLogo, setCustomLogo] = useState<string | undefined>();
  const [background, setBackground] = useState<StudioBackground>(STUDIO_BACKGROUNDS[0]);
  const [customBg, setCustomBg] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<"3d" | "photos">("3d");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [openPanel, setOpenPanel] = useState<
    "color" | "background" | "animation" | "photos" | "buy" | null
  >("color");
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotateSpeed, setRotateSpeed] = useState(0.9);
  const [added, setAdded] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);
  const viewerRef = useRef<Tee3DViewerHandle>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  const color = product.colors[colorIdx];
  const logo = LOGO_PRESETS.find((l) => l.id === logoId) ?? LOGO_PRESETS[0];
  const logoLabel = customLogo ? undefined : logo.label;
  const disabled = Boolean(product.comingSoon);
  const gallery = product.gallery ?? [];

  function togglePanel(id: typeof openPanel) {
    setOpenPanel((prev) => (prev === id ? null : id));
  }

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
      setUploadError("Could not read that design file.");
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

  function handleExport() {
    setExporting(true);
    window.setTimeout(() => {
      const data = viewerRef.current?.exportPng();
      if (data) {
        const a = document.createElement("a");
        a.href = data;
        a.download = `${product.slug}-mockup.png`;
        a.click();
      }
      setExporting(false);
    }, 80);
  }

  async function toggleFullscreen() {
    const el = shellRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }

  const sidebar = (
    <aside className="w-full lg:w-[300px] shrink-0 z-20">
      <div className="bg-white rounded-[22px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-black/5 p-4 md:p-5 flex flex-col gap-3 max-h-[min(860px,calc(100dvh-7rem))] overflow-y-auto">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full h-11 rounded-full bg-[#111] text-white text-[13px] font-medium inline-flex items-center justify-center gap-2 hover:bg-black transition-colors"
        >
          <Shirt size={15} strokeWidth={1.75} />
          Upload Your Design
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

        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className={`w-full h-11 rounded-full text-[13px] font-medium inline-flex items-center justify-center gap-2 transition-colors ${
            advancedOpen
              ? "bg-[#111] text-white"
              : "bg-[#efefef] text-[#222] hover:bg-[#e6e6e6]"
          }`}
        >
          <Settings2 size={15} strokeWidth={1.75} />
          Advanced Controls
        </button>

        {advancedOpen ? (
          <div className="rounded-2xl bg-[#f7f7f7] p-3 space-y-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-black/45 mb-2">
                Logo presets
              </p>
              <div className="grid grid-cols-2 gap-2">
                {LOGO_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setLogoId(preset.id);
                      setCustomLogo(undefined);
                      setViewMode("3d");
                    }}
                    className={`rounded-xl px-2 py-2.5 text-xs border transition-colors ${
                      logoId === preset.id && !customLogo
                        ? "border-[#111] bg-white"
                        : "border-transparent bg-white/70 hover:border-black/20"
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-black/45 mb-2">
                Placement
              </p>
              <div className="flex flex-wrap gap-1.5">
                {LOGO_PLACEMENTS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlacement(p.id)}
                    className={`rounded-full px-3 py-1.5 text-[11px] border transition-colors ${
                      placement === p.id
                        ? "bg-[#111] text-white border-[#111]"
                        : "bg-white border-black/10 text-black/70"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            {customLogo ? (
              <p className="text-[11px] text-emerald-700 flex items-center gap-1.5">
                <Check size={12} /> Custom design applied
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="pt-1">
          <Accordion
            title="Garment Color"
            open={openPanel === "color"}
            onToggle={() => togglePanel("color")}
          >
            <div className="flex flex-wrap gap-2.5">
              {product.colors.map((c, i) => (
                <button
                  key={c.slug}
                  type="button"
                  title={c.name}
                  onClick={() => setColorIdx(i)}
                  className={`h-9 w-9 rounded-full border-2 transition-transform ${
                    i === colorIdx
                      ? "border-[#111] scale-110"
                      : "border-white shadow-[0_0_0_1px_rgba(0,0,0,0.12)]"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
            <p className="text-xs text-black/50">{color.name}</p>
          </Accordion>

          <Accordion
            title="Background"
            open={openPanel === "background"}
            onToggle={() => togglePanel("background")}
          >
            <div className="grid grid-cols-2 gap-2">
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
                      ? "border-[#111]"
                      : "border-black/10"
                  }`}
                >
                  <div className="h-12" style={{ background: bg.value }} />
                  <span className="block px-2 py-1.5 text-[11px]">{bg.label}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => bgFileRef.current?.click()}
              className="w-full rounded-full border border-dashed border-black/20 px-3 py-2.5 text-xs inline-flex items-center justify-center gap-2 hover:border-black/40"
            >
              <ImageIcon size={14} />
              {customBg ? "Change background image" : "Upload background"}
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
          </Accordion>

          <Accordion
            title="Animation"
            open={openPanel === "animation"}
            onToggle={() => togglePanel("animation")}
          >
            <label className="flex items-center justify-between text-xs">
              <span>Auto-rotate</span>
              <button
                type="button"
                role="switch"
                aria-checked={autoRotate}
                onClick={() => setAutoRotate((v) => !v)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  autoRotate ? "bg-[#5b6cff]" : "bg-black/15"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    autoRotate ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </label>
            <div>
              <div className="flex justify-between text-[11px] text-black/45 mb-1.5">
                <span>Speed</span>
                <span>{rotateSpeed.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={3}
                step={0.1}
                value={rotateSpeed}
                onChange={(e) => setRotateSpeed(Number(e.target.value))}
                className="w-full accent-[#5b6cff]"
              />
            </div>
          </Accordion>

          {gallery.length > 0 ? (
            <Accordion
              title="Photos"
              open={openPanel === "photos"}
              onToggle={() => togglePanel("photos")}
            >
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode("3d")}
                  className={`flex-1 rounded-full h-10 text-xs font-medium ${
                    viewMode === "3d" ? "bg-[#111] text-white" : "bg-[#efefef]"
                  }`}
                >
                  360° object
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("photos")}
                  className={`flex-1 rounded-full h-10 text-xs font-medium ${
                    viewMode === "photos" ? "bg-[#111] text-white" : "bg-[#efefef]"
                  }`}
                >
                  {gallery.length} photos
                </button>
              </div>
            </Accordion>
          ) : null}

          <Accordion
            title="Buy"
            open={openPanel === "buy"}
            onToggle={() => togglePanel("buy")}
          >
            <div className="space-y-1">
              <p className="font-display text-lg font-bold tracking-tight">{product.name}</p>
              <p className="text-sm text-black/55">{product.tagline}</p>
              <p className="text-base font-semibold pt-1">
                {formatINR(product.price)}
                {product.compareAt ? (
                  <span className="ml-2 text-sm text-black/40 line-through font-normal">
                    {formatINR(product.compareAt)}
                  </span>
                ) : null}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-black/45 mb-2">
                Size
              </p>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`h-9 min-w-9 px-2 rounded-full text-xs border ${
                      size === s
                        ? "bg-[#111] text-white border-[#111]"
                        : "bg-white border-black/10"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center h-10 rounded-full border border-black/10 overflow-hidden">
                <button
                  type="button"
                  className="w-9 h-full hover:bg-black/5"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm">{qty}</span>
                <button
                  type="button"
                  className="w-9 h-full hover:bg-black/5"
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
                className="flex-1 h-10 rounded-full bg-[#111] text-white text-xs font-medium disabled:opacity-40 inline-flex items-center justify-center gap-1.5"
              >
                {disabled ? (
                  "Coming soon"
                ) : added ? (
                  <>
                    <Check size={14} /> Added
                  </>
                ) : (
                  "Add to bag"
                )}
              </button>
            </div>
          </Accordion>
        </div>

        {uploadError ? (
          <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{uploadError}</p>
        ) : null}

        <button
          type="button"
          onClick={handleExport}
          disabled={viewMode !== "3d" || exporting}
          className="mt-auto w-full h-11 rounded-full bg-[#5b6cff] text-white text-[13px] font-medium inline-flex items-center justify-center gap-2 hover:bg-[#4a5bf0] disabled:opacity-50 transition-colors"
        >
          <Download size={15} strokeWidth={1.75} />
          {exporting ? "Exporting…" : "Export"}
        </button>
      </div>
    </aside>
  );

  const canvas = (
    <div className="relative flex-1 min-h-[480px] lg:min-h-0 rounded-[22px] overflow-hidden bg-[#f4f4f2] shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-black/5">
      <button
        type="button"
        onClick={() => void toggleFullscreen()}
        className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/90 border border-black/8 shadow-sm inline-flex items-center justify-center hover:bg-white"
        aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>

      {viewMode === "photos" && gallery.length > 0 ? (
        <div className="absolute inset-0 p-4 md:p-6 overflow-y-auto bg-white">
          <PhotoGallery images={gallery} />
        </div>
      ) : (
        <Tee3DViewer
          ref={viewerRef}
          color={color.hex}
          logoLabel={logoLabel ?? "brand"}
          logoDataUrl={customLogo}
          placement={placement}
          background={background.value}
          customBackgroundUrl={customBg}
          autoRotate={autoRotate}
          rotateSpeed={rotateSpeed}
          className="absolute inset-0 h-full w-full min-h-0 rounded-none"
        />
      )}

      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-black/8 px-3 py-1.5 text-[10px] tracking-[0.16em] uppercase text-black/55 shadow-sm">
          <Expand size={11} />
          {viewMode === "photos" ? "Photos" : "360°"}
        </span>
      </div>
    </div>
  );

  return (
    <div
      ref={shellRef}
      className="relative bg-[#f7f7f5] -mx-5 md:-mx-8 px-4 md:px-6 py-4 md:py-5 min-h-[calc(100dvh-5.5rem)]"
    >
      <div className="flex flex-col lg:flex-row gap-4 md:gap-5 h-[calc(100dvh-7.5rem)] min-h-[640px]">
        {sidebar}
        {canvas}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-black/50 px-1">
        <p>
          {product.name} · {formatINR(product.price)} · drag the tee to orbit
        </p>
        <button
          type="button"
          onClick={() => {
            setOpenPanel("buy");
            setAdvancedOpen(true);
          }}
          className="text-[#5b6cff] hover:underline"
        >
          Open buy options
        </button>
      </div>
    </div>
  );
}
