/**
 * ReceiverStep.tsx -- Wizard step for RC receiver configuration.
 *
 * Sections:
 *   1. Status banner (pre-filled & working, or needs setup)
 *   2. Protocol + Serial port (side by side on wide screens)
 *   3. Channel order (AETR / TAER)
 *   4. Live RC channel bars (real-time validation)
 *
 * Pre-fill: reads live FC params to auto-detect protocol, port, and RCMAP.
 * Guard: if receiver is already working, warns before allowing changes.
 * Completion gate: protocol selected + (channels working OR reboot pending).
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Radio,
  Check,
  AlertTriangle,
  Signal,
  SignalZero,
  Wifi,
  Info,
  RotateCw,
  ShieldCheck,
} from 'lucide-react';
import { useWizardStore } from '../wizardStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { useParameterStore } from '@/store/parameterStore';
import { useTelemetryStore } from '@/store/telemetryStore';
import { getBoardById, type BoardDef, type BoardUartPort } from '@/models/boardRegistry';

/* ------------------------------------------------------------------ */
/*  Protocol definitions                                                */
/* ------------------------------------------------------------------ */

interface RcProtocol {
  id: string;
  label: string;
  description: string;
  needsSerial: boolean;
  needsTx: boolean;
  baud?: number;
  serialOptions?: number;
  color: string;
}

const RC_PROTOCOLS: RcProtocol[] = [
  {
    id: 'crsf',
    label: 'CRSF / ELRS',
    description: 'ExpressLRS, TBS Crossfire, or TBS Tracer. Serial bidirectional with telemetry.',
    needsSerial: true,
    needsTx: true,
    baud: 460,
    color: '#f59e0b',
  },
  {
    id: 'sbus',
    label: 'SBUS',
    description: 'FrSky, Futaba, and many others. Inverted serial, single wire.',
    needsSerial: false,
    needsTx: false,
    color: '#3b82f6',
  },
  {
    id: 'ppm',
    label: 'PPM',
    description: 'Legacy pulse-position modulation. Single wire, up to 8 channels.',
    needsSerial: false,
    needsTx: false,
    color: '#8b5cf6',
  },
  {
    id: 'dsm',
    label: 'DSM / Spektrum',
    description: 'Spektrum satellite receivers. Auto-detected on RCIN pad.',
    needsSerial: false,
    needsTx: false,
    color: '#ef4444',
  },
  {
    id: 'fport',
    label: 'FPort / FPort2',
    description: 'FrSky F.Port. Single-wire bidirectional with telemetry.',
    needsSerial: true,
    needsTx: true,
    baud: 115,
    serialOptions: 4,
    color: '#10b981',
  },
  {
    id: 'srxl2',
    label: 'SRXL2',
    description: 'Spektrum SRXL2 serial protocol. Bidirectional with telemetry.',
    needsSerial: true,
    needsTx: true,
    baud: 115,
    color: '#f472b6',
  },
];

/* ------------------------------------------------------------------ */
/*  Channel mapping presets (RCMAP)                                     */
/* ------------------------------------------------------------------ */

interface RcMapPreset {
  id: string;
  label: string;
  description: string;
  roll: number;
  pitch: number;
  throttle: number;
  yaw: number;
}

const RCMAP_PRESETS: RcMapPreset[] = [
  {
    id: 'aetr',
    label: 'AETR (Futaba / ELRS default)',
    description: 'Aileron-Elevator-Throttle-Rudder. Most common for ELRS, FrSky, Futaba.',
    roll: 1, pitch: 2, throttle: 3, yaw: 4,
  },
  {
    id: 'taer',
    label: 'TAER (JR / Spektrum)',
    description: 'Throttle-Aileron-Elevator-Rudder. Common for Spektrum, JR radios.',
    roll: 2, pitch: 3, throttle: 1, yaw: 4,
  },
];

function buildChannelLabels(preset: RcMapPreset): string[] {
  const labels: string[] = [];
  for (let i = 1; i <= 16; i++) {
    if (i === preset.roll) labels.push('Roll');
    else if (i === preset.pitch) labels.push('Pitch');
    else if (i === preset.throttle) labels.push('Throttle');
    else if (i === preset.yaw) labels.push('Yaw');
    else labels.push(`Ch ${i}`);
  }
  return labels;
}

