/**
 * ControlSurface3DViewer.tsx -- 3D visualization of aircraft control surfaces.
 *
 * Renders Three.js scenes showing aircraft segments with animated control
 * surfaces on visible hinge rods. Supports:
 *   - Normal wings (aileron + optional flap per side)
 *   - Flying wing (elevon per side)
 *   - Conventional tail (elevator + rudder on shared structure)
 *   - V-tail and A-tail (tilted arms with elevons)
 *
 * Deflection values are in degrees. Positive = trailing edge up/right.
 * Colors: green = up/right, red = down/left, amber = neutral.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Theme colors                                                       */
/* ------------------------------------------------------------------ */

const COL = {
  bg: 0x13120f,
  structure: 0x2a2825,
  fuselage: 0x1a1816,
  hinge: 0x666666,
  accent: 0xffaa2a,
  success: 0x22c55e,
  danger: 0xef4444,
  inactive: 0x3a3632,
};

function surfaceColor(deg: number): number {
  if (Math.abs(deg) < 1) return COL.accent;
  return deg > 0 ? COL.success : COL.danger;
}

/* ------------------------------------------------------------------ */
/*  Wings (normal + flying wing)                                       */
/* ------------------------------------------------------------------ */

export interface WingParams {
  leftAilDeg: number;
  rightAilDeg: number;
  leftFlapDeg?: number;
  rightFlapDeg?: number;
  hasFlap?: boolean;
  mode?: 'normal' | 'elevon';
}

function buildWings(scene: THREE.Scene, p: WingParams) {
  const group = new THREE.Group();
  const mode = p.mode ?? 'normal';
  const hasFlap = p.hasFlap ?? true;

  const matFixed = new THREE.MeshPhongMaterial({ color: COL.structure, flatShading: true });
  const matHinge = new THREE.MeshPhongMaterial({ color: COL.hinge });
  const matFuse = new THREE.MeshPhongMaterial({ color: COL.fuselage });

  const span = mode === 'elevon' ? 2.6 : 3.2;
  const thickness = 0.07;
  const hingeFrac = 0.70;
  const rootChord = mode === 'elevon' ? 1.1 : 1.3;
  const avgChord = rootChord * hingeFrac;
  const surfChord = 0.25;
  const sweepAngle = mode === 'elevon' ? -0.15 : -0.06;

  function buildSide(sideSign: number, ailDeg: number, flapDeg: number) {
    const ailRad = (ailDeg * Math.PI) / 180;
    const flapRad = (flapDeg * Math.PI) / 180;
    const matAil = new THREE.MeshPhongMaterial({ color: surfaceColor(ailDeg), flatShading: true, side: THREE.DoubleSide });
    const matFlap = new THREE.MeshPhongMaterial({ color: surfaceColor(flapDeg), flatShading: true, side: THREE.DoubleSide });

    const side = new THREE.Group();

    // Fixed wing
    const fixed = new THREE.Mesh(new THREE.BoxGeometry(span, thickness, avgChord), matFixed);
    fixed.position.set(sideSign * span / 2, 0, avgChord / 2);
    side.add(fixed);

    if (mode === 'elevon') {
      const ei = span * 0.18, eo = span * 0.95;
      const emid = (ei + eo) / 2;

      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, (eo - ei) * 1.06, 8), matHinge);
      rod.rotation.z = Math.PI / 2;
      rod.position.set(sideSign * emid, 0, avgChord);
      side.add(rod);

      const pivot = new THREE.Group();
      pivot.position.set(sideSign * emid, 0, avgChord);
      const surf = new THREE.Mesh(new THREE.BoxGeometry((eo - ei) * 0.98, thickness * 0.7, surfChord), matAil);
      surf.position.set(0, 0, surfChord / 2);
      pivot.add(surf);
      pivot.rotation.x = ailRad;
      side.add(pivot);
    } else {
      // Aileron (outer 55%-95%)
      const ai = span * 0.55, ao = span * 0.95;
      const amid = (ai + ao) / 2;

      const aRod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, (ao - ai) * 1.06, 8), matHinge);
      aRod.rotation.z = Math.PI / 2;
      aRod.position.set(sideSign * amid, 0, avgChord);
      side.add(aRod);

      const aPivot = new THREE.Group();
      aPivot.position.set(sideSign * amid, 0, avgChord);
      const aSurf = new THREE.Mesh(new THREE.BoxGeometry((ao - ai) * 0.98, thickness * 0.7, surfChord), matAil);
      aSurf.position.set(0, 0, surfChord / 2);
      aPivot.add(aSurf);
      aPivot.rotation.x = ailRad;
      side.add(aPivot);

      // Flap (inner 8%-50%)
      if (hasFlap) {
        const fi = span * 0.08, fo = span * 0.50;
        const fmid = (fi + fo) / 2;

        const fRod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, (fo - fi) * 1.06, 8), matHinge);
        fRod.rotation.z = Math.PI / 2;
        fRod.position.set(sideSign * fmid, 0, avgChord);
        side.add(fRod);

        const fPivot = new THREE.Group();
        fPivot.position.set(sideSign * fmid, 0, avgChord);
        const fSurf = new THREE.Mesh(new THREE.BoxGeometry((fo - fi) * 0.98, thickness * 0.7, surfChord), matFlap);
        fSurf.position.set(0, 0, surfChord / 2);
        fPivot.add(fSurf);
        fPivot.rotation.x = flapRad;
        side.add(fPivot);
      }
    }

    side.rotation.y = sideSign * sweepAngle;
    return side;
  }

  group.add(buildSide(-1, p.leftAilDeg, p.leftFlapDeg ?? 0));
  group.add(buildSide(1, p.rightAilDeg, p.rightFlapDeg ?? 0));

  if (mode === 'elevon') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, rootChord * 1.0), matFuse);
    body.position.set(0, 0, rootChord * 0.4);
    group.add(body);
  } else {
    const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 1.8, 12), matFuse);
    fuse.rotation.x = Math.PI / 2;
    fuse.position.set(0, 0, avgChord * 0.5);
    group.add(fuse);
  }

  scene.add(group);
}

