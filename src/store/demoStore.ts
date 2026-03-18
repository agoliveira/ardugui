/**
 * demoStore.ts -- Demo mode for ArduGUI.
 *
 * Populates all Zustand stores with realistic fake data so the entire
 * UI is functional without a physical flight controller. Useful for:
 *   - Screenshots and README
 *   - Trade shows and demos
 *   - UI development and testing
 *   - Community evaluation without hardware
 *
 * Activation: toggle in the header (airplane icon), or start with
 * ?demo=1 query param.
 *
 * When active, connectionManager calls are no-ops and stores are
 * populated with sample quadcopter data.
 */

import { create } from 'zustand';
import { useConnectionStore } from './connectionStore';
import { useVehicleStore } from './vehicleStore';
import { useParameterStore, type ParameterEntry } from './parameterStore';
import { useTelemetryStore } from './telemetryStore';

interface DemoState {
  active: boolean;
  start: () => void;
  stop: () => void;
}

const STORAGE_KEY = 'ardugui-demo';

export const useDemoStore = create<DemoState>((set, get) => ({
  active: false,

  start: () => {
    if (get().active) return;
    set({ active: true });
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    populateDemoData();
    startTelemetrySimulation();
  },

  stop: () => {
    set({ active: false });
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    stopTelemetrySimulation();
    clearDemoData();
  },
}));

// Auto-start if URL has ?demo=1
if (typeof window !== 'undefined') {
  const params = new URLSearchParams(window.location.search);
  if (params.get('demo') === '1') {
    // Defer to next tick so stores are initialized
    setTimeout(() => useDemoStore.getState().start(), 100);
  }
}

/* ------------------------------------------------------------------ */
/*  Sample parameter data                                              */
/* ------------------------------------------------------------------ */

const DEMO_PARAMS: Record<string, number> = {
  // Frame
  FRAME_CLASS: 1,      // Quad
  FRAME_TYPE: 1,       // X

  // Motors
  MOT_PWM_TYPE: 6,     // DShot600
  MOT_SPIN_ARM: 0.05,
  MOT_SPIN_MIN: 0.15,

  // Servo functions
  SERVO1_FUNCTION: 33,  // Motor 1
  SERVO2_FUNCTION: 34,  // Motor 2
  SERVO3_FUNCTION: 35,  // Motor 3
  SERVO4_FUNCTION: 36,  // Motor 4
  SERVO1_MIN: 1000, SERVO1_MAX: 2000, SERVO1_TRIM: 1500,
  SERVO2_MIN: 1000, SERVO2_MAX: 2000, SERVO2_TRIM: 1500,
  SERVO3_MIN: 1000, SERVO3_MAX: 2000, SERVO3_TRIM: 1500,
  SERVO4_MIN: 1000, SERVO4_MAX: 2000, SERVO4_TRIM: 1500,

  // ESC
  SERVO_BLH_AUTO: 1,
  SERVO_DSHOT_ESC: 1,

  // Battery
  BATT_MONITOR: 4,      // Analog V+I
  BATT_VOLT_MULT: 11.1,
  BATT_AMP_PERVLT: 17.0,
  BATT_CAPACITY: 5200,
  BATT_LOW_VOLT: 14.0,  // 4S * 3.5
  BATT_CRT_VOLT: 13.2,  // 4S * 3.3
  BATT_FS_LOW_ACT: 2,   // RTL
  BATT_FS_CRT_ACT: 1,   // Land
  BATT_ARM_VOLT: 14.0,

  // Receiver
  SERIAL7_PROTOCOL: 23,  // RCIN
  RSSI_TYPE: 3,          // Receiver

  // RC calibration
  RC1_MIN: 988,  RC1_MAX: 2012, RC1_TRIM: 1500,  // Roll
  RC2_MIN: 988,  RC2_MAX: 2012, RC2_TRIM: 1500,  // Pitch
  RC3_MIN: 988,  RC3_MAX: 2012, RC3_TRIM: 988,   // Throttle
  RC4_MIN: 988,  RC4_MAX: 2012, RC4_TRIM: 1500,  // Yaw

  // Flight modes
  FLTMODE1: 0,   // Stabilize
  FLTMODE2: 2,   // AltHold
  FLTMODE3: 5,   // Loiter
  FLTMODE4: 6,   // RTL
  FLTMODE5: 3,   // Auto
  FLTMODE6: 9,   // Land
  FLTMODE_CH: 5,

  // Failsafes
  FS_THR_ENABLE: 2,    // RTL on throttle failsafe
  FS_GCS_ENABLE: 1,    // RTL on GCS failsafe
  FS_EKF_ACTION: 1,    // Land on EKF failsafe

  // GPS
  GPS_TYPE: 1,          // Auto
  GPS_GNSS_MODE: 31,   // All constellations

  // Compass
  COMPASS_USE: 1,
  COMPASS_ORIENT: 0,
  COMPASS_OFS_X: 12.5,
  COMPASS_OFS_Y: -8.3,
  COMPASS_OFS_Z: 45.1,

  // Accel calibrated
  INS_ACCOFFS_X: 0.12,
  INS_ACCOFFS_Y: -0.08,
  INS_ACCOFFS_Z: -0.35,
  INS_ACC2OFFS_X: 0.05,
  INS_ACC2OFFS_Y: -0.03,
  INS_ACC2OFFS_Z: -0.28,

  // Initial tune (5" props)
  INS_GYRO_FILTER: 80,
  INS_ACCEL_FILTER: 20,
  ATC_RAT_RLL_FLTD: 20,
  ATC_RAT_PIT_FLTD: 20,
  MOT_THST_EXPO: 0.65,

  // OSD
  OSD_TYPE: 1,

  // Nav
  RTL_ALT: 3000,       // 30m
  WP_RADIUS: 200,      // 2m
  WPNAV_SPEED: 500,    // 5 m/s
  WPNAV_SPEED_UP: 250,
  WPNAV_SPEED_DN: 150,

  // Arming
  ARMING_CHECK: 1,
};

