import { useState } from 'react';
import { Save, RotateCcw, AlertTriangle } from 'lucide-react';
import { useParameterStore } from '@/store/parameterStore';
import { useConnectionStore } from '@/store/connectionStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { SaveDialog } from '@/components/SaveDialog';

export function Footer() {
  const dirtyCount = useParameterStore((s) => s.dirtyParams.size);
  const revertAll = useParameterStore((s) => s.revertAll);
  const isConnected = useConnectionStore((s) => s.status === 'connected');
  const portPath = useConnectionStore((s) => s.portPath);
  const baudRate = useConnectionStore((s) => s.baudRate);
  const armed = useVehicleStore((s) => s.armed);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const hasDirty = dirtyCount > 0;
  const canSave = hasDirty && isConnected && !armed;

  const handleRevert = () => {
    if (hasDirty && confirm('Discard all unsaved changes?')) revertAll();
  };

  return (
    <>
      <footer className="flex h-9 items-center border-t border-border bg-surface-0 px-3 text-[11px]">
        <div className="flex items-center gap-2">
          <button disabled={!canSave} onClick={() => setShowSaveDialog(true)}
            className="btn btn-primary h-6 px-3 text-[11px]">
            <Save size={13} /> Save
          </button>
          <button disabled={!hasDirty} onClick={handleRevert}
            className="btn btn-ghost h-6 px-2 text-[11px]">
            <RotateCcw size={12} />
          </button>
        </div>

        {hasDirty && (
          <div className="ml-3 flex items-center gap-1.5 font-semibold text-warning">
            <AlertTriangle size={12} />
            {dirtyCount} unsaved
          </div>
        )}

        {armed && hasDirty && (
          <span className="ml-3 font-semibold text-danger">
            ARMED -- writes disabled
          </span>
        )}

        <div className="flex-1" />

        {isConnected && portPath && (
          <div className="flex items-center gap-1.5 text-subtle">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="font-mono">{portPath}</span>
            {baudRate && <span className="font-mono">@ {baudRate}</span>}
          </div>
        )}
        {!isConnected && (
          <span className="text-subtle">Ready</span>
        )}
      </footer>

      {showSaveDialog && <SaveDialog onClose={() => setShowSaveDialog(false)} />}
    </>
  );
}
