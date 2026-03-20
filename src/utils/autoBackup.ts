/**
 * Parameter auto-backup utility.
 *
 * Called after parameters finish loading. Checks the user's preference
 * and creates an automatic snapshot if enabled. On first connect,
 * prompts the user to enable/disable auto-backup.
 */

import { useParameterStore } from '../store/parameterStore';
import { useVehicleStore } from '../store/vehicleStore';
import { getBoardById } from '../models/boardRegistry';
import { AIRFRAME_PRESETS } from '../models/airframeTemplates';
import type { VehicleType } from '../store/vehicleStore';

const PREF_AUTO_BACKUP = 'auto_backup_on_connect';

/**
 * Detect the airframe preset ID from current FC parameters.
 * Pure function (no hooks) -- mirrors useDetectedPreset logic.
 * Returns the preset ID string (e.g. "copter_quad_x") or null.
 */
export function detectPresetId(): string | null {
  const { parameters } = useParameterStore.getState();
  const { type: vehicleType } = useVehicleStore.getState();
  if (!parameters.size || !vehicleType) return null;

  const getVal = (name: string): number | null =>
    parameters.get(name)?.value ?? null;

  const effectivelyVtol = vehicleType === 'quadplane';
  const effectivelyPlane = vehicleType === 'plane';

  // Copters & VTOLs: match by additionalParams (FRAME_CLASS/TYPE)
  for (const preset of AIRFRAME_PRESETS) {
    const ap = preset.additionalParams;
    if (!ap) continue;

    const allMatch = Object.entries(ap).every(([key, val]) => getVal(key) === val);
    if (allMatch) {
      if (preset.category === 'vtol' && !effectivelyVtol) continue;
      if (preset.category === 'copter' && vehicleType !== 'copter') continue;
      return preset.id;
    }
  }

  // Planes: match by output-to-function mapping
  if (effectivelyPlane) {
    let bestId: string | null = null;
    let bestScore = -1;

    for (const preset of AIRFRAME_PRESETS) {
      if (preset.category !== 'plane') continue;

      const expectedOutputs = new Map<number, number>();
      if (preset.planeTemplate) {
        for (const s of preset.planeTemplate.surfaces) {
          expectedOutputs.set(s.defaultOutput, s.function);
        }
      }
      for (const m of preset.motorTemplate.forwardMotors) {
        expectedOutputs.set(m.defaultOutput, m.function);
      }
      if (expectedOutputs.size === 0) continue;

      let matches = 0;
      for (const [output, expectedFunc] of expectedOutputs) {
        if (getVal(`SERVO${output}_FUNCTION`) === expectedFunc) matches++;
      }

      let extraNonZero = 0;
      for (let i = 1; i <= 16; i++) {
        if (!expectedOutputs.has(i)) {
          const val = getVal(`SERVO${i}_FUNCTION`);
          if (val !== null && val !== 0) extraNonZero++;
        }
      }

      const score = matches - (extraNonZero * 0.1);
      if (score > bestScore) {
        bestScore = score;
        bestId = preset.id;
      }
    }

    if (bestId) {
      const bestPreset = AIRFRAME_PRESETS.find((p) => p.id === bestId);
      if (bestPreset) {
        const expectedSize = (bestPreset.planeTemplate?.surfaces.length ?? 0) +
          bestPreset.motorTemplate.forwardMotors.length;
        if (bestScore >= expectedSize * 0.7) return bestId;
      }
    }
  }

  return null;
}

/**
 * Get and merge metadata JSON for an aircraft, preserving existing fields.
 */
async function updateMetadataField(
  aircraftId: string,
  fields: Record<string, unknown>
): Promise<void> {
  const api = window.electronAPI?.db;
  if (!api) return;
  const existing = await api.getAircraft(aircraftId);
  let current: Record<string, unknown> = {};
  if (existing?.metadata) {
    try { current = JSON.parse(existing.metadata); } catch { /* ignore */ }
  }
  const merged = { ...current, ...fields };
  await api.updateAircraftMetadata(aircraftId, JSON.stringify(merged));
}

/**
 * Store the detected frame preset ID and board type in aircraft metadata.
 * Called after params are loaded (during auto-backup or identify).
 */
async function persistAircraftMetadata(aircraftId: string, vehicleType: VehicleType): Promise<void> {
  const presetId = detectPresetId();
  const fields: Record<string, unknown> = {};
  if (presetId) fields.presetId = presetId;
  if (vehicleType) fields.vehicleType = vehicleType;
  // Store board type from boardRegistry for richer card display
  const { boardId } = useVehicleStore.getState();
  if (boardId) {
    const board = getBoardById(boardId);
    if (board?.name) fields.boardName = board.name;
  }
  if (Object.keys(fields).length > 0) {
    await updateMetadataField(aircraftId, fields);
  }
}

/**
 * Build the aircraft identity string used as the DB primary key.
 * Prefers boardId (from AUTOPILOT_VERSION), falls back to a
 * combo of vehicle type + firmware version.
 */
export function getAircraftId(): string | null {
  const { boardId, type, firmwareVersion } = useVehicleStore.getState();
  if (boardId) return boardId;
  // Fallback: type + version gives a rough identity
  if (type && firmwareVersion) return `${type}-${firmwareVersion}`;
  return null;
}

/**
 * Build a human-readable aircraft name for first-time registration.
 * Tries to include board name for specificity.
 */
