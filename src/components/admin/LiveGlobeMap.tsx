"use client";

import { useEffect, useRef, useState } from "react";
import type { VisitorSession } from "@/store/live-tracker";
import { Globe, MapPin } from "lucide-react";

type LiveGlobeMapProps = {
  sessions: VisitorSession[];
};

// Major Continent & Landmass Polygon Boundaries
const CONTINENT_POLYGONS: { name: string; points: [number, number][] }[] = [
  // North America
  {
    name: "North America",
    points: [
      [71, -162], [65, -168], [58, -152], [58, -136], [48, -124],
      [34, -120], [30, -115], [23, -110], [16, -93], [14, -88],
      [9, -79], [9, -77], [21, -86], [25, -80], [30, -81],
      [35, -75], [44, -64], [47, -53], [52, -55], [60, -64],
      [63, -83], [68, -85], [71, -95], [69, -135], [71, -162]
    ]
  },
  // South America
  {
    name: "South America",
    points: [
      [12, -73], [10, -62], [7, -58], [2, -50], [-5, -36],
      [-12, -37], [-23, -42], [-33, -52], [-45, -66], [-54, -68],
      [-53, -75], [-42, -73], [-30, -71], [-18, -70], [-5, -80],
      [1, -79], [9, -79], [12, -73]
    ]
  },
  // Europe
  {
    name: "Europe",
    points: [
      [36, -9], [43, -9], [44, -1], [48, -4], [52, 2],
      [54, 8], [58, 6], [62, 5], [70, 20], [71, 28],
      [68, 44], [60, 30], [55, 37], [46, 38], [42, 29],
      [40, 23], [38, 15], [36, -5], [36, -9]
    ]
  },
  // Africa
  {
    name: "Africa",
    points: [
      [37, -10], [37, 10], [32, 32], [30, 32], [22, 37],
      [12, 44], [10, 51], [0, 42], [-11, 40], [-25, 33],
      [-34, 26], [-34, 18], [-23, 14], [-12, 13], [5, 9],
      [4, -7], [10, -14], [15, -17], [28, -13], [37, -10]
    ]
  },
  // India & South Asia
  {
    name: "India",
    points: [
      [35, 74], [34, 78], [28, 88], [25, 91], [22, 89],
      [16, 82], [10, 80], [8, 77], [12, 75], [16, 73],
      [23, 68], [25, 68], [30, 70], [35, 74]
    ]
  },
  // East Asia & Eurasia
  {
    name: "Eurasia / East Asia",
    points: [
      [70, 40], [70, 70], [72, 130], [66, 170], [60, 164],
      [54, 140], [43, 132], [40, 120], [30, 120], [22, 114],
      [21, 108], [10, 104], [2, 102], [2, 98], [15, 98],
      [22, 92], [28, 88], [35, 74], [40, 50], [50, 50],
      [60, 40], [70, 40]
    ]
  },
  // Southeast Asia & Indonesia
  {
    name: "Southeast Asia",
    points: [
      [6, 100], [5, 104], [-2, 106], [-6, 107], [-8, 115],
      [-8, 125], [-2, 128], [5, 119], [10, 126], [18, 122],
      [15, 108], [6, 100]
    ]
  },
  // Australia & New Zealand
  {
    name: "Australia",
    points: [
      [-12, 131], [-12, 142], [-22, 150], [-28, 153], [-38, 147],
      [-37, 139], [-35, 135], [-34, 122], [-32, 115], [-22, 114],
      [-14, 126], [-12, 131]
    ]
  },
  // Japan
  {
    name: "Japan",
    points: [
      [45, 142], [40, 140], [35, 136], [31, 131], [33, 130],
      [36, 136], [42, 141], [45, 142]
    ]
  },
  // UK & Ireland
  {
    name: "United Kingdom",
    points: [
      [58, -6], [58, -3], [54, -1], [50, 1], [50, -5],
      [54, -6], [58, -6]
    ]
  }
];

