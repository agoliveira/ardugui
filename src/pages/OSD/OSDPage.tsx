import { useState, useMemo, useCallback } from 'react';
import {
  Monitor,
  Eye,
  EyeOff,
  LayoutGrid,
  Wand2,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import { useVehicleStore } from '@/store/vehicleStore';
import { useParameterStore, getEffectiveValue } from '@/store/parameterStore';
import {
  OSD_ELEMENTS,
  getElementsForVehicle,
  getOsdParamNames,
} from '@/models/osdElements';
import type { OsdElement } from '@/models/osdElements';
import {
  RESOLUTIONS,
  getPresetsForVehicle,
  scalePosition,
} from '@/models/osdPresets';
import type {
  OsdResolution,
  OsdElementPlacement,
  OsdPreset,
} from '@/models/osdPresets';
import { OSDCanvas } from './OSDCanvas';
import { OSDPanel } from './OSDPanel';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ScreenState {
  enabled: boolean;
  label: string;
  elements: OsdElementPlacement[];
}

interface CanvasElement extends OsdElementPlacement {
  element: OsdElement;
}

// ─── Module-level state (persists across tab switches) ──────────────────────

let savedResolution: OsdResolution = 'hd50';
let savedScreens: [ScreenState, ScreenState, ScreenState, ScreenState] | null = null;
let savedActiveScreen = 0;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const elementMap = new Map(OSD_ELEMENTS.map((el) => [el.id, el]));

function getDefaultScreens(): [ScreenState, ScreenState, ScreenState, ScreenState] {
  return [
    { enabled: true, label: 'Screen 1', elements: [] },
    { enabled: false, label: 'Screen 2', elements: [] },
    { enabled: false, label: 'Screen 3', elements: [] },
    { enabled: false, label: 'Screen 4', elements: [] },
  ];
}

function loadFromParams(
  getEffective: (name: string) => number | undefined
): [ScreenState, ScreenState, ScreenState, ScreenState] {
  const screens = getDefaultScreens();

  for (let screenIdx = 0; screenIdx < 4; screenIdx++) {
    const screenNum = screenIdx + 1;
    const placements: OsdElementPlacement[] = [];

    for (const el of OSD_ELEMENTS) {
      const paramNames = getOsdParamNames(screenNum, el.id);
      const en = getEffective(paramNames.enable);
      if (en !== undefined && en > 0) {
        // Clamp positions to maximum OSD grid bounds (HD60: 60×22).
        // Prevents garbage values from firmware migration (e.g. INAV → ArduPilot).
        const rawX = getEffective(paramNames.x) ?? el.defaultX;
        const rawY = getEffective(paramNames.y) ?? el.defaultY;
        const x = Math.max(0, Math.min(59, rawX));
        const y = Math.max(0, Math.min(21, rawY));
        placements.push({ id: el.id, x, y });
      }
    }

    if (placements.length > 0) {
      screens[screenIdx].enabled = true;
      screens[screenIdx].elements = placements;
    }
  }

  return screens;
}

/** Write screen state to dirty params.
 *  Only writes params that exist on the FC to avoid phantom dirty entries. */
function writeToParams(
  screens: ScreenState[],
  setDirty: (name: string, value: number) => void
) {
  const fcParams = useParameterStore.getState().parameters;

  for (let screenIdx = 0; screenIdx < 4; screenIdx++) {
    const screenNum = screenIdx + 1;
    const screen = screens[screenIdx];
    const enabledIds = new Set(screen.elements.map((p) => p.id));

    for (const el of OSD_ELEMENTS) {
      const paramNames = getOsdParamNames(screenNum, el.id);

      // Only dirty params that actually exist on this FC
      if (!fcParams.has(paramNames.enable)) continue;

      const placement = screen.elements.find((p) => p.id === el.id);

      if (enabledIds.has(el.id) && placement) {
        setDirty(paramNames.enable, 1);
        if (fcParams.has(paramNames.x)) setDirty(paramNames.x, placement.x);
        if (fcParams.has(paramNames.y)) setDirty(paramNames.y, placement.y);
      } else {
        setDirty(paramNames.enable, 0);
      }
    }
  }
}

// ─── Shared dropdown styles ──────────────────────────────────────────────────

const selectStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface-0)',
  borderColor: 'var(--color-border)',
  color: 'var(--color-foreground)',
};

// ─── Main Page Component ─────────────────────────────────────────────────────

