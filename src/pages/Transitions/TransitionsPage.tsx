/**
 * TransitionsPage.tsx -- Standalone VTOL transition configuration.
 *
 * Full version of the wizard TransitionsStep with additional advanced params.
 * Only visible for quadplane vehicle type.
 *
 * Sections:
 *   1. Forward transition (hover -> cruise)
 *   2. Back transition (cruise -> hover)
 *   3. VTOL assist (stall protection)
 *   4. Transition failure handling
 */

import { useMemo } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useParameterStore, getEffectiveValue } from '@/store/parameterStore';

/* ------------------------------------------------------------------ */
/*  Param field definition                                             */
/* ------------------------------------------------------------------ */

interface ParamField {
  param: string;
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  displayFn?: (v: number) => string;
}

interface OptionField {
  param: string;
  label: string;
  description: string;
  options: { value: number; label: string; description?: string }[];
}

/* ------------------------------------------------------------------ */
/*  Section definitions                                                */
/* ------------------------------------------------------------------ */

const FORWARD_TRANSITION: ParamField[] = [
  {
    param: 'Q_TRANSITION_MS',
    label: 'Transition timeout',
    description: 'Maximum time to complete forward transition before the fail action triggers.',
    min: 2000, max: 60000, step: 1000, unit: 'ms',
    displayFn: (v) => `${(v / 1000).toFixed(0)}s`,
  },
  {
    param: 'ARSPD_FBW_MIN',
    label: 'Minimum airspeed (FBW)',
    description: 'Minimum airspeed in auto modes. Also used as the target speed to complete transition when an airspeed sensor is present.',
    min: 5, max: 50, step: 1, unit: 'm/s',
  },
  {
    param: 'Q_TILT_RATE_UP',
    label: 'Tilt rate up (to cruise)',
    description: 'Rate at which tilt servos move from hover to forward flight position. 0 = instant.',
    min: 0, max: 100, step: 5, unit: 'deg/s',
  },
];

const BACK_TRANSITION: ParamField[] = [
  {
    param: 'Q_TILT_RATE_DN',
    label: 'Tilt rate down (to hover)',
    description: 'Rate at which tilt servos return from forward flight to hover position. 0 = instant.',
    min: 0, max: 100, step: 5, unit: 'deg/s',
  },
];

const ASSIST: ParamField[] = [
  {
    param: 'Q_ASSIST_SPEED',
    label: 'Assist speed',
    description: 'If airspeed drops below this during forward flight, VTOL motors activate for stall protection. 0 = disabled.',
    min: 0, max: 30, step: 1, unit: 'm/s',
  },
  {
    param: 'Q_ASSIST_ALT',
    label: 'Assist altitude',
    description: 'If altitude drops below this during forward flight, VTOL motors activate. 0 = disabled.',
    min: 0, max: 200, step: 5, unit: 'm',
  },
  {
    param: 'Q_ASSIST_ANGLE',
    label: 'Assist angle',
    description: 'If attitude exceeds this angle from level in forward flight, VTOL motors activate. 0 = disabled.',
    min: 0, max: 90, step: 5, unit: 'deg',
  },
];

