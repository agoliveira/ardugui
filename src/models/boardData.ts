/**
 * Extended Board Data — Auto-generated from ArduPilot hwdef files
 *
 * DO NOT EDIT MANUALLY — regenerate with:
 *   python3 tools/scrape-hwdef.py
 *   python3 tools/generate-board-defs.py
 *
 * This file extends the base BoardDef interface with hardware-specific
 * data needed by the setup wizard: output groups, sensors, battery
 * monitoring, RC input, and feature flags.
 */

import type { BoardDef } from './boardRegistry';

// ── Extended Interface ─────────────────────────────────────────────

export interface OutputGroupDef {
  outputs: number[];
  timer: string;
  capabilities: ('PWM' | 'DShot' | 'BDShot')[];
}

export interface BuiltinSensorsDef {
  imu: string[];
  barometer: string[];
  compass: string[];
  osd: string | null;
  flash: string | null;
  sdcard: boolean;
}

export interface BatteryMonitorDef {
  voltPin?: number;
  currPin?: number;
  voltMult?: number;
  ampPerVolt?: number;
}

export interface DefaultRcInputDef {
  type: 'dedicated_sbus' | 'uart' | 'timer' | 'ppm';
  serialIndex?: number;
  padLabel?: string;
}

export interface ExtendedBoardDef extends BoardDef {
  /** APJ_BOARD_ID from firmware */
  apjBoardId?: number;

  /** Raw SERIAL_ORDER from hwdef */
  serialOrder?: string[];

  /** Output groups sharing DShot/PWM rate constraints */
  outputGroups?: OutputGroupDef[];

  /** Total PWM output count */
  pwmOutputCount?: number;

  /** Built-in sensors detected from SPIDEV definitions */
  builtinSensors?: BuiltinSensorsDef;

  /** Battery monitoring ADC configuration */
  batteryMonitor?: BatteryMonitorDef;

  /** Number of I2C buses */
  i2cBuses?: number;

  /** Has buzzer output */
  hasBuzzer?: boolean;

  /** Has addressable LED strip output */
  hasLedStrip?: boolean;
  /** LED strip output pad label */
  ledStripOutput?: string;

  /** Has hardware safety switch */
  hasSafetySwitch?: boolean;

  /** Number of CAN interfaces */
  canInterfaces?: number;

  /** Default RC input configuration */
  defaultRcInput?: DefaultRcInputDef;

  /** Whether this board has been manually verified for accuracy */
  confirmed?: boolean;
}

