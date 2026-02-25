import { create } from 'zustand';
import type { MagCalProgress, MagCalReport } from '@/mavlink/messages';
import { MagCalStatus } from '@/mavlink/messages';

// ─── Accel Calibration ──────────────────────────────────────────────────────

export type AccelPosition = 'level' | 'left' | 'right' | 'nosedown' | 'noseup' | 'back';

/** MAVLink position indices -- 1-based per ACCEL_CAL_POS enum */
export const ACCEL_POSITION_INDEX: Record<AccelPosition, number> = {
  level: 1,
  left: 2,
  right: 3,
  nosedown: 4,
  noseup: 5,
  back: 6,
};

export const ACCEL_POSITIONS: AccelPosition[] = [
  'level', 'left', 'right', 'nosedown', 'noseup', 'back',
];

export const ACCEL_POSITION_LABELS: Record<AccelPosition, string> = {
  level: 'Level',
  left: 'Left Side',
  right: 'Right Side',
  nosedown: 'Nose Down',
  noseup: 'Nose Up',
  back: 'Upside Down',
};

export const ACCEL_POSITION_INSTRUCTIONS: Record<AccelPosition, string> = {
  level: 'Place the vehicle level on a flat surface',
  left: 'Place the vehicle on its left side',
  right: 'Place the vehicle on its right side',
  nosedown: 'Point the nose straight down',
  noseup: 'Point the nose straight up',
  back: 'Flip the vehicle upside down',
};

/**
 * Accel cal states:
 * - idle: not calibrating
 * - starting: command sent, waiting for FC to begin
 * - waitingForPosition: FC requested a position, user must place vehicle and confirm
 * - sampling: user confirmed, FC is collecting samples
 * - done: calibration complete
 * - failed: calibration failed
 */
export type AccelCalState = 'idle' | 'starting' | 'waitingForPosition' | 'sampling' | 'done' | 'failed';

export type MagCalState = 'idle' | 'running' | 'done' | 'failed';

// ─── STATUSTEXT Position Detection ──────────────────────────────────────────

/**
 * Detect which position the FC is requesting from a STATUSTEXT message.
 *
 * ArduPilot sends messages like:
 *   "Place vehicle level and press any key"
 *   "Place vehicle on its LEFT side and press any key"
 *   "Place vehicle nose DOWN and press any key"
 *
 * IMPORTANT: ArduPilot does NOT send "done" messages per position.
 * It just sends the next "Place vehicle..." when the previous position
 * was successfully sampled. The state machine must detect this transition.
 */
function detectPositionFromText(text: string): AccelPosition | null {
  const lower = text.toLowerCase();
  if (!lower.includes('place')) return null;
  if (lower.includes('level')) return 'level';
  if (lower.includes('left')) return 'left';
  if (lower.includes('right')) return 'right';
  if (lower.includes('nose down') || lower.includes('nosedown')) return 'nosedown';
  if (lower.includes('nose up') || lower.includes('noseup')) return 'noseup';
  if (lower.includes('back') || lower.includes('upside')) return 'back';
  return null;
}

/** Detect final calibration result from STATUSTEXT */
function detectCalResultFromText(text: string): 'success' | 'failed' | null {
  const lower = text.toLowerCase();
  if (lower.includes('calibration successful') || lower.includes('accel cal complete')) return 'success';
  if (lower.includes('calibration failed') || lower.includes('accel cal failed')) return 'failed';
  return null;
}

// ─── Store ──────────────────────────────────────────────────────────────────

export interface CalibrationMessage {
  text: string;
  timestamp: number;
  severity: number;
}

export interface CalibrationState {
  // --- Accelerometer ---
  accelState: AccelCalState;
  accelCurrentPosition: AccelPosition | null;
  accelCompletedPositions: Set<AccelPosition>;
  accelMessages: CalibrationMessage[];

  // --- Compass ---
  magState: MagCalState;
  magProgress: Map<number, MagCalProgress>;
  magReports: Map<number, MagCalReport>;

  // --- Debug log (visible in UI) ---
  logMessages: string[];