/* ------------------------------------------------------------------ */
/*  Conventional tail (elevator + rudder)                              */
/* ------------------------------------------------------------------ */

export interface TailParams {
  elevDeg: number;
  rudDeg: number;
  highlight?: 'elevator' | 'rudder' | 'both';
}

function buildTail(scene: THREE.Scene, p: TailParams) {
  const group = new THREE.Group();
  const highlight = p.highlight ?? 'both';

  const matFixed = new THREE.MeshPhongMaterial({ color: COL.structure, flatShading: true });
  const matHinge = new THREE.MeshPhongMaterial({ color: COL.hinge });
  const matFuse = new THREE.MeshPhongMaterial({ color: COL.fuselage });
  const matInactive = new THREE.MeshPhongMaterial({ color: COL.inactive, flatShading: true, side: THREE.DoubleSide });

  const elevActive = highlight === 'elevator' || highlight === 'both';
  const rudActive = highlight === 'rudder' || highlight === 'both';

  const matElev = elevActive
    ? new THREE.MeshPhongMaterial({ color: surfaceColor(p.elevDeg), flatShading: true, side: THREE.DoubleSide })
    : matInactive;
  const matRud = rudActive
    ? new THREE.MeshPhongMaterial({ color: surfaceColor(p.rudDeg), flatShading: true, side: THREE.DoubleSide })
    : matInactive;

  const elevRad = (p.elevDeg * Math.PI) / 180;
  const rudRad = (p.rudDeg * Math.PI) / 180;

  // Fuselage
  const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.32, 2.5, 12), matFuse);
  fuse.rotation.x = Math.PI / 2;
  fuse.position.set(0, -0.05, -0.6);
  group.add(fuse);

  // Horizontal stabilizer
  const stabSpan = 3.0, stabChord = 0.75, stabThick = 0.05, stabHinge = 0.55;
  const fixedChord = stabChord * stabHinge;
  const elevChord = stabChord * (1 - stabHinge);

  const hStab = new THREE.Mesh(new THREE.BoxGeometry(stabSpan, stabThick, fixedChord), matFixed);
  hStab.position.set(0, 0, fixedChord / 2);
  group.add(hStab);

  // Elevator hinge rod
  const eRod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, stabSpan * 1.03, 8), matHinge);
  eRod.rotation.z = Math.PI / 2;
  eRod.position.set(0, 0, fixedChord);
  group.add(eRod);

  // Left elevator
  const lePivot = new THREE.Group();
  lePivot.position.set(-stabSpan * 0.25, 0, fixedChord);
  const leSurf = new THREE.Mesh(new THREE.BoxGeometry(stabSpan * 0.47, stabThick * 0.8, elevChord), matElev);
  leSurf.position.set(0, 0, elevChord / 2);
  lePivot.add(leSurf);
  lePivot.rotation.x = elevActive ? elevRad : 0;
  group.add(lePivot);

  // Right elevator
  const rePivot = new THREE.Group();
  rePivot.position.set(stabSpan * 0.25, 0, fixedChord);
  const reSurf = new THREE.Mesh(new THREE.BoxGeometry(stabSpan * 0.47, stabThick * 0.8, elevChord), matElev);
  reSurf.position.set(0, 0, elevChord / 2);
  rePivot.add(reSurf);
  rePivot.rotation.x = elevActive ? elevRad : 0;
  group.add(rePivot);

  // Vertical fin
  const finHeight = 1.4, finChord = 0.8, finThick = 0.06, finHinge = 0.55;
  const finFixed = finChord * finHinge;
  const rudChord = finChord * (1 - finHinge);

  const finMesh = new THREE.Mesh(new THREE.BoxGeometry(finThick, finHeight, finFixed), matFixed);
  finMesh.position.set(0, finHeight / 2 + stabThick / 2, finFixed / 2);
  group.add(finMesh);

  // Rudder hinge rod
  const rRod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, finHeight * 1.03, 8), matHinge);
  rRod.position.set(0, finHeight / 2 + stabThick / 2, finFixed);
  group.add(rRod);

  // Rudder
  const rudPivot = new THREE.Group();
  rudPivot.position.set(0, stabThick / 2, finFixed);
  const rudSurf = new THREE.Mesh(new THREE.BoxGeometry(finThick * 0.8, finHeight * 0.97, rudChord), matRud);
  rudSurf.position.set(0, finHeight / 2, rudChord / 2);
  rudPivot.add(rudSurf);
  rudPivot.rotation.y = rudActive ? rudRad : 0;
  group.add(rudPivot);

  scene.add(group);
}

