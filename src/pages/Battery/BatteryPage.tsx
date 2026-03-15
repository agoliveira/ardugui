/**
 * BatteryPage.tsx -- Battery monitor configuration.
 *
 * Covers voltage divider calibration, current sensor setup, cell count,
 * capacity, and failsafe thresholds. Live telemetry shows actual voltage
 * and current readings for verification.
 *
 * Key ArduPilot params:
 *   BATT_MONITOR   -- monitor type (0=disabled, 3=analog V, 4=analog V+I)
 *   BATT_VOLT_PIN  -- analog pin for voltage
 *   BATT_CURR_PIN  -- analog pin for current
 *   BATT_VOLT_MULT -- voltage divider multiplier
 *   BATT_AMP_PERVLT -- amps per volt for current sensor
 *   BATT_AMP_OFFSET -- current sensor zero offset
 *   BATT_CAPACITY  -- battery capacity in mAh
 *   BATT_LOW_VOLT  -- low voltage warning threshold
 *   BATT_CRT_VOLT  -- critical voltage threshold
 *   BATT_LOW_MAH   -- low remaining mAh warning
 *   BATT_CRT_MAH   -- critical remaining mAh
 *   BATT_FS_LOW_ACT -- low battery failsafe action
 *   BATT_FS_CRT_ACT -- critical battery failsafe action
 *   BATT_ARM_VOLT   -- minimum voltage to allow arming
 */

import { useState, useCallback } from 'react';
import {
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useParameterStore, getEffectiveValue } from '@/store/parameterStore';
import { useTelemetryStore } from '@/store/telemetryStore';

/* ------------------------------------------------------------------ */
/*  Monitor type options                                               */
/* ------------------------------------------------------------------ */

const MONITOR_TYPES = [
  { value: 0, label: 'Disabled', description: 'No battery monitoring' },
  { value: 3, label: 'Analog Voltage Only', description: 'Reads voltage via analog pin' },
  { value: 4, label: 'Analog Voltage + Current', description: 'Reads both voltage and current (most common)' },
  { value: 5, label: 'Solo', description: '3DR Solo smart battery' },
  { value: 7, label: 'SMBus Maxell', description: 'SMBus smart battery (Maxell)' },
  { value: 8, label: 'UAVCAN', description: 'DroneCAN/UAVCAN battery monitor' },
];

