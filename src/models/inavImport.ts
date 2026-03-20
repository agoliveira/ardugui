/**
 * inavImport.ts -- Parse INAV "dump all" or "diff all" output and map to ArduPilot parameters.
 *
 * This is a migration assistant, not a blind converter. It extracts what the
 * aircraft IS and how it's WIRED, then maps those facts to ArduPilot params.
 * PIDs and navigation tuning are explicitly skipped (different controllers).
 *
 * Serial port mapping: INAV uses 0-based identifiers where identifier N =
 * UART(N+1). Identifier 20 = USB VCP. On Matek boards, UART N is on physical
 * pad TXN/RXN. Our board registry maps pad labels to ArduPilot SERIAL indexes.
 * Example: INAV `serial 5 2` = identifier 5 = UART6 = TX6/RX6 = SERIAL6.
 *
 * Usage:
 *   const parsed = parseInavDiff(text);
 *   const result = mapToArduPilot(parsed, board);
 *   // result.params -> Record<string, number> for wizard staging
 *   // result.detected -> what the parser found (for display)
 *   // result.summary -> human-readable mapping list
 *   // result.skipped -> what was intentionally not converted
 */

import type { BoardDef } from './boardRegistry';
import { getExtendedBoardByName } from './boardData';
import { INAV_TIMER_DATA } from './inavTimerData';

/* ================================================================== */
/*  INAV parser                                                        */
/* ================================================================== */

/** Parsed representation of an INAV diff/dump. */
export interface InavConfig {
  /** Board target from the header comment (e.g. "MATEKF405SE") */
  board: string | null;
  /** INAV version from header (e.g. "9.0.1") */
  version: string | null;
  /** Top-level mixer (e.g. "QUADX") -- may be absent in newer INAV */
  mixer: string | null;
  /** model_preview_type from mixer_profile (e.g. 14 = airplane) */
  modelPreviewType: number | null;
  /** Platform type if set explicitly */
  platformType: string | null;
  /** Enabled/disabled features */
  features: Map<string, boolean>;
  /** Serial port configs: port -> { functionMask, ... } */
  serialPorts: Map<number, InavSerialPort>;
  /** All "set" key=value pairs (from all profiles, last write wins) */
  settings: Map<string, string>;
  /** AUX mode assignments */
  auxModes: InavAuxMode[];
  /** Motor mixer entries (parsed, not just counted) */
  motors: InavMotorMix[];
  /** Motor mixer entry count */
  motorCount: number;
  /** Servo mixer entries (parsed, not just counted) */
  servoMixes: InavServoMix[];
  /** Unique servo indices used in smix */
  servoCount: number;
  /** Timer output mode overrides from diff */
  timerOutputModes: Map<number, string>;
  /** Servo config lines (servo N min max mid rate) */
  servoConfigs: Map<number, InavServoConfig>;
  /** Battery cell count from battery_profile (bat_cells) */
  batteryCells: number | null;
  /** has_flaps from mixer_profile */
  hasFlaps: boolean;
  /** All platform types seen across mixer profiles (for VTOL detection) */
  allPlatformTypes: Set<string>;
  /** RC channel map (e.g. "TAER") */
  channelMap: string | null;
  /** OSD layout entries: profile -> element_id -> { x, y, visible } */
  osdLayouts: Map<number, { x: number; y: number; visible: boolean }>;
  /** Aircraft name from the INAV 'name' command */
  craftName: string | null;
}

export interface InavMotorMix {
  index: number;
  throttle: number;
  roll: number;
  pitch: number;
  yaw: number;
}

export interface InavServoMix {
  ruleIndex: number;
  /** Target servo index (1-based in INAV smix) */
  servoIndex: number;
  /** Input source ID */
  inputSource: number;
  /** Mix rate (-100 to 100) */
  rate: number;
  speed: number;
  conditionId: number;
}

export interface InavServoConfig {
  index: number;
  min: number;
  max: number;
  middle: number;
  rate: number;
}

export interface InavSerialPort {
  port: number;
  functionMask: number;
  mspBaud: number;
  gpsBaud: number;
  telemBaud: number;
  periphBaud: number;
}

export interface InavAuxMode {
  modeId: number;
  auxChannel: number;
  rangeStart: number;
  rangeEnd: number;
}

/** INAV serial function bits */
const INAV_SERIAL_FN = {
  MSP:        1,
  GPS:        2,
  TELEMETRY:  4,
  SMARTAUDIO: 8,
  TRAMP:      16,
  ESC_TELEM:  32,
  SERIAL_RX:  64,
  BLACKBOX:   128,
  VTX_MSP:    2048,
} as const;

/**
 * Parse an INAV "diff all" or "dump" text output.
 */
export function parseInavDiff(text: string): InavConfig {
  const config: InavConfig = {
    board: null,
    version: null,
    mixer: null,
    modelPreviewType: null,
    platformType: null,
    features: new Map(),
    serialPorts: new Map(),
    settings: new Map(),
    auxModes: [],
    motors: [],
    motorCount: 0,
    servoMixes: [],
    servoCount: 0,
    timerOutputModes: new Map(),
    servoConfigs: new Map(),
    batteryCells: null,
    hasFlaps: false,
    allPlatformTypes: new Set(),
    channelMap: null,
    osdLayouts: new Map(),
    craftName: null,
  };

  const lines = text.split('\n');
  const servoIndices = new Set<number>();

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Header: "# INAV/MATEKF405SE 9.0.1 Feb 13 2026 / 06:54:06 (hash)"
    const headerMatch = line.match(/^#\s*INAV\s*\/\s*(\S+)\s+([\d.]+)/i);
    if (headerMatch) {
      config.board = headerMatch[1].toUpperCase();
      config.version = headerMatch[2];
      continue;
    }

    // Skip comments and empty lines
    if (line.startsWith('#') || line === '') continue;

    // Craft name: standalone "name My Racing Quad" command
    const nameMatch = line.match(/^name\s+(.+)/i);
    if (nameMatch) {
      config.craftName = nameMatch[1].trim();
      continue;
    }

    // Top-level mixer (older INAV style) -- but not "mixer_profile"
    const mixerMatch = line.match(/^mixer\s+(\S+)/i);
    if (mixerMatch && !line.startsWith('mixer_profile')) {
      config.mixer = mixerMatch[1].toUpperCase();
      continue;
    }

    // feature GPS / feature -AIRMODE
    const featureMatch = line.match(/^feature\s+(-?)(\S+)/i);
    if (featureMatch) {
      config.features.set(featureMatch[2].toUpperCase(), featureMatch[1] !== '-');
      continue;
    }

    // map TAER (channel map)
    const mapMatch = line.match(/^map\s+([A-Z]{4})/i);
    if (mapMatch) {
      config.channelMap = mapMatch[1].toUpperCase();
      continue;
    }

    // osd_layout 0 7 13 0 V
    const osdMatch = line.match(/^osd_layout\s+0\s+(\d+)\s+(\d+)\s+(\d+)\s+([VH])/i);
    if (osdMatch) {
      config.osdLayouts.set(parseInt(osdMatch[1]), {
        x: parseInt(osdMatch[2]),
        y: parseInt(osdMatch[3]),
        visible: osdMatch[4].toUpperCase() === 'V',
      });
      continue;
    }

    // serial 5 2 115200 115200 0 115200
    const serialMatch = line.match(
      /^serial\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/i
    );
    if (serialMatch) {
      const port = parseInt(serialMatch[1]);
      config.serialPorts.set(port, {
        port,
        functionMask: parseInt(serialMatch[2]),
        mspBaud: parseInt(serialMatch[3]),
        gpsBaud: parseInt(serialMatch[4]),
        telemBaud: parseInt(serialMatch[5]),
        periphBaud: parseInt(serialMatch[6]),
      });
      continue;
    }

    // timer_output_mode 0 MOTORS
    const timerMatch = line.match(/^timer_output_mode\s+(\d+)\s+(\S+)/i);
    if (timerMatch) {
      config.timerOutputModes.set(parseInt(timerMatch[1]), timerMatch[2].toUpperCase());
      continue;
    }

    // mmix reset -- clear motor array (VTOL diffs have per-profile mixers)
    if (line === 'mmix reset') {
      config.motors = [];
      continue;
    }

    // mmix 0 1.000 0.000 0.000 0.000
    const mmixMatch = line.match(
      /^mmix\s+(\d+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)/i
    );
    if (mmixMatch) {
      config.motors.push({
        index: parseInt(mmixMatch[1]),
        throttle: parseFloat(mmixMatch[2]),
        roll: parseFloat(mmixMatch[3]),
        pitch: parseFloat(mmixMatch[4]),
        yaw: parseFloat(mmixMatch[5]),
      });
      continue;
    }

    // smix reset -- clear servo mix array
    if (line === 'smix reset') {
      config.servoMixes = [];
      servoIndices.clear();
      continue;
    }

    // smix 0 1 0 50 0 -1
    const smixMatch = line.match(
      /^smix\s+(\d+)\s+(\d+)\s+(\d+)\s+(-?\d+)\s+(\d+)\s+(-?\d+)/i
    );
    if (smixMatch) {
      const servoIdx = parseInt(smixMatch[2]);
      servoIndices.add(servoIdx);
      config.servoMixes.push({
        ruleIndex: parseInt(smixMatch[1]),
        servoIndex: servoIdx,
        inputSource: parseInt(smixMatch[3]),
        rate: parseInt(smixMatch[4]),
        speed: parseInt(smixMatch[5]),
        conditionId: parseInt(smixMatch[6]),
      });
      continue;
    }

    // servo 3 840 2100 1500 100
    const servoMatch = line.match(/^servo\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/i);
    if (servoMatch) {
      config.servoConfigs.set(parseInt(servoMatch[1]), {
        index: parseInt(servoMatch[1]),
        min: parseInt(servoMatch[2]),
        max: parseInt(servoMatch[3]),
        middle: parseInt(servoMatch[4]),
        rate: parseInt(servoMatch[5]),
      });
      continue;
    }

    // aux 0 1 0 1700 2100 0
    const auxMatch = line.match(/^aux\s+\d+\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/i);
    if (auxMatch) {
      config.auxModes.push({
        modeId: parseInt(auxMatch[1]),
        auxChannel: parseInt(auxMatch[2]),
        rangeStart: parseInt(auxMatch[3]),
        rangeEnd: parseInt(auxMatch[4]),
      });
      continue;
    }

    // set key = value
    const setMatch = line.match(/^set\s+(\S+)\s*=\s*(.+)/i);
    if (setMatch) {
      const key = setMatch[1].toLowerCase();
      const val = setMatch[2].trim();
      config.settings.set(key, val);

      if (key === 'model_preview_type') {
        const n = parseInt(val);
        config.modelPreviewType = isNaN(n) ? null : n;
      }
      if (key === 'bat_cells') {
        const n = parseInt(val);
        config.batteryCells = isNaN(n) || n <= 0 ? null : n;
      }
      if (key === 'has_flaps' && val.toUpperCase() === 'ON') {
        config.hasFlaps = true;
      }
      if (key === 'platform_type') {
        config.platformType = val.toUpperCase();
        config.allPlatformTypes.add(val.toUpperCase());
      }
      continue;
    }
  }

  config.motorCount = config.motors.length;
  config.servoCount = servoIndices.size;

  return config;
}

