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
});
