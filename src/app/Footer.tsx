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
  const armed = useVehicleStore((s) => s.armed);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const hasDirty = dirtyCount > 0;
  const canSave = hasDirty && isConnected && !armed;

  const handleRevert = () => {
    if (hasDirty && confirm('Discard all unsaved changes?')) revertAll();
  };

  return (
    <>
      <footer className="flex h-12 items-center border-t border-border bg-surface-0 px-5">
        <div className="flex items-center gap-3">
          <button disabled={!canSave} onClick={() => setShowSaveDialog(true)}
            className="btn btn-primary h-8 px-4 text-[13px]">
            <Save size={14} /> Save to FC
          </button>
          <button disabled={!hasDirty} onClick={handleRevert}
            className="btn btn-ghost h-8 px-4 text-[13px]">
            <RotateCcw size={14} /> Revert
          </button>
        </div>

        {hasDirty && (
          <div className="ml-5 flex items-center gap-2 text-[15px] font-bold text-warning">
            <AlertTriangle size={16} />
            {dirtyCount} unsaved change{dirtyCount !== 1 ? 's' : ''}
          </div>
        )}

        {armed && hasDirty && (
          <div className="ml-5 text-[15px] font-bold text-danger">
            ARMED -- writes disabled
          </div>
        )}

        <div className="flex-1" />
        <div className="text-sm text-subtle">{isConnected ? 'Connected' : 'Ready'}</div>
      </footer>

      {showSaveDialog && <SaveDialog onClose={() => setShowSaveDialog(false)} />}
    </>
  );
}