/* ------------------------------------------------------------------ */
/*  Step props                                                          */
/* ------------------------------------------------------------------ */

interface ReceiverStepProps {
  onCanAdvanceChange: (canAdvance: boolean) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ReceiverStep({ onCanAdvanceChange }: ReceiverStepProps) {
  const stagedParams = useWizardStore((s) => s.stagedParams);
  const stageParams = useWizardStore((s) => s.stageParams);
  const markComplete = useWizardStore((s) => s.markComplete);
  const savedReceiverConfig = useWizardStore((s) => s.selectedReceiverConfig);
  const setSavedReceiverConfig = useWizardStore((s) => s.setSelectedReceiverConfig);
  const parameters = useParameterStore((s) => s.parameters);
  const boardId = useVehicleStore((s) => s.boardId);

  const rcChannels = useTelemetryStore((s) => s.rcChannels);
  const rcChancount = useTelemetryStore((s) => s.rcChancount);
  const rcRssi = useTelemetryStore((s) => s.rcRssi);

  const board: BoardDef | null = useMemo(
    () => (boardId ? getBoardById(boardId) : null),
    [boardId],
  );

  // ── Detect live FC state ───────────────────────────────────────────

  const liveRcinPort = useMemo((): number | null => {
    for (let i = 1; i <= 7; i++) {
      if (parameters.get(`SERIAL${i}_PROTOCOL`)?.value === 23) return i;
    }
    return null;
  }, [parameters]);

  const liveProtocol = useMemo((): RcProtocol | null => {
    if (liveRcinPort === null) return null;
    const baud = parameters.get(`SERIAL${liveRcinPort}_BAUD`)?.value;
    const opts = parameters.get(`SERIAL${liveRcinPort}_OPTIONS`)?.value;
    if (baud === 460) return RC_PROTOCOLS.find((p) => p.id === 'crsf')!;
    if (opts === 4) return RC_PROTOCOLS.find((p) => p.id === 'fport')!;
    if (baud === 115) return RC_PROTOCOLS.find((p) => p.id === 'srxl2')!;
    return RC_PROTOCOLS.find((p) => p.id === 'crsf')!;
  }, [liveRcinPort, parameters]);

  const liveMap = useMemo((): RcMapPreset => {
    const t = parameters.get('RCMAP_THROTTLE')?.value;
    if (t === 1) return RCMAP_PRESETS.find((p) => p.id === 'taer')!;
    return RCMAP_PRESETS[0];
  }, [parameters]);

  const hasChannels = rcChancount > 0;
  const activeChannels = rcChannels.filter((v) => v > 0 && v < 65535).length;
  const receiverLive = hasChannels && activeChannels >= 4;
  const receiverConfigured = liveProtocol !== null || liveRcinPort !== null;

  // ── State: restore from wizardStore > FC detection > defaults ──────

  const [selectedProtocol, setSelectedProtocol] = useState<RcProtocol | null>(
    () => {
      // First: restore from saved wizard config
      if (savedReceiverConfig?.protocolId) {
        return RC_PROTOCOLS.find((p) => p.id === savedReceiverConfig.protocolId) ?? null;
      }
      // Second: detect from FC params
      return liveProtocol;
    },
  );
  const [selectedPort, setSelectedPort] = useState<number | null>(
    () => savedReceiverConfig?.portIndex ?? liveRcinPort,
  );
  const [selectedMap, setSelectedMap] = useState<RcMapPreset>(
    () => {
      if (savedReceiverConfig?.mapId) {
        return RCMAP_PRESETS.find((p) => p.id === savedReceiverConfig.mapId) ?? RCMAP_PRESETS[0];
      }
      return liveMap;
    },
  );

  // Session-only flag: has the user clicked anything to change config?
  const [userModified, setUserModified] = useState(false);

  // Non-serial auto-detect: channels flowing but no SERIAL RCIN port
  useEffect(() => {
    if (!selectedProtocol && !userModified && hasChannels && liveRcinPort === null) {
      setSelectedProtocol(RC_PROTOCOLS.find((p) => p.id === 'sbus')!);
    }
  }, [hasChannels, liveRcinPort, selectedProtocol, userModified]);

  // ── Persist receiver config to wizardStore on changes ─────────────

  useEffect(() => {
    if (selectedProtocol) {
      setSavedReceiverConfig({
        protocolId: selectedProtocol.id,
        portIndex: selectedPort,
        mapId: selectedMap.id,
      });
    }
  }, [selectedProtocol, selectedPort, selectedMap, setSavedReceiverConfig]);

  // ── Change guard dialog ────────────────────────────────────────────

  const [showChangeWarning, setShowChangeWarning] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

  // One-way latch: once we detect config existed, it stays true.
  // Handles telemetry (rcChannels) arriving after mount.
  const [hadConfig, setHadConfig] = useState(
    () => liveProtocol !== null || receiverLive || savedReceiverConfig !== null
  );

  useEffect(() => {
    if (!hadConfig && !userModified) {
      if (liveProtocol !== null || receiverLive || savedReceiverConfig !== null) {
        setHadConfig(true);
      }
    }
  }, [liveProtocol, receiverLive, savedReceiverConfig, hadConfig, userModified]);

  const userModifiedRef = useRef(userModified);
  userModifiedRef.current = userModified;

  const guardChange = useCallback(
    (action: () => void) => {
      if (!userModifiedRef.current && hadConfig) {
        pendingAction.current = action;
        setShowChangeWarning(true);
      } else {
        action();
      }
    },
    [hadConfig],
  );

  const confirmChange = useCallback(() => {
    setShowChangeWarning(false);
    setUserModified(true);
    pendingAction.current?.();
    pendingAction.current = null;
  }, []);

  const cancelChange = useCallback(() => {
    setShowChangeWarning(false);
    pendingAction.current = null;
  }, []);

  // ── Resolve param (staged > dirty > FC) ────────────────────────────

  const resolveParam = useCallback(
    (name: string): number => {
      if (stagedParams[name] !== undefined) return stagedParams[name];
      const dirty = useParameterStore.getState().dirtyParams.get(name);
      if (dirty !== undefined) return dirty;
      return parameters.get(name)?.value ?? -1;
    },
    [stagedParams, parameters],
  );

  // ── Find candidate serial ports ────────────────────────────────────

  const candidatePorts = useMemo((): (BoardUartPort & { alreadyRcin: boolean })[] => {
    if (!board?.uartPorts) return [];
    return board.uartPorts
      .filter((p) => {
        if (!p.hasRx) return false;
        if (p.serialIndex === 0) return false;
        if (p.unsupportedProtocols?.some((u) => u.protocol === 23)) return false;
        return true;
      })
      .map((p) => {
        const currentProto = resolveParam(`SERIAL${p.serialIndex}_PROTOCOL`);
        return { ...p, alreadyRcin: currentProto === 23 };
      });
  }, [board, resolveParam]);

  const autoDetectedPort = useMemo((): number | null => {
    const existing = candidatePorts.find((p) => p.alreadyRcin);
    if (existing) return existing.serialIndex;
    const suggested = candidatePorts.find((p) =>
      p.suggestedUse?.toLowerCase().includes('rc'),
    );
    if (suggested) return suggested.serialIndex;
    const defaultRc = candidatePorts.find((p) => p.defaultProtocol === 23);
    if (defaultRc) return defaultRc.serialIndex;
    return null;
  }, [candidatePorts]);

  useEffect(() => {
    if (selectedProtocol?.needsSerial && selectedPort === null && autoDetectedPort !== null) {
      setSelectedPort(autoDetectedPort);
    }
  }, [selectedProtocol, selectedPort, autoDetectedPort]);

  // ── Handlers ───────────────────────────────────────────────────────

  const handleSelectProtocol = useCallback((protocol: RcProtocol) => {
    setSelectedProtocol(protocol);
    setUserModified(true);
    if (!protocol.needsSerial) setSelectedPort(null);
  }, []);

  const handleSelectPort = useCallback(
    (serialIndex: number) => {
      const prev = selectedPort;
      setSelectedPort(serialIndex);
      setUserModified(true);

      if (!selectedProtocol) return;

      const portDef = candidatePorts.find((p) => p.serialIndex === serialIndex);
      const params: Record<string, number> = {
        [`SERIAL${serialIndex}_PROTOCOL`]: 23,
      };

      // Clear previous port
      if (prev !== null && prev !== serialIndex) {
        params[`SERIAL${prev}_PROTOCOL`] = -1;
      }
      // Clear any other ports staged as RCIN
      for (let i = 1; i <= 7; i++) {
        if (i !== serialIndex && stagedParams[`SERIAL${i}_PROTOCOL`] === 23) {
          params[`SERIAL${i}_PROTOCOL`] = -1;
        }
      }

      if (selectedProtocol.baud) params[`SERIAL${serialIndex}_BAUD`] = selectedProtocol.baud;
      if (selectedProtocol.serialOptions !== undefined) {
        params[`SERIAL${serialIndex}_OPTIONS`] = selectedProtocol.serialOptions;
      }
      if (portDef?.quirks?.[23]) {
        Object.entries(portDef.quirks[23].params).forEach(([k, v]) => {
          params[k] = v;
        });
      }
      if (portDef?.requiresAltConfig) {
        params[portDef.requiresAltConfig.param] = portDef.requiresAltConfig.value;
      }

      stageParams(params);
    },
    [selectedPort, selectedProtocol, candidatePorts, stagedParams, stageParams],
  );

  // Stage port params when auto-selected -- skip initial mount (pre-fill)
  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    if (selectedProtocol?.needsSerial && selectedPort !== null) {
      handleSelectPort(selectedPort);
    }
  }, [selectedPort]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectMap = useCallback(
    (preset: RcMapPreset) => {
      setSelectedMap(preset);
      setUserModified(true);
      stageParams({
        RCMAP_ROLL: preset.roll,
        RCMAP_PITCH: preset.pitch,
        RCMAP_THROTTLE: preset.throttle,
        RCMAP_YAW: preset.yaw,
      });
    },
    [stageParams],
  );

