"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { LogoPlacement } from "@/lib/products";

export type Tee3DViewerHandle = {
  exportPng: () => string | null;
};

type Tee3DViewerProps = {
  color: string;
  logoLabel?: string;
  logoDataUrl?: string;
  placement?: LogoPlacement;
  background?: string;
  customBackgroundUrl?: string;
  autoRotate?: boolean;
  rotateSpeed?: number;
  className?: string;
  showHint?: boolean;
};

function useLogoTexture(logoDataUrl?: string, logoLabel?: string, ink = "#111") {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    let disposed = false;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;

    const commit = () => {
      if (disposed) return;
      tex.needsUpdate = true;
      setTexture(tex);
    };

    const paintText = () => {
      ctx.clearRect(0, 0, 512, 512);
      ctx.fillStyle = ink;
      ctx.font = "700 110px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText((logoLabel || "brand").slice(0, 12), 256, 256);
      commit();
    };

    if (logoDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, 512, 512);
        const scale = Math.min(440 / img.width, 440 / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (512 - w) / 2, (512 - h) / 2, w, h);
        commit();
      };
      img.onerror = paintText;
      img.src = logoDataUrl;
    } else {
      paintText();
    }

    return () => {
      disposed = true;
      tex.dispose();
    };
  }, [logoDataUrl, logoLabel, ink]);

  return texture;
}

function FabricMaterial({ color }: { color: string }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.82}
      metalness={0.02}
      envMapIntensity={0.45}
    />
  );
}

function TeeModel({
  color,
  logoTexture,
  placement,
}: {
  color: string;
  logoTexture: THREE.Texture | null;
  placement: LogoPlacement;
}) {
  const isDark = useMemo(() => {
    const c = new THREE.Color(color);
    return c.r * 0.299 + c.g * 0.587 + c.b * 0.114 < 0.45;
  }, [color]);

  const logoPos = useMemo((): {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: number;
  } => {
    if (placement === "back") {
      return { position: [0, 0.25, -0.16], rotation: [0, Math.PI, 0], scale: 0.52 };
    }
    if (placement === "chest-left") {
      return { position: [-0.32, 0.42, 0.16], rotation: [0, 0, 0], scale: 0.22 };
    }
    return { position: [0, 0.38, 0.16], rotation: [0, 0, 0], scale: 0.36 };
  }, [placement]);

  return (
    <group>
      {/* Body — flatter, more garment-like */}
      <RoundedBox args={[1.55, 1.85, 0.28]} radius={0.14} smoothness={12} position={[0, 0.05, 0]}>
        <FabricMaterial color={color} />
      </RoundedBox>
      {/* Shoulder bridge */}
      <RoundedBox args={[1.35, 0.28, 0.26]} radius={0.1} smoothness={10} position={[0, 1.02, 0]}>
        <FabricMaterial color={color} />
      </RoundedBox>
      {/* Collar band */}
      <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.04, 20, 48]} />
        <FabricMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.2, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.155, 0.022, 16, 40]} />
        <meshStandardMaterial
          color={isDark ? "#2c2c2c" : "#ebe8e2"}
          roughness={0.92}
          metalness={0}
        />
      </mesh>
      {/* Sleeves — thinner, longer */}
      <RoundedBox
        args={[0.72, 0.32, 0.26]}
        radius={0.1}
        smoothness={10}
        position={[-0.98, 0.78, 0]}
        rotation={[0, 0, 0.55]}
      >
        <FabricMaterial color={color} />
      </RoundedBox>
      <RoundedBox
        args={[0.72, 0.32, 0.26]}
        radius={0.1}
        smoothness={10}
        position={[0.98, 0.78, 0]}
        rotation={[0, 0, -0.55]}
      >
        <FabricMaterial color={color} />
      </RoundedBox>
      {/* Hem */}
      <RoundedBox args={[1.58, 0.1, 0.3]} radius={0.05} smoothness={8} position={[0, -0.88, 0]}>
        <FabricMaterial color={color} />
      </RoundedBox>

      {logoTexture ? (
        <mesh position={logoPos.position} rotation={logoPos.rotation} scale={logoPos.scale}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            map={logoTexture}
            transparent
            depthWrite={false}
            roughness={0.55}
            metalness={0.05}
          />
        </mesh>
      ) : null}
    </group>
  );
}

function SceneBackground({ color }: { color: string }) {
  const { scene, gl } = useThree();
  useEffect(() => {
    const c = new THREE.Color(color);
    scene.background = c;
    gl.setClearColor(c, 1);
  }, [color, scene, gl]);
  return null;
}

function CaptureBridge({
  captureRef,
}: {
  captureRef: React.MutableRefObject<(() => string | null) | null>;
}) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    captureRef.current = () => {
      try {
        gl.render(scene, camera);
        return gl.domElement.toDataURL("image/png");
      } catch {
        return null;
      }
    };
    return () => {
      captureRef.current = null;
    };
  }, [gl, scene, camera, captureRef]);
  return null;
}

