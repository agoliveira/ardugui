/**
 * MotorEscStep.tsx -- Wizard step for ESC protocol selection and motor
 * spin direction verification.
 *
 * Two sub-sections:
 *   1. ESC protocol cards (PWM / DShot)
 *   2. Sequential motor spin test with frame diagram
 *
 * Motor test logic is provided by the shared useMotorTest hook.
 * The diagram and wizard-specific param staging remain here.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Check, Zap } from 'lucide-react';
import { useWizardStore } from '../wizardStore';
import { useParameterStore } from '@/store/parameterStore';
import { AIRFRAME_PRESETS, type AirframePreset } from '@/models/airframeTemplates';
import { getFrameLayout, type FrameLayout } from '@/models/frameDefinitions';
import { AirframeIcon } from '@/components/AirframeIcons';
import {
  ESC_PROTOCOLS,
  type EscProtocol,
  type MotorTestInfo,
  type MotorResult,
  getPositionLabel,
} from '@/models/motorTestDefs';
import {
  useMotorTest,
  MotorTestGates,
  MotorTestCard,
  MotorTestFooter,
} from '@/components/MotorTestPanel';

interface MotorEscStepProps {
  onCanAdvanceChange: (canAdvance: boolean) => void;
}

export function MotorEscStep({ onCanAdvanceChange }: MotorEscStepProps) {
  const vehicleType = useWizardStore((s) => s.vehicleType);
  const stagedParams = useWizardStore((s) => s.stagedParams);
  const stageParams = useWizardStore((s) => s.stageParams);
  const markComplete = useWizardStore((s) => s.markComplete);
  const parameters = useParameterStore((s) => s.parameters);
  const dirtyParams = useParameterStore((s) => s.dirtyParams);

  const [selectedProtocol, setSelectedProtocol] = useState<EscProtocol | null>(() => {
    const staged = stagedParams.MOT_PWM_TYPE ?? stagedParams.Q_M_PWM_TYPE;
    if (staged !== undefined) {
      return ESC_PROTOCOLS.find((p) => p.pwmType === staged) ?? null;
    }
    return null;
  });

  const resolveParam = useCallback((name: string): number => {
    if (stagedParams[name] !== undefined) return stagedParams[name];
    const dirty = dirtyParams.get(name);
    if (dirty !== undefined) return dirty;
    return parameters.get(name)?.value ?? 0;
  }, [stagedParams, dirtyParams, parameters]);

  // ── Preset / layout detection ─────────────────────────────────────

  const selectedPreset = useMemo((): AirframePreset | null => {
    for (const preset of AIRFRAME_PRESETS) {
      const ap = preset.additionalParams;
      if (!ap) continue;
      if (Object.entries(ap).every(([k, v]) => resolveParam(k) === v)) return preset;
    }
    for (const preset of AIRFRAME_PRESETS) {
      if (preset.category !== 'plane') continue;
      const outputs = new Map<number, number>();
      if (preset.planeTemplate) {
        for (const s of preset.planeTemplate.surfaces) outputs.set(s.defaultOutput, s.function);
      }
      for (const m of preset.motorTemplate.forwardMotors) outputs.set(m.defaultOutput, m.function);
      if (outputs.size === 0) continue;
      let matches = 0;
      for (const [o, f] of outputs) {
        if (resolveParam(`SERVO${o}_FUNCTION`) === f) matches++;
      }
      if (matches === outputs.size) return preset;
    }
    return null;
  }, [resolveParam]);

  const motorLayout = useMemo((): FrameLayout | null => {
    if (vehicleType === 'copter') {
      return getFrameLayout(resolveParam('FRAME_CLASS'), resolveParam('FRAME_TYPE'));
    }
    if (vehicleType === 'quadplane') {
      return getFrameLayout(resolveParam('Q_FRAME_CLASS'), resolveParam('Q_FRAME_TYPE'));
    }
    return null;
  }, [vehicleType, resolveParam]);

  // ── Motors to test ────────────────────────────────────────────────

  const motorsToTest = useMemo((): MotorTestInfo[] => {
    const findServoForFunction = (func: number): number => {
      for (let i = 1; i <= 16; i++) {
        if (stagedParams[`SERVO${i}_FUNCTION`] === func) return i;
      }
      for (let i = 1; i <= 16; i++) {
        if (parameters.get(`SERVO${i}_FUNCTION`)?.value === func) return i;
      }
      return 0;
    };

    if (motorLayout) {
      const sorted = [...motorLayout.motors].sort((a, b) => a.number - b.number);
      const templateMotors = selectedPreset
        ? [...selectedPreset.motorTemplate.vtolMotors, ...selectedPreset.motorTemplate.forwardMotors]
            .sort((a, b) => a.function - b.function)
        : null;

      return sorted.map((motor, idx) => {
        const motorFunc = templateMotors?.[idx]?.function ?? 33 + idx;
        return {
          displayNum: motor.number,
          testInstance: motor.number,
          servoOutput: findServoForFunction(motorFunc) || motor.number,
          rotation: motor.rotation,
          positionLabel: getPositionLabel(motor.x, motor.y),
        };
      });
    }

    if (vehicleType === 'plane' && selectedPreset) {
      return selectedPreset.motorTemplate.forwardMotors.map((m, i) => ({
        displayNum: i + 1,
        testInstance: i + 1,
        servoOutput: findServoForFunction(m.function) || m.defaultOutput,
        rotation: null,
        positionLabel: selectedPreset.motorTemplate.forwardMotors.length === 1
          ? 'Forward' : `Forward ${i + 1}`,
      }));
    }

    // Import fallback: derive from staged SERVO_FUNCTION
    const motorFuncs = new Set([33, 34, 35, 36, 37, 38, 39, 40, 70, 73, 74]);
    const importMotors: { displayNum: number; testInstance: number; servoOutput: number }[] = [];
    for (let i = 1; i <= 16; i++) {
      const func = stagedParams[`SERVO${i}_FUNCTION`];
      if (func !== undefined && motorFuncs.has(func)) {
        const motorNum = func >= 33 && func <= 40 ? func - 32 : importMotors.length + 1;
        importMotors.push({ displayNum: motorNum, testInstance: motorNum, servoOutput: i });
      }
    }
    importMotors.sort((a, b) => a.displayNum - b.displayNum);
    return importMotors.map((m) => ({
      ...m, rotation: null as 'CW' | 'CCW' | null, positionLabel: `Motor ${m.displayNum}`,
    }));
  }, [motorLayout, vehicleType, selectedPreset, stagedParams, parameters]);

  const isPlaneOnly = vehicleType === 'plane';
  const testThrottle = selectedProtocol?.testThrottle ?? 10;

  // ── Shared motor test hook ────────────────────────────────────────

  const mt = useMotorTest(motorsToTest, testThrottle);

  const handleSelectProtocol = useCallback((protocol: EscProtocol) => {
    setSelectedProtocol(protocol);
    mt.resetResults();
    const pwmParam = vehicleType === 'quadplane' ? 'Q_M_PWM_TYPE' : 'MOT_PWM_TYPE';
    const params: Record<string, number> = { [pwmParam]: protocol.pwmType };
    if (protocol.blhAuto) params.SERVO_BLH_AUTO = 1;
    stageParams(params);
  }, [stageParams, vehicleType, mt]);

  // ── Advance gate ──────────────────────────────────────────────────

  useEffect(() => {
    if (!selectedProtocol) { onCanAdvanceChange(false); return; }
    if (motorsToTest.length === 0) { onCanAdvanceChange(true); return; }
    const allTested = motorsToTest.every((m) => mt.motorResults[m.displayNum] !== undefined);
    onCanAdvanceChange(allTested);
  }, [selectedProtocol, motorsToTest, mt.motorResults, onCanAdvanceChange]);

  useEffect(() => {
    if (mt.allConfirmed) markComplete('motors_esc');
  }, [mt.allConfirmed, markComplete]);

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Motors & ESC Protocol</h2>
        <p className="mt-1 text-sm text-muted">
          Select your ESC protocol, then verify each motor spins in the correct direction.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted">ESC Protocol</h3>
        <div className="flex flex-wrap gap-2">
          {ESC_PROTOCOLS.map((proto) => {
            const isSelected = selectedProtocol?.id === proto.id;
            return (
              <button
                key={proto.id}
                onClick={() => handleSelectProtocol(proto)}
                title={proto.description}
                className={`flex items-center gap-1.5 rounded-md border-2 px-3 py-2 text-sm font-semibold transition ${
                  isSelected
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border bg-surface-0 text-muted hover:border-accent/50 hover:text-foreground'
                }`}
              >
                <Zap size={13} />
                {proto.label}
                {isSelected && <Check size={12} className="ml-1" />}
              </button>
            );
          })}
        </div>
        {selectedProtocol && <p className="text-xs text-muted">{selectedProtocol.description}</p>}
      </div>

      {selectedProtocol && motorsToTest.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
            Motor Direction Test
          </h3>

          <MotorTestGates mt={mt} testThrottle={testThrottle} />

          {mt.canTest && (
            <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
              <div className="flex items-center justify-center">
                {motorLayout && selectedPreset ? (
                  <MotorDiagram
                    preset={selectedPreset}
                    layout={motorLayout}
                    spunMotors={mt.spunMotors}
                    testingMotor={mt.testingMotor}
                    motorResults={mt.motorResults}
                  />
                ) : isPlaneOnly && selectedPreset ? (
                  <div className="flex w-full flex-col items-center gap-3 rounded border border-border bg-surface-0 py-8">
                    <AirframeIcon preset={selectedPreset} size={250} selected={false} />
                    <p className="text-xs text-muted">Forward motor test</p>
                  </div>
                ) : (
                  <p className="py-12 text-sm text-subtle">No frame diagram available</p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted">
                  Spin each motor, then confirm the direction is correct.
                  Motor numbers follow ArduPilot frame convention.
                </p>
                {motorsToTest.map((info) => (
                  <MotorTestCard key={info.displayNum} info={info} mt={mt} />
                ))}
                <MotorTestFooter mt={mt} motors={motorsToTest} />
              </div>
            </div>
          )}
        </div>
      )}

      {selectedProtocol && motorsToTest.length === 0 && (
        <div className="rounded border border-border bg-surface-0 px-5 py-4 text-center">
          <p className="text-sm text-muted">
            No motors to test for this airframe. Click Next to continue.
          </p>
        </div>
      )}
    </div>
  );
}


/* ------------------------------------------------------------------ */
/*  Motor diagram -- matches standalone MotorsPage visual style        */
/* ------------------------------------------------------------------ */

