/**
 * InavMigrationFlow.tsx -- Multi-step guided migration from INAV to ArduPilot.
 *
 * Steps:
 *   1. Welcome: detected INAV, choose migrate-with-config or start-fresh
 *   2. Extract: auto-pull "dump all" from INAV CLI
 *   3. Firmware: identify ArduPilot firmware, download _with_bl.hex
 *   4. Flash: platform-specific DFU instructions
 *   5. Connect: try MAVLink connection to the now-ArduPilot board
 *   6. Done: hand off to wizard with imported config (or fresh)
 */

import { useState, useCallback, useRef } from 'react';
import {
  ArrowRight, ArrowLeft, Download, Check, Loader2, AlertTriangle,
  Terminal, Cpu, Wifi, RefreshCw, Copy, ExternalLink,
} from 'lucide-react';
import { InavCli, type InavInfo } from '@/mavlink/inavCli';
import { lookupArduPilotBoard, type InavBoardMapping } from '@/models/inavBoardMap';
import { parseInavDiff, type InavConfig } from '@/models/inavImport';
import { connectionManager } from '@/mavlink/connection';
import { useConnectionStore } from '@/store/connectionStore';

type Step = 'welcome' | 'extract' | 'firmware' | 'flash' | 'reconnect';

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

  // Extracted data
  const [inavInfo, setInavInfo] = useState<InavInfo | null>(null);
  const [inavDump, setInavDump] = useState<string | null>(null);
  const [inavConfig, setInavConfig] = useState<InavConfig | null>(null);
  const [boardMapping, setBoardMapping] = useState<InavBoardMapping | null>(null);
  const [hexUrl, setHexUrl] = useState<string | null>(null);
  const [hexSaved, setHexSaved] = useState(false);
  const [vehicleType, setVehicleType] = useState<'copter' | 'plane'>('copter');
  /** True when vehicle type was auto-detected from INAV config (not user-chosen) */
  const [autoDetectedType, setAutoDetectedType] = useState(false);

  const cliRef = useRef<InavCli | null>(null);

  // ── Step 2: Extract config via CLI ─────────────────────────────────

  const runExtraction = useCallback(async () => {
    setStep('extract');
    setError(null);
    setProgress('Opening serial port...');

    const cli = new InavCli();
    cliRef.current = cli;

    try {
      await cli.open(portPath, baudRate);

      // Get board info
      await cli.enterCli(setProgress);
      const info = await cli.getStatus(setProgress);
      setInavInfo(info);

      // Extract dump all (if migrating with config)
      let rawDump: string | null = null;
      let config: InavConfig | null = null;
      // Track detected type locally -- state update is async, can't rely
      // on vehicleType from the closure for hex URL construction below
      let detectedType: 'copter' | 'plane' = vehicleType;

      if (migrateWithConfig) {
        rawDump = await cli.extractDumpAll(setProgress);
        setInavDump(rawDump);

        // Parse the config
        setProgress('Parsing configuration...');
        config = parseInavDiff(rawDump);
        setInavConfig(config);

        // Use parsed board name if status didn't find it
        if (!info.boardTarget && config.board) {
          info.boardTarget = config.board;
          setInavInfo({ ...info });
        }

        // Auto-detect vehicle type from INAV config
        // Use platform_type and mixer as reliable indicators. motor/servo count
        // from mmix/smix lines is also reliable. model_preview_type is NOT used
        // (it's a configurator preset ID, not a frame type).
        if (config.platformType === 'AIRPLANE' ||
            config.mixer?.includes('FLYING_WING') || config.mixer?.includes('AIRPLANE') ||
            (config.motorCount === 1 && config.servoCount > 0)) {
          detectedType = 'plane';
          setVehicleType('plane');
          setAutoDetectedType(true);
        } else if (config.platformType || config.mixer || config.motorCount > 0) {
          // Detected as copter (not just default)
          setAutoDetectedType(true);
        }

        // Pre-store craft name so it's available when the board reconnects
        // as ArduPilot (identifyAircraft fires before handleMigrationComplete)
        const craftName = config.craftName ?? config.settings.get('name');
        if (craftName) {
          try { sessionStorage.setItem('ardugui-inav-craft-name', craftName); } catch { /* ignore */ }
        }
      }

      // Look up ArduPilot board
      if (info.boardTarget) {
        const mapping = lookupArduPilotBoard(info.boardTarget);
        setBoardMapping(mapping);

        if (mapping) {
          // Build the hex URL using the locally-tracked type (not stale state)
          const typeDir = detectedType === 'copter' ? 'Copter' : 'Plane';
          const typeName = detectedType === 'copter' ? 'arducopter' : 'arduplane';
          setHexUrl(`https://firmware.ardupilot.org/${typeDir}/latest/${mapping.arduPlatform}/${typeName}_with_bl.hex`);
        }
      }

      // Exit CLI mode (sends "exit" which reboots the FC back to normal operation).
      // Without this, the FC stays in CLI mode and INAV Configurator can't connect.
      setProgress('Rebooting board...');
      await cli.exitCli();
      // Give the FC a moment to start rebooting before we close the port
      await new Promise((r) => setTimeout(r, 500));
      await cli.close();

      setStep('firmware');
    } catch (err) {
      setError(`Extraction failed: ${err}`);
      setProgress('');
      try { await cli.close(); } catch { /* ignore */ }
    }
  }, [portPath, baudRate, migrateWithConfig, vehicleType]);

  // ── Step 3: Download firmware ─────────────────────────────────────

  const handleDownloadHex = useCallback(async () => {
    if (!hexUrl) return;
    setError(null);
    setProgress('Downloading firmware...');

    try {
      const result = await window.electronAPI?.net.fetch(hexUrl);
      if (!result?.ok || !result.text) {
        throw new Error(result?.error ?? 'Download failed');
      }

      // Save to file
      const fileName = hexUrl.split('/').pop() ?? 'firmware_with_bl.hex';
      const saved = await window.electronAPI?.fs.saveFile(fileName, result.text);
      if (saved) {
        setHexSaved(true);
        setProgress(`Saved to: ${saved}`);
      }
    } catch (err) {
      setError(`Download failed: ${err}`);
      setProgress('');
    }
  }, [hexUrl]);

  // ── Step 5: Try MAVLink reconnect ─────────────────────────────────

  const [reconnecting, setReconnecting] = useState(false);

  const tryReconnect = useCallback(async () => {
    setReconnecting(true);
    setError(null);
    setProgress('Looking for ArduPilot...');

    try {
      await connectionManager.connect(portPath, baudRate);

      // Wait for full connection
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
        // Hand off to caller with the saved config
        onComplete(migrateWithConfig && inavDump && inavConfig
          ? { inavDump, inavConfig }
          : null);
      } else {
        setError('Could not establish ArduPilot connection. Make sure the firmware was flashed correctly.');
        setReconnecting(false);
      }
    } catch (err) {
      setError(`Connection failed: ${err}`);
      setReconnecting(false);
    }
  }, [portPath, baudRate, migrateWithConfig, inavDump, inavConfig, onComplete]);

  // ── Platform detection ────────────────────────────────────────────

  const isLinux = navigator.userAgent.includes('Linux');
  const isMac = navigator.userAgent.includes('Mac');

  // ── Update hex URL when vehicle type changes ─────────────────────

  const handleVehicleTypeChange = (type: 'copter' | 'plane') => {
    setVehicleType(type);
    if (boardMapping) {
      const typeDir = type === 'copter' ? 'Copter' : 'Plane';
      const typeName = type === 'copter' ? 'arducopter' : 'arduplane';
      setHexUrl(`https://firmware.ardupilot.org/${typeDir}/latest/${boardMapping.arduPlatform}/${typeName}_with_bl.hex`);
      setHexSaved(false);
    }
  };

  // ── Copy to clipboard helper ─────────────────────────────────────

  const [copied, setCopied] = useState('');
  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">INAV Migration</h1>
        <p className="mt-1 text-sm text-muted">
          Detected <span className="font-semibold text-accent">{portManufacturer}</span> on {portPath}
        </p>
      </div>

      {/* ── STEP 1: Welcome ── */}
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

      {/* ── STEP 2: Extracting ── */}
      {step === 'extract' && (
        <div className="card p-6">
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
              <Terminal size={28} className="text-accent animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-foreground">
                {migrateWithConfig ? 'Extracting INAV Configuration' : 'Reading Board Info'}
              </p>
              <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted">
                <Loader2 size={14} className="animate-spin text-accent" />
                <span>{progress}</span>
              </div>
            </div>
            {error && (
              <div className="w-full rounded border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
                <AlertTriangle size={14} className="mr-2 inline" />
                {error}
                <button onClick={runExtraction}
                  className="ml-3 rounded bg-danger/20 px-2 py-1 text-xs font-bold hover:bg-danger/30">
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 3: Firmware ── */}
      {step === 'firmware' && (
        <div className="space-y-4">
          {/* Board info card */}
          <div className="card p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">Board Detected</h3>

            {/* Aircraft name -- prominent if available */}
            {migrateWithConfig && inavConfig && (inavConfig.craftName ?? inavConfig.settings.get('name')) && (
              <p className="mb-3 text-lg font-bold text-accent">
                {inavConfig.craftName ?? inavConfig.settings.get('name')}
              </p>
            )}

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="text-xs text-subtle">INAV Target</span>
                <p className="font-mono font-bold text-foreground">{inavInfo?.boardTarget ?? 'Unknown'}</p>
              </div>
              <div>
                <span className="text-xs text-subtle">INAV Version</span>
                <p className="font-mono font-bold text-foreground">{inavInfo?.version ?? 'Unknown'}</p>
              </div>
              {boardMapping && (
                <>
                  <div>
                    <span className="text-xs text-subtle">ArduPilot Board</span>
                    <p className="font-mono font-bold text-accent">{boardMapping.displayName}</p>
                  </div>
                  <div>
                    <span className="text-xs text-subtle">ArduPilot Platform</span>
                    <p className="font-mono text-muted">{boardMapping.arduPlatform}</p>
                  </div>
                </>
              )}
              {migrateWithConfig && inavConfig && (
                <div>
                  <span className="text-xs text-subtle">Config Lines</span>
                  <p className="font-bold text-foreground">{inavDump?.split('\n').length ?? 0}</p>
                </div>
              )}
            </div>
          </div>

          {/* No mapping found */}
          {!boardMapping && (
            <div className="rounded border border-danger/40 bg-danger/5 px-4 py-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-danger" />
                <div>
                  <p className="text-sm font-bold text-danger">Board not found in ArduPilot database</p>
                  <p className="mt-1 text-xs text-danger/80">
                    The INAV target "{inavInfo?.boardTarget}" doesn't have a known ArduPilot equivalent.
                    You may need to manually identify the correct firmware on{' '}
                    <a href="https://firmware.ardupilot.org" target="_blank" rel="noopener noreferrer"
                      className="underline">firmware.ardupilot.org</a>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Vehicle type + download */}
          {boardMapping && (
            <>
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
                    {progress && hexSaved && (
                      <p className="text-xs text-success">{progress}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('welcome')} className="btn btn-ghost gap-1">
                  <ArrowLeft size={14} /> Back
                </button>
                <button onClick={() => setStep('flash')}
                  className="btn btn-primary flex-1 gap-2">
                  Next: Flash Instructions <ArrowRight size={14} />
                </button>
              </div>
            </>
          )}

          {!boardMapping && (
            <div className="flex gap-3">
              <button onClick={() => setStep('welcome')} className="btn btn-ghost gap-1">
                <ArrowLeft size={14} /> Back
              </button>
              <button onClick={onCancel} className="btn btn-ghost flex-1">
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 4: Flash instructions ── */}
      {step === 'flash' && (
        <div className="space-y-4">
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
                <p><span className="inline-flex h-5 w-5 items-center justify-center rounded bg-accent/20 text-xs font-bold text-accent mr-2">1</span>
                  Open INAV Configurator and connect to the board.
                </p>
                <p><span className="inline-flex h-5 w-5 items-center justify-center rounded bg-accent/20 text-xs font-bold text-accent mr-2">2</span>
                  Go to the <span className="font-semibold text-foreground">Firmware Flasher</span> tab.
                </p>
                <p><span className="inline-flex h-5 w-5 items-center justify-center rounded bg-accent/20 text-xs font-bold text-accent mr-2">3</span>
                  Click <span className="font-semibold text-foreground">Load Firmware [Local]</span> and select the
                  <span className="font-mono text-xs text-accent"> _with_bl.hex</span> file you downloaded in the previous step.
                </p>
                {hexSaved && progress.includes('Saved to:') && (
                  <div className="flex items-center gap-2 ml-7">
                    <code className="flex-1 rounded bg-surface-2 px-3 py-1.5 font-mono text-xs text-foreground break-all">
                      {progress.replace('Saved to: ', '')}
                    </code>
                    <button onClick={() => copyText(progress.replace('Saved to: ', ''), 'path')}
                      className="btn btn-ghost h-7 px-2 text-xs">
                      {copied === 'path' ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                )}
                <p><span className="inline-flex h-5 w-5 items-center justify-center rounded bg-accent/20 text-xs font-bold text-accent mr-2">4</span>
                  Check <span className="font-semibold text-foreground">"Full chip erase"</span> and click
                  <span className="font-semibold text-foreground"> Flash Firmware</span>.
                </p>
                <p><span className="inline-flex h-5 w-5 items-center justify-center rounded bg-accent/20 text-xs font-bold text-accent mr-2">5</span>
                  Wait for the flash to complete. The board will reboot into ArduPilot automatically.
                </p>
                <p><span className="inline-flex h-5 w-5 items-center justify-center rounded bg-accent/20 text-xs font-bold text-accent mr-2">6</span>
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
                        {hexSaved && progress.includes('Saved to:')
                          ? `sudo dfu-util -a 0 -s 0x08000000:leave -D "${progress.replace('Saved to: ', '')}"`
                          : 'sudo dfu-util -a 0 -s 0x08000000:leave -D /path/to/firmware_with_bl.hex'}
                      </code>
                      <button onClick={() => copyText(
                        hexSaved && progress.includes('Saved to:')
                          ? `sudo dfu-util -a 0 -s 0x08000000:leave -D "${progress.replace('Saved to: ', '')}"`
                          : 'sudo dfu-util -a 0 -s 0x08000000:leave -D /path/to/firmware_with_bl.hex',
                        'flash'
                      )} className="btn btn-ghost h-7 px-2 text-xs">
                        {copied === 'flash' ? <Check size={12} /> : <Copy size={12} />}
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
                    </a> to flash the .hex file via USB DFU.
                  </p>
                )}
              </div>
            </details>
          </div>

          <p className="text-xs text-center text-subtle">
            After flashing, the board will reboot into ArduPilot. Disconnect from INAV Configurator and come back here.
          </p>

          <div className="flex gap-3">
            <button onClick={() => setStep('firmware')} className="btn btn-ghost gap-1">
              <ArrowLeft size={14} /> Back
            </button>
            <button onClick={() => setStep('reconnect')}
              className="btn btn-primary flex-1 gap-2">
              I've flashed the firmware <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 5: Reconnect ── */}
      {step === 'reconnect' && (
        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex flex-col items-center gap-4 py-4">
              {reconnecting ? (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                    <Loader2 size={28} className="text-accent animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-semibold text-foreground">Connecting to ArduPilot</p>
                    <p className="mt-1 text-sm text-muted">{progress}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                    <Wifi size={28} className="text-accent" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-semibold text-foreground">Ready to Connect</p>
                    <p className="mt-1 text-sm text-muted">
                      Make sure the board is connected via USB and has finished booting
                      (wait a few seconds after the flash).
                    </p>
                  </div>
                  <button onClick={tryReconnect}
                    className="btn btn-primary gap-2">
                    <RefreshCw size={14} /> Connect to ArduPilot
                  </button>
                </>
              )}

              {error && (
                <div className="w-full rounded border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
                  <AlertTriangle size={14} className="mr-2 inline" />
                  {error}
                  <button onClick={tryReconnect}
                    className="ml-3 rounded bg-danger/20 px-2 py-1 text-xs font-bold hover:bg-danger/30">
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('flash')} className="btn btn-ghost gap-1">
              <ArrowLeft size={14} /> Back
            </button>
            <button onClick={onCancel} className="btn btn-ghost">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Global error display ── */}
      {error && step === 'extract' && (
        <button onClick={onCancel} className="btn btn-ghost w-full">Cancel</button>
      )}
    </div>
  );
}
