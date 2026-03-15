/**
 * FailsafesStep.tsx -- Wizard step for failsafe configuration.
 *
 * Simplified version focused on the three critical failsafes:
 * - RC loss (what happens when you lose radio signal)
 * - Battery (what happens when battery is low / critical)
 * - GCS loss (what happens when telemetry link drops)
 *
 * Advanced items (EKF, crash check, geofence) are left for the full
 * Failsafes page. The wizard sets safe recommended defaults and lets
 * the user override the key actions.
 *
 * Completion gate: always advanceable. Marked complete on any interaction.
 */

import { useEffect, useMemo, useCallback, useState } from 'react';
import {
  Check,
  Wand2,
  Info,
  Radio,
  Battery,
  MonitorSmartphone,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useWizardStore } from '../wizardStore';
import { useParameterStore } from '@/store/parameterStore';
import type { VehicleType } from '@/store/vehicleStore';

/* ------------------------------------------------------------------ */
/*  Failsafe definitions per vehicle type                              */
/* ------------------------------------------------------------------ */

interface FailsafeOption {
  value: number;
  label: string;
  recommended?: boolean;
}

interface FailsafeDef {
  id: string;
  param: string;
  label: string;
  description: string;
  icon: React.ElementType;
  options: FailsafeOption[];
  /** Extra params to set alongside (e.g. threshold values) */
  extras?: { param: string; label: string; value: number; unit: string }[];
}

interface BatteryThresholds {
  lowVolt: number;
  critVolt: number;
  lowMah: number;
  critMah: number;
}

function getCopterFailsafes(): FailsafeDef[] {
  return [
    {
      id: 'rc',
      param: 'FS_THR_ENABLE',
      label: 'Radio Failsafe',
      description: 'What happens when your RC transmitter signal is lost.',
      icon: Radio,
      options: [
        { value: 0, label: 'Disabled' },
        { value: 1, label: 'RTL (or Land if no GPS)', recommended: true },
        { value: 2, label: 'Continue mission in Auto' },
        { value: 3, label: 'Land immediately' },
        { value: 4, label: 'SmartRTL, then RTL, then Land' },
        { value: 5, label: 'SmartRTL, then Land' },
      ],
      extras: [
        { param: 'FS_THR_VALUE', label: 'Throttle threshold', value: 975, unit: 'us' },
      ],
    },
    {
      id: 'batt_low',
      param: 'BATT_FS_LOW_ACT',
      label: 'Low Battery Action',
      description: 'First warning level -- battery is getting low.',
      icon: Battery,
      options: [
        { value: 0, label: 'None' },
        { value: 1, label: 'Land' },
        { value: 2, label: 'RTL', recommended: true },
        { value: 3, label: 'SmartRTL, then RTL, then Land' },
        { value: 4, label: 'SmartRTL, then Land' },
        { value: 5, label: 'Terminate (kill motors)' },
      ],
    },
    {
      id: 'batt_crit',
      param: 'BATT_FS_CRT_ACT',
      label: 'Critical Battery Action',
      description: 'Emergency level -- land as soon as possible.',
      icon: Battery,
      options: [
        { value: 0, label: 'None' },
        { value: 1, label: 'Land', recommended: true },
        { value: 2, label: 'RTL' },
        { value: 3, label: 'SmartRTL, then RTL, then Land' },
        { value: 4, label: 'SmartRTL, then Land' },
        { value: 5, label: 'Terminate (kill motors)' },
      ],
    },
    {
      id: 'gcs',
      param: 'FS_GCS_ENABLE',
      label: 'GCS Failsafe',
      description: 'What happens when telemetry link to the ground station drops.',
      icon: MonitorSmartphone,
      options: [
        { value: 0, label: 'Disabled', recommended: true },
        { value: 1, label: 'RTL (or Land if no GPS)' },
        { value: 2, label: 'Continue mission in Auto' },
        { value: 3, label: 'Land immediately' },
        { value: 4, label: 'SmartRTL, then RTL, then Land' },
        { value: 5, label: 'SmartRTL, then Land' },
      ],
    },
  ];
}

