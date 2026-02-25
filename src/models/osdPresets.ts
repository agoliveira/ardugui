/**
 * OSD Preset Layouts.
 *
 * Each preset provides a ready-to-use element layout per screen.
 * Coordinates are designed for HD 50×18 grid (the most common modern FPV setup).
 * The OSD page auto-scales positions when switching to other resolutions.
 */

import type { VehicleType } from '@/store/vehicleStore';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OsdElementPlacement {
  id: string;
  x: number;
  y: number;
}

export interface OsdScreenLayout {
  label: string;           // e.g. "Main Flight", "Navigation", "Stats"
  enabled: boolean;
  elements: OsdElementPlacement[];
}

export interface OsdPreset {
  id: string;
  name: string;
  description: string;
  /** Which vehicle types this preset is shown for (empty = all) */
  vehicles: VehicleType[];
  /** Target resolution this was designed for */
  targetGrid: { cols: number; rows: number };
  screens: [OsdScreenLayout, OsdScreenLayout, OsdScreenLayout, OsdScreenLayout];
}

// ─── Resolution definitions ──────────────────────────────────────────────────

export type OsdResolution = 'ntsc' | 'pal' | 'hd50' | 'hd60';

export const RESOLUTIONS: Record<OsdResolution, { label: string; cols: number; rows: number; aspectRatio: number }> = {
  ntsc:  { label: 'Analog NTSC',                cols: 30, rows: 13, aspectRatio: 4 / 3 },
  pal:   { label: 'Analog PAL',                  cols: 30, rows: 16, aspectRatio: 4 / 3 },
  hd50:  { label: 'DJI / Walksnail',             cols: 50, rows: 18, aspectRatio: 16 / 9 },
  hd60:  { label: 'DJI O3+ / Avatar Pro',        cols: 60, rows: 22, aspectRatio: 16 / 9 },
};

// ─── Preset scaling ──────────────────────────────────────────────────────────

/** Scale a layout from its target grid to a different resolution.
 *  Handles centering detection -- if an element was centered in the source grid,
 *  it will be re-centered in the target grid rather than proportionally shifted. */
export function scalePosition(
  x: number,
  y: number,
  from: { cols: number; rows: number },
  to: { cols: number; rows: number },
  charWidth: number = 1
): { x: number; y: number } {
  let scaledX: number;

  // Detect if the element was centered horizontally (within 2 cells of grid center)
  const sourceCenter = Math.floor((from.cols - charWidth) / 2);
  if (Math.abs(x - sourceCenter) <= 2) {
    // Re-center in target grid
    scaledX = Math.floor((to.cols - charWidth) / 2);
  } else {
    scaledX = Math.round((x / from.cols) * to.cols);
  }

  const scaledY = Math.round((y / from.rows) * to.rows);

  return {
    // Clamp so element stays inside safe area (1-cell margin from each edge)
    x: Math.max(2, Math.min(scaledX, to.cols - charWidth - 2)),
    y: Math.max(2, Math.min(scaledY, to.rows - 3)),
  };
}

// ─── Helper to create an empty screen ────────────────────────────────────────

function emptyScreen(label: string): OsdScreenLayout {
  return { label, enabled: false, elements: [] };
}

// ─── Copter Presets ──────────────────────────────────────────────────────────
//
// Position rules for 50×18 HD grid (safe area = 1 cell margin):
//   Elements INSIDE safe area: x 2–47, y 2–15
//   Right-align: x = 48 - charWidth (last char at col 47)
//     7 chars → x:41,  8 chars → x:40,  6 chars → x:42,  5 chars → x:43,  4→x:44
//   Center:     x = floor((50 - charWidth) / 2)
//     20 chars → x:15,  17 chars → x:16,  10 chars → x:20,  9 chars → x:20

