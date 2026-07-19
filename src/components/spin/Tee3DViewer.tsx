"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import type { LogoPlacement } from "@/lib/products";

export type Tee3DViewerHandle = {
  exportPng: () => string | null;
  export3d?: () => void;
  exportVideo?: (onProgress: (p: number) => void, onComplete: () => void) => void;
};

function getPlacementCode(placement: string): number {
  if (placement === "chest-left") return 0;
  if (placement === "back") return 2;
  return 1; // chest-center
}

type Tee3DViewerProps = {
  color: string;
  sleevesColor?: string;
  collarColor?: string;
  logoLabel?: string;
  logoDataUrl?: string;
  placement?: LogoPlacement;
  background?: string;
  customBackgroundUrl?: string;
  autoRotate?: boolean;
  rotateSpeed?: number;
  className?: string;
  showHint?: boolean;
  // Advanced shader props
  acidWash?: number;
  puffPrint?: number;
  designScale?: number;
  designX?: number;
  designY?: number;
  motion?: "static" | "walk" | "waves" | "knit";
  motionSpeed?: number;
  cameraAnim?: "none" | "rotate" | "orbit-zoom";
  renderQuality?: "fast" | "high";
  // Logo customization props
  logoColor?: string;
  dyeLogo?: boolean;
  // Interaction & Drag Placement Props
  interactMode?: "orbit" | "drag-logo";
  onDesignPositionChange?: (x: number, y: number) => void;
};

