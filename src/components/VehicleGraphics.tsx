/**
 * VehicleGraphics -- Shared vehicle drawing system.
 *
 * GOLDEN RULE: ONE icon set throughout the app. Every aircraft uses the
 * AirframeIcons shapes (solid fills, airport-signage style).
 *
 * COLOR RULE: BRIGHT, SATURATED, HIGH CONTRAST against #0c0b0a backgrounds.
 *   marigold #ffaa2a = port (left)
 *   cyan  #22d3ee = starboard (right)
 *   green #4ade80 = nose
 *   purple #a78bfa = tail
 *   rose  #fb7185 = CW motor
 *   sky   #38bdf8 = CCW motor
 *
 * All shapes: 100×100 viewBox unless noted. Consumers scale via CSS.
 */

import {
  ConventionalPlane,
  FlyingWingPlane,
  VTailPlane,
  ATailPlane,
  CanardPlane,
  GliderPlane,
  TwinMotorPlane,
  AIRFRAME_VIEWBOX as V,
  QUAD,
} from './AirframeIcons';

// ─── Shared Colors -- BRIGHT & BOLD ──────────────────────────────────────

export const VC = {
  body: '#cbd5e1',         // bright slate -- VISIBLE against dark bg
  bodyDim: '#94a3b8',
  port: '#ffaa2a',         // marigold -- left (BRIGHT)
  starboard: '#22d3ee',    // cyan -- right (BRIGHT)
  nose: '#4ade80',         // green -- front
  tail: '#a78bfa',         // purple -- rear
  cw: '#fb7185',           // motor CW (rose)
  ccw: '#38bdf8',          // motor CCW (sky)
  ground: '#64748b',       // ground line
  neutral: '#cbd5e1',      // neutral elements
  bg: '#13120f',           // diagram background
  bgStroke: '#2a2622',     // diagram border
};


// ═══════════════════════════════════════════════════════════════════════════
//  MOTORS PAGE -- Copter Diagram
// ═══════════════════════════════════════════════════════════════════════════

interface MotorDef {
  number: number;
  x: number;
  y: number;
  rotation: 'CW' | 'CCW';
}