const FAILURE: OptionField[] = [
  {
    param: 'Q_TRANS_FAIL_ACT',
    label: 'Transition failure action',
    description: 'What to do if the forward transition does not complete within the timeout.',
    options: [
      { value: 0, label: 'Continue', description: 'Keep trying to transition (risky)' },
      { value: 1, label: 'QRTL', description: 'Abort transition, return home as VTOL' },
      { value: 2, label: 'QLand', description: 'Abort transition, land immediately as VTOL' },
    ],
  },
  {
    param: 'Q_RTL_MODE',
    label: 'RTL mode',
    description: 'How the aircraft returns to launch when RTL is triggered.',
    options: [
      { value: 0, label: 'Fixed-wing RTL', description: 'Return as plane, circle home, no auto-land' },
      { value: 1, label: 'VTOL RTL', description: 'Transition to hover, fly home as multirotor, land vertically' },
      { value: 3, label: 'Hybrid RTL', description: 'Fly home as plane, then VTOL land' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TransitionsPage() {
  const paramState = useParameterStore.getState();
  const parameters = useParameterStore((s) => s.parameters);
  const setParamLocal = useParameterStore((s) => s.setParamLocal);

  const hasAirspeed = useMemo(() => {
    return (getEffectiveValue(paramState, 'ARSPD_TYPE') ?? 0) > 0;
  }, [paramState, parameters]);

  const hasTilt = useMemo(() => {
    return (getEffectiveValue(paramState, 'Q_TILT_TYPE') ?? 0) > 0;
  }, [paramState, parameters]);

  const assistSpeed = getEffectiveValue(paramState, 'Q_ASSIST_SPEED') ?? 0;
  const assistAlt = getEffectiveValue(paramState, 'Q_ASSIST_ALT') ?? 0;
  const assistAngle = getEffectiveValue(paramState, 'Q_ASSIST_ANGLE') ?? 0;
  const allAssistOff = assistSpeed === 0 && assistAlt === 0 && assistAngle === 0;

  // Filter tilt params if no tilt mechanism
  const forwardParams = FORWARD_TRANSITION.filter(
    (f) => !f.param.startsWith('Q_TILT_') || hasTilt
  );
  const backParams = BACK_TRANSITION.filter(
    (f) => !f.param.startsWith('Q_TILT_') || hasTilt
  );

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Transitions</h1>
        <p className="mt-1 text-lg text-muted">
          Configure how your VTOL transitions between hover and forward flight.
        </p>
      </div>

      {!hasAirspeed && (
        <div className="flex items-start gap-2.5 rounded border border-blue-500/30 bg-blue-900/15 px-4 py-3">
          <Info size={14} className="mt-0.5 shrink-0 text-blue-400" />
          <p className="text-sm text-blue-300/90">
            No airspeed sensor detected. Without one, the FC uses a timer to decide when
            forward transition is complete. Consider installing an airspeed sensor for
            more reliable transitions.
          </p>
        </div>
      )}

      {/* Forward transition */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ArrowRight size={16} className="text-accent" />
          <h2 className="text-lg font-bold text-foreground">Forward transition</h2>
        </div>
        <p className="text-sm text-muted">
          Settings that control how the aircraft transitions from hover to forward flight.
        </p>
        <div className="space-y-2">
          {forwardParams.map((f) => (
            <ParamSlider key={f.param} field={f} paramState={paramState}
              onChange={(v) => setParamLocal(f.param, v)} />
          ))}
        </div>
      </section>

      {/* Back transition */}
      {backParams.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ArrowLeft size={16} className="text-accent" />
            <h2 className="text-lg font-bold text-foreground">Back transition</h2>
          </div>
          <p className="text-sm text-muted">
            Settings that control how the aircraft returns from forward flight to hover.
          </p>
          <div className="space-y-2">
            {backParams.map((f) => (
              <ParamSlider key={f.param} field={f} paramState={paramState}
                onChange={(v) => setParamLocal(f.param, v)} />
            ))}
          </div>
        </section>
      )}

      {/* VTOL assist */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-accent" />
          <h2 className="text-lg font-bold text-foreground">VTOL assist</h2>
        </div>
        <p className="text-sm text-muted">
          Safety thresholds that automatically start VTOL motors during forward flight
          to prevent stalls and altitude loss.
        </p>
        <div className="space-y-2">
          {ASSIST.map((f) => (
            <ParamSlider key={f.param} field={f} paramState={paramState}
              onChange={(v) => setParamLocal(f.param, v)} />
          ))}
        </div>
        {allAssistOff && (
          <div className="flex items-start gap-2 rounded border border-yellow-500/40 bg-yellow-900/15 px-4 py-2.5">
            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-yellow-500" />
            <p className="text-xs text-yellow-300">
              All assist triggers are disabled. The hover motors will never activate
              automatically during forward flight. Consider enabling at least assist speed.
            </p>
          </div>
        )}
      </section>

      {/* Failure & RTL */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-accent" />
          <h2 className="text-lg font-bold text-foreground">Failure handling & RTL</h2>
        </div>
        <p className="text-sm text-muted">
          What happens when a transition fails or RTL is triggered.
        </p>
        <div className="space-y-4">
          {FAILURE.map((f) => (
            <OptionSelect key={f.param} field={f} paramState={paramState}
              onChange={(v) => setParamLocal(f.param, v)} />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared sub-components                                              */
/* ------------------------------------------------------------------ */

function ParamSlider({
  field, paramState, onChange,
}: {
  field: ParamField;
  paramState: ReturnType<typeof useParameterStore.getState>;
  onChange: (v: number) => void;
}) {
  const value = getEffectiveValue(paramState, field.param) ?? field.min;
  const display = field.displayFn ? field.displayFn(value) : `${value} ${field.unit}`;

  return (
    <div className="rounded border border-border bg-surface-0 px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-foreground">{field.label}</span>
          <span className="ml-2 text-[11px] font-mono text-subtle">{field.param}</span>
        </div>
        <span className="text-sm font-mono font-bold text-accent">{display}</span>
      </div>
      <input
        type="range"
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#ffaa2a]"
      />
      <p className="text-[11px] leading-relaxed text-subtle">{field.description}</p>
    </div>
  );
}

function OptionSelect({
  field, paramState, onChange,
}: {
  field: OptionField;
  paramState: ReturnType<typeof useParameterStore.getState>;
  onChange: (v: number) => void;
}) {
  const value = getEffectiveValue(paramState, field.param) ?? 0;

  return (
    <div className="space-y-2">
      <div>
        <span className="text-sm font-semibold text-foreground">{field.label}</span>
        <span className="ml-2 text-[11px] font-mono text-subtle">{field.param}</span>
      </div>
      <p className="text-xs text-muted">{field.description}</p>
      <div className="space-y-1.5">
        {field.options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`w-full rounded border-2 p-3 text-left transition ${
                isSelected
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-surface-0 hover:border-accent/40'
              }`}
            >
              <span className={`text-sm font-bold ${isSelected ? 'text-accent' : 'text-foreground'}`}>
                {opt.label}
              </span>
              {opt.description && (
                <p className="mt-0.5 text-xs text-muted">{opt.description}</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
