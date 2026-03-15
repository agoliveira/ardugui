/**
 * AccelerometerStep.tsx -- Wizard step for 6-position accelerometer calibration.
 *
 * Wraps the existing calibration store state machine with a wizard-focused UI.
 * Reuses CalibrationPositionGrid and Calibration3DViewer from components.
 *
 * Completion gate: accel calibration succeeds OR already calibrated.
 */

import { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import {
  Play,
  Check,
  Loader2,
  XCircle,
  RefreshCw,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { useWizardStore } from '../wizardStore';
import { useParameterStore } from '@/store/parameterStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { useTelemetryStore } from '@/store/telemetryStore';
import { connectionManager } from '@/mavlink/connection';
import {
  useCalibrationStore,
  ACCEL_POSITION_INDEX,
  ACCEL_POSITION_LABELS,
  ACCEL_POSITION_INSTRUCTIONS,
  type AccelPosition,
} from '@/store/calibrationStore';
import { CalibrationPositionGrid, Calibration3DViewer } from '@/components/Calibration3DViewer';

/* ------------------------------------------------------------------ */
/*  Accel status hook                                                   */
/* ------------------------------------------------------------------ */

function useAccelCalibrationStatus() {
  const params = useParameterStore((s) => s.parameters);
  return useMemo(() => {
    const ofsX = params.get('INS_ACCOFFS_X')?.value ?? 0;
    const ofsY = params.get('INS_ACCOFFS_Y')?.value ?? 0;
    const ofsZ = params.get('INS_ACCOFFS_Z')?.value ?? 0;
    const calibrated = ofsX !== 0 || ofsY !== 0 || ofsZ !== 0;
    return { calibrated, ofsX, ofsY, ofsZ };
  }, [params]);
}

/* ------------------------------------------------------------------ */
/*  Expected attitude per position (radians)                           */
/*  Used to show live orientation feedback during calibration.         */
/* ------------------------------------------------------------------ */

const EXPECTED_ATTITUDE: Record<AccelPosition, { roll: number; pitch: number }> = {
  level:    { roll: 0,          pitch: 0 },
  left:     { roll: -Math.PI/2, pitch: 0 },
  right:    { roll: Math.PI/2,  pitch: 0 },
  nosedown: { roll: 0,          pitch: -Math.PI/2 },
  noseup:   { roll: 0,          pitch: Math.PI/2 },
  back:     { roll: Math.PI,    pitch: 0 },
};

/** Check if live attitude roughly matches expected position. Returns deviation in degrees. */
function attitudeDeviation(
  roll: number, pitch: number, position: AccelPosition
): number {
  const expected = EXPECTED_ATTITUDE[position];

  if (position === 'back') {
    // Upside down: roll should be +-PI
    const rollDev = Math.abs(Math.abs(roll) - Math.PI);
    const pitchDev = Math.abs(pitch);
    return Math.max(rollDev, pitchDev) * (180 / Math.PI);
  }

  const rollDev = Math.abs(roll - expected.roll);
  const pitchDev = Math.abs(pitch - expected.pitch);
  return Math.max(rollDev, pitchDev) * (180 / Math.PI);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface AccelerometerStepProps {
  onCanAdvanceChange: (canAdvance: boolean) => void;
}

export function AccelerometerStep({ onCanAdvanceChange }: AccelerometerStepProps) {
  const markComplete = useWizardStore((s) => s.markComplete);
  const vehicleType = useVehicleStore((s) => s.type);
  const accelStatus = useAccelCalibrationStatus();
  const attitude = useTelemetryStore((s) => s.attitude);

  const accelState = useCalibrationStore((s) => s.accelState);
  const currentPosition = useCalibrationStore((s) => s.accelCurrentPosition);
  const completedPositions = useCalibrationStore((s) => s.accelCompletedPositions);

  const isActive = accelState !== 'idle' && accelState !== 'done' && accelState !== 'failed';

  // Live orientation deviation in degrees
  const deviation = currentPosition && attitude
    ? attitudeDeviation(attitude.roll, attitude.pitch, currentPosition)
    : null;

  // ── Reset calibration store on mount ───────────────────────────
  useEffect(() => {
    useCalibrationStore.getState().resetAccel();
  }, []);

  // ── Stall detection for sampling ───────────────────────────────

  const [samplingStalled, setSamplingStalled] = useState(false);
  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (accelState === 'sampling') {
      setSamplingStalled(false);
      stallTimerRef.current = setTimeout(() => setSamplingStalled(true), 12000);
    } else {
      setSamplingStalled(false);
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
    }
    return () => { if (stallTimerRef.current) clearTimeout(stallTimerRef.current); };
  }, [accelState]);

  // ── Handlers ───────────────────────────────────────────────────

  const handleStart = useCallback(async () => {
    useCalibrationStore.getState().resetAccel();
    useCalibrationStore.getState().setAccelState('starting');
    await connectionManager.startAccelCalibration();
  }, []);

  const handleConfirmPosition = useCallback(async () => {
    if (!currentPosition) return;
    useCalibrationStore.getState().setAccelState('sampling');
    await connectionManager.confirmAccelCalPosition(ACCEL_POSITION_INDEX[currentPosition]);
  }, [currentPosition]);

  const handleRetryConfirm = useCallback(async () => {
    if (!currentPosition) return;
    setSamplingStalled(false);
    await connectionManager.confirmAccelCalPosition(ACCEL_POSITION_INDEX[currentPosition]);
    if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
    stallTimerRef.current = setTimeout(() => setSamplingStalled(true), 12000);
  }, [currentPosition]);

  // ── Advance gate ───────────────────────────────────────────────
  // Only advance if:
  //   - Calibration completed THIS session (accelState === 'done'), OR
  //   - Already calibrated AND not currently running (idle)
  // This prevents advancing mid-calibration when old offsets exist.

  useEffect(() => {
    const calDoneNow = accelState === 'done';
    const alreadyCalibratedAndIdle = accelStatus.calibrated && accelState === 'idle';
    const canPass = calDoneNow || alreadyCalibratedAndIdle;
    onCanAdvanceChange(canPass);
    if (canPass) markComplete('accelerometer');
  }, [accelState, accelStatus.calibrated, onCanAdvanceChange, markComplete]);

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">

      <div>
        <h2 className="text-xl font-bold text-foreground">Accelerometer Calibration</h2>
        <p className="mt-1 text-sm text-muted">
          Hold the aircraft still in 6 positions. This calibrates the accelerometer
          for accurate attitude estimation.
        </p>
      </div>

      {/* ── Status banners ──────────────────────────────────────── */}

      {accelStatus.calibrated && accelState === 'idle' && (
        <div className="flex items-center gap-3 rounded-lg border border-success/40 bg-success/10 px-5 py-4">
          <Check size={20} className="shrink-0 text-success" />
          <div>
            <p className="text-sm font-bold text-success">Accelerometer is calibrated</p>
            <p className="mt-0.5 text-xs text-success/80">
              Offsets: [{accelStatus.ofsX.toFixed(2)}, {accelStatus.ofsY.toFixed(2)}, {accelStatus.ofsZ.toFixed(2)}].
              You can continue or re-calibrate.
            </p>
          </div>
        </div>
      )}

      {accelState === 'done' && (
        <div className="flex items-center gap-3 rounded-lg border border-success/40 bg-success/10 px-5 py-4">
          <Check size={20} className="shrink-0 text-success" />
          <div>
            <p className="text-sm font-bold text-success">Calibration successful!</p>
            <p className="mt-0.5 text-xs text-success/80">
              New offsets saved. A reboot is needed -- this will happen when you finish the wizard.
            </p>
          </div>
        </div>
      )}

      {accelState === 'failed' && (
        <div className="flex items-start gap-3 rounded border border-danger/30 bg-danger/5 px-4 py-3">
          <XCircle size={16} className="mt-0.5 shrink-0 text-danger" />
          <div>
            <p className="text-sm font-semibold text-danger">Calibration failed</p>
            <p className="mt-0.5 text-xs text-muted">
              Ensure the vehicle was held completely still. Try again.
            </p>
          </div>
        </div>
      )}

      {/* ── Start / restart button ────────────────────────────── */}

      {(accelState === 'idle' || accelState === 'done' || accelState === 'failed') && (
        <button onClick={handleStart} className="btn btn-primary gap-2 py-2.5 text-base w-full">
          <Play size={16} />
          {accelState === 'idle' && !accelStatus.calibrated
            ? 'Start Calibration' : 'Calibrate Again'}
        </button>
      )}

      {/* ── Starting spinner ──────────────────────────────────── */}

      {accelState === 'starting' && (
        <div className="flex items-center gap-3 rounded bg-surface-1 px-4 py-3">
          <Loader2 size={16} className="text-accent animate-spin" />
          <p className="text-sm text-muted">Starting calibration -- waiting for flight controller...</p>
        </div>
      )}

      {/* ── Active calibration: 3D model + confirm + orientation feedback ── */}

      {isActive && currentPosition && (
        <div className="rounded-lg border-2 border-accent bg-surface-0 overflow-hidden">
          {/* 3D model */}
          <div className="flex items-center justify-center bg-surface-1" style={{ height: 260 }}>
            <Calibration3DViewer
              position={currentPosition}
              vehicleType={vehicleType}
              className="h-56 w-56"
            />
          </div>

          {/* Position info + action */}
          <div className="p-4 space-y-3">
            <h3 className="text-lg font-bold text-accent text-center">
              {ACCEL_POSITION_LABELS[currentPosition]}
            </h3>
            <p className="text-sm text-muted text-center">
              {ACCEL_POSITION_INSTRUCTIONS[currentPosition]}
            </p>

            {/* Live orientation feedback with angle */}
            {accelState === 'waitingForPosition' && deviation !== null && (
              <div className={`flex items-center justify-center gap-2 text-xs font-medium py-1.5 rounded ${
                deviation < 10 ? 'text-success bg-success/5' :
                deviation < 20 ? 'text-warning bg-warning/5' :
                'text-danger bg-danger/5'
              }`}>
                {deviation < 10
                  ? <><Check size={12} /> Position looks correct ({Math.round(deviation)} degrees off)</>
                  : deviation < 20
                    ? <><AlertTriangle size={12} /> Close -- {Math.round(deviation)} degrees off target</>
                    : <><AlertTriangle size={12} /> {Math.round(deviation)} degrees off -- keep rotating</>}
              </div>
            )}

            {accelState === 'waitingForPosition' && (
              <button onClick={handleConfirmPosition} className="btn btn-primary w-full gap-2 py-3 text-base">
                <Check size={16} />
                Hold Still and Confirm Position
              </button>
            )}

            {accelState === 'sampling' && !samplingStalled && (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-accent font-semibold">
                <Loader2 size={16} className="animate-spin" />
                Sampling -- hold completely still...
              </div>
            )}

            {accelState === 'sampling' && samplingStalled && (
              <div className="space-y-2 text-center">
                <p className="text-xs text-warning">Sampling seems stalled. Try confirming again.</p>
                <button onClick={handleRetryConfirm} className="btn btn-ghost gap-2">
                  <RefreshCw size={14} /> Retry
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Position grid -- overview ─────────────────────────── */}

      <CalibrationPositionGrid
        vehicleType={vehicleType}
        completedPositions={completedPositions}
        currentPosition={currentPosition}
        isActive={isActive}
        allCalibrated={accelStatus.calibrated && !isActive}
      />

      {/* ── Hint ──────────────────────────────────────────────── */}

      <div className="flex items-start gap-2 rounded border border-border bg-surface-0 px-4 py-2.5">
        <Info size={13} className="mt-0.5 shrink-0 text-muted" />
        <p className="text-xs text-muted">
          Place the vehicle on a flat, level surface for the first position.
          Hold it completely still for a few seconds at each position. The FC
          will auto-advance to the next position after sampling.
        </p>
      </div>
    </div>
  );
}
