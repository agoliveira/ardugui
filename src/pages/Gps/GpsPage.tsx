/**
 * GpsPage.tsx -- Standalone GPS status and configuration page.
 *
 * Shows live GPS telemetry, serial port configuration, and constellation
 * settings. Read-only telemetry with editable constellation mode.
 */

import { useMemo } from 'react';
import {
  Navigation,
  Satellite,
  Info,
  Signal,
  SignalZero,
} from 'lucide-react';
import { useParameterStore, getEffectiveValue } from '@/store/parameterStore';
import { useTelemetryStore } from '@/store/telemetryStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { getBoardById } from '@/models/boardRegistry';

/* ------------------------------------------------------------------ */
/*  GPS helpers                                                        */
/* ------------------------------------------------------------------ */

const FIX_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'No GPS',      color: 'text-subtle' },
  1: { label: 'No Fix',      color: 'text-yellow-400' },
  2: { label: '2D Fix',      color: 'text-yellow-400' },
  3: { label: '3D Fix',      color: 'text-success' },
  4: { label: 'DGPS',        color: 'text-success' },
  5: { label: 'RTK Float',   color: 'text-blue-400' },
  6: { label: 'RTK Fixed',   color: 'text-blue-400' },
};

function fixInfo(fix: number) {
  return FIX_LABELS[fix] ?? { label: `Unknown (${fix})`, color: 'text-subtle' };
}

function hdopQuality(hdop: number): { label: string; color: string } {
  if (hdop < 0) return { label: 'Unknown', color: 'text-subtle' };
  if (hdop <= 1.0) return { label: 'Excellent', color: 'text-success' };
  if (hdop <= 2.0) return { label: 'Good', color: 'text-success' };
  if (hdop <= 5.0) return { label: 'Moderate', color: 'text-yellow-400' };
  if (hdop <= 10.0) return { label: 'Fair', color: 'text-yellow-400' };
  return { label: 'Poor', color: 'text-red-400' };
}

