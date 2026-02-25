/**
 * Core MAVLink message types for ArduGUI Phase 1.
 *
 * These are hand-coded for the essential messages needed to establish
 * a connection and download parameters. The full set will be auto-generated
 * from MAVLink XML definitions by scripts/generate-mavlink.ts.
 */

// --- Enums ---

export enum MavType {
  GENERIC = 0,
  FIXED_WING = 1,
  QUADROTOR = 2,
  COAXIAL = 3,
  HELICOPTER = 4,
  ANTENNA_TRACKER = 5,
  GCS = 6,
  AIRSHIP = 7,
  FREE_BALLOON = 8,
  ROCKET = 9,
  GROUND_ROVER = 10,
  SURFACE_BOAT = 11,
  SUBMARINE = 12,
  HEXAROTOR = 13,
  OCTOROTOR = 14,
  TRICOPTER = 15,
  FLAPPING_WING = 16,
  KITE = 17,
  ONBOARD_CONTROLLER = 18,
  VTOL_TAILSITTER_DUOROTOR = 19,
  VTOL_TAILSITTER_QUADROTOR = 20,
  VTOL_TILTROTOR = 21,
  VTOL_FIXEDWING = 22,
  VTOL_TAILSITTER = 23,
  VTOL_RESERVED4 = 24,
  VTOL_RESERVED5 = 25,
  GIMBAL = 26,
  ADSB = 27,
  PARAFOIL = 28,
  DODECAROTOR = 29,
  CAMERA = 30,
  CHARGING_STATION = 31,
  FLARM = 32,
  SERVO = 33,
  ODID = 34,
  DECAROTOR = 35,
  BATTERY = 36,
  PARACHUTE = 37,
  LOG = 38,
  OSD = 39,
  IMU = 40,
  GPS = 41,
  WINCH = 42,
}

export enum MavAutopilot {
  GENERIC = 0,
  RESERVED = 1,
  SLUGS = 2,
  ARDUPILOTMEGA = 3,
  OPENPILOT = 4,
  GENERIC_WAYPOINTS_ONLY = 5,
  GENERIC_WAYPOINTS_AND_SIMPLE_NAVIGATION_ONLY = 6,
  GENERIC_MISSION_FULL = 7,
  INVALID = 8,
  PPZ = 9,
  UDB = 10,
  FP = 11,
  PX4 = 12,
  SMACCMPILOT = 13,
  AUTOQUAD = 14,
  ARMAZILA = 15,
  AEROB = 16,
  ASLUAV = 17,
  SMARTAP = 18,
  AIRRAILS = 19,
  REFLEX = 20,
}

export enum MavState {
  UNINIT = 0,
  BOOT = 1,
  CALIBRATING = 2,
  STANDBY = 3,
  ACTIVE = 4,
  CRITICAL = 5,
  EMERGENCY = 6,
  POWEROFF = 7,
  FLIGHT_TERMINATION = 8,
}

export enum MavParamType {
  UINT8 = 1,
  INT8 = 2,
  UINT16 = 3,
  INT16 = 4,
  UINT32 = 5,
  INT32 = 6,
  UINT64 = 7,
  INT64 = 8,
  REAL32 = 9,
  REAL64 = 10,
}

// --- Base mode flags ---
export const MAV_MODE_FLAG_SAFETY_ARMED = 128;

// --- Message IDs ---
export const MSG_ID_HEARTBEAT = 0;
export const MSG_ID_SYS_STATUS = 1;
export const MSG_ID_PARAM_REQUEST_READ = 20;
export const MSG_ID_PARAM_REQUEST_LIST = 21;
export const MSG_ID_PARAM_VALUE = 22;
export const MSG_ID_PARAM_SET = 23;
export const MSG_ID_GPS_RAW_INT = 24;
export const MSG_ID_ATTITUDE = 30;
export const MSG_ID_SERVO_OUTPUT_RAW = 36;
export const MSG_ID_RC_CHANNELS_RAW = 35;
export const MSG_ID_RC_CHANNELS = 65;
export const MSG_ID_REQUEST_DATA_STREAM = 66;
export const MSG_ID_VFR_HUD = 74;
export const MSG_ID_COMMAND_LONG = 76;
export const MSG_ID_COMMAND_ACK = 77;
export const MSG_ID_MAG_CAL_PROGRESS = 191;
export const MSG_ID_MAG_CAL_REPORT = 192;
export const MSG_ID_AUTOPILOT_VERSION = 148;
export const MSG_ID_STATUSTEXT = 253;

