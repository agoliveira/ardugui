/**
 * Parameter auto-backup utility.
 *
 * Called after parameters finish loading. Checks the user's preference
 * and creates an automatic snapshot if enabled. On first connect,
 * prompts the user to enable/disable auto-backup.
 */

import { useParameterStore } from '../store/parameterStore';
import { useVehicleStore } from '../store/vehicleStore';

const PREF_AUTO_BACKUP = 'auto_backup_on_connect';

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
 */
export function getAircraftName(): string {
  const { type, firmwareVersion } = useVehicleStore.getState();
  const parts: string[] = [];
  if (type) parts.push(type.charAt(0).toUpperCase() + type.slice(1));
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

  // Ensure aircraft exists in DB
  await api.upsertAircraft({
    id: aircraftId,
    name: getAircraftName(),
    vehicle_type: type ?? undefined,
    firmware_version: firmwareVersion ?? undefined,
  });

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