const copterFreestyle: OsdPreset = {
  id: 'copter-freestyle',
  name: 'FPV Freestyle',
  description: 'Minimal clean layout for freestyle and proximity. Essential info at screen edges, clear center for flying.',
  vehicles: ['copter'],
  targetGrid: { cols: 50, rows: 18 },
  screens: [
    {
      label: 'Main Flight',
      enabled: true,
      elements: [
        // Top-left: link
        { id: 'RSSI', x: 2, y: 2 },
        { id: 'LINK_QUALITY', x: 2, y: 3 },
        { id: 'SATS', x: 2, y: 4 },
        // Top-right: battery
        { id: 'BAT_VOLT', x: 41, y: 2 },
        { id: 'AVGCELLVOLT', x: 41, y: 3 },
        { id: 'CURRENT', x: 41, y: 4 },
        { id: 'BATUSED', x: 42, y: 5 },
        // Bottom-left: speed + mode
        { id: 'GSPEED', x: 2, y: 13 },
        { id: 'FLTMODE', x: 2, y: 14 },
        // Bottom-right: altitude
        { id: 'THROTTLE', x: 42, y: 12 },
        { id: 'ALTITUDE', x: 41, y: 13 },
        { id: 'VSPEED', x: 40, y: 14 },
        // Center: messages
        { id: 'MESSAGE', x: 15, y: 9 },
        // Bottom center: home
        { id: 'HOME', x: 20, y: 15 },
      ],
    },
    {
      label: 'Statistics',
      enabled: true,
      elements: [
        { id: 'STATS', x: 15, y: 5 },
      ],
    },
    emptyScreen('Screen 3'),
    emptyScreen('Screen 4'),
  ],
};

const copterLongRange: OsdPreset = {
  id: 'copter-longrange',
  name: 'Long Range',
  description: 'Full telemetry for long-range cruising. All battery, navigation, and efficiency data visible.',
  vehicles: ['copter'],
  targetGrid: { cols: 50, rows: 18 },
  screens: [
    {
      label: 'Main Flight',
      enabled: true,
      elements: [
        // Top-left: link + GPS
        { id: 'RSSI', x: 2, y: 2 },
        { id: 'LINK_QUALITY', x: 2, y: 3 },
        { id: 'SATS', x: 2, y: 4 },
        // Top-center: compass
        { id: 'COMPASS', x: 16, y: 2 },
        { id: 'HEADING', x: 22, y: 3 },
        // Top-right: battery
        { id: 'BAT_VOLT', x: 41, y: 2 },
        { id: 'AVGCELLVOLT', x: 41, y: 3 },
        { id: 'CURRENT', x: 41, y: 4 },
        { id: 'BATUSED', x: 42, y: 5 },
        // Center: horizon + messages
        { id: 'HORIZON', x: 20, y: 8 },
        { id: 'MESSAGE', x: 15, y: 12 },
        // Left side: speed
        { id: 'GSPEED', x: 2, y: 8 },
        { id: 'VSPEED', x: 2, y: 9 },
        // Right side: altitude
        { id: 'ALTITUDE', x: 41, y: 8 },
        // Bottom-left: mode + time
        { id: 'FLIGHTIME', x: 2, y: 13 },
        { id: 'FLTMODE', x: 2, y: 14 },
        // Bottom-center: home
        { id: 'HOME', x: 20, y: 15 },
        // Bottom-right: throttle + efficiency
        { id: 'EFF', x: 40, y: 13 },
        { id: 'THROTTLE', x: 42, y: 14 },
      ],
    },
    {
      label: 'Navigation',
      enabled: true,
      elements: [
        { id: 'COMPASS', x: 16, y: 2 },
        { id: 'HEADING', x: 22, y: 3 },
        { id: 'HOME', x: 20, y: 8 },
        { id: 'ALTITUDE', x: 41, y: 8 },
        { id: 'GPSLATITUDE', x: 20, y: 12 },
        { id: 'GPSLONGITUDE', x: 20, y: 13 },
        { id: 'SATS', x: 2, y: 2 },
        { id: 'BAT_VOLT', x: 41, y: 2 },
        { id: 'FLTMODE', x: 2, y: 14 },
      ],
    },
    {
      label: 'Statistics',
      enabled: true,
      elements: [
        { id: 'STATS', x: 15, y: 5 },
      ],
    },
    emptyScreen('Screen 4'),
  ],
};

// ─── Plane Presets ───────────────────────────────────────────────────────────