/* ================================================================== */
/*  ArduPilot mapping                                                  */
/* ================================================================== */

/** Result of mapping INAV config to ArduPilot params. */
export interface ImportResult {
  /** ArduPilot params ready to stage in the wizard */
  params: Record<string, number>;
  /** What was detected from the INAV config (for display) */
  detected: DetectedConfig;
  /** Human-readable summary of what was mapped */
  summary: ImportSummaryItem[];
  /** Items that were intentionally skipped */
  skipped: ImportSkippedItem[];
  /** Detected vehicle type */
  vehicleType: 'copter' | 'plane' | 'quadplane' | null;
  /** Detected frame description */
  frameDescription: string | null;
  /** Effective cell count used for voltage calculations */
  cellCount: number;
  /** Aircraft name from INAV (if set) */
  craftName: string | null;
}

/** Detected configuration extracted from INAV (for display in UI) */
export interface DetectedConfig {
  vehicleType: string | null;
  motorProtocol: string | null;
  receiverProtocol: string | null;
  hasGps: boolean;
  hasTelemetry: boolean;
  hasEscTelemetry: boolean;
  cellCount: number;
  hasFlaps: boolean;
}

export interface ImportSummaryItem {
  category: string;
  label: string;
  inavValue: string;
  arduPilotParam: string;
  arduPilotValue: number | string;
}

export interface ImportSkippedItem {
  category: string;
  label: string;
  reason: string;
}

/* ── Vehicle type detection ─────────────────────────────────────── */

/**
 * INAV model_preview_type values.
 * These correspond to the visual model shown in INAV Configurator.
 */
const MODEL_TYPE_MAP: Record<number, { vehicleType: 'copter' | 'plane' | 'quadplane'; description: string }> = {
  1:  { vehicleType: 'copter', description: 'Quad X' },
  2:  { vehicleType: 'copter', description: 'Quad +' },
  3:  { vehicleType: 'copter', description: 'Tricopter' },
  4:  { vehicleType: 'copter', description: 'Hex X' },
  5:  { vehicleType: 'copter', description: 'Hex +' },
  6:  { vehicleType: 'copter', description: 'Y6' },
  7:  { vehicleType: 'plane',  description: 'Airplane' },
  8:  { vehicleType: 'plane',  description: 'Flying Wing' },
  9:  { vehicleType: 'copter', description: 'Octo Flat X' },
  10: { vehicleType: 'copter', description: 'Octo Flat +' },
  14: { vehicleType: 'plane',  description: 'Airplane' },
};

/* ── Mixer to frame mapping ─────────────────────────────────────── */

interface FrameMapping {
  frameClass: number;
  frameType: number;
  vehicleType: 'copter' | 'plane' | 'quadplane';
  description: string;
}

const MIXER_MAP: Record<string, FrameMapping> = {
  'QUADX':      { frameClass: 1,  frameType: 1,  vehicleType: 'copter', description: 'Quad X' },
  'QUAD+':      { frameClass: 1,  frameType: 0,  vehicleType: 'copter', description: 'Quad +' },
  'QUADPLUS':   { frameClass: 1,  frameType: 0,  vehicleType: 'copter', description: 'Quad +' },
  'QUADH':      { frameClass: 1,  frameType: 3,  vehicleType: 'copter', description: 'Quad H' },
  'HEX6X':      { frameClass: 2,  frameType: 1,  vehicleType: 'copter', description: 'Hex X' },
  'HEX6+':      { frameClass: 2,  frameType: 0,  vehicleType: 'copter', description: 'Hex +' },
  'HEX6PLUS':   { frameClass: 2,  frameType: 0,  vehicleType: 'copter', description: 'Hex +' },
  'HEX6H':      { frameClass: 2,  frameType: 7,  vehicleType: 'copter', description: 'Hex H' },
  'Y6':         { frameClass: 14, frameType: 0,  vehicleType: 'copter', description: 'Y6' },
  'OCTOX8':     { frameClass: 3,  frameType: 3,  vehicleType: 'copter', description: 'OctoQuad X' },
  'OCTOFLATX':  { frameClass: 4,  frameType: 1,  vehicleType: 'copter', description: 'Octo X' },
  'OCTOFLATP':  { frameClass: 4,  frameType: 0,  vehicleType: 'copter', description: 'Octo +' },
  'TRI':        { frameClass: 7,  frameType: 0,  vehicleType: 'copter', description: 'Tricopter' },
  'AIRPLANE':   { frameClass: 0,  frameType: 0,  vehicleType: 'plane',  description: 'Airplane' },
  'FLYING_WING':{ frameClass: 0,  frameType: 0,  vehicleType: 'plane',  description: 'Flying wing' },
  'CUSTOM_AIRPLANE': { frameClass: 0, frameType: 0, vehicleType: 'plane', description: 'Custom plane' },
};

/* ── Motor protocol mapping ─────────────────────────────────────── */

const MOTOR_PROTOCOL_MAP: Record<string, { value: number; label: string }> = {
  'OFF':        { value: 0, label: 'Normal PWM' },
  'STANDARD':   { value: 0, label: 'Normal PWM' },
  'ONESHOT125': { value: 1, label: 'OneShot125' },
  'ONESHOT42':  { value: 2, label: 'OneShot42' },
  'MULTISHOT':  { value: 3, label: 'MultiShot' },
  'BRUSHED':    { value: 0, label: 'Brushed (PWM)' },
  'DSHOT150':   { value: 4, label: 'DShot150' },
  'DSHOT300':   { value: 5, label: 'DShot300' },
  'DSHOT600':   { value: 6, label: 'DShot600' },
  'DSHOT1200':  { value: 6, label: 'DShot600 (ArduPilot max)' },
};

/* ── Receiver protocol names (for display) ──────────────────────── */

const RX_PROTOCOL_LABELS: Record<string, string> = {
  'SBUS':       'SBUS',
  'CRSF':       'CRSF (Crossfire / ELRS)',
  'IBUS':       'IBUS (FlySky)',
  'FPORT':      'FPort',
  'FPORT2':     'FPort2',
  'SRXL2':      'SRXL2 (Spektrum)',
  'GHST':       'Ghost (ImmersionRC)',
  'SUMD':       'SUMD (Graupner)',
  'SPEK1024':   'Spektrum 1024',
  'SPEK2048':   'Spektrum 2048',
};

/* ── GPS type mapping ───────────────────────────────────────────── */

const GPS_TYPE_MAP: Record<string, number> = {
  'UBLOX':  1,
  'NMEA':   5,
  'MSP':    9,
  'FAKE':   0,
};

/* ── Failsafe mapping ───────────────────────────────────────────── */

const COPTER_FS_MAP: Record<string, number> = {
  'RTH': 1, 'LAND': 3, 'DROP': 0, 'SET-THR': 0, 'NONE': 0,
};
const PLANE_FS_MAP: Record<string, number> = {
  'RTH': 1, 'LAND': 1, 'DROP': 0, 'SET-THR': 0, 'NONE': 0,
};

/* ── INAV flight mode IDs ───────────────────────────────────────── */

const INAV_MODE_MAP: Record<number, { copter?: number; plane?: number; name: string }> = {
  0:  { copter: 0,  plane: 0,  name: 'ARM' },
  1:  { copter: 2,  plane: 6,  name: 'ANGLE/ALTHOLD' },
  2:  {              plane: 0,  name: 'HORIZON' },
  3:  { copter: 2,             name: 'NAV ALTHOLD' },
  5:  { copter: 0,  plane: 0,  name: 'HEADING HOLD' },
  10: { copter: 5,  plane: 12, name: 'NAV POSHOLD' },
  11: { copter: 6,  plane: 11, name: 'NAV RTH' },
  12: { copter: 3,  plane: 10, name: 'NAV WP' },
  28: { copter: 9,             name: 'NAV CRUISE' },
  45: {              plane: 7,  name: 'NAV CRUISE' },
};

/* ── INAV board name to ArduPilot board ID ──────────────────────── */

/**
 * Maps INAV firmware target names (from the diff header) to ArduPilot
 * board IDs in boardData.ts. Cross-referenced by tools/cross-reference-inav.py
 * against INAV firmware target.h files and ArduPilot hwdef SERIAL_ORDER.
 *
 * 53 boards UART-confirmed, 81 entries total (including firmware variants
 * that share the same physical board).
 *
 * Regenerate with:
 *   python3 tools/cross-reference-inav.py --inav-targets ... --ardupilot-boards ...
 */
