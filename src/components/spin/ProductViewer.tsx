"use client";

import { Component, type ReactNode } from "react";
import type { LogoPlacement } from "@/lib/products";
import { PhotoGallery, type GalleryImage } from "./PhotoGallery";
import { Tee3DViewer } from "./Tee3DViewer";
import { ImageSequence360 } from "./ImageSequence360";

type ProductViewerProps = {
  mode: "photos" | "3d" | "spin";
  color: string;
  logoLabel?: string;
  logoDataUrl?: string;
  placement?: LogoPlacement;
  background?: string;
  customBackgroundUrl?: string;
  gallery?: GalleryImage[];
  spinFrames?: string[];
  className?: string;
};

class ViewerErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export function ProductViewer({
  mode,
  color,
  logoLabel,
  logoDataUrl,
  placement,
  background,
  customBackgroundUrl,
  gallery = [],
  spinFrames = [],
  className,
}: ProductViewerProps) {
  const fallback = (
    <div
      className={`aspect-[4/5] rounded-2xl w-full flex items-center justify-center bg-surface text-sm text-muted px-6 text-center ${className ?? ""}`}
    >
      Preview unavailable
    </div>
  );

  // ── 360° Image Spin Viewer ──────────────────────────────────────────────────
  if (mode === "spin" && spinFrames.length >= 2) {
    return (
      <ViewerErrorBoundary fallback={fallback}>
        <div className={`overflow-hidden rounded-2xl ${className ?? ""}`}>
          <ImageSequence360
            frames={spinFrames}
            autoSpin={true}
            logoLabel={logoLabel}
            logoDataUrl={logoDataUrl}
            showLogoOnFront={true}
            background={
              background ??
              "radial-gradient(ellipse at 50% 30%, #fff 0%, #ececea 55%, #e2e2df 100%)"
            }
            customBackgroundUrl={customBackgroundUrl}
          />
        </div>
      </ViewerErrorBoundary>
    );
  }

  // ── Photo Gallery Viewer ────────────────────────────────────────────────────
  if (mode === "photos") {
    if (gallery.length > 0) {
      return <PhotoGallery images={gallery} className={className} />;
    }
    return (
      <div
        className={`aspect-[4/5] rounded-2xl w-full flex items-center justify-center bg-surface text-sm text-muted px-6 text-center ${className ?? ""}`}
      >
        Photos coming soon
      </div>
    );
  }

  // ── Default: 3D GLTF Viewer ─────────────────────────────────────────────────
  return (
    <ViewerErrorBoundary fallback={fallback}>
      <div className={`overflow-hidden rounded-2xl ${className ?? ""}`}>
        <Tee3DViewer
          color={color}
          logoLabel={logoLabel}
          logoDataUrl={logoDataUrl}
          placement={placement}
          background={background}
          customBackgroundUrl={customBackgroundUrl}
        />
      </div>
    </ViewerErrorBoundary>
  );
}