export const Tee3DViewer = forwardRef<Tee3DViewerHandle, Tee3DViewerProps>(
  function Tee3DViewer(
    {
      color,
      sleevesColor = color,
      collarColor = color,
      logoLabel = "brand",
      logoDataUrl,
      placement = "chest-center",
      background = "#f4f4f2",
      customBackgroundUrl,
      autoRotate = true,
      rotateSpeed = 0.9,
      className = "",
      showHint = true,
      acidWash = 0,
      puffPrint = 0,
      designScale = 1,
      designX = 0,
      designY = 0,
      motion = "static",
      motionSpeed = 0.5,
      cameraAnim = "none",
      renderQuality = "fast",
      logoColor = "#ffffff",
      dyeLogo = false,
      interactMode = "orbit",
      onDesignPositionChange,
    },
    ref
  ) {
    const [mounted, setMounted] = useState(false);
    const [failed, setFailed] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Three.js instances refs
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const tshirtGroupRef = useRef<THREE.Group | null>(null);
    const tshirtMeshesRef = useRef<THREE.Mesh[]>([]);
    const mixerRef = useRef<THREE.AnimationMixer | null>(null);
    const clockRef = useRef<THREE.Clock | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);

    // Textures refs
    const defaultOutsideAORef = useRef<THREE.Texture | null>(null);
    const defaultInsideAORef = useRef<THREE.Texture | null>(null);
    const normalFabricRef = useRef<THREE.Texture | null>(null);
    const normalDetailsRef = useRef<THREE.Texture | null>(null);
    const acidWashTextureRef = useRef<THREE.Texture | null>(null);
    const activeDesignTextureRef = useRef<THREE.Texture | null>(null);
    const textPresetTextureRef = useRef<THREE.Texture | null>(null);

    // Active state container ref to allow access inside render loop
    const stateRef = useRef({
      color,
      sleevesColor: color,
      collarColor: color,
      background,
      acidWash,
      puffPrint,
      designScale,
      designX,
      designY,
      motion,
      motionSpeed,
      cameraAnim,
      renderQuality,
      autoRotate,
      rotateSpeed,
      logoColor,
      dyeLogo,
      placement,
      interactMode,
    });

    // Update mutable state ref when props change
    useEffect(() => {
      stateRef.current = {
        color,
        sleevesColor: color,
        collarColor: color,
        background,
        acidWash,
        puffPrint,
        designScale,
        designX,
        designY,
        motion,
        motionSpeed,
        cameraAnim,
        renderQuality,
        autoRotate,
        rotateSpeed,
        logoColor,
        dyeLogo,
        placement,
        interactMode,
      };

      updateGarmentColors();
      updateUniform("uAcidWashIntensity", acidWash);
      updateUniform("uPuffPrintHeight", puffPrint);
      updateUniform("uDesignScale", designScale);
      updateUniform("uDesignX", designX);
      updateUniform("uDesignY", designY);
      updateUniform("uLogoColor", new THREE.Color(logoColor));
      updateUniform("uDyeLogo", dyeLogo);
      updateUniform("uPlacement", getPlacementCode(placement));

      if (controlsRef.current) {
        controlsRef.current.enabled = interactMode === "orbit";
        controlsRef.current.autoRotate = (autoRotate || cameraAnim !== "none") && interactMode === "orbit";
        controlsRef.current.autoRotateSpeed =
          cameraAnim === "rotate"
            ? motionSpeed * 4.0
            : cameraAnim === "orbit-zoom"
            ? motionSpeed * 3.0
            : rotateSpeed * 2.0;
      }

      if (rendererRef.current) {
        const dprRatio = renderQuality === "high" ? 2.5 : 1.5;
        rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, dprRatio));
      }
    }, [
      color,
      background,
      acidWash,
      puffPrint,
      designScale,
      designX,
      designY,
      motion,
      motionSpeed,
      cameraAnim,
      renderQuality,
      autoRotate,
      rotateSpeed,
      logoColor,
      dyeLogo,
      placement,
    ]);

    // Handle design texture upload changes
    useEffect(() => {
      if (!mounted || !sceneRef.current) return;

      const textureLoader = new THREE.TextureLoader();

      const applyDesignTexture = (texture: THREE.Texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        activeDesignTextureRef.current = texture;

        updateUniform("uDesignTex", texture);
        updateUniform("uDesignEnabled", true);
      };

      if (logoDataUrl) {
        textureLoader.load(
          logoDataUrl,
          (texture) => {
            applyDesignTexture(texture);
          },
          undefined,
          (err) => console.error("Error loading design texture", err)
        );
      } else {
        // Draw Text Logo onto CanvasTexture
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, 512, 512);

          // Choose text color based on garment brightness
          const c = new THREE.Color(color);
          const isDark = c.r * 0.299 + c.g * 0.587 + c.b * 0.114 < 0.45;
          ctx.fillStyle = isDark ? "#ffffff" : "#111111";

          ctx.font = "bold 90px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText((logoLabel || "brand").slice(0, 12), 256, 256);

          const textTexture = new THREE.CanvasTexture(canvas);
          textTexture.colorSpace = THREE.SRGBColorSpace;
          applyDesignTexture(textTexture);
        }
      }
    }, [logoDataUrl, logoLabel, color, mounted]);

    // Set client mounted state
    useEffect(() => {
      setMounted(true);
      return () => {
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }
      };
    }, []);

    // Initialize WebGL engine once mounted
    useEffect(() => {
      if (!mounted) return;

      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      // 1. Init Engine
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        100
      );
      camera.position.set(0, 0.3, 16.5);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      rendererRef.current = renderer;

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 6;
      controls.maxDistance = 25;
      controls.maxPolarAngle = Math.PI / 1.8;
      controls.target.set(0, 0, 0);
      controlsRef.current = controls;

      // 2. Lighting Setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 0.85);
      mainLight.position.set(5, 8, 5);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 2048;
      mainLight.shadow.mapSize.height = 2048;
      mainLight.shadow.bias = -0.0001;
      scene.add(mainLight);

      const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
      fillLight.position.set(-5, 3, -5);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0xffffff, 0.65);
      rimLight.position.set(0, 5, -8);
      scene.add(rimLight);

      // 3. Loaders & Textures
      const textureLoader = new THREE.TextureLoader();
      const gltfLoader = new GLTFLoader();

      // Load texture sheets
      defaultOutsideAORef.current = textureLoader.load("/textures/ao_tshirt_outside.jpg");
      defaultInsideAORef.current = textureLoader.load("/textures/ao_tshirt_inside.jpg");
      normalFabricRef.current = textureLoader.load("/textures/NormalFabric.png");
      normalDetailsRef.current = textureLoader.load("/textures/normaldetailsv2.jpg");
      acidWashTextureRef.current = textureLoader.load("/textures/acidwash.jpg");

      const textures = [
        defaultOutsideAORef.current,
        defaultInsideAORef.current,
        normalFabricRef.current,
        normalDetailsRef.current,
        acidWashTextureRef.current,
      ];

      textures.forEach((tex) => {
        if (tex) {
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          tex.flipY = false;
        }
      });

      if (normalFabricRef.current) {
        normalFabricRef.current.repeat.set(120, 120);
      }

      // Load Studio Environment
      new RGBELoader().load("/textures/studio_env.hdr", (hdrTex) => {
        hdrTex.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = hdrTex;
      });

      // 4. Load GLTF Model
      gltfLoader.load(
        "/model/tshirt-sizingtest.gltf",
        (gltf) => {
          const tshirtGroup = gltf.scene;
          tshirtGroupRef.current = tshirtGroup;

          // Reset pivots
          tshirtGroup.traverse((child) => {
            if (child.name.toLowerCase().includes("pivot")) {
              child.scale.set(1, 1, 1);
            }
          });

          // Compute size and center
          const box = new THREE.Box3();
          let hasMesh = false;
          tshirtGroup.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const name = child.name.toLowerCase();
              if (
                name.includes("env") ||
                name.includes("bg") ||
                name.includes("camera") ||
                name.includes("sphere")
              ) {
                child.visible = false;
              } else {
                box.expandByObject(child);
                hasMesh = true;
              }
            }
          });

          if (!hasMesh) {
            box.setFromObject(tshirtGroup);
          }

          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scaleVal = 1.6 / (maxDim > 0 ? maxDim : 1);

          tshirtGroup.scale.setScalar(scaleVal);
          tshirtGroup.position.set(
            -center.x * scaleVal,
            -center.y * scaleVal - 0.2,
            -center.z * scaleVal
          );

          scene.add(tshirtGroup);

          // Configure meshes and materials
          tshirtMeshesRef.current = [];
          tshirtGroup.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const name = child.name.toLowerCase();
              if (
                name.includes("env") ||
                name.includes("bg") ||
                name.includes("camera") ||
                name.includes("sphere")
              ) {
                child.visible = false;
                return;
              }

              if (child.geometry && child.geometry.attributes.uv && !child.geometry.attributes.uv2) {
                child.geometry.setAttribute("uv2", child.geometry.attributes.uv);
              }

              child.castShadow = true;
              child.receiveShadow = true;
              tshirtMeshesRef.current.push(child);

              setupMeshMaterial(child);
            }
          });

          if (gltf.animations && gltf.animations.length > 0) {
            mixerRef.current = new THREE.AnimationMixer(tshirtGroup);
          }
        },
        undefined,
        (err) => {
          console.error("Error loading GLTF model:", err);
          setFailed(true);
        }
      );

      // 5. Setup Resize Handler
      const handleResize = () => {
        if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;

        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();

        rendererRef.current.setSize(w, h);
      };
      window.addEventListener("resize", handleResize);

      // 5b. Setup Pointer Interaction handlers for direct drag placement
      const canvasEl = canvasRef.current;
      const isDraggingRef = { current: false };

      const updatePositionFromEvent = (e: PointerEvent) => {
        if (!containerRef.current || !cameraRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

        const intersects = raycaster.intersectObjects(tshirtMeshesRef.current, true);
        if (intersects.length > 0) {
          const hit = intersects[0];
          if (hit.uv) {
            const uv = hit.uv;
            const currentPlacement = stateRef.current.placement;

            let bodyXMin = 0.02;
            let bodyXMax = 0.48;
            let bodyYMin = 0.30;
            let bodyYMax = 0.82;
            let defaultCx = 0.50;
            let defaultCy = 0.70;

            if (currentPlacement === "chest-left") {
              bodyXMin = 0.04;
              bodyXMax = 0.28;
              bodyYMin = 0.45;
              bodyYMax = 0.78;
              defaultCx = 0.50;
              defaultCy = 0.50;
            } else if (currentPlacement === "back") {
              bodyXMin = 0.52;
              bodyXMax = 0.98;
              bodyYMin = 0.30;
              bodyYMax = 0.82;
              defaultCx = 0.50;
              defaultCy = 0.65;
            }

            const clampedUvX = Math.max(bodyXMin, Math.min(bodyXMax, uv.x));
            const clampedUvY = Math.max(bodyYMin, Math.min(bodyYMax, uv.y));

            const bodyUvX = (clampedUvX - bodyXMin) / (bodyXMax - bodyXMin);
            const bodyUvY = (clampedUvY - bodyYMin) / (bodyYMax - bodyYMin);

            const finalBodyUvX = currentPlacement === "back" ? 1.0 - bodyUvX : bodyUvX;

            const dx = finalBodyUvX - defaultCx;
            const dy = bodyUvY - defaultCy;

            const finalDx = Math.max(-0.5, Math.min(0.5, dx));
            const finalDy = Math.max(-0.5, Math.min(0.5, dy));

            onDesignPositionChange?.(finalDx, finalDy);
          }
        }
      };

      const handlePointerDown = (e: PointerEvent) => {
        if (stateRef.current.interactMode !== "drag-logo") return;
        isDraggingRef.current = true;
        canvasEl?.setPointerCapture(e.pointerId);
        updatePositionFromEvent(e);
      };

      const handlePointerMove = (e: PointerEvent) => {
        if (!isDraggingRef.current) return;
        updatePositionFromEvent(e);
      };

      const handlePointerUp = (e: PointerEvent) => {
        isDraggingRef.current = false;
        try {
          canvasEl?.releasePointerCapture(e.pointerId);
        } catch {}
      };

      if (canvasEl) {
        canvasEl.addEventListener("pointerdown", handlePointerDown);
        canvasEl.addEventListener("pointermove", handlePointerMove);
        canvasEl.addEventListener("pointerup", handlePointerUp);
        canvasEl.addEventListener("pointercancel", handlePointerUp);
      }

      // 6. Animation Render Loop
      const clock = new THREE.Clock();
      clockRef.current = clock;

      const render = () => {
        animationFrameIdRef.current = requestAnimationFrame(render);

        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        if (tshirtGroupRef.current) {
          const group = tshirtGroupRef.current;
          const meshes = tshirtMeshesRef.current;
          
          group.position.y = -0.45;
          group.rotation.set(0, Math.PI, 0);
          meshes.forEach((m) => {
            m.position.set(0, 0, 0);
          });
        }

        controlsRef.current?.update();
        rendererRef.current?.render(scene, camera);
      };
      render();

      return () => {
        window.removeEventListener("resize", handleResize);
        if (canvasEl) {
          canvasEl.removeEventListener("pointerdown", handlePointerDown);
          canvasEl.removeEventListener("pointermove", handlePointerMove);
          canvasEl.removeEventListener("pointerup", handlePointerUp);
          canvasEl.removeEventListener("pointercancel", handlePointerUp);
        }
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }

        // Dispose textures
        [
          defaultOutsideAORef.current,
          defaultInsideAORef.current,
          normalFabricRef.current,
          normalDetailsRef.current,
          acidWashTextureRef.current,
          activeDesignTextureRef.current,
          textPresetTextureRef.current,
        ].forEach((tex) => tex?.dispose());

        // Dispose geometries & materials
        tshirtMeshesRef.current.forEach((mesh) => {
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        });

        renderer.dispose();
      };
    }, [mounted]);

    // Setup material shader injection
    const setupMeshMaterial = (mesh: THREE.Mesh) => {
      const name = mesh.name.toLowerCase();
      const isOutside =
        name.includes("outside") ||
        name.includes("body") ||
        name.includes("sleeve") ||
        name.includes("collar");

      const aoMap = isOutside ? defaultOutsideAORef.current : defaultInsideAORef.current;

      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#ffffff"),
        roughness: 0.85,
        metalness: 0.0,
        map: aoMap,
        normalMap: normalFabricRef.current,
        normalScale: new THREE.Vector2(0.08, 0.08),
        side: THREE.DoubleSide,
        depthWrite: isOutside ? false : true,
        transparent: isOutside ? true : false,
        alphaTest: 0,
      });

      material.onBeforeCompile = (shader) => {
        shader.uniforms.uGarmentColor = { value: new THREE.Color(stateRef.current.color) };
        shader.uniforms.uSleevesColor = { value: new THREE.Color(stateRef.current.color) };
        shader.uniforms.uCollarColor = { value: new THREE.Color(stateRef.current.color) };
        shader.uniforms.uOutsideAoTex = { value: defaultOutsideAORef.current };
        shader.uniforms.uInsideAoTex = { value: defaultInsideAORef.current };
        shader.uniforms.uAcidWashTex = { value: acidWashTextureRef.current };
        shader.uniforms.uAcidWashIntensity = { value: stateRef.current.acidWash };
        shader.uniforms.uDesignTex = {
          value: activeDesignTextureRef.current || defaultOutsideAORef.current,
        };
        shader.uniforms.uDesignEnabled = { value: true };
        shader.uniforms.uDesignScale = { value: stateRef.current.designScale };
        shader.uniforms.uDesignX = { value: stateRef.current.designX };
        shader.uniforms.uDesignY = { value: stateRef.current.designY };
        shader.uniforms.uLogoColor = { value: new THREE.Color(stateRef.current.logoColor) };
        shader.uniforms.uDyeLogo = { value: stateRef.current.dyeLogo };
        shader.uniforms.uPlacement = { value: getPlacementCode(stateRef.current.placement) };

        shader.fragmentShader =
          `
          uniform vec3 uGarmentColor;
          uniform vec3 uSleevesColor;
          uniform vec3 uCollarColor;
          uniform sampler2D uOutsideAoTex;
          uniform sampler2D uInsideAoTex;
          uniform sampler2D uAcidWashTex;
          uniform float uAcidWashIntensity;
          uniform sampler2D uDesignTex;
          uniform bool uDesignEnabled;
          uniform float uDesignScale;
          uniform float uDesignX;
          uniform float uDesignY;
          uniform vec3 uLogoColor;
          uniform bool uDyeLogo;
          uniform int uPlacement;
          \n` + shader.fragmentShader;

        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <map_fragment>",
          `
          vec3 baseColor = uGarmentColor;
          if (vMapUv.y > 0.82) {
            baseColor = uSleevesColor;
          } else if (vMapUv.y < 0.30) {
            baseColor = uCollarColor;
          }

          diffuseColor.rgb = baseColor;

          vec4 aoTexColor = gl_FrontFacing
            ? texture2D(uOutsideAoTex, vMapUv)
            : texture2D(uInsideAoTex, vMapUv);
          diffuseColor.rgb *= mix(vec3(1.0), aoTexColor.rgb, 0.6);

          vec4 washColor = texture2D(uAcidWashTex, vMapUv * 2.0);
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * washColor.rgb * 1.5, uAcidWashIntensity);

          if (uDesignEnabled && gl_FrontFacing) {
            float bodyXMin = 0.02;
            float bodyXMax = 0.48;
            float bodyYMin = 0.30;
            float bodyYMax = 0.82;

            if (uPlacement == 0) {
              bodyXMin = 0.04;
              bodyXMax = 0.28;
              bodyYMin = 0.45;
              bodyYMax = 0.78;
            } else if (uPlacement == 2) {
              bodyXMin = 0.52;
              bodyXMax = 0.98;
              bodyYMin = 0.30;
              bodyYMax = 0.82;
            }

            if (vMapUv.x >= bodyXMin && vMapUv.x <= bodyXMax &&
                vMapUv.y >= bodyYMin && vMapUv.y <= bodyYMax) {

              vec2 bodyUv = vec2(
                (vMapUv.x - bodyXMin) / (bodyXMax - bodyXMin),
                (vMapUv.y - bodyYMin) / (bodyYMax - bodyYMin)
              );

              float baseSize = 0.40;
              float w = baseSize * uDesignScale;
              float h = baseSize * uDesignScale;

              float cx = 0.50 + uDesignX;
              float cy = 0.70 + uDesignY;

              if (uPlacement == 0) {
                cx = 0.50 + uDesignX;
                cy = 0.50 + uDesignY;
              } else if (uPlacement == 2) {
                cx = 0.50 + uDesignX;
                cy = 0.65 + uDesignY;
              }

              float uMin = cx - w * 0.5;
              float uMax = cx + w * 0.5;
              float vMin = cy - h * 0.5;
              float vMax = cy + h * 0.5;

              if (bodyUv.x >= uMin && bodyUv.x <= uMax &&
                  bodyUv.y >= vMin && bodyUv.y <= vMax) {
                vec2 projectedUv = vec2(
                  (bodyUv.x - uMin) / w,
                  (bodyUv.y - vMin) / h
                );
                if (uPlacement == 2) {
                  projectedUv.x = 1.0 - projectedUv.x;
                }
                vec4 designColor = texture2D(uDesignTex, projectedUv);
                vec3 finalDesignRgb = designColor.rgb;
                if (uDyeLogo) {
                  finalDesignRgb = uLogoColor * designColor.a;
                }
                float designAlpha = designColor.a;
                diffuseColor.rgb = mix(diffuseColor.rgb, finalDesignRgb, designAlpha);
                diffuseColor.a = max(diffuseColor.a, designAlpha);
              }
            }
          }
          `
        );

        shader.vertexShader =
          `
          uniform float uPuffPrintHeight;
          \n` + shader.vertexShader;

        material.userData.shader = shader;
      };

      mesh.material = material;
    };

    const updateGarmentColors = () => {
      tshirtMeshesRef.current.forEach((mesh) => {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        const shader = mat?.userData?.shader;
        if (shader) {
          shader.uniforms.uGarmentColor?.value.set(stateRef.current.color);
          shader.uniforms.uSleevesColor?.value.set(stateRef.current.sleevesColor);
          shader.uniforms.uCollarColor?.value.set(stateRef.current.collarColor);
        }
      });
    };

    const updateUniform = (name: string, value: unknown) => {
      tshirtMeshesRef.current.forEach((mesh) => {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        const shader = mat?.userData?.shader;
        if (shader && shader.uniforms[name]) {
          shader.uniforms[name].value = value;
        }
      });
    };

    // Imperative Exporter Handles
    useImperativeHandle(ref, () => ({
      exportPng: () => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return null;
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        return rendererRef.current.domElement.toDataURL("image/png");
      },
      export3d: () => {
        if (!tshirtGroupRef.current) return;
        const exporter = new GLTFExporter();
        exporter.parse(
          tshirtGroupRef.current,
          (gltf) => {
            const blob = new Blob([gltf as ArrayBuffer], { type: "application/octet-stream" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `custom-tshirt-${Date.now()}.glb`;
            link.click();
          },
          (error) => {
            console.error("An error occurred during GLTF export:", error);
          },
          { binary: true }
        );
      },
      exportVideo: (onProgress: (p: number) => void, onComplete: () => void) => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

        const renderer = rendererRef.current;
        const savedCameraAnim = stateRef.current.cameraAnim;

        // Force camera rotation during recording
        stateRef.current.cameraAnim = "rotate";
        if (controlsRef.current) {
          controlsRef.current.autoRotate = true;
          controlsRef.current.autoRotateSpeed = stateRef.current.motionSpeed * 4.0;
        }

        const stream = renderer.domElement.captureStream(30);
        let recorderOptions = { mimeType: "video/webm;codecs=vp9" };

        if (!MediaRecorder.isTypeSupported(recorderOptions.mimeType)) {
          recorderOptions = { mimeType: "video/webm" };
        }

        const recordedChunks: Blob[] = [];
        const recorder = new MediaRecorder(stream, recorderOptions);

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) recordedChunks.push(event.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: "video/webm" });
          const videoUrl = URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = videoUrl;
          link.download = `tshirt-animation-${Date.now()}.webm`;
          link.click();

          // Restore settings
          stateRef.current.cameraAnim = savedCameraAnim;
          if (controlsRef.current) {
            controlsRef.current.autoRotate = stateRef.current.autoRotate || savedCameraAnim !== "none";
            controlsRef.current.autoRotateSpeed = stateRef.current.rotateSpeed * 2.0;
          }
          onComplete();
        };

        const recordDuration = 5000;
        const startTime = Date.now();

        recorder.start();

        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const percentage = Math.min(100, Math.floor((elapsed / recordDuration) * 100));
          onProgress(percentage);

          if (elapsed >= recordDuration) {
            clearInterval(progressInterval);
            recorder.stop();
          }
        }, 100);
      },
    }));

    return (
      <div
        ref={containerRef}
        className={`relative h-full w-full min-h-[420px] overflow-hidden ${className}`}
        style={{
          background: customBackgroundUrl
            ? "#121212"
            : background?.startsWith("radial")
            ? background
            : background,
        }}
      >
        {customBackgroundUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={customBackgroundUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-85 pointer-events-none"
          />
        ) : null}

        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full block" />

        {showHint ? (
          <p className="absolute bottom-5 left-0 right-0 z-[2] text-center text-[11px] tracking-wide text-black/40 pointer-events-none">
            Drag to orbit · scroll to zoom
          </p>
        ) : null}
      </div>
    );
  }
);
Tee3DViewer.displayName = "Tee3DViewer";
