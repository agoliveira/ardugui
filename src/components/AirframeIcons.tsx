/**
 * AirframeIcons -- SOLID filled aircraft silhouettes for the frame wizard.
 *
 * Design philosophy: chunky, unmistakable shapes. Single filled paths,
 * NOT wireframes. Think airport signage -- instantly recognizable at any size.
 */

import type { AirframePreset } from '@/models/airframeTemplates';

export const AIRFRAME_VIEWBOX = 100;  // all shapes drawn in 100×100
const V = AIRFRAME_VIEWBOX;

function col(selected: boolean) {
  return {
    fill: selected ? '#f59e0b' : '#94a3b8',
    dim:  selected ? '#b45309' : '#64748b',
    vtol: '#fbbf24',
  };
}

// ── Solid plane silhouettes (single path, top-down, nose up) ─────────────
// EXPORTED so Motors, Calibration, and other pages use the EXACT SAME shapes.

export function ConventionalPlane({ fill }: { fill: string }) {
  return (
    <path fill={fill} d={`
      M50,6 C47,6 44,10 43,16 L42,32 L4,42 L4,48 L42,44 L41,62
      L28,72 L28,78 L50,72 L72,78 L72,72 L59,62 L58,44 L96,48 L96,42
      L58,32 L57,16 C56,10 53,6 50,6Z
    `} />
  );
}

export function FlyingWingPlane({ fill, twin = false }: { fill: string; twin?: boolean }) {
  return (
    <g>
      <path fill={fill} d={`
        M50,18 C48,18 46,20 44,24 L40,34 L2,62 L8,70 L44,54 L44,58
        L56,58 L56,54 L92,70 L98,62 L60,34 L56,24 C54,20 52,18 50,18Z
      `} />
      {twin && (
        <>
          <circle cx={34} cy={44} r={6} fill={fill} opacity={0.5} />
          <circle cx={34} cy={44} r={2.5} fill={fill} />
          <circle cx={66} cy={44} r={6} fill={fill} opacity={0.5} />
          <circle cx={66} cy={44} r={2.5} fill={fill} />
        </>
      )}
    </g>
  );
}

export function VTailPlane({ fill }: { fill: string }) {
  return (
    <path fill={fill} d={`
      M50,6 C47,6 44,10 43,16 L42,32 L4,42 L4,48 L42,44 L41,62
      L34,76 L38,78 L50,68 L62,78 L66,76 L59,62 L58,44 L96,48 L96,42
      L58,32 L57,16 C56,10 53,6 50,6Z
    `} />
  );
}

export function ATailPlane({ fill }: { fill: string }) {
  return (
    <path fill={fill} d={`
      M50,6 C47,6 44,10 43,16 L42,32 L4,42 L4,48 L42,44 L41,62
      L34,68 L30,76 L36,74 L50,78 L64,74 L70,76 L66,68 L59,62
      L58,44 L96,48 L96,42 L58,32 L57,16 C56,10 53,6 50,6Z
    `} />
  );
}

export function TwinMotorPlane({ fill }: { fill: string }) {
  return (
    <g>
      <ConventionalPlane fill={fill} />
      {/* Engine nacelles on wings */}
      <ellipse cx={26} cy={40} rx={5} ry={8} fill={fill} />
      <ellipse cx={74} cy={40} rx={5} ry={8} fill={fill} />
      <circle cx={26} cy={32} r={4} fill={fill} opacity={0.5} />
      <circle cx={74} cy={32} r={4} fill={fill} opacity={0.5} />
    </g>
  );
}

export function CanardPlane({ fill }: { fill: string }) {
  return (
    <path fill={fill} d={`
      M50,6 C47,6 44,10 43,16 L42,24 L26,20 L24,26 L42,28 L42,46
      L6,56 L6,62 L42,56 L41,72 L50,76 L59,72 L58,56 L94,62 L94,56
      L58,46 L58,28 L76,26 L74,20 L58,24 L57,16 C56,10 53,6 50,6Z
    `} />
  );
}

export function GliderPlane({ fill }: { fill: string }) {
  return (
    <path fill={fill} d={`
      M50,10 C48,10 46,12 45,16 L44,36 L2,44 L2,50 L44,46 L43,64
      L46,66 L46,78 L42,80 L42,84 L50,80 L58,84 L58,80 L54,78 L54,66
      L57,64 L56,46 L98,50 L98,44 L56,36 L55,16 C54,12 52,10 50,10Z
    `} />
  );
}