// ── Board Definitions ──────────────────────────────────────────────
export const blitzf745aio: ExtendedBoardDef = {
  id: 'blitzf745aio',
  name: 'iFlight Blitz F745 AIO',
  description: 'iFlight Blitz F745 AIO flight controller',
  manufacturer: 'iFlight',
  mcu: 'STM32F745xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-iflight-blitzf7.html',
  usbVendorId: '1209',
  usbProductId: '5740',
  dimensions: { width: 36, height: 36 },
  formFactor: 'mini',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL7: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: true,
  apjBoardId: 1117,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'EMPTY', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 5,
  builtinSensors: {
    imu: ['BMI270', 'ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 10.9, ampPerVolt: 50.0 },
  i2cBuses: 2,
  hasBuzzer: true,
};

export const cubeblack: ExtendedBoardDef = {
  id: 'cubeblack',
  name: 'Cube Black',
  description: 'CubePilot Cube Black autopilot',
  manufacturer: 'CubePilot / Hex',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-thecube-overview.html',
  usbVendorId: '2dae',
  usbProductId: '1101',
  dimensions: { width: 95, height: 40 },
  formFactor: 'cube',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TELEM1', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TELEM2', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'GPS', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'GPS2', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'Debug', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: true,
  apjBoardId: 9,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000', 'ICM20608', 'MPU9250', 'ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: ['HMC5843'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const cubeorange: ExtendedBoardDef = {
  id: 'cubeorange',
  name: 'Cube Orange',
  description: 'CubePilot Cube Orange autopilot',
  manufacturer: 'CubePilot / Hex',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-thecubeorange-overview.html',
  usbVendorId: '2dae',
  usbProductId: '1016',
  dimensions: { width: 95, height: 40 },
  formFactor: 'cube',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TELEM1', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TELEM2', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'GPS', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'GPS2', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'Debug', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'SERIAL6', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: true,
  apjBoardId: 140,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const cubeorangeplus: ExtendedBoardDef = {
  id: 'cubeorangeplus',
  name: 'Cube Orange+',
  description: 'CubePilot Cube Orange+ with upgraded sensors',
  manufacturer: 'CubePilot / Hex',
  mcu: 'STM32H757xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-thecubeorange-overview.html',
  usbVendorId: '2dae',
  usbProductId: '1016',
  dimensions: { width: 95, height: 40 },
  formFactor: 'cube',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TELEM1', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TELEM2', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'GPS', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'GPS2', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'Debug', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'SERIAL6', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: true,
  apjBoardId: 1063,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['ICM20948', 'ICM20602', 'ICM42688', 'ICM45686'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 3,
  hasSafetySwitch: true,
};

export const flywoof405sAio: ExtendedBoardDef = {
  id: 'flywoof405s-aio',
  name: 'FlywooF405S-AIO',
  description: 'FlywooF405S-AIO',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-flywoof405s-aio.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1099,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [5], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 5,
  builtinSensors: {
    imu: ['ICM42688', 'MPU6000'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 11.0, ampPerVolt: 60.2 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const flywoof745: ExtendedBoardDef = {
  id: 'flywoof745',
  name: 'FlywooF745',
  description: 'FlywooF745',
  manufacturer: 'Unknown',
  mcu: 'STM32F745xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-flywoof745.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1027,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6', 'UART7'],
  outputGroups: [
    { outputs: [3, 4, 10], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 7, 8], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [6], timer: 'TIM5', capabilities: ['PWM', 'DShot'] },
    { outputs: [5], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: ['MPU6000', 'ICM42688', 'BMI270'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 10.9, ampPerVolt: 28.5 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const fmuv3: ExtendedBoardDef = {
  id: 'fmuv3',
  name: 'Pixhawk 2.4.8 (FMUv3)',
  description: 'Classic Pixhawk 1 / FMUv3',
  manufacturer: '3D Robotics / mRo',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixhawk-overview.html',
  usbVendorId: '26ac',
  usbProductId: '0011',
  dimensions: { width: 82, height: 50 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TELEM1', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TELEM2', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'GPS', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'GPS2', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'Debug', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: true,
  apjBoardId: 9,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000', 'ICM20608', 'MPU9250', 'ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: ['HMC5843'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const fmuv5: ExtendedBoardDef = {
  id: 'fmuv5',
  name: 'fmuv5',
  description: 'fmuv5',
  manufacturer: 'Unknown',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-fmuv5.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 50,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'USART1', 'UART4', 'USART6', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM20689', 'ICM20602', 'BMI055'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 0, currPin: 1, voltMult: 18.0, ampPerVolt: 24.0 },
  i2cBuses: 4,
  hasSafetySwitch: true,
};

export const jhemcuGsf405a: ExtendedBoardDef = {
  id: 'jhemcu-gsf405a',
  name: 'JHEMCU-GSF405A',
  description: 'JHEMCU-GSF405A',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-jhemcu-gsf405a.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1059,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6'],
  outputGroups: [
    { outputs: [5], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 5,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 11, currPin: 13, voltMult: 11.0, ampPerVolt: 17.0 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const kakutef4: ExtendedBoardDef = {
  id: 'kakutef4',
  name: 'Holybro Kakute F4',
  description: 'Holybro Kakute F4 AIO flight controller',
  manufacturer: 'Holybro',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-holybro-kakutef4.html',
  usbVendorId: '1209',
  usbProductId: '5740',
  dimensions: { width: 35, height: 35 },
  formFactor: 'mini',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART6',
    SERIAL2: 'USART1',
    SERIAL3: 'UART4',
    SERIAL4: 'UART5',
    SERIAL5: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX6/RX6', serialIndex: 1, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 2, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 4, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 5, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: true,
  apjBoardId: 122,
  serialOrder: ['OTG1', 'USART6', 'USART1', 'UART4', 'UART5', 'USART3'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot'] },
    { outputs: [5], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 5,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB11' },
};

export const kakutef7: ExtendedBoardDef = {
  id: 'kakutef7',
  name: 'Holybro Kakute F7',
  description: 'Holybro Kakute F7 AIO flight controller',
  manufacturer: 'Holybro',
  mcu: 'STM32F745xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-holybro-kakutef7aio.html',
  usbVendorId: '1209',
  usbProductId: '5740',
  dimensions: { width: 35, height: 35 },
  formFactor: 'mini',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART7',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: true,
  apjBoardId: 123,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART7', 'USART6'],
  outputGroups: [
    { outputs: [1, 2, 3], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [4, 5], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [6], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const kakuteh7: ExtendedBoardDef = {
  id: 'kakuteh7',
  name: 'Holybro Kakute H7',
  description: 'Holybro Kakute H7 flight controller',
  manufacturer: 'Holybro',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-holybro-kakuteh7.html',
  usbVendorId: '1209',
  usbProductId: '5740',
  dimensions: { width: 35, height: 35 },
  formFactor: 'mini',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: true,
  apjBoardId: 1048,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6', 'UART7'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [9], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM5', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: ['MPU6000', 'ICM42688', 'BMI270'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 59.5 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const kakuteh7Wing: ExtendedBoardDef = {
  id: 'kakuteh7-wing',
  name: 'Holybro Kakute H7-Wing',
  description: 'Holybro Kakute H7 Wing fixed-wing controller',
  manufacturer: 'Holybro',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/plane/docs/common-holybro-kakuteh7wing.html',
  usbVendorId: '1209',
  usbProductId: '5740',
  dimensions: { width: 44, height: 29 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'USART2',
    SERIAL3: 'USART1',
    SERIAL4: 'USART3',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6',
    SERIAL7: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 4, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 7, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: true,
  apjBoardId: 1105,
  serialOrder: ['OTG1', 'UART7', 'USART2', 'USART1', 'USART3', 'UART5', 'USART6', 'UART8', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9, 10], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [14], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [11, 12, 13], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 14,
  builtinSensors: {
    imu: ['BMI088', 'ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 8, currPin: 4, voltMult: 18.18, ampPerVolt: 36.6 },
  i2cBuses: 3,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const kakuteh7mini: ExtendedBoardDef = {
  id: 'kakuteh7mini',
  name: 'Holybro Kakute H7 Mini',
  description: 'Holybro Kakute H7 Mini 20x20 controller',
  manufacturer: 'Holybro',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-holybro-kakuteh7mini.html',
  usbVendorId: '1209',
  usbProductId: '5740',
  dimensions: { width: 26, height: 26 },
  formFactor: 'mini',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: true,
  apjBoardId: 1058,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6', 'UART7'],
  outputGroups: [
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM5', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: ['MPU6000', 'ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.1, ampPerVolt: 59.5 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const mambaf405v2: ExtendedBoardDef = {
  id: 'mambaf405v2',
  name: 'MambaF405v2',
  description: 'MambaF405v2',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mambaf405v2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL3: 'USART3',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1019,
  serialOrder: ['OTG1', 'USART1', 'EMPTY', 'USART3', 'EMPTY', 'EMPTY', 'USART6'],
  outputGroups: [
    { outputs: [1, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [2, 3], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 5,
  builtinSensors: {
    imu: ['MPU6000', 'ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 11, currPin: 13, voltMult: 11.0, ampPerVolt: 25.0 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA10' },
};

export const mambah743v4: ExtendedBoardDef = {
  id: 'mambah743v4',
  name: 'MambaH743v4',
  description: 'MambaH743v4',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mambah743v4.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1073,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [9], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: ['MPU6000', 'BMI270', 'ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 11, currPin: 13, voltMult: 11.1, ampPerVolt: 64.0 },
  i2cBuses: 2,
  hasBuzzer: true,
};

export const matekf405Std: ExtendedBoardDef = {
  id: 'matekf405-std',
  name: 'Matek F405-STD',
  description: 'Matek F405-STD standard controller',
  manufacturer: 'Matek',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekf405-std.html',
  usbVendorId: '1209',
  usbProductId: '5740',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART3',
    SERIAL2: 'UART4',
    SERIAL3: 'USART1',
    SERIAL4: 'UART5',
    SERIAL5: 'USART2'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX3/RX3', serialIndex: 1, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 2, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 4, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: true,
  apjBoardId: 125,
  serialOrder: ['OTG1', 'USART3', 'UART4', 'USART1', 'UART5', 'USART2'],
  outputGroups: [
    { outputs: [6], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [1], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [7], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [2, 3, 4], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 7,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 15, currPin: 14, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA3' },
};

export const matekf405Te: ExtendedBoardDef = {
  id: 'matekf405-te',
  name: 'Matek F405-TE (VTOL)',
  description: 'Matek F405-TE VTOL controller',
  manufacturer: 'Matek',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/plane/docs/common-matekf405-te.html',
  usbVendorId: '1209',
  usbProductId: '5740',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART3',
    SERIAL3: 'UART5',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'USART2'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 3, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 6, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: true,
  apjBoardId: 1054,
  serialOrder: ['OTG1', 'USART1', 'USART3', 'UART5', 'UART4', 'USART6', 'USART2'],
  outputGroups: [
    { outputs: [3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [9], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [10], timer: 'TIM13', capabilities: ['PWM'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [12], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [11], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['ICM42605'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 21.0, ampPerVolt: 66.7 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA3' },
};

export const matekf405Wing: ExtendedBoardDef = {
  id: 'matekf405-wing',
  name: 'Matek F405-Wing',
  description: 'Matek F405-Wing fixed-wing controller',
  manufacturer: 'Matek',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/plane/docs/common-matekf405-wing.html',
  usbVendorId: '1209',
  usbProductId: '5740',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6',
    SERIAL7: 'USART2'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 7, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: true,
  apjBoardId: 127,
  serialOrder: ['OTG1', 'USART1', 'EMPTY', 'USART3', 'UART4', 'UART5', 'USART6', 'USART2'],
  outputGroups: [
    { outputs: [7, 8, 9], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [10], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: ['MPU6000', 'ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 31.7 },
  i2cBuses: 2,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA3' },
};

export const matekf765Wing: ExtendedBoardDef = {
  id: 'matekf765-wing',
  name: 'Matek F765-Wing',
  description: 'Matek F765-Wing premium fixed-wing controller',
  manufacturer: 'Matek',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/plane/docs/common-matekf765-wing.html',
  usbVendorId: '1209',
  usbProductId: '5740',
  dimensions: { width: 44, height: 29 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'USART1',
    SERIAL3: 'USART2',
    SERIAL4: 'USART3',
    SERIAL5: 'UART8',
    SERIAL6: 'UART4',
    SERIAL7: 'USART6',
    SERIAL8: 'UART5'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 2, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 3, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 4, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 6, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 7, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 8, uartName: 'UART5', hasTx: true, hasRx: true }
  ],
  confirmed: true,
  apjBoardId: 143,
  serialOrder: ['OTG1', 'UART7', 'USART1', 'USART2', 'USART3', 'UART8', 'UART4', 'USART6', 'UART5'],
  outputGroups: [
    { outputs: [13], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8, 9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM8', capabilities: ['PWM', 'DShot'] },
    { outputs: [11, 12], timer: 'TIM9', capabilities: ['PWM'] }
  ],
  pwmOutputCount: 13,
  builtinSensors: {
    imu: ['MPU6000', 'ICM20602'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 12, currPin: 13, voltMult: 11.0, ampPerVolt: 40.0 },
  i2cBuses: 2,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const matekh743: ExtendedBoardDef = {
  id: 'matekh743',
  name: 'Matek H743-Wing',
  description: 'Matek H743-Wing (v1/v2)',
  manufacturer: 'Matek',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekh743-wing.html',
  usbVendorId: '1209',
  usbProductId: '5740',
  dimensions: { width: 44, height: 29 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'USART1',
    SERIAL3: 'USART2',
    SERIAL4: 'USART3',
    SERIAL5: 'UART8',
    SERIAL6: 'UART4',
    SERIAL7: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 2, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 3, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 4, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 6, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 7, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: true,
  apjBoardId: 1013,
  serialOrder: ['OTG1', 'UART7', 'USART1', 'USART2', 'USART3', 'UART8', 'UART4', 'USART6', 'OTG2'],
  outputGroups: [
    { outputs: [13], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [11, 12], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [7, 8, 9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4, 5, 6], timer: 'TIM5', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 13,
  builtinSensors: {
    imu: ['ICM42688', 'MPU6000', 'ICM20602', 'ICM42605'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 40.0 },
  i2cBuses: 2,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const mrocontrolzeroh7: ExtendedBoardDef = {
  id: 'mrocontrolzeroh7',
  name: 'mRo Control Zero H7',
  description: 'mRo Control Zero H7 OEM autopilot',
  manufacturer: 'mRo',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mro-control-zero-h7.html',
  usbVendorId: '26ac',
  usbProductId: '0011',
  dimensions: { width: 36, height: 36 },
  formFactor: 'mini',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: true,
  apjBoardId: 1023,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['BMI088', 'ICM20608', 'ICM20948'],
    barometer: ['DPS310'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const mropixracerpro: ExtendedBoardDef = {
  id: 'mropixracerpro',
  name: 'mRoPixracerPro',
  description: 'mRoPixracerPro',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mropixracerpro.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'USART1',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 5, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1017,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'USART1', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM20948', 'ICM20608', 'BMI088'],
    barometer: ['DPS310'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const nxtpx4v2: ExtendedBoardDef = {
  id: 'nxtpx4v2',
  name: 'NxtPX4v2',
  description: 'NxtPX4v2',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-nxtpx4v2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'UART4',
    SERIAL3: 'USART1',
    SERIAL4: 'USART3',
    SERIAL5: 'UART7',
    SERIAL6: 'UART5',
    SERIAL7: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 2, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 4, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 6, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 7, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1159,
  serialOrder: ['OTG1', 'USART2', 'UART4', 'USART1', 'USART3', 'UART7', 'UART5', 'UART8'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 4, currPin: 8, voltMult: 10.2, ampPerVolt: 20.4 },
  i2cBuses: 2,
};

export const omnibusf4pro: ExtendedBoardDef = {
  id: 'omnibusf4pro',
  name: 'Omnibus F4 Pro',
  description: 'Omnibus F4 Pro AIO (classic)',
  manufacturer: 'Airbot',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-omnibusf4pro.html',
  usbVendorId: '1209',
  usbProductId: '5740',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART3',
    SERIAL3: 'USART6',
    SERIAL4: 'UART4'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 3, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true }
  ],
  confirmed: true,
  apjBoardId: 131,
  serialOrder: ['OTG1', 'USART1', 'USART3', 'USART6', 'UART4'],
  outputGroups: [
    { outputs: [1, 2, 6], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4, 5], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['BMI270', 'MPU6000'],
    barometer: ['BMP280'],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 11.0, ampPerVolt: 18.2 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB8' },
};

export const pixhawk1: ExtendedBoardDef = {
  id: 'pixhawk1',
  name: 'Pixhawk 1',
  description: 'Pixhawk 1 (alias for FMUv3)',
  manufacturer: '3D Robotics / mRo',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixhawk-overview.html',
  usbVendorId: '26ac',
  usbProductId: '0011',
  dimensions: { width: 82, height: 50 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TELEM1', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TELEM2', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'GPS', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'GPS2', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'Debug', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: true,
  apjBoardId: 9,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000', 'ICM20608', 'MPU9250', 'ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: ['HMC5843'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const pixhawk4: ExtendedBoardDef = {
  id: 'pixhawk4',
  name: 'Holybro Pixhawk 4',
  description: 'Holybro Pixhawk 4 (FMUv5)',
  manufacturer: 'Holybro',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixhawk4.html',
  usbVendorId: '3162',
  usbProductId: '004b',
  dimensions: { width: 84, height: 44 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TELEM1', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TELEM2', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'GPS', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'UART&I2C B', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'Debug', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'IO Debug', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: true,
  apjBoardId: 50,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'USART1', 'UART4', 'USART6', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM20689', 'ICM20602', 'BMI055'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 0, currPin: 1, voltMult: 18.182, ampPerVolt: 36.364 },
  i2cBuses: 4,
  hasSafetySwitch: true,
};

export const pixhawk6c: ExtendedBoardDef = {
  id: 'pixhawk6c',
  name: 'Holybro Pixhawk 6C',
  description: 'Holybro Pixhawk 6C (FMUv6C)',
  manufacturer: 'Holybro',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-holybro-pixhawk6C.html',
  usbVendorId: '3162',
  usbProductId: '0060',
  dimensions: { width: 84, height: 44 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART8',
    SERIAL5: 'USART2',
    SERIAL6: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TELEM1', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TELEM2', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'GPS1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TELEM3', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'GPS2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 6, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: true,
  apjBoardId: 56,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART8', 'USART2', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['BMI055', 'ICM42688'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 8, currPin: 4, voltMult: 18.18, ampPerVolt: 36.36 },
  i2cBuses: 3,
  hasSafetySwitch: true,
};

export const pixhawk6x: ExtendedBoardDef = {
  id: 'pixhawk6x',
  name: 'Holybro Pixhawk 6X',
  description: 'Holybro Pixhawk 6X (FMUv6X)',
  manufacturer: 'Holybro',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-holybro-pixhawk6X.html',
  usbVendorId: '3162',
  usbProductId: '0060',
  dimensions: { width: 84, height: 44 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART8',
    SERIAL5: 'USART2',
    SERIAL6: 'UART4',
    SERIAL7: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TELEM1', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TELEM2', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'GPS1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TELEM3', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'GPS2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'UART4 (I2C B)', serialIndex: 6, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'Debug', serialIndex: 7, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: true,
  apjBoardId: 53,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART8', 'USART2', 'UART4', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['BMI088', 'ICM42688', 'ICM42670', 'ADIS16470', 'IIM42652', 'ICM45686'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const speedybeef405mini: ExtendedBoardDef = {
  id: 'speedybeef405mini',
  name: 'SpeedyBee F405 Mini',
  description: 'SpeedyBee F405 Mini 20x20 controller',
  manufacturer: 'SpeedyBee',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-speedybeef405mini.html',
  usbVendorId: '1209',
  usbProductId: '5740',
  dimensions: { width: 26, height: 26 },
  formFactor: 'mini',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: true,
  apjBoardId: 1135,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [5], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 5,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 40.0 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const board3drL431Asauav: ExtendedBoardDef = {
  id: '3dr-l431-asauav',
  name: '3DR-L431-ASAUAV',
  description: '3DR-L431-ASAUAV',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-3dr-l431-asauav.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'USART2'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1165,
  serialOrder: ['USART1', 'USART2'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const board3drcontrolzerog: ExtendedBoardDef = {
  id: '3drcontrolzerog',
  name: '3DRControlZeroG',
  description: '3DRControlZeroG',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-3drcontrolzerog.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1124,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'USART6', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['BMI088', 'ICM20608', 'ICM20948'],
    barometer: ['DPS310'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 15.3, ampPerVolt: 50.0 },
  i2cBuses: 3,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const acctongodwitGa1: ExtendedBoardDef = {
  id: 'acctongodwit_ga1',
  name: 'AcctonGodwit_GA1',
  description: 'AcctonGodwit_GA1',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-acctongodwit_ga1.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART8',
    SERIAL5: 'USART2',
    SERIAL6: 'UART4',
    SERIAL7: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 6, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 7, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 7120,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART8', 'USART2', 'UART4', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['BMI088', 'ICM42688'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const acnsCm4pilot: ExtendedBoardDef = {
  id: 'acns-cm4pilot',
  name: 'ACNS-CM4Pilot',
  description: 'ACNS-CM4Pilot',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-acns-cm4pilot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'USART6',
    SERIAL5: 'USART2'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 4, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1115,
  serialOrder: ['OTG1', 'USART1', 'USART3', 'UART4', 'USART6', 'USART2'],
  outputGroups: [
    { outputs: [5, 6], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['BMI088'],
    barometer: [],
    compass: ['LIS3MDL'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA3' },
};

export const acnsF405aio: ExtendedBoardDef = {
  id: 'acns-f405aio',
  name: 'ACNS-F405AIO',
  description: 'ACNS-F405AIO',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-acns-f405aio.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'USART6',
    SERIAL5: 'USART2'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 4, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1116,
  serialOrder: ['OTG1', 'USART1', 'USART3', 'UART4', 'USART6', 'USART2'],
  outputGroups: [
    { outputs: [5, 6], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: [],
    compass: ['LIS3MDL'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 9.2, ampPerVolt: 50.0 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA3' },
};

export const aedroxh7: ExtendedBoardDef = {
  id: 'aedroxh7',
  name: 'AEDROXH7',
  description: 'AEDROXH7',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-aedroxh7.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1198,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'EMPTY', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [5, 6, 7, 8], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM8', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 40.0 },
  i2cBuses: 2,
};

export const aerocogitoH7digital: ExtendedBoardDef = {
  id: 'aerocogito-h7digital',
  name: 'AeroCogito-H7Digital',
  description: 'AeroCogito-H7Digital',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-aerocogito-h7digital.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART5',
    SERIAL2: 'USART2',
    SERIAL3: 'UART8',
    SERIAL4: 'UART4',
    SERIAL5: 'USART3',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX5/RX5', serialIndex: 1, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 3, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 5, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 4300,
  serialOrder: ['OTG1', 'UART5', 'USART2', 'UART8', 'UART4', 'USART3', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9, 10], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 2,
};

export const aerofoxAirspeed: ExtendedBoardDef = {
  id: 'aerofox-airspeed',
  name: 'AeroFox-Airspeed',
  description: 'AeroFox-Airspeed',
  manufacturer: 'Unknown',
  mcu: 'STM32F103xB',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-aerofox-airspeed.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL3: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1077,
  serialOrder: ['EMPTY', 'EMPTY', 'EMPTY', 'USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const aerofoxAirspeedDlvr: ExtendedBoardDef = {
  id: 'aerofox-airspeed-dlvr',
  name: 'AeroFox-Airspeed-DLVR',
  description: 'AeroFox-Airspeed-DLVR',
  manufacturer: 'Unknown',
  mcu: 'STM32F103xB',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-aerofox-airspeed-dlvr.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL3: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1104,
  serialOrder: ['EMPTY', 'EMPTY', 'EMPTY', 'USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const aerofoxGnssF9p: ExtendedBoardDef = {
  id: 'aerofox-gnss_f9p',
  name: 'AeroFox-GNSS_F9P',
  description: 'AeroFox-GNSS_F9P',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-aerofox-gnss_f9p.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1109,
  serialOrder: ['USART1', 'EMPTY', 'EMPTY'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const aerofoxH7: ExtendedBoardDef = {
  id: 'aerofox-h7',
  name: 'AEROFOX-H7',
  description: 'AEROFOX-H7',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-aerofox-h7.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART4',
    SERIAL3: 'UART5',
    SERIAL4: 'USART2',
    SERIAL5: 'USART1',
    SERIAL6: 'UART8',
    SERIAL7: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 2, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 3, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 4, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 5, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 6, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 7, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 7110,
  serialOrder: ['OTG1', 'UART7', 'UART4', 'UART5', 'USART2', 'USART1', 'UART8', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [15, 16], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [12], timer: 'TIM13', capabilities: ['PWM'] },
    { outputs: [11], timer: 'TIM14', capabilities: ['PWM'] },
    { outputs: [9, 10], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [1, 2], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [13, 14], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 16,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 19, currPin: 9, voltMult: 21.0, ampPerVolt: 40.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const aerofoxPmu: ExtendedBoardDef = {
  id: 'aerofox-pmu',
  name: 'AeroFox-PMU',
  description: 'AeroFox-PMU',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-aerofox-pmu.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL2: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1080,
  serialOrder: ['USART1', 'EMPTY', 'USART3'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [9], timer: 'TIM16', capabilities: ['PWM'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM2', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 5, currPin: 6, voltMult: 21.0, ampPerVolt: 40.0 },
};

export const aeromind6x: ExtendedBoardDef = {
  id: 'aeromind6x',
  name: 'Aeromind6X',
  description: 'Aeromind6X',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-aeromind6x.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART8',
    SERIAL5: 'USART2',
    SERIAL6: 'UART4',
    SERIAL7: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 6, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 7, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1850,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART8', 'USART2', 'UART4', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM45686'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const aetH743Basic: ExtendedBoardDef = {
  id: 'aet-h743-basic',
  name: 'AET-H743-Basic',
  description: 'AET-H743-Basic',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-aet-h743-basic.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 5, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 2024,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'OTG2', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [13], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [11, 12], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [7, 8, 9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4, 5, 6], timer: 'TIM5', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 13,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 40.0 },
  i2cBuses: 2,
};

export const airbotf4: ExtendedBoardDef = {
  id: 'airbotf4',
  name: 'airbotf4',
  description: 'airbotf4',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-airbotf4.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL3: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 3, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 128,
  serialOrder: ['OTG1', 'USART1', 'EMPTY', 'USART6'],
  outputGroups: [
    { outputs: [1, 2, 6], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4, 5], timer: 'TIM2', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 11.0, ampPerVolt: 18.2 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB14' },
};

export const airbrainh743: ExtendedBoardDef = {
  id: 'airbrainh743',
  name: 'AIRBRAINH743',
  description: 'AIRBRAINH743',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-airbrainh743.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1209,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'EMPTY', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 4, currPin: 8, voltMult: 15.0, ampPerVolt: 101.0 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const airlink: ExtendedBoardDef = {
  id: 'airlink',
  name: 'AIRLink',
  description: 'AIRLink',
  manufacturer: 'Unknown',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-airlink.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART8',
    SERIAL5: 'USART3',
    SERIAL6: 'USART2'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 5, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 6, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 55,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART8', 'USART3', 'USART2', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM20602', 'MPU9250'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 0, currPin: 1, voltMult: 18.0, ampPerVolt: 24.0 },
  i2cBuses: 4,
};

export const airvoluteDcs2: ExtendedBoardDef = {
  id: 'airvolute-dcs2',
  name: 'Airvolute-DCS2',
  description: 'Airvolute-DCS2',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-airvolute-dcs2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 5200,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3'],
  outputGroups: [
    { outputs: [3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 4,
  builtinSensors: {
    imu: ['BMI088', 'ICM42688'],
    barometer: ['BMP390'],
    compass: ['LIS3MDL'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA6' },
};

export const anyleafh7: ExtendedBoardDef = {
  id: 'anyleafh7',
  name: 'AnyleafH7',
  description: 'AnyleafH7',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-anyleafh7.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART7',
    SERIAL6: 'UART8',
    SERIAL7: '#OTG2'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 6, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'SERIAL7', serialIndex: 7, uartName: '#OTG2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1146,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART7', 'UART8', '#OTG2'],
  outputGroups: [
    { outputs: [7, 8], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { currPin: 16 },
  i2cBuses: 2,
};

export const aocodaRcH743dual: ExtendedBoardDef = {
  id: 'aocoda-rc-h743dual',
  name: 'Aocoda-RC-H743Dual',
  description: 'Aocoda-RC-H743Dual',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-aocoda-rc-h743dual.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 5210,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [13], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [11, 12], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6, 9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 13,
  builtinSensors: {
    imu: ['MPU6000', 'BMI270'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 40.0 },
  i2cBuses: 2,
  hasBuzzer: true,
};

export const arF407smartbat: ExtendedBoardDef = {
  id: 'ar-f407smartbat',
  name: 'AR-F407SmartBat',
  description: 'AR-F407SmartBat',
  manufacturer: 'Unknown',
  mcu: 'CKS32F407xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-ar-f407smartbat.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1134,
  serialOrder: ['USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
};

export const arkCannode: ExtendedBoardDef = {
  id: 'ark_cannode',
  name: 'ARK_CANNODE',
  description: 'ARK_CANNODE',
  manufacturer: 'Unknown',
  mcu: 'STM32F412Rx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-ark_cannode.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'USART2'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 83,
  serialOrder: ['USART1', 'USART2'],
  outputGroups: [
    { outputs: [1, 2, 3], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [4, 5, 6, 7], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [8], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const arkFpv: ExtendedBoardDef = {
  id: 'ark_fpv',
  name: 'ARK_FPV',
  description: 'ARK_FPV',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-ark_fpv.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'USART2',
    SERIAL5: 'UART4',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 4, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 5, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 59,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'USART2', 'UART4', 'USART6', 'OTG2'],
  outputGroups: [
    { outputs: [9], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 9, currPin: 12, voltMult: 21.0, ampPerVolt: 120.0 },
  i2cBuses: 3,
};

export const arkGps: ExtendedBoardDef = {
  id: 'ark_gps',
  name: 'ARK_GPS',
  description: 'ARK_GPS',
  manufacturer: 'Unknown',
  mcu: 'STM32F412Rx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-ark_gps.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART2',
    SERIAL1: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX2/RX2', serialIndex: 0, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 81,
  serialOrder: ['USART2', 'USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 2,
};

export const arkPi6x: ExtendedBoardDef = {
  id: 'ark_pi6x',
  name: 'ARK_PI6X',
  description: 'ARK_PI6X',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-ark_pi6x.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 58,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART4', 'USART6'],
  outputGroups: [
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 3,
};

export const arkRtkGps: ExtendedBoardDef = {
  id: 'ark_rtk_gps',
  name: 'ARK_RTK_GPS',
  description: 'ARK_RTK_GPS',
  manufacturer: 'Unknown',
  mcu: 'STM32F412Rx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-ark_rtk_gps.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART2',
    SERIAL1: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX2/RX2', serialIndex: 0, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 82,
  serialOrder: ['USART2', 'USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 2,
};

export const arkv6x: ExtendedBoardDef = {
  id: 'arkv6x',
  name: 'ARKV6X',
  description: 'ARKV6X',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-arkv6x.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART8',
    SERIAL5: 'USART2',
    SERIAL6: 'UART4',
    SERIAL7: 'USART3',
    SERIAL8: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 6, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 7, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 8, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 9, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 57,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART8', 'USART2', 'UART4', 'USART3', 'USART6', 'OTG2'],
  outputGroups: [
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['IIM42652', 'ICM42688'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const arkv6xBdshot: ExtendedBoardDef = {
  id: 'arkv6x-bdshot',
  name: 'ARKV6X-bdshot',
  description: 'ARKV6X-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-arkv6x-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART8',
    SERIAL5: 'USART2',
    SERIAL6: 'UART4',
    SERIAL7: 'USART3',
    SERIAL8: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 6, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 7, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 8, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 9, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 57,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART8', 'USART2', 'UART4', 'USART3', 'USART6', 'OTG2'],
  outputGroups: [
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 1, 2, 2, 3, 3, 4, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['IIM42652', 'ICM42688'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const atlasControl: ExtendedBoardDef = {
  id: 'atlas-control',
  name: 'Atlas-Control',
  description: 'Atlas-Control',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-atlas-control.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART6',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 2, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1227,
  serialOrder: ['OTG1', 'USART2', 'USART6', 'USART1', 'UART4', 'EMPTY', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [9, 10, 11, 12], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [13, 14], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 14,
  builtinSensors: {
    imu: ['ADIS16470', 'ICM20689', 'BMI088', 'ICM42688'],
    barometer: ['MS5611'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 16, currPin: 17, voltMult: 18.0, ampPerVolt: 24.0 },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB4' },
};

export const atomrcf405navi: ExtendedBoardDef = {
  id: 'atomrcf405navi',
  name: 'AtomRCF405NAVI',
  description: 'AtomRCF405NAVI',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-atomrcf405navi.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1078,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [3], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [9], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [4, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: ['BMI270'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 11.08836, ampPerVolt: 30.0 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA3' },
};

export const atomrcf405naviDeluxe: ExtendedBoardDef = {
  id: 'atomrcf405navi-deluxe',
  name: 'ATOMRCF405NAVI-Deluxe',
  description: 'ATOMRCF405NAVI-Deluxe',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-atomrcf405navi-deluxe.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1143,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [11, 12], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [3, 4], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [8, 9, 10], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 78.4 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const beastf7: ExtendedBoardDef = {
  id: 'beastf7',
  name: 'BeastF7',
  description: 'BeastF7',
  manufacturer: 'Unknown',
  mcu: 'STM32F745xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-beastf7.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL7: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1026,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'EMPTY', 'UART7'],
  outputGroups: [
    { outputs: [2, 3], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 5,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 10.9, ampPerVolt: 100.0 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const beastf7v2: ExtendedBoardDef = {
  id: 'beastf7v2',
  name: 'BeastF7v2',
  description: 'BeastF7v2',
  manufacturer: 'Unknown',
  mcu: 'STM32F745xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-beastf7v2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL7: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1057,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'EMPTY', 'UART7'],
  outputGroups: [
    { outputs: [2, 3], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 7,
  builtinSensors: {
    imu: ['MPU6000', 'BMI270'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 10.9, ampPerVolt: 100.0 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const beasth7: ExtendedBoardDef = {
  id: 'beasth7',
  name: 'BeastH7',
  description: 'BeastH7',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-beasth7.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL7: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1025,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'EMPTY', 'UART7'],
  outputGroups: [
    { outputs: [2, 3], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 5,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 10.9, ampPerVolt: 100.0 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const beasth7v2: ExtendedBoardDef = {
  id: 'beasth7v2',
  name: 'BeastH7v2',
  description: 'BeastH7v2',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-beasth7v2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL7: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1056,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'EMPTY', 'UART7'],
  outputGroups: [
    { outputs: [2, 3], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 7,
  builtinSensors: {
    imu: ['MPU6000', 'BMI270'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 10.9, ampPerVolt: 100.0 },
  i2cBuses: 2,
  hasBuzzer: true,
};

export const betafpvF405: ExtendedBoardDef = {
  id: 'betafpv-f405',
  name: 'BETAFPV-F405',
  description: 'BETAFPV-F405',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-betafpv-f405.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1125,
  serialOrder: ['OTG1', 'USART1', 'EMPTY', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 5,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 11.0, ampPerVolt: 19.6 },
  hasBuzzer: true,
};

export const betafpvF405I2c: ExtendedBoardDef = {
  id: 'betafpv-f405-i2c',
  name: 'BETAFPV-F405-I2C',
  description: 'BETAFPV-F405-I2C',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-betafpv-f405-i2c.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1125,
  serialOrder: ['OTG1', 'USART1', 'EMPTY', 'EMPTY', 'UART4', 'EMPTY', 'USART6'],
  outputGroups: [
    { outputs: [3, 3, 4, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 7,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 11.0, ampPerVolt: 19.6 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const birdcandy: ExtendedBoardDef = {
  id: 'birdcandy',
  name: 'BirdCANdy',
  description: 'BirdCANdy',
  manufacturer: 'Unknown',
  mcu: 'STM32F412Rx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-birdcandy.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL5: 'USART6'
  },
  uartPorts: [
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1044,
  serialOrder: ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'USART6'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 4,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const blitzf745: ExtendedBoardDef = {
  id: 'blitzf745',
  name: 'BlitzF745',
  description: 'BlitzF745',
  manufacturer: 'Unknown',
  mcu: 'STM32F745xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-blitzf745.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1164,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [5, 6, 7, 8], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 11.0, ampPerVolt: 50.0 },
  i2cBuses: 2,
  hasBuzzer: true,
};

export const blitzh743pro: ExtendedBoardDef = {
  id: 'blitzh743pro',
  name: 'BlitzH743Pro',
  description: 'BlitzH743Pro',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-blitzh743pro.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'UART7',
    SERIAL7: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 7, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1162,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'USART6', 'UART7', 'UART8', 'OTG2'],
  outputGroups: [
    { outputs: [13], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [11, 12], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8, 9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [3, 4, 5, 6], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 13,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 50.0 },
  i2cBuses: 2,
};

export const blitzminif745: ExtendedBoardDef = {
  id: 'blitzminif745',
  name: 'BlitzMiniF745',
  description: 'BlitzMiniF745',
  manufacturer: 'Unknown',
  mcu: 'STM32F745xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-blitzminif745.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1163,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [5, 6, 7, 8], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 9], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 11.0, ampPerVolt: 50.0 },
  i2cBuses: 2,
  hasBuzzer: true,
};

export const blitzwingh743: ExtendedBoardDef = {
  id: 'blitzwingh743',
  name: 'BlitzWingH743',
  description: 'BlitzWingH743',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-blitzwingh743.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 9, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1168,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6', 'UART7', 'UART8', 'OTG2'],
  outputGroups: [
    { outputs: [13], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [11, 12], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8, 9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [3, 4, 5, 6], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 13,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 50.0 },
  i2cBuses: 2,
};

export const botbloxdronenet: ExtendedBoardDef = {
  id: 'botbloxdronenet',
  name: 'BotBloxDroneNet',
  description: 'BotBloxDroneNet',
  manufacturer: 'Unknown',
  mcu: 'STM32H723xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-botbloxdronenet.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX3/RX3', serialIndex: 1, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1148,
  serialOrder: ['OTG1', 'USART3'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
};

export const botwingf405: ExtendedBoardDef = {
  id: 'botwingf405',
  name: 'BOTWINGF405',
  description: 'BOTWINGF405',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-botwingf405.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 2501,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 5,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 11, currPin: 13, voltMult: 11.0, ampPerVolt: 37.0 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB7' },
};

export const brahmaf4: ExtendedBoardDef = {
  id: 'brahmaf4',
  name: 'BrahmaF4',
  description: 'BrahmaF4',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-brahmaf4.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART3',
    SERIAL3: 'USART6',
    SERIAL4: 'UART4'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 3, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1184,
  serialOrder: ['OTG1', 'USART1', 'USART3', 'USART6', 'UART4'],
  outputGroups: [
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 6, 7], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [8, 9], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 14, currPin: 13, voltMult: 11.0, ampPerVolt: 37.0 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const brotherhobbyf405v3: ExtendedBoardDef = {
  id: 'brotherhobbyf405v3',
  name: 'BROTHERHOBBYF405v3',
  description: 'BROTHERHOBBYF405v3',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-brotherhobbyf405v3.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 5811,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [9], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 25.9 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const brotherhobbyh743: ExtendedBoardDef = {
  id: 'brotherhobbyh743',
  name: 'BROTHERHOBBYH743',
  description: 'BROTHERHOBBYH743',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-brotherhobbyh743.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 9, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 5810,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6', 'UART7', 'UART8', 'OTG2'],
  outputGroups: [
    { outputs: [13], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [11, 12], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8, 9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 13,
  builtinSensors: {
    imu: ['BMI088'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 40.0 },
  i2cBuses: 2,
  hasBuzzer: true,
};

export const cRtk2Hp: ExtendedBoardDef = {
  id: 'c-rtk2-hp',
  name: 'C-RTK2-HP',
  description: 'C-RTK2-HP',
  manufacturer: 'Unknown',
  mcu: 'STM32F412Rx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-c-rtk2-hp.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL3: 'USART2'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 3, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1085,
  serialOrder: ['USART1', 'EMPTY', 'EMPTY', 'USART2'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const carbonixf405: ExtendedBoardDef = {
  id: 'carbonixf405',
  name: 'CarbonixF405',
  description: 'CarbonixF405',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-carbonixf405.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1064,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 2,
  builtinSensors: {
    imu: ['BMI088'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const cbuH7LcStamp: ExtendedBoardDef = {
  id: 'cbu-h7-lc-stamp',
  name: 'CBU-H7-LC-Stamp',
  description: 'CBU-H7-LC-Stamp',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cbu-h7-lc-stamp.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 9, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1182,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6', 'UART7', 'UART8', 'OTG2'],
  outputGroups: [
    { outputs: [9, 10], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: ['ICM42670'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 18, currPin: 4, voltMult: 11.1, ampPerVolt: 64.0 },
  i2cBuses: 3,
};

export const cbuH7Stamp: ExtendedBoardDef = {
  id: 'cbu-h7-stamp',
  name: 'CBU-H7-Stamp',
  description: 'CBU-H7-Stamp',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cbu-h7-stamp.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 9, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1156,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6', 'UART7', 'UART8', 'OTG2'],
  outputGroups: [
    { outputs: [9, 10], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: ['ICM42688', 'ICM42670'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 18, currPin: 16, voltMult: 11.1, ampPerVolt: 64.0 },
  i2cBuses: 4,
};

export const corvon405v21: ExtendedBoardDef = {
  id: 'corvon405v2_1',
  name: 'CORVON405V2_1',
  description: 'CORVON405V2_1',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-corvon405v2_1.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1187,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [9, 10], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: ['BMI088'],
    barometer: ['SPL06'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 21.2, ampPerVolt: 40.2 },
  i2cBuses: 1,
};

export const corvon743v1: ExtendedBoardDef = {
  id: 'corvon743v1',
  name: 'CORVON743V1',
  description: 'CORVON743V1',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-corvon743v1.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'UART7',
    SERIAL7: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 7, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1189,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8, 9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: ['BMI088', 'BMI270'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 21.12, ampPerVolt: 40.2 },
  i2cBuses: 2,
};

export const crazyf405: ExtendedBoardDef = {
  id: 'crazyf405',
  name: 'CrazyF405',
  description: 'CrazyF405',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-crazyf405.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL5: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1177,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'EMPTY', 'EMPTY', 'USART6'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [5], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 5,
  builtinSensors: {
    imu: ['BMI270'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 11.0, ampPerVolt: 25.0 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const crazyflie2: ExtendedBoardDef = {
  id: 'crazyflie2',
  name: 'crazyflie2',
  description: 'crazyflie2',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-crazyflie2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART3',
    SERIAL2: 'USART6',
    SERIAL3: 'USART2'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX3/RX3', serialIndex: 1, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 2, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 3, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 12,
  serialOrder: ['OTG1', 'USART3', 'USART6', 'USART2'],
  outputGroups: [
    { outputs: [1, 2, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [3], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 4,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 2,
};

export const csky405: ExtendedBoardDef = {
  id: 'csky405',
  name: 'CSKY405',
  description: 'CSKY405',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-csky405.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART4',
    SERIAL2: 'USART1',
    SERIAL3: 'UART5',
    SERIAL4: 'USART3',
    SERIAL5: 'USART6',
    SERIAL6: 'USART2'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX4/RX4', serialIndex: 1, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 2, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 3, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 4, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 6, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1158,
  serialOrder: ['OTG1', 'UART4', 'USART1', 'UART5', 'USART3', 'USART6', 'USART2'],
  outputGroups: [
    { outputs: [1], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [8, 9], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6, 10], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [2], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [7], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: ['BMI088'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 7, voltMult: 21.0, ampPerVolt: 10.35 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA3' },
};

export const cskyPmu: ExtendedBoardDef = {
  id: 'csky_pmu',
  name: 'CSKY_PMU',
  description: 'CSKY_PMU',
  manufacturer: 'Unknown',
  mcu: 'STM32F412Rx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-csky_pmu.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1212,
  serialOrder: ['USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
};

export const cuav7Nano: ExtendedBoardDef = {
  id: 'cuav-7-nano',
  name: 'CUAV-7-Nano',
  description: 'CUAV-7-Nano',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cuav-7-nano.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART8',
    SERIAL5: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 5, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 7000,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART8', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [7, 8], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [13, 14], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [12], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9, 10, 11], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 14,
  builtinSensors: {
    imu: ['BMI088', 'IIM42652'],
    barometer: ['BMP581'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 9, currPin: 8, voltMult: 31.0, ampPerVolt: 24.0 },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC6' },
};

export const cuav7NanoOdid: ExtendedBoardDef = {
  id: 'cuav-7-nano-odid',
  name: 'CUAV-7-Nano-ODID',
  description: 'CUAV-7-Nano-ODID',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cuav-7-nano-odid.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART8',
    SERIAL5: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 5, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 17000,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART8', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [7, 8], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [13, 14], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [12], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9, 10, 11], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 14,
  builtinSensors: {
    imu: ['BMI088', 'IIM42652'],
    barometer: ['BMP581'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 9, currPin: 8, voltMult: 31.0, ampPerVolt: 24.0 },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC6' },
};

export const cuavNora: ExtendedBoardDef = {
  id: 'cuav-nora',
  name: 'CUAV-Nora',
  description: 'CUAV-Nora',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cuav-nora.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART6',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'UART8',
    SERIAL6: 'UART7',
    SERIAL7: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 2, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 7, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1009,
  serialOrder: ['OTG1', 'USART2', 'USART6', 'USART1', 'UART4', 'UART8', 'UART7', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [9, 10, 11, 12], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [13, 14], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 14,
  builtinSensors: {
    imu: ['ICM20689', 'BMI088', 'ICM42688'],
    barometer: ['MS5611'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB4' },
};

export const cuavNoraBdshot: ExtendedBoardDef = {
  id: 'cuav-nora-bdshot',
  name: 'CUAV-Nora-bdshot',
  description: 'CUAV-Nora-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cuav-nora-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART6',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'UART8',
    SERIAL6: 'UART7',
    SERIAL7: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 2, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 7, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1009,
  serialOrder: ['OTG1', 'USART2', 'USART6', 'USART1', 'UART4', 'UART8', 'UART7', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [9, 10, 11, 12], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [13, 14], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 5, 6, 7, 7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 1, 2, 3, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 18,
  builtinSensors: {
    imu: ['ICM20689', 'BMI088', 'ICM42688'],
    barometer: ['MS5611'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB4' },
};

export const cuavNoraOdid: ExtendedBoardDef = {
  id: 'cuav-nora-odid',
  name: 'CUAV-Nora-ODID',
  description: 'CUAV-Nora-ODID',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cuav-nora-odid.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART6',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'UART8',
    SERIAL6: 'UART7',
    SERIAL7: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 2, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 7, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 11009,
  serialOrder: ['OTG1', 'USART2', 'USART6', 'USART1', 'UART4', 'UART8', 'UART7', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [9, 10, 11, 12], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [13, 14], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 14,
  builtinSensors: {
    imu: ['ICM20689', 'BMI088', 'ICM42688'],
    barometer: ['MS5611'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB4' },
};

export const cuavPixhackV3: ExtendedBoardDef = {
  id: 'cuav-pixhack-v3',
  name: 'CUAV-Pixhack-v3',
  description: 'CUAV-Pixhack-v3',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cuav-pixhack-v3.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 9,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000', 'ICM20608', 'MPU9250', 'ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: ['HMC5843'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const cuavV6xV2: ExtendedBoardDef = {
  id: 'cuav-v6x-v2',
  name: 'CUAV-V6X-v2',
  description: 'CUAV-V6X-v2',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cuav-v6x-v2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART8',
    SERIAL5: 'USART2',
    SERIAL6: 'UART4',
    SERIAL7: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 6, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 7, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 7001,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART8', 'USART2', 'UART4', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM45686', 'IIM42652', 'BMI088'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const cuavV6xV2Odid: ExtendedBoardDef = {
  id: 'cuav-v6x-v2-odid',
  name: 'CUAV-V6X-v2-ODID',
  description: 'CUAV-V6X-v2-ODID',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cuav-v6x-v2-odid.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART8',
    SERIAL5: 'USART2',
    SERIAL6: 'UART4',
    SERIAL7: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 6, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 7, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 17001,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART8', 'USART2', 'UART4', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM45686', 'IIM42652', 'BMI088'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const cuavX25Evo: ExtendedBoardDef = {
  id: 'cuav-x25-evo',
  name: 'CUAV-X25-EVO',
  description: 'CUAV-X25-EVO',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cuav-x25-evo.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'USART2',
    SERIAL5: 'UART4',
    SERIAL6: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 4, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 5, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 6, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 7002,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'USART2', 'UART4', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [9, 10, 11], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [15, 16], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [12, 13, 14], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 16,
  builtinSensors: {
    imu: ['IIM42652'],
    barometer: ['BMP581'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC6' },
};

export const cuavX25EvoOdid: ExtendedBoardDef = {
  id: 'cuav-x25-evo-odid',
  name: 'CUAV-X25-EVO-ODID',
  description: 'CUAV-X25-EVO-ODID',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cuav-x25-evo-odid.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'USART2',
    SERIAL5: 'UART4',
    SERIAL6: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 4, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 5, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 6, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 17002,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'USART2', 'UART4', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [9, 10, 11], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [15, 16], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [12, 13, 14], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 16,
  builtinSensors: {
    imu: ['IIM42652'],
    barometer: ['BMP581'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC6' },
};

export const cuavX7: ExtendedBoardDef = {
  id: 'cuav-x7',
  name: 'CUAV-X7',
  description: 'CUAV-X7',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cuav-x7.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART6',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'UART8',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 2, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1010,
  serialOrder: ['OTG1', 'USART2', 'USART6', 'USART1', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [9, 10, 11, 12], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [13, 14], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 14,
  builtinSensors: {
    imu: ['ADIS16470', 'ICM20689', 'BMI088', 'ICM42688'],
    barometer: ['MS5611'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB4' },
};

export const cuavX7Bdshot: ExtendedBoardDef = {
  id: 'cuav-x7-bdshot',
  name: 'CUAV-X7-bdshot',
  description: 'CUAV-X7-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cuav-x7-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART6',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'UART8',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 2, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1010,
  serialOrder: ['OTG1', 'USART2', 'USART6', 'USART1', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [9, 10, 11, 12], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [13, 14], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 1, 2, 3, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 16,
  builtinSensors: {
    imu: ['ADIS16470', 'ICM20689', 'BMI088', 'ICM42688'],
    barometer: ['MS5611'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB4' },
};

export const cuavX7Odid: ExtendedBoardDef = {
  id: 'cuav-x7-odid',
  name: 'CUAV-X7-ODID',
  description: 'CUAV-X7-ODID',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cuav-x7-odid.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART6',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'UART8',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 2, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 11010,
  serialOrder: ['OTG1', 'USART2', 'USART6', 'USART1', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [9, 10, 11, 12], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [13, 14], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 14,
  builtinSensors: {
    imu: ['ADIS16470', 'ICM20689', 'BMI088', 'ICM42688'],
    barometer: ['MS5611'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB4' },
};

export const cuavGps: ExtendedBoardDef = {
  id: 'cuav_gps',
  name: 'CUAV_GPS',
  description: 'CUAV_GPS',
  manufacturer: 'Unknown',
  mcu: 'STM32F412Rx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cuav_gps.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL3: 'USART2'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 3, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1001,
  serialOrder: ['USART1', 'EMPTY', 'EMPTY', 'USART2'],
  outputGroups: [
    { outputs: [1], timer: 'TIM3', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 1,
  builtinSensors: {
    imu: [],
    barometer: ['MS5611'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const cuavv5: ExtendedBoardDef = {
  id: 'cuavv5',
  name: 'CUAVv5',
  description: 'CUAVv5',
  manufacturer: 'Unknown',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cuavv5.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 50,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'USART1', 'UART4', 'USART6', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM20689', 'ICM20602', 'BMI055', 'ICM42688'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 0, currPin: 1, voltMult: 18.0, ampPerVolt: 24.0 },
  i2cBuses: 4,
  hasSafetySwitch: true,
};

export const cuavv5Bdshot: ExtendedBoardDef = {
  id: 'cuavv5-bdshot',
  name: 'CUAVv5-bdshot',
  description: 'CUAVv5-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cuavv5-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 50,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'USART1', 'UART4', 'USART6', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 2, 3, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 5, 6, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['ICM20689', 'ICM20602', 'BMI055', 'ICM42688'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 0, currPin: 1, voltMult: 18.0, ampPerVolt: 24.0 },
  i2cBuses: 4,
  hasSafetySwitch: true,
};

export const cuavv5nano: ExtendedBoardDef = {
  id: 'cuavv5nano',
  name: 'CUAVv5Nano',
  description: 'CUAVv5Nano',
  manufacturer: 'Unknown',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cuavv5nano.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 50,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'USART1', 'UART4', 'USART6', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [9, 10, 11], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 11,
  builtinSensors: {
    imu: ['ICM20689', 'ICM20602', 'BMI055'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 0, currPin: 1, voltMult: 18.0, ampPerVolt: 24.0 },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const cuavv5nanoBdshot: ExtendedBoardDef = {
  id: 'cuavv5nano-bdshot',
  name: 'CUAVv5Nano-bdshot',
  description: 'CUAVv5Nano-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cuavv5nano-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 50,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'USART1', 'UART4', 'USART6', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 2, 3, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [9, 9, 10, 10, 11, 11], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 16,
  builtinSensors: {
    imu: ['ICM20689', 'ICM20602', 'BMI055'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 0, currPin: 1, voltMult: 18.0, ampPerVolt: 24.0 },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const cubeblackplus: ExtendedBoardDef = {
  id: 'cubeblack+',
  name: 'CubeBlack+',
  description: 'CubeBlack+',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cubeblack+.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1003,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000', 'ICM20608', 'MPU9250', 'ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: ['HMC5843'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const cubeblackPeriph: ExtendedBoardDef = {
  id: 'cubeblack-periph',
  name: 'CubeBlack-periph',
  description: 'CubeBlack-periph',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cubeblack-periph.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1401,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000', 'ICM20608', 'MPU9250', 'ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: ['HMC5843'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const cubegreenSolo: ExtendedBoardDef = {
  id: 'cubegreen-solo',
  name: 'CubeGreen-solo',
  description: 'CubeGreen-solo',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cubegreen-solo.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 9,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000', 'ICM20608', 'MPU9250', 'ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: ['HMC5843'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const cubenode: ExtendedBoardDef = {
  id: 'cubenode',
  name: 'CubeNode',
  description: 'CubeNode',
  manufacturer: 'Unknown',
  mcu: 'STM32H757xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cubenode.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1079,
  serialOrder: ['OTG1', 'UART7'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: ['ICM45686'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
};

export const cubenodeEth: ExtendedBoardDef = {
  id: 'cubenode-eth',
  name: 'CubeNode-ETH',
  description: 'CubeNode-ETH',
  manufacturer: 'Unknown',
  mcu: 'STM32H757xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cubenode-eth.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX8/RX8', serialIndex: 1, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1079,
  serialOrder: ['OTG1', 'UART8'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: ['ICM45686'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
};

export const cubeorangeBdshot: ExtendedBoardDef = {
  id: 'cubeorange-bdshot',
  name: 'CubeOrange-bdshot',
  description: 'CubeOrange-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cubeorange-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 140,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 1, 2, 2, 3, 3, 4, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 5, 6, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const cubeorangeJoey: ExtendedBoardDef = {
  id: 'cubeorange-joey',
  name: 'CubeOrange-joey',
  description: 'CubeOrange-joey',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cubeorange-joey.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1033,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const cubeorangeOdid: ExtendedBoardDef = {
  id: 'cubeorange-odid',
  name: 'CubeOrange-ODID',
  description: 'CubeOrange-ODID',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cubeorange-odid.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 10140,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const cubeorangePeriph: ExtendedBoardDef = {
  id: 'cubeorange-periph',
  name: 'CubeOrange-periph',
  description: 'CubeOrange-periph',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cubeorange-periph.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1400,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const cubeorangePeriphHeavy: ExtendedBoardDef = {
  id: 'cubeorange-periph-heavy',
  name: 'CubeOrange-periph-heavy',
  description: 'CubeOrange-periph-heavy',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cubeorange-periph-heavy.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1400,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const cubeorangeSimonhardware: ExtendedBoardDef = {
  id: 'cubeorange-simonhardware',
  name: 'CubeOrange-SimOnHardWare',
  description: 'CubeOrange-SimOnHardWare',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cubeorange-simonhardware.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 140,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const cubeorangeplusBdshot: ExtendedBoardDef = {
  id: 'cubeorangeplus-bdshot',
  name: 'CubeOrangePlus-bdshot',
  description: 'CubeOrangePlus-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32H757xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cubeorangeplus-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1063,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 1, 2, 2, 3, 3, 4, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 5, 6, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['ICM20948', 'ICM20602', 'ICM42688', 'ICM45686'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 3,
  hasSafetySwitch: true,
};

export const cubeorangeplusOdid: ExtendedBoardDef = {
  id: 'cubeorangeplus-odid',
  name: 'CubeOrangePlus-ODID',
  description: 'CubeOrangePlus-ODID',
  manufacturer: 'Unknown',
  mcu: 'STM32H757xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cubeorangeplus-odid.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 11063,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['ICM20948', 'ICM20602', 'ICM42688', 'ICM45686'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 3,
  hasSafetySwitch: true,
};

export const cubeorangeplusSimonhardware: ExtendedBoardDef = {
  id: 'cubeorangeplus-simonhardware',
  name: 'CubeOrangePlus-SimOnHardWare',
  description: 'CubeOrangePlus-SimOnHardWare',
  manufacturer: 'Unknown',
  mcu: 'STM32H757xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cubeorangeplus-simonhardware.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1063,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['ICM20948', 'ICM20602', 'ICM42688', 'ICM45686'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 3,
  hasSafetySwitch: true,
};

export const cubepurple: ExtendedBoardDef = {
  id: 'cubepurple',
  name: 'CubePurple',
  description: 'CubePurple',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cubepurple.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 9,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000', 'ICM20608', 'MPU9250', 'ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: ['HMC5843'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const cuberedprimary: ExtendedBoardDef = {
  id: 'cuberedprimary',
  name: 'CubeRedPrimary',
  description: 'CubeRedPrimary',
  manufacturer: 'Unknown',
  mcu: 'STM32H757xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cuberedprimary.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART6',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART8',
    SERIAL7: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 2, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1069,
  serialOrder: ['OTG1', 'USART2', 'USART6', 'USART3', 'UART4', 'UART8', 'OTG2', 'UART7'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['ICM42688', 'ICM45686'],
    barometer: ['MS5611'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 12.02, ampPerVolt: 39.877 },
  i2cBuses: 2,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB7' },
};

export const cuberedprimaryPppgw: ExtendedBoardDef = {
  id: 'cuberedprimary-pppgw',
  name: 'CubeRedPrimary-PPPGW',
  description: 'CubeRedPrimary-PPPGW',
  manufacturer: 'Unknown',
  mcu: 'STM32H757xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cuberedprimary-pppgw.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART6',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART8',
    SERIAL7: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 2, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1409,
  serialOrder: ['OTG1', 'USART2', 'USART6', 'USART3', 'UART4', 'UART8', 'OTG2', 'UART7'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['ICM42688', 'ICM45686'],
    barometer: ['MS5611'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 12.02, ampPerVolt: 39.877 },
  i2cBuses: 2,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB7' },
};

export const cuberedsecondary: ExtendedBoardDef = {
  id: 'cuberedsecondary',
  name: 'CubeRedSecondary',
  description: 'CubeRedSecondary',
  manufacturer: 'Unknown',
  mcu: 'STM32H757xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cuberedsecondary.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'UART8',
    SERIAL1: 'UART7',
    SERIAL2: 'USART3',
    SERIAL3: 'USART6',
    SERIAL4: 'UART4',
    SERIAL5: 'USART2'
  },
  uartPorts: [
    { padLabel: 'TX8/RX8', serialIndex: 0, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 3, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1070,
  serialOrder: ['UART8', 'UART7', 'USART3', 'USART6', 'UART4', 'USART2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC8' },
};

export const cuberedsecondaryIo: ExtendedBoardDef = {
  id: 'cuberedsecondary-io',
  name: 'CubeRedSecondary-IO',
  description: 'CubeRedSecondary-IO',
  manufacturer: 'Unknown',
  mcu: 'STM32H757xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cuberedsecondary-io.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {},
  confirmed: false,
  apjBoardId: 1070,
  serialOrder: ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM2', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC8' },
};

export const cubesolo: ExtendedBoardDef = {
  id: 'cubesolo',
  name: 'CubeSolo',
  description: 'CubeSolo',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cubesolo.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 9,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000', 'ICM20608', 'MPU9250', 'ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: ['HMC5843'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const cubeyellow: ExtendedBoardDef = {
  id: 'cubeyellow',
  name: 'CubeYellow',
  description: 'CubeYellow',
  manufacturer: 'Unknown',
  mcu: 'STM32F777xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cubeyellow.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 120,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const cubeyellowBdshot: ExtendedBoardDef = {
  id: 'cubeyellow-bdshot',
  name: 'CubeYellow-bdshot',
  description: 'CubeYellow-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32F777xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-cubeyellow-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 120,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 1, 2, 2, 3, 3, 4, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: ['ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const dakefpvf405: ExtendedBoardDef = {
  id: 'dakefpvf405',
  name: 'DAKEFPVF405',
  description: 'DAKEFPVF405',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-dakefpvf405.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1190,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [7], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 7,
  builtinSensors: {
    imu: [],
    barometer: ['DPS310'],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 11, currPin: 10, voltMult: 11.0, ampPerVolt: 83.3 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const dakefpvh743: ExtendedBoardDef = {
  id: 'dakefpvh743',
  name: 'DAKEFPVH743',
  description: 'DAKEFPVH743',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-dakefpvh743.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1193,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [5, 6, 14], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9, 10, 13], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [13], timer: 'TIM16', capabilities: ['PWM'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [14], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7, 8, 9, 10, 11, 12], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8, 11, 12], timer: 'TIM8', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 24,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 11, currPin: 10, voltMult: 16.0, ampPerVolt: 83.3 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const dakefpvh743Slim: ExtendedBoardDef = {
  id: 'dakefpvh743_slim',
  name: 'DAKEFPVH743_SLIM',
  description: 'DAKEFPVH743_SLIM',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-dakefpvh743_slim.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1208,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [14], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [9, 10, 11, 12], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [13], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 14,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 18, currPin: 10, voltMult: 16.0, ampPerVolt: 83.3 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const dakefpvh743pro: ExtendedBoardDef = {
  id: 'dakefpvh743pro',
  name: 'DAKEFPVH743Pro',
  description: 'DAKEFPVH743Pro',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-dakefpvh743pro.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1194,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [5, 6], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [13], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [14], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [9, 10, 11, 12], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 14,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 11, currPin: 10, voltMult: 16.0, ampPerVolt: 83.3 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const deveboxh7v2: ExtendedBoardDef = {
  id: 'deveboxh7v2',
  name: 'DevEBoxH7v2',
  description: 'DevEBoxH7v2',
  manufacturer: 'Unknown',
  mcu: 'STM32H750xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-deveboxh7v2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1061,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'EMPTY', 'EMPTY', 'UART8'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 4,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 10.9, ampPerVolt: 28.5 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const droneerf405: ExtendedBoardDef = {
  id: 'droneerf405',
  name: 'DroneerF405',
  description: 'DroneerF405',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-droneerf405.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 5800,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5'],
  outputGroups: [
    { outputs: [6], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 7, 8], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [9], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM8', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 11.0, ampPerVolt: 30.2 },
  i2cBuses: 1,
};

export const drotekp3pro: ExtendedBoardDef = {
  id: 'drotekp3pro',
  name: 'DrotekP3Pro',
  description: 'DrotekP3Pro',
  manufacturer: 'Unknown',
  mcu: 'STM32F469xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-drotekp3pro.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'USART1',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 5, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 13,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'USART1', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU9250', 'ICM20608'],
    barometer: ['MS5611'],
    compass: ['LIS3MDL'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const durandal: ExtendedBoardDef = {
  id: 'durandal',
  name: 'Durandal',
  description: 'Durandal',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-durandal.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 139,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'USART1', 'UART4', 'USART6', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM20689', 'ICM20602', 'BMI055'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 16, currPin: 17, voltMult: 18.182, ampPerVolt: 36.364 },
  i2cBuses: 4,
  hasSafetySwitch: true,
};

export const durandalBdshot: ExtendedBoardDef = {
  id: 'durandal-bdshot',
  name: 'Durandal-bdshot',
  description: 'Durandal-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-durandal-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 139,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'USART1', 'UART4', 'USART6', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 1, 2, 2, 3, 3, 4, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['ICM20689', 'ICM20602', 'BMI055'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 16, currPin: 17, voltMult: 18.182, ampPerVolt: 36.364 },
  i2cBuses: 4,
  hasSafetySwitch: true,
};

export const f103Adsb: ExtendedBoardDef = {
  id: 'f103-adsb',
  name: 'f103-ADSB',
  description: 'f103-ADSB',
  manufacturer: 'Unknown',
  mcu: 'STM32F103xB',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-f103-adsb.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL3: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1000,
  serialOrder: ['EMPTY', 'EMPTY', 'EMPTY', 'USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const f103Airspeed: ExtendedBoardDef = {
  id: 'f103-airspeed',
  name: 'f103-Airspeed',
  description: 'f103-Airspeed',
  manufacturer: 'Unknown',
  mcu: 'STM32F103xB',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-f103-airspeed.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL3: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1000,
  serialOrder: ['EMPTY', 'EMPTY', 'EMPTY', 'USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const f103Gps: ExtendedBoardDef = {
  id: 'f103-gps',
  name: 'f103-GPS',
  description: 'f103-GPS',
  manufacturer: 'Unknown',
  mcu: 'STM32F103xB',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-f103-gps.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL3: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1000,
  serialOrder: ['EMPTY', 'EMPTY', 'EMPTY', 'USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const f103Hwesc: ExtendedBoardDef = {
  id: 'f103-hwesc',
  name: 'f103-HWESC',
  description: 'f103-HWESC',
  manufacturer: 'Unknown',
  mcu: 'STM32F103xB',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-f103-hwesc.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL3: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1000,
  serialOrder: ['EMPTY', 'EMPTY', 'EMPTY', 'USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const f103Qiotekperiph: ExtendedBoardDef = {
  id: 'f103-qiotekperiph',
  name: 'f103-QiotekPeriph',
  description: 'f103-QiotekPeriph',
  manufacturer: 'Unknown',
  mcu: 'STM32F103xB',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-f103-qiotekperiph.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL3: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1000,
  serialOrder: ['EMPTY', 'EMPTY', 'EMPTY', 'USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const f103Rangefinder: ExtendedBoardDef = {
  id: 'f103-rangefinder',
  name: 'f103-RangeFinder',
  description: 'f103-RangeFinder',
  manufacturer: 'Unknown',
  mcu: 'STM32F103xB',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-f103-rangefinder.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL3: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1000,
  serialOrder: ['EMPTY', 'EMPTY', 'EMPTY', 'USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const f103Trigger: ExtendedBoardDef = {
  id: 'f103-trigger',
  name: 'f103-Trigger',
  description: 'f103-Trigger',
  manufacturer: 'Unknown',
  mcu: 'STM32F103xB',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-f103-trigger.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL3: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1000,
  serialOrder: ['EMPTY', 'EMPTY', 'EMPTY', 'USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const f303Gps: ExtendedBoardDef = {
  id: 'f303-gps',
  name: 'f303-GPS',
  description: 'f303-GPS',
  manufacturer: 'Unknown',
  mcu: 'STM32F303xC',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-f303-gps.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART2',
    SERIAL3: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX2/RX2', serialIndex: 0, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1004,
  serialOrder: ['USART2', 'EMPTY', 'EMPTY', 'USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const f303Hwesc: ExtendedBoardDef = {
  id: 'f303-hwesc',
  name: 'f303-HWESC',
  description: 'f303-HWESC',
  manufacturer: 'Unknown',
  mcu: 'STM32F303xC',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-f303-hwesc.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART2',
    SERIAL3: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX2/RX2', serialIndex: 0, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1004,
  serialOrder: ['USART2', 'EMPTY', 'EMPTY', 'USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const f303M10025: ExtendedBoardDef = {
  id: 'f303-m10025',
  name: 'f303-M10025',
  description: 'f303-M10025',
  manufacturer: 'Unknown',
  mcu: 'STM32F303xC',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-f303-m10025.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART2',
    SERIAL3: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX2/RX2', serialIndex: 0, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1004,
  serialOrder: ['USART2', 'EMPTY', 'EMPTY', 'USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const f303M10070: ExtendedBoardDef = {
  id: 'f303-m10070',
  name: 'f303-M10070',
  description: 'f303-M10070',
  manufacturer: 'Unknown',
  mcu: 'STM32F303xC',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-f303-m10070.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART2',
    SERIAL3: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX2/RX2', serialIndex: 0, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1004,
  serialOrder: ['USART2', 'EMPTY', 'EMPTY', 'USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const f303Matekgps: ExtendedBoardDef = {
  id: 'f303-matekgps',
  name: 'f303-MatekGPS',
  description: 'f303-MatekGPS',
  manufacturer: 'Unknown',
  mcu: 'STM32F303xC',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-f303-matekgps.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL2: 'USART3',
    SERIAL3: 'USART2'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 3, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1004,
  serialOrder: ['USART1', 'EMPTY', 'USART3', 'USART2'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const f303Pwm: ExtendedBoardDef = {
  id: 'f303-pwm',
  name: 'f303-PWM',
  description: 'f303-PWM',
  manufacturer: 'Unknown',
  mcu: 'STM32F303xC',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-f303-pwm.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1004,
  serialOrder: ['USART1'],
  outputGroups: [
    { outputs: [3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM2', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 4,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
};

export const f303Tempsensor: ExtendedBoardDef = {
  id: 'f303-tempsensor',
  name: 'f303-TempSensor',
  description: 'f303-TempSensor',
  manufacturer: 'Unknown',
  mcu: 'STM32F303xC',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-f303-tempsensor.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1004,
  serialOrder: ['EMPTY', 'USART1', 'USART2'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 2,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const f303Universal: ExtendedBoardDef = {
  id: 'f303-universal',
  name: 'f303-Universal',
  description: 'f303-Universal',
  manufacturer: 'Unknown',
  mcu: 'STM32F303xC',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-f303-universal.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART2',
    SERIAL3: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX2/RX2', serialIndex: 0, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1004,
  serialOrder: ['USART2', 'EMPTY', 'EMPTY', 'USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const f35lightning: ExtendedBoardDef = {
  id: 'f35lightning',
  name: 'F35Lightning',
  description: 'F35Lightning',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-f35lightning.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'UART5',
    SERIAL3: 'USART2',
    SERIAL5: 'UART4',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 3, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 5, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 135,
  serialOrder: ['OTG1', 'USART1', 'UART5', 'USART2', 'EMPTY', 'UART4', 'USART6'],
  outputGroups: [
    { outputs: [5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU9250'],
    barometer: ['BMP280'],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 11, currPin: 12, voltMult: 11.0, ampPerVolt: 25.0 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB11' },
};

export const f405Matekairspeed: ExtendedBoardDef = {
  id: 'f405-matekairspeed',
  name: 'f405-MatekAirspeed',
  description: 'f405-MatekAirspeed',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-f405-matekairspeed.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART5'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 4, uartName: 'UART5', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1014,
  serialOrder: ['USART1', 'USART2', 'USART3', 'UART4', 'UART5'],
  outputGroups: [
    { outputs: [7], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 7,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 21.0, ampPerVolt: 40.0 },
  i2cBuses: 1,
};

export const f405Matekgps: ExtendedBoardDef = {
  id: 'f405-matekgps',
  name: 'f405-MatekGPS',
  description: 'f405-MatekGPS',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-f405-matekgps.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART5'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 4, uartName: 'UART5', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1014,
  serialOrder: ['USART1', 'USART2', 'USART3', 'UART4', 'UART5'],
  outputGroups: [
    { outputs: [7], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 7,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 21.0, ampPerVolt: 40.0 },
  i2cBuses: 1,
};

export const f4by: ExtendedBoardDef = {
  id: 'f4by',
  name: 'F4BY',
  description: 'F4BY',
  manufacturer: 'Unknown',
  mcu: 'STM32F407xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-f4by.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART1',
    SERIAL3: 'USART3',
    SERIAL4: 'UART5'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 2, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 4, uartName: 'UART5', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 20,
  serialOrder: ['OTG1', 'USART2', 'USART1', 'USART3', 'UART5'],
  outputGroups: [
    { outputs: [5, 6, 7, 8], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [9, 10, 11, 12], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 2,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const f4byF427: ExtendedBoardDef = {
  id: 'f4by_f427',
  name: 'F4BY_F427',
  description: 'F4BY_F427',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-f4by_f427.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART1',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 2, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1530,
  serialOrder: ['OTG1', 'USART2', 'USART1', 'USART3', 'UART4', 'UART5'],
  outputGroups: [
    { outputs: [5, 6, 7, 8], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [9, 10, 11, 12], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 16.04981, ampPerVolt: 100.0 },
  i2cBuses: 2,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const f4byH743: ExtendedBoardDef = {
  id: 'f4by_h743',
  name: 'F4BY_H743',
  description: 'F4BY_H743',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-f4by_h743.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART1',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 2, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1531,
  serialOrder: ['OTG1', 'USART2', 'USART1', 'USART3', 'UART4', 'UART5'],
  outputGroups: [
    { outputs: [5, 6, 7, 8], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9, 10, 11, 12], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [13, 14, 15, 16], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 16,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 16.04981, ampPerVolt: 100.0 },
  i2cBuses: 2,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB0' },
};

export const flyingmoonf407: ExtendedBoardDef = {
  id: 'flyingmoonf407',
  name: 'FlyingMoonF407',
  description: 'FlyingMoonF407',
  manufacturer: 'Unknown',
  mcu: 'STM32F407xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-flyingmoonf407.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'UART4',
    SERIAL3: 'USART3',
    SERIAL4: 'USART1'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 2, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 4, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1067,
  serialOrder: ['OTG1', 'USART2', 'UART4', 'USART3', 'USART1'],
  outputGroups: [
    { outputs: [5, 6, 7, 8], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [13, 14, 15, 16], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [9, 10, 11, 12], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 16,
  builtinSensors: {
    imu: ['ICM20689'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 20.0, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC6' },
};

export const flyingmoonf427: ExtendedBoardDef = {
  id: 'flyingmoonf427',
  name: 'FlyingMoonF427',
  description: 'FlyingMoonF427',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-flyingmoonf427.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'UART4',
    SERIAL3: 'USART2',
    SERIAL4: 'USART3',
    SERIAL5: 'UART5'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 2, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 3, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 4, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1068,
  serialOrder: ['OTG1', 'USART1', 'UART4', 'USART2', 'USART3', 'UART5'],
  outputGroups: [
    { outputs: [5, 6, 7, 8], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [13, 14, 15, 16], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [9, 10, 11, 12], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 16,
  builtinSensors: {
    imu: ['ICM20689', 'ICM42605'],
    barometer: [],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 22.0, ampPerVolt: 55.55 },
  i2cBuses: 2,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC6' },
};

export const flyingmoonh743: ExtendedBoardDef = {
  id: 'flyingmoonh743',
  name: 'FlyingMoonH743',
  description: 'FlyingMoonH743',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-flyingmoonh743.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'UART4',
    SERIAL3: 'USART2',
    SERIAL4: 'USART3',
    SERIAL5: 'UART5'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 2, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 3, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 4, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1112,
  serialOrder: ['OTG1', 'USART1', 'UART4', 'USART2', 'USART3', 'UART5'],
  outputGroups: [
    { outputs: [5, 6, 7, 8], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [13, 14, 15, 16], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [9, 10, 11, 12], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 16,
  builtinSensors: {
    imu: ['ICM20689', 'ICM42605'],
    barometer: [],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 22.0, ampPerVolt: 55.55 },
  i2cBuses: 2,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC6' },
};

export const flysparkf4: ExtendedBoardDef = {
  id: 'flysparkf4',
  name: 'FlysparkF4',
  description: 'FlysparkF4',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-flysparkf4.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1361,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [9], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 25.0 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB15' },
};

export const flywoof405hdAiov2: ExtendedBoardDef = {
  id: 'flywoof405hd-aiov2',
  name: 'FlywooF405HD-AIOv2',
  description: 'FlywooF405HD-AIOv2',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-flywoof405hd-aiov2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1180,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [5], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 5,
  builtinSensors: {
    imu: ['ICM42688', 'MPU6000'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 11.0, ampPerVolt: 60.2 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const flywoof405pro: ExtendedBoardDef = {
  id: 'flywoof405pro',
  name: 'FlywooF405Pro',
  description: 'FlywooF405Pro',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-flywoof405pro.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1137,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [9], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 5, 7], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [6, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 11.0, ampPerVolt: 58.8 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA1' },
};

export const flywoof745nano: ExtendedBoardDef = {
  id: 'flywoof745nano',
  name: 'FlywooF745Nano',
  description: 'FlywooF745Nano',
  manufacturer: 'Unknown',
  mcu: 'STM32F745xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-flywoof745nano.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1042,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6', 'UART7'],
  outputGroups: [
    { outputs: [3, 4, 10], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 1, 2, 2, 7, 8], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [6], timer: 'TIM5', capabilities: ['PWM', 'DShot'] },
    { outputs: [5], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['MPU6000', 'ICM42688', 'BMI270'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 10.9, ampPerVolt: 28.5 },
  i2cBuses: 2,
  hasBuzzer: true,
};

export const flywooh743pro: ExtendedBoardDef = {
  id: 'flywooh743pro',
  name: 'FlywooH743Pro',
  description: 'FlywooH743Pro',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-flywooh743pro.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1181,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [13], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [11, 12], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8, 9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [3, 4, 5, 6], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 13,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 40.0 },
  i2cBuses: 2,
};

export const fmuv2: ExtendedBoardDef = {
  id: 'fmuv2',
  name: 'fmuv2',
  description: 'fmuv2',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-fmuv2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 9,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000', 'ICM20608', 'MPU9250', 'ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: ['HMC5843'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const fmuv3Bdshot: ExtendedBoardDef = {
  id: 'fmuv3-bdshot',
  name: 'fmuv3-bdshot',
  description: 'fmuv3-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-fmuv3-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 9,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000', 'ICM20608', 'MPU9250', 'ICM20948'],
    barometer: ['MS5611'],
    compass: ['HMC5843'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const foxeerf405v2: ExtendedBoardDef = {
  id: 'foxeerf405v2',
  name: 'FoxeerF405v2',
  description: 'FoxeerF405v2',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-foxeerf405v2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1157,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [1, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [6, 7, 8], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [10, 11], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 9], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [2, 3], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 11,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 142.9 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const foxeerh743v1: ExtendedBoardDef = {
  id: 'foxeerh743v1',
  name: 'FoxeerH743v1',
  description: 'FoxeerH743v1',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-foxeerh743v1.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1089,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [9], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 11.0, ampPerVolt: 35.4 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA1' },
};

export const freeflyrtk: ExtendedBoardDef = {
  id: 'freeflyrtk',
  name: 'FreeflyRTK',
  description: 'FreeflyRTK',
  manufacturer: 'Unknown',
  mcu: 'STM32F732xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-freeflyrtk.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1028,
  serialOrder: ['OTG1', 'USART2', 'USART3'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 2,
};

export const g4Esc: ExtendedBoardDef = {
  id: 'g4-esc',
  name: 'G4-ESC',
  description: 'G4-ESC',
  manufacturer: 'Unknown',
  mcu: 'STM32G474xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-g4-esc.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1027,
  serialOrder: ['USART1'],
  outputGroups: [
    { outputs: [1], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [2], timer: 'TIM2', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 2,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
};

export const geprcTakerH743: ExtendedBoardDef = {
  id: 'geprc_taker_h743',
  name: 'GEPRC_TAKER_H743',
  description: 'GEPRC_TAKER_H743',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-geprc_taker_h743.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1502,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [9], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: ['MPU6000', 'ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 11.13, ampPerVolt: 28.5 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const geprcf745bthd: ExtendedBoardDef = {
  id: 'geprcf745bthd',
  name: 'GEPRCF745BTHD',
  description: 'GEPRCF745BTHD',
  manufacturer: 'Unknown',
  mcu: 'STM32F745xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-geprcf745bthd.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1501,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [9], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: ['MPU6000', 'ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 11.13, ampPerVolt: 28.5 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const greensightultrablue: ExtendedBoardDef = {
  id: 'greensightultrablue',
  name: 'GreenSightUltraBlue',
  description: 'GreenSightUltraBlue',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-greensightultrablue.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART6',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'UART8',
    SERIAL6: 'USART3',
    SERIAL7: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 2, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 6, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1071,
  serialOrder: ['OTG1', 'USART2', 'USART6', 'USART1', 'UART4', 'UART8', 'USART3', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [9, 10, 11, 12], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [13, 14], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [15, 16], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 16,
  builtinSensors: {
    imu: ['BMI088'],
    barometer: ['DPS310'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 16, currPin: 17, voltMult: 18.0, ampPerVolt: 24.0 },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB4' },
};

export const h757iEval: ExtendedBoardDef = {
  id: 'h757i_eval',
  name: 'H757I_EVAL',
  description: 'H757I_EVAL',
  manufacturer: 'Unknown',
  mcu: 'STM32H757xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-h757i_eval.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 146,
  serialOrder: ['USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
};

export const h757iEvalIntf: ExtendedBoardDef = {
  id: 'h757i_eval_intf',
  name: 'H757I_EVAL_intf',
  description: 'H757I_EVAL_intf',
  manufacturer: 'Unknown',
  mcu: 'STM32H757xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-h757i_eval_intf.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 146,
  serialOrder: ['USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
};

export const heewingF405: ExtendedBoardDef = {
  id: 'heewing-f405',
  name: 'HEEWING-F405',
  description: 'HEEWING-F405',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-heewing-f405.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART3',
    SERIAL2: 'USART1',
    SERIAL3: 'UART5',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'USART2'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX3/RX3', serialIndex: 1, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 2, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 3, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 6, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1119,
  serialOrder: ['OTG1', 'USART3', 'USART1', 'UART5', 'UART4', 'USART6', 'USART2'],
  outputGroups: [
    { outputs: [7, 8, 9], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [10], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM8', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 7.71, ampPerVolt: 26.7 },
  i2cBuses: 2,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA3' },
};

export const heewingF405v2: ExtendedBoardDef = {
  id: 'heewing-f405v2',
  name: 'HEEWING-F405v2',
  description: 'HEEWING-F405v2',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-heewing-f405v2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART3',
    SERIAL2: 'USART1',
    SERIAL3: 'UART5',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'USART2'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX3/RX3', serialIndex: 1, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 2, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 3, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 6, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1119,
  serialOrder: ['OTG1', 'USART3', 'USART1', 'UART5', 'UART4', 'USART6', 'USART2'],
  outputGroups: [
    { outputs: [7, 8, 9], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [10], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM8', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 7.71, ampPerVolt: 26.7 },
  i2cBuses: 2,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA3' },
};

export const here4ap: ExtendedBoardDef = {
  id: 'here4ap',
  name: 'Here4AP',
  description: 'Here4AP',
  manufacturer: 'Unknown',
  mcu: 'STM32H757xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-here4ap.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'UART4',
    SERIAL2: 'UART8',
    SERIAL3: 'USART2'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 1, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 2, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 3, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1043,
  serialOrder: ['USART1', 'UART4', 'UART8', 'USART2'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 2,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: ['MS5611'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
};

export const here4fc: ExtendedBoardDef = {
  id: 'here4fc',
  name: 'Here4FC',
  description: 'Here4FC',
  manufacturer: 'Unknown',
  mcu: 'STM32H757xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-here4fc.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'UART4',
    SERIAL2: 'UART8',
    SERIAL3: 'USART2'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 1, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 2, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 3, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1043,
  serialOrder: ['USART1', 'UART4', 'UART8', 'USART2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [8], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6, 7], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [10, 11], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: ['MS5611'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB15' },
};

export const hitecmosaic: ExtendedBoardDef = {
  id: 'hitecmosaic',
  name: 'HitecMosaic',
  description: 'HitecMosaic',
  manufacturer: 'Unknown',
  mcu: 'STM32F303xC',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-hitecmosaic.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART2',
    SERIAL3: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX2/RX2', serialIndex: 0, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1016,
  serialOrder: ['USART2', 'EMPTY', 'EMPTY', 'USART3'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const holybrof4Pmu: ExtendedBoardDef = {
  id: 'holybrof4_pmu',
  name: 'HolybroF4_PMU',
  description: 'HolybroF4_PMU',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-holybrof4_pmu.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX3/RX3', serialIndex: 0, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 5401,
  serialOrder: ['USART3'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 18.0, ampPerVolt: 125.0 },
  i2cBuses: 1,
};

export const holybrog4Airspeed: ExtendedBoardDef = {
  id: 'holybrog4_airspeed',
  name: 'HolybroG4_Airspeed',
  description: 'HolybroG4_Airspeed',
  manufacturer: 'Unknown',
  mcu: 'STM32G474xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-holybrog4_airspeed.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 5405,
  serialOrder: ['USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const holybrog4Compass: ExtendedBoardDef = {
  id: 'holybrog4_compass',
  name: 'HolybroG4_Compass',
  description: 'HolybroG4_Compass',
  manufacturer: 'Unknown',
  mcu: 'STM32G474xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-holybrog4_compass.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART2'
  },
  uartPorts: [
    { padLabel: 'TX2/RX2', serialIndex: 0, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1088,
  serialOrder: ['USART2'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
};

export const holybrog4Gps: ExtendedBoardDef = {
  id: 'holybrog4_gps',
  name: 'HolybroG4_GPS',
  description: 'HolybroG4_GPS',
  manufacturer: 'Unknown',
  mcu: 'STM32G474xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-holybrog4_gps.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART2',
    SERIAL1: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX2/RX2', serialIndex: 0, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 1, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1053,
  serialOrder: ['USART2', 'USART3'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 2,
};

export const holybrogps: ExtendedBoardDef = {
  id: 'holybrogps',
  name: 'HolybroGPS',
  description: 'HolybroGPS',
  manufacturer: 'Unknown',
  mcu: 'STM32F412Rx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-holybrogps.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART2',
    SERIAL1: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX2/RX2', serialIndex: 0, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1035,
  serialOrder: ['USART2', 'USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: ['BMI088'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 2,
};

export const iflight2rawH7: ExtendedBoardDef = {
  id: 'iflight_2raw_h7',
  name: 'IFLIGHT_2RAW_H7',
  description: 'IFLIGHT_2RAW_H7',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-iflight_2raw_h7.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1173,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6', 'OTG2'],
  outputGroups: [
    { outputs: [9], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [3, 4, 5, 6], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 40.0 },
  i2cBuses: 2,
};

export const iomcu: ExtendedBoardDef = {
  id: 'iomcu',
  name: 'iomcu',
  description: 'iomcu',
  manufacturer: 'Unknown',
  mcu: 'STM32F100xB',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-iomcu.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {},
  confirmed: false,
  apjBoardId: 5713,
  serialOrder: ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  defaultRcInput: { type: 'timer' as const, padLabel: 'define' },
};

export const iomcuDshot: ExtendedBoardDef = {
  id: 'iomcu-dshot',
  name: 'iomcu-dshot',
  description: 'iomcu-dshot',
  manufacturer: 'Unknown',
  mcu: 'STM32F100xB',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-iomcu-dshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {},
  confirmed: false,
  apjBoardId: 5713,
  serialOrder: ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  defaultRcInput: { type: 'timer' as const, padLabel: 'define' },
};

export const iomcuF103: ExtendedBoardDef = {
  id: 'iomcu-f103',
  name: 'iomcu-f103',
  description: 'iomcu-f103',
  manufacturer: 'Unknown',
  mcu: 'STM32F103xB',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-iomcu-f103.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {},
  confirmed: false,
  apjBoardId: 5711,
  serialOrder: ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  defaultRcInput: { type: 'timer' as const, padLabel: 'define' },
};

export const iomcuF1038mhzDshot: ExtendedBoardDef = {
  id: 'iomcu-f103-8mhz-dshot',
  name: 'iomcu-f103-8MHz-dshot',
  description: 'iomcu-f103-8MHz-dshot',
  manufacturer: 'Unknown',
  mcu: 'STM32F103xB',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-iomcu-f103-8mhz-dshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {},
  confirmed: false,
  apjBoardId: 5712,
  serialOrder: ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
  outputGroups: [
    { outputs: [1, 1, 2, 2], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 3, 4, 4], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  defaultRcInput: { type: 'timer' as const, padLabel: 'define' },
};

export const iomcuF103Dshot: ExtendedBoardDef = {
  id: 'iomcu-f103-dshot',
  name: 'iomcu-f103-dshot',
  description: 'iomcu-f103-dshot',
  manufacturer: 'Unknown',
  mcu: 'STM32F103xB',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-iomcu-f103-dshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {},
  confirmed: false,
  apjBoardId: 5711,
  serialOrder: ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
  outputGroups: [
    { outputs: [1, 1, 2, 2], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 3, 4, 4], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  defaultRcInput: { type: 'timer' as const, padLabel: 'define' },
};

export const iomcuF1038mhz: ExtendedBoardDef = {
  id: 'iomcu_f103_8mhz',
  name: 'iomcu_f103_8MHz',
  description: 'iomcu_f103_8MHz',
  manufacturer: 'Unknown',
  mcu: 'STM32F103xB',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-iomcu_f103_8mhz.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {},
  confirmed: false,
  apjBoardId: 5712,
  serialOrder: ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  defaultRcInput: { type: 'timer' as const, padLabel: 'define' },
};

export const jfb100: ExtendedBoardDef = {
  id: 'jfb100',
  name: 'JFB100',
  description: 'JFB100',
  manufacturer: 'Unknown',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-jfb100.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1084,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'USART1', 'UART4', 'USART6', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM20602'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 0, currPin: 1, voltMult: 18.182, ampPerVolt: 36.364 },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const jfb110: ExtendedBoardDef = {
  id: 'jfb110',
  name: 'JFB110',
  description: 'JFB110',
  manufacturer: 'Unknown',
  mcu: 'STM32H755xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-jfb110.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'UART8',
    SERIAL7: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 6, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 7, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1110,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART4', 'USART6', 'UART8', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [6, 9, 10], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [14, 16], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [1, 2], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 11, 12, 13], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8, 15], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 16,
  builtinSensors: {
    imu: ['IIM42652'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 16, currPin: 6 },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC6' },
};

export const jhemJhef405: ExtendedBoardDef = {
  id: 'jhem_jhef405',
  name: 'JHEM_JHEF405',
  description: 'JHEM_JHEF405',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-jhem_jhef405.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1081,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6'],
  outputGroups: [
    { outputs: [9], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 5], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: ['ICM42688', 'MPU6000'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 11.0, ampPerVolt: 58.8 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const jhemcuGsf405aRx2: ExtendedBoardDef = {
  id: 'jhemcu-gsf405a-rx2',
  name: 'JHEMCU-GSF405A-RX2',
  description: 'JHEMCU-GSF405A-RX2',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-jhemcu-gsf405a-rx2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1059,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6'],
  outputGroups: [
    { outputs: [5], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 7,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 11, currPin: 13, voltMult: 11.0, ampPerVolt: 17.0 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const jhemcuH743hd: ExtendedBoardDef = {
  id: 'jhemcu-h743hd',
  name: 'JHEMCU-H743HD',
  description: 'JHEMCU-H743HD',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-jhemcu-h743hd.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 9, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1411,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6', 'UART7', 'UART8', 'OTG2'],
  outputGroups: [
    { outputs: [9], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 11, currPin: 13, voltMult: 11.0, ampPerVolt: 58.8 },
  i2cBuses: 2,
  hasBuzzer: true,
};

export const jhemcuf405pro: ExtendedBoardDef = {
  id: 'jhemcuf405pro',
  name: 'JHEMCUF405PRO',
  description: 'JHEMCUF405PRO',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-jhemcuf405pro.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1412,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6'],
  outputGroups: [
    { outputs: [9], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 5,
  builtinSensors: {
    imu: ['ICM42605'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 11.0, ampPerVolt: 95.844 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const jhemcuf405wing: ExtendedBoardDef = {
  id: 'jhemcuf405wing',
  name: 'JHEMCUF405WING',
  description: 'JHEMCUF405WING',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-jhemcuf405wing.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1169,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [11, 12], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [8, 9, 10], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['ICM42605'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA3' },
};

export const kakutef4Wing: ExtendedBoardDef = {
  id: 'kakutef4-wing',
  name: 'KakuteF4-Wing',
  description: 'KakuteF4-Wing',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-kakutef4-wing.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 5406,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'EMPTY', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7], timer: 'TIM5', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 7,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 40.0 },
  i2cBuses: 1,
};

export const kakutef4mini: ExtendedBoardDef = {
  id: 'kakutef4mini',
  name: 'KakuteF4Mini',
  description: 'KakuteF4Mini',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-kakutef4mini.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1030,
  serialOrder: ['OTG1', 'USART1', 'EMPTY', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [1, 1, 2, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [3, 3, 4, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 5], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 10.9, ampPerVolt: 28.5 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB11' },
};

export const kakutef7Bdshot: ExtendedBoardDef = {
  id: 'kakutef7-bdshot',
  name: 'KakuteF7-bdshot',
  description: 'KakuteF7-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32F745xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-kakutef7-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART7',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 123,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART7', 'USART6'],
  outputGroups: [
    { outputs: [1, 2, 3, 3], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 4, 4, 5], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [6], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const kakutef7mini: ExtendedBoardDef = {
  id: 'kakutef7mini',
  name: 'KakuteF7Mini',
  description: 'KakuteF7Mini',
  manufacturer: 'Unknown',
  mcu: 'STM32F745xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-kakutef7mini.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 145,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6', 'UART7'],
  outputGroups: [
    { outputs: [2, 3], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [6], timer: 'TIM5', capabilities: ['PWM', 'DShot'] },
    { outputs: [5], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 10.9, ampPerVolt: 28.5 },
  i2cBuses: 1,
};

export const kakuteh7Bdshot: ExtendedBoardDef = {
  id: 'kakuteh7-bdshot',
  name: 'KakuteH7-bdshot',
  description: 'KakuteH7-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-kakuteh7-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1048,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6', 'UART7'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 3, 4, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM5', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 13,
  builtinSensors: {
    imu: ['MPU6000', 'ICM42688', 'BMI270'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 59.5 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const kakuteh7miniNand: ExtendedBoardDef = {
  id: 'kakuteh7mini-nand',
  name: 'KakuteH7Mini-Nand',
  description: 'KakuteH7Mini-Nand',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-kakuteh7mini-nand.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1058,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6', 'UART7'],
  outputGroups: [
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM5', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: ['MPU6000', 'ICM42688', 'BMI270'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.1, ampPerVolt: 59.5 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const kakuteh7v2: ExtendedBoardDef = {
  id: 'kakuteh7v2',
  name: 'KakuteH7v2',
  description: 'KakuteH7v2',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-kakuteh7v2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1048,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6', 'UART7'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 3, 4, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 5, 6, 6], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 7, 8, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 17,
  builtinSensors: {
    imu: ['MPU6000', 'ICM42688', 'BMI270'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 59.5 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const khaEth: ExtendedBoardDef = {
  id: 'kha_eth',
  name: 'kha_eth',
  description: 'kha_eth',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-kha_eth.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1315,
  serialOrder: ['OTG1', 'USART1', 'USART2'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const ktFmuF1: ExtendedBoardDef = {
  id: 'kt-fmu-f1',
  name: 'KT-FMU-F1',
  description: 'KT-FMU-F1',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-kt-fmu-f1.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1250,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8, 9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: ['BMI088', 'BMI270'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 21.0, ampPerVolt: 40.2 },
  i2cBuses: 2,
  hasBuzzer: true,
  hasSafetySwitch: true,
};

export const longbowf405wing: ExtendedBoardDef = {
  id: 'longbowf405wing',
  name: 'LongBowF405WING',
  description: 'LongBowF405WING',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-longbowf405wing.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1422,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [7, 8, 9], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [10, 11, 12], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA3' },
};

export const lumenierluxf765Ndaa: ExtendedBoardDef = {
  id: 'lumenierluxf765-ndaa',
  name: 'LumenierLUXF765-NDAA',
  description: 'LumenierLUXF765-NDAA',
  manufacturer: 'Unknown',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-lumenierluxf765-ndaa.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'UART5',
    SERIAL3: 'USART3',
    SERIAL4: 'UART8',
    SERIAL5: 'USART2',
    SERIAL6: 'UART4',
    SERIAL7: 'UART7',
    SERIAL8: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 6, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 8, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 4500,
  serialOrder: ['OTG1', 'USART1', 'UART5', 'USART3', 'UART8', 'USART2', 'UART4', 'UART7', 'USART6'],
  outputGroups: [
    { outputs: [11, 12], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9, 10, 13], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 13,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 12, currPin: 13, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
};

export const luminousbee4: ExtendedBoardDef = {
  id: 'luminousbee4',
  name: 'luminousbee4',
  description: 'luminousbee4',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-luminousbee4.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'USART1',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 5, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 11,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'USART1', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 7,
  builtinSensors: {
    imu: ['BMI088'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const luminousbee5: ExtendedBoardDef = {
  id: 'luminousbee5',
  name: 'luminousbee5',
  description: 'luminousbee5',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-luminousbee5.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'USART1',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 5, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1029,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'USART1', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6, 7], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 7,
  builtinSensors: {
    imu: ['ICM42605', 'ICM42688'],
    barometer: ['DPS310'],
    compass: ['HMC5843'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 3.28, ampPerVolt: 3.06 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const mambaf4052022: ExtendedBoardDef = {
  id: 'mambaf405-2022',
  name: 'MambaF405-2022',
  description: 'MambaF405-2022',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mambaf405-2022.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1038,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [1, 1, 2, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4, 5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM8', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 11,
  builtinSensors: {
    imu: ['MPU6000', 'ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 11, currPin: 13, voltMult: 11.0, ampPerVolt: 39.0 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB7' },
};

export const mambaf405usI2c: ExtendedBoardDef = {
  id: 'mambaf405us-i2c',
  name: 'MambaF405US-I2C',
  description: 'MambaF405US-I2C',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mambaf405us-i2c.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1038,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 4,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 11, currPin: 13, voltMult: 11.0, ampPerVolt: 39.0 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB7' },
};

export const matekf405: ExtendedBoardDef = {
  id: 'matekf405',
  name: 'MatekF405',
  description: 'MatekF405',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekf405.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART3',
    SERIAL2: 'UART4',
    SERIAL3: 'USART1',
    SERIAL4: 'UART5',
    SERIAL5: 'USART2'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX3/RX3', serialIndex: 1, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 2, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 4, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 125,
  serialOrder: ['OTG1', 'USART3', 'UART4', 'USART1', 'UART5', 'USART2'],
  outputGroups: [
    { outputs: [6], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [1], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [2, 3, 4], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 15, currPin: 14, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA3' },
};

export const matekf405Bdshot: ExtendedBoardDef = {
  id: 'matekf405-bdshot',
  name: 'MatekF405-bdshot',
  description: 'MatekF405-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekf405-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART3',
    SERIAL2: 'UART4',
    SERIAL3: 'USART1',
    SERIAL4: 'UART5',
    SERIAL5: 'USART2'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX3/RX3', serialIndex: 1, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 2, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 4, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 125,
  serialOrder: ['OTG1', 'USART3', 'UART4', 'USART1', 'UART5', 'USART2'],
  outputGroups: [
    { outputs: [6, 6], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [1], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4, 4], timer: 'TIM8', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 15, currPin: 14, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA3' },
};

export const matekf405Can: ExtendedBoardDef = {
  id: 'matekf405-can',
  name: 'MatekF405-CAN',
  description: 'MatekF405-CAN',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekf405-can.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART5',
    SERIAL5: 'USART2'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 4, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1014,
  serialOrder: ['OTG1', 'USART1', 'USART3', 'UART4', 'UART5', 'USART2'],
  outputGroups: [
    { outputs: [9], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: ['ICM20602'],
    barometer: [],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 21.0, ampPerVolt: 40.0 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA3' },
};

export const matekf405TeBdshot: ExtendedBoardDef = {
  id: 'matekf405-te-bdshot',
  name: 'MatekF405-TE-bdshot',
  description: 'MatekF405-TE-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekf405-te-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART3',
    SERIAL3: 'UART5',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'USART2'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 3, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 6, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1054,
  serialOrder: ['OTG1', 'USART1', 'USART3', 'UART5', 'UART4', 'USART6', 'USART2'],
  outputGroups: [
    { outputs: [3, 4, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [3, 9], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [10], timer: 'TIM13', capabilities: ['PWM'] },
    { outputs: [5, 5, 6, 6, 7, 7, 8, 8], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [12], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [11], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 1, 2, 2], timer: 'TIM8', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 20,
  builtinSensors: {
    imu: ['ICM42605'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 21.0, ampPerVolt: 66.7 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA3' },
};

export const matekf405WingBdshot: ExtendedBoardDef = {
  id: 'matekf405-wing-bdshot',
  name: 'MatekF405-Wing-bdshot',
  description: 'MatekF405-Wing-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekf405-wing-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6',
    SERIAL7: 'USART2'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 7, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 127,
  serialOrder: ['OTG1', 'USART1', 'EMPTY', 'USART3', 'UART4', 'UART5', 'USART6', 'USART2'],
  outputGroups: [
    { outputs: [7, 8, 9], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [10], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 3, 4, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 1, 2, 2], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 5, 6, 6], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 16,
  builtinSensors: {
    imu: ['MPU6000', 'ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 31.7 },
  i2cBuses: 2,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA3' },
};

export const matekf765Se: ExtendedBoardDef = {
  id: 'matekf765-se',
  name: 'MatekF765-SE',
  description: 'MatekF765-SE',
  manufacturer: 'Unknown',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekf765-se.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'USART1',
    SERIAL3: 'USART2',
    SERIAL4: 'USART3',
    SERIAL5: 'UART8',
    SERIAL7: 'USART6',
    SERIAL8: 'UART5'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 2, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 3, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 4, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 7, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 8, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 9, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 143,
  serialOrder: ['OTG1', 'UART7', 'USART1', 'USART2', 'USART3', 'UART8', 'EMPTY', 'USART6', 'UART5', 'OTG2'],
  outputGroups: [
    { outputs: [13], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 1, 2, 2], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8, 9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 3, 4, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM8', capabilities: ['PWM', 'DShot'] },
    { outputs: [11, 12], timer: 'TIM9', capabilities: ['PWM'] }
  ],
  pwmOutputCount: 17,
  builtinSensors: {
    imu: ['MPU6000', 'ICM20602', 'ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 12, currPin: 13, voltMult: 21.0, ampPerVolt: 66.7 },
  i2cBuses: 2,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const matekf765WingBdshot: ExtendedBoardDef = {
  id: 'matekf765-wing-bdshot',
  name: 'MatekF765-Wing-bdshot',
  description: 'MatekF765-Wing-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekf765-wing-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'USART1',
    SERIAL3: 'USART2',
    SERIAL4: 'USART3',
    SERIAL5: 'UART8',
    SERIAL6: 'UART4',
    SERIAL7: 'USART6',
    SERIAL8: 'UART5'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 2, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 3, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 4, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 6, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 7, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 8, uartName: 'UART5', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 143,
  serialOrder: ['OTG1', 'UART7', 'USART1', 'USART2', 'USART3', 'UART8', 'UART4', 'USART6', 'UART5'],
  outputGroups: [
    { outputs: [13], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 1, 2, 2], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8, 9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 3, 4, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM8', capabilities: ['PWM', 'DShot'] },
    { outputs: [11, 12], timer: 'TIM9', capabilities: ['PWM'] }
  ],
  pwmOutputCount: 17,
  builtinSensors: {
    imu: ['MPU6000', 'ICM20602'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 12, currPin: 13, voltMult: 11.0, ampPerVolt: 40.0 },
  i2cBuses: 2,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const matekg474Dshot: ExtendedBoardDef = {
  id: 'matekg474-dshot',
  name: 'MatekG474-DShot',
  description: 'MatekG474-DShot',
  manufacturer: 'Unknown',
  mcu: 'STM32G474xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekg474-dshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1170,
  serialOrder: ['EMPTY', 'USART1', 'USART2', 'USART3', 'UART4'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [11], timer: 'TIM5', capabilities: ['PWM', 'DShot'] },
    { outputs: [9, 10], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 11,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 2,
};

export const matekg474Gps: ExtendedBoardDef = {
  id: 'matekg474-gps',
  name: 'MatekG474-GPS',
  description: 'MatekG474-GPS',
  manufacturer: 'Unknown',
  mcu: 'STM32G474xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekg474-gps.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1170,
  serialOrder: ['EMPTY', 'USART1', 'USART2', 'USART3', 'UART4'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 2,
};

export const matekg474Periph: ExtendedBoardDef = {
  id: 'matekg474-periph',
  name: 'MatekG474-Periph',
  description: 'MatekG474-Periph',
  manufacturer: 'Unknown',
  mcu: 'STM32G474xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekg474-periph.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1170,
  serialOrder: ['EMPTY', 'USART1', 'USART2', 'USART3', 'UART4'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 2,
};

export const matekh743Bdshot: ExtendedBoardDef = {
  id: 'matekh743-bdshot',
  name: 'MatekH743-bdshot',
  description: 'MatekH743-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekh743-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'USART1',
    SERIAL3: 'USART2',
    SERIAL4: 'USART3',
    SERIAL5: 'UART8',
    SERIAL6: 'UART4',
    SERIAL7: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 2, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 3, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 4, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 6, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 7, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1013,
  serialOrder: ['OTG1', 'UART7', 'USART1', 'USART2', 'USART3', 'UART8', 'UART4', 'USART6', 'OTG2'],
  outputGroups: [
    { outputs: [13], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [11, 11, 12, 12], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 7, 8, 8, 9, 9, 10, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [3, 4, 5, 5, 6, 6], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 25,
  builtinSensors: {
    imu: ['ICM42688', 'MPU6000', 'ICM20602', 'ICM42605'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 40.0 },
  i2cBuses: 2,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const matekh743Periph: ExtendedBoardDef = {
  id: 'matekh743-periph',
  name: 'MatekH743-periph',
  description: 'MatekH743-periph',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekh743-periph.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'USART1',
    SERIAL3: 'USART2',
    SERIAL4: 'USART3',
    SERIAL5: 'UART8',
    SERIAL6: 'UART4',
    SERIAL7: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 2, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 3, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 4, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 6, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 7, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1013,
  serialOrder: ['OTG1', 'UART7', 'USART1', 'USART2', 'USART3', 'UART8', 'UART4', 'USART6', 'OTG2'],
  outputGroups: [
    { outputs: [13], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [11, 12], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [7, 8, 9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4, 5, 6], timer: 'TIM5', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 13,
  builtinSensors: {
    imu: ['ICM42688', 'MPU6000', 'ICM20602', 'ICM42605'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 40.0 },
  i2cBuses: 2,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const matekh7a3: ExtendedBoardDef = {
  id: 'matekh7a3',
  name: 'MatekH7A3',
  description: 'MatekH7A3',
  manufacturer: 'Unknown',
  mcu: 'STM32H7A3xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekh7a3.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1149,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [11], timer: 'TIM16', capabilities: ['PWM'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 11,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 21.0, ampPerVolt: 40.0 },
  i2cBuses: 1,
};

export const matekh7a3Wing: ExtendedBoardDef = {
  id: 'matekh7a3-wing',
  name: 'MatekH7A3-Wing',
  description: 'MatekH7A3-Wing',
  manufacturer: 'Unknown',
  mcu: 'STM32H7A3xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekh7a3-wing.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1228,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [11], timer: 'TIM16', capabilities: ['PWM'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 11,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 21.0, ampPerVolt: 40.0 },
  i2cBuses: 1,
};

export const matekl431Adsb: ExtendedBoardDef = {
  id: 'matekl431-adsb',
  name: 'MatekL431-ADSB',
  description: 'MatekL431-ADSB',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekl431-adsb.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'USART2',
    SERIAL2: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1062,
  serialOrder: ['USART1', 'USART2', 'USART3'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const matekl431Airspeed: ExtendedBoardDef = {
  id: 'matekl431-airspeed',
  name: 'MatekL431-Airspeed',
  description: 'MatekL431-Airspeed',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekl431-airspeed.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'USART2',
    SERIAL2: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1062,
  serialOrder: ['USART1', 'USART2', 'USART3'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const matekl431Apdtelem: ExtendedBoardDef = {
  id: 'matekl431-apdtelem',
  name: 'MatekL431-APDTelem',
  description: 'MatekL431-APDTelem',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekl431-apdtelem.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'USART2',
    SERIAL2: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1062,
  serialOrder: ['USART1', 'USART2', 'USART3'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5], timer: 'TIM2', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 5,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const matekl431Auav: ExtendedBoardDef = {
  id: 'matekl431-auav',
  name: 'MatekL431-AUAV',
  description: 'MatekL431-AUAV',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekl431-auav.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'USART2',
    SERIAL2: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1062,
  serialOrder: ['USART1', 'USART2', 'USART3'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const matekl431Batterytag: ExtendedBoardDef = {
  id: 'matekl431-batterytag',
  name: 'MatekL431-BatteryTag',
  description: 'MatekL431-BatteryTag',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekl431-batterytag.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'USART2',
    SERIAL2: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1062,
  serialOrder: ['USART1', 'USART2', 'USART3'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const matekl431Battmon: ExtendedBoardDef = {
  id: 'matekl431-battmon',
  name: 'MatekL431-BattMon',
  description: 'MatekL431-BattMon',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekl431-battmon.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'USART2',
    SERIAL2: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1062,
  serialOrder: ['USART1', 'USART2', 'USART3'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const matekl431Bdshot: ExtendedBoardDef = {
  id: 'matekl431-bdshot',
  name: 'MatekL431-bdshot',
  description: 'MatekL431-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekl431-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL2: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1062,
  serialOrder: ['USART1', 'EMPTY', 'USART3'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9], timer: 'TIM16', capabilities: ['PWM'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM2', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const matekl431Dshot: ExtendedBoardDef = {
  id: 'matekl431-dshot',
  name: 'MatekL431-DShot',
  description: 'MatekL431-DShot',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekl431-dshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL2: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1062,
  serialOrder: ['USART1', 'EMPTY', 'USART3'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [9], timer: 'TIM16', capabilities: ['PWM'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM2', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const matekl431Efi: ExtendedBoardDef = {
  id: 'matekl431-efi',
  name: 'MatekL431-EFI',
  description: 'MatekL431-EFI',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekl431-efi.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'USART2',
    SERIAL2: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1062,
  serialOrder: ['USART1', 'USART2', 'USART3'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const matekl431Gps: ExtendedBoardDef = {
  id: 'matekl431-gps',
  name: 'MatekL431-GPS',
  description: 'MatekL431-GPS',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekl431-gps.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1062,
  serialOrder: ['EMPTY', 'USART2', 'USART3'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const matekl431Hwtelem: ExtendedBoardDef = {
  id: 'matekl431-hwtelem',
  name: 'MatekL431-HWTelem',
  description: 'MatekL431-HWTelem',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekl431-hwtelem.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'USART2',
    SERIAL2: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1062,
  serialOrder: ['USART1', 'USART2', 'USART3'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const matekl431Maghires: ExtendedBoardDef = {
  id: 'matekl431-maghires',
  name: 'MatekL431-MagHiRes',
  description: 'MatekL431-MagHiRes',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekl431-maghires.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'USART2',
    SERIAL2: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1062,
  serialOrder: ['USART1', 'USART2', 'USART3'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const matekl431Periph: ExtendedBoardDef = {
  id: 'matekl431-periph',
  name: 'MatekL431-Periph',
  description: 'MatekL431-Periph',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekl431-periph.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'USART2',
    SERIAL2: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1062,
  serialOrder: ['USART1', 'USART2', 'USART3'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5], timer: 'TIM2', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 5,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 5, currPin: 6, voltMult: 21.0, ampPerVolt: 40.0 },
  i2cBuses: 1,
};

export const matekl431Proximity: ExtendedBoardDef = {
  id: 'matekl431-proximity',
  name: 'MatekL431-Proximity',
  description: 'MatekL431-Proximity',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekl431-proximity.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'USART2',
    SERIAL2: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1062,
  serialOrder: ['USART1', 'USART2', 'USART3'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const matekl431Rangefinder: ExtendedBoardDef = {
  id: 'matekl431-rangefinder',
  name: 'MatekL431-Rangefinder',
  description: 'MatekL431-Rangefinder',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekl431-rangefinder.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'USART2',
    SERIAL2: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1062,
  serialOrder: ['USART1', 'USART2', 'USART3'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const matekl431Rc: ExtendedBoardDef = {
  id: 'matekl431-rc',
  name: 'MatekL431-RC',
  description: 'MatekL431-RC',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekl431-rc.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'USART2',
    SERIAL2: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1062,
  serialOrder: ['USART1', 'USART2', 'USART3'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 4,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const matekl431Serial: ExtendedBoardDef = {
  id: 'matekl431-serial',
  name: 'MatekL431-Serial',
  description: 'MatekL431-Serial',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekl431-serial.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1062,
  serialOrder: ['EMPTY', 'USART1', 'USART2', 'USART3'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const mazzystardrone: ExtendedBoardDef = {
  id: 'mazzystardrone',
  name: 'MazzyStarDrone',
  description: 'MazzyStarDrone',
  manufacturer: 'Unknown',
  mcu: 'STM32F745xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mazzystardrone.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'UART4',
    SERIAL4: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 4, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 188,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'UART4', 'USART3'],
  outputGroups: [
    { outputs: [2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 5], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [6], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['ICM20689', 'BMI055'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const mfeAirspeedCan: ExtendedBoardDef = {
  id: 'mfe_airspeed_can',
  name: 'MFE_AirSpeed_CAN',
  description: 'MFE_AirSpeed_CAN',
  manufacturer: 'Unknown',
  mcu: 'STM32F103xB',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mfe_airspeed_can.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL3: 'USART2'
  },
  uartPorts: [
    { padLabel: 'TX2/RX2', serialIndex: 3, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 6103,
  serialOrder: ['EMPTY', 'EMPTY', 'EMPTY', 'USART2'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const mfePdbCan: ExtendedBoardDef = {
  id: 'mfe_pdb_can',
  name: 'MFE_PDB_CAN',
  description: 'MFE_PDB_CAN',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mfe_pdb_can.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'USART2',
    SERIAL2: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 6100,
  serialOrder: ['USART1', 'USART2', 'USART3'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 5, currPin: 6, voltMult: 17.93387, ampPerVolt: 22.0 },
};

export const mfePos3Can: ExtendedBoardDef = {
  id: 'mfe_pos3_can',
  name: 'MFE_POS3_CAN',
  description: 'MFE_POS3_CAN',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mfe_pos3_can.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'USART2'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 6101,
  serialOrder: ['USART1', 'USART2'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const mftSema100: ExtendedBoardDef = {
  id: 'mft-sema100',
  name: 'MFT-SEMA100',
  description: 'MFT-SEMA100',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mft-sema100.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART5',
    SERIAL5: 'UART7',
    SERIAL6: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 4, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 6, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 2000,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART5', 'UART7', 'UART8', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [11, 12], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM5', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['BMI088'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 19, currPin: 8, voltMult: 10.0, ampPerVolt: 10.0 },
  i2cBuses: 4,
};

export const micoair405mini: ExtendedBoardDef = {
  id: 'micoair405mini',
  name: 'MicoAir405Mini',
  description: 'MicoAir405Mini',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-micoair405mini.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1161,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [9], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: ['BMI270'],
    barometer: ['DPS310'],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 21.2, ampPerVolt: 40.2 },
  i2cBuses: 1,
};

export const micoair405v2: ExtendedBoardDef = {
  id: 'micoair405v2',
  name: 'MicoAir405v2',
  description: 'MicoAir405v2',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-micoair405v2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1150,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [9, 10], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: ['BMI088'],
    barometer: ['SPL06'],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 21.2, ampPerVolt: 40.2 },
  i2cBuses: 1,
};

export const micoair743: ExtendedBoardDef = {
  id: 'micoair743',
  name: 'MicoAir743',
  description: 'MicoAir743',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-micoair743.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'UART7',
    SERIAL7: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 7, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1166,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8, 9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: ['BMI088', 'BMI270'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 21.12, ampPerVolt: 40.2 },
  i2cBuses: 2,
};

export const micoair743Aio: ExtendedBoardDef = {
  id: 'micoair743-aio',
  name: 'MicoAir743-AIO',
  description: 'MicoAir743-AIO',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-micoair743-aio.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'UART7',
    SERIAL7: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 7, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1176,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8, 9], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: ['BMI088', 'BMI270'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 21.12, ampPerVolt: 14.14 },
  i2cBuses: 2,
  hasBuzzer: true,
};

export const micoair743Lite: ExtendedBoardDef = {
  id: 'micoair743-lite',
  name: 'MicoAir743-Lite',
  description: 'MicoAir743-Lite',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-micoair743-lite.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1202,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [13, 14], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [9, 10], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [11, 12, 15], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 15,
  builtinSensors: {
    imu: ['ICM45686'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 21.12, ampPerVolt: 40.2 },
  i2cBuses: 2,
  hasBuzzer: true,
};

export const micoair743v2: ExtendedBoardDef = {
  id: 'micoair743v2',
  name: 'MicoAir743v2',
  description: 'MicoAir743v2',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-micoair743v2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1179,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9, 10], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8, 11], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 11,
  builtinSensors: {
    imu: ['BMI088', 'BMI270'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 21.12, ampPerVolt: 40.2 },
  i2cBuses: 2,
  hasBuzzer: true,
};

export const mindpxV2: ExtendedBoardDef = {
  id: 'mindpx-v2',
  name: 'mindpx-v2',
  description: 'mindpx-v2',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mindpx-v2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'USART1',
    SERIAL6: 'UART7',
    SERIAL7: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 5, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 7, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 88,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'USART1', 'UART7', 'USART6'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [13, 14, 15, 16], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [9, 10, 11, 12], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 16,
  builtinSensors: {
    imu: ['MPU6500'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 12, currPin: 10, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC6' },
};

export const miniPix: ExtendedBoardDef = {
  id: 'mini-pix',
  name: 'mini-pix',
  description: 'mini-pix',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mini-pix.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART3',
    SERIAL2: 'USART2',
    SERIAL3: 'UART4'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX3/RX3', serialIndex: 1, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 3,
  serialOrder: ['OTG1', 'USART3', 'USART2', 'UART4'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: ['LPS22H'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 12.1, ampPerVolt: 43.0 },
  i2cBuses: 2,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const modalaiFcV1: ExtendedBoardDef = {
  id: 'modalai_fc-v1',
  name: 'modalai_fc-v1',
  description: 'modalai_fc-v1',
  manufacturer: 'Unknown',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-modalai_fc-v1.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'USART2',
    SERIAL6: 'USART6',
    SERIAL7: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 7, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 41775,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART4', 'USART2', 'USART6', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM42688', 'ICM20602'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const morakot: ExtendedBoardDef = {
  id: 'morakot',
  name: 'Morakot',
  description: 'Morakot',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-morakot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART5',
    SERIAL5: 'USART6',
    SERIAL6: 'UART7',
    SERIAL7: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 4, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 7, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1210,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART5', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const mroM10095: ExtendedBoardDef = {
  id: 'mro-m10095',
  name: 'mRo-M10095',
  description: 'mRo-M10095',
  manufacturer: 'Unknown',
  mcu: 'STM32G491xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mro-m10095.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1041,
  serialOrder: ['USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const mrocanpwmM10126: ExtendedBoardDef = {
  id: 'mrocanpwm-m10126',
  name: 'mRoCANPWM-M10126',
  description: 'mRoCANPWM-M10126',
  manufacturer: 'Unknown',
  mcu: 'STM32G474xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mrocanpwm-m10126.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1098,
  serialOrder: ['USART1'],
  outputGroups: [
    { outputs: [6, 7, 8], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [9, 10, 11, 12], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
};

export const mrocontrolzeroclassic: ExtendedBoardDef = {
  id: 'mrocontrolzeroclassic',
  name: 'mRoControlZeroClassic',
  description: 'mRoControlZeroClassic',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mrocontrolzeroclassic.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART7',
    SERIAL5: 'UART8',
    SERIAL6: 'USART1'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 4, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 6, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1022,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART7', 'UART8', 'USART1', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [10], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [7, 8, 9], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 12], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [11], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['BMI088', 'ICM20608', 'ICM20948'],
    barometer: ['DPS310'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 4, currPin: 15, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const mrocontrolzerof7: ExtendedBoardDef = {
  id: 'mrocontrolzerof7',
  name: 'mRoControlZeroF7',
  description: 'mRoControlZeroF7',
  manufacturer: 'Unknown',
  mcu: 'STM32F777xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mrocontrolzerof7.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 141,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['BMI088', 'ICM20608', 'ICM20948'],
    barometer: ['DPS310'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const mrocontrolzeroh7Bdshot: ExtendedBoardDef = {
  id: 'mrocontrolzeroh7-bdshot',
  name: 'mRoControlZeroH7-bdshot',
  description: 'mRoControlZeroH7-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mrocontrolzeroh7-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1023,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 1, 2, 2, 3, 3, 4, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 5, 6, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 7, 8, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 16,
  builtinSensors: {
    imu: ['BMI088', 'ICM20608', 'ICM20948'],
    barometer: ['DPS310'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const mrocontrolzerooemh7: ExtendedBoardDef = {
  id: 'mrocontrolzerooemh7',
  name: 'mRoControlZeroOEMH7',
  description: 'mRoControlZeroOEMH7',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mrocontrolzerooemh7.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1024,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['BMI088', 'ICM20608', 'ICM20948'],
    barometer: ['DPS310'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 3,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const mroczerooemh7Bdshot: ExtendedBoardDef = {
  id: 'mroczerooemh7-bdshot',
  name: 'mRoCZeroOEMH7-bdshot',
  description: 'mRoCZeroOEMH7-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mroczerooemh7-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1024,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 1, 2, 2, 3, 3, 4, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 5, 6, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 7, 8, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 16,
  builtinSensors: {
    imu: ['BMI088', 'ICM20608', 'ICM20948'],
    barometer: ['DPS310'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 3,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const mrokitcanrevc: ExtendedBoardDef = {
  id: 'mrokitcanrevc',
  name: 'mRoKitCANrevC',
  description: 'mRoKitCANrevC',
  manufacturer: 'Unknown',
  mcu: 'STM32F303xC',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mrokitcanrevc.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART2',
    SERIAL3: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX2/RX2', serialIndex: 0, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1145,
  serialOrder: ['USART2', 'EMPTY', 'EMPTY', 'USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const mronexus: ExtendedBoardDef = {
  id: 'mronexus',
  name: 'mRoNexus',
  description: 'mRoNexus',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mronexus.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL3: 'UART4'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 2, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1015,
  serialOrder: ['OTG1', 'UART7', 'OTG2', 'UART4'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: ['ADIS16470', 'ICM40609'],
    barometer: ['DPS310'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 1,
};

export const mropixracerproBdshot: ExtendedBoardDef = {
  id: 'mropixracerpro-bdshot',
  name: 'mRoPixracerPro-bdshot',
  description: 'mRoPixracerPro-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mropixracerpro-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'USART1',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 5, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1017,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'USART1', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 1, 2, 3, 4, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: ['ICM20948', 'ICM20608', 'BMI088'],
    barometer: ['DPS310'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const mrox21: ExtendedBoardDef = {
  id: 'mrox21',
  name: 'mRoX21',
  description: 'mRoX21',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mrox21.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 9,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000', 'ICM20608', 'MPU9250', 'ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: ['HMC5843'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const mrox21777: ExtendedBoardDef = {
  id: 'mrox21-777',
  name: 'mRoX21-777',
  description: 'mRoX21-777',
  manufacturer: 'Unknown',
  mcu: 'STM32F777xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mrox21-777.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 136,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['ICM20608', 'MPU9250'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  hasSafetySwitch: true,
};

export const mupilot: ExtendedBoardDef = {
  id: 'mupilot',
  name: 'MUPilot',
  description: 'MUPilot',
  manufacturer: 'Unknown',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-mupilot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1222,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'USART1', 'UART4', 'USART6', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM20689', 'ICM20602', 'BMI055', 'ICM42688'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 0, currPin: 1, voltMult: 18.0, ampPerVolt: 24.0 },
  i2cBuses: 4,
  hasSafetySwitch: true,
};

export const narinfcH5: ExtendedBoardDef = {
  id: 'narinfc-h5',
  name: 'NarinFC-H5',
  description: 'NarinFC-H5',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-narinfc-h5.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART6',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'UART8',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 2, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1188,
  serialOrder: ['OTG1', 'USART2', 'USART6', 'USART1', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [9, 10, 11, 12], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [13, 14], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 14,
  builtinSensors: {
    imu: ['ADIS16470', 'ICM20689', 'BMI088', 'ICM42688', 'ICM45686'],
    barometer: ['MS5611'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB4' },
};

export const narinfcH7: ExtendedBoardDef = {
  id: 'narinfc-h7',
  name: 'NarinFC-H7',
  description: 'NarinFC-H7',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-narinfc-h7.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART6',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'UART8',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 2, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1183,
  serialOrder: ['OTG1', 'USART2', 'USART6', 'USART1', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [9, 10, 11, 12], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [13, 14], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 14,
  builtinSensors: {
    imu: ['ADIS16470', 'ICM20689', 'BMI088', 'ICM42688'],
    barometer: ['MS5611'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB4' },
};

export const narinfcX3: ExtendedBoardDef = {
  id: 'narinfc-x3',
  name: 'NarinFC-X3',
  description: 'NarinFC-X3',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-narinfc-x3.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 9, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1199,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6', 'UART7', 'UART8', 'OTG2'],
  outputGroups: [
    { outputs: [13], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [11, 12], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8, 9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 13,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 40.0 },
  i2cBuses: 2,
  hasBuzzer: true,
};

export const nucleoG491: ExtendedBoardDef = {
  id: 'nucleo-g491',
  name: 'Nucleo-G491',
  description: 'Nucleo-G491',
  manufacturer: 'Unknown',
  mcu: 'STM32G491xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-nucleo-g491.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1040,
  serialOrder: ['USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const nucleoL476: ExtendedBoardDef = {
  id: 'nucleo-l476',
  name: 'Nucleo-L476',
  description: 'Nucleo-L476',
  manufacturer: 'Unknown',
  mcu: 'STM32L476xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-nucleo-l476.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1051,
  serialOrder: ['USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const nucleoL496: ExtendedBoardDef = {
  id: 'nucleo-l496',
  name: 'Nucleo-L496',
  description: 'Nucleo-L496',
  manufacturer: 'Unknown',
  mcu: 'STM32L496xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-nucleo-l496.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1047,
  serialOrder: ['OTG1', 'USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const nucleoh743: ExtendedBoardDef = {
  id: 'nucleoh743',
  name: 'NucleoH743',
  description: 'NucleoH743',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-nucleoh743.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL3: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 3, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 139,
  serialOrder: ['OTG1', 'EMPTY', 'EMPTY', 'UART7'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
};

export const nucleoh753zi: ExtendedBoardDef = {
  id: 'nucleoh753zi',
  name: 'NucleoH753ZI',
  description: 'NucleoH753ZI',
  manufacturer: 'Unknown',
  mcu: 'STM32H753xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-nucleoh753zi.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1207,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [1, 2, 3, 4, 14, 15], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [13], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8, 9, 10], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 13,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const nucleoh755: ExtendedBoardDef = {
  id: 'nucleoh755',
  name: 'NucleoH755',
  description: 'NucleoH755',
  manufacturer: 'Unknown',
  mcu: 'STM32H757xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-nucleoh755.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'UART7',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 2, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 139,
  serialOrder: ['OTG1', 'USART2', 'UART7', 'USART1', 'UART4', 'UART5'],
  outputGroups: [
    { outputs: [3, 12], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [10, 11], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [2, 4, 5], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [6, 7, 8, 9], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['ICM20948'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 1,
};

export const omnibusf4: ExtendedBoardDef = {
  id: 'omnibusf4',
  name: 'omnibusf4',
  description: 'omnibusf4',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-omnibusf4.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART3',
    SERIAL3: 'USART6',
    SERIAL4: 'UART4'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 3, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1002,
  serialOrder: ['OTG1', 'USART1', 'USART3', 'USART6', 'UART4'],
  outputGroups: [
    { outputs: [1, 2, 6], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4, 5], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['BMI270', 'MPU6000'],
    barometer: ['BMP280'],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 11.0, ampPerVolt: 18.2 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB8' },
};

export const omnibusf4proBdshot: ExtendedBoardDef = {
  id: 'omnibusf4pro-bdshot',
  name: 'omnibusf4pro-bdshot',
  description: 'omnibusf4pro-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-omnibusf4pro-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART3',
    SERIAL3: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 3, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 131,
  serialOrder: ['OTG1', 'USART1', 'USART3', 'USART6'],
  outputGroups: [
    { outputs: [1, 2, 6], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 3, 4, 4, 5], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['BMI270', 'MPU6000'],
    barometer: ['BMP280'],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 11.0, ampPerVolt: 18.2 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB8' },
};

export const omnibusf4proOne: ExtendedBoardDef = {
  id: 'omnibusf4pro-one',
  name: 'omnibusf4pro-one',
  description: 'omnibusf4pro-one',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-omnibusf4pro-one.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART3',
    SERIAL3: 'USART6',
    SERIAL4: 'UART4'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 3, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 131,
  serialOrder: ['OTG1', 'USART1', 'USART3', 'USART6', 'UART4'],
  outputGroups: [
    { outputs: [1, 2, 6], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4, 5], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['BMI270', 'MPU6000'],
    barometer: ['BMP280'],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 11.0, ampPerVolt: 18.2 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB8' },
};

export const omnibusf4v6: ExtendedBoardDef = {
  id: 'omnibusf4v6',
  name: 'omnibusf4v6',
  description: 'omnibusf4v6',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-omnibusf4v6.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'UART4',
    SERIAL3: 'USART6',
    SERIAL4: 'USART3',
    SERIAL5: 'USART2'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 2, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 3, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 4, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 137,
  serialOrder: ['OTG1', 'USART1', 'UART4', 'USART6', 'USART3', 'USART2'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [4], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: ['BMP280'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 11.0, ampPerVolt: 18.2 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB6' },
};

export const omnibusf7v2: ExtendedBoardDef = {
  id: 'omnibusf7v2',
  name: 'OMNIBUSF7V2',
  description: 'OMNIBUSF7V2',
  manufacturer: 'Unknown',
  mcu: 'STM32F745xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-omnibusf7v2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART3',
    SERIAL3: 'USART6',
    SERIAL4: 'USART2',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 3, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 4, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 121,
  serialOrder: ['OTG1', 'USART1', 'USART3', 'USART6', 'USART2', 'UART7'],
  outputGroups: [
    { outputs: [3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 4,
  builtinSensors: {
    imu: ['MPU6000', 'MPU6500'],
    barometer: ['BMP280'],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA3' },
};

export const omnibusnanov6: ExtendedBoardDef = {
  id: 'omnibusnanov6',
  name: 'OmnibusNanoV6',
  description: 'OmnibusNanoV6',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-omnibusnanov6.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'UART4',
    SERIAL3: 'USART6',
    SERIAL4: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 2, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 3, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 4, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 133,
  serialOrder: ['OTG1', 'USART1', 'UART4', 'USART6', 'USART3'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [4], timer: 'TIM3', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 4,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: ['BMP280'],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 11.0, ampPerVolt: 18.2 },
  i2cBuses: 2,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB6' },
};

export const omnibusnanov6Bdshot: ExtendedBoardDef = {
  id: 'omnibusnanov6-bdshot',
  name: 'OmnibusNanoV6-bdshot',
  description: 'OmnibusNanoV6-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-omnibusnanov6-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'UART4',
    SERIAL3: 'USART6',
    SERIAL4: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 2, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 3, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 4, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 133,
  serialOrder: ['OTG1', 'USART1', 'UART4', 'USART6', 'USART3'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 3], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 4, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: ['BMP280'],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 11.0, ampPerVolt: 18.2 },
  i2cBuses: 2,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB6' },
};

export const orbith743: ExtendedBoardDef = {
  id: 'orbith743',
  name: 'ORBITH743',
  description: 'ORBITH743',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-orbith743.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1191,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [13], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [9, 10], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [11, 12], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 13,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 10.1, ampPerVolt: 80.0 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const orqaf405pro: ExtendedBoardDef = {
  id: 'orqaf405pro',
  name: 'OrqaF405Pro',
  description: 'OrqaF405Pro',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-orqaf405pro.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL3: 'USART3',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1155,
  serialOrder: ['OTG1', 'USART1', 'EMPTY', 'USART3', 'EMPTY', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [1, 4, 5, 6], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [2, 3], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 11, currPin: 13, voltMult: 8.3, ampPerVolt: 92.6 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA10' },
};

export const orqah7quadcore: ExtendedBoardDef = {
  id: 'orqah7quadcore',
  name: 'OrqaH7QuadCore',
  description: 'OrqaH7QuadCore',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-orqah7quadcore.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL3: 'USART3',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 9, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1204,
  serialOrder: ['OTG1', 'EMPTY', 'EMPTY', 'USART3', 'EMPTY', 'EMPTY', 'USART6', 'UART7', 'UART8', 'OTG2'],
  outputGroups: [
    { outputs: [9, 10], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 92.6 },
  i2cBuses: 2,
};

export const ph4Mini: ExtendedBoardDef = {
  id: 'ph4-mini',
  name: 'PH4-mini',
  description: 'PH4-mini',
  manufacturer: 'Unknown',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-ph4-mini.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'UART4',
    SERIAL3: 'USART1',
    SERIAL4: 'USART6',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 2, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 4, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 50,
  serialOrder: ['OTG1', 'USART2', 'UART4', 'USART1', 'USART6', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [9, 10, 11], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 11,
  builtinSensors: {
    imu: ['ICM20689', 'ICM20602', 'BMI055'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 0, currPin: 1, voltMult: 18.182, ampPerVolt: 36.364 },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const ph4MiniBdshot: ExtendedBoardDef = {
  id: 'ph4-mini-bdshot',
  name: 'PH4-mini-bdshot',
  description: 'PH4-mini-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-ph4-mini-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'UART4',
    SERIAL3: 'USART1',
    SERIAL4: 'USART6',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 2, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 4, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 50,
  serialOrder: ['OTG1', 'USART2', 'UART4', 'USART1', 'USART6', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 2, 3, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [9, 10, 11], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 13,
  builtinSensors: {
    imu: ['ICM20689', 'ICM20602', 'BMI055'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 0, currPin: 1, voltMult: 18.182, ampPerVolt: 36.364 },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const pix32v5: ExtendedBoardDef = {
  id: 'pix32v5',
  name: 'Pix32v5',
  description: 'Pix32v5',
  manufacturer: 'Unknown',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pix32v5.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 50,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'USART1', 'UART4', 'USART6', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM20689', 'ICM20602', 'BMI055'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 0, currPin: 1, voltMult: 18.0, ampPerVolt: 24.0 },
  i2cBuses: 4,
  hasSafetySwitch: true,
};

export const pixc4Jetson: ExtendedBoardDef = {
  id: 'pixc4-jetson',
  name: 'PixC4-Jetson',
  description: 'PixC4-Jetson',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixc4-jetson.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1032,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'USART1', 'UART4', 'USART6', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM42688', 'ICM20602'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
};

export const pixflamingo: ExtendedBoardDef = {
  id: 'pixflamingo',
  name: 'PixFlamingo',
  description: 'PixFlamingo',
  manufacturer: 'Unknown',
  mcu: 'STM32L4R5xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixflamingo.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART3',
    SERIAL2: 'USART1',
    SERIAL3: 'UART4'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX3/RX3', serialIndex: 1, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 2, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1090,
  serialOrder: ['OTG1', 'USART3', 'USART1', 'UART4'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [9], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: ['ICM42670'],
    barometer: ['MS5611'],
    compass: ['LIS3MDL'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 1, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC6' },
};

export const pixflamingoF767: ExtendedBoardDef = {
  id: 'pixflamingo-f767',
  name: 'PixFlamingo-F767',
  description: 'PixFlamingo-F767',
  manufacturer: 'Unknown',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixflamingo-f767.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART3',
    SERIAL2: 'USART6',
    SERIAL3: 'USART1',
    SERIAL5: 'UART7',
    SERIAL6: 'USART2'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX3/RX3', serialIndex: 1, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 2, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 6, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1131,
  serialOrder: ['OTG1', 'USART3', 'USART6', 'USART1', 'EMPTY', 'UART7', 'USART2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [9], timer: 'TIM10', capabilities: ['PWM'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM5', capabilities: ['PWM', 'DShot'] },
    { outputs: [10], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: ['ICM42670', 'MPU6500'],
    barometer: ['MS5611', 'BMP280', 'DPS310'],
    compass: ['LIS3MDL'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 11, currPin: 10, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB0' },
};

export const pixhawk11m: ExtendedBoardDef = {
  id: 'pixhawk1-1m',
  name: 'Pixhawk1-1M',
  description: 'Pixhawk1-1M',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixhawk1-1m.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 9,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000', 'ICM20608', 'MPU9250', 'ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: ['HMC5843'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const pixhawk11mBdshot: ExtendedBoardDef = {
  id: 'pixhawk1-1m-bdshot',
  name: 'Pixhawk1-1M-bdshot',
  description: 'Pixhawk1-1M-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixhawk1-1m-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 9,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000', 'ICM20608', 'MPU9250', 'ICM20948'],
    barometer: ['MS5611'],
    compass: ['HMC5843'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const pixhawk1Bdshot: ExtendedBoardDef = {
  id: 'pixhawk1-bdshot',
  name: 'Pixhawk1-bdshot',
  description: 'Pixhawk1-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixhawk1-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 9,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000', 'ICM20608', 'MPU9250', 'ICM20948'],
    barometer: ['MS5611'],
    compass: ['HMC5843'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const pixhawk4Bdshot: ExtendedBoardDef = {
  id: 'pixhawk4-bdshot',
  name: 'Pixhawk4-bdshot',
  description: 'Pixhawk4-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixhawk4-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 50,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'USART1', 'UART4', 'USART6', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 2, 3, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: ['ICM20689', 'ICM20602', 'BMI055'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 0, currPin: 1, voltMult: 18.182, ampPerVolt: 36.364 },
  i2cBuses: 4,
  hasSafetySwitch: true,
};

export const pixhawk5x: ExtendedBoardDef = {
  id: 'pixhawk5x',
  name: 'Pixhawk5X',
  description: 'Pixhawk5X',
  manufacturer: 'Unknown',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixhawk5x.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART8',
    SERIAL5: 'USART2',
    SERIAL6: 'UART4',
    SERIAL7: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 6, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 7, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 51,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART8', 'USART2', 'UART4', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM20602', 'ICM42688'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const pixhawk6cBdshot: ExtendedBoardDef = {
  id: 'pixhawk6c-bdshot',
  name: 'Pixhawk6C-bdshot',
  description: 'Pixhawk6C-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixhawk6c-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART8',
    SERIAL5: 'USART2',
    SERIAL6: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 6, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 56,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART8', 'USART2', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [1, 1, 2, 2, 3, 3, 4, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 5, 6, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 7, 8, 8], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 16,
  builtinSensors: {
    imu: ['BMI055', 'ICM42688'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 8, currPin: 4, voltMult: 18.18, ampPerVolt: 36.36 },
  i2cBuses: 3,
  hasSafetySwitch: true,
};

export const pixhawk6xBdshot: ExtendedBoardDef = {
  id: 'pixhawk6x-bdshot',
  name: 'Pixhawk6X-bdshot',
  description: 'Pixhawk6X-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixhawk6x-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART8',
    SERIAL5: 'USART2',
    SERIAL6: 'UART4',
    SERIAL7: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 6, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 7, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 53,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART8', 'USART2', 'UART4', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 5, 6, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 1, 2, 2, 3, 3, 4, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 14,
  builtinSensors: {
    imu: ['BMI088', 'ICM42688', 'ICM42670', 'ADIS16470', 'IIM42652', 'ICM45686'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const pixhawk6xOdid: ExtendedBoardDef = {
  id: 'pixhawk6x-odid',
  name: 'Pixhawk6X-ODID',
  description: 'Pixhawk6X-ODID',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixhawk6x-odid.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART8',
    SERIAL5: 'USART2',
    SERIAL6: 'UART4',
    SERIAL7: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 6, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 7, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 10053,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART8', 'USART2', 'UART4', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['BMI088', 'ICM42688', 'ICM42670', 'ADIS16470', 'IIM42652', 'ICM45686'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const pixhawk6xPppgw: ExtendedBoardDef = {
  id: 'pixhawk6x-pppgw',
  name: 'Pixhawk6X-PPPGW',
  description: 'Pixhawk6X-PPPGW',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixhawk6x-pppgw.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART8',
    SERIAL5: 'USART2',
    SERIAL6: 'UART4',
    SERIAL7: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 6, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 7, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1408,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART8', 'USART2', 'UART4', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['BMI088', 'ICM42688', 'ICM42670', 'ADIS16470', 'IIM42652', 'ICM45686'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const pixpilotC3: ExtendedBoardDef = {
  id: 'pixpilot-c3',
  name: 'PixPilot-C3',
  description: 'PixPilot-C3',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixpilot-c3.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1140,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: ['BMP388'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 18.0, ampPerVolt: 24.0 },
  i2cBuses: 2,
};

export const pixpilotV3: ExtendedBoardDef = {
  id: 'pixpilot-v3',
  name: 'PixPilot-V3',
  description: 'PixPilot-V3',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixpilot-v3.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1096,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 18.0, ampPerVolt: 24.0 },
  i2cBuses: 3,
};

export const pixpilotV6: ExtendedBoardDef = {
  id: 'pixpilot-v6',
  name: 'PixPilot-V6',
  description: 'PixPilot-V6',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixpilot-v6.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1083,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 18.0, ampPerVolt: 24.0 },
  i2cBuses: 3,
  hasSafetySwitch: true,
};

export const pixpilotV6pro: ExtendedBoardDef = {
  id: 'pixpilot-v6pro',
  name: 'PixPilot-V6PRO',
  description: 'PixPilot-V6PRO',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixpilot-v6pro.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1160,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: ['BMP388'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 14, currPin: 15, voltMult: 18.0, ampPerVolt: 24.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const pixracer: ExtendedBoardDef = {
  id: 'pixracer',
  name: 'Pixracer',
  description: 'Pixracer',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixracer.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'USART1',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 5, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 11,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'USART1', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU9250', 'ICM20608'],
    barometer: ['MS5611'],
    compass: ['HMC5843', 'LIS3MDL'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const pixracerBdshot: ExtendedBoardDef = {
  id: 'pixracer-bdshot',
  name: 'Pixracer-bdshot',
  description: 'Pixracer-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixracer-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'USART1',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 5, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 11,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'USART1', 'UART7'],
  outputGroups: [
    { outputs: [1, 1, 2, 3, 4, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['MPU9250', 'ICM20608'],
    barometer: ['MS5611'],
    compass: ['HMC5843', 'LIS3MDL'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const pixracerPeriph: ExtendedBoardDef = {
  id: 'pixracer-periph',
  name: 'Pixracer-periph',
  description: 'Pixracer-periph',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixracer-periph.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1402,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'EMPTY', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: [],
    barometer: ['MS5611'],
    compass: ['HMC5843', 'LIS3MDL'],
    osd: null,
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
};

export const pixsurveya1: ExtendedBoardDef = {
  id: 'pixsurveya1',
  name: 'PixSurveyA1',
  description: 'PixSurveyA1',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixsurveya1.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1076,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000', 'ICM20608', 'MPU9250', 'ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: ['HMC5843'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const pixsurveya1Ind: ExtendedBoardDef = {
  id: 'pixsurveya1-ind',
  name: 'PixSurveyA1-IND',
  description: 'PixSurveyA1-IND',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixsurveya1-ind.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1107,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 18.0, ampPerVolt: 24.0 },
  i2cBuses: 3,
};

export const pixsurveya2Ind: ExtendedBoardDef = {
  id: 'pixsurveya2-ind',
  name: 'PixSurveyA2-IND',
  description: 'PixSurveyA2-IND',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixsurveya2-ind.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 6104,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: ['BMP388'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const qiotekadeptf407: ExtendedBoardDef = {
  id: 'qiotekadeptf407',
  name: 'QioTekAdeptF407',
  description: 'QioTekAdeptF407',
  manufacturer: 'Unknown',
  mcu: 'CKS32F407xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-qiotekadeptf407.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART6',
    SERIAL2: 'USART3',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'USART2'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX6/RX6', serialIndex: 1, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1065,
  serialOrder: ['OTG1', 'USART6', 'USART3', 'USART1', 'UART4', 'USART2'],
  outputGroups: [
    { outputs: [5, 6, 7, 8], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [9, 10, 11, 12], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  i2cBuses: 2,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA15' },
};

export const qiotekzealotf427: ExtendedBoardDef = {
  id: 'qiotekzealotf427',
  name: 'QioTekZealotF427',
  description: 'QioTekZealotF427',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-qiotekzealotf427.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1021,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5'],
  outputGroups: [
    { outputs: [5, 6, 7, 8], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [13, 14], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [9, 10, 11, 12], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 14,
  builtinSensors: {
    imu: ['ICM20689', 'ICM20602', 'BMI055', 'ICM42605'],
    barometer: ['DPS310'],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 20.0, ampPerVolt: 61.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const qiotekzealoth743: ExtendedBoardDef = {
  id: 'qiotekzealoth743',
  name: 'QioTekZealotH743',
  description: 'QioTekZealotH743',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-qiotekzealoth743.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1036,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [5, 6, 7, 8], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4, 13, 14], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [9, 10, 11, 12], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 14,
  builtinSensors: {
    imu: ['ADIS16470'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 16, currPin: 17, voltMult: 20.0, ampPerVolt: 61.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC8' },
};

export const qiotekzealoth743Bdshot: ExtendedBoardDef = {
  id: 'qiotekzealoth743-bdshot',
  name: 'QioTekZealotH743-bdshot',
  description: 'QioTekZealotH743-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-qiotekzealoth743-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1036,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [5, 6, 7, 8], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4, 13, 13, 14, 14], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9, 9, 10, 10, 11, 11, 12, 12], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 20,
  builtinSensors: {
    imu: ['ADIS16470'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 16, currPin: 17, voltMult: 20.0, ampPerVolt: 61.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC8' },
};

export const r9pilot: ExtendedBoardDef = {
  id: 'r9pilot',
  name: 'R9Pilot',
  description: 'R9Pilot',
  manufacturer: 'Unknown',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-r9pilot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'USART1',
    SERIAL4: 'UART5',
    SERIAL5: 'USART6',
    SERIAL6: 'UART7',
    SERIAL7: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 4, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 7, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1008,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'USART1', 'UART5', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [3, 4, 5], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [6, 7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM20602'],
    barometer: ['SPL06'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB3' },
};

export const radiolinkf405: ExtendedBoardDef = {
  id: 'radiolinkf405',
  name: 'RadiolinkF405',
  description: 'RadiolinkF405',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-radiolinkf405.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1417,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5'],
  outputGroups: [
    { outputs: [7], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM8', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 7,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 11.0, ampPerVolt: 25.0 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const radiolinkpix6: ExtendedBoardDef = {
  id: 'radiolinkpix6',
  name: 'RadiolinkPIX6',
  description: 'RadiolinkPIX6',
  manufacturer: 'Unknown',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-radiolinkpix6.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1410,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'USART1', 'UART4', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 8], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [6, 7], timer: 'TIM3', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['BMI088'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 0, currPin: 1, voltMult: 18.0, ampPerVolt: 24.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const radix2hd: ExtendedBoardDef = {
  id: 'radix2hd',
  name: 'RADIX2HD',
  description: 'RADIX2HD',
  manufacturer: 'Unknown',
  mcu: 'STM32H750xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-radix2hd.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1118,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6', 'UART7'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [11], timer: 'TIM5', capabilities: ['PWM', 'DShot'] },
    { outputs: [9, 10], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 11,
  builtinSensors: {
    imu: ['BMI270'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 3, voltMult: 17.6, ampPerVolt: 28.5 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const reaperf745: ExtendedBoardDef = {
  id: 'reaperf745',
  name: 'ReaperF745',
  description: 'ReaperF745',
  manufacturer: 'Unknown',
  mcu: 'STM32F745xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-reaperf745.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL7: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1074,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'EMPTY', 'UART7'],
  outputGroups: [
    { outputs: [5], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 5,
  builtinSensors: {
    imu: ['BMI270', 'ICM42688', 'MPU6000'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 10.9, ampPerVolt: 100.0 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const resoluteh7: ExtendedBoardDef = {
  id: 'resoluteh7',
  name: 'ResoluteH7',
  description: 'ResoluteH7',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-resoluteh7.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 9, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1445,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6', 'UART7', 'UART8', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [12], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [9], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [10, 11], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 40.0 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const revoMini: ExtendedBoardDef = {
  id: 'revo-mini',
  name: 'revo-mini',
  description: 'revo-mini',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-revo-mini.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL3: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 124,
  serialOrder: ['OTG1', 'USART1', 'EMPTY', 'USART3'],
  outputGroups: [
    { outputs: [3, 4, 5, 6], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC6' },
};

export const revoMiniBdshot: ExtendedBoardDef = {
  id: 'revo-mini-bdshot',
  name: 'revo-mini-bdshot',
  description: 'revo-mini-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-revo-mini-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL3: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 124,
  serialOrder: ['OTG1', 'USART1', 'EMPTY', 'USART3'],
  outputGroups: [
    { outputs: [3, 3, 4, 4, 5, 6], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 1, 2, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC6' },
};

export const revoMiniI2c: ExtendedBoardDef = {
  id: 'revo-mini-i2c',
  name: 'revo-mini-i2c',
  description: 'revo-mini-i2c',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-revo-mini-i2c.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART3',
    SERIAL3: 'USART6',
    SERIAL4: 'USART2',
    SERIAL5: 'UART4'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 3, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 4, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 5, uartName: 'UART4', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 124,
  serialOrder: ['OTG1', 'USART1', 'USART3', 'USART6', 'USART2', 'UART4'],
  outputGroups: [
    { outputs: [3, 4, 5, 6], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB14' },
};

export const revoMiniI2cBdshot: ExtendedBoardDef = {
  id: 'revo-mini-i2c-bdshot',
  name: 'revo-mini-i2c-bdshot',
  description: 'revo-mini-i2c-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-revo-mini-i2c-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART3',
    SERIAL3: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 3, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 124,
  serialOrder: ['OTG1', 'USART1', 'USART3', 'USART6'],
  outputGroups: [
    { outputs: [3, 3, 4, 4, 5, 6], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 1, 2, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB14' },
};

export const revoMiniSd: ExtendedBoardDef = {
  id: 'revo-mini-sd',
  name: 'revo-mini-sd',
  description: 'revo-mini-sd',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-revo-mini-sd.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART3',
    SERIAL3: 'USART6',
    SERIAL4: 'USART2',
    SERIAL5: 'UART4'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 3, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 4, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 5, uartName: 'UART4', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 124,
  serialOrder: ['OTG1', 'USART1', 'USART3', 'USART6', 'USART2', 'UART4'],
  outputGroups: [
    { outputs: [3, 4, 5, 6], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB14' },
};

export const rfcu: ExtendedBoardDef = {
  id: 'rfcu',
  name: 'rFCU',
  description: 'rFCU',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-rfcu.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART6',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'UART8',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 2, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1102,
  serialOrder: ['OTG1', 'USART2', 'USART6', 'USART1', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [9, 10, 11, 12], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [13, 14], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 14,
  builtinSensors: {
    imu: ['ADIS16470', 'ICM42688'],
    barometer: ['MS5611', 'BMP390'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
};

export const rgnss: ExtendedBoardDef = {
  id: 'rgnss',
  name: 'rGNSS',
  description: 'rGNSS',
  manufacturer: 'Unknown',
  mcu: 'STM32G491xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-rgnss.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART2'
  },
  uartPorts: [
    { padLabel: 'TX2/RX2', serialIndex: 0, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1103,
  serialOrder: ['USART2'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const sdmodelh7v1: ExtendedBoardDef = {
  id: 'sdmodelh7v1',
  name: 'SDMODELH7V1',
  description: 'SDMODELH7V1',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-sdmodelh7v1.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1111,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6', 'UART7'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 3, 4, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 5, 6, 6], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 7, 8, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 17,
  builtinSensors: {
    imu: ['MPU6000', 'ICM42688', 'BMI270'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 59.5 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const sdmodelh7v2: ExtendedBoardDef = {
  id: 'sdmodelh7v2',
  name: 'SDMODELH7V2',
  description: 'SDMODELH7V2',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-sdmodelh7v2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1167,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6', 'UART7'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 3, 4, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM5', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 13,
  builtinSensors: {
    imu: ['MPU6000', 'ICM42688', 'BMI270'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 59.5 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const sequreh743: ExtendedBoardDef = {
  id: 'sequreh743',
  name: 'SequreH743',
  description: 'SequreH743',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-sequreh743.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1195,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'EMPTY', 'UART4', 'EMPTY', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [9], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 11.0, ampPerVolt: 17.2 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const sierraF405: ExtendedBoardDef = {
  id: 'sierra-f405',
  name: 'Sierra-F405',
  description: 'Sierra-F405',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-sierra-f405.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL3: 'USART2'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 3, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1052,
  serialOrder: ['USART1', 'EMPTY', 'EMPTY', 'USART2'],
  outputGroups: [
    { outputs: [3], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [4], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 4,
  builtinSensors: {
    imu: [],
    barometer: ['DPS310'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
};

export const sierraF412: ExtendedBoardDef = {
  id: 'sierra-f412',
  name: 'Sierra-F412',
  description: 'Sierra-F412',
  manufacturer: 'Unknown',
  mcu: 'STM32F412Rx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-sierra-f412.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL3: 'USART2'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 3, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1055,
  serialOrder: ['USART1', 'EMPTY', 'EMPTY', 'USART2'],
  outputGroups: [
    { outputs: [3], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [4], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 4,
  builtinSensors: {
    imu: [],
    barometer: ['DPS310'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
};

export const sierraF9p: ExtendedBoardDef = {
  id: 'sierra-f9p',
  name: 'Sierra-F9P',
  description: 'Sierra-F9P',
  manufacturer: 'Unknown',
  mcu: 'STM32F412Rx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-sierra-f9p.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL3: 'USART2'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 3, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1034,
  serialOrder: ['USART1', 'EMPTY', 'EMPTY', 'USART2'],
  outputGroups: [
    { outputs: [1], timer: 'TIM2', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 1,
  builtinSensors: {
    imu: [],
    barometer: ['DPS310'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 1,
};

export const sierraL431: ExtendedBoardDef = {
  id: 'sierra-l431',
  name: 'Sierra-L431',
  description: 'Sierra-L431',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-sierra-l431.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1050,
  serialOrder: ['USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const sierraPrecisionpoint: ExtendedBoardDef = {
  id: 'sierra-precisionpoint',
  name: 'Sierra-PrecisionPoint',
  description: 'Sierra-PrecisionPoint',
  manufacturer: 'Unknown',
  mcu: 'STM32F412Rx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-sierra-precisionpoint.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1095,
  serialOrder: ['OTG1', 'USART1', 'USART2'],
  outputGroups: [
    { outputs: [1], timer: 'TIM2', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 1,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: ['DPS310'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: true,
  },
};

export const sierraTruenavic: ExtendedBoardDef = {
  id: 'sierra-truenavic',
  name: 'Sierra-TrueNavIC',
  description: 'Sierra-TrueNavIC',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-sierra-truenavic.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 5302,
  serialOrder: ['EMPTY', 'USART1'],
  outputGroups: [
    { outputs: [1], timer: 'TIM2', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 1,
  builtinSensors: {
    imu: [],
    barometer: ['DPS310'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const sierraTruenavpro: ExtendedBoardDef = {
  id: 'sierra-truenavpro',
  name: 'Sierra-TrueNavPro',
  description: 'Sierra-TrueNavPro',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-sierra-truenavpro.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1091,
  serialOrder: ['USART1'],
  outputGroups: [
    { outputs: [1], timer: 'TIM2', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 1,
  builtinSensors: {
    imu: [],
    barometer: ['DPS310'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
};

export const sierraTruenavproG4: ExtendedBoardDef = {
  id: 'sierra-truenavpro-g4',
  name: 'Sierra-TrueNavPro-G4',
  description: 'Sierra-TrueNavPro-G4',
  manufacturer: 'Unknown',
  mcu: 'STM32G491xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-sierra-truenavpro-g4.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2'
  },
  uartPorts: [
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 5301,
  serialOrder: ['EMPTY', 'USART2'],
  outputGroups: [
    { outputs: [1], timer: 'TIM2', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 1,
  builtinSensors: {
    imu: [],
    barometer: ['DPS310'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
};

export const sierraTruenorth: ExtendedBoardDef = {
  id: 'sierra-truenorth',
  name: 'Sierra-TrueNorth',
  description: 'Sierra-TrueNorth',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-sierra-truenorth.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1093,
  serialOrder: ['USART1'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM2', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 2,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: false,
  },
};

export const sierraTruespeed: ExtendedBoardDef = {
  id: 'sierra-truespeed',
  name: 'Sierra-TrueSpeed',
  description: 'Sierra-TrueSpeed',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-sierra-truespeed.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1094,
  serialOrder: ['USART1'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM2', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 2,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 2,
};

export const siyiN7: ExtendedBoardDef = {
  id: 'siyi_n7',
  name: 'SIYI_N7',
  description: 'SIYI_N7',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-siyi_n7.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1123,
  serialOrder: ['OTG1', 'USART2', 'EMPTY', 'USART1', 'UART4', 'EMPTY', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 5,
  builtinSensors: {
    imu: ['ICM20689', 'ICM45686', 'BMI088'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 16, currPin: 17, voltMult: 18.182, ampPerVolt: 36.364 },
  i2cBuses: 4,
  hasSafetySwitch: true,
};

export const skyrukhSurgeH7: ExtendedBoardDef = {
  id: 'skyrukh_surge_h7',
  name: 'SkyRukh_Surge_H7',
  description: 'SkyRukh_Surge_H7',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-skyrukh_surge_h7.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART6',
    SERIAL3: 'USART3',
    SERIAL4: 'UART7',
    SERIAL5: 'UART4',
    SERIAL6: 'UART5',
    SERIAL7: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 2, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 4, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 5, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 6, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 7, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 2815,
  serialOrder: ['OTG1', 'USART2', 'USART6', 'USART3', 'UART7', 'UART4', 'UART5', 'UART8'],
  outputGroups: [
    { outputs: [4, 6, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 3], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 7], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['BMI088', 'ICM20602'],
    barometer: ['DPS310'],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 16, currPin: 17, voltMult: 7.39, ampPerVolt: 40.0 },
  i2cBuses: 2,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA10' },
};

export const skysakurah743: ExtendedBoardDef = {
  id: 'skysakurah743',
  name: 'SkySakuraH743',
  description: 'SkySakuraH743',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-skysakurah743.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'USART1',
    SERIAL3: 'USART2',
    SERIAL4: 'USART3',
    SERIAL5: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 2, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 3, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 4, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 5, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 7, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 2714,
  serialOrder: ['OTG1', 'UART7', 'USART1', 'USART2', 'USART3', 'UART4', 'USART6', 'UART8', 'OTG2'],
  outputGroups: [
    { outputs: [13], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9, 10, 11, 12], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 13,
  builtinSensors: {
    imu: ['ICM42688', 'IIM42652'],
    barometer: ['DPS310'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 13, currPin: 12, voltMult: 34.0, ampPerVolt: 40.0 },
  i2cBuses: 2,
  hasBuzzer: true,
  hasSafetySwitch: true,
};

export const skystarsf405v2: ExtendedBoardDef = {
  id: 'skystarsf405v2',
  name: 'SkystarsF405v2',
  description: 'SkystarsF405v2',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-skystarsf405v2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1201,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [5], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 7,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 25.0 },
  i2cBuses: 2,
  hasBuzzer: true,
};

export const skystarsh7hd: ExtendedBoardDef = {
  id: 'skystarsh7hd',
  name: 'SkystarsH7HD',
  description: 'SkystarsH7HD',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-skystarsh7hd.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1075,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [1, 2, 9], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: ['BMI270'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.1, ampPerVolt: 59.5 },
  i2cBuses: 2,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const skystarsh7hdBdshot: ExtendedBoardDef = {
  id: 'skystarsh7hd-bdshot',
  name: 'SkystarsH7HD-bdshot',
  description: 'SkystarsH7HD-bdshot',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-skystarsh7hd-bdshot.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1075,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'EMPTY', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [1, 2, 9], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 5, 6, 7, 7, 8], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [3, 3, 4], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 14,
  builtinSensors: {
    imu: ['BMI270'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.1, ampPerVolt: 59.5 },
  i2cBuses: 2,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const skystarsh7hdv2: ExtendedBoardDef = {
  id: 'skystarsh7hdv2',
  name: 'SkystarsH7HDv2',
  description: 'SkystarsH7HDv2',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-skystarsh7hdv2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 9, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1075,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6', 'UART7', 'UART8', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 9], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 5, 6, 7, 7, 8], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [3, 3, 4], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 18,
  builtinSensors: {
    imu: ['BMI270', 'ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.1, ampPerVolt: 59.5 },
  i2cBuses: 2,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const skyviperF412Rev1: ExtendedBoardDef = {
  id: 'skyviper-f412-rev1',
  name: 'skyviper-f412-rev1',
  description: 'skyviper-f412-rev1',
  manufacturer: 'Unknown',
  mcu: 'STM32F412Rx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-skyviper-f412-rev1.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART2',
    SERIAL1: 'USART3',
    SERIAL3: 'USART6'
  },
  uartPorts: [
    { padLabel: 'TX2/RX2', serialIndex: 0, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 1, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 3, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 9,
  serialOrder: ['USART2', 'USART3', 'EMPTY', 'USART6'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 4,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 2,
};

export const skyviperJourney: ExtendedBoardDef = {
  id: 'skyviper-journey',
  name: 'skyviper-journey',
  description: 'skyviper-journey',
  manufacturer: 'Unknown',
  mcu: 'STM32F412Rx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-skyviper-journey.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'USART2',
    SERIAL3: 'USART6'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 3, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 9,
  serialOrder: ['USART1', 'USART2', 'EMPTY', 'USART6'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 4,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 2,
};

export const skyviperV2450: ExtendedBoardDef = {
  id: 'skyviper-v2450',
  name: 'skyviper-v2450',
  description: 'skyviper-v2450',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-skyviper-v2450.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL3: 'UART4'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 9,
  serialOrder: ['OTG1', 'USART2', 'EMPTY', 'UART4'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000', 'ICM20608', 'MPU9250', 'ICM20948', 'ICM20602'],
    barometer: ['MS5611'],
    compass: ['HMC5843'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const sparky2: ExtendedBoardDef = {
  id: 'sparky2',
  name: 'sparky2',
  description: 'sparky2',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-sparky2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART3',
    SERIAL3: 'USART1'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX3/RX3', serialIndex: 1, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 130,
  serialOrder: ['OTG1', 'USART3', 'EMPTY', 'USART1'],
  outputGroups: [
    { outputs: [7], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4, 5, 6], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 7,
  builtinSensors: {
    imu: ['MPU9250'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 12, currPin: 13, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const spedixf405: ExtendedBoardDef = {
  id: 'spedixf405',
  name: 'SPEDIXF405',
  description: 'SPEDIXF405',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-spedixf405.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1197,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [9], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 11.0, ampPerVolt: 50.0 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const spedixh743: ExtendedBoardDef = {
  id: 'spedixh743',
  name: 'SPEDIXH743',
  description: 'SPEDIXH743',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-spedixh743.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1196,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9], timer: 'TIM5', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM8', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 25.0 },
  i2cBuses: 3,
  hasBuzzer: true,
};

export const speedybeef4: ExtendedBoardDef = {
  id: 'speedybeef4',
  name: 'speedybeef4',
  description: 'speedybeef4',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-speedybeef4.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'UART4',
    SERIAL3: 'USART3',
    SERIAL4: 'UART5'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 2, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 4, uartName: 'UART5', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 134,
  serialOrder: ['OTG1', 'USART1', 'UART4', 'USART3', 'UART5'],
  outputGroups: [
    { outputs: [6], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 11.0, ampPerVolt: 30.2 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA3' },
};

export const speedybeef405aio: ExtendedBoardDef = {
  id: 'speedybeef405aio',
  name: 'SpeedyBeeF405AIO',
  description: 'SpeedyBeeF405AIO',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-speedybeef405aio.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 5271,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [5], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 5,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 12, voltMult: 11.0, ampPerVolt: 39.4 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const speedybeef405wing: ExtendedBoardDef = {
  id: 'speedybeef405wing',
  name: 'SpeedyBeeF405WING',
  description: 'SpeedyBeeF405WING',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-speedybeef405wing.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1106,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [11, 12], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [8, 9, 10], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6, 7], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['ICM42605'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PA3' },
};

export const speedybeef4v3: ExtendedBoardDef = {
  id: 'speedybeef4v3',
  name: 'speedybeef4v3',
  description: 'speedybeef4v3',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-speedybeef4v3.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1082,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [5, 6, 7, 8], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [9], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: ['BMI270'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const speedybeef4v4: ExtendedBoardDef = {
  id: 'speedybeef4v4',
  name: 'speedybeef4v4',
  description: 'speedybeef4v4',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-speedybeef4v4.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1136,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [9], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 25.0 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const speedybeef4v5: ExtendedBoardDef = {
  id: 'speedybeef4v5',
  name: 'speedybeef4v5',
  description: 'speedybeef4v5',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-speedybeef4v5.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 5272,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [7], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 7,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 11, currPin: 15, voltMult: 11.0, ampPerVolt: 25.0 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const spracingh7: ExtendedBoardDef = {
  id: 'spracingh7',
  name: 'SPRacingH7',
  description: 'SPRacingH7',
  manufacturer: 'Unknown',
  mcu: 'STM32H750xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-spracingh7.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1060,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6', 'EMPTY', 'UART8'],
  outputGroups: [
    { outputs: [11], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 11,
  builtinSensors: {
    imu: ['ICM20602'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 11, currPin: 10, voltMult: 10.9, ampPerVolt: 28.5 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const spracingh7rf: ExtendedBoardDef = {
  id: 'spracingh7rf',
  name: 'SPRacingH7RF',
  description: 'SPRacingH7RF',
  manufacturer: 'Unknown',
  mcu: 'STM32H730xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-spracingh7rf.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1108,
  serialOrder: ['OTG1', 'EMPTY', 'USART2', 'USART3', 'UART4', 'UART5', 'EMPTY', 'EMPTY', 'UART8'],
  outputGroups: [
    { outputs: [9], timer: 'TIM17', capabilities: ['PWM'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 9,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 13, currPin: 11, voltMult: 10.9, ampPerVolt: 28.5 },
  i2cBuses: 2,
  hasBuzzer: true,
};

export const stellarf4: ExtendedBoardDef = {
  id: 'stellarf4',
  name: 'StellarF4',
  description: 'StellarF4',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-stellarf4.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1500,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [9], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [10], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: ['ICM42688', 'BMI270'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const stellarf4v2: ExtendedBoardDef = {
  id: 'stellarf4v2',
  name: 'StellarF4V2',
  description: 'StellarF4V2',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-stellarf4v2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART5'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 4, uartName: 'UART5', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1504,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART5'],
  outputGroups: [
    { outputs: [9, 10, 11], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM8', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 11,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 10.0 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const stellarh7v2: ExtendedBoardDef = {
  id: 'stellarh7v2',
  name: 'StellarH7V2',
  description: 'StellarH7V2',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-stellarh7v2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'USART6',
    SERIAL6: 'UART7',
    SERIAL7: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 5, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 7, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1503,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8, 9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4, 5, 6], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 10,
  builtinSensors: {
    imu: ['ICM42688'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, ampPerVolt: 66.7 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const succexf4: ExtendedBoardDef = {
  id: 'succexf4',
  name: 'SuccexF4',
  description: 'SuccexF4',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-succexf4.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 4, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1011,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'USART6'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM8', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 4,
  builtinSensors: {
    imu: ['ICM20689'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 12, currPin: 11, voltMult: 11.0, ampPerVolt: 18.2 },
  i2cBuses: 1,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB6' },
};

export const sulilgh7P1P2: ExtendedBoardDef = {
  id: 'sulilgh7-p1-p2',
  name: 'SULILGH7-P1-P2',
  description: 'SULILGH7-P1-P2',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-sulilgh7-p1-p2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'USART1',
    SERIAL4: 'UART4',
    SERIAL5: 'UART8',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 2005,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'USART1', 'UART4', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['BMI088', 'ICM42688', 'ICM20689'],
    barometer: ['BMP581'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
};

export const svehicleE2: ExtendedBoardDef = {
  id: 'svehicle-e2',
  name: 'SVehicle-E2',
  description: 'SVehicle-E2',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-svehicle-e2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART8',
    SERIAL5: 'USART2',
    SERIAL6: 'UART4',
    SERIAL7: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 6, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 7, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 6110,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART8', 'USART2', 'UART4', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['BMI088', 'ICM42688'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 6, currPin: 9, voltMult: 21.0, ampPerVolt: 24.0 },
  i2cBuses: 4,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const swBoomF407: ExtendedBoardDef = {
  id: 'sw-boom-f407',
  name: 'sw-boom-f407',
  description: 'sw-boom-f407',
  manufacturer: 'Unknown',
  mcu: 'STM32F407xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-sw-boom-f407.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART6',
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4'
  },
  uartPorts: [
    { padLabel: 'TX6/RX6', serialIndex: 0, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 6001,
  serialOrder: ['USART6', 'USART2', 'USART3', 'UART4'],
  outputGroups: [
    { outputs: [1, 2], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [4], timer: 'TIM2', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 3,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
};

export const swSparF407: ExtendedBoardDef = {
  id: 'sw-spar-f407',
  name: 'sw-spar-f407',
  description: 'sw-spar-f407',
  manufacturer: 'Unknown',
  mcu: 'STM32F407xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-sw-spar-f407.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1',
    SERIAL1: 'USART2',
    SERIAL2: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 6000,
  serialOrder: ['USART1', 'USART2', 'USART3'],
  outputGroups: [
    { outputs: [1], timer: 'TIM2', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 1,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 2,
};

export const swanK1: ExtendedBoardDef = {
  id: 'swan-k1',
  name: 'Swan-K1',
  description: 'Swan-K1',
  manufacturer: 'Unknown',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-swan-k1.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'UART4',
    SERIAL3: 'USART1',
    SERIAL4: 'USART6',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 2, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 4, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 50,
  serialOrder: ['OTG1', 'USART2', 'UART4', 'USART1', 'USART6', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM20689', 'ICM20602', 'BMI055'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 0, currPin: 1, voltMult: 18.182, ampPerVolt: 36.364 },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const tbsColibriF7: ExtendedBoardDef = {
  id: 'tbs-colibri-f7',
  name: 'TBS-Colibri-F7',
  description: 'TBS-Colibri-F7',
  manufacturer: 'Unknown',
  mcu: 'STM32F767xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-tbs-colibri-f7.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'UART4',
    SERIAL3: 'USART1',
    SERIAL4: 'USART6',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 2, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 4, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 6, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 50,
  serialOrder: ['OTG1', 'USART2', 'UART4', 'USART1', 'USART6', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [9, 10, 11], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 11,
  builtinSensors: {
    imu: ['ICM20689', 'ICM20602', 'BMI055'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 0, currPin: 1, voltMult: 18.182, ampPerVolt: 36.364 },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const tbsL431Airspeed: ExtendedBoardDef = {
  id: 'tbs-l431-airspeed',
  name: 'TBS-L431-Airspeed',
  description: 'TBS-L431-Airspeed',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-tbs-l431-airspeed.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 5252,
  serialOrder: ['USART1'],
  outputGroups: [
    { outputs: [5, 6], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [7], timer: 'TIM16', capabilities: ['PWM'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 7,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 2,
};

export const tbsL431Battmon: ExtendedBoardDef = {
  id: 'tbs-l431-battmon',
  name: 'TBS-L431-BattMon',
  description: 'TBS-L431-BattMon',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-tbs-l431-battmon.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 5252,
  serialOrder: ['USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 9, currPin: 8, voltMult: 21.0, ampPerVolt: 37.5 },
  i2cBuses: 1,
};

export const tbsL431Currmon: ExtendedBoardDef = {
  id: 'tbs-l431-currmon',
  name: 'TBS-L431-CurrMon',
  description: 'TBS-L431-CurrMon',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-tbs-l431-currmon.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 5252,
  serialOrder: ['USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: -1, currPin: 5, voltMult: 0.0, ampPerVolt: 91.0 },
  i2cBuses: 1,
};

export const tbsL431Pwm: ExtendedBoardDef = {
  id: 'tbs-l431-pwm',
  name: 'TBS-L431-PWM',
  description: 'TBS-L431-PWM',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-tbs-l431-pwm.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 5252,
  serialOrder: ['USART1'],
  outputGroups: [
    { outputs: [5, 6, 7], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [8], timer: 'TIM16', capabilities: ['PWM'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
};

export const tbsLucidH7: ExtendedBoardDef = {
  id: 'tbs_lucid_h7',
  name: 'TBS_LUCID_H7',
  description: 'TBS_LUCID_H7',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-tbs_lucid_h7.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 9, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 5250,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6', 'UART7', 'UART8', 'OTG2'],
  outputGroups: [
    { outputs: [13], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [11, 12], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8, 9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 13,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 40.0 },
  i2cBuses: 2,
  hasBuzzer: true,
};

export const tbsLucidH7Wing: ExtendedBoardDef = {
  id: 'tbs_lucid_h7_wing',
  name: 'TBS_LUCID_H7_WING',
  description: 'TBS_LUCID_H7_WING',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-tbs_lucid_h7_wing.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 9, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 5253,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6', 'UART7', 'UART8', 'OTG2'],
  outputGroups: [
    { outputs: [13], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [11, 12], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8, 9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 13,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 40.0 },
  i2cBuses: 2,
  hasBuzzer: true,
};

export const tbsLucidH7WingAio: ExtendedBoardDef = {
  id: 'tbs_lucid_h7_wing_aio',
  name: 'TBS_LUCID_H7_WING_AIO',
  description: 'TBS_LUCID_H7_WING_AIO',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-tbs_lucid_h7_wing_aio.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 9, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 5254,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'EMPTY', 'USART6', 'UART7', 'UART8', 'OTG2'],
  outputGroups: [
    { outputs: [13], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [11, 12], timer: 'TIM15', capabilities: ['PWM'] },
    { outputs: [3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8, 9, 10], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 13,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 11.0, ampPerVolt: 40.0 },
  i2cBuses: 2,
  hasBuzzer: true,
};

export const tbsLucidPro: ExtendedBoardDef = {
  id: 'tbs_lucid_pro',
  name: 'TBS_LUCID_PRO',
  description: 'TBS_LUCID_PRO',
  manufacturer: 'Unknown',
  mcu: 'STM32F405xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-tbs_lucid_pro.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 5251,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART5', 'USART6'],
  outputGroups: [
    { outputs: [5, 6], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [3, 4], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 20.0, ampPerVolt: 40.0 },
  i2cBuses: 1,
  hasBuzzer: true,
};

export const thepeachK1: ExtendedBoardDef = {
  id: 'thepeach-k1',
  name: 'thepeach-k1',
  description: 'thepeach-k1',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-thepeach-k1.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 212,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 5,
  builtinSensors: {
    imu: ['ICM20602', 'MPU9250'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 18.182, ampPerVolt: 36.364 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const thepeachR1: ExtendedBoardDef = {
  id: 'thepeach-r1',
  name: 'thepeach-r1',
  description: 'thepeach-r1',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-thepeach-r1.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART3',
    SERIAL3: 'UART4',
    SERIAL4: 'UART8',
    SERIAL5: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 2, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 3, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 213,
  serialOrder: ['OTG1', 'USART2', 'USART3', 'UART4', 'UART8', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['ICM20602', 'MPU9250'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 3, voltMult: 18.182, ampPerVolt: 36.364 },
  i2cBuses: 2,
  hasSafetySwitch: true,
};

export const tmotorh743: ExtendedBoardDef = {
  id: 'tmotorh743',
  name: 'TMotorH743',
  description: 'TMotorH743',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-tmotorh743.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL3: 'USART3',
    SERIAL5: 'UART5',
    SERIAL6: 'USART6',
    SERIAL7: 'UART7',
    SERIAL8: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 5, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 6, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 7, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 8, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1138,
  serialOrder: ['OTG1', 'USART1', 'EMPTY', 'USART3', 'EMPTY', 'UART5', 'USART6', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [9], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 5,
  builtinSensors: {
    imu: ['ICM42688', 'BMI270'],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: false,
  },
  batteryMonitor: { voltPin: 11, currPin: 13, voltMult: 11.0, ampPerVolt: 50.0 },
  i2cBuses: 1,
  hasBuzzer: true,
  defaultRcInput: { type: 'uart' as const, padLabel: 'PE0' },
};

export const uavDevAuavG4: ExtendedBoardDef = {
  id: 'uav-dev-auav-g4',
  name: 'uav-dev-auav-g4',
  description: 'uav-dev-auav-g4',
  manufacturer: 'Unknown',
  mcu: 'STM32G474xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-uav-dev-auav-g4.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX3/RX3', serialIndex: 0, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 5234,
  serialOrder: ['USART3'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const uavDevFcUm982: ExtendedBoardDef = {
  id: 'uav-dev-fc-um982',
  name: 'uav-dev-fc-um982',
  description: 'uav-dev-fc-um982',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-uav-dev-fc-um982.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'UART8',
    SERIAL3: 'USART2',
    SERIAL4: 'USART6',
    SERIAL5: 'UART7',
    SERIAL6: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 2, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 3, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 4, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 6, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 5230,
  serialOrder: ['OTG1', 'USART1', 'UART8', 'USART2', 'USART6', 'UART7', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 6,
  builtinSensors: {
    imu: ['ICM45686'],
    barometer: ['DPS310'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 1,
};

export const uavDevPowermodule: ExtendedBoardDef = {
  id: 'uav-dev-powermodule',
  name: 'uav-dev-powermodule',
  description: 'uav-dev-powermodule',
  manufacturer: 'Unknown',
  mcu: 'STM32G474xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-uav-dev-powermodule.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 5233,
  serialOrder: ['USART1'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const uavDevM10s: ExtendedBoardDef = {
  id: 'uav-dev_m10s',
  name: 'uav-dev_m10s',
  description: 'uav-dev_m10s',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-uav-dev_m10s.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART3'
  },
  uartPorts: [
    { padLabel: 'TX3/RX3', serialIndex: 0, uartName: 'USART3', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 5222,
  serialOrder: ['USART3'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const vmL431Batterytag: ExtendedBoardDef = {
  id: 'vm-l431-batterytag',
  name: 'VM-L431-BatteryTag',
  description: 'VM-L431-BatteryTag',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-vm-l431-batterytag.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1407,
  serialOrder: ['EMPTY', 'USART1', 'USART2'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const vmL431Bms: ExtendedBoardDef = {
  id: 'vm-l431-bms',
  name: 'VM-L431-BMS',
  description: 'VM-L431-BMS',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-vm-l431-bms.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL2: 'USART2'
  },
  uartPorts: [
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 5820,
  serialOrder: ['EMPTY', 'EMPTY', 'USART2'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const vmL431PeriphPico: ExtendedBoardDef = {
  id: 'vm-l431-periph-pico',
  name: 'VM-L431-Periph-Pico',
  description: 'VM-L431-Periph-Pico',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-vm-l431-periph-pico.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1407,
  serialOrder: ['EMPTY', 'USART1', 'USART2'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
  i2cBuses: 1,
};

export const vmL431SrvHub4chp: ExtendedBoardDef = {
  id: 'vm-l431-srv-hub-4chp',
  name: 'VM-L431-SRV-Hub-4CHP',
  description: 'VM-L431-SRV-Hub-4CHP',
  manufacturer: 'Unknown',
  mcu: 'STM32L431xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-vm-l431-srv-hub-4chp.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART1'
  },
  uartPorts: [
    { padLabel: 'TX1/RX1', serialIndex: 0, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1407,
  serialOrder: ['USART1'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'ADC1', capabilities: ['PWM'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: false,
  },
};

export const vrbrainV51: ExtendedBoardDef = {
  id: 'vrbrain-v51',
  name: 'VRBrain-v51',
  description: 'VRBrain-v51',
  manufacturer: 'Unknown',
  mcu: 'STM32F407xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-vrbrain-v51.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART3',
    SERIAL2: 'USART2',
    SERIAL3: 'USART1'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX3/RX3', serialIndex: 1, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1151,
  serialOrder: ['OTG1', 'USART3', 'USART2', 'USART1'],
  outputGroups: [
    { outputs: [9, 10, 11, 12], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [4, 5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const vrbrainV52: ExtendedBoardDef = {
  id: 'vrbrain-v52',
  name: 'VRBrain-v52',
  description: 'VRBrain-v52',
  manufacturer: 'Unknown',
  mcu: 'STM32F407xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-vrbrain-v52.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART3',
    SERIAL2: 'USART2',
    SERIAL3: 'USART1'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX3/RX3', serialIndex: 1, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1152,
  serialOrder: ['OTG1', 'USART3', 'USART2', 'USART1'],
  outputGroups: [
    { outputs: [9, 10, 11, 12], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [4, 5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const vrbrainV54: ExtendedBoardDef = {
  id: 'vrbrain-v54',
  name: 'VRBrain-v54',
  description: 'VRBrain-v54',
  manufacturer: 'Unknown',
  mcu: 'STM32F427xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-vrbrain-v54.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART3',
    SERIAL2: 'USART2',
    SERIAL3: 'USART1'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX3/RX3', serialIndex: 1, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1154,
  serialOrder: ['OTG1', 'USART3', 'USART2', 'USART1'],
  outputGroups: [
    { outputs: [9, 10, 11, 12], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [4, 5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const vrcoreV10: ExtendedBoardDef = {
  id: 'vrcore-v10',
  name: 'VRCore-v10',
  description: 'VRCore-v10',
  manufacturer: 'Unknown',
  mcu: 'STM32F407xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-vrcore-v10.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART3',
    SERIAL2: 'USART2',
    SERIAL3: 'USART1'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX3/RX3', serialIndex: 1, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1910,
  serialOrder: ['OTG1', 'USART3', 'USART2', 'USART1'],
  outputGroups: [
    { outputs: [9, 10, 11, 12], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [4, 5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['MPU9250'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: 11, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const vrubrainV51: ExtendedBoardDef = {
  id: 'vrubrain-v51',
  name: 'VRUBrain-v51',
  description: 'VRUBrain-v51',
  manufacturer: 'Unknown',
  mcu: 'STM32F407xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-vrubrain-v51.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART3',
    SERIAL2: 'USART2',
    SERIAL3: 'USART1'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX3/RX3', serialIndex: 1, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1351,
  serialOrder: ['OTG1', 'USART3', 'USART2', 'USART1'],
  outputGroups: [
    { outputs: [9, 10, 11, 12], timer: 'TIM1', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3], timer: 'TIM2', capabilities: ['PWM', 'DShot'] },
    { outputs: [4, 5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [7, 8], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 12,
  builtinSensors: {
    imu: ['MPU6000'],
    barometer: ['MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 10, currPin: -1, voltMult: 10.1, ampPerVolt: 17.0 },
  i2cBuses: 2,
  hasBuzzer: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const vuavV7pro: ExtendedBoardDef = {
  id: 'vuav-v7pro',
  name: 'VUAV-V7pro',
  description: 'VUAV-V7pro',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-vuav-v7pro.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART6',
    SERIAL3: 'USART1',
    SERIAL4: 'USART3',
    SERIAL5: 'UART8',
    SERIAL6: 'UART4',
    SERIAL8: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 2, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 4, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 6, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 8, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 7100,
  serialOrder: ['OTG1', 'USART2', 'USART6', 'USART1', 'USART3', 'UART8', 'UART4', 'OTG2', 'UART7'],
  outputGroups: [
    { outputs: [5, 6, 7, 8], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [13, 14], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9, 10, 11, 12], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 14,
  builtinSensors: {
    imu: ['ADIS16470'],
    barometer: [],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 16, currPin: 2, voltMult: 15.7, ampPerVolt: 60.61 },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PB1' },
};

export const xMavApH743r1: ExtendedBoardDef = {
  id: 'x-mav-ap-h743r1',
  name: 'X-MAV-AP-H743r1',
  description: 'X-MAV-AP-H743r1',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-x-mav-ap-h743r1.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART4',
    SERIAL5: 'UART7',
    SERIAL6: 'UART8'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 4, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 5, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 6, uartName: 'UART8', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1203,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART4', 'UART7', 'UART8'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 7,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 9, currPin: 8, voltMult: 18.5, ampPerVolt: 40.0 },
  i2cBuses: 2,
};

export const xMavApH743v2: ExtendedBoardDef = {
  id: 'x-mav-ap-h743v2',
  name: 'X-MAV-AP-H743v2',
  description: 'X-MAV-AP-H743v2',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-x-mav-ap-h743v2.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'UART4',
    SERIAL3: 'USART1',
    SERIAL4: 'USART6',
    SERIAL5: 'UART8',
    SERIAL6: 'USART3',
    SERIAL7: 'UART5',
    SERIAL8: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 2, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 4, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 6, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 7, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 8, uartName: 'UART7', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1174,
  serialOrder: ['OTG1', 'USART2', 'UART4', 'USART1', 'USART6', 'UART8', 'USART3', 'UART5', 'UART7'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [7, 8], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6], timer: 'TIM3', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: [],
    barometer: [],
    compass: [],
    osd: 'MAX7456',
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 4, currPin: 8, voltMult: 10.2, ampPerVolt: 20.4 },
  i2cBuses: 2,
};

export const yariv6x: ExtendedBoardDef = {
  id: 'yariv6x',
  name: 'YARIV6X',
  description: 'YARIV6X',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-yariv6x.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART8',
    SERIAL5: 'USART2',
    SERIAL6: 'UART4',
    SERIAL7: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 6, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 7, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1234,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART8', 'USART2', 'UART4', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM45686'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const yjuavA6: ExtendedBoardDef = {
  id: 'yjuav_a6',
  name: 'YJUAV_A6',
  description: 'YJUAV_A6',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-yjuav_a6.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART1',
    SERIAL2: 'USART2',
    SERIAL3: 'USART3',
    SERIAL4: 'UART5',
    SERIAL5: 'UART8',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX1/RX1', serialIndex: 1, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 2, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 4, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1113,
  serialOrder: ['OTG1', 'USART1', 'USART2', 'USART3', 'UART5', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [1, 2, 3, 4], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [5, 6, 7, 8], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9, 10, 11, 12], timer: 'TIM3', capabilities: ['PWM', 'DShot'] },
    { outputs: [13, 14], timer: 'TIM4', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 14,
  builtinSensors: {
    imu: [],
    barometer: ['DPS310', 'BMP388'],
    compass: ['RM3100'],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 2,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PC7' },
};

export const yjuavA6se: ExtendedBoardDef = {
  id: 'yjuav_a6se',
  name: 'YJUAV_A6SE',
  description: 'YJUAV_A6SE',
  manufacturer: 'Unknown',
  mcu: 'STM32H750xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-yjuav_a6se.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART6',
    SERIAL3: 'USART3',
    SERIAL4: 'USART1',
    SERIAL5: 'UART8',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 2, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 4, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1127,
  serialOrder: ['OTG1', 'USART2', 'USART6', 'USART3', 'USART1', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [5, 6, 7, 8], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9, 10, 11], timer: 'TIM3', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 11,
  builtinSensors: {
    imu: [],
    barometer: ['DPS310', 'MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI7' },
};

export const yjuavA6seH743: ExtendedBoardDef = {
  id: 'yjuav_a6se_h743',
  name: 'YJUAV_A6SE_H743',
  description: 'YJUAV_A6SE_H743',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-yjuav_a6se_h743.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART6',
    SERIAL3: 'USART3',
    SERIAL4: 'USART1',
    SERIAL5: 'UART8',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 2, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 4, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1141,
  serialOrder: ['OTG1', 'USART2', 'USART6', 'USART3', 'USART1', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [5, 6, 7, 8], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9, 10, 11], timer: 'TIM3', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 11,
  builtinSensors: {
    imu: [],
    barometer: ['DPS310', 'MS5611'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 4, voltMult: 21.0, ampPerVolt: 34.0 },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI7' },
};

export const yjuavA6ultra: ExtendedBoardDef = {
  id: 'yjuav_a6ultra',
  name: 'YJUAV_A6Ultra',
  description: 'YJUAV_A6Ultra',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-yjuav_a6ultra.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'USART2',
    SERIAL2: 'USART6',
    SERIAL3: 'USART3',
    SERIAL4: 'USART1',
    SERIAL5: 'UART8',
    SERIAL6: 'UART7'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX2/RX2', serialIndex: 1, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX6/RX6', serialIndex: 2, uartName: 'USART6', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 3, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 4, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 5, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX7/RX7', serialIndex: 6, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 7, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 1144,
  serialOrder: ['OTG1', 'USART2', 'USART6', 'USART3', 'USART1', 'UART8', 'UART7', 'OTG2'],
  outputGroups: [
    { outputs: [5, 6, 7, 8], timer: 'TIM1', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [12, 13], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM2', capabilities: ['PWM', 'DShot', 'BDShot'] },
    { outputs: [9, 10, 11], timer: 'TIM3', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 13,
  builtinSensors: {
    imu: [],
    barometer: ['DPS310'],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  batteryMonitor: { voltPin: 2, currPin: 4, voltMult: 21.0, ampPerVolt: 34.6 },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI7' },
};

export const zeroonex6: ExtendedBoardDef = {
  id: 'zeroonex6',
  name: 'ZeroOneX6',
  description: 'ZeroOneX6',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-zeroonex6.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART8',
    SERIAL5: 'USART2',
    SERIAL6: 'UART4',
    SERIAL7: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 6, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 7, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 5600,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART8', 'USART2', 'UART4', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM45686', 'BMI088'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const zeroonex6Air: ExtendedBoardDef = {
  id: 'zeroonex6_air',
  name: 'ZeroOneX6_Air',
  description: 'ZeroOneX6_Air',
  manufacturer: 'Unknown',
  mcu: 'STM32H743xx',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-zeroonex6_air.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL1: 'UART7',
    SERIAL2: 'UART5',
    SERIAL3: 'USART1',
    SERIAL4: 'UART8',
    SERIAL5: 'USART2',
    SERIAL6: 'UART4',
    SERIAL7: 'USART3'
  },
  uartPorts: [
    { padLabel: 'USB', serialIndex: 0, uartName: 'OTG1', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 },
    { padLabel: 'TX7/RX7', serialIndex: 1, uartName: 'UART7', hasTx: true, hasRx: true },
    { padLabel: 'TX5/RX5', serialIndex: 2, uartName: 'UART5', hasTx: true, hasRx: true },
    { padLabel: 'TX1/RX1', serialIndex: 3, uartName: 'USART1', hasTx: true, hasRx: true },
    { padLabel: 'TX8/RX8', serialIndex: 4, uartName: 'UART8', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 5, uartName: 'USART2', hasTx: true, hasRx: true },
    { padLabel: 'TX4/RX4', serialIndex: 6, uartName: 'UART4', hasTx: true, hasRx: true },
    { padLabel: 'TX3/RX3', serialIndex: 7, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'USB2', serialIndex: 8, uartName: 'OTG2', hasTx: true, hasRx: true, defaultProtocol: 2, defaultBaud: 115 }
  ],
  confirmed: false,
  apjBoardId: 5600,
  serialOrder: ['OTG1', 'UART7', 'UART5', 'USART1', 'UART8', 'USART2', 'UART4', 'USART3', 'OTG2'],
  outputGroups: [
    { outputs: [7, 8], timer: 'TIM12', capabilities: ['PWM'] },
    { outputs: [5, 6], timer: 'TIM4', capabilities: ['PWM', 'DShot'] },
    { outputs: [1, 2, 3, 4], timer: 'TIM5', capabilities: ['PWM', 'DShot', 'BDShot'] }
  ],
  pwmOutputCount: 8,
  builtinSensors: {
    imu: ['ICM45686'],
    barometer: [],
    compass: [],
    osd: null,
    flash: null,
    sdcard: true,
  },
  i2cBuses: 4,
  hasSafetySwitch: true,
  defaultRcInput: { type: 'timer' as const, padLabel: 'PI5' },
};

export const zubaxgnss: ExtendedBoardDef = {
  id: 'zubaxgnss',
  name: 'ZubaxGNSS',
  description: 'ZubaxGNSS',
  manufacturer: 'Unknown',
  mcu: 'STM32F105xC',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-zubaxgnss.html',
  dimensions: { width: 36, height: 36 },
  formFactor: 'standard',
  connectors: [],  // TODO: add physical connector layout
  uartMap: {
    SERIAL0: 'USART3',
    SERIAL3: 'USART2'
  },
  uartPorts: [
    { padLabel: 'TX3/RX3', serialIndex: 0, uartName: 'USART3', hasTx: true, hasRx: true },
    { padLabel: 'TX2/RX2', serialIndex: 3, uartName: 'USART2', hasTx: true, hasRx: true }
  ],
  confirmed: false,
  apjBoardId: 1005,
  serialOrder: ['USART3', 'EMPTY', 'EMPTY', 'USART2'],
  pwmOutputCount: 0,
  builtinSensors: {
    imu: [],
    barometer: ['MS5611'],
    compass: ['LIS3MDL'],
    osd: null,
    flash: null,
    sdcard: false,
  },
};

// ── Board ID Map ───────────────────────────────────────────────────

export const EXTENDED_BOARD_ID_MAP: Map<number, ExtendedBoardDef> = new Map([
  [1117, blitzf745aio],
  [9, cubeblack],
  [140, cubeorange],
  [1063, cubeorangeplus],
  [1099, flywoof405sAio],
  [1027, flywoof745],
  [9, fmuv3],
  [50, fmuv5],
  [1059, jhemcuGsf405a],
  [122, kakutef4],
  [123, kakutef7],
  [1048, kakuteh7],
  [1105, kakuteh7Wing],
  [1058, kakuteh7mini],
  [1019, mambaf405v2],
  [1073, mambah743v4],
  [125, matekf405Std],
  [1054, matekf405Te],
  [127, matekf405Wing],
  [143, matekf765Wing],
  [1013, matekh743],
  [1023, mrocontrolzeroh7],
  [1017, mropixracerpro],
  [1159, nxtpx4v2],
  [131, omnibusf4pro],
  [9, pixhawk1],
  [50, pixhawk4],
  [56, pixhawk6c],
  [53, pixhawk6x],
  [1135, speedybeef405mini],
  [1165, board3drL431Asauav],
  [1124, board3drcontrolzerog],
  [7120, acctongodwitGa1],
  [1115, acnsCm4pilot],
  [1116, acnsF405aio],
  [1198, aedroxh7],
  [4300, aerocogitoH7digital],
  [1077, aerofoxAirspeed],
  [1104, aerofoxAirspeedDlvr],
  [1109, aerofoxGnssF9p],
  [7110, aerofoxH7],
  [1080, aerofoxPmu],
  [1850, aeromind6x],
  [2024, aetH743Basic],
  [128, airbotf4],
  [1209, airbrainh743],
  [55, airlink],
  [5200, airvoluteDcs2],
  [1146, anyleafh7],
  [5210, aocodaRcH743dual],
  [1134, arF407smartbat],
  [83, arkCannode],
  [59, arkFpv],
  [81, arkGps],
  [58, arkPi6x],
  [82, arkRtkGps],
  [57, arkv6x],
  [57, arkv6xBdshot],
  [1227, atlasControl],
  [1078, atomrcf405navi],
  [1143, atomrcf405naviDeluxe],
  [1026, beastf7],
  [1057, beastf7v2],
  [1025, beasth7],
  [1056, beasth7v2],
  [1125, betafpvF405],
  [1125, betafpvF405I2c],
  [1044, birdcandy],
  [1164, blitzf745],
  [1162, blitzh743pro],
  [1163, blitzminif745],
  [1168, blitzwingh743],
  [1148, botbloxdronenet],
  [2501, botwingf405],
  [1184, brahmaf4],
  [5811, brotherhobbyf405v3],
  [5810, brotherhobbyh743],
  [1085, cRtk2Hp],
  [1064, carbonixf405],
  [1182, cbuH7LcStamp],
  [1156, cbuH7Stamp],
  [1187, corvon405v21],
  [1189, corvon743v1],
  [1177, crazyf405],
  [12, crazyflie2],
  [1158, csky405],
  [1212, cskyPmu],
  [7000, cuav7Nano],
  [17000, cuav7NanoOdid],
  [1009, cuavNora],
  [1009, cuavNoraBdshot],
  [11009, cuavNoraOdid],
  [9, cuavPixhackV3],
  [7001, cuavV6xV2],
  [17001, cuavV6xV2Odid],
  [7002, cuavX25Evo],
  [17002, cuavX25EvoOdid],
  [1010, cuavX7],
  [1010, cuavX7Bdshot],
  [11010, cuavX7Odid],
  [1001, cuavGps],
  [50, cuavv5],
  [50, cuavv5Bdshot],
  [50, cuavv5nano],
  [50, cuavv5nanoBdshot],
  [1003, cubeblackplus],
  [1401, cubeblackPeriph],
  [9, cubegreenSolo],
  [1079, cubenode],
  [1079, cubenodeEth],
  [140, cubeorangeBdshot],
  [1033, cubeorangeJoey],
  [10140, cubeorangeOdid],
  [1400, cubeorangePeriph],
  [1400, cubeorangePeriphHeavy],
  [140, cubeorangeSimonhardware],
  [1063, cubeorangeplusBdshot],
  [11063, cubeorangeplusOdid],
  [1063, cubeorangeplusSimonhardware],
  [9, cubepurple],
  [1069, cuberedprimary],
  [1409, cuberedprimaryPppgw],
  [1070, cuberedsecondary],
  [1070, cuberedsecondaryIo],
  [9, cubesolo],
  [120, cubeyellow],
  [120, cubeyellowBdshot],
  [1190, dakefpvf405],
  [1193, dakefpvh743],
  [1208, dakefpvh743Slim],
  [1194, dakefpvh743pro],
  [1061, deveboxh7v2],
  [5800, droneerf405],
  [13, drotekp3pro],
  [139, durandal],
  [139, durandalBdshot],
  [1000, f103Adsb],
  [1000, f103Airspeed],
  [1000, f103Gps],
  [1000, f103Hwesc],
  [1000, f103Qiotekperiph],
  [1000, f103Rangefinder],
  [1000, f103Trigger],
  [1004, f303Gps],
  [1004, f303Hwesc],
  [1004, f303M10025],
  [1004, f303M10070],
  [1004, f303Matekgps],
  [1004, f303Pwm],
  [1004, f303Tempsensor],
  [1004, f303Universal],
  [135, f35lightning],
  [1014, f405Matekairspeed],
  [1014, f405Matekgps],
  [20, f4by],
  [1530, f4byF427],
  [1531, f4byH743],
  [1067, flyingmoonf407],
  [1068, flyingmoonf427],
  [1112, flyingmoonh743],
  [1361, flysparkf4],
  [1180, flywoof405hdAiov2],
  [1137, flywoof405pro],
  [1042, flywoof745nano],
  [1181, flywooh743pro],
  [9, fmuv2],
  [9, fmuv3Bdshot],
  [1157, foxeerf405v2],
  [1089, foxeerh743v1],
  [1028, freeflyrtk],
  [1027, g4Esc],
  [1502, geprcTakerH743],
  [1501, geprcf745bthd],
  [1071, greensightultrablue],
  [146, h757iEval],
  [146, h757iEvalIntf],
  [1119, heewingF405],
  [1119, heewingF405v2],
  [1043, here4ap],
  [1043, here4fc],
  [1016, hitecmosaic],
  [5401, holybrof4Pmu],
  [5405, holybrog4Airspeed],
  [1088, holybrog4Compass],
  [1053, holybrog4Gps],
  [1035, holybrogps],
  [1173, iflight2rawH7],
  [5713, iomcu],
  [5713, iomcuDshot],
  [5711, iomcuF103],
  [5712, iomcuF1038mhzDshot],
  [5711, iomcuF103Dshot],
  [5712, iomcuF1038mhz],
  [1084, jfb100],
  [1110, jfb110],
  [1081, jhemJhef405],
  [1059, jhemcuGsf405aRx2],
  [1411, jhemcuH743hd],
  [1412, jhemcuf405pro],
  [1169, jhemcuf405wing],
  [5406, kakutef4Wing],
  [1030, kakutef4mini],
  [123, kakutef7Bdshot],
  [145, kakutef7mini],
  [1048, kakuteh7Bdshot],
  [1058, kakuteh7miniNand],
  [1048, kakuteh7v2],
  [1315, khaEth],
  [1250, ktFmuF1],
  [1422, longbowf405wing],
  [4500, lumenierluxf765Ndaa],
  [11, luminousbee4],
  [1029, luminousbee5],
  [1038, mambaf4052022],
  [1038, mambaf405usI2c],
  [125, matekf405],
  [125, matekf405Bdshot],
  [1014, matekf405Can],
  [1054, matekf405TeBdshot],
  [127, matekf405WingBdshot],
  [143, matekf765Se],
  [143, matekf765WingBdshot],
  [1170, matekg474Dshot],
  [1170, matekg474Gps],
  [1170, matekg474Periph],
  [1013, matekh743Bdshot],
  [1013, matekh743Periph],
  [1149, matekh7a3],
  [1228, matekh7a3Wing],
  [1062, matekl431Adsb],
  [1062, matekl431Airspeed],
  [1062, matekl431Apdtelem],
  [1062, matekl431Auav],
  [1062, matekl431Batterytag],
  [1062, matekl431Battmon],
  [1062, matekl431Bdshot],
  [1062, matekl431Dshot],
  [1062, matekl431Efi],
  [1062, matekl431Gps],
  [1062, matekl431Hwtelem],
  [1062, matekl431Maghires],
  [1062, matekl431Periph],
  [1062, matekl431Proximity],
  [1062, matekl431Rangefinder],
  [1062, matekl431Rc],
  [1062, matekl431Serial],
  [188, mazzystardrone],
  [6103, mfeAirspeedCan],
  [6100, mfePdbCan],
  [6101, mfePos3Can],
  [2000, mftSema100],
  [1161, micoair405mini],
  [1150, micoair405v2],
  [1166, micoair743],
  [1176, micoair743Aio],
  [1202, micoair743Lite],
  [1179, micoair743v2],
  [88, mindpxV2],
  [3, miniPix],
  [41775, modalaiFcV1],
  [1210, morakot],
  [1041, mroM10095],
  [1098, mrocanpwmM10126],
  [1022, mrocontrolzeroclassic],
  [141, mrocontrolzerof7],
  [1023, mrocontrolzeroh7Bdshot],
  [1024, mrocontrolzerooemh7],
  [1024, mroczerooemh7Bdshot],
  [1145, mrokitcanrevc],
  [1015, mronexus],
  [1017, mropixracerproBdshot],
  [9, mrox21],
  [136, mrox21777],
  [1222, mupilot],
  [1188, narinfcH5],
  [1183, narinfcH7],
  [1199, narinfcX3],
  [1040, nucleoG491],
  [1051, nucleoL476],
  [1047, nucleoL496],
  [139, nucleoh743],
  [1207, nucleoh753zi],
  [139, nucleoh755],
  [1002, omnibusf4],
  [131, omnibusf4proBdshot],
  [131, omnibusf4proOne],
  [137, omnibusf4v6],
  [121, omnibusf7v2],
  [133, omnibusnanov6],
  [133, omnibusnanov6Bdshot],
  [1191, orbith743],
  [1155, orqaf405pro],
  [1204, orqah7quadcore],
  [50, ph4Mini],
  [50, ph4MiniBdshot],
  [50, pix32v5],
  [1032, pixc4Jetson],
  [1090, pixflamingo],
  [1131, pixflamingoF767],
  [9, pixhawk11m],
  [9, pixhawk11mBdshot],
  [9, pixhawk1Bdshot],
  [50, pixhawk4Bdshot],
  [51, pixhawk5x],
  [56, pixhawk6cBdshot],
  [53, pixhawk6xBdshot],
  [10053, pixhawk6xOdid],
  [1408, pixhawk6xPppgw],
  [1140, pixpilotC3],
  [1096, pixpilotV3],
  [1083, pixpilotV6],
  [1160, pixpilotV6pro],
  [11, pixracer],
  [11, pixracerBdshot],
  [1402, pixracerPeriph],
  [1076, pixsurveya1],
  [1107, pixsurveya1Ind],
  [6104, pixsurveya2Ind],
  [1065, qiotekadeptf407],
  [1021, qiotekzealotf427],
  [1036, qiotekzealoth743],
  [1036, qiotekzealoth743Bdshot],
  [1008, r9pilot],
  [1417, radiolinkf405],
  [1410, radiolinkpix6],
  [1118, radix2hd],
  [1074, reaperf745],
  [1445, resoluteh7],
  [124, revoMini],
  [124, revoMiniBdshot],
  [124, revoMiniI2c],
  [124, revoMiniI2cBdshot],
  [124, revoMiniSd],
  [1102, rfcu],
  [1103, rgnss],
  [1111, sdmodelh7v1],
  [1167, sdmodelh7v2],
  [1195, sequreh743],
  [1052, sierraF405],
  [1055, sierraF412],
  [1034, sierraF9p],
  [1050, sierraL431],
  [1095, sierraPrecisionpoint],
  [5302, sierraTruenavic],
  [1091, sierraTruenavpro],
  [5301, sierraTruenavproG4],
  [1093, sierraTruenorth],
  [1094, sierraTruespeed],
  [1123, siyiN7],
  [2815, skyrukhSurgeH7],
  [2714, skysakurah743],
  [1201, skystarsf405v2],
  [1075, skystarsh7hd],
  [1075, skystarsh7hdBdshot],
  [1075, skystarsh7hdv2],
  [9, skyviperF412Rev1],
  [9, skyviperJourney],
  [9, skyviperV2450],
  [130, sparky2],
  [1197, spedixf405],
  [1196, spedixh743],
  [134, speedybeef4],
  [5271, speedybeef405aio],
  [1106, speedybeef405wing],
  [1082, speedybeef4v3],
  [1136, speedybeef4v4],
  [5272, speedybeef4v5],
  [1060, spracingh7],
  [1108, spracingh7rf],
  [1500, stellarf4],
  [1504, stellarf4v2],
  [1503, stellarh7v2],
  [1011, succexf4],
  [2005, sulilgh7P1P2],
  [6110, svehicleE2],
  [6001, swBoomF407],
  [6000, swSparF407],
  [50, swanK1],
  [50, tbsColibriF7],
  [5252, tbsL431Airspeed],
  [5252, tbsL431Battmon],
  [5252, tbsL431Currmon],
  [5252, tbsL431Pwm],
  [5250, tbsLucidH7],
  [5253, tbsLucidH7Wing],
  [5254, tbsLucidH7WingAio],
  [5251, tbsLucidPro],
  [212, thepeachK1],
  [213, thepeachR1],
  [1138, tmotorh743],
  [5234, uavDevAuavG4],
  [5230, uavDevFcUm982],
  [5233, uavDevPowermodule],
  [5222, uavDevM10s],
  [1407, vmL431Batterytag],
  [5820, vmL431Bms],
  [1407, vmL431PeriphPico],
  [1407, vmL431SrvHub4chp],
  [1151, vrbrainV51],
  [1152, vrbrainV52],
  [1154, vrbrainV54],
  [1910, vrcoreV10],
  [1351, vrubrainV51],
  [7100, vuavV7pro],
  [1203, xMavApH743r1],
  [1174, xMavApH743v2],
  [1234, yariv6x],
  [1113, yjuavA6],
  [1127, yjuavA6se],
  [1141, yjuavA6seH743],
  [1144, yjuavA6ultra],
  [5600, zeroonex6],
  [5600, zeroonex6Air],
  [1005, zubaxgnss]
]);

// ── All Extended Boards ────────────────────────────────────────────

export const ALL_EXTENDED_BOARDS: ExtendedBoardDef[] = [
  blitzf745aio,
  cubeblack,
  cubeorange,
  cubeorangeplus,
  flywoof405sAio,
  flywoof745,
  fmuv3,
  fmuv5,
  jhemcuGsf405a,
  kakutef4,
  kakutef7,
  kakuteh7,
  kakuteh7Wing,
  kakuteh7mini,
  mambaf405v2,
  mambah743v4,
  matekf405Std,
  matekf405Te,
  matekf405Wing,
  matekf765Wing,
  matekh743,
  mrocontrolzeroh7,
  mropixracerpro,
  nxtpx4v2,
  omnibusf4pro,
  pixhawk1,
  pixhawk4,
  pixhawk6c,
  pixhawk6x,
  speedybeef405mini,
  board3drL431Asauav,
  board3drcontrolzerog,
  acctongodwitGa1,
  acnsCm4pilot,
  acnsF405aio,
  aedroxh7,
  aerocogitoH7digital,
  aerofoxAirspeed,
  aerofoxAirspeedDlvr,
  aerofoxGnssF9p,
  aerofoxH7,
  aerofoxPmu,
  aeromind6x,
  aetH743Basic,
  airbotf4,
  airbrainh743,
  airlink,
  airvoluteDcs2,
  anyleafh7,
  aocodaRcH743dual,
  arF407smartbat,
  arkCannode,
  arkFpv,
  arkGps,
  arkPi6x,
  arkRtkGps,
  arkv6x,
  arkv6xBdshot,
  atlasControl,
  atomrcf405navi,
  atomrcf405naviDeluxe,
  beastf7,
  beastf7v2,
  beasth7,
  beasth7v2,
  betafpvF405,
  betafpvF405I2c,
  birdcandy,
  blitzf745,
  blitzh743pro,
  blitzminif745,
  blitzwingh743,
  botbloxdronenet,
  botwingf405,
  brahmaf4,
  brotherhobbyf405v3,
  brotherhobbyh743,
  cRtk2Hp,
  carbonixf405,
  cbuH7LcStamp,
  cbuH7Stamp,
  corvon405v21,
  corvon743v1,
  crazyf405,
  crazyflie2,
  csky405,
  cskyPmu,
  cuav7Nano,
  cuav7NanoOdid,
  cuavNora,
  cuavNoraBdshot,
  cuavNoraOdid,
  cuavPixhackV3,
  cuavV6xV2,
  cuavV6xV2Odid,
  cuavX25Evo,
  cuavX25EvoOdid,
  cuavX7,
  cuavX7Bdshot,
  cuavX7Odid,
  cuavGps,
  cuavv5,
  cuavv5Bdshot,
  cuavv5nano,
  cuavv5nanoBdshot,
  cubeblackplus,
  cubeblackPeriph,
  cubegreenSolo,
  cubenode,
  cubenodeEth,
  cubeorangeBdshot,
  cubeorangeJoey,
  cubeorangeOdid,
  cubeorangePeriph,
  cubeorangePeriphHeavy,
  cubeorangeSimonhardware,
  cubeorangeplusBdshot,
  cubeorangeplusOdid,
  cubeorangeplusSimonhardware,
  cubepurple,
  cuberedprimary,
  cuberedprimaryPppgw,
  cuberedsecondary,
  cuberedsecondaryIo,
  cubesolo,
  cubeyellow,
  cubeyellowBdshot,
  dakefpvf405,
  dakefpvh743,
  dakefpvh743Slim,
  dakefpvh743pro,
  deveboxh7v2,
  droneerf405,
  drotekp3pro,
  durandal,
  durandalBdshot,
  f103Adsb,
  f103Airspeed,
  f103Gps,
  f103Hwesc,
  f103Qiotekperiph,
  f103Rangefinder,
  f103Trigger,
  f303Gps,
  f303Hwesc,
  f303M10025,
  f303M10070,
  f303Matekgps,
  f303Pwm,
  f303Tempsensor,
  f303Universal,
  f35lightning,
  f405Matekairspeed,
  f405Matekgps,
  f4by,
  f4byF427,
  f4byH743,
  flyingmoonf407,
  flyingmoonf427,
  flyingmoonh743,
  flysparkf4,
  flywoof405hdAiov2,
  flywoof405pro,
  flywoof745nano,
  flywooh743pro,
  fmuv2,
  fmuv3Bdshot,
  foxeerf405v2,
  foxeerh743v1,
  freeflyrtk,
  g4Esc,
  geprcTakerH743,
  geprcf745bthd,
  greensightultrablue,
  h757iEval,
  h757iEvalIntf,
  heewingF405,
  heewingF405v2,
  here4ap,
  here4fc,
  hitecmosaic,
  holybrof4Pmu,
  holybrog4Airspeed,
  holybrog4Compass,
  holybrog4Gps,
  holybrogps,
  iflight2rawH7,
  iomcu,
  iomcuDshot,
  iomcuF103,
  iomcuF1038mhzDshot,
  iomcuF103Dshot,
  iomcuF1038mhz,
  jfb100,
  jfb110,
  jhemJhef405,
  jhemcuGsf405aRx2,
  jhemcuH743hd,
  jhemcuf405pro,
  jhemcuf405wing,
  kakutef4Wing,
  kakutef4mini,
  kakutef7Bdshot,
  kakutef7mini,
  kakuteh7Bdshot,
  kakuteh7miniNand,
  kakuteh7v2,
  khaEth,
  ktFmuF1,
  longbowf405wing,
  lumenierluxf765Ndaa,
  luminousbee4,
  luminousbee5,
  mambaf4052022,
  mambaf405usI2c,
  matekf405,
  matekf405Bdshot,
  matekf405Can,
  matekf405TeBdshot,
  matekf405WingBdshot,
  matekf765Se,
  matekf765WingBdshot,
  matekg474Dshot,
  matekg474Gps,
  matekg474Periph,
  matekh743Bdshot,
  matekh743Periph,
  matekh7a3,
  matekh7a3Wing,
  matekl431Adsb,
  matekl431Airspeed,
  matekl431Apdtelem,
  matekl431Auav,
  matekl431Batterytag,
  matekl431Battmon,
  matekl431Bdshot,
  matekl431Dshot,
  matekl431Efi,
  matekl431Gps,
  matekl431Hwtelem,
  matekl431Maghires,
  matekl431Periph,
  matekl431Proximity,
  matekl431Rangefinder,
  matekl431Rc,
  matekl431Serial,
  mazzystardrone,
  mfeAirspeedCan,
  mfePdbCan,
  mfePos3Can,
  mftSema100,
  micoair405mini,
  micoair405v2,
  micoair743,
  micoair743Aio,
  micoair743Lite,
  micoair743v2,
  mindpxV2,
  miniPix,
  modalaiFcV1,
  morakot,
  mroM10095,
  mrocanpwmM10126,
  mrocontrolzeroclassic,
  mrocontrolzerof7,
  mrocontrolzeroh7Bdshot,
  mrocontrolzerooemh7,
  mroczerooemh7Bdshot,
  mrokitcanrevc,
  mronexus,
  mropixracerproBdshot,
  mrox21,
  mrox21777,
  mupilot,
  narinfcH5,
  narinfcH7,
  narinfcX3,
  nucleoG491,
  nucleoL476,
  nucleoL496,
  nucleoh743,
  nucleoh753zi,
  nucleoh755,
  omnibusf4,
  omnibusf4proBdshot,
  omnibusf4proOne,
  omnibusf4v6,
  omnibusf7v2,
  omnibusnanov6,
  omnibusnanov6Bdshot,
  orbith743,
  orqaf405pro,
  orqah7quadcore,
  ph4Mini,
  ph4MiniBdshot,
  pix32v5,
  pixc4Jetson,
  pixflamingo,
  pixflamingoF767,
  pixhawk11m,
  pixhawk11mBdshot,
  pixhawk1Bdshot,
  pixhawk4Bdshot,
  pixhawk5x,
  pixhawk6cBdshot,
  pixhawk6xBdshot,
  pixhawk6xOdid,
  pixhawk6xPppgw,
  pixpilotC3,
  pixpilotV3,
  pixpilotV6,
  pixpilotV6pro,
  pixracer,
  pixracerBdshot,
  pixracerPeriph,
  pixsurveya1,
  pixsurveya1Ind,
  pixsurveya2Ind,
  qiotekadeptf407,
  qiotekzealotf427,
  qiotekzealoth743,
  qiotekzealoth743Bdshot,
  r9pilot,
  radiolinkf405,
  radiolinkpix6,
  radix2hd,
  reaperf745,
  resoluteh7,
  revoMini,
  revoMiniBdshot,
  revoMiniI2c,
  revoMiniI2cBdshot,
  revoMiniSd,
  rfcu,
  rgnss,
  sdmodelh7v1,
  sdmodelh7v2,
  sequreh743,
  sierraF405,
  sierraF412,
  sierraF9p,
  sierraL431,
  sierraPrecisionpoint,
  sierraTruenavic,
  sierraTruenavpro,
  sierraTruenavproG4,
  sierraTruenorth,
  sierraTruespeed,
  siyiN7,
  skyrukhSurgeH7,
  skysakurah743,
  skystarsf405v2,
  skystarsh7hd,
  skystarsh7hdBdshot,
  skystarsh7hdv2,
  skyviperF412Rev1,
  skyviperJourney,
  skyviperV2450,
  sparky2,
  spedixf405,
  spedixh743,
  speedybeef4,
  speedybeef405aio,
  speedybeef405wing,
  speedybeef4v3,
  speedybeef4v4,
  speedybeef4v5,
  spracingh7,
  spracingh7rf,
  stellarf4,
  stellarf4v2,
  stellarh7v2,
  succexf4,
  sulilgh7P1P2,
  svehicleE2,
  swBoomF407,
  swSparF407,
  swanK1,
  tbsColibriF7,
  tbsL431Airspeed,
  tbsL431Battmon,
  tbsL431Currmon,
  tbsL431Pwm,
  tbsLucidH7,
  tbsLucidH7Wing,
  tbsLucidH7WingAio,
  tbsLucidPro,
  thepeachK1,
  thepeachR1,
  tmotorh743,
  uavDevAuavG4,
  uavDevFcUm982,
  uavDevPowermodule,
  uavDevM10s,
  vmL431Batterytag,
  vmL431Bms,
  vmL431PeriphPico,
  vmL431SrvHub4chp,
  vrbrainV51,
  vrbrainV52,
  vrbrainV54,
  vrcoreV10,
  vrubrainV51,
  vuavV7pro,
  xMavApH743r1,
  xMavApH743v2,
  yariv6x,
  yjuavA6,
  yjuavA6se,
  yjuavA6seH743,
  yjuavA6ultra,
  zeroonex6,
  zeroonex6Air,
  zubaxgnss
];

/**
 * Find an extended board definition by APJ_BOARD_ID.
 */
export function getExtendedBoard(apjBoardId: number): ExtendedBoardDef | null {
  return EXTENDED_BOARD_ID_MAP.get(apjBoardId) ?? null;
}

/**
 * Find an extended board definition by folder name.
 */
export function getExtendedBoardByName(name: string): ExtendedBoardDef | null {
  return ALL_EXTENDED_BOARDS.find(b => b.id === name.toLowerCase()) ?? null;
}