const INAV_BOARD_MAP: Record<string, string> = {
  // -- Cross-referenced: UART-confirmed matches --
  'AETH743BASIC':              'aet-h743-basic',
  'ATOMRCF405NAVI_DELUX':      'atomrcf405navi',
  'BOTWINGF405':               'botwingf405',
  'BRAHMA_F405':               'brahmaf4',
  'CORVON405V2':               'corvon405v2_1',
  'CORVON743V1':               'corvon743v1',
  'DAKEFPVF405':               'dakefpvf405',
  'DAKEFPVH743':               'dakefpvh743',
  'DAKEFPVH743PRO':            'dakefpvh743',
  'F4BY':                      'f4by',
  'FLYSPARKF4V4':              'flysparkf4',
  'FLYWOOF405PRO':             'flywoof405pro',
  'FLYWOOF405S_AIO':           'flywoof405s-aio',
  'FLYWOOF745':                'flywoof745',
  'FLYWOOH743PRO':             'flywooh743pro',
  'FOXEERF405':                'foxeerf405v2',
  'FOXEERF405V2':              'foxeerf405v2',
  'FOXEERH743':                'foxeerh743v1',
  'GEPRCF745_BT_HD':           'geprcf745bthd',
  'GEPRC_TAKER_H743':          'geprc_taker_h743',
  'IFLIGHT_2RAW_H743':         'iflight_2raw_h7',
  'IFLIGHT_BLITZ_F7_PRO':      'blitzf745aio',
  'JHEMCUF405':                'jhemcuf405pro',
  'JHEMCUF405WING':            'jhemcuf405wing',
  'JHEMCUH743HD':              'jhemcu-h743hd',
  'KAKUTEF4':                  'kakutef4',
  'KAKUTEF7':                  'kakutef7',
  'KAKUTEF7MINIV3':            'kakutef7',
  'KAKUTEH7':                  'kakuteh7',
  'MAMBAF405US':               'mambaf405us-i2c',
  'MAMBAF405_2022A':           'mambaf405-2022',
  'MAMBAH743':                 'mambah743v4',
  'MATEKF405':                 'matekf405',
  'MATEKF405CAN':              'matekf405-can',
  'MATEKF405SE':               'matekf405-wing',
  'MATEKF405TE':               'matekf405-te',
  'MATEKF765':                 'matekf765-wing',
  'MATEKH743':                 'matekh743',
  'MICOAIR405MINI':            'micoair405mini',
  'MICOAIR405V2':              'micoair405v2',
  'MICOAIR743':                'micoair743',
  'MICOAIR743AIO':             'micoair743',
  'OMNIBUSF4':                 'omnibusf4pro',
  'OMNIBUSF7':                 'omnibusf7v2',
  'ORBITH743':                 'orbith743',
  'PIXRACER':                  'pixracer',
  'RADIOLINKF405':             'radiolinkf405',
  'RADIX':                     'radix2hd',
  'SDMODELH7V1':               'sdmodelh7v1',
  'SDMODELH7V2':               'sdmodelh7v2',
  'SEQUREH7':                  'sequreh743',
  'SKYSTARSF405V2':            'skystarsf405v2',
  'SPEDIXF405':                'spedixf405',
  'SPEEDYBEEF405MINI':         'speedybeef405mini',
  'TBS_LUCID_H7':              'tbs_lucid_h7',
  'TBS_LUCID_H7_WING':         'tbs_lucid_h7',
  'TBS_LUCID_H7_WING_MINI':    'tbs_lucid_h7',

  // -- Manual: firmware variants sharing same board --
  'MATEKF405WING':             'matekf405-wing',
  'MATEKF405STD':              'matekf405',
  'MATEKF405CTR':              'matekf405',
  'MATEKF405OSD':              'matekf405',
  'MATEKF405AIO':              'matekf405',
  'MATEKF405MINI':             'matekf405',
  'MATEKF405TE_SD':            'matekf405-te',
  'MATEKF405WTE':              'matekf405-te',
  'MATEKF405VTOL':             'matekf405-te',
  'MATEKH743HD':               'matekh743',
  'MATEKH743WING':             'matekh743',
  'MATEKH743SLIM':             'matekh743',
  'MATEKH743MINI':             'matekh743',
  'MATEKF765SE':               'matekf765-se',
  'MATEKF765WING':             'matekf765-wing',
  'KAKUTEF4V2':                'kakutef4',
  'KAKUTEF4WING':              'kakutef4',
  'KAKUTEH7MINI':              'kakuteh7mini',
  'KAKUTEH7WING':              'kakuteh7',
  'MICOAIR743V2':              'micoair743',
  'REVO':                      'revo-mini',
  'SPARKY2':                   'sparky2',
  'SPEEDYBEEF405AIO':          'speedybeef4',
  'SPEEDYBEEF405WINGV2':       'speedybeef4',
};

/**
 * Resolve an INAV port identifier to an ArduPilot SERIAL index using the
 * board registry.
 *
 * INAV port identifiers:
 *   0-7  = UART1 through UART8 (identifier N = UART N+1)
 *   20   = USB VCP
 *   30-31 = SoftSerial 1-2
 *
 * On Matek boards, UART N is on physical pad TXN/RXN.
 * So INAV identifier 5 = UART6 = TX6/RX6 pad.
 */
function resolveSerialIndex(inavPort: number, board: BoardDef | null): number | null {
  if (inavPort === 20) return null; // USB VCP, skip
  if (inavPort >= 30) return null;  // SoftSerial, no ArduPilot equivalent

  if (!board?.uartPorts) return null; // Can't resolve without board definition

  // INAV identifier N = UART(N+1) = physical pad TX(N+1)/RX(N+1)
  const uartNumber = inavPort + 1;
  const padPattern = new RegExp(`TX${uartNumber}\\b|RX${uartNumber}\\b`, 'i');
  const match = board.uartPorts.find((p) => padPattern.test(p.padLabel));
  if (match) return match.serialIndex;

  // Fallback: try matching UART name directly (e.g. "USART6", "UART4")
  const uartPattern = new RegExp(`U?S?ART${uartNumber}\\b`, 'i');
  const uartMatch = board.uartPorts.find((p) => uartPattern.test(p.uartName ?? ''));
  if (uartMatch) return uartMatch.serialIndex;

  return null;
}

/** Resolve INAV board name to a board definition with uartPorts. */
function resolveBoard(inavBoard: string | null, connectedBoard: BoardDef | null): BoardDef | null {
  // Prefer the connected board (detected via USB) if it has uartPorts
  if (connectedBoard?.uartPorts) return connectedBoard;

  // Try INAV board name -> generated board data (414 boards with uartPorts)
  if (inavBoard) {
    const boardKey = inavBoard.toUpperCase();
    const boardKeyBase = boardKey.replace(/_(SD|HD|V\d+|BT)$/i, '');
    const apBoardId = INAV_BOARD_MAP[boardKey] ?? INAV_BOARD_MAP[boardKeyBase];
    if (apBoardId) {
      const extended = getExtendedBoardByName(apBoardId);
      if (extended) return extended;
    }
  }

  // Last resort: connected board without uartPorts (some ports pages still use it)
  if (connectedBoard) return connectedBoard;

  return null;
}

/** Convert INAV serial function to ArduPilot SERIAL_PROTOCOL value. */
function inavFunctionToProtocol(fnMask: number): { protocol: number; label: string } | null {
  if (fnMask & INAV_SERIAL_FN.GPS)        return { protocol: 5,  label: 'GPS' };
  if (fnMask & INAV_SERIAL_FN.SERIAL_RX)  return { protocol: 23, label: 'RCIN' };
  if (fnMask & INAV_SERIAL_FN.ESC_TELEM)  return { protocol: 16, label: 'ESC Telemetry' };
  if (fnMask & INAV_SERIAL_FN.TELEMETRY)  return { protocol: 10, label: 'FrSky Passthrough' };
  if (fnMask & INAV_SERIAL_FN.SMARTAUDIO) return { protocol: 37, label: 'SmartAudio' };
  if (fnMask & INAV_SERIAL_FN.TRAMP)      return { protocol: 37, label: 'TBS SmartAudio' };
  if (fnMask & INAV_SERIAL_FN.MSP)        return { protocol: 32, label: 'MSP' };
  return null;
}

/* ================================================================== */
/*  Main mapping function                                              */
/* ================================================================== */

/**
 * Map parsed INAV config to ArduPilot parameters.
 *
 * @param config - Parsed INAV config
 * @param connectedBoard - ArduPilot board definition from active connection (if any)
 * @param cellCount - Battery cell count override (0 = auto from config)
 * @param liveVoltage - Current battery voltage for auto cell count (0 = not available)
 */
