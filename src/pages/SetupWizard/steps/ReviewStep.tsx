/**
 * ReviewStep.tsx -- Final wizard step: Review & Finish.
 *
 * Write-as-you-go model: params were already written as the user
 * progressed through steps. This step shows a summary of what was
 * changed, step completion status, and offers reboot.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  PartyPopper,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';
import { useWizardStore, type WizardStep } from '../wizardStore';
import { useConnectionStore } from '@/store/connectionStore';
import { connectionManager } from '@/mavlink/connection';

/* ------------------------------------------------------------------ */
/*  Step -> param mapping (best-effort grouping)                       */
/* ------------------------------------------------------------------ */

function guessStepForParam(param: string): string {
  if (param === 'FRAME_CLASS' || param === 'FRAME_TYPE') return 'frame';
  if (param.startsWith('SERVO') && param.endsWith('_FUNCTION')) return 'frame';
  if (param === 'Q_ENABLE' || param === 'Q_FRAME_CLASS' || param === 'Q_FRAME_TYPE') return 'frame';
  if (param.startsWith('MOT_') || param.startsWith('SERVO_') || param.startsWith('Q_M_')) return 'motors_esc';
  if (param.startsWith('RCMAP_') || param.startsWith('RC') ||
      param === 'BRD_SBUS_OUT' || param === 'RSSI_TYPE') return 'receiver';
  if (param.startsWith('SERIAL') && param.endsWith('_PROTOCOL')) return 'receiver';
  if (param.startsWith('SERIAL') && param.endsWith('_BAUD')) return 'receiver';
  if (param.startsWith('GPS_')) return 'gps';
  if (param.startsWith('COMPASS_') || param.startsWith('COMPASS_')) return 'compass';
  if (param.startsWith('FLTMODE') || param === 'FLTMODE_CH') return 'flight_modes';
  if (param.startsWith('FS_') || param.startsWith('BATT_') ||
      param === 'THR_FAILSAFE' || param === 'GCS_PID_MASK') return 'failsafes';
  if (param.startsWith('Q_TRANSITION') || param.startsWith('Q_RTL') ||
      param.startsWith('Q_ASSIST') || param.startsWith('ARSPD_FBW')) return 'transitions';
  if (param.startsWith('Q_TILT')) return 'tilt_servos';
  return 'other';
}

const STEP_LABELS: Record<string, string> = {
  frame: 'Frame',
  output_mapping: 'Output Mapping',
  motors_esc: 'Motors & ESC',
  control_surfaces: 'Control Surfaces',
  tilt_servos: 'Tilt Servos',
  transitions: 'Transitions',
  receiver: 'Receiver',
  rc_calibration: 'RC Calibration',
  gps: 'GPS',
  compass: 'Compass',
  accelerometer: 'Accelerometer',
  flight_modes: 'Flight Modes',
  failsafes: 'Failsafes',
  initial_tune: 'Initial Tune',
  other: 'Other',
};

interface ParamChange {
  name: string;
  newValue: number;
  oldValue: number | undefined;
}