function getPlaneFailsafes(): FailsafeDef[] {
  return [
    {
      id: 'rc',
      param: 'THR_FAILSAFE',
      label: 'Radio Failsafe',
      description: 'Enable RC loss detection via throttle channel.',
      icon: Radio,
      options: [
        { value: 0, label: 'Disabled' },
        { value: 1, label: 'Enabled', recommended: true },
      ],
      extras: [
        { param: 'THR_FS_VALUE', label: 'Throttle threshold', value: 950, unit: 'us' },
      ],
    },
    {
      id: 'rc_long',
      param: 'FS_LONG_ACTN',
      label: 'Long RC Loss Action',
      description: 'What happens after prolonged radio signal loss.',
      icon: Radio,
      options: [
        { value: 0, label: 'Continue' },
        { value: 1, label: 'RTL', recommended: true },
        { value: 2, label: 'Glide (FBWA)' },
      ],
    },
    {
      id: 'batt_low',
      param: 'BATT_FS_LOW_ACT',
      label: 'Low Battery Action',
      description: 'First warning level -- battery is getting low.',
      icon: Battery,
      options: [
        { value: 0, label: 'None' },
        { value: 1, label: 'RTL', recommended: true },
        { value: 2, label: 'Land' },
        { value: 3, label: 'Terminate (kill motors)' },
      ],
    },
    {
      id: 'batt_crit',
      param: 'BATT_FS_CRT_ACT',
      label: 'Critical Battery Action',
      description: 'Emergency level -- land as soon as possible.',
      icon: Battery,
      options: [
        { value: 0, label: 'None' },
        { value: 1, label: 'RTL' },
        { value: 2, label: 'Land', recommended: true },
        { value: 3, label: 'Terminate (kill motors)' },
      ],
    },
    {
      id: 'gcs',
      param: 'FS_GCS_ENABL',
      label: 'GCS Failsafe',
      description: 'What happens when telemetry link to the ground station drops.',
      icon: MonitorSmartphone,
      options: [
        { value: 0, label: 'Disabled', recommended: true },
        { value: 1, label: 'RTL' },
        { value: 2, label: 'Rally point / RTL' },
      ],
    },
  ];
}

