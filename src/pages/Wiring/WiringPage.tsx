/**
 * WiringPage.tsx -- Board-aware wiring assistant.
 *
 * Shows a connection diagram with the FC in the center and peripherals
 * (GPS, receiver, telemetry, ESC, battery) arranged around it.
 * Each connection shows the physical pad label, ArduPilot SERIAL number,
 * and configured protocol. Generated entirely from board data + params.
 *
 * Also shows a text-based wiring summary for quick reference.
 */

import { useMemo } from 'react';
import {
  Satellite,
  Radio,
  Cable,
  Zap,
  Battery,
  Wifi,
  Monitor,
  Usb,
  Info,
  CircleDot,
  HardDrive,
} from 'lucide-react';
import { useParameterStore, getEffectiveValue } from '@/store/parameterStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { getBoardById, type BoardDef, type BoardUartPort } from '@/models/boardRegistry';
import { SERIAL_PROTOCOLS } from '@/models/serialPorts';

/* ------------------------------------------------------------------ */
/*  Protocol to peripheral mapping                                     */
/* ------------------------------------------------------------------ */

interface Peripheral {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  color: string;        // Tailwind text color
  bgColor: string;      // Tailwind bg color for the node
  borderColor: string;  // Tailwind border color
}

const PROTOCOL_PERIPHERALS: Record<number, Peripheral> = {
  1:  { id: 'mavlink1', label: 'MAVLink 1', shortLabel: 'MAVLink', icon: Wifi, color: 'text-blue-400', bgColor: 'bg-blue-900/30', borderColor: 'border-blue-500/40' },
  2:  { id: 'mavlink2', label: 'MAVLink 2', shortLabel: 'MAVLink', icon: Wifi, color: 'text-blue-400', bgColor: 'bg-blue-900/30', borderColor: 'border-blue-500/40' },
  5:  { id: 'gps', label: 'GPS Module', shortLabel: 'GPS', icon: Satellite, color: 'text-amber-400', bgColor: 'bg-amber-900/30', borderColor: 'border-amber-500/40' },
  10: { id: 'frsky', label: 'FrSky Telemetry', shortLabel: 'FrSky', icon: Radio, color: 'text-cyan-400', bgColor: 'bg-cyan-900/30', borderColor: 'border-cyan-500/40' },
  16: { id: 'esc_telem', label: 'ESC Telemetry', shortLabel: 'ESC Telem', icon: Zap, color: 'text-green-400', bgColor: 'bg-green-900/30', borderColor: 'border-green-500/40' },
  23: { id: 'rcin', label: 'RC Receiver', shortLabel: 'Receiver', icon: Radio, color: 'text-emerald-400', bgColor: 'bg-emerald-900/30', borderColor: 'border-emerald-500/40' },
  28: { id: 'lidar', label: 'Rangefinder', shortLabel: 'Lidar', icon: CircleDot, color: 'text-purple-400', bgColor: 'bg-purple-900/30', borderColor: 'border-purple-500/40' },
  30: { id: 'dshot_telem', label: 'DShot Telemetry', shortLabel: 'DShot', icon: Zap, color: 'text-green-400', bgColor: 'bg-green-900/30', borderColor: 'border-green-500/40' },
  36: { id: 'displayport', label: 'DisplayPort OSD', shortLabel: 'OSD', icon: Monitor, color: 'text-pink-400', bgColor: 'bg-pink-900/30', borderColor: 'border-pink-500/40' },
};

const DEFAULT_PERIPHERAL: Peripheral = {
  id: 'other', label: 'Other', shortLabel: 'Other',
  icon: Cable, color: 'text-muted', bgColor: 'bg-surface-1', borderColor: 'border-border',
};

const USB_PERIPHERAL: Peripheral = {
  id: 'usb', label: 'USB / Computer', shortLabel: 'USB',
  icon: Usb, color: 'text-accent', bgColor: 'bg-accent/10', borderColor: 'border-accent/40',
};

const DISABLED_PERIPHERAL: Peripheral = {
  id: 'disabled', label: 'Not Configured', shortLabel: 'Available',
  icon: Cable, color: 'text-subtle', bgColor: 'bg-surface-0', borderColor: 'border-border/50',
};

