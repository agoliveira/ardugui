/**
 * OutputMappingStep.tsx -- Wizard step for mapping servo functions to outputs.
 *
 * Shows all SERVO outputs with their assigned functions (from the airframe
 * template). The user can accept defaults or customize the mapping if their
 * wiring differs from the template.
 *
 * Placed between Frame and Motors & ESC so that motor/servo tests use
 * correct output assignments.
 */

import { useEffect, useCallback, useState, useMemo } from 'react';
import {
  Check,
  AlertTriangle,
  Info,
  Settings2,
  RotateCcw,
  Loader2,
  Upload,
} from 'lucide-react';
import { useWizardStore } from '../wizardStore';
import { useParameterStore, getEffectiveValue } from '@/store/parameterStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { getBoardById } from '@/models/boardRegistry';
import { connectionManager } from '@/mavlink/connection';

/* ------------------------------------------------------------------ */
/*  ArduPilot SERVO_FUNCTION labels                                    */
/* ------------------------------------------------------------------ */

const FUNCTION_LABELS: Record<number, string> = {
  0:   'Disabled',
  1:   'RCPassThru 1',
  2:   'RCPassThru 2',
  3:   'RCPassThru 3',
  4:   'RCPassThru 4',
  6:   'Gimbal Pan',
  7:   'Gimbal Tilt',
  19:  'Gripper',
  21:  'Parachute',
  29:  'Landing Gear',
  33:  'Motor 1',
  34:  'Motor 2',
  35:  'Motor 3',
  36:  'Motor 4',
  37:  'Motor 5',
  38:  'Motor 6',
  39:  'Motor 7',
  40:  'Motor 8',
  41:  'Motor Tilt',
  51:  'RCPassThru 1',
  52:  'RCPassThru 2',
  53:  'RCPassThru 3',
  54:  'RCPassThru 4',
  55:  'RCPassThru 5',
  56:  'RCPassThru 6',
  57:  'RCPassThru 7',
  58:  'RCPassThru 8',
  70:  'Throttle',
  73:  'Throttle Left',
  74:  'Throttle Right',
  77:  'Aileron',
  78:  'Elevator',
  79:  'Rudder',
  80:  'Flaperon Left',
  81:  'Flaperon Right',
  84:  'Flap',
  106: 'Airbrake',
};

function getFunctionLabel(value: number): string {
  return FUNCTION_LABELS[value] ?? `Function ${value}`;
}

/** Functions that appear in airframe templates (available in dropdowns). */
const ASSIGNABLE_FUNCTIONS = [
  0, 33, 34, 35, 36, 37, 38, 39, 40, 41,
  70, 73, 74, 77, 78, 79, 80, 81, 84, 106,
  6, 7, 19, 21, 29,
];

/** Color coding by function category. */
function functionColor(value: number): string {
  if (value === 0) return 'text-subtle';
  if (value >= 33 && value <= 41) return 'text-accent';       // Motors
  if (value === 70 || value === 73 || value === 74) return 'text-accent'; // Throttle
  if (value >= 77 && value <= 84 || value === 106) return 'text-blue-400'; // Surfaces
  return 'text-muted';
}

function functionBadge(value: number): { label: string; color: string } | null {
  if (value >= 33 && value <= 41) return { label: 'MOTOR', color: 'bg-accent/15 text-accent' };
  if (value === 70 || value === 73 || value === 74) return { label: 'MOTOR', color: 'bg-accent/15 text-accent' };
  if (value >= 77 && value <= 84 || value === 106) return { label: 'SERVO', color: 'bg-blue-500/15 text-blue-400' };
  if (value === 0) return null;
  return { label: 'AUX', color: 'bg-surface-2 text-subtle' };
}

/* ------------------------------------------------------------------ */
/*  Output info                                                        */
/* ------------------------------------------------------------------ */