/** Default battery voltage thresholds -- assumes a common 4S LiPo. */
const DEFAULT_BATT: BatteryThresholds = {
  lowVolt: 14.0,    // ~3.5V/cell for 4S
  critVolt: 13.2,   // ~3.3V/cell for 4S
  lowMah: 0,        // Disabled by default (requires current sensor)
  critMah: 0,
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface FailsafesStepProps {
  onCanAdvanceChange: (canAdvance: boolean) => void;
}

export function FailsafesStep({ onCanAdvanceChange }: FailsafesStepProps) {
  const vehicleType = useWizardStore((s) => s.vehicleType);
  const stagedParams = useWizardStore((s) => s.stagedParams);
  const stageParams = useWizardStore((s) => s.stageParams);
  const markComplete = useWizardStore((s) => s.markComplete);
  const parameters = useParameterStore((s) => s.parameters);

  const failsafes = useMemo(() => {
    if (vehicleType === 'copter') return getCopterFailsafes();
    return getPlaneFailsafes(); // plane and quadplane share the same
  }, [vehicleType]);

  const [touched, setTouched] = useState(() => {
    return failsafes.some((fs) => stagedParams[fs.param] !== undefined);
  });

  // ── Read current value (staged -> FC fallback) ─────────────────────

  const getValue = useCallback((param: string): number | undefined => {
    if (stagedParams[param] !== undefined) return stagedParams[param];
    return parameters.get(param)?.value;
  }, [stagedParams, parameters]);

  // ── Handlers ───────────────────────────────────────────────────────

  const handleChange = useCallback((param: string, value: number) => {
    stageParams({ [param]: value });
    setTouched(true);
  }, [stageParams]);

  const handleApplyRecommended = useCallback(() => {
    const params: Record<string, number> = {};
    for (const fs of failsafes) {
      const rec = fs.options.find((o) => o.recommended);
      if (rec) params[fs.param] = rec.value;
      // Also set extras (thresholds)
      if (fs.extras) {
        for (const extra of fs.extras) {
          params[extra.param] = extra.value;
        }
      }
    }
    // Battery thresholds
    params['BATT_LOW_VOLT'] = DEFAULT_BATT.lowVolt;
    params['BATT_CRT_VOLT'] = DEFAULT_BATT.critVolt;
    stageParams(params);
    setTouched(true);
  }, [failsafes, stageParams]);

  // ── Advance gate ───────────────────────────────────────────────────

  useEffect(() => {
    onCanAdvanceChange(true);
    if (touched) markComplete('failsafes');
  }, [touched, onCanAdvanceChange, markComplete]);

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">

      {/* ── HEADER ── */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Failsafes</h2>
        <p className="mt-1 text-sm text-muted">
          Configure what happens when things go wrong -- radio signal loss, low
          battery, or telemetry link failure. These are critical safety settings.
        </p>
      </div>

      {/* ── SAFETY NOTICE ── */}
      <div className="flex items-start gap-3 rounded border border-warning/30 bg-warning/5 px-4 py-3">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" />
        <div>
          <p className="text-sm font-semibold text-foreground">Safety critical settings</p>
          <p className="mt-0.5 text-xs text-muted">
            Failsafe actions determine what your vehicle does in an emergency.
            Always test failsafe behavior on the ground before flying.
          </p>
        </div>
      </div>

      {/* ── RECOMMENDED DEFAULTS ── */}
      {!touched && (
        <div className="flex items-start gap-4 rounded-lg border border-accent/30 bg-accent/5 px-5 py-4">
          <Wand2 size={20} className="mt-0.5 shrink-0 text-accent" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Apply recommended failsafe defaults?
            </p>
            <p className="mt-0.5 text-sm text-muted">
              Safe starting configuration: RTL on radio loss, RTL on low battery,
              Land on critical battery. Battery thresholds set for a 4S LiPo
              (3.5V/cell low, 3.3V/cell critical).
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
          <ShieldCheck size={14} className="shrink-0 text-success" />
          <p className="text-sm text-success">
            Failsafes configured. Adjust individual settings below or continue.
          </p>
        </div>
      )}

      {/* ── FAILSAFE CARDS ── */}
      <div className="space-y-3">
        {failsafes.map((fs) => {
          const Icon = fs.icon;
          const currentValue = getValue(fs.param);
          const isStaged = stagedParams[fs.param] !== undefined;

          return (
            <div
              key={fs.id}
              className={`rounded-lg border bg-surface-0 p-4 transition-colors ${
                isStaged ? 'border-accent/30' : 'border-border'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-surface-2">
                  <Icon size={16} className="text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">{fs.label}</h3>
                    {isStaged && (
                      <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{fs.description}</p>
                  <select
                    value={currentValue !== undefined ? Math.round(currentValue) : ''}
                    onChange={(e) => handleChange(fs.param, Number(e.target.value))}
                    className="input-field mt-2 w-full max-w-sm text-sm"
                  >
                    {currentValue === undefined && (
                      <option value="" disabled>Not loaded</option>
                    )}
                    {fs.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}{opt.recommended ? ' (recommended)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── BATTERY THRESHOLDS ── */}
      <div className="rounded-lg border border-border bg-surface-0 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Battery size={14} className="text-muted" />
          <h3 className="text-sm font-bold text-foreground">Battery Thresholds</h3>
        </div>
        <p className="text-xs text-muted mb-3">
          Set voltage levels that trigger low and critical battery failsafe actions.
          Defaults assume a 4S LiPo. Adjust for your battery cell count.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <VoltageInput
            label="Low voltage"
            param="BATT_LOW_VOLT"
            value={getValue('BATT_LOW_VOLT')}
            onChange={(v) => handleChange('BATT_LOW_VOLT', v)}
            hint="3.5V/cell"
          />
          <VoltageInput
            label="Critical voltage"
            param="BATT_CRT_VOLT"
            value={getValue('BATT_CRT_VOLT')}
            onChange={(v) => handleChange('BATT_CRT_VOLT', v)}
            hint="3.3V/cell"
          />
        </div>
      </div>

      {/* ── BOTTOM HINT ── */}
      <div className="flex items-start gap-2 rounded border border-border bg-surface-0 px-4 py-2.5">
        <Info size={13} className="mt-0.5 shrink-0 text-muted" />
        <p className="text-xs text-muted">
          Advanced failsafe options (EKF, crash detection, geofence) can be
          configured from the Failsafes page after the wizard. GCS failsafe is
          disabled by default since most setups don't use persistent telemetry
          during flight.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Voltage Input                                                       */
/* ------------------------------------------------------------------ */

function VoltageInput({
  label,
  param,
  value,
  onChange,
  hint,
}: {
  label: string;
  param: string;
  value: number | undefined;
  onChange: (value: number) => void;
  hint: string;
}) {
  return (
    <div>
      <label className="text-xs text-muted">{label}</label>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number"
          value={value !== undefined ? value.toFixed(1) : ''}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(v);
          }}
          min={0}
          max={60}
          step={0.1}
          className="input-field w-24 text-right font-mono tabular-nums text-sm"
        />
        <span className="text-xs text-subtle">V</span>
        <span className="text-[10px] text-subtle">({hint})</span>
      </div>
    </div>
  );
}