// --- CRC Extras (per message type) ---
export const CRC_EXTRAS: Map<number, number> = new Map([
  [MSG_ID_HEARTBEAT, 50],
  [MSG_ID_SYS_STATUS, 124],
  [MSG_ID_PARAM_REQUEST_READ, 214],
  [MSG_ID_PARAM_REQUEST_LIST, 159],
  [MSG_ID_PARAM_VALUE, 220],
  [MSG_ID_PARAM_SET, 168],
  [MSG_ID_GPS_RAW_INT, 24],
  [MSG_ID_ATTITUDE, 39],
  [MSG_ID_SERVO_OUTPUT_RAW, 222],
  [MSG_ID_RC_CHANNELS_RAW, 244],
  [MSG_ID_RC_CHANNELS, 118],
  [MSG_ID_REQUEST_DATA_STREAM, 148],
  [MSG_ID_VFR_HUD, 20],
  [MSG_ID_COMMAND_LONG, 152],
  [MSG_ID_COMMAND_ACK, 143],
  [MSG_ID_MAG_CAL_PROGRESS, 92],
  [MSG_ID_MAG_CAL_REPORT, 36],
  [MSG_ID_AUTOPILOT_VERSION, 178],
  [MSG_ID_STATUSTEXT, 83],
]);

// --- Message Interfaces ---

export interface Heartbeat {
  customMode: number;
  type: MavType;
  autopilot: MavAutopilot;
  baseMode: number;
  systemStatus: MavState;
  mavlinkVersion: number;
}

export interface ParamValue {
  paramId: string;
  paramValue: number;
  paramType: MavParamType;
  paramCount: number;
  paramIndex: number;
}

export interface ParamSet {
  targetSystem: number;
  targetComponent: number;
  paramId: string;
  paramValue: number;
  paramType: MavParamType;
}

export interface ParamRequestList {
  targetSystem: number;
  targetComponent: number;
}

export interface ParamRequestRead {
  targetSystem: number;
  targetComponent: number;
  paramId: string;
  paramIndex: number;
}

export interface StatusText {
  severity: number;
  text: string;
}

export interface CommandLong {
  targetSystem: number;
  targetComponent: number;
  command: number;
  confirmation: number;
  param1: number;
  param2: number;
  param3: number;
  param4: number;
  param5: number;
  param6: number;
  param7: number;
}

export interface CommandAck {
  command: number;
  result: number;
}

// --- MAV_RESULT enum ---
export enum MavResult {
  ACCEPTED = 0,
  TEMPORARILY_REJECTED = 1,
  DENIED = 2,
  UNSUPPORTED = 3,
  FAILED = 4,
  IN_PROGRESS = 5,
  CANCELLED = 6,
}

// --- Mag calibration status ---
export enum MagCalStatus {
  NOT_STARTED = 0,
  WAITING_TO_START = 1,
  RUNNING_STEP_ONE = 2,
  RUNNING_STEP_TWO = 3,
  SUCCESS = 4,
  FAILED = 5,
  BAD_ORIENTATION = 6,
  BAD_RADIUS = 7,
}

// --- MAG_CAL_PROGRESS (msg 191) ---
export interface MagCalProgress {
  compassId: number;
  calMask: number;
  calStatus: MagCalStatus;
  attempt: number;
  completionPct: number;
  completionMask: number[]; // 10 floats: section completion (0.0-1.0)
  directionX: number;
  directionY: number;
  directionZ: number;
}

// --- MAG_CAL_REPORT (msg 192) ---
export interface MagCalReport {
  compassId: number;
  calMask: number;
  calStatus: MagCalStatus;
  autosaved: number;
  fitness: number;       // RMS milligauss
  ofsX: number;
  ofsY: number;
  ofsZ: number;
  diagX: number;
  diagY: number;
  diagZ: number;
  offdiagX: number;
  offdiagY: number;
  offdiagZ: number;
}

