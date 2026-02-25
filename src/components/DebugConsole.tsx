/**
 * DebugConsole -- MAVLink message monitor panel.
 *
 * Shows a scrolling log of all incoming/outgoing MAVLink messages with
 * timestamp, direction, message name, and decoded summary.
 *
 * Features:
 *   - Auto-scroll (locks to bottom, unlocks on manual scroll up)
 *   - Pause/resume
 *   - Message name filter (text input)
 *   - Direction filter (All / RX / TX)
 *   - Export to file (TSV with all current messages)
 *   - Clear log
 *   - Message count per type
 *   - Color coding: green=in, blue=out, dim=high-frequency (HEARTBEAT etc.)
 */

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Pause,
  Play,
  Trash2,
  X,
  Search,
  ArrowDown,
  Download,
} from 'lucide-react';
import { useDebugStore, type DebugMessage } from '@/store/debugStore';

// Messages that fire very frequently -- show dimmed
const HIGH_FREQ = new Set([
  'HEARTBEAT',
  'SYS_STATUS',
  'ATTITUDE',
  'VFR_HUD',
  'SERVO_OUTPUT_RAW',
]);

// Direction colors
const DIR_COLORS = {
  in: 'text-success',
  out: 'text-accent',
};

const DIR_LABELS = {
  in: '◂ RX',
  out: '▸ TX',
};

type DirFilter = 'all' | 'in' | 'out';

