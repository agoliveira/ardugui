/**
 * Board Registry
 *
 * Maps detected flight controller boards to their physical connector
 * layouts, serial port mappings, and documentation links.
 *
 * Sources: ArduPilot hwdef.dat files, wiki pages, manufacturer docs.
 * Detection via USB vendor/product IDs from serial enumeration.
 */

export interface BoardConnector {
  /** Connector label printed on the board */
  label: string;
  /** What SERIAL port this maps to (e.g. 'SERIAL1') */
  serialPort?: string;
  /** Default protocol name */
  defaultProtocol?: string;
  /** Physical connector type */
  connector: string;
  /** Which side: top, bottom, left, right */
  side: 'top' | 'bottom' | 'left' | 'right';
  /** Order along that side (0 = first) */
  order: number;
}

// ── UART Port Mapping System ─────────────────────────────────────────────

/**
 * A quirk/requirement that must be satisfied when a specific protocol
 * is assigned to a specific port on a specific board.
 */
export interface ProtocolQuirk {
  /** Human-readable description of what this quirk does */
  description: string;
  /** Parameters that must be set (auto-applied when user selects this combo) */
  params: Record<string, number>;
  /** Whether a reboot is required after applying */
  needsReboot?: boolean;
  /** Wiring note shown to user (e.g. "TX2 must also be connected") */
  wiringNote?: string;
}

/**
 * Physical UART port on a flight controller board.
 * Maps the silkscreened pad label to the ArduPilot SERIAL index,
 * with optional per-protocol quirks.
 */
export interface BoardUartPort {
  /** Physical label as printed on the PCB (e.g. "TX2/RX2") */
  padLabel: string;
  /** ArduPilot SERIAL index this maps to (e.g. 6 for SERIAL6) */
  serialIndex: number;
  /** Human-readable UART name from the MCU (e.g. "USART2") */
  uartName: string;
  /** Whether this port has TX capability */
  hasTx: boolean;
  /** Whether this port has RX capability */
  hasRx: boolean;
  /** Whether DMA is available on RX (matters for high baud rates) */
  rxDma?: boolean;
  /** Default protocol (what ships from factory / ArduPilot default) */
  defaultProtocol?: number;
  /** Default baud rate */
  defaultBaud?: number;
  /** Suggested use case (shown as hint text) */
  suggestedUse?: string;
  /** Protocols that are NOT supported on this port (with reason) */
  unsupportedProtocols?: { protocol: number; reason: string }[];
  /**
   * Per-protocol quirks: extra params that must be set, wiring notes, etc.
   * Key is the protocol value (e.g. 23 for RCIN).
   */
  quirks?: Record<number, ProtocolQuirk>;
  /** If true, this port requires a special config to even function as UART */
  requiresAltConfig?: {
    /** Param to set */
    param: string;
    /** Value to set */
    value: number;
    /** What the port is by default (before alt config) */
    defaultMode: string;
  };
}

export interface BoardDef {
  id: string;
  name: string;
  description: string;
  manufacturer: string;
  mcu: string;
  /** ArduPilot wiki URL */
  wikiUrl: string;
  /** USB vendor ID (hex, lowercase) */
  usbVendorId?: string;
  /** USB product ID (hex, lowercase) */
  usbProductId?: string;
  /** Board dimensions in mm */
  dimensions: { width: number; height: number };
  /** Form factor for SVG shape */
  formFactor: 'standard' | 'mini' | 'cube';
  /** Physical connectors */
  connectors: BoardConnector[];
  /** UART mapping summary: SERIAL# → physical label */
  uartMap: Record<string, string>;
  /**
   * Detailed UART port definitions with physical labels, quirks, and auto-config.
   * When present, the Ports page uses these instead of the generic SERIAL list.
   */
  uartPorts?: BoardUartPort[];
}

