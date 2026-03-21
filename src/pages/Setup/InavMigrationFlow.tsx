/**
 * InavMigrationFlow.tsx -- Guided migration from INAV to ArduPilot.
 *
 * Three screens:
 *   1. Welcome: detected INAV, choose migrate-with-config or start-fresh
 *   2. Extract + Preview: pull "dump all", show parsed summary, download firmware
 *   3. Flash + Connect: flash instructions, then reconnect to ArduPilot
 */

import { useState, useCallback, useRef } from 'react';
import {
  ArrowRight, ArrowLeft, Download, Check, Loader2, AlertTriangle,
  Cpu, Wifi, Copy, ExternalLink,
} from 'lucide-react';
import { InavCli, type InavInfo } from '@/mavlink/inavCli';
import { lookupArduPilotBoard, type InavBoardMapping } from '@/models/inavBoardMap';
import { parseInavDiff, type InavConfig } from '@/models/inavImport';
import { connectionManager } from '@/mavlink/connection';
import { useConnectionStore } from '@/store/connectionStore';

type Step = 'welcome' | 'extract' | 'flash';

interface InavMigrationFlowProps {
  portPath: string;
  baudRate: number;
  portManufacturer: string;
  onComplete: (config: { inavDump: string; inavConfig: InavConfig } | null) => void;
  onCancel: () => void;
}

