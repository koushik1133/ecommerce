"use client";

import { useState } from "react";

export type GalleryImage = {
  src: string;
  label: string;
};

export function PhotoGallery({
  images,
  className = "",
}: {
  images: GalleryImage[];
  className?: string;
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

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.src}
          alt={current.label}
          className="absolute inset-0 h-full w-full object-contain p-4 md:p-6"
        />
        <span className="absolute top-3 left-3 bg-chalk/90 backdrop-blur-sm border border-line text-[10px] tracking-[0.18em] uppercase px-2.5 py-1.5 rounded-full">
          {current.label}
        </span>
        <span className="absolute top-3 right-3 bg-chalk/90 backdrop-blur-sm border border-line text-[10px] tracking-[0.18em] uppercase px-2.5 py-1.5 rounded-full">
          {active + 1} / {images.length}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setActive(i)}
            className={`relative aspect-square overflow-hidden rounded-xl border transition-all ${
              i === active
                ? "border-ink ring-1 ring-ink"
                : "border-line hover:border-ink/40"
            }`}
            aria-label={img.label}
            title={img.label}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt=""
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