// ============================================================
// Pixhawk 2.4.8 / mRo Pixhawk 1 (FMUv3)
// SERIAL_ORDER: OTG1 USART2 USART3 UART4 UART8 USART1
// ============================================================
const pixhawk1: BoardDef = {
  id: 'pixhawk1',
  name: 'Pixhawk 2.4.8',
  description: '3DR / mRo Pixhawk 1 (FMUv3)',
  manufacturer: '3D Robotics / mRo',
  mcu: 'STM32F427',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-pixhawk-overview.html',
  usbVendorId: '26ac',
  usbProductId: '0011',
  dimensions: { width: 82, height: 50 },
  formFactor: 'standard',
  uartMap: {
    'SERIAL0': 'USB',
    'SERIAL1': 'TELEM1',
    'SERIAL2': 'TELEM2',
    'SERIAL3': 'GPS',
    'SERIAL4': 'SERIAL4/5',
    'SERIAL5': 'Debug Console',
  },
  uartPorts: [
    {
      padLabel: 'USB',
      serialIndex: 0,
      uartName: 'OTG1',
      hasTx: true,
      hasRx: true,
      defaultProtocol: 2,
      defaultBaud: 115,
      suggestedUse: 'GCS connection (your current link)',
    },
    {
      padLabel: 'TELEM1',
      serialIndex: 1,
      uartName: 'USART2',
      hasTx: true,
      hasRx: true,
      rxDma: true,
      defaultProtocol: 2,
      defaultBaud: 57,
      suggestedUse: 'Telemetry radio (SiK, RFD900) or WiFi bridge',
    },
    {
      padLabel: 'TELEM2',
      serialIndex: 2,
      uartName: 'USART3',
      hasTx: true,
      hasRx: true,
      rxDma: true,
      defaultProtocol: 2,
      defaultBaud: 57,
      suggestedUse: 'Second telemetry link, companion computer, or FrSky',
    },
    {
      padLabel: 'GPS',
      serialIndex: 3,
      uartName: 'UART4',
      hasTx: true,
      hasRx: true,
      rxDma: false,
      defaultProtocol: 5,
      defaultBaud: 115,
      suggestedUse: 'GPS receiver (primary)',
    },
    {
      padLabel: 'SERIAL4/5',
      serialIndex: 4,
      uartName: 'UART8',
      hasTx: true,
      hasRx: true,
      rxDma: false,
      defaultProtocol: 5,
      defaultBaud: 115,
      suggestedUse: 'Second GPS, rangefinder, or optical flow',
    },
    {
      padLabel: 'Debug',
      serialIndex: 5,
      uartName: 'USART1',
      hasTx: true,
      hasRx: true,
      rxDma: false,
      defaultProtocol: -1,
      defaultBaud: 57,
      suggestedUse: 'Debug console (not typically used in flight)',
    },
  ],
  connectors: [
    // Top edge (connector side with small ports)
    { label: 'GPS', serialPort: 'SERIAL3', defaultProtocol: 'GPS', connector: 'DF13 6-pin', side: 'top', order: 0 },
    { label: 'I²C', connector: 'DF13 4-pin', side: 'top', order: 1 },
    { label: 'SERIAL4/5', serialPort: 'SERIAL4', defaultProtocol: 'GPS', connector: 'DF13 6-pin', side: 'top', order: 2 },
    { label: 'ADC 6.6V', connector: 'DF13 3-pin', side: 'top', order: 3 },
    { label: 'ADC 3.3V', connector: 'DF13 3-pin', side: 'top', order: 4 },
    // Bottom edge
    { label: 'POWER', connector: 'DF13 6-pin', side: 'bottom', order: 0 },
    { label: 'SWITCH', connector: 'DF13 3-pin', side: 'bottom', order: 1 },
    { label: 'BUZZER', connector: 'DF13 2-pin', side: 'bottom', order: 2 },
    { label: 'TELEM1', serialPort: 'SERIAL1', defaultProtocol: 'MAVLink', connector: 'DF13 6-pin', side: 'bottom', order: 3 },
    { label: 'TELEM2', serialPort: 'SERIAL2', defaultProtocol: 'MAVLink', connector: 'DF13 6-pin', side: 'bottom', order: 4 },
    // Left edge
    { label: 'USB', serialPort: 'SERIAL0', defaultProtocol: 'MAVLink', connector: 'Micro USB', side: 'left', order: 0 },
    { label: 'RC IN', connector: 'S.Bus / PPM', side: 'left', order: 1 },
    // Right edge
    { label: 'MAIN OUT 1-8', connector: '3-pin servo ×8', side: 'right', order: 0 },
    { label: 'AUX OUT 1-6', connector: '3-pin servo ×6', side: 'right', order: 1 },
  ],
};

// ============================================================
// CubePilot Cube Black (Standard Carrier Board)
// SERIAL_ORDER: OTG1 USART2 USART3 UART4 UART8 UART7
// ============================================================
const cubeBlack: BoardDef = {
  id: 'cubeblack',
  name: 'Cube Black',
  description: 'CubePilot Cube Black on Standard Carrier Board',
  manufacturer: 'CubePilot',
  mcu: 'STM32F427',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-thecube-overview.html',
  usbVendorId: '2dae',
  usbProductId: '0010',
  dimensions: { width: 95, height: 44 },
  formFactor: 'cube',
  uartMap: {
    'SERIAL0': 'USB',
    'SERIAL1': 'TELEM1',
    'SERIAL2': 'TELEM2',
    'SERIAL3': 'GPS1',
    'SERIAL4': 'GPS2',
    'SERIAL5': 'Debug Console',
  },
  connectors: [
    { label: 'GPS1', serialPort: 'SERIAL3', defaultProtocol: 'GPS', connector: 'JST-GH 8-pin', side: 'top', order: 0 },
    { label: 'GPS2', serialPort: 'SERIAL4', defaultProtocol: 'GPS', connector: 'JST-GH 6-pin', side: 'top', order: 1 },
    { label: 'I²C 2', connector: 'JST-GH 4-pin', side: 'top', order: 2 },
    { label: 'CAN1', connector: 'JST-GH 4-pin', side: 'top', order: 3 },
    { label: 'CAN2', connector: 'JST-GH 4-pin', side: 'top', order: 4 },
    { label: 'POWER1', connector: 'JST-GH 6-pin', side: 'bottom', order: 0 },
    { label: 'POWER2', connector: 'JST-GH 6-pin', side: 'bottom', order: 1 },
    { label: 'TELEM1', serialPort: 'SERIAL1', defaultProtocol: 'MAVLink', connector: 'JST-GH 6-pin', side: 'bottom', order: 2 },
    { label: 'TELEM2', serialPort: 'SERIAL2', defaultProtocol: 'MAVLink', connector: 'JST-GH 6-pin', side: 'bottom', order: 3 },
    { label: 'USB', serialPort: 'SERIAL0', defaultProtocol: 'MAVLink', connector: 'Micro USB', side: 'left', order: 0 },
    { label: 'RC IN', connector: 'S.Bus / PPM / Spektrum', side: 'left', order: 1 },
    { label: 'MAIN OUT 1-8', connector: '3-pin servo ×8', side: 'right', order: 0 },
    { label: 'AUX OUT 1-6', connector: '3-pin servo ×6', side: 'right', order: 1 },
  ],
};

