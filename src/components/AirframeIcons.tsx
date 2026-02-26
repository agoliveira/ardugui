/**
 * AirframeIcons -- clean line-art copters + hybrid outlined planes.
 *
 * Design: utilitarian, professional. Thin strokes for copters (motor placement
 * is the key info), hybrid fill+outline for planes (shape/silhouette is the
 * key info but rendered lighter to match copter visual weight).
 * Motor disc size scales down for hex/octa so they never become a blotch.
 *
 * Colors:
 *   Frame selection: warm gray unselected (#a69a90), marigold selected (#ffaa2a)
 *   Other pages: warm light gray (#d5cdc6) for informational display
 */

import type { AirframePreset } from '@/models/airframeTemplates';

export const AIRFRAME_VIEWBOX = 100;  // all shapes drawn in 100x100
const V = AIRFRAME_VIEWBOX;

function col(selected: boolean) {
  return {
    fill: selected ? '#ffaa2a' : '#a69a90',
    dim:  selected ? '#b87a10' : '#7a736c',
    vtol: '#ffcc66',
  };
}

// ── Hybrid plane silhouettes (ghost fill + outline, top-down, nose up) ───
// Stroke + low-opacity fill matches the line-art copter aesthetic while
// preserving the shape recognition that solid silhouettes provide.
// EXPORTED so Motors, Calibration, and other pages use the EXACT SAME shapes.

/** Shared SVG props for the hybrid plane style. */
const HP = (fill: string) => ({
  fill, fillOpacity: 0.12, stroke: fill, strokeWidth: 1.5,
  strokeLinejoin: 'round' as const,
});

/** Shared motor circle for plane forward motors (solid line, not dashed). */
function PlaneMotor({ cx, cy, fill }: { cx: number; cy: number; fill: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="none" stroke={fill} strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={1.5} fill={fill} />
    </g>
  );
}

export function ConventionalPlane({ fill }: { fill: string }) {
  return (
    <path {...HP(fill)} d={`
      M50,8 C48,8 46,11 45,16 L44,34 L8,43 L8,47 L44,45 L43,64
      L32,72 L32,76 L50,71 L68,76 L68,72 L57,64 L56,45 L92,47 L92,43
      L56,34 L55,16 C54,11 52,8 50,8Z
    `} />
  );
}

export function FlyingWingPlane({ fill, twin = false }: { fill: string; twin?: boolean }) {
  return (
    <g>
      <path {...HP(fill)} d={`
        M50,22 C48,22 47,23 45,26 L42,34 L6,58 L10,64 L44,52 L44,56
        L56,56 L56,52 L90,64 L94,58 L58,34 L55,26 C53,23 52,22 50,22Z
      `} />
      {twin && (
        <>
          <PlaneMotor cx={34} cy={42} fill={fill} />
          <PlaneMotor cx={66} cy={42} fill={fill} />
        </>
      )}
    </g>
  );
}

export function VTailPlane({ fill }: { fill: string }) {
  return (
    <path {...HP(fill)} d={`
      M50,8 C48,8 46,11 45,16 L44,34 L8,43 L8,47 L44,45 L43,64
      L37,76 L40,77 L50,68 L60,77 L63,76 L57,64 L56,45 L92,47 L92,43
      L56,34 L55,16 C54,11 52,8 50,8Z
    `} />
  );
}

export function ATailPlane({ fill }: { fill: string }) {
  return (
    <path {...HP(fill)} d={`
      M50,8 C48,8 46,11 45,16 L44,34 L8,43 L8,47 L44,45 L43,64
      L37,68 L34,74 L39,73 L50,77 L61,73 L66,74 L63,68 L57,64
      L56,45 L92,47 L92,43 L56,34 L55,16 C54,11 52,8 50,8Z
    `} />
  );
}

export function TwinMotorPlane({ fill }: { fill: string }) {
  return (
    <g>
      <ConventionalPlane fill={fill} />
      {/* Engine nacelles -- outlined to match hybrid style */}
      <ellipse cx={28} cy={40} rx={3.5} ry={6}
        fill={fill} fillOpacity={0.12} stroke={fill} strokeWidth={1} />
      <ellipse cx={72} cy={40} rx={3.5} ry={6}
        fill={fill} fillOpacity={0.12} stroke={fill} strokeWidth={1} />
      {/* Prop discs -- same style as flying wing twin motors */}
      <PlaneMotor cx={28} cy={34} fill={fill} />
      <PlaneMotor cx={72} cy={34} fill={fill} />
    </g>
  );
}

export function CanardPlane({ fill }: { fill: string }) {
  return (
    <path {...HP(fill)} d={`
      M50,8 C48,8 46,11 45,16 L44,26 L30,22 L28,26 L44,29 L44,48
      L10,56 L10,60 L44,55 L43,72 L50,75 L57,72 L56,55 L90,60 L90,56
      L56,48 L56,29 L72,26 L70,22 L56,26 L55,16 C54,11 52,8 50,8Z
    `} />
  );
}

