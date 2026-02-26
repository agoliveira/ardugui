import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  Play,
  RotateCw,
  RotateCcw,
  Cog,
  ExternalLink,
  ShieldCheck,
  ShieldOff,
  Lock,
} from 'lucide-react';
import { useParameterStore } from '@/store/parameterStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { connectionManager } from '@/mavlink/connection';
import {
  getFrameLayout,
  FRAME_CLASSES,
  FRAME_TYPES,
  SERVO_FUNCTIONS,
  type MotorDef,
} from '@/models/frameDefinitions';
import { useDetectedPreset } from '@/hooks/useDetectedPreset';
import { AirframeIcon, AIRFRAME_VIEWBOX, QUAD } from '@/components/AirframeIcons';

const V = AIRFRAME_VIEWBOX;

// ── Colors (shared with VehicleGraphics calibration views) ──────────────

const MC = {
  ccw: '#38bdf8',
  cw: '#fb7185',
  nose: '#4ade80',
  neutral: '#cbd5e1',
  bg: '#13120f',
  bgStroke: '#2a2622',
  port: '#ffaa2a',
  starboard: '#22d3ee',
  bodyDim: '#94a3b8',
};


// ============================================================
// Copter Motor Diagram -- AirframeIcon base + interactive overlay
// ============================================================

