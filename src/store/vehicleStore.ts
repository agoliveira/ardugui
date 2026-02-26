import { create } from 'zustand';

export type VehicleType = 'copter' | 'plane' | 'quadplane' | null;

export interface VehicleState {
  type: VehicleType;
  firmwareVersion: string | null;
  firmwareType: string | null;
  armed: boolean;
  boardId: string | null;

  // Actions
  setVehicle: (type: VehicleType, firmwareType: string | null) => void;
  setFirmwareVersion: (version: string) => void;
  setArmed: (armed: boolean) => void;
  setBoardId: (boardId: string | null) => void;
  reset: () => void;
}

export const useVehicleStore = create<VehicleState>((set) => ({
  type: null,
  firmwareVersion: null,
  firmwareType: null,
  armed: false,
  boardId: null,

  setVehicle: (type, firmwareType) => set({ type, firmwareType }),
  setFirmwareVersion: (firmwareVersion) => set({ firmwareVersion }),
  setArmed: (armed) => set({ armed }),
  setBoardId: (boardId) => set({ boardId }),
  reset: () =>
    set({
      type: null,
      firmwareVersion: null,
      firmwareType: null,
      armed: false,
      boardId: null,
    }),
}));

/**
 * Returns the list of sidebar pages visible for the current vehicle type.
 * OSD page is only shown when the FC firmware includes OSD support (OSD params exist).
 */
export function getVisiblePages(
  type: VehicleType,
  options?: { hasOsd?: boolean; expertMode?: boolean }
): string[] {
  // After connection: full sidebar
  const common = [
    'connect',    // was 'setup' -- board info + connection
    'frame',      // frame configuration
    'ports',
    'configuration',
    'receiver',
    'modes',
  ];

  const hasOsd = options?.hasOsd ?? false;
  const expertMode = options?.expertMode ?? false;
  const tail = [
    'failsafes',
    ...(hasOsd ? ['osd'] as string[] : []),
    'backups',
    'cli',
    ...(expertMode ? ['expert'] as string[] : []),
  ];

  switch (type) {
    case 'copter':
      return [...common, 'motors', 'calibration', 'pid_tuning', 'navigation', ...tail];
    case 'plane':
      return [...common, 'motors', 'calibration', 'pid_tuning', 'navigation', ...tail];
    case 'quadplane':
      return [...common, 'motors', 'calibration', 'pid_tuning', 'navigation',
        'failsafes', ...(hasOsd ? ['osd'] as string[] : []), 'transitions',
        'backups', 'cli', ...(expertMode ? ['expert'] as string[] : [])];
    default:
      // Not connected: only the connect page
      return ['connect'];
  }
}
