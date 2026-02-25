import { useMemo } from 'react';
import { useParameterStore, getEffectiveValue } from '@/store/parameterStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { useTelemetryStore } from '@/store/telemetryStore';
import {
  getModesForVehicle,
  MODE_PWM_RANGES,
  PWM_DISPLAY_MIN,
  PWM_DISPLAY_MAX,
  type FlightMode,
} from '@/models/flightModes';

/** The 6 FLTMODE param names */
const FLTMODE_PARAMS = [
  'FLTMODE1', 'FLTMODE2', 'FLTMODE3', 'FLTMODE4', 'FLTMODE5', 'FLTMODE6',
];

export function ModesPage() {
  const vehicleType = useVehicleStore((s) => s.type);
  const paramState = useParameterStore.getState();
  const setParamLocal = useParameterStore((s) => s.setParamLocal);
  const rcChannels = useTelemetryStore((s) => s.rcChannels);

  // Force re-render when params change
  useParameterStore((s) => s.dirtyParams);
  useParameterStore((s) => s.parameters);

  const availableModes = useMemo(
    () => getModesForVehicle(vehicleType),
    [vehicleType]
  );

  // Get the mode channel (FLTMODE_CH, default 5 for RC5)
  const modeChannelParam = getEffectiveValue(paramState, 'FLTMODE_CH');
  const modeChannel = modeChannelParam !== undefined ? Math.round(modeChannelParam) : 5;

  // Get current PWM value for the mode channel (channels are 0-indexed in our array)
  const currentPwm = rcChannels.length >= modeChannel ? rcChannels[modeChannel - 1] : 0;

  // Determine which mode slot is active based on current PWM
  const activeSlot = getActiveSlot(currentPwm);

  // Read current FLTMODE1-6 values
  const modeValues = FLTMODE_PARAMS.map((name) => {
    const val = getEffectiveValue(paramState, name);
    return val !== undefined ? Math.round(val) : 0;
  });

  // Map mode values to FlightMode objects
  const assignedModes = modeValues.map((val) =>
    availableModes.find((m) => m.id === val) || {
      id: val,
      name: `Mode ${val}`,
      description: 'Unknown mode',
      color: '#6b7280',
    }
  );

  const handleModeChange = (slotIndex: number, modeId: number) => {
    setParamLocal(FLTMODE_PARAMS[slotIndex], modeId);
  };

  const handleChannelChange = (channel: number) => {
    setParamLocal('FLTMODE_CH', channel);
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Flight Modes</h1>
        <p className="mt-1 text-lg text-muted">
          Assign flight modes to RC channel positions. Move your mode switch to
          see the active mode highlighted in real time.
        </p>
      </div>

      {/* Mode channel selector */}
      <div className="card">
        <div className="card-header">Mode Channel</div>
        <div className="flex items-center gap-4">
          <label className="text-base text-muted">
            RC channel for mode selection:
          </label>
          <select
            value={modeChannel}
            onChange={(e) => handleChannelChange(Number(e.target.value))}
            className="input-field w-24"
          >
            {Array.from({ length: 16 }, (_, i) => i + 1).map((ch) => (
              <option key={ch} value={ch}>
                CH {ch}
              </option>
            ))}
          </select>
          {currentPwm > 0 && (
            <span className="font-mono text-sm tabular-nums text-accent">
              PWM: {currentPwm}
            </span>
          )}
          {currentPwm === 0 && (
            <span className="text-[15px] text-subtle">
              No RC data (connect RC receiver for live preview)
            </span>
          )}
        </div>
      </div>

      {/* Visual mode range bar */}
      <div className="card">
        <div className="card-header">Mode Range</div>
        <ModeRangeBar
          assignedModes={assignedModes}
          currentPwm={currentPwm}
          activeSlot={activeSlot}
        />
      </div>

      {/* Mode assignment slots */}
      <div className="card">
        <div className="card-header">Mode Assignment</div>
        <div className="space-y-3">
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
      </div>

      {/* Active mode info */}
      {currentPwm > 0 && activeSlot >= 0 && (
        <div
          className="rounded-lg border-l-4 p-4"
          style={{
            borderColor: assignedModes[activeSlot].color,
            backgroundColor: assignedModes[activeSlot].color + '10',
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: assignedModes[activeSlot].color }}
            />
            <span className="text-lg font-bold text-foreground">
              Active: {assignedModes[activeSlot].name}
            </span>
          </div>
          <p className="mt-1 text-lg text-muted">
            {assignedModes[activeSlot].description}
          </p>
        </div>
      )}
    </div>
  );
}

