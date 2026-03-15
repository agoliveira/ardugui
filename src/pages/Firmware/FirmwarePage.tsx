import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RefreshCw, Search, AlertCircle, Loader2,
  CheckCircle2, Upload, Plane, Box, FileDown, HardDrive, Info,
} from 'lucide-react';
import { useConnectionStore } from '@/store/connectionStore';
import { useVehicleStore } from '@/store/vehicleStore';
import {
  getBoards, findFirmware, findBoardsByBoardId, clearManifestCache,
  type BoardInfo, type FirmwareInfo, type VehicleType, type ReleaseChannel,
} from '@/firmware/manifest';
import {
  downloadFirmware, parseApj, validateFirmware,
  type ApjFirmware,
} from '@/firmware/downloader';
import {
  flashFirmware,
  type FlashProgress as FlashProgressInfo,
} from '@/firmware/flasher';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type FlashPhase =
  | 'idle'
  | 'loading-manifest'
  | 'downloading'
  | 'ready'      // firmware downloaded and validated -- ready to flash
  | 'error';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FirmwarePage() {
  const connectionStatus = useConnectionStore((s) => s.status);
  const isConnected = connectionStatus === 'connected';

  // Board detection from connected FC
  const apjBoardId = useVehicleStore((s) => s.apjBoardId);
  const detectedType = useVehicleStore((s) => s.type);

  // UI state
  const [phase, setPhase] = useState<FlashPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [boards, setBoards] = useState<BoardInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [vehicleType, setVehicleType] = useState<VehicleType>('Copter');
  const [channel, setChannel] = useState<ReleaseChannel>('stable');
  const [selectedFirmware, setSelectedFirmware] = useState<FirmwareInfo | null>(null);
  const [manifestLoaded, setManifestLoaded] = useState(false);

  // Downloaded firmware state
  const [downloadedFirmware, setDownloadedFirmware] = useState<ApjFirmware | null>(null);
  const [firmwareSource, setFirmwareSource] = useState<string>(''); // URL or filename
  const [downloadProgress, setDownloadProgress] = useState<string>('');

  // Flash progress state
  const [flashing, setFlashing] = useState(false);
  const [flashProgress, setFlashProgress] = useState<FlashProgressInfo | null>(null);
  // Auto-select board from connected FC
  useEffect(() => {
    if (apjBoardId && isConnected) {
      setSelectedPlatform(null); // Will be resolved after manifest loads
    }
  }, [apjBoardId, isConnected]);

  // Auto-select vehicle type from connected FC
  useEffect(() => {
    if (detectedType === 'copter') setVehicleType('Copter');
    else if (detectedType === 'plane' || detectedType === 'quadplane') setVehicleType('Plane');
  }, [detectedType]);

  // Load manifest
  const loadManifest = useCallback(async (force = false) => {
    setPhase('loading-manifest');
    setError(null);
    try {
      if (force) clearManifestCache();
      const boardList = await getBoards(force);
      setBoards(boardList);
      setManifestLoaded(true);

      // Auto-select board from connected FC -- pick the non-bdshot variant
      if (apjBoardId) {
        const matches = boardList.filter((b) => b.boardId === apjBoardId);
        const preferred = matches.find((b) => !b.isBDShot) || matches[0];
        if (preferred) setSelectedPlatform(preferred.platform);
      }

      setPhase('idle');
    } catch (err) {
      setError(`Failed to load firmware list: ${err}`);
      setPhase('error');
    }
  }, [apjBoardId]);

  // Auto-load manifest on mount
  useEffect(() => {
    if (!manifestLoaded) loadManifest();
  }, [manifestLoaded, loadManifest]);

  // Look up firmware when selection changes
  useEffect(() => {
    if (!selectedPlatform || !manifestLoaded) {
      setSelectedFirmware(null);
      return;
    }
    findFirmware(selectedPlatform, vehicleType, channel).then((fw) => {
      setSelectedFirmware(fw);
    });
  }, [selectedPlatform, vehicleType, channel, manifestLoaded]);

  // Clear downloaded firmware when board/vehicle/channel changes
  useEffect(() => {
    setDownloadedFirmware(null);
    setFirmwareSource('');
    setPhase((prev) => prev === 'ready' ? 'idle' : prev);
  }, [selectedPlatform, vehicleType, channel]);

  // Filtered board list
  const filteredBoards = useMemo(() => {
    // Hide BDShot variants from the list -- they're accessed via toggle
    const visible = boards.filter((b) => !b.isBDShot);
    if (!searchQuery.trim()) return visible;
    const q = searchQuery.toLowerCase();
    return visible.filter(
      (b) =>
        b.platform.toLowerCase().includes(q) ||
        b.brandName.toLowerCase().includes(q) ||
        b.manufacturer.toLowerCase().includes(q) ||
        b.aliases.some((a) => a.toLowerCase().includes(q))
    );
  }, [boards, searchQuery]);

  // BDShot toggle -- find if selected board has a BDShot variant
  const [useBDShot, setUseBDShot] = useState(false);

  const bdShotVariant = useMemo(() => {
    if (!selectedBoard) return null;
    return boards.find(
      (b) => b.isBDShot && b.boardId === selectedBoard.boardId && b.platform !== selectedBoard.platform
    ) ?? null;
  }, [boards, selectedBoard]);

  // When toggling BDShot, switch the selected platform
  const handleBDShotToggle = useCallback((enabled: boolean) => {
    setUseBDShot(enabled);
    if (enabled && bdShotVariant) {
      setSelectedPlatform(bdShotVariant.platform);
    } else if (!enabled && selectedBoard?.isBDShot) {
      // Switch back to the non-BDShot variant
      const normal = boards.find(
        (b) => !b.isBDShot && b.boardId === selectedBoard.boardId
      );
      if (normal) setSelectedPlatform(normal.platform);
    }
  }, [bdShotVariant, selectedBoard, boards]);

  // Selected board info
  const selectedBoard = useMemo(
    () => boards.find((b) => b.platform === selectedPlatform) || null,
    [boards, selectedPlatform]
  );

  /* ---------------------------------------------------------------- */
  /*  Download firmware from manifest URL                              */
  /* ---------------------------------------------------------------- */
  const handleDownloadFirmware = useCallback(async () => {
    if (!selectedFirmware) return;

    setPhase('downloading');
    setError(null);
    setDownloadedFirmware(null);
    setDownloadProgress('Downloading...');

    try {
      const fw = await downloadFirmware(selectedFirmware.url, (loaded, total) => {
        if (total > 0) {
          const pct = Math.round((loaded / total) * 100);
          setDownloadProgress(`Downloading... ${pct}%`);
        }
      });

      setDownloadProgress('Validating...');

      // Validate board_id match
      if (selectedBoard) {
        const validation = validateFirmware(fw, selectedBoard?.boardId ?? 0);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }

      setDownloadedFirmware(fw);
      setFirmwareSource(selectedFirmware.url);
      setDownloadProgress('');
      setPhase('ready');
    } catch (err) {
      setError(`Download failed: ${err}`);
      setDownloadProgress('');
      setPhase('error');
    }
  }, [selectedFirmware, selectedBoard]);

  /* ---------------------------------------------------------------- */
  /*  Load custom .apj from local file                                 */
  /* ---------------------------------------------------------------- */
  const handleLoadCustomApj = useCallback(async () => {
    const api = window.electronAPI;
    if (!api?.fs?.openFile) {
      setError('File dialog not available');
      return;
    }

    setError(null);

    try {
      const result = await api.fs.openFile([
        { name: 'ArduPilot Firmware', extensions: ['apj'] },
      ]);
      if (!result) return; // User cancelled

      setPhase('downloading');
      setDownloadProgress('Parsing firmware file...');

      const fw = await parseApj(result.content);

      // If a board is selected, validate match
      if (selectedBoard) {
        const validation = validateFirmware(fw, selectedBoard?.boardId ?? 0);
        if (!validation.valid) {
          // Warn but don't block -- user may know what they're doing
          setError(
            `Warning: ${validation.error}. ` +
            `The file targets board_id ${fw.boardId} but selected board is ${selectedBoard?.boardId}. ` +
            `Proceed with caution.`
          );
        }
      }

      // Extract filename from path
      const filename = result.path.split(/[/\\]/).pop() || result.path;

      setDownloadedFirmware(fw);
      setFirmwareSource(filename);
      setDownloadProgress('');
      setPhase('ready');
    } catch (err) {
      setError(`Failed to load firmware file: ${err}`);
      setDownloadProgress('');
      setPhase('error');
    }
  }, [selectedBoard]);

  /* ---------------------------------------------------------------- */
  /*  Flash firmware to FC                                             */
  /* ---------------------------------------------------------------- */
  const handleFlash = useCallback(async () => {
    if (!downloadedFirmware) return;

    setFlashing(true);
    setError(null);
    setFlashProgress(null);

    try {
      const result = await flashFirmware({
        firmware: downloadedFirmware,
        onProgress: (progress) => {
          setFlashProgress(progress);
        },
      });

      if (!result.success) {
        setError(result.error || 'Flash failed');
        setPhase('error');
      } else {
        setPhase('idle');
        setDownloadedFirmware(null);
        setFirmwareSource('');
      }
    } catch (err) {
      setError(`Flash failed: ${err}`);
      setPhase('error');
    } finally {
      setFlashing(false);
    }
  }, [downloadedFirmware]);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Install Firmware
        </h1>
        <p className="mt-1 text-lg text-muted">
          {isConnected
            ? 'Update or change the firmware on your connected flight controller.'
            : 'Select your board and flash ArduPilot firmware.'}
        </p>
      </div>

      {/* Vehicle type + Channel selection */}
      <div className="card">
        <div className="section-header">Firmware Selection</div>
        <div className="p-6 space-y-5">
          {/* Vehicle type */}
          <div>
            <label className="mb-2 block text-[12px] font-bold uppercase tracking-widest text-subtle">
              Vehicle Type
            </label>
            <div className="flex gap-3">
              <VehicleButton
                icon={Box}
                label="Copter"
                sublabel="Multirotor, Helicopter"
                selected={vehicleType === 'Copter'}
                onClick={() => setVehicleType('Copter')}
              />
              <VehicleButton
                icon={Plane}
                label="Plane"
                sublabel="Fixed Wing, VTOL"
                selected={vehicleType === 'Plane'}
                onClick={() => setVehicleType('Plane')}
              />
            </div>
          </div>

          {/* Release channel */}
          <div>
            <label className="mb-2 block text-[12px] font-bold uppercase tracking-widest text-subtle">
              Release Channel
            </label>
            <div className="flex gap-2">
              {(['stable', 'beta', 'latest'] as ReleaseChannel[]).map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannel(ch)}
                  className={`rounded px-4 py-2 text-sm font-semibold transition ${
                    channel === ch
                      ? 'bg-accent text-black'
                      : 'bg-surface-0 text-muted border border-border hover:text-foreground'
                  }`}
                >
                  {ch === 'stable' ? 'Stable' : ch === 'beta' ? 'Beta' : 'Latest (Dev)'}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[13px] text-subtle">
              {channel === 'stable' && 'Recommended. Well-tested release for regular use.'}
              {channel === 'beta' && 'Pre-release. Help test new features before stable.'}
              {channel === 'latest' && 'Development build. May have untested changes. Use with caution.'}
            </p>
          </div>
        </div>
      </div>

      {/* Board selection */}
      <div className="card">
        <div className="section-header flex items-center justify-between">
          <span>Board Selection</span>
          <button
            onClick={() => loadManifest(true)}
            disabled={phase === 'loading-manifest'}
            className="btn btn-ghost h-7 px-2 text-[11px]"
          >
            <RefreshCw size={12} className={phase === 'loading-manifest' ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* Connected board auto-detect */}
          {isConnected && selectedBoard && (
            <div className="flex items-center gap-3 rounded bg-green-900/20 border border-green-700/30 px-4 py-3">
              <CheckCircle2 size={18} className="text-green-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Detected: {selectedBoard.brandName}
                  {selectedBoard.aliases.length > 0 && (
                    <span className="font-normal text-muted ml-1">
                      ({selectedBoard.aliases[0]})
                    </span>
                  )}
                </p>
                <p className="text-[12px] text-muted">
                  Board ID: {selectedBoard.boardId} -- Firmware target: {selectedBoard.platform}
                  {selectedBoard.manufacturer && ` -- ${selectedBoard.manufacturer}`}
                </p>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              type="text"
              placeholder="Search boards... (e.g. Matek, Pixhawk, CubeOrange)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-full pl-9"
            />
          </div>

          {/* Board list */}
          {phase === 'loading-manifest' && !manifestLoaded ? (
            <div className="flex items-center gap-3 py-8 justify-center text-muted">
              <Loader2 size={20} className="animate-spin text-accent" />
              Loading firmware list...
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto rounded border border-border bg-[#0a0908]">
              {filteredBoards.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-subtle">
                  {searchQuery ? 'No boards match your search.' : 'No boards available.'}
                </div>
              ) : (
                filteredBoards.map((board) => {
                  const isSelected = selectedPlatform === board.platform;
                  const hasVehicle = board.firmware.has(vehicleType);
                  return (
                    <button
                      key={board.platform}
                      onClick={() => setSelectedPlatform(board.platform)}
                      disabled={!hasVehicle}
                      className={`w-full text-left px-4 py-2.5 border-b border-border/30 transition
                        ${isSelected
                          ? 'bg-accent/10 border-l-2 border-l-accent'
                          : hasVehicle
                            ? 'hover:bg-surface-0 border-l-2 border-l-transparent'
                            : 'opacity-30 border-l-2 border-l-transparent cursor-not-allowed'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${isSelected ? 'text-accent' : 'text-foreground'}`}>
                            {board.brandName}
                          </span>
                          {board.manufacturer && (
                            <span className="text-[12px] text-subtle">{board.manufacturer}</span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-subtle">ID:{board.boardId}</span>
                      </div>
                      {board.platform !== board.brandName && (
                        <div className="text-[12px] text-subtle mt-0.5">{board.platform}</div>
                      )}
                      {board.aliases.length > 0 && (
                        <div className="text-[11px] text-accent/60 mt-0.5">
                          Also known as: {board.aliases.join(', ')}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Firmware details + action buttons */}
      {selectedFirmware && (
        <div className="card">
          <div className="section-header">
            {downloadedFirmware ? 'Firmware Ready' : 'Available Firmware'}
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Board" value={selectedFirmware.brandName} />
              <InfoItem label="Vehicle" value={selectedFirmware.vehicleType} />
              <InfoItem label="Version" value={selectedFirmware.version} />
              <InfoItem label="Channel" value={channel} />
              <InfoItem label="Git SHA" value={selectedFirmware.gitSha.substring(0, 10)} />
              <InfoItem label="Board ID" value={String(selectedFirmware.boardId)} />
            </div>

            {/* BDShot toggle -- only shown when a variant exists */}
            {(bdShotVariant || selectedBoard?.isBDShot) && (
              <label className="flex items-center gap-3 rounded border border-border bg-surface-0 px-4 py-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useBDShot}
                  onChange={(e) => handleBDShotToggle(e.target.checked)}
                  className="h-4 w-4 shrink-0 accent-[#ffaa2a] rounded"
                />
                <div>
                  <span className="text-sm font-semibold text-foreground">Use BDShot firmware</span>
                  <p className="text-xs text-muted mt-0.5">
                    BDShot enables bidirectional DShot, allowing the FC to read RPM from ESCs
                    for dynamic notch filtering. Requires BLHeli_32 or AM32 ESCs with
                    bidirectional DShot capability.
                  </p>
                </div>
              </label>
            )}

            {/* Downloaded firmware info */}
            {downloadedFirmware && (
              <div className="flex items-center gap-3 rounded bg-green-900/20 border border-green-700/30 px-4 py-3">
                <CheckCircle2 size={18} className="text-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-300">
                    Firmware downloaded and validated
                  </p>
                  <p className="text-[12px] text-muted">
                    {downloadedFirmware.description || downloadedFirmware.summary || 'ArduPilot firmware'}
                    {' -- '}
                    {formatBytes(downloadedFirmware.imageSize)} image
                    {downloadedFirmware.gitIdentity && ` -- ${downloadedFirmware.gitIdentity}`}
                  </p>
                  <p className="text-[11px] text-subtle mt-0.5">
                    Source: {firmwareSource}
                  </p>
                </div>
              </div>
            )}

            {/* Download progress */}
            {phase === 'downloading' && (
              <div className="flex items-center gap-3 rounded bg-accent/5 border border-accent/20 px-4 py-3">
                <Loader2 size={18} className="text-accent animate-spin shrink-0" />
                <span className="text-sm text-foreground">{downloadProgress}</span>
              </div>
            )}

            {isConnected && !downloadedFirmware && (
              <div className="flex items-start gap-3 rounded bg-yellow-900/20 border border-yellow-600/30 px-4 py-3">
                <AlertCircle size={18} className="text-yellow-400 shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-200/80">
                  Flashing will reboot the flight controller into bootloader mode.
                  Make sure to back up your parameters first. Do not disconnect
                  USB during the flash process.
                </div>
              </div>
            )}

            {/* First-time flash warning for boards that may not have ArduPilot bootloader */}
            {!isConnected && !downloadedFirmware && (
              <div className="flex items-start gap-3 rounded bg-blue-900/20 border border-blue-500/30 px-4 py-3">
                <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-200/80 space-y-1">
                  <p className="font-semibold text-blue-300">First time flashing ArduPilot?</p>
                  <p>
                    This only works for boards that already have the ArduPilot
                    bootloader. If your board is running INAV or Betaflight, you
                    need to flash <span className="font-mono text-blue-300">arduXXX_with_bl.hex</span> via
                    DFU mode first (using STM32CubeProgrammer or Betaflight Configurator).
                  </p>
                </div>
              </div>
            )}

            {/* Flash progress */}
            {flashProgress && (
              <FlashProgressBar progress={flashProgress} />
            )}

            <div className="flex gap-3">
              {!downloadedFirmware ? (
                <>
                  <button
                    className="btn btn-primary h-11 gap-2 px-6"
                    disabled={phase === 'downloading'}
                    onClick={handleDownloadFirmware}
                  >
                    {phase === 'downloading' ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <FileDown size={18} />
                    )}
                    {phase === 'downloading' ? 'Downloading...' : 'Download Firmware'}
                  </button>
                  <button
                    className="btn btn-ghost h-11 gap-2 px-4"
                    disabled={phase === 'downloading'}
                    onClick={handleLoadCustomApj}
                  >
                    <Upload size={16} />
                    Load Custom .apj
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-primary h-11 gap-2 px-6"
                    disabled={flashing}
                    onClick={handleFlash}
                  >
                    {flashing ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <HardDrive size={18} />
                    )}
                    {flashing ? 'Flashing...' : 'Flash to FC'}
                  </button>
                  <button
                    className="btn btn-ghost h-11 gap-2 px-4"
                    disabled={flashing}
                    onClick={() => {
                      setDownloadedFirmware(null);
                      setFirmwareSource('');
                      setPhase('idle');
                      setError(null);
                      setFlashProgress(null);
                    }}
                  >
                    Clear
                  </button>
                </>
              )}
            </div>

            {!downloadedFirmware && (
              <p className="text-[12px] text-subtle">
                Firmware URL: {selectedFirmware.url}
              </p>
            )}
          </div>
        </div>
      )}

      {/* No board selected but user can still load custom firmware */}
      {!selectedFirmware && manifestLoaded && (
        <div className="card">
          <div className="section-header">Custom Firmware</div>
          <div className="p-6 space-y-4">
            {selectedPlatform ? (
              <p className="text-sm text-muted">
                No {vehicleType} firmware ({channel}) available for this board in the manifest.
                You can load a custom .apj file instead.
              </p>
            ) : (
              <p className="text-sm text-muted">
                Select a board above, or load a custom .apj firmware file directly.
              </p>
            )}

            {/* Downloaded firmware info (from custom load without manifest selection) */}
            {downloadedFirmware && (
              <div className="flex items-center gap-3 rounded bg-green-900/20 border border-green-700/30 px-4 py-3">
                <CheckCircle2 size={18} className="text-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-300">
                    Custom firmware loaded
                  </p>
                  <p className="text-[12px] text-muted">
                    Board ID: {downloadedFirmware.boardId}
                    {' -- '}
                    {formatBytes(downloadedFirmware.imageSize)} image
                    {downloadedFirmware.description && ` -- ${downloadedFirmware.description}`}
                  </p>
                  <p className="text-[11px] text-subtle mt-0.5">
                    Source: {firmwareSource}
                  </p>
                </div>
              </div>
            )}

            {phase === 'downloading' && (
              <div className="flex items-center gap-3 rounded bg-accent/5 border border-accent/20 px-4 py-3">
                <Loader2 size={18} className="text-accent animate-spin shrink-0" />
                <span className="text-sm text-foreground">{downloadProgress}</span>
              </div>
            )}

            <div className="flex gap-3">
              {downloadedFirmware ? (
                <>
                  <button
                    className="btn btn-primary h-11 gap-2 px-6"
                    disabled={flashing}
                    onClick={handleFlash}
                  >
                    {flashing ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <HardDrive size={18} />
                    )}
                    {flashing ? 'Flashing...' : 'Flash to FC'}
                  </button>
                  <button
                    className="btn btn-ghost h-11 gap-2 px-4"
                    disabled={flashing}
                    onClick={() => {
                      setDownloadedFirmware(null);
                      setFirmwareSource('');
                      setPhase('idle');
                      setError(null);
                      setFlashProgress(null);
                    }}
                  >
                    Clear
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-ghost h-11 gap-2 px-4"
                  disabled={phase === 'downloading'}
                  onClick={handleLoadCustomApj}
                >
                  <Upload size={16} />
                  Load Custom .apj
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="rounded bg-danger-muted/40 border border-danger/30 px-5 py-3.5 space-y-2">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-danger" />
            <span className="text-sm text-danger">{error}</span>
          </div>
          {flashing && (
            <div className="flex items-start gap-3 pl-8">
              <Info size={14} className="mt-0.5 shrink-0 text-muted" />
              <p className="text-xs text-muted">
                If flashing failed mid-program, the board may be in bootloader mode.
                This is safe -- the board is not bricked. Disconnect and reconnect USB,
                then try flashing again. If the board does not appear, hold the BOOT
                button while plugging in USB to enter DFU mode.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function VehicleButton({ icon: Icon, label, sublabel, selected, onClick }: {
  icon: React.ElementType;
  label: string;
  sublabel: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded px-5 py-3 transition border
        ${selected
          ? 'bg-accent/10 border-accent text-foreground'
          : 'bg-surface-0 border-border text-muted hover:text-foreground hover:border-muted'
        }`}
    >
      <Icon size={24} className={selected ? 'text-accent' : 'text-subtle'} />
      <div className="text-left">
        <div className={`text-sm font-bold ${selected ? 'text-accent' : ''}`}>{label}</div>
        <div className="text-[11px] text-subtle">{sublabel}</div>
      </div>
    </button>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-widest text-subtle">{label}</div>
      <div className="text-sm font-semibold text-foreground mt-0.5">{value}</div>
    </div>
  );
}

function FlashProgressBar({ progress }: { progress: FlashProgressInfo }) {
  const isError = progress.phase === 'error';
  const isComplete = progress.phase === 'complete';
  const pct = Math.round(progress.progress * 100);

  return (
    <div className="rounded border border-border bg-[#0a0908] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 size={16} className="text-green-400" />
          ) : isError ? (
            <AlertCircle size={16} className="text-danger" />
          ) : (
            <Loader2 size={16} className="text-accent animate-spin" />
          )}
          <span className={`text-sm font-semibold ${
            isComplete ? 'text-green-300' : isError ? 'text-danger' : 'text-foreground'
          }`}>
            {progress.phase === 'scanning' && 'Scanning for bootloader'}
            {progress.phase === 'identifying' && 'Identifying board'}
            {progress.phase === 'erasing' && 'Erasing flash'}
            {progress.phase === 'programming' && 'Programming firmware'}
            {progress.phase === 'verifying' && 'Verifying CRC'}
            {progress.phase === 'rebooting-app' && 'Rebooting'}
            {progress.phase === 'rebooting' && 'Rebooting to bootloader'}
            {isComplete && 'Flash complete!'}
            {isError && 'Flash failed'}
          </span>
        </div>
        {!isComplete && !isError && (
          <span className="text-[12px] font-mono text-muted">{pct}%</span>
        )}
      </div>

      {/* Progress bar */}
      {!isError && (
        <div className="h-2 rounded-full bg-border/50 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isComplete ? 'bg-green-500' : 'bg-accent'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <p className="text-[12px] text-subtle">{progress.message}</p>
    </div>
  );
}
