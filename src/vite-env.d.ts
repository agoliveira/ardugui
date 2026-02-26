/// <reference types="vite/client" />

export {};

declare global {
  interface ElectronSerialAPI {
    listPorts: () => Promise<
      {
        path: string;
        manufacturer?: string;
        serialNumber?: string;
        vendorId?: string;
        productId?: string;
        pnpId?: string;
      }[]
    >;
    open: (path: string, baudRate: number) => Promise<void>;
    close: () => Promise<void>;
    write: (data: Uint8Array) => Promise<void>;
    onData: (callback: (data: Uint8Array) => void) => () => void;
    onError: (callback: (error: string) => void) => () => void;
    onClose: (callback: () => void) => () => void;
  }

  interface ElectronFsAPI {
    saveFile: (
      defaultName: string,
      content: string
    ) => Promise<string | null>;
    openFile: (
      filters: { name: string; extensions: string[] }[]
    ) => Promise<{ path: string; content: string } | null>;
  }

  interface DbAircraft {
    id: string;
    name: string;
    board_type: string | null;
    vehicle_type: string | null;
    firmware_version: string | null;
    created_at: string;
    updated_at: string;
  }

  interface DbSnapshot {
    id: number;
    aircraft_id: string;
    label: string;
    source: 'auto' | 'manual' | 'import';
    param_count: number;
    created_at: string;
  }

  interface DbSnapshotParam {
    name: string;
    value: number;
    type: string | null;
  }

  interface DbDiffEntry {
    name: string;
    valueA: number | null;
    valueB: number | null;
    typeA: string | null;
    typeB: string | null;
  }

  interface ElectronDbAPI {
    // Aircraft
    getAircraft: (id: string) => Promise<DbAircraft | null>;
    listAircraft: () => Promise<DbAircraft[]>;
    upsertAircraft: (data: {
      id: string;
      name: string;
      board_type?: string | null;
      vehicle_type?: string | null;
      firmware_version?: string | null;
    }) => Promise<DbAircraft>;
    renameAircraft: (id: string, name: string) => Promise<void>;
    deleteAircraft: (id: string) => Promise<void>;

    // Snapshots
    createSnapshot: (
      aircraftId: string,
      label: string,
      source: 'auto' | 'manual' | 'import',
      params: DbSnapshotParam[]
    ) => Promise<DbSnapshot>;
    listSnapshots: (aircraftId: string) => Promise<DbSnapshot[]>;
    getSnapshotParams: (snapshotId: number) => Promise<DbSnapshotParam[]>;
    renameSnapshot: (snapshotId: number, label: string) => Promise<void>;
    deleteSnapshot: (snapshotId: number) => Promise<void>;

    // Diff
    diffSnapshots: (idA: number, idB: number) => Promise<DbDiffEntry[]>;
    diffSnapshotVsCurrent: (
      snapshotId: number,
      currentParams: DbSnapshotParam[]
    ) => Promise<DbDiffEntry[]>;

    // Import / Export
    exportParamFile: (snapshotId: number) => Promise<string>;
    importParamFile: (
      aircraftId: string,
      label: string,
      content: string
    ) => Promise<DbSnapshot>;

    // Preferences
    getPreference: (key: string) => Promise<string | null>;
    setPreference: (key: string, value: string) => Promise<void>;
  }

  interface ElectronAPI {
    serial: ElectronSerialAPI;
    fs: ElectronFsAPI;
    db: ElectronDbAPI;
    toggleDevTools: () => Promise<void>;
  }

  interface Window {
    electronAPI?: ElectronAPI;
  }
}
