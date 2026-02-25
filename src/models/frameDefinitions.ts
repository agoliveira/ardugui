/**
 * Frame Definitions
 *
 * Motor positions and rotation directions for ArduPilot frame types.
 * Used by Motors page to render frame diagrams and map motor test buttons.
 *
 * Reference: https://ardupilot.org/copter/docs/connect-escs-and-motors.html
 *
 * Coordinate system: x = right, y = up (screen-space for SVG is inverted y).
 * Positions normalized to -1..1 range.
 */

export interface MotorDef {
  /** 1-based motor number (matches ArduPilot output number) */
  number: number;
  /** Position x (-1 left, +1 right) */
  x: number;
  /** Position y (-1 back, +1 front) */
  y: number;
  /** Rotation direction: CW or CCW */
  rotation: 'CW' | 'CCW';
}

export interface FrameLayout {
  /** Display name */
  name: string;
  /** Motor definitions */
  motors: MotorDef[];
}

// ============================================================
// FRAME_CLASS values (FRAME_CLASS parameter)
// ============================================================
export const FRAME_CLASSES: Record<number, string> = {
  0: 'Undefined',
  1: 'Quad',
  2: 'Hexa',
  3: 'Octa',
  4: 'OctaQuad',
  5: 'Y6',
  6: 'Heli',
  7: 'Tri',
  8: 'SingleCopter',
  9: 'CoaxCopter',
  10: 'BiCopter',
  11: 'Heli Dual',
  12: 'DodecaHexa',
  13: 'HeliQuad',
  14: 'Deca',
};

// ============================================================
// FRAME_TYPE values (FRAME_TYPE parameter)
// ============================================================
export const FRAME_TYPES: Record<number, string> = {
  0: 'Plus (+)',
  1: 'X',
  2: 'V',
  3: 'H',
  4: 'V-Tail',
  5: 'A-Tail',
  10: 'Y6B',
  11: 'Y6F',
  12: 'BetaFlight X',
  13: 'DJI X',
  14: 'Clockwise X',
  16: 'Reverse Clockwise X',
};

// ============================================================
// Motor layouts per frame class + type
// Key: "CLASS-TYPE" e.g. "1-1" = Quad X
// ============================================================

