import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, LineChart, SlidersHorizontal, Filter } from 'lucide-react';
import { useParameterStore, getEffectiveValue } from '@/store/parameterStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { getPidSections, type PidSection, type PidParam, type PidAxis } from '@/models/pidTuningGroups';

export function PIDTuningPage() {
  const vehicleType = useVehicleStore((s) => s.type);
  const sections = useMemo(() => getPidSections(vehicleType), [vehicleType]);

  const sectionIcon = (id: string) => {
    if (id.includes('filter')) return Filter;
    if (id.includes('stabilize') || id.includes('l1') || id.includes('tecs') || id.includes('yaw')) return SlidersHorizontal;
    return LineChart;
  };

  return (
    <div className="w-full space-y-4">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">PID Tuning</h1>
        <p className="mt-1 text-lg text-muted">
          {vehicleType === 'copter'
            ? 'Rate and angle controller gains. Adjust carefully -- small changes have big effects.'
            : 'Attitude, TECS, and navigation controller gains.'}
        </p>
      </div>

      {sections.map((section) => (
        <PidSectionCard key={section.id} section={section} Icon={sectionIcon(section.id)} />
      ))}
    </div>
  );
}

// ─── Section Card ────────────────────────────────────────────────────────────

function PidSectionCard({ section, Icon }: { section: PidSection; Icon: React.ElementType }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-surface-2/50"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded bg-accent/10">
          <Icon size={24} className="text-accent" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
          <p className="text-base text-muted">{section.description}</p>
        </div>
        {expanded ? (
          <ChevronDown size={16} className="text-muted" />
        ) : (
          <ChevronRight size={16} className="text-muted" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border">
          {section.axes ? (
            <PidGrid axes={section.axes} />
          ) : section.params ? (
            <PidParamList params={section.params} />
          ) : null}
        </div>
      )}
    </div>
  );
}

// ─── Grid Layout (axes as columns) ──────────────────────────────────────────

function PidGrid({ axes }: { axes: PidAxis[] }) {
  // Get union of all param labels across axes (rows)
  const rowLabels = useMemo(() => {
    const seen = new Set<string>();
    const labels: { label: string; description?: string }[] = [];
    for (const axis of axes) {
      for (const p of axis.params) {
        if (!seen.has(p.label)) {
          seen.add(p.label);
          labels.push({ label: p.label, description: p.description });
        }
      }
    }
    return labels;
  }, [axes]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-5 py-2.5 text-left text-[13px] font-semibold uppercase tracking-wider text-subtle">
              Gain
            </th>
            {axes.map((axis) => (
              <th
                key={axis.title}
                className="px-4 py-2.5 text-center text-[13px] font-semibold uppercase tracking-wider text-subtle"
              >
                {axis.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowLabels.map((row) => (
            <PidGridRow key={row.label} label={row.label} description={row.description} axes={axes} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PidGridRow({
  label,
  description,
  axes,
}: {
  label: string;
  description?: string;
  axes: PidAxis[];
}) {
  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-surface-0 transition-colors">
      <td className="px-5 py-2.5">
        <span className="text-base text-foreground">{label}</span>
        {description && (
          <p className="text-base text-muted">{description}</p>
        )}
      </td>
      {axes.map((axis) => {
        const param = axis.params.find((p) => p.label === label);
        return (
          <td key={axis.title} className="px-4 py-2.5 text-center">
            {param ? <PidInput param={param} /> : <span className="text-subtle">-</span>}
          </td>
        );
      })}
    </tr>
  );
}

// ─── Simple Param List (for filters / non-grid sections) ────────────────────

function PidParamList({ params }: { params: PidParam[] }) {
  return (
    <div>
      {params.map((param) => (
        <PidParamRow key={param.param} param={param} />
      ))}
    </div>
  );
}

function PidParamRow({ param }: { param: PidParam }) {
  const paramState = useParameterStore.getState();
  const setParamLocal = useParameterStore((s) => s.setParamLocal);

  useParameterStore((s) => s.parameters);
  useParameterStore((s) => s.dirtyParams);

  const currentValue = getEffectiveValue(paramState, param.param);
  const isDirty = paramState.dirtyParams.has(param.param);

  if (currentValue === undefined) return null;

  return (
    <div
      className={`flex items-center gap-4 px-6 py-3.5 border-b border-border last:border-b-0 transition-colors ${
        isDirty ? 'bg-warning/5' : 'hover:bg-surface-0'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base text-foreground">{param.label}</span>
          {isDirty && <span className="h-1.5 w-1.5 rounded-full bg-warning shrink-0" />}
        </div>
        {param.description && (
          <p className="text-base text-muted">{param.description}</p>
        )}
      </div>
      <div className="shrink-0">
        <input
          type="number"
          value={formatPidValue(currentValue, param.step)}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val)) setParamLocal(param.param, val);
          }}
          min={param.min}
          max={param.max}
          step={param.step}
          className="input-field w-32 text-right font-mono tabular-nums"
        />
      </div>
      <span className="hidden xl:block w-40 shrink-0 text-right font-mono text-base text-muted">
        {param.param}
      </span>
    </div>
  );
}

// ─── Shared PID Input (used in grid cells) ──────────────────────────────────

function PidInput({ param }: { param: PidParam }) {
  const paramState = useParameterStore.getState();
  const setParamLocal = useParameterStore((s) => s.setParamLocal);

  useParameterStore((s) => s.parameters);
  useParameterStore((s) => s.dirtyParams);

  const currentValue = getEffectiveValue(paramState, param.param);
  const isDirty = paramState.dirtyParams.has(param.param);

  if (currentValue === undefined) {
    return <span className="text-subtle text-[13px]">N/A</span>;
  }

  return (
    <div className="relative inline-flex items-center">
      {isDirty && (
        <span className="absolute -left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-warning" />
      )}
      <input
        type="number"
        value={formatPidValue(currentValue, param.step)}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          if (!isNaN(val)) setParamLocal(param.param, val);
        }}
        min={param.min}
        max={param.max}
        step={param.step}
        className={`input-field w-28 text-center font-mono tabular-nums ${
          isDirty ? 'border-warning/50' : ''
        }`}
      />
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPidValue(value: number, step: number): string {
  if (step < 0.001) return value.toFixed(4);
  if (step < 0.01) return value.toFixed(3);
  if (step < 0.1) return value.toFixed(2);
  if (step < 1) return value.toFixed(1);
  return value.toString();
}