export function mapToArduPilot(
  config: InavConfig,
  connectedBoard: BoardDef | null = null,
  cellCount = 0,
  liveVoltage = 0,
): ImportResult {
  const params: Record<string, number> = {};
  const summary: ImportSummaryItem[] = [];
  const skipped: ImportSkippedItem[] = [];
  let vehicleType: 'copter' | 'plane' | 'quadplane' | null = null;
  let frameDescription: string | null = null;

  // Resolve cell count: override -> config -> live voltage -> default
  // INAV bat_cells=0 means auto-detect. Without live voltage we default
  // to 4S and flag it so the user verifies.
  let cellCountSource: 'override' | 'config' | 'voltage' | 'default' = 'default';
  let effectiveCells = 4;

  if (cellCount > 0) {
    effectiveCells = cellCount;
    cellCountSource = 'override';
  } else if (config.batteryCells) {
    effectiveCells = config.batteryCells;
    cellCountSource = 'config';
  } else if (liveVoltage > 5) {
    effectiveCells = Math.round(liveVoltage / 3.9);
    if (effectiveCells < 1) effectiveCells = 1;
    cellCountSource = 'voltage';
  }

  // ── Resolve board for serial port mapping ─────────────────────────

  const board = resolveBoard(config.board, connectedBoard);

  // ── Detect and map serial port functions ─────────────────────────

  let hasGps = config.features.get('GPS') === true;
  let hasTelemetry = false;
  let hasEscTelemetry = false;
  const rxProvider = config.settings.get('serialrx_provider');
  let serialPortsMapped = 0;

  for (const [inavPort, portDef] of config.serialPorts) {
    if (portDef.functionMask & INAV_SERIAL_FN.GPS) hasGps = true;
    if (portDef.functionMask & INAV_SERIAL_FN.TELEMETRY) hasTelemetry = true;
    if (portDef.functionMask & INAV_SERIAL_FN.ESC_TELEM) hasEscTelemetry = true;

    // Map INAV port to ArduPilot SERIAL index via board registry
    const serialIdx = resolveSerialIndex(inavPort, board);
    if (serialIdx === null) continue;

    const fn = inavFunctionToProtocol(portDef.functionMask);
    if (!fn) continue;

    params[`SERIAL${serialIdx}_PROTOCOL`] = fn.protocol;
    serialPortsMapped++;
    summary.push({
      category: 'Serial Ports',
      label: `${fn.label} on UART${inavPort + 1}`,
      inavValue: `serial ${inavPort} (UART${inavPort + 1} / TX${inavPort + 1}/RX${inavPort + 1})`,
      arduPilotParam: `SERIAL${serialIdx}_PROTOCOL`,
      arduPilotValue: `${fn.protocol} (${fn.label})`,
    });
  }

  if (config.serialPorts.size > 0 && serialPortsMapped === 0 && !board) {
    skipped.push({
      category: 'Serial Ports',
      label: 'Serial port mapping',
      reason: `Could not map INAV serial ports -- board "${config.board ?? 'unknown'}" is not in the ArduPilot board registry. Configure serial ports manually in the Ports page.`,
    });
  }

  // ── Vehicle type detection ───────────────────────────────────────

  // ── VTOL / Quadplane detection ──────────────────────────────────
  // A VTOL has two mixer profiles: one airplane + one multirotor.
  // Detect this from: (a) allPlatformTypes or (b) transition servos in smix.

  const planeTypes = new Set(['AIRPLANE', 'FLYING_WING']);
  const mcTypes = new Set(['TRICOPTER', 'QUADX', 'HEX_X', 'QUAD_X', 'MULTIROTOR']);

  const hasPlaneProfile = [...config.allPlatformTypes].some(t => planeTypes.has(t));
  const hasMcProfile = [...config.allPlatformTypes].some(t => mcTypes.has(t));
  const hasTransitionServos = config.servoMixes.some(s => s.inputSource === 29); // SMIX_INPUT.TRANSITION

  if ((hasPlaneProfile && hasMcProfile) || (hasTransitionServos && config.motors.length > 0)) {
    vehicleType = 'quadplane';
    frameDescription = 'QuadPlane VTOL';

    // Set Q_ENABLE for quadplane
    params['Q_ENABLE'] = 1;
    summary.push({
      category: 'Frame',
      label: 'Vehicle detected',
      inavValue: `VTOL (${[...config.allPlatformTypes].join(' + ')})`,
      arduPilotParam: 'Q_ENABLE',
      arduPilotValue: '1 (QuadPlane)',
    });

    // Infer Q_FRAME_CLASS from motor count
    // 3 motors = Tri (7), 4 = Quad (1), 6 = Hexa (2), 8 = Octa (3)
    const qFrameClassMap: Record<number, { cls: number; name: string }> = {
      3: { cls: 7, name: 'Tri' },
      4: { cls: 1, name: 'Quad' },
      6: { cls: 2, name: 'Hexa' },
      8: { cls: 3, name: 'Octa' },
    };
    const qFrame = qFrameClassMap[config.motors.length];
    if (qFrame) {
      params['Q_FRAME_CLASS'] = qFrame.cls;
      params['Q_FRAME_TYPE'] = 0; // Default (Plus/default), user can override in FrameStep
      summary.push({
        category: 'Frame',
        label: 'VTOL frame class',
        inavValue: `${config.motors.length} VTOL motors`,
        arduPilotParam: 'Q_FRAME_CLASS',
        arduPilotValue: `${qFrame.cls} (${qFrame.name})`,
      });
    }
  }

  // Priority: mixer > model_preview_type > motor/servo heuristic > platform_type
  if (config.mixer) {
    const frame = MIXER_MAP[config.mixer];
    if (frame) {
      vehicleType = frame.vehicleType;
      frameDescription = frame.description;
    }
  }

  if (!vehicleType && config.modelPreviewType !== null) {
    const model = MODEL_TYPE_MAP[config.modelPreviewType];
    if (model) {
      vehicleType = model.vehicleType;
      frameDescription = model.description;
    }
  }

  if (!vehicleType && config.motorCount === 1 && config.servoCount > 0) {
    vehicleType = 'plane';
    frameDescription = config.hasFlaps
      ? 'Airplane with flaps (from motor/servo mix)'
      : 'Airplane (from motor/servo mix)';
  }

  if (!vehicleType && config.motorCount > 1 && config.servoCount === 0) {
    vehicleType = 'copter';
    frameDescription = `${config.motorCount}-motor copter (from motor mix)`;
  }

  if (!vehicleType && config.platformType) {
    if (config.platformType === 'AIRPLANE' || config.platformType === 'FLYING_WING') {
      vehicleType = 'plane';
      frameDescription = config.platformType === 'FLYING_WING' ? 'Flying Wing' : 'Airplane';
    } else {
      vehicleType = 'copter';
    }
  }

  // ── Frame params (copters only) ──────────────────────────────────

  if (vehicleType === 'copter' && config.mixer) {
    const frame = MIXER_MAP[config.mixer];
    if (frame) {
      params['FRAME_CLASS'] = frame.frameClass;
      params['FRAME_TYPE'] = frame.frameType;
      summary.push({
        category: 'Frame',
        label: 'Frame type',
        inavValue: config.mixer,
        arduPilotParam: 'FRAME_CLASS + FRAME_TYPE',
        arduPilotValue: `${frame.frameClass} / ${frame.frameType}`,
      });
    }
  }

  // Fallback: INAV 9.x+ uses model_preview_type inside mixer_profile
  // instead of a standalone 'mixer QUADX' command. Map to FRAME_CLASS/TYPE
  // so FrameStep can auto-select the correct preset.
  if (vehicleType === 'copter' && !params['FRAME_CLASS'] && config.modelPreviewType !== null) {
    const previewToFrame: Record<number, { cls: number; type: number; name: string }> = {
      1:  { cls: 1,  type: 1, name: 'Quad X' },
      2:  { cls: 1,  type: 0, name: 'Quad +' },
      3:  { cls: 7,  type: 0, name: 'Tricopter' },
      4:  { cls: 2,  type: 1, name: 'Hex X' },
      5:  { cls: 2,  type: 0, name: 'Hex +' },
      6:  { cls: 14, type: 0, name: 'Y6' },
      9:  { cls: 4,  type: 1, name: 'Octo Flat X' },
      10: { cls: 4,  type: 0, name: 'Octo Flat +' },
    };
    const pf = previewToFrame[config.modelPreviewType];
    if (pf) {
      params['FRAME_CLASS'] = pf.cls;
      params['FRAME_TYPE'] = pf.type;
      summary.push({
        category: 'Frame',
        label: 'Frame type',
        inavValue: `model_preview_type ${config.modelPreviewType} (${pf.name})`,
        arduPilotParam: 'FRAME_CLASS + FRAME_TYPE',
        arduPilotValue: `${pf.cls} / ${pf.type}`,
      });
    }
  }

  if (vehicleType && vehicleType !== 'quadplane' && frameDescription) {
    summary.push({
      category: 'Frame',
      label: 'Vehicle detected',
      inavValue: frameDescription,
      arduPilotParam: '(vehicle type)',
      arduPilotValue: vehicleType,
    });
  }

  // ── Motor protocol ───────────────────────────────────────────────

  const motorProto = config.settings.get('motor_pwm_protocol');
  if (motorProto) {
    const mapped = MOTOR_PROTOCOL_MAP[motorProto.toUpperCase()];
    if (mapped) {
      // QuadPlane VTOL motors use Q_M_PWM_TYPE, not MOT_PWM_TYPE.
      // MOT_PWM_TYPE doesn't exist on ArduPlane firmware.
      const pwmParam = vehicleType === 'quadplane' ? 'Q_M_PWM_TYPE' : 'MOT_PWM_TYPE';
      params[pwmParam] = mapped.value;
      summary.push({
        category: 'Motors',
        label: 'Motor protocol',
        inavValue: motorProto,
        arduPilotParam: pwmParam,
        arduPilotValue: `${mapped.value} (${mapped.label})`,
      });
    }
  }

  // ── Receiver protocol ──────────────────────────────────────────────

  if (rxProvider) {
    const label = RX_PROTOCOL_LABELS[rxProvider.toUpperCase()] ?? rxProvider;
    // Check if we already mapped an RCIN port from serial lines
    const rcPort = Object.keys(params).find(
      (k) => k.match(/^SERIAL\d+_PROTOCOL$/) && params[k] === 23
    );
    summary.push({
      category: 'Receiver',
      label: 'RX protocol',
      inavValue: label,
      arduPilotParam: rcPort ?? '(configure in Receiver step)',
      arduPilotValue: rcPort ? 23 : 'auto',
    });
  }

  // ── GPS ──────────────────────────────────────────────────────────

  const gpsProvider = config.settings.get('gps_provider');
  if (gpsProvider) {
    const gpsType = GPS_TYPE_MAP[gpsProvider.toUpperCase()];
    if (gpsType !== undefined) {
      params['GPS_TYPE'] = gpsType;
      summary.push({
        category: 'GPS',
        label: 'GPS type',
        inavValue: gpsProvider,
        arduPilotParam: 'GPS_TYPE',
        arduPilotValue: gpsType,
      });
    }
  }

  if (hasGps) {
    const gpsPort = Object.keys(params).find(
      (k) => k.match(/^SERIAL\d+_PROTOCOL$/) && params[k] === 5
    );
    summary.push({
      category: 'GPS',
      label: 'GPS enabled',
      inavValue: 'feature GPS' + (gpsProvider ? ` (${gpsProvider})` : ''),
      arduPilotParam: gpsPort ?? '(verify in GPS step)',
      arduPilotValue: gpsPort ? '5 (GPS)' : 'auto',
    });
  }

  params['GPS_GNSS_MODE'] = 31; // All constellations

  // ── Battery ──────────────────────────────────────────────────────

  const warnCellCv = parseInavInt(config.settings.get('vbat_warning_cell_voltage'));
  const minCellCv = parseInavInt(config.settings.get('vbat_min_cell_voltage'));
  const capacity = parseInavInt(config.settings.get('battery_capacity'));

  // Report cell count source
  if (cellCountSource === 'config') {
    summary.push({
      category: 'Battery',
      label: 'Cell count from INAV config',
      inavValue: `${effectiveCells}S`,
      arduPilotParam: '(used for voltage calc)',
      arduPilotValue: effectiveCells,
    });
  } else if (cellCountSource === 'voltage') {
    summary.push({
      category: 'Battery',
      label: 'Cell count (estimated from voltage)',
      inavValue: `${liveVoltage.toFixed(1)}V detected`,
      arduPilotParam: '(used for voltage calc)',
      arduPilotValue: `${effectiveCells}S (estimated)`,
    });
  } else if (cellCountSource === 'default') {
    summary.push({
      category: 'Battery',
      label: 'Cell count (defaulted -- verify!)',
      inavValue: 'bat_cells=0 (auto)',
      arduPilotParam: '(used for voltage calc)',
      arduPilotValue: `${effectiveCells}S (ASSUMED -- check Battery page)`,
    });
    skipped.push({
      category: 'Battery',
      label: 'Cell count auto-detect',
      reason: 'INAV bat_cells=0 means auto-detect. No battery connected to estimate. ' +
        'Defaulted to 4S -- voltage thresholds may be wrong. ' +
        'Check the Battery page and set the correct cell count.',
    });
  }

  if (warnCellCv !== null) {
    const totalVolt = (warnCellCv / 100) * effectiveCells;
    params['BATT_LOW_VOLT'] = Math.round(totalVolt * 10) / 10;
    summary.push({
      category: 'Battery',
      label: `Low voltage (${effectiveCells}S)`,
      inavValue: `${(warnCellCv / 100).toFixed(2)}V/cell`,
      arduPilotParam: 'BATT_LOW_VOLT',
      arduPilotValue: params['BATT_LOW_VOLT'],
    });
  }

  if (minCellCv !== null) {
    const totalVolt = (minCellCv / 100) * effectiveCells;
    params['BATT_CRT_VOLT'] = Math.round(totalVolt * 10) / 10;
    summary.push({
      category: 'Battery',
      label: `Critical voltage (${effectiveCells}S)`,
      inavValue: `${(minCellCv / 100).toFixed(2)}V/cell`,
      arduPilotParam: 'BATT_CRT_VOLT',
      arduPilotValue: params['BATT_CRT_VOLT'],
    });
  }

  if (capacity !== null && capacity > 0) {
    params['BATT_CAPACITY'] = capacity;
    summary.push({
      category: 'Battery',
      label: 'Battery capacity',
      inavValue: `${capacity} mAh`,
      arduPilotParam: 'BATT_CAPACITY',
      arduPilotValue: capacity,
    });
  }

  // ── Failsafes ────────────────────────────────────────────────────

  const fsProcedure = config.settings.get('failsafe_procedure');
  if (fsProcedure) {
    const key = fsProcedure.toUpperCase();
    if (vehicleType === 'plane') {
      const action = PLANE_FS_MAP[key];
      if (action !== undefined) {
        params['FS_LONG_ACTN'] = action;
        params['THR_FAILSAFE'] = 1;
        summary.push({ category: 'Failsafes', label: 'RC failsafe', inavValue: fsProcedure, arduPilotParam: 'FS_LONG_ACTN', arduPilotValue: action });
      }
    } else {
      const action = COPTER_FS_MAP[key];
      if (action !== undefined) {
        params['FS_THR_ENABLE'] = action;
        summary.push({ category: 'Failsafes', label: 'RC failsafe', inavValue: fsProcedure, arduPilotParam: 'FS_THR_ENABLE', arduPilotValue: action });
      }
    }
  }

  // Battery failsafe defaults
  if (vehicleType === 'plane') {
    params['BATT_FS_LOW_ACT'] = 1; // RTL
    params['BATT_FS_CRT_ACT'] = 2; // Land
  } else {
    params['BATT_FS_LOW_ACT'] = 2; // RTL
    params['BATT_FS_CRT_ACT'] = 1; // Land
  }

  // RTH altitude (both INAV and ArduPilot use cm)
  const rthAlt = parseInavInt(config.settings.get('nav_rth_altitude'));
  if (rthAlt !== null) {
    params['RTL_ALT'] = rthAlt;
    summary.push({ category: 'Failsafes', label: 'RTH altitude', inavValue: `${rthAlt / 100}m`, arduPilotParam: 'RTL_ALT', arduPilotValue: rthAlt });
  }

  // ── Filters ──────────────────────────────────────────────────────

  const gyroLpf = parseInavInt(config.settings.get('gyro_main_lpf_hz'))
    ?? parseInavInt(config.settings.get('gyro_lpf_hz'));
  if (gyroLpf !== null && gyroLpf > 0) {
    params['INS_GYRO_FILTER'] = gyroLpf;
    summary.push({ category: 'Filters', label: 'Gyro LPF', inavValue: `${gyroLpf} Hz`, arduPilotParam: 'INS_GYRO_FILTER', arduPilotValue: gyroLpf });
  }

  // ── Compass orientation ─────────────────────────────────────────

  const alignMag = config.settings.get('align_mag');
  if (alignMag) {
    const compassOrient = mapCompassOrientation(alignMag);
    if (compassOrient !== null) {
      params['COMPASS_ORIENT'] = compassOrient;
      summary.push({
        category: 'Sensors',
        label: 'Compass orientation',
        inavValue: alignMag,
        arduPilotParam: 'COMPASS_ORIENT',
        arduPilotValue: compassOrient,
      });
    }
  }

  // ── Board alignment (roll/pitch trim) ─────────────────────────
  // INAV: align_board_roll / align_board_pitch in decidegrees (10 = 1 degree)
  // ArduPilot: AHRS_TRIM_X (roll) / AHRS_TRIM_Y (pitch) in radians

  const alignRoll = parseInavInt(config.settings.get('align_board_roll'));
  const alignPitch = parseInavInt(config.settings.get('align_board_pitch'));

  if (alignRoll !== null && alignRoll !== 0) {
    const radians = alignRoll * Math.PI / 1800; // decidegrees -> radians
    params['AHRS_TRIM_X'] = parseFloat(radians.toFixed(4));
    summary.push({
      category: 'Sensors',
      label: 'Board roll trim',
      inavValue: `${alignRoll} decideg (${(alignRoll / 10).toFixed(1)} deg)`,
      arduPilotParam: 'AHRS_TRIM_X',
      arduPilotValue: `${radians.toFixed(4)} rad`,
    });
  }

  if (alignPitch !== null && alignPitch !== 0) {
    const radians = alignPitch * Math.PI / 1800;
    params['AHRS_TRIM_Y'] = parseFloat(radians.toFixed(4));
    summary.push({
      category: 'Sensors',
      label: 'Board pitch trim',
      inavValue: `${alignPitch} decideg (${(alignPitch / 10).toFixed(1)} deg)`,
      arduPilotParam: 'AHRS_TRIM_Y',
      arduPilotValue: `${radians.toFixed(4)} rad`,
    });
  }

  // ── Servo PWM rate ──────────────────────────────────────────────

  const servoPwmRate = parseInavInt(config.settings.get('servo_pwm_rate'));
  if (servoPwmRate !== null && servoPwmRate > 0) {
    // ArduPilot doesn't have a direct equivalent global servo rate param,
    // but we note it for the user and set per-servo rates if available
    summary.push({
      category: 'General',
      label: 'Servo PWM rate',
      inavValue: `${servoPwmRate} Hz`,
      arduPilotParam: '(info)',
      arduPilotValue: `${servoPwmRate} Hz -- set per-output in BRD_PWM_COUNT or SERVO_RATE`,
    });
  }

  // ── Motor direction ─────────────────────────────────────────────

  // ── RC expo & rates (no direct equivalent) ────────────────────
  // INAV uses rc_expo, rc_yaw_expo, roll_rate, pitch_rate, yaw_rate.
  // ArduPilot handles rates differently -- ATC_RAT_*_MAX for max rotation
  // rate, and ACRO_*_RATE for acro mode. There's no 1:1 conversion because
  // the control loops are fundamentally different.
  const rcExpo = config.settings.get('rc_expo');
  const rollRate = config.settings.get('roll_rate');
  if (rcExpo || rollRate) {
    skipped.push({
      category: 'RC',
      label: 'RC expo & rates',
      reason: 'INAV rc_expo/roll_rate/pitch_rate/yaw_rate have no direct ArduPilot equivalent. ' +
        'ArduPilot uses a different control model (ATC_RAT_*_MAX for rate limits, ' +
        'ACRO_*_RATE for acro mode). The defaults work well for most aircraft. ' +
        'Tune rates after your first flight if needed.',
    });
  }

  const motorDirection = config.settings.get('motor_direction');
  if (motorDirection === 'REVERSED' || motorDirection === '1') {
    // Props-out configuration
    params['MOT_YAW_SV_REV'] = 1; // Reverse yaw for reversed motors (copter)
    summary.push({
      category: 'Motors',
      label: 'Motor direction',
      inavValue: 'Reversed (props-out)',
      arduPilotParam: 'MOT_YAW_SV_REV',
      arduPilotValue: '1 (reversed)',
    });
  }

  // ── Arming angle ────────────────────────────────────────────────

  const smallAngle = parseInavInt(config.settings.get('small_angle'));
  if (smallAngle !== null && smallAngle !== 25) {
    // ArduPilot's ARMING_CHECK doesn't have a direct angle param,
    // but ANGLE_MAX and pre-arm INS checks are related
    if (smallAngle >= 180) {
      // INAV small_angle=180 means "arm at any angle" -- skip ArduPilot's level check
      summary.push({
        category: 'General',
        label: 'Arm at any angle',
        inavValue: `small_angle = ${smallAngle}`,
        arduPilotParam: '(info)',
        arduPilotValue: 'INAV was set to arm at any angle. ArduPilot checks level by default.',
      });
    }
  }

  // ── Craft name ──────────────────────────────────────────────────

  if (config.craftName) {
    summary.push({
      category: 'General',
      label: 'Craft name',
      inavValue: config.craftName,
      arduPilotParam: '(info)',
      arduPilotValue: `"${config.craftName}" -- will be used as the aircraft name`,
    });
  }

  // ── Channel map ─────────────────────────────────────────────────

  if (config.channelMap) {
    const channelNames: Record<string, { param: string; label: string }> = {
      A: { param: 'RCMAP_ROLL', label: 'Roll' },
      E: { param: 'RCMAP_PITCH', label: 'Pitch' },
      T: { param: 'RCMAP_THROTTLE', label: 'Throttle' },
      R: { param: 'RCMAP_YAW', label: 'Yaw' },
    };
    const map = config.channelMap;
    for (let i = 0; i < map.length && i < 4; i++) {
      const ch = channelNames[map[i]];
      if (ch) {
        params[ch.param] = i + 1;
        summary.push({
          category: 'Receiver',
          label: `${ch.label} channel`,
          inavValue: `map ${map} (CH${i + 1} = ${ch.label})`,
          arduPilotParam: ch.param,
          arduPilotValue: i + 1,
        });
      }
    }
  }

  // ── GPS constellations ──────────────────────────────────────────

  const useGalileo = config.settings.get('gps_ublox_use_galileo')?.toUpperCase() === 'ON';
  const useBeidou = config.settings.get('gps_ublox_use_beidou')?.toUpperCase() === 'ON';
  const useGlonass = config.settings.get('gps_ublox_use_glonass')?.toUpperCase() !== 'OFF'; // ON by default
  if (hasGps) {
    // ArduPilot GPS_GNSS_MODE bitmask: GPS=1, SBAS=2, Galileo=4, BeiDou=8, GLONASS=16
    let gnssMode = 1; // GPS always on
    gnssMode |= 2;    // SBAS always on
    if (useGalileo) gnssMode |= 4;
    if (useBeidou) gnssMode |= 8;
    if (useGlonass) gnssMode |= 16;
    params['GPS_GNSS_MODE'] = gnssMode;
    const constellations = ['GPS', 'SBAS'];
    if (useGlonass) constellations.push('GLONASS');
    if (useGalileo) constellations.push('Galileo');
    if (useBeidou) constellations.push('BeiDou');
    summary.push({
      category: 'GPS',
      label: 'GNSS constellations',
      inavValue: constellations.filter(c => c !== 'GPS' && c !== 'SBAS').join(', ') || 'GPS only',
      arduPilotParam: 'GPS_GNSS_MODE',
      arduPilotValue: gnssMode,
    });
  }

  // ── Fixed-wing bank angle ───────────────────────────────────────

  const fwBankAngle = parseInavInt(config.settings.get('nav_fw_bank_angle'));
  if (fwBankAngle !== null && (vehicleType === 'plane' || vehicleType === 'quadplane')) {
    params['ROLL_LIMIT_DEG'] = fwBankAngle;
    summary.push({
      category: 'Navigation',
      label: 'FW bank angle limit',
      inavValue: `${fwBankAngle} deg`,
      arduPilotParam: 'ROLL_LIMIT_DEG',
      arduPilotValue: fwBankAngle,
    });
  }

  // ── Waypoint radius ─────────────────────────────────────────────

  const wpRadius = parseInavInt(config.settings.get('nav_wp_radius'));
  if (wpRadius !== null) {
    // INAV is in cm, ArduPilot WP_RADIUS is in meters
    const wpRadiusM = Math.round(wpRadius / 100);
    params['WP_RADIUS'] = wpRadiusM;
    summary.push({
      category: 'Navigation',
      label: 'Waypoint radius',
      inavValue: `${wpRadius} cm (${wpRadiusM}m)`,
      arduPilotParam: 'WP_RADIUS',
      arduPilotValue: wpRadiusM,
    });
  }

  // ── FW launch parameters ────────────────────────────────────────

  if (vehicleType === 'plane' || vehicleType === 'quadplane') {
    const launchAngle = parseInavInt(config.settings.get('nav_fw_launch_max_angle'));
    const climbAngle = parseInavInt(config.settings.get('nav_fw_launch_climb_angle'));
    const motorDelay = parseInavInt(config.settings.get('nav_fw_launch_motor_delay'));

    if (launchAngle !== null && launchAngle !== 75) {
      params['TKOFF_THR_MAX_T'] = Math.round(motorDelay ? motorDelay / 100 : 2);
      summary.push({
        category: 'General',
        label: 'FW launch config',
        inavValue: `max angle ${launchAngle} deg, climb ${climbAngle ?? 18} deg, motor delay ${motorDelay ?? 0}`,
        arduPilotParam: 'TKOFF_THR_MAX_T',
        arduPilotValue: `${Math.round(motorDelay ? motorDelay / 100 : 2)}s motor delay`,
      });
    }
  }

  // ── OSD layout ──────────────────────────────────────────────────

  // ── OSD video system and layout ─────────────────────────────────

  // Detect video system from INAV settings
  const videoSystem = (config.settings.get('osd_video_system') ?? 'AUTO').toUpperCase();
  const hdSystems = ['HD', 'HDZERO', 'DJIWTF', 'AVATAR', 'DJIGOGGLES_V1', 'DJIGOGGLES_V2'];
  const isHdOsd = hdSystems.includes(videoSystem);

  // ArduPilot OSD_TYPE: 1 = MAX7456 (analog), 3 = MSP displayport (HD)
  const osdType = isHdOsd ? 3 : 1;

  // Coordinate limits: analog 30x16 (PAL) / 30x13 (NTSC), HD 50x18 (ArduPilot MSP)
  const maxX = isHdOsd ? 49 : 29;
  const maxY = isHdOsd ? 17 : 15;

  const osdMapped = mapOsdLayout(config.osdLayouts, maxX, maxY);
  if (osdMapped.length > 0) {
    // ArduPilot OSD params: OSD1_RSSI_EN, OSD1_RSSI_X, OSD1_RSSI_Y
    // The "1" is the OSD screen number. INAV layout 0 maps to ArduPilot screen 1.
    const osdScreen = 1;
    let osdCount = 0;
    let clampedCount = 0;
    for (const item of osdMapped) {
      // Replace OSD_ prefix with OSD1_ (or OSD2_ for other screens)
      const apParam = item.apPrefix.replace('OSD_', `OSD${osdScreen}_`);
      params[`${apParam}_EN`] = 1;
      params[`${apParam}_X`] = item.x;
      params[`${apParam}_Y`] = item.y;
      if (item.clamped) clampedCount++;
      osdCount++;
    }
    // Enable OSD and screen 1
    params['OSD_TYPE'] = osdType;
    params['OSD1_ENABLE'] = 1;

    const osdTypeLabel = isHdOsd ? `MSP displayport (${videoSystem})` : `MAX7456 (${videoSystem === 'AUTO' ? 'auto' : videoSystem.toLowerCase()})`;
    summary.push({
      category: 'OSD',
      label: 'OSD type',
      inavValue: videoSystem,
      arduPilotParam: 'OSD_TYPE',
      arduPilotValue: `${osdType} (${osdTypeLabel})`,
    });
    summary.push({
      category: 'OSD',
      label: 'OSD elements',
      inavValue: `${config.osdLayouts.size} elements (${[...config.osdLayouts.values()].filter(v => v.visible).length} visible)`,
      arduPilotParam: 'OSD1_*',
      arduPilotValue: `${osdCount} elements mapped to screen 1${clampedCount > 0 ? ` (${clampedCount} repositioned to fit)` : ''}`,
    });
  }

  // ── Flight modes from AUX ────────────────────────────────────────

  const detectedModes = detectInavFlightModes(config.auxModes, vehicleType);
  if (detectedModes.length > 0) {
    for (let i = 0; i < Math.min(detectedModes.length, 6); i++) {
      params[`FLTMODE${i + 1}`] = detectedModes[i].arduPilotMode;
    }
    summary.push({ category: 'Flight Modes', label: 'Modes from AUX', inavValue: detectedModes.map((m) => m.name).join(', '), arduPilotParam: 'FLTMODE1-6', arduPilotValue: detectedModes.length });
  }

  // ── Motor and servo output mapping ────────────────────────────────
  // Use timer-to-pad data from INAV target.c to determine which physical
  // pads are motors and which are servos, then assign functions accordingly.
  //
  // Algorithm:
  // 1. timer_output_mode N sets TIM(N+1) to MOTORS/SERVOS/LED/AUTO
  // 2. All pads sharing a hardware timer get the same type
  // 3. Motors are assigned to MOTORS pads in S-pad order
  // 4. Servos are assigned to SERVOS pads in S-pad order
  // 5. AUTO pads: first N become motors, then servos (based on remaining need)

  const motorFunctions = mapMotorOutputs(config, vehicleType);
  const servoFunctions = classifyServoFunctions(config);

  const inavBoard = config.board?.toUpperCase() ?? '';
  // Strip common INAV firmware suffixes that don't affect pin mapping
  const inavBoardBase = inavBoard.replace(/_(SD|HD|V\d+|BT)$/i, '');
  const timerPins = INAV_TIMER_DATA[inavBoard] ?? INAV_TIMER_DATA[inavBoardBase];

  if (timerPins && timerPins.length > 0) {
    // ── Board-aware mapping using timer data ──────────────────────

    // Build timer mode map: timerNum -> mode
    // timer_output_mode N = TIM(N+1) mode
    const timerModes = new Map<number, string>();
    for (const [idx, mode] of config.timerOutputModes) {
      timerModes.set(idx + 1, mode);
    }

    // Classify each pin by its timer's mode
    type PadType = 'motor' | 'servo' | 'led' | 'skip';
    const padClassification: { padLabel: string; padNum: number; type: PadType }[] = [];

    for (const pin of timerPins) {
      if (!pin.padLabel) continue; // Skip non-output pins (PPM, softserial, etc.)

      const padNum = parseInt(pin.padLabel.replace(/^S/, ''));
      if (isNaN(padNum)) continue;

      const timerMode = timerModes.get(pin.timerNum);
      let type: PadType;

      if (timerMode === 'MOTORS') {
        type = 'motor';
      } else if (timerMode === 'SERVOS') {
        type = 'servo';
      } else if (timerMode === 'LED' || pin.isLed) {
        type = 'led';
      } else if (timerMode === 'AUTO' || timerMode === undefined) {
        // AUTO pads: will be resolved below
        type = 'skip'; // placeholder
      } else {
        type = 'skip';
      }

      padClassification.push({ padLabel: pin.padLabel, padNum, type });
    }

    // Also check non-output pins that were overridden to SERVOS/MOTORS
    // (e.g. LED or beeper pins repurposed)
    for (const pin of timerPins) {
      if (pin.padLabel) continue; // Already handled above
      if (!pin.isOutput && !pin.isLed && !pin.isBeeper) continue;

      const timerMode = timerModes.get(pin.timerNum);
      if (timerMode === 'SERVOS' || timerMode === 'MOTORS') {
        // Repurposed pin -- assign a virtual pad number
        // These won't map to standard S-pads but we track them
        padClassification.push({
          padLabel: pin.isLed ? 'LED' : pin.isBeeper ? 'BEEPER' : `TIM${pin.timerNum}`,
          padNum: 100 + pin.timerNum, // High number so they sort last
          type: timerMode === 'MOTORS' ? 'motor' : 'servo',
        });
      }
    }

    // Resolve AUTO pads: count assigned motors/servos, fill remaining
    const assignedMotorPads = padClassification.filter(p => p.type === 'motor').length;
    const assignedServoPads = padClassification.filter(p => p.type === 'servo').length;
    let remainingMotors = motorFunctions.length - assignedMotorPads;
    let remainingServos = servoFunctions.length - assignedServoPads;

    // AUTO pads (type='skip' with valid S-labels) become motors then servos
    for (const pad of padClassification) {
      if (pad.type !== 'skip') continue;
      if (remainingMotors > 0) {
        pad.type = 'motor';
        remainingMotors--;
      } else if (remainingServos > 0) {
        pad.type = 'servo';
        remainingServos--;
      }
    }

    // Sort by S-pad number and assign sequentially
    const motorPads = padClassification
      .filter(p => p.type === 'motor')
      .sort((a, b) => a.padNum - b.padNum);

    const servoPads = padClassification
      .filter(p => p.type === 'servo')
      .sort((a, b) => a.padNum - b.padNum);

    // Assign motors
    for (let i = 0; i < Math.min(motorPads.length, motorFunctions.length); i++) {
      const pad = motorPads[i];
      const motor = motorFunctions[i];
      // INAV S-pad number = ArduPilot SERVO output number (for Matek boards)
      params[`SERVO${pad.padNum}_FUNCTION`] = motor.function;
      summary.push({
        category: 'Output Mapping',
        label: motor.label,
        inavValue: `Motor ${motor.inavIndex} on ${pad.padLabel}`,
        arduPilotParam: `SERVO${pad.padNum}_FUNCTION`,
        arduPilotValue: `${motor.function} (${motor.label})`,
      });
    }

    // Assign servos
    for (let i = 0; i < Math.min(servoPads.length, servoFunctions.length); i++) {
      const pad = servoPads[i];
      const servo = servoFunctions[i];
      params[`SERVO${pad.padNum}_FUNCTION`] = servo.function;
      summary.push({
        category: 'Output Mapping',
        label: servo.label,
        inavValue: `Servo ${servo.inavIndex} on ${pad.padLabel}`,
        arduPilotParam: `SERVO${pad.padNum}_FUNCTION`,
        arduPilotValue: `${servo.function} (${servo.label})`,
      });

      // Import servo travel limits if available
      const servoConf = config.servoConfigs.get(servo.inavIndex);
      if (servoConf) {
        params[`SERVO${pad.padNum}_MIN`] = servoConf.min;
        params[`SERVO${pad.padNum}_MAX`] = servoConf.max;
        params[`SERVO${pad.padNum}_TRIM`] = servoConf.middle;
      }
    }

    // Zero unused motor pads (more motor-typed pads than actual motors)
    for (let i = motorFunctions.length; i < motorPads.length; i++) {
      params[`SERVO${motorPads[i].padNum}_FUNCTION`] = 0;
    }

    // Zero unused servo pads
    for (let i = servoFunctions.length; i < servoPads.length; i++) {
      params[`SERVO${servoPads[i].padNum}_FUNCTION`] = 0;
    }

    // Zero all other outputs up to 16 to prevent FC defaults bleeding through
    const assignedPads = new Set([
      ...motorPads.map(p => p.padNum),
      ...servoPads.map(p => p.padNum),
    ]);
    for (let i = 1; i <= 16; i++) {
      if (!assignedPads.has(i) && params[`SERVO${i}_FUNCTION`] === undefined) {
        params[`SERVO${i}_FUNCTION`] = 0;
      }
    }

    const totalOutputs = motorPads.length + servoPads.length;
    if (totalOutputs > 0) {
      summary.push({
        category: 'Output Mapping',
        label: 'Board-aware mapping',
        inavValue: `${motorFunctions.length} motors + ${servoFunctions.length} servos (from timer data)`,
        arduPilotParam: 'SERVO_FUNCTION',
        arduPilotValue: `${motorPads.map(p => p.padLabel).join(',')} motors; ${servoPads.map(p => p.padLabel).join(',')} servos`,
      });
    }

  } else {
    // ── Fallback: sequential assignment (no timer data for this board) ──

    let outputIdx = 1;

    for (const motor of motorFunctions) {
      params[`SERVO${outputIdx}_FUNCTION`] = motor.function;
      summary.push({
        category: 'Output Mapping',
        label: motor.label,
        inavValue: `Motor ${motor.inavIndex} (mmix ${motor.inavIndex})`,
        arduPilotParam: `SERVO${outputIdx}_FUNCTION`,
        arduPilotValue: `${motor.function} (${motor.label})`,
      });
      outputIdx++;
    }

    for (const servo of servoFunctions) {
      params[`SERVO${outputIdx}_FUNCTION`] = servo.function;
      summary.push({
        category: 'Output Mapping',
        label: servo.label,
        inavValue: `Servo ${servo.inavIndex} (${servo.description})`,
        arduPilotParam: `SERVO${outputIdx}_FUNCTION`,
        arduPilotValue: `${servo.function} (${servo.label})`,
      });

      const servoConf = config.servoConfigs.get(servo.inavIndex);
      if (servoConf) {
        params[`SERVO${outputIdx}_MIN`] = servoConf.min;
        params[`SERVO${outputIdx}_MAX`] = servoConf.max;
        params[`SERVO${outputIdx}_TRIM`] = servoConf.middle;
      }

      outputIdx++;
    }

    if (motorFunctions.length > 0 || servoFunctions.length > 0) {
      summary.push({
        category: 'Output Mapping',
        label: 'Sequential mapping (no timer data)',
        inavValue: `${motorFunctions.length} motors + ${servoFunctions.length} servos`,
        arduPilotParam: `SERVO1-${outputIdx - 1}_FUNCTION`,
        arduPilotValue: `${outputIdx - 1} outputs assigned sequentially`,
      });
    }
  }

  // ── Skipped items ────────────────────────────────────────────────

  skipped.push({ category: 'PIDs', label: 'PID tuning', reason: 'INAV and ArduPilot use different PID controllers with different scaling. Use ArduPilot defaults and run AutoTune.' });
  skipped.push({ category: 'Navigation tuning', label: 'Navigation params', reason: 'Navigation parameters differ between firmware. ArduPilot defaults are safe starting points.' });

  if (config.features.has('AIRMODE')) {
    skipped.push({ category: 'AirMode', label: 'AirMode feature', reason: 'ArduPilot handles AirMode differently (via ACRO_OPTIONS parameter).' });
  }

  // ── Build detected config for display ────────────────────────────

  const detected: DetectedConfig = {
    vehicleType: frameDescription ?? (vehicleType ?? 'Unknown'),
    motorProtocol: motorProto ?? null,
    receiverProtocol: rxProvider ?? null,
    hasGps,
    hasTelemetry,
    hasEscTelemetry,
    cellCount: effectiveCells,
    hasFlaps: config.hasFlaps,
  };

  return { params, detected, summary, skipped, vehicleType, frameDescription, cellCount: effectiveCells, craftName: config.craftName };
}

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function parseInavInt(value: string | undefined): number | null {
  if (value === undefined) return null;
  const n = parseInt(value);
  return isNaN(n) ? null : n;
}

