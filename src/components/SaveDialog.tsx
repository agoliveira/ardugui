import { useState } from 'react';
import { X, Save, Loader2, Check, XCircle } from 'lucide-react';
import { useParameterStore } from '@/store/parameterStore';
import { connectionManager } from '@/mavlink/connection';

interface SaveDialogProps {
  onClose: () => void;
}

type SaveState = 'review' | 'saving' | 'done';

export function SaveDialog({ onClose }: SaveDialogProps) {
  const parameters = useParameterStore((s) => s.parameters);
  const dirtyParams = useParameterStore((s) => s.dirtyParams);
  const [saveState, setSaveState] = useState<SaveState>('review');
  const [result, setResult] = useState<{
    success: number;
    failed: string[];
    skipped: number;
  } | null>(null);

  // Build the changes list -- only show params that exist on the FC
  const changes = Array.from(dirtyParams.entries())
    .filter(([name]) => parameters.has(name))
    .map(([name, newValue]) => {
      const param = parameters.get(name)!;
      return {
        name,
        oldValue: param.value,
        newValue,
        type: param.type,
      };
    });

  const skippedCount = dirtyParams.size - changes.length;

  const handleSave = async () => {
    setSaveState('saving');

    const saveResult = await connectionManager.saveAllDirty();

    setResult(saveResult);
    setSaveState('done');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={saveState === 'saving' ? undefined : onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-surface-1 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold text-foreground">
            {saveState === 'review' && 'Review Changes'}
            {saveState === 'saving' && 'Saving to FC...'}
            {saveState === 'done' && 'Save Complete'}
          </h2>
          {saveState !== 'saving' && (
            <button
              onClick={onClose}
              className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="max-h-80 overflow-y-auto px-5 py-4">
          {saveState === 'review' && (
            <div className="space-y-1">
              <p className="mb-3 text-base text-muted">
                The following {changes.length} parameter{changes.length !== 1 ? 's' : ''} will
                be written to the flight controller{skippedCount > 0
                  ? ` (${skippedCount} unsupported parameter${skippedCount !== 1 ? 's' : ''} will be skipped)`
                  : ''}:
              </p>
              {changes.map((change) => (
                <div
                  key={change.name}
                  className="flex items-center gap-3 rounded-md bg-surface-0 px-3 py-2"
                >
                  <span className="flex-1 font-mono text-base font-semibold text-foreground">
                    {change.name}
                  </span>
                  <span className="font-mono text-[15px] text-subtle line-through">
                    {formatValue(change.oldValue, change.type)}
                  </span>
                  <span className="text-[15px] text-subtle">{'\u2192'}</span>
                  <span className="font-mono text-sm font-bold text-warning">
                    {formatValue(change.newValue, change.type)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {saveState === 'saving' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <Loader2 size={32} className="animate-spin text-accent" />
              <p className="text-base text-muted">
                Writing parameters to flight controller...
              </p>
              <p className="text-[15px] text-subtle">
                Do not disconnect during save.
              </p>
            </div>
          )}

          {saveState === 'done' && result && (
            <div className="space-y-4 py-2">
              {result.failed.length === 0 ? (
                <div className="flex items-center gap-3 rounded-lg bg-success-muted px-4 py-3">
                  <Check size={18} className="text-success" />
                  <div>
                    <p className="text-base font-semibold text-success">
                      All {result.success} parameters saved successfully
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {result.success > 0 && (
                    <div className="flex items-center gap-3 rounded-lg bg-success-muted px-4 py-3">
                      <Check size={16} className="text-success" />
                      <span className="text-base text-success">
                        {result.success} parameter{result.success !== 1 ? 's' : ''} saved
                      </span>
                    </div>
                  )}
                  <div className="rounded-lg bg-danger-muted px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle size={16} className="text-danger" />
                      <span className="text-base font-semibold text-danger">
                        {result.failed.length} parameter{result.failed.length !== 1 ? 's' : ''} failed
                      </span>
                    </div>
                    <div className="space-y-1">
                      {result.failed.map((name) => (
                        <span
                          key={name}
                          className="block font-mono text-sm text-danger/80"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-3">
          {saveState === 'review' && (
            <>
              <button onClick={onClose} className="btn btn-ghost">
                Cancel
              </button>
              <button onClick={handleSave} className="btn btn-primary">
                <Save size={14} />
                Save {changes.length} Change{changes.length !== 1 ? 's' : ''}
              </button>
            </>
          )}

          {saveState === 'done' && (
            <button onClick={onClose} className="btn btn-primary">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function formatValue(value: number, type: string): string {
  if (type === 'FLOAT') {
    // Show reasonable precision
    if (Number.isInteger(value)) return value.toString();
    return value.toPrecision(6);
  }
  return Math.round(value).toString();
}
