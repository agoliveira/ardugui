/**
 * TiltServosStep.tsx -- Wizard step for quadplane tilt servo verification.
 *
 * Shows detected tilt servo configuration (Q_TILT_TYPE, tilt servos),
 * live servo output, and active tilt test via flight mode switching.
 *
 * Tilt test approach (from ArduPilot wiki Tilt Rotor Setup Tips):
 * - MANUAL mode drives tilt servos to forward flight position
 * - QSTABILIZE drives them to hover (vertical) position
 * The pilot can visually confirm direction is correct with props removed.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Check,
  AlertTriangle,
  Info,
  ArrowUp,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useWizardStore } from '../wizardStore';
import { useParameterStore, getEffectiveValue } from '@/store/parameterStore';
import { useTelemetryStore } from '@/store/telemetryStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { connectionManager } from '@/mavlink/connection';

/* ------------------------------------------------------------------ */
/*  Tilt type labels                                                   */
/* ------------------------------------------------------------------ */

const TILT_TYPES: Record<number, string> = {
  0: 'None',
  1: 'Continuous',
  2: 'Binary (fixed positions)',
  3: 'Continuous with vectored yaw',
};

// ArduPlane mode numbers
const PLANE_MODE_MANUAL = 0;
const PLANE_MODE_QSTABILIZE = 17;