// ============================================================
// CubePilot Cube Orange (Standard Carrier Board)
// SERIAL_ORDER: OTG1 USART2 USART3 UART4 UART8 UART7 OTG2
// ============================================================
const cubeOrange: BoardDef = {
  id: 'cubeorange',
  name: 'Cube Orange',
  description: 'CubePilot Cube Orange on Standard Carrier Board',
  manufacturer: 'CubePilot',
  mcu: 'STM32H757',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-thecubeorange-overview.html',
  usbVendorId: '2dae',
  usbProductId: '0016',
  dimensions: { width: 95, height: 44 },
  formFactor: 'cube',
  uartMap: {
    'SERIAL0': 'USB',
    'SERIAL1': 'TELEM1',
    'SERIAL2': 'TELEM2',
    'SERIAL3': 'GPS1',
    'SERIAL4': 'GPS2',
    'SERIAL5': 'Debug / ADS-B',
    'SERIAL6': 'USB2 (SLCAN)',
  },
  connectors: [
    { label: 'GPS1', serialPort: 'SERIAL3', defaultProtocol: 'GPS', connector: 'JST-GH 8-pin', side: 'top', order: 0 },
    { label: 'GPS2', serialPort: 'SERIAL4', defaultProtocol: 'GPS', connector: 'JST-GH 6-pin', side: 'top', order: 1 },
    { label: 'I²C 2', connector: 'JST-GH 4-pin', side: 'top', order: 2 },
    { label: 'CAN1', connector: 'JST-GH 4-pin', side: 'top', order: 3 },
    { label: 'CAN2', connector: 'JST-GH 4-pin', side: 'top', order: 4 },
    { label: 'POWER1', connector: 'JST-GH 6-pin', side: 'bottom', order: 0 },
    { label: 'POWER2', connector: 'JST-GH 6-pin', side: 'bottom', order: 1 },
    { label: 'TELEM1', serialPort: 'SERIAL1', defaultProtocol: 'MAVLink', connector: 'JST-GH 6-pin', side: 'bottom', order: 2 },
    { label: 'TELEM2', serialPort: 'SERIAL2', defaultProtocol: 'MAVLink', connector: 'JST-GH 6-pin', side: 'bottom', order: 3 },
    { label: 'USB', serialPort: 'SERIAL0', defaultProtocol: 'MAVLink', connector: 'Micro USB', side: 'left', order: 0 },
    { label: 'RC IN', connector: 'S.Bus / PPM / Spektrum', side: 'left', order: 1 },
    { label: 'MAIN OUT 1-8', connector: '3-pin servo ×8', side: 'right', order: 0 },
    { label: 'AUX OUT 1-6', connector: '3-pin servo ×6', side: 'right', order: 1 },
  ],
};

// ============================================================
// Holybro Pixhawk 6X
// SERIAL_ORDER: OTG1 USART1 USART3 USART6 UART4 UART5 UART7 UART8 OTG2
// ============================================================
const pixhawk6x: BoardDef = {
  id: 'pixhawk6x',
  name: 'Pixhawk 6X',
  description: 'Holybro Pixhawk 6X (FMUv6X)',
  manufacturer: 'Holybro',
  mcu: 'STM32H753',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-holybro-pixhawk6X.html',
  usbVendorId: '3162',
  usbProductId: '004b',
  dimensions: { width: 85, height: 44 },
  formFactor: 'standard',
  uartMap: {
    'SERIAL0': 'USB',
    'SERIAL1': 'TELEM1',
    'SERIAL2': 'TELEM2',
    'SERIAL3': 'TELEM3',
    'SERIAL4': 'GPS1',
    'SERIAL5': 'GPS2',
    'SERIAL6': 'UART4',
    'SERIAL7': 'Debug Console',
    'SERIAL8': 'USB2 (SLCAN)',
  },
  connectors: [
    { label: 'GPS1', serialPort: 'SERIAL4', defaultProtocol: 'GPS', connector: 'JST-GH 10-pin', side: 'top', order: 0 },
    { label: 'GPS2', serialPort: 'SERIAL5', defaultProtocol: 'GPS', connector: 'JST-GH 6-pin', side: 'top', order: 1 },
    { label: 'CAN1', connector: 'JST-GH 4-pin', side: 'top', order: 2 },
    { label: 'CAN2', connector: 'JST-GH 4-pin', side: 'top', order: 3 },
    { label: 'POWER1', connector: 'JST-GH 6-pin', side: 'bottom', order: 0 },
    { label: 'POWER2', connector: 'JST-GH 6-pin', side: 'bottom', order: 1 },
    { label: 'TELEM1', serialPort: 'SERIAL1', defaultProtocol: 'MAVLink', connector: 'JST-GH 6-pin', side: 'bottom', order: 2 },
    { label: 'TELEM2', serialPort: 'SERIAL2', defaultProtocol: 'MAVLink', connector: 'JST-GH 6-pin', side: 'bottom', order: 3 },
    { label: 'TELEM3', serialPort: 'SERIAL3', defaultProtocol: 'MAVLink', connector: 'JST-GH 6-pin', side: 'bottom', order: 4 },
    { label: 'USB-C', serialPort: 'SERIAL0', defaultProtocol: 'MAVLink', connector: 'USB-C', side: 'left', order: 0 },
    { label: 'RC IN', connector: 'JST-GH 3-pin', side: 'left', order: 1 },
    { label: 'ETH', connector: 'JST-GH 4-pin', side: 'left', order: 2 },
    { label: 'FMU PWM OUT', connector: 'JST-GH 16-pin', side: 'right', order: 0 },
    { label: 'I/O PWM OUT', connector: 'JST-GH 10-pin', side: 'right', order: 1 },
  ],
};

