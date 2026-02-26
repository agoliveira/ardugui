import { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Plug, Unplug, AlertCircle, Loader2,
  Box, Activity, Database, Shield, Cpu, Hash,
} from 'lucide-react';
import { useConnectionStore } from '@/store/connectionStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { useParameterStore } from '@/store/parameterStore';
import { connectionManager } from '@/mavlink/connection';
import { detectBoard, getBoardById } from '@/models/boardRegistry';
import { BoardDiagram } from '@/components/BoardDiagram';
import type { PortInfo } from '@/store/connectionStore';

const BAUD_RATES = [9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];

export function SetupPage() {
  const status = useConnectionStore((s) => s.status);
  const portPath = useConnectionStore((s) => s.portPath);
  const baudRate = useConnectionStore((s) => s.baudRate);
  const availablePorts = useConnectionStore((s) => s.availablePorts);
  const error = useConnectionStore((s) => s.error);
  const progress = useConnectionStore((s) => s.paramLoadProgress);
  const setPortPath = useConnectionStore((s) => s.setPortPath);
  const setBaudRate = useConnectionStore((s) => s.setBaudRate);
  const setAvailablePorts = useConnectionStore((s) => s.setAvailablePorts);

  const vehicleType = useVehicleStore((s) => s.type);
  const firmwareType = useVehicleStore((s) => s.firmwareType);
  const firmwareVersion = useVehicleStore((s) => s.firmwareVersion);
  const armed = useVehicleStore((s) => s.armed);
  const boardId = useVehicleStore((s) => s.boardId);
  const paramCount = useParameterStore((s) => s.parameters.size);

  const [scanning, setScanning] = useState(false);

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting' || status === 'identifying' || status === 'loading';
  const detectedBoard = boardId ? getBoardById(boardId) : null;

  const scanPorts = useCallback(async () => {
    setScanning(true);
    try {
      if (window.electronAPI) {
        const ports = await window.electronAPI.serial.listPorts();
        const portList: PortInfo[] = ports.map((p) => ({
          path: p.path, manufacturer: p.manufacturer, serialNumber: p.serialNumber,
          vendorId: p.vendorId, productId: p.productId, pnpId: p.pnpId,
        }));
        setAvailablePorts(portList);
        if (!portPath && portList.length > 0) setPortPath(portList[0].path);
      } else {
        const mockPorts: PortInfo[] = [
          { path: '/dev/ttyACM0', manufacturer: '3D Robotics' },
          { path: '/dev/ttyUSB0', manufacturer: 'Silicon Labs' },
        ];
        setAvailablePorts(mockPorts);
        if (!portPath) setPortPath(mockPorts[0].path);
      }
    } catch (err) { console.error('Port scan failed:', err); }
    finally { setScanning(false); }
  }, [portPath, setAvailablePorts, setPortPath]);

  useEffect(() => { scanPorts(); }, [scanPorts]);

  const handleConnect = async () => {
    if (!portPath) return;
    const selectedPort = availablePorts.find((p) => p.path === portPath);
    console.log('Selected port info:', JSON.stringify(selectedPort));
    if (selectedPort) {
      const board = detectBoard(selectedPort.vendorId, selectedPort.productId, selectedPort.manufacturer, selectedPort.pnpId);
      console.log('Detected board:', board?.id || 'none');
      useVehicleStore.getState().setBoardId(board?.id || null);
    }
    await connectionManager.connect(portPath, baudRate);
  };

  const handleDisconnect = async () => { await connectionManager.disconnect(); };

  // ── DISCONNECTED STATE ──────────────────────────────────────────────────
  if (!isConnected && !isConnecting) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Connect</h1>
          <p className="mt-1 text-lg text-muted">
            Plug in your flight controller via USB and select the serial port below.
          </p>
        </div>

        {/* Connection form -- single card, horizontal layout */}
        <div className="card">
          <div className="section-header">Serial Connection</div>
          <div className="p-6">
            <div className="flex items-end gap-4 flex-wrap">
              {/* Port */}
              <div className="flex-1 min-w-[300px]">
                <label className="mb-2 block text-[15px] font-bold text-muted">Serial Port</label>
                <div className="flex gap-3">
                  <select value={portPath || ''} onChange={(e) => setPortPath(e.target.value || null)}
                    className="input-field flex-1">
                    <option value="">Select a port…</option>
                    {availablePorts.map((port) => (
                      <option key={port.path} value={port.path}>
                        {port.path}{port.manufacturer ? ` -- ${port.manufacturer}` : ''}
                      </option>
                    ))}
                  </select>
                  <button onClick={scanPorts} disabled={scanning}
                    className="btn btn-ghost h-[46px] w-[46px] p-0" title="Refresh ports">
                    <RefreshCw size={18} className={scanning ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {/* Baud */}
              <div>
                <label className="mb-2 block text-[15px] font-bold text-muted">Baud Rate</label>
                <select value={baudRate} onChange={(e) => setBaudRate(Number(e.target.value))}
                  className="input-field w-48">
                  {BAUD_RATES.map((r) => <option key={r} value={r}>{r.toLocaleString()}</option>)}
                </select>
              </div>

              {/* Connect button */}
              <button onClick={handleConnect} disabled={!portPath} className="btn btn-primary h-[46px]">
                <Plug size={18} /> Connect
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-5 flex items-start gap-3 rounded bg-danger-muted/40 border border-danger/30 px-5 py-3.5">
                <AlertCircle size={20} className="mt-0.5 shrink-0 text-danger" />
                <span className="text-base font-semibold text-danger">{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick start tips */}
        <div className="card">
          <div className="section-header">Quick Start</div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { n: 1, text: 'Connect your flight controller via USB cable' },
                { n: 2, text: 'Select the serial port that appears in the dropdown' },
                { n: 3, text: 'Keep the default baud rate of 115,200' },
                { n: 4, text: 'Click Connect -- ArduGUI will detect your aircraft automatically' },
              ].map(({ n, text }) => (
                <div key={n} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded
                    bg-accent/15 border border-accent/30 text-sm font-extrabold text-accent">
                    {n}
                  </span>
                  <p className="text-[15px] text-muted leading-snug pt-1.5">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── CONNECTING STATE ────────────────────────────────────────────────────
  if (isConnecting) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Connecting</h1>
          <p className="mt-1 text-lg text-muted">Establishing connection to {portPath}…</p>
        </div>

        <div className="card">
          <div className="section-header">Connection Progress</div>
          <div className="p-6 space-y-5">
            {status === 'connecting' && (
              <div className="flex items-center gap-3 text-lg text-muted">
                <Loader2 size={22} className="animate-spin text-accent" />
                Waiting for heartbeat…
              </div>
            )}
            {status === 'identifying' && (
              <div className="flex items-center gap-3 text-lg text-muted">
                <Loader2 size={22} className="animate-spin text-accent" />
                Identifying vehicle…
              </div>
            )}
            {status === 'loading' && progress && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-lg text-muted">
                  <Loader2 size={22} className="animate-spin text-accent" />
                  Loading parameters… {progress.received} / {progress.total}
                </div>
                <div className="h-3.5 w-full overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-accent transition-all duration-150"
                    style={{ width: `${Math.min(100, (progress.received / Math.max(1, progress.total)) * 100)}%` }} />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 rounded bg-danger-muted/40 border border-danger/30 px-5 py-3.5">
                <AlertCircle size={20} className="mt-0.5 shrink-0 text-danger" />
                <span className="text-base font-semibold text-danger">{error}</span>
              </div>
            )}

            <button onClick={handleDisconnect} className="btn btn-ghost">
              <Unplug size={18} /> Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── CONNECTED STATE ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Information</h1>
        <p className="mt-1 text-lg text-muted">
          {firmwareType} {firmwareVersion} on {portPath}
        </p>
      </div>

      {/* FC info -- horizontal strip of info cells */}
      <div className="card">
        <div className="section-header">Flight Controller</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <InfoCell icon={Box} label="Vehicle"
            value={vehicleType ? vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1) : '-'} />
          <InfoCell icon={Activity} label="Firmware" value={firmwareType || '-'} />
          <InfoCell icon={Hash} label="Version" value={firmwareVersion || '-'} />
          <InfoCell icon={Database} label="Parameters" value={`${paramCount}`} />
          <InfoCell icon={Cpu} label="Board"
            value={detectedBoard?.name?.split(' ')[0] || 'Unknown'} />
          <InfoCell icon={Shield} label="Status"
            value={armed ? 'ARMED' : 'Disarmed'}
            valueColor={armed ? 'text-danger' : 'text-success'} />
        </div>
      </div>

      {/* Board diagram */}
      {detectedBoard && <BoardDiagram board={detectedBoard} />}

      {/* Disconnect */}
      <div className="flex">
        <button onClick={handleDisconnect} className="btn btn-ghost">
          <Unplug size={18} /> Disconnect
        </button>
      </div>
    </div>
  );
}

function InfoCell({ icon: Icon, label, value, valueColor }: {
  icon: React.ElementType; label: string; value: string; valueColor?: string;
}) {
  return (
    <div className="flex items-center gap-3.5 px-5 py-4 border-b border-r border-border/40 last:border-r-0">
      <div className="flex h-11 w-11 items-center justify-center rounded bg-accent/10">
        <Icon size={22} className="text-accent" />
      </div>
      <div className="min-w-0">
        <div className="text-[12px] font-bold uppercase tracking-widest text-subtle">{label}</div>
        <div className={`text-lg font-bold truncate ${valueColor || 'text-foreground'}`}>{value}</div>
      </div>
    </div>
  );
}
