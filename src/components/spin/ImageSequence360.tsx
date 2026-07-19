"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { RotateCcw } from "lucide-react";
import { angleToFrame, normalizeFrameIndex, spinQualityLabel } from "@/lib/spin";

type ImageSequence360Props = {
  frames: string[];
  className?: string;
  autoSpin?: boolean;
  logoDataUrl?: string;
  logoLabel?: string;
  /** 0–1 relative position of logo on front-facing frames */
  showLogoOnFront?: boolean;
  background?: string;
  customBackgroundUrl?: string;
};

/**
 * Industry-standard 360° viewer: preloaded image sequence + drag scrubbing.
 * With few frames, crossfades between neighbours for a smoother turn.
 */
export function ImageSequence360({
  frames,
  className = "",
  autoSpin = true,
  logoDataUrl,
  logoLabel,
  showLogoOnFront = true,
  background = "radial-gradient(ellipse at 50% 30%, #fff 0%, #ececea 55%, #e2e2df 100%)",
  customBackgroundUrl,
}: ImageSequence360Props) {
  const count = frames.length;
  const angleRef = useRef(0);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const pauseUntilRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [frameFloat, setFrameFloat] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [ready, setReady] = useState(false);
  const [hint, setHint] = useState(true);
  const quality = spinQualityLabel(count);

  // Preload
  useEffect(() => {
    if (!count) {
      setReady(false);
      return;
    }
    let cancelled = false;
    let loaded = 0;
    frames.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded += 1;
        if (!cancelled && loaded >= count) setReady(true);
      };
      img.src = src;
    });
    return () => {
      cancelled = true;
    };
  }, [frames, count]);

  const paint = useCallback(
    (angle: number) => {
      angleRef.current = ((angle % 360) + 360) % 360;
      setFrameFloat(angleToFrame(angleRef.current, count));
    },
    [count]
  );

  useEffect(() => {
    function tick() {
      const now = performance.now();
      if (!draggingRef.current && count > 1) {
        if (Math.abs(velocityRef.current) > 0.02) {
          paint(angleRef.current + velocityRef.current);
          velocityRef.current *= 0.92;
        } else if (autoSpin && now > pauseUntilRef.current) {
          paint(angleRef.current + 0.35);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [autoSpin, count, paint]);

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (count < 2) return;
    draggingRef.current = true;
    setDragging(true);
    setHint(false);
    velocityRef.current = 0;
    lastXRef.current = e.clientX;
    lastTRef.current = performance.now();
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    const now = performance.now();
    const dx = e.clientX - lastXRef.current;
    const dt = Math.max(8, now - lastTRef.current);
    // Sensitivity scales with frame count for consistent feel
    const delta = -dx * (0.45 + Math.min(count, 36) * 0.01);
    paint(angleRef.current + delta);
    velocityRef.current = delta * (16 / dt);
    lastXRef.current = e.clientX;
    lastTRef.current = now;
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    draggingRef.current = false;
    setDragging(false);
    pauseUntilRef.current = performance.now() + 2000;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  function reset() {
    velocityRef.current = 0;
    pauseUntilRef.current = performance.now() + 2500;
    paint(0);
  }

  if (!count) {
    return (
      <div
        className={`aspect-[4/5] flex items-center justify-center bg-surface text-sm text-muted ${className}`}
      >
        Upload spin frames to build your 360°
      </div>
    );
  }

  const i0 = normalizeFrameIndex(Math.floor(frameFloat), count);
  const i1 = normalizeFrameIndex(i0 + 1, count);
  const blend = count > 1 ? frameFloat - Math.floor(frameFloat) : 0;
  const angleDeg = (frameFloat / Math.max(count, 1)) * 360;
  // Near front (frame ~0) show logo overlay
  const frontness =
    1 -
    Math.min(frameFloat % count, count - (frameFloat % count)) / (count / 2);
  const logoOpacity = showLogoOnFront ? Math.max(0, frontness - 0.35) / 0.65 : 0;

  const bgStyle = customBackgroundUrl
    ? {
        backgroundImage: `url(${customBackgroundUrl})`,
        backgroundSize: "cover" as const,
        backgroundPosition: "center" as const,
      }
    : { background };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative aspect-[4/5] overflow-hidden touch-none rounded-2xl ${
          count > 1 ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
        }`}
        style={bgStyle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="img"
        aria-label="360 degree product view"
      >
        {!ready && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface/80 text-sm text-muted">
            Loading 360°…
          </div>
        )}

        {/* Crossfade pair for buttery motion with few OR many frames */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={frames[i0]}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain p-6 md:p-10"
            style={{ opacity: 1 - blend, willChange: "opacity" }}
          />
          {count > 1 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={frames[i1]}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-contain p-6 md:p-10"
              style={{ opacity: blend, willChange: "opacity" }}
            />
          )}
        </div>

        {logoOpacity > 0.05 && (logoDataUrl || logoLabel) && (
          <div
            className="absolute left-1/2 top-[38%] z-[5] -translate-x-1/2 -translate-y-1/2 pointer-events-none font-display font-bold lowercase text-ink"
            style={{ opacity: logoOpacity * 0.92 }}
          >
            {logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoDataUrl} alt="" className="h-14 w-14 object-contain drop-shadow-sm" />
            ) : (
              <span className="text-lg tracking-tight drop-shadow-sm">{logoLabel}</span>
            )}
          </div>
        )}

        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
          <span className="bg-chalk/90 backdrop-blur-sm border border-line text-[10px] tracking-[0.18em] uppercase px-2.5 py-1.5">
            360° · {count} frames
          </span>
        </div>

        {count > 1 && (
          <button
            type="button"
            className="absolute top-3 right-3 z-10 bg-chalk/90 backdrop-blur-sm border border-line p-2 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              reset();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Reset view"
          >
            <RotateCcw size={14} strokeWidth={1.75} />
          </button>
        )}

        {hint && count > 1 && (
          <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 pointer-events-none">
            <span className="bg-ink/80 text-chalk text-[11px] px-3 py-1.5 animate-pulse-soft">
              Drag to spin
            </span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between gap-3 pointer-events-none">
          <p className="text-[10px] text-ink/50 max-w-[70%] leading-snug">
            {quality.label} — {quality.hint}
          </p>
          <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
            <circle cx="14" cy="14" r="10" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
            <circle
              cx="14"
              cy="14"
              r="10"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${((angleDeg % 360) / 360) * 62.83} 62.83`}
              transform="rotate(-90 14 14)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
