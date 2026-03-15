/**
 * MotorTestPanel.tsx -- Reusable motor test hook and UI.
 *
 * useMotorTest() -- hook that manages motor test state: battery gating,
 * safety acknowledgement, individual spin, "test all" sequence, safety
 * monitor, result tracking. Exposes all state and handlers so the parent
 * can compose its own layout (e.g. two-column with diagram).
 *
 * MotorTestPanel -- default UI component that renders test controls using
 * the hook. Can be used as-is or skipped in favor of custom UI.
 *
 * Used by:
 *   - MotorEscStep (wizard) -- uses hook directly for custom 2-column layout
 *   - MotorsPage (standalone) -- uses hook or the default panel
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Play,
  Check,
  X,
  AlertTriangle,
  Zap,
  ShieldAlert,
  Battery,
  Cog,
} from 'lucide-react';
import { connectionManager } from '@/mavlink/connection';
import { MotorSafetyMonitor, type SafetyAlert } from '@/mavlink/motorSafetyMonitor';
import { useTelemetryStore } from '@/store/telemetryStore';
import { useVehicleStore } from '@/store/vehicleStore';
import type { MotorTestInfo, MotorResult } from '@/models/motorTestDefs';

/* ------------------------------------------------------------------ */
/*  Hook: useMotorTest                                                 */
/* ------------------------------------------------------------------ */

export interface MotorTestState {
  /** Is battery connected (voltage > 5V) */
  hasBattery: boolean;
  /** Is vehicle armed */
  armed: boolean;
  /** Has user acknowledged safety warning */
  safetyAck: boolean;
  /** Current safety alert from IMU monitor */
  safetyAlert: SafetyAlert | null;
  /** Motor currently being tested (displayNum), or null */
  testingMotor: number | null;
  /** Per-motor results */
  motorResults: Record<number, MotorResult>;
  /** Motors that have been spun at least once */
  spunMotors: Set<number>;
  /** Is "test all" sequence running */
  testingAll: boolean;
  /** Are all motors confirmed correct */
  allConfirmed: boolean;
  /** Can motors be tested (battery + disarmed + safety ack) */
  canTest: boolean;

  // Handlers
  acknowledgeSafety: () => void;
  dismissAlert: () => void;
  spinMotor: (info: MotorTestInfo) => Promise<void>;
  confirmMotor: (displayNum: number) => void;
  markWrong: (displayNum: number) => void;
  testAll: () => Promise<void>;
  resetResults: () => void;
}

