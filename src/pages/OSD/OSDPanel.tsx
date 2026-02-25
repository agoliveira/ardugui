import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { OsdElement, OsdCategory } from '@/models/osdElements';
import { CATEGORY_INFO, groupByCategory } from '@/models/osdElements';
import type { OsdElementPlacement } from '@/models/osdPresets';

// ─── Types ───────────────────────────────────────────────────────────────────

interface EnabledElement extends OsdElementPlacement {
  element: OsdElement;
}

interface OSDPanelProps {
  availableElements: OsdElement[];
  enabledElements: EnabledElement[];
  selectedId: string | null;
  onToggle: (id: string, enabled: boolean) => void;
  onSelect: (id: string | null) => void;
}

// ─── Category section ────────────────────────────────────────────────────────

function CategorySection({
  category,
  elements,
  enabledIds,
  selectedId,
  collapsed,
  onToggleCollapse,
  onToggle,
  onSelect,
  enabledMap,
}: {
  category: OsdCategory;
  elements: OsdElement[];
  enabledIds: Set<string>;
  selectedId: string | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onToggle: (id: string, enabled: boolean) => void;
  onSelect: (id: string | null) => void;
  enabledMap: Map<string, EnabledElement>;
}) {
  const info = CATEGORY_INFO[category];
  const enabledCount = elements.filter((el) => enabledIds.has(el.id)).length;
  const Chevron = collapsed ? ChevronRight : ChevronDown;

  return (
    <div className="mb-1">
      {/* Category header -- clickable to collapse */}
      <button
        onClick={onToggleCollapse}
        className="flex items-center gap-2 w-full px-2 py-2 text-[13px] font-bold uppercase tracking-wider rounded transition-colors hover:bg-white/5"
        style={{ color: 'var(--color-muted)' }}
      >
        <Chevron size={12} style={{ color: 'var(--color-subtle)' }} />
        <span>{info.icon}</span>
        <span>{info.label}</span>
        <span
          className="ml-auto text-xs font-normal"
          style={{ color: 'var(--color-muted)' }}
        >
          {enabledCount}/{elements.length}
        </span>
      </button>

      {/* Element list -- hidden when collapsed */}
      {!collapsed && (
        <div className="flex flex-col gap-0.5 ml-1">
          {elements.map((el) => {
            const isEnabled = enabledIds.has(el.id);
            const isSelected = el.id === selectedId;
            const placement = enabledMap.get(el.id);

            return (
              <div
                key={el.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors"
                style={{
                  backgroundColor: isSelected
                    ? 'rgba(0, 180, 255, 0.12)'
                    : 'transparent',
                  borderLeft: isSelected
                    ? '2px solid var(--color-accent)'
                    : '2px solid transparent',
                }}
                onClick={() => {
                  if (isEnabled) {
                    onSelect(isSelected ? null : el.id);
                  }
                }}
                title={el.description}
              >
                {/* Enable toggle */}
                <label
                  className="flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => onToggle(el.id, e.target.checked)}
                    className="w-3.5 h-3.5 rounded"
                    style={{ accentColor: 'var(--color-accent)' }}
                  />
                </label>

                {/* Element info */}
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-semibold truncate"
                    style={{
                      color: isEnabled
                        ? 'var(--color-foreground)'
                        : 'var(--color-muted)',
                    }}
                  >
                    {el.label}
                  </div>
                  <div
                    className="text-sm truncate"
                    style={{
                      color: 'var(--color-muted)',
                      fontSize: '10px',
                    }}
                  >
                    {el.description}
                  </div>
                </div>

                {/* Position */}
                {isEnabled && placement && (
                  <div
                    className="text-sm font-mono shrink-0"
                    style={{
                      color: 'var(--color-muted)',
                      fontSize: '10px',
                    }}
                  >
                    {placement.x},{placement.y}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Panel ──────────────────────────────────────────────────────────────

export function OSDPanel({
  availableElements,
  enabledElements,
  selectedId,
  onToggle,
  onSelect,
}: OSDPanelProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<OsdCategory>>(
    new Set()
  );

  const grouped = useMemo(
    () => groupByCategory(availableElements),
    [availableElements]
  );

  const enabledIds = useMemo(
    () => new Set(enabledElements.map((el) => el.id)),
    [enabledElements]
  );

  const enabledMap = useMemo(
    () => new Map(enabledElements.map((el) => [el.id, el])),
    [enabledElements]
  );

  const toggleCollapse = (cat: OsdCategory) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  const categories: OsdCategory[] = [
    'battery',
    'speed',
    'navigation',
    'attitude',
    'system',
    'link',
    'advanced',
  ];

  return (
    <div className="flex flex-col h-full">
      <div
        className="px-3 py-2.5 text-sm font-bold border-b"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-foreground)',
        }}
      >
        Elements
        <span
          className="ml-2 font-normal"
          style={{ color: 'var(--color-muted)' }}
        >
          {enabledElements.length} active
        </span>
      </div>

      <div
        className="flex-1 overflow-y-auto px-1 py-2"
        style={{ scrollbarWidth: 'thin' }}
      >
        {categories.map((cat) => {
          const catElements = grouped.get(cat);
          if (!catElements || catElements.length === 0) return null;
          return (
            <CategorySection
              key={cat}
              category={cat}
              elements={catElements}
              enabledIds={enabledIds}
              selectedId={selectedId}
              collapsed={collapsedCategories.has(cat)}
              onToggleCollapse={() => toggleCollapse(cat)}
              onToggle={onToggle}
              onSelect={onSelect}
              enabledMap={enabledMap}
            />
          );
        })}
      </div>
    </div>
  );
}