const MC = {
  ccw: '#38bdf8',
  cw: '#fb7185',
  nose: '#4ade80',
  bg: '#13120f',
  bgStroke: '#2a2622',
  testing: '#ffcc66',
  confirmed: '#22c55e',
};

function MotorDiagram({
  preset, layout, spunMotors: _spunMotors, testingMotor, motorResults,
}: {
  preset: AirframePreset; layout: FrameLayout;
  spunMotors: Set<number>; testingMotor: number | null;
  motorResults: Record<number, MotorResult>;
}) {
  const V = 300;
  const pad = 60;
  const total = V + pad * 2;
  const offset = pad;
  const centerX = total / 2;
  const centerY = total / 2;

  const R = layout.motors.length <= 4 ? 28
    : layout.motors.length <= 6 ? 24 : 20;

  const armScale = V * 0.40;
  const mapX = (nx: number) => offset + V / 2 + nx * armScale;
  const mapY = (ny: number) => offset + V / 2 - ny * armScale;

  // Detect coaxial pairs
  const posKey = (m: typeof layout.motors[0]) => `${m.x.toFixed(3)},${m.y.toFixed(3)}`;
  const posGroups = new Map<string, number[]>();
  layout.motors.forEach((m, i) => {
    const k = posKey(m);
    if (!posGroups.has(k)) posGroups.set(k, []);
    posGroups.get(k)!.push(i);
  });

  const getMotorPos = (motor: typeof layout.motors[0], idx: number) => {
    let cx = mapX(motor.x);
    let cy = mapY(motor.y);
    const group = posGroups.get(posKey(motor))!;
    const isCoaxial = group.length >= 2;
    const isBottom = isCoaxial && idx === group[1];
    if (isBottom) {
      const dx = cx - centerX;
      const dy = cy - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      cx += (dx / dist) * (R * 1.15);
      cy += (dy / dist) * (R * 1.15);
    }
    return { cx, cy, isCoaxial, isBottom };
  };

  return (
    <svg viewBox={`0 0 ${total} ${total}`} className="w-full">
      <rect width={total} height={total} rx={6} fill={MC.bg} stroke={MC.bgStroke} strokeWidth={1} />

      {/* Front marker */}
      <polygon
        points={`${centerX - 5},${offset - 6} ${centerX + 5},${offset - 6} ${centerX},${offset - 12}`}
        fill={MC.nose}
      />
      <text x={centerX} y={offset - 16} textAnchor="middle" fill={MC.nose} fontSize={9}
        fontFamily="ui-monospace, monospace" fontWeight="800">FRONT</text>

      {/* Airframe silhouette */}
      <g transform={`translate(${offset}, ${offset})`}>
        <AirframeIcon preset={preset} size={V} selected={false} ghost={true} />
      </g>

      {/* Motors */}
      {layout.motors.map((motor, idx) => {
        const { cx, cy, isCoaxial, isBottom } = getMotorPos(motor, idx);
        const isCW = motor.rotation === 'CW';
        const baseColor = isCW ? MC.cw : MC.ccw;
        const isTesting = testingMotor === motor.number;
        const result = motorResults[motor.number];

        // Ring color: testing=amber, confirmed=green, wrong=red, default=rotation color
        const ringColor = isTesting ? MC.testing
          : result === 'correct' ? MC.confirmed
          : result === 'wrong' ? '#ef4444'
          : baseColor;
        const ringWidth = isTesting || result ? 3 : 2;

        // Rotation arrow arc (same approach as standalone CopterMotorOverlay)
        const arcR = R - 4;
        const startAngle = isCW ? -100 : 100;
        const endAngle = isCW ? 100 : -100;
        const sa = (startAngle * Math.PI) / 180;
        const ea = (endAngle * Math.PI) / 180;
        const sx = cx + arcR * Math.cos(sa);
        const sy = cy + arcR * Math.sin(sa);
        const ex = cx + arcR * Math.cos(ea);
        const ey = cy + arcR * Math.sin(ea);
        const sweepFlag = isCW ? 1 : 0;

        // Arrowhead
        const tipAngle = ea + (isCW ? 0.3 : -0.3);
        const baseAngle1 = ea - (isCW ? 0.15 : -0.15);
        const baseAngle2 = ea - (isCW ? 0.5 : -0.5);
        const tipX = cx + (arcR + 2) * Math.cos(tipAngle);
        const tipY = cy + (arcR + 2) * Math.sin(tipAngle);
        const b1X = cx + (arcR - 1.5) * Math.cos(baseAngle1);
        const b1Y = cy + (arcR - 1.5) * Math.sin(baseAngle1);
        const b2X = cx + (arcR + 1.5) * Math.cos(baseAngle2);
        const b2Y = cy + (arcR + 1.5) * Math.sin(baseAngle2);

        return (
          <g key={motor.number}>
            {/* Mask AirframeIcon ring */}
            {isCoaxial && <circle cx={cx} cy={cy} r={R + 4} fill={MC.bg} />}
            <circle cx={cx} cy={cy} r={R + 2} fill={MC.bg} />

            {/* Motor ring -- always colored by rotation direction */}
            <circle cx={cx} cy={cy} r={R} fill={MC.bg} stroke={ringColor} strokeWidth={ringWidth}
              strokeDasharray={isBottom && !isTesting && !result ? '5 3' : 'none'} />

            {/* Rotation arc -- always visible */}
            <path d={`M ${sx},${sy} A ${arcR},${arcR} 0 1,${sweepFlag} ${ex},${ey}`}
              fill="none" stroke={baseColor} strokeWidth={1.2} opacity={0.5} />
            <polygon points={`${tipX},${tipY} ${b1X},${b1Y} ${b2X},${b2Y}`}
              fill={baseColor} opacity={0.5} />

            {/* Number disc */}
            <circle cx={cx} cy={cy} r={R * 0.4}
              fill={isTesting ? MC.testing : result === 'correct' ? MC.confirmed : baseColor} />
            <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
              fill={isTesting ? '#000' : '#f1f5f9'} fontSize={R * 0.45}
              fontWeight="900" fontFamily="ui-monospace, monospace">
              {motor.number}
            </text>

            {/* CW/CCW label below */}
            <text x={cx} y={cy + R + 8} textAnchor="middle" fill={baseColor} fontSize={9}
              fontFamily="ui-monospace, monospace" fontWeight="700">
              {motor.rotation}
            </text>

            {/* Bottom coaxial label */}
            {isBottom && (
              <text x={cx} y={cy - R - 5} textAnchor="middle" fill="#666" fontSize={7}
                fontFamily="ui-monospace, monospace">BOTTOM</text>
            )}

            {/* Testing pulse animation */}
            {isTesting && (
              <circle cx={cx} cy={cy} r={R + 4}
                fill="none" stroke={MC.testing} strokeWidth={1.5} opacity={0.5}>
                <animate attributeName="r" values={`${R};${R + 10};${R}`}
                  dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0.1;0.6"
                  dur="1s" repeatCount="indefinite" />
              </circle>
            )}

            {/* Confirmed checkmark / wrong X */}
            {result === 'correct' && (
              <text x={cx + R * 0.55} y={cy - R * 0.55}
                fill={MC.confirmed} fontSize={14} fontWeight="bold">✓</text>
            )}
            {result === 'wrong' && (
              <text x={cx + R * 0.55} y={cy - R * 0.55}
                fill="#ef4444" fontSize={14} fontWeight="bold">✗</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
