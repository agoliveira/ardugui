/**
 * RcCalibration.tsx -- Reusable RC transmitter calibration component.
 *
 * Two-phase flow:
 *   1. Capture range -- user moves all sticks/switches to extremes.
 *      Min/max tracked in real time per channel.
 *   2. Confirm center -- user centers sticks, throttle low.
 *      Captures neutral position (written as RCx_TRIM).
 *      Throttle trim is auto-set to captured min.
 *
 * Used by:
 *   - Wizard RcCalibrationStep (writes to FC on save, calls onComplete)
 *   - Standalone RC Calibration page (same behavior)
 *
 * Does NOT stage params to wizardStore. Writes directly to FC (calibration data).
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  Radio,
  Check,
  AlertTriangle,
  RotateCw,
  Signal,
  SignalZero,
  Loader2,
} from 'lucide-react';
import { useTelemetryStore } from '@/store/telemetryStore';
import { useParameterStore } from '@/store/parameterStore';
import { connectionManager } from '@/mavlink/connection';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface RcCalibrationResult {
  /** Per-channel calibration: index 0 = RC1 */
  channels: {
    min: number;
    max: number;
    trim: number;
  }[];
}

interface RcCalibrationProps {
  /** Called when calibration is saved to FC. */
  onComplete?: (result: RcCalibrationResult) => void;
  /** Called when canAdvance state changes (wizard integration). */
  onCanAdvanceChange?: (canAdvance: boolean) => void;
}

type Phase = 'idle' | 'capturing' | 'centering' | 'saving' | 'done';

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const MIN_RANGE_US = 300; // Minimum acceptable range per channel
const MAX_CHANNELS = 16;
const THROTTLE_INDEX = 2; // 0-based, channel 3

const STICK_LABELS = ['Roll', 'Pitch', 'Throttle', 'Yaw'];

