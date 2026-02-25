/// <reference types="vite/client" />

// Electron API exposed via preload
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

interface ElectronAPI {
  serial: ElectronSerialAPI;
  fs: ElectronFsAPI;
  toggleDevTools: () => Promise<void>;
}

export {};

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