export function CopterMotorDiagram({
  motors, frameName, testingMotor, enabled, onMotorClick, isHFrame = false,
}: {
  motors: MotorDef[];
  frameName: string;
  testingMotor: number | null;
  enabled: boolean;
  onMotorClick: (n: number) => void;
  isHFrame?: boolean;
}) {
  const { cx, cy, armLen, motorR, armW } = QUAD;

  return (
    <svg viewBox={`0 0 ${V} ${V}`} className="mx-auto w-full max-w-[500px]">
      <rect width={V} height={V} rx="6" fill={VC.bg} stroke={VC.bgStroke} strokeWidth="1" />

      {/* Frame name */}
      <text x={cx} y="8" textAnchor="middle" fill={VC.neutral} fontSize="5"
        fontFamily="ui-monospace, monospace" fontWeight="700">{frameName}</text>

      {/* Front marker */}
      <polygon points={`${cx - 3},14 ${cx + 3},14 ${cx},10`} fill={VC.nose} />
      <text x={cx} y="19" textAnchor="middle" fill={VC.nose} fontSize="4.5"
        fontFamily="ui-monospace, monospace" fontWeight="800">FRONT</text>

      {/* Arms -- colored by side (L/R), with H-frame geometry if applicable */}
      {isHFrame && motors.length === 4 ? (() => {
        const mpos = motors.map(m => ({
          mx: cx + m.x * armLen,
          my: cy - m.y * armLen,
          origX: m.x,
        }));
        const left = mpos.filter(p => p.origX < 0);
        const right = mpos.filter(p => p.origX > 0);
        const leftF = left.reduce((a, b) => a.my < b.my ? a : b);
        const leftR = left.reduce((a, b) => a.my > b.my ? a : b);
        const rightF = right.reduce((a, b) => a.my < b.my ? a : b);
        const rightR = right.reduce((a, b) => a.my > b.my ? a : b);
        return (
          <>
            <line x1={leftF.mx} y1={leftF.my} x2={leftR.mx} y2={leftR.my}
              stroke={VC.port} strokeWidth={armW * 2} strokeLinecap="round" opacity="0.5" />
            <line x1={rightF.mx} y1={rightF.my} x2={rightR.mx} y2={rightR.my}
              stroke={VC.starboard} strokeWidth={armW * 2} strokeLinecap="round" opacity="0.5" />
            <line
              x1={(leftF.mx + leftR.mx) / 2} y1={(leftF.my + leftR.my) / 2}
              x2={(rightF.mx + rightR.mx) / 2} y2={(rightF.my + rightR.my) / 2}
              stroke={VC.neutral} strokeWidth={armW * 2} strokeLinecap="round" opacity="0.4" />
          </>
        );
      })() : motors.map((m) => {
        const mx = cx + m.x * armLen;
        const my = cy - m.y * armLen;
        const isLeft = m.x < 0;
        const armColor = isLeft ? VC.port : VC.starboard;
        return (
          <line key={`arm-${m.number}`} x1={cx} y1={cy} x2={mx} y2={my}
            stroke={armColor} strokeWidth={armW * 2} strokeLinecap="round" opacity="0.5" />
        );
      })}

      {/* Body */}
      <rect x={cx - 7} y={cy - 6} width={14} height={12} rx={2}
        fill="#201e1a" stroke={VC.neutral} strokeWidth="1.5" />

      {/* Nose arrow on body */}
      <polygon points={`${cx},${cy - 12} ${cx - 3.5},${cy - 6} ${cx + 3.5},${cy - 6}`}
        fill={VC.nose} opacity="0.6" />

      {/* Motors -- clean ring + rotation arc + number */}
      {motors.map((m) => {
        const mx = cx + m.x * armLen;
        const my = cy - m.y * armLen;
        const isTesting = testingMotor === m.number;
        const color = isTesting ? '#ffcc66' : m.rotation === 'CCW' ? VC.ccw : VC.cw;
        const dimmed = !enabled && !isTesting;
        const r = motorR;
        const isCW = m.rotation === 'CW';

        // Rotation arrow arc
        const arcR = r - 2;
        const startAngle = isCW ? -100 : 100;
        const endAngle = isCW ? 100 : -100;
        const sa = (startAngle * Math.PI) / 180;
        const ea = (endAngle * Math.PI) / 180;
        const sx = mx + arcR * Math.cos(sa);
        const sy = my + arcR * Math.sin(sa);
        const ex = mx + arcR * Math.cos(ea);
        const ey = my + arcR * Math.sin(ea);
        const sweepFlag = isCW ? 1 : 0;

        const tipAngle = ea + (isCW ? 0.3 : -0.3);
        const baseAngle1 = ea - (isCW ? 0.15 : -0.15);
        const baseAngle2 = ea - (isCW ? 0.5 : -0.5);
        const tipX = mx + (arcR + 1.5) * Math.cos(tipAngle);
        const tipY = my + (arcR + 1.5) * Math.sin(tipAngle);
        const b1X = mx + (arcR - 1) * Math.cos(baseAngle1);
        const b1Y = my + (arcR - 1) * Math.sin(baseAngle1);
        const b2X = mx + (arcR + 1) * Math.cos(baseAngle2);
        const b2Y = my + (arcR + 1) * Math.sin(baseAngle2);

        return (
          <g key={`motor-${m.number}`}
            className={enabled ? 'cursor-pointer' : 'cursor-not-allowed'}
            onClick={() => enabled && onMotorClick(m.number)}
            opacity={dimmed ? 0.35 : 1}>
            {/* Motor ring -- clean, no fill */}
            <circle cx={mx} cy={my} r={r} fill={VC.bg} stroke={color} strokeWidth={2} />
            {/* Rotation arc */}
            <path d={`M ${sx},${sy} A ${arcR},${arcR} 0 1,${sweepFlag} ${ex},${ey}`}
              fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
            <polygon points={`${tipX},${tipY} ${b1X},${b1Y} ${b2X},${b2Y}`}
              fill={color} opacity="0.5" />
            {/* Number */}
            <circle cx={mx} cy={my} r={4} fill={color} />
            <text x={mx} y={my + 1.5} textAnchor="middle" dominantBaseline="central"
              fill={isTesting ? '#000' : '#f1f5f9'} fontSize="7" fontWeight="900"
              fontFamily="ui-monospace, monospace">{m.number}</text>
            {/* Rotation label */}
            <text x={mx} y={my + r + 5} textAnchor="middle" fill={color} fontSize="4"
              fontFamily="ui-monospace, monospace" fontWeight="700">{m.rotation}</text>
          </g>
        );
      })}
    </svg>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
//  MOTORS PAGE -- Plane Diagram
// ═══════════════════════════════════════════════════════════════════════════

interface ServoAssignment {
  output: number;
  func: number;
  name: string;
}

export function PlaneServoDiagram({
  servoFunctions, SERVO_FUNCTIONS, diagramType = 'conventional', isTwin = false, isGlider = false,
}: {
  servoFunctions: Map<number, number>;
  SERVO_FUNCTIONS: Record<number, string>;
  diagramType?: 'conventional' | 'flying_wing' | 'vtail' | 'atail' | 'canard' | 'twin_boom';
  isTwin?: boolean;
  isGlider?: boolean;
}) {
  const assignments: ServoAssignment[] = [];
  servoFunctions.forEach((func, output) => {
    if (func === 0) return;
    assignments.push({ output, func, name: SERVO_FUNCTIONS[func] || `Func ${func}` });
  });

  const leftWing: ServoAssignment[] = [];
  const rightWing: ServoAssignment[] = [];
  const tail: ServoAssignment[] = [];
  const motor: ServoAssignment[] = [];
  let ailIdx = 0, flapIdx = 0;

  for (const a of assignments) {
    switch (a.func) {
      case 77: if (ailIdx++ % 2 === 0) leftWing.push(a); else rightWing.push(a); break;
      case 80: case 86: leftWing.push(a); break;
      case 81: case 87: rightWing.push(a); break;
      case 84: if (flapIdx++ % 2 === 0) leftWing.push(a); else rightWing.push(a); break;
      case 78: case 79: case 4: tail.push(a); break;
      case 33: case 34: case 35: case 36: case 70: case 73: case 74: motor.push(a); break;
      default: break;
    }
  }

  const funcColor = (func: number): string => {
    if ([77, 80, 81, 84, 86, 87].includes(func)) return VC.ccw;
    if (func === 78) return VC.nose;
    if (func === 79) return VC.tail;
    if ([33, 34, 35, 36, 70, 73, 74].includes(func)) return VC.port;
    return VC.neutral;
  };

  const VW = 160, VH = 120;
  const ox = (VW - V) / 2;
  const oy = (VH - V) / 2;

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="mx-auto w-full max-w-[640px]">
      <rect width={VW} height={VH} rx="6" fill={VC.bg} stroke={VC.bgStroke} strokeWidth="1" />
      <polygon points={`${VW / 2 - 3},6 ${VW / 2 + 3},6 ${VW / 2},2`} fill={VC.nose} />
      <text x={VW / 2} y="11" textAnchor="middle" fill={VC.nose} fontSize="4"
        fontFamily="ui-monospace, monospace" fontWeight="800">FRONT</text>

      {/* Aircraft -- SVG silhouette */}
      <g transform={`translate(${ox},${oy})`}>
        {diagramType === 'flying_wing' && <FlyingWingPlane fill={VC.bodyDim} twin={isTwin} />}
        {diagramType === 'conventional' && isGlider && <GliderPlane fill={VC.bodyDim} />}
        {diagramType === 'conventional' && !isGlider && isTwin && <TwinMotorPlane fill={VC.bodyDim} />}
        {diagramType === 'conventional' && !isGlider && !isTwin && <ConventionalPlane fill={VC.bodyDim} />}
        {diagramType === 'vtail' && <VTailPlane fill={VC.bodyDim} />}
        {diagramType === 'atail' && <ATailPlane fill={VC.bodyDim} />}
        {diagramType === 'canard' && <CanardPlane fill={VC.bodyDim} />}
        {diagramType === 'twin_boom' && <TwinMotorPlane fill={VC.bodyDim} />}
      </g>

      {/* L/R labels on wings */}
      <text x={ox + 10} y={oy + 48} fontSize="6" fill={VC.port}
        fontWeight="900" fontFamily="ui-monospace, monospace">L</text>
      <text x={ox + V - 10} y={oy + 48} textAnchor="end" fontSize="6" fill={VC.starboard}
        fontWeight="900" fontFamily="ui-monospace, monospace">R</text>

      {/* Motor prop at nose */}
      {motor.length > 0 && (
        <g>
          <circle cx={VW / 2} cy={oy + 4} r="5" fill={VC.port} opacity="0.2" stroke={VC.port} strokeWidth="1.5" />
          <line x1={VW / 2 - 8} y1={oy + 4} x2={VW / 2 + 8} y2={oy + 4}
            stroke={VC.port} strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {/* Left wing servo indicators */}
      {leftWing.map((a, i) => {
        const color = funcColor(a.func);
        const sy = oy + 42 + i * 9;
        const sx = ox + 8 + i * 6;
        return (
          <g key={`lw-${a.output}`}>
            <rect x={sx} y={sy} width="14" height="5" rx="1.5" fill={color} opacity="0.5" stroke={color} strokeWidth="0.8" />
            <line x1={sx} y1={sy + 2.5} x2={24} y2={14 + i * 10}
              stroke={color} strokeWidth="0.5" opacity="0.6" />
            <text x={4} y={14 + i * 10} textAnchor="start" fill={color} fontSize="4.5"
              fontFamily="ui-monospace, monospace" fontWeight="800">S{a.output}: {a.name}</text>
          </g>
        );
      })}

      {/* Right wing servo indicators */}
      {rightWing.map((a, i) => {
        const color = funcColor(a.func);
        const sy = oy + 42 + i * 9;
        const sx = ox + V - 22 - i * 6;
        return (
          <g key={`rw-${a.output}`}>
            <rect x={sx} y={sy} width="14" height="5" rx="1.5" fill={color} opacity="0.5" stroke={color} strokeWidth="0.8" />
            <line x1={sx + 14} y1={sy + 2.5} x2={VW - 24} y2={14 + i * 10}
              stroke={color} strokeWidth="0.5" opacity="0.6" />
            <text x={VW - 4} y={14 + i * 10} textAnchor="end" fill={color} fontSize="4.5"
              fontFamily="ui-monospace, monospace" fontWeight="800">S{a.output}: {a.name}</text>
          </g>
        );
      })}

      {/* Tail servo indicators */}
      {tail.map((a, i) => {
        const color = funcColor(a.func);
        return (
          <g key={`tail-${a.output}`}>
            <text x={VW / 2} y={VH - 6 - i * 9} textAnchor="middle" fill={color} fontSize="4.5"
              fontFamily="ui-monospace, monospace" fontWeight="800">S{a.output}: {a.name}</text>
          </g>
        );
      })}

      {/* Motor labels */}
      {motor.map((a, i) => {
        const color = funcColor(a.func);
        return (
          <text key={`mot-${a.output}`} x={VW / 2 + 12} y={oy + 6 + i * 8} textAnchor="start"
            fill={color} fontSize="4.5" fontFamily="ui-monospace, monospace" fontWeight="800">
            S{a.output}: {a.name}
          </text>
        );
      })}
    </svg>
  );
}



// ═══════════════════════════════════════════════════════════════════════════
//  CALIBRATION -- Flashcard Views
// ═══════════════════════════════════════════════════════════════════════════
//
// Each view shows how the vehicle PHYSICALLY LOOKS in that position,
// as seen from the side of the table.
//
// Level / Upside-down → SIDE profile (sitting on / flipped on surface)
// Left / Right        → FRONT profile rotated 90° (wing/arm on ground)
// Nose down / up      → SIDE profile rotated 90°
//
// INAV Configurator is the visual reference.

export type CalibrationPosition = 'level' | 'left' | 'right' | 'nosedown' | 'noseup' | 'back';

const CW = 140;  // calibration viewBox width
const CH = 100;  // calibration viewBox height
const GY = 90;   // ground line Y
const FONT = 'ui-monospace, monospace';

/** Ground surface with hatch marks */
function CalGround() {
  const x1 = 8, x2 = CW - 8;
  return (
    <g>
      <line x1={x1} y1={GY} x2={x2} y2={GY}
        stroke={VC.ground} strokeWidth="2" strokeLinecap="round" />
      {Array.from({ length: 5 }, (_, i) => {
        const hx = x1 + 8 + i * ((x2 - x1 - 16) / 4);
        return (
          <line key={i} x1={hx} y1={GY} x2={hx - 5} y2={GY + 5}
            stroke={VC.ground} strokeWidth="1" opacity="0.4" />
        );
      })}
    </g>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
//  PLANE -- Side & Front profiles
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Plane SIDE PROFILE -- a proper airplane silhouette as a single filled path.
 * Nose points RIGHT. Centered at (cx, cy). Fits within ~70×30.
 */
function PlaneSide({ cx, cy }: { cx: number; cy: number }) {
  // Offsets from center
  const x = cx, y = cy;
  return (
    <g>
      {/* Main fuselage + tail silhouette -- solid filled path */}
      <path fill={VC.body} d={`
        M${x + 34},${y}
        C${x + 34},${y - 2} ${x + 30},${y - 4} ${x + 24},${y - 4}
        L${x - 18},${y - 4}
        L${x - 22},${y - 4}
        L${x - 22},${y - 18}
        L${x - 28},${y - 18}
        L${x - 30},${y - 4}
        L${x - 34},${y - 3}
        L${x - 34},${y + 3}
        L${x - 30},${y + 4}
        L${x - 22},${y + 4}
        L${x - 18},${y + 4}
        L${x + 24},${y + 4}
        C${x + 30},${y + 4} ${x + 34},${y + 2} ${x + 34},${y}
        Z
      `} />
      {/* Nose cone -- green */}
      <path fill={VC.nose} d={`
        M${x + 34},${y}
        C${x + 34},${y - 2} ${x + 30},${y - 3.5} ${x + 28},${y - 3.5}
        L${x + 28},${y + 3.5}
        C${x + 30},${y + 3.5} ${x + 34},${y + 2} ${x + 34},${y}
        Z
      `} opacity="0.9" />
      {/* Spinner dot */}
      <circle cx={x + 35} cy={y} r="1.5" fill={VC.nose} />
      {/* Wing -- horizontal slab protruding upward from fuselage */}
      <path fill={VC.body} opacity="0.85" d={`
        M${x + 6},${y - 4}
        L${x + 8},${y - 14}
        L${x - 2},${y - 14}
        L${x - 4},${y - 4}
        Z
      `} />
      {/* Horizontal stabilizer */}
      <path fill={VC.tail} opacity="0.65" d={`
        M${x - 26},${y + 4}
        L${x - 34},${y + 2}
        L${x - 34},${y + 5}
        L${x - 26},${y + 4}
        Z
      `} />
      {/* Vertical tail fin -- purple */}
      <path fill={VC.tail} opacity="0.8" d={`
        M${x - 22},${y - 4}
        L${x - 24},${y - 18}
        L${x - 28},${y - 18}
        L${x - 28},${y - 4}
        Z
      `} />
    </g>
  );
}

/**
 * Plane FRONT PROFILE -- looking straight at the nose.
 * Compact: fits within ~70×40 centered at (cx, cy).
 */
function PlaneFront({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {/* Wings -- thick solid bars, colored L/R */}
      <line x1={cx - 8} y1={cy + 1} x2={cx - 34} y2={cy + 1}
        stroke={VC.port} strokeWidth="5" strokeLinecap="round" />
      <line x1={cx + 8} y1={cy + 1} x2={cx + 34} y2={cy + 1}
        stroke={VC.starboard} strokeWidth="5" strokeLinecap="round" />
      {/* Fuselage cross-section */}
      <ellipse cx={cx} cy={cy} rx="8" ry="10" fill={VC.body} />
      {/* Vertical stabilizer (on top) */}
      <rect x={cx - 1.5} y={cy - 22} width="3" height="13" rx="1"
        fill={VC.tail} opacity="0.7" />
      {/* Nose spinner */}
      <circle cx={cx} cy={cy} r="3.5" fill={VC.nose} opacity="0.85" />
      {/* Wing labels */}
      <text x={cx - 38} y={cy + 5} textAnchor="end" fill={VC.port}
        fontSize="8" fontWeight="900" fontFamily={FONT}>L</text>
      <text x={cx + 38} y={cy + 5} textAnchor="start" fill={VC.starboard}
        fontSize="8" fontWeight="900" fontFamily={FONT}>R</text>
    </g>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
//  COPTER -- Side & Front profiles
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Copter SIDE PROFILE -- INAV style.
 * Flat body plate, motor arms going up at angles, prop discs on top.
 * 2 arms visible from side (front + rear). Landing skids below.
 * Nose points RIGHT. Centered at (cx, cy). Fits ~60×35.
 */
function CopterSide({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {/* Body plate -- flat horizontal bar */}
      <rect x={cx - 16} y={cy - 3} width={32} height={6} rx="2.5" fill={VC.body} />

      {/* Front arm (diagonal up-right) + motor */}
      <line x1={cx + 8} y1={cy - 3} x2={cx + 22} y2={cy - 20}
        stroke={VC.body} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <circle cx={cx + 22} cy={cy - 20} r="7"
        fill="none" stroke={VC.body} strokeWidth="2.5" opacity="0.8" />
      <circle cx={cx + 22} cy={cy - 20} r="2" fill={VC.body} opacity="0.8" />

      {/* Rear arm (diagonal up-left) + motor -- slightly dimmer (further) */}
      <line x1={cx - 8} y1={cy - 3} x2={cx - 22} y2={cy - 20}
        stroke={VC.body} strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      <circle cx={cx - 22} cy={cy - 20} r="6"
        fill="none" stroke={VC.body} strokeWidth="2" opacity="0.5" />
      <circle cx={cx - 22} cy={cy - 20} r="1.5" fill={VC.body} opacity="0.5" />

      {/* Landing skids */}
      <line x1={cx - 10} y1={cy + 3} x2={cx - 12} y2={cy + 8}
        stroke={VC.bodyDim} strokeWidth="1.5" strokeLinecap="round" />
      <line x1={cx + 10} y1={cy + 3} x2={cx + 12} y2={cy + 8}
        stroke={VC.bodyDim} strokeWidth="1.5" strokeLinecap="round" />
      <line x1={cx - 16} y1={cy + 8} x2={cx + 16} y2={cy + 8}
        stroke={VC.bodyDim} strokeWidth="1.5" strokeLinecap="round" />

      {/* Nose arrow -- small green triangle on right end */}
      <polygon points={`${cx + 18},${cy} ${cx + 14},${cy - 2.5} ${cx + 14},${cy + 2.5}`}
        fill={VC.nose} opacity="0.85" />

      {/* Tail marker -- small purple on left end */}
      <rect x={cx - 17} y={cy - 2} width="3" height="4" rx="1" fill={VC.tail} opacity="0.6" />
    </g>
  );
}

/**
 * Copter FRONT PROFILE -- looking straight at the nose.
 * Body + arms extending L/R with motor rings.
 * Compact: fits ~60×30 centered at (cx, cy).
 */
function CopterFront({ cx, cy }: { cx: number; cy: number }) {
  const armLen = 24;
  const mR = 7;

  return (
    <g>
      {/* Left arm + motor */}
      <line x1={cx} y1={cy} x2={cx - armLen} y2={cy}
        stroke={VC.port} strokeWidth="4" strokeLinecap="round" opacity="0.65" />
      <circle cx={cx - armLen} cy={cy} r={mR}
        fill="none" stroke={VC.port} strokeWidth="2.5" />
      <circle cx={cx - armLen} cy={cy} r="2.5" fill={VC.port} />

      {/* Right arm + motor */}
      <line x1={cx} y1={cy} x2={cx + armLen} y2={cy}
        stroke={VC.starboard} strokeWidth="4" strokeLinecap="round" opacity="0.65" />
      <circle cx={cx + armLen} cy={cy} r={mR}
        fill="none" stroke={VC.starboard} strokeWidth="2.5" />
      <circle cx={cx + armLen} cy={cy} r="2.5" fill={VC.starboard} />

      {/* Body -- front view = square-ish */}
      <rect x={cx - 7} y={cy - 7} width="14" height="14" rx="3" fill={VC.body} />

      {/* Nose dot (facing us) */}
      <circle cx={cx} cy={cy} r="3" fill={VC.nose} />

      {/* Landing skids */}
      <line x1={cx - 6} y1={cy + 7} x2={cx - 8} y2={cy + 12}
        stroke={VC.bodyDim} strokeWidth="1.5" strokeLinecap="round" />
      <line x1={cx + 6} y1={cy + 7} x2={cx + 8} y2={cy + 12}
        stroke={VC.bodyDim} strokeWidth="1.5" strokeLinecap="round" />
      <line x1={cx - 12} y1={cy + 12} x2={cx + 12} y2={cy + 12}
        stroke={VC.bodyDim} strokeWidth="1.5" strokeLinecap="round" />

      {/* Labels */}
      <text x={cx - armLen - mR - 2} y={cy + 4} textAnchor="end" fill={VC.port}
        fontSize="8" fontWeight="900" fontFamily={FONT}>L</text>
      <text x={cx + armLen + mR + 2} y={cy + 4} textAnchor="start" fill={VC.starboard}
        fontSize="8" fontWeight="900" fontFamily={FONT}>R</text>
    </g>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
//  Composed Views (public API)
// ═══════════════════════════════════════════════════════════════════════════

export function CopterCalibrationView({
  position,
}: {
  position: CalibrationPosition;
  state: 'pending' | 'active' | 'sampling' | 'completed';
}) {
  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full" style={{ maxWidth: '340px' }}>
      {position === 'level' && <CalViewLevel Vehicle={CopterSide} />}
      {position === 'back' && <CalViewFlip Vehicle={CopterSide} />}
      {position === 'left' && <CalViewRoll Vehicle={CopterFront} side="left" />}
      {position === 'right' && <CalViewRoll Vehicle={CopterFront} side="right" />}
      {position === 'nosedown' && <CalViewPitch Vehicle={CopterSide} dir="down" />}
      {position === 'noseup' && <CalViewPitch Vehicle={CopterSide} dir="up" />}
    </svg>
  );
}

export function PlaneCalibrationView({
  position,
}: {
  position: CalibrationPosition;
  state: 'pending' | 'active' | 'sampling' | 'completed';
}) {
  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full" style={{ maxWidth: '340px' }}>
      {position === 'level' && <CalViewLevel Vehicle={PlaneSide} />}
      {position === 'back' && <CalViewFlip Vehicle={PlaneSide} />}
      {position === 'left' && <CalViewRoll Vehicle={PlaneFront} side="left" />}
      {position === 'right' && <CalViewRoll Vehicle={PlaneFront} side="right" />}
      {position === 'nosedown' && <CalViewPitch Vehicle={PlaneSide} dir="down" />}
      {position === 'noseup' && <CalViewPitch Vehicle={PlaneSide} dir="up" />}
    </svg>
  );
}


// ─── Position layouts (generic, work for both vehicle types) ─────────────

type VehicleComponent = (props: { cx: number; cy: number }) => React.JSX.Element;

/**
 * Level: side profile resting just above the ground line.
 * Vehicle bottom edge ~4px above GY.
 */
function CalViewLevel({ Vehicle }: { Vehicle: VehicleComponent }) {
  return (
    <g>
      <CalGround />
      <Vehicle cx={CW / 2} cy={GY - 14} />
    </g>
  );
}

/**
 * Upside down: side profile flipped vertically, resting on ground.
 * The flipped vehicle has its tallest features (motors/tail fin) pointing down,
 * so we position it higher than the level view to prevent ground clipping.
 */
function CalViewFlip({ Vehicle }: { Vehicle: VehicleComponent }) {
  // After flip, the top features (motors ~20px above cy) become the bottom.
  // Position so those land just above GY: vCy + 20 ≈ GY - 2
  const vCy = GY - 22;
  return (
    <g>
      <CalGround />
      <g transform={`translate(0, ${vCy * 2}) scale(1, -1)`}>
        <Vehicle cx={CW / 2} cy={vCy} />
      </g>
      {/* Flip arrow */}
      <g opacity="0.65">
        <path d={`M ${CW - 16},28 A 13,13 0 1,1 ${CW - 16},56`}
          fill="none" stroke={VC.neutral} strokeWidth="1.5" />
        <polygon points={`${CW - 16},56 ${CW - 19},51 ${CW - 13},51`} fill={VC.neutral} />
        <text x={CW - 16} y={45} textAnchor="middle" fill={VC.neutral} fontSize="7"
          fontWeight="900" fontFamily={FONT}>FLIP</text>
      </g>
    </g>
  );
}

/**
 * Roll left/right: front profile rotated 90°.
 * Pivot chosen so extremes stay above ground.
 */
function CalViewRoll({ Vehicle, side }: { Vehicle: VehicleComponent; side: 'left' | 'right' }) {
  const isLeft = side === 'left';
  const cx = CW / 2;
  // Pivot high enough that after 90° rotation, bottom stays above GY
  const pivotY = 50;

  return (
    <g>
      <CalGround />
      <g transform={`rotate(${isLeft ? 90 : -90}, ${cx}, ${pivotY})`}>
        <Vehicle cx={cx} cy={pivotY} />
      </g>
      {/* Up side label */}
      <text x={isLeft ? cx + 24 : cx - 24} y={18} textAnchor="middle"
        fill={isLeft ? VC.starboard : VC.port} fontSize="8"
        fontWeight="900" fontFamily={FONT}>
        {isLeft ? 'R ↑' : 'L ↑'}
      </text>
      {/* Down side label */}
      <text x={isLeft ? cx - 12 : cx + 12} y={GY - 2} textAnchor="middle"
        fill={isLeft ? VC.port : VC.starboard} fontSize="8"
        fontWeight="900" fontFamily={FONT}>
        {isLeft ? 'L ↓' : 'R ↓'}
      </text>
    </g>
  );
}

/**
 * Pitch nose down/up: side profile rotated 90°.
 * Side profile has nose pointing RIGHT.
 * SVG rotate is clockwise-positive:
 *   rotate(+90) = nose goes DOWN
 *   rotate(-90) = nose goes UP
 */
function CalViewPitch({ Vehicle, dir }: { Vehicle: VehicleComponent; dir: 'down' | 'up' }) {
  const isDown = dir === 'down';
  const cx = CW / 2;
  const pivotY = 48;

  return (
    <g>
      <CalGround />
      <g transform={`rotate(${isDown ? 90 : -90}, ${cx}, ${pivotY})`}>
        <Vehicle cx={cx} cy={pivotY} />
      </g>
      {/* Nose label at the appropriate end */}
      <text x={cx} y={isDown ? GY - 2 : 14} textAnchor="middle"
        fill={VC.nose} fontSize="8"
        fontWeight="900" fontFamily={FONT}>
        NOSE {isDown ? '▼' : '▲'}
      </text>
    </g>
  );
}