export function getAircraftName(): string {
  const { type, firmwareVersion, boardId } = useVehicleStore.getState();
  const parts: string[] = [];
  if (type) parts.push(type.charAt(0).toUpperCase() + type.slice(1));
  if (boardId) {
    const board = getBoardById(boardId);
    if (board?.name) parts.push(`(${board.name})`);
  }
  if (firmwareVersion) parts.push(`v${firmwareVersion}`);
  return parts.length > 0 ? parts.join(' ') : 'Unknown Aircraft';
}

/**
 * Get current parameters as an array suitable for snapshot storage.
 */
export function getCurrentParamsArray(): { name: string; value: number; type: string | null }[] {
  const { parameters } = useParameterStore.getState();
  const result: { name: string; value: number; type: string | null }[] = [];
  for (const [, entry] of parameters) {
    result.push({
      name: entry.name,
      value: entry.value,
      type: entry.type ?? null,
    });
  }
  return result;
}

/**
 * Check auto-backup preference. Returns 'enabled', 'disabled', or 'unset' (first time).
 */
export async function getAutoBackupPref(): Promise<'enabled' | 'disabled' | 'unset'> {
  const api = window.electronAPI?.db;
  if (!api) return 'unset';
  const val = await api.getPreference(PREF_AUTO_BACKUP);
  if (val === 'true') return 'enabled';
  if (val === 'false') return 'disabled';
  return 'unset';
}

/**
 * Set auto-backup preference.
 */
export async function setAutoBackupPref(enabled: boolean): Promise<void> {
  const api = window.electronAPI?.db;
  if (!api) return;
  await api.setPreference(PREF_AUTO_BACKUP, enabled ? 'true' : 'false');
}

/**
 * Run the auto-backup flow. Returns true if a snapshot was created.
 */
export async function runAutoBackup(): Promise<boolean> {
  const api = window.electronAPI?.db;
  if (!api) return false;

  const aircraftId = getAircraftId();
  if (!aircraftId) return false;

  const { type, firmwareVersion } = useVehicleStore.getState();

  // Ensure aircraft exists in DB -- but don't overwrite a user-set name
  const existing = await api.getAircraft(aircraftId);
  if (!existing) {
    await api.upsertAircraft({
      id: aircraftId,
      name: getAircraftName(),
      vehicle_type: type ?? undefined,
      firmware_version: firmwareVersion ?? undefined,
    });
  } else {
    // Update metadata but keep the existing name
    await api.upsertAircraft({
      id: aircraftId,
      name: existing.name,
      vehicle_type: type ?? undefined,
      firmware_version: firmwareVersion ?? undefined,
    });
  }

  // Create the snapshot
  const params = getCurrentParamsArray();
  if (params.length === 0) return false;

  const timestamp = new Date().toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  await api.createSnapshot(aircraftId, `Auto-backup ${timestamp}`, 'auto', params);
  await persistAircraftMetadata(aircraftId, type);
  console.log(`[AutoBackup] Created snapshot with ${params.length} params for ${aircraftId}`);
  return true;
}

/**
 * Create a manual snapshot with a custom label.
 */
export async function createManualSnapshot(label: string): Promise<boolean> {
  const api = window.electronAPI?.db;
  if (!api) return false;

  const aircraftId = getAircraftId();
  if (!aircraftId) return false;

  const params = getCurrentParamsArray();
  if (params.length === 0) return false;

  await api.createSnapshot(aircraftId, label, 'manual', params);
  console.log(`[Backup] Manual snapshot "${label}" with ${params.length} params`);
  return true;
}

/**
 * Check if an aircraft name looks auto-generated (never user-named).
 */
function isAutoGeneratedName(name: string): boolean {
  const n = name.trim();
  if (n === 'Unknown Aircraft') return true;
  // Auto-generated names start with vehicle type, optionally with board and version
  // e.g. "Copter v4.6.3", "Copter (Matek F405-Wing) v4.6.3", "Plane v4.5.1"
  return /^(Copter|Plane|Quadplane)\b/.test(n);
}

/**
 * Identify the connected aircraft. Checks the DB for an existing record.
 * If found with a user-set name, loads it. If found with an auto-generated
 * name (or not found at all), flags for naming prompt.
 */
export async function identifyAircraft(): Promise<void> {
  const api = window.electronAPI?.db;
  if (!api) return;

  const aircraftId = getAircraftId();
  if (!aircraftId) return;

  const store = useVehicleStore.getState();
  const existing = await api.getAircraft(aircraftId);

  if (existing && !isAutoGeneratedName(existing.name)) {
    // User has named this aircraft before -- load it
    store.setAircraftName(existing.name);
    store.setIsNewAircraft(false);
  } else {
    // Either new aircraft or exists with auto-generated name -- prompt to name
    const defaultName = existing?.name ?? getAircraftName();
    store.setAircraftName(defaultName);
    store.setIsNewAircraft(true);
  }

  // Persist frame preset and board info in metadata (for fleet view cards)
  await persistAircraftMetadata(aircraftId, store.type);
}

/**
 * Save a user-chosen aircraft name to the DB and update the store.
 */
export async function saveAircraftName(name: string): Promise<boolean> {
  const api = window.electronAPI?.db;
  if (!api) return false;

  const aircraftId = getAircraftId();
  if (!aircraftId) return false;

  const { type, firmwareVersion } = useVehicleStore.getState();

  await api.upsertAircraft({
    id: aircraftId,
    name,
    vehicle_type: type ?? undefined,
    firmware_version: firmwareVersion ?? undefined,
  });

  useVehicleStore.getState().setAircraftName(name);
  useVehicleStore.getState().setIsNewAircraft(false);
  return true;
}
