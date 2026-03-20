/**
 * My Aircraft -- fleet overview + snapshot detail drill-down.
 *
 * Top level: card grid of all registered aircraft.
 * Click a card: snapshot history with diff, restore, import/export.
 * Connected aircraft is pinned to the top with accent highlight.
 * Archived aircraft are hidden unless "Show archived" is toggled.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plane, Plus, Download, Upload, Trash2, Clock, Tag, GitCompare,
  ChevronDown, ChevronRight, Save, RotateCcw, Check,
  Pencil, X, Archive, ArchiveRestore, Wifi, ChevronLeft,
  StickyNote, Database,
} from 'lucide-react';
import { useParameterStore } from '@/store/parameterStore';
import { useConnectionStore } from '@/store/connectionStore';
import { useConfirm } from '@/components/ConfirmDialog';
import { AirframeIcon } from '@/components/AirframeIcons';
import { AIRFRAME_PRESETS } from '@/models/airframeTemplates';
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

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
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

function vehicleLabel(type: string | null): string {
  switch (type) {
    case 'copter': return 'Copter';
    case 'plane': return 'Plane';
    case 'quadplane': return 'VTOL';
    default: return 'Unknown';
  }
}

/** Left-border accent per vehicle type for card identity */
function vehicleBorderClass(type: string | null): string {
  switch (type) {
    case 'copter': return 'border-l-accent';
    case 'plane': return 'border-l-sky-500';
    case 'quadplane': return 'border-l-purple-400';
    default: return 'border-l-subtle';
  }
}

/** Strip leading "v" from firmware version to avoid double-v display */
function fmtVersion(v: string | null): string {
  if (!v) return '';
  return v.replace(/^v/i, '');
}

// ── Vehicle silhouette for cards (resolved from stored preset) ───────────

/** Parse the metadata JSON to extract the stored preset ID */
function getPresetId(aircraft: DbAircraft): string | null {
  if (!aircraft.metadata) return null;
  try {
    const meta = JSON.parse(aircraft.metadata);
    return meta.presetId ?? null;
  } catch { return null; }
}

/**
 * Render the real AirframeIcon from the stored preset, or a fallback
 * generic silhouette if no preset is stored (aircraft hasn't connected
 * since the fleet view update).
 */
function AircraftWatermark({ aircraft, className }: { aircraft: DbAircraft; className?: string }) {
  const presetId = getPresetId(aircraft);

  const preset = useMemo(() => {
    if (!presetId) return null;
    return AIRFRAME_PRESETS.find((p) => p.id === presetId) ?? null;
  }, [presetId]);

  if (preset) {
    return (
      <div className={className}>
        <AirframeIcon preset={preset} size={64} selected={false} />
      </div>
    );
  }

  // Fallback: simple generic silhouette for aircraft without stored preset
  return <GenericSilhouette type={aircraft.vehicle_type} className={className} />;
}

function GenericSilhouette({ type, className }: { type: string | null; className?: string }) {
  const fill = '#7a736c';
  switch (type) {
    case 'copter':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <line x1="24" y1="24" x2="10" y2="10" stroke={fill} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="24" y1="24" x2="38" y2="10" stroke={fill} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="24" y1="24" x2="10" y2="38" stroke={fill} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="24" y1="24" x2="38" y2="38" stroke={fill} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="10" cy="10" r="5" stroke={fill} strokeWidth="1" opacity="0.7" />
          <circle cx="38" cy="10" r="5" stroke={fill} strokeWidth="1" opacity="0.7" />
          <circle cx="10" cy="38" r="5" stroke={fill} strokeWidth="1" opacity="0.7" />
          <circle cx="38" cy="38" r="5" stroke={fill} strokeWidth="1" opacity="0.7" />
          <circle cx="24" cy="24" r="3.5" fill={fill} opacity="0.3" />
        </svg>
      );
    case 'quadplane':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <path
            d="M24,6 C23,6 22,8 21.5,11 L21,17 L7,21 L7,24 L21,22.5 L20.5,31 L16,34 L16,36 L24,34 L32,36 L32,34 L27.5,31 L27,22.5 L41,24 L41,21 L27,17 L26.5,11 C26,8 25,6 24,6Z"
            fill={fill} opacity="0.15" stroke={fill} strokeWidth="0.8" strokeLinejoin="round"
          />
          <circle cx="11" cy="15" r="3" stroke={fill} strokeWidth="0.8" opacity="0.6" />
          <circle cx="37" cy="15" r="3" stroke={fill} strokeWidth="0.8" opacity="0.6" />
          <circle cx="11" cy="31" r="3" stroke={fill} strokeWidth="0.8" opacity="0.6" />
          <circle cx="37" cy="31" r="3" stroke={fill} strokeWidth="0.8" opacity="0.6" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <path
            d="M24,4 C23,4 22,6 21.5,9 L21,17 L5,22 L5,25 L21,23 L20.5,33 L15,37 L15,39 L24,36 L33,39 L33,37 L27.5,33 L27,23 L43,25 L43,22 L27,17 L26.5,9 C26,6 25,4 24,4Z"
            fill={fill} opacity="0.15" stroke={fill} strokeWidth="1" strokeLinejoin="round"
          />
        </svg>
      );
  }
}