function CopterMotorOverlay({
  motors, testingMotor, enabled, onMotorClick,
}: {
  motors: MotorDef[];
  testingMotor: number | null;
  enabled: boolean;
  onMotorClick: (n: number) => void;
}) {
  const { cx, cy } = QUAD;

  // Scale by unique arm positions, not total motor count (coaxial frames)
  const armPositions = new Set(motors.map(m => `${m.x.toFixed(3)},${m.y.toFixed(3)}`));
  const arms = armPositions.size;
  const scale = arms <= 4
    ? { r: 10, arm: 32 }
    : arms <= 6
      ? { r: 8, arm: 36 }
      : { r: 6, arm: 38 };

  // Detect coaxial pairs (same x,y position) -- offset bottom motors outward
  const posKey = (m: MotorDef) => `${m.x.toFixed(3)},${m.y.toFixed(3)}`;
  const posGroups = new Map<string, number[]>();
  motors.forEach((m, i) => {
    const k = posKey(m);
    if (!posGroups.has(k)) posGroups.set(k, []);
    posGroups.get(k)!.push(i);
  });
  const coaxialOffset = scale.r * 0.45;

  return (
    <>
      {motors.map((m, idx) => {
        let mx = cx + m.x * scale.arm;
        let my = cy - m.y * scale.arm;

        // Offset bottom coaxial motor outward from center
        const k = posKey(m);
        const group = posGroups.get(k)!;
        const isBottom = group.length >= 2 && idx === group[1];
        if (isBottom) {
          const dx = mx - cx;
          const dy = my - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          mx += (dx / dist) * coaxialOffset;
          my += (dy / dist) * coaxialOffset;
        }

        const isTesting = testingMotor === m.number;
        const color = isTesting ? '#ffcc66' : m.rotation === 'CCW' ? MC.ccw : MC.cw;
        const dimmed = !enabled && !isTesting;
        const r = scale.r;
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
            {/* Background disc to mask AirframeIcon's base layer */}
            <circle cx={mx} cy={my} r={r + 2} fill={MC.bg} />
            {/* Motor ring -- dashed for bottom coaxial motor */}
            <circle cx={mx} cy={my} r={r} fill={MC.bg} stroke={color} strokeWidth={2}
              strokeDasharray={isBottom ? '4,2' : 'none'} />
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
    </>
  );
}


// ============================================================
// Plane Servo Diagram -- AirframeIcon base + servo labels overlay
// ============================================================

function PlaneServoOverlay({
  servoFunctions,
  SERVO_FUNCTIONS: funcNames,
}: {
  servoFunctions: Map<number, number>;
  SERVO_FUNCTIONS: Record<number, string>;
}) {
  const assignments: { output: number; func: number; name: string }[] = [];
  servoFunctions.forEach((func, output) => {
    if (func === 0) return;
    assignments.push({ output, func, name: funcNames[func] || `Func ${func}` });
  });

  const leftWing: typeof assignments = [];
  const rightWing: typeof assignments = [];
  const tail: typeof assignments = [];
  const motor: typeof assignments = [];
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
    if ([77, 80, 81, 84, 86, 87].includes(func)) return MC.ccw;
    if (func === 78) return MC.nose;
    if (func === 79) return '#a78bfa';
    if ([33, 34, 35, 36, 70, 73, 74].includes(func)) return MC.port;
    return MC.neutral;
  };

  // Labels positioned outside the 100x100 icon area within the wider viewBox
  const VW = 160, VH = 120;
  const ox = (VW - V) / 2; // icon x offset within wider viewBox

  return (
    <>
      {/* Left wing labels */}
      {leftWing.map((a, i) => {
        const color = funcColor(a.func);
        return (
          <text key={`lw-${a.output}`} x={4} y={14 + i * 10} textAnchor="start" fill={color} fontSize="4.5"
            fontFamily="ui-monospace, monospace" fontWeight="800">S{a.output}: {a.name}</text>
        );
      })}

      {/* Right wing labels */}
      {rightWing.map((a, i) => {
        const color = funcColor(a.func);
        return (
          <text key={`rw-${a.output}`} x={VW - 4} y={14 + i * 10} textAnchor="end" fill={color} fontSize="4.5"
            fontFamily="ui-monospace, monospace" fontWeight="800">S{a.output}: {a.name}</text>
        );
      })}

      {/* Tail labels */}
      {tail.map((a, i) => {
        const color = funcColor(a.func);
        return (
          <text key={`tail-${a.output}`} x={VW / 2} y={VH - 6 - i * 9} textAnchor="middle" fill={color} fontSize="4.5"
            fontFamily="ui-monospace, monospace" fontWeight="800">S{a.output}: {a.name}</text>
        );
      })}

      {/* Motor labels */}
      {motor.map((a, i) => {
        const color = funcColor(a.func);
        return (
          <text key={`mot-${a.output}`} x={VW / 2 + 12} y={ox + 6 + i * 8} textAnchor="start"
            fill={color} fontSize="4.5" fontFamily="ui-monospace, monospace" fontWeight="800">
            S{a.output}: {a.name}
          </text>
        );
      })}

      {/* L/R labels */}
      <text x={ox + 10} y={ox + 48} fontSize="6" fill={MC.port}
        fontWeight="900" fontFamily="ui-monospace, monospace">L</text>
      <text x={ox + V - 10} y={ox + 48} textAnchor="end" fontSize="6" fill={MC.starboard}
        fontWeight="900" fontFamily="ui-monospace, monospace">R</text>
    </>
  );
}


// ============================================================
// Sorted servo function options for dropdown
// ============================================================

const SERVO_FUNC_OPTIONS = Object.entries(SERVO_FUNCTIONS)
  .map(([id, name]) => ({ id: Number(id), name }))
  .sort((a, b) => {
    if (a.id === 0) return -1;
    if (b.id === 0) return 1;
    return a.name.localeCompare(b.name);
  });

// ============================================================
// Editable Servo Output Table -- shown for ALL vehicle types
// ============================================================

function ServoTable() {
  const parameters = useParameterStore((s) => s.parameters);
  const dirtyParams = useParameterStore((s) => s.dirtyParams);
  const setParamLocal = useParameterStore((s) => s.setParamLocal);

  const servos: {
    output: number; func: number; min: number; max: number; trim: number; reversed: number;
  }[] = [];
  for (let i = 1; i <= 16; i++) {
    const funcParam = parameters.get(`SERVO${i}_FUNCTION`);
    if (!funcParam) continue;
    const func = dirtyParams.get(`SERVO${i}_FUNCTION`) ?? funcParam.value;
    const min = dirtyParams.get(`SERVO${i}_MIN`) ?? parameters.get(`SERVO${i}_MIN`)?.value ?? 1000;
    const max = dirtyParams.get(`SERVO${i}_MAX`) ?? parameters.get(`SERVO${i}_MAX`)?.value ?? 2000;
    const trim = dirtyParams.get(`SERVO${i}_TRIM`) ?? parameters.get(`SERVO${i}_TRIM`)?.value ?? 1500;
    const reversed = dirtyParams.get(`SERVO${i}_REVERSED`) ?? parameters.get(`SERVO${i}_REVERSED`)?.value ?? 0;
    servos.push({ output: i, func, min, max, trim, reversed });
  }

  if (servos.length === 0) return null;

  const handleChange = (param: string, value: number) => {
    setParamLocal(param, value);
  };

  return (
    <div className="card">
      <div className="card-header">Servo / Motor Output Assignment</div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-left text-subtle">
              <th className="px-4 py-3 text-sm font-bold uppercase tracking-wider text-subtle">Output</th>
              <th className="px-4 py-3 text-sm font-bold uppercase tracking-wider text-subtle">Function</th>
              <th className="px-3 py-2 font-medium text-center">Min</th>
              <th className="px-3 py-2 font-medium text-center">Trim</th>
              <th className="px-3 py-2 font-medium text-center">Max</th>
              <th className="px-3 py-2 font-medium text-center">Rev</th>
            </tr>
          </thead>
          <tbody>
            {servos.map((s) => {
              const isDisabled = s.func === 0;
              const funcDirty = dirtyParams.has(`SERVO${s.output}_FUNCTION`);
              const minDirty = dirtyParams.has(`SERVO${s.output}_MIN`);
              const maxDirty = dirtyParams.has(`SERVO${s.output}_MAX`);
              const trimDirty = dirtyParams.has(`SERVO${s.output}_TRIM`);
              const revDirty = dirtyParams.has(`SERVO${s.output}_REVERSED`);

              return (
                <tr key={s.output}
                  className={`striped-row border-b border-border/30 ${isDisabled ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-2.5 font-mono text-[15px] font-bold text-accent">
                    SERVO{s.output}
                  </td>
                  <td className="px-2 py-1">
                    <div className="relative">
                      {funcDirty && (
                        <span className="absolute -left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-yellow-500" />
                      )}
                      <select value={s.func}
                        onChange={(e) => handleChange(`SERVO${s.output}_FUNCTION`, Number(e.target.value))}
                        className="w-full rounded border border-border bg-surface-0 px-2 py-1 text-base text-foreground">
                        {SERVO_FUNC_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                        {!SERVO_FUNCTIONS[s.func] && (
                          <option value={s.func}>Function {s.func}</option>
                        )}
                      </select>
                    </div>
                  </td>
                  <td className="px-2 py-1">
                    <div className="relative">
                      {minDirty && (
                        <span className="absolute -left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-yellow-500" />
                      )}
                      <input type="number" value={s.min} min={500} max={2500} step={1}
                        onChange={(e) => handleChange(`SERVO${s.output}_MIN`, Number(e.target.value))}
                        className="w-16 rounded border border-border bg-surface-0 px-1.5 py-1 text-center font-mono text-base text-foreground" />
                    </div>
                  </td>
                  <td className="px-2 py-1">
                    <div className="relative">
                      {trimDirty && (
                        <span className="absolute -left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-yellow-500" />
                      )}
                      <input type="number" value={s.trim} min={500} max={2500} step={1}
                        onChange={(e) => handleChange(`SERVO${s.output}_TRIM`, Number(e.target.value))}
                        className="w-16 rounded border border-border bg-surface-0 px-1.5 py-1 text-center font-mono text-base text-foreground" />
                    </div>
                  </td>
                  <td className="px-2 py-1">
                    <div className="relative">
                      {maxDirty && (
                        <span className="absolute -left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-yellow-500" />
                      )}
                      <input type="number" value={s.max} min={500} max={2500} step={1}
                        onChange={(e) => handleChange(`SERVO${s.output}_MAX`, Number(e.target.value))}
                        className="w-16 rounded border border-border bg-surface-0 px-1.5 py-1 text-center font-mono text-base text-foreground" />
                    </div>
                  </td>
                  <td className="px-2 py-1 text-center">
                    <div className="relative inline-block">
                      {revDirty && (
                        <span className="absolute -left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-yellow-500" />
                      )}
                      <button
                        onClick={() => handleChange(`SERVO${s.output}_REVERSED`, s.reversed === 0 ? 1 : 0)}
                        className={`rounded px-2 py-0.5 text-xs font-medium transition ${
                          s.reversed
                            ? 'bg-red-900/40 text-red-400 border border-red-600/40'
                            : 'bg-surface-0 text-subtle border border-border hover:text-foreground'
                        }`}>
                        {s.reversed ? 'REV' : 'NOR'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border px-3 py-2">
        <p className="text-[15px] text-subtle">
          Yellow dots = unsaved changes. Use <strong>Save to FC</strong> in the footer to write.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Motor Test Controls
// ============================================================

interface MotorTestControlsProps {
  enabled: boolean;
  armed: boolean;
  testThrottle: number;
  setTestThrottle: (v: number) => void;
  testDuration: number;
  setTestDuration: (v: number) => void;
  testingMotor: number | null;
  motors?: MotorDef[];
  onTestMotor: (motorNum: number) => void;
  onTestAll?: () => void;
}

function MotorTestControls({
  enabled, armed, testThrottle, setTestThrottle, testDuration, setTestDuration,
  testingMotor, motors, onTestMotor, onTestAll,
}: MotorTestControlsProps) {
  if (armed) {
    return (
      <div className="flex items-center gap-2 rounded bg-danger-muted px-3 py-2 text-base text-danger">
        <AlertTriangle size={14} />
        Vehicle is ARMED -- motor test disabled
      </div>
    );
  }

  return (
    <div className={!enabled ? 'pointer-events-none opacity-40' : ''}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-subtle">
            Test Throttle: {testThrottle}%
          </label>
          <input type="range" min={1} max={30} value={testThrottle}
            onChange={(e) => setTestThrottle(Number(e.target.value))}
            disabled={!enabled} className="mt-1 w-full accent-accent" />
          <div className="flex justify-between text-base text-muted">
            <span>1%</span><span>30% max</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-subtle">
            Duration: {testDuration}s
          </label>
          <input type="range" min={1} max={10} value={testDuration}
            onChange={(e) => setTestDuration(Number(e.target.value))}
            disabled={!enabled} className="mt-1 w-full accent-accent" />
          <div className="flex justify-between text-base text-muted">
            <span>1s</span><span>10s</span>
          </div>
        </div>

        {motors && motors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {motors.map((m) => (
              <button key={m.number} onClick={() => onTestMotor(m.number)}
                disabled={!enabled || testingMotor !== null}
                className={`btn h-9 min-w-[56px] gap-1 text-xs ${
                  testingMotor === m.number ? 'btn-primary animate-pulse' : 'btn-ghost'
                }`}>
                {testingMotor === m.number ? <Cog size={12} className="animate-spin" /> : <Play size={12} />}
                M{m.number}
              </button>
            ))}
          </div>
        )}

        {!motors && (
          <button onClick={() => onTestMotor(1)} disabled={!enabled || testingMotor !== null}
            className={`btn gap-1.5 text-xs ${
              testingMotor === 1 ? 'btn-primary animate-pulse' : 'btn-ghost'
            }`}>
            {testingMotor === 1 ? <Cog size={12} className="animate-spin" /> : <Play size={12} />}
            Test Motor
          </button>
        )}

        {onTestAll && (
          <button onClick={onTestAll} disabled={!enabled || testingMotor !== null}
            className="btn btn-ghost w-full gap-1.5 text-xs">
            <Play size={12} />
            Test All Motors Sequentially
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Motors Page
// ============================================================

export function MotorsPage() {
  const vehicleType = useVehicleStore((s) => s.type);
  const armed = useVehicleStore((s) => s.armed);
  const parameters = useParameterStore((s) => s.parameters);
  const dirtyParams = useParameterStore((s) => s.dirtyParams);

  const [testThrottle, setTestThrottle] = useState(5);
  const [testDuration, setTestDuration] = useState(3);
  const [testingMotor, setTestingMotor] = useState<number | null>(null);
  const [safetyAck, setSafetyAck] = useState(false);
  const [testEnabled, setTestEnabled] = useState(false);

  const isCopter = vehicleType === 'copter';
  const isPlane = vehicleType === 'plane';
  const isQuadPlane = vehicleType === 'quadplane';

  const detectedPreset = useDetectedPreset();

  const frameClass = dirtyParams.get('FRAME_CLASS') ?? parameters.get('FRAME_CLASS')?.value ?? 0;
  const frameType = dirtyParams.get('FRAME_TYPE') ?? parameters.get('FRAME_TYPE')?.value ?? 0;
  const copterLayout = isCopter ? getFrameLayout(frameClass, frameType) : null;

  const qFrameClass = isQuadPlane ? (dirtyParams.get('Q_FRAME_CLASS') ?? parameters.get('Q_FRAME_CLASS')?.value ?? 0) : 0;
  const qFrameType = isQuadPlane ? (dirtyParams.get('Q_FRAME_TYPE') ?? parameters.get('Q_FRAME_TYPE')?.value ?? 0) : 0;
  const qpLayout = isQuadPlane ? getFrameLayout(qFrameClass, qFrameType) : null;

  const motorLayout = isCopter ? copterLayout : qpLayout;

  const servoFunctions = useMemo(() => {
    const map = new Map<number, number>();
    for (let i = 1; i <= 16; i++) {
      const func = dirtyParams.get(`SERVO${i}_FUNCTION`) ?? parameters.get(`SERVO${i}_FUNCTION`)?.value;
      if (func !== undefined) map.set(i, func);
    }
    return map;
  }, [parameters, dirtyParams]);

  const showPlaneDiagram = isPlane || isQuadPlane;
  const controlsEnabled = safetyAck && testEnabled && !armed;

  const stopMotors = useCallback(() => {
    connectionManager.motorTest(0, 0, 0).catch(() => {});
    setTestingMotor(null);
  }, []);

  useEffect(() => {
    return () => { stopMotors(); };
  }, [stopMotors]);

  const handleToggleTest = useCallback(() => {
    if (testEnabled) {
      stopMotors();
      setTestEnabled(false);
    } else {
      setTestEnabled(true);
    }
  }, [testEnabled, stopMotors]);

  const handleMotorTest = useCallback(
    async (motorNum: number) => {
      if (!controlsEnabled) return;
      setTestingMotor(motorNum);
      try {
        await connectionManager.motorTest(motorNum, testThrottle, testDuration);
        setTimeout(() => {
          setTestingMotor((prev) => (prev === motorNum ? null : prev));
        }, testDuration * 1000 + 500);
      } catch (err) {
        console.error('Motor test failed:', err);
        setTestingMotor(null);
      }
    },
    [controlsEnabled, testThrottle, testDuration]
  );

  const handleTestAll = useCallback(async () => {
    if (!controlsEnabled || !motorLayout) return;
    for (const motor of motorLayout.motors) {
      setTestingMotor(motor.number);
      await connectionManager.motorTest(motor.number, testThrottle, testDuration);
      await new Promise((r) => setTimeout(r, testDuration * 1000 + 500));
    }
    setTestingMotor(null);
  }, [controlsEnabled, motorLayout, testThrottle, testDuration]);

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Motors &amp; Servos</h2>
        <p className="text-base text-muted">
          Output assignment, control surface configuration, and motor test.
        </p>
      </div>

      {/* ============ SAFETY BANNER ============ */}
      {!safetyAck ? (
        <div className="flex items-start gap-3 rounded border border-yellow-600/40 bg-yellow-900/20 px-4 py-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-yellow-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-400">
              Remove all propellers before testing motors!
            </p>
            <p className="mt-1 text-xs text-yellow-500/80">
              Motor test will spin motors at the selected throttle. Ensure the vehicle is
              secured and all propellers are removed. Never test motors while armed.
            </p>
            <button onClick={() => setSafetyAck(true)}
              className="mt-2 rounded border border-yellow-600/60 bg-yellow-600/20 px-3 py-1.5 text-xs font-medium text-yellow-400 transition hover:bg-yellow-600/30">
              I have removed all propellers
            </button>
          </div>
        </div>
      ) : (
        <div className={`flex items-center justify-between rounded border px-3 py-2 ${
          testEnabled ? 'border-green-600/30 bg-green-900/15' : 'border-border bg-surface-1'
        }`}>
          <div className="flex items-center gap-2">
            {testEnabled ? (
              <ShieldCheck size={14} className="shrink-0 text-green-500" />
            ) : (
              <Lock size={14} className="shrink-0 text-subtle" />
            )}
            <span className={`text-xs ${testEnabled ? 'text-green-400' : 'text-muted'}`}>
              {testEnabled
                ? 'Motor test active -- keep propellers removed.'
                : 'Motor test disabled. Enable to spin motors.'}
            </span>
          </div>
          <button onClick={handleToggleTest} disabled={armed}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition ${
              testEnabled
                ? 'border border-red-600/50 bg-red-900/30 text-red-400 hover:bg-red-900/50'
                : 'border border-green-600/50 bg-green-900/30 text-green-400 hover:bg-green-900/50'
            }`}>
            {testEnabled ? (
              <><ShieldOff size={12} /> Disable Test</>
            ) : (
              <><ShieldCheck size={12} /> Enable Test</>
            )}
          </button>
        </div>
      )}

      {/* ============ PLANE DIAGRAM -- AirframeIcon + servo labels ============ */}
      {showPlaneDiagram && detectedPreset && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <span>Control Surface Layout</span>
            <a href="https://ardupilot.org/plane/docs/guide-four-channel-plane.html"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-accent hover:underline">
              <ExternalLink size={10} /> Plane Setup Guide
            </a>
          </div>
          <svg viewBox="0 0 160 120" className="mx-auto w-full max-w-[640px]">
            <rect width="160" height="120" rx="6" fill={MC.bg} stroke={MC.bgStroke} strokeWidth="1" />
            {/* FRONT marker */}
            <polygon points="77,6 83,6 80,2" fill={MC.nose} />
            <text x="80" y="11" textAnchor="middle" fill={MC.nose} fontSize="4"
              fontFamily="ui-monospace, monospace" fontWeight="800">FRONT</text>
            {/* AirframeIcon centered */}
            <g transform={`translate(${(160 - V) / 2},${(120 - V) / 2})`}>
              <AirframeIcon preset={detectedPreset} size={V} selected={false} />
            </g>
            {/* Servo labels overlay */}
            <PlaneServoOverlay
              servoFunctions={servoFunctions}
              SERVO_FUNCTIONS={SERVO_FUNCTIONS}
            />
          </svg>
          <p className="mt-2 text-center text-[15px] text-subtle">
            Control surfaces shown based on current SERVOx_FUNCTION assignments.
            Change functions in the table below to update the diagram.
          </p>
        </div>
      )}

      {/* ============ COPTER / QUADPLANE MOTOR DIAGRAM -- AirframeIcon + overlay ============ */}
      {motorLayout && detectedPreset && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <span>{isQuadPlane ? 'VTOL Motor Layout' : 'Motor Layout'}</span>
              <a href="https://ardupilot.org/copter/docs/connect-escs-and-motors.html"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-accent hover:underline">
                <ExternalLink size={10} /> Motor Order Reference
              </a>
            </div>
            <svg viewBox={`0 0 ${V} ${V}`} className="mx-auto w-full max-w-[500px]">
              <rect width={V} height={V} rx="6" fill={MC.bg} stroke={MC.bgStroke} strokeWidth="1" />
              {/* Frame name */}
              <text x={QUAD.cx} y="8" textAnchor="middle" fill={MC.neutral} fontSize="5"
                fontFamily="ui-monospace, monospace" fontWeight="700">{motorLayout.name}</text>
              {/* FRONT marker */}
              <polygon points={`${QUAD.cx - 3},14 ${QUAD.cx + 3},14 ${QUAD.cx},10`} fill={MC.nose} />
              <text x={QUAD.cx} y="19" textAnchor="middle" fill={MC.nose} fontSize="4.5"
                fontFamily="ui-monospace, monospace" fontWeight="800">FRONT</text>
              {/* AirframeIcon as base silhouette (ghost = no motor rings, overlay handles those) */}
              <AirframeIcon preset={detectedPreset} size={V} selected={false} ghost={true} />
              {/* Interactive motor overlay */}
              <CopterMotorOverlay
                motors={motorLayout.motors}
                testingMotor={testingMotor}
                enabled={controlsEnabled && testingMotor === null}
                onMotorClick={handleMotorTest}
              />
            </svg>
            <p className="mt-2 text-center text-[15px] text-subtle">
              Click a motor to test it •{' '}
              <span className="text-blue-400">Blue = CCW</span> •{' '}
              <span className="text-red-400">Red = CW</span>
            </p>
          </div>

          <div className="space-y-4">
            <div className="card">
              <div className="card-header">Frame Configuration</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-subtle">
                    Frame Class
                  </label>
                  <p className="mt-1 font-mono text-base text-foreground">
                    {FRAME_CLASSES[isCopter ? frameClass : qFrameClass] || `Class ${isCopter ? frameClass : qFrameClass}`}
                  </p>
                  <p className="text-[15px] text-subtle">
                    {isCopter ? 'FRAME_CLASS' : 'Q_FRAME_CLASS'} = {isCopter ? frameClass : qFrameClass}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-subtle">
                    Frame Type
                  </label>
                  <p className="mt-1 font-mono text-base text-foreground">
                    {FRAME_TYPES[isCopter ? frameType : qFrameType] || `Type ${isCopter ? frameType : qFrameType}`}
                  </p>
                  <p className="text-[15px] text-subtle">
                    {isCopter ? 'FRAME_TYPE' : 'Q_FRAME_TYPE'} = {isCopter ? frameType : qFrameType}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">Motor Test</div>
              <MotorTestControls
                enabled={controlsEnabled} armed={armed}
                testThrottle={testThrottle} setTestThrottle={setTestThrottle}
                testDuration={testDuration} setTestDuration={setTestDuration}
                testingMotor={testingMotor} motors={motorLayout.motors}
                onTestMotor={handleMotorTest} onTestAll={handleTestAll}
              />
            </div>

            <div className="rounded border border-border bg-surface-1 px-4 py-3">
              <div className="flex items-center gap-4 text-[13px]">
                <div className="flex items-center gap-1.5">
                  <RotateCcw size={12} className="text-blue-400" />
                  <span className="text-muted">CCW</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCw size={12} className="text-red-400" />
                  <span className="text-muted">CW</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copter with unknown frame */}
      {isCopter && !copterLayout && (
        <div className="card flex flex-col items-center justify-center py-12 text-subtle">
          <Cog size={32} className="mb-3 opacity-50" />
          <p className="text-sm">
            No diagram for FRAME_CLASS={frameClass} FRAME_TYPE={frameType}
          </p>
          <p className="mt-1 text-xs">Set FRAME_CLASS and FRAME_TYPE in Configuration.</p>
        </div>
      )}

      {/* ============ SERVO TABLE -- ALL VEHICLE TYPES ============ */}
      <ServoTable />

      {/* ============ MOTOR TEST for planes without VTOL layout ============ */}
      {(isPlane || (isQuadPlane && !qpLayout)) && (
        <div className="card">
          <div className="card-header">Motor Test</div>
          <MotorTestControls
            enabled={controlsEnabled} armed={armed}
            testThrottle={testThrottle} setTestThrottle={setTestThrottle}
            testDuration={testDuration} setTestDuration={setTestDuration}
            testingMotor={testingMotor} onTestMotor={handleMotorTest}
          />
        </div>
      )}
    </div>
  );
}
