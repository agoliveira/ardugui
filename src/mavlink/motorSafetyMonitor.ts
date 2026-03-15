/**
 * Motor Test Safety Monitor
 *
 * Monitors IMU attitude data during motor tests to detect dangerous
 * conditions that indicate the user forgot to remove a propeller or
 * the frame is moving unexpectedly.
 *
 * Detection modes:
 *   1. Tilt -- sustained roll/pitch drift from baseline (forgotten prop on coaxial)
 *   2. Spike -- sudden angular rate spike (frame falling off table)
 *
 * Usage:
 *   const monitor = new MotorSafetyMonitor((reason) => {
 *     // Kill motor, show warning
 *   });
 *   await monitor.start();   // baselines for ~500ms
 *   // ... motor is spinning ...
 *   monitor.stop();
 */

import { useTelemetryStore } from '@/store/telemetryStore';

export type SafetyAlertReason = 'tilt' | 'spike' | 'fall';

export interface SafetyAlert {
  reason: SafetyAlertReason;
  message: string;
  rollDeg: number;
  pitchDeg: number;
  rateDeg: number;
}

// Thresholds (degrees / degrees-per-second)
const TILT_THRESHOLD_DEG = 8;       // Sustained tilt from baseline
const RATE_THRESHOLD_DEG_S = 120;   // ~2 rad/s -- sudden movement
const BASELINE_SAMPLES = 3;         // Samples to average for baseline
const MONITOR_INTERVAL_MS = 80;     // Check every 80ms

const DEG = 180 / Math.PI;

export class MotorSafetyMonitor {
  private onAlert: (alert: SafetyAlert) => void;
  private baselineRoll = 0;
  private baselinePitch = 0;
  private monitorTimer: ReturnType<typeof setInterval> | null = null;
  private active = false;

  constructor(onAlert: (alert: SafetyAlert) => void) {
    this.onAlert = onAlert;
  }

  /**
   * Sample baseline attitude, then begin monitoring.
   * Resolves once baseline is captured (~500ms).
   */
  async start(): Promise<void> {
    // Collect baseline samples
    const rolls: number[] = [];
    const pitches: number[] = [];

    for (let i = 0; i < BASELINE_SAMPLES; i++) {
      const att = useTelemetryStore.getState().attitude;
      if (att) {
        rolls.push(att.roll);
        pitches.push(att.pitch);
      }
      await new Promise((r) => setTimeout(r, 150));
    }

    if (rolls.length > 0) {
      this.baselineRoll = rolls.reduce((a, b) => a + b, 0) / rolls.length;
      this.baselinePitch = pitches.reduce((a, b) => a + b, 0) / pitches.length;
    } else {
      // No attitude data -- monitor can't work, but don't block the test
      console.warn('[SafetyMonitor] No attitude data available -- monitoring disabled');
      return;
    }

    this.active = true;

    // Begin monitoring loop
    this.monitorTimer = setInterval(() => {
      if (!this.active) return;

      const att = useTelemetryStore.getState().attitude;
      if (!att) return;

      const rollDelta = Math.abs(att.roll - this.baselineRoll) * DEG;
      const pitchDelta = Math.abs(att.pitch - this.baselinePitch) * DEG;
      const maxTilt = Math.max(rollDelta, pitchDelta);

      const rollRate = Math.abs(att.rollspeed) * DEG;
      const pitchRate = Math.abs(att.pitchspeed) * DEG;
      const maxRate = Math.max(rollRate, pitchRate);

      // Check angular rate spike first (faster response)
      if (maxRate > RATE_THRESHOLD_DEG_S) {
        this.active = false;
        this.onAlert({
          reason: 'spike',
          message: 'Sudden movement detected! Motor stopped. Check that all propellers are removed and the frame is secure.',
          rollDeg: rollDelta,
          pitchDeg: pitchDelta,
          rateDeg: maxRate,
        });
        return;
      }

      // Check sustained tilt
      if (maxTilt > TILT_THRESHOLD_DEG) {
        this.active = false;
        this.onAlert({
          reason: 'tilt',
          message: 'Unexpected tilt detected! Motor stopped. A propeller may still be attached.',
          rollDeg: rollDelta,
          pitchDeg: pitchDelta,
          rateDeg: maxRate,
        });
        return;
      }
    }, MONITOR_INTERVAL_MS);
  }

  /** Stop monitoring. Safe to call multiple times. */
  stop(): void {
    this.active = false;
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
      this.monitorTimer = null;
    }
  }

  /** Whether the monitor is actively checking. */
  get isActive(): boolean {
    return this.active;
  }
}
