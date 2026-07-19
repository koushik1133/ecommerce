"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  Check,
  ChevronDown,
  Expand,
  Maximize2,
  Minimize2,
  Shirt,
} from "lucide-react";
import type { LogoPlacement, Product } from "@/lib/products";
import {
  LOGO_PLACEMENTS,
  LOGO_PRESETS,
  formatINR,
  products,
} from "@/lib/products";
import { useCart } from "@/store/cart";
import { Tee3DViewer, type Tee3DViewerHandle } from "@/components/spin/Tee3DViewer";
import {
  readFileAsDataUrl,
  uploadErrorMessage,
  validateImageContents,
} from "@/lib/uploads";

function isHexDark(hex: string): boolean {
  const color = hex.replace("#", "");
  if (color.length !== 6) return false;
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

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
        className="w-full flex items-center justify-between py-3.5 text-left text-[13px] font-medium text-[#1a1a1a] focus:outline-none"
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
  const [openPanel, setOpenPanel] = useState<
    "color" | "logo" | "buy" | null
  >("color");
  const [added, setAdded] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Map of modelSlug to product metadata/settings
  const [modelSlug, setModelSlug] = useState<string>("oversized-tshirt");
  const isTop = !["sweatpants", "cap"].includes(modelSlug);

  // Advanced Shader States
  const [acidWash, setAcidWash] = useState(0.0);
  const [puffPrint, setPuffPrint] = useState(0.0);
  const [designScale, setDesignScale] = useState(1.0);
  const [designX, setDesignX] = useState(0.0);
  const [designY, setDesignY] = useState(0.0);

  // Logo Custom Coloring States
  const [logoColor, setLogoColor] = useState("#ffffff");
  const [dyeLogo, setDyeLogo] = useState(false);

  // Decoration & Interaction States
  const [decorType, setDecorType] = useState<"print" | "stitch">("print");
  const [interactMode, setInteractMode] = useState<"orbit" | "drag-logo">("orbit");

  // Motion & Animation States
  const [motion, setMotion] = useState<"static" | "walk" | "waves" | "knit">("static");
  const [motionSpeed, setMotionSpeed] = useState(0.5);
  const [cameraAnim, setCameraAnim] = useState<"none" | "rotate" | "orbit-zoom">("rotate");

  // Output settings
  const [renderQuality, setRenderQuality] = useState<"fast" | "high">("fast");

  // Recording status
  const [videoRecording, setVideoRecording] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const fileRef = useRef<HTMLInputElement>(null);
  const viewerRef = useRef<Tee3DViewerHandle>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  const color = product.colors[colorIdx];
  const logo = LOGO_PRESETS.find((l) => l.id === logoId) ?? LOGO_PRESETS[0];
  const logoLabel = customLogo ? undefined : logo.label;
  const disabled = Boolean(product.comingSoon);

  // Dynamic Background: White/Light-grey for dark shirts, Dark/Black for light shirts
  let currentBgColor = isHexDark(color.hex) ? "#fafaf9" : "#1a1a1a";
  if (product.backgroundMode === "light") {
    currentBgColor = "#fafaf9";
  } else if (product.backgroundMode === "dark" || product.backgroundMode === "darken") {
    currentBgColor = "#1a1a1a";
  }

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
    } catch {
      setUploadError("Could not read that design file.");
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

  function handleExportImage() {
    setExporting(true);
    window.setTimeout(() => {
      const data = viewerRef.current?.exportPng();
      if (data) {
        const a = document.createElement("a");
        a.href = data;
        a.download = `${product.slug}-mockup-${Date.now()}.png`;
        a.click();
      }
      setExporting(false);
    }, 80);
  }

  function handleExport3D() {
    viewerRef.current?.export3d?.();
  }

  function handleExportVideo() {
    setVideoRecording(true);
    setExportProgress(0);
    viewerRef.current?.exportVideo?.(
      (progress) => {
        setExportProgress(progress);
      },
      () => {
        setVideoRecording(false);
      }
    );
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
    <aside className="w-full lg:w-[350px] shrink-0 z-20">
      <div className="bg-white rounded-[22px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-black/5 p-5 md:p-6 flex flex-col gap-4 h-[560px] overflow-y-auto">
        {/* Apparel Type Dropdown */}
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-[0.14em] text-black/45">
            Select 3D Garment
          </p>
          <select
            value={modelSlug}
            onChange={(e) => setModelSlug(e.target.value)}
            className="w-full h-11 px-3.5 rounded-full border border-black/10 bg-[#f7f7f7] text-[13px] font-medium text-[#111] focus:outline-none cursor-pointer"
          >
            <option value="oversized-tshirt">Oversized T-Shirt</option>
            <option value="regular-tshirt">Regular T-Shirt</option>
            <option value="boxy-tshirt">Cropped Boxy T-Shirt</option>
            <option value="hanging-tshirt">Hanging T-Shirt</option>
            <option value="sweatshirt">Oversized Sweatshirt</option>
            <option value="hoodie">Oversized Hoodie</option>
            <option value="hanging-hoodie">Hanging Hoodie</option>
            <option value="polo-shirt">Oversized Polo Shirt</option>
            <option value="zip-hoodie">Zip Hoodie</option>
            <option value="sweatpants">Sweatpants</option>
            <option value="cap">Cap</option>
          </select>
        </div>

        {isTop && (
          <>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-11 rounded-full bg-[#111] text-white text-[13px] font-medium inline-flex items-center justify-center gap-2 hover:bg-black transition-colors"
            >
              <Shirt size={15} strokeWidth={1.75} />
              Upload Custom Design
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
          </>
        )}

        <div className="pt-1">
          {/* Garment Swatch & Prints */}
          <Accordion
            title="Garment & Dye Settings"
            open={openPanel === "color"}
            onToggle={() => togglePanel("color")}
          >
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-black/45 mb-2">
                  Garment Color
                </p>
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
                <p className="text-[11px] text-black/55 mt-1.5">{color.name}</p>
              </div>

              <div className="mt-3.5 space-y-2.5 border-t border-black/5 pt-3">
                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span className="text-black/55">Dye print/logo color:</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={dyeLogo}
                    onClick={() => setDyeLogo((v) => !v)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      dyeLogo ? "bg-[#5b6cff]" : "bg-black/15"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        dyeLogo ? "left-[18px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </label>

                {dyeLogo ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-black/55">Logo color:</span>
                    <div className="inline-flex items-center gap-2">
                      <input
                        type="color"
                        value={logoColor}
                        onChange={(e) => setLogoColor(e.target.value)}
                        className="w-8 h-6 rounded border border-black/10 cursor-pointer p-0 bg-transparent"
                      />
                      <span className="text-[10px] font-mono text-black/40 uppercase">{logoColor}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </Accordion>

          {/* Logo transform & Placement controls */}
          {isTop && (
            <Accordion
              title="Logo Layout & Details"
              open={openPanel === "logo"}
              onToggle={() => togglePanel("logo")}
            >
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-black/45 mb-2">
                    Decoration Method
                  </p>
                  <div className="flex gap-2">
                    <button
                      key="decor-print"
                      type="button"
                      onClick={() => setDecorType("print")}
                      className={`flex-1 rounded-full h-9 text-[11px] font-semibold border transition-all ${
                        decorType === "print"
                          ? "bg-[#111] text-white border-[#111] shadow-sm"
                          : "bg-white border-black/10 text-black/70 hover:border-black/25"
                      }`}
                    >
                      Print
                    </button>
                    <button
                      key="decor-stitch"
                      type="button"
                      onClick={() => {
                        setDecorType("stitch");
                        if (designScale > 0.8) setDesignScale(0.8);
                      }}
                      className={`flex-1 rounded-full h-9 text-[11px] font-semibold border transition-all ${
                        decorType === "stitch"
                          ? "bg-[#111] text-white border-[#111] shadow-sm"
                          : "bg-white border-black/10 text-black/70 hover:border-black/25"
                      }`}
                    >
                      Block-out Stitch
                    </button>
                  </div>
                  <p className="text-[9.5px] text-black/40 mt-2 leading-relaxed">
                    {decorType === "stitch"
                      ? "Block-out stitch is capped at 0.80 scale — physical embroidery hoop limits apply."
                      : "Print (Screen/DTG) can scale up to 2.50 to fill the full torso width."}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-black/45 mb-2">
                    Logo placement
                  </p>
                  <div className="flex gap-1.5">
                    {LOGO_PLACEMENTS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlacement(p.id)}
                        className={`flex-1 rounded-full h-9 text-[11px] font-semibold border transition-all ${
                          placement === p.id
                            ? "bg-[#111] text-white border-[#111] shadow-sm"
                            : "bg-white border-black/10 text-black/70 hover:border-black/25"
                        }`}
                      >
                        {p.id === "chest-left" ? "Left Chest" : p.id === "chest-center" ? "Center" : "Back"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-black/45 mb-2">
                    Preset Designs
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {LOGO_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setLogoId(preset.id);
                          setCustomLogo(undefined);
                        }}
                        className={`rounded-xl px-2 py-2.5 text-xs border transition-all ${
                          logoId === preset.id && !customLogo
                            ? "border-[#111] bg-[#111] text-white font-medium shadow-sm"
                            : "border-black/5 bg-white/70 hover:border-black/20 text-black/60"
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-black/5 pt-3.5 space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-black/45">
                    Position & Size
                  </p>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-black/55">
                      <span>Design scale</span>
                      <span>{designScale.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={decorType === "stitch" ? 0.8 : 2.5}
                      step={0.05}
                      value={designScale}
                      onChange={(e) => setDesignScale(Number(e.target.value))}
                      className="w-full accent-[#5b6cff]"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-black/55">
                      <span>Position X</span>
                      <span>{designX.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={-0.5}
                      max={0.5}
                      step={0.01}
                      value={designX}
                      onChange={(e) => setDesignX(Number(e.target.value))}
                      className="w-full accent-[#5b6cff]"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-black/55">
                      <span>Position Y</span>
                      <span>{designY.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={-0.5}
                      max={0.5}
                      step={0.01}
                      value={designY}
                      onChange={(e) => setDesignY(Number(e.target.value))}
                      className="w-full accent-[#5b6cff]"
                    />
                  </div>
                </div>

                <div className="border-t border-black/5 pt-3.5 space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-black/45">
                    Fabric Effects
                  </p>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-black/55">
                      <span>Acid wash</span>
                      <span>{acidWash.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.0}
                      max={1.0}
                      step={0.01}
                      value={acidWash}
                      onChange={(e) => setAcidWash(Number(e.target.value))}
                      className="w-full accent-[#5b6cff]"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-black/55">
                      <span>Puff print height</span>
                      <span>{puffPrint.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.0}
                      max={1.0}
                      step={0.01}
                      value={puffPrint}
                      onChange={(e) => setPuffPrint(Number(e.target.value))}
                      className="w-full accent-[#5b6cff]"
                    />
                  </div>
                </div>
              </div>
            </Accordion>
          )}

          {/* Buy Action accordion */}
          <Accordion
            title="Buy Options"
            open={openPanel === "buy"}
            onToggle={() => togglePanel("buy")}
          >
            <div className="space-y-1.5">
              <p className="font-display text-sm font-bold tracking-tight text-[#111]">{product.name}</p>
              <p className="text-[11px] text-black/55">{product.tagline}</p>
              <p className="text-sm font-semibold pt-1 text-[#111]">
                {formatINR(product.price)}
                {product.compareAt ? (
                  <span className="ml-2 text-xs text-black/40 line-through font-normal">
                    {formatINR(product.compareAt)}
                  </span>
                ) : null}
              </p>
            </div>
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] uppercase tracking-[0.14em] text-black/45">
                Size
              </p>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`h-8 min-w-8 px-2 rounded-full text-xs border ${
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
            <div className="flex items-center gap-2 pt-1">
              <div className="inline-flex items-center h-10 rounded-full border border-black/10 overflow-hidden">
                <button
                  type="button"
                  className="w-8 h-full hover:bg-black/5"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease"
                >
                  −
                </button>
                <span className="w-6 text-center text-xs">{qty}</span>
                <button
                  type="button"
                  className="w-8 h-full hover:bg-black/5"
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

        {customLogo ? (
          <p className="text-[10px] text-emerald-700 flex items-center gap-1 mt-auto">
            <Check size={12} /> Custom design applied
          </p>
        ) : null}

        {/* Frame & Quality settings */}
        <div className="border-t border-black/5 pt-3 space-y-2.5 mt-auto">
          <div className="flex items-center justify-between text-xs">
            <span className="text-black/55">Render quality:</span>
            <div className="inline-flex rounded-full bg-[#f0f0ee] p-0.5">
              <button
                type="button"
                onClick={() => setRenderQuality("fast")}
                className={`rounded-full px-2.5 py-0.5 text-[9px] font-semibold transition-colors ${
                  renderQuality === "fast" ? "bg-white shadow text-[#111]" : "text-black/45"
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setRenderQuality("high")}
                className={`rounded-full px-2.5 py-0.5 text-[9px] font-semibold transition-colors ${
                  renderQuality === "high" ? "bg-white shadow text-[#111]" : "text-black/45"
                }`}
              >
                HQ
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-black/5">
          <button
            type="button"
            onClick={handleExportImage}
            disabled={exporting}
            className="h-9 rounded-xl bg-[#5b6cff] text-white text-[10px] font-medium inline-flex items-center justify-center hover:bg-[#4a5bf0] disabled:opacity-50 transition-colors cursor-pointer"
          >
            Image
          </button>
          <button
            type="button"
            onClick={handleExportVideo}
            disabled={exporting || videoRecording}
            className="h-9 rounded-xl bg-[#5b6cff] text-white text-[10px] font-medium inline-flex items-center justify-center hover:bg-[#4a5bf0] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {videoRecording ? "Rec…" : "Video"}
          </button>
          <button
            type="button"
            onClick={handleExport3D}
            disabled={exporting}
            className="h-9 rounded-xl bg-[#5b6cff] text-white text-[10px] font-medium inline-flex items-center justify-center hover:bg-[#4a5bf0] disabled:opacity-50 transition-colors cursor-pointer"
          >
            3D GLB
          </button>
        </div>
      </div>
    </aside>
  );

  const canvas = (
    <div
      className="relative flex-1 rounded-[22px] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-black/5 flex items-center justify-center transition-all duration-500 ease-out"
      style={{ background: currentBgColor }}
    >
      <div className="relative w-full h-full transition-all duration-500 ease-out">
        <button
          type="button"
          onClick={() => void toggleFullscreen()}
          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/90 border border-black/8 shadow-sm inline-flex items-center justify-center hover:bg-white"
          aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>

        <Tee3DViewer
          ref={viewerRef}
          modelSlug={modelSlug}
          color={color.hex}
          logoLabel={logoLabel ?? "brand"}
          logoDataUrl={customLogo}
          placement={placement}
          background={currentBgColor}
          customBackgroundUrl={undefined}
          autoRotate={cameraAnim !== "none"}
          rotateSpeed={0.9}
          acidWash={acidWash}
          puffPrint={puffPrint}
          designScale={designScale}
          designX={designX}
          designY={designY}
          motion={motion}
          motionSpeed={motionSpeed}
          cameraAnim={cameraAnim}
          logoColor={logoColor}
          dyeLogo={dyeLogo}
          interactMode={interactMode}
          onDesignPositionChange={(x, y) => {
            setDesignX(x);
            setDesignY(y);
          }}
          className="absolute inset-0 h-full w-full min-h-0 rounded-none bg-transparent"
        />

        <div className="absolute top-3 left-3 z-10 flex gap-1.5 pointer-events-auto">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 border border-black/8 px-2.5 py-1 text-[9px] tracking-[0.16em] uppercase text-black/55 shadow-sm pointer-events-none">
            <Expand size={10} />
            360° Studio
          </span>
          <div className="inline-flex rounded-full bg-white/95 border border-black/8 p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => setInteractMode("orbit")}
              className={`rounded-full px-2.5 py-0.5 text-[9px] font-semibold transition-all ${
                interactMode === "orbit"
                  ? "bg-[#111] text-white shadow-sm"
                  : "text-black/55 hover:text-[#111]"
              }`}
            >
              Rotate Tee
            </button>
            <button
              type="button"
              onClick={() => setInteractMode("drag-logo")}
              className={`rounded-full px-2.5 py-0.5 text-[9px] font-semibold transition-all ${
                interactMode === "drag-logo"
                  ? "bg-[#111] text-white shadow-sm"
                  : "text-black/55 hover:text-[#111]"
              }`}
            >
              Drag Logo
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={shellRef}
      className="relative bg-[#f7f7f5] -mx-5 md:-mx-8 px-5 md:px-8 py-6 md:py-8 rounded-[32px] border border-black/5 shadow-[0_4px_30px_rgba(0,0,0,0.02)]"
    >
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 h-[560px]">
        {sidebar}
        {canvas}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-black/50 px-1">
        <p>
          {product.name} · {formatINR(product.price)} · drag inside the box to rotate 360°
        </p>
      </div>

      {/* Video recording modal progress bar */}
      {videoRecording ? (
        <div className="absolute inset-0 z-50 bg-[#121212]/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-black/5 text-center">
            <h3 className="font-display text-base font-bold mb-4 text-[#111]">Recording Configurator Video</h3>
            <div className="w-full h-2 bg-[#f0f0ee] rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-[#5b6cff] transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <p className="text-xs text-black/55 font-medium">
              Rendering frames... {exportProgress}%
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
