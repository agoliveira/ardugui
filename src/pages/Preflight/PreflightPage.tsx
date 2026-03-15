/**
 * PreflightPage.tsx -- Pre-flight Readiness Dashboard.
 *
 * Answers the single most important question: "Can I fly?"
 *
 * Shows a big green/red readiness indicator, sensor health from SYS_STATUS,
 * categorized pre-arm failures from STATUSTEXT, and live telemetry status
 * (GPS, battery, RC). A "Run Checks" button triggers the FC to report all
 * pre-arm failures.
 *
 * Data sources:
 *   - preflightStore: accumulated PreArm STATUSTEXT messages
 *   - telemetryStore: sensor health bitmask, GPS, battery, RC
 *   - vehicleStore: armed state
 *   - parameterStore: calibration offsets, failsafe params
 */

import { useEffect, useCallback, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Cpu,
  Gauge,
  Loader2,
  Sliders,
} from 'lucide-react';
import { connectionManager } from '@/mavlink/connection';
import { useVehicleStore } from '@/store/vehicleStore';
import { useTelemetryStore } from '@/store/telemetryStore';
import { useParameterStore } from '@/store/parameterStore';
import {
  usePreflightStore,
  parseSensorHealth,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type PreArmCategory,
  type SensorStatus,
} from '@/store/preflightStore';
import {
  validateParameters,
  CATEGORY_LABELS as VALIDATION_CATEGORY_LABELS,
} from '@/models/paramValidation';

/* ------------------------------------------------------------------ */
/*  Derived checks from params and telemetry                           */
/* ------------------------------------------------------------------ */

interface DerivedCheck {
  label: string;
  status: 'ok' | 'warn' | 'fail';
  detail: string;
}

