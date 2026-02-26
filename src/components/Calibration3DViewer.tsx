/**
 * Calibration3DViewer -- Three.js-based 3D model viewer for accelerometer calibration.
 *
 * Exports:
 *   Calibration3DViewer  -- Animated single-position viewer (during calibration)
 *   CalibrationPositionGrid -- 6 static panels showing all positions (idle overview)
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Check } from 'lucide-react';
import type { AccelPosition } from '@/store/calibrationStore';
import { ACCEL_POSITIONS, ACCEL_POSITION_LABELS } from '@/store/calibrationStore';
import type { VehicleType } from '@/store/vehicleStore';

// ─── Shared orientation definitions ─────────────────────────────────────

type CameraView = 'side' | 'top';

interface OrientationDef {
  rx: number;
  rz: number;
  camera: CameraView;
}

// Model axes: Y=forward(nose), X=wingspan, Z=up
const ORIENTATIONS: Record<AccelPosition, OrientationDef> = {
  level:    { rx: 0,              rz: 0,             camera: 'side' },
  left:     { rx: 0,              rz: -Math.PI / 2,  camera: 'side' },
  right:    { rx: 0,              rz: Math.PI / 2,   camera: 'side' },
  nosedown: { rx: Math.PI / 2,    rz: 0,             camera: 'top' },
  noseup:   { rx: -Math.PI / 2,   rz: 0,             camera: 'top' },
  back:     { rx: 0,              rz: Math.PI,        camera: 'side' },
};

const MODEL_PATHS: Record<string, string> = {
  plane:     '/models/airplane.glb',
  quadplane: '/models/airplane.glb',
  copter:    '/models/quadcopter.glb',
};

const LERP_SPEED = 0.06;

// ─── Shared helpers ─────────────────────────────────────────────────────

function getCameraPos(type: CameraView, maxDim: number): THREE.Vector3 {
  if (type === 'top') {
    return new THREE.Vector3(maxDim * 0.3, maxDim * 0.15, maxDim * 2);
  }
  return new THREE.Vector3(maxDim * 2, maxDim * 0.15, maxDim * 0.3);
}

function setupLighting(scene: THREE.Scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const d1 = new THREE.DirectionalLight(0xffffff, 1.2);
  d1.position.set(200, 500, 600);
  scene.add(d1);
  const d2 = new THREE.DirectionalLight(0x88bbff, 0.6);
  d2.position.set(-300, 200, -400);
  scene.add(d2);
  const d3 = new THREE.DirectionalLight(0x4488cc, 0.3);
  d3.position.set(0, -300, 0);
  scene.add(d3);
}

// ─── Per-model configuration ────────────────────────────────────────────

interface ModelConfig {
  /** Initial rotation to align nose with +Y (applied before calibration rotations) */
  initialRotationY: number;
  /** Camera frustum multiplier (smaller = bigger model on screen) */
  frustum: number;
}

const MODEL_CONFIG: Record<string, ModelConfig> = {
  plane: {
    initialRotationY: 0,
    frustum: 0.72,
  },
  copter: {
    initialRotationY: Math.PI,   // flip 180° -- model nose faces -Y
    frustum: 0.58,               // tighter framing = bigger on screen
  },
};

function getModelConfig(vehicleType: string): ModelConfig {
  if (vehicleType === 'copter') return MODEL_CONFIG.copter;
  return MODEL_CONFIG.plane;
}

// ─── Model colorization ─────────────────────────────────────────────────

function colorizeModel(model: THREE.Object3D, vehicleType: string) {
  model.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    if (!mat.color) return;

    if (vehicleType === 'copter') {
      colorizeCopter(mat);
      // Shrink translucent prop discs from their center (not local origin)
      if (mat.opacity < 0.9) {
        const geo = mesh.geometry;
        // Guard: only scale once (check userData flag)
        if (!geo.userData?.propScaled) {
          const s = 0.78;
          geo.computeBoundingBox();
          if (geo.boundingBox) {
            const cx = (geo.boundingBox.min.x + geo.boundingBox.max.x) / 2;
            const cy = (geo.boundingBox.min.y + geo.boundingBox.max.y) / 2;
            const pos = geo.attributes.position;
            for (let i = 0; i < pos.count; i++) {
              pos.setX(i, cx + (pos.getX(i) - cx) * s);
              pos.setY(i, cy + (pos.getY(i) - cy) * s);
            }
            pos.needsUpdate = true;
            geo.userData = { propScaled: true };
          }
        }
      }
    } else {
      // Plane: just brighten
      mat.color.multiplyScalar(1.3);
    }
    if (mat.metalness !== undefined) mat.metalness = 0.15;
    if (mat.roughness !== undefined) mat.roughness = 0.45;
  });
}

