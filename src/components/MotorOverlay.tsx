/**
 * MotorOverlay.tsx -- Complete copter motor diagram component.
 *
 * CopterMotorDiagram: the ONLY motor diagram in the app. Used by both
 * the standalone Motors page and the wizard MotorEscStep. One component,
 * one viewBox, one set of proportions.
 *
 * Design:
 *   - Faint ring (1px stroke, low opacity)
 *   - Very faint prop disc
 *   - Bold curved arrow OUTSIDE the ring on the outward-facing side
 *   - Colored number disc (CW=pink, CCW=blue)
 *   - CW/CCW label below
 *   - Coaxial pairs offset outward so both are visible
 */

import type { AirframePreset } from '@/models/airframeTemplates';
import type { FrameLayout } from '@/models/frameDefinitions';
import { AirframeIcon, AIRFRAME_VIEWBOX, QUAD } from '@/components/AirframeIcons';

/** Color palette */
const C = {
  ccw: '#38bdf8',
  cw: '#fb7185',
  nose: '#4ade80',
  neutral: '#cbd5e1',
  bg: '#13120f',
  bgStroke: '#2a2622',
  testing: '#ffcc66',
  confirmed: '#22c55e',
};

/** Motor scale by arm count (coaxial pairs share an arm). */
function motorScale(motors: { x: number; y: number }[]) {
  const seen = new Set<string>();
  motors.forEach(m => seen.add(`${m.x.toFixed(3)},${m.y.toFixed(3)}`));
  const arms = seen.size;
  if (arms <= 4) return { motorR: 10, armLen: 32 };
  if (arms <= 6) return { motorR: 8, armLen: 36 };
  return { motorR: 7, armLen: 38 };
}

/** Detect coaxial pairs: motors sharing the same x,y position. */
function detectCoaxial(motors: { x: number; y: number }[]) {
  const posKey = (m: { x: number; y: number }) => `${m.x.toFixed(3)},${m.y.toFixed(3)}`;
  const groups = new Map<string, number[]>();
  motors.forEach((m, i) => {
    const k = posKey(m);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(i);
  });
  return { posKey, groups };
}

/* ------------------------------------------------------------------ */
/*  CopterMotorDiagram -- the single diagram both pages use           */
/* ------------------------------------------------------------------ */

interface CopterMotorDiagramProps {
  preset: AirframePreset;
  layout: FrameLayout;
  testingMotor: number | null;
  motorResults?: Record<number, string>;
  enabled?: boolean;
  onMotorClick?: (motorNum: number) => void;
  /** Optional frame name shown above FRONT marker */
  showName?: boolean;
  /** CSS class on the outer container */
  className?: string;
}