/* ------------------------------------------------------------------ */
/*  V-Tail / A-Tail                                                    */
/* ------------------------------------------------------------------ */

export interface TiltTailParams {
  leftDeg: number;
  rightDeg: number;
  tiltSign: 1 | -1;  // +1 = V-tail, -1 = A-tail
}

function buildTiltTail(scene: THREE.Scene, p: TiltTailParams) {
  const group = new THREE.Group();

  const matFixed = new THREE.MeshPhongMaterial({ color: COL.structure, flatShading: true });
  const matHinge = new THREE.MeshPhongMaterial({ color: COL.hinge });
  const matFuse = new THREE.MeshPhongMaterial({ color: COL.fuselage });

  const vAngle = 35;
  const armSpan = 1.3, fixedChord = 0.45, elevChord = 0.3, thick = 0.05;

  function buildArm(sideSign: number, deg: number) {
    const mat = new THREE.MeshPhongMaterial({
      color: surfaceColor(deg), flatShading: true, side: THREE.DoubleSide,
    });
    const elevRad = (deg * Math.PI) / 180;
    const vRad = (vAngle * Math.PI) / 180;

    const tilt = new THREE.Group();

    const fixed = new THREE.Mesh(new THREE.BoxGeometry(armSpan, thick, fixedChord), matFixed);
    fixed.position.set(sideSign * armSpan / 2, 0, fixedChord / 2);
    tilt.add(fixed);

    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, armSpan * 1.06, 8), matHinge);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(sideSign * armSpan / 2, 0, fixedChord);
    tilt.add(rod);

    const pivot = new THREE.Group();
    pivot.position.set(sideSign * armSpan / 2, 0, fixedChord);
    const surf = new THREE.Mesh(new THREE.BoxGeometry(armSpan * 0.96, thick * 0.8, elevChord), mat);
    surf.position.set(0, 0, elevChord / 2);
    pivot.add(surf);
    pivot.rotation.x = elevRad;
    tilt.add(pivot);

    tilt.rotation.z = sideSign * p.tiltSign * vRad;
    return tilt;
  }

  group.add(buildArm(-1, p.leftDeg));
  group.add(buildArm(1, p.rightDeg));

  const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.32, 2.2, 12), matFuse);
  fuse.rotation.x = Math.PI / 2;
  fuse.position.set(0, -0.15, -0.6);
  group.add(fuse);

  scene.add(group);
}

/* ------------------------------------------------------------------ */
/*  View type                                                          */
/* ------------------------------------------------------------------ */

export type SurfaceViewType = 'wings' | 'flyingwing' | 'elevator' | 'rudder' | 'vtail' | 'atail';

export interface SurfaceViewDef {
  type: SurfaceViewType;
  label: string;
  instruction: string;
  expected: string;
  cam: [number, number, number];
  look: [number, number, number];
}

