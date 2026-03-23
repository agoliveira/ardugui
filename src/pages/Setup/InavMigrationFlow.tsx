/**
 * InavMigrationFlow.tsx -- Guided migration from INAV to ArduPilot.
 *
 * Three screens:
 *   1. Welcome: detected INAV, choose migrate-with-config or start-fresh
 *   2. Extract + Preview: pull "dump all", show parsed summary, download firmware
 *   3. Flash + Connect: flash instructions, then reconnect to ArduPilot
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ArrowRight, ArrowLeft, Download, Check, Loader2, AlertTriangle,
  Cpu, Wifi, Copy, ExternalLink, Zap, Wand2, LayoutDashboard,
} from 'lucide-react';
import { InavCli, type InavInfo } from '@/mavlink/inavCli';
import { lookupArduPilotBoard, type InavBoardMapping } from '@/models/inavBoardMap';
import { parseInavDiff, type InavConfig } from '@/models/inavImport';
import { connectionManager } from '@/mavlink/connection';
import { useConnectionStore } from '@/store/connectionStore';
import { useParameterStore } from '@/store/parameterStore';
import { Stm32Dfu } from '@/firmware/stm32dfu';
import { parseIntelHex } from '@/firmware/hexParser';
import { InavImportDialog } from '@/pages/SetupWizard/steps/InavImportDialog';
import { useWizardStore } from '@/pages/SetupWizard/wizardStore';

type Step = 'welcome' | 'extract' | 'flash' | 'import' | 'writing' | 'finish';

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

  // Debug logging for troubleshooting (console only)
  const dbg = useCallback((msg: string) => {
    const ts = new Date().toISOString().substring(11, 23);
    console.log(`[InavMigration] [${ts}] ${msg}`);
  }, []);

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

      // Keep CLI open -- we may need it to send 'dfu' for automatic flash.
      // It will be closed when user chooses a flash path or cancels.
      pushLog('Ready');

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
      const api = window.electronAPI;
      if (!api?.net?.fetch || !api?.fs?.saveFile) throw new Error('Download API not available');

      const result = await api.net.fetch(hexUrl);
      if (!result.ok || !result.text) throw new Error(`Download failed: ${result.error ?? 'unknown error'}`);

      const fileName = hexUrl.split('/').pop() ?? 'firmware_with_bl.hex';
      const saved = await api.fs.saveFile(fileName, result.text);
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

  // ── CLI cleanup helper ──────────────────────────────────────────

  /** Close CLI gracefully. 'dfu' enters DFU mode, 'exit' reboots to normal. */
  const closeCli = useCallback(async (mode: 'dfu' | 'exit') => {
    const cli = cliRef.current;
    if (!cli) return;
    try {
      if (mode === 'dfu') {
        // CRITICAL: Close serial port IMMEDIATELY after sending DFU command.
        // INAV does this in the send callback -- no delay between send and close.
        // If we wait, the board enters DFU mode and the serial device disappears
        // from USB. Closing a dead port doesn't properly release the kernel fd,
        // which keeps a stale USB reference that prevents the board from rebooting
        // after DFU flash.
        await cli.enterDfu();
        await cli.close();
      } else {
        await cli.exitCli();
        await new Promise((r) => setTimeout(r, 500));
        await cli.close();
      }
    } catch { /* ignore -- port may already be gone */ }
    cliRef.current = null;
  }, []);

  // ── Port detection helper ────────────────────────────────────────

  /**
   * Detect the board's serial port. After DFU flash or manual flash the
   * port path may have changed. Polls listPorts() for a new port, falls
   * back to the original portPath.
   */
  const detectPort = useCallback(async (statusFn?: (msg: string) => void): Promise<string> => {
    const api = window.electronAPI;
    if (!api?.serial?.listPorts) return portPath;

    // Match same port family: /dev/ttyACM0 -> /dev/ttyACM*
    const patternMatch = portPath.match(/^(.*?(?:ttyACM|ttyUSB|COM))/);
    const portPrefix = patternMatch ? patternMatch[1] : null;
    const matchesPattern = (path: string) =>
      portPrefix ? path.startsWith(portPrefix) : true;

    statusFn?.('Scanning for serial ports...');
    const portsBefore = await api.serial.listPorts();
    const pathsBefore = new Set(portsBefore.map((p) => p.path));

    // If the original port is already present, use it immediately
    if (pathsBefore.has(portPath)) return portPath;

    // Poll for up to 15 seconds for a matching port to appear
    for (let attempt = 0; attempt < 15; attempt++) {
      await new Promise((r) => setTimeout(r, 1000));
      const currentPorts = await api.serial.listPorts();

      // New port matching the same pattern
      const newPort = currentPorts.find((p) =>
        !pathsBefore.has(p.path) && matchesPattern(p.path)
      );
      if (newPort) {
        statusFn?.(`Board detected on ${newPort.path}`);
        return newPort.path;
      }

      // Original port came back
      if (currentPorts.some((p) => p.path === portPath)) {
        statusFn?.(`Board detected on ${portPath}`);
        return portPath;
      }
    }

    return portPath; // Fallback
  }, [portPath]);

  // ── DFU flash logic ────────────────────────────────────────────

  const [flashing, setFlashing] = useState(false);
  const [flashPhase, setFlashPhase] = useState('');
  const [flashPercent, setFlashPercent] = useState(0);
  const [flashDone, setFlashDone] = useState(false);
  const [importedParams, setImportedParams] = useState<Record<string, number> | null>(null);
  const [writeProgress, setWriteProgress] = useState('');
  const [paramsWritten, setParamsWritten] = useState(false);

  const handleDfuFlash = useCallback(async () => {
    if (!hexUrl) return;
    setFlashing(true);
    setError(null);
    setFlashPhase('Downloading firmware...');
    setFlashPercent(0);

    let dfu: Stm32Dfu | null = null;

    try {
      // Step 1: Download the HEX file
      const api = window.electronAPI;
      if (!api?.net?.fetch) throw new Error('Download API not available');

      dbg(`Downloading ${hexUrl}`);
      const result = await api.net.fetch(hexUrl);
      if (!result.ok || !result.text) {
        throw new Error(`Download failed: ${result.error ?? 'unknown error'}`);
      }
      const hexText = result.text;
      dbg(`Downloaded ${hexText.length} chars`);

      // Step 2: Parse Intel HEX
      setFlashPhase('Parsing firmware...');
      const hex = parseIntelHex(hexText);
      if (!hex) throw new Error('Invalid Intel HEX file');
      dbg(`Parsed HEX: ${hex.bytesTotal} bytes, ${hex.data.length} blocks`);

      // Step 3: Enter DFU mode
      setFlashPhase('Entering DFU mode...');

      dbg('Stopping port watcher');
      await window.electronAPI?.serial?.stopPortWatch();

      // Prevent Layout's fresh-board prompt while migration is active
      try { sessionStorage.setItem('ardugui-migration-active', '1'); } catch { /* ignore */ }

      dbg('Sending DFU command and closing serial immediately');
      await closeCli('dfu');
      dbg('CLI closed');

      // Step 4: Wait for DFU USB device to appear
      setFlashPhase('Waiting for DFU device...');
      dfu = new Stm32Dfu();
      let dfuConnected = false;

      for (let attempt = 0; attempt < 20; attempt++) {
        await new Promise((r) => setTimeout(r, 1000));
        dbg(`DFU poll attempt ${attempt + 1}`);
        try {
          dfuConnected = await dfu.open();
          if (dfuConnected) {
            dbg('DFU device opened (WebUSB)');
            break;
          }
        } catch (e) {
          dbg(`DFU open failed: ${e}`);
        }
      }

      if (!dfuConnected) {
        throw new Error(
          'DFU device not found. The board may need manual intervention: ' +
          'hold the BOOT button while plugging in USB, or check USB permissions on Linux (udev rules).'
        );
      }

      // Step 5: Flash (erase + write + verify + leave)
      setFlashPhase('Flashing...');
      dbg('Starting flash via WebUSB...');
      await dfu.flash(hex, {
        onProgress: (percent, message) => {
          setFlashPhase(message);
          setFlashPercent(percent);
        },
        onDebug: dbg,
      });
      dbg('Flash + leave complete');

      // dfu ref is null after leaveDfu
      dfu = null;

      // Step 6: USB cable replug cycle.
      // After DFU flash, the board needs a physical USB power cycle to boot
      // cleanly into the new firmware. We guide the user through unplug/replug
      // and detect it automatically via port polling.
      setFlashPercent(100);
      setFlashPhase('unplug');
      setFlashing(false);
      setFlashDone(true);
      dbg('Flash complete -- waiting for cable replug');

    } catch (err) {
      dbg(`Flash error: ${err}`);
      if (dfu) {
        try { await dfu.close(); } catch { /* ignore */ }
      }
      window.electronAPI?.serial?.startPortWatch();
      setError(`Flash failed: ${err}`);
      setFlashing(false);
      try { await connectionManager.disconnect(); } catch { /* ignore */ }
    }
  }, [hexUrl, closeCli, portPath, baudRate, migrateWithConfig, inavDump, inavConfig, onComplete, dbg]);

  // ── Post-flash boot detection + replug if needed ───────────────

  const [replugPhase, setReplugPhase] = useState<
    'waiting' | 'checking' | 'unplug' | 'replug' | 'connecting' | null
  >(null);

  // When flashDone becomes true and flashPhase is 'unplug', start the
  // validated flow: wait for port -> check if board responds -> if not,
  // ask for cable replug.
  useEffect(() => {
    if (!flashDone || flashPhase !== 'unplug') return;

    const api = window.electronAPI;
    if (!api?.serial?.listPorts) return;

    let cancelled = false;

    const run = async () => {
      // Step 1: Wait for port to appear (board re-enumerates after DFU)
      setReplugPhase('waiting');
      dbg('Waiting for board to re-enumerate...');
      let portAppeared = false;
      for (let i = 0; i < 30 && !cancelled; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        if (cancelled) return;
        const ports = await api.serial.listPorts();
        if (ports.some((p) => p.path === portPath)) {
          dbg(`Port ${portPath} appeared`);
          portAppeared = true;
          break;
        }
      }
      if (!portAppeared || cancelled) {
        if (!cancelled) {
          setError('Board did not re-enumerate. Try unplugging and replugging the USB cable.');
          setReplugPhase(null);
        }
        return;
      }

      // Step 2: Wait 5s for firmware to initialize
      setReplugPhase('checking');
      dbg('Waiting 5s for firmware to initialize...');
      await new Promise((r) => setTimeout(r, 5000));
      if (cancelled) return;

      // Step 3: Try reading serial for 5s to see if board is alive
      dbg('Checking if board is responding...');
      let boardAlive = false;
      try {
        // Open raw serial with a timeout -- stuck board may not respond to open
        const openResult = await Promise.race([
          api.serial.open(portPath, baudRate).then(() => true),
          new Promise<false>((r) => setTimeout(() => r(false), 5000)),
        ]);

        if (openResult) {
          const startCheck = Date.now();
          await new Promise<void>((resolve) => {
            let gotData = false;
            const unsub = api.serial.onData(() => {
              if (!gotData) {
                gotData = true;
                boardAlive = true;
                dbg(`Received data after ${((Date.now() - startCheck) / 1000).toFixed(1)}s -- board is alive`);
                unsub();
                resolve();
              }
            });
            setTimeout(() => {
              if (!gotData) {
                dbg('No data received in 5s');
                unsub();
                resolve();
              }
            }, 5000);
          });
          try { await api.serial.close(); } catch { /* ignore */ }
        } else {
          dbg('Serial open timed out -- board is not responding');
        }
      } catch (e) {
        dbg(`Serial check failed: ${e}`);
        try { await api.serial.close(); } catch { /* ignore */ }
      }

      if (cancelled) return;

      if (boardAlive) {
        // Board booted fine -- connect normally
        dbg('Board is alive, connecting...');
        setReplugPhase('connecting');
        await connectAndProceed();
        return;
      }

      // Step 4: Board is stuck -- ask for cable replug
      dbg('No data from board -- asking for cable replug');
      setReplugPhase('unplug');

      // Wait for port to disappear
      for (let i = 0; i < 120 && !cancelled; i++) {
        await new Promise((r) => setTimeout(r, 500));
        if (cancelled) return;
        const ports = await api.serial.listPorts();
        if (!ports.some((p) => p.path === portPath)) {
          dbg('Port disappeared -- cable unplugged');
          break;
        }
      }
      if (cancelled) return;

      // Wait for port to reappear
      setReplugPhase('replug');
      for (let i = 0; i < 120 && !cancelled; i++) {
        await new Promise((r) => setTimeout(r, 500));
        if (cancelled) return;
        const ports = await api.serial.listPorts();
        if (ports.some((p) => p.path === portPath)) {
          dbg('Port reappeared -- cable plugged in');
          break;
        }
      }
      if (cancelled) return;

      // Wait for firmware to boot after replug
      dbg('Waiting 5s for firmware to boot after replug...');
      await new Promise((r) => setTimeout(r, 5000));
      if (cancelled) return;

      // Connect
      setReplugPhase('connecting');
      await connectAndProceed();
    };

    const connectAndProceed = async () => {
      api.serial?.startPortWatch();

      dbg(`Connecting on ${portPath} @ ${baudRate}`);
      try {
        await connectionManager.connect(portPath, baudRate);

        const connected = await new Promise<boolean>((resolve) => {
          const status = useConnectionStore.getState().status;
          if (status === 'connected' || status === 'loading') {
            resolve(true);
            return;
          }
          const timeout = setTimeout(() => { unsub(); resolve(false); }, 15000);
          const unsub = useConnectionStore.subscribe((state) => {
            if (state.status === 'connected' || state.status === 'loading') {
              clearTimeout(timeout); unsub(); resolve(true);
            } else if (state.status === 'disconnected') {
              clearTimeout(timeout); unsub(); resolve(false);
            }
          });
        });

        if (connected) {
          dbg('Connected to ArduPilot!');
          setFlashDone(false);
          setReplugPhase(null);

          if (migrateWithConfig && inavDump) {
            try { sessionStorage.setItem('ardugui-inav-dump', inavDump); } catch { /* ignore */ }
            setStep('import');
          } else {
            setStep('finish');
          }
        } else {
          dbg('Connection failed');
          setError('Connection failed. Try unplugging and replugging again.');
          setReplugPhase(null);
        }
      } catch (e) {
        dbg(`Connect error: ${e}`);
        setError(`Connection failed: ${e}`);
        setReplugPhase(null);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [flashDone, flashPhase, portPath, baudRate, migrateWithConfig, inavDump, dbg]);

  /** Switch to manual flash: exit CLI and show instructions. */
  const handleManualFlash = useCallback(async () => {
    await closeCli('exit');
    setStep('flash');
    setError(null);
  }, [closeCli]);

  /** Import confirmed -- write mapped params to FC, then go to finish. */
  const handleImportConfirm = useCallback(async (
    _vehicleType?: 'copter' | 'plane' | 'quadplane' | null,
    params?: Record<string, number>,
    craftName?: string | null,
  ) => {
    if (!params || Object.keys(params).length === 0) {
      setStep('finish');
      return;
    }

    // Switch to writing step immediately -- this closes the import dialog
    setImportedParams(params);
    setStep('writing');
    setWriteProgress('Waiting for parameters to load...');

    // Store craft name for aircraft naming
    if (craftName) {
      try { sessionStorage.setItem('ardugui-inav-craft-name', craftName); } catch { /* ignore */ }
    }

    // Wait for all FC parameters to finish downloading.
    if (!useParameterStore.getState().loaded) {
      dbg('Waiting for parameter download to complete...');
      await new Promise<void>((resolve) => {
        if (useParameterStore.getState().loaded) { resolve(); return; }
        const unsub = useParameterStore.subscribe((state) => {
          if (state.loaded) { unsub(); resolve(); }
        });
        setTimeout(() => { unsub(); resolve(); }, 30000);
      });
      dbg('Parameters loaded');
    }

    const total = Object.keys(params).length;
    setWriteProgress(`Writing ${total} parameters...`);

    let written = 0;
    const failed: string[] = [];

    for (const [name, value] of Object.entries(params)) {
      const connBefore = useConnectionStore.getState().status;
      if (connBefore !== 'connected' && connBefore !== 'loading') {
        dbg(`Connection lost (${connBefore}) before writing ${name} -- stopping`);
        const remaining = Object.keys(params).slice(written + failed.length);
        failed.push(...remaining);
        break;
      }

      try {
        const ok = await connectionManager.writeParam(name, value);
        if (ok) {
          written++;
        } else {
          failed.push(name);
        }
      } catch {
        failed.push(name);
      }
      setWriteProgress(`Writing parameters... ${written + failed.length}/${total}`);
    }

    if (failed.length > 0) {
      dbg(`Param write: ${written} OK, ${failed.length} failed: ${failed.join(', ')}`);
    } else {
      dbg(`All ${written} parameters written successfully`);
    }

    setParamsWritten(true);
    setWriteProgress(`${written} parameters written${failed.length > 0 ? `, ${failed.length} failed` : ''}`);

    const finalStatus = useConnectionStore.getState().status;
    dbg(`Param write done. Connection status: ${finalStatus}`);

    setStep('finish');
  }, [dbg]);

  /** Import declined -- skip writing, go to finish. */
  const handleImportSkip = useCallback(() => {
    dbg('User declined INAV import');
    setStep('finish');
  }, [dbg]);

  /** Start the setup wizard with imported config. */
  const handleStartWizard = useCallback(() => {
    // Clear migration flag so Layout doesn't block future fresh-board prompts
    try { sessionStorage.removeItem('ardugui-migration-active'); } catch { /* ignore */ }

    const store = useWizardStore.getState();
    if (importedParams && Object.keys(importedParams).length > 0) {
      const frameClass = importedParams['FRAME_CLASS'] ?? 0;
      const qFrameClass = importedParams['Q_FRAME_CLASS'] ?? 0;
      let vt: 'copter' | 'plane' | 'quadplane' = 'copter';
      if (qFrameClass > 0) vt = 'quadplane';
      else if (frameClass === 0) vt = 'plane';
      store.start(vt);
      store.setImportSource('inav');
      store.stageParams(importedParams);
    } else {
      store.start('copter');
    }
    // Don't call onComplete here. Setting wizard active=true causes Layout
    // to render SetupWizard directly, bypassing the migration flow and
    // SetupPage entirely. Calling onComplete would race with this and
    // trigger Layout's fresh-board prompt.
  }, [importedParams]);

  /** Go to normal pages without wizard. */
  const handleGoToPages = useCallback(() => {
    try { sessionStorage.removeItem('ardugui-migration-active'); } catch { /* ignore */ }
    onComplete(null);
  }, [onComplete]);

  /** Cancel: close CLI if still open. */
  const handleCancel = useCallback(async () => {
    try { sessionStorage.removeItem('ardugui-migration-active'); } catch { /* ignore */ }
    if (cliRef.current) {
      await closeCli('exit');
    }
    onCancel();
  }, [closeCli, onCancel]);

  // ── Reconnect logic ────────────────────────────────────────────

  const [reconnecting, setReconnecting] = useState(false);

  const tryReconnect = useCallback(async () => {
    setReconnecting(true);
    setError(null);
    setProgress('Looking for ArduPilot...');

    try {
      // Detect the port -- may have changed after flash
      const detectedPort = await detectPort(setProgress);

      // Give firmware a moment to finish booting after port appears
      await new Promise((r) => setTimeout(r, 1500));

      setProgress(`Connecting on ${detectedPort}...`);
      await connectionManager.connect(detectedPort, baudRate);

      const connected = await new Promise<boolean>((resolve) => {
        const status = useConnectionStore.getState().status;
        if (status === 'connected' || status === 'loading') {
          resolve(true);
          return;
        }
        const timeout = setTimeout(() => { unsub(); resolve(false); }, 20000);
        const unsub = useConnectionStore.subscribe((state) => {
          if (state.status === 'connected' || state.status === 'loading') {
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
  }, [detectPort, baudRate, migrateWithConfig, inavDump, inavConfig, onComplete]);

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

          <button onClick={handleCancel}
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

            {/* Error inline (extraction phase only) */}
            {error && !extractDone && (
              <div className="mt-3 rounded border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger">
                <AlertTriangle size={14} className="mr-2 inline" />
                {error}
              </div>
            )}
          </div>

          {/* Vehicle type -- shown when extraction is done and board is matched */}
          {extractDone && boardMapping && !flashing && !flashDone && (
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted">ArduPilot firmware:</span>
                  <span className="rounded bg-accent/20 px-3 py-1.5 text-xs font-bold text-accent">
                    {vehicleType === 'copter' ? 'Copter' : 'Plane'} -- {boardMapping.arduPlatform}
                  </span>
                </div>
                {autoDetectedType ? (
                  <button
                    onClick={() => { handleVehicleTypeChange(vehicleType === 'copter' ? 'plane' : 'copter'); setAutoDetectedType(false); }}
                    className="text-xs text-subtle hover:text-muted transition"
                  >
                    Wrong? Change
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleVehicleTypeChange('copter')}
                      className={`rounded px-2 py-1 text-xs font-bold transition ${
                        vehicleType === 'copter'
                          ? 'bg-accent text-black' : 'bg-surface-2 text-muted hover:bg-surface-3'
                      }`}>Copter</button>
                    <button onClick={() => handleVehicleTypeChange('plane')}
                      className={`rounded px-2 py-1 text-xs font-bold transition ${
                        vehicleType === 'plane'
                          ? 'bg-accent text-black' : 'bg-surface-2 text-muted hover:bg-surface-3'
                      }`}>Plane</button>
                  </div>
                )}
              </div>
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

          {/* DFU flash progress */}
          {flashing && (
            <div className="card p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">Flashing</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 size={14} className="shrink-0 text-accent animate-spin" />
                  <span className="text-foreground">{flashPhase}</span>
                </div>
                <div className="w-full rounded-full bg-surface-2 h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-accent transition-all duration-300"
                    style={{ width: `${Math.min(flashPercent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted text-right">{Math.round(flashPercent)}%</p>
              </div>
            </div>
          )}

          {/* Flash complete -- boot detection + replug if needed */}
          {flashDone && !flashing && (
            <div className="card p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-success mb-4">Flash Complete</h3>

              {(replugPhase === 'waiting' || replugPhase === 'checking') && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <Loader2 size={32} className="text-accent animate-spin" />
                  <div className="text-center">
                    <p className="text-base font-semibold text-foreground">
                      {replugPhase === 'waiting' ? 'Waiting for board to restart...' : 'Checking if firmware booted...'}
                    </p>
                    <p className="mt-1 text-sm text-muted">This may take a few seconds.</p>
                  </div>
                </div>
              )}

              {replugPhase === 'unplug' && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 animate-pulse">
                    <Cpu size={32} className="text-accent" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">Unplug the USB cable</p>
                    <p className="mt-1 text-sm text-muted">
                      The board needs a power cycle to boot into ArduPilot.
                    </p>
                  </div>
                  <p className="text-xs text-subtle">Waiting for board to disconnect...</p>
                </div>
              )}

              {replugPhase === 'replug' && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 animate-pulse">
                    <Cpu size={32} className="text-success" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">Plug the USB cable back in</p>
                    <p className="mt-1 text-sm text-muted">
                      Reconnect the board so ArduGUI can configure it.
                    </p>
                  </div>
                  <p className="text-xs text-subtle">Waiting for board to reconnect...</p>
                </div>
              )}

              {replugPhase === 'connecting' && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <Loader2 size={32} className="text-accent animate-spin" />
                  <p className="text-sm text-foreground">Connecting to ArduPilot...</p>
                </div>
              )}
            </div>
          )}

          {/* Flash error with retry */}
          {error && extractDone && !flashDone && (
            <div className="rounded border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
              <AlertTriangle size={14} className="mr-2 inline" />
              {error}
              {!flashing && (
                <button onClick={handleDfuFlash}
                  className="ml-3 rounded bg-danger/20 px-2 py-1 text-xs font-bold hover:bg-danger/30">
                  Retry
                </button>
              )}
            </div>
          )}

          {/* Navigation: flash options */}
          {extractDone && !flashing && !flashDone && (
            <div className="space-y-2">
              {boardMapping && hexUrl && (
                <button onClick={handleDfuFlash}
                  className="btn btn-primary gap-2 w-full py-3 text-base">
                  <Zap size={16} /> Flash ArduPilot firmware now
                </button>
              )}
              <div className="flex gap-3">
                <button onClick={handleCancel} className="btn btn-ghost gap-1">
                  Cancel
                </button>
                <button onClick={handleManualFlash}
                  className="btn btn-ghost flex-1 gap-1 text-xs">
                  Flash manually with INAV Configurator <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Cancel while extracting */}
          {!extractDone && !flashing && (
            <button onClick={handleCancel} className="btn btn-ghost gap-1">
              Cancel
            </button>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* SCREEN 3: Flash Instructions + Reconnect                     */}
      {/* ════════════════════════════════════════════════════════════ */}
      {step === 'flash' && (
        <div className="space-y-4">

          {/* Firmware download (save to disk for manual flashing) */}
          {!reconnecting && boardMapping && hexUrl && (
            <div className="card p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">
                Download Firmware
              </h3>
              <div className="space-y-3">
                <div className="rounded bg-surface-2 px-3 py-2 font-mono text-xs text-muted break-all">
                  {hexUrl}
                </div>
                <button onClick={handleDownloadHex}
                  disabled={hexSaved}
                  className="btn btn-primary w-full gap-2">
                  {hexSaved
                    ? <><Check size={14} /> Firmware saved</>
                    : <><Download size={14} /> Save firmware to disk (.hex)</>
                  }
                </button>
                {hexSaved && savePath && (
                  <p className="text-xs text-success">Saved to: {savePath}</p>
                )}
              </div>
            </div>
          )}

          {/* Flash instructions (hidden while connecting) */}
          {!reconnecting && (
            <div className="card p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">
                Flash ArduPilot Firmware
              </h3>
              <p className="text-sm text-muted mb-4">
                Use the INAV Configurator to flash the ArduPilot firmware file.
                Download it above first, then follow these steps. This replaces INAV with ArduPilot including its bootloader.
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
              <button onClick={handleCancel} className="btn btn-ghost">
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Step: Import review ────────────────────────────────────── */}
      {step === 'import' && (
        <InavImportDialog
          onClose={handleImportSkip}
          onImported={handleImportConfirm}
        />
      )}

      {/* ── Step: Writing parameters ───────────────────────────────── */}
      {step === 'writing' && (
        <div className="card p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">Writing Parameters</h3>
          <div className="flex items-center gap-3 text-sm">
            <Loader2 size={16} className="shrink-0 text-accent animate-spin" />
            <span className="text-foreground">{writeProgress}</span>
          </div>
        </div>
      )}

      {/* ── Step: Finish ───────────────────────────────────────────── */}
      {step === 'finish' && (
        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                <Check size={20} className="text-success" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Migration Complete</h3>
                <p className="text-sm text-muted">
                  ArduPilot firmware is running
                  {paramsWritten ? ' and INAV parameters have been imported.' : '.'}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted mb-6">
              How would you like to continue?
            </p>

            <div className="flex flex-col gap-3">
              <button onClick={handleStartWizard} className="btn btn-primary gap-2 py-3">
                <Wand2 size={16} /> Start Setup Wizard
                <span className="text-xs opacity-70 ml-1">Guided step-by-step configuration</span>
              </button>
              <button onClick={handleGoToPages} className="btn btn-ghost gap-2 py-3">
                <LayoutDashboard size={16} /> Go to configuration pages
                <span className="text-xs opacity-70 ml-1">For experienced users</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
