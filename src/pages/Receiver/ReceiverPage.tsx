import { useState, useEffect, useCallback } from 'react';
import { Radio, RotateCcw, Wifi, WifiOff } from 'lucide-react';
import { useTelemetryStore } from '@/store/telemetryStore';

/** Standard channel names for the first 8 channels */
const CHANNEL_LABELS: Record<number, string> = {
  1: 'Roll',
  2: 'Pitch',
  3: 'Throttle',
  4: 'Yaw',
  5: 'CH 5',
  6: 'CH 6',
  7: 'CH 7',
  8: 'CH 8',
};

/** PWM range for display */
const PWM_MIN = 800;
const PWM_MAX = 2200;
const PWM_RANGE = PWM_MAX - PWM_MIN;

/** Normal operating range */
const NORMAL_MIN = 1000;
const NORMAL_MAX = 2000;
const NORMAL_CENTER = 1500;

function channelLabel(ch: number): string {
  return CHANNEL_LABELS[ch] || `CH ${ch}`;
}

/** Map a PWM value to a 0-100 percentage within the display range */
function pwmToPercent(pwm: number): number {
  return Math.max(0, Math.min(100, ((pwm - PWM_MIN) / PWM_RANGE) * 100));
}

/** Get bar color based on PWM value */
function barColor(pwm: number): string {
  if (pwm === 0 || pwm === 65535) return '#334155'; // No signal
  if (pwm < NORMAL_MIN || pwm > NORMAL_MAX) return '#f87171'; // Out of range - red
  return '#60a5fa'; // Normal - blue
}

/** RSSI quality description */
function rssiLabel(rssi: number): { text: string; color: string } {
  if (rssi === 0) return { text: 'No signal', color: 'text-subtle' };
  if (rssi === 255) return { text: 'Unknown', color: 'text-subtle' };
  const pct = Math.round((rssi / 254) * 100);
  if (pct >= 70) return { text: `${pct}%`, color: 'text-green-400' };
  if (pct >= 40) return { text: `${pct}%`, color: 'text-yellow-400' };
  return { text: `${pct}%`, color: 'text-red-400' };
}

interface ChannelBarProps {
  channel: number;
  pwm: number;
  min: number;
  max: number;
}

function ChannelBar({ channel, pwm, min, max }: ChannelBarProps) {
  const isActive = pwm > 0 && pwm !== 65535;
  const pct = pwmToPercent(pwm);
  const minPct = pwmToPercent(min);
  const maxPct = pwmToPercent(max);
  const normalMinPct = pwmToPercent(NORMAL_MIN);
  const normalMaxPct = pwmToPercent(NORMAL_MAX);
  const centerPct = pwmToPercent(NORMAL_CENTER);
  const color = barColor(pwm);

  return (
    <div className="flex items-center gap-4">
      {/* Channel label */}
      <div className="w-24 shrink-0 text-right">
        <span className="text-base font-bold text-muted">
          {channelLabel(channel)}
        </span>
      </div>

      {/* Bar area */}
      <div className="relative flex-1">
        {/* Track */}
        <div className="relative h-8 rounded bg-surface-0 border border-border overflow-hidden">
          {/* Normal range background */}
          <div
            className="absolute top-0 h-full opacity-10"
            style={{
              left: `${normalMinPct}%`,
              width: `${normalMaxPct - normalMinPct}%`,
              backgroundColor: '#60a5fa',
            }}
          />

          {/* Center line */}
          <div
            className="absolute top-0 h-full w-px bg-border"
            style={{ left: `${centerPct}%` }}
          />

          {/* Min/max range indicator */}
          {isActive && min < max && (
            <div
              className="absolute top-0 h-full opacity-20 rounded-sm"
              style={{
                left: `${minPct}%`,
                width: `${Math.max(maxPct - minPct, 0.5)}%`,
                backgroundColor: color,
              }}
            />
          )}

          {/* Current value bar */}
          {isActive && (
            <div
              className="absolute top-0 h-full w-1 rounded-sm transition-[left] duration-75"
              style={{
                left: `calc(${pct}% - 2px)`,
                backgroundColor: color,
                boxShadow: `0 0 4px ${color}`,
              }}
            />
          )}
        </div>

        {/* Scale ticks */}
        <div className="relative h-2 mt-0.5">
          {[1000, 1500, 2000].map((tick) => (
            <span
              key={tick}
              className="absolute text-[11px] text-subtle -translate-x-1/2"
              style={{ left: `${pwmToPercent(tick)}%` }}
            >
              {tick}
            </span>
          ))}
        </div>
      </div>

      {/* PWM value */}
      <div className="w-16 shrink-0 text-right">
        <span
          className="font-mono text-base font-bold tabular-nums"
          style={{ color: isActive ? color : '#64748b' }}
        >
          {isActive ? pwm : '-'}
        </span>
      </div>

      {/* Min/Max */}
      <div className="hidden w-24 shrink-0 text-right sm:block">
        {isActive && min < max ? (
          <span className="font-mono text-base text-muted">
            {min} / {max}
          </span>
        ) : (
          <span className="font-mono text-base text-muted">-- / --</span>
        )}
      </div>
    </div>
  );
}

