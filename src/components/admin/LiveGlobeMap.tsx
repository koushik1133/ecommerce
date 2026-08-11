"use client";

import { useEffect, useRef, useState } from "react";
import type { VisitorSession } from "@/store/live-tracker";
import { Globe, MapPin, Eye, ShoppingCart } from "lucide-react";

type LiveGlobeMapProps = {
  sessions: VisitorSession[];
};

export function LiveGlobeMap({ sessions }: LiveGlobeMapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeHoverSession, setActiveHoverSession] = useState<VisitorSession | null>(null);
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

      // 1. Globe Background & Atmosphere Halo
      const atmosphereGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.95,
        centerX,
        centerY,
        radius * 1.25
      );
      atmosphereGradient.addColorStop(0, "rgba(15, 110, 86, 0.15)");
      atmosphereGradient.addColorStop(0.5, "rgba(99, 102, 241, 0.08)");
      atmosphereGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = atmosphereGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Globe Base Sphere
      const globeGrad = ctx.createRadialGradient(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        radius * 0.1,
        centerX,
        centerY,
        radius
      );
      globeGrad.addColorStop(0, "#1a1a24");
      globeGrad.addColorStop(0.7, "#12121a");
      globeGrad.addColorStop(1, "#0a0a0f");

      ctx.fillStyle = globeGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 2. Latitude & Longitude Grid Lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;

      // Parallels (Latitudes)
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        const radLat = (lat * Math.PI) / 180;
        const y = centerY - radius * Math.sin(radLat) * Math.cos(rotX);
        const rLat = radius * Math.cos(radLat);

        for (let i = 0; i <= 360; i += 10) {
          const radLng = ((i + rotY * (180 / Math.PI)) * Math.PI) / 180;
          const x = centerX + rLat * Math.sin(radLng);
          const z = rLat * Math.cos(radLng) * Math.sin(rotX) + radius * Math.sin(radLat) * Math.cos(rotX);

          if (z > -radius * 0.2) {
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Meridiens (Longitudes)
      for (let lng = 0; lng < 360; lng += 30) {
        ctx.beginPath();
        const radLng = ((lng + rotY * (180 / Math.PI)) * Math.PI) / 180;
        for (let lat = -90; lat <= 90; lat += 5) {
          const radLat = (lat * Math.PI) / 180;
          const x = centerX + radius * Math.cos(radLat) * Math.sin(radLng);
          const y =
            centerY -
            radius * Math.sin(radLat) * Math.cos(rotX) +
            radius * Math.cos(radLat) * Math.cos(radLng) * Math.sin(rotX);
          const z =
            radius * Math.cos(radLat) * Math.cos(radLng) * Math.cos(rotX) +
            radius * Math.sin(radLat) * Math.sin(rotX);

          if (z > 0) {
            if (lat === -90) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // 3. Render Active Visitor Pins & Vertical Beacons
      const now = Date.now();
      sessions.forEach((sess) => {
        const lat = sess.location.lat ?? 19.076;
        const lng = sess.location.lng ?? 72.8777;

        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180) + rotY;

        // 3D Spherical Conversion
        const x = centerX - radius * Math.sin(phi) * Math.cos(theta);
        const y =
          centerY -
          radius * Math.cos(phi) * Math.cos(rotX) +
          radius * Math.sin(phi) * Math.sin(theta) * Math.sin(rotX);
        const z =
          radius * Math.sin(phi) * Math.sin(theta) * Math.cos(rotX) +
          radius * Math.cos(phi) * Math.sin(rotX);

        // Only draw pins on the front hemisphere
        if (z > 0) {
          const pinPulse = Math.sin(now * 0.005 + hashStr(sess.id)) * 4 + 8;

          // Vertical Beacon Line (Shopify Style)
          const beaconHeight = 24;
          const topX = x;
          const topY = y - beaconHeight;

          const lineGrad = ctx.createLinearGradient(x, y, topX, topY);
          lineGrad.addColorStop(0, "rgba(16, 185, 129, 0.8)");
          lineGrad.addColorStop(1, "rgba(99, 102, 241, 1)");

          ctx.strokeStyle = lineGrad;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(topX, topY);
          ctx.stroke();

          // Ripple Ring at base
          ctx.strokeStyle = "rgba(16, 185, 129, 0.6)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x, y, pinPulse, 0, Math.PI * 2);
          ctx.stroke();

          // Core Dot at base
          ctx.fillStyle = "#10b981";
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();

          // Glowing Top Pin Head
          ctx.fillStyle = "#6366f1";
          ctx.beginPath();
          ctx.arc(topX, topY, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.stroke();
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
              Shopify Live 3D Globe
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                REAL-TIME BEACONS
              </span>
            </h3>
            <p className="text-xs text-white/50">Drag globe to rotate • Live visitor pin drops</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-white/80">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold">{sessions.length} Live Pins Active</span>
        </div>
      </div>

      {/* 3D Globe Canvas */}
      <div
        className="relative cursor-grab active:cursor-grabbing my-2 flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas ref={canvasRef} width={480} height={400} className="w-full max-w-[480px] h-[360px] object-contain" />
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
          <span>Geo-IP Lat/Lng Projection</span>
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
