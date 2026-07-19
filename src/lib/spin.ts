/** Recommended spin frame counts for smooth 360° product views */
export const SPIN_GUIDANCE = {
  minimum: 4,
  good: 8,
  recommended: 16,
  pro: 24,
  ideal: 36,
} as const;

export function spinQualityLabel(count: number): {
  label: string;
  hint: string;
  level: "low" | "ok" | "good" | "pro";
} {
  if (count < 2) {
    return {
      level: "low",
      label: "Need more angles",
      hint: "Add at least 4 photos (front, right, back, left).",
    };
  }
  if (count < 4) {
    return {
      level: "low",
      label: "Limited spin",
      hint: "Works, but add 4+ sides for a full turn.",
    };
  }
  if (count < 8) {
    return {
      level: "ok",
      label: "Key-angle spin",
      hint: "Smooth crossfade between angles. For silkier motion, use 8–16.",
    };
  }
  if (count < 16) {
    return {
      level: "good",
      label: "Smooth 360°",
      hint: "Great for ecommerce. 16–24 frames feels premium.",
    };
  }
  if (count < 24) {
    return {
      level: "good",
      label: "Premium 360°",
      hint: "Very smooth. Pro studios often shoot 24–36.",
    };
  }
  return {
    level: "pro",
    label: "Studio-grade 360°",
    hint: "Matches top Shopify / Sirv-style viewers.",
  };
}

export function normalizeFrameIndex(index: number, length: number) {
  if (length <= 0) return 0;
  const i = index % length;
  return i < 0 ? i + length : i;
}

/** Map degrees → floating frame index for scrubbing */
export function angleToFrame(angleDeg: number, frameCount: number) {
  if (frameCount <= 0) return 0;
  const a = ((angleDeg % 360) + 360) % 360;
  return (a / 360) * frameCount;
}