// ============================================================
// Holybro Pixhawk 6C
// SERIAL_ORDER: OTG1 USART2 USART3 USART1 UART4 UART3 UART7 OTG2
// ============================================================
const pixhawk6c: BoardDef = {
  id: 'pixhawk6c',
  name: 'Pixhawk 6C',
  description: 'Holybro Pixhawk 6C (FMUv6C)',
  manufacturer: 'Holybro',
  mcu: 'STM32H743',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-holybro-pixhawk6C.html',
  usbVendorId: '3162',
  usbProductId: '004c',
  dimensions: { width: 84, height: 44 },
  formFactor: 'standard',
  uartMap: {
    'SERIAL0': 'USB',
    'SERIAL1': 'TELEM1',
    'SERIAL2': 'TELEM2',
    'SERIAL3': 'GPS1',
    'SERIAL4': 'GPS2 / UART4',
    'SERIAL5': 'UART3',
    'SERIAL6': 'Debug Console',
    'SERIAL7': 'USB2 (SLCAN)',
  },
  connectors: [
    { label: 'GPS1', serialPort: 'SERIAL3', defaultProtocol: 'GPS', connector: 'JST-GH 10-pin', side: 'top', order: 0 },
    { label: 'GPS2', serialPort: 'SERIAL4', defaultProtocol: 'GPS', connector: 'JST-GH 6-pin', side: 'top', order: 1 },
    { label: 'CAN1/2', connector: 'JST-GH 4-pin', side: 'top', order: 2 },
    { label: 'POWER1', connector: 'JST-GH 6-pin', side: 'bottom', order: 0 },
    { label: 'POWER2', connector: 'JST-GH 6-pin', side: 'bottom', order: 1 },
    { label: 'TELEM1', serialPort: 'SERIAL1', defaultProtocol: 'MAVLink', connector: 'JST-GH 6-pin', side: 'bottom', order: 2 },
    { label: 'TELEM2', serialPort: 'SERIAL2', defaultProtocol: 'MAVLink', connector: 'JST-GH 6-pin', side: 'bottom', order: 3 },
    { label: 'USB-C', serialPort: 'SERIAL0', defaultProtocol: 'MAVLink', connector: 'USB-C', side: 'left', order: 0 },
    { label: 'RC IN', connector: 'JST-GH 3-pin', side: 'left', order: 1 },
    { label: 'FMU PWM OUT', connector: 'JST-GH 16-pin', side: 'right', order: 0 },
    { label: 'I/O PWM OUT', connector: 'JST-GH 10-pin', side: 'right', order: 1 },
  ],
};

// ============================================================
// Matek H743-WING
// SERIAL_ORDER: OTG1 UART7 USART1 USART3 UART4 UART6 USART2 UART8
// ============================================================
const matekH743Wing: BoardDef = {
  id: 'matekh743wing',
  name: 'Matek H743-WING',
  description: 'Matek H743-WING V2/V3 (wing/plane FC with PDB)',
  manufacturer: 'Matek Systems',
  mcu: 'STM32H743',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekh743-wing.html',
  usbVendorId: '0483',
  usbProductId: '5740',
  dimensions: { width: 53, height: 46 },
  formFactor: 'mini',
  uartMap: {
    'SERIAL0': 'USB',
    'SERIAL1': 'UART7 (TX7/RX7 pads)',
    'SERIAL2': 'USART1 (TX1/RX1 pads)',
    'SERIAL3': 'USART3 (TX3/RX3 pads)',
    'SERIAL4': 'UART4 (TX4/RX4 pads)',
    'SERIAL5': 'UART6 (TX6/RX6 pads)',
    'SERIAL6': 'USART2 (TX2/RX2 pads)',
    'SERIAL7': 'UART8 (RX only)',
  },
  connectors: [
    { label: 'TX1/RX1', serialPort: 'SERIAL2', defaultProtocol: 'MAVLink', connector: 'Solder pads', side: 'top', order: 0 },
    { label: 'TX3/RX3', serialPort: 'SERIAL3', defaultProtocol: 'GPS', connector: 'Solder pads', side: 'top', order: 1 },
    { label: 'TX4/RX4', serialPort: 'SERIAL4', defaultProtocol: 'GPS', connector: 'Solder pads', side: 'top', order: 2 },
    { label: 'TX7/RX7', serialPort: 'SERIAL1', defaultProtocol: 'MAVLink', connector: 'Solder pads', side: 'top', order: 3 },
    { label: 'I2C2', connector: 'JST-GH 4-pin', side: 'top', order: 4 },
    { label: 'CAN', connector: 'JST-GH 4-pin', side: 'top', order: 5 },
    { label: 'USB-C', serialPort: 'SERIAL0', defaultProtocol: 'MAVLink', connector: 'USB-C', side: 'left', order: 0 },
    { label: 'RX6', connector: 'PPM / S.Bus', side: 'left', order: 1 },
    { label: 'S1-S8', connector: 'Solder pads', side: 'bottom', order: 0 },
    { label: 'S9-S13', connector: 'Solder pads', side: 'bottom', order: 1 },
    { label: 'BAT/ESC', connector: 'Solder pads', side: 'bottom', order: 2 },
    { label: 'Airspeed', connector: 'ADC pad', side: 'right', order: 0 },
    { label: 'Buzzer', connector: 'Solder pads', side: 'right', order: 1 },
    { label: 'LED', connector: 'Solder pads', side: 'right', order: 2 },
  ],
};

