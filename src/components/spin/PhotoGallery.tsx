import { useState } from "react";
import { TeeMockup } from "@/components/TeeMockup";
import type { LogoPlacement } from "@/lib/products";

export type GalleryImage = {
  src: string;
  label: string;
};

function isMockable(src: string): boolean {
  return (
    src.includes("front") ||
    src.includes("back") ||
    src.includes("left-side") ||
    src.includes("right-side") ||
    src.startsWith("mock-")
  );
}

function getAngle(src: string): number | undefined {
  if (src.includes("front") || src.startsWith("mock-front")) return 0;
  if (src.includes("back") || src.startsWith("mock-back")) return 180;
  if (src.includes("left-side") || src.startsWith("mock-left")) return 270;
  if (src.includes("right-side") || src.startsWith("mock-right")) return 90;
  return undefined;
}

export function PhotoGallery({
  images,
  className = "",
  color,
  logoLabel,
  logoDataUrl,
  placement,
}: {
  images: GalleryImage[];
  className?: string;
  color?: string;
  logoLabel?: string;
  logoDataUrl?: string;
  placement?: LogoPlacement;
}) {
  const [active, setActive] = useState(0);
  if (!images.length) {
    return (
      <div
        className={`aspect-[4/5] rounded-2xl bg-surface flex items-center justify-center text-sm text-muted ${className}`}
      >
        No photos yet
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)];
  const isCurrentMock = current ? isMockable(current.src) : false;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface">
        {isCurrentMock ? (
          <TeeMockup
            color={color ?? "#1A1A1A"}
            logoLabel={logoLabel}
            logoDataUrl={logoDataUrl}
            placement={placement}
            angle={getAngle(current.src)}
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={current.src}
            alt={current.label}
            className="absolute inset-0 h-full w-full object-contain p-4 md:p-6"
          />
        )}
        <span className="absolute top-3 left-3 bg-chalk/90 backdrop-blur-sm border border-line text-[10px] tracking-[0.18em] uppercase px-2.5 py-1.5 rounded-full z-10">
          {current?.label}
        </span>
        <span className="absolute top-3 right-3 bg-chalk/90 backdrop-blur-sm border border-line text-[10px] tracking-[0.18em] uppercase px-2.5 py-1.5 rounded-full z-10">
          {active + 1} / {images.length}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {images.map((img, i) => {
          const isImgMock = isMockable(img.src);
          return (
            <button
              key={img.src}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                i === active
                  ? "border-ink opacity-100"
                  : "border-line/60 opacity-60 hover:opacity-90"
              }`}
              aria-label={img.label}
              title={img.label}
            >
              {isImgMock ? (
                <TeeMockup
                  color={color ?? "#1A1A1A"}
                  logoLabel={logoLabel}
                  logoDataUrl={logoDataUrl}
                  placement={placement}
                  angle={getAngle(img.src)}
                  className="pointer-events-none scale-110"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={img.src}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