// ── Types ───────────────────────────────────────────────────────────────

interface AircraftCardData extends DbAircraft {
  snapshotCount: number;
}

// ── Main Component ──────────────────────────────────────────────────────

export function MyAircraftPage() {
  const loaded = useParameterStore((s) => s.loaded);
  const status = useConnectionStore((s) => s.status);
  const isConnected = status === 'connected' && loaded;

  const [aircraftList, setAircraftList] = useState<AircraftCardData[]>([]);
  const [selectedAircraftId, setSelectedAircraftId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const { confirm, ConfirmDialogElement } = useConfirm();

  const api = window.electronAPI?.db;
  const currentAircraftId = getAircraftId();

  // ── Load aircraft list with snapshot counts ──────────────────────────

  const loadAircraftList = useCallback(async () => {
    if (!api) return;
    // Always fetch all aircraft (including archived) so we can show the archive count/toggle
    const list = await api.listAircraft(true);
    const withCounts: AircraftCardData[] = [];
    for (const a of list) {
      const count = await api.getSnapshotCount(a.id);
      withCounts.push({ ...a, snapshotCount: count });
    }
    // Pin connected aircraft to top
    withCounts.sort((a, b) => {
      const aConnected = a.id === currentAircraftId && isConnected;
      const bConnected = b.id === currentAircraftId && isConnected;
      if (aConnected && !bConnected) return -1;
      if (!aConnected && bConnected) return 1;
      // Archived go to bottom
      const aArchived = a.archived_at !== null;
      const bArchived = b.archived_at !== null;
      if (aArchived && !bArchived) return 1;
      if (!aArchived && bArchived) return -1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
    setAircraftList(withCounts);
  }, [api, currentAircraftId, isConnected]);

  useEffect(() => {
    loadAircraftList();
  }, [loadAircraftList]);

  // ── Archive / Delete ─────────────────────────────────────────────────

  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!api) return;
    const aircraft = aircraftList.find((a) => a.id === id);
    const ok = await confirm({
      title: 'Archive aircraft?',
      message: `"${aircraft?.name ?? 'Unknown'}" will be hidden from the fleet view. You can restore it later.`,
      confirmLabel: 'Archive',
      cancelLabel: 'Cancel',
    });
    if (!ok) return;
    await api.archiveAircraft(id);
    if (selectedAircraftId === id) setSelectedAircraftId(null);
    await loadAircraftList();
  };

  const handleUnarchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!api) return;
    await api.unarchiveAircraft(id);
    await loadAircraftList();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!api) return;
    const aircraft = aircraftList.find((a) => a.id === id);
    const ok = await confirm({
      title: 'Permanently delete aircraft?',
      message: `This will permanently delete "${aircraft?.name ?? 'Unknown'}" and all ${aircraft?.snapshotCount ?? 0} snapshots. This cannot be undone.`,
      confirmLabel: 'Delete permanently',
      cancelLabel: 'Cancel',
      danger: true,
    });
    if (!ok) return;
    await api.deleteAircraft(id);
    if (selectedAircraftId === id) setSelectedAircraftId(null);
    await loadAircraftList();
  };

  // ── Render ────────────────────────────────────────────────────────────

  // Detail view for selected aircraft
  if (selectedAircraftId) {
    const aircraft = aircraftList.find((a) => a.id === selectedAircraftId);
    return (
      <div className="flex h-full flex-col overflow-y-auto p-8">
        {/* Breadcrumb */}
        <button
          onClick={() => setSelectedAircraftId(null)}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted transition hover:text-accent"
        >
          <ChevronLeft size={14} />
          My Aircraft
        </button>

        {/* Aircraft header */}
        <div className="mb-6 flex items-center gap-3">
          <Plane size={24} className="text-accent" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{aircraft?.name ?? 'Unknown'}</h1>
            <div className="flex items-center gap-3 text-xs text-muted">
              {aircraft?.vehicle_type && <span>{vehicleLabel(aircraft.vehicle_type)}</span>}
              {aircraft?.board_type && <span>{aircraft.board_type}</span>}
              {aircraft?.firmware_version && <span>v{fmtVersion(aircraft.firmware_version)}</span>}
              {selectedAircraftId === currentAircraftId && isConnected && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <Wifi size={10} /> Connected
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Notes section */}
        <AircraftNotesSection aircraftId={selectedAircraftId} notes={aircraft?.notes ?? null} onUpdate={loadAircraftList} />

        {/* Snapshot detail */}
        <SnapshotDetailView
          aircraftId={selectedAircraftId}
          isCurrentAircraft={selectedAircraftId === currentAircraftId && isConnected}
          aircraftName={aircraft?.name ?? 'Unknown'}
          onDataChange={loadAircraftList}
        />

        {ConfirmDialogElement}
      </div>
    );
  }

  // Fleet grid view
  const activeAircraft = aircraftList.filter((a) => a.archived_at === null);
  const archivedAircraft = aircraftList.filter((a) => a.archived_at !== null);

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-8">
      <div className="flex items-center gap-3">
        <Plane size={24} className="text-accent" />
        <h1 className="text-2xl font-bold text-foreground">My Aircraft</h1>
        <span className="text-sm text-muted">
          {activeAircraft.length} aircraft{activeAircraft.length !== 1 ? '' : ''}
        </span>
      </div>

      {/* Active aircraft grid */}
      {activeAircraft.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted">
          <Plane size={48} strokeWidth={1} className="text-subtle" />
          <p className="text-lg font-semibold">No aircraft registered</p>
          <p className="text-sm text-subtle">
            Connect a flight controller to register your first aircraft.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeAircraft.map((aircraft) => {
            const isCurrent = aircraft.id === currentAircraftId && isConnected;
            return (
              <div
                key={aircraft.id}
                onClick={() => setSelectedAircraftId(aircraft.id)}
                className={`group relative cursor-pointer overflow-hidden rounded border-l-[3px] border border-border transition hover:bg-surface-2 ${
                  isCurrent
                    ? 'border-l-emerald-400 bg-surface-1'
                    : vehicleBorderClass(aircraft.vehicle_type) + ' bg-surface-1'
                }`}
              >
                {/* Airframe watermark */}
                <AircraftWatermark
                  aircraft={aircraft}
                  className="pointer-events-none absolute -right-2 top-0 h-20 w-20 opacity-25"
                />

                <div className="relative p-4">
                  {/* Top row: name + live badge */}
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h3 className="truncate text-[15px] font-bold leading-tight text-foreground">
                      {aircraft.name}
                    </h3>
                    {isCurrent && (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live
                      </span>
                    )}
                  </div>

                  {/* Vehicle type + board */}
                  <div className="mb-3 flex items-center gap-1.5 text-xs text-muted">
                    <span className="font-medium">{vehicleLabel(aircraft.vehicle_type)}</span>
                    {aircraft.board_type && (
                      <>
                        <span className="text-subtle/60">·</span>
                        <span className="truncate text-subtle">{aircraft.board_type}</span>
                      </>
                    )}
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center justify-between text-[11px] text-subtle">
                    <div className="flex items-center gap-3">
                      {aircraft.firmware_version && (
                        <span>v{fmtVersion(aircraft.firmware_version)}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Database size={10} />
                        {aircraft.snapshotCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{formatShortDate(aircraft.updated_at)}</span>
                      {!isCurrent && (
                        <button
                          onClick={(e) => handleArchive(aircraft.id, e)}
                          className="rounded p-1 text-subtle opacity-0 transition hover:bg-surface-3 hover:text-muted group-hover:opacity-100"
                          title="Archive"
                        >
                          <Archive size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notes preview */}
                  {aircraft.notes && (
                    <p className="mt-2.5 truncate border-t border-border/50 pt-2 text-[11px] text-subtle italic">
                      {aircraft.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Archived section */}
      {archivedAircraft.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2.5 rounded-full bg-surface-1 px-3.5 py-1.5 text-xs font-medium text-subtle transition hover:bg-surface-2 hover:text-muted"
          >
            <Archive size={13} />
            <span>{archivedAircraft.length} archived</span>
            <span className={`transition-transform duration-150 ${showArchived ? 'rotate-90' : ''}`}>
              <ChevronRight size={12} />
            </span>
          </button>

          {showArchived && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {archivedAircraft.map((aircraft) => (
                <div
                  key={aircraft.id}
                  onClick={() => setSelectedAircraftId(aircraft.id)}
                  className="group cursor-pointer rounded border border-dashed border-border/60 bg-surface-1/40 p-4 transition hover:bg-surface-2/60"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-muted">{aircraft.name}</h3>
                      <span className="text-[11px] text-subtle">{vehicleLabel(aircraft.vehicle_type)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleUnarchive(aircraft.id, e)}
                        className="rounded p-1 text-subtle transition hover:bg-surface-3 hover:text-emerald-400"
                        title="Restore"
                      >
                        <ArchiveRestore size={13} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(aircraft.id, e)}
                        className="rounded p-1 text-subtle transition hover:bg-red-500/20 hover:text-red-400"
                        title="Delete permanently"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-subtle">
                    <span>{aircraft.snapshotCount} snapshots</span>
                    <span>Archived {formatShortDate(aircraft.archived_at!)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {ConfirmDialogElement}
    </div>
  );
}

// ── Aircraft Notes Section ──────────────────────────────────────────────

function AircraftNotesSection({
  aircraftId,
  notes,
  onUpdate,
}: {
  aircraftId: string;
  notes: string | null;
  onUpdate: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(notes ?? '');
  const api = window.electronAPI?.db;

  const handleSave = async () => {
    if (!api) return;
    const value = draft.trim() || null;
    await api.updateAircraftNotes(aircraftId, value);
    setEditing(false);
    onUpdate();
  };

  if (!editing && !notes) {
    return (
      <button
        onClick={() => { setDraft(''); setEditing(true); }}
        className="mb-4 flex items-center gap-1.5 text-xs text-subtle transition hover:text-muted"
      >
        <StickyNote size={12} />
        Add notes...
      </button>
    );
  }

  if (editing) {
    return (
      <div className="mb-4">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          className="w-full rounded border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
          placeholder="Notes about this aircraft (e.g. 5 inch freestyle, 6S, GoPro mount)"
          autoFocus
        />
        <div className="mt-1.5 flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 rounded bg-accent px-3 py-1 text-xs font-semibold text-black transition hover:bg-accent-hover"
          >
            <Check size={12} /> Save
          </button>
          <button
            onClick={() => { setEditing(false); setDraft(notes ?? ''); }}
            className="text-xs text-muted transition hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group mb-4 flex items-start gap-2">
      <StickyNote size={12} className="mt-0.5 shrink-0 text-subtle" />
      <p className="flex-1 text-sm text-muted italic">{notes}</p>
      <button
        onClick={() => { setDraft(notes ?? ''); setEditing(true); }}
        className="shrink-0 rounded p-1 text-subtle opacity-0 transition hover:text-foreground group-hover:opacity-100"
      >
        <Pencil size={12} />
      </button>
    </div>
  );
}

// ── Snapshot Detail View ────────────────────────────────────────────────

function SnapshotDetailView({
  aircraftId,
  isCurrentAircraft,
  aircraftName,
  onDataChange,
}: {
  aircraftId: string;
  isCurrentAircraft: boolean;
  aircraftName: string;
  onDataChange: () => void;
}) {
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

  const api = window.electronAPI?.db;
  const fsApi = window.electronAPI?.fs;

  // ── Load data ──────────────────────────────────────────────────────

  const loadSnapshots = useCallback(async () => {
    if (!api) return;
    const list = await api.listSnapshots(aircraftId);
    setSnapshots(list);
  }, [api, aircraftId]);

  const loadPreference = useCallback(async () => {
    const pref = await getAutoBackupPref();
    setAutoBackupPrefState(pref);
  }, []);

  useEffect(() => {
    loadSnapshots();
    loadPreference();
    // Reset expanded state when aircraft changes
    setExpandedSnapshot(null);
    setDiffEntries([]);
    setRestoreMode(false);
    setSelectedForRestore(new Set());
  }, [loadSnapshots, loadPreference, aircraftId]);

  // ── Actions ────────────────────────────────────────────────────────

  const handleCreateSnapshot = async () => {
    if (!snapshotLabel.trim()) return;
    const ok = await createManualSnapshot(snapshotLabel.trim());
    if (ok) {
      setSnapshotLabel('');
      setShowNewSnapshot(false);
      await loadSnapshots();
      onDataChange();
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
    onDataChange();
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

    if (!api || !isCurrentAircraft) {
      // Not connected to this aircraft -- show all params (no diff)
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
    if (!api || !fsApi) return;

    // Ensure aircraft exists in DB
    if (isCurrentAircraft) {
      const { type, firmwareVersion } = await import('@/store/vehicleStore').then(
        (m) => m.useVehicleStore.getState()
      );
      await api.upsertAircraft({
        id: aircraftId,
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
      await api.importParamFile(aircraftId, `Import: ${fileName}`, result.content);
      await loadSnapshots();
      onDataChange();
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
    if (api && isCurrentAircraft) {
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
    <div className="flex flex-col gap-4">
      {/* Auto-backup toggle */}
      {isCurrentAircraft && (
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

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {isCurrentAircraft && (
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
                  const ts = new Date().toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  });
                  setSnapshotLabel(`${aircraftName} -- ${ts}`);
                  setShowNewSnapshot(true);
                }}
                className="flex items-center gap-1.5 rounded bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-accent-hover"
              >
                <Plus size={14} /> New Snapshot
              </button>
            )}
          </>
        )}
        <button
          onClick={handleImport}
          className="flex items-center gap-1.5 rounded bg-surface-2 px-4 py-2 text-sm font-semibold text-muted transition hover:bg-surface-3 hover:text-foreground"
        >
          <Upload size={14} /> Import .param
        </button>
      </div>

      {/* Read-only notice for disconnected aircraft */}
      {!isCurrentAircraft && snapshots.length > 0 && (
        <div className="rounded border border-border/50 bg-surface-1/50 px-4 py-2.5 text-xs text-subtle">
          Viewing offline. Connect this aircraft to create snapshots, compare with live parameters, or restore.
        </div>
      )}

      {/* Snapshot list */}
      {snapshots.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted">
          <Database size={36} strokeWidth={1} className="text-subtle" />
          <p className="text-sm font-semibold">No snapshots yet</p>
          <p className="text-xs text-subtle">
            {isCurrentAircraft
              ? 'Create a snapshot to save your current parameters.'
              : 'Connect this aircraft and create a snapshot, or import a .param file.'}
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
                        {isCurrentAircraft ? 'All parameters match the current FC values.' : 'No parameters in this snapshot.'}
                      </div>
                    ) : (
                      <>
                        {/* Diff toolbar */}
                        {isCurrentAircraft && (
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
                                  {isCurrentAircraft ? 'Snapshot' : 'Value'}
                                </th>
                                {isCurrentAircraft && (
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
                                    {isCurrentAircraft && (
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
                          {isCurrentAircraft && ' from current FC values'}
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
