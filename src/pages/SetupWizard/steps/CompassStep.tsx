/**
 * CompassStep.tsx -- Wizard step for compass (magnetometer) calibration.
 *
 * Shows a coverage ring (10 sphere sections) and overall percentage.
 * Uses directionX/Y/Z from MAG_CAL_PROGRESS for a "rotate this way" hint.
 * No orientation labels -- the compass may be mounted at any angle.
 *
 * Completion gate: mag calibration succeeds OR compass already calibrated.
 * Skippable for aircraft without a compass.
 */

import { useEffect, useCallback, useState, useMemo } from 'react';
import {
  Play,
  Square,
  Check,
  AlertTriangle,
  Loader2,
  XCircle,
  RefreshCw,
  Compass,
  Info,
  RotateCcw,
} from 'lucide-react';
import { useWizardStore } from '../wizardStore';
import { useParameterStore } from '@/store/parameterStore';
import { useTelemetryStore } from '@/store/telemetryStore';
import { connectionManager } from '@/mavlink/connection';
import { MavResult, MagCalStatus, type MagCalProgress } from '@/mavlink/messages';
import { useCalibrationStore } from '@/store/calibrationStore';

/* ------------------------------------------------------------------ */
/*  Compass status hook                                                */
/* ------------------------------------------------------------------ */

const MAV_SYS_STATUS_SENSOR_3D_MAG = 1 << 2;

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

/* ------------------------------------------------------------------ */
/*  Coverage ring -- 10 sphere sections as SVG ring segments           */
/* ------------------------------------------------------------------ */

