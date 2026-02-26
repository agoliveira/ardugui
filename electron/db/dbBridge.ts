/**
 * IPC handlers for the parameter database.
 *
 * Registers all db:* handlers so the renderer can interact
 * with the SQLite parameter store via the preload bridge.
 */

import { ipcMain } from 'electron';
import * as db from './parameterDb';

export function registerDbHandlers(): void {
  // ── Aircraft ───────────────────────────────────────────────────────

  ipcMain.handle('db:get-aircraft', (_e, id: string) => {
    return db.getAircraft(id);
  });

  ipcMain.handle('db:list-aircraft', () => {
    return db.listAircraft();
  });

  ipcMain.handle('db:upsert-aircraft', (_e, data: Parameters<typeof db.upsertAircraft>[0]) => {
    return db.upsertAircraft(data);
  });

  ipcMain.handle('db:rename-aircraft', (_e, id: string, name: string) => {
    db.renameAircraft(id, name);
  });

  ipcMain.handle('db:delete-aircraft', (_e, id: string) => {
    db.deleteAircraft(id);
  });

  // ── Snapshots ──────────────────────────────────────────────────────

  ipcMain.handle(
    'db:create-snapshot',
    (_e, aircraftId: string, label: string, source: 'auto' | 'manual' | 'import', params: db.SnapshotParam[]) => {
      return db.createSnapshot(aircraftId, label, source, params);
    }
  );

  ipcMain.handle('db:list-snapshots', (_e, aircraftId: string) => {
    return db.listSnapshots(aircraftId);
  });

  ipcMain.handle('db:get-snapshot-params', (_e, snapshotId: number) => {
    return db.getSnapshotParams(snapshotId);
  });

  ipcMain.handle('db:rename-snapshot', (_e, snapshotId: number, label: string) => {
    db.renameSnapshot(snapshotId, label);
  });

  ipcMain.handle('db:delete-snapshot', (_e, snapshotId: number) => {
    db.deleteSnapshot(snapshotId);
  });

  // ── Diff ───────────────────────────────────────────────────────────

  ipcMain.handle('db:diff-snapshots', (_e, idA: number, idB: number) => {
    return db.diffSnapshots(idA, idB);
  });

  ipcMain.handle('db:diff-snapshot-vs-current', (_e, snapshotId: number, currentParams: db.SnapshotParam[]) => {
    return db.diffSnapshotVsCurrent(snapshotId, currentParams);
  });

  // ── Import / Export ────────────────────────────────────────────────

  ipcMain.handle('db:export-param-file', (_e, snapshotId: number) => {
    return db.exportParamFile(snapshotId);
  });

  ipcMain.handle('db:import-param-file', (_e, aircraftId: string, label: string, content: string) => {
    return db.importParamFile(aircraftId, label, content);
  });

  // ── Preferences ────────────────────────────────────────────────────

  ipcMain.handle('db:get-preference', (_e, key: string) => {
    return db.getPreference(key);
  });

  ipcMain.handle('db:set-preference', (_e, key: string, value: string) => {
    db.setPreference(key, value);
  });
}
