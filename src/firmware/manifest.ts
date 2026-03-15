/**
 * ArduPilot Firmware Manifest Client
 *
 * Downloads and parses the firmware manifest from firmware.ardupilot.org.
 * Groups by PLATFORM (e.g. "MatekF405-TE" vs "MatekF405-TE-bdshot")
 * so users can see and choose between firmware variants like BDShot.
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** Vehicle types we support (V1: Plane + Copter only) */
export type VehicleType = 'Copter' | 'Plane';

/** Release channels */
export type ReleaseChannel = 'stable' | 'beta' | 'latest';

/** Raw manifest entry from firmware.ardupilot.org/manifest.json */
export interface ManifestEntry {
  board_id: number;
  vehicletype: string;
  'mav-type': string;
  format: string;
  url: string;
  'mav-firmware-version-type': string;
  'mav-firmware-version': string;
  'mav-firmware-version-major': string;
  'mav-firmware-version-minor': string;
  'mav-firmware-version-patch': string;
  'mav-autopilot': string;
  platform: string;
  brand_name?: string;
  manufacturer?: string;
  bootloader_str?: string[];
  USBID?: string[];
  'git-sha': string;
  latest: number;
}

/** Processed firmware entry for UI consumption */
export interface FirmwareInfo {
  boardId: number;
  platform: string;
  brandName: string;
  manufacturer: string;
  vehicleType: VehicleType;
  version: string;
  versionMajor: number;
  versionMinor: number;
  versionPatch: number;
  channel: ReleaseChannel;
  url: string;
  gitSha: string;
  bootloaderStr: string[];
  usbIds: string[];
}