function modeName(mode: number | null): string {
  if (mode === PLANE_MODE_MANUAL) return 'Manual';
  if (mode === PLANE_MODE_QSTABILIZE) return 'QStabilize';
  if (mode === null) return 'Unknown';
  return `Mode ${mode}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface TiltServosStepProps {
  onCanAdvanceChange: (canAdvance: boolean) => void;
}

export function TiltServosStep({ onCanAdvanceChange }: TiltServosStepProps) {
  const markComplete = useWizardStore((s) => s.markComplete);
  const stagedParams = useWizardStore((s) => s.stagedParams);
  const parameters = useParameterStore((s) => s.parameters);
  const servoOutputs = useTelemetryStore((s) => s.servoOutputs);
  const paramState = useParameterStore.getState();
  const flightMode = useVehicleStore((s) => s.flightMode);
  const armed = useVehicleStore((s) => s.armed);

  const [switching, setSwitching] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testedBothPositions, setTestedBothPositions] = useState(false);
  const [testedHover, setTestedHover] = useState(false);
  const [testedForward, setTestedForward] = useState(false);

  const getParam = (name: string, fallback: number) =>
    stagedParams[name] ?? getEffectiveValue(paramState, name) ?? fallback;

  const tiltType = getParam('Q_TILT_TYPE', 0);
  const tiltMax = getParam('Q_TILT_MAX', 45);
  const tiltMin = getParam('Q_TILT_MIN', 0);

  // Find which servos have tilt function (41 = Motor Tilt)
  const tiltServos = useMemo(() => {
    const servos: { num: number; output: number; reversed: boolean }[] = [];
    for (let i = 1; i <= 16; i++) {
      const func = stagedParams[`SERVO${i}_FUNCTION`]
        ?? getEffectiveValue(paramState, `SERVO${i}_FUNCTION`) ?? 0;
      if (func === 41) {
        const reversed = (stagedParams[`SERVO${i}_REVERSED`]
          ?? getEffectiveValue(paramState, `SERVO${i}_REVERSED`) ?? 0) === 1;
        servos.push({
          num: i,
          output: servoOutputs[i - 1] ?? 0,
          reversed,
        });
      }
    }
    return servos;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parameters, servoOutputs, paramState, stagedParams]);

  // Track when both positions have been tested
  useEffect(() => {
    if (testedHover && testedForward) setTestedBothPositions(true);
  }, [testedHover, testedForward]);

  // Advance gate
  useEffect(() => {
    onCanAdvanceChange(true);
    if (tiltType > 0) markComplete('tilt_servos');
  }, [tiltType, onCanAdvanceChange, markComplete]);

  // Mode switch handler
  const switchMode = useCallback(async (targetMode: number) => {
    setSwitching(true);
    setTestError(null);
    try {
      const result = await connectionManager.setFlightMode(targetMode);
      if (result !== 0 && result !== undefined) {
        setTestError(`Mode switch failed (result: ${result}). Is the FC disarmed?`);
      } else {
        if (targetMode === PLANE_MODE_QSTABILIZE) setTestedHover(true);
        if (targetMode === PLANE_MODE_MANUAL) setTestedForward(true);
      }
    } catch (err) {
      setTestError(`Mode switch error: ${err}`);
    }
    setSwitching(false);
  }, []);

  // No tilt configured
  if (tiltType === 0 && tiltServos.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tilt Servos</h2>
          <p className="mt-1 text-sm text-muted">
            No tilt mechanism detected. If your VTOL uses tilting motors, configure
            Q_TILT_TYPE in the Configuration page.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded border border-blue-500/30 bg-blue-900/15 px-4 py-3">
          <Info size={14} className="mt-0.5 shrink-0 text-blue-400" />
          <p className="text-sm text-blue-300/90">
            Tilt servos are optional. Many VTOLs use separate vertical and forward motors
            without tilting. You can skip this step.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">

      <div>
        <h2 className="text-xl font-bold text-foreground">Tilt Servos</h2>
        <p className="mt-1 text-sm text-muted">
          Verify your tilt mechanism moves correctly between hover and forward flight positions.
          Remove all propellers before testing.
        </p>
      </div>

      {/* Configuration summary */}
      <div className="card overflow-hidden">
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between px-5 py-2.5">
            <span className="text-sm text-muted">Tilt type</span>
            <span className="text-sm font-semibold text-foreground">
              {TILT_TYPES[tiltType] ?? `Unknown (${tiltType})`}
            </span>
          </div>
          <div className="flex items-center justify-between px-5 py-2.5">
            <span className="text-sm text-muted">Max tilt angle</span>
            <span className="text-sm font-semibold text-foreground">{tiltMax} degrees</span>
          </div>
          {tiltMin > 0 && (
            <div className="flex items-center justify-between px-5 py-2.5">
              <span className="text-sm text-muted">Min tilt angle (forward flight)</span>
              <span className="text-sm font-semibold text-foreground">{tiltMin} degrees</span>
            </div>
          )}
          <div className="flex items-center justify-between px-5 py-2.5">
            <span className="text-sm text-muted">Tilt servos</span>
            <span className="text-sm font-semibold text-foreground">
              {tiltServos.length > 0
                ? tiltServos.map(s => `SERVO${s.num}`).join(', ')
                : 'None detected'}
            </span>
          </div>
          <div className="flex items-center justify-between px-5 py-2.5">
            <span className="text-sm text-muted">Current mode</span>
            <span className="text-sm font-semibold text-foreground">
              {modeName(flightMode)}
            </span>
          </div>
        </div>
      </div>

      {/* Safety warning */}
      <div className="flex items-start gap-2 rounded border border-danger/40 bg-danger/5 px-4 py-3">
        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-danger" />
        <div>
          <p className="text-sm font-bold text-danger">Remove all propellers before testing</p>
          <p className="mt-0.5 text-xs text-danger/70">
            The tilt test changes flight modes which may also spin motors.
            Ensure props are removed and the aircraft is secured.
          </p>
        </div>
      </div>

      {armed && (
        <div className="flex items-start gap-2 rounded border border-danger/40 bg-danger/5 px-4 py-3">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-danger" />
          <p className="text-sm font-bold text-danger">
            Vehicle is ARMED. Disarm before testing tilt servos.
          </p>
        </div>
      )}

      {/* Tilt test buttons */}
      {!armed && tiltServos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
            Tilt test
          </h3>
          <p className="text-xs text-muted">
            Switch between hover and forward flight modes to verify tilt direction.
            Watch the tilt servos physically move to the correct position.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => switchMode(PLANE_MODE_QSTABILIZE)}
              disabled={switching}
              className={`flex flex-col items-center gap-2 rounded border-2 p-4 transition ${
                flightMode === PLANE_MODE_QSTABILIZE
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-surface-0 hover:border-accent/40'
              } disabled:opacity-50`}
            >
              {switching ? (
                <Loader2 size={24} className="animate-spin text-accent" />
              ) : (
                <ArrowUp size={24} className={flightMode === PLANE_MODE_QSTABILIZE ? 'text-accent' : 'text-muted'} />
              )}
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">Hover position</p>
                <p className="mt-0.5 text-[11px] text-muted">
                  QStabilize -- motors point UP
                </p>
              </div>
              {testedHover && (
                <Check size={14} className="text-success" />
              )}
            </button>
            <button
              onClick={() => switchMode(PLANE_MODE_MANUAL)}
              disabled={switching}
              className={`flex flex-col items-center gap-2 rounded border-2 p-4 transition ${
                flightMode === PLANE_MODE_MANUAL
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-surface-0 hover:border-accent/40'
              } disabled:opacity-50`}
            >
              {switching ? (
                <Loader2 size={24} className="animate-spin text-accent" />
              ) : (
                <ArrowRight size={24} className={flightMode === PLANE_MODE_MANUAL ? 'text-accent' : 'text-muted'} />
              )}
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">Forward flight</p>
                <p className="mt-0.5 text-[11px] text-muted">
                  Manual -- motors point FORWARD
                </p>
              </div>
              {testedForward && (
                <Check size={14} className="text-success" />
              )}
            </button>
          </div>

          {testError && (
            <div className="rounded border border-danger/40 bg-danger/5 px-4 py-2.5 text-sm text-danger">
              {testError}
            </div>
          )}

          {testedBothPositions && (
            <div className="flex items-center gap-2 rounded border border-success/30 bg-success/5 px-4 py-2.5">
              <Check size={14} className="text-success" />
              <p className="text-sm text-success">
                Both positions tested. Verify the tilt direction was correct before continuing.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Live servo outputs */}
      {tiltServos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
            Servo outputs
          </h3>
          {tiltServos.map((servo) => {
            const min = getParam(`SERVO${servo.num}_MIN`, 1000);
            const max = getParam(`SERVO${servo.num}_MAX`, 2000);
            const travel = max - min;
            const pct = travel > 0 ? Math.round(((servo.output - min) / travel) * 100) : 50;

            return (
              <div key={servo.num} className="rounded-lg border border-border bg-surface-0 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-foreground">SERVO{servo.num}</span>
                  {servo.reversed && (
                    <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[10px] font-bold text-warning">
                      REVERSED
                    </span>
                  )}
                  <div className="flex-1">
                    <div className="h-2.5 rounded-full bg-surface-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-100"
                        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted tabular-nums w-12 text-right">
                    {servo.output || '--'} us
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* If tilt direction is wrong */}
      <div className="flex items-start gap-2 rounded border border-border bg-surface-0 px-4 py-2.5">
        <Info size={13} className="mt-0.5 shrink-0 text-muted" />
        <p className="text-xs text-muted">
          If the tilt direction is wrong, reverse the servo on the Motors page
          (SERVO{tiltServos[0]?.num ?? 'x'}_REVERSED). Servo travel limits can also be
          adjusted there. See the ArduPilot Tilt Rotor Setup guide for detailed instructions.
        </p>
      </div>
    </div>
  );
}
