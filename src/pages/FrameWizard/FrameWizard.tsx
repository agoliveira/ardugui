import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Plane,
  Cpu,
  Rocket,
  Wrench,
  AlertTriangle,
} from 'lucide-react';
import { useParameterStore } from '@/store/parameterStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { useDetectedPreset } from '@/hooks/useDetectedPreset';
import {
  AIRFRAME_PRESETS,
  EXTRA_OPTIONS,
  type AirframePreset,
} from '@/models/airframeTemplates';
import { AirframeIcon } from '@/components/AirframeIcons';

type WizardStep = 'airframe' | 'extras' | 'outputs' | 'done';
type CategoryTab = 'plane' | 'copter' | 'vtol';

// ============================================================
// Step 1: Airframe Selection
// ============================================================

function AirframeGrid({
  category,
  selected,
  currentId,
  onSelect,
}: {
  category: CategoryTab;
  selected: AirframePreset | null;
  currentId: string | null;
  onSelect: (p: AirframePreset) => void;
}) {
  const presets = AIRFRAME_PRESETS.filter((p) => p.category === category);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {presets.map((p) => {
        const isSelected = selected?.id === p.id;
        const isCurrent = p.id === currentId;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className={`group relative flex flex-col items-center gap-3 rounded-xl border-2 p-5 text-center transition ${
              isSelected
                ? 'border-accent bg-accent/10'
                : isCurrent
                  ? 'border-success/50 bg-success/5'
                  : 'border-border bg-surface-1 hover:border-accent/50 hover:bg-surface-2'
            }`}
          >
            {isCurrent && (
              <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-success-muted/60 border border-success/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
                <Check size={10} />
                Active
              </span>
            )}
            {/* Aircraft silhouette */}
            <AirframeIcon preset={p} size={140} selected={isSelected} />
            <div>
              <p className={`text-base font-bold ${isSelected ? 'text-accent' : 'text-foreground'}`}>
                {p.name}
              </p>
              <p className="mt-0.5 text-base text-muted leading-snug">{p.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// Step 2: Extras Selection
// ============================================================

function ExtrasStep({
  preset,
  selectedExtras,
  onToggle,
}: {
  preset: AirframePreset;
  selectedExtras: Set<string>;
  onToggle: (id: string) => void;
}) {
  const available = preset.availableExtras.map((id) => EXTRA_OPTIONS[id]).filter(Boolean);

  if (available.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-subtle">
        <p className="text-sm">No additional options for this airframe.</p>
        <p className="mt-1 text-sm">Continue to output assignment.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {available.map((extra) => {
        const isOn = selectedExtras.has(extra.id);
        return (
          <button
            key={extra.id}
            onClick={() => onToggle(extra.id)}
            className={`flex items-start gap-3 rounded-lg border-2 px-4 py-3 text-left transition ${
              isOn
                ? 'border-accent bg-accent/10'
                : 'border-border bg-surface-1 hover:border-accent/50'
            }`}
          >
            <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
              isOn ? 'border-accent bg-accent text-white' : 'border-subtle'
            }`}>
              {isOn && <Check size={12} />}
            </div>
            <div>
              <p className={`text-base font-bold ${isOn ? 'text-accent' : 'text-foreground'}`}>
                {extra.label}
              </p>
              <p className="mt-0.5 text-base text-muted">{extra.description}</p>
              <p className="mt-1 text-lg text-muted">
                Adds: {extra.slots.map((s) => s.label).join(', ')}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// Step 3: Output Assignment
// ============================================================

interface OutputMapping {
  slotId: string;
  label: string;
  functionId: number;
  output: number; // 1-based SERVO output
  category: string;
}

function OutputsStep({
  preset,
  mappings,
  onChangeOutput,
}: {
  preset: AirframePreset;
  mappings: OutputMapping[];
  onChangeOutput: (slotId: string, output: number) => void;
}) {
  // Find conflicts (multiple slots assigned to same output)
  const outputUsage = new Map<number, string[]>();
  for (const m of mappings) {
    const list = outputUsage.get(m.output) || [];
    list.push(m.slotId);
    outputUsage.set(m.output, list);
  }
  const conflicts = new Set<number>();
  outputUsage.forEach((slots, output) => {
    if (slots.length > 1) conflicts.add(output);
  });

  // Group by category
  const surfaceSlots = mappings.filter((m) => ['wing_left', 'wing_right', 'tail'].includes(m.category));
  const motorSlots = mappings.filter((m) => ['motor_front', 'motor_vtol'].includes(m.category));
  const otherSlots = mappings.filter((m) => m.category === 'other');

  // Build map of output → which slot is using it (for greying out in dropdowns)
  const usedByOutput = new Map<number, string>();
  for (const m of mappings) {
    usedByOutput.set(m.output, m.slotId);
  }

  const renderGroup = (title: string, slots: OutputMapping[]) => {
    if (slots.length === 0) return null;
    return (
      <div>
        <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-subtle">{title}</h4>
        <div className="space-y-2">
          {slots.map((m) => {
            const hasConflict = conflicts.has(m.output);
            return (
              <div key={m.slotId}
                className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 ${
                  hasConflict ? 'border-red-500/50 bg-red-900/10' : 'border-border bg-surface-1'
                }`}>
                <span className="flex-1 text-base font-semibold text-foreground">{m.label}</span>
                <select
                  value={m.output}
                  onChange={(e) => onChangeOutput(m.slotId, Number(e.target.value))}
                  className="rounded border border-border bg-surface-0 px-3 py-1.5 font-mono text-base text-foreground"
                >
                  {Array.from({ length: 16 }, (_, i) => i + 1).map((n) => {
                    const usedBy = usedByOutput.get(n);
                    const isUsedByOther = usedBy !== undefined && usedBy !== m.slotId;
                    const otherLabel = isUsedByOther
                      ? mappings.find((o) => o.slotId === usedBy)?.label
                      : null;
                    return (
                      <option key={n} value={n} disabled={isUsedByOther}>
                        Output {n}{otherLabel ? ` (${otherLabel})` : ''}
                      </option>
                    );
                  })}
                </select>
                {hasConflict && (
                  <AlertTriangle size={14} className="shrink-0 text-red-500" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Diagram */}
      <div className="card">
        <div className="card-header">Wiring Diagram</div>
        <CombinedDiagram preset={preset} mappings={mappings} conflicts={conflicts} />
        <p className="mt-2 text-center text-base text-muted">
          Match each function to the output it is wired to on your flight controller.
        </p>
      </div>

      {/* Assignment list */}
      <div className="space-y-6">
        {renderGroup('Control Surfaces', surfaceSlots)}
        {renderGroup('Motors', motorSlots)}
        {renderGroup('Accessories', otherSlots)}

        {conflicts.size > 0 && (
          <div className="flex items-center gap-2 rounded bg-red-900/20 px-3 py-2.5 text-sm text-red-400">
            <AlertTriangle size={14} />
            Output conflict -- multiple functions on the same SERVO output.
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Combined Diagram -- plane surfaces + motor positions
// ============================================================

function CombinedDiagram({
  preset,
  mappings,
  conflicts,
}: {
  preset: AirframePreset;
  mappings: OutputMapping[];
  conflicts: Set<number>;
}) {
  const W = 420;
  const H = 360;
  const cx = W / 2;
  const cy = H / 2;
  const isPlane = preset.planeTemplate !== null;
  const motors = preset.motorTemplate.vtolMotors;
  const hasMotors = motors.length > 0;

  // Scale for motor positions
  const mScale = isPlane ? 65 : 95;
  // Offset motors down a bit when combined with plane
  const mOffY = isPlane ? 5 : 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full">
      <rect width={W} height={H} rx={8} fill="#0d1117" />

      {/* Front indicator */}
      <polygon points={`${cx - 6},14 ${cx + 6},14 ${cx},7`} fill="#60a5fa" opacity={0.6} />
      <text x={cx} y={25} textAnchor="middle" fill="#60a5fa" fontSize={9}
        fontFamily="ui-monospace, monospace">FRONT</text>

      {/* === PLANE BODY === */}
      {isPlane && (
        <g>
          {/* Fuselage */}
          <ellipse cx={cx} cy={cy + mOffY} rx={10} ry={65}
            fill="#1e293b" stroke="#475569" strokeWidth={1.2} />

          {/* Wings */}
          {preset.planeTemplate?.diagramType !== 'flying_wing' ? (
            <g>
              <path d={`M ${cx - 8},${cy - 5} L ${cx - 140},${cy + 5} L ${cx - 135},${cy + 12} L ${cx - 8},${cy + 3} Z`}
                fill="#1e293b" stroke="#475569" strokeWidth={0.8} />
              <path d={`M ${cx + 8},${cy - 5} L ${cx + 140},${cy + 5} L ${cx + 135},${cy + 12} L ${cx + 8},${cy + 3} Z`}
                fill="#1e293b" stroke="#475569" strokeWidth={0.8} />
            </g>
          ) : (
            <g>
              {/* Flying wing -- swept */}
              <path d={`M ${cx},${cy - 30} L ${cx - 140},${cy + 10} L ${cx - 120},${cy + 18} L ${cx - 8},${cy} Z`}
                fill="#1e293b" stroke="#475569" strokeWidth={0.8} />
              <path d={`M ${cx},${cy - 30} L ${cx + 140},${cy + 10} L ${cx + 120},${cy + 18} L ${cx + 8},${cy} Z`}
                fill="#1e293b" stroke="#475569" strokeWidth={0.8} />
            </g>
          )}

          {/* Tail (non-flying-wing) */}
          {preset.planeTemplate?.diagramType !== 'flying_wing' && (
            <g>
              {/* H-tail */}
              <path d={`M ${cx - 6},${cy + 50} L ${cx - 40},${cy + 56} L ${cx - 38},${cy + 62} L ${cx - 6},${cy + 56} Z`}
                fill="#1e293b" stroke="#475569" strokeWidth={0.8} />
              <path d={`M ${cx + 6},${cy + 50} L ${cx + 40},${cy + 56} L ${cx + 38},${cy + 62} L ${cx + 6},${cy + 56} Z`}
                fill="#1e293b" stroke="#475569" strokeWidth={0.8} />
              {/* V-tail */}
              <path d={`M ${cx - 2},${cy + 45} L ${cx},${cy + 35} L ${cx + 2},${cy + 45} Z`}
                fill="#1e293b" stroke="#475569" strokeWidth={0.8} />
            </g>
          )}
        </g>
      )}

      {/* === SURFACE LABELS === */}
      {isPlane && (() => {
        const surfaceMappings = mappings.filter((m) => ['wing_left', 'wing_right', 'tail'].includes(m.category));
        // Track index per category for staggering
        const catIdx: Record<string, number> = {};
        return surfaceMappings.map((m) => {
          const idx = catIdx[m.category] ?? 0;
          catIdx[m.category] = idx + 1;
          const pos = getSurfaceLabelPos(m, cx, cy, idx);
          const hasConflict = conflicts.has(m.output);
          const color = hasConflict ? '#ef4444' : getCategoryColor(m.category);
          return (
            <g key={m.slotId}>
              <circle cx={pos.dotX} cy={pos.dotY} r={3}
                fill={color} opacity={0.7} />
              <line x1={pos.dotX} y1={pos.dotY} x2={pos.labelX} y2={pos.labelY}
                stroke={color} strokeWidth={0.5} opacity={0.4} />
              <text x={pos.labelX} y={pos.labelY} textAnchor={pos.anchor}
                fill={color} fontSize={9} fontFamily="ui-monospace, monospace" fontWeight={600}>
                Out {m.output}: {m.label}
              </text>
            </g>
          );
        });
      })()}

      {/* === MOTOR POSITIONS === */}
      {hasMotors && (
        <g>
          {/* Arms from center */}
          {motors.map((m) => (
            <line key={`arm-${m.number}`}
              x1={cx} y1={cy + mOffY}
              x2={cx + m.x * mScale} y2={cy + mOffY - m.y * mScale}
              stroke="#334155" strokeWidth={2} strokeLinecap="round" />
          ))}

          {/* Motor circles */}
          {motors.map((m) => {
            const mx = cx + m.x * mScale;
            const my = cy + mOffY - m.y * mScale;
            const mapping = mappings.find((mp) => mp.slotId === `vtol_motor_${m.number}`);
            const hasConflict = mapping ? conflicts.has(mapping.output) : false;
            const strokeColor = hasConflict ? '#ef4444' : m.rotation === 'CCW' ? '#60a5fa' : '#f87171';

            return (
              <g key={`motor-${m.number}`}>
                <circle cx={mx} cy={my} r={14}
                  fill="#1e293b" stroke={strokeColor} strokeWidth={1.5} />
                <text x={mx} y={my + 1} textAnchor="middle" dominantBaseline="central"
                  fill="#e2e8f0" fontSize={12} fontWeight={700}
                  fontFamily="ui-monospace, monospace">
                  {m.number}
                </text>
                {mapping && (
                  <text x={mx} y={my + 22} textAnchor="middle"
                    fill={strokeColor} fontSize={9}
                    fontFamily="ui-monospace, monospace">
                    Out {mapping.output}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      )}

      {/* === FORWARD MOTOR === */}
      {mappings
        .filter((m) => m.category === 'motor_front')
        .map((m) => {
          const hasConflict = conflicts.has(m.output);
          const color = hasConflict ? '#ef4444' : '#f59e0b';
          return (
            <g key={m.slotId}>
              <circle cx={cx} cy={cy - 62} r={6}
                fill="none" stroke={color} strokeWidth={1.5} />
              <line x1={cx - 10} y1={cy - 62} x2={cx + 10} y2={cy - 62}
                stroke={color} strokeWidth={1.5} strokeLinecap="round" />
              <text x={cx + 16} y={cy - 59} textAnchor="start"
                fill={color} fontSize={9} fontFamily="ui-monospace, monospace" fontWeight={600}>
                Out {m.output}: {m.label}
              </text>
            </g>
          );
        })}
    </svg>
  );
}

function getSurfaceLabelPos(m: OutputMapping, cx: number, cy: number, idx: number) {
  const spacing = 16;
  switch (m.category) {
    case 'wing_left':
      return {
        dotX: cx - 95 + idx * 18, dotY: cy + 4 + idx * 3,
        labelX: 10, labelY: 44 + idx * spacing,
        anchor: 'start' as const,
      };
    case 'wing_right':
      return {
        dotX: cx + 95 - idx * 18, dotY: cy + 4 + idx * 3,
        labelX: 410, labelY: 44 + idx * spacing,
        anchor: 'end' as const,
      };
    case 'tail':
      return {
        dotX: cx + (idx % 2 === 0 ? -20 : 20), dotY: cy + 55,
        labelX: cx, labelY: cy + 85 + idx * spacing,
        anchor: 'middle' as const,
      };
    default:
      return {
        dotX: cx, dotY: cy,
        labelX: cx, labelY: cy + 100 + idx * spacing,
        anchor: 'middle' as const,
      };
  }
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'wing_left':
    case 'wing_right':
      return '#60a5fa';
    case 'tail':
      return '#34d399';
    case 'motor_front':
    case 'motor_vtol':
      return '#f59e0b';
    default:
      return '#94a3b8';
  }
}

// ============================================================
// Frame Wizard Main Component
// ============================================================

export function FrameWizard({ onClose, onDirtyChange }: { onClose: () => void; onDirtyChange?: (dirty: boolean) => void }) {
  const vehicleType = useVehicleStore((s) => s.type);
  const setParamLocal = useParameterStore((s) => s.setParamLocal);

  // Detect currently configured preset from FC parameters
  const detectedPreset = useDetectedPreset();

  const [step, setStep] = useState<WizardStep>('airframe');
  const [categoryTab, setCategoryTab] = useState<CategoryTab>(
    vehicleType === 'copter' ? 'copter' : vehicleType === 'quadplane' ? 'vtol' : 'plane'
  );
  const [selectedPreset, setSelectedPreset] = useState<AirframePreset | null>(detectedPreset);
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());
  const [outputOverrides, setOutputOverrides] = useState<Map<string, number>>(new Map());
  // Only dirty if user actively changed something from the initial state
  const [userModified, setUserModified] = useState(false);

  // Wrap setSelectedPreset to track user changes
  const handleSelectPreset = useCallback((p: AirframePreset) => {
    setSelectedPreset(p);
    setUserModified(true);
  }, []);

  // Track whether user has done any work worth warning about
  const hasUnsavedWork = userModified && selectedPreset !== null && step !== 'done';

  // Notify parent of dirty state
  useEffect(() => {
    onDirtyChange?.(hasUnsavedWork);
  }, [hasUnsavedWork, onDirtyChange]);

  // Safe close -- confirm if there's unsaved work
  const handleClose = useCallback(() => {
    if (hasUnsavedWork) {
      const confirmed = window.confirm(
        'You have unsaved frame configuration. Are you sure you want to leave? Your changes will be lost.'
      );
      if (!confirmed) return;
    }
    onClose();
  }, [hasUnsavedWork, onClose]);

  // Build the full mapping list from preset + extras
  const mappings = useMemo<OutputMapping[]>(() => {
    if (!selectedPreset) return [];

    const result: OutputMapping[] = [];

    // Plane surfaces
    if (selectedPreset.planeTemplate) {
      for (const slot of selectedPreset.planeTemplate.surfaces) {
        result.push({
          slotId: slot.id,
          label: slot.label,
          functionId: slot.function,
          output: outputOverrides.get(slot.id) ?? slot.defaultOutput,
          category: slot.category,
        });
      }
    }

    // Forward motors
    for (const slot of selectedPreset.motorTemplate.forwardMotors) {
      result.push({
        slotId: slot.id,
        label: slot.label,
        functionId: slot.function,
        output: outputOverrides.get(slot.id) ?? slot.defaultOutput,
        category: slot.category,
      });
    }

    // VTOL motors
    for (const motor of selectedPreset.motorTemplate.vtolMotors) {
      const slotId = `vtol_motor_${motor.number}`;
      result.push({
        slotId,
        label: `Motor ${motor.number}`,
        functionId: motor.function,
        output: outputOverrides.get(slotId) ?? motor.defaultOutput,
        category: 'motor_vtol',
      });
    }

    // Extras
    for (const extraId of selectedExtras) {
      const extra = EXTRA_OPTIONS[extraId];
      if (!extra) continue;
      for (const slot of extra.slots) {
        result.push({
          slotId: slot.id,
          label: slot.label,
          functionId: slot.function,
          output: outputOverrides.get(slot.id) ?? slot.defaultOutput,
          category: slot.category,
        });
      }
    }

    return result;
  }, [selectedPreset, selectedExtras, outputOverrides]);

  const handleToggleExtra = useCallback((id: string) => {
    setSelectedExtras((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleChangeOutput = useCallback((slotId: string, output: number) => {
    setOutputOverrides((prev) => {
      const next = new Map(prev);
      next.set(slotId, output);
      return next;
    });
  }, []);

  const handleApply = useCallback(() => {
    if (!selectedPreset) return;

    // First, clear all SERVO functions to Disabled
    for (let i = 1; i <= 16; i++) {
      setParamLocal(`SERVO${i}_FUNCTION`, 0);
    }

    // Apply mappings
    for (const m of mappings) {
      setParamLocal(`SERVO${m.output}_FUNCTION`, m.functionId);
    }

    // Apply additional params (FRAME_CLASS, Q_ENABLE, etc.)
    if (selectedPreset.additionalParams) {
      for (const [key, value] of Object.entries(selectedPreset.additionalParams)) {
        setParamLocal(key, value);
      }
    }

    setStep('done');
  }, [selectedPreset, mappings, setParamLocal]);

  // Check for output conflicts
  const hasConflicts = useMemo(() => {
    const used = new Map<number, number>();
    for (const m of mappings) {
      used.set(m.output, (used.get(m.output) || 0) + 1);
    }
    return Array.from(used.values()).some((count) => count > 1);
  }, [mappings]);

  const canProceed = () => {
    switch (step) {
      case 'airframe': return selectedPreset !== null;
      case 'extras': return true;
      case 'outputs': return !hasConflicts;
      default: return false;
    }
  };

  const nextStep = () => {
    switch (step) {
      case 'airframe': setStep('extras'); break;
      case 'extras': setStep('outputs'); break;
      case 'outputs': handleApply(); break;
    }
  };

  const prevStep = () => {
    switch (step) {
      case 'extras': setStep('airframe'); break;
      case 'outputs': setStep('extras'); break;
      case 'done': setStep('outputs'); break;
    }
  };

  const stepIndex = { airframe: 0, extras: 1, outputs: 2, done: 3 }[step];

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Frame Wizard</h2>
          <p className="text-base text-muted">
            Configure your airframe type, extras, and output assignments.
          </p>
        </div>
        <button onClick={handleClose}
          className="btn btn-ghost text-base text-muted">
          <Wrench size={12} />
          Skip to Manual Setup
        </button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {['Airframe', 'Extras', 'Outputs', 'Done'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
              i < stepIndex
                ? 'bg-accent text-white'
                : i === stepIndex
                ? 'bg-accent/20 text-accent border-2 border-accent'
                : 'bg-surface-2 text-subtle'
            }`}>
              {i < stepIndex ? <Check size={12} /> : i + 1}
            </div>
            <span className={`text-sm ${i === stepIndex ? 'font-semibold text-foreground' : 'text-subtle'}`}>
              {label}
            </span>
            {i < 3 && <ChevronRight size={12} className="text-subtle" />}
          </div>
        ))}
      </div>

      {/* === STEP CONTENT === */}

      {/* Step 1: Airframe */}
      {step === 'airframe' && (
        <div className="space-y-4">
          {/* Category tabs -- filtered by firmware */}
          <div className="flex gap-1 rounded-lg bg-surface-1 p-1">
            {([
              { id: 'plane' as const, label: 'Plane', icon: Plane, firmware: ['plane', 'quadplane'] },
              { id: 'copter' as const, label: 'Copter', icon: Cpu, firmware: ['copter'] },
              { id: 'vtol' as const, label: 'VTOL', icon: Rocket, firmware: ['plane', 'quadplane'] },
            ])
              .filter(({ firmware }) => !vehicleType || firmware.includes(vehicleType))
              .map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setCategoryTab(id);
                  setSelectedPreset(null); // Reset selection when changing tab
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                  categoryTab === id
                    ? 'bg-surface-0 text-foreground shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <AirframeGrid
            category={categoryTab}
            selected={selectedPreset}
            currentId={detectedPreset?.id ?? null}
            onSelect={(p) => {
              handleSelectPreset(p);
              setSelectedExtras(new Set());
              setOutputOverrides(new Map());
            }}
          />

          {selectedPreset && (
            <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3">
              <p className="text-sm font-medium text-accent">{selectedPreset.name}</p>
              <p className="mt-0.5 text-base text-muted">{selectedPreset.description}</p>
              <p className="mt-1 text-[15px] text-subtle">
                Surfaces: {selectedPreset.planeTemplate?.surfaces.length ?? 0} •
                Motors: {selectedPreset.motorTemplate.forwardMotors.length + selectedPreset.motorTemplate.vtolMotors.length} •
                Available extras: {selectedPreset.availableExtras.length}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Extras */}
      {step === 'extras' && selectedPreset && (
        <ExtrasStep
          preset={selectedPreset}
          selectedExtras={selectedExtras}
          onToggle={handleToggleExtra}
        />
      )}

      {/* Step 3: Outputs */}
      {step === 'outputs' && selectedPreset && (
        <OutputsStep
          preset={selectedPreset}
          mappings={mappings}
          onChangeOutput={handleChangeOutput}
        />
      )}

      {/* Done */}
      {step === 'done' && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-900/30">
            <Check size={32} className="text-green-500" />
          </div>
          <h3 className="mt-4 text-3xl font-extrabold text-foreground tracking-tight">Configuration Applied</h3>
          <p className="mt-1 text-lg text-muted">
            All servo functions and frame parameters have been set.
          </p>
          <p className="mt-3 text-[15px] text-subtle">
            Changes are staged locally. Click <strong>Save to FC</strong> in the footer to write them to the flight controller.
          </p>
          <div className="mt-6 flex gap-3">
            <button onClick={onClose} className="btn btn-primary gap-1.5 text-sm">
              <Check size={14} />
              Continue to Motors &amp; Servos
            </button>
            <button onClick={() => setStep('outputs')} className="btn btn-ghost text-sm">
              Go Back &amp; Adjust
            </button>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      {step !== 'done' && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <button
            onClick={prevStep}
            disabled={step === 'airframe'}
            className="btn btn-ghost gap-1 text-sm"
          >
            <ChevronLeft size={14} />
            Back
          </button>

          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className="btn btn-primary gap-1 text-sm"
          >
            {step === 'outputs' ? (
              <>
                <Check size={14} />
                Apply Configuration
              </>
            ) : (
              <>
                Next
                <ChevronRight size={14} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
