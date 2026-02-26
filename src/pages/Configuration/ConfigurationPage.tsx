import { useState, useMemo } from 'react';
import {
  Battery, Cog, Compass, MapPin, Wind, Cpu,
  ChevronDown, ChevronRight,
} from 'lucide-react';
import { useParameterStore, getEffectiveValue } from '@/store/parameterStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { getConfigGroups, type ParamGroup, type ParamField } from '@/models/configGroups';

// Map icon names to components
const ICONS: Record<string, React.ElementType> = {
  Battery, Cog, Compass, MapPin, Wind, Cpu,
};

export function ConfigurationPage() {
  const vehicleType = useVehicleStore((s) => s.type);
  const groups = useMemo(() => getConfigGroups(vehicleType), [vehicleType]);

  return (
    <div className="w-full space-y-4">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Configuration</h1>
        <p className="mt-1 text-lg text-muted">
          Core flight controller settings grouped by function.
        </p>
      </div>

      {groups.map((group) => (
        <ConfigGroup key={group.id} group={group} />
      ))}
    </div>
  );
}

// --- Collapsible Group ---

function ConfigGroup({ group }: { group: ParamGroup }) {
  const [expanded, setExpanded] = useState(true);
  const Icon = ICONS[group.icon] || Cpu;

  return (
    <div className="card overflow-hidden">
      {/* Group header - clickable to collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors
          hover:bg-surface-2/50"
        style={{ background: expanded ? 'linear-gradient(90deg, rgba(245,158,11,0.08), transparent 60%)' : undefined }}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded bg-accent/15">
          <Icon size={22} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground">{group.title}</h2>
          <p className="text-[15px] text-muted">{group.description}</p>
        </div>
        {expanded ? (
          <ChevronDown size={20} className="text-muted" />
        ) : (
          <ChevronRight size={20} className="text-muted" />
        )}
      </button>

      {/* Fields */}
      {expanded && (
        <div className="border-t border-border">
          {group.fields.map((field) => (
            <ConfigField key={field.param} field={field} />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Individual Field ---

function ConfigField({ field }: { field: ParamField }) {
  const paramState = useParameterStore.getState();
  const setParamLocal = useParameterStore((s) => s.setParamLocal);

  // Subscribe to both parameters and dirtyParams so we re-render on changes
  useParameterStore((s) => s.parameters);
  useParameterStore((s) => s.dirtyParams);

  const currentValue = getEffectiveValue(paramState, field.param);
  const dirtyValue = paramState.dirtyParams.get(field.param);
  const isDirty = dirtyValue !== undefined;

  // Check visibility condition
  if (field.showWhen) {
    const conditionValue = getEffectiveValue(paramState, field.showWhen.param);
    if (conditionValue === undefined || conditionValue < field.showWhen.min) {
      return null;
    }
  }

  // If param doesn't exist on this FC, don't render
  if (currentValue === undefined) return null;

  const handleChange = (newValue: number) => {
    setParamLocal(field.param, newValue);
  };

  return (
    <div
      className={`flex items-center gap-4 px-6 py-4 border-b border-border last:border-b-0 transition-colors ${
        isDirty ? 'bg-warning/5 border-l-4 border-l-warning' : 'hover:bg-surface-0/50'
      }`}
    >
      {/* Label + description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-foreground">{field.label}</span>
          {isDirty && (
            <span className="h-2 w-2 rounded-full bg-warning shrink-0" />
          )}
        </div>
        {field.description && (
          <p className="text-[15px] text-muted truncate">{field.description}</p>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0">
        {field.type === 'select' && (
          <select
            value={Math.round(currentValue)}
            onChange={(e) => handleChange(Number(e.target.value))}
            className="input-field w-64"
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
            {/* Show raw value if not in options */}
            {field.options &&
              !field.options.some((o) => o.value === Math.round(currentValue)) && (
                <option value={Math.round(currentValue)}>
                  Unknown ({Math.round(currentValue)})
                </option>
              )}
          </select>
        )}

        {field.type === 'number' && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={formatNumber(currentValue, field.step)}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) handleChange(val);
              }}
              min={field.min}
              max={field.max}
              step={field.step}
              className="input-field w-32 text-right font-mono tabular-nums"
            />
            {field.unit && (
              <span className="text-[15px] text-subtle w-10">{field.unit}</span>
            )}
          </div>
        )}

        {field.type === 'toggle' && (
          <button
            onClick={() => handleChange(currentValue >= 1 ? 0 : 1)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              currentValue >= 1 ? 'bg-accent' : 'bg-surface-3'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                currentValue >= 1 ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        )}
      </div>

      {/* Param name (small, for reference) */}
      <span className="hidden xl:block w-36 shrink-0 text-right font-mono text-base text-muted">
        {field.param}
      </span>
    </div>
  );
}

// --- Helpers ---

function formatNumber(value: number, step?: number): string {
  if (step && step < 1) {
    // Count decimal places in step
    const decimals = Math.max(1, -Math.floor(Math.log10(step)));
    return value.toFixed(decimals);
  }
  if (Number.isInteger(value)) return value.toString();
  return value.toFixed(2);
}