export function ReceiverPage() {
  const rcChannels = useTelemetryStore((s) => s.rcChannels);
  const chancount = useTelemetryStore((s) => s.rcChancount);
  const rssi = useTelemetryStore((s) => s.rcRssi);

  // Min/max tracking per channel
  const [minMax, setMinMax] = useState<{ min: number; max: number }[]>(
    () => Array.from({ length: 18 }, () => ({ min: 9999, max: 0 }))
  );

  // Update min/max whenever channels change
  useEffect(() => {
    if (rcChannels.length === 0) return;

    setMinMax((prev) => {
      const next = [...prev];
      let changed = false;
      for (let i = 0; i < rcChannels.length; i++) {
        const v = rcChannels[i];
        if (v === 0 || v === 65535) continue;
        const entry = next[i];
        if (v < entry.min || v > entry.max) {
          next[i] = {
            min: Math.min(entry.min, v),
            max: Math.max(entry.max, v),
          };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [rcChannels]);

  const handleReset = useCallback(() => {
    setMinMax(Array.from({ length: 18 }, () => ({ min: 9999, max: 0 })));
  }, []);

  // Always show all 18 channels - inactive ones display as "-"
  const displayCount = 18;

  const hasSignal = rcChannels.length > 0 && rcChannels.some(
    (v) => v > 0 && v !== 65535
  );
  const rssiInfo = rssiLabel(rssi);

  return (
    <div className="w-full space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Receiver</h2>
        <p className="text-base text-muted">
          Live RC channel values from your receiver.
        </p>
      </div>

      {/* Status bar */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Signal indicator */}
            <div className="flex items-center gap-2">
              {hasSignal ? (
                <Wifi size={14} className="text-green-400" />
              ) : (
                <WifiOff size={14} className="text-subtle" />
              )}
              <span className="text-base text-muted">
                {hasSignal
                  ? `${chancount > 0 ? chancount : rcChannels.filter((v) => v > 0 && v !== 65535).length} of 18 channels active`
                  : 'No RC signal'}
              </span>
            </div>

            {/* RSSI */}
            <div className="flex items-center gap-2">
              <Radio size={14} className="text-subtle" />
              <span className={`text-xs font-medium ${rssiInfo.color}`}>
                RSSI: {rssiInfo.text}
              </span>
            </div>
          </div>

          {/* Reset min/max */}
          <button
            onClick={handleReset}
            className="btn btn-ghost h-7 gap-1.5 px-2.5 text-[13px]"
            title="Reset min/max tracking"
          >
            <RotateCcw size={11} />
            Reset Min/Max
          </button>
        </div>
      </div>

      {/* Channel bars */}
      <div className="card space-y-1.5">
        <div className="card-header flex items-center justify-between">
          <span>RC Channels</span>
          <span className="hidden text-[13px] font-normal text-subtle sm:block">
            PWM &nbsp;&nbsp;&nbsp; Min / Max
          </span>
        </div>

        {!hasSignal ? (
          <div className="flex flex-col items-center justify-center py-12 text-subtle">
            <WifiOff size={32} className="mb-3 opacity-50" />
            <p className="text-sm">No RC data received</p>
            <p className="mt-1 text-xs">
              Make sure your receiver is connected and bound to your transmitter.
            </p>
          </div>
        ) : (
          <div className="space-y-2 pb-2">
            {Array.from({ length: displayCount }, (_, i) => (
              <ChannelBar
                key={i}
                channel={i + 1}
                pwm={rcChannels[i] || 0}
                min={minMax[i]?.min ?? 9999}
                max={minMax[i]?.max ?? 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info box */}
      {hasSignal && (
        <div className="rounded border border-border bg-surface-1 px-4 py-3">
          <p className="text-base text-muted">
            Move all sticks and switches to their extremes to verify full range.
            Standard range is 1000–2000 μs with 1500 center.
            The min/max values track the range seen since the page was opened
            -- use the Reset button to clear them.
          </p>
        </div>
      )}
    </div>
  );
}
