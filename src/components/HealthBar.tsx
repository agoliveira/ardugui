/**
 * HealthBar -- Sensor health indicator pills for the header.
 *
 * Each sensor is a labeled pill with icon + abbreviation,
 * color-coded by health state. Click opens a detail panel.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  ArrowUpDown,
  Compass,
  Gauge,
  Satellite,
  Eye,
  Wind,
  Radio,
  HardDrive,
  ShieldCheck,
  Cpu,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useTelemetryStore } from '@/store/telemetryStore';

interface SensorDef {
  bit: number;
  label: string;
  icon: LucideIcon;
  short: string;
}

const SENSORS: SensorDef[] = [
  { bit: 0,  label: '3D Gyroscope',           icon: RotateCcw,   short: 'GYR' },
  { bit: 1,  label: '3D Accelerometer',       icon: ArrowUpDown, short: 'ACC' },
  { bit: 2,  label: 'Magnetometer',           icon: Compass,     short: 'MAG' },
  { bit: 3,  label: 'Barometer',              icon: Gauge,       short: 'BAR' },
  { bit: 5,  label: 'GPS',                    icon: Satellite,   short: 'GPS' },
  { bit: 4,  label: 'Airspeed Sensor',        icon: Wind,        short: 'ASP' },
  { bit: 6,  label: 'Optical Flow',           icon: Eye,         short: 'FLW' },
  { bit: 16, label: 'RC Receiver',            icon: Radio,       short: 'RC'  },
  { bit: 24, label: 'Logging',                icon: HardDrive,   short: 'LOG' },
  { bit: 28, label: 'Pre-Arm Checks',         icon: ShieldCheck, short: 'ARM' },
];

type SensorState = 'healthy' | 'unhealthy' | 'searching' | 'disabled' | 'absent';

function getSensorState(bit: number, present: number, enabled: number, health: number): SensorState {
  const mask = 1 << bit;
  if (!(present & mask)) return 'absent';
  if (!(enabled & mask)) return 'disabled';
  if (!(health & mask))  return 'unhealthy';
  return 'healthy';
}

const PILL_STYLES: Record<SensorState, { bg: string; text: string; border: string; pulse: boolean }> = {
  healthy:   { bg: 'bg-success/10', text: 'text-success',  border: 'border-success/30', pulse: false },
  unhealthy: { bg: 'bg-danger/15',  text: 'text-danger',   border: 'border-danger/35',  pulse: true  },
  searching: { bg: 'bg-warning/12', text: 'text-warning',  border: 'border-warning/30', pulse: true  },
  disabled:  { bg: 'bg-warning/8',  text: 'text-warning',  border: 'border-warning/20', pulse: false },
  absent:    { bg: 'bg-subtle/5',   text: 'text-subtle',   border: 'border-subtle/10',  pulse: false },
};

const STATE_LABELS: Record<SensorState, string> = {
  healthy: 'OK', unhealthy: 'Error', searching: 'Searching', disabled: 'Disabled', absent: 'Not Present',
};

const STATE_DOT: Record<SensorState, string> = {
  healthy: 'bg-success', unhealthy: 'bg-danger', searching: 'bg-warning', disabled: 'bg-warning', absent: 'bg-subtle',
};

const GPS_FIX_LABELS: Record<number, string> = {
  0: 'No GPS', 1: 'No Fix', 2: '2D Fix', 3: '3D Fix', 4: 'DGPS', 5: 'RTK Float', 6: 'RTK Fixed',
};

export function HealthBar() {
  const sensorHealth = useTelemetryStore((s) => s.sensorHealth);
  const gps = useTelemetryStore((s) => s.gps);
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node) &&
        barRef.current && !barRef.current.contains(e.target as Node)) {
      setShowPanel(false);
    }
  }, []);

  useEffect(() => {
    if (showPanel) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPanel, handleClickOutside]);

  if (!sensorHealth) return null;

  const { present, enabled, health, cpuLoad } = sensorHealth;

  function getEffectiveState(sensor: SensorDef): SensorState {
    const base = getSensorState(sensor.bit, present, enabled, health);
    if (sensor.bit === 5 && base === 'unhealthy' && gps) {
      if (gps.fix >= 1 && gps.fix < 3) return 'searching';
    }
    return base;
  }

  const visibleSensors = SENSORS.filter((s) => present & (1 << s.bit));
  const problemCount = visibleSensors.filter((s) => {
    const state = getEffectiveState(s);
    return state === 'unhealthy' || state === 'searching';
  }).length;

  return (
    <div className="relative">
      {/* ── Sensor pill row ────────────────────────────────────────────── */}
      <div
        ref={barRef}
        className="flex cursor-pointer items-center gap-1.5 rounded-xl px-1 py-0.5 transition-colors hover:bg-surface-2/40"
        onClick={() => setShowPanel((prev) => !prev)}
        title="Sensor health -- click for details"
      >
        {visibleSensors.map((sensor) => {
          const state = getEffectiveState(sensor);
          const style = PILL_STYLES[state];
          const Icon = sensor.icon;
          return (
            <div
              key={sensor.bit}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5
                ${style.bg} ${style.text} ${style.border}
                ${style.pulse ? 'animate-pulse' : ''}
              `}
              title={`${sensor.label}: ${STATE_LABELS[state]}`}
            >
              <Icon size={16} strokeWidth={2.5} />
              <span className="text-[12px] font-extrabold tracking-wider">{sensor.short}</span>
            </div>
          );
        })}

        {problemCount > 0 && (
          <div className="ml-1 flex h-7 min-w-7 items-center justify-center rounded-full bg-danger px-2 text-[13px] font-extrabold text-white shadow-lg shadow-danger/30">
            {problemCount}
          </div>
        )}
      </div>

      {/* ── Detail panel ───────────────────────────────────────────────── */}
      {showPanel && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full z-50 mt-2 min-w-[400px] rounded-xl border border-border bg-surface-0 shadow-2xl shadow-black/40"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div className="flex items-center gap-4">
              <span className="text-base font-bold text-foreground">Sensor Health</span>
              <span className="flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-1 text-sm font-medium text-muted">
                <Cpu size={14} />
                CPU {(cpuLoad / 10).toFixed(1)}%
              </span>
            </div>
            <button
              onClick={() => setShowPanel(false)}
              className="rounded-lg p-1.5 text-subtle hover:bg-surface-2 hover:text-muted transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-2">
            {SENSORS.map((sensor) => {
              const state = getEffectiveState(sensor);
              if (state === 'absent') return null;
              const Icon = sensor.icon;
              const style = PILL_STYLES[state];

              const isGps = sensor.bit === 5;
              const gpsInfo = isGps && gps
                ? `${GPS_FIX_LABELS[gps.fix] ?? `Fix ${gps.fix}`} · ${gps.satellites} sats`
                : null;

              return (
                <div
                  key={sensor.bit}
                  className="flex items-center gap-3.5 rounded-lg px-3.5 py-3 hover:bg-surface-1 transition-colors"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.bg} border ${style.border}`}>
                    <Icon size={20} strokeWidth={2} className={style.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold text-foreground">{sensor.label}</div>
                    {gpsInfo && <div className="text-sm text-muted">{gpsInfo}</div>}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className={`text-sm font-bold ${style.text}`}>
                      {isGps && gps && state !== 'disabled'
                        ? GPS_FIX_LABELS[gps.fix] ?? STATE_LABELS[state]
                        : STATE_LABELS[state]}
                    </span>
                    <div className={`h-3 w-3 rounded-full ${STATE_DOT[state]} ${style.pulse ? 'animate-pulse' : ''}`} />
                  </div>
                </div>
              );
            })}

            {(() => {
              const absent = SENSORS.filter((s) => !(present & (1 << s.bit)));
              if (absent.length === 0) return null;
              return (
                <div className="mt-1 border-t border-border px-3.5 py-2.5">
                  <span className="text-sm text-subtle">
                    Not present: {absent.map((s) => s.short).join(', ')}
                  </span>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