/* ------------------------------------------------------------------ */
/*  Store population                                                   */
/* ------------------------------------------------------------------ */

function populateDemoData() {
  // Connection
  useConnectionStore.setState({
    status: 'connected',
    portPath: 'DEMO',
    baudRate: 115200,
  });

  // Vehicle
  useVehicleStore.setState({
    type: 'copter',
    firmwareType: 'ArduCopter',
    firmwareVersion: 'v4.6.3',
    armed: false,
    boardId: 'MatekF405-Wing',
    apjBoardId: 140,
    flightMode: 0,
  });

  // Parameters
  const paramMap = new Map<string, ParameterEntry>();
  let idx = 0;
  for (const [name, value] of Object.entries(DEMO_PARAMS)) {
    paramMap.set(name, { name, value, type: 'FLOAT', index: idx++ });
  }
  useParameterStore.setState({
    parameters: paramMap,
    dirtyParams: new Map(),
    loaded: true,
    searchQuery: '',
  });

  // Telemetry (initial values -- simulation loop will update)
  useTelemetryStore.setState({
    attitude: { roll: 0.02, pitch: -0.01, yaw: 1.57, rollspeed: 0, pitchspeed: 0, yawspeed: 0 },
    gps: {
      fix: 3,
      satellites: 14,
      hdop: 0.8,
      lat: -22.9068,
      lon: -47.0626,
      alt: 680,
    },
    battery: {
      voltage: 16.2,
      current: 0.3,
      remaining: 92,
    },
    sensorHealth: {
      present: 0x127FF,  // typical sensor bitmask: gyro, accel, baro, compass, gps, rc, ahrs
      enabled: 0x127FF,
      health:  0x127FF,  // all healthy
      cpuLoad: 180,      // 18.0%
    },
    rcChannels: [1500, 1500, 988, 1500, 1000, 1500, 1500, 1500],
    rcChancount: 8,
    rcRssi: 99,
    servoOutputs: [0, 0, 0, 0],
    vfrHud: {
      airspeed: 0,
      groundspeed: 0,
      altitude: 680,
      climb: 0,
    },
  });
}

function clearDemoData() {
  useConnectionStore.setState({
    status: 'disconnected',
    portPath: null,
    baudRate: 115200,
  });

  useVehicleStore.getState().reset();
  useParameterStore.getState().reset();
  useTelemetryStore.getState().reset();
}

/* ------------------------------------------------------------------ */
/*  Telemetry simulation loop                                          */
/* ------------------------------------------------------------------ */

let simInterval: ReturnType<typeof setInterval> | null = null;

function startTelemetrySimulation() {
  if (simInterval) return;

  let tick = 0;
  simInterval = setInterval(() => {
    tick++;
    if (!useDemoStore.getState().active) return;

    // Gentle attitude drift
    const roll = Math.sin(tick * 0.03) * 0.04;
    const pitch = Math.cos(tick * 0.025) * 0.03;
    const yaw = 1.57 + Math.sin(tick * 0.008) * 0.1;

    // Battery slowly draining
    const baseVoltage = 16.2 - (tick * 0.0001);
    const voltage = baseVoltage + Math.sin(tick * 0.1) * 0.05;
    const current = 0.3 + Math.random() * 0.2;
    const remaining = Math.max(0, 92 - tick * 0.002);

    // GPS satellite count wanders
    const sats = 14 + Math.round(Math.sin(tick * 0.01) * 2);

    // RC channels with slight jitter
    const jitter = () => Math.round((Math.random() - 0.5) * 4);
    const rcChannels = [
      1500 + jitter(), 1500 + jitter(), 988 + jitter(), 1500 + jitter(),
      1000, 1500, 1500, 1500,
    ];

    useTelemetryStore.setState({
      attitude: { roll, pitch, yaw, rollspeed: 0, pitchspeed: 0, yawspeed: 0 },
      gps: {
        lat: -22.9068,
        lon: -47.0626,
        alt: 680,
        fix: 3,
        satellites: sats,
        hdop: 0.8 + Math.sin(tick * 0.02) * 0.1,
      },
      battery: { voltage, current, remaining },
      rcChannels,
      rcRssi: 99 - Math.round(Math.random() * 3),
    });
  }, 200);
}

function stopTelemetrySimulation() {
  if (simInterval) {
    clearInterval(simInterval);
    simInterval = null;
  }
}