// --- Mode Range Bar ---

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

  // PWM indicator position
  const indicatorPercent =
    currentPwm > 0
      ? ((Math.max(PWM_DISPLAY_MIN, Math.min(PWM_DISPLAY_MAX, currentPwm)) -
          PWM_DISPLAY_MIN) /
          totalRange) *
        100
      : -1;

  return (
    <div className="space-y-2">
      {/* Scale labels */}
      <div className="relative flex h-4 items-end text-base text-muted">
        {[800, 1000, 1200, 1400, 1600, 1800, 2000, 2200].map((pwm) => {
          const pct = ((pwm - PWM_DISPLAY_MIN) / totalRange) * 100;
          return (
            <span
              key={pwm}
              className="absolute -translate-x-1/2 font-mono"
              style={{ left: `${pct}%` }}
            >
              {pwm}
            </span>
          );
        })}
      </div>

      {/* Range bar */}
      <div className="relative h-12 overflow-hidden rounded-lg bg-surface-0 border border-border">
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
              className="absolute top-0 h-full flex items-center justify-center transition-opacity duration-150"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundColor: mode.color + (isActive ? 'cc' : '55'),
                borderRight:
                  index < 5 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              }}
            >
              <span
                className={`text-[13px] font-semibold truncate px-1 ${
                  isActive ? 'text-white' : 'text-white/70'
                }`}
              >
                {mode.name}
              </span>
            </div>
          );
        })}

        {/* Current PWM indicator */}
        {indicatorPercent >= 0 && (
          <div
            className="absolute top-0 h-full w-0.5 bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] transition-all duration-100"
            style={{ left: `${indicatorPercent}%` }}
          >
            {/* Triangle pointer at top */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-white" />
          </div>
        )}
      </div>

      {/* Tick marks */}
      <div className="relative h-2">
        {MODE_PWM_RANGES.map((range, index) => {
          if (index === 0) return null;
          const pct = ((range.min - PWM_DISPLAY_MIN) / totalRange) * 100;
          return (
            <div
              key={index}
              className="absolute top-0 h-2 w-px bg-subtle"
              style={{ left: `${pct}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}

// --- Mode Slot Row ---

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
    <div
      className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all duration-150 ${
        isActive
          ? 'bg-surface-2 ring-1 ring-accent/50'
          : 'bg-surface-0 hover:bg-surface-1'
      }`}
    >
      {/* Color dot + slot number */}
      <div className="flex items-center gap-2.5 w-20 shrink-0">
        <div
          className={`h-3 w-3 rounded-full transition-all ${
            isActive ? 'ring-2 ring-white/40 scale-110' : ''
          }`}
          style={{ backgroundColor: mode.color }}
        />
        <span className="text-[15px] font-bold text-muted">
          Mode {slotNumber}
        </span>
      </div>

      {/* PWM range label */}
      <span className="w-28 shrink-0 font-mono text-[13px] tabular-nums text-subtle">
        {range.min === 0 ? '\u2264 ' + range.max : range.max === 2500 ? '\u2265 ' + range.min : range.min + ' - ' + range.max}
      </span>

      {/* Mode dropdown */}
      <select
        value={mode.id}
        onChange={(e) => onModeChange(Number(e.target.value))}
        className="input-field flex-1"
      >
        {availableModes.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      {/* Description */}
      <span className="hidden lg:block w-56 shrink-0 text-[15px] text-subtle truncate">
        {mode.description}
      </span>

      {/* Active indicator */}
      {isActive && (
        <span className="badge bg-accent/20 text-accent shrink-0">
          ACTIVE
        </span>
      )}
    </div>
  );
}

// --- Helpers ---

function getActiveSlot(pwm: number): number {
  if (pwm <= 0) return -1;
  for (let i = 0; i < MODE_PWM_RANGES.length; i++) {
    if (pwm >= MODE_PWM_RANGES[i].min && pwm <= MODE_PWM_RANGES[i].max) {
      return i;
    }
  }
  // If PWM is below first range, it's mode 1
  if (pwm < MODE_PWM_RANGES[0].min) return 0;
  // If above last range, it's mode 6
  return 5;
}
