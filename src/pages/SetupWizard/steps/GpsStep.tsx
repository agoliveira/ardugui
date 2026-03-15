/**
 * GpsStep.tsx -- Wizard step for GPS configuration.
 *
 * This is intentionally simple: ArduPilot auto-detects GPS protocol
 * (GPS_TYPE=1) and most boards have a dedicated GPS port. The step's
 * job is to confirm the GPS module is talking to the FC.
 *
 * Sections:
 *   1. Status banner (working / waiting / not detected)
 *   2. Serial port info (read-only when pre-configured)
 *   3. Live GPS telemetry (fix, sats, HDOP, lat/lon)
 *
 * Completion gate: GPS telemetry received (any fix type, including no-fix).
 *   This allows indoor setup where you can't get a satellite fix.
 *   The step is also skippable for aircraft that don't need GPS.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Satellite,
  SignalZero,
  Info,
  AlertTriangle,
  Navigation,
} from 'lucide-react';
import { useWizardStore } from '../wizardStore';
import { useParameterStore } from '@/store/parameterStore';
import { useTelemetryStore } from '@/store/telemetryStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { getBoardById } from '@/models/boardRegistry';

/* ------------------------------------------------------------------ */
/*  GPS fix type labels                                                 */
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

/* ------------------------------------------------------------------ */
/*  HDOP quality label                                                  */
/* ------------------------------------------------------------------ */

