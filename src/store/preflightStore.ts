/**
 * preflightStore.ts -- Tracks pre-arm check status for the readiness dashboard.
 *
 * Data sources:
 *   - STATUSTEXT messages with "PreArm:" prefix (specific failure reasons)
 *   - SYS_STATUS sensor health bitmask (sensor present/enabled/healthy)
 *   - Telemetry (GPS, battery, RC)
 *   - Parameters (calibration offsets, failsafe settings)
 *
 * The store accumulates PreArm messages and provides a categorized view.
 * Call requestPreArmCheck() to trigger the FC to re-run and report all checks.
 */

import { create } from 'zustand';

/* ------------------------------------------------------------------ */
/*  Pre-arm message parsing                                            */
/* ------------------------------------------------------------------ */

export interface PreArmFailure {
  /** Raw message text from STATUSTEXT */
  text: string;
  /** Severity level (MAV_SEVERITY) */
  severity: number;
  /** Timestamp when received */
  timestamp: number;
  /** Category for grouping in UI */
  category: PreArmCategory;
}

export type PreArmCategory =
  | 'sensor'
  | 'gps'
  | 'rc'
  | 'battery'
  | 'calibration'
  | 'safety'
  | 'config'
  | 'other';

/** Categorize a PreArm message by its content. */
function categorizePreArm(text: string): PreArmCategory {
  const lower = text.toLowerCase();

  if (lower.includes('gyro') || lower.includes('accel') || lower.includes('imu')
      || lower.includes('baro') || lower.includes('press')) return 'sensor';

  if (lower.includes('compass') || lower.includes('mag')) return 'calibration';

  if (lower.includes('gps') || lower.includes('ekf') || lower.includes('ahrs')
      || lower.includes('pos') && (lower.includes('horiz') || lower.includes('vert'))) return 'gps';

  if (lower.includes('rc') || lower.includes('throttle') || lower.includes('radio')
      || lower.includes('channel')) return 'rc';

  if (lower.includes('batt') || lower.includes('volt') || lower.includes('power')
      || lower.includes('current')) return 'battery';

  if (lower.includes('calibrat') || lower.includes('offsets')
      || lower.includes('not level') || lower.includes('level')) return 'calibration';

  if (lower.includes('safety') || lower.includes('arm') || lower.includes('fence')
      || lower.includes('geofence') || lower.includes('mode')) return 'safety';

  if (lower.includes('logging') || lower.includes('param') || lower.includes('servo')
      || lower.includes('motor') || lower.includes('board')) return 'config';

  return 'other';
}

/** Human-friendly category labels. */
export const CATEGORY_LABELS: Record<PreArmCategory, string> = {
  sensor: 'Sensors',
  gps: 'GPS & Navigation',
  rc: 'RC Receiver',
  battery: 'Battery',
  calibration: 'Calibration',
  safety: 'Safety & Arming',
  config: 'Configuration',
  other: 'Other',
};

/** Category display order. */
export const CATEGORY_ORDER: PreArmCategory[] = [
  'sensor', 'calibration', 'gps', 'rc', 'battery', 'safety', 'config', 'other',
];

/* ------------------------------------------------------------------ */
/*  SYS_STATUS sensor bit definitions                                  */
/* ------------------------------------------------------------------ */

export interface SensorStatus {
  name: string;
  bit: number;
  present: boolean;
  enabled: boolean;
  healthy: boolean;
}

const SENSOR_BITS: { name: string; bit: number }[] = [
  { name: '3D Gyro',           bit: 1 << 0 },
  { name: '3D Accelerometer',  bit: 1 << 1 },
  { name: '3D Compass',        bit: 1 << 2 },
  { name: 'Barometer',         bit: 1 << 3 },
  { name: 'Airspeed',          bit: 1 << 4 },
  { name: 'GPS',               bit: 1 << 5 },
  { name: 'Optical Flow',      bit: 1 << 6 },
  { name: 'Rangefinder',       bit: 1 << 10 },
  { name: 'RC Receiver',       bit: 1 << 15 },
  { name: 'AHRS',              bit: 1 << 21 },
  { name: 'Battery Monitor',   bit: 1 << 22 },
  { name: 'Terrain',           bit: 1 << 23 },
  { name: 'Logging',           bit: 1 << 25 },
  { name: 'Pre-arm Checks',    bit: 1 << 26 },
];

export function parseSensorHealth(
  present: number, enabled: number, health: number
): SensorStatus[] {
  return SENSOR_BITS
    .map(({ name, bit }) => ({
      name,
      bit,
      present: (present & bit) !== 0,
      enabled: (enabled & bit) !== 0,
      healthy: (health & bit) !== 0,
    }))
    .filter((s) => s.present); // Only show sensors that exist on this FC
}

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

interface PreflightState {
  /** Accumulated pre-arm failure messages */
  failures: PreArmFailure[];

  /** Whether we're currently running a pre-arm check request */
  checking: boolean;

  /** Timestamp of last check run */
  lastCheckTime: number | null;

  /** Add a PreArm STATUSTEXT message */
  addPreArmMessage: (text: string, severity: number) => void;

  /** Clear all failures (before re-running checks) */
  clearFailures: () => void;

  /** Set checking state */
  setChecking: (checking: boolean) => void;

  /** Mark that a check was completed */
  markCheckComplete: () => void;
}

export const usePreflightStore = create<PreflightState>((set) => ({
  failures: [],
  checking: false,
  lastCheckTime: null,

  addPreArmMessage: (text, severity) => set((state) => {
    // Strip "PreArm:" prefix for cleaner display
    const cleanText = text.replace(/^PreArm:\s*/i, '').trim();
    if (!cleanText) return state;

    // Deduplicate -- same message text already in the list
    const isDuplicate = state.failures.some((f) => f.text === cleanText);
    if (isDuplicate) return state;

    return {
      failures: [...state.failures, {
        text: cleanText,
        severity,
        timestamp: Date.now(),
        category: categorizePreArm(cleanText),
      }],
    };
  }),

  clearFailures: () => set({ failures: [] }),
  setChecking: (checking) => set({ checking }),
  markCheckComplete: () => set({ checking: false, lastCheckTime: Date.now() }),
}));