function detectInavFlightModes(
  auxModes: InavAuxMode[],
  vehicleType: 'copter' | 'plane' | 'quadplane' | null,
): { arduPilotMode: number; name: string }[] {
  const seen = new Set<number>();
  const result: { arduPilotMode: number; name: string }[] = [];

  for (const aux of auxModes) {
    if (aux.modeId === 0) continue;
    const mapping = INAV_MODE_MAP[aux.modeId];
    if (!mapping) continue;
    const apMode = vehicleType === 'plane' ? mapping.plane : mapping.copter;
    if (apMode === undefined) continue;
    if (seen.has(apMode)) continue;
    seen.add(apMode);
    result.push({ arduPilotMode: apMode, name: mapping.name });
  }

  const baseMode = 0;
  if (!seen.has(baseMode)) {
    result.unshift({ arduPilotMode: baseMode, name: vehicleType === 'plane' ? 'Manual' : 'Stabilize' });
  }

  return result.slice(0, 6);
}

/* ================================================================== */
/*  Motor / Servo Output Classification                                */
/* ================================================================== */

/**
 * INAV smix input source IDs.
 * These tell us what flight axis a servo responds to.
 */
const SMIX_INPUT = {
  ROLL: 0,
  PITCH: 1,
  YAW: 2,
  THROTTLE: 3,
  RC_ROLL: 8,
  RC_PITCH: 9,
  RC_YAW: 10,
  FLAPS: 12,
  TRANSITION: 29,
  THROTTLE_SERVO: 38,
};