interface OutputInfo {
  servoNum: number;      // 1-16
  padLabel: string;      // Board-specific label (M1, S1, MAIN1, etc.)
  functionValue: number; // Current SERVOx_FUNCTION
  isFromTemplate: boolean; // Was set by the frame step (in stagedParams)
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface OutputMappingStepProps {
  onCanAdvanceChange: (canAdvance: boolean) => void;
}

export function OutputMappingStep({ onCanAdvanceChange }: OutputMappingStepProps) {
  const markComplete = useWizardStore((s) => s.markComplete);
  const stageParams = useWizardStore((s) => s.stageParams);
  const stagedParams = useWizardStore((s) => s.stagedParams);
  const importSource = useWizardStore((s) => s.importSource);
  const vehicleType = useWizardStore((s) => s.vehicleType);
  const parameters = useParameterStore((s) => s.parameters);
  const boardId = useVehicleStore((s) => s.boardId);
  const paramState = useParameterStore.getState();

  const [customizing, setCustomizing] = useState(false);
  const [writing, setWriting] = useState(false);
  const [written, setWritten] = useState(false);

  const board = boardId ? getBoardById(boardId) : null;

  // ── Build output list ──────────────────────────────────────────

  const outputs = useMemo((): OutputInfo[] => {
    const result: OutputInfo[] = [];

    // Determine how many outputs to show
    // Check which outputs have functions assigned
    let maxOutput = 8; // Minimum
    for (let i = 1; i <= 16; i++) {
      const staged = stagedParams[`SERVO${i}_FUNCTION`];
      const current = getEffectiveValue(paramState, `SERVO${i}_FUNCTION`);
      if ((staged !== undefined && staged !== 0) || (current !== undefined && current !== 0)) {
        maxOutput = Math.max(maxOutput, i);
      }
    }
    // Round up to nearest 4
    maxOutput = Math.ceil(maxOutput / 4) * 4;

    for (let i = 1; i <= maxOutput; i++) {
      const funcVal = stagedParams[`SERVO${i}_FUNCTION`]
        ?? getEffectiveValue(paramState, `SERVO${i}_FUNCTION`) ?? 0;
      const isFromTemplate = stagedParams[`SERVO${i}_FUNCTION`] !== undefined;

      // Board-specific pad label
      let padLabel = `Output ${i}`;
      if (board) {
        // Common patterns: Pixhawk = MAIN1-8/AUX1-6, Matek = S1-SN or M1-MN
        // Check connectors for any labeled outputs
        // For now use a heuristic based on board name
        const name = board.name.toLowerCase();
        if (name.includes('pixhawk') || name.includes('cube')) {
          padLabel = i <= 8 ? `MAIN ${i}` : `AUX ${i - 8}`;
        } else if (name.includes('matek') || name.includes('kakute') || name.includes('speedybee')) {
          padLabel = `S${i}`;
        } else {
          padLabel = i <= 8 ? `M${i}` : `S${i - 8}`;
        }
      }

      result.push({ servoNum: i, padLabel, functionValue: funcVal, isFromTemplate });
    }

    return result;
  }, [parameters, stagedParams, paramState, board]);

  // Show all outputs through the highest active one (including disabled gaps)
  const highestActive = outputs.reduce((max, o) => o.functionValue !== 0 ? Math.max(max, o.servoNum) : max, 0);
  const displayOutputs = outputs.filter(o => o.servoNum <= highestActive);
  const activeOutputs = displayOutputs.filter(o => o.functionValue !== 0);
  const availableOutputs = outputs.filter(o => o.functionValue === 0 && o.servoNum > highestActive);

  // ── Conflict detection ─────────────────────────────────────────

  const conflicts = useMemo(() => {
    const funcOutputs = new Map<number, number[]>();
    for (const o of outputs) {
      if (o.functionValue === 0) continue;
      // Motors can share function (e.g. two motors with same function is wrong)
      // but Aileron (77) appears on two outputs (left/right) which is EXPECTED
      const existing = funcOutputs.get(o.functionValue) ?? [];
      existing.push(o.servoNum);
      funcOutputs.set(o.functionValue, existing);
    }

    const issues: string[] = [];
    for (const [func, servos] of funcOutputs) {
      // Motors should be unique
      if (func >= 33 && func <= 40 && servos.length > 1) {
        issues.push(`${getFunctionLabel(func)} assigned to multiple outputs: ${servos.map(s => `SERVO${s}`).join(', ')}`);
      }
      // Throttle should be unique
      if (func === 70 && servos.length > 1) {
        issues.push(`Throttle assigned to multiple outputs: ${servos.map(s => `SERVO${s}`).join(', ')}`);
      }
    }
    return issues;
  }, [outputs]);

  // ── Handlers ───────────────────────────────────────────────────

  const handleFunctionChange = useCallback((servoNum: number, newFunc: number) => {
    stageParams({ [`SERVO${servoNum}_FUNCTION`]: newFunc });
    setWritten(false); // Mark as needing re-write after changes
  }, [stageParams]);

  const handleWriteToFC = useCallback(async () => {
    setWriting(true);
    try {
      // Write all SERVO_FUNCTION params that have staged values
      for (const o of outputs) {
        const paramName = `SERVO${o.servoNum}_FUNCTION`;
        const stagedValue = stagedParams[paramName];
        if (stagedValue !== undefined) {
          await connectionManager.writeParam(paramName, stagedValue);
        }
      }

      // QuadPlane: the VTOL motor subsystem only activates when Q_ENABLE=1
      // and Q_FRAME_CLASS is set. Without these, VTOL motor functions (33+)
      // are ignored by the FC and motor test won't work.
      //
      // Sequence matters: Q_FRAME_CLASS only exists in the FC param table
      // AFTER Q_ENABLE=1 is written and params are re-read. So:
      // 1. Write Q_ENABLE=1
      // 2. Request param refresh (FC spawns Q_FRAME_CLASS, Q_FRAME_TYPE, etc.)
      // 3. Wait for Q_FRAME_CLASS to appear
      // 4. Write Q_FRAME_CLASS and Q_FRAME_TYPE
      if (vehicleType === 'quadplane') {
        const qEnable = stagedParams['Q_ENABLE'];
        const qFrameClass = stagedParams['Q_FRAME_CLASS'];
        const qFrameType = stagedParams['Q_FRAME_TYPE'];

        if (qEnable !== undefined) {
          await connectionManager.writeParam('Q_ENABLE', qEnable);

          // Q_ENABLE=1 causes new Q_ params to appear -- re-download param list
          if (qFrameClass !== undefined || qFrameType !== undefined) {
            await connectionManager.requestParamRefresh();
            const found = await connectionManager.waitForParam('Q_FRAME_CLASS', 10000);
            if (!found) {
              console.warn('Q_FRAME_CLASS did not appear after param refresh');
            }
          }
        }

        if (qFrameClass !== undefined) {
          await connectionManager.writeParam('Q_FRAME_CLASS', qFrameClass);
        }
        if (qFrameType !== undefined) {
          await connectionManager.writeParam('Q_FRAME_TYPE', qFrameType);
        }

        if (qEnable === undefined || qFrameClass === undefined) {
          console.warn(
            'QuadPlane: Q_ENABLE or Q_FRAME_CLASS not in stagedParams -- ' +
            'VTOL motor test may not work until these are set.'
          );
        }
      }

      setWritten(true);
    } catch (err) {
      console.error('Failed to write output mapping:', err);
    }
    setWriting(false);
  }, [outputs, stagedParams, vehicleType]);

  // ── Advance gate ───────────────────────────────────────────────

  useEffect(() => {
    const hasAnyAssignment = activeOutputs.length > 0;
    onCanAdvanceChange(hasAnyAssignment && written);
    if (hasAnyAssignment && written) markComplete('output_mapping');
  }, [activeOutputs.length, written, onCanAdvanceChange, markComplete]);

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">

      <div>
        <h2 className="text-xl font-bold text-foreground">Output Mapping</h2>
        <p className="mt-1 text-sm text-muted">
          Verify which physical output pad connects to which motor or servo.
          {board && (
            <span className="text-accent font-medium"> Board: {board.name}.</span>
          )}
        </p>
      </div>

      {/* Import source banner */}
      {importSource === 'inav' && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-500/30 bg-blue-900/15 px-4 py-3">
          <Info size={14} className="mt-0.5 shrink-0 text-blue-400" />
          <p className="text-sm text-blue-300/90">
            Output mapping was imported from your INAV configuration.
            Verify the assignments below match your physical wiring, then write to the FC.
          </p>
        </div>
      )}