const planeCruise: OsdPreset = {
  id: 'plane-cruise',
  name: 'FPV Cruise',
  description: 'Balanced layout for fixed-wing FPV. Airspeed, altitude, and navigation with clear center view.',
  vehicles: ['plane'],
  targetGrid: { cols: 50, rows: 18 },
  screens: [
    {
      label: 'Main Flight',
      enabled: true,
      elements: [
        // Top-left: link + GPS
        { id: 'RSSI', x: 2, y: 2 },
        { id: 'SATS', x: 2, y: 3 },
        // Top-center: compass
        { id: 'COMPASS', x: 16, y: 2 },
        { id: 'HEADING', x: 22, y: 3 },
        // Top-right: battery
        { id: 'BAT_VOLT', x: 41, y: 2 },
        { id: 'CURRENT', x: 41, y: 3 },
        { id: 'BATUSED', x: 42, y: 4 },
        // Left side: airspeed + ground speed
        { id: 'ASPEED', x: 2, y: 8 },
        { id: 'GSPEED', x: 2, y: 9 },
        { id: 'WIND', x: 2, y: 10 },
        // Center: horizon + messages
        { id: 'HORIZON', x: 20, y: 8 },
        { id: 'MESSAGE', x: 15, y: 12 },
        // Right side: altitude + vspeed
        { id: 'ALTITUDE', x: 41, y: 8 },
        { id: 'VSPEED', x: 40, y: 9 },
        // Bottom
        { id: 'FLTMODE', x: 2, y: 14 },
        { id: 'HOME', x: 20, y: 15 },
        { id: 'THROTTLE', x: 42, y: 14 },
        { id: 'FLIGHTIME', x: 42, y: 13 },
      ],
    },
    {
      label: 'Navigation',
      enabled: true,
      elements: [
        { id: 'COMPASS', x: 16, y: 2 },
        { id: 'WAYPOINT', x: 20, y: 8 },
        { id: 'XTRACK_ERROR', x: 21, y: 9 },
        { id: 'HOME', x: 20, y: 15 },
        { id: 'ALTITUDE', x: 41, y: 8 },
        { id: 'ASPEED', x: 2, y: 8 },
        { id: 'SATS', x: 2, y: 2 },
        { id: 'BAT_VOLT', x: 41, y: 2 },
        { id: 'FLTMODE', x: 2, y: 14 },
      ],
    },
    {
      label: 'Statistics',
      enabled: true,
      elements: [
        { id: 'STATS', x: 15, y: 5 },
      ],
    },
    emptyScreen('Screen 4'),
  ],
};

const planeMission: OsdPreset = {
  id: 'plane-mission',
  name: 'Autonomous Mission',
  description: 'Data-heavy layout for autonomous flight. Waypoint tracking, efficiency, and full navigation.',
  vehicles: ['plane'],
  targetGrid: { cols: 50, rows: 18 },
  screens: [
    {
      label: 'Main Flight',
      enabled: true,
      elements: [
        // Top bar
        { id: 'RSSI', x: 2, y: 2 },
        { id: 'SATS', x: 2, y: 3 },
        { id: 'COMPASS', x: 16, y: 2 },
        { id: 'BAT_VOLT', x: 41, y: 2 },
        { id: 'CURRENT', x: 41, y: 3 },
        { id: 'BATUSED', x: 42, y: 4 },
        { id: 'AVGCELLVOLT', x: 41, y: 5 },
        // Left: speed + wind
        { id: 'ASPEED', x: 2, y: 7 },
        { id: 'GSPEED', x: 2, y: 8 },
        { id: 'WIND', x: 2, y: 9 },
        // Center
        { id: 'HORIZON', x: 20, y: 8 },
        { id: 'WAYPOINT', x: 20, y: 5 },
        { id: 'XTRACK_ERROR', x: 21, y: 6 },
        { id: 'MESSAGE', x: 15, y: 12 },
        // Right: altitude
        { id: 'ALTITUDE', x: 41, y: 7 },
        { id: 'HGT_ABVTERR', x: 41, y: 8 },
        { id: 'VSPEED', x: 40, y: 9 },
        // Bottom
        { id: 'FLTMODE', x: 2, y: 14 },
        { id: 'FLIGHTIME', x: 2, y: 13 },
        { id: 'HOME', x: 20, y: 15 },
        { id: 'THROTTLE', x: 42, y: 14 },
        { id: 'EFF', x: 40, y: 13 },
      ],
    },
    {
      label: 'Statistics',
      enabled: true,
      elements: [
        { id: 'STATS', x: 15, y: 5 },
      ],
    },
    emptyScreen('Screen 3'),
    emptyScreen('Screen 4'),
  ],
};