function channelLabel(index: number): string {
  if (index < 4) return STICK_LABELS[index];
  return `Ch ${index + 1}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function RcCalibration({ onComplete, onCanAdvanceChange }: RcCalibrationProps) {
  const rcChannels = useTelemetryStore((s) => s.rcChannels);
  const rcChancount = useTelemetryStore((s) => s.rcChancount);
  const parameters = useParameterStore((s) => s.parameters);

  const [phase, setPhase] = useState<Phase>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const chanCount = Math.min(Math.max(rcChancount, 0), MAX_CHANNELS);
  const hasSignal = chanCount > 0 && rcChannels.some((v) => v > 0 && v < 65535);

  // Per-channel min/max trackers -- persisted across renders via ref
  const capturedMins = useRef<number[]>([]);
  const capturedMaxs = useRef<number[]>([]);
  const [, forceUpdate] = useState(0);

  // Check if FC already has calibrated values (not defaults)
  const alreadyCalibrated = useMemo(() => {
    const rc1Min = parameters.get('RC1_MIN')?.value ?? 1100;
    const rc1Max = parameters.get('RC1_MAX')?.value ?? 1900;
    // Default uncalibrated values are typically 1100/1900
    return rc1Min !== 1100 || rc1Max !== 1900;
  }, [parameters]);

  // Detect RCMAP to find the real throttle channel
  const throttleChan = useMemo(() => {
    const mapped = parameters.get('RCMAP_THROTTLE')?.value;
    return mapped ? mapped - 1 : THROTTLE_INDEX; // 0-based
  }, [parameters]);

  // ── Phase transitions ─────────────────────────────────────────────

  const startCapture = useCallback(() => {
    capturedMins.current = new Array(chanCount).fill(99999);
    capturedMaxs.current = new Array(chanCount).fill(0);
    setSaveError(null);
    setPhase('capturing');
  }, [chanCount]);

  const resetCapture = useCallback(() => {
    capturedMins.current = new Array(chanCount).fill(99999);
    capturedMaxs.current = new Array(chanCount).fill(0);
    forceUpdate((n) => n + 1);
  }, [chanCount]);

  const proceedToCenter = useCallback(() => {
    setPhase('centering');
  }, []);

  // ── Live min/max tracking during capture phase ────────────────────

  useEffect(() => {
    if (phase !== 'capturing') return;
    if (!hasSignal) return;

    for (let i = 0; i < chanCount; i++) {
      const v = rcChannels[i];
      if (v <= 0 || v >= 65535) continue;
      if (v < capturedMins.current[i]) capturedMins.current[i] = v;
      if (v > capturedMaxs.current[i]) capturedMaxs.current[i] = v;
    }
    forceUpdate((n) => n + 1);
  }, [phase, rcChannels, chanCount, hasSignal]);

  // ── Channel quality check ─────────────────────────────────────────

  const channelRanges = useMemo(() => {
    const ranges: number[] = [];
    for (let i = 0; i < chanCount; i++) {
      const mn = capturedMins.current[i] ?? 99999;
      const mx = capturedMaxs.current[i] ?? 0;
      ranges.push(mx > mn ? mx - mn : 0);
    }
    return ranges;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chanCount, forceUpdate]);

  const goodChannels = channelRanges.filter((r) => r >= MIN_RANGE_US).length;
  const sticksGood = goodChannels >= 4; // At minimum the 4 primary sticks

  // ── Save calibration to FC ────────────────────────────────────────

  const saveCalibration = useCallback(async () => {
    setPhase('saving');
    setSaveError(null);

    const result: RcCalibrationResult = { channels: [] };

    try {
      for (let i = 0; i < chanCount; i++) {
        const mn = capturedMins.current[i] < 99999 ? capturedMins.current[i] : 1000;
        const mx = capturedMaxs.current[i] > 0 ? capturedMaxs.current[i] : 2000;
        // Trim = current live value (sticks centered), except throttle = min
        const trim = i === throttleChan ? mn : rcChannels[i];

        const chNum = i + 1; // RC params are 1-based
        const okMin = await connectionManager.writeParam(`RC${chNum}_MIN`, mn);
        const okMax = await connectionManager.writeParam(`RC${chNum}_MAX`, mx);
        const okTrim = await connectionManager.writeParam(`RC${chNum}_TRIM`, trim);

        if (!okMin || !okMax || !okTrim) {
          throw new Error(`Failed to write RC${chNum} calibration`);
        }

        result.channels.push({ min: mn, max: mx, trim });
      }

      setPhase('done');
      onComplete?.(result);
    } catch (err) {
      setSaveError(String(err));
      setPhase('centering'); // Let user retry
    }
  }, [chanCount, rcChannels, throttleChan, onComplete]);

  // ── Advance gate (wizard integration) ─────────────────────────────

  useEffect(() => {
    onCanAdvanceChange?.(phase === 'done' || alreadyCalibrated);
  }, [phase, alreadyCalibrated, onCanAdvanceChange]);

  // ── Throttle direction check ──────────────────────────────────────

  const throttleReversed = useMemo(() => {
    if (phase !== 'centering' && phase !== 'done') return false;
    const tMin = capturedMins.current[throttleChan] ?? 99999;
    const tMax = capturedMaxs.current[throttleChan] ?? 0;
    if (tMax <= tMin) return false;
    const tCur = rcChannels[throttleChan] ?? 1500;
    const mid = (tMin + tMax) / 2;
    // If "throttle low" position is closer to max, it's reversed
    return tCur > mid;
  }, [phase, rcChannels, throttleChan]);

  // ── Helpers ───────────────────────────────────────────────────────

  const pct = (v: number) => Math.max(0, Math.min(100, ((v - 800) / 1400) * 100));

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">

      {/* ── NO SIGNAL ── */}
      {!hasSignal && phase === 'idle' && (
        <div className="flex items-center gap-3 rounded border border-danger/40 bg-danger/5 px-5 py-4">
          <SignalZero size={24} className="shrink-0 text-danger" />
          <div>
            <p className="text-sm font-bold text-danger">No RC signal detected</p>
            <p className="mt-0.5 text-xs text-danger/70">
              Power on your transmitter and ensure the receiver is bound.
              RC channel data must be flowing to calibrate.
            </p>
          </div>
        </div>
      )}

      {/* ── ALREADY CALIBRATED ── */}
      {alreadyCalibrated && phase === 'idle' && (
        <div className="flex items-center gap-3 rounded border border-success/40 bg-success/5 px-5 py-4">
          <Check size={24} className="shrink-0 text-success" />
          <div>
            <p className="text-sm font-bold text-success">RC already calibrated</p>
            <p className="mt-0.5 text-xs text-success/70">
              This flight controller has existing RC calibration data.
              You can recalibrate below or continue to the next step.
            </p>
          </div>
        </div>
      )}

      {/* ── IDLE / START ── */}
      {phase === 'idle' && (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded border border-blue-500/30 bg-blue-900/15 px-4 py-3">
            <Radio size={14} className="mt-0.5 shrink-0 text-blue-400" />
            <div>
              <p className="text-sm text-blue-300">
                RC calibration teaches the flight controller the full range of your transmitter.
              </p>
              <p className="mt-1 text-xs text-blue-400/70">
                You will move all sticks and switches to their extremes, then center everything.
                Make sure your transmitter has no trims or subtrim applied.
              </p>
            </div>
          </div>

          {/* Show current live channels as preview */}
          {hasSignal && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted">
                <Signal size={12} className="text-success" />
                {chanCount} channels detected
              </div>
              <ChannelBars
                channels={rcChannels}
                chanCount={chanCount}
                throttleChan={throttleChan}
              />
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={startCapture}
              disabled={!hasSignal}
              className="btn bg-accent text-background hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Start calibration
            </button>
          </div>
        </div>
      )}

      {/* ── PHASE 1: CAPTURING ── */}
      {phase === 'capturing' && (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded border border-accent/40 bg-accent/5 px-4 py-3">
            <Radio size={14} className="mt-0.5 shrink-0 text-accent animate-pulse" />
            <div>
              <p className="text-sm font-bold text-accent">
                Move all sticks and switches to their full extremes
              </p>
              <p className="mt-0.5 text-xs text-accent/70">
                Push every stick to all four corners. Flip all switches through every position.
                The bars below track min/max in real time.
              </p>
            </div>
          </div>

          <CaptureGrid
            channels={rcChannels}
            chanCount={chanCount}
            mins={capturedMins.current}
            maxs={capturedMaxs.current}
            ranges={channelRanges}
            throttleChan={throttleChan}
            pct={pct}
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">
              Channels with good range (&gt;{MIN_RANGE_US}us):{' '}
              <span className={sticksGood ? 'text-success font-bold' : 'text-danger font-bold'}>
                {goodChannels}
              </span>
              /{chanCount}
            </span>
            <div className="flex gap-3">
              <button onClick={resetCapture} className="btn btn-ghost gap-1.5">
                <RotateCw size={12} />
                Reset
              </button>
              <button
                onClick={proceedToCenter}
                disabled={!sticksGood}
                className="btn bg-accent text-background hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next: confirm center
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PHASE 2: CENTERING ── */}
      {phase === 'centering' && (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded border border-yellow-500/40 bg-yellow-900/15 px-4 py-3">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-yellow-500" />
            <div>
              <p className="text-sm font-bold text-yellow-300">
                Center all sticks. Set throttle to LOW.
              </p>
              <p className="mt-0.5 text-xs text-yellow-300/70">
                Release all sticks so they return to center. Pull throttle all the way down.
                Then click "Save calibration."
              </p>
            </div>
          </div>

          {throttleReversed && (
            <div className="flex items-start gap-2.5 rounded border border-danger/40 bg-danger/5 px-4 py-3">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-danger" />
              <div>
                <p className="text-sm font-bold text-danger">
                  Throttle channel appears reversed
                </p>
                <p className="mt-0.5 text-xs text-danger/70">
                  The current throttle value is closer to maximum than minimum.
                  This usually means the channel is reversed in your transmitter.
                  Fix this in your radio settings before saving.
                </p>
              </div>
            </div>
          )}

          <ChannelBars
            channels={rcChannels}
            chanCount={chanCount}
            throttleChan={throttleChan}
          />

          {saveError && (
            <div className="rounded border border-danger/40 bg-danger/5 px-4 py-2.5 text-sm text-danger">
              {saveError}
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setPhase('capturing')}
              className="btn btn-ghost"
            >
              Back
            </button>
            <button
              onClick={saveCalibration}
              disabled={throttleReversed}
              className="btn bg-accent text-background hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save calibration
            </button>
          </div>
        </div>
      )}

      {/* ── SAVING ── */}
      {phase === 'saving' && (
        <div className="flex flex-col items-center gap-4 py-12">
          <Loader2 size={32} className="animate-spin text-accent" />
          <p className="text-sm text-muted">Writing calibration to flight controller...</p>
        </div>
      )}

      {/* ── DONE ── */}
      {phase === 'done' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded border border-success/40 bg-success/5 px-5 py-4">
            <Check size={24} className="shrink-0 text-success" />
            <div>
              <p className="text-sm font-bold text-success">RC calibration saved</p>
              <p className="mt-0.5 text-xs text-success/70">
                {chanCount} channels calibrated and written to the flight controller.
              </p>
            </div>
          </div>

          <CalibrationSummary
            chanCount={chanCount}
            mins={capturedMins.current}
            maxs={capturedMaxs.current}
          />

          <div className="flex justify-end">
            <button onClick={startCapture} className="btn btn-ghost gap-1.5">
              <RotateCw size={12} />
              Recalibrate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

function ChannelBars({
  channels,
  chanCount,
  throttleChan,
}: {
  channels: number[];
  chanCount: number;
  throttleChan: number;
}) {
  const count = Math.min(chanCount, MAX_CHANNELS);
  return (
    <div className="space-y-1.5">
      {Array.from({ length: count }, (_, i) => {
        const v = channels[i] ?? 0;
        const isActive = v > 0 && v < 65535;
        const pct = isActive ? Math.max(0, Math.min(100, ((v - 1000) / 1000) * 100)) : 0;
        const isThrottle = i === throttleChan;
        const label = channelLabel(i);
        const isPrimary = i < 4;

        let barColor: string;
        if (!isActive) barColor = 'bg-subtle/30';
        else if (v < 950 || v > 2050) barColor = 'bg-red-500';
        else if (v < 1000 || v > 2000) barColor = 'bg-yellow-500';
        else barColor = isPrimary ? 'bg-accent' : 'bg-blue-500/70';

        return (
          <div key={i} className="flex items-center gap-2">
            <span className={`w-16 shrink-0 text-right font-mono text-[11px] ${
              isPrimary ? 'font-bold text-foreground' : 'text-subtle'
            }`}>
              {label}
            </span>
            <div className="relative h-4 flex-1 overflow-hidden rounded bg-surface-2">
              {!isThrottle && (
                <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
              )}
              {isActive && (isThrottle ? (
                <div
                  className={`absolute left-0 top-0 h-full rounded transition-all duration-75 ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              ) : (
                <div
                  className={`absolute top-0 h-full rounded transition-all duration-75 ${barColor}`}
                  style={{
                    left: pct < 50 ? `${pct}%` : '50%',
                    width: `${Math.abs(pct - 50)}%`,
                  }}
                />
              ))}
              {isActive && (
                <div
                  className="absolute top-0 h-full w-0.5 bg-white/80"
                  style={{ left: `${pct}%` }}
                />
              )}
            </div>
            <span className={`w-10 shrink-0 text-right font-mono text-[11px] ${
              isActive ? 'text-muted' : 'text-subtle/50'
            }`}>
              {isActive ? v : '---'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function CaptureGrid({
  channels,
  chanCount,
  mins,
  maxs,
  ranges,
  throttleChan,
  pct,
}: {
  channels: number[];
  chanCount: number;
  mins: number[];
  maxs: number[];
  ranges: number[];
  throttleChan: number;
  pct: (v: number) => number;
}) {
  const count = Math.min(chanCount, MAX_CHANNELS);
  return (
    <div className="space-y-1.5">
      {Array.from({ length: count }, (_, i) => {
        const v = channels[i] ?? 0;
        const isActive = v > 0 && v < 65535;
        const mn = mins[i] < 99999 ? mins[i] : null;
        const mx = maxs[i] > 0 ? maxs[i] : null;
        const range = ranges[i] ?? 0;
        const isThrottle = i === throttleChan;
        const label = channelLabel(i);
        const isPrimary = i < 4;
        const rangeOk = range >= MIN_RANGE_US;

        const curPct = isActive ? pct(v) : 50;
        const minPct = mn !== null ? pct(mn) : 50;
        const maxPct = mx !== null ? pct(mx) : 50;

        return (
          <div key={i} className="flex items-center gap-2">
            <span className={`w-16 shrink-0 text-right font-mono text-[11px] ${
              isPrimary ? 'font-bold text-foreground' : 'text-subtle'
            }`}>
              {label}
            </span>
            <div className="relative h-5 flex-1 overflow-hidden rounded bg-surface-2">
              {!isThrottle && (
                <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
              )}
              {/* Range fill */}
              {mn !== null && mx !== null && (
                <div
                  className="absolute top-0 h-full bg-accent/15"
                  style={{
                    left: `${minPct}%`,
                    width: `${Math.max(0, maxPct - minPct)}%`,
                    borderLeft: '1px solid rgba(255,170,42,0.4)',
                    borderRight: '1px solid rgba(255,170,42,0.4)',
                  }}
                />
              )}
              {/* Live cursor */}
              {isActive && (
                <div
                  className="absolute top-0 h-full w-0.5 bg-accent"
                  style={{ left: `${curPct}%` }}
                />
              )}
            </div>
            <span className={`w-20 shrink-0 text-center font-mono text-[10px] ${
              rangeOk ? 'text-success' : 'text-subtle'
            }`}>
              {mn ?? '---'} / {mx ?? '---'}
            </span>
            <span className={`w-10 shrink-0 text-right font-mono text-[11px] ${
              isActive ? 'text-muted' : 'text-subtle/50'
            }`}>
              {isActive ? v : '---'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function CalibrationSummary({
  chanCount,
  mins,
  maxs,
}: {
  chanCount: number;
  mins: number[];
  maxs: number[];
}) {
  const count = Math.min(chanCount, MAX_CHANNELS);
  return (
    <div className="overflow-hidden rounded border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-surface-1 text-muted">
            <th className="px-3 py-1.5 text-left font-medium">Channel</th>
            <th className="px-3 py-1.5 text-right font-medium">Min</th>
            <th className="px-3 py-1.5 text-right font-medium">Max</th>
            <th className="px-3 py-1.5 text-right font-medium">Range</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: count }, (_, i) => {
            const mn = mins[i] < 99999 ? mins[i] : 1000;
            const mx = maxs[i] > 0 ? maxs[i] : 2000;
            const range = mx - mn;
            const isPrimary = i < 4;
            return (
              <tr key={i} className="border-t border-border">
                <td className={`px-3 py-1 ${isPrimary ? 'font-bold text-foreground' : 'text-muted'}`}>
                  {channelLabel(i)}
                </td>
                <td className="px-3 py-1 text-right font-mono text-accent">{mn}</td>
                <td className="px-3 py-1 text-right font-mono text-accent">{mx}</td>
                <td className={`px-3 py-1 text-right font-mono ${
                  range >= MIN_RANGE_US ? 'text-success' : 'text-danger'
                }`}>
                  {range}us
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
