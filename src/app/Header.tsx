import { Wifi, WifiOff, Shield, ShieldOff, Loader2, Unplug, Terminal } from 'lucide-react';
import { useConnectionStore } from '@/store/connectionStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { useTelemetryStore } from '@/store/telemetryStore';
import { useDebugStore } from '@/store/debugStore';
import { connectionManager } from '@/mavlink/connection';
import { HealthBar } from '@/components/HealthBar';

export function Header() {
  const status = useConnectionStore((s) => s.status);
  const portPath = useConnectionStore((s) => s.portPath);
  const progress = useConnectionStore((s) => s.paramLoadProgress);
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
    <header className="flex h-16 items-center border-b border-border bg-surface-0 px-5 gap-4">
      {/* Left: connection info */}
      <div className="flex items-center gap-3">
        {isConnected ? (
          <Wifi size={18} className="text-success" />
        ) : isConnecting ? (
          <Loader2 size={18} className="animate-spin text-accent" />
        ) : (
          <WifiOff size={18} className="text-subtle" />
        )}
        <span className="text-[15px] font-semibold text-muted">
          {isConnected ? portPath : isConnecting ? 'Connecting…' : 'Disconnected'}
        </span>

        {(isConnected || isConnecting) && (
          <button onClick={handleDisconnect}
            className="btn btn-ghost h-8 px-3 text-[13px]"
            title="Disconnect">
            <Unplug size={14} /> Disconnect
          </button>
        )}

        {status === 'loading' && progress && (
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-40 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-accent transition-all duration-200"
                style={{ width: `${(progress.received / Math.max(1, progress.total)) * 100}%` }} />
            </div>
            <span className="font-mono text-sm font-bold tabular-nums text-accent">
              {progress.received}/{progress.total}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Center: vehicle type */}
      {(isConnected || isConnecting) && vehicleType && (
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-accent/20 border border-accent/40 px-5 py-1.5 text-sm font-extrabold uppercase tracking-[0.15em] text-accent">
            {vehicleType}
          </span>
          {firmwareType && firmwareVersion && (
            <span className="text-[15px] font-medium text-muted">
              {firmwareType} {firmwareVersion}
            </span>
          )}
        </div>
      )}

      <div className="flex-1" />

      {/* Right: telemetry */}
      <div className="flex items-center gap-5">
        {isConnected && <HealthBar />}

        {battery && (
          <div className="flex items-center gap-2">
            <span className={`font-mono text-[16px] font-bold tabular-nums ${
              battery.voltage < 10.5 ? 'text-danger' : 'text-foreground'
            }`}>
              {battery.voltage.toFixed(1)}V
            </span>
            <span className="font-mono text-[15px] font-medium tabular-nums text-muted">
              {battery.current.toFixed(1)}A
            </span>
          </div>
        )}

        {isConnected && (
          <div className={`badge ${
            armed
              ? 'bg-danger-muted/60 text-danger border border-danger/40'
              : 'bg-success-muted/60 text-success border border-success/40'
          }`}>
            {armed ? <><Shield size={13} /> ARMED</> : <><ShieldOff size={13} /> DISARMED</>}
          </div>
        )}

        {isConnected && (
          <button onClick={toggleDebug}
            className={`flex h-9 items-center gap-2 rounded-lg px-3 text-[13px] font-bold transition-colors ${
              debugEnabled ? 'bg-accent/20 text-accent' : 'text-subtle hover:bg-surface-2 hover:text-muted'
            }`}
            title={debugEnabled ? 'Close debug console' : 'Open debug console'}>
            <Terminal size={16} /> DEV
          </button>
        )}
      </div>
    </header>
  );
}