function formatTime(ms: number): string {
  const sec = (ms / 1000) % 60;
  const min = Math.floor(ms / 60000) % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toFixed(3).padStart(6, '0')}`;
}

// ── Message Row ──────────────────────────────────────────────────────────

function MessageRow({ msg }: { msg: DebugMessage }) {
  const isHighFreq = HIGH_FREQ.has(msg.msgName);
  const dim = isHighFreq ? 'opacity-50' : '';

  return (
    <div
      className={`flex items-baseline gap-3 border-b border-border/30 px-3 py-[3px] font-mono text-[11px] leading-[18px] hover:bg-surface-1 ${dim}`}
    >
      {/* Timestamp */}
      <span className="w-[72px] shrink-0 tabular-nums text-subtle">
        {formatTime(msg.time)}
      </span>

      {/* Direction */}
      <span className={`w-[36px] shrink-0 font-semibold ${DIR_COLORS[msg.direction]}`}>
        {DIR_LABELS[msg.direction]}
      </span>

      {/* Message ID */}
      <span className="w-[32px] shrink-0 text-right tabular-nums text-subtle">
        {msg.msgId}
      </span>

      {/* Message name */}
      <span className="w-[160px] shrink-0 font-semibold text-foreground">
        {msg.msgName}
      </span>

      {/* Size */}
      <span className="w-[36px] shrink-0 text-right tabular-nums text-subtle">
        {msg.length}B
      </span>

      {/* Summary */}
      <span className="truncate text-muted">{msg.summary}</span>
    </div>
  );
}

// ── Export Helper ─────────────────────────────────────────────────────────

function exportMessages(messages: DebugMessage[]) {
  const lines = messages.map(
    (m) =>
      `${formatTime(m.time)}\t${m.direction === 'in' ? 'RX' : 'TX'}\t${m.msgId}\t${m.msgName}\t${m.length}B\t${m.summary}`
  );
  const header = 'Time\tDir\tID\tMessage\tSize\tData';
  const content = [header, ...lines].join('\n');

  // Try Electron save dialog, fall back to browser download
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

// ── Main Component ───────────────────────────────────────────────────────

export function DebugConsole() {
  const { messages, paused, filter, setPaused, setFilter, clear } =
    useDebugStore();
  const toggle = useDebugStore((s) => s.toggle);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [height, setHeight] = useState(280);
  const [dirFilter, setDirFilter] = useState<DirFilter>('all');
  const dragRef = useRef<{ startY: number; startH: number } | null>(null);

  // Filter messages by text and direction
  const filtered = useMemo(() => {
    let result = messages;
    if (dirFilter !== 'all') {
      result = result.filter((m) => m.direction === dirFilter);
    }
    if (filter) {
      const lower = filter.toLowerCase();
      result = result.filter(
        (m) =>
          m.msgName.toLowerCase().includes(lower) ||
          m.summary.toLowerCase().includes(lower)
      );
    }
    return result;
  }, [messages, filter, dirFilter]);

  // Message type counts
  const typeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of messages) {
      counts.set(m.msgName, (counts.get(m.msgName) || 0) + 1);
    }
    return counts;
  }, [messages]);

  // Direction counts
  const rxCount = useMemo(() => messages.filter((m) => m.direction === 'in').length, [messages]);
  const txCount = useMemo(() => messages.filter((m) => m.direction === 'out').length, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filtered, autoScroll]);

  // Detect manual scroll
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 30;
    setAutoScroll(atBottom);
  }, []);

  // Resize drag
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startH: height };
    const handleMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startY - ev.clientY;
      setHeight(Math.min(600, Math.max(150, dragRef.current.startH + delta)));
    };
    const handleUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [height]);

  const handleExport = useCallback(() => {
    exportMessages(filtered);
  }, [filtered]);

  return (
    <div
      className="flex flex-col border-t border-border bg-surface-0"
      style={{ height }}
    >
      {/* Resize handle */}
      <div
        className="h-[3px] shrink-0 cursor-ns-resize bg-border/50 hover:bg-accent transition-colors"
        onMouseDown={handleDragStart}
      />

      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-1.5">
        <span className="text-[13px] font-semibold text-foreground">
          MAVLink Monitor
        </span>

        <span className="text-[13px] tabular-nums text-subtle">
          {filtered.length} msgs · {typeCounts.size} types
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
                dirFilter === dir
                  ? 'bg-accent/15 text-accent'
                  : 'text-subtle hover:text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Filter input */}
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-subtle"
          />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter messages..."
            className="h-[26px] w-[180px] rounded border border-border bg-surface-1 pl-7 pr-2 text-[13px] text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
          />
        </div>

        {/* Pause / Resume */}
        <button
          onClick={() => setPaused(!paused)}
          className={`btn btn-ghost h-[26px] gap-1 px-2 text-[13px] ${
            paused ? 'text-warning' : 'text-muted'
          }`}
          title={paused ? 'Resume' : 'Pause'}
        >
          {paused ? <Play size={12} /> : <Pause size={12} />}
          {paused ? 'Resume' : 'Pause'}
        </button>

        {/* Scroll to bottom */}
        {!autoScroll && (
          <button
            onClick={() => {
              setAutoScroll(true);
              if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
              }
            }}
            className="btn btn-ghost h-[26px] gap-1 px-2 text-[13px] text-muted"
            title="Scroll to bottom"
          >
            <ArrowDown size={12} />
          </button>
        )}

        {/* Export */}
        <button
          onClick={handleExport}
          className="btn btn-ghost h-[26px] gap-1 px-2 text-[13px] text-muted"
          title="Export log to file (TSV)"
          disabled={messages.length === 0}
        >
          <Download size={12} />
          Export
        </button>

        {/* Clear */}
        <button
          onClick={clear}
          className="btn btn-ghost h-[26px] gap-1 px-2 text-[13px] text-muted"
          title="Clear log"
        >
          <Trash2 size={12} />
        </button>

        {/* Close */}
        <button
          onClick={toggle}
          className="btn btn-ghost h-[26px] px-1.5 text-muted hover:text-danger"
          title="Close debug console"
        >
          <X size={14} />
        </button>
      </div>

      {/* Message list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        onScroll={handleScroll}
      >
        {/* Column headers */}
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
            {messages.length === 0
              ? 'Waiting for MAVLink messages...'
              : 'No messages match filter'}
          </div>
        ) : (
          filtered.map((msg) => <MessageRow key={msg.id} msg={msg} />)
        )}
      </div>
    </div>
  );
}