interface MappedMotor {
  inavIndex: number;
  function: number;  // ArduPilot SERVO_FUNCTION (33=Motor1, 34=Motor2, ...)
  label: string;
}

interface MappedServo {
  inavIndex: number;
  function: number;  // ArduPilot SERVO_FUNCTION (77=Aileron, 78=Elevator, etc.)
  label: string;
  description: string; // What the smix analysis found
}

/**
 * Map INAV motor mixer entries to ArduPilot motor functions.
 * Motor 1 = function 33, Motor 2 = 34, etc.
 *
 * Special case: tricopter (3 motors on a quadplane) uses Motors 1, 2, 4
 * (skipping Motor 3). ArduPilot's tricopter frame has no Motor 3 --
 * position 3 is reserved for yaw servo (function 39).
 */
function mapMotorOutputs(config: InavConfig, vehicleType: string | null): MappedMotor[] {
  const isTricopter = vehicleType === 'quadplane' && config.motors.length === 3;

  // ArduPilot tricopter motor numbers: 1, 2, 4 (functions 33, 34, 36)
  // All other frames: sequential 1, 2, 3, 4... (functions 33, 34, 35, 36...)
  const motorNumbers = isTricopter ? [1, 2, 4] : config.motors.map((_, i) => i + 1);

  return config.motors.map((m, i) => {
    const motorNum = motorNumbers[i];
    return {
      inavIndex: m.index,
      function: 32 + motorNum,  // Motor 1 = 33, Motor 2 = 34, Motor 4 = 36
      label: `Motor ${motorNum}`,
    };
  });
}