// --- Command IDs ---
export const MAV_CMD_PREFLIGHT_CALIBRATION = 241;
export const MAV_CMD_PREFLIGHT_REBOOT_SHUTDOWN = 246;
export const MAV_CMD_DO_START_MAG_CAL = 42424;
export const MAV_CMD_DO_ACCEPT_MAG_CAL = 42425;
export const MAV_CMD_DO_CANCEL_MAG_CAL = 42426;
export const MAV_CMD_ACCEL_CAL_VEHICLE_POS = 42429;

// --- Parsers ---

function readFloat32(buf: Uint8Array, offset: number): number {
  const view = new DataView(buf.buffer, buf.byteOffset + offset, 4);
  return view.getFloat32(0, true);
}

function readUint32(buf: Uint8Array, offset: number): number {
  return buf[offset] | (buf[offset + 1] << 8) | (buf[offset + 2] << 16) | (buf[offset + 3] << 24);
}

function readUint16(buf: Uint8Array, offset: number): number {
  return buf[offset] | (buf[offset + 1] << 8);
}

function readInt16(buf: Uint8Array, offset: number): number {
  const val = readUint16(buf, offset);
  return val > 0x7fff ? val - 0x10000 : val;
}

function readString(buf: Uint8Array, offset: number, maxLen: number): string {
  let end = offset;
  while (end < offset + maxLen && end < buf.length && buf[end] !== 0) {
    end++;
  }
  return new TextDecoder().decode(buf.subarray(offset, end));
}

export function parseHeartbeat(payload: Uint8Array): Heartbeat {
  return {
    customMode: readUint32(payload, 0),
    type: payload[4] as MavType,
    autopilot: payload[5] as MavAutopilot,
    baseMode: payload[6],
    systemStatus: payload[7] as MavState,
    mavlinkVersion: payload[8],
  };
}

export function parseParamValue(payload: Uint8Array): ParamValue {
  return {
    paramValue: readFloat32(payload, 0),
    paramCount: readUint16(payload, 4),
    paramIndex: readUint16(payload, 6),
    paramId: readString(payload, 8, 16),
    paramType: payload[24] as MavParamType,
  };
}

export function parseStatusText(payload: Uint8Array): StatusText {
  return {
    severity: payload[0],
    text: readString(payload, 1, 50),
  };
}

export function parseCommandAck(payload: Uint8Array): CommandAck {
  return {
    command: readUint16(payload, 0),
    result: payload[2],
  };
}

export function parseMagCalProgress(payload: Uint8Array): MagCalProgress {
  // Payload layout:
  // float direction_x (0-3), float direction_y (4-7), float direction_z (8-11)
  // uint8 compass_id (12), uint8 cal_mask (13), uint8 cal_status (14),
  // uint8 attempt (15), uint8 completion_pct (16),
  // float[10] completion_mask (17-56)  -- actually uint8[10] per MAVLink spec
  const directionX = readFloat32(payload, 0);
  const directionY = readFloat32(payload, 4);
  const directionZ = readFloat32(payload, 8);
  const compassId = payload[12];
  const calMask = payload[13];
  const calStatus = payload[14] as MagCalStatus;
  const attempt = payload[15];
  const completionPct = payload[16];
  // completion_mask is 10 uint8 sections (each 0-unknown bits)
  const completionMask: number[] = [];
  for (let i = 0; i < 10; i++) {
    completionMask.push(payload[17 + i] || 0);
  }
  return {
    compassId, calMask, calStatus, attempt, completionPct,
    completionMask, directionX, directionY, directionZ,
  };
}