// ─── QuadPlane Presets ───────────────────────────────────────────────────────

const quadplaneAllRounder: OsdPreset = {
  id: 'qp-allrounder',
  name: 'VTOL All-Rounder',
  description: 'Covers both fixed-wing cruise and VTOL hover. Airspeed prominent for safe transitions.',
  vehicles: ['quadplane'],
  targetGrid: { cols: 50, rows: 18 },
  screens: [
    {
      label: 'Main Flight',
      enabled: true,
      elements: [
        // Top bar
        { id: 'RSSI', x: 2, y: 2 },
        { id: 'SATS', x: 2, y: 3 },
        { id: 'COMPASS', x: 16, y: 2 },
        { id: 'BAT_VOLT', x: 41, y: 2 },
        { id: 'CURRENT', x: 41, y: 3 },
        { id: 'BATUSED', x: 42, y: 4 },
        // Left: speeds
        { id: 'ASPEED', x: 2, y: 8 },
        { id: 'GSPEED', x: 2, y: 9 },
        { id: 'WIND', x: 2, y: 10 },
        // Center
        { id: 'HORIZON', x: 20, y: 8 },
        { id: 'MESSAGE', x: 15, y: 12 },
        // Right
        { id: 'ALTITUDE', x: 41, y: 8 },
        { id: 'VSPEED', x: 40, y: 9 },
        // Bottom
        { id: 'FLTMODE', x: 2, y: 14 },
        { id: 'HOME', x: 20, y: 15 },
        { id: 'THROTTLE', x: 42, y: 14 },
        { id: 'FLIGHTIME', x: 42, y: 13 },
      ],
    },
    {
      label: 'Navigation',
      enabled: true,
      elements: [
        { id: 'COMPASS', x: 16, y: 2 },
        { id: 'WAYPOINT', x: 20, y: 8 },
        { id: 'XTRACK_ERROR', x: 21, y: 9 },
        { id: 'HOME', x: 20, y: 15 },
        { id: 'ASPEED', x: 2, y: 8 },
        { id: 'ALTITUDE', x: 41, y: 8 },
        { id: 'BAT_VOLT', x: 41, y: 2 },
        { id: 'FLTMODE', x: 2, y: 14 },
        { id: 'SATS', x: 2, y: 2 },
      ],
    },
    {
      label: 'Statistics',
      enabled: true,
      elements: [
        { id: 'STATS', x: 15, y: 5 },
      ],
    },
    emptyScreen('Screen 4'),
  ],
};

const minimalClean: OsdPreset = {
  id: 'minimal-clean',
  name: 'Minimal Clean',
  description: 'Bare essentials only -- battery, RSSI, altitude, mode. Maximum video visibility.',
  vehicles: [],
  targetGrid: { cols: 50, rows: 18 },
  screens: [
    {
      label: 'Main Flight',
      enabled: true,
      elements: [
        { id: 'BAT_VOLT', x: 41, y: 2 },
        { id: 'RSSI', x: 2, y: 2 },
        { id: 'ALTITUDE', x: 41, y: 14 },
        { id: 'FLTMODE', x: 2, y: 14 },
        { id: 'MESSAGE', x: 15, y: 9 },
        { id: 'SATS', x: 8, y: 2 },
      ],
    },
    {
      label: 'Statistics',
      enabled: true,
      elements: [
        { id: 'STATS', x: 15, y: 5 },
      ],
    },
    emptyScreen('Screen 3'),
    emptyScreen('Screen 4'),
  ],
};

// ─── Public API ──────────────────────────────────────────────────────────────

export const OSD_PRESETS: OsdPreset[] = [
  copterFreestyle,
  copterLongRange,
  planeCruise,
  planeMission,
  quadplaneAllRounder,
  minimalClean,
];

/** Get presets applicable to a given vehicle type */
export function getPresetsForVehicle(vehicleType: VehicleType | null): OsdPreset[] {
  if (!vehicleType) return OSD_PRESETS;
  return OSD_PRESETS.filter(
    (p) => p.vehicles.length === 0 || p.vehicles.includes(vehicleType)
  );
}
