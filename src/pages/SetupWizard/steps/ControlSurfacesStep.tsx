/**
 * ControlSurfacesStep.tsx -- Wizard step for plane control surface setup.
 *
 * 3D visualization of surfaces with live servo output feedback.
 * Steps through views (wings, tail, etc.) based on detected frame type.
 * Each view: 3D model, instruction, verify/reverse buttons, trim/travel.
 */

import { useEffect, useCallback, useState, useMemo } from 'react';
import {
  Check,
  AlertTriangle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useWizardStore } from '../wizardStore';
import { useParameterStore, getEffectiveValue } from '@/store/parameterStore';
import { useTelemetryStore } from '@/store/telemetryStore';
import {
  ControlSurface3DViewer,
  VIEW_DEFS,
  type SurfaceViewType,
  type DeflectionParams,
} from '@/components/ControlSurface3DViewer';

/* ------------------------------------------------------------------ */
/*  Servo function IDs                                                 */
/* ------------------------------------------------------------------ */

const FUNC = {
  AILERON: 77,
  ELEVATOR: 78,
  RUDDER: 79,
  FLAPERON_L: 80,
  FLAPERON_R: 81,
  FLAP: 84,
};

/* ------------------------------------------------------------------ */
/*  Detect surfaces from servo assignments                             */
/* ------------------------------------------------------------------ */

interface DetectedSurface {
  servoNum: number;
  functionId: number;
  label: string;
  reversed: boolean;
  min: number;
  max: number;
  trim: number;
}

function useDetectedSurfaces() {
  const parameters = useParameterStore((s) => s.parameters);
  const stagedParams = useWizardStore((s) => s.stagedParams);
  const paramState = useParameterStore.getState();

  return useMemo(() => {
    const surfaceFunctions = new Set([
      FUNC.AILERON, FUNC.ELEVATOR, FUNC.RUDDER,
      FUNC.FLAPERON_L, FUNC.FLAPERON_R, FUNC.FLAP,
    ]);

    const labels: Record<number, string> = {
      [FUNC.AILERON]: 'Aileron',
      [FUNC.ELEVATOR]: 'Elevator',
      [FUNC.RUDDER]: 'Rudder',
      [FUNC.FLAPERON_L]: 'Flaperon L',
      [FUNC.FLAPERON_R]: 'Flaperon R',
      [FUNC.FLAP]: 'Flap',
    };

    const surfaces: DetectedSurface[] = [];
    for (let i = 1; i <= 16; i++) {
      const funcVal = stagedParams[`SERVO${i}_FUNCTION`]
        ?? getEffectiveValue(paramState, `SERVO${i}_FUNCTION`) ?? 0;

      if (surfaceFunctions.has(funcVal)) {
        surfaces.push({
          servoNum: i,
          functionId: funcVal,
          label: labels[funcVal] ?? `Function ${funcVal}`,
          reversed: (stagedParams[`SERVO${i}_REVERSED`]
            ?? getEffectiveValue(paramState, `SERVO${i}_REVERSED`) ?? 0) === 1,
          min: stagedParams[`SERVO${i}_MIN`]
            ?? getEffectiveValue(paramState, `SERVO${i}_MIN`) ?? 1000,
          max: stagedParams[`SERVO${i}_MAX`]
            ?? getEffectiveValue(paramState, `SERVO${i}_MAX`) ?? 2000,
          trim: stagedParams[`SERVO${i}_TRIM`]
            ?? getEffectiveValue(paramState, `SERVO${i}_TRIM`) ?? 1500,
        });
      }
    }
    return surfaces;
  }, [parameters, stagedParams, paramState]);
}