export function parseMagCalReport(payload: Uint8Array): MagCalReport {
  // Payload layout:
  // float fitness (0-3), float ofs_x (4-7), float ofs_y (8-11), float ofs_z (12-15)
  // float diag_x (16-19), float diag_y (20-23), float diag_z (24-27)
  // float offdiag_x (28-31), float offdiag_y (32-35), float offdiag_z (36-39)
  // uint8 compass_id (40), uint8 cal_mask (41), uint8 cal_status (42),
  // uint8 autosaved (43)
  return {
    fitness: readFloat32(payload, 0),
    ofsX: readFloat32(payload, 4),
    ofsY: readFloat32(payload, 8),
    ofsZ: readFloat32(payload, 12),
    diagX: readFloat32(payload, 16),
    diagY: readFloat32(payload, 20),
    diagZ: readFloat32(payload, 24),
    offdiagX: readFloat32(payload, 28),
    offdiagY: readFloat32(payload, 32),
    offdiagZ: readFloat32(payload, 36),
    compassId: payload[40],
    calMask: payload[41],
    calStatus: payload[42] as MagCalStatus,
    autosaved: payload[43],
  };
}

// --- Encoders ---

function writeFloat32(buf: Uint8Array, offset: number, value: number) {
  const view = new DataView(buf.buffer, buf.byteOffset + offset, 4);
  view.setFloat32(0, value, true);
}

function writeUint32(buf: Uint8Array, offset: number, value: number) {
  buf[offset] = value & 0xff;
  buf[offset + 1] = (value >> 8) & 0xff;
  buf[offset + 2] = (value >> 16) & 0xff;
  buf[offset + 3] = (value >> 24) & 0xff;
}

function writeUint16(buf: Uint8Array, offset: number, value: number) {
  buf[offset] = value & 0xff;
  buf[offset + 1] = (value >> 8) & 0xff;
}

function writeString(buf: Uint8Array, offset: number, value: string, maxLen: number) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(value.substring(0, maxLen));
  buf.set(bytes, offset);
  // Zero-fill remainder
  for (let i = bytes.length; i < maxLen; i++) {
    buf[offset + i] = 0;
  }
}

export function encodeParamRequestList(msg: ParamRequestList): Uint8Array {
  const payload = new Uint8Array(2);
  payload[0] = msg.targetSystem;
  payload[1] = msg.targetComponent;
  return payload;
}

export function encodeParamRequestRead(msg: ParamRequestRead): Uint8Array {
  const payload = new Uint8Array(20);
  writeInt16Signed(payload, 0, msg.paramIndex);
  payload[2] = msg.targetSystem;
  payload[3] = msg.targetComponent;
  writeString(payload, 4, msg.paramId, 16);
  return payload;
}

export function encodeParamSet(msg: ParamSet): Uint8Array {
  const payload = new Uint8Array(23);
  writeFloat32(payload, 0, msg.paramValue);
  payload[4] = msg.targetSystem;
  payload[5] = msg.targetComponent;
  writeString(payload, 6, msg.paramId, 16);
  payload[22] = msg.paramType;
  return payload;
}

export function encodeCommandLong(msg: CommandLong): Uint8Array {
  const payload = new Uint8Array(33);
  writeFloat32(payload, 0, msg.param1);
  writeFloat32(payload, 4, msg.param2);
  writeFloat32(payload, 8, msg.param3);
  writeFloat32(payload, 12, msg.param4);
  writeFloat32(payload, 16, msg.param5);
  writeFloat32(payload, 20, msg.param6);
  writeFloat32(payload, 24, msg.param7);
  writeUint16(payload, 28, msg.command);
  payload[30] = msg.targetSystem;
  payload[31] = msg.targetComponent;
  payload[32] = msg.confirmation;
  return payload;
}

/**
 * Encode a COMMAND_ACK message (msg ID 77).
 * Used for accel cal position confirmation -- ArduPilot's GCS_MAVLink
 * unblocks calibration steps when it receives any COMMAND_ACK with
 * command=MAV_CMD_ACCEL_CAL_VEHICLE_POS.
 */
export function encodeCommandAck(command: number, result: number, targetSystem = 0, targetComponent = 0): Uint8Array {
  // MAVLink v2 COMMAND_ACK payload:
  // uint16 command      offset 0
  // uint8  result       offset 2
  // uint8  progress     offset 3  (0xFF = N/A)
  // int32  result2      offset 4
  // uint8  target_sys   offset 8  (v2 extension)
  // uint8  target_comp  offset 9  (v2 extension)
  const payload = new Uint8Array(10);
  writeUint16(payload, 0, command);
  payload[2] = result;
  payload[3] = 0xff; // progress N/A
  // result2 = 0 (bytes 4-7)
  payload[8] = targetSystem;
  payload[9] = targetComponent;
  return payload;
}