// ============================================================
// Matek F405-VTOL (MatekF405-TE family)
// Firmware: MatekF405-TE -- APJ_BOARD_ID 1054
// SERIAL_ORDER: OTG1 USART1 USART3 UART5 UART4 USART6 USART2
// ============================================================
const matekF405TE: BoardDef = {
  id: 'matekf405te',
  name: 'Matek F405-VTOL',
  description: 'Matek F405-VTOL / F405-TE family (VTOL FC with OSD, PDB, 12 outputs)',
  manufacturer: 'Matek Systems',
  mcu: 'STM32F405',
  wikiUrl: 'https://ardupilot.org/copter/docs/common-matekf405-te.html',
  usbVendorId: '0483',
  usbProductId: '5740',
  dimensions: { width: 45, height: 42 },
  formFactor: 'mini',
  uartMap: {
    'SERIAL0': 'USB',
    'SERIAL1': 'USART1 (TX1/RX1 pads)',
    'SERIAL2': 'USART3 (TX3/RX3 pads)',
    'SERIAL3': 'UART5 (TX5/RX5 pads)',
    'SERIAL4': 'UART4 (TX4/RX4 pads)',
    'SERIAL5': 'USART6 (TX6/RX6 pads)',
    'SERIAL6': 'USART2 (TX2/RX2/SBUS pads)',
  },
  uartPorts: [
    // SERIAL0 = USB (OTG1) -- always MAVLink, not user-configurable in normal use
    {
      padLabel: 'USB',
      serialIndex: 0,
      uartName: 'OTG1',
      hasTx: true,
      hasRx: true,
      defaultProtocol: 2,  // MAVLink2
      defaultBaud: 115,
      suggestedUse: 'GCS connection (your current link)',
    },
    // SERIAL1 = USART1 (TX1/RX1)
    {
      padLabel: 'TX1/RX1',
      serialIndex: 1,
      uartName: 'USART1',
      hasTx: true,
      hasRx: true,
      rxDma: true,
      defaultProtocol: 2,  // MAVLink2
      defaultBaud: 57,     // 57600
      suggestedUse: 'Telemetry radio, WiFi bridge, or Bluetooth',
    },
    // SERIAL2 = USART3 (TX3/RX3)
    {
      padLabel: 'TX3/RX3',
      serialIndex: 2,
      uartName: 'USART3',
      hasTx: true,
      hasRx: true,
      rxDma: true,
      defaultProtocol: -1,
      defaultBaud: 57,
      suggestedUse: 'Telemetry, DJI OSD, or additional GPS',
    },
    // SERIAL3 = UART5 (TX5/RX5)
    {
      padLabel: 'TX5/RX5',
      serialIndex: 3,
      uartName: 'UART5',
      hasTx: true,
      hasRx: true,
      rxDma: false,
      defaultProtocol: 5,   // GPS
      defaultBaud: 115,
      suggestedUse: 'GPS receiver (primary)',
    },
    // SERIAL4 = UART4 (TX4/RX4)
    {
      padLabel: 'TX4/RX4',
      serialIndex: 4,
      uartName: 'UART4',
      hasTx: true,
      hasRx: true,
      rxDma: false,
      defaultProtocol: -1,
      defaultBaud: 115,
      suggestedUse: 'DJI FPV OSD, rangefinder, or second GPS',
    },
    // SERIAL5 = USART6 (TX6/RX6)
    {
      padLabel: 'TX6/RX6',
      serialIndex: 5,
      uartName: 'USART6',
      hasTx: true,
      hasRx: true,
      rxDma: false,
      defaultProtocol: -1,
      defaultBaud: 115,
      suggestedUse: 'ESC telemetry, Lidar, or RunCam',
    },
    // SERIAL6 = USART2 (TX2/RX2) -- THE TRICKY ONE
    // By default, RX2 is a timer input (PPM/SBUS), NOT a UART.
    // BRD_ALT_CONFIG=1 reconfigures it as SERIAL6 UART RX.
    {
      padLabel: 'TX2/RX2',
      serialIndex: 6,
      uartName: 'USART2',
      hasTx: true,
      hasRx: true,
      rxDma: false,
      defaultProtocol: 23,  // RCIN
      defaultBaud: 115,
      suggestedUse: 'RC receiver (ELRS, CRSF, SBUS)',
      requiresAltConfig: {
        param: 'BRD_ALT_CONFIG',
        value: 1,
        defaultMode: 'Timer input (PPM/SBUS only)',
      },
      unsupportedProtocols: [
        { protocol: 0, reason: 'PPM not supported when in UART mode (BRD_ALT_CONFIG=1)' },
      ],
      quirks: {
        // ELRS / CRSF on TX2/RX2
        23: {
          description: 'CRSF/ELRS requires UART mode (BRD_ALT_CONFIG=1) and both TX2+RX2 connected',
          params: {
            'BRD_ALT_CONFIG': 1,
            'SERIAL6_PROTOCOL': 23,
            'SERIAL6_OPTIONS': 0,
          },
          needsReboot: true,
          wiringNote: 'Both TX2 and RX2 must be connected to the receiver for bidirectional CRSF telemetry',
        },
        // SBUS on RX2
        15: {
          description: 'SBUS requires UART mode with inverted RX',
          params: {
            'BRD_ALT_CONFIG': 1,
            'SERIAL6_PROTOCOL': 23,
            'SERIAL6_OPTIONS': 3,
          },
          needsReboot: true,
          wiringNote: 'Connect SBUS signal to RX2 pad',
        },
      },
    },
  ],
  connectors: [
    { label: 'TX1/RX1', serialPort: 'SERIAL1', defaultProtocol: 'Telemetry', connector: 'Solder pads', side: 'top', order: 0 },
    { label: 'TX3/RX3', serialPort: 'SERIAL2', defaultProtocol: 'Telemetry', connector: 'Solder pads', side: 'top', order: 1 },
    { label: 'TX5/RX5', serialPort: 'SERIAL3', defaultProtocol: 'GPS', connector: 'Solder pads', side: 'top', order: 2 },
    { label: 'TX4/RX4', serialPort: 'SERIAL4', defaultProtocol: 'DJI OSD', connector: 'Solder pads', side: 'top', order: 3 },
    { label: 'TX6/RX6', serialPort: 'SERIAL5', defaultProtocol: 'User', connector: 'Solder pads', side: 'top', order: 4 },
    { label: 'I2C', connector: 'JST-GH 4-pin', side: 'top', order: 5 },
    { label: 'USB-C', serialPort: 'SERIAL0', defaultProtocol: 'MAVLink', connector: 'USB-C (extender)', side: 'left', order: 0 },
    { label: 'RX2 / S.Bus', serialPort: 'SERIAL6', connector: 'PPM / S.Bus', side: 'left', order: 1 },
    { label: 'S1-S4 (Quad)', connector: 'Solder pads', side: 'bottom', order: 0 },
    { label: 'S5-S8 (Servo)', connector: 'Solder pads', side: 'bottom', order: 1 },
    { label: 'S9-S11', connector: 'Solder pads', side: 'bottom', order: 2 },
    { label: 'BAT/ESC', connector: 'Solder pads', side: 'bottom', order: 3 },
    { label: 'Buzzer', connector: 'Solder pads', side: 'right', order: 0 },
    { label: 'LED', connector: 'Solder pads', side: 'right', order: 1 },
    { label: 'Airspeed', connector: 'ADC pad', side: 'right', order: 2 },
  ],
};

