import { create } from 'zustand';

export interface TelemetryState {
  attitude: { roll: number; pitch: number; yaw: number } | null;
  gps: {
    lat: number;
    lon: number;
    alt: number;
    fix: number;
    satellites: number;
  } | null;
  battery: {
    voltage: number;
    current: number;
    remaining: number;
  } | null;
  sensorHealth: {
    present: number;
    enabled: number;
    health: number;
    cpuLoad: number;  // 0-1000 (0.1% units)
  } | null;
  rcChannels: number[];
  rcChancount: number;
  rcRssi: number;
  servoOutputs: number[];
  vfrHud: {
    airspeed: number;
    groundspeed: number;
    altitude: number;
    climb: number;
  } | null;

  // Actions
  setAttitude: (att: { roll: number; pitch: number; yaw: number }) => void;
  setGps: (gps: TelemetryState['gps']) => void;
  setBattery: (bat: TelemetryState['battery']) => void;
  setSensorHealth: (sh: NonNullable<TelemetryState['sensorHealth']>) => void;
  setRcChannels: (channels: number[], chancount: number, rssi: number) => void;
  setServoOutputs: (outputs: number[]) => void;
  setVfrHud: (hud: TelemetryState['vfrHud']) => void;
  reset: () => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  attitude: null,
  gps: null,
  battery: null,
  sensorHealth: null,
  rcChannels: [],
  rcChancount: 0,
  rcRssi: 0,
  servoOutputs: [],
  vfrHud: null,

  setAttitude: (attitude) => set({ attitude }),
  setGps: (gps) => set({ gps }),
  setBattery: (battery) => set({ battery }),
  setSensorHealth: (sensorHealth) => set({ sensorHealth }),
  setRcChannels: (rcChannels, rcChancount, rcRssi) => set({ rcChannels, rcChancount, rcRssi }),
  setServoOutputs: (servoOutputs) => set({ servoOutputs }),
  setVfrHud: (vfrHud) => set({ vfrHud }),
  reset: () =>
    set({
      attitude: null,
      gps: null,
      battery: null,
      sensorHealth: null,
      rcChannels: [],
      rcChancount: 0,
      rcRssi: 0,
      servoOutputs: [],
      vfrHud: null,
    }),
}));
