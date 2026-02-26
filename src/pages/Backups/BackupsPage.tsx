/**
 * Backups Page -- browse, create, restore, and export parameter snapshots.
 *
 * SQLite-backed via sql.js. Each connected aircraft gets its own history
 * of parameter snapshots (auto and manual). Users can diff any snapshot
 * against the current FC state and selectively restore parameters.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Database, Plus, Download, Upload, Trash2, Clock, Tag, GitCompare,
  ChevronDown, ChevronRight, Save, RotateCcw, Check,
  Pencil, X,
} from 'lucide-react';
import { useParameterStore } from '@/store/parameterStore';
import { useConnectionStore } from '@/store/connectionStore';
import {
  getAircraftId,
  getAircraftName,
  getCurrentParamsArray,
  getAutoBackupPref,
  setAutoBackupPref,
  createManualSnapshot,
} from '@/utils/autoBackup';

// ── Helpers ─────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sourceBadge(source: string): { label: string; className: string } {
  switch (source) {
    case 'auto':
      return { label: 'Auto', className: 'bg-sky-500/20 text-sky-400' };
    case 'import':
      return { label: 'Import', className: 'bg-purple-500/20 text-purple-400' };
    default:
      return { label: 'Manual', className: 'bg-accent/20 text-accent' };
  }
}

function formatValue(v: number | null): string {
  if (v === null) return '--';
  if (Number.isInteger(v)) return v.toString();
  return v.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
}

// ── Main Component ──────────────────────────────────────────────────────

export function BackupsPage() {
  const loaded = useParameterStore((s) => s.loaded);
  const status = useConnectionStore((s) => s.status);
  const isConnected = status === 'connected' && loaded;

  const [snapshots, setSnapshots] = useState<DbSnapshot[]>([]);
  const [autoBackupPref, setAutoBackupPrefState] = useState<'enabled' | 'disabled' | 'unset'>('unset');
  const [expandedSnapshot, setExpandedSnapshot] = useState<number | null>(null);
  const [diffEntries, setDiffEntries] = useState<DbDiffEntry[]>([]);
  const [diffLoading, setDiffLoading] = useState(false);
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [showNewSnapshot, setShowNewSnapshot] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [selectedForRestore, setSelectedForRestore] = useState<Set<string>>(new Set());
  const [restoreMode, setRestoreMode] = useState(false);
  const [aircraftList, setAircraftList] = useState<DbAircraft[]>([]);
  const [selectedAircraftId, setSelectedAircraftId] = useState<string | null>(null);

  const api = window.electronAPI?.db;
  const fsApi = window.electronAPI?.fs;

  // Determine which aircraft to show
  const currentAircraftId = getAircraftId();
  const activeAircraftId = selectedAircraftId ?? currentAircraftId;

  // ── Load data ──────────────────────────────────────────────────────

  const loadAircraftList = useCallback(async () => {
    if (!api) return;
    const list = await api.listAircraft();
    setAircraftList(list);
  }, [api]);

  const loadSnapshots = useCallback(async () => {
    if (!api || !activeAircraftId) return;
    const list = await api.listSnapshots(activeAircraftId);
    setSnapshots(list);
  }, [api, activeAircraftId]);

  const loadPreference = useCallback(async () => {
    const pref = await getAutoBackupPref();
    setAutoBackupPrefState(pref);
  }, []);

  useEffect(() => {
    loadAircraftList();
    loadPreference();
  }, [loadAircraftList, loadPreference]);

  useEffect(() => {
    loadSnapshots();
  }, [loadSnapshots]);

  // Auto-select current aircraft when connecting
  useEffect(() => {
    if (isConnected && currentAircraftId) {
      setSelectedAircraftId(null); // null means "use current"
    }
  }, [isConnected, currentAircraftId]);

  // ── Actions ────────────────────────────────────────────────────────

  const handleCreateSnapshot = async () => {
    if (!snapshotLabel.trim()) return;
    const ok = await createManualSnapshot(snapshotLabel.trim());
    if (ok) {
      setSnapshotLabel('');
      setShowNewSnapshot(false);
      await loadSnapshots();
      await loadAircraftList();
    }
  };

  const handleDeleteSnapshot = async (id: number) => {
    if (!api) return;
    await api.deleteSnapshot(id);
    if (expandedSnapshot === id) {
      setExpandedSnapshot(null);
      setDiffEntries([]);
    }
    await loadSnapshots();
  };

  const handleToggleAutoBackup = async (enabled: boolean) => {
    await setAutoBackupPref(enabled);
    setAutoBackupPrefState(enabled ? 'enabled' : 'disabled');
  };

  const handleExpandSnapshot = async (id: number) => {
    if (expandedSnapshot === id) {
      setExpandedSnapshot(null);
      setDiffEntries([]);
      setRestoreMode(false);
      setSelectedForRestore(new Set());
      return;
    }

    setExpandedSnapshot(id);
    setRestoreMode(false);
    setSelectedForRestore(new Set());

    if (!api || !isConnected) {
      // If not connected, just show all params
      setDiffLoading(true);
      const params = await api?.getSnapshotParams(id);
      if (params) {
        setDiffEntries(params.map((p) => ({
          name: p.name,
          valueA: p.value,
          valueB: null,
          typeA: p.type,
          typeB: null,
        })));
      }
      setDiffLoading(false);
      return;
    }

    // Diff against current FC params
    setDiffLoading(true);
    const currentParams = getCurrentParamsArray();
    const diff = await api.diffSnapshotVsCurrent(id, currentParams);
    setDiffEntries(diff);
    setDiffLoading(false);
  };

  const handleExport = async (id: number) => {
    if (!api || !fsApi) return;
    const content = await api.exportParamFile(id);
    const snapshot = snapshots.find((s) => s.id === id);
    const defaultName = snapshot
      ? `${snapshot.label.replace(/[^a-zA-Z0-9_-]/g, '_')}.param`
      : 'backup.param';
    await fsApi.saveFile(defaultName, content);
  };

  const handleImport = async () => {
    if (!api || !fsApi || !activeAircraftId) return;

    // Ensure aircraft exists in DB
    if (isConnected) {
      const { type, firmwareVersion } = await import('@/store/vehicleStore').then(
        (m) => m.useVehicleStore.getState()
      );
      await api.upsertAircraft({
        id: activeAircraftId,
        name: getAircraftName(),
        vehicle_type: type ?? undefined,
        firmware_version: firmwareVersion ?? undefined,
      });
    }

    const result = await fsApi.openFile([
      { name: 'Parameter Files', extensions: ['param', 'parm', 'txt'] },
    ]);
    if (!result) return;

    const fileName = result.path.split(/[\\/]/).pop() ?? 'Imported';
    try {
      await api.importParamFile(activeAircraftId, `Import: ${fileName}`, result.content);
      await loadSnapshots();
      await loadAircraftList();
    } catch (err) {
      console.error('Import failed:', err);
    }
  };

  const handleRenameSnapshot = async (id: number) => {
    if (!api || !editingLabel.trim()) return;
    await api.renameSnapshot(id, editingLabel.trim());
    setEditingId(null);
    setEditingLabel('');
    await loadSnapshots();
  };

  const handleRestore = async () => {
    if (selectedForRestore.size === 0 || !expandedSnapshot) return;
    const { setParamLocal } = useParameterStore.getState();

    for (const entry of diffEntries) {
      if (selectedForRestore.has(entry.name) && entry.valueA !== null) {
        setParamLocal(entry.name, entry.valueA);
      }
    }

    setRestoreMode(false);
    setSelectedForRestore(new Set());
    // Refresh diff to reflect dirty params
    if (api && isConnected) {
      const currentParams = getCurrentParamsArray();
      const diff = await api.diffSnapshotVsCurrent(expandedSnapshot, currentParams);
      setDiffEntries(diff);
    }
  };

  const toggleSelectParam = (name: string) => {
    setSelectedForRestore((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const selectAllForRestore = () => {
    const restorable = diffEntries.filter((e) => e.valueA !== null && e.valueB !== null && e.valueA !== e.valueB);
    setSelectedForRestore(new Set(restorable.map((e) => e.name)));
  };

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database size={24} className="text-accent" />
          <h1 className="text-2xl font-bold text-foreground">Parameter Backups</h1>
        </div>
      </div>

      {/* Auto-backup toggle -- always visible when connected */}
      {isConnected && (
        <div className="flex items-center gap-3">
          <Clock size={14} className="text-muted" />
          <span className="text-sm text-muted">Auto-backup on connect</span>
          <button
            onClick={() => handleToggleAutoBackup(autoBackupPref !== 'enabled')}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              autoBackupPref === 'enabled' ? 'bg-accent' : 'bg-surface-3'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                autoBackupPref === 'enabled' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          {autoBackupPref === 'unset' && (
            <span className="text-xs text-subtle italic">
              Saves a snapshot every time you connect -- recommended
            </span>
          )}
        </div>
      )}

      {/* Aircraft selector (when multiple aircraft in history) */}
      {aircraftList.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-muted">Aircraft:</span>
          <div className="flex gap-2">
            {aircraftList.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAircraftId(a.id === currentAircraftId ? null : a.id)}
                className={`rounded px-3 py-1.5 text-sm font-semibold transition ${
                  a.id === activeAircraftId
                    ? 'bg-accent/20 text-accent'
                    : 'bg-surface-2 text-muted hover:text-foreground'
                }`}
              >
                {a.name}
                {a.id === currentAircraftId && isConnected && (
                  <span className="ml-1.5 text-xs text-emerald-400">(connected)</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {isConnected && activeAircraftId === currentAircraftId && (
          <>
            {showNewSnapshot ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={snapshotLabel}
                  onChange={(e) => setSnapshotLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateSnapshot()}
                  placeholder="Snapshot label (e.g. Before PID tune)"
                  className="w-72 rounded border border-border bg-surface-1 px-3 py-2 text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleCreateSnapshot}
                  disabled={!snapshotLabel.trim()}
                  className="flex items-center gap-1.5 rounded bg-accent px-3 py-2 text-sm font-semibold text-black transition hover:bg-accent-hover disabled:opacity-40"
                >
                  <Save size={14} /> Save
                </button>
                <button
                  onClick={() => { setShowNewSnapshot(false); setSnapshotLabel(''); }}
                  className="rounded bg-surface-2 px-3 py-2 text-sm text-muted transition hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  // Suggest a default name
                  const aircraft = aircraftList.find((a) => a.id === activeAircraftId);
                  const ts = new Date().toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  });
                  const prefix = aircraft?.name ?? 'Snapshot';
                  setSnapshotLabel(`${prefix} -- ${ts}`);
                  setShowNewSnapshot(true);
                }}
                className="flex items-center gap-1.5 rounded bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-accent-hover"
              >
                <Plus size={14} /> New Snapshot
              </button>
            )}
          </>
        )}
        {activeAircraftId && (
          <button
            onClick={handleImport}
            className="flex items-center gap-1.5 rounded bg-surface-2 px-4 py-2 text-sm font-semibold text-muted transition hover:bg-surface-3 hover:text-foreground"
          >
            <Upload size={14} /> Import .param
          </button>
        )}
      </div>

      {/* Snapshot list */}
      {!activeAircraftId ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted">
          <Database size={48} strokeWidth={1} className="text-subtle" />
          <p className="text-lg font-semibold">No aircraft connected</p>
          <p className="text-sm text-subtle">Connect to a flight controller to manage parameter backups.</p>
        </div>
      ) : snapshots.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted">
          <Database size={48} strokeWidth={1} className="text-subtle" />
          <p className="text-lg font-semibold">No snapshots yet</p>
          <p className="text-sm text-subtle">
            {isConnected
              ? 'Create a snapshot to save your current parameters.'
              : 'Connect and create a snapshot, or import a .param file.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {snapshots.map((snap) => {
            const badge = sourceBadge(snap.source);
            const isExpanded = expandedSnapshot === snap.id;
            const isEditing = editingId === snap.id;

            return (
              <div key={snap.id} className="rounded border border-border bg-surface-1">
                {/* Snapshot header row */}
                <div
                  className="flex cursor-pointer items-center gap-3 px-5 py-3.5 transition hover:bg-surface-2"
                  onClick={() => handleExpandSnapshot(snap.id)}
                >
                  {isExpanded ? (
                    <ChevronDown size={16} className="shrink-0 text-accent" />
                  ) : (
                    <ChevronRight size={16} className="shrink-0 text-subtle" />
                  )}

                  {/* Label */}
                  {isEditing ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingLabel}
                        onChange={(e) => setEditingLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSnapshot(snap.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="w-60 rounded border border-border bg-surface-2 px-2 py-1 text-sm text-foreground focus:border-accent focus:outline-none"
                        autoFocus
                      />
                      <button onClick={() => handleRenameSnapshot(snap.id)} className="text-emerald-400 hover:text-emerald-300">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-muted hover:text-foreground">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="flex-1 truncate font-semibold text-foreground">{snap.label}</span>
                  )}

                  {/* Metadata */}
                  <span className={`rounded px-2 py-0.5 text-[11px] font-bold ${badge.className}`}>
                    {badge.label}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-subtle">
                    <Tag size={11} />
                    {snap.param_count} params
                  </span>
                  <span className="flex items-center gap-1 text-xs text-subtle">
                    <Clock size={11} />
                    {formatDate(snap.created_at)}
                  </span>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => { setEditingId(snap.id); setEditingLabel(snap.label); }}
                      className="rounded p-1.5 text-subtle transition hover:bg-surface-3 hover:text-foreground"
                      title="Rename"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleExport(snap.id)}
                      className="rounded p-1.5 text-subtle transition hover:bg-surface-3 hover:text-foreground"
                      title="Export as .param file"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteSnapshot(snap.id)}
                      className="rounded p-1.5 text-subtle transition hover:bg-red-500/20 hover:text-red-400"
                      title="Delete snapshot"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Expanded diff view */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {diffLoading ? (
                      <div className="flex items-center gap-2 px-5 py-4 text-sm text-muted">
                        <GitCompare size={14} className="animate-spin" />
                        Comparing...
                      </div>
                    ) : diffEntries.length === 0 ? (
                      <div className="flex items-center gap-2 px-5 py-4 text-sm text-emerald-400">
                        <Check size={14} />
                        {isConnected ? 'All parameters match the current FC values.' : 'No parameters in this snapshot.'}
                      </div>
                    ) : (
                      <>
                        {/* Diff toolbar */}
                        {isConnected && activeAircraftId === currentAircraftId && (
                          <div className="flex items-center gap-3 border-b border-border px-5 py-2.5">
                            {!restoreMode ? (
                              <button
                                onClick={() => { setRestoreMode(true); selectAllForRestore(); }}
                                className="flex items-center gap-1.5 rounded bg-sky-500/20 px-3 py-1.5 text-xs font-semibold text-sky-400 transition hover:bg-sky-500/30"
                              >
                                <RotateCcw size={12} /> Restore parameters...
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={handleRestore}
                                  disabled={selectedForRestore.size === 0}
                                  className="flex items-center gap-1.5 rounded bg-accent px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-accent-hover disabled:opacity-40"
                                >
                                  <RotateCcw size={12} />
                                  Restore {selectedForRestore.size} param{selectedForRestore.size !== 1 ? 's' : ''}
                                </button>
                                <button
                                  onClick={selectAllForRestore}
                                  className="text-xs text-muted underline transition hover:text-foreground"
                                >
                                  Select all
                                </button>
                                <button
                                  onClick={() => { setRestoreMode(false); setSelectedForRestore(new Set()); }}
                                  className="text-xs text-muted transition hover:text-foreground"
                                >
                                  Cancel
                                </button>
                                <span className="ml-auto text-[11px] text-subtle">
                                  Restored params become unsaved changes -- save to FC when ready.
                                </span>
                              </>
                            )}
                          </div>
                        )}

                        {/* Diff table */}
                        <div className="max-h-96 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border text-left text-xs font-bold text-subtle">
                                {restoreMode && <th className="px-3 py-2 w-8" />}
                                <th className="px-5 py-2">Parameter</th>
                                <th className="px-3 py-2 text-right">
                                  {isConnected ? 'Snapshot' : 'Value'}
                                </th>
                                {isConnected && (
                                  <th className="px-3 py-2 text-right">Current</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {diffEntries.map((entry) => {
                                const changed = entry.valueA !== entry.valueB;
                                const onlyInSnapshot = entry.valueB === null;
                                const onlyInCurrent = entry.valueA === null;
                                const canRestore = entry.valueA !== null && entry.valueB !== null && changed;

                                return (
                                  <tr
                                    key={entry.name}
                                    className={`border-b border-border/50 transition ${
                                      restoreMode && canRestore
                                        ? 'cursor-pointer hover:bg-surface-2'
                                        : ''
                                    } ${
                                      onlyInSnapshot ? 'text-red-400/70' :
                                      onlyInCurrent ? 'text-emerald-400/70' :
                                      changed ? 'text-accent' : 'text-muted'
                                    }`}
                                    onClick={() => restoreMode && canRestore && toggleSelectParam(entry.name)}
                                  >
                                    {restoreMode && (
                                      <td className="px-3 py-1.5">
                                        {canRestore && (
                                          <input
                                            type="checkbox"
                                            checked={selectedForRestore.has(entry.name)}
                                            onChange={() => toggleSelectParam(entry.name)}
                                            className="accent-accent"
                                          />
                                        )}
                                      </td>
                                    )}
                                    <td className="px-5 py-1.5 font-mono text-xs">{entry.name}</td>
                                    <td className="px-3 py-1.5 text-right font-mono text-xs">
                                      {formatValue(entry.valueA)}
                                    </td>
                                    {isConnected && (
                                      <td className="px-3 py-1.5 text-right font-mono text-xs">
                                        {formatValue(entry.valueB)}
                                      </td>
                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        <div className="px-5 py-2.5 text-xs text-subtle">
                          {diffEntries.length} parameter{diffEntries.length !== 1 ? 's' : ''} differ
                          {isConnected && ' from current FC values'}
                        </div>
                      </>
                    )}
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