// Helper - MAVLink uses int16 for param index (-1 means use name)
function writeInt16Signed(buf: Uint8Array, offset: number, value: number) {
  const unsigned = value < 0 ? value + 0x10000 : value;
  writeUint16(buf, offset, unsigned);
}

// --- Data Stream Types ---
export const MAV_DATA_STREAM_ALL = 0;
export const MAV_DATA_STREAM_RAW_SENSORS = 1;
export const MAV_DATA_STREAM_EXTENDED_STATUS = 2;
export const MAV_DATA_STREAM_RC_CHANNELS = 3;
export const MAV_DATA_STREAM_RAW_CONTROLLER = 4;
export const MAV_DATA_STREAM_POSITION = 6;
export const MAV_DATA_STREAM_EXTRA1 = 10;
export const MAV_DATA_STREAM_EXTRA2 = 11;
export const MAV_DATA_STREAM_EXTRA3 = 12;

// --- RC Channels (msg 65) ---

export interface RcChannels {
  timeBootMs: number;
  chancount: number;
  channels: number[]; // 1-18 channel values in microseconds (PWM)
  rssi: number;
}

export function parseRcChannels(payload: Uint8Array): RcChannels {
  const channels: number[] = [];
  // timeBootMs at offset 0 (uint32)
  const timeBootMs = readUint32(payload, 0);
  // channels 1-18 are uint16 starting at offset 4
  for (let i = 0; i < 18; i++) {
    channels.push(readUint16(payload, 4 + i * 2));
  }
  // chancount at offset 40 (uint8)
  const chancount = payload[40] || 0;
  // rssi at offset 41 (uint8)
  const rssi = payload[41] || 0;

  return { timeBootMs, chancount, channels, rssi };
}

// --- RC_CHANNELS_RAW (msg 35) -- fallback for boards not sending msg 65 ---

export interface RcChannelsRaw {
  timeBootMs: number;
  port: number;
  channels: number[]; // 8 channel values (PWM µs)
  rssi: number;
}

export function parseRcChannelsRaw(payload: Uint8Array): RcChannelsRaw {
  const timeBootMs = readUint32(payload, 0);
  const channels: number[] = [];
  for (let i = 0; i < 8; i++) {
    channels.push(readUint16(payload, 4 + i * 2));
  }
  const port = payload[20] || 0;
  const rssi = payload[21] || 0;
  return { timeBootMs, port, channels, rssi };
}

// --- REQUEST_DATA_STREAM (msg 66) ---

export interface RequestDataStream {
  targetSystem: number;
  targetComponent: number;
  reqStreamId: number;
  reqMessageRate: number; // Hz
  startStop: number;      // 1 = start, 0 = stop
}

export function encodeRequestDataStream(msg: RequestDataStream): Uint8Array {
  const payload = new Uint8Array(6);
  writeUint16(payload, 0, msg.reqMessageRate);
  payload[2] = msg.targetSystem;
  payload[3] = msg.targetComponent;
  payload[4] = msg.reqStreamId;
  payload[5] = msg.startStop;
  return payload;
}

// --- AUTOPILOT_VERSION (msg 148) ---

export interface AutopilotVersion {
  boardVersion: number; // APJ_BOARD_ID -- identifies the hardware target
  flightSwVersion: number;
  vendorId: number;
  productId: number;
}

export function parseAutopilotVersion(payload: Uint8Array): AutopilotVersion {
  // capabilities at offset 0 (uint64, skip)
  const flightSwVersion = readUint32(payload, 8);
  // middleware_sw_version at 12, os_sw_version at 16 (skip)
  const boardVersion = readUint32(payload, 20);
  // custom versions at 24-47 (skip)
  const vendorId = readUint16(payload, 48);
  const productId = readUint16(payload, 50);
  return { boardVersion, flightSwVersion, vendorId, productId };
}

// --- GPS_RAW_INT (msg #24) ---

