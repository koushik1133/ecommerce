"use client";

import type { CSSProperties } from "react";
import type { LogoPlacement } from "@/lib/products";

type TeeMockupProps = {
  color: string;
  logoLabel?: string;
  logoDataUrl?: string;
  placement?: LogoPlacement;
  className?: string;
  showBack?: boolean;
};

export function TeeMockup({
  color,
  logoLabel = "brand",
  logoDataUrl,
  placement = "chest-center",
  className = "",
  showBack = false,
}: TeeMockupProps) {
  const isDark =
    ["#1a1a1a", "#1b2a41", "#1f4d3a", "#a84b2f", "#8b5a3c", "#5c6b4a"].includes(
      color.toLowerCase()
    );
  const ink = isDark ? "#f5f5f4" : "#141414";
  const viewBack = showBack || placement === "back";

  const logoStyle: CSSProperties = viewBack
    ? { top: "38%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "1.15rem" }
    : placement === "chest-left"
      ? { top: "34%", left: "34%", transform: "translate(-50%, -50%)", fontSize: "0.72rem" }
      : { top: "36%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "0.95rem" };

  return (
    <div className={`relative aspect-[4/5] w-full overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 400 500"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id={`teeShade-${color.replace("#", "")}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.85" />
          </linearGradient>
        </defs>
        {/* sleeves */}
        <path
          d="M70 120 L20 175 L55 210 L95 155 Z"
          fill={color}
          opacity="0.95"
        />
        <path
          d="M330 120 L380 175 L345 210 L305 155 Z"
          fill={color}
          opacity="0.95"
        />
        {/* body */}
        <path
          d="M95 145 C95 145 120 95 200 95 C280 95 305 145 305 145 L320 430 C320 450 300 465 200 465 C100 465 80 450 80 430 Z"
          fill={`url(#teeShade-${color.replace("#", "")})`}
        />
        {/* neck */}
        <path
          d="M155 100 C170 125 230 125 245 100 C235 88 215 82 200 82 C185 82 165 88 155 100 Z"
          fill={color}
          opacity="0.75"
        />
        <ellipse cx="200" cy="98" rx="42" ry="16" fill="var(--paper)" />
        {/* soft fold lines */}
        <path
          d="M200 160 L200 420"
          stroke={ink}
          strokeOpacity="0.06"
          strokeWidth="1"
          fill="none"
        />
      </svg>

      <div
        className="absolute pointer-events-none select-none font-display font-bold tracking-tight lowercase"
        style={{ ...logoStyle, color: ink }}
      >
        {logoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoDataUrl}
            alt=""
            className="object-contain"
            style={{
              width: viewBack ? 88 : placement === "chest-left" ? 42 : 64,
              height: viewBack ? 88 : placement === "chest-left" ? 42 : 64,
            }}
          />
        ) : (
          <span style={{ letterSpacing: placement === "chest-left" ? "0.02em" : "0.01em" }}>
            {logoLabel}
          </span>
        )}
      </div>

      {viewBack && (
        <span className="absolute bottom-3 left-3 text-[10px] tracking-[0.2em] uppercase text-muted bg-chalk/80 px-2 py-1">
          Back view
        </span>
      )}
    </div>
  );
}
