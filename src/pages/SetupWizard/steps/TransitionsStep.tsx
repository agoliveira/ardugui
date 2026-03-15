/**
 * TransitionsStep.tsx -- Wizard step for VTOL transition configuration.
 *
 * Configures the essential parameters for safe transition between hover
 * and forward flight. This is mandatory for quadplanes -- without correct
 * transition settings the aircraft will crash on its first mode change.
 *
 * Grouped into three sections:
 *   1. Forward transition (hover -> cruise)
 *   2. Back transition (cruise -> hover)
 *   3. VTOL assist (stall protection)
 *
 * Only the minimum params needed for a safe first flight are exposed here.
 * The full Transitions standalone page covers advanced tuning.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Info,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { useWizardStore } from '../wizardStore';
import { useParameterStore, getEffectiveValue } from '@/store/parameterStore';

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

const DEFAULTS = {
  Q_TRANSITION_MS: 10000,   // 10 seconds to complete forward transition
  Q_ASSIST_SPEED: 0,        // 0 = disabled (we'll suggest enabling)
  Q_ASSIST_ALT: 0,          // 0 = disabled
  Q_RTL_MODE: 1,            // 1 = VTOL RTL (safest for first flight)
  ARSPD_FBW_MIN: 9,         // m/s -- only relevant with airspeed sensor
};

// Q_RTL_MODE options
const RTL_MODES: { value: number; label: string; description: string; recommended?: boolean }[] = [
  {
    value: 0,
    label: 'Fixed-wing RTL',
    description: 'Returns as a plane, circles at home, does not land autonomously. Requires tuned fixed-wing nav.',
  },
  {
    value: 1,
    label: 'VTOL RTL',
    description: 'Transitions to hover, flies home as a multirotor, lands vertically. Safest for first flight.',
    recommended: true,
  },
  {
    value: 3,
    label: 'Hybrid RTL',
    description: 'Flies home as a plane, then transitions to VTOL for landing. Best range, needs tuned nav.',
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface TransitionsStepProps {
  onCanAdvanceChange: (canAdvance: boolean) => void;
}

export function TransitionsStep({ onCanAdvanceChange }: TransitionsStepProps) {
  const stageParams = useWizardStore((s) => s.stageParams);
  const stagedParams = useWizardStore((s) => s.stagedParams);
  const markComplete = useWizardStore((s) => s.markComplete);
  const parameters = useParameterStore((s) => s.parameters);
  const paramState = useParameterStore.getState();

  const getParam = (name: string, fallback: number): number =>
    stagedParams[name] ?? getEffectiveValue(paramState, name) ?? fallback;

  // Local state -- initialized from staged > FC > defaults
  const [transitionMs, setTransitionMs] = useState(() =>
    getParam('Q_TRANSITION_MS', DEFAULTS.Q_TRANSITION_MS));
  const [assistSpeed, setAssistSpeed] = useState(() =>
    getParam('Q_ASSIST_SPEED', DEFAULTS.Q_ASSIST_SPEED));
  const [assistAlt, setAssistAlt] = useState(() =>
    getParam('Q_ASSIST_ALT', DEFAULTS.Q_ASSIST_ALT));
  const [rtlMode, setRtlMode] = useState(() =>
    getParam('Q_RTL_MODE', DEFAULTS.Q_RTL_MODE));

  // Has airspeed sensor
  const hasAirspeed = useMemo(() => {
    const arspdType = getEffectiveValue(paramState, 'ARSPD_TYPE') ?? 0;
    return arspdType > 0;
  }, [paramState]);

  // Stage params on every change
  useEffect(() => {
    const params: Record<string, number> = {
      Q_TRANSITION_MS: transitionMs,
      Q_ASSIST_SPEED: assistSpeed,
      Q_ASSIST_ALT: assistAlt,
      Q_RTL_MODE: rtlMode,
    };
    stageParams(params);
    markComplete('transitions');
  }, [transitionMs, assistSpeed, assistAlt, rtlMode, stageParams, markComplete]);

  // Always advanceable -- has sensible defaults
  useEffect(() => {
    onCanAdvanceChange(true);
  }, [onCanAdvanceChange]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">

      <div>
        <h2 className="text-xl font-bold text-foreground">Transition Settings</h2>
        <p className="mt-1 text-sm text-muted">
          Configure how your VTOL transitions between hover and forward flight.
          These settings are critical for safe operation.
        </p>
      </div>

      {/* ── FORWARD TRANSITION ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ArrowRight size={16} className="text-accent" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
            Forward transition (hover to cruise)
          </h3>
        </div>

        <ParamSlider
          label="Transition timeout"
          description="Maximum time allowed for the aircraft to reach flying speed after switching to forward flight. If the transition hasn't completed by this time, the FC will take the transition fail action."
          value={transitionMs}
          onChange={setTransitionMs}
          min={5000}
          max={30000}
          step={1000}
          displayValue={`${(transitionMs / 1000).toFixed(0)}s`}
        />

        {!hasAirspeed && (
          <div className="flex items-start gap-2 rounded border border-blue-500/30 bg-blue-900/15 px-4 py-2.5">
            <Info size={13} className="mt-0.5 shrink-0 text-blue-400" />
            <p className="text-xs text-blue-300/90">
              No airspeed sensor detected. Without one, the FC uses a timer to decide
              when forward transition is complete. Make sure the timeout above is long
              enough for your aircraft to reach flying speed.
            </p>
          </div>
        )}
      </section>

      {/* ── BACK TRANSITION / RTL ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ArrowLeft size={16} className="text-accent" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
            Return to launch behavior
          </h3>
        </div>

        <p className="text-xs text-muted">
          When the aircraft enters RTL (return to launch), how should it get home?
          For a first flight, VTOL RTL is the safest -- it transitions to hover
          immediately and flies home as a multirotor.
        </p>

        <div className="space-y-2">
          {RTL_MODES.map((mode) => {
            const isSelected = rtlMode === mode.value;
            return (
              <button
                key={mode.value}
                onClick={() => setRtlMode(mode.value)}
                className={`w-full rounded border-2 p-3 text-left transition ${
                  isSelected
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-surface-0 hover:border-accent/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${isSelected ? 'text-accent' : 'text-foreground'}`}>
                    {mode.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {mode.recommended && (
                      <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-bold text-success">
                        RECOMMENDED
                      </span>
                    )}
                    {isSelected && <Check size={14} className="text-accent" />}
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted">{mode.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── VTOL ASSIST ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-accent" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
            VTOL assist (stall protection)
          </h3>
        </div>

        <p className="text-xs text-muted">
          VTOL assist automatically starts the hover motors if the aircraft gets too slow
          or too low during forward flight. This prevents stalls and crashes.
          A value of 0 disables the feature.
        </p>

        <ParamSlider
          label="Assist speed"
          description="If airspeed drops below this value during forward flight, hover motors will activate. Set to 0 to disable. A good starting point is your stall speed plus a safety margin."
          value={assistSpeed}
          onChange={setAssistSpeed}
          min={0}
          max={25}
          step={1}
          displayValue={assistSpeed === 0 ? 'Disabled' : `${assistSpeed} m/s`}
        />

        <ParamSlider
          label="Assist altitude"
          description="If altitude drops below this value during forward flight, hover motors will activate. Set to 0 to disable."
          value={assistAlt}
          onChange={setAssistAlt}
          min={0}
          max={100}
          step={5}
          displayValue={assistAlt === 0 ? 'Disabled' : `${assistAlt} m`}
        />

        {assistSpeed === 0 && assistAlt === 0 && (
          <div className="flex items-start gap-2 rounded border border-yellow-500/40 bg-yellow-900/15 px-4 py-2.5">
            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-yellow-500" />
            <p className="text-xs text-yellow-300">
              Both assist triggers are disabled. The hover motors will never activate
              automatically during forward flight. Consider enabling at least assist speed
              for stall protection.
            </p>
          </div>
        )}
      </section>

      {/* Summary */}
      <div className="rounded border border-border bg-surface-0 p-4">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
          Configuration summary
        </h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
          <span className="text-muted">Transition timeout</span>
          <span className="text-foreground font-mono">{(transitionMs / 1000).toFixed(0)}s</span>
          <span className="text-muted">RTL mode</span>
          <span className="text-foreground">{RTL_MODES.find(m => m.value === rtlMode)?.label}</span>
          <span className="text-muted">Assist speed</span>
          <span className="text-foreground font-mono">{assistSpeed === 0 ? 'Off' : `${assistSpeed} m/s`}</span>
          <span className="text-muted">Assist altitude</span>
          <span className="text-foreground font-mono">{assistAlt === 0 ? 'Off' : `${assistAlt} m`}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Parameter slider                                                   */
/* ------------------------------------------------------------------ */

function ParamSlider({
  label,
  description,
  value,
  onChange,
  min,
  max,
  step,
  displayValue,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  displayValue: string;
}) {
  return (
    <div className="rounded border border-border bg-surface-0 px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="text-sm font-mono font-bold text-accent">{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#ffaa2a]"
      />
      <p className="text-[11px] leading-relaxed text-subtle">{description}</p>
    </div>
  );
}