  const channelLabels = useMemo(() => buildChannelLabels(selectedMap), [selectedMap]);

  // ── Derived state ──────────────────────────────────────────────────

  const portChanged =
    userModified &&
    selectedProtocol?.needsSerial &&
    selectedPort !== null &&
    selectedPort !== liveRcinPort;

  const needsReboot =
    userModified &&
    (portChanged || (selectedProtocol?.needsSerial && liveRcinPort === null));

  // ── Advance gate ───────────────────────────────────────────────────

  useEffect(() => {
    const protocolOk = selectedProtocol !== null;
    const portOk = !selectedProtocol?.needsSerial || selectedPort !== null;
    const channelsOk = hasChannels && activeChannels >= 4;
    const canPass = protocolOk && portOk && (channelsOk || !!needsReboot);

    if (canPass) markComplete('receiver');
    onCanAdvanceChange(canPass);
  }, [
    selectedProtocol, selectedPort, hasChannels, activeChannels,
    needsReboot, onCanAdvanceChange, markComplete,
  ]);

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">

      {/* ── STATUS BANNER (top, prominent) ── */}
      {!userModified && selectedProtocol && receiverLive && (
        <div className="flex items-center gap-4 rounded-lg border border-success/40 bg-success/10 px-5 py-4">
          <ShieldCheck size={28} className="shrink-0 text-success" />
          <div>
            <p className="text-base font-bold text-success">
              Receiver configured and working
            </p>
            <p className="mt-0.5 text-sm text-success/80">
              {selectedProtocol.label} on
              {selectedPort ? ` SERIAL${selectedPort}` : ' RCIN pad'} --
              {' '}{activeChannels} channels, {selectedMap.label.split(' ')[0]} mapping.
              You can continue to the next step.
            </p>
          </div>
        </div>
      )}