// ── Solid copter silhouettes ─────────────────────────────────────────────

/** Canonical quad dimensions -- other pages use these to position overlays */
export const QUAD = { cx: 50, cy: 50, armLen: 30, motorR: 14, armW: 4 } as const;

export function QuadCopter({ fill, motors }: { fill: string; motors: { x: number; y: number; rotation: string }[] }) {
  const { cx, cy, armLen, motorR, armW } = QUAD;

  return (
    <g>
      {/* Arms -- thick filled rectangles */}
      {motors.map((m, i) => {
        const mx = cx + m.x * armLen;
        const my = cy - m.y * armLen;
        return (
          <line key={`arm-${i}`} x1={cx} y1={cy} x2={mx} y2={my}
            stroke={fill} strokeWidth={armW * 2} strokeLinecap="round" />
        );
      })}

      {/* Body -- chunky rounded rect */}
      <rect x={cx - 10} y={cy - 8} width={20} height={16} rx={5} fill={fill} />

      {/* Nose arrow */}
      <polygon points={`${cx},${cy - 16} ${cx - 5},${cy - 8} ${cx + 5},${cy - 8}`} fill={fill} />

      {/* Motors -- thick ring + hub */}
      {motors.map((m, i) => {
        const mx = cx + m.x * armLen;
        const my = cy - m.y * armLen;
        return (
          <g key={`motor-${i}`}>
            <circle cx={mx} cy={my} r={motorR} fill="none" stroke={fill} strokeWidth={4} />
            <circle cx={mx} cy={my} r={4} fill={fill} />
          </g>
        );
      })}
    </g>
  );
}

// ── VTOL overlay ─────────────────────────────────────────────────────────

function VtolOverlay({ motors, vtolColor }: {
  motors: { x: number; y: number }[];
  vtolColor: string;
}) {
  return (
    <>
      {motors.map((m, i) => {
        const mx = 50 + m.x * 28;
        const my = 50 - m.y * 26;
        return (
          <g key={i}>
            <circle cx={mx} cy={my} r={10} fill="none" stroke={vtolColor}
              strokeWidth={2.5} strokeDasharray="5,3" />
            <circle cx={mx} cy={my} r={3} fill={vtolColor} />
          </g>
        );
      })}
    </>
  );
}

// ── Main export ──────────────────────────────────────────────────────────

export function AirframeIcon({ preset, size, selected }: {
  preset: AirframePreset; size: number; selected: boolean;
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

      {/* ── Planes ─────────────────────────────────────────────── */}
      {isPlane && !isTailsitter && diag === 'flying_wing' && <FlyingWingPlane fill={c.fill} twin={isTwin} />}
      {isPlane && !isTailsitter && diag === 'conventional' && !isGlider && !isTwin && <ConventionalPlane fill={c.fill} />}
      {isPlane && !isTailsitter && diag === 'conventional' && isGlider && <GliderPlane fill={c.fill} />}
      {isPlane && !isTailsitter && diag === 'conventional' && isTwin && <TwinMotorPlane fill={c.fill} />}
      {isPlane && !isTailsitter && diag === 'vtail' && <VTailPlane fill={c.fill} />}
      {isPlane && !isTailsitter && diag === 'atail' && <ATailPlane fill={c.fill} />}
      {isPlane && !isTailsitter && diag === 'canard' && <CanardPlane fill={c.fill} />}
      {isPlane && !isTailsitter && diag === 'twin_boom' && <TwinMotorPlane fill={c.fill} />}

      {isTailsitter && <FlyingWingPlane fill={c.fill} twin={true} />}

      {/* ── VTOL motors ────────────────────────────────────────── */}
      {isPlane && hasVtol && !isTailsitter && (
        <VtolOverlay
          motors={preset.motorTemplate.vtolMotors.map(m => ({ x: m.x, y: m.y }))}
          vtolColor={c.vtol}
        />
      )}

      {/* ── Copters ────────────────────────────────────────────── */}
      {isCopter && (
        <QuadCopter
          fill={c.fill}
          motors={preset.motorTemplate.vtolMotors.map(m => ({
            x: m.x, y: m.y, rotation: m.rotation,
          }))}
        />
      )}
    </svg>
  );
}