function useDerivedChecks(): DerivedCheck[] {
  const params = useParameterStore((s) => s.parameters);
  const gps = useTelemetryStore((s) => s.gps);
  const battery = useTelemetryStore((s) => s.battery);
  const rcChannels = useTelemetryStore((s) => s.rcChannels);
  const rcChancount = useTelemetryStore((s) => s.rcChancount);
  const rcRssi = useTelemetryStore((s) => s.rcRssi);

  return useMemo(() => {
    const checks: DerivedCheck[] = [];

    // Accelerometer calibration
    const ofsX = params.get('INS_ACCOFFS_X')?.value ?? 0;
    const ofsY = params.get('INS_ACCOFFS_Y')?.value ?? 0;
    const ofsZ = params.get('INS_ACCOFFS_Z')?.value ?? 0;
    const accelCal = ofsX !== 0 || ofsY !== 0 || ofsZ !== 0;
    checks.push({
      label: 'Accelerometer calibrated',
      status: accelCal ? 'ok' : 'fail',
      detail: accelCal
        ? `Offsets: [${ofsX.toFixed(1)}, ${ofsY.toFixed(1)}, ${ofsZ.toFixed(1)}]`
        : 'Run accelerometer calibration before flying',
    });

    // Compass calibration
    const cOfsX = params.get('COMPASS_OFS_X')?.value ?? 0;
    const cOfsY = params.get('COMPASS_OFS_Y')?.value ?? 0;
    const cOfsZ = params.get('COMPASS_OFS_Z')?.value ?? 0;
    const compassCal = cOfsX !== 0 || cOfsY !== 0 || cOfsZ !== 0;
    const compassUse = params.get('COMPASS_USE')?.value ?? 1;
    if (compassUse > 0) {
      checks.push({
        label: 'Compass calibrated',
        status: compassCal ? 'ok' : 'fail',
        detail: compassCal
          ? `Offsets: [${cOfsX.toFixed(0)}, ${cOfsY.toFixed(0)}, ${cOfsZ.toFixed(0)}]`
          : 'Run compass calibration before flying',
      });
    }

    // GPS
    if (gps) {
      const hasFix = gps.fix >= 3;
      const goodFix = gps.fix >= 3 && gps.satellites >= 8;
      checks.push({
        label: 'GPS lock',
        status: goodFix ? 'ok' : hasFix ? 'warn' : gps.fix >= 1 ? 'warn' : 'fail',
        detail: gps.fix >= 1
          ? `Fix: ${gps.fix >= 3 ? '3D' : 'No lock'}, ${gps.satellites} sats, HDOP ${gps.hdop >= 0 ? gps.hdop.toFixed(1) : '?'}`
          : 'No GPS detected',
      });
    }

    // Battery
    if (battery && battery.voltage > 1) {
      const cellCount = params.get('BATT_CELL_COUNT')?.value ?? 0;
      const voltsPerCell = cellCount > 0 ? battery.voltage / cellCount : 0;
      checks.push({
        label: 'Battery',
        status: voltsPerCell > 3.6 || cellCount === 0 ? 'ok' : voltsPerCell > 3.3 ? 'warn' : 'fail',
        detail: `${battery.voltage.toFixed(1)}V${cellCount > 0 ? ` (${voltsPerCell.toFixed(2)}V/cell, ${cellCount}S)` : ''}${battery.remaining >= 0 ? `, ${battery.remaining}% remaining` : ''}`,
      });
    }

    // RC receiver
    if (rcChannels && rcChannels.length > 0) {
      const hasSignal = rcChancount > 0 && rcChannels.some((ch) => ch > 800 && ch < 2200);
      checks.push({
        label: 'RC receiver',
        status: hasSignal ? 'ok' : 'fail',
        detail: hasSignal
          ? `${rcChancount} channels${rcRssi !== undefined && rcRssi < 255 ? `, RSSI ${rcRssi}%` : ''}`
          : 'No RC signal detected',
      });
    }

    // Flight modes configured
    const mode1 = params.get('FLTMODE1')?.value;
    checks.push({
      label: 'Flight modes',
      status: mode1 !== undefined ? 'ok' : 'warn',
      detail: mode1 !== undefined
        ? `${[1,2,3,4,5,6].filter(i => params.get(`FLTMODE${i}`)?.value !== undefined).length} modes configured`
        : 'No flight modes configured',
    });

    // Failsafes
    const fsRc = params.get('FS_THR_ENABLE')?.value ?? params.get('THR_FAILSAFE')?.value ?? 0;
    checks.push({
      label: 'RC failsafe',
      status: fsRc > 0 ? 'ok' : 'warn',
      detail: fsRc > 0 ? 'Enabled' : 'Not configured -- strongly recommended',
    });

    return checks;
  }, [params, gps, battery, rcChannels, rcChancount, rcRssi]);
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function PreflightPage() {
  const armed = useVehicleStore((s) => s.armed);
  const sensorHealth = useTelemetryStore((s) => s.sensorHealth);
  const failures = usePreflightStore((s) => s.failures);
  const checking = usePreflightStore((s) => s.checking);
  const lastCheckTime = usePreflightStore((s) => s.lastCheckTime);
  const derivedChecks = useDerivedChecks();
  const vehicleType = useVehicleStore((s) => s.type);
  const parameters = useParameterStore((s) => s.parameters);

  // Parameter validation findings
  const validationFindings = useMemo(() => {
    const get = (name: string) => parameters.get(name)?.value;
    return validateParameters(get, vehicleType);
  }, [parameters, vehicleType]);

  const criticalFindings = validationFindings.filter(f => f.severity === 'critical');
  const warningFindings = validationFindings.filter(f => f.severity === 'warning');
  const infoFindings = validationFindings.filter(f => f.severity === 'info');

  // Parse sensor health
  const sensors = useMemo((): SensorStatus[] => {
    if (!sensorHealth) return [];
    return parseSensorHealth(sensorHealth.present, sensorHealth.enabled, sensorHealth.health);
  }, [sensorHealth]);

  // Overall readiness
  const hasPreArmFailures = failures.length > 0;
  const hasSensorFaults = sensors.some((s) => s.enabled && !s.healthy);
  const hasDerivedFails = derivedChecks.some((c) => c.status === 'fail');
  const hasCriticalValidation = criticalFindings.length > 0;
  const isReady = !hasPreArmFailures && !hasSensorFaults && !hasDerivedFails && !hasCriticalValidation && !armed;
  const isArmed = armed;
  const totalIssues = failures.length + derivedChecks.filter(c => c.status === 'fail').length + criticalFindings.length;

  // Group failures by category
  const failuresByCategory = useMemo(() => {
    const groups = new Map<PreArmCategory, typeof failures>();
    for (const f of failures) {
      const list = groups.get(f.category) ?? [];
      list.push(f);
      groups.set(f.category, list);
    }
    return groups;
  }, [failures]);

  // Auto-run checks on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      connectionManager.requestPreArmCheck();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleRunChecks = useCallback(() => {
    connectionManager.requestPreArmCheck();
  }, []);

  return (
    <div className="w-full space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Pre-flight Check</h1>
        <p className="mt-1 text-lg text-muted">
          Verify your aircraft is ready to fly. All checks must pass before arming.
        </p>
      </div>

      {/* ── BIG READINESS INDICATOR ───────────────────────────────── */}

      <div className={`rounded-lg border-2 px-6 py-5 flex items-center gap-5 ${
        isArmed
          ? 'border-danger/60 bg-danger/10'
          : isReady
            ? 'border-success/60 bg-success/10'
            : 'border-warning/60 bg-warning/10'
      }`}>
        {isArmed ? (
          <ShieldAlert size={48} className="shrink-0 text-danger" />
        ) : isReady ? (
          <ShieldCheck size={48} className="shrink-0 text-success" />
        ) : (
          <Shield size={48} className="shrink-0 text-warning" />
        )}
        <div className="flex-1">
          <h2 className={`text-2xl font-extrabold ${
            isArmed ? 'text-danger' : isReady ? 'text-success' : 'text-warning'
          }`}>
            {isArmed ? 'ARMED' : isReady ? 'Ready to Fly' : 'Not Ready'}
          </h2>
          <p className="text-sm text-muted mt-0.5">
            {isArmed
              ? 'Aircraft is armed. Motors will spin. Disarm before making changes.'
              : isReady
                ? 'All pre-arm checks passed. You can arm when ready.'
                : `${totalIssues} issue${totalIssues !== 1 ? 's' : ''} must be resolved before arming.`}
          </p>
        </div>
        <button
          onClick={handleRunChecks}
          disabled={checking}
          className="btn btn-ghost gap-1.5 shrink-0"
        >
          {checking
            ? <Loader2 size={14} className="animate-spin" />
            : <RefreshCw size={14} />}
          {checking ? 'Checking...' : 'Re-check'}
        </button>
      </div>

      {/* ── SENSOR HEALTH ─────────────────────────────────────────── */}

      {sensors.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
            <Cpu size={16} className="text-accent" />
            <h3 className="text-sm font-bold text-foreground">Sensor Health</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-border">
            {sensors.map((s) => (
              <div key={s.name} className="bg-surface-0 px-4 py-2.5 flex items-center gap-2.5">
                {s.healthy ? (
                  <CheckCircle2 size={14} className="shrink-0 text-success" />
                ) : s.enabled ? (
                  <XCircle size={14} className="shrink-0 text-danger" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full bg-surface-2 shrink-0" />
                )}
                <span className={`text-sm ${
                  s.healthy ? 'text-foreground' : s.enabled ? 'text-danger font-semibold' : 'text-subtle'
                }`}>
                  {s.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DERIVED CHECKS ────────────────────────────────────────── */}

      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
          <Gauge size={16} className="text-accent" />
          <h3 className="text-sm font-bold text-foreground">System Checks</h3>
        </div>
        <div className="divide-y divide-border">
          {derivedChecks.map((check, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-2.5">
              {check.status === 'ok' ? (
                <CheckCircle2 size={14} className="shrink-0 text-success" />
              ) : check.status === 'warn' ? (
                <AlertTriangle size={14} className="shrink-0 text-warning" />
              ) : (
                <XCircle size={14} className="shrink-0 text-danger" />
              )}
              <span className="text-sm font-medium text-foreground flex-1">{check.label}</span>
              <span className={`text-xs ${
                check.status === 'ok' ? 'text-muted' : check.status === 'warn' ? 'text-warning' : 'text-danger'
              }`}>
                {check.detail}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONFIGURATION VALIDATION ──────────────────────────────── */}

      {(criticalFindings.length > 0 || warningFindings.length > 0) && (
        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
            <Sliders size={16} className="text-accent" />
            <h3 className="text-sm font-bold text-foreground">
              Configuration Checks
              {criticalFindings.length > 0 && (
                <span className="ml-2 text-xs text-danger font-normal">
                  {criticalFindings.length} critical
                </span>
              )}
              {warningFindings.length > 0 && (
                <span className="ml-2 text-xs text-warning font-normal">
                  {warningFindings.length} warning{warningFindings.length !== 1 ? 's' : ''}
                </span>
              )}
            </h3>
          </div>
          <div className="divide-y divide-border">
            {[...criticalFindings, ...warningFindings, ...infoFindings].map((f, i) => (
              <div key={i} className="px-5 py-2.5 flex items-start gap-3">
                {f.severity === 'critical' ? (
                  <XCircle size={14} className="mt-0.5 shrink-0 text-danger" />
                ) : f.severity === 'warning' ? (
                  <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warning" />
                ) : (
                  <Info size={14} className="mt-0.5 shrink-0 text-blue-400" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      f.severity === 'critical' ? 'text-danger'
                        : f.severity === 'warning' ? 'text-warning'
                        : 'text-foreground'
                    }`}>{f.title}</span>
                    <span className="text-[10px] text-subtle uppercase">{VALIDATION_CATEGORY_LABELS[f.category]}</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">{f.description}</p>
                  {f.fix && (
                    <button
                      onClick={() => {
                        const store = useParameterStore.getState();
                        for (const [param, value] of Object.entries(f.fix!)) {
                          store.setParamLocal(param, value);
                        }
                      }}
                      className="mt-1.5 flex items-center gap-1 rounded bg-accent/10 px-2 py-1 text-[11px] font-semibold text-accent hover:bg-accent/20 transition-colors"
                    >
                      Fix: {Object.entries(f.fix).map(([p, v]) => `${p}=${v}`).join(', ')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PRE-ARM FAILURES (from FC) ────────────────────────────── */}

      {hasPreArmFailures && (
        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
            <ShieldAlert size={16} className="text-danger" />
            <h3 className="text-sm font-bold text-foreground">
              Pre-Arm Failures ({failures.length})
            </h3>
          </div>
          <div className="divide-y divide-border">
            {CATEGORY_ORDER.map((cat) => {
              const catFailures = failuresByCategory.get(cat);
              if (!catFailures || catFailures.length === 0) return null;
              return (
                <div key={cat} className="px-5 py-3">
                  <div className="text-xs font-bold text-subtle uppercase tracking-wider mb-2">
                    {CATEGORY_LABELS[cat]}
                  </div>
                  <div className="space-y-1.5">
                    {catFailures.map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <XCircle size={12} className="mt-0.5 shrink-0 text-danger" />
                        <span className="text-sm text-foreground">{f.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ALL CLEAR ─────────────────────────────────────────────── */}

      {!hasPreArmFailures && lastCheckTime && !checking && (
        <div className="flex items-center gap-3 rounded border border-success/30 bg-success/5 px-5 py-3">
          <CheckCircle2 size={16} className="shrink-0 text-success" />
          <p className="text-sm text-success/90">
            No pre-arm failures reported by the flight controller.
          </p>
        </div>
      )}

      {/* ── INFO ──────────────────────────────────────────────────── */}

      <div className="flex items-start gap-2 rounded border border-border bg-surface-0 px-4 py-2.5">
        <Info size={13} className="mt-0.5 shrink-0 text-muted" />
        <p className="text-xs text-muted">
          Pre-arm checks run automatically. Click "Re-check" to refresh.
          Some checks (like GPS lock) may take time to resolve.
          The flight controller will prevent arming until all checks pass.
        </p>
      </div>
    </div>
  );
}