      {!userModified && selectedProtocol && !receiverLive && receiverConfigured && (
        <div className="flex items-center gap-4 rounded-lg border border-accent/40 bg-accent/10 px-5 py-4">
          <ShieldCheck size={28} className="shrink-0 text-accent" />
          <div>
            <p className="text-base font-bold text-accent">
              Receiver configured
            </p>
            <p className="mt-0.5 text-sm text-accent/80">
              {selectedProtocol.label} on
              {selectedPort ? ` SERIAL${selectedPort}` : ' RCIN pad'},{' '}
              {selectedMap.label.split(' ')[0]} mapping.
              No RC signal detected -- power on your transmitter to validate.
            </p>
          </div>
        </div>
      )}

      {!userModified && !selectedProtocol && (
        <div className="flex items-start gap-2.5 rounded border border-blue-500/30 bg-blue-900/15 px-4 py-2.5">
          <Info size={14} className="mt-0.5 shrink-0 text-blue-400" />
          <p className="text-sm text-blue-300/90">
            Select your receiver protocol to get started. A bound receiver
            and powered-on transmitter are needed to validate RC input.
          </p>
        </div>
      )}

      {needsReboot && (
        <div className="flex items-start gap-2.5 rounded border border-yellow-500/40 bg-yellow-900/20 px-4 py-2.5">
          <RotateCw size={14} className="mt-0.5 shrink-0 text-yellow-500" />
          <div>
            <p className="text-sm text-yellow-300">
              {portChanged
                ? <>RC input moved from SERIAL{liveRcinPort} to SERIAL{selectedPort}. This requires writing parameters and rebooting.</>
                : <>Serial port configuration changed. This requires writing parameters and rebooting.</>}
            </p>
            <p className="mt-1 text-xs text-yellow-300/70">
              {hasChannels
                ? 'The channel bars below still show data from the current configuration.'
                : 'Channel bars will not show data until changes are applied.'}
              {' '}You can continue the wizard and revisit this page after reboot to confirm.
            </p>
          </div>
        </div>
      )}

