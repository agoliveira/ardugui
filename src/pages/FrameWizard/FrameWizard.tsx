/**
 * Frame Configuration Page -- single-page layout.
 *
 * Two configuration sections + one informational:
 *   1. Frame Selection -- pick airframe type from the grid
 *   2. Options -- extras like flaps, retracts (contextual to frame)
 *   3. Suggested Wiring -- read-only default output mapping
 *
 * The options and wiring sections stay collapsed until a frame is selected.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Check,
  Plane,
  Cpu,
  Rocket,
  Save,
  ArrowLeft,
} from 'lucide-react';
import { useParameterStore } from '@/store/parameterStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { useDetectedPreset } from '@/hooks/useDetectedPreset';
import {
  AIRFRAME_PRESETS,
  EXTRA_OPTIONS,
  type AirframePreset,
} from '@/models/airframeTemplates';
import { AirframeIcon, AIRFRAME_VIEWBOX } from '@/components/AirframeIcons';

type CategoryTab = 'plane' | 'copter' | 'vtol';

// ── Suggested Wiring Diagram -- read-only, AirframeIcon + default outputs ──

function SuggestedWiringDiagram({ preset }: { preset: AirframePreset }) {
  const V = AIRFRAME_VIEWBOX;
  const pad = 50;
  const total = V + pad * 2;
  const offset = pad;

  const mapX = (dx: number) => offset + V / 2 + dx * (V * 0.42);
  const mapY = (dy: number) => offset + V / 2 - dy * (V * 0.42);

  const motors = preset.motorTemplate.vtolMotors;

  return (
    <svg viewBox={`0 0 ${total} ${total}`} className="mx-auto w-full max-w-sm">
      <rect width={total} height={total} rx={6} fill="#13120f" />

      {/* Front indicator */}
      <polygon
        points={`${total / 2 - 5},${offset - 8} ${total / 2 + 5},${offset - 8} ${total / 2},${offset - 14}`}
        fill="#60a5fa" opacity={0.6}
      />
      <text
        x={total / 2} y={offset - 16}
        textAnchor="middle" fill="#60a5fa" fontSize={8}
        fontFamily="ui-monospace, monospace"
      >
        FRONT
      </text>

      {/* AirframeIcon silhouette (ghost = no motor rings, wiring labels handle those) */}
      <g transform={`translate(${offset}, ${offset})`}>
        <AirframeIcon preset={preset} size={V} selected={false} ghost={true} />
      </g>

      {/* Motor default outputs -- clean overlay with coaxial offset */}
      {(() => {
        // Detect coaxial pairs (same x,y) and offset bottom motors
        const posKey = (m: typeof motors[0]) => `${m.x.toFixed(3)},${m.y.toFixed(3)}`;
        const posGroups = new Map<string, number[]>();
        motors.forEach((m, i) => {
          const k = posKey(m);
          if (!posGroups.has(k)) posGroups.set(k, []);
          posGroups.get(k)!.push(i);
        });
        const coaxialPx = 10;

        return motors.map((motor, idx) => {
          let mx = mapX(motor.x);
          let my = mapY(motor.y);

          const k = posKey(motor);
          const group = posGroups.get(k)!;
          const isBottom = group.length >= 2 && idx === group[1];
          if (isBottom) {
            const cx = total / 2;
            const cy = total / 2;
            const dx = mx - cx;
            const dy = my - cy;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            mx += (dx / dist) * coaxialPx;
            my += (dy / dist) * coaxialPx;
          }

          const color = motor.rotation === 'CCW' ? '#60a5fa' : '#f87171';

          return (
            <g key={`motor-${motor.number}`}>
              <circle cx={mx} cy={my} r={12} fill="#13120f" />
              <circle cx={mx} cy={my} r={10} fill="#201e1a" stroke={color} strokeWidth={1.2}
                strokeDasharray={isBottom ? '4,2' : 'none'} />
              <text
                x={mx} y={my + 1}
                textAnchor="middle" dominantBaseline="central"
                fill="#e2e8f0" fontSize={9} fontWeight={700}
                fontFamily="ui-monospace, monospace"
              >
                {motor.number}
              </text>
              <text
                x={mx} y={my + 16}
                textAnchor="middle"
                fill={color} fontSize={6} opacity={0.8}
                fontFamily="ui-monospace, monospace"
              >
                Out {motor.defaultOutput}
              </text>
            </g>
          );
        });
      })()}

      {/* Plane surface default outputs */}
      {preset.planeTemplate?.surfaces.map((surface) => {
        const sx = mapX(surface.diagramPos.x);
        const sy = mapY(surface.diagramPos.y);
        const isLeft = surface.diagramPos.x < -0.2;
        const isRight = surface.diagramPos.x > 0.2;
        const labelX = isLeft ? 8 : isRight ? total - 8 : total / 2;
        const anchor = isLeft ? 'start' : isRight ? 'end' : 'middle';

        return (
          <g key={surface.id}>
            <circle cx={sx} cy={sy} r={3} fill="#60a5fa" opacity={0.6} />
            <line
              x1={sx} y1={sy} x2={labelX} y2={sy}
              stroke="#60a5fa" strokeWidth={0.5} opacity={0.3}
            />
            <text
              x={labelX} y={sy + 3}
              textAnchor={anchor}
              fill="#60a5fa" fontSize={6.5} opacity={0.8}
              fontFamily="ui-monospace, monospace" fontWeight={600}
            >
              Out {surface.defaultOutput}: {surface.label}
            </text>
          </g>
        );
      })}

      {/* Forward motor default outputs */}
      {preset.motorTemplate.forwardMotors.map((fm) => {
        const fx = mapX(fm.diagramPos.x);
        const fy = mapY(fm.diagramPos.y);
        return (
          <g key={fm.id}>
            <circle cx={fx} cy={fy - 2} r={4} fill="none" stroke="#ffaa2a" strokeWidth={1} />
            <line
              x1={fx - 7} y1={fy - 2} x2={fx + 7} y2={fy - 2}
              stroke="#ffaa2a" strokeWidth={1} strokeLinecap="round"
            />
            <text
              x={fx + 12} y={fy}
              textAnchor="start"
              fill="#ffaa2a" fontSize={6.5} opacity={0.8}
              fontFamily="ui-monospace, monospace" fontWeight={600}
            >
              Out {fm.defaultOutput}: {fm.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Section wrapper with collapse ───────────────────────────────────────

function Section({
  title,
  number,
  enabled,
  defaultOpen = true,
  children,
}: {
  title: string;
  number: number;
  enabled: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`rounded border transition ${
      enabled ? 'border-border bg-surface-1' : 'border-border/50 bg-surface-1/50 opacity-50'
    }`}>
      <button
        onClick={() => enabled && setOpen(!open)}
        disabled={!enabled}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          enabled ? 'bg-accent/20 text-accent border border-accent/40' : 'bg-surface-2 text-subtle'
        }`}>
          {number}
        </div>
        <span className={`flex-1 text-lg font-bold ${enabled ? 'text-foreground' : 'text-subtle'}`}>
          {title}
        </span>
        {enabled && (
          open
            ? <ChevronDown size={18} className="text-subtle" />
            : <ChevronRight size={18} className="text-subtle" />
        )}
      </button>
      {enabled && open && (
        <div className="border-t border-border px-5 pb-5 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────

export function FrameWizard({
  onClose,
  onDirtyChange,
  onNavigate,
}: {
  onClose: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onNavigate?: (page: string) => void;
}) {
  const vehicleType = useVehicleStore((s) => s.type);
  const stageParams = useParameterStore((s) => s.stageParams);
  const detectedPreset = useDetectedPreset();

  const [categoryTab, setCategoryTab] = useState<CategoryTab>(
    vehicleType === 'copter' ? 'copter' : vehicleType === 'quadplane' ? 'vtol' : 'plane'
  );
  const [selectedPreset, setSelectedPreset] = useState<AirframePreset | null>(detectedPreset);
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());
  const [userModified, setUserModified] = useState(false);
  const [applied, setApplied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Copter category drill-down: null = show categories, string = show variants for that class
  const [copterCategory, setCopterCategory] = useState<string | null>(null);

  // Suppress unused warnings -- kept for future use
  void onClose;
  void onNavigate;
  void scrollRef;

  const handleSelectPreset = useCallback((p: AirframePreset) => {
    if (selectedPreset && selectedPreset.id !== p.id) {
      const confirmed = window.confirm(
        'Switching frames will reset your options. Continue?'
      );
      if (!confirmed) return;
    }
    setSelectedPreset(p);
    setUserModified(true);
    setApplied(false);
    setSelectedExtras(new Set());
  }, [selectedPreset]);

  const hasUnsavedWork = userModified && selectedPreset !== null && !applied;

  useEffect(() => {
    onDirtyChange?.(hasUnsavedWork);
  }, [hasUnsavedWork, onDirtyChange]);

  // ── Build default output mappings for Apply ────────────────────────

  const mappings = useMemo(() => {
    if (!selectedPreset) return [];

    const result: { functionId: number; output: number }[] = [];

    if (selectedPreset.planeTemplate) {
      for (const slot of selectedPreset.planeTemplate.surfaces) {
        result.push({ functionId: slot.function, output: slot.defaultOutput });
      }
    }

    for (const slot of selectedPreset.motorTemplate.forwardMotors) {
      result.push({ functionId: slot.function, output: slot.defaultOutput });
    }

    for (const motor of selectedPreset.motorTemplate.vtolMotors) {
      result.push({ functionId: motor.function, output: motor.defaultOutput });
    }

    for (const extraId of selectedExtras) {
      const extra = EXTRA_OPTIONS[extraId];
      if (!extra) continue;
      for (const slot of extra.slots) {
        result.push({ functionId: slot.function, output: slot.defaultOutput });
      }
    }

    return result;
  }, [selectedPreset, selectedExtras]);

  // ── Actions ────────────────────────────────────────────────────────

  const handleToggleExtra = useCallback((id: string) => {
    setSelectedExtras((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setUserModified(true);
    setApplied(false);
  }, []);

  const handleApply = useCallback(() => {
    if (!selectedPreset) return;

    // Build the full param set in one object, then stage atomically.
    // Using stageParams (not setParamLocal) so that values matching the FC
    // originals still get staged as dirty -- the user explicitly chose this config.
    const params: Record<string, number> = {};

    // Zero all servo functions first
    for (let i = 1; i <= 16; i++) {
      params[`SERVO${i}_FUNCTION`] = 0;
    }

    // Overlay the new mappings
    for (const m of mappings) {
      params[`SERVO${m.output}_FUNCTION`] = m.functionId;
    }

    // Frame-identifying params (FRAME_CLASS/TYPE for copters, Q_* for VTOLs)
    if (selectedPreset.additionalParams) {
      for (const [key, value] of Object.entries(selectedPreset.additionalParams)) {
        params[key] = value;
      }
    }

    stageParams(params);
    setApplied(true);
  }, [selectedPreset, mappings, stageParams]);

  const presets = AIRFRAME_PRESETS.filter((p) => p.category === categoryTab);
  const availableExtras = selectedPreset
    ? selectedPreset.availableExtras.map((id) => EXTRA_OPTIONS[id]).filter(Boolean)
    : [];

  // Group copter presets by FRAME_CLASS for category drill-down
  const copterCategories = useMemo(() => {
    if (categoryTab !== 'copter') return [];
    const groups = new Map<number, { name: string; presets: AirframePreset[] }>();
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
  }, [presets, categoryTab]);

  // Current copter variants (when drilled into a category)
  const activeCopterCat = useMemo(() => {
    if (!copterCategory) return null;
    return copterCategories.find(c => String(c.frameClass) === copterCategory) ?? null;
  }, [copterCategory, copterCategories]);

  const copterVariants = activeCopterCat?.presets ?? [];

  // ── Default output summary for wiring section ─────────────────────

  const defaultOutputSummary = useMemo(() => {
    if (!selectedPreset) return [];

    const items: { label: string; output: number; detail?: string }[] = [];

    for (const m of selectedPreset.motorTemplate.vtolMotors) {
      items.push({
        label: `Motor ${m.number}`,
        output: m.defaultOutput,
        detail: m.rotation,
      });
    }

    for (const fm of selectedPreset.motorTemplate.forwardMotors) {
      items.push({ label: fm.label, output: fm.defaultOutput });
    }

    if (selectedPreset.planeTemplate) {
      for (const s of selectedPreset.planeTemplate.surfaces) {
        items.push({ label: s.label, output: s.defaultOutput });
      }
    }

    return items;
  }, [selectedPreset]);

  // ── Main render ────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Frame</h1>
        <p className="text-sm text-muted">
          Select your airframe and configure options.
        </p>
      </div>

      {/* === Section 1: Frame Selection === */}
      <Section title="Airframe" number={1} enabled={true}>
        <div className="mb-4 flex gap-1 rounded bg-surface-0 p-1">
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
                  setCopterCategory(null);
                  if (selectedPreset && selectedPreset.category !== id) {
                    setSelectedPreset(null);
                    setApplied(false);
                  }
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                  categoryTab === id
                    ? 'bg-surface-1 text-foreground shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
        </div>

        {/* Copter: category drill-down */}
        {categoryTab === 'copter' && !copterCategory && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {copterCategories.map((cat) => {
              const isCurrent = detectedPreset && cat.presets.some(p => p.id === detectedPreset.id);
              const isSelectedInCat = selectedPreset && cat.presets.some(p => p.id === selectedPreset.id);
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
                    <span className={`absolute top-2 right-2 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      isSelectedInCat || !selectedPreset
                        ? 'bg-success-muted/60 border-success/30 text-success'
                        : 'bg-surface-2/60 border-border text-subtle'
                    }`}>
                      <Check size={10} />
                      Active
                    </span>
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

        {/* Copter: variant grid with pinned category card (Option B) */}
        {categoryTab === 'copter' && copterCategory && activeCopterCat && (
          <>
            {/* Pinned category card -- shows which frame class the user is inside */}
            <div className="mb-2 flex items-center gap-3 rounded border-2 border-accent bg-surface-0 px-4 py-3">
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

            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">
              Select variant
            </p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {copterVariants.map((p) => {
                const isSelected = selectedPreset?.id === p.id;
                const isCurrent = p.id === detectedPreset?.id;
                const showCurrentHighlight = isCurrent && !selectedPreset;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`group relative flex flex-col items-center gap-3 rounded border-2 p-5 text-center transition ${
                      isSelected
                        ? 'border-accent bg-accent/10'
                        : showCurrentHighlight
                          ? 'border-success/50 bg-success/5'
                          : 'border-border bg-surface-0 hover:border-accent/50 hover:bg-surface-2'
                    }`}
                  >
                    {isCurrent && (
                      <span className={`absolute top-2 right-2 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        isSelected || !selectedPreset
                          ? 'bg-success-muted/60 border-success/30 text-success'
                          : 'bg-surface-2/60 border-border text-subtle'
                      }`}>
                        <Check size={10} />
                        Active
                      </span>
                    )}
                    <AirframeIcon preset={p} size={120} selected={isSelected} />
                    <div>
                      <p className={`text-sm font-bold ${isSelected ? 'text-accent' : 'text-foreground'}`}>
                        {p.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted leading-snug">{p.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Plane / VTOL: flat grid (no drill-down) */}
        {categoryTab !== 'copter' && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {presets.map((p) => {
              const isSelected = selectedPreset?.id === p.id;
              const isCurrent = p.id === detectedPreset?.id;
              const showCurrentHighlight = isCurrent && !selectedPreset;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`group relative flex flex-col items-center gap-3 rounded border-2 p-5 text-center transition ${
                    isSelected
                      ? 'border-accent bg-accent/10'
                      : showCurrentHighlight
                        ? 'border-success/50 bg-success/5'
                        : 'border-border bg-surface-0 hover:border-accent/50 hover:bg-surface-2'
                  }`}
                >
                  {isCurrent && (
                    <span className={`absolute top-2 right-2 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      isSelected || !selectedPreset
                        ? 'bg-success-muted/60 border-success/30 text-success'
                        : 'bg-surface-2/60 border-border text-subtle'
                    }`}>
                      <Check size={10} />
                      Active
                    </span>
                  )}
                  <AirframeIcon preset={p} size={120} selected={isSelected} />
                  <div>
                    <p className={`text-sm font-bold ${isSelected ? 'text-accent' : 'text-foreground'}`}>
                      {p.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted leading-snug">{p.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {selectedPreset && (
          <div className="mt-4 rounded border border-accent/30 bg-accent/5 px-4 py-3">
            <p className="text-sm font-medium text-accent">{selectedPreset.name}</p>
            <p className="mt-0.5 text-xs text-muted">{selectedPreset.description}</p>
            <p className="mt-1 text-xs text-subtle">
              Surfaces: {selectedPreset.planeTemplate?.surfaces.length ?? 0} •{' '}
              Motors: {selectedPreset.motorTemplate.forwardMotors.length + selectedPreset.motorTemplate.vtolMotors.length} •{' '}
              Extras: {selectedPreset.availableExtras.length}
            </p>
          </div>
        )}
      </Section>

      {/* === Section 2: Options === */}
      <Section title="Options" number={2} enabled={selectedPreset !== null} defaultOpen={true}>
        {availableExtras.length === 0 ? (
          <p className="py-4 text-center text-sm text-subtle">
            No additional options for this airframe.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availableExtras.map((extra) => {
              const isOn = selectedExtras.has(extra.id);
              return (
                <button
                  key={extra.id}
                  onClick={() => handleToggleExtra(extra.id)}
                  className={`flex items-start gap-3 rounded border-2 px-4 py-3 text-left transition ${
                    isOn
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-surface-0 hover:border-accent/50'
                  }`}
                >
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                    isOn ? 'border-accent bg-accent text-white' : 'border-subtle'
                  }`}>
                    {isOn && <Check size={12} />}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isOn ? 'text-accent' : 'text-foreground'}`}>
                      {extra.label}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">{extra.description}</p>
                    <p className="mt-1 text-xs text-subtle">
                      Adds: {extra.slots.map((s) => s.label).join(', ')}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Section>

      {/* === Section 3: Suggested Wiring (read-only) === */}
      <Section title="Suggested Wiring" number={3} enabled={selectedPreset !== null} defaultOpen={true}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            {selectedPreset && <SuggestedWiringDiagram preset={selectedPreset} />}
          </div>

          <div>
            <p className="mb-3 text-sm text-muted">
              Default output mapping for this configuration.
              These will be applied when you click "Apply Frame Configuration" below.
            </p>

            <div className="space-y-1.5">
              {defaultOutputSummary.map((item) => (
                <div
                  key={`${item.label}-${item.output}`}
                  className="flex items-center justify-between rounded border border-border/50 bg-surface-0 px-3 py-2"
                >
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <div className="flex items-center gap-2">
                    {item.detail && (
                      <span className={`text-xs font-mono font-bold ${
                        item.detail === 'CCW' ? 'text-blue-400' : 'text-red-400'
                      }`}>
                        {item.detail}
                      </span>
                    )}
                    <span className="rounded bg-surface-2 px-2 py-0.5 font-mono text-xs font-bold text-muted">
                      Out {item.output}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Apply button -- visible only when user has unapplied changes */}
      {selectedPreset && userModified && !applied && (
        <div className="flex items-center justify-end gap-3 rounded border border-border bg-surface-1 px-5 py-4">
          <button onClick={handleApply} className="btn btn-primary gap-1.5 text-sm">
            <Save size={14} />
            Apply Frame Configuration
          </button>
        </div>
      )}

      {/* Applied confirmation */}
      {applied && (
        <div className="rounded border border-emerald-500/30 bg-emerald-500/5 px-5 py-4 text-center">
          <div className="flex items-center justify-center gap-2 text-emerald-400">
            <Check size={18} />
            <span className="font-semibold">Configuration applied</span>
          </div>
          <p className="mt-1 text-sm text-muted">
            Changes are staged locally. Click <strong>Save to FC</strong> in the footer to write them to the flight controller.
          </p>
        </div>
      )}
    </div>
  );
}