/** Determine which 3D views to show based on detected surfaces. */
function useViewList(surfaces: DetectedSurface[]): SurfaceViewType[] {
  return useMemo(() => {
    const hasAileron = surfaces.some(s => s.functionId === FUNC.AILERON);
    const hasElevator = surfaces.some(s => s.functionId === FUNC.ELEVATOR);
    const hasRudder = surfaces.some(s => s.functionId === FUNC.RUDDER);
    const hasFlaperon = surfaces.some(s =>
      s.functionId === FUNC.FLAPERON_L || s.functionId === FUNC.FLAPERON_R);

    const isFlyingWing = (hasAileron || hasFlaperon) && !hasElevator && !hasRudder;
    const isVTail = hasElevator && !hasRudder;

    const views: SurfaceViewType[] = [];

    views.push(isFlyingWing ? 'flyingwing' : 'wings');

    if (!isFlyingWing) {
      if (isVTail) {
        views.push('vtail');
      } else {
        if (hasElevator) views.push('elevator');
        if (hasRudder) views.push('rudder');
      }
    }

    return views;
  }, [surfaces]);
}

/* ------------------------------------------------------------------ */
/*  Servo output to degrees conversion                                 */
/* ------------------------------------------------------------------ */

function servoToDeg(output: number, min: number, max: number, trim: number): number {
  if (output === 0) return 0;
  const range = output > trim ? max - trim : trim - min;
  if (range <= 0) return 0;
  return ((output - trim) / range) * 30;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface ControlSurfacesStepProps {
  onCanAdvanceChange: (canAdvance: boolean) => void;
}

export function ControlSurfacesStep({ onCanAdvanceChange }: ControlSurfacesStepProps) {
  const markComplete = useWizardStore((s) => s.markComplete);
  const stageParams = useWizardStore((s) => s.stageParams);
  const servoOutputs = useTelemetryStore((s) => s.servoOutputs);

  const surfaces = useDetectedSurfaces();
  const viewList = useViewList(surfaces);
  const [viewIdx, setViewIdx] = useState(0);
  const [verified, setVerified] = useState<Set<string>>(new Set());
  const [expandedServo, setExpandedServo] = useState<number | null>(null);

  const hasFlap = surfaces.some(s => s.functionId === FUNC.FLAP);
  const currentView = viewList[viewIdx] ?? 'wings';
  const viewDef = VIEW_DEFS[currentView];

  // ── Build deflections from live servo outputs ──────────────────

  const deflections = useMemo((): DeflectionParams => {
    const findByFunc = (funcId: number, nth = 0) => {
      let count = 0;
      for (const s of surfaces) {
        if (s.functionId === funcId) {
          if (count === nth) {
            const output = servoOutputs[s.servoNum - 1] ?? 0;
            return servoToDeg(output, s.min, s.max, s.trim);
          }
          count++;
        }
      }
      return 0;
    };

    const ailerons = surfaces.filter(s => s.functionId === FUNC.AILERON);
    const leftAil = ailerons.length > 0
      ? servoToDeg(servoOutputs[ailerons[0].servoNum - 1] ?? 0, ailerons[0].min, ailerons[0].max, ailerons[0].trim)
      : 0;
    const rightAil = ailerons.length > 1
      ? servoToDeg(servoOutputs[ailerons[1].servoNum - 1] ?? 0, ailerons[1].min, ailerons[1].max, ailerons[1].trim)
      : 0;

    const flaps = surfaces.filter(s => s.functionId === FUNC.FLAP);
    const leftFlap = flaps.length > 0
      ? servoToDeg(servoOutputs[flaps[0].servoNum - 1] ?? 0, flaps[0].min, flaps[0].max, flaps[0].trim)
      : 0;
    const rightFlap = flaps.length > 1
      ? servoToDeg(servoOutputs[flaps[1].servoNum - 1] ?? 0, flaps[1].min, flaps[1].max, flaps[1].trim)
      : leftFlap;

    return {
      leftAilDeg: leftAil,
      rightAilDeg: rightAil,
      leftFlapDeg: leftFlap,
      rightFlapDeg: rightFlap,
      elevDeg: findByFunc(FUNC.ELEVATOR),
      rudDeg: findByFunc(FUNC.RUDDER),
      leftTiltDeg: findByFunc(FUNC.ELEVATOR, 0),
      rightTiltDeg: findByFunc(FUNC.ELEVATOR, 1),
    };
  }, [surfaces, servoOutputs]);

  // ── Handlers ───────────────────────────────────────────────────

  const toggleReverse = useCallback((servoNum: number, currentReversed: boolean) => {
    stageParams({ [`SERVO${servoNum}_REVERSED`]: currentReversed ? 0 : 1 });
  }, [stageParams]);

  const updateParam = useCallback((param: string, value: number) => {
    stageParams({ [param]: value });
  }, [stageParams]);

  const handleVerify = useCallback(() => {
    setVerified(prev => new Set([...prev, currentView]));
  }, [currentView]);

  // ── Advance gate ───────────────────────────────────────────────

  useEffect(() => {
    onCanAdvanceChange(surfaces.length > 0);
    if (surfaces.length > 0) markComplete('control_surfaces');
  }, [surfaces.length, onCanAdvanceChange, markComplete]);

  // ── Surfaces relevant to current view ──────────────────────────

  const viewSurfaces = useMemo(() => {
    switch (currentView) {
      case 'wings':
      case 'flyingwing':
        return surfaces.filter(s =>
          s.functionId === FUNC.AILERON || s.functionId === FUNC.FLAP ||
          s.functionId === FUNC.FLAPERON_L || s.functionId === FUNC.FLAPERON_R);
      case 'elevator':
        return surfaces.filter(s => s.functionId === FUNC.ELEVATOR);
      case 'rudder':
        return surfaces.filter(s => s.functionId === FUNC.RUDDER);
      case 'vtail':
      case 'atail':
        return surfaces.filter(s =>
          s.functionId === FUNC.ELEVATOR || s.functionId === FUNC.RUDDER);
      default:
        return [];
    }
  }, [currentView, surfaces]);

  // ── No surfaces ────────────────────────────────────────────────

  if (surfaces.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <div>
          <h2 className="text-xl font-bold text-foreground">Control Surfaces</h2>
          <p className="mt-1 text-sm text-muted">
            No control surface servos detected. Verify your frame selection
            in the Frame step.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded border border-warning/30 bg-warning/5 px-4 py-3">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warning" />
          <p className="text-sm text-warning/90">
            Control surfaces are assigned via SERVOx_FUNCTION parameters from the
            airframe template. Go back to the Frame step to verify your selection.
          </p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">

      <div>
        <h2 className="text-xl font-bold text-foreground">Control Surfaces</h2>
        <p className="mt-1 text-sm text-muted">
          Verify each surface moves in the correct direction.
          Move your transmitter sticks and watch the 3D model.
        </p>
      </div>

      {/* View tabs */}
      {viewList.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {viewList.map((vt, i) => {
            const def = VIEW_DEFS[vt];
            return (
              <button
                key={vt}
                onClick={() => setViewIdx(i)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  i === viewIdx
                    ? 'bg-accent text-black'
                    : verified.has(vt)
                      ? 'bg-success/15 text-success border border-success/30'
                      : 'bg-surface-1 text-subtle hover:bg-surface-2'
                }`}
              >
                {verified.has(vt) ? '✓ ' : ''}{def.label}
              </button>
            );
          })}
        </div>
      )}

      {/* 3D Viewer */}
      <div className="rounded-lg border-2 border-border bg-surface-0 overflow-hidden">
        <ControlSurface3DViewer
          viewType={currentView}
          deflections={deflections}
          hasFlap={hasFlap}
        />
      </div>

      {/* Instruction */}
      <div className="rounded-lg border border-accent/30 bg-accent/5 px-5 py-3">
        <p className="text-sm font-bold text-accent">{viewDef.instruction}</p>
        <p className="text-xs text-muted mt-1">{viewDef.expected}</p>
      </div>

      {/* Verify / Reverse buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {viewSurfaces.map(s => (
          <button
            key={s.servoNum}
            onClick={() => toggleReverse(s.servoNum, s.reversed)}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              s.reversed
                ? 'bg-warning/15 text-warning border border-warning/30'
                : 'bg-surface-1 text-muted hover:bg-surface-2'
            }`}
          >
            <RotateCcw size={12} className="inline mr-1.5" />
            Reverse {s.label} (S{s.servoNum})
          </button>
        ))}

        <div className="flex-1" />

        {verified.has(currentView) ? (
          <span className="text-sm text-success font-semibold flex items-center gap-1.5">
            <Check size={14} /> Verified
          </span>
        ) : (
          <button
            onClick={handleVerify}
            className="rounded-lg bg-success/15 border border-success/40 px-4 py-2 text-sm font-semibold text-success hover:bg-success/25 transition-colors"
          >
            <Check size={14} className="inline mr-1.5" />
            Direction Correct
          </button>
        )}
      </div>

      {/* Servo detail panels */}
      <div className="space-y-2">
        {viewSurfaces.map(surface => {
          const isExpanded = expandedServo === surface.servoNum;
          const servoOutput = servoOutputs[surface.servoNum - 1] ?? 0;
          const travel = surface.max - surface.min;
          const servoPct = travel > 0
            ? Math.round(((servoOutput - surface.min) / travel) * 100) : 50;

          return (
            <div key={surface.servoNum} className="rounded-lg border border-border bg-surface-0 overflow-hidden">
              <div
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-surface-1 transition-colors"
                onClick={() => setExpandedServo(isExpanded ? null : surface.servoNum)}
              >
                <span className="text-sm font-bold text-foreground">{surface.label}</span>
                <span className="text-xs text-subtle">SERVO{surface.servoNum}</span>
                {surface.reversed && (
                  <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[10px] font-bold text-warning">
                    REVERSED
                  </span>
                )}

                <div className="w-24 shrink-0 ml-auto mr-2">
                  <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-100"
                      style={{ width: `${Math.max(0, Math.min(100, servoPct))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] text-subtle mt-0.5 tabular-nums">
                    <span>{surface.min}</span>
                    <span>{servoOutput || '--'}</span>
                    <span>{surface.max}</span>
                  </div>
                </div>

                {isExpanded
                  ? <ChevronUp size={14} className="text-muted shrink-0" />
                  : <ChevronDown size={14} className="text-muted shrink-0" />}
              </div>

              {isExpanded && (
                <div className="border-t border-border px-4 py-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-subtle uppercase font-bold">Min PWM</label>
                      <input
                        type="number" value={surface.min}
                        onChange={(e) => updateParam(`SERVO${surface.servoNum}_MIN`, Number(e.target.value))}
                        className="input-field w-full text-sm tabular-nums mt-1"
                        min={500} max={2500} step={10}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-subtle uppercase font-bold">Trim</label>
                      <input
                        type="number" value={surface.trim}
                        onChange={(e) => updateParam(`SERVO${surface.servoNum}_TRIM`, Number(e.target.value))}
                        className="input-field w-full text-sm tabular-nums mt-1"
                        min={500} max={2500} step={1}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-subtle uppercase font-bold">Max PWM</label>
                      <input
                        type="number" value={surface.max}
                        onChange={(e) => updateParam(`SERVO${surface.servoNum}_MAX`, Number(e.target.value))}
                        className="input-field w-full text-sm tabular-nums mt-1"
                        min={500} max={2500} step={10}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Safety warning */}
      <div className="flex items-start gap-2 rounded border border-warning/30 bg-warning/5 px-4 py-2.5">
        <AlertTriangle size={13} className="mt-0.5 shrink-0 text-warning" />
        <p className="text-xs text-warning/90">
          Wrong servo direction will cause immediate loss of control. Verify EVERY
          surface before your first flight.
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-[10px] text-subtle">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-success" /> UP / Right
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-danger" /> DOWN / Left
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-accent" /> Neutral
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded" style={{ background: '#666' }} /> Hinge
        </span>
      </div>
    </div>
  );
}
