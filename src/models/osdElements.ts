/**
 * OSD Element definitions for ArduPilot.
 *
 * Each element maps to OSDn_<ITEM>_EN / _X / _Y parameters.
 * Verified against libraries/AP_OSD/AP_OSD.h and AP_OSD_Screen.cpp.
 *
 * Display templates use special character codes:
 *   \uE0xx -- mapped to OSD symbol glyphs (see osdFont.ts)
 *   Regular ASCII -- rendered as-is with monospace font
 */

import type { VehicleType } from '@/store/vehicleStore';

// ─── Types ───────────────────────────────────────────────────────────────────

export type OsdCategory =
  | 'battery'
  | 'speed'
  | 'navigation'
  | 'attitude'
  | 'system'
  | 'link'
  | 'advanced';

export interface OsdElement {
  /** Internal key matching ArduPilot param suffix, e.g. 'ALTITUDE' → OSD1_ALTITUDE_EN */
  id: string;
  /** Human-readable name shown in the element panel */
  label: string;
  /** One-line description for tooltip */
  description: string;
  /** Grouping category */
  category: OsdCategory;
  /** Preview text for the canvas (uses symbol codes) */
  preview: string;
  /** Width in character cells */
  charWidth: number;
  /** Which vehicle types this element applies to (empty = all) */
  vehicles: VehicleType[];
  /** Default enabled in ArduPilot */
  defaultEnabled: boolean;
  /** Default X position from AP_OSD.h */
  defaultX: number;
  /** Default Y position from AP_OSD.h */
  defaultY: number;
}

// ─── Symbol character codes (private use area U+E000-E0FF) ───────────────────
// These map to font glyph indices in osdFont.ts

export const SYM = {
  VOLT: '\uE001',        // Battery voltage icon
  CURR: '\uE002',        // Current draw icon
  MAH: '\uE003',         // mAh consumed icon
  ALT: '\uE004',         // Altitude icon
  SAT: '\uE005',         // Satellite icon
  SPEED: '\uE006',       // Ground speed icon
  HOME: '\uE007',        // Home direction icon
  DIST: '\uE008',        // Distance icon
  VSPEED: '\uE009',      // Vertical speed icon
  THROTTLE: '\uE00A',    // Throttle icon
  HEADING: '\uE00B',     // Heading icon
  WIND: '\uE00C',        // Wind icon
  ASPEED: '\uE00D',      // Airspeed icon
  RSSI: '\uE00E',        // RSSI icon
  FLTMODE: '\uE00F',     // Flight mode icon
  CELL: '\uE010',        // Cell voltage icon
  GPS: '\uE011',         // GPS fix icon
  TEMP: '\uE012',        // Temperature icon
  EFF: '\uE013',         // Efficiency icon
  COMPASS_N: '\uE014',   // Compass north
  COMPASS_S: '\uE015',   // Compass south
  COMPASS_E: '\uE016',   // Compass east
  COMPASS_W: '\uE017',   // Compass west
  BATT_FULL: '\uE018',   // Battery bar full
  BATT_EMPTY: '\uE019',  // Battery bar empty
  ARROW_UP: '\uE01A',    // Up arrow
  ARROW_DN: '\uE01B',    // Down arrow
  LQ: '\uE01C',          // Link quality icon
  CROSSHAIR: '\uE01D',   // Crosshair / reticle center
  HORIZON_L: '\uE01E',   // Horizon line left
  HORIZON_R: '\uE01F',   // Horizon line right
  WAYPOINT: '\uE020',    // Waypoint icon
  XTRACK: '\uE021',      // Cross-track error icon
  TERRAIN: '\uE022',     // Terrain altitude icon
  CLK: '\uE023',         // Clock / timer icon
  UNIT_M: '\uE024',      // meters unit
  UNIT_KMH: '\uE025',    // km/h unit
  UNIT_V: '\uE026',      // Volts unit
  UNIT_A: '\uE027',      // Amps unit
  UNIT_MS: '\uE028',     // m/s unit
  RPM: '\uE029',         // RPM icon
  POWER: '\uE02A',       // Power (W) icon
} as const;