interface ParamGroup {
  stepId: string;
  label: string;
  params: ParamChange[];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ReviewStep() {
  const steps = useWizardStore((s) => s.steps);
  const completedSteps = useWizardStore((s) => s.completedSteps);
  const skippedSteps = useWizardStore((s) => s.skippedSteps);
  const writtenParams = useWizardStore((s) => s.writtenParams);
  const initialSnapshot = useWizardStore((s) => s.initialSnapshot);
  const abandon = useWizardStore((s) => s.abandon);

  const [showRebootDialog, setShowRebootDialog] = useState(false);
  const [safetyAck, setSafetyAck] = useState(false);

  // Steps that were skipped AND are safety-critical
  const skippedSafetySteps = useMemo(() => {
    return steps.filter(
      (s) => s.safetyCritical && skippedSteps.has(s.id) && !completedSteps.has(s.id)
    );
  }, [steps, skippedSteps, completedSteps]);

  // Also flag steps that were neither completed nor skipped (just passed through)
  const pendingSafetySteps = useMemo(() => {
    return steps.filter(
      (s) => s.safetyCritical && !skippedSteps.has(s.id) && !completedSteps.has(s.id)
        && s.id !== 'review'
    );
  }, [steps, skippedSteps, completedSteps]);

  const allUnsafeSteps = [...skippedSafetySteps, ...pendingSafetySteps];
  const hasSafetyWarnings = allUnsafeSteps.length > 0;
  const canFinish = !hasSafetyWarnings || safetyAck;

  // Group written params by wizard step
  const groups: ParamGroup[] = useMemo(() => {
    const groupMap = new Map<string, ParamChange[]>();

    for (const [name, newValue] of Object.entries(writtenParams)) {
      const stepId = guessStepForParam(name);
      if (!groupMap.has(stepId)) groupMap.set(stepId, []);
      groupMap.get(stepId)!.push({
        name,
        newValue,
        oldValue: initialSnapshot[name],
      });
    }

    const stepOrder = steps.map((s) => s.id);
    return Array.from(groupMap.entries())
      .sort(([a], [b]) => {
        const ai = stepOrder.indexOf(a);
        const bi = stepOrder.indexOf(b);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      })
      .map(([stepId, params]) => ({
        stepId,
        label: STEP_LABELS[stepId] ?? stepId,
        params: params.sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [writtenParams, initialSnapshot, steps]);

  const totalWritten = Object.keys(writtenParams).length;
  const actualChanges = groups.reduce((sum, g) =>
    sum + g.params.filter((p) => p.oldValue !== undefined && p.oldValue !== p.newValue).length, 0);

  const stepSummary = useMemo(() => {
    return steps.map((step) => ({
      ...step,
      status: completedSteps.has(step.id)
        ? 'completed' as const
        : skippedSteps.has(step.id)
          ? 'skipped' as const
          : 'pending' as const,
    }));
  }, [steps, completedSteps, skippedSteps]);

  const handleFinish = useCallback(() => {
    setShowRebootDialog(true);
  }, []);

  const handleRebootAndFinish = useCallback(async () => {
    setShowRebootDialog(false);
    const { portPath, baudRate } = useConnectionStore.getState();
    abandon();
    if (portPath) {
      await connectionManager.rebootAndReconnect(portPath, baudRate);
    }
  }, [abandon]);

  const handleSkipReboot = useCallback(() => {
    setShowRebootDialog(false);
    abandon();
  }, [abandon]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
          <FileCheck size={20} className="text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Review & Finish</h2>
          <p className="text-sm text-muted">
            {totalWritten > 0
              ? `${totalWritten} parameters written to the flight controller.`
              : 'No parameters were changed.'}
          </p>
        </div>
      </div>

      {/* Success banner */}
      {totalWritten > 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-success/30 bg-success/5 py-8">
          <PartyPopper size={36} className="text-success" />
          <div className="text-center">
            <p className="text-lg font-bold text-success">
              Configuration complete!
            </p>
            <p className="mt-1 text-sm text-muted">
              {actualChanges} parameter{actualChanges !== 1 ? 's' : ''} modified,{' '}
              {totalWritten - actualChanges} new. All changes are already saved on the FC.
            </p>
          </div>
        </div>
      )}

      {/* Step completion summary */}
      <div className="rounded-lg border border-border bg-surface-0 p-4">
        <h3 className="text-sm font-bold text-muted mb-3">Wizard Steps</h3>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {stepSummary
            .filter((s) => s.id !== 'review')
            .map((step) => (
              <div key={step.id} className="flex items-center gap-2 text-sm">
                {step.status === 'completed' && (
                  <Check size={13} className="shrink-0 text-success" />
                )}
                {step.status === 'skipped' && (
                  <span className="shrink-0 text-[11px] text-subtle">SKIP</span>
                )}
                {step.status === 'pending' && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-surface-3" />
                )}
                <span className={
                  step.status === 'completed' ? 'text-foreground'
                  : step.status === 'skipped' ? 'text-subtle'
                  : 'text-muted'
                }>
                  {step.label}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* What changed */}
      {groups.length > 0 && (
        <WhatChangedSummary groups={groups} />
      )}

      {/* Safety warnings for skipped critical steps */}
      {hasSafetyWarnings && (
        <div className="space-y-3">
          <div className="rounded-lg border-2 border-danger/40 bg-danger/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert size={18} className="text-danger" />
              <h3 className="text-sm font-bold text-danger">
                {allUnsafeSteps.length} safety-critical step{allUnsafeSteps.length !== 1 ? 's' : ''} not completed
              </h3>
            </div>
            <div className="space-y-2">
              {allUnsafeSteps.map((step) => (
                <div key={step.id} className="flex items-start gap-2">
                  <AlertTriangle size={12} className="mt-0.5 shrink-0 text-danger/70" />
                  <div>
                    <span className="text-sm font-semibold text-foreground">{step.label}</span>
                    {step.skipWarning && (
                      <p className="text-xs text-danger/80 mt-0.5">{step.skipWarning}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-3 rounded border border-danger/30 bg-surface-0 px-4 py-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={safetyAck}
              onChange={(e) => setSafetyAck(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#ffaa2a] rounded"
            />
            <span className="text-xs text-muted leading-relaxed">
              I understand that I have skipped steps that are critical for safe flight.
              I accept that flying without completing these steps may result in a crash,
              damage to the aircraft, or injury to myself or others. I will complete
              these steps before flying.
            </span>
          </label>
        </div>
      )}

      {/* Finish */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-surface-0 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Setup wizard complete
          </p>
          <p className="text-xs text-muted">
            You can access all configuration pages from the sidebar for fine-tuning.
          </p>
        </div>
        <button onClick={handleFinish} disabled={!canFinish} className="btn btn-primary gap-1.5 disabled:opacity-40">
          <Check size={14} />
          Finish Wizard
        </button>
      </div>

      {/* Safety reminder */}
      <div className="flex items-start gap-3 rounded border border-warning/30 bg-warning/5 px-4 py-3">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" />
        <div>
          <p className="text-sm font-semibold text-foreground">Before your first flight</p>
          <p className="mt-0.5 text-xs text-muted">
            Verify motor spin direction, control surface movement, and
            failsafe behavior on the ground. Review your configuration in
            Mission Planner or QGroundControl as an additional safety check.
          </p>
        </div>
      </div>

      {/* Reboot dialog */}
      {showRebootDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-lg border border-border bg-surface-1 shadow-2xl overflow-hidden">
            <div className="px-6 py-5 space-y-3">
              <h3 className="text-lg font-bold text-foreground">Reboot Flight Controller</h3>
              <p className="text-sm text-muted">
                A reboot is recommended for all changes to take effect, including
                calibration offsets and output mapping.
              </p>
              <div className="flex items-start gap-2 rounded border border-warning/30 bg-warning/5 px-3 py-2">
                <AlertTriangle size={13} className="mt-0.5 shrink-0 text-warning" />
                <p className="text-xs text-warning/90">
                  Do not disconnect during reboot. The FC will automatically reconnect.
                </p>
              </div>
            </div>
            <div className="flex border-t border-border">
              <button onClick={handleSkipReboot}
                className="flex-1 px-4 py-3 text-sm text-muted hover:bg-surface-2 transition-colors">
                Skip Reboot
              </button>
              <div className="w-px bg-border" />
              <button onClick={handleRebootAndFinish}
                className="flex-1 px-4 py-3 text-sm font-semibold text-accent hover:bg-accent/10 transition-colors">
                Reboot Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  What Changed summary                                               */
/* ------------------------------------------------------------------ */

function WhatChangedSummary({ groups }: { groups: ParamGroup[] }) {
  const [expanded, setExpanded] = useState(false);

  const totalChanged = groups.reduce((sum, g) => sum + g.params.length, 0);

  return (
    <div className="rounded border border-border bg-surface-0 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface-1 transition"
      >
        <span className="text-sm font-semibold text-foreground">
          {expanded ? <ChevronDown size={14} className="inline mr-1" /> : <ChevronRight size={14} className="inline mr-1" />}
          What Changed
          <span className="ml-2 font-normal text-muted">
            {totalChanged} parameter{totalChanged !== 1 ? 's' : ''}
          </span>
        </span>
      </button>
      {expanded && (
        <div className="border-t border-border divide-y divide-border/50">
          {groups.map((group) => (
            <div key={group.stepId} className="px-4 py-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-subtle mb-1">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.params.map((p) => {
                  const changed = p.oldValue !== undefined && p.oldValue !== p.newValue;
                  return (
                    <div key={p.name} className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="w-48 truncate text-foreground">{p.name}</span>
                      {p.oldValue !== undefined && changed ? (
                        <>
                          <span className="text-subtle line-through">{fmtVal(p.oldValue)}</span>
                          <span className="text-subtle">{'\u2192'}</span>
                          <span className="text-accent font-bold">{fmtVal(p.newValue)}</span>
                        </>
                      ) : p.oldValue === undefined ? (
                        <span className="text-accent font-bold">{fmtVal(p.newValue)} (new)</span>
                      ) : (
                        <span className="text-subtle">{fmtVal(p.newValue)} (unchanged)</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function fmtVal(value: number): string {
  if (Number.isInteger(value)) return value.toString();
  if (Math.abs(value) < 0.01) return value.toExponential(2);
  return value.toFixed(Math.abs(value) < 1 ? 3 : 1);
}
