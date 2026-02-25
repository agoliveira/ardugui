import { create } from 'zustand';

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'identifying'
  | 'loading'
  | 'connected';

export interface PortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  vendorId?: string;
  productId?: string;
  pnpId?: string;
}

export interface RebootProgress {
  phase: 'countdown' | 'rebooting' | 'reconnecting';
  countdown: number;
  returnPage: string;
}

export interface ConnectionState {
  status: ConnectionStatus;
  portPath: string | null;
  baudRate: number;
  availablePorts: PortInfo[];
  error: string | null;
  paramLoadProgress: { received: number; total: number } | null;
  /** Page to navigate to after next reconnection (e.g. after calibration reboot) */
  pendingPage: string | null;
  /** Reboot-reconnect progress (shown as overlay in Layout) */
  rebootProgress: RebootProgress | null;

  // Actions
  setStatus: (status: ConnectionStatus) => void;
  setPortPath: (path: string | null) => void;
  setBaudRate: (rate: number) => void;
  setAvailablePorts: (ports: PortInfo[]) => void;
  setError: (error: string | null) => void;
  setParamLoadProgress: (
    progress: { received: number; total: number } | null
  ) => void;
  setPendingPage: (page: string | null) => void;
  setRebootProgress: (progress: RebootProgress | null) => void;
  reset: () => void;
}

const initialState = {
  status: 'disconnected' as ConnectionStatus,
  portPath: null as string | null,
  baudRate: 115200,
  availablePorts: [] as PortInfo[],
  error: null as string | null,
  paramLoadProgress: null as { received: number; total: number } | null,
  pendingPage: null as string | null,
  rebootProgress: null as RebootProgress | null,
};

export const useConnectionStore = create<ConnectionState>((set) => ({
  ...initialState,

  setStatus: (status) => set({ status, error: null }),
  setPortPath: (portPath) => set({ portPath }),
  setBaudRate: (baudRate) => set({ baudRate }),
  setAvailablePorts: (availablePorts) => set({ availablePorts }),
  setError: (error) => set({ error, status: 'disconnected' }),
  setParamLoadProgress: (paramLoadProgress) => set({ paramLoadProgress }),
  setPendingPage: (pendingPage) => set({ pendingPage }),
  setRebootProgress: (rebootProgress) => set({ rebootProgress }),
  // Preserve pendingPage and rebootProgress across resets (survive disconnect during reboot cycle)
  reset: () => set((s) => ({
    ...initialState,
    pendingPage: s.pendingPage,
    rebootProgress: s.rebootProgress,
  })),
}));