const LAYOUTS: Record<string, FrameLayout> = {
  // --- Quad Plus ---
  '1-0': {
    name: 'Quad +',
    motors: [
      { number: 1, x: 0, y: 1, rotation: 'CCW' },    // Front
      { number: 2, x: 1, y: 0, rotation: 'CCW' },    // Right
      { number: 3, x: 0, y: -1, rotation: 'CCW' },   // Back
      { number: 4, x: -1, y: 0, rotation: 'CCW' },   // Left
      // Note: 1,3 = CCW; 2,4 = CW in reality but ArduPilot docs show:
      // 1=Front(CCW), 2=Right(CW), 3=Back(CCW), 4=Left(CW)
    ],
  },

  // --- Quad X ---
  '1-1': {
    name: 'Quad X',
    motors: [
      { number: 1, x: 0.7, y: 0.7, rotation: 'CCW' },   // Front-Right
      { number: 2, x: -0.7, y: -0.7, rotation: 'CCW' },  // Back-Left
      { number: 3, x: 0.7, y: -0.7, rotation: 'CW' },    // Back-Right
      { number: 4, x: -0.7, y: 0.7, rotation: 'CW' },    // Front-Left
    ],
  },

  // --- Quad V ---
  '1-2': {
    name: 'Quad V',
    motors: [
      { number: 1, x: 0.5, y: 0.8, rotation: 'CCW' },
      { number: 2, x: -0.5, y: -0.8, rotation: 'CCW' },
      { number: 3, x: 0.5, y: -0.8, rotation: 'CW' },
      { number: 4, x: -0.5, y: 0.8, rotation: 'CW' },
    ],
  },

  // --- Quad H ---
  '1-3': {
    name: 'Quad H',
    motors: [
      { number: 1, x: 0.7, y: 0.7, rotation: 'CCW' },
      { number: 2, x: -0.7, y: -0.7, rotation: 'CCW' },
      { number: 3, x: 0.7, y: -0.7, rotation: 'CW' },
      { number: 4, x: -0.7, y: 0.7, rotation: 'CW' },
    ],
  },

  // --- Quad BetaFlight X ---
  '1-12': {
    name: 'Quad BetaFlight X',
    motors: [
      { number: 1, x: -0.7, y: -0.7, rotation: 'CW' },   // Back-Left (M1 = rear-left)
      { number: 2, x: -0.7, y: 0.7, rotation: 'CCW' },    // Front-Left
      { number: 3, x: 0.7, y: 0.7, rotation: 'CW' },      // Front-Right
      { number: 4, x: 0.7, y: -0.7, rotation: 'CCW' },    // Back-Right
    ],
  },

  // --- Quad DJI X ---
  '1-13': {
    name: 'Quad DJI X',
    motors: [
      { number: 1, x: 0.7, y: 0.7, rotation: 'CCW' },
      { number: 2, x: -0.7, y: 0.7, rotation: 'CW' },
      { number: 3, x: -0.7, y: -0.7, rotation: 'CCW' },
      { number: 4, x: 0.7, y: -0.7, rotation: 'CW' },
    ],
  },

  // --- Hexa Plus ---
  '2-0': {
    name: 'Hexa +',
    motors: [
      { number: 1, x: 0, y: 1, rotation: 'CW' },
      { number: 2, x: 0.87, y: 0.5, rotation: 'CCW' },
      { number: 3, x: 0.87, y: -0.5, rotation: 'CW' },
      { number: 4, x: 0, y: -1, rotation: 'CCW' },
      { number: 5, x: -0.87, y: -0.5, rotation: 'CW' },
      { number: 6, x: -0.87, y: 0.5, rotation: 'CCW' },
    ],
  },

  // --- Hexa X ---
  '2-1': {
    name: 'Hexa X',
    motors: [
      { number: 1, x: 0.5, y: 0.87, rotation: 'CW' },
      { number: 2, x: 1, y: 0, rotation: 'CCW' },
      { number: 3, x: 0.5, y: -0.87, rotation: 'CW' },
      { number: 4, x: -0.5, y: -0.87, rotation: 'CCW' },
      { number: 5, x: -1, y: 0, rotation: 'CW' },
      { number: 6, x: -0.5, y: 0.87, rotation: 'CCW' },
    ],
  },

  // --- Octa Plus ---
  '3-0': {
    name: 'Octa +',
    motors: [
      { number: 1, x: 0, y: 1, rotation: 'CW' },
      { number: 2, x: 0.7, y: 0.7, rotation: 'CCW' },
      { number: 3, x: 1, y: 0, rotation: 'CW' },
      { number: 4, x: 0.7, y: -0.7, rotation: 'CCW' },
      { number: 5, x: 0, y: -1, rotation: 'CW' },
      { number: 6, x: -0.7, y: -0.7, rotation: 'CCW' },
      { number: 7, x: -1, y: 0, rotation: 'CW' },
      { number: 8, x: -0.7, y: 0.7, rotation: 'CCW' },
    ],
  },

  // --- Octa X ---
  '3-1': {
    name: 'Octa X',
    motors: [
      { number: 1, x: 0.38, y: 0.92, rotation: 'CW' },
      { number: 2, x: 0.92, y: 0.38, rotation: 'CCW' },
      { number: 3, x: 0.92, y: -0.38, rotation: 'CW' },
      { number: 4, x: 0.38, y: -0.92, rotation: 'CCW' },
      { number: 5, x: -0.38, y: -0.92, rotation: 'CW' },
      { number: 6, x: -0.92, y: -0.38, rotation: 'CCW' },
      { number: 7, x: -0.92, y: 0.38, rotation: 'CW' },
      { number: 8, x: -0.38, y: 0.92, rotation: 'CCW' },
    ],
  },

  // --- Y6 (default: Y6B - bottom motors reversed) ---
  '5-10': {
    name: 'Y6B',
    motors: [
      { number: 1, x: 0.7, y: 0.7, rotation: 'CW' },    // Front-Right top
      { number: 2, x: -0.7, y: 0.7, rotation: 'CCW' },   // Front-Left top
      { number: 3, x: 0, y: -1, rotation: 'CW' },        // Back top
      { number: 4, x: 0.7, y: 0.7, rotation: 'CCW' },    // Front-Right bottom
      { number: 5, x: -0.7, y: 0.7, rotation: 'CW' },    // Front-Left bottom
      { number: 6, x: 0, y: -1, rotation: 'CCW' },        // Back bottom
    ],
  },

  // --- Tri ---
  '7-0': {
    name: 'Tricopter',
    motors: [
      { number: 1, x: 0.7, y: 0.7, rotation: 'CCW' },   // Front-Right
      { number: 2, x: -0.7, y: 0.7, rotation: 'CW' },    // Front-Left
      { number: 4, x: 0, y: -1, rotation: 'CW' },        // Back (with yaw servo)
    ],
  },
};

