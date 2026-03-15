/**
 * FlightModesStep.tsx -- Wizard step for flight mode assignment.
 *
 * Simplified version of the full Modes page:
 * - 6 mode slots with dropdowns, same as the full page
 * - "Apply recommended defaults" button for first-time setup
 * - Mode range bar for visual reference (live RC indicator works if connected)
 * - Mode channel selector
 *
 * Completion gate: always advanceable (modes have safe defaults).
 * The step stages FLTMODE1-6 and FLTMODE_CH into the wizard store.
 */

import { useEffect, useMemo, useCallback, useState } from 'react';
import {
  Check,
  Wand2,
  Info,
  Radio,
} from 'lucide-react';
import { useWizardStore } from '../wizardStore';
import { useParameterStore } from '@/store/parameterStore';
import { useTelemetryStore } from '@/store/telemetryStore';
import {
  getModesForVehicle,
  MODE_PWM_RANGES,
  PWM_DISPLAY_MIN,
  PWM_DISPLAY_MAX,
  type FlightMode,
} from '@/models/flightModes';

/* ------------------------------------------------------------------ */
/*  Recommended defaults by vehicle type                               */
/* ------------------------------------------------------------------ */

/** Safe starting modes for someone who has never flown ArduPilot. */
function getRecommendedModes(
  vehicleType: 'copter' | 'plane' | 'quadplane'
): number[] {
  switch (vehicleType) {
    case 'copter':
      // Stabilize, AltHold, Loiter, RTL, PosHold, Land
      return [0, 2, 5, 6, 16, 9];
    case 'plane':
      // Manual, FBWA, FBWB, RTL, Loiter, Auto
      return [0, 5, 6, 11, 12, 10];
    case 'quadplane':
      // QStabilize, QHover, QLoiter, QRTL, FBWA, RTL
      return [17, 18, 19, 21, 5, 11];
    default:
      return [0, 0, 0, 0, 0, 0];
  }
}

