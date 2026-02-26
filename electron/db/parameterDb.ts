/**
 * Parameter Database -- SQLite storage for parameter snapshots.
 *
 * Uses sql.js (WASM) so there are zero native dependencies.
 * The DB file lives in Electron's userData directory and is
 * auto-saved after every write operation.
 *
 * Schema:
 *   aircraft        -- one row per physical FC (keyed by boardId)
 *   snapshots       -- timestamped parameter dumps per aircraft
 *   snapshot_params -- name/value pairs for each snapshot
 *   preferences     -- key/value store for user prefs (e.g. auto-backup)
 */

import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import initSqlJs, { type Database } from 'sql.js';

// ── Types ──────────────────────────────────────────────────────────────

export interface Aircraft {
  id: string;
  name: string;
  board_type: string | null;
  vehicle_type: string | null;
  firmware_version: string | null;
  created_at: string;
  updated_at: string;
}

export interface Snapshot {
  id: number;
  aircraft_id: string;
  label: string;
  source: 'auto' | 'manual' | 'import';
  param_count: number;
  created_at: string;
}

export interface SnapshotParam {
  name: string;
  value: number;
  type: string | null;
}

export interface DiffEntry {
  name: string;
  valueA: number | null;
  valueB: number | null;
  typeA: string | null;
  typeB: string | null;
}

// ── Database singleton ─────────────────────────────────────────────────

let db: Database | null = null;
let dbPath: string = '';

function getDbPath(): string {
  if (!dbPath) {
    const userDataDir = app.getPath('userData');
    dbPath = path.join(userDataDir, 'parameters.db');
  }
  return dbPath;
}

function save(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(getDbPath(), buffer);
}

