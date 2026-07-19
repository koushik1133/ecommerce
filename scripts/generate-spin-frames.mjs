#!/usr/bin/env node
/**
 * Generates 16 discrete SVG spin frames for the demo Studio Tee product.
 * Run: node scripts/generate-spin-frames.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../public/spins/studio-tee");
fs.mkdirSync(outDir, { recursive: true });

const FRAMES = 16;
const COLOR = "#1A1A1A";
const INK = "#F5F5F4";

function frameSvg(index) {
  const t = index / FRAMES;
  const angle = t * Math.PI * 2;
  const facing = Math.cos(angle);
  const side = Math.sin(angle);
  const absF = Math.abs(facing);
  const bodyW = 70 + absF * 85;
  const lx = 200 - bodyW / 2 + side * 8;
  const rx = 200 + bodyW / 2 + side * 8;
  const skew = side * 12;
  const leftSleeve = side > -0.4;
  const rightSleeve = side < 0.4;
  const isBack = facing < 0;
  const logoOpacity = Math.max(0, Math.abs(facing) - 0.25) / 0.75;

  const body = `M${lx} 150 C${lx} 150 ${180 + side * 5} 100 200 100 C${220 + side * 5} 100 ${rx} 150 ${rx} 150 L${rx + skew * 0.3} 420 C${rx} 445 230 458 200 458 C170 458 ${lx} 445 ${lx - skew * 0.3} 420 Z`;

  let sleeves = "";
  if (leftSleeve) {
    sleeves += `<path d="M${lx + 5} 148 L${lx - 40 - Math.max(0, -side) * 40} 175 L${lx - 10} 210 L${lx + 20} 165 Z" fill="${COLOR}" opacity="0.92"/>`;
  }
  if (rightSleeve) {
    sleeves += `<path d="M${rx - 5} 148 L${rx + 40 + Math.max(0, side) * 40} 175 L${rx + 10} 210 L${rx - 20} 165 Z" fill="${COLOR}" opacity="0.92"/>`;
  }

  const logoY = isBack ? 200 : 185;
  const logo = logoOpacity > 0.1
    ? `<text x="200" y="${logoY}" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="${isBack ? 28 : 22}" fill="${INK}" opacity="${logoOpacity}" transform="translate(${side * 6},0) scale(${0.4 + absF * 0.6},1)" style="transform-origin:200px ${logoY}px">brand</text>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="800" height="1000">
  <rect width="400" height="500" fill="#F0EFEC"/>
  <ellipse cx="${200 + side * 4}" cy="468" rx="${55 + absF * 20}" ry="9" fill="#000" opacity="0.08"/>
  ${sleeves}
  <path d="${body}" fill="${COLOR}"/>
  <path d="M${200 - 28 - absF * 6} 105 C185 128 215 128 ${200 + 28 + absF * 6} 105 C210 92 205 88 200 88 C195 88 190 92 ${200 - 28 - absF * 6} 105 Z" fill="${COLOR}" opacity="0.85"/>
  <ellipse cx="200" cy="100" rx="${26 + absF * 6}" ry="12" fill="#F0EFEC"/>
  ${logo}
</svg>`;
}

for (let i = 0; i < FRAMES; i++) {
  const name = String(i + 1).padStart(2, "0") + ".svg";
  fs.writeFileSync(path.join(outDir, name), frameSvg(i));
}

// Manifest for the app
fs.writeFileSync(
  path.join(outDir, "manifest.json"),
  JSON.stringify(
    {
      id: "studio-tee",
      frameCount: FRAMES,
      frames: Array.from({ length: FRAMES }, (_, i) =>
        `/spins/studio-tee/${String(i + 1).padStart(2, "0")}.svg`
      ),
    },
    null,
    2
  )
);

console.log(`Wrote ${FRAMES} frames → ${outDir}`);