/** Board summary -- keyed by PLATFORM (not board_id) */
export interface BoardInfo {
  /** Firmware platform name (unique key) -- e.g. "MatekF405-TE" or "MatekF405-TE-bdshot" */
  platform: string;
  boardId: number;
  brandName: string;
  manufacturer: string;
  bootloaderStr: string[];
  usbIds: string[];
  /** Extra searchable names from our board database */
  aliases: string[];
  /** True if this is a BDShot or other variant */
  isBDShot: boolean;
  /** Available firmware by vehicle type and channel */
  firmware: Map<VehicleType, Map<ReleaseChannel, FirmwareInfo>>;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MANIFEST_URL = 'https://firmware.ardupilot.org/manifest.json';

/** Only these vehicle types are supported in V1 */
const SUPPORTED_VEHICLES = new Set<string>(['Copter', 'Plane']);

/** Map manifest version-type strings to our channel enum */
function parseChannel(versionType: string): ReleaseChannel | null {
  if (!versionType) return null;
  const upper = versionType.toUpperCase();
  if (upper.startsWith('STABLE') || upper === 'OFFICIAL') return 'stable';
  if (upper.startsWith('BETA')) return 'beta';
  if (upper === 'DEV' || upper === 'LATEST') return 'latest';
  return null;
}

/* ------------------------------------------------------------------ */
/*  Manifest Cache                                                     */
/* ------------------------------------------------------------------ */

let cachedManifest: ManifestEntry[] | null = null;
let cachedBoards: Map<string, BoardInfo> | null = null;
let lastFetchTime = 0;

/** Cache TTL: 1 hour */
const CACHE_TTL_MS = 60 * 60 * 1000;

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Download and parse the firmware manifest.
 * Returns the raw entries (filtered to APJ format only).
 * Results are cached for 1 hour.
 */
export async function fetchManifest(forceRefresh = false): Promise<ManifestEntry[]> {
  const now = Date.now();
  if (!forceRefresh && cachedManifest && (now - lastFetchTime) < CACHE_TTL_MS) {
    return cachedManifest;
  }

  const api = window.electronAPI;
  let text: string;

  if (api?.net?.fetch) {
    const result = await api.net.fetch(MANIFEST_URL);
    if (!result.ok || !result.text) {
      throw new Error(`Failed to fetch manifest: ${result.error || 'unknown error'}`);
    }
    text = result.text;
  } else {
    const response = await fetch(MANIFEST_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch manifest: ${response.status} ${response.statusText}`);
    }
    text = await response.text();
  }

  const data = JSON.parse(text);
  if (!data.firmware || !Array.isArray(data.firmware)) {
    throw new Error('Invalid manifest format: missing firmware array');
  }

  cachedManifest = (data.firmware as ManifestEntry[]).filter(
    (e) => e.format === 'apj'
  );

  lastFetchTime = now;
  cachedBoards = null;

  return cachedManifest;
}

/**
 * Get all boards grouped by PLATFORM. Each firmware build target
 * (e.g. "MatekF405-TE" and "MatekF405-TE-bdshot") is a separate entry.
 */
export async function getBoards(forceRefresh = false): Promise<BoardInfo[]> {
  if (!forceRefresh && cachedBoards) {
    return Array.from(cachedBoards.values());
  }

  const entries = await fetchManifest(forceRefresh);
  const boardMap = new Map<string, BoardInfo>();

  for (const entry of entries) {
    if (!SUPPORTED_VEHICLES.has(entry.vehicletype)) continue;
    if (!entry.board_id) continue;

    const channel = parseChannel(entry['mav-firmware-version-type']);
    if (!channel) continue;

    const vehicleType = entry.vehicletype as VehicleType;
    const platform = entry.platform;

    // Key by platform -- each firmware target is its own entry
    let board = boardMap.get(platform);
    if (!board) {
      const lowerPlatform = platform.toLowerCase();
      board = {
        platform,
        boardId: entry.board_id,
        brandName: entry.brand_name || platform,
        manufacturer: entry.manufacturer || '',
        bootloaderStr: entry.bootloader_str || [],
        usbIds: entry.USBID || [],
        aliases: [],
        isBDShot: lowerPlatform.includes('bdshot'),
        firmware: new Map(),
      };
      boardMap.set(platform, board);
    }

    let vehicleMap = board.firmware.get(vehicleType);
    if (!vehicleMap) {
      vehicleMap = new Map();
      board.firmware.set(vehicleType, vehicleMap);
    }

    const existing = vehicleMap.get(channel);
    const newVersion = entry['mav-firmware-version'] || '0.0.0';

    if (!existing || compareVersions(newVersion, existing.version) > 0) {
      vehicleMap.set(channel, {
        boardId: entry.board_id,
        platform,
        brandName: entry.brand_name || platform,
        manufacturer: entry.manufacturer || '',
        vehicleType,
        version: newVersion,
        versionMajor: parseInt(entry['mav-firmware-version-major'] || '0'),
        versionMinor: parseInt(entry['mav-firmware-version-minor'] || '0'),
        versionPatch: parseInt(entry['mav-firmware-version-patch'] || '0'),
        channel,
        url: entry.url,
        gitSha: entry['git-sha'] || '',
        bootloaderStr: entry.bootloader_str || [],
        usbIds: entry.USBID || [],
      });
    }
  }

  cachedBoards = boardMap;

  // Enrich with aliases from boardData.
  // Aliases are attached to ALL platforms sharing the same board_id.
  try {
    const { ALL_EXTENDED_BOARDS } = await import('@/models/boardData');

    const aliasMap = new Map<number, Set<string>>();
    for (const ext of ALL_EXTENDED_BOARDS) {
      if (!ext.apjBoardId) continue;
      let names = aliasMap.get(ext.apjBoardId);
      if (!names) {
        names = new Set();
        aliasMap.set(ext.apjBoardId, names);
      }
      if (ext.name) names.add(ext.name);
      if (ext.description && ext.description !== ext.name) {
        names.add(ext.description);
      }
    }

    for (const board of boardMap.values()) {
      const names = aliasMap.get(board.boardId);
      if (!names) continue;
      for (const alias of names) {
        const lower = alias.toLowerCase();
        if (lower !== board.platform.toLowerCase() &&
            lower !== board.brandName.toLowerCase() &&
            !board.aliases.some((a) => a.toLowerCase() === lower)) {
          board.aliases.push(alias);
        }
      }
      if (!board.manufacturer) {
        const ext = ALL_EXTENDED_BOARDS.find(
          (e) => e.apjBoardId === board.boardId && e.manufacturer && e.manufacturer !== 'Unknown'
        );
        if (ext) board.manufacturer = ext.manufacturer;
      }
    }
  } catch {
    // boardData not available -- aliases just won't be enriched
  }

  return Array.from(boardMap.values());
}

/**
 * Find firmware for a specific platform + vehicle type + channel.
 */
export async function findFirmware(
  platform: string,
  vehicleType: VehicleType,
  channel: ReleaseChannel = 'stable',
): Promise<FirmwareInfo | null> {
  const boards = await getBoards();
  const board = boards.find((b) => b.platform === platform);
  if (!board) return null;

  const vehicleMap = board.firmware.get(vehicleType);
  if (!vehicleMap) return null;

  return vehicleMap.get(channel) || null;
}

/**
 * Find all boards matching a board_id (APJ_BOARD_ID from AUTOPILOT_VERSION).
 * Returns multiple entries when variants exist (e.g. standard + bdshot).
 */
export async function findBoardsByBoardId(boardId: number): Promise<BoardInfo[]> {
  const boards = await getBoards();
  return boards.filter((b) => b.boardId === boardId);
}

/**
 * Find board by platform name (case-insensitive partial match).
 */
export async function searchBoards(query: string): Promise<BoardInfo[]> {
  const boards = await getBoards();
  const q = query.toLowerCase();
  return boards.filter(
    (b) =>
      b.platform.toLowerCase().includes(q) ||
      b.brandName.toLowerCase().includes(q) ||
      b.manufacturer.toLowerCase().includes(q) ||
      b.aliases.some((a) => a.toLowerCase().includes(q))
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const va = pa[i] || 0;
    const vb = pb[i] || 0;
    if (va !== vb) return va - vb;
  }
  return 0;
}

export function clearManifestCache(): void {
  cachedManifest = null;
  cachedBoards = null;
  lastFetchTime = 0;
}