/**
 * Classify INAV servo mixer rules to determine ArduPilot surface function.
 *
 * Groups all smix rules by servo index, then analyzes which flight axes
 * each servo responds to. The combination determines the surface type:
 *
 *   roll only              -> Aileron (77)
 *   pitch only             -> Elevator (78)
 *   yaw only               -> Rudder (79)
 *   roll + pitch (same sign on pitch) -> Elevon (both map to 77 in ArduPilot)
 *   roll + pitch (diff sign) -> Flaperon or Elevon
 *   transition only        -> Motor Tilt (41)
 *   transition + yaw       -> Motor Tilt (41) with yaw authority (tricopter tilt)
 *   flaps                  -> Flap (84)
 *   throttle only          -> Throttle (70)
 */
function classifyServoFunctions(config: InavConfig): MappedServo[] {
  // Group smix rules by servo index
  const servoRules = new Map<number, InavServoMix[]>();
  for (const rule of config.servoMixes) {
    const list = servoRules.get(rule.servoIndex) ?? [];
    list.push(rule);
    servoRules.set(rule.servoIndex, list);
  }

  const results: MappedServo[] = [];

  // Track how many of each type we've seen for left/right designation
  let aileronCount = 0;
  let elevonCount = 0;
  let elevatorCount = 0;
  let tiltCount = 0;
  let flapCount = 0;

  // Sort by servo index for deterministic ordering
  const sortedIndices = Array.from(servoRules.keys()).sort((a, b) => a - b);

  for (const servoIdx of sortedIndices) {
    const rules = servoRules.get(servoIdx)!;

    // Analyze which inputs this servo responds to
    const inputs = new Set(rules.map(r => r.inputSource));
    const hasRoll = inputs.has(SMIX_INPUT.ROLL) || inputs.has(SMIX_INPUT.RC_ROLL);
    const hasPitch = inputs.has(SMIX_INPUT.PITCH) || inputs.has(SMIX_INPUT.RC_PITCH);
    const hasYaw = inputs.has(SMIX_INPUT.YAW) || inputs.has(SMIX_INPUT.RC_YAW);
    const hasTransition = inputs.has(SMIX_INPUT.TRANSITION);
    const hasFlaps = inputs.has(SMIX_INPUT.FLAPS);
    const hasThrottle = inputs.has(SMIX_INPUT.THROTTLE) || inputs.has(SMIX_INPUT.THROTTLE_SERVO);

    let func: number;
    let label: string;
    let description: string;

    if (hasTransition) {
      // Tilt servo (VTOL transition mechanism)
      tiltCount++;
      func = 41; // Motor Tilt
      label = tiltCount <= 1 ? 'Tilt Left' : 'Tilt Right';
      description = hasYaw ? 'transition + yaw (tilt with yaw authority)' : 'transition (tilt)';
    } else if (hasRoll && hasPitch) {
      // Mixes both roll and pitch -> elevon
      elevonCount++;
      func = 77; // Aileron (ArduPilot uses 77 for both elevon L and R)
      label = elevonCount <= 1 ? 'Elevon Left' : 'Elevon Right';
      description = 'roll + pitch (elevon)';
    } else if (hasRoll && !hasPitch && !hasYaw) {
      // Roll only -> aileron
      aileronCount++;
      func = 77; // Aileron
      label = aileronCount <= 1 ? 'Aileron Left' : 'Aileron Right';
      description = 'roll (aileron)';
    } else if (hasPitch && !hasRoll && !hasYaw) {
      // Pitch only -> elevator
      elevatorCount++;
      func = 78; // Elevator
      label = elevatorCount <= 1 ? 'Elevator' : `Elevator ${elevatorCount}`;
      description = 'pitch (elevator)';
    } else if (hasYaw && !hasRoll && !hasPitch) {
      // Yaw only -> rudder
      func = 79; // Rudder
      label = 'Rudder';
      description = 'yaw (rudder)';
    } else if (hasFlaps) {
      // Flap input
      flapCount++;
      func = 84; // Flap
      label = flapCount <= 1 ? 'Flap Left' : 'Flap Right';
      description = 'flaps';
    } else if (hasThrottle && !hasRoll && !hasPitch && !hasYaw) {
      // Throttle only -> forward throttle
      func = 70; // Throttle
      label = 'Throttle';
      description = 'throttle (servo-driven)';
    } else {
      // Unknown combination -- best guess from available data
      func = 0; // Disabled -- let user assign
      label = `Servo ${servoIdx}`;
      description = `inputs: ${Array.from(inputs).join(', ')} (unknown mapping)`;
    }

    results.push({
      inavIndex: servoIdx,
      function: func,
      label,
      description,
    });
  }

  return results;
}