// ============================================================
// Matek F405-WING
// Firmware: MatekF405-Wing -- APJ_BOARD_ID 127
// SERIAL_ORDER: OTG1 USART1 EMPTY USART3 UART4 UART5 USART6 USART2
//   Note: SERIAL2 is EMPTY (placeholder to keep pad numbers = SERIAL numbers)
//   Note: SERIAL7 (USART2 TX2/RX2) only exists with BRD_ALT_CONFIG=1
// ============================================================
const matekF405Wing: BoardDef = {
  id: 'matekf405wing',
  name: 'Matek F405-WING',
  description: 'Matek F405-WING (wing/plane FC with OSD and PDB)',
  manufacturer: 'Matek Systems',
  mcu: 'STM32F405',
  wikiUrl: 'https://ardupilot.org/plane/docs/common-matekf405-wing.html',
  usbVendorId: '0483',
  usbProductId: '5740',
  dimensions: { width: 36, height: 36 },
  formFactor: 'mini',
  uartMap: {
    'SERIAL0': 'USB',
    'SERIAL1': 'USART1 (TX1/RX1 pads)',
    'SERIAL2': '(empty -- gap to keep pad numbering)',
    'SERIAL3': 'USART3 (TX3/RX3 pads)',
    'SERIAL4': 'UART4 (TX4/RX4 pads)',
    'SERIAL5': 'UART5 (TX5/RX5 pads)',
    'SERIAL6': 'USART6 (TX6/RX6 pads)',
    'SERIAL7': 'USART2 (TX2/RX2 pads, BRD_ALT_CONFIG=1)',
  },
  uartPorts: [
    // SERIAL0 = USB
    {
      padLabel: 'USB',
      serialIndex: 0,
      uartName: 'OTG1',
      hasTx: true,
      hasRx: true,
      defaultProtocol: 2,
      defaultBaud: 115,
      suggestedUse: 'GCS connection (your current link)',
    },
    // SERIAL1 = USART1 (TX1/RX1) -- DMA on both TX and RX
    {
      padLabel: 'TX1/RX1',
      serialIndex: 1,
      uartName: 'USART1',
      hasTx: true,
      hasRx: true,
      rxDma: true,
      defaultProtocol: 2,
      defaultBaud: 57,
      suggestedUse: 'Telemetry radio or WiFi bridge (DMA, good for high speed)',
    },
    // SERIAL2 = EMPTY -- no hardware, ArduPilot skips this index
    // No entry here -- the param won't exist, so Ports page won't show it.

    // SERIAL3 = USART3 (TX3/RX3) -- DMA on both TX and RX
    {
      padLabel: 'TX3/RX3',
      serialIndex: 3,
      uartName: 'USART3',
      hasTx: true,
      hasRx: true,
      rxDma: true,
      defaultProtocol: -1,
      defaultBaud: 57,
      suggestedUse: 'Telemetry, DJI OSD, or additional GPS (DMA, good for high speed)',
    },
    // SERIAL4 = UART4 (TX4/RX4) -- no DMA on RX
    {
      padLabel: 'TX4/RX4',
      serialIndex: 4,
      uartName: 'UART4',
      hasTx: true,
      hasRx: true,
      rxDma: false,
      defaultProtocol: 5,
      defaultBaud: 115,
      suggestedUse: 'GPS receiver (primary)',
    },
    // SERIAL5 = UART5 (TX5/RX5) -- no DMA on RX
    {
      padLabel: 'TX5/RX5',
      serialIndex: 5,
      uartName: 'UART5',
      hasTx: true,
      hasRx: true,
      rxDma: false,
      defaultProtocol: -1,
      defaultBaud: 115,
      suggestedUse: 'Second GPS, rangefinder, or general purpose',
    },
    // SERIAL6 = USART6 (TX6/RX6) -- no DMA on RX
    {
      padLabel: 'TX6/RX6',
      serialIndex: 6,
      uartName: 'USART6',
      hasTx: true,
      hasRx: true,
      rxDma: false,
      defaultProtocol: -1,
      defaultBaud: 115,
      suggestedUse: 'RC receiver, ESC telemetry, or general purpose',
    },
    // SERIAL7 = USART2 (TX2/RX2) -- only exists with BRD_ALT_CONFIG=1
    // RX2 pad is timer input by default, BRD_ALT_CONFIG=1 makes it SERIAL7 UART
    {
      padLabel: 'TX2/RX2',
      serialIndex: 7,
      uartName: 'USART2',
      hasTx: true,
      hasRx: true,
      rxDma: false,
      defaultProtocol: 23,
      defaultBaud: 115,
      suggestedUse: 'RC receiver (ELRS, CRSF) -- requires BRD_ALT_CONFIG=1',
      requiresAltConfig: {
        param: 'BRD_ALT_CONFIG',
        value: 1,
        defaultMode: 'Timer input (PPM/SBUS only)',
      },
      unsupportedProtocols: [
        { protocol: 0, reason: 'PPM not supported when in UART mode (BRD_ALT_CONFIG=1)' },
      ],
      quirks: {
        23: {
          description: 'CRSF/ELRS requires UART mode (BRD_ALT_CONFIG=1) and both TX2+RX2 connected',
          params: {
            'BRD_ALT_CONFIG': 1,
            'SERIAL7_PROTOCOL': 23,
            'SERIAL7_OPTIONS': 0,
          },
          needsReboot: true,
          wiringNote: 'Both TX2 and RX2 must be connected to the receiver for bidirectional CRSF telemetry',
        },
      },
    },
  ],
  connectors: [
    { label: 'TX1/RX1', serialPort: 'SERIAL1', defaultProtocol: 'MAVLink', connector: 'Solder pads', side: 'top', order: 0 },
    { label: 'TX3/RX3', serialPort: 'SERIAL3', defaultProtocol: 'Telemetry', connector: 'Solder pads', side: 'top', order: 1 },
    { label: 'TX4/RX4', serialPort: 'SERIAL4', defaultProtocol: 'GPS', connector: 'Solder pads', side: 'top', order: 2 },
    { label: 'TX5/RX5', serialPort: 'SERIAL5', connector: 'Solder pads', side: 'top', order: 3 },
    { label: 'I2C', connector: 'Solder pads', side: 'top', order: 4 },
    { label: 'USB-C', serialPort: 'SERIAL0', defaultProtocol: 'MAVLink', connector: 'USB-C', side: 'left', order: 0 },
    { label: 'RX2 / S.Bus', serialPort: 'SERIAL7', connector: 'PPM / S.Bus / CRSF', side: 'left', order: 1 },
    { label: 'S1-S5', connector: 'Solder pads', side: 'bottom', order: 0 },
    { label: 'S6-S9', connector: 'Solder pads', side: 'bottom', order: 1 },
    { label: 'BAT/ESC', connector: 'Solder pads', side: 'bottom', order: 2 },
    { label: 'Buzzer', connector: 'Solder pads', side: 'right', order: 0 },
    { label: 'LED', connector: 'Solder pads', side: 'right', order: 1 },
    { label: 'Airspeed', connector: 'ADC pad', side: 'right', order: 2 },
  ],
};

