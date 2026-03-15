/**
 * InavImportDialog.tsx -- Modal dialog for importing INAV "diff all" config.
 *
 * Flow:
 *   1. User pastes INAV "diff all" text (or drops a file)
 *   2. Parser runs, shows summary of what was detected
 *   3. User confirms cell count and reviews mapped vs skipped items
 *   4. On confirm, all mapped params are staged into the wizard store
 *
 * Launched from FrameStep via "Migrating from INAV?" link.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  X,
  Upload,
  FileText,
  Check,
  AlertTriangle,
  ArrowRight,
  Clipboard,
  Info,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  parseInavDiff,
  mapToArduPilot,
  type ImportResult,
  type InavConfig,
} from '@/models/inavImport';
import { useWizardStore } from '../wizardStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { useTelemetryStore } from '@/store/telemetryStore';
import { getBoardById } from '@/models/boardRegistry';

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

interface InavImportDialogProps {
  onClose: () => void;
  onImported: (
    vehicleType?: 'copter' | 'plane' | 'quadplane' | null,
    params?: Record<string, number>,
  ) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type Phase = 'input' | 'preview';

export function InavImportDialog({ onClose, onImported }: InavImportDialogProps) {
  const wizardVehicleType = useWizardStore((s) => s.vehicleType);
  const boardId = useVehicleStore((s) => s.boardId);
  const batteryVoltage = useTelemetryStore((s) => s.battery?.voltage ?? 0);

  const [phase, setPhase] = useState<Phase>('input');
  const [rawText, setRawText] = useState('');
  const [cellCount, setCellCount] = useState(0); // 0 = auto from config
  const [parseError, setParseError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [parsedConfig, setParsedConfig] = useState<InavConfig | null>(null);
  const [validated, setValidated] = useState(false); // true once format check passed

  const board = useMemo(
    () => (boardId ? getBoardById(boardId) : null),
    [boardId],
  );

  // ── Auto-validate on text change ───────────────────────────────────
  // Runs format check immediately when text is loaded (file/paste/drop).
  // Clears errors on new input. Does NOT auto-advance to preview.

  useEffect(() => {
    // Clear previous state on any text change
    setParseError(null);
    setWarnings([]);
    setValidated(false);
    setParsedConfig(null);
    setResult(null);

    const text = rawText.trim();
    if (text.length < 20) return; // Too short, no error yet -- user is still typing

    // Format check
    const hasInavHeader = /^#\s*INAV\s*\//im.test(text);
    const hasDiffAll = /^#\s*diff\s+all/im.test(text);
    const hasDump = /^#\s*dump/im.test(text);
    const hasInavContent = /^(set\s+\S+\s*=|serial\s+\d+|feature\s+|mixer\s+|mmix\s+|aux\s+)/im.test(text);

    if (!hasInavHeader && !hasDiffAll && !hasDump && !hasInavContent) {
      setParseError(
        'This does not look like an INAV configuration file. ' +
        'Expected the output of "dump all" or "diff all" from the INAV Configurator CLI tab.'
      );
      return;
    }

    setValidated(true);
  }, [rawText]);

  // ── Parse (triggered by button) ────────────────────────────────────

  const handleParse = useCallback(() => {
    setParseError(null);
    setWarnings([]);

    const text = rawText.trim();

    // Inline validation (don't rely on validated state which may be stale)
    if (text.length < 20) {
      setParseError('Please load a valid INAV configuration first.');
      return;
    }

    const hasInavHeader = /^#\s*INAV\s*\//im.test(text);
    const hasDiffAll = /^#\s*diff\s+all/im.test(text);
    const hasDump = /^#\s*dump/im.test(text);
    const hasInavContent = /^(set\s+\S+\s*=|serial\s+\d+|feature\s+|mixer\s+|mmix\s+|aux\s+)/im.test(text);

    if (!hasInavHeader && !hasDiffAll && !hasDump && !hasInavContent) {
      setParseError(
        'This does not look like an INAV configuration file. ' +
        'Expected the output of "dump all" or "diff all" from the INAV Configurator CLI tab.'
      );
      return;
    }

    try {
      const config = parseInavDiff(rawText);

      // Sanity check: parser found something useful
      if (!config.mixer && !config.modelPreviewType && config.settings.size === 0
          && config.serialPorts.size === 0 && config.motorCount === 0) {
        setParseError(
          'The file was recognized as INAV format but no usable configuration was found. ' +
          'Make sure you are using "dump all" or "diff all" from the INAV CLI.'
        );
        return;
      }

      const mapped = mapToArduPilot(config, board, cellCount, batteryVoltage);
      setParsedConfig(config);
      setResult(mapped);

      // Auto-pick cell count from config if not manually overridden
      if (cellCount === 0 && mapped.cellCount) {
        setCellCount(mapped.cellCount);
      }

      // ── Non-blocking warnings ────────────────────────────────────
      const newWarnings: string[] = [];

      // Board mismatch: INAV config is for a different board than connected
      if (config.board && board && board.name) {
        // Strip common firmware suffixes before comparing
        const inavBoardNorm = config.board.toUpperCase()
          .replace(/_(SD|HD|V\d+|BT)$/i, '')
          .replace(/[-_]/g, '');
        const apBoardNorm = board.name.toUpperCase().replace(/[-_\s]/g, '');
        // Also check the base board family (e.g. MATEKF405TE matches Matek F405)
        const inavFamily = inavBoardNorm.replace(/TE$|SE$|WING$/, '');
        const apFamily = apBoardNorm.replace(/VTOL$|WING$/, '');
        if (!apBoardNorm.includes(inavBoardNorm) && !inavBoardNorm.includes(apBoardNorm)
            && !apFamily.includes(inavFamily) && !inavFamily.includes(apFamily)) {
          newWarnings.push(
            `Board mismatch: this config is from "${config.board}" but the connected board is "${board.name}". ` +
            `Serial port assignments may not match your hardware. ` +
            `General settings (battery, failsafes, filters, modes) will still be imported.`
          );
        }
      }

      // Vehicle type mismatch: import will override the wizard's vehicle type
      const detectedType = mapped.vehicleType;
      const connectedType = wizardVehicleType;
      if (detectedType && connectedType && detectedType !== connectedType) {
        newWarnings.push(
          `Vehicle type: this config is for a "${detectedType}" (wizard was "${connectedType}"). ` +
          `The wizard will be restarted as "${detectedType}" when you apply.`
        );
      } else if (detectedType && !connectedType) {
        newWarnings.push(
          `Detected vehicle type: ${detectedType}.`
        );
      }

      setWarnings(newWarnings);
      setPhase('preview');
    } catch (e) {
      setParseError(`Parse error: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }, [rawText, board, cellCount]);

  // Re-map when cell count changes in preview
  const handleCellCountChange = useCallback((cells: number) => {
    setCellCount(cells);
    if (parsedConfig) {
      const mapped = mapToArduPilot(parsedConfig, board, cells, batteryVoltage);
      setResult(mapped);
    }
  }, [parsedConfig, board, batteryVoltage]);

  // ── Apply ──────────────────────────────────────────────────────────

  const handleApply = useCallback(() => {
    if (!result) return;
    // Pass result to parent -- it will start the wizard then stage params
    onImported(result.vehicleType, result.params);
  }, [result, onImported]);

  // ── File drop ──────────────────────────────────────────────────────

  const MAX_IMPORT_SIZE = 500_000; // 500 KB -- a diff all is typically under 10 KB

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.size > MAX_IMPORT_SIZE) {
      setParseError('File too large (max 500 KB). A typical INAV dump is under 50 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRawText(reader.result);
      }
    };
    reader.readAsText(file);
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.length > MAX_IMPORT_SIZE) {
        setParseError('Clipboard content too large (max 500 KB). A typical INAV dump is under 50 KB.');
        return;
      }
      setRawText(text);
    } catch {
      // Clipboard API may not be available
    }
  }, []);

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded border border-border bg-surface-1 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Upload size={16} className="text-accent" />
            <h2 className="text-lg font-bold text-foreground">Import INAV Configuration</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {phase === 'input' && (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                Paste your INAV CLI output below. Open the INAV Configurator CLI tab and type{' '}
                <span className="font-mono text-accent">dump all</span>, then copy the full output.
              </p>
              <div className="flex items-start gap-2 rounded border border-blue-500/30 bg-blue-900/15 px-3 py-2">
                <span className="text-[10px] text-blue-400 font-bold mt-0.5">TIP</span>
                <p className="text-xs text-blue-300/80">
                  <span className="font-mono font-semibold">dump all</span> gives the best results
                  (complete output mapping). <span className="font-mono">diff all</span> also works
                  but motor/servo pad assignments may need manual verification.
                </p>
              </div>

              <div
                className="relative"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <textarea
                  value={rawText}
                  onChange={(e) => {
                    if (e.target.value.length > MAX_IMPORT_SIZE) {
                      setParseError('Text too large (max 500 KB). A typical INAV dump is under 50 KB.');
                      return;
                    }
                    setRawText(e.target.value);
                  }}
                  className={`input-field h-56 w-full resize-none font-mono text-xs leading-relaxed ${
                    parseError ? 'border-danger/60' : validated ? 'border-success/40' : ''
                  }`}
                  spellCheck={false}
                />
                {rawText.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <FileText size={32} className="mb-2 text-subtle" />
                    <p className="text-sm text-subtle">Drop a file or paste text</p>
                  </div>
                )}
              </div>

              {/* Validation feedback -- immediately below textarea */}
              {parseError && (
                <div className="flex items-start gap-2 rounded border border-danger/30 bg-danger/5 px-4 py-3">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0 text-danger" />
                  <p className="text-sm text-danger">{parseError}</p>
                </div>
              )}
              {validated && !parseError && rawText.length > 50 && (
                <div className="flex items-center gap-2 text-xs text-success">
                  <Check size={12} />
                  INAV configuration detected. Click "Parse Config" to continue.
                </div>
              )}

              <div className="flex items-center gap-3">
                <button onClick={handlePaste} className="btn btn-ghost gap-1.5 text-sm">
                  <Clipboard size={13} />
                  Paste from clipboard
                </button>
                <label className="btn btn-ghost gap-1.5 text-sm cursor-pointer">
                  <FileText size={13} />
                  Open file
                  <input
                    type="file"
                    accept=".txt,.diff,.cfg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > MAX_IMPORT_SIZE) {
                        setParseError('File too large (max 500 KB). A typical INAV dump is under 50 KB.');
                        e.target.value = '';
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') setRawText(reader.result);
                      };
                      reader.readAsText(file);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>

              {/* Cell count selector */}
              <div className="flex items-center gap-3 rounded border border-border bg-surface-0 px-4 py-3">
                <label className="text-sm text-muted">Battery cell count:</label>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setCellCount(0)}
                    className={`rounded px-3 py-1 text-sm font-bold transition-colors ${
                      cellCount === 0
                        ? 'bg-accent text-black'
                        : 'bg-surface-2 text-muted hover:bg-surface-3'
                    }`}
                  >
                    Auto
                  </button>
                  {[3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      onClick={() => setCellCount(n)}
                      className={`rounded px-3 py-1 text-sm font-bold transition-colors ${
                        cellCount === n
                          ? 'bg-accent text-black'
                          : 'bg-surface-2 text-muted hover:bg-surface-3'
                      }`}
                    >
                      {n}S
                    </button>
                  ))}
                </div>
                <span className="text-xs text-subtle">
                  {cellCount === 0
                    ? 'Will read from INAV config (bat_cells), or default to 4S'
                    : 'Manual override for voltage threshold calculation'}
                </span>
              </div>
            </div>
          )}

          {phase === 'preview' && result && parsedConfig && (
            <div className="space-y-4">
              {/* Non-blocking warnings (board/frame mismatch) */}
              {warnings.length > 0 && (
                <div className="space-y-2">
                  {warnings.map((w, i) => {
                    const isInfo = w.startsWith('Detected vehicle type');
                    return (
                      <div key={i} className={`flex items-start gap-2 rounded border px-4 py-3 ${
                        isInfo
                          ? 'border-blue-500/30 bg-blue-900/10'
                          : 'border-warning/30 bg-warning/5'
                      }`}>
                        {isInfo
                          ? <Info size={14} className="mt-0.5 shrink-0 text-blue-400" />
                          : <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warning" />}
                        <p className={`text-sm ${isInfo ? 'text-blue-300/90' : 'text-warning/90'}`}>{w}</p>
                      </div>
                    );
                  })}
                </div>
              )}
              <PreviewPhase
                config={parsedConfig}
                result={result}
                cellCount={cellCount}
                onCellCountChange={handleCellCountChange}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          {phase === 'input' && (
            <>
              <button onClick={onClose} className="btn btn-ghost">Cancel</button>
              <button
                onClick={handleParse}
                disabled={rawText.trim().length < 20}
                className="btn btn-primary gap-1.5"
              >
                Parse Config
                <ArrowRight size={14} />
              </button>
            </>
          )}

          {phase === 'preview' && (
            <>
              <button
                onClick={() => setPhase('input')}
                className="btn btn-ghost"
              >
                Back
              </button>
              <button onClick={handleApply} className="btn btn-primary gap-1.5">
                <Check size={14} />
                Apply {Object.keys(result?.params ?? {}).length} Parameters
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Preview phase                                                       */
/* ------------------------------------------------------------------ */

function PreviewPhase({
  config,
  result,
  cellCount,
  onCellCountChange,
}: {
  config: InavConfig;
  result: ImportResult;
  cellCount: number;
  onCellCountChange: (cells: number) => void;
}) {
  const [showSkipped, setShowSkipped] = useState(false);
  const paramCount = Object.keys(result.params).length;

  // Group summary items by category
  const categories = useMemo(() => {
    const map = new Map<string, typeof result.summary>();
    for (const item of result.summary) {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    }
    return Array.from(map.entries());
  }, [result.summary]);

  return (
    <div className="space-y-4">
      {/* Detection banner */}
      <div className="flex items-center gap-4 rounded-lg border border-success/40 bg-success/10 px-5 py-4">
        <Check size={24} className="shrink-0 text-success" />
        <div>
          <p className="text-sm font-bold text-success">
            INAV config parsed successfully
          </p>
          <p className="mt-0.5 text-xs text-success/80">
            {config.board && `Board: ${config.board}`}
            {config.version && ` -- INAV ${config.version}`}
            {result.frameDescription && ` -- ${result.frameDescription}`}
            {` -- ${paramCount} parameters mapped`}
          </p>
        </div>
      </div>

      {/* Cell count (adjustable in preview too) */}
      <div className="flex items-center gap-3 rounded border border-border bg-surface-0 px-4 py-2.5">
        <label className="text-xs text-muted">Cell count:</label>
        <div className="flex gap-1">
          {[3, 4, 5, 6].map((n) => (
            <button
              key={n}
              onClick={() => onCellCountChange(n)}
              className={`rounded px-2.5 py-0.5 text-xs font-bold transition-colors ${
                cellCount === n
                  ? 'bg-accent text-black'
                  : 'bg-surface-2 text-muted hover:bg-surface-3'
              }`}
            >
              {n}S
            </button>
          ))}
        </div>
        <span className="text-[10px] text-subtle">
          {result.detected.cellCount === cellCount && config.batteryCells
            ? `Detected from INAV config (bat_cells = ${config.batteryCells})`
            : 'Affects battery voltage thresholds'}
        </span>
      </div>

      {/* Mapped items */}
      <div className="space-y-3">
        {categories.map(([category, items]) => (
          <div key={category} className="rounded border border-border bg-surface-0 overflow-hidden">
            <div className="px-4 py-2 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                {category}
              </span>
            </div>
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-2 border-b border-border last:border-b-0"
              >
                <Check size={12} className="shrink-0 text-success" />
                <span className="flex-1 text-sm text-foreground">{item.label}</span>
                <span className="text-xs text-subtle">{item.inavValue}</span>
                <ArrowRight size={10} className="text-subtle" />
                <span className="font-mono text-xs text-accent">{item.arduPilotParam}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Skipped items */}
      {result.skipped.length > 0 && (
        <div className="rounded border border-border bg-surface-0 overflow-hidden">
          <button
            onClick={() => setShowSkipped(!showSkipped)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-surface-1 transition-colors"
          >
            {showSkipped ? <ChevronDown size={13} className="text-muted" /> : <ChevronRight size={13} className="text-muted" />}
            <AlertTriangle size={12} className="text-warning" />
            <span className="text-xs font-bold text-muted">
              {result.skipped.length} items not converted
            </span>
          </button>

          {showSkipped && (
            <div className="border-t border-border">
              {result.skipped.map((item, i) => (
                <div key={i} className="px-4 py-2.5 border-b border-border last:border-b-0">
                  <span className="text-xs font-semibold text-foreground">{item.category}</span>
                  <p className="mt-0.5 text-xs text-muted">{item.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Safety note */}
      <div className="flex items-start gap-2 rounded border border-border bg-surface-0 px-4 py-2.5">
        <Info size={13} className="mt-0.5 shrink-0 text-muted" />
        <p className="text-xs text-muted">
          Imported values will pre-fill the wizard steps. You can review and adjust
          each setting as you walk through the wizard. Always verify the final
          configuration before flying.
        </p>
      </div>
    </div>
  );
}
