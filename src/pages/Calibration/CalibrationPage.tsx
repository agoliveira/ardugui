import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  Crosshair,
  Compass,
  RotateCcw,
  Play,
  Square,
  Check,
  AlertTriangle,
  Loader2,
  MoveHorizontal,
  Power,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react';
import { connectionManager } from '@/mavlink/connection';
import { MavResult, MagCalStatus } from '@/mavlink/messages';
import {
  useCalibrationStore,
  ACCEL_POSITION_INDEX,
  ACCEL_POSITION_LABELS,
  ACCEL_POSITION_INSTRUCTIONS,
  type AccelPosition,
} from '@/store/calibrationStore';
import { useConnectionStore } from '@/store/connectionStore';
import { useParameterStore } from '@/store/parameterStore';
import { useTelemetryStore } from '@/store/telemetryStore';
import { useVehicleStore, type VehicleType } from '@/store/vehicleStore';

// ─── Sensor Bitmask ─────────────────────────────────────────────────────────

const MAV_SYS_STATUS_SENSOR_3D_MAG = 1 << 2;

// ─── Color Palette for Orientation ──────────────────────────────────────────
// Port (left) = warm/orange, Starboard (right) = cool/cyan -- aviation convention
import { Calibration3DViewer, CalibrationPositionGrid } from '@/components/Calibration3DViewer';

// ─── Calibration Status Hooks ───────────────────────────────────────────────

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

function useCompassStatus() {
  const params = useParameterStore((s) => s.parameters);
  const sensorHealth = useTelemetryStore((s) => s.sensorHealth);
  return useMemo(() => {
    const present = sensorHealth
      ? (sensorHealth.present & MAV_SYS_STATUS_SENSOR_3D_MAG) !== 0
      : false;
    const ofsX = params.get('COMPASS_OFS_X')?.value ?? 0;
    const ofsY = params.get('COMPASS_OFS_Y')?.value ?? 0;
    const ofsZ = params.get('COMPASS_OFS_Z')?.value ?? 0;
    const calibrated = ofsX !== 0 || ofsY !== 0 || ofsZ !== 0;
    return { present, calibrated, ofsX, ofsY, ofsZ };
  }, [params, sensorHealth]);
}

