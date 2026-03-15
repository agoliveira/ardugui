/**
 * ControlSurfacesPage.tsx -- Standalone control surface configuration.
 *
 * Shows 3D visualizations of detected control surfaces with live servo
 * feedback. Allows reversing direction and adjusting travel limits.
 * Plane and QuadPlane only.
 */

import { useCallback, useMemo } from 'react';
import {
  Info,
  RotateCcw,
} from 'lucide-react';
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

const FUNC_LABELS: Record<number, string> = {
  [FUNC.AILERON]: 'Aileron',
  [FUNC.ELEVATOR]: 'Elevator',
  [FUNC.RUDDER]: 'Rudder',
  [FUNC.FLAPERON_L]: 'Flaperon L',
  [FUNC.FLAPERON_R]: 'Flaperon R',
  [FUNC.FLAP]: 'Flap',
};

interface DetectedSurface {
  servoNum: number;
  functionId: number;
  label: string;
  reversed: boolean;
  min: number;
  max: number;
  trim: number;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ControlSurfacesPage() {
  const parameters = useParameterStore((s) => s.parameters);
  const paramState = useParameterStore.getState();
  const setParamLocal = useParameterStore((s) => s.setParamLocal);
  const servoOutputs = useTelemetryStore((s) => s.servoOutputs);

  // Detect surfaces from FC params
  const surfaces = useMemo(() => {
    const surfaceFunctions = new Set([
      FUNC.AILERON, FUNC.ELEVATOR, FUNC.RUDDER,
      FUNC.FLAPERON_L, FUNC.FLAPERON_R, FUNC.FLAP,
    ]);
    const result: DetectedSurface[] = [];
    for (let i = 1; i <= 16; i++) {
      const funcVal = getEffectiveValue(paramState, `SERVO${i}_FUNCTION`) ?? 0;
      if (surfaceFunctions.has(funcVal)) {
        result.push({
          servoNum: i,
          functionId: funcVal,
          label: FUNC_LABELS[funcVal] ?? `Function ${funcVal}`,
          reversed: (getEffectiveValue(paramState, `SERVO${i}_REVERSED`) ?? 0) === 1,
          min: getEffectiveValue(paramState, `SERVO${i}_MIN`) ?? 1000,
          max: getEffectiveValue(paramState, `SERVO${i}_MAX`) ?? 2000,
          trim: getEffectiveValue(paramState, `SERVO${i}_TRIM`) ?? 1500,
        });
      }
    }
    return result;
  }, [parameters, paramState]);

  // Determine views
  const views = useMemo((): SurfaceViewType[] => {
    const hasAileron = surfaces.some(s => s.functionId === FUNC.AILERON);
    const hasElevator = surfaces.some(s => s.functionId === FUNC.ELEVATOR);
    const hasRudder = surfaces.some(s => s.functionId === FUNC.RUDDER);
    const hasFlaperon = surfaces.some(s =>
      s.functionId === FUNC.FLAPERON_L || s.functionId === FUNC.FLAPERON_R);
    const isFlyingWing = (hasAileron || hasFlaperon) && !hasElevator && !hasRudder;
    const isVTail = hasElevator && !hasRudder;

    const v: SurfaceViewType[] = [];
    v.push(isFlyingWing ? 'flyingwing' : 'wings');
    if (!isFlyingWing) {
      if (isVTail) v.push('vtail');
      else {
        if (hasElevator) v.push('elevator');
        if (hasRudder) v.push('rudder');
      }
    }
    return v;
  }, [surfaces]);

  // Servo output to deflection
  const servoToDeg = useCallback((servoNum: number): number => {
    const output = servoOutputs[servoNum - 1] ?? 0;
    if (output <= 0) return 0;
    const s = surfaces.find(s => s.servoNum === servoNum);
    if (!s) return 0;
    const range = s.max - s.min;
    if (range <= 0) return 0;
    return ((output - s.trim) / (range / 2)) * 30; // +/-30deg max
  }, [servoOutputs, surfaces]);

  // Build deflection params for 3D viewer
  const deflection = useMemo((): DeflectionParams => {
    const findDeg = (funcId: number) => {
      const s = surfaces.find(s => s.functionId === funcId);
      return s ? servoToDeg(s.servoNum) * (s.reversed ? -1 : 1) : 0;
    };
    const ailDeg = findDeg(FUNC.AILERON) || findDeg(FUNC.FLAPERON_L);
    return {
      leftAilDeg: ailDeg,
      rightAilDeg: -ailDeg,
      elevDeg: findDeg(FUNC.ELEVATOR),
      rudDeg: findDeg(FUNC.RUDDER),
    };
  }, [surfaces, servoToDeg]);

  const handleReverse = useCallback((servoNum: number) => {
    const current = getEffectiveValue(paramState, `SERVO${servoNum}_REVERSED`) ?? 0;
    setParamLocal(`SERVO${servoNum}_REVERSED`, current === 0 ? 1 : 0);
  }, [paramState, setParamLocal]);

  if (surfaces.length === 0) {
    return (
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Control Surfaces</h1>
          <p className="mt-1 text-lg text-muted">
            No control surfaces detected. Assign SERVOx_FUNCTION to aileron (77),
            elevator (78), or rudder (79) first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Control Surfaces</h1>
        <p className="mt-1 text-lg text-muted">
          3D visualization of your control surfaces with live servo feedback.
          Move your transmitter sticks to verify correct direction.
        </p>
      </div>

      {/* 3D viewers for each view */}
      {views.map((viewType) => {
        const viewDef = VIEW_DEFS[viewType];
        return (
          <div key={viewType} className="card">
            <div className="card-header">{viewDef?.label ?? viewType}</div>
            <div className="mx-auto max-w-[600px]">
              <ControlSurface3DViewer
                viewType={viewType}
                deflections={deflection}
              />
            </div>
            <p className="mt-2 text-center text-xs text-muted">
              {viewDef?.instruction ?? 'Move your transmitter sticks to see the surfaces respond.'}
            </p>
          </div>
        );
      })}

      {/* Surface list with reverse + travel */}
      <div className="card">
        <div className="card-header">Servo Assignments</div>
        <div className="space-y-2">
          {surfaces.map((s) => {
            const output = servoOutputs[s.servoNum - 1] ?? 0;
            const travel = s.max - s.min;
            const pct = travel > 0 ? Math.round(((output - s.min) / travel) * 100) : 50;
            return (
              <div key={s.servoNum} className="flex items-center gap-3 rounded border border-border bg-surface-0 px-4 py-3">
                <div className="w-32 shrink-0">
                  <p className="text-sm font-bold text-foreground">{s.label}</p>
                  <p className="text-[11px] font-mono text-subtle">
                    SERVO{s.servoNum} -- fn {s.functionId}
                  </p>
                </div>
                <div className="flex-1">
                  <div className="h-2.5 rounded-full bg-surface-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-100"
                      style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-subtle mt-0.5">
                    <span>{s.min}</span>
                    <span>{output || '--'} us</span>
                    <span>{s.max}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleReverse(s.servoNum)}
                  className={`btn btn-ghost gap-1 text-xs ${s.reversed ? 'text-warning' : ''}`}
                >
                  <RotateCcw size={11} />
                  {s.reversed ? 'Reversed' : 'Reverse'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-start gap-2 rounded border border-border bg-surface-0 px-4 py-2.5">
        <Info size={13} className="mt-0.5 shrink-0 text-muted" />
        <p className="text-xs text-muted">
          Servo travel limits (MIN/MAX/TRIM) can be adjusted in the Motors page or
          Configuration page. Changes here are saved when you click Save in the footer.
        </p>
      </div>
    </div>
  );
}