function getRecommendedLabel(
  vehicleType: 'copter' | 'plane' | 'quadplane'
): string {
  switch (vehicleType) {
    case 'copter':
      return 'Stabilize, AltHold, Loiter, RTL, PosHold, Land';
    case 'plane':
      return 'Manual, FBWA, FBWB, RTL, Loiter, Auto';
    case 'quadplane':
      return 'QStabilize, QHover, QLoiter, QRTL, FBWA, RTL';
  }
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const FLTMODE_PARAMS = [
  'FLTMODE1', 'FLTMODE2', 'FLTMODE3', 'FLTMODE4', 'FLTMODE5', 'FLTMODE6',
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface FlightModesStepProps {
  onCanAdvanceChange: (canAdvance: boolean) => void;
}

export function FlightModesStep({ onCanAdvanceChange }: FlightModesStepProps) {
  const vehicleType = useWizardStore((s) => s.vehicleType);
  const stagedParams = useWizardStore((s) => s.stagedParams);
  const stageParams = useWizardStore((s) => s.stageParams);
  const markComplete = useWizardStore((s) => s.markComplete);
  const parameters = useParameterStore((s) => s.parameters);
  const rcChannels = useTelemetryStore((s) => s.rcChannels);

  const availableModes = useMemo(
    () => getModesForVehicle(vehicleType),
    [vehicleType],
  );

  // ── Read current values (staged -> FC fallback) ────────────────────

  const getModeValue = useCallback((paramName: string): number => {
    if (stagedParams[paramName] !== undefined) return stagedParams[paramName];
    return parameters.get(paramName)?.value ?? 0;
  }, [stagedParams, parameters]);

  const modeValues = FLTMODE_PARAMS.map(getModeValue);
  const modeChannel = stagedParams['FLTMODE_CH'] !== undefined
    ? stagedParams['FLTMODE_CH']
    : (parameters.get('FLTMODE_CH')?.value ?? 5);

  // ── Resolve FlightMode objects ─────────────────────────────────────

  const assignedModes: FlightMode[] = modeValues.map((val) =>
    availableModes.find((m) => m.id === val) ?? {
      id: val, name: `Mode ${val}`, description: 'Unknown mode', color: '#6b7280',
    }
  );

  // ── Live RC indicator ──────────────────────────────────────────────

  const currentPwm = rcChannels.length >= modeChannel
    ? rcChannels[modeChannel - 1] : 0;

  const activeSlot = useMemo(() => {
    if (currentPwm <= 0) return -1;
    for (let i = 0; i < MODE_PWM_RANGES.length; i++) {
      if (currentPwm >= MODE_PWM_RANGES[i].min && currentPwm <= MODE_PWM_RANGES[i].max) {
        return i;
      }
    }
    if (currentPwm < MODE_PWM_RANGES[0].min) return 0;
    return 5;
  }, [currentPwm]);

  // ── Track whether user has made changes ────────────────────────────

  const [touched, setTouched] = useState(() => {
    // If any FLTMODE param is already staged, consider it touched
    return FLTMODE_PARAMS.some((p) => stagedParams[p] !== undefined);
  });

  // ── Handlers ───────────────────────────────────────────────────────

  const handleModeChange = useCallback((slotIndex: number, modeId: number) => {
    stageParams({ [FLTMODE_PARAMS[slotIndex]]: modeId });
    setTouched(true);
  }, [stageParams]);

  const handleChannelChange = useCallback((channel: number) => {
    stageParams({ FLTMODE_CH: channel });
  }, [stageParams]);

  const handleApplyRecommended = useCallback(() => {
    if (!vehicleType) return;
    const recommended = getRecommendedModes(vehicleType);
    const params: Record<string, number> = {};
    FLTMODE_PARAMS.forEach((name, i) => {
      params[name] = recommended[i];
    });
    stageParams(params);
    setTouched(true);
  }, [vehicleType, stageParams]);

  // ── Advance gate: always allowed, mark complete when touched ───────

  useEffect(() => {
    onCanAdvanceChange(true);
    if (touched) markComplete('flight_modes');
  }, [touched, onCanAdvanceChange, markComplete]);

  // ── Render ─────────────────────────────────────────────────────────

  if (!vehicleType) return null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">

      {/* ── HEADER ── */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Flight Modes</h2>
        <p className="mt-1 text-sm text-muted">
          Assign up to 6 flight modes to your RC mode switch. ArduPilot divides
          the mode channel's PWM range into 6 fixed slots.
        </p>
      </div>

      {/* ── RECOMMENDED DEFAULTS ── */}
      {!touched && (
        <div className="flex items-start gap-4 rounded-lg border border-accent/30 bg-accent/5 px-5 py-4">
          <Wand2 size={20} className="mt-0.5 shrink-0 text-accent" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Apply recommended defaults?
            </p>
            <p className="mt-0.5 text-sm text-muted">
              {getRecommendedLabel(vehicleType)} -- a safe starting point
              for most pilots. You can customize each slot below.
            </p>
            <button
              onClick={handleApplyRecommended}
              className="btn btn-primary mt-3 gap-1.5"
            >
              <Wand2 size={13} />
              Apply Recommended
            </button>
          </div>
        </div>
      )}

      {touched && (
        <div className="flex items-center gap-2 rounded border border-success/30 bg-success/5 px-4 py-2.5">
          <Check size={14} className="shrink-0 text-success" />
          <p className="text-sm text-success">
            Flight modes configured. You can adjust individual slots below or continue.
          </p>
        </div>
      )}

      {/* ── MODE CHANNEL ── */}
      <div className="rounded-lg border border-border bg-surface-0 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm text-muted">Mode channel:</label>
          <select
            value={modeChannel}
            onChange={(e) => handleChannelChange(Number(e.target.value))}
            className="input-field w-24"
          >
            {Array.from({ length: 16 }, (_, i) => i + 1).map((ch) => (
              <option key={ch} value={ch}>CH {ch}</option>
            ))}
          </select>
          {currentPwm > 0 ? (
            <span className="font-mono text-sm tabular-nums text-accent">
              PWM: {currentPwm}
            </span>
          ) : (
            <span className="text-xs text-subtle">
              No RC data -- live preview available when receiver is connected
            </span>
          )}
        </div>
      </div>

      {/* ── MODE RANGE BAR ── */}
      <ModeRangeBar
        assignedModes={assignedModes}
        currentPwm={currentPwm}
        activeSlot={activeSlot}
      />

      {/* ── MODE SLOTS ── */}
      <div className="space-y-2">
        {FLTMODE_PARAMS.map((paramName, index) => {
          const range = MODE_PWM_RANGES[index];
          const mode = assignedModes[index];
          const isActive = activeSlot === index && currentPwm > 0;

          return (
            <ModeSlot
              key={paramName}
              slotNumber={index + 1}
              range={range}
              mode={mode}
              isActive={isActive}
              availableModes={availableModes}
              onModeChange={(modeId) => handleModeChange(index, modeId)}
            />
          );
        })}
      </div>

      {/* ── BOTTOM HINT ── */}
      <div className="flex items-start gap-2 rounded border border-border bg-surface-0 px-4 py-2.5">
        <Info size={13} className="mt-0.5 shrink-0 text-muted" />
        <p className="text-xs text-muted">
          The mode channel is typically a 3-position or 6-position switch on your
          transmitter. A 3-position switch covers slots 1, 4, and 6. Use a 6-position
          switch or mixing to access all 6 modes. You can adjust these anytime from
          the Flight Modes page after the wizard.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mode Range Bar (stripped from ModesPage)                            */
/* ------------------------------------------------------------------ */

function ModeRangeBar({
  assignedModes,
  currentPwm,
  activeSlot,
}: {
  assignedModes: FlightMode[];
  currentPwm: number;
  activeSlot: number;
}) {
  const totalRange = PWM_DISPLAY_MAX - PWM_DISPLAY_MIN;
  const indicatorPercent = currentPwm > 0
    ? ((Math.max(PWM_DISPLAY_MIN, Math.min(PWM_DISPLAY_MAX, currentPwm)) -
        PWM_DISPLAY_MIN) / totalRange) * 100
    : -1;

  return (
    <div className="space-y-1.5">
      {/* Scale labels */}
      <div className="relative flex h-3 items-end text-[10px] text-subtle font-mono">
        {[1000, 1200, 1400, 1600, 1800, 2000].map((pwm) => {
          const pct = ((pwm - PWM_DISPLAY_MIN) / totalRange) * 100;
          return (
            <span key={pwm} className="absolute -translate-x-1/2" style={{ left: `${pct}%` }}>
              {pwm}
            </span>
          );
        })}
      </div>

      {/* Bar */}
      <div className="relative h-10 overflow-hidden rounded bg-surface-0 border border-border">
        {MODE_PWM_RANGES.map((range, index) => {
          const mode = assignedModes[index];
          const leftPwm = Math.max(range.min, PWM_DISPLAY_MIN);
          const rightPwm = Math.min(range.max, PWM_DISPLAY_MAX);
          const left = ((leftPwm - PWM_DISPLAY_MIN) / totalRange) * 100;
          const width = ((rightPwm - leftPwm) / totalRange) * 100;
          const isActive = activeSlot === index && currentPwm > 0;

          return (
            <div
              key={index}
              className="absolute top-0 h-full flex items-center justify-center"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundColor: mode.color + (isActive ? 'cc' : '55'),
                borderRight: index < 5 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              }}
            >
              <span className={`text-[11px] font-semibold truncate px-0.5 ${
                isActive ? 'text-white' : 'text-white/70'
              }`}>
                {mode.name}
              </span>
            </div>
          );
        })}

        {/* PWM indicator */}
        {indicatorPercent >= 0 && (
          <div
            className="absolute top-0 h-full w-0.5 bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]"
            style={{ left: `${indicatorPercent}%` }}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mode Slot Row                                                       */
/* ------------------------------------------------------------------ */

function ModeSlot({
  slotNumber,
  range,
  mode,
  isActive,
  availableModes,
  onModeChange,
}: {
  slotNumber: number;
  range: (typeof MODE_PWM_RANGES)[number];
  mode: FlightMode;
  isActive: boolean;
  availableModes: FlightMode[];
  onModeChange: (modeId: number) => void;
}) {
  return (
    <div className={`flex items-center gap-3 rounded px-4 py-2.5 transition-all ${
      isActive
        ? 'bg-surface-2 ring-1 ring-accent/50'
        : 'bg-surface-0 hover:bg-surface-1'
    }`}>
      {/* Color dot + slot */}
      <div className="flex items-center gap-2 w-16 shrink-0">
        <div
          className={`h-2.5 w-2.5 rounded-full ${isActive ? 'ring-2 ring-white/40' : ''}`}
          style={{ backgroundColor: mode.color }}
        />
        <span className="text-xs font-bold text-muted">
          Slot {slotNumber}
        </span>
      </div>

      {/* PWM range */}
      <span className="w-24 shrink-0 font-mono text-[11px] tabular-nums text-subtle">
        {range.min === 0 ? '\u2264 ' + range.max
          : range.max === 2500 ? '\u2265 ' + range.min
          : range.min + ' - ' + range.max}
      </span>

      {/* Dropdown */}
      <select
        value={mode.id}
        onChange={(e) => onModeChange(Number(e.target.value))}
        className="input-field flex-1 text-sm"
      >
        {availableModes.map((m) => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>

      {/* Description */}
      <span className="hidden md:block w-48 shrink-0 text-xs text-subtle truncate">
        {mode.description}
      </span>

      {isActive && (
        <span className="badge bg-accent/20 text-accent shrink-0 text-[10px]">ACTIVE</span>
      )}
    </div>
  );
}