function CoverageRing({ mask, pct }: { mask?: number[]; pct: number }) {
  const sections = mask && mask.length >= 10 ? mask : new Array(10).fill(0);
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 78;
  const innerR = 52;
  const gap = 0.03; // radians gap between segments

  const segAngle = (2 * Math.PI) / 10;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {sections.map((val, i) => {
          const startAngle = i * segAngle - Math.PI / 2 + gap / 2;
          const endAngle = (i + 1) * segAngle - Math.PI / 2 - gap / 2;

          const x1o = cx + outerR * Math.cos(startAngle);
          const y1o = cy + outerR * Math.sin(startAngle);
          const x2o = cx + outerR * Math.cos(endAngle);
          const y2o = cy + outerR * Math.sin(endAngle);
          const x1i = cx + innerR * Math.cos(endAngle);
          const y1i = cy + innerR * Math.sin(endAngle);
          const x2i = cx + innerR * Math.cos(startAngle);
          const y2i = cy + innerR * Math.sin(startAngle);

          const d = [
            `M ${x1o} ${y1o}`,
            `A ${outerR} ${outerR} 0 0 1 ${x2o} ${y2o}`,
            `L ${x1i} ${y1i}`,
            `A ${innerR} ${innerR} 0 0 0 ${x2i} ${y2i}`,
            'Z',
          ].join(' ');

          const fill = val >= 0.95
            ? '#22c55e'  // green -- done
            : val > 0.3
              ? '#ffaa2a' // accent -- partial
              : val > 0
                ? '#ffaa2a40' // accent faint -- barely started
                : '#2a2825'; // surface -- empty

          return <path key={i} d={d} fill={fill} />;
        })}

        {/* Center text */}
        <text
          x={cx} y={cy - 6}
          textAnchor="middle"
          className="fill-foreground"
          style={{ fontSize: 28, fontWeight: 800 }}
        >
          {pct}%
        </text>
        <text
          x={cx} y={cy + 14}
          textAnchor="middle"
          className="fill-muted"
          style={{ fontSize: 11 }}
        >
          coverage
        </text>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Direction hint from MAG_CAL_PROGRESS                               */
/* ------------------------------------------------------------------ */

function DirectionHint({ magProgress, compassIds }: {
  magProgress: Map<number, MagCalProgress>;
  compassIds: number[];
}) {
  const firstId = compassIds[0];
  if (firstId === undefined) return null;
  const progress = magProgress.get(firstId);
  if (!progress) return null;

  const { directionX: dx, directionY: dy, directionZ: dz } = progress;
  const mag = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (mag < 0.1) return null;

  // Convert to a simple human hint -- which axis to rotate around
  const nx = Math.abs(dx / mag);
  const ny = Math.abs(dy / mag);
  const nz = Math.abs(dz / mag);

  let hint: string;
  if (nz > nx && nz > ny) {
    hint = 'Try rotating around the vertical axis (yaw)';
  } else if (nx > ny) {
    hint = 'Try tilting or rolling the aircraft';
  } else {
    hint = 'Try pitching the nose up or down';
  }

  return (
    <div className="text-center text-sm text-accent font-medium py-1">
      {hint}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface CompassStepProps {
  onCanAdvanceChange: (canAdvance: boolean) => void;
}

export function CompassStep({ onCanAdvanceChange }: CompassStepProps) {
  const markComplete = useWizardStore((s) => s.markComplete);
  const compassStatus = useCompassStatus();

  const magState = useCalibrationStore((s) => s.magState);
  const magProgress = useCalibrationStore((s) => s.magProgress);
  const magReports = useCalibrationStore((s) => s.magReports);

  const [starting, setStarting] = useState(false);

  const isRunning = magState === 'running';
  const isDone = magState === 'done';
  const isFailed = magState === 'failed';

  const compassIds = Array.from(
    new Set([...magProgress.keys(), ...magReports.keys()])
  ).sort();

  // Overall completion
  const overallPct = useMemo(() => {
    if (compassIds.length === 0) return 0;
    let sum = 0;
    for (const id of compassIds) {
      sum += magProgress.get(id)?.completionPct ?? 0;
    }
    return Math.round(sum / compassIds.length);
  }, [compassIds, magProgress]);

  // First compass mask for the ring
  const firstMask = compassIds.length > 0
    ? magProgress.get(compassIds[0])?.completionMask
    : undefined;

  // ── Handlers ───────────────────────────────────────────────────

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

  const handleReset = useCallback(() => {
    useCalibrationStore.getState().resetMag();
  }, []);

  // ── Advance gate ───────────────────────────────────────────────

  useEffect(() => {
    const canPass = isDone || compassStatus.calibrated;
    onCanAdvanceChange(canPass);
    if (canPass) markComplete('compass');
  }, [isDone, compassStatus.calibrated, onCanAdvanceChange, markComplete]);

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">

      <div>
        <h2 className="text-xl font-bold text-foreground">Compass Calibration</h2>
        <p className="mt-1 text-sm text-muted">
          Rotate the aircraft through all orientations to calibrate the magnetometer.
          Move away from metal objects, motors, and power lines before starting.
        </p>
      </div>

      {/* No compass detected */}
      {!compassStatus.present && magState === 'idle' && (
        <div className="flex items-start gap-3 rounded border border-blue-500/30 bg-blue-900/15 px-4 py-3">
          <Info size={14} className="mt-0.5 shrink-0 text-blue-400" />
          <div>
            <p className="text-sm text-blue-300/90">
              No compass detected. If your aircraft doesn't have a magnetometer,
              you can skip this step.
            </p>
            <p className="mt-1 text-xs text-blue-300/60">
              External GPS modules with built-in compasses are detected after connection.
            </p>
          </div>
        </div>
      )}

      {/* Already calibrated */}
      {compassStatus.calibrated && magState === 'idle' && (
        <div className="flex items-center gap-3 rounded-lg border border-success/40 bg-success/10 px-5 py-4">
          <Check size={20} className="shrink-0 text-success" />
          <div>
            <p className="text-sm font-bold text-success">Compass is calibrated</p>
            <p className="mt-0.5 text-xs text-success/80">
              Offsets: [{compassStatus.ofsX.toFixed(0)}, {compassStatus.ofsY.toFixed(0)}, {compassStatus.ofsZ.toFixed(0)}].
              You can continue or re-calibrate.
            </p>
          </div>
        </div>
      )}

      {/* Idle -- start */}
      {magState === 'idle' && (
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded border border-border bg-surface-0 px-4 py-3">
            <Compass size={14} className="mt-0.5 shrink-0 text-muted" />
            <p className="text-sm text-muted">
              Slowly rotate the aircraft in all directions -- roll, pitch, and yaw.
              Think of painting every point on the surface of a sphere. The ring
              below will fill in as you cover new orientations.
            </p>
          </div>

          <button
            onClick={handleStart}
            disabled={starting}
            className="btn btn-primary gap-2 w-full py-2.5 text-base"
          >
            {starting
              ? <Loader2 size={14} className="animate-spin" />
              : <Play size={14} />}
            {starting ? 'Starting...'
              : compassStatus.calibrated ? 'Calibrate Again'
              : 'Start Compass Calibration'}
          </button>
        </div>
      )}

      {/* Running */}
      {isRunning && (
        <div className="space-y-4">
          {/* Coverage ring + direction hint */}
          <div className="flex flex-col items-center py-2">
            <CoverageRing mask={firstMask} pct={overallPct} />
            <DirectionHint magProgress={magProgress} compassIds={compassIds} />
          </div>

          {/* Instruction */}
          <div className="flex items-center gap-2.5 rounded-lg bg-accent/5 border border-accent/20 px-4 py-3">
            <RotateCcw size={14} className="shrink-0 text-accent animate-spin" style={{ animationDuration: '3s' }} />
            <p className="text-sm text-accent/90">
              Keep rotating slowly. Each ring segment represents a region of the sphere.
              All segments must be filled for calibration to complete.
            </p>
          </div>

          {/* Per-compass compact bars */}
          {compassIds.length > 1 && compassIds.map((id) => {
            const progress = magProgress.get(id);
            const pct = Math.min(100, Math.max(0, progress?.completionPct ?? 0));
            return (
              <div key={id} className="flex items-center gap-3">
                <span className="text-xs font-medium text-foreground w-20">
                  Compass {id + 1}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct >= 100 ? 'var(--color-success)' : 'var(--color-accent)',
                    }}
                  />
                </div>
                <span className="text-xs text-muted tabular-nums w-8 text-right">{pct}%</span>
              </div>
            );
          })}

          {compassIds.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-muted py-4">
              <Loader2 size={14} className="animate-spin" /> Waiting for compass data...
            </div>
          )}

          <button onClick={handleCancel} className="btn bg-danger text-white hover:bg-danger/80 gap-2 w-full">
            <Square size={14} /> Cancel Calibration
          </button>
        </div>
      )}

      {/* Done */}
      {isDone && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-success/40 bg-success/10 px-5 py-4">
            <Check size={20} className="shrink-0 text-success" />
            <div>
              <p className="text-sm font-bold text-success">Compass calibration successful!</p>
              <p className="mt-0.5 text-xs text-success/80">
                Results auto-saved to the flight controller.
              </p>
            </div>
          </div>

          {Array.from(magReports.entries()).map(([id, report]) => {
            const success = report.calStatus === MagCalStatus.SUCCESS;
            return (
              <div key={id} className="flex items-center gap-3 rounded bg-surface-1 px-4 py-2.5">
                {success
                  ? <Check size={14} className="text-success shrink-0" />
                  : <XCircle size={14} className="text-danger shrink-0" />}
                <span className="text-sm font-medium text-foreground">Compass {id + 1}</span>
                <span className="flex-1 text-xs text-muted tabular-nums">
                  Fitness: {report.fitness.toFixed(1)} mG --
                  Offsets: [{report.ofsX.toFixed(0)}, {report.ofsY.toFixed(0)}, {report.ofsZ.toFixed(0)}]
                </span>
              </div>
            );
          })}

          <button onClick={handleReset} className="btn btn-ghost gap-2">
            <RefreshCw size={14} /> Calibrate Again
          </button>
        </div>
      )}

      {/* Failed */}
      {isFailed && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded border border-danger/30 bg-danger/5 px-4 py-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-danger" />
            <div>
              <p className="text-sm font-semibold text-danger">Compass calibration failed</p>
              <p className="mt-0.5 text-xs text-muted">
                Try again in a different location, away from metal and electromagnetic
                interference. Move the vehicle more slowly through all orientations.
              </p>
            </div>
          </div>

          {Array.from(magReports.entries()).map(([id, report]) => {
            const statusText =
              report.calStatus === MagCalStatus.SUCCESS ? 'Success' :
              report.calStatus === MagCalStatus.BAD_ORIENTATION ? 'Bad orientation' :
              report.calStatus === MagCalStatus.BAD_RADIUS ? 'Bad radius' : 'Failed';
            return (
              <div key={id} className="flex items-center gap-3 rounded bg-surface-1 px-4 py-2.5">
                <XCircle size={14} className="text-danger shrink-0" />
                <span className="text-sm text-foreground">Compass {id + 1}: {statusText}</span>
              </div>
            );
          })}

          <button onClick={handleReset} className="btn btn-primary gap-2">
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      )}

      {/* Hint */}
      <div className="flex items-start gap-2 rounded border border-border bg-surface-0 px-4 py-2.5">
        <Info size={13} className="mt-0.5 shrink-0 text-muted" />
        <p className="text-xs text-muted">
          If calibration keeps failing, check for nearby sources of magnetic interference
          (motors, battery wires, metal surfaces). GPS modules with built-in compasses
          should be mounted away from power wiring. You can skip this step and calibrate
          from the Calibration page later.
        </p>
      </div>
    </div>
  );
}