export interface GpsRawInt {
  fixType: number;     // 0=no GPS, 1=no fix, 2=2D, 3=3D, 4=DGPS, 5=RTK float, 6=RTK fixed
  lat: number;         // degrees × 1e7
  lon: number;         // degrees × 1e7
  alt: number;         // mm above MSL
  satellitesVisible: number;
  hdop: number;        // in cm (65535 = unknown)
}

export function parseGpsRawInt(payload: Uint8Array): GpsRawInt {
  // Payload layout (little-endian):
  // uint64 time_usec (0-7), int32 lat (8-11), int32 lon (12-15),
  // int32 alt (16-19), uint16 eph (20-21), uint16 epv (22-23),
  // uint16 vel (24-25), uint16 cog (26-27), uint8 fix_type (28),
  // uint8 satellites_visible (29)
  return {
    lat: new DataView(payload.buffer, payload.byteOffset + 8, 4).getInt32(0, true),
    lon: new DataView(payload.buffer, payload.byteOffset + 12, 4).getInt32(0, true),
    alt: new DataView(payload.buffer, payload.byteOffset + 16, 4).getInt32(0, true),
    hdop: readUint16(payload, 20),
    fixType: payload[28],
    satellitesVisible: payload[29],
  };
}

// --- SYS_STATUS (msg #1) ---

export interface SysStatus {
  sensorsPresent: number;   // bitmask: what hardware the FC detected
  sensorsEnabled: number;   // bitmask: what's enabled in config
  sensorsHealth: number;    // bitmask: what's reporting healthy
  load: number;             // CPU load in 0.1% units (0-1000)
  voltageBattery: number;   // mV (uint16, 65535 = unknown)
  currentBattery: number;   // cA (int16, -1 = not measured)
  batteryRemaining: number; // 0-100%, -1 = unknown
}

export function parseSysStatus(payload: Uint8Array): SysStatus {
  return {
    sensorsPresent: readUint32(payload, 0),
    sensorsEnabled: readUint32(payload, 4),
    sensorsHealth: readUint32(payload, 8),
    load: readUint16(payload, 12),
    voltageBattery: readUint16(payload, 14),
    currentBattery: readInt16(payload, 16),
    batteryRemaining: payload[18] > 127 ? -1 : payload[18], // int8
  };
}

// --- Message name lookup (for debug console) ---

export const MSG_NAMES: Record<number, string> = {
  [MSG_ID_HEARTBEAT]: 'HEARTBEAT',
  [MSG_ID_SYS_STATUS]: 'SYS_STATUS',
  [MSG_ID_PARAM_REQUEST_READ]: 'PARAM_REQUEST_READ',
  [MSG_ID_PARAM_REQUEST_LIST]: 'PARAM_REQUEST_LIST',
  [MSG_ID_PARAM_VALUE]: 'PARAM_VALUE',
  [MSG_ID_PARAM_SET]: 'PARAM_SET',
  [MSG_ID_GPS_RAW_INT]: 'GPS_RAW_INT',
  [MSG_ID_ATTITUDE]: 'ATTITUDE',
  [MSG_ID_RC_CHANNELS_RAW]: 'RC_CHANNELS_RAW',
  [MSG_ID_SERVO_OUTPUT_RAW]: 'SERVO_OUTPUT_RAW',
  [MSG_ID_RC_CHANNELS]: 'RC_CHANNELS',
  [MSG_ID_REQUEST_DATA_STREAM]: 'REQUEST_DATA_STREAM',
  [MSG_ID_VFR_HUD]: 'VFR_HUD',
  [MSG_ID_COMMAND_LONG]: 'COMMAND_LONG',
  [MSG_ID_COMMAND_ACK]: 'COMMAND_ACK',
  [MSG_ID_MAG_CAL_PROGRESS]: 'MAG_CAL_PROGRESS',
  [MSG_ID_MAG_CAL_REPORT]: 'MAG_CAL_REPORT',
  [MSG_ID_AUTOPILOT_VERSION]: 'AUTOPILOT_VERSION',
  [MSG_ID_STATUSTEXT]: 'STATUSTEXT',
};

// Re-export for convenience
export { readFloat32, readUint32, readUint16, readInt16, readString };
export { writeFloat32, writeUint32, writeUint16, writeString };