function colorizeCopter(mat: THREE.MeshStandardMaterial) {
  const r = mat.color.r, g = mat.color.g, b = mat.color.b;

  // Black frame parts [15,15,15] → dark charcoal with slight blue tint
  if (r < 0.1 && g < 0.1 && b < 0.1) {
    mat.color.setRGB(0.12, 0.14, 0.18);
    return;
  }
  // Blue body [40,88,187] → vibrant blue
  if (b > 0.5 && r < 0.3) {
    mat.color.setRGB(0.15, 0.40, 0.85);
    mat.metalness = 0.2;
    return;
  }
  // Silver motor posts [203,207,209] → brighter silver
  if (r > 0.7 && g > 0.7 && b > 0.7) {
    mat.color.setRGB(0.85, 0.88, 0.92);
    mat.metalness = 0.4;
    mat.roughness = 0.3;
    return;
  }
  // Marigold forward marker [255,170,42] solid → accent color
  if (r > 0.8 && g > 0.5 && b < 0.1 && mat.opacity > 0.9) {
    mat.color.setRGB(1.0, 0.67, 0.16);
    mat.emissive = new THREE.Color(0.3, 0.2, 0.0);
    return;
  }
  // Translucent props -- colors baked into GLB, just ensure transparency + shrink
  if (mat.opacity < 0.9) {
    mat.transparent = true;
    return;
  }
  // Dark grey body panels [56,58,64] → slightly brighter
  if (r > 0.15 && r < 0.35 && g > 0.15 && g < 0.35) {
    mat.color.setRGB(0.22, 0.24, 0.28);
    return;
  }
}

function addGround(scene: THREE.Scene, maxDim: number) {
  // Use maxDim to ensure ground is below model in any rotation
  const groundY = -maxDim * 0.52;
  const groundGeo = new THREE.PlaneGeometry(maxDim * 3, maxDim * 3);
  const groundMat = new THREE.MeshPhongMaterial({
    color: 0x2a1a08,
    side: THREE.DoubleSide,
    shininess: 30,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = groundY;
  scene.add(ground);

  const gridHelper = new THREE.GridHelper(maxDim * 2, 24, 0x6b4c1a, 0x3d2a0d);
  gridHelper.position.y = groundY + 0.5;
  scene.add(gridHelper);
}

/**
 * Creates a floating direction arrow attached to the model.
 * Points along the model's native nose direction so it rotates correctly
 * with both initialRotationY and calibration rotations.
 *
 * noseAxis: which local axis is the nose ('y' for plane, 'z' for copter)
 */
/**
 * Creates a flat chevron ">" indicator floating just in front of and above the quad.
 * Compact and visible from any angle.
 */
function addDirectionChevron(model: THREE.Group, maxDim: number, noseAxis: 'y' | 'z' = 'z') {
  const chevronGroup = new THREE.Group();

  // Chevron dimensions relative to model
  const wingLen = maxDim * 0.12;   // each arm of the V
  const depth = maxDim * 0.02;     // thin flat shape
  const halfAngle = 0.45;          // ~25° spread

  // Build chevron from two box "wings" angled to form ">"
  const wingGeo = new THREE.BoxGeometry(maxDim * 0.025, wingLen, depth);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.4,
    metalness: 0.2,
    roughness: 0.5,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });

  // Right wing of chevron (angled up-right)
  const wingR = new THREE.Mesh(wingGeo, mat);
  wingR.rotation.z = halfAngle;
  wingR.position.y = (wingLen / 2) * Math.cos(halfAngle);
  wingR.position.x = (wingLen / 2) * Math.sin(halfAngle);
  chevronGroup.add(wingR);

  // Left wing of chevron (angled down-right) -- mirror
  const wingL = new THREE.Mesh(wingGeo, mat.clone());
  wingL.rotation.z = -halfAngle;
  wingL.position.y = -(wingLen / 2) * Math.cos(halfAngle);
  wingL.position.x = (wingLen / 2) * Math.sin(halfAngle);
  chevronGroup.add(wingL);

  // Rotate chevron so it points along +Y (nose direction in build space)
  // The ">" shape opens to +X, we need it to point +Y
  chevronGroup.rotation.z = Math.PI / 2;

  // Position: just past the front edge of the quad body, floating above
  if (noseAxis === 'z') {
    // Copter: nose is +Z in model space, up is +Y
    const wrapper = new THREE.Group();
    wrapper.rotation.x = -Math.PI / 2;  // rotate chevron from +Y to +Z
    wrapper.position.set(0, maxDim * 0.15, maxDim * 0.35);
    wrapper.add(chevronGroup);
    model.add(wrapper);
  } else {
    // Plane: nose is +Y, up is +Z
    chevronGroup.position.set(0, maxDim * 0.35, maxDim * 0.15);
    model.add(chevronGroup);
  }
}