export function InavMigrationFlow({
  portPath, baudRate, portManufacturer, onComplete, onCancel,
}: InavMigrationFlowProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [migrateWithConfig, setMigrateWithConfig] = useState(true);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Accumulating progress log -- each entry stays visible
  interface LogEntry { text: string; done: boolean }
  const [log, setLog] = useState<LogEntry[]>([]);
  const pushLog = useCallback((text: string) => {
    setLog((prev) => {
      // Mark previous entry as done, add new active entry
      const updated = prev.map((e) => ({ ...e, done: true }));
      updated.push({ text, done: false });
      return updated;
    });
  }, []);
  const finishLog = useCallback(() => {
    setLog((prev) => prev.map((e) => ({ ...e, done: true })));
  }, []);

  // Extracted data
  const [, setInavInfo] = useState<InavInfo | null>(null);
  const [inavDump, setInavDump] = useState<string | null>(null);
  const [inavConfig, setInavConfig] = useState<InavConfig | null>(null);
  const [boardMapping, setBoardMapping] = useState<InavBoardMapping | null>(null);
  const [hexUrl, setHexUrl] = useState<string | null>(null);
  const [hexSaved, setHexSaved] = useState(false);
  const [vehicleType, setVehicleType] = useState<'copter' | 'plane'>('copter');
  const [autoDetectedType, setAutoDetectedType] = useState(false);
  const [extractDone, setExtractDone] = useState(false);

  const cliRef = useRef<InavCli | null>(null);

  // ── Extraction logic ────────────────────────────────────────────

  const runExtraction = useCallback(async () => {
    setStep('extract');
    setExtractDone(false);
    setError(null);
    setLog([]);

    const cli = new InavCli();
    cliRef.current = cli;

    try {
      pushLog('Opening serial port...');
      await cli.open(portPath, baudRate);

      pushLog('Entering CLI mode...');
      await cli.enterCli();

      pushLog('Reading board info...');
      const info = await cli.getStatus();
      setInavInfo(info);
      pushLog(`Board: ${info.boardTarget ?? 'Unknown'} -- INAV ${info.version ?? 'Unknown'}`);

      // Extract dump all (if migrating with config)
      let rawDump: string | null = null;
      let config: InavConfig | null = null;
      let detectedType: 'copter' | 'plane' = vehicleType;

      if (migrateWithConfig) {
        pushLog('Extracting full configuration (this may take a few seconds)...');
        rawDump = await cli.extractDumpAll();
        setInavDump(rawDump);
        const lineCount = rawDump.split('\n').length;
        pushLog(`Captured ${lineCount} lines`);

        pushLog('Parsing configuration...');
        config = parseInavDiff(rawDump);
        setInavConfig(config);

        // Build a summary of what was found
        const found: string[] = [];
        const craftName = config.craftName ?? config.settings.get('name');
        if (craftName) found.push(`Name: ${craftName}`);
        if (config.platformType) found.push(config.platformType);
        if (config.motorCount > 0) found.push(`${config.motorCount} motors`);
        const rx = config.settings.get('serialrx_provider');
        if (rx) found.push(`RX: ${rx}`);
        if (config.features.get('GPS')) found.push('GPS');
        const osd = config.settings.get('osd_video_system');
        if (osd && osd !== 'AUTO') found.push(`OSD: ${osd}`);
        pushLog(`Found: ${found.join(', ')}`);

        if (!info.boardTarget && config.board) {
          info.boardTarget = config.board;
          setInavInfo({ ...info });
        }

        // Auto-detect vehicle type
        if (config.platformType === 'AIRPLANE' ||
            config.mixer?.includes('FLYING_WING') || config.mixer?.includes('AIRPLANE') ||
            (config.motorCount === 1 && config.servoCount > 0)) {
          detectedType = 'plane';
          setVehicleType('plane');
          setAutoDetectedType(true);
        } else if (config.platformType || config.mixer || config.motorCount > 0) {
          setAutoDetectedType(true);
        }

        // Pre-store craft name for the wizard prompt
        if (craftName) {
          try { sessionStorage.setItem('ardugui-inav-craft-name', craftName); } catch { /* ignore */ }
        }
      }

      // Look up ArduPilot board
      if (info.boardTarget) {
        const mapping = lookupArduPilotBoard(info.boardTarget);
        setBoardMapping(mapping);
        if (mapping) {
          pushLog(`ArduPilot board: ${mapping.displayName} (${mapping.arduPlatform})`);
          const typeDir = detectedType === 'copter' ? 'Copter' : 'Plane';
          const typeName = detectedType === 'copter' ? 'arducopter' : 'arduplane';
          setHexUrl(`https://firmware.ardupilot.org/${typeDir}/latest/${mapping.arduPlatform}/${typeName}_with_bl.hex`);
        } else {
          pushLog(`No ArduPilot match for "${info.boardTarget}"`);
        }
      }

      // Exit CLI mode to reboot the FC back to normal operation
      pushLog('Rebooting board...');
      await cli.exitCli();
      await new Promise((r) => setTimeout(r, 500));
      await cli.close();

      finishLog();
      setExtractDone(true);
    } catch (err) {
      finishLog();
      setError(`Extraction failed: ${err}`);
      try { await cli.close(); } catch { /* ignore */ }
    }
  }, [portPath, baudRate, migrateWithConfig, vehicleType, pushLog, finishLog]);

  // ── Firmware download ──────────────────────────────────────────

  const [savePath, setSavePath] = useState('');

  const handleDownloadHex = useCallback(async () => {
    if (!hexUrl) return;
    setError(null);
    setProgress('Downloading...');
    try {
      const result = await fetch(hexUrl);
      if (!result.ok) throw new Error(`HTTP ${result.status}`);
      const fileName = hexUrl.split('/').pop() ?? 'firmware_with_bl.hex';
      const saved = await window.electronAPI?.fs.saveFile(fileName, await result.text());
      if (saved) {
        setHexSaved(true);
        setSavePath(saved);
        setProgress('');
      }
    } catch (err) {
      setError(`Download failed: ${err}`);
      setProgress('');
    }
  }, [hexUrl]);

  // ── Vehicle type change ────────────────────────────────────────

  const handleVehicleTypeChange = (type: 'copter' | 'plane') => {
    setVehicleType(type);
    if (boardMapping) {
      const typeDir = type === 'copter' ? 'Copter' : 'Plane';
      const typeName = type === 'copter' ? 'arducopter' : 'arduplane';
      setHexUrl(`https://firmware.ardupilot.org/${typeDir}/latest/${boardMapping.arduPlatform}/${typeName}_with_bl.hex`);
      setHexSaved(false);
      setSavePath('');
    }
  };

  // ── Reconnect logic ────────────────────────────────────────────

  const [reconnecting, setReconnecting] = useState(false);

  const tryReconnect = useCallback(async () => {
    setReconnecting(true);
    setError(null);
    setProgress('Looking for ArduPilot...');

    try {
      await connectionManager.connect(portPath, baudRate);

      const connected = await new Promise<boolean>((resolve) => {
        if (useConnectionStore.getState().status === 'connected') {
          resolve(true);
          return;
        }
        const timeout = setTimeout(() => { unsub(); resolve(false); }, 20000);
        const unsub = useConnectionStore.subscribe((state) => {
          if (state.status === 'connected') {
            clearTimeout(timeout); unsub(); resolve(true);
          } else if (state.status === 'disconnected') {
            clearTimeout(timeout); unsub(); resolve(false);
          }
        });
      });

      if (connected) {
        setProgress('ArduPilot connected!');
        onComplete(migrateWithConfig && inavDump && inavConfig
          ? { inavDump, inavConfig }
          : null);
      } else {
        setError(
          'Could not establish ArduPilot connection. ' +
          'Try disconnecting and reconnecting the USB cable, then click Retry.'
        );
        setReconnecting(false);
      }
    } catch {
      setError(
        'Connection failed -- the board may not have rebooted yet. ' +
        'Disconnect and reconnect the USB cable, wait a few seconds, then click Retry.'
      );
      setReconnecting(false);
      try { await connectionManager.disconnect(); } catch { /* ignore */ }
    }
  }, [portPath, baudRate, migrateWithConfig, inavDump, inavConfig, onComplete]);

  // ── Helpers ────────────────────────────────────────────────────

  const isLinux = navigator.userAgent.includes('Linux');
  const isMac = navigator.userAgent.includes('Mac');

  const [copied, setCopied] = useState('');
  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const StepBadge = ({ n }: { n: number }) => (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-accent/20 text-xs font-bold text-accent mr-2">{n}</span>
  );

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">INAV Migration</h1>
        <p className="mt-1 text-sm text-muted">
          Detected <span className="font-semibold text-accent">{portManufacturer}</span> on {portPath}
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* SCREEN 1: Welcome                                           */}
      {/* ════════════════════════════════════════════════════════════ */}
      {step === 'welcome' && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-start gap-3">
              <Cpu size={24} className="mt-0.5 shrink-0 text-accent" />
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  This board is running INAV
                </h2>
                <p className="mt-1 text-sm text-muted">
                  ArduGUI can help you migrate to ArduPilot. Your INAV configuration
                  (receiver, GPS, OSD, failsafes, motor mapping) can be automatically
                  translated to ArduPilot parameters.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => { setMigrateWithConfig(true); runExtraction(); }}
              className="w-full rounded border-2 border-accent bg-accent/10 p-4 text-left transition hover:bg-accent/20"
            >
              <p className="text-sm font-bold text-accent">Migrate with my INAV configuration</p>
              <p className="mt-1 text-xs text-muted">
                Extract your current INAV settings and apply them to ArduPilot.
                Receiver, GPS, battery, failsafes, and motor mapping will be translated automatically.
              </p>
            </button>

            <button
              onClick={() => { setMigrateWithConfig(false); runExtraction(); }}
              className="w-full rounded border-2 border-border bg-surface-0 p-4 text-left transition hover:border-accent/40"
            >
              <p className="text-sm font-bold text-foreground">Start fresh on ArduPilot</p>
              <p className="mt-1 text-xs text-muted">
                Just identify the board and download the correct firmware.
                Configuration starts from scratch in the ArduPilot wizard.
              </p>
            </button>
          </div>

          <button onClick={onCancel}
            className="w-full text-center text-xs text-subtle hover:text-muted py-1">
            Cancel -- go back to Connect
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* SCREEN 2: Extract + Preview + Firmware Download              */}
      {/* One continuous layout that grows as steps complete            */}
      {/* ════════════════════════════════════════════════════════════ */}
      {step === 'extract' && (
        <div className="space-y-4">

          {/* Progress log -- always visible, grows as extraction proceeds */}
          <div className="card p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">
              {migrateWithConfig ? 'Configuration Extraction' : 'Board Identification'}
            </h3>
            <div className="space-y-1.5">
              {log.map((entry, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {entry.done ? (
                    <Check size={14} className="mt-0.5 shrink-0 text-success" />
                  ) : (
                    <Loader2 size={14} className="mt-0.5 shrink-0 text-accent animate-spin" />
                  )}
                  <span className={entry.done ? 'text-muted' : 'text-foreground'}>
                    {entry.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Error inline */}
            {error && (
              <div className="mt-3 rounded border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger">
                <AlertTriangle size={14} className="mr-2 inline" />
                {error}
              </div>
            )}
          </div>

          {/* Firmware download -- appears when extraction is done and board is matched */}
          {extractDone && boardMapping && (
            <div className="card p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">Firmware</h3>
              {autoDetectedType ? (
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-muted">Detected:</span>
                  <span className="rounded bg-accent/20 px-3 py-1.5 text-xs font-bold text-accent">
                    {vehicleType === 'copter' ? 'Copter' : 'Plane'}
                  </span>
                  <button
                    onClick={() => { handleVehicleTypeChange(vehicleType === 'copter' ? 'plane' : 'copter'); setAutoDetectedType(false); }}
                    className="text-xs text-subtle hover:text-muted transition"
                  >
                    Wrong? Change
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-muted">Vehicle type:</span>
                  <button onClick={() => handleVehicleTypeChange('copter')}
                    className={`rounded px-3 py-1.5 text-xs font-bold transition ${
                      vehicleType === 'copter'
                        ? 'bg-accent text-black' : 'bg-surface-2 text-muted hover:bg-surface-3'
                    }`}>Copter</button>
                  <button onClick={() => handleVehicleTypeChange('plane')}
                    className={`rounded px-3 py-1.5 text-xs font-bold transition ${
                      vehicleType === 'plane'
                        ? 'bg-accent text-black' : 'bg-surface-2 text-muted hover:bg-surface-3'
                    }`}>Plane</button>
                </div>
              )}

              {hexUrl && (
                <div className="space-y-3">
                  <div className="rounded bg-surface-2 px-3 py-2 font-mono text-xs text-muted break-all">
                    {hexUrl}
                  </div>
                  <button onClick={handleDownloadHex}
                    disabled={hexSaved}
                    className="btn btn-primary w-full gap-2">
                    {hexSaved
                      ? <><Check size={14} /> Firmware saved</>
                      : <><Download size={14} /> Download firmware (.hex)</>
                    }
                  </button>
                  {hexSaved && savePath && (
                    <p className="text-xs text-success">Saved to: {savePath}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* No board mapping */}
          {extractDone && !boardMapping && (
            <div className="rounded border border-danger/40 bg-danger/5 px-4 py-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-danger" />
                <div>
                  <p className="text-sm font-bold text-danger">Board not found in ArduPilot database</p>
                  <p className="mt-1 text-xs text-danger/80">
                    You can download firmware manually from{' '}
                    <a href="https://firmware.ardupilot.org" target="_blank" rel="noopener noreferrer"
                      className="underline">firmware.ardupilot.org</a>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            <button onClick={onCancel} className="btn btn-ghost gap-1">
              Cancel
            </button>
            {extractDone && (
              <button onClick={() => { setStep('flash'); setError(null); }}
                className="btn btn-primary flex-1 gap-2">
                Continue to flash instructions <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* SCREEN 3: Flash Instructions + Reconnect                     */}
      {/* ════════════════════════════════════════════════════════════ */}
      {step === 'flash' && (
        <div className="space-y-4">

          {/* Flash instructions (hidden while connecting) */}
          {!reconnecting && (
            <div className="card p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">
                Flash ArduPilot Firmware
              </h3>
              <p className="text-sm text-muted mb-4">
                Use the INAV Configurator to flash the ArduPilot firmware file you just downloaded.
                This replaces INAV with ArduPilot including its bootloader.
              </p>

              {/* Primary: INAV Configurator */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-accent uppercase tracking-wider">Using INAV Configurator</p>
                <div className="space-y-2.5 text-sm text-muted">
                  <p><StepBadge n={1} />
                    Open INAV Configurator and connect to the board.
                  </p>
                  <p><StepBadge n={2} />
                    Go to the <span className="font-semibold text-foreground">Firmware Flasher</span> tab.
                  </p>
                  <p><StepBadge n={3} />
                    Click <span className="font-semibold text-foreground">Load Firmware [Local]</span> and select the
                    <span className="font-mono text-xs text-accent"> _with_bl.hex</span> file you downloaded.
                  </p>
                  {hexSaved && savePath && (
                    <div className="flex items-center gap-2 ml-7">
                      <code className="flex-1 rounded bg-surface-2 px-3 py-1.5 font-mono text-xs text-foreground break-all">
                        {savePath}
                      </code>
                      <button onClick={() => copyText(savePath, 'path')}
                        className="btn btn-ghost h-7 px-2 text-xs">
                        {copied === 'path' ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  )}
                  <p><StepBadge n={4} />
                    Check <span className="font-semibold text-foreground">"Full chip erase"</span> and click
                    <span className="font-semibold text-foreground"> Flash Firmware</span>.
                  </p>
                  <p><StepBadge n={5} />
                    Wait for the flash to complete. The board will reboot into ArduPilot automatically.
                  </p>
                  <p><StepBadge n={6} />
                    <span className="font-semibold text-foreground">Disconnect and reconnect the USB cable.</span> Some boards
                    (especially F4-based) need a power cycle to boot into the new firmware cleanly.
                  </p>
                </div>
              </div>

              {/* Alternative: dfu-util (collapsible) */}
              <details className="mt-5">
                <summary className="cursor-pointer text-xs font-bold text-subtle hover:text-muted uppercase tracking-wider">
                  Alternative: command-line (dfu-util)
                </summary>
                <div className="mt-3 space-y-2 text-sm text-muted border-t border-border pt-3">
                  <p>If you don't have the INAV Configurator, you can flash via dfu-util from the command line.</p>

                  <p>1. Put the board in DFU mode -- either type <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-foreground">dfu</code> in
                     the INAV CLI, or hold the BOOT button while plugging USB.</p>

                  {isLinux && (
                    <>
                      <p>2. Install dfu-util if needed:</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 rounded bg-surface-2 px-3 py-1.5 font-mono text-xs text-foreground">
                          sudo apt install dfu-util
                        </code>
                        <button onClick={() => copyText('sudo apt install dfu-util', 'install')}
                          className="btn btn-ghost h-7 px-2 text-xs">
                          {copied === 'install' ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                      <p>3. Flash:</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 rounded bg-surface-2 px-3 py-1.5 font-mono text-xs text-foreground break-all">
                          {hexSaved && savePath
                            ? `sudo dfu-util -a 0 -s 0x08000000:leave -D "${savePath}"`
                            : 'sudo dfu-util -a 0 -s 0x08000000:leave -D /path/to/firmware_with_bl.hex'}
                        </code>
                        <button onClick={() => copyText(
                          hexSaved && savePath
                            ? `sudo dfu-util -a 0 -s 0x08000000:leave -D "${savePath}"`
                            : 'sudo dfu-util -a 0 -s 0x08000000:leave -D /path/to/firmware_with_bl.hex',
                          'flash-cmd'
                        )} className="btn btn-ghost h-7 px-2 text-xs">
                          {copied === 'flash-cmd' ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </>
                  )}

                  {isMac && (
                    <>
                      <p>2. Install: <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-foreground">brew install dfu-util</code></p>
                      <p>3. Flash: <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-foreground">dfu-util -a 0 -s 0x08000000:leave -D /path/to/firmware.hex</code></p>
                    </>
                  )}

                  {!isLinux && !isMac && (
                    <p>On Windows, use{' '}
                      <a href="https://www.st.com/en/development-tools/stm32cubeprog.html"
                        target="_blank" rel="noopener noreferrer"
                        className="text-accent underline">
                        STM32CubeProgrammer <ExternalLink size={10} className="inline" />
                      </a>{' '}
                      or ImpulseRC Driver Fixer to flash in DFU mode.
                    </p>
                  )}
                </div>
              </details>
            </div>
          )}

          {/* Connect / connecting */}
          {reconnecting ? (
            <div className="card p-6">
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                  <Loader2 size={28} className="text-accent animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-foreground">Connecting to ArduPilot</p>
                  <p className="mt-1 text-sm text-muted">{progress}</p>
                </div>
              </div>
            </div>
          ) : (
            <button onClick={tryReconnect}
              className="btn btn-primary gap-2 w-full py-3 text-base">
              <Wifi size={16} /> I've flashed the firmware -- connect to ArduPilot
            </button>
          )}

          {/* Error */}
          {error && (
            <div className="rounded border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
              <AlertTriangle size={14} className="mr-2 inline" />
              {error}
              <button onClick={tryReconnect}
                className="ml-3 rounded bg-danger/20 px-2 py-1 text-xs font-bold hover:bg-danger/30">
                Retry
              </button>
            </div>
          )}

          {/* Back */}
          {!reconnecting && (
            <div className="flex gap-3">
              <button onClick={() => { setStep('extract'); setError(null); }} className="btn btn-ghost gap-1">
                <ArrowLeft size={14} /> Back
              </button>
              <button onClick={onCancel} className="btn btn-ghost">
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