export function OSDPage() {
  const vehicleType = useVehicleStore((s) => s.type);
  const setParamLocal = useParameterStore((s) => s.setParamLocal);

  // ─── State ────────────────────────────────────────────────────────────

  const [resolution, setResolution] = useState<OsdResolution>(savedResolution);
  const [activeScreen, setActiveScreenLocal] = useState(savedActiveScreen);
  const [screens, setScreensLocal] = useState<
    [ScreenState, ScreenState, ScreenState, ScreenState]
  >(() => {
    if (savedScreens) return savedScreens;
    const state = useParameterStore.getState();
    return loadFromParams((name) => getEffectiveValue(state, name));
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAllElements, setShowAllElements] = useState(false);
  const [showBackground, setShowBackground] = useState(true);
  const [presetOpen, setPresetOpen] = useState(false);

  // Wrap setters to sync to module-level for persistence across tab switches
  const setScreens = useCallback(
    (
      value:
        | [ScreenState, ScreenState, ScreenState, ScreenState]
        | ((prev: [ScreenState, ScreenState, ScreenState, ScreenState]) => [ScreenState, ScreenState, ScreenState, ScreenState])
    ) => {
      setScreensLocal((prev) => {
        const next = typeof value === 'function' ? value(prev) : value;
        savedScreens = next;
        return next;
      });
    },
    []
  );

  const setActiveScreen = useCallback((idx: number) => {
    savedActiveScreen = idx;
    setActiveScreenLocal(idx);
  }, []);

  const currentScreen = screens[activeScreen];
  const res = RESOLUTIONS[resolution];

  // Sync resolution to module-level for persistence across tab switches
  const handleResolutionChange = useCallback((r: OsdResolution) => {
    savedResolution = r;
    setResolution(r);
  }, []);

  // ─── Derived data ─────────────────────────────────────────────────────

  const availableElements = useMemo(
    () => getElementsForVehicle(vehicleType, showAllElements),
    [vehicleType, showAllElements]
  );

  /** How many elements are hidden by the vehicle filter */
  const hiddenCount = useMemo(() => {
    const allCount = OSD_ELEMENTS.length;
    const filteredCount = getElementsForVehicle(vehicleType, false).length;
    return allCount - filteredCount;
  }, [vehicleType]);

  /** OSD_TYPE value: 0=None, 1=MAX7456, 2=MSP, 3=MSP DisplayPort, 4=SITL */
  const fcParams = useParameterStore((s) => s.parameters);
  const osdType = useMemo(() => {
    return getEffectiveValue(useParameterStore.getState(), 'OSD_TYPE') ?? 0;
  }, [fcParams]);

  const presets = useMemo(
    () => getPresetsForVehicle(vehicleType),
    [vehicleType]
  );

  const canvasElements: CanvasElement[] = useMemo(() => {
    return currentScreen.elements
      .map((p) => {
        const el = elementMap.get(p.id);
        if (!el) return null;
        return { ...p, element: el };
      })
      .filter((e): e is CanvasElement => e !== null);
  }, [currentScreen.elements]);

  const enabledElements = useMemo(() => canvasElements, [canvasElements]);

  // ─── Handlers ─────────────────────────────────────────────────────────

  const updateScreen = useCallback(
    (updater: (screen: ScreenState) => ScreenState) => {
      setScreens((prev) => {
        const next = [...prev] as [ScreenState, ScreenState, ScreenState, ScreenState];
        next[activeScreen] = updater(next[activeScreen]);
        writeToParams(next, setParamLocal);
        return next;
      });
    },
    [activeScreen, setParamLocal]
  );

  const handleToggleElement = useCallback(
    (id: string, enabled: boolean) => {
      updateScreen((screen) => {
        if (enabled) {
          const el = elementMap.get(id);
          if (!el) return screen;
          return {
            ...screen,
            elements: [
              ...screen.elements,
              { id, x: el.defaultX, y: el.defaultY },
            ],
          };
        } else {
          return {
            ...screen,
            elements: screen.elements.filter((p) => p.id !== id),
          };
        }
      });
      if (!enabled && selectedId === id) {
        setSelectedId(null);
      }
    },
    [updateScreen, selectedId]
  );

  const handleMoveElement = useCallback(
    (id: string, x: number, y: number) => {
      updateScreen((screen) => ({
        ...screen,
        elements: screen.elements.map((p) =>
          p.id === id ? { ...p, x, y } : p
        ),
      }));
    },
    [updateScreen]
  );

  const handleApplyPreset = useCallback(
    (preset: OsdPreset) => {
      const targetRes = { cols: res.cols, rows: res.rows };
      const newScreens = preset.screens.map((ps) => ({
        enabled: ps.enabled,
        label: ps.label,
        elements: ps.elements.map((el) => {
          if (
            preset.targetGrid.cols === targetRes.cols &&
            preset.targetGrid.rows === targetRes.rows
          ) {
            return el;
          }
          const elDef = elementMap.get(el.id);
          const charWidth = elDef?.charWidth ?? 1;
          const scaled = scalePosition(el.x, el.y, preset.targetGrid, targetRes, charWidth);
          return { ...el, x: scaled.x, y: scaled.y };
        }),
      })) as [ScreenState, ScreenState, ScreenState, ScreenState];

      setScreens(newScreens);
      writeToParams(newScreens, setParamLocal);
      setPresetOpen(false);
      setActiveScreen(0);
      setSelectedId(null);
    },
    [res.cols, res.rows, setParamLocal]
  );

  const handleResetScreen = useCallback(() => {
    updateScreen((screen) => ({ ...screen, elements: [] }));
    setSelectedId(null);
  }, [updateScreen]);

  const handleToggleScreenEnabled = useCallback(
    (idx: number) => {
      setScreens((prev) => {
        const next = [...prev] as [ScreenState, ScreenState, ScreenState, ScreenState];
        next[idx] = { ...next[idx], enabled: !next[idx].enabled };
        writeToParams(next, setParamLocal);
        return next;
      });
    },
    [setParamLocal]
  );

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Case 2: OSD disabled -- show activation prompt ── */}
      {osdType === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div
            className="rounded-xl border p-8 text-center"
            style={{
              backgroundColor: 'var(--color-surface-1)',
              borderColor: 'var(--color-border)',
              maxWidth: 440,
            }}
          >
            <Monitor size={40} className="mx-auto mb-4" style={{ color: 'var(--color-muted)' }} />
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--color-foreground)' }}>
              OSD is not enabled
            </h2>
            <p className="text-sm mb-5" style={{ color: 'var(--color-muted)' }}>
              Your flight controller supports OSD but it is currently disabled.
              Select your OSD hardware type to enable the on-screen display.
            </p>

            <div className="flex flex-col gap-3 items-center">
              <select
                className="w-64 text-sm rounded-md border px-3 py-2"
                style={selectStyle}
                defaultValue=""
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (val > 0) {
                    setParamLocal('OSD_TYPE', val);
                  }
                }}
              >
                <option value="" disabled>Select OSD type…</option>
                <option value="1">Analog (MAX7456)</option>
                <option value="2">MSP (DJI FPV System v1/v2)</option>
                <option value="3">MSP DisplayPort (DJI O3, Walksnail, HDZero)</option>
              </select>

              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                After selecting, save to FC and the OSD editor will appear.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Case 3: OSD enabled -- toolbar + editor ── */}
      {osdType > 0 && (
        <>
      {/* ── Toolbar ── */}
      <div
        className="flex items-center gap-3 px-4 py-2 border-b shrink-0 flex-wrap"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface-1)',
        }}
      >
        {/* Resolution */}
        <div className="flex items-center gap-1.5">
          <Monitor size={14} style={{ color: 'var(--color-subtle)' }} />
          <select
            value={resolution}
            onChange={(e) => handleResolutionChange(e.target.value as OsdResolution)}
            className="text-sm px-2.5 py-1.5 rounded border"
            style={selectStyle}
          >
            {Object.entries(RESOLUTIONS).map(([key, r]) => (
              <option key={key} value={key}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div
          className="w-px h-5"
          style={{ backgroundColor: 'var(--color-border)' }}
        />

        {/* Screen tabs */}
        <div className="flex items-center gap-1">
          {screens.map((screen, idx) => (
            <button
              key={idx}
              onClick={() => setActiveScreen(idx)}
              onDoubleClick={() => handleToggleScreenEnabled(idx)}
              className="px-2.5 py-1.5 text-sm rounded transition-colors"
              style={{
                backgroundColor:
                  idx === activeScreen
                    ? 'var(--color-accent)'
                    : 'transparent',
                color:
                  idx === activeScreen
                    ? '#fff'
                    : screen.enabled
                    ? 'var(--color-foreground)'
                    : 'var(--color-subtle)',
                opacity: screen.enabled ? 1 : 0.5,
              }}
              title={`${screen.label}${screen.enabled ? '' : ' (disabled)'} -- double-click to toggle`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        <div
          className="w-px h-5"
          style={{ backgroundColor: 'var(--color-border)' }}
        />

        {/* Toggle buttons */}
        <button
          onClick={() => setShowBackground(!showBackground)}
          className="flex items-center gap-1 px-2 py-1.5 text-sm rounded transition-colors"
          style={{
            backgroundColor: showBackground
              ? 'rgba(255,255,255,0.08)'
              : 'transparent',
            color: 'var(--color-muted)',
          }}
          title={showBackground ? 'Hide FPV background' : 'Show FPV background'}
        >
          {showBackground ? <Eye size={13} /> : <EyeOff size={13} />}
          <span>BG</span>
        </button>

        <button
          onClick={() => setShowAllElements(!showAllElements)}
          className="flex items-center gap-1 px-2 py-1.5 text-sm rounded transition-colors"
          style={{
            backgroundColor: showAllElements
              ? 'rgba(255,255,255,0.08)'
              : 'transparent',
            color: hiddenCount > 0 ? 'var(--color-muted)' : 'var(--color-subtle)',
            cursor: hiddenCount > 0 ? 'pointer' : 'default',
            opacity: hiddenCount > 0 ? 1 : 0.5,
          }}
          disabled={hiddenCount === 0}
          title={
            hiddenCount === 0
              ? 'All elements are already visible for this vehicle type'
              : showAllElements
              ? `Hide ${hiddenCount} elements from other vehicle types`
              : `Show ${hiddenCount} hidden elements from other vehicle types`
          }
        >
          <LayoutGrid size={13} />
          <span>All{hiddenCount > 0 ? ` (+${hiddenCount})` : ''}</span>
        </button>

        <div className="flex-1" />

        {/* Preset dropdown */}
        <div className="relative">
          <button
            onClick={() => setPresetOpen(!presetOpen)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors"
            style={{
              backgroundColor: 'var(--color-surface-0)',
              borderColor: 'var(--color-accent)',
              color: 'var(--color-accent)',
            }}
          >
            <Wand2 size={13} />
            <span>Presets</span>
            <ChevronDown
              size={12}
              style={{
                transform: presetOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s',
              }}
            />
          </button>

          {presetOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-72 rounded-lg border shadow-xl z-50 overflow-hidden"
              style={{
                backgroundColor: 'var(--color-surface-1)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div
                className="px-3 py-2.5 text-sm font-bold border-b"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-muted)',
                  backgroundColor: 'var(--color-surface-0)',
                }}
              >
                Apply a preset layout
              </div>
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className="w-full text-left px-3 py-2.5 transition-colors border-b last:border-b-0"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-surface-1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface-1)';
                  }}
                >
                  <div
                    className="text-sm font-semibold"
                    style={{ color: 'var(--color-foreground)' }}
                  >
                    {preset.name}
                  </div>
                  <div
                    className="text-sm mt-0.5"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset */}
        <button
          onClick={handleResetScreen}
          className="flex items-center gap-1 px-2 py-2 text-sm rounded transition-colors"
          style={{ color: 'var(--color-subtle)' }}
          title="Clear all elements from this screen"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {/* ── Main split: Canvas + Panel ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area -- flex column so canvas container fills available height */}
        <div
          className="flex-1 flex flex-col p-4 overflow-hidden"
          style={{ minWidth: 0 }}
        >
          {currentScreen.enabled ? (
            <>
              <div className="flex-1 min-h-0">
                <OSDCanvas
                  resolution={resolution}
                  elements={canvasElements}
                  selectedId={selectedId}
                  showBackground={showBackground}
                  onSelect={setSelectedId}
                  onMove={handleMoveElement}
                />
              </div>

              {/* Position info for selected element */}
              {selectedId && (
                <div
                  className="mt-2 flex items-center gap-4 px-3 py-1.5 rounded text-xs shrink-0"
                  style={{
                    backgroundColor: 'rgba(0, 180, 255, 0.08)',
                    color: 'var(--color-muted)',
                  }}
                >
                  <span className="font-medium" style={{ color: 'var(--color-accent)' }}>
                    {elementMap.get(selectedId)?.label ?? selectedId}
                  </span>
                  {(() => {
                    const p = currentScreen.elements.find((e) => e.id === selectedId);
                    if (!p) return null;
                    return (
                      <>
                        <span>
                          Position: <span className="font-mono">{p.x}, {p.y}</span>
                        </span>
                        <span>
                          Size: <span className="font-mono">{elementMap.get(selectedId)?.charWidth ?? '?'} chars</span>
                        </span>
                        <span style={{ color: 'var(--color-muted)' }}>
                          Drag to move · Click canvas to deselect
                        </span>
                      </>
                    );
                  })()}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div
                  className="text-sm mb-2"
                  style={{ color: 'var(--color-muted)' }}
                >
                  Screen {activeScreen + 1} is disabled
                </div>
                <button
                  onClick={() => handleToggleScreenEnabled(activeScreen)}
                  className="btn btn-primary text-sm"
                >
                  Enable Screen
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Element panel */}
        <div
          className="w-72 shrink-0 border-l overflow-hidden"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface-1)',
          }}
        >
          <OSDPanel
            availableElements={availableElements}
            enabledElements={enabledElements}
            selectedId={selectedId}
            onToggle={handleToggleElement}
            onSelect={setSelectedId}
          />
        </div>
      </div>
        </>
      )}

      {/* Click-outside to close preset dropdown */}
      {presetOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setPresetOpen(false)}
        />
      )}
    </div>
  );
}
