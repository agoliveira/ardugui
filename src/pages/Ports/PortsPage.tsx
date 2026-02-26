/**
 * Ports Page -- Serial port configuration with board-aware physical labels.
 *
 * When a board with uartPorts is detected, the page shows physical pad labels
 * (e.g. "TX2/RX2") instead of raw SERIAL numbers, with:
 *   - Suggested use hints per port
 *   - Automatic quirk detection and one-click application
 *   - Wiring notes and reboot warnings
 *   - Unsupported protocol warnings
 *
 * Falls back to generic SERIAL view for unknown boards.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Cable,
  Usb,
  Radio,
  Satellite,
  Info,
  AlertTriangle,
  Wrench,
  RotateCcw,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useParameterStore, getEffectiveValue } from '@/store/parameterStore';
import { useVehicleStore } from '@/store/vehicleStore';
import {
  SERIAL_PROTOCOLS,
  SERIAL_BAUD_RATES,
} from '@/models/serialPorts';
import {
  getBoardById,
  getProtocolQuirks,
  getUnsupportedReason,
  type BoardDef,
  type BoardUartPort,
} from '@/models/boardRegistry';

// ── Protocol color coding ────────────────────────────────────────────────

function protocolColor(value: number): string {
  if (value === -1) return 'text-subtle bg-surface-2';
  if (value === 1 || value === 2) return 'text-accent bg-accent/10';
  if (value === 5) return 'text-warning bg-warning/10';
  if (value === 23) return 'text-success bg-success/10';
  if ([3, 4, 10].includes(value)) return 'text-info bg-info/10';
  return 'text-foreground bg-surface-2';
}

function protocolCategoryIcon(value: number) {
  if (value === -1) return <Cable size={14} className="text-subtle" />;
  if (value === 1 || value === 2) return <Radio size={14} className="text-accent" />;
  if (value === 5) return <Satellite size={14} className="text-warning" />;
  if (value === 23) return <Zap size={14} className="text-success" />;
  return <Cable size={14} className="text-muted" />;
}

function getProtocolLabel(value: number): string {
  return SERIAL_PROTOCOLS.find((p) => p.value === value)?.label ?? `Unknown (${value})`;
}

// ── Generic port entry (fallback when no board UART data) ────────────────

interface GenericPort {
  serialIndex: number;
  label: string;
}

// ── Main Component ───────────────────────────────────────────────────────

export function PortsPage() {
  const boardId = useVehicleStore((s) => s.boardId);
  const board = boardId ? getBoardById(boardId) : null;
  const hasUartPorts = !!(board?.uartPorts && board.uartPorts.length > 0);

  // Subscribe to param changes
  const parameters = useParameterStore((s) => s.parameters);
  useParameterStore((s) => s.dirtyParams);

  // Build the port list
  const uartPorts = useMemo(() => {
    if (!hasUartPorts) return null;
    return board!.uartPorts!.filter((p) =>
      parameters.has(`SERIAL${p.serialIndex}_PROTOCOL`)
    );
  }, [board, hasUartPorts, parameters]);

  const genericPorts = useMemo(() => {
    if (hasUartPorts) return null;
    const result: GenericPort[] = [];
    for (let i = 0; i <= 9; i++) {
      if (parameters.has(`SERIAL${i}_PROTOCOL`)) {
        result.push({ serialIndex: i, label: `SERIAL${i}` });
      }
    }
    return result;
  }, [hasUartPorts, parameters]);

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Serial Ports</h1>
        <p className="mt-1 text-lg text-muted">
          Configure what protocol runs on each serial port.
          {board && (
            <span className="ml-1 text-accent">
              Board: {board.name}
            </span>
          )}
        </p>
      </div>

      {/* Board-aware info banner */}
      {hasUartPorts ? (
        <div className="flex items-start gap-3 rounded border border-accent/30 bg-accent/5 px-4 py-3">
          <Info size={14} className="mt-0.5 shrink-0 text-accent" />
          <p className="text-base text-muted leading-relaxed">
            Port labels match the physical pads on your <strong>{board!.name}</strong>.
            ArduPilot's SERIAL numbering does not match the pad numbers -- the correct
            mapping is handled automatically. Click <ChevronDown size={11} className="inline -mt-0.5" /> on
            any port for details and auto-configuration.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded border border-border bg-surface-0 px-4 py-3">
          <Info size={14} className="mt-0.5 shrink-0 text-accent" />
          <p className="text-base text-muted leading-relaxed">
            {board
              ? `Board "${board.name}" detected but no detailed port mapping available yet. Showing raw SERIAL parameters.`
              : 'Board not identified. Showing raw SERIAL parameters -- pad labels may not match your hardware.'}
            {' '}Changes take effect after a reboot.
          </p>
        </div>
      )}

      {/* Port table */}
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[180px_1fr_180px_50px] gap-4 border-b border-border bg-surface-0 px-5 py-2.5">
          <span className="text-[13px] font-semibold uppercase tracking-wider text-subtle">
            {hasUartPorts ? 'Port' : 'Serial'}
          </span>
          <span className="text-[13px] font-semibold uppercase tracking-wider text-subtle">Protocol</span>
          <span className="text-[13px] font-semibold uppercase tracking-wider text-subtle">Baud Rate</span>
          <span />
        </div>

        {/* Port rows */}
        {uartPorts
          ? uartPorts.map((port) => (
              <SmartPortRow
                key={port.serialIndex}
                serialIndex={port.serialIndex}
                uartPort={port}
                board={board!}
              />
            ))
          : genericPorts?.map((port) => (
              <SmartPortRow
                key={port.serialIndex}
                serialIndex={port.serialIndex}
              />
            ))}

        {!uartPorts && (!genericPorts || genericPorts.length === 0) && (
          <div className="px-5 py-8 text-center text-base text-muted">
            Connect to a flight controller to see serial port configuration.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Smart Port Row ───────────────────────────────────────────────────────

interface SmartPortRowProps {
  serialIndex: number;
  uartPort?: BoardUartPort;
  board?: BoardDef;
}

function SmartPortRow({ serialIndex, uartPort, board }: SmartPortRowProps) {
  const [expanded, setExpanded] = useState(false);
  const setParamLocal = useParameterStore((s) => s.setParamLocal);

  // Subscribe to changes
  const parameters = useParameterStore((s) => s.parameters);
  const dirtyParams = useParameterStore((s) => s.dirtyParams);

  const protocolParam = `SERIAL${serialIndex}_PROTOCOL`;
  const baudParam = `SERIAL${serialIndex}_BAUD`;

  const protocolValue = getEffectiveValue(useParameterStore.getState(), protocolParam);
  const baudValue = getEffectiveValue(useParameterStore.getState(), baudParam);

  const protocolDirty = dirtyParams.has(protocolParam);
  const baudDirty = dirtyParams.has(baudParam);
  const isDirty = protocolDirty || baudDirty;

  const protocol = protocolValue !== undefined ? Math.round(protocolValue) : -1;
  const baud = baudValue !== undefined ? Math.round(baudValue) : 115;

  const isDisabled = protocol === -1;
  const isUsb = serialIndex === 0;

  // Check for quirks and unsupported protocols
  const quirk = board ? getProtocolQuirks(board, serialIndex, protocol) : null;
  const unsupportedReason = board ? getUnsupportedReason(board, serialIndex, protocol) : null;

  // Check if quirk params are already correctly set
  const quirkStatus = useMemo(() => {
    if (!quirk) return null;
    const missing: string[] = [];
    for (const [param, value] of Object.entries(quirk.params)) {
      const current = getEffectiveValue(useParameterStore.getState(), param);
      if (current === undefined || Math.round(current) !== value) {
        missing.push(param);
      }
    }
    return { missing, allApplied: missing.length === 0 };
  }, [quirk, parameters, dirtyParams]);

  // Apply all quirk params in one click
  const applyQuirk = useCallback(() => {
    if (!quirk) return;
    for (const [param, value] of Object.entries(quirk.params)) {
      setParamLocal(param, value);
    }
  }, [quirk, setParamLocal]);

  // Check alt config requirement
  const altConfigNeeded = useMemo(() => {
    if (!uartPort?.requiresAltConfig) return false;
    const { param, value } = uartPort.requiresAltConfig;
    const current = getEffectiveValue(useParameterStore.getState(), param);
    return current === undefined || Math.round(current) !== value;
  }, [uartPort, parameters, dirtyParams]);

  // Port label
  const portLabel = uartPort?.padLabel ?? `SERIAL${serialIndex}`;
  const portSubLabel = uartPort
    ? `SERIAL${serialIndex} · ${uartPort.uartName}`
    : undefined;

  return (
    <div
      className={`border-b border-border last:border-b-0 transition-colors ${
        isDirty ? 'bg-warning/5' : ''
      }`}
    >
      {/* Main row */}
      <div className="grid grid-cols-[180px_1fr_180px_50px] gap-4 items-center px-5 py-3">
        {/* Port label */}
        <div className="flex items-center gap-2.5">
          {isUsb ? (
            <Usb size={14} className="text-accent" />
          ) : (
            protocolCategoryIcon(protocol)
          )}
          <div>
            <div className="text-base font-semibold text-foreground">{portLabel}</div>
            {portSubLabel && (
              <div className="text-base text-muted">{portSubLabel}</div>
            )}
          </div>
        </div>

        {/* Protocol dropdown + badges */}
        <div className="flex items-center gap-2">
          <select
            value={protocol}
            onChange={(e) => setParamLocal(protocolParam, Number(e.target.value))}
            className={`input-field flex-1 text-sm ${protocolDirty ? 'border-warning/50' : ''}`}
          >
            {SERIAL_PROTOCOLS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
            {!SERIAL_PROTOCOLS.some((p) => p.value === protocol) && (
              <option value={protocol}>Unknown ({protocol})</option>
            )}
          </select>

          {/* Unsupported warning */}
          {unsupportedReason && (
            <div
              className="flex items-center gap-1 rounded bg-danger/10 px-1.5 py-0.5 text-[13px] font-medium text-danger"
              title={unsupportedReason}
            >
              <AlertTriangle size={10} />
              N/A
            </div>
          )}

          {/* Quirk auto-fix button */}
          {quirk && quirkStatus && !quirkStatus.allApplied && (
            <button
              onClick={applyQuirk}
              className="flex items-center gap-1 rounded bg-accent/10 px-2 py-1 text-[13px] font-semibold text-accent hover:bg-accent/20 transition-colors"
              title={`Apply required settings: ${quirkStatus.missing.join(', ')}`}
            >
              <Wrench size={10} />
              Auto-fix
            </button>
          )}

          {/* Quirk OK badge */}
          {quirk && quirkStatus?.allApplied && (
            <div className="flex items-center gap-1 rounded bg-success/10 px-1.5 py-0.5 text-[13px] font-medium text-success">
              ✓ OK
            </div>
          )}
        </div>

        {/* Baud rate */}
        <div>
          <select
            value={baud}
            onChange={(e) => setParamLocal(baudParam, Number(e.target.value))}
            disabled={isDisabled}
            className={`input-field w-full text-sm ${
              isDisabled ? 'opacity-40' : ''
            } ${baudDirty ? 'border-warning/50' : ''}`}
          >
            {SERIAL_BAUD_RATES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
            {!SERIAL_BAUD_RATES.some((b) => b.value === baud) && (
              <option value={baud}>Custom ({baud})</option>
            )}
          </select>
        </div>

        {/* Status / expand toggle */}
        <div className="flex items-center justify-end gap-1.5">
          {isDirty && (
            <span className="h-1.5 w-1.5 rounded-full bg-warning" title="Modified" />
          )}
          {isUsb && (
            <span
              className={`rounded px-1.5 py-0.5 text-[13px] font-semibold uppercase ${protocolColor(protocol)}`}
            >
              LIVE
            </span>
          )}
          {uartPort && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="rounded p-0.5 text-subtle hover:bg-surface-1 hover:text-muted"
              title="Port details"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded detail panel */}
      {expanded && uartPort && (
        <PortDetails
          uartPort={uartPort}
          protocol={protocol}
          quirk={quirk}
          quirkStatus={quirkStatus}
          altConfigNeeded={altConfigNeeded}
          applyQuirk={applyQuirk}
        />
      )}
    </div>
  );
}

// ── Port Details Panel ───────────────────────────────────────────────────

interface PortDetailsProps {
  uartPort: BoardUartPort;
  protocol: number;
  quirk: ReturnType<typeof getProtocolQuirks>;
  quirkStatus: { missing: string[]; allApplied: boolean } | null;
  altConfigNeeded: boolean;
  applyQuirk: () => void;
}

function PortDetails({
  uartPort,
  protocol,
  quirk,
  quirkStatus,
  altConfigNeeded,
  applyQuirk,
}: PortDetailsProps) {
  const paramState = useParameterStore.getState();

  return (
    <div className="border-t border-border/50 bg-surface-0 px-5 py-3 space-y-2.5">
      {/* Suggested use */}
      {uartPort.suggestedUse && (
        <div className="flex items-center gap-2 text-[13px] text-muted">
          <Info size={11} className="text-accent shrink-0" />
          <span>
            <strong>Suggested:</strong> {uartPort.suggestedUse}
          </span>
        </div>
      )}

      {/* Port capabilities */}
      <div className="flex items-center gap-4 text-base text-muted">
        <span>TX: {uartPort.hasTx ? '✓' : '✗'}</span>
        <span>RX: {uartPort.hasRx ? '✓' : '✗'}</span>
        {uartPort.rxDma !== undefined && (
          <span>RX DMA: {uartPort.rxDma ? '✓ (high-speed OK)' : '✗'}</span>
        )}
      </div>

      {/* Alt config warning */}
      {altConfigNeeded && uartPort.requiresAltConfig && (
        <div className="flex items-start gap-2 rounded bg-warning/10 px-3 py-2 text-[13px]">
          <AlertTriangle size={12} className="mt-0.5 shrink-0 text-warning" />
          <div className="text-muted">
            <strong className="text-warning">Alt Config Required: </strong>
            This port is currently in "{uartPort.requiresAltConfig.defaultMode}" mode.
            Set{' '}
            <code className="rounded bg-surface-2 px-1 font-mono text-[13px]">
              {uartPort.requiresAltConfig.param}={uartPort.requiresAltConfig.value}
            </code>{' '}
            to enable full UART mode. Click "Auto-fix" to apply this automatically.
          </div>
        </div>
      )}

      {/* Quirk details */}
      {quirk && (
        <div className="rounded border border-border bg-surface-1 px-3 py-2 space-y-2">
          <div className="text-[13px] font-medium text-foreground">
            {getProtocolLabel(protocol)} on {uartPort.padLabel}:
          </div>
          <p className="text-[13px] text-muted">{quirk.description}</p>

          {/* Param status indicators */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(quirk.params).map(([param, value]) => {
              const current = getEffectiveValue(paramState, param);
              const isOk = current !== undefined && Math.round(current) === value;
              return (
                <span
                  key={param}
                  className={`rounded px-2 py-0.5 font-mono text-[13px] ${
                    isOk
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  }`}
                >
                  {param}={value} {isOk ? '✓' : '✗'}
                </span>
              );
            })}
          </div>

          {/* Auto-fix button (in detail panel too) */}
          {quirkStatus && !quirkStatus.allApplied && (
            <button
              onClick={applyQuirk}
              className="flex items-center gap-1.5 rounded bg-accent px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-accent/90 transition-colors"
            >
              <Wrench size={11} />
              Apply All Required Settings
            </button>
          )}

          {/* Wiring note */}
          {quirk.wiringNote && (
            <div className="flex items-start gap-1.5 text-[13px] text-warning">
              <Zap size={11} className="mt-0.5 shrink-0" />
              <span>{quirk.wiringNote}</span>
            </div>
          )}

          {/* Reboot warning */}
          {quirk.needsReboot && (
            <div className="flex items-center gap-1.5 text-[13px] text-accent">
              <RotateCcw size={11} className="shrink-0" />
              Reboot required after saving these changes
            </div>
          )}
        </div>
      )}
    </div>
  );
}