export function GliderPlane({ fill }: { fill: string }) {
  return (
    <path {...HP(fill)} d={`
      M50,12 C49,12 47,14 46,16 L45,38 L4,45 L4,49 L45,47 L44,66
      L47,67 L47,78 L44,79 L44,82 L50,79 L56,82 L56,79 L53,78 L53,67
      L56,66 L55,47 L96,49 L96,45 L55,38 L54,16 C53,14 51,12 50,12Z
    `} />
  );
}

// ── Line-art copter silhouettes ──────────────────────────────────────────

/** Canonical quad dimensions -- other pages use these to position overlays */
export const QUAD = { cx: 50, cy: 50, armLen: 32, motorR: 10, armW: 2 } as const;

/** Count unique motor positions (arms). Coaxial pairs share a position. */
function countArms(motors: { x: number; y: number }[]): number {
  const seen = new Set<string>();
  motors.forEach(m => seen.add(`${m.x.toFixed(3)},${m.y.toFixed(3)}`));
  return seen.size;
}

/** Motor disc radius scales by arm count so hex/octa stay clear.
 *  Coaxial frames (Y6, OctaQuad) scale by their arm count, not total motors. */
function motorScale(motors: { x: number; y: number }[]) {
  const arms = countArms(motors);
  if (arms <= 4) return { motorR: 10, armLen: 32 };
  if (arms <= 6) return { motorR: 8, armLen: 36 };
  return { motorR: 6, armLen: 38 };  // 8+
}

export function QuadCopter({ fill, motors, hFrame = false, ghost = false }: {
  fill: string;
  motors: { x: number; y: number; rotation: string }[];
  hFrame?: boolean;
  ghost?: boolean;
}) {
  const cx = 50, cy = 50;
  const { motorR, armLen } = motorScale(motors);
  const arms = countArms(motors);
  const armW = arms <= 4 ? 2 : 1.5;

  // Detect coaxial pairs: motors sharing the same x,y position.
  // The second motor in each group is the "bottom" one and gets offset
  // outward from center so it peeks out behind the top motor.
  const posKey = (m: { x: number; y: number }) => `${m.x.toFixed(3)},${m.y.toFixed(3)}`;
  const posGroups = new Map<string, number[]>();
  motors.forEach((m, i) => {
    const k = posKey(m);
    if (!posGroups.has(k)) posGroups.set(k, []);
    posGroups.get(k)!.push(i);
  });

  const coaxialOffset = motorR * 0.45;
  const mpos = motors.map((m, i) => {
    let mx = cx + m.x * armLen;
    let my = cy - m.y * armLen;

    const k = posKey(m);
    const group = posGroups.get(k)!;
    const isBottom = group.length >= 2 && i === group[1];
    if (isBottom) {
      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      mx += (dx / dist) * coaxialOffset;
      my += (dy / dist) * coaxialOffset;
    }

    return { mx, my, isBottom };
  });

  return (
    <g>
      {hFrame && arms === 4 ? (() => {
        // H-frame: two long booms running front-to-back + short horizontal crossbar.
        // Uses only top motors (non-bottom) for boom geometry.
        const topIdx = motors.map((_, i) => i).filter(i => !mpos[i].isBottom);
        const left = topIdx.filter(i => motors[i].x < 0);
        const right = topIdx.filter(i => motors[i].x > 0);
        const leftFront = left.reduce((a, b) => mpos[a].my < mpos[b].my ? a : b);
        const leftRear = left.reduce((a, b) => mpos[a].my > mpos[b].my ? a : b);
        const rightFront = right.reduce((a, b) => mpos[a].my < mpos[b].my ? a : b);
        const rightRear = right.reduce((a, b) => mpos[a].my > mpos[b].my ? a : b);
        const lf = mpos[leftFront], lr = mpos[leftRear];
        const rf = mpos[rightFront], rr = mpos[rightRear];
        const boomW = 4;
        const barW = 3.5;
        return (
          <>
            {/* Left boom -- front to back */}
            <line x1={lf.mx} y1={lf.my} x2={lr.mx} y2={lr.my}
              stroke={fill} strokeWidth={boomW} strokeLinecap="round" />
            {/* Right boom -- front to back */}
            <line x1={rf.mx} y1={rf.my} x2={rr.mx} y2={rr.my}
              stroke={fill} strokeWidth={boomW} strokeLinecap="round" />
            {/* Crossbar -- connects boom midpoints horizontally */}
            <line
              x1={(lf.mx + lr.mx) / 2} y1={(lf.my + lr.my) / 2}
              x2={(rf.mx + rr.mx) / 2} y2={(rf.my + rr.my) / 2}
              stroke={fill} strokeWidth={barW} strokeLinecap="round" />
            {/* Nose indicator */}
            <polygon points={`${cx},${Math.min(lf.my, rf.my) - 9} ${cx - 3},${Math.min(lf.my, rf.my) - 3} ${cx + 3},${Math.min(lf.my, rf.my) - 3}`} fill={fill} />
          </>
        );
      })() : (
        <>
          {/* Normal radial arms from center -- skip bottom coaxial motors */}
          {mpos.map((p, i) => !p.isBottom && (
            <line key={`arm-${i}`} x1={cx} y1={cy} x2={p.mx} y2={p.my}
              stroke={fill} strokeWidth={armW} strokeLinecap="round" />
          ))}
          {/* Body -- small, sharp */}
          <rect x={cx - 6} y={cy - 5} width={12} height={10} rx={2} fill={fill} />
          {/* Nose indicator */}
          <polygon points={`${cx},${cy - 11} ${cx - 3},${cy - 5} ${cx + 3},${cy - 5}`} fill={fill} />
        </>
      )}

      {/* Motors -- skip entirely in ghost mode (Motors page overlay draws its own) */}
      {!ghost && mpos.map((p, i) => (
        <g key={`motor-${i}`}>
          <circle cx={p.mx} cy={p.my} r={motorR} fill="none" stroke={fill}
            strokeWidth={p.isBottom ? 1 : 1.5}
            strokeDasharray={p.isBottom ? '3,2' : 'none'} />
          <circle cx={p.mx} cy={p.my} r={2} fill={fill} />
        </g>
      ))}
    </g>
  );
}

