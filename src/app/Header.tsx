import { Wifi, WifiOff, Shield, ShieldOff, Loader2, Unplug, Wrench } from 'lucide-react';
import { useConnectionStore } from '@/store/connectionStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { useTelemetryStore } from '@/store/telemetryStore';
import { useDebugStore } from '@/store/debugStore';
import { connectionManager } from '@/mavlink/connection';
import { HealthBar } from '@/components/HealthBar';

export function Header() {
  const status = useConnectionStore((s) => s.status);
  const portPath = useConnectionStore((s) => s.portPath);
  const vehicleType = useVehicleStore((s) => s.type);
  const firmwareType = useVehicleStore((s) => s.firmwareType);
  const firmwareVersion = useVehicleStore((s) => s.firmwareVersion);
  const armed = useVehicleStore((s) => s.armed);
  const battery = useTelemetryStore((s) => s.battery);
  const debugEnabled = useDebugStore((s) => s.enabled);
  const toggleDebug = useDebugStore((s) => s.toggle);

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting' || status === 'identifying' || status === 'loading';

  const handleDisconnect = async () => { await connectionManager.disconnect(); };

  return (
    <header className="flex h-10 items-center border-b border-border bg-surface-0 px-3 gap-2 text-[12px]">
      {/* Left: connection */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Wifi size={14} className="text-success" />
        ) : isConnecting ? (
          <Loader2 size={14} className="animate-spin text-accent" />
        ) : (
          <WifiOff size={14} className="text-subtle" />
        )}
        <span className="font-medium text-muted">
          {isConnected ? portPath : isConnecting ? 'Connecting...' : 'Disconnected'}
        </span>

        {(isConnected || isConnecting) && (
          <button onClick={handleDisconnect}
            className="btn btn-ghost h-6 px-2 text-[11px]"
            title="Disconnect">
            <Unplug size={12} />
          </button>
        )}
      </div>

      {/* Separator */}
      {(isConnected || isConnecting) && vehicleType && (
        <div className="mx-1 h-4 w-px bg-border" />
      )}

      {/* Vehicle type badge */}
      {(isConnected || isConnecting) && vehicleType && (
        <div className="flex items-center gap-2">
          <span className="rounded bg-surface-2 border border-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
            {vehicleType}
          </span>
          {firmwareType && firmwareVersion && (
            <span className="text-[11px] font-medium text-subtle">
              {firmwareType} {firmwareVersion}
            </span>
          )}
        </div>
      )}

      <div className="flex-1" />

      {/* Telemetry -- inline, compact */}
      <div className="flex items-center gap-3">
        {isConnected && <HealthBar />}

        {battery && (
          <div className="flex items-center gap-1.5 font-mono text-[12px] tabular-nums">
            <span className={`font-bold ${
              battery.voltage < 10.5 ? 'text-danger' : 'text-foreground'
            }`}>
              {battery.voltage.toFixed(1)}V
            </span>
            <span className="font-medium text-muted">
              {battery.current.toFixed(1)}A
            </span>
          </div>
        )}

        {isConnected && (
          <>
            <div className="h-4 w-px bg-border" />
            <div className={`badge ${
              armed
                ? 'bg-danger-muted/60 text-danger border border-danger/30'
                : 'bg-success-muted/60 text-success border border-success/30'
            }`}>
              {armed ? <><Shield size={11} /> ARMED</> : <><ShieldOff size={11} /> DISARMED</>}
            </div>
          </>
        )}

        {isConnected && (
          <>
            <div className="h-4 w-px bg-border" />
            <button onClick={toggleDebug}
              className={`flex h-6 items-center gap-1 rounded px-2 text-[11px] font-bold transition-colors ${
                debugEnabled ? 'bg-accent/15 text-accent' : 'text-subtle hover:bg-surface-2 hover:text-muted'
              }`}
              title={debugEnabled ? 'Disable expert mode' : 'Enable expert mode'}>
              <Wrench size={13} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