/**
 * Get the motor layout for a given frame class and type.
 * Falls back to type 0 or 1 if exact match not found.
 */
export function getFrameLayout(
  frameClass: number,
  frameType: number
): FrameLayout | null {
  // Exact match
  const key = `${frameClass}-${frameType}`;
  if (LAYOUTS[key]) return LAYOUTS[key];

  // Fallback: try common defaults
  const fallbackX = `${frameClass}-1`;
  if (LAYOUTS[fallbackX]) return LAYOUTS[fallbackX];

  const fallbackPlus = `${frameClass}-0`;
  if (LAYOUTS[fallbackPlus]) return LAYOUTS[fallbackPlus];

  return null;
}

/**
 * Servo function names for planes.
 * https://ardupilot.org/plane/docs/parameters.html#servo1-function
 */
export const SERVO_FUNCTIONS: Record<number, string> = {
  0: 'Disabled',
  1: 'RCPassThru 1',
  2: 'RCPassThru 2',
  3: 'RCPassThru 3',
  4: 'RCPassThru 4',
  19: 'Gripper',
  21: 'Parachute',
  22: 'EPM',
  24: 'Landing Gear',
  25: 'Engine Run Enable',
  26: 'HeadTracker Pan',
  27: 'HeadTracker Tilt',
  28: 'HeadTracker Roll',
  33: 'Motor 1',
  34: 'Motor 2',
  35: 'Motor 3',
  36: 'Motor 4',
  37: 'Motor 5',
  38: 'Motor 6',
  39: 'Motor 7',
  40: 'Motor 8',
  51: 'RCIN 1',
  52: 'RCIN 2',
  53: 'RCIN 3',
  54: 'RCIN 4',
  55: 'RCIN 5',
  56: 'RCIN 6',
  57: 'RCIN 7',
  58: 'RCIN 8',
  59: 'RCIN 9',
  60: 'RCIN 10',
  61: 'RCIN 11',
  62: 'RCIN 12',
  63: 'RCIN 13',
  64: 'RCIN 14',
  65: 'RCIN 15',
  66: 'RCIN 16',
  70: 'Throttle',
  73: 'Throttle Left',
  74: 'Throttle Right',
  75: 'Tilt Motor Front Left',
  76: 'Tilt Motor Front Right',
  77: 'Aileron',
  78: 'Elevator',
  79: 'Rudder (Yaw)',
  80: 'FlaperonLeft',
  81: 'FlaperonRight',
  82: 'Ground Steering',
  84: 'Flap',
  86: 'FlaperonLeft 2',
  87: 'FlaperonRight 2',
  88: 'Aileron With Input',
  89: 'Elevator With Input',
  94: 'Script Out 1',
  95: 'Script Out 2',
  96: 'Script Out 3',
  97: 'Script Out 4',
  106: 'Airbrake',
  120: 'NeoPixel 1',
  121: 'NeoPixel 2',
  122: 'NeoPixel 3',
  123: 'NeoPixel 4',
};

/**
 * Look up a servo function name.
 */
export function servoFunctionName(funcId: number): string {
  return SERVO_FUNCTIONS[funcId] || `Function ${funcId}`;
}