// ============================================================
// Board Registry
// ============================================================

const ALL_BOARDS: BoardDef[] = [
  pixhawk1,
  cubeBlack,
  cubeOrange,
  pixhawk6x,
  pixhawk6c,
  matekH743Wing,
  matekF405TE,
  matekF405Wing,
];

/**
 * Board name patterns for matching against USB product strings (pnpId).
 * ArduPilot ChibiOS boards set the USB product descriptor to the board target name.
 * On Linux, this appears in pnpId as: "usb-ArduPilot_MatekF405Wing_SERIAL-if00"
 */
const BOARD_NAME_PATTERNS: [RegExp, BoardDef][] = [
  [/MatekF405[_-]?Wing/i, matekF405Wing],
  [/MatekF405[_-]?TE/i, matekF405TE],
  [/MatekF405/i, matekF405TE],  // Generic F405 → TE (more common than old Wing)
  [/MatekH743[_-]?Wing/i, matekH743Wing],
  [/MatekH743/i, matekH743Wing],
  [/CubeOrange/i, cubeOrange],
  [/CubeBlack/i, cubeBlack],
  [/Pixhawk6X/i, pixhawk6x],
  [/Pixhawk6C/i, pixhawk6c],
  [/fmuv[23]/i, pixhawk1],
  [/Pixhawk1/i, pixhawk1],
];