      {/* Default vs Customize toggle */}
      {!customizing ? (
        <div className="space-y-4">
          {/* Active assignments as compact read-only grid */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">
                Output Assignments ({activeOutputs.length} configured)
              </h3>
              <button
                onClick={() => setCustomizing(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent/80 transition-colors"
              >
                <Settings2 size={13} />
                Customize
              </button>
            </div>

            <div className="grid grid-cols-2 gap-px bg-border">
              {displayOutputs.map((o) => {
                const badge = functionBadge(o.functionValue);
                return (
                  <div key={o.servoNum} className={`flex items-center gap-3 px-4 py-2.5 ${
                    o.functionValue === 0 ? 'bg-surface-0/50' : 'bg-surface-0'
                  }`}>
                    <span className={`text-sm font-mono font-bold w-14 shrink-0 ${
                      o.functionValue === 0 ? 'text-subtle' : 'text-foreground'
                    }`}>
                      {o.padLabel}
                    </span>
                    {badge && (
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${badge.color}`}>
                        {badge.label}
                      </span>
                    )}
                    <span className={`text-sm ${functionColor(o.functionValue)}`}>
                      {getFunctionLabel(o.functionValue)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Available (unused) outputs */}
          {availableOutputs.length > 0 && (
            <div className="flex items-start gap-2 rounded border border-border bg-surface-0 px-4 py-2.5">
              <Info size={13} className="mt-0.5 shrink-0 text-blue-400" />
              <p className="text-xs text-muted">
                {availableOutputs.length} output{availableOutputs.length !== 1 ? 's' : ''} available:
                {' '}{availableOutputs.map(o => o.padLabel).join(', ')}
              </p>
            </div>
          )}

          {/* Write to FC */}
          {!written ? (
            <button
              onClick={handleWriteToFC}
              disabled={writing || activeOutputs.length === 0}
              className="btn btn-primary gap-2 w-full py-2.5 text-base"
            >
              {writing
                ? <Loader2 size={16} className="animate-spin" />
                : <Upload size={16} />}
              {writing ? 'Writing...' : 'Write Mapping to Flight Controller'}
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-success/40 bg-success/10 px-5 py-4">
              <Check size={20} className="shrink-0 text-success" />
              <div>
                <p className="text-sm font-bold text-success">Mapping written to FC</p>
                <p className="mt-0.5 text-xs text-success/80">
                  Motor and servo tests will now use these output assignments.
                  {customizing ? '' : ' Click Customize above if you need to change anything.'}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── Customize mode ──────────────────────────────────── */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">
              Assign functions to match your wiring
            </h3>
            <button
              onClick={() => setCustomizing(false)}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
            >
              <RotateCcw size={12} />
              Done
            </button>
          </div>

          {/* Full editable output list */}
          <div className="space-y-1.5">
            {outputs.map((o) => {
              const badge = functionBadge(o.functionValue);
              return (
                <div
                  key={o.servoNum}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface-0 px-4 py-2"
                >
                  <span className="text-sm font-mono font-bold text-foreground w-14 shrink-0">
                    {o.padLabel}
                  </span>
                  <span className="text-[10px] text-subtle w-14 shrink-0">
                    SERVO{o.servoNum}
                  </span>

                  {badge && (
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold shrink-0 ${badge.color}`}>
                      {badge.label}
                    </span>
                  )}

                  <select
                    value={o.functionValue}
                    onChange={(e) => handleFunctionChange(o.servoNum, Number(e.target.value))}
                    className="flex-1 rounded border border-border bg-surface-1 px-2 py-1 text-sm text-foreground"
                  >
                    {ASSIGNABLE_FUNCTIONS.map((f) => (
                      <option key={f} value={f}>
                        {getFunctionLabel(f)}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          {/* Conflicts */}
          {conflicts.length > 0 && (
            <div className="space-y-2">
              {conflicts.map((c, i) => (
                <div key={i} className="flex items-start gap-2 rounded border border-danger/30 bg-danger/5 px-4 py-2.5">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0 text-danger" />
                  <p className="text-xs text-danger">{c}</p>
                </div>
              ))}
            </div>
          )}

          {/* Write to FC */}
          {!written ? (
            <button
              onClick={handleWriteToFC}
              disabled={writing || activeOutputs.length === 0 || conflicts.length > 0}
              className="btn btn-primary gap-2 w-full py-2.5 text-base"
            >
              {writing
                ? <Loader2 size={16} className="animate-spin" />
                : <Upload size={16} />}
              {writing ? 'Writing...' : 'Write Mapping to Flight Controller'}
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-success/40 bg-success/10 px-5 py-4">
              <Check size={20} className="shrink-0 text-success" />
              <div>
                <p className="text-sm font-bold text-success">Mapping written to FC</p>
                <p className="mt-0.5 text-xs text-success/80">
                  Motor and servo tests will now use these output assignments.
                  You can still make changes and re-write.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hint */}
      <div className="flex items-start gap-2 rounded border border-border bg-surface-0 px-4 py-2.5">
        <Info size={13} className="mt-0.5 shrink-0 text-muted" />
        <p className="text-xs text-muted">
          Output mapping is written directly to the flight controller so that motor
          and servo tests work correctly in the next steps. If you go back and change
          the frame type, you will need to re-write the mapping. Motor outputs are
          colored amber, servo outputs blue.
        </p>
      </div>
    </div>
  );
}
