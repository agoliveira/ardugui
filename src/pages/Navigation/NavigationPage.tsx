import { useState, useMemo } from 'react';
import {
  Home,
  Route,
  Circle,
  ArrowDown,
  Gauge,
  ArrowRightLeft,
  Navigation,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useParameterStore, getEffectiveValue } from '@/store/parameterStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { getNavigationGroups } from '@/models/navigationGroups';
import type { ParamGroup, ParamField } from '@/models/configGroups';

const ICONS: Record<string, React.ElementType> = {
  Home,
  Route,
  Circle,
  ArrowDown,
  Gauge,
  ArrowRightLeft,
};

export function NavigationPage() {
  const vehicleType = useVehicleStore((s) => s.type);
  const groups = useMemo(() => getNavigationGroups(vehicleType), [vehicleType]);

  return (
    <div className="w-full space-y-4">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Navigation</h1>
        <p className="mt-1 text-lg text-muted">
          {vehicleType === 'copter'
            ? 'RTL altitude, waypoint speeds, loiter behavior, and landing settings.'
            : 'RTL altitude, waypoint tracking, airspeed limits, and auto-landing.'}
        </p>
      </div>

      {groups.map((group) => (
        <NavGroup key={group.id} group={group} />
      ))}
    </div>
  );
}

// ─── Collapsible Group ───────────────────────────────────────────────────────

function NavGroup({ group }: { group: ParamGroup }) {
  const [expanded, setExpanded] = useState(true);
  const Icon = ICONS[group.icon] || Navigation;

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-surface-2/50"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
          <Icon size={24} className="text-accent" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">{group.title}</h2>
          <p className="text-base text-muted">{group.description}</p>
        </div>
        {expanded ? (
          <ChevronDown size={16} className="text-muted" />
        ) : (
          <ChevronRight size={16} className="text-muted" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border">
          {group.fields.map((field) => (
            <NavField key={field.param} field={field} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Individual Field ────────────────────────────────────────────────────────

function NavField({ field }: { field: ParamField }) {
  const paramState = useParameterStore.getState();
  const setParamLocal = useParameterStore((s) => s.setParamLocal);

  useParameterStore((s) => s.parameters);
  useParameterStore((s) => s.dirtyParams);

  const currentValue = getEffectiveValue(paramState, field.param);
  const dirtyValue = paramState.dirtyParams.get(field.param);
  const isDirty = dirtyValue !== undefined;

  // Conditional visibility
  if (field.showWhen) {
    const conditionValue = getEffectiveValue(paramState, field.showWhen.param);
    if (conditionValue === undefined || conditionValue < field.showWhen.min) {
      return null;
    }
  }

  if (currentValue === undefined) return null;

  const handleChange = (newValue: number) => {
    setParamLocal(field.param, newValue);
  };

  return (
    <div
      className={`flex items-center gap-4 px-6 py-3.5 border-b border-border last:border-b-0 transition-colors ${
        isDirty ? 'bg-warning/5' : 'hover:bg-surface-0'
      }`}
    >
      {/* Label + description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base text-foreground">{field.label}</span>
          {isDirty && (
            <span className="h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
          )}
        </div>
        {field.description && (
          <p className="text-base text-muted truncate">{field.description}</p>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0">
        {field.type === 'select' && (
          <select
            value={Math.round(currentValue)}
            onChange={(e) => handleChange(Number(e.target.value))}
            className="input-field w-56 text-sm"
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
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

      {/* Param name */}
      <span className="hidden xl:block w-36 shrink-0 text-right font-mono text-base text-muted">
        {field.param}
      </span>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNumber(value: number, step?: number): string {
  if (step && step < 1) {
    const decimals = Math.max(1, -Math.floor(Math.log10(step)));
    return value.toFixed(decimals);
  }
  if (Number.isInteger(value)) return value.toString();
  return value.toFixed(2);
}