/**
 * Detect board from USB information available before connection.
 *
 * Detection order:
 *   1. pnpId -- most reliable on Linux, contains ChibiOS USB product string
 *   2. Unique USB VID/PID -- works for boards with non-generic IDs
 *   3. Manufacturer string fallback
 *
 * For boards sharing generic STM32 VID/PID (0483:5740), pnpId is essential.
 * Post-connect, AUTOPILOT_VERSION provides APJ_BOARD_ID as a definitive source.
 */
export function detectBoard(
  vendorId?: string,
  productId?: string,
  manufacturer?: string,
  pnpId?: string
): BoardDef | null {
  // 1. Check pnpId for board name (most reliable for ChibiOS boards)
  if (pnpId) {
    for (const [pattern, board] of BOARD_NAME_PATTERNS) {
      if (pattern.test(pnpId)) {
        return board;
      }
    }
  }

  // 2. Check unique USB VID/PID (skip generic STM32)
  if (vendorId) {
    const vid = vendorId.toLowerCase();
    const pid = productId?.toLowerCase();
    const isGenericStm32 = vid === '0483' && pid === '5740';

    if (!isGenericStm32) {
      for (const board of ALL_BOARDS) {
        if (board.usbVendorId === vid) {
          if (!board.usbProductId || board.usbProductId === pid) {
            return board;
          }
        }
      }
    }
  }

  // 3. Manufacturer string fallback
  if (manufacturer) {
    const mfr = manufacturer.toLowerCase();
    if (mfr.includes('3d robotics') || mfr.includes('ardupilot') || mfr.includes('ardumega')) {
      return pixhawk1;
    }
    if (mfr.includes('cubepilot') || mfr.includes('proficnc') || mfr.includes('hex')) {
      return cubeOrange;
    }
    if (mfr.includes('holybro')) {
      return pixhawk6x;
    }
  }

  return null;
}


/**
 * Map ArduPilot APJ_BOARD_ID (from AUTOPILOT_VERSION.board_version) to our board definitions.
 * This is the most reliable board identification method.
 * IDs from ArduPilot hwdef files: https://github.com/ArduPilot/ardupilot/tree/master/libraries/AP_HAL_ChibiOS/hwdef
 */
const BOARD_ID_MAP: Map<number, BoardDef> = new Map([
  // Pixhawk 1 / 2.4.8 (fmuv2, fmuv3)
  [9, pixhawk1],
  [13, pixhawk1],
  // Cube Black
  [120, cubeBlack],
  // Cube Orange / Orange+
  [139, cubeOrange],
  [140, cubeOrange],
  // Pixhawk 6X (fmuv6x)
  [53, pixhawk6x],
  // Pixhawk 6C (fmuv6c)
  [56, pixhawk6c],
  // Matek F405-WING (AP_HW_MATEKF405_WING)
  [127, matekF405Wing],
  // Matek H743 / H743-WING (AP_HW_MATEKH743)
  [1013, matekH743Wing],
  // Matek F405-TE / F405-VTOL (AP_HW_MatekF405_TE)
  [1054, matekF405TE],
]);

/**
 * Detect board from APJ_BOARD_ID (AUTOPILOT_VERSION.board_version).
 * This is the most reliable identification method -- the ID is baked into the firmware.
 */
export function detectBoardFromId(boardVersion: number): BoardDef | null {
  return BOARD_ID_MAP.get(boardVersion) || null;
}

/**
 * Get board by ID.
 */
export function getBoardById(id: string): BoardDef | null {
  return ALL_BOARDS.find((b) => b.id === id) || null;
}

/**
 * Get all boards.
 */
export function getAllBoards(): BoardDef[] {
  return ALL_BOARDS;
}

/**
 * Get the BoardUartPort for a given SERIAL index on a specific board.
 */
export function getUartPort(board: BoardDef, serialIndex: number): BoardUartPort | null {
  return board.uartPorts?.find((p) => p.serialIndex === serialIndex) ?? null;
}

/**
 * Get protocol quirks for a specific board + port + protocol combination.
 * Returns null if no quirks apply.
 */
export function getProtocolQuirks(
  board: BoardDef,
  serialIndex: number,
  protocol: number
): ProtocolQuirk | null {
  const port = getUartPort(board, serialIndex);
  return port?.quirks?.[protocol] ?? null;
}

/**
 * Check if a protocol is unsupported on a specific port.
 * Returns the reason string if unsupported, null if OK.
 */
export function getUnsupportedReason(
  board: BoardDef,
  serialIndex: number,
  protocol: number
): string | null {
  const port = getUartPort(board, serialIndex);
  if (!port?.unsupportedProtocols) return null;
  const entry = port.unsupportedProtocols.find((u) => u.protocol === protocol);
  return entry?.reason ?? null;
}