      {/* ── PROTOCOL + PORT side by side ── */}
      <div className={`grid gap-6 ${selectedProtocol?.needsSerial ? 'lg:grid-cols-2' : ''}`}>

        {/* Protocol selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
            Receiver Protocol
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {RC_PROTOCOLS.map((proto) => {
              const isSelected = selectedProtocol?.id === proto.id;
              return (
                <button
                  key={proto.id}
                  onClick={() => guardChange(() => handleSelectProtocol(proto))}
                  className={`group relative rounded-lg border p-3 text-left transition ${
                    isSelected
                      ? 'border-accent bg-accent/10 ring-1 ring-accent/30'
                      : 'border-border bg-surface-0 hover:border-accent/40 hover:bg-surface-1'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <Radio
                      size={16}
                      className="mt-0.5 shrink-0"
                      style={{ color: isSelected ? proto.color : undefined }}
                    />
                    <div className="min-w-0">
                      <p className={`text-sm font-bold ${
                        isSelected ? 'text-accent' : 'text-foreground'
                      }`}>
                        {proto.label}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-subtle">
                        {proto.description}
                      </p>
                      {proto.needsSerial && (
                        <span className="mt-1.5 inline-block rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-mono text-muted">
                          UART {proto.needsTx ? '(TX+RX)' : '(RX)'}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute right-2.5 top-2.5">
                      <Check size={14} className="text-accent" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Serial port selection */}
        {selectedProtocol?.needsSerial && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
              Serial Port
            </h3>

            {board ? (
              candidatePorts.length === 0 ? (
                <div className="flex items-center gap-2 rounded border border-yellow-600/40 bg-yellow-900/20 px-4 py-3">
                  <AlertTriangle size={16} className="shrink-0 text-yellow-500" />
                  <p className="text-sm text-yellow-300">
                    No suitable serial ports found on {board.name}.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {candidatePorts.map((port) => {
                    const isSelected = selectedPort === port.serialIndex;
                    const quirk = port.quirks?.[23];
                    const needsAlt = port.requiresAltConfig;

                    return (
                      <button
                        key={port.serialIndex}
                        onClick={() => guardChange(() => handleSelectPort(port.serialIndex))}
                        className={`w-full rounded border p-3 text-left transition ${
                          isSelected
                            ? 'border-accent/50 bg-accent/10'
                            : 'border-border bg-surface-0 hover:border-accent/30 hover:bg-surface-1'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`font-mono text-sm font-bold ${
                              isSelected ? 'text-accent' : 'text-foreground'
                            }`}>
                              SERIAL{port.serialIndex}
                            </span>
                            <span className="text-xs text-muted">{port.padLabel}</span>
                            {port.alreadyRcin && (
                              <span className="rounded bg-green-900/30 px-1.5 py-0.5 text-[10px] font-medium text-green-400">
                                Currently RCIN
                              </span>
                            )}
                            {selectedProtocol.needsTx && !port.hasTx && (
                              <span className="rounded bg-red-900/30 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
                                No TX -- needs bidirectional
                              </span>
                            )}
                          </div>
                          {isSelected && <Check size={14} className="text-accent" />}
                        </div>

                        {isSelected && (quirk || needsAlt) && (
                          <div className="mt-2 space-y-1">
                            {quirk?.wiringNote && (
                              <p className="flex items-start gap-1.5 text-xs text-muted">
                                <Info size={11} className="mt-0.5 shrink-0 text-blue-400" />
                                {quirk.wiringNote}
                              </p>
                            )}
                            {needsAlt && (
                              <p className="flex items-start gap-1.5 text-xs text-warning">
                                <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                                Requires {needsAlt.param}={needsAlt.value} (reboot needed).
                                Default mode: {needsAlt.defaultMode}.
                              </p>
                            )}
                            {quirk?.needsReboot && (
                              <p className="flex items-start gap-1.5 text-xs text-muted">
                                <RotateCw size={11} className="mt-0.5 shrink-0 text-yellow-500" />
                                Reboot required after applying these settings.
                              </p>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="rounded border border-border bg-surface-1 px-4 py-3">
                <p className="text-sm text-muted">
                  Board not detected. You can manually set{' '}
                  <span className="font-mono text-accent">SERIALn_PROTOCOL = 23</span>{' '}
                  on the Ports page for your receiver's serial port.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── CHANNEL ORDER ── */}
      {selectedProtocol && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
            Channel Order
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {RCMAP_PRESETS.map((preset) => {
              const isSelected = selectedMap.id === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => guardChange(() => handleSelectMap(preset))}
                  className={`rounded border p-3 text-left transition ${
                    isSelected
                      ? 'border-accent/50 bg-accent/10'
                      : 'border-border bg-surface-0 hover:border-accent/30 hover:bg-surface-1'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${
                      isSelected ? 'text-accent' : 'text-foreground'
                    }`}>
                      {preset.label}
                    </span>
                    {isSelected && <Check size={14} className="text-accent" />}
                  </div>
                  <p className="mt-1 text-xs text-subtle">{preset.description}</p>
                  <p className="mt-1.5 font-mono text-[10px] text-muted">
                    Ch1={preset.roll === 1 ? 'Roll' : preset.throttle === 1 ? 'Thr' : '?'}{' '}
                    Ch2={preset.roll === 2 ? 'Roll' : preset.pitch === 2 ? 'Pitch' : '?'}{' '}
                    Ch3={preset.throttle === 3 ? 'Thr' : preset.pitch === 3 ? 'Pitch' : '?'}{' '}
                    Ch4=Yaw
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LIVE RC CHANNEL BARS ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
            RC Input
          </h3>
          <div className="flex items-center gap-3 text-xs">
            {hasChannels ? (
              <>
                <span className="flex items-center gap-1 text-success">
                  <Signal size={12} /> {rcChancount} channels
                </span>
                {rcRssi > 0 && rcRssi < 255 && (
                  <span className="flex items-center gap-1 text-muted">
                    <Wifi size={12} /> RSSI {Math.round((rcRssi / 255) * 100)}%
                  </span>
                )}
              </>
            ) : (
              <span className="flex items-center gap-1 text-subtle">
                <SignalZero size={12} /> No signal
              </span>
            )}
          </div>
        </div>

        {hasChannels ? (
          <RcChannelBars
            channels={rcChannels}
            chancount={rcChancount}
            labels={channelLabels}
            throttleChannel={selectedMap.throttle}
          />
        ) : (
          <div className="rounded border border-border bg-surface-1 px-4 py-8 text-center">
            <SignalZero size={32} className="mx-auto mb-3 text-subtle" />
            <p className="text-sm text-muted">No RC input detected.</p>
            <p className="mt-2 text-xs text-subtle">
              A bound receiver and powered-on transmitter are required to validate RC input.
            </p>
            {selectedProtocol?.needsSerial && selectedPort !== null && (
              <p className="mt-1 text-xs text-subtle">
                A reboot may be required after changing the serial port configuration.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── BOTTOM STATUS ── */}
      {selectedProtocol && receiverLive && !needsReboot && userModified && (
        <div className="flex items-center gap-2 rounded border border-success/30 bg-success/5 px-4 py-2.5">
          <Check size={16} className="shrink-0 text-success" />
          <p className="text-sm text-success">
            Receiver configured. {activeChannels} active channels detected.
          </p>
        </div>
      )}
      {selectedProtocol && needsReboot && (
        <div className="flex items-center gap-2 rounded border border-accent/30 bg-accent/5 px-4 py-2.5">
          <Check size={16} className="shrink-0 text-accent" />
          <p className="text-sm text-accent">
            Configuration staged. A reboot will be needed to validate RC input.
          </p>
        </div>
      )}

      {/* ── CHANGE WARNING DIALOG ── */}
      {showChangeWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={cancelChange}
          />
          <div className="relative w-full max-w-sm rounded border border-yellow-500/40 bg-surface-1 p-6 shadow-2xl">
            <div className="mb-3 flex items-center gap-2.5">
              <AlertTriangle size={20} className="text-yellow-500" />
              <h3 className="text-base font-bold text-foreground">
                Modify Receiver Configuration?
              </h3>
            </div>
            <p className="mb-2 text-sm text-muted">
              Your receiver is already configured on this flight controller.
              Changing these settings will require writing parameters and
              rebooting before they take effect.
            </p>
            <p className="mb-5 text-xs text-subtle">
              You will need to revisit this page after reboot to confirm RC input
              is working with the new configuration.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={cancelChange} className="btn btn-ghost">
                Keep Current
              </button>
              <button
                onClick={confirmChange}
                className="btn bg-yellow-600 text-white hover:bg-yellow-500"
              >
                Modify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  RC Channel Bars                                                     */
/* ------------------------------------------------------------------ */

const DEFAULT_LABELS = [
  'Roll', 'Pitch', 'Throttle', 'Yaw',
  'Ch 5', 'Ch 6', 'Ch 7', 'Ch 8',
  'Ch 9', 'Ch 10', 'Ch 11', 'Ch 12',
  'Ch 13', 'Ch 14', 'Ch 15', 'Ch 16',
];

function RcChannelBars({
  channels,
  chancount,
  labels = DEFAULT_LABELS,
  throttleChannel = 3,
}: {
  channels: number[];
  chancount: number;
  labels?: string[];
  throttleChannel?: number;
}) {
  const count = Math.min(chancount, 16);
  const displayChannels = channels.slice(0, count);

  return (
    <div className="space-y-1.5">
      {displayChannels.map((value, i) => {
        const isActive = value > 0 && value < 65535;
        const pct = isActive ? Math.max(0, Math.min(100, ((value - 1000) / 1000) * 100)) : 0;
        const isThrottle = i + 1 === throttleChannel;
        const label = labels[i] || `Ch ${i + 1}`;
        const isPrimary = ['Roll', 'Pitch', 'Throttle', 'Yaw'].includes(label);

        let barColor: string;
        if (!isActive) {
          barColor = 'bg-subtle/30';
        } else if (value < 950 || value > 2050) {
          barColor = 'bg-red-500';
        } else if (value < 1000 || value > 2000) {
          barColor = 'bg-yellow-500';
        } else {
          barColor = isPrimary ? 'bg-accent' : 'bg-blue-500/70';
        }

        return (
          <div key={i} className="flex items-center gap-2">
            <span
              className={`w-16 shrink-0 text-right font-mono text-[11px] ${
                isPrimary ? 'font-bold text-foreground' : 'text-subtle'
              }`}
            >
              {label}
            </span>

            <div className="relative h-4 flex-1 overflow-hidden rounded bg-surface-2">
              {!isThrottle && (
                <div className="absolute left-1/2 top-0 h-full w-px bg-border" />
              )}
              {isActive &&
                (isThrottle ? (
                  <div
                    className={`absolute left-0 top-0 h-full rounded transition-all duration-75 ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                ) : (
                  <div
                    className={`absolute top-0 h-full rounded transition-all duration-75 ${barColor}`}
                    style={{
                      left: pct < 50 ? `${pct}%` : '50%',
                      width: `${Math.abs(pct - 50)}%`,
                    }}
                  />
                ))}
              {isActive && (
                <div
                  className="absolute top-0 h-full w-0.5 bg-white/80"
                  style={{ left: `${pct}%` }}
                />
              )}
            </div>

            <span
              className={`w-10 shrink-0 text-right font-mono text-[11px] ${
                isActive ? 'text-muted' : 'text-subtle/50'
              }`}
            >
              {isActive ? value : '---'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
