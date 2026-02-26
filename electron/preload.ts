import { contextBridge, ipcRenderer } from 'electron';

// Expose a safe API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Serial port operations
  serial: {
    listPorts: () => ipcRenderer.invoke('serial:list-ports'),
    open: (path: string, baudRate: number) =>
      ipcRenderer.invoke('serial:open', path, baudRate),
    close: () => ipcRenderer.invoke('serial:close'),
    write: (data: Uint8Array) => ipcRenderer.invoke('serial:write', data),
    onData: (callback: (data: Uint8Array) => void) => {
      const handler = (_event: unknown, data: Uint8Array) => callback(data);
      ipcRenderer.on('serial:data', handler);
      return () => ipcRenderer.removeListener('serial:data', handler);
    },
    onError: (callback: (error: string) => void) => {
      const handler = (_event: unknown, error: string) => callback(error);
      ipcRenderer.on('serial:error', handler);
      return () => ipcRenderer.removeListener('serial:error', handler);
    },
    onClose: (callback: () => void) => {
      const handler = () => callback();
      ipcRenderer.on('serial:close', handler);
      return () => ipcRenderer.removeListener('serial:close', handler);
    },
  },

  // File system operations
  fs: {
    saveFile: (defaultName: string, content: string) =>
      ipcRenderer.invoke('fs:save-file', defaultName, content),
    openFile: (filters: { name: string; extensions: string[] }[]) =>
      ipcRenderer.invoke('fs:open-file', filters),
  },

  // DevTools
  toggleDevTools: () => ipcRenderer.invoke('toggle-devtools'),

  // Parameter database
  db: {
    // Aircraft
    getAircraft: (id: string) => ipcRenderer.invoke('db:get-aircraft', id),
    listAircraft: () => ipcRenderer.invoke('db:list-aircraft'),
    upsertAircraft: (data: { id: string; name: string; board_type?: string | null; vehicle_type?: string | null; firmware_version?: string | null }) =>
      ipcRenderer.invoke('db:upsert-aircraft', data),
    renameAircraft: (id: string, name: string) =>
      ipcRenderer.invoke('db:rename-aircraft', id, name),
    deleteAircraft: (id: string) =>
      ipcRenderer.invoke('db:delete-aircraft', id),

    // Snapshots
    createSnapshot: (aircraftId: string, label: string, source: 'auto' | 'manual' | 'import', params: { name: string; value: number; type: string | null }[]) =>
      ipcRenderer.invoke('db:create-snapshot', aircraftId, label, source, params),
    listSnapshots: (aircraftId: string) =>
      ipcRenderer.invoke('db:list-snapshots', aircraftId),
    getSnapshotParams: (snapshotId: number) =>
      ipcRenderer.invoke('db:get-snapshot-params', snapshotId),
    renameSnapshot: (snapshotId: number, label: string) =>
      ipcRenderer.invoke('db:rename-snapshot', snapshotId, label),
    deleteSnapshot: (snapshotId: number) =>
      ipcRenderer.invoke('db:delete-snapshot', snapshotId),

    // Diff
    diffSnapshots: (idA: number, idB: number) =>
      ipcRenderer.invoke('db:diff-snapshots', idA, idB),
    diffSnapshotVsCurrent: (snapshotId: number, currentParams: { name: string; value: number; type: string | null }[]) =>
      ipcRenderer.invoke('db:diff-snapshot-vs-current', snapshotId, currentParams),

    // Import / Export
    exportParamFile: (snapshotId: number) =>
      ipcRenderer.invoke('db:export-param-file', snapshotId),
    importParamFile: (aircraftId: string, label: string, content: string) =>
      ipcRenderer.invoke('db:import-param-file', aircraftId, label, content),

    // Preferences
    getPreference: (key: string) => ipcRenderer.invoke('db:get-preference', key),
    setPreference: (key: string, value: string) =>
      ipcRenderer.invoke('db:set-preference', key, value),
  },
});
