"use client";

import { Component, type ReactNode } from "react";
import type { LogoPlacement } from "@/lib/products";
import { PhotoGallery, type GalleryImage } from "./PhotoGallery";
import { Tee3DViewer } from "./Tee3DViewer";

type ProductViewerProps = {
  mode: "photos" | "3d";
  color: string;
  logoLabel?: string;
  logoDataUrl?: string;
  placement?: LogoPlacement;
  background?: string;
  customBackgroundUrl?: string;
  gallery?: GalleryImage[];
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
  className,
}: ProductViewerProps) {
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

  // 360° = interactive 3D object (orbit), not photo frames
  return (
    <ViewerErrorBoundary
      fallback={
        <div
          className={`aspect-[4/5] rounded-2xl w-full flex items-center justify-center bg-surface text-sm text-muted px-6 text-center ${className ?? ""}`}
        >
          3D preview unavailable
        </div>
      }
    >
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
