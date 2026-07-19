"use client";

import { useId, useMemo } from "react";
import type { LogoPlacement } from "@/lib/products";

export type TeeMockupProps = {
  color: string;
  logoLabel?: string;
  logoDataUrl?: string;
  placement?: LogoPlacement;
  className?: string;
  showBack?: boolean;
  /** 0 = front, 180 = back. Used by the 360° viewer. */
  angle?: number;
};

function isDarkColor(color: string) {
  return [
    "#1a1a1a",
    "#1b2a41",
    "#1f4d3a",
    "#a84b2f",
    "#8b5a3c",
    "#5c6b4a",
    "#4a5560",
  ].includes(color.toLowerCase());
}

function normalizeAngle(angle: number) {
  const a = angle % 360;
  return a < 0 ? a + 360 : a;
}

export function TeeMockup({
  color,
  logoLabel = "brand",
  logoDataUrl,
  placement = "chest-center",
  className = "",
  showBack = false,
  angle,
}: TeeMockupProps) {
  const uid = useId().replace(/:/g, "");
  const ink = isDarkColor(color) ? "#f5f5f4" : "#141414";

  const view = useMemo(() => {
    const deg = angle ?? (showBack || placement === "back" ? 180 : 0);
    const a = normalizeAngle(deg);
    const rad = (a * Math.PI) / 180;
    const facing = Math.cos(rad); // 1 front → -1 back
    const side = Math.sin(rad); // + right, - left
    const absFacing = Math.abs(facing);
    const sideAmount = Math.abs(side);

    // Body compresses toward the side views
    const bodyHalf = 95 + absFacing * 10;
    const leftX = 200 - bodyHalf * (0.55 + absFacing * 0.45);
    const rightX = 200 + bodyHalf * (0.55 + absFacing * 0.45);
    const skew = side * 18;

    const leftSleeveVisible = side > -0.35;
    const rightSleeveVisible = side < 0.35;
    const leftSleeveOut = Math.max(0, -side) * 55 + (1 - absFacing) * 8;
    const rightSleeveOut = Math.max(0, side) * 55 + (1 - absFacing) * 8;

    const neckW = 36 + absFacing * 10;
    const isBack = facing < 0;
    const depthShade = 0.88 + absFacing * 0.12;

    return {
      a,
      facing,
      side,
      absFacing,
      sideAmount,
      leftX: leftX + skew * 0.15,
      rightX: rightX + skew * 0.15,
      leftSleeveVisible,
      rightSleeveVisible,
      leftSleeveOut,
      rightSleeveOut,
      neckW,
      isBack,
      depthShade,
      // Logo visibility
      frontLogoOpacity: Math.max(0, facing) * (placement === "back" ? 0 : 1),
      backLogoOpacity:
        Math.max(0, -facing) *
        (placement === "back" ? 1 : placement === "chest-center" ? 0 : 0),
    };
  }, [angle, showBack, placement]);

  // When angle is undefined, keep classic card behaviour for placement===back
  const forceBack = angle === undefined && (showBack || placement === "back");
  const isBack = forceBack || view.isBack;

  const frontLogo =
    placement !== "back"
      ? {
          opacity: angle === undefined ? 1 : view.frontLogoOpacity,
          x:
            placement === "chest-left"
              ? 200 + view.side * 12 - 52 * Math.max(view.facing, 0.2)
              : 200 + view.side * 8,
          y: placement === "chest-left" ? 175 : 185,
          size: placement === "chest-left" ? 34 : 52,
        }
      : null;

  const backLogo =
    placement === "back"
      ? {
          opacity: angle === undefined ? 1 : Math.max(0, -view.facing),
          x: 200 + view.side * 8,
          y: 195,
          size: 72,
        }
      : null;

  const activeLogo = isBack ? backLogo : frontLogo;
  const showLogo = activeLogo && activeLogo.opacity > 0.08;

  const leftSleeve = `M${view.leftX + 8} 145 L${view.leftX - 35 - view.leftSleeveOut} 178 L${view.leftX - 8 - view.leftSleeveOut * 0.4} 215 L${view.leftX + 18} 168 Z`;
  const rightSleeve = `M${view.rightX - 8} 145 L${view.rightX + 35 + view.rightSleeveOut} 178 L${view.rightX + 8 + view.rightSleeveOut * 0.4} 215 L${view.rightX - 18} 168 Z`;

  const bodyPath = `M${view.leftX} 148
    C${view.leftX} 148 ${170 + view.side * 6} 96 200 96
    C${230 + view.side * 6} 96 ${view.rightX} 148 ${view.rightX} 148
    L${view.rightX + 8 + view.side * 4} 428
    C${view.rightX + 8} 448 ${230} 462 200 462
    C${170} 462 ${view.leftX - 8} 448 ${view.leftX - 8 - view.side * 4} 428 Z`;

  const shadeId = `teeShade-${uid}`;
  const glossId = `teeGloss-${uid}`;

  return (
    <div className={`relative aspect-[4/5] w-full overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 400 500"
        className="absolute inset-0 h-full w-full"
        aria-hidden
        style={{
          transform: `perspective(900px) rotateY(${view.side * -8}deg)`,
          transformOrigin: "center center",
        }}
      >
        <defs>
          <linearGradient id={shadeId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={view.depthShade} />
            <stop
              offset="45%"
              stopColor={color}
              stopOpacity={1}
            />
            <stop
              offset="100%"
              stopColor={color}
              stopOpacity={0.82 + view.sideAmount * 0.08}
            />
          </linearGradient>
          <linearGradient id={glossId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.14" />
            <stop offset="40%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* soft ground shadow */}
        <ellipse
          cx={200 + view.side * 6}
          cy="472"
          rx={70 + view.absFacing * 18}
          ry="10"
          fill="#000"
          opacity={0.08 + view.absFacing * 0.04}
        />

        {view.leftSleeveVisible && (
          <path d={leftSleeve} fill={color} opacity={0.92 - view.sideAmount * 0.1} />
        )}
        {view.rightSleeveVisible && (
          <path d={rightSleeve} fill={color} opacity={0.92 - view.sideAmount * 0.1} />
        )}

        <path d={bodyPath} fill={`url(#${shadeId})`} />
        <path d={bodyPath} fill={`url(#${glossId})`} />

        {/* collar */}
        <path
          d={`M${200 - view.neckW} 102
            C${190} 128 ${210} 128 ${200 + view.neckW} 102
            C${210} 90 ${205} 84 200 84
            C${195} 84 ${190} 90 ${200 - view.neckW} 102 Z`}
          fill={color}
          opacity="0.78"
        />
        <ellipse
          cx="200"
          cy="98"
          rx={view.neckW * 0.95}
          ry={14 + view.absFacing * 2}
          fill="var(--paper, #f5f5f4)"
        />

        {/* center seam hint */}
        <path
          d={`M${200 + view.side * 10} 155 L${200 + view.side * 4} 420`}
          stroke={ink}
          strokeOpacity={0.05 + view.sideAmount * 0.04}
          strokeWidth="1"
          fill="none"
        />

        {/* side fold when near profile */}
        {view.sideAmount > 0.45 && (
          <path
            d={`M${view.side > 0 ? view.rightX - 12 : view.leftX + 12} 170
              L${view.side > 0 ? view.rightX - 4 : view.leftX + 4} 410`}
            stroke="#000"
            strokeOpacity={0.12 * view.sideAmount}
            strokeWidth="2"
            fill="none"
          />
        )}
      </svg>

      {showLogo && activeLogo && (
        <div
          className="absolute pointer-events-none select-none font-display font-bold tracking-tight lowercase will-change-transform"
          style={{
            left: `${(activeLogo.x / 400) * 100}%`,
            top: `${(activeLogo.y / 500) * 100}%`,
            transform: `translate(-50%, -50%) scaleX(${0.35 + view.absFacing * 0.65})`,
            opacity: activeLogo.opacity,
            color: ink,
            fontSize: `${activeLogo.size * 0.22}px`,
            transition: angle === undefined ? "opacity 0.2s ease" : undefined,
          }}
        >
          {logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoDataUrl}
              alt=""
              className="object-contain"
              style={{
                width: activeLogo.size,
                height: activeLogo.size,
              }}
            />
          ) : (
            <span>{logoLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