// ── VTOL overlay ─────────────────────────────────────────────────────────

function VtolOverlay({ motors, vtolColor }: {
  motors: { x: number; y: number }[];
  vtolColor: string;
}) {
  const { motorR, armLen } = motorScale(motors);
  return (
    <>
      {motors.map((m, i) => {
        const mx = 50 + m.x * (armLen - 2);
        const my = 50 - m.y * (armLen - 4);
        return (
          <g key={i}>
            <circle cx={mx} cy={my} r={motorR} fill="none" stroke={vtolColor}
              strokeWidth={1.5} strokeDasharray="4,2" />
            <circle cx={mx} cy={my} r={2} fill={vtolColor} />
          </g>
        );
      })}
    </>
  );
}

// ── Main export ──────────────────────────────────────────────────────────

export function AirframeIcon({ preset, size, selected, ghost = false }: {
  preset: AirframePreset; size: number; selected: boolean; ghost?: boolean;
}) {
  const c = col(selected);
  const hasVtol = preset.motorTemplate.vtolMotors.length > 0;
  const isPlane = preset.planeTemplate !== null;
  const isCopter = !isPlane;
  const diag = preset.planeTemplate?.diagramType;
  const isTwin = preset.motorTemplate.forwardMotors.length >= 2;
  const isGlider = preset.motorTemplate.forwardMotors.length === 0 && isPlane;
  const isTailsitter = preset.id.includes('tailsitter');

  return (
    <svg viewBox={`0 0 ${V} ${V}`} width={size} height={size}>

      {/* -- Planes */}
      {isPlane && !isTailsitter && diag === 'flying_wing' && <FlyingWingPlane fill={c.fill} twin={isTwin} />}
      {isPlane && !isTailsitter && diag === 'conventional' && !isGlider && !isTwin && <ConventionalPlane fill={c.fill} />}
      {isPlane && !isTailsitter && diag === 'conventional' && isGlider && <GliderPlane fill={c.fill} />}
      {isPlane && !isTailsitter && diag === 'conventional' && isTwin && <TwinMotorPlane fill={c.fill} />}
      {isPlane && !isTailsitter && diag === 'vtail' && <VTailPlane fill={c.fill} />}
      {isPlane && !isTailsitter && diag === 'atail' && <ATailPlane fill={c.fill} />}
      {isPlane && !isTailsitter && diag === 'canard' && <CanardPlane fill={c.fill} />}
      {isPlane && !isTailsitter && diag === 'twin_boom' && <TwinMotorPlane fill={c.fill} />}

      {isTailsitter && <FlyingWingPlane fill={c.fill} twin={true} />}

      {/* -- VTOL motors */}
      {isPlane && hasVtol && !isTailsitter && (
        <VtolOverlay
          motors={preset.motorTemplate.vtolMotors.map(m => ({ x: m.x, y: m.y }))}
          vtolColor={c.vtol}
        />
      )}

      {/* -- Copters */}
      {isCopter && (
        <QuadCopter
          fill={c.fill}
          hFrame={preset.icon === 'quad_h' || preset.icon === 'octaquad_h'}
          ghost={ghost}
          motors={preset.motorTemplate.vtolMotors.map(m => ({
            x: m.x, y: m.y, rotation: m.rotation,
          }))}
        />
      )}
    </svg>
  );
}
