import { create } from 'zustand';

export type VehicleType = 'copter' | 'plane' | 'quadplane' | null;

export interface VehicleState {
  type: VehicleType;
  firmwareVersion: string | null;
  firmwareType: string | null;
  armed: boolean;
  boardId: string | null;
  /** Numeric APJ_BOARD_ID from AUTOPILOT_VERSION -- used for firmware matching */
  apjBoardId: number | null;
  /** Current ArduPilot custom mode number from heartbeat */
  flightMode: number | null;
  /** User-assigned aircraft name (loaded from DB) */
  aircraftName: string | null;
  /** True when this board ID was not found in the DB (first connect) */
  isNewAircraft: boolean;

  // Actions
  setVehicle: (type: VehicleType, firmwareType: string | null) => void;
  setFirmwareVersion: (version: string) => void;
  setArmed: (armed: boolean) => void;
  setBoardId: (boardId: string | null) => void;
  setApjBoardId: (id: number | null) => void;
  setFlightMode: (mode: number) => void;
  setAircraftName: (name: string) => void;
  setIsNewAircraft: (isNew: boolean) => void;
  reset: () => void;
}

export const useVehicleStore = create<VehicleState>((set) => ({
  type: null,
  firmwareVersion: null,
  firmwareType: null,
  armed: false,
  boardId: null,
  apjBoardId: null,
  flightMode: null,
  aircraftName: null,
  isNewAircraft: false,

  setVehicle: (type, firmwareType) => set({ type, firmwareType }),
  setFirmwareVersion: (firmwareVersion) => set({ firmwareVersion }),
  setArmed: (armed) => set({ armed }),
  setBoardId: (boardId) => set({ boardId }),
  setApjBoardId: (apjBoardId) => set({ apjBoardId }),
  setFlightMode: (flightMode) => set({ flightMode }),
  setAircraftName: (aircraftName) => set({ aircraftName }),
  setIsNewAircraft: (isNewAircraft) => set({ isNewAircraft }),
  reset: () =>
    set({
      type: null,
      firmwareVersion: null,
      firmwareType: null,
      armed: false,
      boardId: null,
      apjBoardId: null,
      flightMode: null,
      aircraftName: null,
      isNewAircraft: false,
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
    'firmware',   // install/update firmware
    'wizard',     // setup wizard -- guided first-flight config
    'frame',      // frame configuration
    'wiring',
    'ports',
    'configuration',
    'receiver',
    'gps',
    'modes',
  ];

  const hasOsd = options?.hasOsd ?? false;
  const expertMode = options?.expertMode ?? false;
  const tail = [
    'failsafes',
    ...(hasOsd ? ['osd'] as string[] : []),
    'my_aircraft',
    'preflight',
    'cli',
    ...(expertMode ? ['expert'] as string[] : []),
  ];

  switch (type) {
    case 'copter':
      return [...common, 'motors', 'calibration', 'battery', 'esc', 'pid_tuning', 'navigation', ...tail];
    case 'plane':
      return [...common, 'motors', 'control_surfaces', 'calibration', 'battery', 'esc', 'pid_tuning', 'navigation', ...tail];
    case 'quadplane':
      return [...common, 'motors', 'control_surfaces', 'calibration', 'battery', 'esc', 'pid_tuning', 'navigation',
        'transitions', ...tail];
    default:
      return ['connect', 'firmware'];
  }
}