export function useMotorTest(
  motors: MotorTestInfo[],
  testThrottle: number,
): MotorTestState {
  const armed = useVehicleStore((s) => s.armed);
  const battery = useTelemetryStore((s) => s.battery);
  const hasBattery = battery !== null && battery.voltage > 5;

  const [safetyAck, setSafetyAck] = useState(false);
  const [safetyAlert, setSafetyAlert] = useState<SafetyAlert | null>(null);
  const safetyMonitorRef = useRef<MotorSafetyMonitor | null>(null);

  const [testingMotor, setTestingMotor] = useState<number | null>(null);
  const [motorResults, setMotorResults] = useState<Record<number, MotorResult>>({});
  const [spunMotors, setSpunMotors] = useState<Set<number>>(new Set());
  const [testingAll, setTestingAll] = useState(false);

  const allConfirmed = motors.length > 0 &&
    motors.every((m) => motorResults[m.displayNum] === 'correct');

  const canTest = hasBattery && !armed && safetyAck;

  // Stop motors and safety monitor on unmount
  useEffect(() => {
    return () => {
      safetyMonitorRef.current?.stop();
      connectionManager.motorTest(0, 0, 0).catch(() => {});
    };
  }, []);

  const acknowledgeSafety = useCallback(() => setSafetyAck(true), []);
  const dismissAlert = useCallback(() => setSafetyAlert(null), []);

  const spinMotor = useCallback(async (info: MotorTestInfo) => {
    if (armed || testingMotor !== null) return;

    setSafetyAlert(null);
    setMotorResults((prev) => {
      const next = { ...prev };
      delete next[info.displayNum];
      return next;
    });
    setTestingMotor(info.displayNum);

    let aborted = false;
    const monitor = new MotorSafetyMonitor((alert) => {
      aborted = true;
      connectionManager.motorTest(info.testInstance, 0, 0).catch(() => {});
      setSafetyAlert(alert);
      setTestingMotor(null);
    });
    safetyMonitorRef.current = monitor;

    try {
      await monitor.start();
      if (!aborted) {
        await connectionManager.motorTest(info.testInstance, testThrottle, 3);
        await new Promise((r) => setTimeout(r, 3500));
      }
    } catch {
      // Handled by safety monitor
    }

    monitor.stop();
    safetyMonitorRef.current = null;

    if (!aborted) {
      setTestingMotor(null);
      setSpunMotors((prev) => new Set(prev).add(info.displayNum));
    }
  }, [armed, testingMotor, testThrottle]);

  const confirmMotor = useCallback((displayNum: number) => {
    setMotorResults((prev) => ({ ...prev, [displayNum]: 'correct' }));
  }, []);

  const markWrong = useCallback((displayNum: number) => {
    setMotorResults((prev) => ({ ...prev, [displayNum]: 'wrong' }));
  }, []);

  const testAll = useCallback(async () => {
    if (armed || testingMotor !== null || !allConfirmed) return;
    setSafetyAlert(null);
    setTestingAll(true);

    let aborted = false;

    for (const info of motors) {
      if (aborted) break;
      setTestingMotor(info.displayNum);

      const monitor = new MotorSafetyMonitor((alert) => {
        aborted = true;
        connectionManager.motorTest(info.testInstance, 0, 0).catch(() => {});
        setSafetyAlert(alert);
        setTestingMotor(null);
        setTestingAll(false);
      });
      safetyMonitorRef.current = monitor;

      try {
        await monitor.start();
        if (!aborted) {
          await connectionManager.motorTest(info.testInstance, testThrottle, 3);
          await new Promise((r) => setTimeout(r, 3500));
        }
      } catch {
        // Ignore
      }

      monitor.stop();
      safetyMonitorRef.current = null;
      setTestingMotor(null);

      if (!aborted) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    setTestingAll(false);
  }, [armed, testingMotor, allConfirmed, motors, testThrottle]);

  const resetResults = useCallback(() => {
    setMotorResults({});
    setSpunMotors(new Set());
    setSafetyAck(false);
  }, []);

  return {
    hasBattery, armed, safetyAck, safetyAlert,
    testingMotor, motorResults, spunMotors, testingAll,
    allConfirmed, canTest,
    acknowledgeSafety, dismissAlert,
    spinMotor, confirmMotor, markWrong, testAll, resetResults,
  };
}

/* ------------------------------------------------------------------ */
/*  Default UI: MotorTestPanel                                         */
/* ------------------------------------------------------------------ */

interface MotorTestPanelProps {
  motors: MotorTestInfo[];
  testThrottle: number;
  /** Called when all motors confirmed correct */
  onAllConfirmed?: () => void;
}

export function MotorTestPanel({
  motors,
  testThrottle,
  onAllConfirmed,
}: MotorTestPanelProps) {
  const mt = useMotorTest(motors, testThrottle);

  useEffect(() => {
    if (mt.allConfirmed) onAllConfirmed?.();
  }, [mt.allConfirmed, onAllConfirmed]);

  if (motors.length === 0) {
    return (
      <div className="rounded border border-border bg-surface-0 px-4 py-3 text-sm text-muted">
        No motors detected. Select a frame and ensure output mapping is configured.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <MotorTestGates mt={mt} testThrottle={testThrottle} />

      {mt.canTest && (
        <div className="space-y-2">
          {motors.map((info) => (
            <MotorTestCard key={info.displayNum} info={info} mt={mt} />
          ))}
          <MotorTestFooter mt={mt} motors={motors} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared sub-components (used by both default panel and custom UIs)  */
/* ------------------------------------------------------------------ */

/** Battery gate, armed warning, safety ack, safety alert */
export function MotorTestGates({ mt, testThrottle }: { mt: MotorTestState; testThrottle: number }) {
  return (
    <>
      {!mt.hasBattery && (
        <div className="rounded-lg border-2 border-danger/40 bg-danger/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <Battery size={20} className="shrink-0 text-danger" />
            <div>
              <p className="text-sm font-bold text-danger">No battery detected</p>
              <p className="mt-0.5 text-xs text-danger/70">
                Connect a battery to test motors. Motor test requires power.
              </p>
            </div>
          </div>
        </div>
      )}

      {mt.armed && (
        <div className="rounded-lg border-2 border-danger/40 bg-danger/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <ShieldAlert size={20} className="text-danger" />
            <p className="text-sm font-bold text-danger">
              Vehicle is ARMED -- disarm before testing motors.
            </p>
          </div>
        </div>
      )}

      {mt.safetyAlert && (
        <div className="flex items-start gap-3 rounded border border-red-500/50 bg-red-900/25 px-4 py-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-300">{mt.safetyAlert.message}</p>
            <p className="mt-1 text-xs text-red-400/70">
              Tilt: {mt.safetyAlert.rollDeg.toFixed(1)} roll, {mt.safetyAlert.pitchDeg.toFixed(1)} pitch
              {' -- '}Rate: {mt.safetyAlert.rateDeg.toFixed(0)}/s
            </p>
            <button onClick={mt.dismissAlert}
              className="mt-2 rounded border border-red-500/40 bg-red-600/20 px-3 py-1 text-xs font-medium text-red-300 hover:bg-red-600/30"
            >Dismiss</button>
          </div>
        </div>
      )}

      {mt.hasBattery && !mt.armed && !mt.safetyAck && (
        <div className="flex items-start gap-3 rounded border border-yellow-600/40 bg-yellow-900/20 px-4 py-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-yellow-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-400">
              Remove all propellers before testing motors!
            </p>
            <p className="mt-1 text-xs text-yellow-500/80">
              Motors will spin at {testThrottle}% throttle for 3 seconds.
              Ensure the vehicle is secured and all propellers are removed.
            </p>
            <button onClick={mt.acknowledgeSafety}
              className="mt-2 rounded border border-yellow-600/60 bg-yellow-600/20 px-3 py-1.5 text-xs font-medium text-yellow-400 transition hover:bg-yellow-600/30"
            >I have removed all propellers</button>
          </div>
        </div>
      )}
    </>
  );
}

/** Single motor test card with spin/confirm/wrong buttons */
export function MotorTestCard({ info, mt }: { info: MotorTestInfo; mt: MotorTestState }) {
  const isTesting = mt.testingMotor === info.displayNum;
  const hasSpun = mt.spunMotors.has(info.displayNum);
  const result = mt.motorResults[info.displayNum];

  return (
    <div className={`flex items-center gap-3 rounded border px-3 py-2 transition ${
      isTesting ? 'border-accent/50 bg-accent/5'
        : result === 'correct' ? 'border-success/30 bg-success/5'
        : result === 'wrong' ? 'border-danger/30 bg-danger/5'
        : 'border-border bg-surface-0'
    }`}>
      <div className="w-28 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-foreground">{info.positionLabel}</span>
          {info.rotation && (
            <span className={`text-xs font-mono font-bold ${
              info.rotation === 'CCW' ? 'text-blue-400' : 'text-red-400'
            }`}>{info.rotation}</span>
          )}
        </div>
        <span className="text-[10px] text-subtle font-mono">
          Motor {info.displayNum} -- S{info.servoOutput}
        </span>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        {result === 'correct' && (
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-success">
            <Check size={12} /> OK
          </span>
        )}
        {result === 'wrong' && (
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-danger">
            <X size={12} /> Wrong
          </span>
        )}

        <button
          onClick={() => mt.spinMotor(info)}
          disabled={mt.testingMotor !== null || mt.armed}
          className={`btn h-7 shrink-0 gap-1 whitespace-nowrap px-2.5 text-xs ${
            isTesting ? 'btn-primary animate-pulse' : 'btn-ghost'
          }`}
        >
          <Play size={11} />
          {isTesting ? 'Spinning...' : result ? 'Re-spin' : 'Spin'}
        </button>

        {!result && hasSpun && !isTesting && (
          <div className="flex gap-1.5">
            <button onClick={() => mt.confirmMotor(info.displayNum)}
              className="btn h-7 shrink-0 gap-1 whitespace-nowrap bg-accent/20 px-2.5 text-[11px] text-accent hover:bg-accent/30">
              <Check size={11} /> Confirm
            </button>
            <button onClick={() => mt.markWrong(info.displayNum)}
              className="btn h-7 shrink-0 gap-1 whitespace-nowrap bg-danger/20 px-2.5 text-[11px] text-danger hover:bg-danger/30">
              <X size={11} /> Wrong
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Test all button + reset + reversal note */
export function MotorTestFooter({ mt, motors }: { mt: MotorTestState; motors: MotorTestInfo[] }) {
  const hasWrong = motors.some((m) => mt.motorResults[m.displayNum] === 'wrong');

  return (
    <>
      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={mt.testAll}
          disabled={!mt.allConfirmed || mt.testingMotor !== null || mt.armed}
          className={`btn gap-1.5 text-xs ${
            mt.allConfirmed && !mt.testingAll ? 'btn-primary'
              : mt.testingAll ? 'btn-primary animate-pulse'
              : 'btn-ghost opacity-40'
          }`}
        >
          <Play size={12} />
          {mt.testingAll ? 'Testing all...' : 'Test All Motors'}
        </button>

        {Object.keys(mt.motorResults).length > 0 && (
          <button onClick={mt.resetResults} className="btn btn-ghost text-xs text-subtle">
            Reset all
          </button>
        )}
      </div>

      {hasWrong && (
        <div className="rounded border border-border bg-surface-0 px-3 py-2 mt-2">
          <p className="text-xs text-muted">
            Motor spinning the wrong way? Reverse it using BLHeliSuite,
            ESC Configurator, or by swapping any two motor wires.
          </p>
        </div>
      )}
    </>
  );
}