function useLevelTrimStatus() {
  const params = useParameterStore((s) => s.parameters);
  return useMemo(() => {
    const trimX = params.get('AHRS_TRIM_X')?.value ?? 0;
    const trimY = params.get('AHRS_TRIM_Y')?.value ?? 0;
    const trimmed = trimX !== 0 || trimY !== 0;
    return { trimmed, trimX, trimY };
  }, [params]);
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export function CalibrationPage() {
  return (
    <div className="w-full space-y-4">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Sensor Calibration</h1>
        <p className="mt-1 text-lg text-muted">
          Calibrate accelerometer and compass before first flight.
          A reboot is required after calibration for changes to take effect.
        </p>
      </div>

      <AccelCalibrationCard />
      <LevelTrimCard />
      <CompassCalibrationCard />
      <RebootCard />
    </div>
  );
}

// ─── Accelerometer Calibration ──────────────────────────────────────────────

function AccelCalibrationCard() {
  const accelState = useCalibrationStore((s) => s.accelState);
  const currentPosition = useCalibrationStore((s) => s.accelCurrentPosition);
  const completedPositions = useCalibrationStore((s) => s.accelCompletedPositions);
  const accelStatus = useAccelCalibrationStatus();
  const vehicleType = useVehicleStore((s) => s.type);

  const isActive = accelState !== 'idle' && accelState !== 'done' && accelState !== 'failed';

  const handleStart = useCallback(async () => {
    // Warn before re-calibrating if already calibrated
    if (accelStatus.calibrated) {
      const confirmed = window.confirm(
        'The accelerometer is already calibrated. Running calibration again will overwrite the existing offsets.\n\nContinue?'
      );
      if (!confirmed) return;
    }
    useCalibrationStore.getState().resetAccel();
    useCalibrationStore.getState().setAccelState('starting');
    await connectionManager.startAccelCalibration();
  }, [accelStatus.calibrated]);

  const handleConfirmPosition = useCallback(async () => {
    if (!currentPosition) return;
    useCalibrationStore.getState().setAccelState('sampling');
    await connectionManager.confirmAccelCalPosition(ACCEL_POSITION_INDEX[currentPosition]);
  }, [currentPosition]);

  const [samplingStalled, setSamplingStalled] = useState(false);
  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rebootInProgressRef = useRef(false);

  // Auto-reboot + reconnect after calibration success
  // All progress is stored in connectionStore.rebootProgress so the overlay
  // in Layout can display it regardless of which page is mounted.
  useEffect(() => {
    if (accelState !== 'done' || rebootInProgressRef.current) return;
    rebootInProgressRef.current = true;

    // Capture connection details NOW, before disconnect wipes them
    const { portPath, baudRate } = useConnectionStore.getState();
    if (!portPath) {
      rebootInProgressRef.current = false;
      return;
    }

    const store = useConnectionStore.getState();
    // Tell Layout to return to calibration page after reconnect
    store.setPendingPage('calibration');

    const doRebootAndReconnect = async () => {
      // Countdown so user can see what's happening
      for (let i = 5; i >= 1; i--) {
        useConnectionStore.getState().setRebootProgress({
          phase: 'countdown', countdown: i, returnPage: 'calibration',
        });
        await new Promise((r) => setTimeout(r, 1000));
      }

      useConnectionStore.getState().setRebootProgress({
        phase: 'rebooting', countdown: 0, returnPage: 'calibration',
      });
      try {
        await connectionManager.rebootFlightController();
      } catch {
        // disconnect expected -- FC is rebooting
      }

      // Wait for FC to restart (typically 3-5 seconds)
      await new Promise((r) => setTimeout(r, 5000));

      // Try to reconnect -- connect() resolves when serial port opens,
      // but we need to wait for full 'connected' status (params loaded).
      useConnectionStore.getState().setRebootProgress({
        phase: 'reconnecting', countdown: 0, returnPage: 'calibration',
      });
      let portOpened = false;
      for (let attempt = 0; attempt < 6; attempt++) {
        try {
          console.log(`[CalReboot] Reconnect attempt ${attempt + 1}/6...`);
          await connectionManager.connect(portPath, baudRate);
          portOpened = true;
          console.log('[CalReboot] Serial port opened, waiting for full connection...');
          break;
        } catch {
          console.log(`[CalReboot] Attempt ${attempt + 1} failed, retrying in 2s...`);
          await new Promise((r) => setTimeout(r, 2000));
        }
      }

      if (portOpened) {
        // Wait for status to reach 'connected' (params loaded) -- up to 30s
        const connected = await new Promise<boolean>((resolve) => {
          // Check immediately
          if (useConnectionStore.getState().status === 'connected') {
            resolve(true);
            return;
          }
          const timeout = setTimeout(() => { unsub(); resolve(false); }, 30000);
          const unsub = useConnectionStore.subscribe((state) => {
            if (state.status === 'connected') {
              clearTimeout(timeout);
              unsub();
              resolve(true);
            } else if (state.status === 'disconnected') {
              clearTimeout(timeout);
              unsub();
              resolve(false);
            }
          });
        });
        console.log(`[CalReboot] Full connection: ${connected}`);
      }

      // Clear reboot overlay -- pendingPage subscription in Layout handles navigation
      useConnectionStore.getState().setRebootProgress(null);
      rebootInProgressRef.current = false;

      if (!portOpened) {
        // Give up -- user can reconnect manually
        useConnectionStore.getState().setPendingPage(null);
      }
    };

    doRebootAndReconnect();
  }, [accelState]);

  useEffect(() => {
    if (accelState === 'sampling') {
      setSamplingStalled(false);
      stallTimerRef.current = setTimeout(() => setSamplingStalled(true), 12000);
    } else {
      setSamplingStalled(false);
      if (stallTimerRef.current) {
        clearTimeout(stallTimerRef.current);
        stallTimerRef.current = null;
      }
    }
    return () => {
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
    };
  }, [accelState]);

  const handleRetryConfirm = useCallback(async () => {
    if (!currentPosition) return;
    setSamplingStalled(false);
    console.log('[AccelCal UI] Retrying position confirmation...');
    await connectionManager.confirmAccelCalPosition(ACCEL_POSITION_INDEX[currentPosition]);
    // Reset stall timer
    if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
    stallTimerRef.current = setTimeout(() => setSamplingStalled(true), 12000);
  }, [currentPosition]);

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
          <Crosshair size={24} className="text-accent" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">Accelerometer</h2>
          <p className="text-base text-muted">6-position calibration and level trim</p>
        </div>
        <CalStatusBadge calibrated={accelStatus.calibrated} activeState={accelState} />
      </div>

      <div className="p-6 space-y-5">
        {/* Status banner */}
        {accelState === 'idle' && (
          <CalStatusBanner
            calibrated={accelStatus.calibrated}
            calibratedText={`Calibrated -- offsets [${accelStatus.ofsX.toFixed(2)}, ${accelStatus.ofsY.toFixed(2)}, ${accelStatus.ofsZ.toFixed(2)}]`}
            uncalibratedText="Accelerometer has not been calibrated. Calibration is required before flight."
          />
        )}

        {accelState === 'done' && (
          <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3.5 py-2.5">
            <CheckCircle2 size={14} className="text-green-400 shrink-0" />
            <p className="text-[13px] text-green-200 leading-relaxed">
              Accelerometer calibration successful!
            </p>
          </div>
        )}

        {accelState === 'failed' && (
          <div className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3.5 py-2.5">
            <XCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-[13px] text-red-200 leading-relaxed">
              Calibration failed. Ensure the vehicle was held completely still in each position.
            </p>
          </div>
        )}

        {/* ── Position Grid -- 6 panels overview ────────────────── */}
        <CalibrationPositionGrid
          vehicleType={vehicleType}
          completedPositions={completedPositions}
          currentPosition={currentPosition}
          isActive={isActive}
          allCalibrated={accelStatus.calibrated && !isActive}
        />

        {/* ── Flashcard -- one big position at a time ──────────────── */}
        {isActive && currentPosition && (
          <CalibrationFlashcard
            position={currentPosition}
            vehicleType={vehicleType}
            accelState={accelState}
            onConfirm={handleConfirmPosition}
            samplingStalled={samplingStalled}
            onRetryConfirm={handleRetryConfirm}
          />
        )}

        {accelState === 'starting' && (
          <div className="flex items-center gap-3 rounded-lg bg-surface-1 px-4 py-3">
            <Loader2 size={16} className="text-accent animate-spin" />
            <p className="text-base text-muted">
              Starting calibration… waiting for flight controller.
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          {(accelState === 'idle' || accelState === 'done' || accelState === 'failed') && (
            <button onClick={handleStart} className="btn btn-primary flex items-center gap-2">
              <Play size={14} />
              {accelState === 'idle' && !accelStatus.calibrated
                ? 'Start Calibration' : 'Calibrate Again'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Calibration Flashcard ──────────────────────────────────────────────
// One large card showing the current calibration position.
// Big icon + instruction + confirm button all in one focused view.

function CalibrationFlashcard({
  position,
  vehicleType,
  accelState,
  onConfirm,
  samplingStalled,
  onRetryConfirm,
}: {
  position: AccelPosition;
  vehicleType: VehicleType;
  accelState: string;
  onConfirm: () => void;
  samplingStalled: boolean;
  onRetryConfirm: () => void;
}) {
  const isWaiting = accelState === 'waitingForPosition';
  const isSampling = accelState === 'sampling';

  return (
    <div className={`rounded-xl border-2 px-6 py-5 transition-all ${
      isWaiting
        ? 'border-accent bg-accent/5 ring-2 ring-accent/20'
        : 'border-accent/40 bg-accent/5'
    }`}>
      {/* Position title */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-extrabold text-accent">
          {ACCEL_POSITION_LABELS[position]}
        </h3>
        {isSampling && (
          <span className="flex items-center gap-2 text-accent text-sm font-semibold">
            <Loader2 size={16} className="animate-spin" /> Sampling…
          </span>
        )}
      </div>

      {/* 3D model viewer */}
      <div className="flex justify-center my-2">
        <Calibration3DViewer position={position} vehicleType={vehicleType} />
      </div>

      {/* Instruction + action */}
      <div className="mt-4 space-y-3">
        <p className="text-base text-foreground text-center font-medium">
          {ACCEL_POSITION_INSTRUCTIONS[position]}
        </p>

        {isWaiting && (
          <div className="flex justify-center">
            <button
              onClick={onConfirm}
              className="btn btn-primary flex items-center gap-2"
            >
              <Check size={14} />
              Confirm Position
            </button>
          </div>
        )}

        {isSampling && (
          <p className="text-sm text-muted text-center">
            Hold the vehicle completely still…
          </p>
        )}

        {samplingStalled && (
          <div className="flex items-center justify-center gap-3 pt-1">
            <AlertTriangle size={14} className="text-amber-400 shrink-0" />
            <p className="text-[13px] text-amber-200">
              FC hasn't advanced -- confirm may not have been received.
            </p>
            <button onClick={onRetryConfirm} className="btn btn-ghost text-[13px] px-3 py-1">
              <RefreshCw size={12} className="mr-1.5" /> Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


// ─── Compass Calibration ────────────────────────────────────────────────────

function CompassCalibrationCard() {
  const magState = useCalibrationStore((s) => s.magState);
  const magProgress = useCalibrationStore((s) => s.magProgress);
  const magReports = useCalibrationStore((s) => s.magReports);
  const compassStatus = useCompassStatus();
  const [starting, setStarting] = useState(false);

  const handleStart = useCallback(async () => {
    setStarting(true);
    useCalibrationStore.getState().resetMag();
    useCalibrationStore.getState().setMagState('running');
    try {
      const result = await connectionManager.startCompassCalibration();
      if (result !== MavResult.ACCEPTED && result !== MavResult.IN_PROGRESS) {
        useCalibrationStore.getState().setMagState('failed');
      }
    } catch {
      useCalibrationStore.getState().setMagState('failed');
    }
    setStarting(false);
  }, []);

  const handleCancel = useCallback(async () => {
    await connectionManager.cancelCompassCalibration();
    useCalibrationStore.getState().resetMag();
  }, []);

  const isRunning = magState === 'running';
  const isDone = magState === 'done';
  const isFailed = magState === 'failed';
  const compassIds = Array.from(
    new Set([...magProgress.keys(), ...magReports.keys()])
  ).sort();

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
          compassStatus.present ? 'bg-accent/10' : 'bg-surface-2'
        }`}>
          <Compass size={16} className={compassStatus.present ? 'text-accent' : 'text-subtle'} />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">Compass</h2>
          <p className="text-base text-muted">
            {compassStatus.present
              ? 'Magnetometer calibration -- rotate the vehicle in all orientations'
              : 'No compass detected on this flight controller'}
          </p>
        </div>
        {compassStatus.present && (
          <CalStatusBadge calibrated={compassStatus.calibrated} activeState={magState === 'running' ? 'running' : magState} />
        )}
      </div>

      <div className="p-6 space-y-5">
        {!compassStatus.present && (
          <div className="flex items-start gap-2 rounded-lg bg-surface-1 px-3.5 py-2.5">
            <Info size={14} className="text-subtle mt-0.5 shrink-0" />
            <p className="text-[13px] text-muted leading-relaxed">
              The SYS_STATUS bitmask reports no magnetometer hardware present.
              If you've connected an external compass, ensure it's wired correctly
              and the appropriate COMPASS_DEV_ID parameter is set.
            </p>
          </div>
        )}

        {compassStatus.present && (
          <>
            {magState === 'idle' && (
              <>
                <CalStatusBanner
                  calibrated={compassStatus.calibrated}
                  calibratedText={`Calibrated -- offsets [${compassStatus.ofsX.toFixed(0)}, ${compassStatus.ofsY.toFixed(0)}, ${compassStatus.ofsZ.toFixed(0)}]`}
                  uncalibratedText="Compass has not been calibrated. Required for accurate heading."
                />
                <p className="text-base text-muted leading-relaxed">
                  Compass calibration requires rotating the vehicle through all orientations until
                  every section of the 3D sphere is covered. Move away from metal objects, motors,
                  and power lines before starting. Results auto-save on success.
                </p>
                <button
                  onClick={handleStart}
                  disabled={starting}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {starting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                  {starting ? 'Starting…' : compassStatus.calibrated ? 'Calibrate Again' : 'Start Compass Calibration'}
                </button>
              </>
            )}

            {isRunning && (
              <div className="space-y-4">
                <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3.5 py-2.5">
                  <RotateCcw size={14} className="text-amber-400 mt-0.5 shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
                  <p className="text-[13px] text-amber-200 leading-relaxed">
                    Slowly rotate the vehicle through all orientations -- roll, pitch, and yaw.
                    Think of tracing every point on the surface of a sphere.
                  </p>
                </div>
                {compassIds.map((id) => (
                  <CompassProgressBar
                    key={id}
                    compassId={id}
                    completionPct={magProgress.get(id)?.completionPct ?? 0}
                    calStatus={magProgress.get(id)?.calStatus ?? MagCalStatus.NOT_STARTED}
                  />
                ))}
                {compassIds.length === 0 && (
                  <div className="flex items-center gap-2 text-base text-muted">
                    <Loader2 size={14} className="animate-spin" /> Waiting for compass data…
                  </div>
                )}
                <button onClick={handleCancel} className="btn btn-danger flex items-center gap-2">
                  <Square size={14} /> Cancel Calibration
                </button>
              </div>
            )}

            {isDone && (
              <div className="space-y-4">
                <div className="flex items-start gap-2 rounded-lg bg-green-500/10 px-3.5 py-2.5">
                  <Check size={14} className="text-green-400 mt-0.5 shrink-0" />
                  <p className="text-[13px] text-green-200 leading-relaxed">
                    Compass calibration successful! Results auto-saved. A reboot is recommended.
                  </p>
                </div>
                {Array.from(magReports.entries()).map(([id, report]) => (
                  <CompassResultRow key={id} compassId={id} report={report} />
                ))}
                <button onClick={() => useCalibrationStore.getState().resetMag()} className="btn btn-ghost flex items-center gap-2">
                  <RefreshCw size={14} /> Calibrate Again
                </button>
              </div>
            )}

            {isFailed && (
              <div className="space-y-4">
                <div className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3.5 py-2.5">
                  <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="text-[13px] text-red-200 leading-relaxed">
                    Compass calibration failed. Try again in a different location, away from
                    metal and electromagnetic interference.
                  </p>
                </div>
                {Array.from(magReports.entries()).map(([id, report]) => (
                  <CompassResultRow key={id} compassId={id} report={report} />
                ))}
                <button onClick={() => useCalibrationStore.getState().resetMag()} className="btn btn-primary flex items-center gap-2">
                  <RefreshCw size={14} /> Try Again
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Compass Sub-Components ─────────────────────────────────────────────────

function CompassProgressBar({ compassId, completionPct, calStatus }: {
  compassId: number; completionPct: number; calStatus: MagCalStatus;
}) {
  const pct = Math.min(100, Math.max(0, completionPct));
  const statusLabel =
    calStatus === MagCalStatus.RUNNING_STEP_ONE ? 'Step 1' :
    calStatus === MagCalStatus.RUNNING_STEP_TWO ? 'Step 2' :
    calStatus === MagCalStatus.SUCCESS ? 'Done' :
    calStatus === MagCalStatus.FAILED ? 'Failed' : 'Starting';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[13px]">
        <span className="font-medium text-foreground">
          Compass {compassId + 1}
          <span className="ml-2 text-subtle font-normal">{statusLabel}</span>
        </span>
        <span className="text-muted tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: pct >= 100 ? 'var(--color-success)' : 'var(--color-accent)',
          }}
        />
      </div>
    </div>
  );
}

function CompassResultRow({ compassId, report }: {
  compassId: number;
  report: { calStatus: MagCalStatus; fitness: number; ofsX: number; ofsY: number; ofsZ: number };
}) {
  const success = report.calStatus === MagCalStatus.SUCCESS;
  const statusText =
    report.calStatus === MagCalStatus.SUCCESS ? 'Success' :
    report.calStatus === MagCalStatus.BAD_ORIENTATION ? 'Bad orientation' :
    report.calStatus === MagCalStatus.BAD_RADIUS ? 'Bad radius' : 'Failed';

  return (
    <div className="flex items-center gap-3 rounded-lg bg-surface-1 px-3.5 py-2.5">
      {success ? <CheckCircle2 size={16} className="text-green-400 shrink-0" /> : <XCircle size={16} className="text-red-400 shrink-0" />}
      <div className="flex-1 text-[13px]">
        <span className="font-medium text-foreground">Compass {compassId + 1}</span>
        <span className={`ml-2 ${success ? 'text-green-400' : 'text-red-400'}`}>{statusText}</span>
      </div>
      <div className="text-[13px] text-muted tabular-nums space-x-3">
        <span>Fitness: {report.fitness.toFixed(1)} mG</span>
        <span>Offsets: [{report.ofsX.toFixed(0)}, {report.ofsY.toFixed(0)}, {report.ofsZ.toFixed(0)}]</span>
      </div>
    </div>
  );
}

// ─── Shared Components ──────────────────────────────────────────────────────

function CalStatusBadge({ calibrated, activeState }: { calibrated: boolean; activeState: string }) {
  if (activeState === 'done') {
    return <span className="flex items-center gap-1.5 text-[13px] font-medium text-green-400"><Check size={12} /> Calibrated</span>;
  }
  if (activeState !== 'idle' && activeState !== 'done' && activeState !== 'failed') {
    return (
      <span className="flex items-center gap-1.5 text-[13px] font-medium text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" /> Calibrating
      </span>
    );
  }
  if (activeState === 'failed') {
    return <span className="flex items-center gap-1.5 text-[13px] font-medium text-red-400"><AlertTriangle size={12} /> Failed</span>;
  }
  if (calibrated) {
    return <span className="flex items-center gap-1.5 text-[13px] font-medium text-green-400"><Check size={12} /> Calibrated</span>;
  }
  return <span className="flex items-center gap-1.5 text-[13px] font-medium text-amber-400"><AlertTriangle size={12} /> Not calibrated</span>;
}

function CalStatusBanner({ calibrated, calibratedText, uncalibratedText }: {
  calibrated: boolean; calibratedText: string; uncalibratedText: string;
}) {
  if (calibrated) {
    return (
      <div className="flex items-start gap-2 rounded-lg bg-green-500/10 px-3.5 py-2.5">
        <CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" />
        <p className="text-[13px] text-green-200 leading-relaxed">{calibratedText}</p>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3.5 py-2.5">
      <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
      <p className="text-[13px] text-amber-200 leading-relaxed">{uncalibratedText}</p>
    </div>
  );
}

// ─── Level Trim Card ──────────────────────────────────────────────────────

function LevelTrimCard() {
  const levelStatus = useLevelTrimStatus();
  const [levelBusy, setLevelBusy] = useState(false);
  const [levelResult, setLevelResult] = useState<'success' | 'failed' | null>(null);
  const accelState = useCalibrationStore((s) => s.accelState);
  const isCalActive = accelState !== 'idle' && accelState !== 'done' && accelState !== 'failed';

  const handleLevelCal = useCallback(async () => {
    setLevelBusy(true);
    setLevelResult(null);
    try {
      const result = await connectionManager.calibrateLevel();
      setLevelResult(result === MavResult.ACCEPTED ? 'success' : 'failed');
    } catch {
      setLevelResult('failed');
    }
    setLevelBusy(false);
  }, []);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
          <MoveHorizontal size={16} className="text-accent" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">Level Trim</h2>
          <p className="text-base text-muted">Compensates for flight controller mounting angle</p>
        </div>
        {levelStatus.trimmed && (
          <span className="flex items-center gap-1.5 text-[13px] font-medium text-green-400">
            <CheckCircle2 size={12} /> Trimmed
          </span>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <p className="flex-1 text-base text-muted leading-relaxed">
            Place the vehicle level in its normal flight attitude and press calibrate.
            {levelStatus.trimmed && (
              <span className="ml-1.5 text-success">
                Current: [{(levelStatus.trimX * 180 / Math.PI).toFixed(1)}°, {(levelStatus.trimY * 180 / Math.PI).toFixed(1)}°]
              </span>
            )}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            {levelResult === 'success' && <CheckCircle2 size={16} className="text-green-400" />}
            {levelResult === 'failed' && <XCircle size={16} className="text-red-400" />}
            <button
              onClick={handleLevelCal}
              disabled={levelBusy || isCalActive}
              className="btn btn-primary flex items-center gap-2"
            >
              {levelBusy ? <Loader2 size={14} className="animate-spin" /> : <MoveHorizontal size={14} />}
              {levelBusy ? 'Calibrating…' : 'Calibrate Level'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reboot Card ────────────────────────────────────────────────────────────

function RebootCard() {
  const [rebooting, setRebooting] = useState(false);
  const connectionStatus = useConnectionStore((s) => s.status);

  const handleReboot = useCallback(async () => {
    const confirmed = window.confirm(
      'Reboot the flight controller? The connection will be lost and you will need to reconnect.'
    );
    if (!confirmed) return;
    setRebooting(true);
    try { await connectionManager.rebootFlightController(); } catch { /* disconnect expected */ }
  }, []);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
          <Power size={16} className="text-red-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">Reboot Flight Controller</h2>
          <p className="text-base text-muted">Required after calibration or major parameter changes</p>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <p className="flex-1 text-base text-muted leading-relaxed">
            Some parameter changes and all calibrations require a reboot to take effect.
            The connection will drop and you'll need to reconnect after the FC restarts (typically 3–5 seconds).
          </p>
          <button
            onClick={handleReboot}
            disabled={rebooting || connectionStatus !== 'connected'}
            className="btn btn-danger flex items-center gap-2 shrink-0"
          >
            {rebooting ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />}
            {rebooting ? 'Rebooting…' : 'Reboot FC'}
          </button>
        </div>
      </div>
    </div>
  );
}