const GNSS_BITS: { bit: number; label: string }[] = [
  { bit: 1,  label: 'GPS' },
  { bit: 2,  label: 'SBAS' },
  { bit: 4,  label: 'Galileo' },
  { bit: 8,  label: 'BeiDou' },
  { bit: 16, label: 'GLONASS' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function GpsPage() {
  const parameters = useParameterStore((s) => s.parameters);
  const paramState = useParameterStore.getState();
  const setParamLocal = useParameterStore((s) => s.setParamLocal);
  const gps = useTelemetryStore((s) => s.gps);
  const boardId = useVehicleStore((s) => s.boardId);

  const board = useMemo(() => boardId ? getBoardById(boardId) : null, [boardId]);

  const gpsPort = useMemo((): number | null => {
    for (let i = 1; i <= 9; i++) {
      if ((getEffectiveValue(paramState, `SERIAL${i}_PROTOCOL`) ?? 0) === 5) return i;
    }
    return null;
  }, [paramState, parameters]);

  const gpsPortLabel = useMemo((): string | null => {
    if (gpsPort === null || !board?.uartPorts) return null;
    return board.uartPorts.find((p) => p.serialIndex === gpsPort)?.padLabel ?? null;
  }, [gpsPort, board]);

  const gpsType = getEffectiveValue(paramState, 'GPS_TYPE') ?? 1;
  const gnssMode = getEffectiveValue(paramState, 'GPS_GNSS_MODE') ?? 0;
  const gpsDetected = gps !== null && gps.fix >= 1;
  const hasFix = gps !== null && gps.fix >= 3;
  const fix = gps ? fixInfo(gps.fix) : null;
  const hdop = gps && gps.hdop >= 0 ? hdopQuality(gps.hdop) : null;

  const handleToggleConstellation = (bit: number) => {
    const current = gnssMode;
    const newVal = current & bit ? current & ~bit : current | bit;
    setParamLocal('GPS_GNSS_MODE', newVal);
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">GPS</h1>
        <p className="mt-1 text-lg text-muted">
          GPS module status, satellite tracking, and constellation configuration.
        </p>
      </div>

      {/* Status banner */}
      {gpsDetected && hasFix && (
        <div className="flex items-center gap-4 rounded-lg border border-success/40 bg-success/10 px-5 py-4">
          <Navigation size={28} className="shrink-0 text-success" />
          <div>
            <p className="text-base font-bold text-success">
              GPS working -- {fix!.label}
            </p>
            <p className="mt-0.5 text-sm text-success/80">
              {gps!.satellites} satellites, HDOP {gps!.hdop.toFixed(1)}.
            </p>
          </div>
        </div>
      )}

      {gpsDetected && !hasFix && (
        <div className="flex items-center gap-4 rounded-lg border border-accent/40 bg-accent/10 px-5 py-4">
          <Navigation size={28} className="shrink-0 text-accent" />
          <div>
            <p className="text-base font-bold text-accent">
              GPS connected -- {fix!.label}
            </p>
            <p className="mt-0.5 text-sm text-accent/80">
              Module communicating, {gps!.satellites} satellite{gps!.satellites !== 1 ? 's' : ''} tracked.
            </p>
          </div>
        </div>
      )}

      {!gpsDetected && (
        <div className="flex items-start gap-2.5 rounded border border-blue-500/30 bg-blue-900/15 px-4 py-3">
          <Info size={14} className="mt-0.5 shrink-0 text-blue-400" />
          <p className="text-sm text-blue-300/90">
            {gpsPort
              ? `GPS configured on SERIAL${gpsPort} but no data received. Check wiring and power.`
              : 'No GPS serial port detected. Ensure the GPS module is wired to a UART port.'}
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Live telemetry */}
        <div className="card">
          <div className="card-header">Live Status</div>
          {gpsDetected && gps ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Fix" value={fix!.label} color={fix!.color} />
                <StatCard label="Satellites" value={String(gps.satellites)}
                  color={gps.satellites >= 8 ? 'text-success' : gps.satellites >= 5 ? 'text-yellow-400' : 'text-red-400'} />
                <StatCard label="HDOP" value={gps.hdop.toFixed(1)}
                  color={hdop?.color ?? 'text-subtle'} sub={hdop?.label} />
                <StatCard label="Altitude" value={`${gps.alt.toFixed(1)}m`} color="text-foreground" />
              </div>
              {hasFix && (
                <div className="rounded border border-border bg-surface-1 px-3 py-2 text-center">
                  <p className="font-mono text-sm text-muted">
                    {(gps.lat / 1e7).toFixed(7)}, {(gps.lon / 1e7).toFixed(7)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-subtle">
              <SignalZero size={32} className="mb-3 opacity-50" />
              <p className="text-sm">No GPS data</p>
            </div>
          )}
        </div>

        {/* Configuration */}
        <div className="card">
          <div className="card-header">Configuration</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Serial Port</span>
              <span className="font-mono text-foreground">
                {gpsPort ? `SERIAL${gpsPort}${gpsPortLabel ? ` (${gpsPortLabel})` : ''}` : 'Not configured'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">GPS Type</span>
              <span className="font-mono text-foreground">
                {gpsType === 1 ? 'Auto' : `Type ${gpsType}`}
              </span>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-sm font-semibold text-foreground mb-2">Constellations</p>
              <p className="text-xs text-muted mb-3">
                Enable additional satellite constellations for better accuracy and faster fix.
                Unsupported constellations are ignored by the GPS module.
              </p>
              <div className="flex flex-wrap gap-2">
                {GNSS_BITS.map(({ bit, label }) => {
                  const enabled = (gnssMode & bit) !== 0;
                  return (
                    <button
                      key={bit}
                      onClick={() => handleToggleConstellation(bit)}
                      className={`rounded border-2 px-3 py-1.5 text-xs font-semibold transition ${
                        enabled
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border bg-surface-0 text-muted hover:border-accent/40'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] font-mono text-subtle">
                GPS_GNSS_MODE = {gnssMode}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, sub }: {
  label: string; value: string; color: string; sub?: string;
}) {
  return (
    <div className="rounded border border-border bg-surface-1 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wider text-subtle">{label}</p>
      <p className={`text-lg font-bold font-mono ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-subtle">{sub}</p>}
    </div>
  );
}