function getPeripheral(protocol: number, isUsb: boolean): Peripheral {
  if (isUsb) return USB_PERIPHERAL;
  if (protocol === -1 || protocol === 0) return DISABLED_PERIPHERAL;
  return PROTOCOL_PERIPHERALS[protocol] ?? DEFAULT_PERIPHERAL;
}

function getProtocolLabel(value: number): string {
  if (value === -1) return 'Disabled';
  return SERIAL_PROTOCOLS.find((p) => p.value === value)?.label ?? `Protocol ${value}`;
}

/* ------------------------------------------------------------------ */
/*  Connection data model                                              */
/* ------------------------------------------------------------------ */

interface PortConnection {
  serialIndex: number;
  padLabel: string;
  protocol: number;
  protocolLabel: string;
  peripheral: Peripheral;
  isUsb: boolean;
  isDirty: boolean;
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function WiringPage() {
  const boardId = useVehicleStore((s) => s.boardId);
  const board = boardId ? getBoardById(boardId) : null;
  const parameters = useParameterStore((s) => s.parameters);
  const dirtyParams = useParameterStore((s) => s.dirtyParams);
  const paramState = useParameterStore.getState();

  // Build connection list from board ports + params
  const connections = useMemo((): PortConnection[] => {
    if (!board?.uartPorts) return [];

    return board.uartPorts.map((port) => {
      const protocolParam = `SERIAL${port.serialIndex}_PROTOCOL`;
      const protocol = getEffectiveValue(paramState, protocolParam) ?? port.defaultProtocol ?? -1;
      const isUsb = port.padLabel === 'USB' || port.padLabel === 'USB2';
      const isDirty = dirtyParams.has(protocolParam);

      return {
        serialIndex: port.serialIndex,
        padLabel: port.padLabel,
        protocol,
        protocolLabel: getProtocolLabel(protocol),
        peripheral: getPeripheral(protocol, isUsb),
        isUsb,
        isDirty,
      };
    });
  }, [board, parameters, dirtyParams, paramState]);

  // Separate active (configured) from available (disabled/-1)
  const activeConnections = connections.filter(c => c.peripheral.id !== 'disabled');
  const availablePorts = connections.filter(c => c.peripheral.id === 'disabled');

  // Fallback: no board or no port data
  if (!board?.uartPorts || board.uartPorts.length === 0) {
    return (
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Wiring Guide</h1>
          <p className="mt-1 text-lg text-muted">
            Connect your flight controller and the wiring diagram will populate
            based on your board and configuration.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded border border-border bg-surface-0 px-4 py-3">
          <Info size={14} className="mt-0.5 shrink-0 text-accent" />
          <p className="text-sm text-muted">
            {board
              ? `Board "${board.name}" detected but no port mapping available.`
              : 'No board detected. Connect a flight controller to see wiring information.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">

      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Wiring Guide</h1>
        <p className="mt-1 text-lg text-muted">
          Connection diagram for your <span className="text-accent font-semibold">{board.name}</span>.
          Each line shows which physical pad to use for each peripheral.
        </p>
      </div>

      {/* ── CONNECTION DIAGRAM ─────────────────────────────────────── */}

      <div className="card p-6">
        <div className="flex flex-col items-center gap-0">

          {/* Active connections -- radial layout around FC */}
          <div className="relative w-full" style={{ minHeight: Math.max(320, activeConnections.length * 52) }}>

            {/* FC box -- center */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="flex flex-col items-center gap-1 rounded-lg border-2 border-accent/60 bg-surface-1 px-5 py-3">
                <HardDrive size={20} className="text-accent" />
                <span className="text-xs font-bold text-accent">{board.name}</span>
              </div>
            </div>

            {/* Connection entries */}
            {activeConnections.map((conn, idx) => {
              const total = activeConnections.length;
              const isLeft = idx < Math.ceil(total / 2);
              const sideIdx = isLeft ? idx : idx - Math.ceil(total / 2);
              const sideTotal = isLeft ? Math.ceil(total / 2) : total - Math.ceil(total / 2);
              const yPct = sideTotal <= 1 ? 50 : 15 + (sideIdx / (sideTotal - 1)) * 70;

              const Icon = conn.peripheral.icon;

              return (
                <div
                  key={conn.serialIndex}
                  className="absolute flex items-center gap-0"
                  style={{
                    top: `${yPct}%`,
                    left: isLeft ? 0 : undefined,
                    right: isLeft ? undefined : 0,
                    transform: 'translateY(-50%)',
                    width: '42%',
                  }}
                >
                  {isLeft ? (
                    <>
                      {/* Peripheral node */}
                      <div className={`flex items-center gap-2 rounded-lg border ${conn.peripheral.borderColor} ${conn.peripheral.bgColor} px-3 py-2 shrink-0`}>
                        <Icon size={14} className={conn.peripheral.color} />
                        <span className={`text-xs font-semibold ${conn.peripheral.color}`}>
                          {conn.peripheral.shortLabel}
                        </span>
                      </div>
                      {/* Connection line */}
                      <div className="flex-1 flex items-center">
                        <div className={`flex-1 h-px ${conn.isUsb ? 'bg-accent/40' : 'bg-border'}`} />
                        <div className="shrink-0 rounded bg-surface-2 px-2 py-0.5 text-[10px] font-mono text-foreground border border-border">
                          {conn.padLabel}
                        </div>
                        <div className={`w-3 h-px ${conn.isUsb ? 'bg-accent/40' : 'bg-border'}`} />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Connection line */}
                      <div className="flex-1 flex items-center">
                        <div className={`w-3 h-px ${conn.isUsb ? 'bg-accent/40' : 'bg-border'}`} />
                        <div className="shrink-0 rounded bg-surface-2 px-2 py-0.5 text-[10px] font-mono text-foreground border border-border">
                          {conn.padLabel}
                        </div>
                        <div className={`flex-1 h-px ${conn.isUsb ? 'bg-accent/40' : 'bg-border'}`} />
                      </div>
                      {/* Peripheral node */}
                      <div className={`flex items-center gap-2 rounded-lg border ${conn.peripheral.borderColor} ${conn.peripheral.bgColor} px-3 py-2 shrink-0`}>
                        <Icon size={14} className={conn.peripheral.color} />
                        <span className={`text-xs font-semibold ${conn.peripheral.color}`}>
                          {conn.peripheral.shortLabel}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── TEXT SUMMARY ───────────────────────────────────────────── */}

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <Cable size={16} className="text-accent" />
            <h3 className="text-sm font-bold text-foreground">Port Assignments</h3>
          </div>
          <span className="text-[10px] text-subtle">Configure protocols in the Ports page</span>
        </div>
        <div className="grid grid-cols-2 gap-px bg-border">
          {connections.map((conn) => {
            const Icon = conn.peripheral.icon;
            return (
              <div key={conn.serialIndex} className="flex items-center gap-3 bg-surface-0 px-4 py-2">
                <span className="text-sm font-mono font-bold text-foreground w-16 shrink-0">{conn.padLabel}</span>
                <span className="text-[10px] text-subtle w-12 shrink-0">SERIAL{conn.serialIndex}</span>
                <Icon size={12} className={conn.peripheral.color} />
                <span className={`text-xs truncate ${conn.peripheral.id === 'disabled' ? 'text-subtle' : 'text-foreground'}`}>
                  {conn.protocolLabel}
                </span>
                {conn.isDirty && (
                  <span className="text-[9px] text-warning font-bold ml-auto shrink-0">CHANGED</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── AVAILABLE PORTS ────────────────────────────────────────── */}

      {availablePorts.length > 0 && (
        <div className="flex items-start gap-3 rounded border border-border bg-surface-0 px-4 py-3">
          <Info size={14} className="mt-0.5 shrink-0 text-blue-400" />
          <div>
            <p className="text-sm text-blue-300/90 font-medium">
              {availablePorts.length} port{availablePorts.length !== 1 ? 's' : ''} available
            </p>
            <p className="text-xs text-muted mt-0.5">
              {availablePorts.map(p => p.padLabel).join(', ')} -- configure in the Ports page.
            </p>
          </div>
        </div>
      )}

      {/* ── WIRING TIPS ────────────────────────────────────────────── */}

      <div className="flex items-start gap-2 rounded border border-border bg-surface-0 px-4 py-2.5">
        <Info size={13} className="mt-0.5 shrink-0 text-muted" />
        <p className="text-xs text-muted">
          Connect TX to RX and RX to TX between the FC and each peripheral (crossover wiring).
          GPS modules typically need both TX and RX. Receivers using SBUS/CRSF only need
          one signal wire. Check your board's documentation for voltage levels (3.3V vs 5V pads).
        </p>
      </div>
    </div>
  );
}