const FAILSAFE_ACTIONS = [
  { value: 0, label: 'None', description: 'No action' },
  { value: 1, label: 'Land', description: 'Land immediately' },
  { value: 2, label: 'RTL', description: 'Return to launch, then land' },
  { value: 3, label: 'SmartRTL / RTL', description: 'Retrace path home if available, otherwise RTL' },
  { value: 4, label: 'SmartRTL / Land', description: 'Retrace path home if available, otherwise Land' },
  { value: 5, label: 'Terminate', description: 'Disarm motors immediately (use with care)' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BatteryPage() {
  const paramState = useParameterStore.getState();
  const setParamLocal = useParameterStore((s) => s.setParamLocal);
  const battery = useTelemetryStore((s) => s.battery);

  const monitorType = getEffectiveValue(paramState, 'BATT_MONITOR') ?? 0;
  const isAnalog = monitorType === 3 || monitorType === 4;
  const hasCurrent = monitorType === 4;
  const isEnabled = monitorType > 0;

  const voltMult = getEffectiveValue(paramState, 'BATT_VOLT_MULT') ?? 0;
  const ampPerVolt = getEffectiveValue(paramState, 'BATT_AMP_PERVLT') ?? 0;
  const capacity = getEffectiveValue(paramState, 'BATT_CAPACITY') ?? 0;
  const lowVolt = getEffectiveValue(paramState, 'BATT_LOW_VOLT') ?? 0;
  const crtVolt = getEffectiveValue(paramState, 'BATT_CRT_VOLT') ?? 0;
  const lowMah = getEffectiveValue(paramState, 'BATT_LOW_MAH') ?? 0;
  const crtMah = getEffectiveValue(paramState, 'BATT_CRT_MAH') ?? 0;
  const armVolt = getEffectiveValue(paramState, 'BATT_ARM_VOLT') ?? 0;
  const fsLowAct = getEffectiveValue(paramState, 'BATT_FS_LOW_ACT') ?? 0;
  const fsCrtAct = getEffectiveValue(paramState, 'BATT_FS_CRT_ACT') ?? 0;

  // Cell count estimation
  const [cellCount, setCellCount] = useState(() => {
    if (battery && battery.voltage > 5) {
      return Math.round(battery.voltage / 3.7);
    }
    if (lowVolt > 0) return Math.round(lowVolt / 3.5);
    return 0;
  });

  const handleCellCountChange = useCallback((cells: number) => {
    setCellCount(cells);
    // Auto-set voltage thresholds based on cell count
    if (cells > 0) {
      setParamLocal('BATT_LOW_VOLT', cells * 3.5);
      setParamLocal('BATT_CRT_VOLT', cells * 3.3);
      setParamLocal('BATT_ARM_VOLT', cells * 3.3);
    }
  }, [setParamLocal]);

  const hasBattery = battery !== null && battery.voltage > 1;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Battery Monitor</h1>
        <p className="mt-1 text-lg text-muted">
          Configure voltage and current monitoring, set failsafe thresholds.
        </p>
      </div>

      {/* Live readings */}
      {hasBattery && (
        <div className="grid gap-4 sm:grid-cols-3">
          <LiveCard label="Voltage" value={`${battery!.voltage.toFixed(2)} V`}
            color={lowVolt > 0 && battery!.voltage < lowVolt ? 'text-danger' :
              lowVolt > 0 && battery!.voltage < lowVolt + 0.5 ? 'text-warning' : 'text-success'} />
          <LiveCard label="Current" value={`${battery!.current.toFixed(1)} A`} color="text-foreground" />
          {cellCount > 0 && (
            <LiveCard label="Per cell" value={`${(battery!.voltage / cellCount).toFixed(2)} V`}
              color={battery!.voltage / cellCount < 3.5 ? 'text-warning' : 'text-success'} />
          )}
        </div>
      )}

      {!hasBattery && (
        <div className="flex items-start gap-2.5 rounded border border-blue-500/30 bg-blue-900/15 px-4 py-3">
          <Info size={14} className="mt-0.5 shrink-0 text-blue-400" />
          <p className="text-sm text-blue-300/90">
            No battery telemetry received. Connect a battery or verify the monitor type setting below.
          </p>
        </div>
      )}

      {/* Monitor type */}
      <section className="card">
        <div className="card-header">Monitor Type</div>
        <div className="p-4 space-y-3">
          <div className="space-y-1.5">
            {MONITOR_TYPES.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setParamLocal('BATT_MONITOR', opt.value)}
                className={`w-full rounded border-2 px-3 py-2 text-left transition ${
                  monitorType === opt.value
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-surface-0 hover:border-accent/40'
                }`}
              >
                <span className={`text-sm font-bold ${monitorType === opt.value ? 'text-accent' : 'text-foreground'}`}>
                  {opt.label}
                </span>
                <p className="text-xs text-muted">{opt.description}</p>
              </button>
            ))}
          </div>
          <p className="text-[11px] font-mono text-subtle">BATT_MONITOR = {monitorType}</p>
        </div>
      </section>

      {/* Analog calibration */}
      {isAnalog && (
        <section className="card">
          <div className="card-header">Analog Calibration</div>
          <div className="p-4 space-y-4">
            <ParamSlider param="BATT_VOLT_MULT" label="Voltage multiplier"
              description="Voltage divider ratio. Measure actual battery voltage with a multimeter and adjust until the reading matches."
              value={voltMult} min={0} max={100} step={0.1} unit=""
              onChange={(v) => setParamLocal('BATT_VOLT_MULT', v)} />

            {hasCurrent && (
              <>
                <ParamSlider param="BATT_AMP_PERVLT" label="Amps per volt"
                  description="Current sensor sensitivity. Check your power module datasheet (typical: 17 for 3DR, 39 for Matek)."
                  value={ampPerVolt} min={0} max={100} step={0.1} unit=""
                  onChange={(v) => setParamLocal('BATT_AMP_PERVLT', v)} />
                <ParamSlider param="BATT_AMP_OFFSET" label="Current offset"
                  description="Zero-current voltage offset. Disconnect all loads and note the current reading -- set this to cancel it."
                  value={getEffectiveValue(paramState, 'BATT_AMP_OFFSET') ?? 0}
                  min={-1} max={1} step={0.01} unit="V"
                  onChange={(v) => setParamLocal('BATT_AMP_OFFSET', v)} />
              </>
            )}

            {hasBattery && (
              <div className="flex items-start gap-2 rounded border border-border bg-surface-1 px-3 py-2">
                <Info size={12} className="mt-0.5 shrink-0 text-muted" />
                <p className="text-xs text-muted">
                  Current reading: {battery!.voltage.toFixed(2)} V, {battery!.current.toFixed(1)} A.
                  Measure actual battery voltage with a multimeter and adjust the multiplier
                  until the reading matches.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Cell count + capacity */}
      {isEnabled && (
        <section className="card">
          <div className="card-header">Battery Specs</div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Cell count</label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14].map((n) => (
                  <button key={n} onClick={() => handleCellCountChange(n)}
                    className={`rounded border-2 px-3 py-1.5 text-sm font-bold transition ${
                      cellCount === n
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border bg-surface-0 text-muted hover:border-accent/40'
                    }`}>
                    {n}S
                  </button>
                ))}
              </div>
              {cellCount > 0 && (
                <p className="mt-2 text-xs text-muted">
                  {cellCount}S: nominal {(cellCount * 3.7).toFixed(1)}V,
                  full {(cellCount * 4.2).toFixed(1)}V,
                  low {(cellCount * 3.5).toFixed(1)}V,
                  critical {(cellCount * 3.3).toFixed(1)}V
                </p>
              )}
            </div>

            <ParamSlider param="BATT_CAPACITY" label="Capacity"
              description="Battery capacity in mAh. Used for remaining capacity estimation and mAh-based failsafe."
              value={capacity} min={0} max={50000} step={100} unit="mAh"
              onChange={(v) => setParamLocal('BATT_CAPACITY', v)} />
          </div>
        </section>
      )}

      {/* Voltage thresholds */}
      {isEnabled && (
        <section className="card">
          <div className="card-header">Failsafe Thresholds</div>
          <div className="p-4 space-y-4">
            <ParamSlider param="BATT_LOW_VOLT" label="Low voltage warning"
              description="Triggers the low battery failsafe action."
              value={lowVolt} min={0} max={60} step={0.1} unit="V"
              onChange={(v) => setParamLocal('BATT_LOW_VOLT', v)} />

            <ParamSlider param="BATT_CRT_VOLT" label="Critical voltage"
              description="Triggers the critical battery failsafe action. Should be lower than low voltage."
              value={crtVolt} min={0} max={60} step={0.1} unit="V"
              onChange={(v) => setParamLocal('BATT_CRT_VOLT', v)} />

            {crtVolt > 0 && lowVolt > 0 && crtVolt >= lowVolt && (
              <div className="flex items-start gap-2 rounded border border-warning/40 bg-warning/10 px-3 py-2">
                <AlertTriangle size={12} className="mt-0.5 shrink-0 text-warning" />
                <p className="text-xs text-warning">
                  Critical voltage ({crtVolt.toFixed(1)}V) should be lower than low voltage
                  ({lowVolt.toFixed(1)}V).
                </p>
              </div>
            )}

            <ParamSlider param="BATT_ARM_VOLT" label="Minimum arming voltage"
              description="Prevents arming below this voltage. Set to 0 to disable."
              value={armVolt} min={0} max={60} step={0.1} unit="V"
              onChange={(v) => setParamLocal('BATT_ARM_VOLT', v)} />

            {hasCurrent && (
              <>
                <ParamSlider param="BATT_LOW_MAH" label="Low remaining mAh"
                  description="Triggers low failsafe when remaining capacity drops below this. 0 = disabled."
                  value={lowMah} min={0} max={50000} step={100} unit="mAh"
                  onChange={(v) => setParamLocal('BATT_LOW_MAH', v)} />

                <ParamSlider param="BATT_CRT_MAH" label="Critical remaining mAh"
                  description="Triggers critical failsafe when remaining capacity drops below this. 0 = disabled."
                  value={crtMah} min={0} max={50000} step={100} unit="mAh"
                  onChange={(v) => setParamLocal('BATT_CRT_MAH', v)} />
              </>
            )}
          </div>
        </section>
      )}

      {/* Failsafe actions */}
      {isEnabled && (
        <section className="card">
          <div className="card-header">Failsafe Actions</div>
          <div className="p-4 space-y-4">
            <ActionSelect param="BATT_FS_LOW_ACT" label="Low battery action"
              value={fsLowAct} options={FAILSAFE_ACTIONS}
              onChange={(v) => setParamLocal('BATT_FS_LOW_ACT', v)} />

            <ActionSelect param="BATT_FS_CRT_ACT" label="Critical battery action"
              value={fsCrtAct} options={FAILSAFE_ACTIONS}
              onChange={(v) => setParamLocal('BATT_FS_CRT_ACT', v)} />

            {fsLowAct === 0 && (
              <div className="flex items-start gap-2 rounded border border-danger/40 bg-danger/10 px-3 py-2">
                <AlertTriangle size={12} className="mt-0.5 shrink-0 text-danger" />
                <p className="text-xs text-danger">
                  No low battery failsafe action set. The aircraft will fly until the battery
                  is completely drained, causing an uncontrolled crash.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function LiveCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded border border-border bg-surface-0 px-4 py-3">
      <p className="text-[11px] uppercase tracking-wider text-subtle">{label}</p>
      <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}

function ParamSlider({ param, label, description, value, min, max, step, unit, onChange }: {
  param: string; label: string; description: string;
  value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void;
}) {
  const display = unit ? `${value}${unit === 'mAh' ? '' : ' '}${unit}` : String(value);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-foreground">{label}</span>
          <span className="ml-2 text-[11px] font-mono text-subtle">{param}</span>
        </div>
        <span className="text-sm font-mono font-bold text-accent">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#ffaa2a]" />
      <p className="text-[11px] leading-relaxed text-subtle">{description}</p>
    </div>
  );
}

function ActionSelect({ param, label, value, options, onChange }: {
  param: string; label: string; value: number;
  options: { value: number; label: string; description?: string }[];
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="ml-2 text-[11px] font-mono text-subtle">{param}</span>
      </div>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <button key={opt.value} onClick={() => onChange(opt.value)}
            className={`w-full rounded border-2 px-3 py-2 text-left transition ${
              value === opt.value
                ? 'border-accent bg-accent/10'
                : 'border-border bg-surface-0 hover:border-accent/40'
            }`}>
            <span className={`text-sm font-bold ${value === opt.value ? 'text-accent' : 'text-foreground'}`}>
              {opt.label}
            </span>
            {opt.description && <p className="text-xs text-muted">{opt.description}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}