export async function initDb(): Promise<void> {
  const SQL = await initSqlJs();

  const filePath = getDbPath();
  if (fs.existsSync(filePath)) {
    const fileBuffer = fs.readFileSync(filePath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS aircraft (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      board_type TEXT,
      vehicle_type TEXT,
      firmware_version TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aircraft_id TEXT NOT NULL REFERENCES aircraft(id),
      label TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'manual',
      param_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS snapshot_params (
      snapshot_id INTEGER NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      value REAL NOT NULL,
      type TEXT,
      PRIMARY KEY (snapshot_id, name)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS preferences (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Index for fast snapshot listing per aircraft
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_snapshots_aircraft
    ON snapshots(aircraft_id, created_at DESC)
  `);

  save();
  console.log(`[ParamDB] Initialized at ${filePath}`);
}

export function closeDb(): void {
  if (db) {
    save();
    db.close();
    db = null;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────

function now(): string {
  return new Date().toISOString();
}

function getDb(): Database {
  if (!db) throw new Error('Parameter database not initialized');
  return db;
}

// ── Aircraft CRUD ──────────────────────────────────────────────────────

export function getAircraft(id: string): Aircraft | null {
  const stmt = getDb().prepare('SELECT * FROM aircraft WHERE id = :id');
  stmt.bind({ ':id': id });
  if (stmt.step()) {
    const row = stmt.getAsObject() as unknown as Aircraft;
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

export function listAircraft(): Aircraft[] {
  const results: Aircraft[] = [];
  const stmt = getDb().prepare('SELECT * FROM aircraft ORDER BY updated_at DESC');
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as Aircraft);
  }
  stmt.free();
  return results;
}

export function upsertAircraft(data: {
  id: string;
  name: string;
  board_type?: string | null;
  vehicle_type?: string | null;
  firmware_version?: string | null;
}): Aircraft {
  const d = getDb();
  const existing = getAircraft(data.id);
  const ts = now();

  if (existing) {
    d.run(
      `UPDATE aircraft SET
        name = ?, board_type = ?, vehicle_type = ?, firmware_version = ?, updated_at = ?
       WHERE id = ?`,
      [
        data.name,
        data.board_type ?? existing.board_type,
        data.vehicle_type ?? existing.vehicle_type,
        data.firmware_version ?? existing.firmware_version,
        ts,
        data.id,
      ]
    );
  } else {
    d.run(
      `INSERT INTO aircraft (id, name, board_type, vehicle_type, firmware_version, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id,
        data.name,
        data.board_type ?? null,
        data.vehicle_type ?? null,
        data.firmware_version ?? null,
        ts,
        ts,
      ]
    );
  }

  save();
  return getAircraft(data.id)!;
}

export function renameAircraft(id: string, name: string): void {
  getDb().run('UPDATE aircraft SET name = ?, updated_at = ? WHERE id = ?', [name, now(), id]);
  save();
}

export function deleteAircraft(id: string): void {
  const d = getDb();
  // Delete all snapshot params for this aircraft's snapshots
  d.run(
    `DELETE FROM snapshot_params WHERE snapshot_id IN
     (SELECT id FROM snapshots WHERE aircraft_id = ?)`,
    [id]
  );
  d.run('DELETE FROM snapshots WHERE aircraft_id = ?', [id]);
  d.run('DELETE FROM aircraft WHERE id = ?', [id]);
  save();
}

// ── Snapshot CRUD ──────────────────────────────────────────────────────

export function createSnapshot(
  aircraftId: string,
  label: string,
  source: 'auto' | 'manual' | 'import',
  params: SnapshotParam[]
): Snapshot {
  const d = getDb();
  const ts = now();

  d.run(
    `INSERT INTO snapshots (aircraft_id, label, source, param_count, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [aircraftId, label, source, params.length, ts]
  );

  // Get the auto-incremented ID
  const idStmt = d.prepare('SELECT last_insert_rowid() as id');
  idStmt.step();
  const snapshotId = (idStmt.getAsObject() as { id: number }).id;
  idStmt.free();

  // Bulk insert params
  const insert = d.prepare(
    'INSERT INTO snapshot_params (snapshot_id, name, value, type) VALUES (?, ?, ?, ?)'
  );
  for (const p of params) {
    insert.run([snapshotId, p.name, p.value, p.type ?? null]);
  }
  insert.free();

  // Update aircraft timestamp
  d.run('UPDATE aircraft SET updated_at = ? WHERE id = ?', [ts, aircraftId]);

  save();

  return {
    id: snapshotId,
    aircraft_id: aircraftId,
    label,
    source,
    param_count: params.length,
    created_at: ts,
  };
}

export function listSnapshots(aircraftId: string): Snapshot[] {
  const results: Snapshot[] = [];
  const stmt = getDb().prepare(
    'SELECT * FROM snapshots WHERE aircraft_id = :id ORDER BY created_at DESC'
  );
  stmt.bind({ ':id': aircraftId });
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as Snapshot);
  }
  stmt.free();
  return results;
}

export function getSnapshotParams(snapshotId: number): SnapshotParam[] {
  const results: SnapshotParam[] = [];
  const stmt = getDb().prepare(
    'SELECT name, value, type FROM snapshot_params WHERE snapshot_id = :id ORDER BY name'
  );
  stmt.bind({ ':id': snapshotId });
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as SnapshotParam);
  }
  stmt.free();
  return results;
}

export function renameSnapshot(snapshotId: number, label: string): void {
  getDb().run('UPDATE snapshots SET label = ? WHERE id = ?', [label, snapshotId]);
  save();
}

export function deleteSnapshot(snapshotId: number): void {
  const d = getDb();
  d.run('DELETE FROM snapshot_params WHERE snapshot_id = ?', [snapshotId]);
  d.run('DELETE FROM snapshots WHERE id = ?', [snapshotId]);
  save();
}

// ── Diff ───────────────────────────────────────────────────────────────

/**
 * Compare two snapshots and return only the parameters that differ.
 */
export function diffSnapshots(snapshotIdA: number, snapshotIdB: number): DiffEntry[] {
  const results: DiffEntry[] = [];
  const stmt = getDb().prepare(`
    SELECT
      COALESCE(a.name, b.name) AS name,
      a.value AS valueA,
      b.value AS valueB,
      a.type AS typeA,
      b.type AS typeB
    FROM snapshot_params a
    FULL OUTER JOIN snapshot_params b
      ON a.name = b.name AND b.snapshot_id = :idB
    WHERE a.snapshot_id = :idA
      AND (a.value IS NOT b.value OR a.name IS NULL OR b.name IS NULL)
    UNION
    SELECT
      b.name AS name,
      NULL AS valueA,
      b.value AS valueB,
      NULL AS typeA,
      b.type AS typeB
    FROM snapshot_params b
    WHERE b.snapshot_id = :idB
      AND b.name NOT IN (SELECT name FROM snapshot_params WHERE snapshot_id = :idA)
    ORDER BY name
  `);
  stmt.bind({ ':idA': snapshotIdA, ':idB': snapshotIdB });
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as DiffEntry);
  }
  stmt.free();
  return results;
}

/**
 * Compare a snapshot against a live parameter set (passed as array).
 * Returns only parameters that differ.
 */
export function diffSnapshotVsCurrent(
  snapshotId: number,
  currentParams: SnapshotParam[]
): DiffEntry[] {
  // Build a map from the snapshot
  const snapshotMap = new Map<string, SnapshotParam>();
  for (const p of getSnapshotParams(snapshotId)) {
    snapshotMap.set(p.name, p);
  }

  // Build a map from current
  const currentMap = new Map<string, SnapshotParam>();
  for (const p of currentParams) {
    currentMap.set(p.name, p);
  }

  const diffs: DiffEntry[] = [];

  // Params in snapshot
  for (const [name, sp] of snapshotMap) {
    const cp = currentMap.get(name);
    if (!cp) {
      diffs.push({ name, valueA: sp.value, valueB: null, typeA: sp.type, typeB: null });
    } else if (sp.value !== cp.value) {
      diffs.push({ name, valueA: sp.value, valueB: cp.value, typeA: sp.type, typeB: cp.type });
    }
  }

  // Params only in current (new params not in snapshot)
  for (const [name, cp] of currentMap) {
    if (!snapshotMap.has(name)) {
      diffs.push({ name, valueA: null, valueB: cp.value, typeA: null, typeB: cp.type });
    }
  }

  diffs.sort((a, b) => a.name.localeCompare(b.name));
  return diffs;
}

// ── Import / Export ────────────────────────────────────────────────────

/**
 * Export a snapshot as .param file content (Mission Planner compatible).
 * Format: one "NAME VALUE" per line.
 */
export function exportParamFile(snapshotId: number): string {
  const params = getSnapshotParams(snapshotId);
  return params.map((p) => `${p.name}\t${p.value}`).join('\n') + '\n';
}

/**
 * Import a .param file and create a snapshot from it.
 * Supports Mission Planner format: "NAME,VALUE" or "NAME VALUE" or "NAME\tVALUE"
 * Lines starting with # are comments and are skipped.
 */
export function importParamFile(
  aircraftId: string,
  label: string,
  content: string
): Snapshot {
  const params: SnapshotParam[] = [];

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    // Try comma, tab, or space separated
    const parts = line.split(/[,\t\s]+/);
    if (parts.length >= 2) {
      const name = parts[0];
      const value = parseFloat(parts[1]);
      if (name && !isNaN(value)) {
        params.push({ name, value, type: null });
      }
    }
  }

  if (params.length === 0) {
    throw new Error('No valid parameters found in file');
  }

  return createSnapshot(aircraftId, label, 'import', params);
}

// ── Preferences ────────────────────────────────────────────────────────

export function getPreference(key: string): string | null {
  const stmt = getDb().prepare('SELECT value FROM preferences WHERE key = :key');
  stmt.bind({ ':key': key });
  if (stmt.step()) {
    const row = stmt.getAsObject() as { value: string };
    stmt.free();
    return row.value;
  }
  stmt.free();
  return null;
}

export function setPreference(key: string, value: string): void {
  getDb().run(
    'INSERT OR REPLACE INTO preferences (key, value) VALUES (?, ?)',
    [key, value]
  );
  save();
}