// ─── Element definitions ─────────────────────────────────────────────────────

const ALL: VehicleType[] = [];  // empty = all vehicle types
const PLANE: VehicleType[] = ['plane', 'quadplane'];

export const OSD_ELEMENTS: OsdElement[] = [
  // ─── Battery ───
  {
    id: 'BAT_VOLT',
    label: 'Battery Voltage',
    description: 'Total pack voltage',
    category: 'battery',
    preview: `${SYM.VOLT}14.8${SYM.UNIT_V}`,
    charWidth: 7,
    vehicles: ALL,
    defaultEnabled: true,
    defaultX: 24,
    defaultY: 1,
  },
  {
    id: 'AVGCELLVOLT',
    label: 'Cell Voltage',
    description: 'Average cell voltage',
    category: 'battery',
    preview: `${SYM.CELL}3.70${SYM.UNIT_V}`,
    charWidth: 7,
    vehicles: ALL,
    defaultEnabled: false,
    defaultX: 24,
    defaultY: 3,
  },
  {
    id: 'RESTVOLT',
    label: 'Resting Voltage',
    description: 'Battery resting voltage (sag-compensated)',
    category: 'battery',
    preview: `${SYM.VOLT}15.2${SYM.UNIT_V}`,
    charWidth: 7,
    vehicles: ALL,
    defaultEnabled: false,
    defaultX: 24,
    defaultY: 2,
  },
  {
    id: 'AVGCELLRESTVOLT',
    label: 'Cell Resting Voltage',
    description: 'Average cell resting voltage',
    category: 'battery',
    preview: `${SYM.CELL}3.80${SYM.UNIT_V}`,
    charWidth: 7,
    vehicles: ALL,
    defaultEnabled: false,
    defaultX: 24,
    defaultY: 4,
  },
  {
    id: 'CURRENT',
    label: 'Current',
    description: 'Battery current draw',
    category: 'battery',
    preview: `${SYM.CURR}12.5${SYM.UNIT_A}`,
    charWidth: 7,
    vehicles: ALL,
    defaultEnabled: true,
    defaultX: 25,
    defaultY: 2,
  },
  {
    id: 'BATUSED',
    label: 'mAh Used',
    description: 'Capacity consumed',
    category: 'battery',
    preview: `${SYM.MAH} 850`,
    charWidth: 6,
    vehicles: ALL,
    defaultEnabled: true,
    defaultX: 23,
    defaultY: 3,
  },
  {
    id: 'BAT2_VLT',
    label: 'Battery 2 Voltage',
    description: 'Second battery pack voltage',
    category: 'battery',
    preview: `${SYM.VOLT}12.6${SYM.UNIT_V}`,
    charWidth: 7,
    vehicles: ALL,
    defaultEnabled: false,
    defaultX: 24,
    defaultY: 5,
  },

  // ─── Speed ───
  {
    id: 'GSPEED',
    label: 'Ground Speed',
    description: 'GPS ground speed',
    category: 'speed',
    preview: `${SYM.SPEED} 42${SYM.UNIT_KMH}`,
    charWidth: 8,
    vehicles: ALL,
    defaultEnabled: true,
    defaultX: 2,
    defaultY: 14,
  },
  {
    id: 'ASPEED',
    label: 'Airspeed',
    description: 'Airspeed from sensor or estimated',
    category: 'speed',
    preview: `${SYM.ASPEED} 58${SYM.UNIT_KMH}`,
    charWidth: 8,
    vehicles: PLANE,
    defaultEnabled: false,
    defaultX: 2,
    defaultY: 13,
  },
  {
    id: 'ASPD1',
    label: 'Airspeed 1',
    description: 'Primary airspeed sensor',
    category: 'speed',
    preview: `${SYM.ASPEED} 55${SYM.UNIT_KMH}`,
    charWidth: 8,
    vehicles: PLANE,
    defaultEnabled: false,
    defaultX: 2,
    defaultY: 12,
  },
  {
    id: 'ASPD2',
    label: 'Airspeed 2',
    description: 'Secondary airspeed sensor',
    category: 'speed',
    preview: `${SYM.ASPEED} 56${SYM.UNIT_KMH}`,
    charWidth: 8,
    vehicles: PLANE,
    defaultEnabled: false,
    defaultX: 2,
    defaultY: 11,
  },
  {
    id: 'VSPEED',
    label: 'Vertical Speed',
    description: 'Climb/descent rate',
    category: 'speed',
    preview: `${SYM.VSPEED} 1.2${SYM.UNIT_MS}`,
    charWidth: 8,
    vehicles: ALL,
    defaultEnabled: true,
    defaultX: 24,
    defaultY: 9,
  },
  {
    id: 'WIND',
    label: 'Wind',
    description: 'Estimated wind speed and direction',
    category: 'speed',
    preview: `${SYM.WIND} 12${SYM.UNIT_KMH}`,
    charWidth: 8,
    vehicles: PLANE,
    defaultEnabled: false,
    defaultX: 2,
    defaultY: 12,
  },
  {
    id: 'THROTTLE',
    label: 'Throttle',
    description: 'Current throttle percentage',
    category: 'speed',
    preview: `${SYM.THROTTLE} 65%`,
    charWidth: 6,
    vehicles: ALL,
    defaultEnabled: true,
    defaultX: 24,
    defaultY: 11,
  },

  // ─── Navigation ───
  {
    id: 'ALTITUDE',
    label: 'Altitude',
    description: 'Relative altitude above home',
    category: 'navigation',
    preview: `${SYM.ALT}  120${SYM.UNIT_M}`,
    charWidth: 7,
    vehicles: ALL,
    defaultEnabled: true,
    defaultX: 23,
    defaultY: 8,
  },
  {
    id: 'HGT_ABVTERR',
    label: 'Terrain Altitude',
    description: 'Height above terrain (requires terrain data)',
    category: 'navigation',
    preview: `${SYM.TERRAIN}  85${SYM.UNIT_M}`,
    charWidth: 7,
    vehicles: PLANE,
    defaultEnabled: false,
    defaultX: 23,
    defaultY: 7,
  },
  {
    id: 'HOME',
    label: 'Home',
    description: 'Distance and direction to home',
    category: 'navigation',
    preview: `${SYM.HOME}${SYM.DIST} 1.2km`,
    charWidth: 9,
    vehicles: ALL,
    defaultEnabled: true,
    defaultX: 14,
    defaultY: 1,
  },
  {
    id: 'HEADING',
    label: 'Heading',
    description: 'Current heading in degrees',
    category: 'navigation',
    preview: `${SYM.HEADING}245°`,
    charWidth: 5,
    vehicles: ALL,
    defaultEnabled: true,
    defaultX: 13,
    defaultY: 2,
  },
  {
    id: 'COMPASS',
    label: 'Compass Bar',
    description: 'Heading compass bar',
    category: 'navigation',
    preview: `W--NW---N---NE--E`,
    charWidth: 17,
    vehicles: ALL,
    defaultEnabled: true,
    defaultX: 15,
    defaultY: 3,
  },
  {
    id: 'WAYPOINT',
    label: 'Waypoint',
    description: 'Next waypoint distance and number',
    category: 'navigation',
    preview: `${SYM.WAYPOINT} WP3 540m`,
    charWidth: 10,
    vehicles: ALL,
    defaultEnabled: false,
    defaultX: 2,
    defaultY: 10,
  },
  {
    id: 'XTRACK_ERROR',
    label: 'Cross-Track Error',
    description: 'Distance off the planned track',
    category: 'navigation',
    preview: `${SYM.XTRACK} 2.5m`,
    charWidth: 7,
    vehicles: PLANE,
    defaultEnabled: false,
    defaultX: 2,
    defaultY: 9,
  },
  {
    id: 'RNGF',
    label: 'Rangefinder',
    description: 'Rangefinder distance reading',
    category: 'navigation',
    preview: `${SYM.ALT} 2.4${SYM.UNIT_M}`,
    charWidth: 7,
    vehicles: ALL,
    defaultEnabled: false,
    defaultX: 23,
    defaultY: 6,
  },

  // ─── Attitude ───
  {
    id: 'HORIZON',
    label: 'Artificial Horizon',
    description: 'Attitude indicator showing pitch and roll',
    category: 'attitude',
    preview: `${SYM.HORIZON_L}${SYM.CROSSHAIR}${SYM.HORIZON_R}`,
    charWidth: 9,
    vehicles: ALL,
    defaultEnabled: true,
    defaultX: 14,
    defaultY: 8,
  },
  {
    id: 'SIDEBARS',
    label: 'Sidebars',
    description: 'Altitude and speed sidebars flanking the horizon',
    category: 'attitude',
    preview: `|||`,
    charWidth: 2,
    vehicles: ALL,
    defaultEnabled: false,
    defaultX: 4,
    defaultY: 5,
  },
  {
    id: 'CRSSHAIR',
    label: 'Crosshair',
    description: 'Fixed center crosshair/reticle',
    category: 'attitude',
    preview: `${SYM.CROSSHAIR}`,
    charWidth: 1,
    vehicles: ALL,
    defaultEnabled: false,
    defaultX: 15,
    defaultY: 8,
  },
  {
    id: 'PITCH_ANGLE',
    label: 'Pitch Angle',
    description: 'Current pitch in degrees',
    category: 'attitude',
    preview: `P  5°`,
    charWidth: 5,
    vehicles: ALL,
    defaultEnabled: false,
    defaultX: 24,
    defaultY: 7,
  },
  {
    id: 'ROLL_ANGLE',
    label: 'Roll Angle',
    description: 'Current roll in degrees',
    category: 'attitude',
    preview: `R 12°`,
    charWidth: 5,
    vehicles: ALL,
    defaultEnabled: false,
    defaultX: 24,
    defaultY: 6,
  },

  // ─── System ───
  {
    id: 'SATS',
    label: 'GPS Satellites',
    description: 'Number of GPS satellites in view',
    category: 'system',
    preview: `${SYM.SAT}12`,
    charWidth: 4,
    vehicles: ALL,
    defaultEnabled: true,
    defaultX: 1,
    defaultY: 3,
  },
  {
    id: 'FLTMODE',
    label: 'Flight Mode',
    description: 'Current flight mode name',
    category: 'system',
    preview: `${SYM.FLTMODE}STAB`,
    charWidth: 7,
    vehicles: ALL,
    defaultEnabled: true,
    defaultX: 2,
    defaultY: 8,
  },
  {
    id: 'MESSAGE',
    label: 'Messages',
    description: 'Status text messages from the FC',
    category: 'system',
    preview: `PreArm: Check mag`,
    charWidth: 20,
    vehicles: ALL,
    defaultEnabled: true,
    defaultX: 2,
    defaultY: 6,
  },
  {
    id: 'GPSLATITUDE',
    label: 'GPS Latitude',
    description: 'Current GPS latitude',
    category: 'system',
    preview: `-23.5505°`,
    charWidth: 10,
    vehicles: ALL,
    defaultEnabled: false,
    defaultX: 9,
    defaultY: 13,
  },
  {
    id: 'GPSLONGITUDE',
    label: 'GPS Longitude',
    description: 'Current GPS longitude',
    category: 'system',
    preview: `-46.6333°`,
    charWidth: 10,
    vehicles: ALL,
    defaultEnabled: false,
    defaultX: 9,
    defaultY: 14,
  },
  {
    id: 'FLIGHTIME',
    label: 'Flight Time',
    description: 'Elapsed time since arming',
    category: 'system',
    preview: `${SYM.CLK}05:32`,
    charWidth: 6,
    vehicles: ALL,
    defaultEnabled: false,
    defaultX: 23,
    defaultY: 10,
  },
  {
    id: 'CLIMBEFF',
    label: 'Climb Efficiency',
    description: 'Energy used per meter of altitude gained (mAh/m)',
    category: 'system',
    preview: `${SYM.EFF}3.2`,
    charWidth: 5,
    vehicles: ALL,
    defaultEnabled: false,
    defaultX: 2,
    defaultY: 15,
  },
  {
    id: 'EFF',
    label: 'Flight Efficiency',
    description: 'Energy consumption per distance traveled (mAh/km)',
    category: 'system',
    preview: `${SYM.EFF} 85mAh`,
    charWidth: 8,
    vehicles: ALL,
    defaultEnabled: false,
    defaultX: 2,
    defaultY: 14,
  },
  {
    id: 'CALLSIGN',
    label: 'Callsign',
    description: 'Ham radio callsign from SD card file',
    category: 'system',
    preview: `PY2ABC`,
    charWidth: 8,
    vehicles: ALL,
    defaultEnabled: false,
    defaultX: 2,
    defaultY: 15,
  },
  {
    id: 'TEMP',
    label: 'Temperature',
    description: 'Board or external temperature sensor',
    category: 'system',
    preview: `${SYM.TEMP}42°C`,
    charWidth: 6,
    vehicles: ALL,
    defaultEnabled: false,
    defaultX: 24,
    defaultY: 12,
  },
  {
    id: 'RRPM',
    label: 'RPM',
    description: 'Motor/prop RPM from RPM sensor',
    category: 'system',
    preview: `${SYM.RPM}4500`,
    charWidth: 6,
    vehicles: ALL,
    defaultEnabled: false,
    defaultX: 2,
    defaultY: 11,
  },
  {
    id: 'POWER',
    label: 'Power',
    description: 'Instantaneous power draw in watts',
    category: 'system',
    preview: `${SYM.POWER}125W`,
    charWidth: 6,
    vehicles: ALL,
    defaultEnabled: false,
    defaultX: 24,
    defaultY: 4,
  },

  // ─── Link ───
  {
    id: 'RSSI',
    label: 'RSSI',
    description: 'Received signal strength indicator',
    category: 'link',
    preview: `${SYM.RSSI} 85`,
    charWidth: 5,
    vehicles: ALL,
    defaultEnabled: true,
    defaultX: 1,
    defaultY: 1,
  },
  {
    id: 'LINK_QUALITY',
    label: 'Link Quality',
    description: 'RC link quality percentage (CRSF/ELRS)',
    category: 'link',
    preview: `${SYM.LQ} 99%`,
    charWidth: 6,
    vehicles: ALL,
    defaultEnabled: false,
    defaultX: 1,
    defaultY: 1,
  },

  // ─── Advanced ───
  {
    id: 'STATS',
    label: 'Statistics',
    description: 'Post-flight statistics screen (dedicated screen)',
    category: 'advanced',
    preview: `STATS`,
    charWidth: 20,
    vehicles: ALL,
    defaultEnabled: false,
    defaultX: 2,
    defaultY: 2,
  },
];