// Generate dense continent land dots for high-tech dot matrix land surface
const LAND_DOTS: [number, number][] = [];
(function generateLandDots() {
  CONTINENT_POLYGONS.forEach((cont) => {
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    cont.points.forEach(([lat, lng]) => {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    });

    const step = 4;
    for (let lat = Math.floor(minLat); lat <= Math.ceil(maxLat); lat += step) {
      for (let lng = Math.floor(minLng); lng <= Math.ceil(maxLng); lng += step) {
        if (pointInPolygon([lat, lng], cont.points)) {
          LAND_DOTS.push([lat, lng]);
        }
      }
    }
  });
})();

function pointInPolygon(point: [number, number], vs: [number, number][]) {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function LiveGlobeMap({ sessions }: LiveGlobeMapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef({ rotX: 0.3, rotY: 0 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const radius = Math.min(width, height) * 0.38;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Auto-spin globe if not dragging
      if (!isDraggingRef.current) {
        rotationRef.current.rotY += 0.003;
      }

      const { rotX, rotY } = rotationRef.current;

      // 1. Globe Atmosphere Halo Glow
      const atmosphereGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.95,
        centerX,
        centerY,
        radius * 1.3
      );
      atmosphereGradient.addColorStop(0, "rgba(15, 110, 86, 0.25)");
      atmosphereGradient.addColorStop(0.5, "rgba(99, 102, 241, 0.12)");
      atmosphereGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = atmosphereGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Globe Base Dark Sphere
      const globeGrad = ctx.createRadialGradient(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        radius * 0.1,
        centerX,
        centerY,
        radius
      );
      globeGrad.addColorStop(0, "#161d26");
      globeGrad.addColorStop(0.7, "#0d131a");
      globeGrad.addColorStop(1, "#070a0e");

      ctx.fillStyle = globeGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(16, 185, 129, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 3D Projection Helper
      const project = (lat: number, lng: number) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180) + rotY;

        const x = centerX - radius * Math.sin(phi) * Math.cos(theta);
        const y =
          centerY -
          radius * Math.cos(phi) * Math.cos(rotX) +
          radius * Math.sin(phi) * Math.sin(theta) * Math.sin(rotX);
        const z =
          radius * Math.sin(phi) * Math.sin(theta) * Math.cos(rotX) +
          radius * Math.cos(phi) * Math.sin(rotX);

        return { x, y, z };
      };

      // 2. Render Latitude / Longitude Grid Lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;

      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        for (let lng = -180; lng <= 180; lng += 10) {
          const pt = project(lat, lng);
          if (pt.z > -radius * 0.1) {
            if (lng === -180) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();
      }

      // 3. Render Continent Landmass Polygons & Outlines
      CONTINENT_POLYGONS.forEach((cont) => {
        ctx.beginPath();
        let first = true;
        let anyVisible = false;

        cont.points.forEach(([lat, lng]) => {
          const pt = project(lat, lng);
          if (pt.z > 0) anyVisible = true;
          if (first) {
            ctx.moveTo(pt.x, pt.y);
            first = false;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        });

        ctx.closePath();

        if (anyVisible) {
          // Fill continent landmass with stylish teal tint
          ctx.fillStyle = "rgba(15, 110, 86, 0.28)";
          ctx.fill();

          // Bright crisp green/teal continent border outline
          ctx.strokeStyle = "rgba(16, 185, 129, 0.75)";
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      });

      // 4. Render Continent Land Dot Matrix Surface
      LAND_DOTS.forEach(([lat, lng]) => {
        const pt = project(lat, lng);
        if (pt.z > 0) {
          const opacity = Math.max(0.15, (pt.z / radius) * 0.6);
          ctx.fillStyle = `rgba(52, 211, 153, ${opacity})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 5. Render Active Visitor Pins & Vertical Beacons (Shopify Style)
      const now = Date.now();
      sessions.forEach((sess) => {
        const lat = sess.location.lat ?? 19.076;
        const lng = sess.location.lng ?? 72.8777;

        const pt = project(lat, lng);

        // Only render if on front-facing hemisphere
        if (pt.z > 0) {
          const pinPulse = Math.sin(now * 0.006 + hashStr(sess.id)) * 5 + 9;

          // Vertical Beacon Line
          const beaconHeight = 28;
          const topX = pt.x;
          const topY = pt.y - beaconHeight;

          const lineGrad = ctx.createLinearGradient(pt.x, pt.y, topX, topY);
          lineGrad.addColorStop(0, "rgba(16, 185, 129, 0.9)");
          lineGrad.addColorStop(1, "rgba(129, 140, 248, 1)");

          ctx.strokeStyle = lineGrad;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(topX, topY);
          ctx.stroke();

          // Pulsing Base Ripple Ring
          ctx.strokeStyle = "rgba(52, 211, 153, 0.8)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pinPulse, 0, Math.PI * 2);
          ctx.stroke();

          // Base Glow Dot
          ctx.fillStyle = "#10b981";
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
          ctx.fill();

          // Top Beacon Head Node
          ctx.fillStyle = "#6366f1";
          ctx.beginPath();
          ctx.arc(topX, topY, 5.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Live Visitor Flag Label Box
          ctx.fillStyle = "rgba(15, 15, 20, 0.9)";
          ctx.strokeStyle = "rgba(16, 185, 129, 0.5)";
          ctx.lineWidth = 1;
          const labelText = `${sess.location.flag} ${sess.location.city}`;
          ctx.font = "bold 10px sans-serif";
          const textWidth = ctx.measureText(labelText).width;

          const boxWidth = textWidth + 12;
          const boxHeight = 18;
          const boxX = topX - boxWidth / 2;
          const boxY = topY - 24;

          ctx.beginPath();
          ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#ffffff";
          ctx.fillText(labelText, boxX + 6, boxY + 12);
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [sessions]);

  // Drag interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;

    rotationRef.current.rotY += dx * 0.005;
    rotationRef.current.rotX = Math.max(-1, Math.min(1, rotationRef.current.rotX + dy * 0.005));

    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="bg-[#0f0f14] text-white rounded-3xl border border-white/10 p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
      {/* Header Overlay */}
      <div className="w-full flex items-center justify-between z-10 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Globe size={18} />
          </div>
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              Shopify 3D Live Globe — Country Outlines & Beacons
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                REAL-TIME LANDMASS
              </span>
            </h3>
            <p className="text-xs text-white/50">Drag globe to rotate • Continent landmass & live visitor pin drops</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-white/80">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold">{sessions.length} Live Pins Active</span>
        </div>
      </div>

      {/* 3D Globe Canvas */}
      <div
        className="relative cursor-grab active:cursor-grabbing my-2 flex items-center justify-center w-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas ref={canvasRef} width={640} height={440} className="w-full max-w-[640px] h-[400px] object-contain" />
      </div>

      {/* Footer Location Badges */}
      <div className="w-full pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs z-10">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-0.5">
          {sessions.length === 0 ? (
            <span className="text-white/40 italic">No live visitor beacons currently detected</span>
          ) : (
            sessions.map((sess) => (
              <span
                key={sess.id}
                className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl text-xs text-white/90 shrink-0"
              >
                <span>{sess.location.flag}</span>
                <span className="font-bold">{sess.location.city}</span>
                <span className="text-emerald-400 text-[10px] uppercase font-mono">LIVE</span>
              </span>
            ))
          )}
        </div>

        <div className="text-[11px] text-white/40 flex items-center gap-1 shrink-0">
          <MapPin size={12} className="text-emerald-400" />
          <span>Real Geo-IP Continent Projection</span>
        </div>
      </div>
    </div>
  );
}

function hashStr(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
  }
  return Math.abs(hash);
}