function Scene({
  color,
  logoDataUrl,
  logoLabel,
  placement,
  autoRotate,
  rotateSpeed,
  captureRef,
  clearColor,
}: {
  color: string;
  logoDataUrl?: string;
  logoLabel?: string;
  placement: LogoPlacement;
  autoRotate: boolean;
  rotateSpeed: number;
  captureRef: React.MutableRefObject<(() => string | null) | null>;
  clearColor: string;
}) {
  const isDark = useMemo(() => {
    const c = new THREE.Color(color);
    return c.r * 0.299 + c.g * 0.587 + c.b * 0.114 < 0.45;
  }, [color]);

  const logoTexture = useLogoTexture(
    logoDataUrl,
    logoLabel,
    isDark ? "#f5f5f4" : "#111111"
  );

  return (
    <>
      <SceneBackground color={clearColor} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 6, 3]} intensity={1.25} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} />
      <hemisphereLight args={["#ffffff", "#e8e6e1", 0.35]} />
      <TeeModel color={color} logoTexture={logoTexture} placement={placement} />
      <ContactShadows
        position={[0, -1.05, 0]}
        opacity={0.35}
        scale={8}
        blur={2.4}
        far={4}
      />
      <OrbitControls
        makeDefault
        target={[0, 0.15, 0]}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={0.7}
        maxPolarAngle={1.75}
        minDistance={2.4}
        maxDistance={6}
        autoRotate={autoRotate}
        autoRotateSpeed={rotateSpeed}
      />
      <CaptureBridge captureRef={captureRef} />
    </>
  );
}

function resolveBg(background?: string) {
  if (!background) return "#f4f4f2";
  if (background.startsWith("#")) return background;
  if (background.includes("0f0f0f") || background.includes("1a1a1a")) return "#141414";
  if (background.includes("e8f5f1")) return "#e8f5f1";
  if (background.includes("fafaf9")) return "#fafaf9";
  if (background.includes("ffffff")) return "#f4f4f2";
  return "#f4f4f2";
}

export const Tee3DViewer = forwardRef<Tee3DViewerHandle, Tee3DViewerProps>(
  function Tee3DViewer(
    {
      color,
      logoLabel = "brand",
      logoDataUrl,
      placement = "chest-center",
      background,
      customBackgroundUrl,
      autoRotate = true,
      rotateSpeed = 0.9,
      className = "",
      showHint = true,
    },
    ref
  ) {
    const bgColor = customBackgroundUrl ? "#121212" : resolveBg(background);
    const [mounted, setMounted] = useState(false);
    const [failed, setFailed] = useState(false);
    const captureRef = useRef<(() => string | null) | null>(null);
    const wrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => setMounted(true), []);

    useImperativeHandle(ref, () => ({
      exportPng: () => captureRef.current?.() ?? null,
    }));

    if (!mounted) {
      return (
        <div
          className={`relative h-full w-full min-h-[420px] bg-[#f4f4f2] flex items-center justify-center ${className}`}
        >
          <span className="text-xs tracking-[0.18em] uppercase text-muted">
            Loading 3D…
          </span>
        </div>
      );
    }

    if (failed) {
      return (
        <div
          className={`relative h-full w-full min-h-[420px] flex items-center justify-center bg-[#f4f4f2] text-sm text-muted px-6 text-center ${className}`}
        >
          3D preview unavailable on this device.
        </div>
      );
    }

    return (
      <div
        ref={wrapRef}
        className={`relative h-full w-full min-h-[420px] overflow-hidden ${className}`}
        style={{
          background: customBackgroundUrl
            ? "#121212"
            : background?.startsWith("radial")
              ? background
              : bgColor,
        }}
      >
        {customBackgroundUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={customBackgroundUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-85"
          />
        ) : null}

        <Canvas
          className="!absolute inset-0 h-full w-full"
          frameloop="always"
          dpr={[1, 1.75]}
          shadows
          camera={{ fov: 38, near: 0.1, far: 100, position: [0, 0.4, 4.1] }}
          gl={{
            antialias: true,
            alpha: false,
            preserveDrawingBuffer: true,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl, scene }) => {
            const clear = new THREE.Color(bgColor);
            gl.setClearColor(clear, 1);
            scene.background = clear;
            gl.domElement.addEventListener("webglcontextlost", (e) => {
              e.preventDefault();
              setFailed(true);
            });
          }}
        >
          <Scene
            color={color}
            logoLabel={logoLabel}
            logoDataUrl={logoDataUrl}
            placement={placement}
            autoRotate={autoRotate}
            rotateSpeed={rotateSpeed}
            captureRef={captureRef}
            clearColor={bgColor}
          />
        </Canvas>

        {showHint ? (
          <p className="absolute bottom-5 left-0 right-0 z-[2] text-center text-[11px] tracking-wide text-black/40 pointer-events-none">
            Drag to orbit · scroll to zoom
          </p>
        ) : null}
      </div>
    );
  }
);