export function CopterMotorDiagram({
  preset, layout, testingMotor,
  motorResults = {}, enabled = false, onMotorClick,
  showName = true, className = 'w-full',
}: CopterMotorDiagramProps) {
  const V = AIRFRAME_VIEWBOX; // 100
  const { cx, cy } = QUAD;   // 50, 50
  const { motorR: R, armLen } = motorScale(layout.motors);
  const { posKey, groups } = detectCoaxial(layout.motors);

  return (
    <svg viewBox={`0 0 ${V} ${V}`} className={className}>
      <rect width={V} height={V} rx="6" fill={C.bg} stroke={C.bgStroke} strokeWidth="1" />

      {/* Frame name */}
      {showName && (
        <text x={cx} y="8" textAnchor="middle" fill={C.neutral} fontSize="5"
          fontFamily="ui-monospace, monospace" fontWeight="700">{layout.name}</text>
      )}

      {/* FRONT marker */}
      <polygon points={`${cx - 3},14 ${cx + 3},14 ${cx},10`} fill={C.nose} />
      <text x={cx} y="19" textAnchor="middle" fill={C.nose} fontSize="4.5"
        fontFamily="ui-monospace, monospace" fontWeight="800">FRONT</text>

      {/* Airframe silhouette -- ghost mode, we draw our own motors */}
      <AirframeIcon preset={preset} size={V} selected={false} ghost={true} />

      {/* Motors -- render top coaxial first, bottom coaxial last (on top) */}
      {layout.motors
        .map((motor, idx) => ({ motor, idx }))
        .sort((a, b) => {
          const aBottom = groups.get(posKey(a.motor))!.length >= 2 && a.idx === groups.get(posKey(a.motor))![1];
          const bBottom = groups.get(posKey(b.motor))!.length >= 2 && b.idx === groups.get(posKey(b.motor))![1];
          return (aBottom ? 0 : 1) - (bBottom ? 0 : 1);
        })
        .map(({ motor, idx }) => {
        // Base position
        let mx = cx + motor.x * armLen;
        let my = cy - motor.y * armLen;

        // Coaxial offset: push bottom motor outward from center
        const group = groups.get(posKey(motor))!;
        const isCoaxial = group.length >= 2;
        const isBottom = isCoaxial && idx === group[1];
        if (isBottom) {
          const ddx = mx - cx;
          const ddy = my - cy;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
          mx += (ddx / dist) * (R * 1.6);
          my += (ddy / dist) * (R * 1.6);
        }

        const isCW = motor.rotation === 'CW';
        const baseColor = isCW ? C.cw : C.ccw;
        const isTesting = testingMotor === motor.number;
        const result = motorResults[motor.number] ?? null;

        const ringColor = isTesting ? C.testing
          : result === 'correct' ? C.confirmed
          : result === 'wrong' ? '#ef4444'
          : baseColor;

        // Direction from center to this motor (for outward-facing arrow)
        const dx = mx - cx;
        const dy = my - cy;
        const outAngle = Math.atan2(dy, dx);

        // Arrow arc: outside the ring, good gap, on the outward side
        const gap = R * 0.35;
        const arrowR = R + gap;
        const arcSpan = Math.PI * 0.35;

        let arcStart: number;
        let arcEnd: number;
        if (isCW) {
          arcStart = outAngle - arcSpan;
          arcEnd = outAngle + arcSpan;
        } else {
          arcStart = outAngle + arcSpan;
          arcEnd = outAngle - arcSpan;
        }

        const asx = mx + arrowR * Math.cos(arcStart);
        const asy = my + arrowR * Math.sin(arcStart);
        const aex = mx + arrowR * Math.cos(arcEnd);
        const aey = my + arrowR * Math.sin(arcEnd);
        const sweepFlag = isCW ? 1 : 0;

        // Arrowhead: triangle tangent to the arc at the endpoint
        const headLen = R * 0.3;
        const tangentDir = isCW ? 1 : -1;
        const tangentAngle = arcEnd + tangentDir * Math.PI / 2;
        const tipX = aex + headLen * Math.cos(tangentAngle);
        const tipY = aey + headLen * Math.sin(tangentAngle);
        const halfBase = headLen * 0.55;
        const perpAngle = arcEnd;
        const b1X = aex + halfBase * Math.cos(perpAngle);
        const b1Y = aey + halfBase * Math.sin(perpAngle);
        const b2X = aex - halfBase * Math.cos(perpAngle);
        const b2Y = aey - halfBase * Math.sin(perpAngle);

        const dimmed = !enabled && !isTesting;
        const dimOp = dimmed ? 0.4 : 1; // applied to ring/disc/arrows, NOT number
        const inBottomHalf = my > cy;

        return (
          <g key={`motor-${motor.number}`}
            className={enabled ? 'cursor-pointer' : ''}
            onClick={() => enabled && onMotorClick?.(motor.number)}
          >
            {/* Background disc to mask arm underneath */}
            {isCoaxial && <circle cx={mx} cy={my} r={R + 2} fill={C.bg} />}
            <circle cx={mx} cy={my} r={R + 1} fill={C.bg} />

            {/* Very faint prop disc */}
            <circle cx={mx} cy={my} r={R} fill={baseColor} fillOpacity={0.04 * dimOp} />

            {/* Faint motor ring */}
            <circle cx={mx} cy={my} r={R}
              fill="none" stroke={ringColor} strokeWidth={1}
              opacity={(isTesting || result ? 0.9 : 0.3) * dimOp}
              strokeDasharray={isBottom ? '2 1.5' : 'none'} />

            {/* Rotation arrow -- bold, bright, outside the ring */}
            <path
              d={`M ${asx},${asy} A ${arrowR},${arrowR} 0 0,${sweepFlag} ${aex},${aey}`}
              fill="none" stroke={baseColor} strokeWidth={R * 0.14} opacity={0.9 * dimOp}
              strokeLinecap="round"
            />
            <polygon
              points={`${tipX},${tipY} ${b1X},${b1Y} ${b2X},${b2Y}`}
              fill={baseColor} opacity={0.9 * dimOp}
            />

            {/* Number disc -- always full brightness */}
            <circle cx={mx} cy={my} r={R * 0.35}
              fill={isTesting ? C.testing : result === 'correct' ? C.confirmed : baseColor}
            />
            <text x={mx} y={my + 0.5} textAnchor="middle" dominantBaseline="central"
              fill={isTesting ? '#000' : '#f1f5f9'}
              fontSize={R * 0.4} fontWeight="900"
              fontFamily="ui-monospace, monospace">
              {motor.number}
            </text>

            {/* CW/CCW label */}
            {!isBottom ? (
              // Normal motors: above for bottom-half, below for top-half
              <text
                x={mx}
                y={inBottomHalf ? my - R - 2 : my + R + 4}
                textAnchor="middle"
                fill={baseColor} fontSize={R * 0.35}
                fontFamily="ui-monospace, monospace" fontWeight="700"
                opacity={0.8}>
                {motor.rotation}
              </text>
            ) : (
              // Coaxial bottom motors: label to the outward side, close to ring
              <text
                x={mx + (mx > cx ? R * 0.6 : -(R * 0.6))}
                y={my + R + 3}
                textAnchor={mx > cx ? 'start' : 'end'}
                fill={baseColor} fontSize={R * 0.3}
                fontFamily="ui-monospace, monospace" fontWeight="700"
                opacity={0.7}>
                {motor.rotation}
              </text>
            )}

            {/* Bottom coaxial label */}
            {isBottom && (
              <text
                x={mx + (mx > cx ? R * 0.6 : -(R * 0.6))}
                y={my + R + 3 + R * 0.35}
                textAnchor={mx > cx ? 'start' : 'end'}
                fill="#666" fontSize={R * 0.25}
                fontFamily="ui-monospace, monospace">BOTTOM</text>
            )}

            {/* Testing pulse */}
            {isTesting && (
              <circle cx={mx} cy={my} r={R + 2}
                fill="none" stroke={C.testing} strokeWidth={1} opacity={0.5}>
                <animate attributeName="r" values={`${R};${R + 5};${R}`}
                  dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.1;0.6"
                  dur="1s" repeatCount="indefinite" />
              </circle>
            )}

            {/* Confirmed / wrong */}
            {result === 'correct' && (
              <text x={mx + R * 0.55} y={my - R * 0.55}
                fill={C.confirmed} fontSize={R * 0.5} fontWeight="bold">&#x2713;</text>
            )}
            {result === 'wrong' && (
              <text x={mx + R * 0.55} y={my - R * 0.55}
                fill="#ef4444" fontSize={R * 0.5} fontWeight="bold">&#x2717;</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