// ─── GLB model cache ────────────────────────────────────────────────────
// Prevents multiple loads of the same model across components.

const modelCache = new Map<string, Promise<THREE.Group>>();

function loadModel(path: string): Promise<THREE.Group> {
  const existing = modelCache.get(path);
  if (existing) return existing.then((g) => g.clone(true));

  const promise = new Promise<THREE.Group>((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(path, (gltf) => resolve(gltf.scene), undefined, reject);
  });
  modelCache.set(path, promise);
  return promise.then((g) => g.clone(true));
}


// ═══════════════════════════════════════════════════════════════════════════
//  Calibration3DViewer -- Animated single-position viewer
// ═══════════════════════════════════════════════════════════════════════════

interface Calibration3DViewerProps {
  position: AccelPosition;
  vehicleType: VehicleType;
  className?: string;
}

export function Calibration3DViewer({ position, vehicleType, className }: Calibration3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    camera: THREE.OrthographicCamera;
    wrapper: THREE.Group;
    scene: THREE.Scene;
    maxDim: number;
    frustum: number;
    animId: number;
    targetRotation: { x: number; z: number };
    currentRotation: { x: number; z: number };
    targetCamPos: THREE.Vector3;
    currentCamPos: THREE.Vector3;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const modelPath = vehicleType ? MODEL_PATHS[vehicleType] : undefined;
    if (!modelPath) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x13120f);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    setupLighting(scene);

    const wrapper = new THREE.Group();
    scene.add(wrapper);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10000);

    const orient = ORIENTATIONS[position];
    const state = {
      renderer, scene, camera, wrapper,
      maxDim: 1,
      frustum: 0.72,
      animId: 0,
      targetRotation: { x: orient.rx, z: orient.rz },
      currentRotation: { x: orient.rx, z: orient.rz },
      targetCamPos: new THREE.Vector3(2, 0.15, 0.3),
      currentCamPos: new THREE.Vector3(2, 0.15, 0.3),
    };
    sceneRef.current = state;

    loadModel(modelPath).then((model) => {
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      model.position.sub(center);
      const vType = vehicleType || 'plane';
      const config = getModelConfig(vType);
      colorizeModel(model, vType);

      // Apply initial rotation to align nose with +Y
      if (config.initialRotationY !== 0) {
        model.rotation.y = config.initialRotationY;
      }
      wrapper.add(model);

      const maxDim = Math.max(size.x, size.y, size.z);
      state.maxDim = maxDim;
      state.frustum = config.frustum;

      // Add direction arrow for copter (hard to tell orientation otherwise)
      if (vType === 'copter') addDirectionChevron(model, maxDim, 'z');

      addGround(scene, maxDim);

      const aspect = width / height;
      const frust = maxDim * config.frustum;
      camera.left = -frust * aspect;
      camera.right = frust * aspect;
      camera.top = frust;
      camera.bottom = -frust;
      camera.near = 0.1;
      camera.far = maxDim * 10;
      camera.updateProjectionMatrix();

      const camPos = getCameraPos(ORIENTATIONS[position].camera, maxDim);
      state.targetCamPos.copy(camPos);
      state.currentCamPos.copy(camPos);
      camera.position.copy(camPos);
      camera.lookAt(0, 0, 0);

      function animate() {
        state.animId = requestAnimationFrame(animate);
        state.currentRotation.x += (state.targetRotation.x - state.currentRotation.x) * LERP_SPEED;
        state.currentRotation.z += (state.targetRotation.z - state.currentRotation.z) * LERP_SPEED;
        wrapper.rotation.x = state.currentRotation.x;
        wrapper.rotation.z = state.currentRotation.z;
        state.currentCamPos.lerp(state.targetCamPos, LERP_SPEED);
        camera.position.copy(state.currentCamPos);
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
      }
      animate();
    }).catch((err) => {
      console.error('[Calibration3DViewer] Failed to load model:', err);
    });

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          renderer.setSize(w, h);
          const aspect = w / h;
          const frust = state.maxDim * state.frustum;
          camera.left = -frust * aspect;
          camera.right = frust * aspect;
          camera.top = frust;
          camera.bottom = -frust;
          camera.updateProjectionMatrix();
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(state.animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sceneRef.current = null;
    };
  }, [vehicleType]);

  useEffect(() => {
    const state = sceneRef.current;
    if (!state) return;
    const orient = ORIENTATIONS[position];
    state.targetRotation.x = orient.rx;
    state.targetRotation.z = orient.rz;
    state.targetCamPos = getCameraPos(orient.camera, state.maxDim);
  }, [position]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '350px', borderRadius: '8px', overflow: 'hidden' }}
    />
  );
}