export const VIEW_DEFS: Record<SurfaceViewType, SurfaceViewDef> = {
  wings: {
    type: 'wings', label: 'Wings',
    instruction: 'Move roll stick RIGHT',
    expected: 'Left aileron DOWN, right aileron UP',
    cam: [0, 5, 6], look: [0, 0, 0.4],
  },
  flyingwing: {
    type: 'flyingwing', label: 'Flying Wing',
    instruction: 'Move roll RIGHT, then pull pitch BACK',
    expected: 'Elevons mix roll and pitch inputs',
    cam: [0, 5, 6], look: [0, 0, 0.4],
  },
  elevator: {
    type: 'elevator', label: 'Elevator',
    instruction: 'Pull pitch stick BACK',
    expected: 'Elevator trailing edges go UP (green)',
    cam: [4, 2.5, 4], look: [0, 0.3, 0.3],
  },
  rudder: {
    type: 'rudder', label: 'Rudder',
    instruction: 'Move yaw stick RIGHT',
    expected: 'Rudder trailing edge swings RIGHT (green)',
    cam: [3, 3, 3], look: [0, 0.5, 0.3],
  },
  vtail: {
    type: 'vtail', label: 'V-Tail',
    instruction: 'Pull pitch BACK, then try yaw RIGHT',
    expected: 'Both surfaces deflect for combined pitch + yaw',
    cam: [3.5, 2.5, 4], look: [0, 0.4, 0],
  },
  atail: {
    type: 'atail', label: 'A-Tail',
    instruction: 'Pull pitch BACK, then try yaw RIGHT',
    expected: 'Both surfaces deflect for combined pitch + yaw',
    cam: [3.5, 2.5, 4], look: [0, -0.2, 0],
  },
};

/* ------------------------------------------------------------------ */
/*  Deflection params per view                                         */
/* ------------------------------------------------------------------ */

export interface DeflectionParams {
  leftAilDeg?: number;
  rightAilDeg?: number;
  leftFlapDeg?: number;
  rightFlapDeg?: number;
  elevDeg?: number;
  rudDeg?: number;
  leftTiltDeg?: number;
  rightTiltDeg?: number;
}

/* ------------------------------------------------------------------ */
/*  Renderer component                                                 */
/* ------------------------------------------------------------------ */

interface Props {
  viewType: SurfaceViewType;
  deflections: DeflectionParams;
  hasFlap?: boolean;
  width?: number;
  height?: number;
}

export function ControlSurface3DViewer({
  viewType,
  deflections,
  hasFlap = false,
  width = 740,
  height = 340,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(COL.bg);

    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const d1 = new THREE.DirectionalLight(0xfff5e0, 0.85);
    d1.position.set(4, 6, 5);
    scene.add(d1);
    const d2 = new THREE.DirectionalLight(0xb0c0ff, 0.25);
    d2.position.set(-3, 4, -2);
    scene.add(d2);

    const viewDef = VIEW_DEFS[viewType];
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    camera.position.set(...viewDef.cam);
    camera.lookAt(new THREE.Vector3(...viewDef.look));

    // Build geometry based on view type
    const d = deflections;
    switch (viewType) {
      case 'wings':
        buildWings(scene, {
          leftAilDeg: d.leftAilDeg ?? 0,
          rightAilDeg: d.rightAilDeg ?? 0,
          leftFlapDeg: d.leftFlapDeg ?? 0,
          rightFlapDeg: d.rightFlapDeg ?? 0,
          hasFlap,
          mode: 'normal',
        });
        break;
      case 'flyingwing':
        buildWings(scene, {
          leftAilDeg: d.leftAilDeg ?? 0,
          rightAilDeg: d.rightAilDeg ?? 0,
          hasFlap: false,
          mode: 'elevon',
        });
        break;
      case 'elevator':
        buildTail(scene, { elevDeg: d.elevDeg ?? 0, rudDeg: d.rudDeg ?? 0, highlight: 'elevator' });
        break;
      case 'rudder':
        buildTail(scene, { elevDeg: d.elevDeg ?? 0, rudDeg: d.rudDeg ?? 0, highlight: 'rudder' });
        break;
      case 'vtail':
        buildTiltTail(scene, { leftDeg: d.leftTiltDeg ?? 0, rightDeg: d.rightTiltDeg ?? 0, tiltSign: 1 });
        break;
      case 'atail':
        buildTiltTail(scene, { leftDeg: d.leftTiltDeg ?? 0, rightDeg: d.rightTiltDeg ?? 0, tiltSign: -1 });
        break;
    }

    renderer.render(scene, camera);

    return () => {
      renderer.dispose();
      scene.traverse((c: THREE.Object3D) => {
        if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
        const mat = (c as THREE.Mesh).material;
        if (mat && typeof (mat as THREE.Material).dispose === 'function') (mat as THREE.Material).dispose();
      });
    };
  }, [viewType, deflections, hasFlap, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height, display: 'block' }}
      width={width}
      height={height}
    />
  );
}