function hdopQuality(hdop: number): { label: string; color: string } {
  if (hdop < 0) return { label: 'Unknown', color: 'text-subtle' };
  if (hdop <= 1.0) return { label: 'Excellent', color: 'text-success' };
  if (hdop <= 2.0) return { label: 'Good', color: 'text-success' };
  if (hdop <= 5.0) return { label: 'Moderate', color: 'text-yellow-400' };
  if (hdop <= 10.0) return { label: 'Fair', color: 'text-yellow-400' };
  return { label: 'Poor', color: 'text-red-400' };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface GpsStepProps {
  onCanAdvanceChange: (canAdvance: boolean) => void;
}

export function GpsStep({ onCanAdvanceChange }: GpsStepProps) {
  const markComplete = useWizardStore((s) => s.markComplete);
  const stageParams = useWizardStore((s) => s.stageParams);
  const stagedParams = useWizardStore((s) => s.stagedParams);
  const parameters = useParameterStore((s) => s.parameters);
  const boardId = useVehicleStore((s) => s.boardId);
  const gps = useTelemetryStore((s) => s.gps);

  const board = useMemo(
    () => (boardId ? getBoardById(boardId) : null),
    [boardId],
  );

  // ── Enable all constellations automatically ────────────────────────
  // GPS_GNSS_MODE bitmask: GPS(1) + SBAS(2) + Galileo(4) + BeiDou(8) + GLONASS(16) = 31
  // If the module doesn't support a constellation, it's silently ignored.
  const GPS_GNSS_ALL = 31;
  const currentGnssMode = parameters.get('GPS_GNSS_MODE')?.value ?? 0;

  useEffect(() => {
    if (stagedParams['GPS_GNSS_MODE'] === undefined && currentGnssMode !== GPS_GNSS_ALL) {
      stageParams({ GPS_GNSS_MODE: GPS_GNSS_ALL });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Detect GPS serial port from FC params OR wizard staged params ──

  const gpsPort = useMemo((): number | null => {
    // Check wizard staged params first (INAV import may have set SERIALn_PROTOCOL)
    for (let i = 1; i <= 9; i++) {
      if (stagedParams[`SERIAL${i}_PROTOCOL`] === 5) return i;
    }
    // Fall back to FC params
    for (let i = 1; i <= 9; i++) {
      if (parameters.get(`SERIAL${i}_PROTOCOL`)?.value === 5) return i;
    }
    return null;
  }, [parameters, stagedParams]);

  const gpsPortLabel = useMemo((): string | null => {
    if (gpsPort === null || !board?.uartPorts) return null;
    const portDef = board.uartPorts.find((p) => p.serialIndex === gpsPort);
    return portDef?.padLabel ?? null;
  }, [gpsPort, board]);

  const gpsType = parameters.get('GPS_TYPE')?.value ?? 1;

  // ── GPS link status ────────────────────────────────────────────────

  // GPS is "talking" if we receive any telemetry (even fix=0 means the
  // module is connected and responding, just no satellites yet)
  // GPS_RAW_INT is sent by ArduPilot even without a GPS module.
  // fix=0 means NO GPS hardware. fix>=1 means GPS present (even without lock).
  const gpsDetected = gps !== null && gps.fix >= 1;
  const hasFix = gps !== null && gps.fix >= 3;

  // Track if we've ever seen GPS data this session (for the "waiting" state)
  const [everSeen, setEverSeen] = useState(false);
  useEffect(() => {
    if (gpsDetected && !everSeen) setEverSeen(true);
  }, [gpsDetected, everSeen]);

  // ── Advance gate ───────────────────────────────────────────────────

  useEffect(() => {
    // Allow advance as soon as GPS telemetry comes in.
    // Don't require a fix -- indoor setup is common.
    const canPass = gpsDetected;
    if (canPass) markComplete('gps');
    onCanAdvanceChange(canPass);
  }, [gpsDetected, onCanAdvanceChange, markComplete]);

  // ── Render ─────────────────────────────────────────────────────────

  const fix = gps ? fixInfo(gps.fix) : null;
  const hdop = gps && gps.hdop >= 0 ? hdopQuality(gps.hdop) : null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">

      {/* ── STATUS BANNER ── */}
      {gpsDetected && hasFix && (
        <div className="flex items-center gap-4 rounded-lg border border-success/40 bg-success/10 px-5 py-4">
          <Navigation size={28} className="shrink-0 text-success" />
          <div>
            <p className="text-base font-bold text-success">
              GPS working -- {fix!.label}
            </p>
            <p className="mt-0.5 text-sm text-success/80">
              {gps!.satellites} satellites,{' '}
              {gpsPort ? `SERIAL${gpsPort}` : 'auto-detected'}.
              You can continue to the next step.
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
              GPS module is communicating but doesn't have a satellite fix yet.
              {gps!.fix === 0
                ? ' This is normal when indoors or during cold start.'
                : ` Tracking ${gps!.satellites} satellite${gps!.satellites !== 1 ? 's' : ''}.`}
              {' '}You can continue to the next step.
            </p>
          </div>
        </div>
      )}

      {!gpsDetected && (
        <div className="flex items-start gap-2.5 rounded border border-blue-500/30 bg-blue-900/15 px-4 py-3">
          <Info size={14} className="mt-0.5 shrink-0 text-blue-400" />
          <div>
            <p className="text-sm text-blue-300/90">
              {gpsPort
                ? <>GPS is configured on SERIAL{gpsPort} but no data received yet. Check that the GPS module is connected and powered.</>
                : <>No GPS serial port detected. If you have a GPS module, ensure it is wired to a UART port.</>}
            </p>
            <p className="mt-1 text-xs text-blue-300/60">
              If your aircraft doesn't use GPS, you can skip this step.
            </p>
          </div>
        </div>
      )}

      {/* ── GPS INFO GRID ── */}
      <div className="grid gap-4 sm:grid-cols-2">

        {/* Configuration card */}
        <div className="space-y-3 rounded-lg border border-border bg-surface-0 p-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
            Configuration
          </h3>
          <div className="space-y-2.5">
            <InfoRow
              label="Serial Port"
              value={
                gpsPort
                  ? `SERIAL${gpsPort}${gpsPortLabel ? ` (${gpsPortLabel})` : ''}`
                  : 'Not configured'
              }
              ok={gpsPort !== null}
            />
            <InfoRow
              label="GPS Type"
              value={gpsType === 1 ? 'Auto' : `Type ${gpsType}`}
              ok={gpsType > 0}
            />
            <InfoRow
              label="Constellations"
              value={currentGnssMode === GPS_GNSS_ALL || stagedParams['GPS_GNSS_MODE'] === GPS_GNSS_ALL
                ? 'All enabled'
                : currentGnssMode === 0
                  ? 'Auto (will set all)'
                  : 'Partial (will set all)'}
              ok={true}
            />
            <InfoRow
              label="Link"
              value={gpsDetected ? 'Receiving data' : 'No data'}
              ok={gpsDetected}
            />
          </div>
        </div>

        {/* Live telemetry card */}
        <div className="space-y-3 rounded-lg border border-border bg-surface-0 p-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
            Status
          </h3>
          {gpsDetected ? (
            <div className="space-y-2.5">
              <InfoRow
                label="Fix"
                value={fix!.label}
                valueColor={fix!.color}
              />
              <InfoRow
                label="Satellites"
                value={`${gps!.satellites}`}
                icon={<Satellite size={13} className="text-muted" />}
              />
              {hdop && (
                <InfoRow
                  label="HDOP"
                  value={`${gps!.hdop.toFixed(1)} (${hdop.label})`}
                  valueColor={hdop.color}
                />
              )}
              {hasFix && (
                <>
                  <InfoRow
                    label="Position"
                    value={`${gps!.lat.toFixed(6)}, ${gps!.lon.toFixed(6)}`}
                  />
                  <InfoRow
                    label="Altitude"
                    value={`${gps!.alt.toFixed(1)} m MSL`}
                  />
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-center">
              <SignalZero size={32} className="mb-3 text-subtle" />
              <p className="text-sm text-muted">Waiting for GPS data...</p>
              <p className="mt-1 text-xs text-subtle">
                GPS modules can take 30-60 seconds to start communicating after power-on.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── SATELLITE BAR (visual indicator) ── */}
      {gpsDetected && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
              Satellite Signal
            </h3>
            <span className={`text-xs font-medium ${fix!.color}`}>
              {fix!.label}
            </span>
          </div>
          <SatelliteBar satellites={gps!.satellites} fix={gps!.fix} />
        </div>
      )}

      {/* ── BOTTOM HINT ── */}
      {gpsDetected && (
        <div className="flex items-center gap-2 rounded border border-success/30 bg-success/5 px-4 py-2.5">
          <Check size={16} className="shrink-0 text-success" />
          <p className="text-sm text-success">
            GPS module detected.
            {hasFix
              ? ` ${gps!.satellites} satellites, ${fix!.label}.`
              : ' Waiting for satellite fix -- you can continue without one.'}
          </p>
        </div>
      )}

      {currentGnssMode !== GPS_GNSS_ALL && (
        <div className="flex items-start gap-2 rounded border border-border bg-surface-0 px-4 py-2.5">
          <Satellite size={13} className="mt-0.5 shrink-0 text-muted" />
          <p className="text-xs text-muted">
            All satellite constellations (GPS, SBAS, Galileo, BeiDou, GLONASS) will be
            enabled when parameters are applied. Unsupported constellations are
            ignored by the module. This maximizes satellite visibility and fix quality.
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Info Row                                                            */
/* ------------------------------------------------------------------ */

function InfoRow({
  label,
  value,
  ok,
  icon,
  valueColor,
}: {
  label: string;
  value: string;
  ok?: boolean;
  icon?: React.ReactNode;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className={`flex items-center gap-1.5 font-medium ${valueColor ?? (ok === false ? 'text-subtle' : ok === true ? 'text-success' : 'text-foreground')}`}>
        {icon}
        {ok !== undefined && (
          ok
            ? <Check size={12} className="text-success" />
            : <AlertTriangle size={12} className="text-yellow-500" />
        )}
        {value}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Satellite Bar                                                       */
/* ------------------------------------------------------------------ */

function SatelliteBar({ satellites, fix }: { satellites: number; fix: number }) {
  // Show a visual bar of satellite "slots" -- max 20 visible
  const maxSlots = 20;
  const count = Math.min(satellites, maxSlots);

  let barColor: string;
  if (fix >= 5) barColor = 'bg-blue-400';        // RTK
  else if (fix >= 3) barColor = 'bg-success';     // 3D fix
  else if (fix >= 1) barColor = 'bg-yellow-400';  // Searching
  else barColor = 'bg-subtle';                     // No GPS

  return (
    <div className="flex items-end gap-0.5" style={{ height: 32 }}>
      {Array.from({ length: maxSlots }, (_, i) => {
        const active = i < count;
        // Stagger heights for a visual "signal" feel
        const h = active ? 12 + Math.min(i, 10) * 2 : 6;
        return (
          <div
            key={i}
            className={`flex-1 rounded-sm transition-all duration-300 ${
              active ? barColor : 'bg-surface-2'
            }`}
            style={{ height: h }}
          />
        );
      })}
    </div>
  );
}
