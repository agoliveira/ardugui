/**
 * ExpertPage -- Power tools and diagnostics.
 *
 * Only visible when Expert Mode is toggled on via the header button.
 * Contains dangerous operations (Factory Reset, Reboot) and the
 * MAVLink message inspector that was previously the DebugConsole.
 */

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Pause,
  Play,
  Trash2,
  Search,
  ArrowDown,
  Download,
  AlertTriangle,
  RotateCcw,
  Power,
  ShieldAlert,
} from 'lucide-react';
import { useDebugStore, type DebugMessage } from '@/store/debugStore';
import { connectionManager } from '@/mavlink/connection';

// ── MAVLink Inspector helpers (moved from DebugConsole) ──────────────────

const HIGH_FREQ = new Set([
  'HEARTBEAT', 'SYS_STATUS', 'ATTITUDE', 'VFR_HUD', 'SERVO_OUTPUT_RAW',
]);

const DIR_COLORS = { in: 'text-success', out: 'text-accent' };
const DIR_LABELS = { in: '\u25C2 RX', out: '\u25B8 TX' };
type DirFilter = 'all' | 'in' | 'out';

function formatTime(ms: number): string {
  const sec = (ms / 1000) % 60;
  const min = Math.floor(ms / 60000) % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toFixed(3).padStart(6, '0')}`;
}

function MessageRow({ msg }: { msg: DebugMessage }) {
  const isHighFreq = HIGH_FREQ.has(msg.msgName);
  const dim = isHighFreq ? 'opacity-50' : '';
  return (
    <div className={`flex items-baseline gap-3 border-b border-border/30 px-3 py-[3px] font-mono text-[11px] leading-[18px] hover:bg-surface-1 ${dim}`}>
      <span className="w-[72px] shrink-0 tabular-nums text-subtle">{formatTime(msg.time)}</span>
      <span className={`w-[36px] shrink-0 font-semibold ${DIR_COLORS[msg.direction]}`}>{DIR_LABELS[msg.direction]}</span>
      <span className="w-[32px] shrink-0 text-right tabular-nums text-subtle">{msg.msgId}</span>
      <span className="w-[160px] shrink-0 font-semibold text-foreground">{msg.msgName}</span>
      <span className="w-[36px] shrink-0 text-right tabular-nums text-subtle">{msg.length}B</span>
      <span className="truncate text-muted">{msg.summary}</span>
    </div>
  );
}

function exportMessages(messages: DebugMessage[]) {
  const lines = messages.map(
    (m) => `${formatTime(m.time)}\t${m.direction === 'in' ? 'RX' : 'TX'}\t${m.msgId}\t${m.msgName}\t${m.length}B\t${m.summary}`
  );
  const header = 'Time\tDir\tID\tMessage\tSize\tData';
  const content = [header, ...lines].join('\n');

  if (window.electronAPI?.fs?.saveFile) {
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    window.electronAPI.fs.saveFile(`mavlink-log-${ts}.tsv`, content);
  } else {
    const blob = new Blob([content], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mavlink-log.tsv';
    a.click();
    URL.revokeObjectURL(url);
  }
}

// ── Dangerous Actions Section ────────────────────────────────────────────

function DangerousActions() {
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState<'success' | 'fail' | null>(null);
  const [rebooting, setRebooting] = useState(false);

  const canReset = resetConfirmText === 'RESET';

  const handleFactoryReset = useCallback(async () => {
    if (!canReset) return;
    setResetting(true);
    setResetResult(null);
    try {
      const result = await connectionManager.resetToDefaults();
      if (result === 0) {
        setResetResult('success');
        setResetConfirmText('');
        // Auto-reboot after successful reset
        setTimeout(async () => {
          await connectionManager.rebootFlightController();
        }, 1500);
      } else {
        setResetResult('fail');
      }
    } catch {
      setResetResult('fail');
    }
    setResetting(false);
  }, [canReset]);

  const handleReboot = useCallback(async () => {
    setRebooting(true);
    try {
      await connectionManager.rebootFlightController();
    } catch {
      // Connection will drop, which is expected
    }
    // Don't reset rebooting -- the connection drop will unmount us
  }, []);

  return (
    <div className="space-y-4">
      {/* Warning banner */}
      <div className="flex items-start gap-3 rounded border border-danger/30 bg-danger/5 px-4 py-3">
        <ShieldAlert size={18} className="mt-0.5 shrink-0 text-danger" />
        <div className="text-sm text-muted">
          These operations can cause data loss or require physical access to the aircraft.
          Make sure you understand what each action does before proceeding.
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Factory Reset */}
        <div className="rounded border border-border bg-surface-1 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-danger" />
            <h3 className="text-sm font-bold text-foreground">Factory Reset</h3>
          </div>
          <p className="text-xs text-muted mb-3">
            Resets ALL parameters to firmware defaults. This is equivalent to a fresh firmware
            install -- all calibration data, tuning, and configuration will be lost.
            The flight controller will reboot automatically after reset.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={resetConfirmText}
              onChange={(e) => { setResetConfirmText(e.target.value.toUpperCase()); setResetResult(null); }}
              placeholder='Type "RESET" to confirm'
              className="h-8 flex-1 rounded border border-border bg-surface-0 px-3 text-xs font-mono text-foreground placeholder:text-subtle focus:border-danger focus:outline-none"
              disabled={resetting}
            />
            <button
              onClick={handleFactoryReset}
              disabled={!canReset || resetting}
              className="btn h-8 gap-1.5 rounded border border-danger/50 bg-danger/10 px-3 text-xs font-bold text-danger transition-colors hover:bg-danger/20 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <RotateCcw size={12} className={resetting ? 'animate-spin' : ''} />
              {resetting ? 'Resetting...' : 'Factory Reset'}
            </button>
          </div>
          {resetResult === 'success' && (
            <p className="mt-2 text-xs font-medium text-success">Reset successful. Rebooting flight controller...</p>
          )}
          {resetResult === 'fail' && (
            <p className="mt-2 text-xs font-medium text-danger">Reset failed. The FC may not support this command, or the connection was lost.</p>
          )}
        </div>

        {/* Reboot */}
        <div className="rounded border border-border bg-surface-1 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Power size={16} className="text-warning" />
            <h3 className="text-sm font-bold text-foreground">Reboot Flight Controller</h3>
          </div>
          <p className="text-xs text-muted mb-3">
            Sends a reboot command to the flight controller. The connection will drop and
            ArduGUI will attempt to reconnect automatically. Any unsaved parameter changes
            will be lost.
          </p>
          <button
            onClick={handleReboot}
            disabled={rebooting}
            className="btn h-8 gap-1.5 rounded border border-warning/50 bg-warning/10 px-3 text-xs font-bold text-warning transition-colors hover:bg-warning/20 disabled:opacity-30"
          >
            <Power size={12} className={rebooting ? 'animate-spin' : ''} />
            {rebooting ? 'Rebooting...' : 'Reboot'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAVLink Inspector Section ────────────────────────────────────────────

function MavlinkInspector() {
  const { messages, paused, filter, setPaused, setFilter, clear } = useDebugStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [dirFilter, setDirFilter] = useState<DirFilter>('all');

  const filtered = useMemo(() => {
    let result = messages;
    if (dirFilter !== 'all') result = result.filter((m) => m.direction === dirFilter);
    if (filter) {
      const lower = filter.toLowerCase();
      result = result.filter(
        (m) => m.msgName.toLowerCase().includes(lower) || m.summary.toLowerCase().includes(lower)
      );
    }
    return result;
  }, [messages, filter, dirFilter]);

  const typeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of messages) counts.set(m.msgName, (counts.get(m.msgName) || 0) + 1);
    return counts;
  }, [messages]);

  const rxCount = useMemo(() => messages.filter((m) => m.direction === 'in').length, [messages]);
  const txCount = useMemo(() => messages.filter((m) => m.direction === 'out').length, [messages]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filtered, autoScroll]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 30);
  }, []);

  const handleExport = useCallback(() => exportMessages(filtered), [filtered]);

  return (
    <div className="flex flex-col rounded border border-border bg-surface-0 overflow-hidden" style={{ height: 420 }}>
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-1.5">
        <span className="text-[13px] tabular-nums text-subtle">
          {filtered.length} msgs &middot; {typeCounts.size} types
        </span>

        {/* Direction filter tabs */}
        <div className="flex items-center ml-1 rounded border border-border overflow-hidden">
          {([
            ['all', `All (${messages.length})`],
            ['in', `RX (${rxCount})`],
            ['out', `TX (${txCount})`],
          ] as [DirFilter, string][]).map(([dir, label]) => (
            <button
              key={dir}
              onClick={() => setDirFilter(dir)}
              className={`px-2 py-0.5 text-[13px] font-medium transition-colors ${
                dirFilter === dir ? 'bg-accent/15 text-accent' : 'text-subtle hover:text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Filter input */}
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-subtle" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter messages..."
            className="h-[26px] w-[180px] rounded border border-border bg-surface-1 pl-7 pr-2 text-[13px] text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
          />
        </div>

        <button onClick={() => setPaused(!paused)}
          className={`btn btn-ghost h-[26px] gap-1 px-2 text-[13px] ${paused ? 'text-warning' : 'text-muted'}`}
          title={paused ? 'Resume' : 'Pause'}>
          {paused ? <Play size={12} /> : <Pause size={12} />}
          {paused ? 'Resume' : 'Pause'}
        </button>

        {!autoScroll && (
          <button
            onClick={() => { setAutoScroll(true); if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }}
            className="btn btn-ghost h-[26px] gap-1 px-2 text-[13px] text-muted" title="Scroll to bottom">
            <ArrowDown size={12} />
          </button>
        )}

        <button onClick={handleExport} className="btn btn-ghost h-[26px] gap-1 px-2 text-[13px] text-muted"
          title="Export log to file (TSV)" disabled={messages.length === 0}>
          <Download size={12} /> Export
        </button>

        <button onClick={clear} className="btn btn-ghost h-[26px] gap-1 px-2 text-[13px] text-muted" title="Clear log">
          <Trash2 size={12} />
        </button>
      </div>

      {/* Message list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden" onScroll={handleScroll}>
        <div className="sticky top-0 z-10 flex items-baseline gap-3 border-b border-border bg-surface-1 px-3 py-[2px] font-mono text-[11px] font-semibold uppercase tracking-wider text-subtle">
          <span className="w-[72px] shrink-0">Time</span>
          <span className="w-[36px] shrink-0">Dir</span>
          <span className="w-[32px] shrink-0 text-right">ID</span>
          <span className="w-[160px] shrink-0">Message</span>
          <span className="w-[36px] shrink-0 text-right">Size</span>
          <span>Data</span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-base text-muted">
            {messages.length === 0 ? 'Waiting for MAVLink messages...' : 'No messages match filter'}
          </div>
        ) : (
          filtered.map((msg) => <MessageRow key={msg.id} msg={msg} />)
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────

export function ExpertPage() {
  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Expert Mode</h1>
        <p className="text-sm text-muted">
          Advanced diagnostics and dangerous operations. Use with caution.
        </p>
      </div>

      {/* Section 1: Dangerous Actions */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-danger">
          <AlertTriangle size={14} />
          Dangerous Actions
        </h2>
        <DangerousActions />
      </div>

      {/* Section 2: MAVLink Inspector */}
      <div className="flex-1 flex flex-col min-h-0">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">
          MAVLink Inspector
        </h2>
        <MavlinkInspector />
      </div>
    </div>
  );
}