  // --- Actions ---
  setAccelState: (state: AccelCalState) => void;
  /** Called by connectionManager when STATUSTEXT arrives during accel cal */
  handleAccelStatusText: (text: string, severity: number) => void;
  /** Add a log message visible in the calibration UI */
  addLogMessage: (text: string) => void;
  setMagState: (state: MagCalState) => void;
  setMagCalProgress: (progress: MagCalProgress) => void;
  setMagCalReport: (report: MagCalReport) => void;
  reset: () => void;
  resetAccel: () => void;
  resetMag: () => void;
}

export const useCalibrationStore = create<CalibrationState>((set, get) => ({
  accelState: 'idle',
  accelCurrentPosition: null,
  accelCompletedPositions: new Set(),
  accelMessages: [],

  magState: 'idle',
  magProgress: new Map(),
  magReports: new Map(),

  logMessages: [],

  setAccelState: (accelState) => set({ accelState }),

  handleAccelStatusText: (text, severity) => {
    const state = get();
    const msg: CalibrationMessage = { text, severity, timestamp: Date.now() };
    const messages = [...state.accelMessages, msg];
    // Also push to visible log
    const logEntry = `${new Date().toLocaleTimeString()} RX STATUSTEXT: ${text}`;
    const logMessages = [...state.logMessages.slice(-49), logEntry];

    // 1. Check for final result
    const result = detectCalResultFromText(text);
    if (result === 'success') {
      const completed = new Set(state.accelCompletedPositions);
      if (state.accelCurrentPosition) {
        completed.add(state.accelCurrentPosition);
      }
      set({ accelState: 'done', accelCompletedPositions: completed, accelMessages: messages, logMessages });
      return;
    }
    if (result === 'failed') {
      set({ accelState: 'failed', accelMessages: messages, logMessages });
      return;
    }

    // 2. Check for new position request
    //    KEY INSIGHT: ArduPilot sends the next "Place vehicle..." immediately
    //    after finishing sampling the previous position. So if we're in 'sampling'
    //    and receive a new position request, the PREVIOUS position is done.
    const requestedPos = detectPositionFromText(text);
    if (requestedPos) {
      const completed = new Set(state.accelCompletedPositions);

      // Auto-complete previous position if we were sampling it
      if (state.accelCurrentPosition && state.accelState === 'sampling') {
        completed.add(state.accelCurrentPosition);
      }

      set({
        accelCurrentPosition: requestedPos,
        accelCompletedPositions: completed,
        accelState: 'waitingForPosition',
        accelMessages: messages,
        logMessages,
      });
      return;
    }

    // 3. Any other message -- just log it
    set({ accelMessages: messages, logMessages });
  },

  addLogMessage: (text) =>
    set((s) => ({
      logMessages: [...s.logMessages.slice(-49), `${new Date().toLocaleTimeString()} ${text}`],
    })),

  setMagState: (magState) => set({ magState }),

  setMagCalProgress: (progress) =>
    set((s) => {
      const newMap = new Map(s.magProgress);
      newMap.set(progress.compassId, progress);
      const magState = s.magState === 'idle' ? 'running' : s.magState;
      return { magProgress: newMap, magState };
    }),

  setMagCalReport: (report) =>
    set((s) => {
      const newMap = new Map(s.magReports);
      newMap.set(report.compassId, report);
      const allDone = Array.from(newMap.values()).every(
        (r) => r.calStatus === MagCalStatus.SUCCESS ||
               r.calStatus === MagCalStatus.FAILED ||
               r.calStatus === MagCalStatus.BAD_ORIENTATION ||
               r.calStatus === MagCalStatus.BAD_RADIUS
      );
      const anyFailed = Array.from(newMap.values()).some(
        (r) => r.calStatus !== MagCalStatus.SUCCESS
      );
      const magState = allDone ? (anyFailed ? 'failed' : 'done') : s.magState;
      return { magReports: newMap, magState };
    }),

  reset: () =>
    set({
      accelState: 'idle',
      accelCurrentPosition: null,
      accelCompletedPositions: new Set(),
      accelMessages: [],
      logMessages: [],
      magState: 'idle',
      magProgress: new Map(),
      magReports: new Map(),
    }),

  resetAccel: () =>
    set({
      accelState: 'idle',
      accelCurrentPosition: null,
      accelCompletedPositions: new Set(),
      accelMessages: [],
      logMessages: [],
    }),

  resetMag: () =>
    set({
      magState: 'idle',
      magProgress: new Map(),
      magReports: new Map(),
    }),
}));