// ═══════════════════════════════════════════════════════════════════════════
//  CalibrationPositionGrid -- 6 static panels showing all positions
// ═══════════════════════════════════════════════════════════════════════════

interface CalibrationPositionGridProps {
  vehicleType: VehicleType;
  completedPositions: Set<AccelPosition>;
  currentPosition: AccelPosition | null;
  isActive: boolean;
  allCalibrated?: boolean;
}

export function CalibrationPositionGrid({
  vehicleType,
  completedPositions,
  currentPosition,
  isActive,
  allCalibrated = false,
}: CalibrationPositionGridProps) {
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const modelPath = vehicleType ? MODEL_PATHS[vehicleType] : undefined;
    if (!modelPath) return;

    let cancelled = false;

    // Render all 6 views using a single offscreen renderer
    loadModel(modelPath).then((model) => {
      if (cancelled) return;

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      model.position.sub(center);
      const vType = vehicleType || 'plane';
      const config = getModelConfig(vType);
      colorizeModel(model, vType);

      if (config.initialRotationY !== 0) {
        model.rotation.y = config.initialRotationY;
      }

      const maxDim = Math.max(size.x, size.y, size.z);
      const W = 320;
      const H = 200;

      // Create offscreen renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(1); // Keep it light
      renderer.setClearColor(0x13120f);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.4;

      const scene = new THREE.Scene();
      setupLighting(scene);
      addGround(scene, maxDim);

      const wrapper = new THREE.Group();
      wrapper.add(model);
      if (vType === 'copter') addDirectionChevron(model, maxDim, 'z');
      scene.add(wrapper);

      const aspect = W / H;
      const frust = maxDim * config.frustum;
      const camera = new THREE.OrthographicCamera(
        -frust * aspect, frust * aspect, frust, -frust, 0.1, maxDim * 10,
      );

      const result: Record<string, string> = {};

      for (const pos of ACCEL_POSITIONS) {
        const orient = ORIENTATIONS[pos];
        wrapper.rotation.set(orient.rx, 0, orient.rz);

        const camPos = getCameraPos(orient.camera, maxDim);
        camera.position.copy(camPos);
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
        result[pos] = renderer.domElement.toDataURL('image/png');
      }

      renderer.dispose();

      if (!cancelled) setImages(result);
    }).catch((err) => {
      console.error('[CalibrationPositionGrid] Failed:', err);
    });

    return () => { cancelled = true; };
  }, [vehicleType]);

  return (
    <div className="grid grid-cols-6 gap-2">
      {ACCEL_POSITIONS.map((pos) => {
        const isCompleted = allCalibrated || completedPositions.has(pos);
        const isCurrent = isActive && currentPosition === pos;
        const img = images[pos];

        return (
          <div
            key={pos}
            className={`relative rounded overflow-hidden border-2 transition-all ${
              isCurrent
                ? 'border-accent ring-2 ring-accent/30'
                : isCompleted
                  ? 'border-green-500/60'
                  : 'border-border'
            }`}
          >
            {/* Label -- top-left overlay */}
            <div className={`absolute top-0 left-0 z-10 px-2 py-0.5 text-[11px] font-bold rounded-br-lg ${
              isCurrent
                ? 'bg-accent/80 text-background'
                : isCompleted
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-surface-1/80 text-subtle'
            }`}>
              {isCompleted && <Check size={10} className="inline mr-1 -mt-0.5" />}
              {ACCEL_POSITION_LABELS[pos]}
            </div>

            {/* Image */}
            <div className={`aspect-[16/10] bg-[#13120f] ${!isCompleted && !isCurrent ? 'opacity-40' : ''}`}>
              {img && (
                <img
                  src={img}
                  alt={ACCEL_POSITION_LABELS[pos]}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
//  useModelImage -- render a static view of the 3D model from any angle
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Returns a data-URL PNG of the model rendered from a top-down camera.
 * Useful for the motor/servo page backgrounds.
 */
export function useModelImage(
  vehicleType: VehicleType,
  view: 'top' | 'side' = 'top',
  width = 400,
  height = 400,
  rotationZ = 0,
): string | null {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const modelPath = vehicleType ? MODEL_PATHS[vehicleType] : undefined;
    if (!modelPath) return;

    let cancelled = false;

    loadModel(modelPath).then((model) => {
      if (cancelled) return;

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      model.position.sub(center);
      const vType = vehicleType || 'plane';
      const config = getModelConfig(vType);
      colorizeModel(model, vType);

      // Apply initial rotation + optional extra rotation
      if (config.initialRotationY !== 0 || rotationZ !== 0) {
        const wrapper = new THREE.Group();
        wrapper.add(model);
        if (config.initialRotationY !== 0) model.rotation.y = config.initialRotationY;
        if (rotationZ !== 0) wrapper.rotation.z = rotationZ;
        model = wrapper as unknown as THREE.Group;
      }

      const maxDim = Math.max(size.x, size.y, size.z);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(1);
      renderer.setClearColor(0x000000, 0); // transparent background
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.4;

      const scene = new THREE.Scene();
      setupLighting(scene);
      scene.add(model);

      const aspect = width / height;
      const isCopter = vType === 'copter';
      const frust = maxDim * (isCopter ? 0.48 : 0.55);
      const camera = new THREE.OrthographicCamera(
        -frust * aspect, frust * aspect, frust, -frust, 0.1, maxDim * 10,
      );

      if (view === 'top') {
        if (isCopter) {
          // Copter: look from +Y down. After 180° Y rotation, nose at -Z.
          // up=(0,0,-1) so nose=up on screen.
          camera.position.set(0, maxDim * 2, 0);
          camera.up.set(0, 0, -1);
        } else {
          // Plane: vertical axis is Z. Look from +Z down.
          // Nose is +Y → use up=(0,1,0) so nose=up on screen
          camera.position.set(0, 0, maxDim * 2);
          camera.up.set(0, 1, 0);
        }
      } else {
        // Side: looking from +X
        camera.position.set(maxDim * 2, maxDim * 0.15, 0);
      }
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      const dataUrl = renderer.domElement.toDataURL('image/png');
      renderer.dispose();

      if (!cancelled) setImage(dataUrl);
    }).catch((err) => {
      console.error('[useModelImage]', err);
    });

    return () => { cancelled = true; };
  }, [vehicleType, view, width, height, rotationZ]);

  return image;
}
