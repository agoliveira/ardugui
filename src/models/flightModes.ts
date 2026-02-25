/**
 * ArduPilot flight mode definitions.
 *
 * Each vehicle type has its own set of available modes.
 * The mode number maps to the FLTMODE1-6 parameter values.
 */

export interface FlightMode {
  /** Mode number (value stored in FLTMODE1-6 params) */
  id: number;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Color for the mode range bar */
  color: string;
}

// --- Copter modes ---
export const COPTER_MODES: FlightMode[] = [
  { id: 0,  name: 'Stabilize',   description: 'Manual with self-leveling',               color: '#3b82f6' },
  { id: 1,  name: 'Acro',        description: 'Rate-controlled, no self-leveling',        color: '#ef4444' },
  { id: 2,  name: 'AltHold',     description: 'Altitude hold with manual roll/pitch',     color: '#22c55e' },
  { id: 3,  name: 'Auto',        description: 'Follow pre-programmed mission',            color: '#a855f7' },
  { id: 4,  name: 'Guided',      description: 'Navigate to GCS-commanded position',       color: '#8b5cf6' },
  { id: 5,  name: 'Loiter',      description: 'Hold position and altitude',               color: '#06b6d4' },
  { id: 6,  name: 'RTL',         description: 'Return to launch',                         color: '#f59e0b' },
  { id: 7,  name: 'Circle',      description: 'Orbit a point',                            color: '#ec4899' },
  { id: 9,  name: 'Land',        description: 'Automatic landing',                        color: '#14b8a6' },
  { id: 11, name: 'Drift',       description: 'Drift-style flying',                       color: '#64748b' },
  { id: 13, name: 'Sport',       description: 'Like Stabilize but with rate limits',      color: '#f97316' },
  { id: 14, name: 'Flip',        description: 'Automatic flip maneuver',                  color: '#e11d48' },
  { id: 15, name: 'AutoTune',    description: 'Automated PID tuning',                     color: '#84cc16' },
  { id: 16, name: 'PosHold',     description: 'Position hold with lean-based control',    color: '#0ea5e9' },
  { id: 17, name: 'Brake',       description: 'Stop and hold position',                   color: '#78716c' },
  { id: 18, name: 'Throw',       description: 'Launch by throwing',                       color: '#dc2626' },
  { id: 19, name: 'Avoid ADSB',  description: 'ADS-B avoidance mode',                     color: '#737373' },
  { id: 20, name: 'Guided NoGPS',description: 'Guided without GPS',                       color: '#a3a3a3' },
  { id: 21, name: 'SmartRTL',    description: 'Return via recorded path',                 color: '#eab308' },
  { id: 22, name: 'FlowHold',    description: 'Position hold using optical flow',         color: '#2dd4bf' },
  { id: 23, name: 'Follow',      description: 'Follow another vehicle',                   color: '#c084fc' },
  { id: 24, name: 'ZigZag',      description: 'Autonomous zigzag for spraying',           color: '#4ade80' },
  { id: 25, name: 'SystemID',    description: 'System identification',                    color: '#6b7280' },
  { id: 26, name: 'Heli Autorotate', description: 'Helicopter autorotation',              color: '#b91c1c' },
  { id: 27, name: 'Auto RTL',    description: 'Return via mission then RTL',              color: '#d97706' },
];

// --- Plane modes ---
export const PLANE_MODES: FlightMode[] = [
  { id: 0,  name: 'Manual',      description: 'Full manual control',                      color: '#3b82f6' },
  { id: 1,  name: 'Circle',      description: 'Circle around a point',                    color: '#ec4899' },
  { id: 2,  name: 'Stabilize',   description: 'Wing leveling with manual throttle',       color: '#22c55e' },
  { id: 3,  name: 'Training',    description: 'Limited roll/pitch angles',                color: '#84cc16' },
  { id: 4,  name: 'Acro',        description: 'Rate-controlled aerobatics',               color: '#ef4444' },
  { id: 5,  name: 'FBWA',        description: 'Fly By Wire A (stabilized)',               color: '#06b6d4' },
  { id: 6,  name: 'FBWB',        description: 'Fly By Wire B (altitude hold)',            color: '#0ea5e9' },
  { id: 7,  name: 'Cruise',      description: 'Speed and altitude hold',                  color: '#14b8a6' },
  { id: 8,  name: 'AutoTune',    description: 'Automated tuning',                         color: '#84cc16' },
  { id: 10, name: 'Auto',        description: 'Follow pre-programmed mission',            color: '#a855f7' },
  { id: 11, name: 'RTL',         description: 'Return to launch',                         color: '#f59e0b' },
  { id: 12, name: 'Loiter',      description: 'Circle and hold altitude',                 color: '#06b6d4' },
  { id: 13, name: 'Takeoff',     description: 'Automatic takeoff',                        color: '#10b981' },
  { id: 14, name: 'Avoid ADSB',  description: 'ADS-B avoidance mode',                     color: '#737373' },
  { id: 15, name: 'Guided',      description: 'Navigate to GCS-commanded position',       color: '#8b5cf6' },
  { id: 17, name: 'QStabilize',  description: 'VTOL stabilize',                           color: '#f97316' },
  { id: 18, name: 'QHover',      description: 'VTOL hover',                               color: '#fb923c' },
  { id: 19, name: 'QLoiter',     description: 'VTOL position hold',                       color: '#fdba74' },
  { id: 20, name: 'QLand',       description: 'VTOL landing',                             color: '#c2410c' },
  { id: 21, name: 'QRTL',        description: 'VTOL return to launch',                    color: '#eab308' },
  { id: 22, name: 'QAutoTune',   description: 'VTOL automated tuning',                    color: '#a3e635' },
  { id: 23, name: 'QAcro',       description: 'VTOL acrobatic mode',                      color: '#dc2626' },
  { id: 24, name: 'Thermal',     description: 'Thermal soaring',                          color: '#f59e0b' },
  { id: 25, name: 'Loiter to QLand', description: 'Loiter then VTOL land',                color: '#d97706' },
];

// QuadPlane uses the plane modes list (includes Q* modes)
export const QUADPLANE_MODES = PLANE_MODES;

/**
 * Get available flight modes for a vehicle type.
 */
export function getModesForVehicle(
  vehicleType: 'copter' | 'plane' | 'quadplane' | null
): FlightMode[] {
  switch (vehicleType) {
    case 'copter':
      return COPTER_MODES;
    case 'plane':
      // Filter out Q* modes for non-quadplane
      return PLANE_MODES.filter((m) => m.id < 17 || m.id > 23);
    case 'quadplane':
      return QUADPLANE_MODES;
    default:
      return [];
  }
}

/**
 * ArduPilot divides the mode channel into 6 fixed PWM ranges.
 * Each FLTMODE1-6 maps to one of these ranges.
 */
export const MODE_PWM_RANGES = [
  { mode: 1, label: 'FLTMODE1', min: 0,    max: 1230 },
  { mode: 2, label: 'FLTMODE2', min: 1231, max: 1360 },
  { mode: 3, label: 'FLTMODE3', min: 1361, max: 1490 },
  { mode: 4, label: 'FLTMODE4', min: 1491, max: 1620 },
  { mode: 5, label: 'FLTMODE5', min: 1621, max: 1749 },
  { mode: 6, label: 'FLTMODE6', min: 1750, max: 2500 },
];

/**
 * Get the PWM display range for the mode bar visualization.
 * We show 800-2200 as the full range.
 */
export const PWM_DISPLAY_MIN = 800;
export const PWM_DISPLAY_MAX = 2200;