// ─── Category metadata ───────────────────────────────────────────────────────

export const CATEGORY_INFO: Record<OsdCategory, { label: string; icon: string }> = {
  battery: { label: 'Battery', icon: '⚡' },
  speed: { label: 'Speed', icon: '⏱' },
  navigation: { label: 'Navigation', icon: '🧭' },
  attitude: { label: 'Attitude', icon: '📐' },
  system: { label: 'System', icon: '⚙' },
  link: { label: 'Link', icon: '📡' },
  advanced: { label: 'Advanced', icon: '🔧' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Filter elements by vehicle type. Empty vehicles array = shown for all. */
export function getElementsForVehicle(
  vehicleType: VehicleType | null,
  showAll: boolean
): OsdElement[] {
  if (showAll || !vehicleType) return OSD_ELEMENTS;
  return OSD_ELEMENTS.filter(
    (el) => el.vehicles.length === 0 || el.vehicles.includes(vehicleType)
  );
}

/** Group elements by category */
export function groupByCategory(elements: OsdElement[]): Map<OsdCategory, OsdElement[]> {
  const map = new Map<OsdCategory, OsdElement[]>();
  for (const el of elements) {
    const arr = map.get(el.category) || [];
    arr.push(el);
    map.set(el.category, arr);
  }
  return map;
}

/** Get parameter names for an element on a given screen */
export function getOsdParamNames(screenNum: number, elementId: string) {
  return {
    enable: `OSD${screenNum}_${elementId}_EN`,
    x: `OSD${screenNum}_${elementId}_X`,
    y: `OSD${screenNum}_${elementId}_Y`,
  };
}