/* ================================================================== */
/*  Compass orientation mapping                                        */
/* ================================================================== */

/**
 * Map INAV align_mag value to ArduPilot COMPASS_ORIENT.
 *
 * INAV uses string labels like CW0, CW90, CW270FLIP, etc.
 * ArduPilot uses numeric ROTATION_* enum values.
 */
const COMPASS_ORIENT_MAP: Record<string, number> = {
  'DEFAULT':      0,   // ROTATION_NONE
  'CW0':          0,   // ROTATION_NONE
  'CW0DEG':       0,
  'CW90':         2,   // ROTATION_YAW_90
  'CW90DEG':      2,
  'CW180':        4,   // ROTATION_YAW_180
  'CW180DEG':     4,
  'CW270':        6,   // ROTATION_YAW_270
  'CW270DEG':     6,
  'CW0FLIP':      8,   // ROTATION_ROLL_180
  'CW0DEGFLIP':   8,
  'CW90FLIP':     10,  // ROTATION_ROLL_180_YAW_90
  'CW90DEGFLIP':  10,
  'CW180FLIP':    12,  // ROTATION_ROLL_180_YAW_180 (pitch 180)
  'CW180DEGFLIP': 12,
  'CW270FLIP':    14,  // ROTATION_ROLL_180_YAW_270
  'CW270DEGFLIP': 14,
};

function mapCompassOrientation(inavAlign: string): number | null {
  const key = inavAlign.toUpperCase().replace(/\s+/g, '');
  return COMPASS_ORIENT_MAP[key] ?? null;
}

/* ================================================================== */
/*  OSD element mapping                                                */
/* ================================================================== */

/**
 * Map INAV OSD element IDs to ArduPilot OSD parameter prefixes.
 *
 * Only maps visible elements with known ArduPilot equivalents.
 * Coordinates are clamped to fit ArduPilot's grid:
 *   Analog (MAX7456): 30x16 (PAL) / 30x13 (NTSC)
 *   HD (MSP displayport): 50x18
 * INAV HD uses 53x20 so some elements may be repositioned.
 */

const INAV_TO_AP_OSD: Record<number, string> = {
  0:  'OSD_RSSI',          // RSSI_VALUE
  1:  'OSD_BAT_VOLT',      // MAIN_BATT_VOLTAGE
  2:  'OSD_CRSSHAIR',      // CROSSHAIRS
  3:  'OSD_HORIZON',       // ARTIFICIAL_HORIZON
  4:  'OSD_SIDEBARS',      // HORIZON_SIDEBARS
  6:  'OSD_FLTIME',        // FLYTIME
  7:  'OSD_FLTMODE',       // FLYMODE
  8:  'OSD_CRAFT',         // CRAFT_NAME (custom string -- won't show same name)
  9:  'OSD_THROTTLE',      // THROTTLE_POSITION
  11: 'OSD_CURRENT',       // CURRENT_DRAW
  12: 'OSD_BATUSED',       // MAH_DRAWN
  13: 'OSD_GSPEED',        // GPS_SPEED
  14: 'OSD_SATS',          // GPS_SATS
  15: 'OSD_ALTITUDE',      // ALTITUDE
  19: 'OSD_POWER',         // POWER
  20: 'OSD_GPSLONG',       // LONGITUDE
  21: 'OSD_GPSLAT',        // LATITUDE
  22: 'OSD_HOMEDIR',       // DIRECTION_TO_HOME
  23: 'OSD_HOMEDIST',      // DISTANCE_TO_HOME
  24: 'OSD_HEADING',       // HEADING
  25: 'OSD_VSPEED',        // VARIO
  27: 'OSD_ASPEED',        // AIR_SPEED
  29: 'OSD_CLK',           // RTC_TIME
  30: 'OSD_MESSAGE',       // MESSAGES
  31: 'OSD_HDOP',          // GPS_HDOP
  32: 'OSD_AVGCELLV',      // MAIN_BATT_CELL_VOLTAGE
  34: 'OSD_COMPASS',       // HEADING_GRAPH
  38: 'OSD_BATREM',        // MAIN_BATT_REMAINING_PERCENTAGE
  40: 'OSD_TRIPDIST',      // TRIP_DIST (ArduPilot may not have this exact one)
  41: 'OSD_PITCH',         // PITCH_ANGLE
  42: 'OSD_ROLL',          // ROLL_ANGLE
  46: 'OSD_WIND',          // WIND_SPEED_HORIZONTAL
  48: 'OSD_FTIME',         // REMAINING_FLIGHT_TIME
  85: 'OSD_GSPEED',        // 3D_SPEED (map to ground speed as closest equivalent)
  86: 'OSD_ITEMP',         // IMU_TEMPERATURE
  96: 'OSD_ALTITUDE',      // MSL_ALTITUDE (map to altitude -- ArduPilot shows MSL by default)
  109: 'OSD_RSSI',         // RSSI_DBM (map to RSSI -- ArduPilot shows in configured unit)
  110: 'OSD_LQ',           // LQ_UPLINK
};

interface OsdMappedItem {
  apPrefix: string;
  x: number;
  y: number;
  inavId: number;
  /** True if coordinates were clamped to fit ArduPilot grid */
  clamped: boolean;
}

function mapOsdLayout(
  layouts: Map<number, { x: number; y: number; visible: boolean }>,
  maxX: number = 29,
  maxY: number = 15,
): OsdMappedItem[] {
  const result: OsdMappedItem[] = [];
  // Track which AP params we've already assigned (avoid duplicates)
  const assigned = new Set<string>();

  for (const [elementId, pos] of layouts) {
    if (!pos.visible) continue;

    const apPrefix = INAV_TO_AP_OSD[elementId];
    if (!apPrefix) continue;
    if (assigned.has(apPrefix)) continue; // First occurrence wins

    assigned.add(apPrefix);

    // Clamp coordinates to ArduPilot grid limits
    // INAV HD uses 53x20 but ArduPilot MSP displayport is 50x18
    const clampedX = Math.min(pos.x, maxX);
    const clampedY = Math.min(pos.y, maxY);
    const wasClamped = clampedX !== pos.x || clampedY !== pos.y;

    result.push({
      apPrefix,
      x: clampedX,
      y: clampedY,
      inavId: elementId,
      clamped: wasClamped,
    });
  }

  return result;
}
