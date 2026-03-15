/**
 * FrameStep.tsx -- Wizard step for airframe selection.
 *
 * Simplified version of the full FrameWizard page:
 * - No category tabs (vehicle type is already known from FC heartbeat)
 * - No extras (gimbal, parachute, etc. are not first-flight items)
 * - No wiring diagram (Motors step handles that)
 * - No Apply button (params staged to wizard store on Next)
 *
 * Copters use the same category drill-down (Quad -> X/H/+/V).
 * Planes and VTOLs use a flat grid.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Check, ArrowLeft, Info } from 'lucide-react';
import { useWizardStore } from '../wizardStore';
import { useDetectedPreset } from '@/hooks/useDetectedPreset';
import {
  AIRFRAME_PRESETS,
  type AirframePreset,
} from '@/models/airframeTemplates';
import { AirframeIcon } from '@/components/AirframeIcons';

interface FrameStepProps {
  onCanAdvanceChange: (canAdvance: boolean) => void;
}

export function FrameStep({ onCanAdvanceChange }: FrameStepProps) {
  const vehicleType = useWizardStore((s) => s.vehicleType);
  const stagedParams = useWizardStore((s) => s.stagedParams);
  const stageParams = useWizardStore((s) => s.stageParams);
  const markComplete = useWizardStore((s) => s.markComplete);
  const importSource = useWizardStore((s) => s.importSource);
  const savedPresetId = useWizardStore((s) => s.selectedFramePresetId);
  const setSavedPresetId = useWizardStore((s) => s.setSelectedFramePresetId);
  const detectedPreset = useDetectedPreset();

  // Restore selection: first try the stored preset ID (survives remounts),
  // then fall back to reverse-matching from stagedParams
  const [selectedPreset, setSelectedPreset] = useState<AirframePreset | null>(() => {
    // Primary: use stored preset ID
    if (savedPresetId) {
      const match = AIRFRAME_PRESETS.find((p) => p.id === savedPresetId);
      if (match) return match;
    }
    // Fallback: reverse-match from staged params
    // Check if we already staged a frame -- find the matching preset
    if (stagedParams.FRAME_CLASS !== undefined) {
      const match = AIRFRAME_PRESETS.find((p) =>
        p.additionalParams &&
        Object.entries(p.additionalParams).every(([k, v]) => stagedParams[k] === v)
      );
      if (match) return match;
    }
    // For planes, check staged servo functions
    if (vehicleType === 'plane' && stagedParams.SERVO1_FUNCTION !== undefined) {
      for (const preset of AIRFRAME_PRESETS) {
        if (preset.category !== 'plane') continue;
        const expectedOutputs = new Map<number, number>();
        if (preset.planeTemplate) {
          for (const s of preset.planeTemplate.surfaces) {
            expectedOutputs.set(s.defaultOutput, s.function);
          }
        }
        for (const m of preset.motorTemplate.forwardMotors) {
          expectedOutputs.set(m.defaultOutput, m.function);
        }
        let matches = 0;
        for (const [output, func] of expectedOutputs) {
          if (stagedParams[`SERVO${output}_FUNCTION`] === func) matches++;
        }
        if (expectedOutputs.size > 0 && matches === expectedOutputs.size) return preset;
      }
    }
    // For quadplane imports, match by motor/servo function profile
    if (vehicleType === 'quadplane' && importSource === 'inav') {
      // Count motor and servo types from staged params
      let motorCount = 0;
      let tiltCount = 0;
      let aileronCount = 0;
      let elevatorCount = 0;
      let rudderCount = 0;
      for (let i = 1; i <= 16; i++) {
        const func = stagedParams[`SERVO${i}_FUNCTION`];
        if (func === undefined) continue;
        if (func >= 33 && func <= 40) motorCount++;
        if (func === 41) tiltCount++;
        if (func === 77) aileronCount++;
        if (func === 78) elevatorCount++;
        if (func === 79) rudderCount++;
      }

      // Match against VTOL presets using a scoring system
      let bestPreset: AirframePreset | null = null;
      let bestScore = 0;

      for (const preset of AIRFRAME_PRESETS) {
        if (preset.category !== 'vtol') continue;

        const pMotors = preset.motorTemplate.forwardMotors.length
          + preset.motorTemplate.vtolMotors.length;
        const pAilerons = preset.planeTemplate?.surfaces.filter(
          s => s.function === 77).length ?? 0;
        const hasElevator = preset.planeTemplate?.surfaces.some(
          s => s.function === 78) ?? false;
        const hasTilt = preset.additionalParams?.Q_TILT_ENABLE === 1;

        let score = 0;
        if (pMotors === motorCount) score += 3; // Motor count is the strongest signal
        if (pAilerons === aileronCount) score += 2;
        if (hasElevator === (elevatorCount > 0)) score += 1;
        if (hasTilt === (tiltCount > 0)) score += 1;

        if (score > bestScore && pMotors === motorCount) {
          bestScore = score;
          bestPreset = preset;
        }
      }

      if (bestPreset) return bestPreset;
    }
    return detectedPreset;
  });

  // Copter category drill-down -- auto-open if a preset is already selected
  const [copterCategory, setCopterCategory] = useState<string | null>(() => {
    if (vehicleType === 'copter' && selectedPreset?.additionalParams?.FRAME_CLASS !== undefined) {
      return String(selectedPreset.additionalParams.FRAME_CLASS);
    }
    return null;
  });

  // Determine which category to show based on vehicle type
  const category = vehicleType === 'copter' ? 'copter'
    : vehicleType === 'quadplane' ? 'vtol'
    : 'plane';

  const presets = AIRFRAME_PRESETS.filter((p) => p.category === category);

  // Gate the Next button
  useEffect(() => {
    // When import is active, allow advancing even without selecting a preset
    // (the import already provides frame config and output mapping)
    onCanAdvanceChange(selectedPreset !== null || importSource !== null);
  }, [selectedPreset, importSource, onCanAdvanceChange]);

  // Auto-mark complete when import provides frame config
  useEffect(() => {
    if (importSource && !selectedPreset) {
      markComplete('frame');
    }
  }, [importSource, selectedPreset, markComplete]);

  // Stage params when a preset is selected
  const handleSelectPreset = useCallback((p: AirframePreset) => {
    setSelectedPreset(p);
    setSavedPresetId(p.id);

    const params: Record<string, number> = {};

    if (importSource) {
      // Import data is source of truth for output mapping.
      // Only stage frame-identifying params (FRAME_CLASS, FRAME_TYPE, Q_ENABLE, etc.)
      // DO NOT overwrite SERVO_FUNCTION values from the import.
    } else {
      // Fresh start -- apply full template defaults
      for (let i = 1; i <= 16; i++) {
        params[`SERVO${i}_FUNCTION`] = 0;
      }
      if (p.planeTemplate) {
        for (const s of p.planeTemplate.surfaces) {
          params[`SERVO${s.defaultOutput}_FUNCTION`] = s.function;
        }
      }
      for (const m of p.motorTemplate.forwardMotors) {
        params[`SERVO${m.defaultOutput}_FUNCTION`] = m.function;
      }
      for (const m of p.motorTemplate.vtolMotors) {
        params[`SERVO${m.defaultOutput}_FUNCTION`] = m.function;
      }
    }

    // Frame-identifying params always apply (FRAME_CLASS/TYPE for copters, Q_* for VTOLs)
    if (p.additionalParams) {
      for (const [key, value] of Object.entries(p.additionalParams)) {
        params[key] = value;
      }
    }

    stageParams(params);
    markComplete('frame');
  }, [stageParams, markComplete, importSource, setSavedPresetId]);

  // ── Copter categories ──────────────────────────────────────────────

  const copterCategories = useMemo(() => {
    if (category !== 'copter') return [];
    const classNames: Record<number, string> = {
      1: 'Quad', 2: 'Hexa', 3: 'Octa', 4: 'OctaQuad', 5: 'Y6', 7: 'Tricopter',
    };
    const classDescriptions: Record<number, string> = {
      1: '4 motors',
      2: '6 motors, 6 arms',
      3: '8 motors, 8 arms',
      4: '8 motors, 4 arms (coaxial)',
      5: '6 motors, 3 arms (coaxial)',
      7: '3 motors + yaw servo',
    };
    const classOrder = [1, 2, 3, 4, 5, 7];

    const groups = new Map<number, { name: string; presets: AirframePreset[] }>();
    for (const p of presets) {
      const fc = p.additionalParams?.FRAME_CLASS;
      if (fc === undefined) continue;
      if (!groups.has(fc)) {
        groups.set(fc, { name: classNames[fc] || `Class ${fc}`, presets: [] });
      }
      groups.get(fc)!.presets.push(p);
    }

    return classOrder
      .filter(fc => groups.has(fc))
      .map(fc => ({
        frameClass: fc,
        name: groups.get(fc)!.name,
        description: classDescriptions[fc] || '',
        presets: groups.get(fc)!.presets,
        representative: groups.get(fc)!.presets[0],
      }));
  }, [presets, category]);

  const activeCopterCat = useMemo(() => {
    if (!copterCategory) return null;
    return copterCategories.find(c => String(c.frameClass) === copterCategory) ?? null;
  }, [copterCategory, copterCategories]);

  const copterVariants = activeCopterCat?.presets ?? [];

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Select Your Airframe</h2>
        <p className="mt-1 text-sm text-muted">
          Choose the frame type that matches your aircraft. This determines motor
          and servo output assignments.
        </p>
      </div>

      {/* Import source banner */}
      {importSource === 'inav' && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-500/30 bg-blue-900/15 px-4 py-3">
          <Info size={14} className="mt-0.5 shrink-0 text-blue-400" />
          <div>
            <p className="text-sm font-semibold text-blue-300">
              Output mapping imported from INAV
            </p>
            <p className="mt-0.5 text-xs text-blue-400/80">
              Motor and servo output assignments are from your INAV configuration.
              Select a frame below to set the frame type -- output mapping will NOT be overwritten.
              You can skip this step if your import is complete.
            </p>
          </div>
        </div>
      )}

      {/* Copter: category drill-down */}
      {category === 'copter' && !copterCategory && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {copterCategories.map((cat) => {
            const isSelectedInCat = selectedPreset && cat.presets.some(p => p.id === selectedPreset.id);
            const isCurrent = detectedPreset && cat.presets.some(p => p.id === detectedPreset.id);
            return (
              <button
                key={cat.frameClass}
                onClick={() => {
                  if (cat.presets.length === 1) {
                    handleSelectPreset(cat.presets[0]);
                  } else {
                    setCopterCategory(String(cat.frameClass));
                  }
                }}
                className={`group relative flex flex-col items-center gap-3 rounded border-2 p-5 text-center transition ${
                  isSelectedInCat
                    ? 'border-accent bg-accent/10'
                    : isCurrent && !selectedPreset
                      ? 'border-success/50 bg-success/5'
                      : 'border-border bg-surface-0 hover:border-accent/50 hover:bg-surface-2'
                }`}
              >
                {isCurrent && (
                  <ActiveBadge highlight={!!isSelectedInCat || !selectedPreset} />
                )}
                <AirframeIcon preset={cat.representative} size={120} selected={!!isSelectedInCat} />
                <div>
                  <p className={`text-sm font-bold ${isSelectedInCat ? 'text-accent' : 'text-foreground'}`}>
                    {cat.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted leading-snug">{cat.description}</p>
                  {cat.presets.length > 1 && (
                    <p className="mt-1 text-xs text-accent">{cat.presets.length} variants ›</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Copter: variant grid with pinned category card */}
      {category === 'copter' && copterCategory && activeCopterCat && (
        <>
          <div className="flex items-center gap-3 rounded border-2 border-accent bg-surface-0 px-4 py-3">
            <AirframeIcon preset={activeCopterCat.representative} size={48} selected={true} />
            <div className="flex-1">
              <p className="text-sm font-bold text-accent">{activeCopterCat.name}</p>
              <p className="text-xs text-muted">
                {activeCopterCat.description} -- choose a layout variant below
              </p>
            </div>
            <button
              onClick={() => setCopterCategory(null)}
              className="flex items-center gap-1.5 rounded border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-muted hover:border-accent hover:text-foreground transition"
            >
              <ArrowLeft size={12} />
              All Frames
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {copterVariants.map((p) => (
              <FrameCard
                key={p.id}
                preset={p}
                isSelected={selectedPreset?.id === p.id}
                isCurrent={p.id === detectedPreset?.id}
                hasSelection={selectedPreset !== null}
                onSelect={handleSelectPreset}
              />
            ))}
          </div>
        </>
      )}

      {/* Plane / VTOL: flat grid */}
      {category !== 'copter' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {presets.map((p) => (
            <FrameCard
              key={p.id}
              preset={p}
              isSelected={selectedPreset?.id === p.id}
              isCurrent={p.id === detectedPreset?.id}
              hasSelection={selectedPreset !== null}
              onSelect={handleSelectPreset}
            />
          ))}
        </div>
      )}

      {/* Selection summary */}
      {selectedPreset && (
        <div className="rounded border border-accent/30 bg-accent/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <AirframeIcon preset={selectedPreset} size={64} selected={true} />
            <div>
              <p className="text-base font-bold text-accent">{selectedPreset.name}</p>
              <p className="mt-0.5 text-sm text-muted">{selectedPreset.description}</p>
              <p className="mt-1 text-xs text-subtle">
                Motors: {selectedPreset.motorTemplate.forwardMotors.length + selectedPreset.motorTemplate.vtolMotors.length}
                {selectedPreset.planeTemplate && (
                  <> • Surfaces: {selectedPreset.planeTemplate.surfaces.length}</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared sub-components ────────────────────────────────────────────

function FrameCard({
  preset,
  isSelected,
  isCurrent,
  hasSelection,
  onSelect,
}: {
  preset: AirframePreset;
  isSelected: boolean;
  isCurrent: boolean;
  hasSelection: boolean;
  onSelect: (p: AirframePreset) => void;
}) {
  const showCurrentHighlight = isCurrent && !hasSelection;
  return (
    <button
      onClick={() => onSelect(preset)}
      className={`group relative flex flex-col items-center gap-3 rounded border-2 p-5 text-center transition ${
        isSelected
          ? 'border-accent bg-accent/10'
          : showCurrentHighlight
            ? 'border-success/50 bg-success/5'
            : 'border-border bg-surface-0 hover:border-accent/50 hover:bg-surface-2'
      }`}
    >
      {isCurrent && (
        <ActiveBadge highlight={isSelected || !hasSelection} />
      )}
      <AirframeIcon preset={preset} size={120} selected={isSelected} />
      <div>
        <p className={`text-sm font-bold ${isSelected ? 'text-accent' : 'text-foreground'}`}>
          {preset.name}
        </p>
        <p className="mt-0.5 text-xs text-muted leading-snug">{preset.description}</p>
      </div>
    </button>
  );
}

function ActiveBadge({ highlight }: { highlight: boolean }) {
  return (
    <span className={`absolute top-2 right-2 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
      highlight
        ? 'bg-success-muted/60 border-success/30 text-success'
        : 'bg-surface-2/60 border-border text-subtle'
    }`}>
      <Check size={10} />
      Active
    </span>
  );
}
