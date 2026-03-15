/**
 * InitialTuneStep.tsx -- Wizard step for initial tune parameters.
 *
 * Based on ArduPilot's "Setting the Aircraft Up for Tuning" guide.
 * Asks for prop size, then calculates initial filter, acceleration,
 * and thrust expo values. Also prepares AutoTune by assigning it to
 * a flight mode slot and explaining the procedure.
 *
 * This step applies to copters and quadplanes only. Planes use AUTOTUNE
 * mode differently (AUTOTUNE_LEVEL) and don't need these PID params.
 *
 * Reference: https://ardupilot.org/copter/docs/setting-up-for-tuning.html
 */

import { useEffect, useState, useMemo } from 'react';
import {
  Sliders,
  Check,
  Info,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { useWizardStore } from '../wizardStore';
import { useParameterStore } from '@/store/parameterStore';
import { useVehicleStore } from '@/store/vehicleStore';

/* ------------------------------------------------------------------ */
/*  Prop size presets                                                   */
/* ------------------------------------------------------------------ */

interface PropPreset {
  id: string;
  label: string;
  inches: number;
  description: string;
}

const PROP_PRESETS: PropPreset[] = [
  { id: '3',  label: '3"',   inches: 3,  description: 'Micro / cinewhoop' },
  { id: '5',  label: '5"',   inches: 5,  description: 'Freestyle / racing' },
  { id: '7',  label: '7"',   inches: 7,  description: 'Long range quad' },
  { id: '10', label: '10"',  inches: 10, description: 'Medium quad / hex' },
  { id: '13', label: '13"',  inches: 13, description: 'Photography / heavy lift' },
  { id: '15', label: '15"',  inches: 15, description: 'Large copter' },
  { id: '18', label: '18"',  inches: 18, description: 'Heavy lift / agriculture' },
  { id: '20', label: '20"+', inches: 20, description: 'Very large / industrial' },
];

/* ------------------------------------------------------------------ */
/*  Parameter calculation from prop size                               */
/*                                                                     */
/*  Based on ArduPilot wiki "Setting up for Tuning":                   */
/*  - INS_GYRO_FILTER: 80Hz (5"), 40Hz (10"), 20Hz (20"+)             */
/*  - INS_ACCEL_FILTER: 10Hz (all sizes)                               */
/*  - MOT_THST_EXPO: 0.55 (5"), 0.65 (10"), 0.75 (20"+)              */
/*  - ATC_ACCEL_P/R_MAX: 110000 (10"), 50000 (20"), 20000 (30")       */
/*  - ATC_ACCEL_Y_MAX: 27000 (10"), 18000 (20"), 9000 (30")           */
/*  - Rate filter D/T: INS_GYRO_FILTER / 2                             */
/*  Prop noise profiles from real tuning data (INAV Toolkit).               */
/*  Filter ranges depend on PROP diameter -- that's what determines where   */
/*  vibration energy lands in the spectrum. We use the conservative (low)   */
/*  end of the gyro filter range as the initial value for safety.           */
/*                                                                          */
/*  ArduPilot-specific params (accel limits, thrust expo) still use the     */
/*  wiki recommendations since those are validated in the ArduPilot         */
/*  ecosystem specifically.                                                 */
/* ------------------------------------------------------------------ */

/** Prop noise profile -- filter ranges by prop diameter. */
interface PropNoiseProfile {
  gyroLpfRange: [number, number];   // [min, max] Hz
  filterSafety: number;             // 0-1 safety margin multiplier
}

const PROP_NOISE_PROFILES: Record<number, PropNoiseProfile> = {
  3:  { gyroLpfRange: [80, 350],  filterSafety: 0.80 },
  4:  { gyroLpfRange: [70, 320],  filterSafety: 0.80 },
  5:  { gyroLpfRange: [60, 300],  filterSafety: 0.80 },
  6:  { gyroLpfRange: [50, 250],  filterSafety: 0.78 },
  7:  { gyroLpfRange: [40, 200],  filterSafety: 0.75 },
  8:  { gyroLpfRange: [35, 180],  filterSafety: 0.72 },
  9:  { gyroLpfRange: [30, 150],  filterSafety: 0.70 },
  10: { gyroLpfRange: [25, 120],  filterSafety: 0.68 },
  12: { gyroLpfRange: [20, 100],  filterSafety: 0.65 },
};

function getNearestProfile(propInches: number): PropNoiseProfile {
  const keys = Object.keys(PROP_NOISE_PROFILES).map(Number).sort((a, b) => a - b);
  const nearest = keys.reduce((prev, curr) =>
    Math.abs(curr - propInches) < Math.abs(prev - propInches) ? curr : prev
  );
  return PROP_NOISE_PROFILES[nearest];
}

function lerp(x: number, x0: number, y0: number, x1: number, y1: number): number {
  if (x <= x0) return y0;
  if (x >= x1) return y1;
  return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
}

interface TuneParams {
  INS_GYRO_FILTER: number;
  INS_ACCEL_FILTER: number;
  MOT_THST_EXPO: number;
  ATC_ACCEL_P_MAX: number;
  ATC_ACCEL_R_MAX: number;
  ATC_ACCEL_Y_MAX: number;
  ATC_RAT_PIT_FLTD: number;
  ATC_RAT_PIT_FLTT: number;
  ATC_RAT_RLL_FLTD: number;
  ATC_RAT_RLL_FLTT: number;
  ATC_RAT_YAW_FLTE: number;
  ATC_RAT_YAW_FLTT: number;
  MOT_THST_HOVER: number;
}

function calculateTuneParams(propInches: number): TuneParams {
  const profile = getNearestProfile(propInches);

  // Gyro filter: use 1/3 of the way into the safe range (conservative).
  // The low end of gyroLpfRange is the absolute minimum, high end is max
  // before noise becomes a problem. We pick a safe starting point.
  const [lpfMin, lpfMax] = profile.gyroLpfRange;
  const gyroFilter = Math.round(lpfMin + (lpfMax - lpfMin) * 0.33 * profile.filterSafety);

  // Accel filter: always 10Hz per ArduPilot recommendation
  const accelFilter = 10;

  // Thrust expo: from ArduPilot wiki (prop-size dependent)
  // 0.55 for 5", 0.65 for 10", 0.75 for 20"+
  const thstExpo = Math.round(lerp(propInches, 5, 0.55, 20, 0.75) * 100) / 100;

  // Acceleration limits from ArduPilot wiki
  // Pitch/Roll: 110000 for 10", 50000 for 20", 20000 for 30"
  const accelPR = Math.round(lerp(propInches, 5, 180000, 30, 20000));
  // Yaw: 27000 for 10", 18000 for 20", 9000 for 30"
  const accelY = Math.round(lerp(propInches, 5, 40000, 30, 9000));

  // Rate filters: gyro / 2 (ArduPilot recommendation)
  const rateFilter = Math.round(gyroFilter / 2);

  return {
    INS_GYRO_FILTER: gyroFilter,
    INS_ACCEL_FILTER: accelFilter,
    MOT_THST_EXPO: thstExpo,
    ATC_ACCEL_P_MAX: accelPR,
    ATC_ACCEL_R_MAX: accelPR,
    ATC_ACCEL_Y_MAX: accelY,
    ATC_RAT_PIT_FLTD: rateFilter,
    ATC_RAT_PIT_FLTT: rateFilter,
    ATC_RAT_RLL_FLTD: rateFilter,
    ATC_RAT_RLL_FLTT: rateFilter,
    ATC_RAT_YAW_FLTE: 2,
    ATC_RAT_YAW_FLTT: rateFilter,
    MOT_THST_HOVER: 0.25,
  };
}

/* ------------------------------------------------------------------ */
/*  Battery voltage params                                             */
/* ------------------------------------------------------------------ */

function calculateBatteryParams(cellCount: number): Record<string, number> {
  if (cellCount <= 0) return {};
  return {
    MOT_BAT_VOLT_MAX: Math.round(cellCount * 4.2 * 100) / 100,
    MOT_BAT_VOLT_MIN: Math.round(cellCount * 3.3 * 100) / 100,
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface InitialTuneStepProps {
  onCanAdvanceChange: (canAdvance: boolean) => void;
}

export function InitialTuneStep({ onCanAdvanceChange }: InitialTuneStepProps) {
  const markComplete = useWizardStore((s) => s.markComplete);
  const stageParams = useWizardStore((s) => s.stageParams);
  const stagedParams = useWizardStore((s) => s.stagedParams);
  const vehicleType = useVehicleStore((s) => s.type);
  const parameters = useParameterStore((s) => s.parameters);

  const [propSize, setPropSize] = useState<string | null>(null);
  const [manualCellCount, setManualCellCount] = useState<number | null>(null);

  // Detect cell count: manual override > staged BATT_LOW_VOLT inference > 0
  const inferredCells = useMemo(() => {
    const lowVolt = stagedParams['BATT_LOW_VOLT']
      ?? parameters.get('BATT_LOW_VOLT')?.value ?? 0;
    if (lowVolt > 0) return Math.round(lowVolt / 3.5);
    return 0;
  }, [stagedParams, parameters]);

  const cellCount = manualCellCount ?? inferredCells;

  // Check if AutoTune is already in a flight mode slot
  const autoTuneSlot = useMemo(() => {
    for (let i = 1; i <= 6; i++) {
      const val = stagedParams[`FLTMODE${i}`] ?? parameters.get(`FLTMODE${i}`)?.value;
      if (val === 15) return i; // 15 = AutoTune
    }
    return null;
  }, [stagedParams, parameters]);

  // Calculated tune params
  const tuneParams = useMemo(
    () => propSize ? calculateTuneParams(PROP_PRESETS.find(p => p.id === propSize)?.inches ?? 10) : null,
    [propSize],
  );

  const battParams = useMemo(
    () => calculateBatteryParams(cellCount),
    [cellCount],
  );

  // ── Auto-stage params when prop size changes ────────────────────

  useEffect(() => {
    if (!tuneParams) return;

    const params: Record<string, number> = { ...tuneParams, ...battParams };

    // Assign AutoTune to slot 6 if not already assigned
    if (!autoTuneSlot) {
      params['FLTMODE6'] = 15; // AutoTune
    }

    // Set AUTOTUNE_AXES to tune all (roll + pitch + yaw + yaw D = 15)
    params['AUTOTUNE_AXES'] = 15;

    stageParams(params);
  }, [tuneParams, battParams, autoTuneSlot, stageParams]);

  // ── Advance gate ───────────────────────────────────────────────

  useEffect(() => {
    // Can always advance (skippable), mark complete when prop selected
    onCanAdvanceChange(true);
    if (propSize) markComplete('initial_tune');
  }, [propSize, onCanAdvanceChange, markComplete]);

  // ── Plane-specific: show simplified message ────────────────────

  if (vehicleType === 'plane') {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <div>
          <h2 className="text-xl font-bold text-foreground">Initial Tune</h2>
          <p className="mt-1 text-sm text-muted">
            Fixed-wing aircraft use AUTOTUNE mode for in-flight tuning. No initial PID
            setup is needed -- ArduPilot's defaults work well for most planes.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded border border-blue-500/30 bg-blue-900/15 px-4 py-3">
          <Info size={14} className="mt-0.5 shrink-0 text-blue-400" />
          <div className="text-sm text-blue-300/90 space-y-2">
            <p>
              To tune your plane: fly in FBWA mode, then switch to AUTOTUNE.
              Fly straight and level for 2-3 minutes while the FC tunes roll and pitch.
            </p>
            <p>
              Set <span className="font-mono text-blue-200">AUTOTUNE_LEVEL</span> to
              control aggressiveness (6 is default, lower for slow/heavy planes, higher
              for agile ones).
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded border border-border bg-surface-0 px-4 py-2.5">
          <Info size={13} className="mt-0.5 shrink-0 text-muted" />
          <p className="text-xs text-muted">
            You can skip this step. Plane PID defaults are usually fine for a first flight.
          </p>
        </div>
      </div>
    );
  }

  // ── Copter / Quadplane UI ──────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">

      <div>
        <h2 className="text-xl font-bold text-foreground">Initial Tune</h2>
        <p className="mt-1 text-sm text-muted">
          Set initial filter and acceleration parameters based on your prop size.
          These get the PID controller into the right range for a safe first flight,
          before you run AutoTune for a refined tune.
        </p>
      </div>

      {/* Prop size selector */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground">Propeller size</label>
        <div className="grid grid-cols-4 gap-2">
          {PROP_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setPropSize(preset.id)}
              className={`rounded-lg border-2 px-3 py-2.5 text-center transition-all ${
                propSize === preset.id
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-surface-0 hover:border-accent/40'
              }`}
            >
              <div className="text-lg font-bold text-foreground">{preset.label}</div>
              <div className="text-[11px] text-muted">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Battery cell count */}
      {propSize && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Battery cell count</label>
          <div className="flex gap-2">
            {[3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => setManualCellCount(n)}
                className={`rounded-lg border-2 px-4 py-2 text-center transition-all ${
                  cellCount === n
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-surface-0 hover:border-accent/40'
                }`}
              >
                <div className="text-base font-bold text-foreground">{n}S</div>
              </button>
            ))}
          </div>
          {inferredCells > 0 && manualCellCount === null && (
            <p className="text-[12px] text-subtle">
              Detected {inferredCells}S from battery voltage settings. Click to change if incorrect.
            </p>
          )}
          {cellCount === 0 && (
            <p className="text-[12px] text-yellow-400">
              Select your battery cell count for voltage compensation parameters.
            </p>
          )}
        </div>
      )}

      {/* Calculated values preview */}
      {tuneParams && (
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
              <Sliders size={16} className="text-accent" />
              <h3 className="text-sm font-bold text-foreground">Suggested Parameters</h3>
            </div>

            <div className="divide-y divide-border">
              <ParamRow label="INS_GYRO_FILTER" value={tuneParams.INS_GYRO_FILTER} unit="Hz" description="Gyro low-pass filter" />
              <ParamRow label="INS_ACCEL_FILTER" value={tuneParams.INS_ACCEL_FILTER} unit="Hz" description="Accel low-pass filter" />
              <ParamRow label="MOT_THST_EXPO" value={tuneParams.MOT_THST_EXPO} description="Thrust curve expo" />
              <ParamRow label="MOT_THST_HOVER" value={tuneParams.MOT_THST_HOVER} description="Hover throttle estimate" />
              <ParamRow label="ATC_ACCEL_P/R_MAX" value={tuneParams.ATC_ACCEL_P_MAX} description="Pitch/Roll accel limit" />
              <ParamRow label="ATC_ACCEL_Y_MAX" value={tuneParams.ATC_ACCEL_Y_MAX} description="Yaw accel limit" />
              <ParamRow label="Rate filters (D/T)" value={tuneParams.ATC_RAT_PIT_FLTD} unit="Hz" description="Pitch/Roll/Yaw rate D & T filters" />
              {cellCount > 0 && (
                <>
                  <ParamRow label="MOT_BAT_VOLT_MAX" value={battParams.MOT_BAT_VOLT_MAX ?? 0} unit="V" description={`${cellCount}S max (4.2V/cell)`} />
                  <ParamRow label="MOT_BAT_VOLT_MIN" value={battParams.MOT_BAT_VOLT_MIN ?? 0} unit="V" description={`${cellCount}S min (3.3V/cell)`} />
                </>
              )}
            </div>
          </div>

          {/* AutoTune assignment info */}
          <div className="flex items-start gap-3 rounded border border-accent/30 bg-accent/5 px-4 py-3">
            <Zap size={14} className="mt-0.5 shrink-0 text-accent" />
            <div className="text-sm text-muted">
              {autoTuneSlot
                ? <span>AutoTune is already assigned to Flight Mode {autoTuneSlot}.</span>
                : <span>AutoTune will be assigned to <span className="text-foreground font-semibold">Flight Mode 6</span>.</span>}
              {' '}AUTOTUNE_AXES will be set to 15 (all axes).
            </div>
          </div>

          {/* Staged confirmation */}
          {propSize && (
            <div className="flex items-center gap-3 rounded-lg border border-success/40 bg-success/10 px-5 py-3">
              <Check size={16} className="shrink-0 text-success" />
              <p className="text-sm text-success">
                {Object.keys(tuneParams ?? {}).length + Object.keys(battParams).length + (autoTuneSlot ? 1 : 2)} parameters staged for the Review step.
              </p>
            </div>
          )}
        </div>
      )}

      {/* AutoTune procedure guide */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
          <Zap size={16} className="text-accent" />
          <h3 className="text-sm font-bold text-foreground">After First Flight: AutoTune Procedure</h3>
        </div>
        <div className="px-5 py-4 text-sm text-muted space-y-3">
          <p>
            Once you've verified the aircraft flies stably with these initial parameters:
          </p>
          <div className="space-y-2 text-foreground">
            <p><span className="inline-block w-6 text-accent font-bold">1.</span> Take off in AltHold mode and hover at 3-5 meters</p>
            <p><span className="inline-block w-6 text-accent font-bold">2.</span> Switch to AutoTune (mode slot {autoTuneSlot ?? 6} on your transmitter)</p>
            <p><span className="inline-block w-6 text-accent font-bold">3.</span> Center all sticks and let the FC twitch the aircraft</p>
            <p><span className="inline-block w-6 text-accent font-bold">4.</span> Use sticks to reposition if it drifts -- it will resume when you let go</p>
            <p><span className="inline-block w-6 text-accent font-bold">5.</span> Wait for "AutoTune complete" message (5-15 minutes per axis)</p>
            <p><span className="inline-block w-6 text-accent font-bold">6.</span> Land in AutoTune mode and disarm to save the tuned gains</p>
          </div>
          <div className="flex items-start gap-2 mt-3">
            <AlertTriangle size={12} className="mt-0.5 shrink-0 text-warning" />
            <p className="text-xs text-warning/90">
              AutoTune needs calm conditions (low wind). If the aircraft oscillates badly,
              switch out of AutoTune immediately to return to the original gains.
            </p>
          </div>
        </div>
      </div>

      {/* Hint */}
      <div className="flex items-start gap-2 rounded border border-border bg-surface-0 px-4 py-2.5">
        <Info size={13} className="mt-0.5 shrink-0 text-muted" />
        <p className="text-xs text-muted">
          These are conservative starting values based on ArduPilot's tuning guide.
          They are designed to be safe for a first flight, not optimal. AutoTune will
          refine the gains in flight. You can skip this step if you prefer to tune manually.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Param display row                                                  */
/* ------------------------------------------------------------------ */

function ParamRow({ label, value, unit, description }: {
  label: string; value: number; unit?: string; description: string;
}) {
  return (
    <div className="flex items-center px-5 py-2">
      <span className="text-xs font-mono text-accent w-44">{label}</span>
      <span className="text-sm font-bold text-foreground w-24 tabular-nums">
        {value}{unit ? <span className="text-xs text-muted ml-0.5">{unit}</span> : null}
      </span>
      <span className="text-xs text-muted flex-1">{description}</span>
    </div>
  );
}
