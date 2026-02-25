/**
 * Airframe Template System
 *
 * Defines aircraft configurations as composable templates.
 * Used by the Frame Wizard to guide users through airframe setup.
 *
 * Architecture:
 *   - PlaneTemplate: wing/tail/control surface configuration
 *   - MotorTemplate: motor/propulsion layout (single, twin, VTOL quad, etc.)
 *   - Extras: optional add-ons (flaps, retracts, airbrakes, etc.)
 *   - AirframePreset: a complete aircraft = plane + motors + extras
 *
 * For copters: only MotorTemplate is used (no control surfaces).
 * For planes: PlaneTemplate + MotorTemplate.
 * For VTOL:  PlaneTemplate + forward motor(s) + VTOL MotorTemplate.
 */

// ============================================================
// Servo Slot -- a named output that needs to be wired
// ============================================================

export interface ServoSlot {
  /** Unique key within the template (e.g. 'aileron_l', 'elevator', 'vtol_motor_1') */
  id: string;
  /** Human-readable label */
  label: string;
  /** ArduPilot SERVOx_FUNCTION value */
  function: number;
  /** Suggested default SERVO output (1-based), user can reassign */
  defaultOutput: number;
  /** Category for diagram placement */
  category: 'wing_left' | 'wing_right' | 'tail' | 'motor_front' | 'motor_vtol' | 'other';
  /** Position on diagram (normalized -1..1, x=right, y=forward) */
  diagramPos: { x: number; y: number };
}

// ============================================================
// Motor Definition -- for copter/VTOL motor diagrams
// ============================================================

export interface MotorPosition {
  /** Motor number (1-based, matches ArduPilot motor ordering) */
  number: number;
  /** Position (normalized -1..1) */
  x: number;
  y: number;
  /** Rotation */
  rotation: 'CW' | 'CCW';
  /** SERVOx_FUNCTION value (Motor 1 = 33, Motor 2 = 34, etc.) */
  function: number;
  /** Suggested default SERVO output */
  defaultOutput: number;
}

// ============================================================
// Plane Template -- wing/tail/surface configuration
// ============================================================

export interface PlaneTemplate {
  id: string;
  name: string;
  description: string;
  /** SVG diagram type for rendering */
  diagramType: 'conventional' | 'flying_wing' | 'vtail' | 'atail' | 'canard' | 'twin_boom';
  /** Control surface slots */
  surfaces: ServoSlot[];
}

// ============================================================
// Motor Template -- propulsion configuration
// ============================================================

export interface MotorTemplate {
  id: string;
  name: string;
  description: string;
  /** For copter frames: FRAME_CLASS param value */
  frameClass?: number;
  /** For copter frames: FRAME_TYPE param value */
  frameType?: number;
  /** For VTOL: Q_FRAME_CLASS */
  qFrameClass?: number;
  /** For VTOL: Q_FRAME_TYPE */
  qFrameType?: number;
  /** Forward motor(s) -- for planes */
  forwardMotors: ServoSlot[];
  /** VTOL / copter motors -- positioned for diagram */
  vtolMotors: MotorPosition[];
}

// ============================================================
// Extra -- optional add-on servo function
// ============================================================

export interface ExtraOption {
  id: string;
  label: string;
  description: string;
  /** Slots added when this extra is enabled */
  slots: ServoSlot[];
}

// ============================================================
// Airframe Preset -- complete aircraft configuration
// ============================================================

export interface AirframePreset {
  id: string;
  name: string;
  description: string;
  category: 'plane' | 'copter' | 'vtol';
  /** Icon/thumbnail identifier */
  icon: string;
  /** Plane surfaces (null for pure copters) */
  planeTemplate: PlaneTemplate | null;
  /** Motor layout */
  motorTemplate: MotorTemplate;
  /** Available extras for this preset */
  availableExtras: string[]; // ExtraOption IDs
  /** Additional params to set beyond servo functions */
  additionalParams?: Record<string, number>;
}

// ============================================================
// PLANE TEMPLATES
// ============================================================

export const PLANE_TEMPLATES: Record<string, PlaneTemplate> = {
  conventional: {
    id: 'conventional',
    name: 'Conventional',
    description: 'Standard aileron + elevator + rudder',
    diagramType: 'conventional',
    surfaces: [
      {
        id: 'aileron_l', label: 'Aileron Left', function: 77,
        defaultOutput: 1, category: 'wing_left',
        diagramPos: { x: -0.8, y: 0 },
      },
      {
        id: 'aileron_r', label: 'Aileron Right', function: 77,
        defaultOutput: 2, category: 'wing_right',
        diagramPos: { x: 0.8, y: 0 },
      },
      {
        id: 'elevator', label: 'Elevator', function: 78,
        defaultOutput: 3, category: 'tail',
        diagramPos: { x: 0, y: -0.85 },
      },
      {
        id: 'rudder', label: 'Rudder', function: 79,
        defaultOutput: 4, category: 'tail',
        diagramPos: { x: 0, y: -0.7 },
      },
    ],
  },

  flying_wing: {
    id: 'flying_wing',
    name: 'Flying Wing',
    description: 'Two elevons, no tail surfaces',
    diagramType: 'flying_wing',
    surfaces: [
      {
        id: 'elevon_l', label: 'Elevon Left', function: 77,
        defaultOutput: 1, category: 'wing_left',
        diagramPos: { x: -0.7, y: -0.2 },
      },
      {
        id: 'elevon_r', label: 'Elevon Right', function: 77,
        defaultOutput: 2, category: 'wing_right',
        diagramPos: { x: 0.7, y: -0.2 },
      },
    ],
  },

  vtail: {
    id: 'vtail',
    name: 'V-Tail',
    description: 'Ailerons + V-tail mixing (elevator + rudder)',
    diagramType: 'vtail',
    surfaces: [
      {
        id: 'aileron_l', label: 'Aileron Left', function: 77,
        defaultOutput: 1, category: 'wing_left',
        diagramPos: { x: -0.8, y: 0 },
      },
      {
        id: 'aileron_r', label: 'Aileron Right', function: 77,
        defaultOutput: 2, category: 'wing_right',
        diagramPos: { x: 0.8, y: 0 },
      },
      {
        id: 'vtail_l', label: 'V-Tail Left', function: 78,
        defaultOutput: 3, category: 'tail',
        diagramPos: { x: -0.25, y: -0.85 },
      },
      {
        id: 'vtail_r', label: 'V-Tail Right', function: 78,
        defaultOutput: 4, category: 'tail',
        diagramPos: { x: 0.25, y: -0.85 },
      },
    ],
  },

  atail: {
    id: 'atail',
    name: 'A-Tail',
    description: 'Ailerons + inverted V-tail',
    diagramType: 'atail',
    surfaces: [
      {
        id: 'aileron_l', label: 'Aileron Left', function: 77,
        defaultOutput: 1, category: 'wing_left',
        diagramPos: { x: -0.8, y: 0 },
      },
      {
        id: 'aileron_r', label: 'Aileron Right', function: 77,
        defaultOutput: 2, category: 'wing_right',
        diagramPos: { x: 0.8, y: 0 },
      },
      {
        id: 'atail_l', label: 'A-Tail Left', function: 78,
        defaultOutput: 3, category: 'tail',
        diagramPos: { x: -0.25, y: -0.85 },
      },
      {
        id: 'atail_r', label: 'A-Tail Right', function: 78,
        defaultOutput: 4, category: 'tail',
        diagramPos: { x: 0.25, y: -0.85 },
      },
    ],
  },

  canard: {
    id: 'canard',
    name: 'Canard',
    description: 'Forward canards + rear wing ailerons + rudder',
    diagramType: 'canard',
    surfaces: [
      {
        id: 'canard_l', label: 'Canard Left', function: 78,
        defaultOutput: 1, category: 'wing_left',
        diagramPos: { x: -0.4, y: 0.7 },
      },
      {
        id: 'canard_r', label: 'Canard Right', function: 78,
        defaultOutput: 2, category: 'wing_right',
        diagramPos: { x: 0.4, y: 0.7 },
      },
      {
        id: 'aileron_l', label: 'Aileron Left', function: 77,
        defaultOutput: 3, category: 'wing_left',
        diagramPos: { x: -0.8, y: -0.1 },
      },
      {
        id: 'aileron_r', label: 'Aileron Right', function: 77,
        defaultOutput: 4, category: 'wing_right',
        diagramPos: { x: 0.8, y: -0.1 },
      },
      {
        id: 'rudder', label: 'Rudder', function: 79,
        defaultOutput: 5, category: 'tail',
        diagramPos: { x: 0, y: -0.7 },
      },
    ],
  },

  twin_boom: {
    id: 'twin_boom',
    name: 'Twin Boom',
    description: 'Ailerons + twin-boom tail with twin rudders + elevator',
    diagramType: 'twin_boom',
    surfaces: [
      {
        id: 'aileron_l', label: 'Aileron Left', function: 77,
        defaultOutput: 1, category: 'wing_left',
        diagramPos: { x: -0.8, y: 0 },
      },
      {
        id: 'aileron_r', label: 'Aileron Right', function: 77,
        defaultOutput: 2, category: 'wing_right',
        diagramPos: { x: 0.8, y: 0 },
      },
      {
        id: 'elevator', label: 'Elevator', function: 78,
        defaultOutput: 3, category: 'tail',
        diagramPos: { x: 0, y: -0.85 },
      },
      {
        id: 'rudder_l', label: 'Rudder Left', function: 79,
        defaultOutput: 4, category: 'tail',
        diagramPos: { x: -0.3, y: -0.75 },
      },
      {
        id: 'rudder_r', label: 'Rudder Right', function: 79,
        defaultOutput: 5, category: 'tail',
        diagramPos: { x: 0.3, y: -0.75 },
      },
    ],
  },
};

// ============================================================
// MOTOR TEMPLATES
// ============================================================

export const MOTOR_TEMPLATES: Record<string, MotorTemplate> = {
  // --- Forward-only motors (planes) ---
  single_motor: {
    id: 'single_motor',
    name: 'Single Motor',
    description: 'One forward motor',
    forwardMotors: [
      {
        id: 'throttle', label: 'Throttle', function: 70,
        defaultOutput: 3, category: 'motor_front',
        diagramPos: { x: 0, y: 1 },
      },
    ],
    vtolMotors: [],
  },

  twin_motor: {
    id: 'twin_motor',
    name: 'Twin Motor',
    description: 'Left + right forward motors',
    forwardMotors: [
      {
        id: 'throttle_l', label: 'Throttle Left', function: 73,
        defaultOutput: 3, category: 'motor_front',
        diagramPos: { x: -0.5, y: 0.3 },
      },
      {
        id: 'throttle_r', label: 'Throttle Right', function: 74,
        defaultOutput: 6, category: 'motor_front',
        diagramPos: { x: 0.5, y: 0.3 },
      },
    ],
    vtolMotors: [],
  },

  // --- Copter-only motor layouts ---
  quad_x: {
    id: 'quad_x',
    name: 'Quad X',
    description: 'Quadcopter X configuration',
    frameClass: 1,
    frameType: 1,
    forwardMotors: [],
    vtolMotors: [
      { number: 1, x: 0.7, y: 0.7, rotation: 'CCW', function: 33, defaultOutput: 1 },
      { number: 2, x: -0.7, y: -0.7, rotation: 'CCW', function: 34, defaultOutput: 2 },
      { number: 3, x: 0.7, y: -0.7, rotation: 'CW', function: 35, defaultOutput: 3 },
      { number: 4, x: -0.7, y: 0.7, rotation: 'CW', function: 36, defaultOutput: 4 },
    ],
  },

  quad_plus: {
    id: 'quad_plus',
    name: 'Quad +',
    description: 'Quadcopter plus configuration',
    frameClass: 1,
    frameType: 0,
    forwardMotors: [],
    vtolMotors: [
      { number: 1, x: 0, y: 1, rotation: 'CCW', function: 33, defaultOutput: 1 },
      { number: 2, x: 1, y: 0, rotation: 'CW', function: 34, defaultOutput: 2 },
      { number: 3, x: 0, y: -1, rotation: 'CCW', function: 35, defaultOutput: 3 },
      { number: 4, x: -1, y: 0, rotation: 'CW', function: 36, defaultOutput: 4 },
    ],
  },

  quad_h: {
    id: 'quad_h',
    name: 'Quad H',
    description: 'Quadcopter H-frame',
    frameClass: 1,
    frameType: 3,
    forwardMotors: [],
    vtolMotors: [
      { number: 1, x: 0.7, y: 0.7, rotation: 'CCW', function: 33, defaultOutput: 1 },
      { number: 2, x: -0.7, y: -0.7, rotation: 'CCW', function: 34, defaultOutput: 2 },
      { number: 3, x: 0.7, y: -0.7, rotation: 'CW', function: 35, defaultOutput: 3 },
      { number: 4, x: -0.7, y: 0.7, rotation: 'CW', function: 36, defaultOutput: 4 },
    ],
  },

  quad_bf_x: {
    id: 'quad_bf_x',
    name: 'Quad BetaFlight X',
    description: 'BetaFlight motor order (M1=rear-left)',
    frameClass: 1,
    frameType: 12,
    forwardMotors: [],
    vtolMotors: [
      { number: 1, x: -0.7, y: -0.7, rotation: 'CW', function: 33, defaultOutput: 1 },
      { number: 2, x: -0.7, y: 0.7, rotation: 'CCW', function: 34, defaultOutput: 2 },
      { number: 3, x: 0.7, y: 0.7, rotation: 'CW', function: 35, defaultOutput: 3 },
      { number: 4, x: 0.7, y: -0.7, rotation: 'CCW', function: 36, defaultOutput: 4 },
    ],
  },

  hexa_x: {
    id: 'hexa_x',
    name: 'Hexa X',
    description: 'Hexacopter X configuration',
    frameClass: 2,
    frameType: 1,
    forwardMotors: [],
    vtolMotors: [
      { number: 1, x: 0.5, y: 0.87, rotation: 'CW', function: 33, defaultOutput: 1 },
      { number: 2, x: 1, y: 0, rotation: 'CCW', function: 34, defaultOutput: 2 },
      { number: 3, x: 0.5, y: -0.87, rotation: 'CW', function: 35, defaultOutput: 3 },
      { number: 4, x: -0.5, y: -0.87, rotation: 'CCW', function: 36, defaultOutput: 4 },
      { number: 5, x: -1, y: 0, rotation: 'CW', function: 37, defaultOutput: 5 },
      { number: 6, x: -0.5, y: 0.87, rotation: 'CCW', function: 38, defaultOutput: 6 },
    ],
  },

  hexa_plus: {
    id: 'hexa_plus',
    name: 'Hexa +',
    description: 'Hexacopter plus configuration',
    frameClass: 2,
    frameType: 0,
    forwardMotors: [],
    vtolMotors: [
      { number: 1, x: 0, y: 1, rotation: 'CW', function: 33, defaultOutput: 1 },
      { number: 2, x: 0.87, y: 0.5, rotation: 'CCW', function: 34, defaultOutput: 2 },
      { number: 3, x: 0.87, y: -0.5, rotation: 'CW', function: 35, defaultOutput: 3 },
      { number: 4, x: 0, y: -1, rotation: 'CCW', function: 36, defaultOutput: 4 },
      { number: 5, x: -0.87, y: -0.5, rotation: 'CW', function: 37, defaultOutput: 5 },
      { number: 6, x: -0.87, y: 0.5, rotation: 'CCW', function: 38, defaultOutput: 6 },
    ],
  },

  octa_x: {
    id: 'octa_x',
    name: 'Octa X',
    description: 'Octocopter X configuration',
    frameClass: 3,
    frameType: 1,
    forwardMotors: [],
    vtolMotors: [
      { number: 1, x: 0.38, y: 0.92, rotation: 'CW', function: 33, defaultOutput: 1 },
      { number: 2, x: 0.92, y: 0.38, rotation: 'CCW', function: 34, defaultOutput: 2 },
      { number: 3, x: 0.92, y: -0.38, rotation: 'CW', function: 35, defaultOutput: 3 },
      { number: 4, x: 0.38, y: -0.92, rotation: 'CCW', function: 36, defaultOutput: 4 },
      { number: 5, x: -0.38, y: -0.92, rotation: 'CW', function: 37, defaultOutput: 5 },
      { number: 6, x: -0.92, y: -0.38, rotation: 'CCW', function: 38, defaultOutput: 6 },
      { number: 7, x: -0.92, y: 0.38, rotation: 'CW', function: 39, defaultOutput: 7 },
      { number: 8, x: -0.38, y: 0.92, rotation: 'CCW', function: 40, defaultOutput: 8 },
    ],
  },

  y6: {
    id: 'y6',
    name: 'Y6',
    description: 'Y6 coaxial (3 arms, 6 motors)',
    frameClass: 5,
    frameType: 10,
    forwardMotors: [],
    vtolMotors: [
      { number: 1, x: 0.7, y: 0.7, rotation: 'CW', function: 33, defaultOutput: 1 },
      { number: 2, x: -0.7, y: 0.7, rotation: 'CCW', function: 34, defaultOutput: 2 },
      { number: 3, x: 0, y: -1, rotation: 'CW', function: 35, defaultOutput: 3 },
      { number: 4, x: 0.7, y: 0.7, rotation: 'CCW', function: 36, defaultOutput: 4 },
      { number: 5, x: -0.7, y: 0.7, rotation: 'CW', function: 37, defaultOutput: 5 },
      { number: 6, x: 0, y: -1, rotation: 'CCW', function: 38, defaultOutput: 6 },
    ],
  },

  tri: {
    id: 'tri',
    name: 'Tricopter',
    description: 'Three motors with yaw servo',
    frameClass: 7,
    frameType: 0,
    forwardMotors: [],
    vtolMotors: [
      { number: 1, x: 0.7, y: 0.7, rotation: 'CCW', function: 33, defaultOutput: 1 },
      { number: 2, x: -0.7, y: 0.7, rotation: 'CW', function: 34, defaultOutput: 2 },
      { number: 4, x: 0, y: -1, rotation: 'CW', function: 36, defaultOutput: 4 },
    ],
  },

  // --- VTOL motor layouts (used with plane templates) ---
  // These have Q_FRAME_CLASS/TYPE and motors start at higher output numbers
  vtol_quad_x: {
    id: 'vtol_quad_x',
    name: 'VTOL Quad X',
    description: 'Four VTOL motors in X layout',
    qFrameClass: 1,
    qFrameType: 1,
    forwardMotors: [
      {
        id: 'throttle', label: 'Forward Throttle', function: 70,
        defaultOutput: 3, category: 'motor_front',
        diagramPos: { x: 0, y: 1 },
      },
    ],
    vtolMotors: [
      { number: 1, x: 0.7, y: 0.5, rotation: 'CCW', function: 33, defaultOutput: 5 },
      { number: 2, x: -0.7, y: -0.5, rotation: 'CCW', function: 34, defaultOutput: 6 },
      { number: 3, x: 0.7, y: -0.5, rotation: 'CW', function: 35, defaultOutput: 7 },
      { number: 4, x: -0.7, y: 0.5, rotation: 'CW', function: 36, defaultOutput: 8 },
    ],
  },

  vtol_quad_plus: {
    id: 'vtol_quad_plus',
    name: 'VTOL Quad +',
    description: 'Four VTOL motors in + layout',
    qFrameClass: 1,
    qFrameType: 0,
    forwardMotors: [
      {
        id: 'throttle', label: 'Forward Throttle', function: 70,
        defaultOutput: 3, category: 'motor_front',
        diagramPos: { x: 0, y: 1 },
      },
    ],
    vtolMotors: [
      { number: 1, x: 0, y: 0.8, rotation: 'CCW', function: 33, defaultOutput: 5 },
      { number: 2, x: 0.8, y: 0, rotation: 'CW', function: 34, defaultOutput: 6 },
      { number: 3, x: 0, y: -0.8, rotation: 'CCW', function: 35, defaultOutput: 7 },
      { number: 4, x: -0.8, y: 0, rotation: 'CW', function: 36, defaultOutput: 8 },
    ],
  },

  vtol_hexa: {
    id: 'vtol_hexa',
    name: 'VTOL Hexa',
    description: 'Six VTOL motors',
    qFrameClass: 2,
    qFrameType: 1,
    forwardMotors: [
      {
        id: 'throttle', label: 'Forward Throttle', function: 70,
        defaultOutput: 3, category: 'motor_front',
        diagramPos: { x: 0, y: 1 },
      },
    ],
    vtolMotors: [
      { number: 1, x: 0.5, y: 0.7, rotation: 'CW', function: 33, defaultOutput: 5 },
      { number: 2, x: 1, y: 0, rotation: 'CCW', function: 34, defaultOutput: 6 },
      { number: 3, x: 0.5, y: -0.7, rotation: 'CW', function: 35, defaultOutput: 7 },
      { number: 4, x: -0.5, y: -0.7, rotation: 'CCW', function: 36, defaultOutput: 8 },
      { number: 5, x: -1, y: 0, rotation: 'CW', function: 37, defaultOutput: 9 },
      { number: 6, x: -0.5, y: 0.7, rotation: 'CCW', function: 38, defaultOutput: 10 },
    ],
  },

  vtol_tiltrotor_quad: {
    id: 'vtol_tiltrotor_quad',
    name: 'Tiltrotor Quad',
    description: 'Four tilting motors on wings (hover + forward)',
    qFrameClass: 1,
    qFrameType: 1,
    forwardMotors: [],
    vtolMotors: [
      { number: 1, x: -0.8, y: 0.1, rotation: 'CCW', function: 33, defaultOutput: 5 },
      { number: 2, x: 0.8, y: 0.1, rotation: 'CW', function: 34, defaultOutput: 6 },
      { number: 3, x: -0.8, y: 0.1, rotation: 'CW', function: 35, defaultOutput: 7 },
      { number: 4, x: 0.8, y: 0.1, rotation: 'CCW', function: 36, defaultOutput: 8 },
    ],
  },

  vtol_tiltrotor_tri: {
    id: 'vtol_tiltrotor_tri',
    name: 'Tiltrotor Tri',
    description: 'Three tilting motors -- two front, one rear',
    qFrameClass: 7,
    qFrameType: 0,
    forwardMotors: [],
    vtolMotors: [
      { number: 1, x: -0.7, y: 0.5, rotation: 'CCW', function: 33, defaultOutput: 5 },
      { number: 2, x: 0.7, y: 0.5, rotation: 'CW', function: 34, defaultOutput: 6 },
      { number: 3, x: 0, y: -0.8, rotation: 'CW', function: 35, defaultOutput: 7 },
    ],
  },

  vtol_tailsitter: {
    id: 'vtol_tailsitter',
    name: 'Tailsitter',
    description: 'Aircraft sits on tail, motors point up for hover',
    qFrameClass: 1,
    qFrameType: 1,
    forwardMotors: [],
    vtolMotors: [
      { number: 1, x: -0.6, y: 0, rotation: 'CCW', function: 33, defaultOutput: 1 },
      { number: 2, x: 0.6, y: 0, rotation: 'CW', function: 34, defaultOutput: 2 },
    ],
  },

  no_motor: {
    id: 'no_motor',
    name: 'No Motor (glider)',
    description: 'Unpowered glider',
    forwardMotors: [],
    vtolMotors: [],
  },
};

// ============================================================
// EXTRAS
// ============================================================

export const EXTRA_OPTIONS: Record<string, ExtraOption> = {
  flaps: {
    id: 'flaps',
    label: 'Flaps',
    description: 'Wing flaps for slow flight and landing',
    slots: [
      {
        id: 'flap_l', label: 'Flap Left', function: 84,
        defaultOutput: 5, category: 'wing_left',
        diagramPos: { x: -0.55, y: -0.05 },
      },
      {
        id: 'flap_r', label: 'Flap Right', function: 84,
        defaultOutput: 6, category: 'wing_right',
        diagramPos: { x: 0.55, y: -0.05 },
      },
    ],
  },

  flaperons: {
    id: 'flaperons',
    label: 'Flaperons',
    description: 'Ailerons that also act as flaps (replaces separate flaps)',
    slots: [
      {
        id: 'flaperon_l', label: 'Flaperon Left', function: 80,
        defaultOutput: 1, category: 'wing_left',
        diagramPos: { x: -0.75, y: 0 },
      },
      {
        id: 'flaperon_r', label: 'Flaperon Right', function: 81,
        defaultOutput: 2, category: 'wing_right',
        diagramPos: { x: 0.75, y: 0 },
      },
    ],
  },

  dual_aileron: {
    id: 'dual_aileron',
    label: 'Dual Ailerons',
    description: 'Two aileron servos per wing',
    slots: [
      {
        id: 'aileron_l2', label: 'Aileron Left Inner', function: 77,
        defaultOutput: 5, category: 'wing_left',
        diagramPos: { x: -0.5, y: 0 },
      },
      {
        id: 'aileron_r2', label: 'Aileron Right Inner', function: 77,
        defaultOutput: 6, category: 'wing_right',
        diagramPos: { x: 0.5, y: 0 },
      },
    ],
  },

  airbrakes: {
    id: 'airbrakes',
    label: 'Airbrakes',
    description: 'Spoilers / airbrakes for speed control',
    slots: [
      {
        id: 'airbrake', label: 'Airbrake', function: 106,
        defaultOutput: 7, category: 'other',
        diagramPos: { x: 0, y: 0.1 },
      },
    ],
  },

  retract_gear: {
    id: 'retract_gear',
    label: 'Retractable Gear',
    description: 'Retractable landing gear servo',
    slots: [
      {
        id: 'landing_gear', label: 'Landing Gear', function: 29,
        defaultOutput: 7, category: 'other',
        diagramPos: { x: 0, y: -0.2 },
      },
    ],
  },

  parachute: {
    id: 'parachute',
    label: 'Parachute',
    description: 'Parachute deployment servo',
    slots: [
      {
        id: 'parachute', label: 'Parachute', function: 21,
        defaultOutput: 9, category: 'other',
        diagramPos: { x: 0, y: -0.4 },
      },
    ],
  },

  gripper: {
    id: 'gripper',
    label: 'Gripper / Drop',
    description: 'Gripper or payload release mechanism',
    slots: [
      {
        id: 'gripper', label: 'Gripper', function: 19,
        defaultOutput: 10, category: 'other',
        diagramPos: { x: 0, y: -0.1 },
      },
    ],
  },

  gimbal_pan_tilt: {
    id: 'gimbal_pan_tilt',
    label: 'Camera Gimbal',
    description: 'Pan and tilt servos for camera mount',
    slots: [
      {
        id: 'gimbal_pan', label: 'Gimbal Pan', function: 6,
        defaultOutput: 9, category: 'other',
        diagramPos: { x: -0.2, y: 0.3 },
      },
      {
        id: 'gimbal_tilt', label: 'Gimbal Tilt', function: 7,
        defaultOutput: 10, category: 'other',
        diagramPos: { x: 0.2, y: 0.3 },
      },
    ],
  },

  yaw_servo: {
    id: 'yaw_servo',
    label: 'Yaw Servo (Tricopter)',
    description: 'Tail yaw tilt servo for tricopter',
    slots: [
      {
        id: 'yaw_servo', label: 'Yaw Servo', function: 39,
        defaultOutput: 7, category: 'other',
        diagramPos: { x: 0, y: -1 },
      },
    ],
  },
};

// ============================================================
// AIRFRAME PRESETS -- complete configurations
// ============================================================

export const AIRFRAME_PRESETS: AirframePreset[] = [
  // ---- PLANES ----
  {
    id: 'plane_conventional',
    name: 'Conventional',
    description: '4-channel: aileron, elevator, rudder, throttle',
    category: 'plane',
    icon: 'conventional',
    planeTemplate: PLANE_TEMPLATES.conventional,
    motorTemplate: MOTOR_TEMPLATES.single_motor,
    availableExtras: ['flaps', 'flaperons', 'dual_aileron', 'airbrakes', 'retract_gear', 'parachute', 'gripper', 'gimbal_pan_tilt'],
  },
  {
    id: 'plane_flying_wing',
    name: 'Flying Wing',
    description: '2 elevons + throttle, no tail',
    category: 'plane',
    icon: 'flying_wing',
    planeTemplate: PLANE_TEMPLATES.flying_wing,
    motorTemplate: MOTOR_TEMPLATES.single_motor,
    availableExtras: ['airbrakes', 'retract_gear', 'parachute', 'gripper', 'gimbal_pan_tilt'],
  },
  {
    id: 'plane_vtail',
    name: 'V-Tail',
    description: 'Ailerons + V-tail mixing + throttle',
    category: 'plane',
    icon: 'vtail',
    planeTemplate: PLANE_TEMPLATES.vtail,
    motorTemplate: MOTOR_TEMPLATES.single_motor,
    availableExtras: ['flaps', 'flaperons', 'dual_aileron', 'airbrakes', 'retract_gear', 'parachute', 'gripper', 'gimbal_pan_tilt'],
  },
  {
    id: 'plane_atail',
    name: 'A-Tail',
    description: 'Ailerons + inverted V-tail + throttle',
    category: 'plane',
    icon: 'atail',
    planeTemplate: PLANE_TEMPLATES.atail,
    motorTemplate: MOTOR_TEMPLATES.single_motor,
    availableExtras: ['flaps', 'dual_aileron', 'airbrakes', 'retract_gear'],
  },
  {
    id: 'plane_twin',
    name: 'Twin Motor',
    description: 'Conventional surfaces + dual motors',
    category: 'plane',
    icon: 'twin_motor',
    planeTemplate: PLANE_TEMPLATES.conventional,
    motorTemplate: MOTOR_TEMPLATES.twin_motor,
    availableExtras: ['flaps', 'flaperons', 'dual_aileron', 'airbrakes', 'retract_gear', 'parachute', 'gripper', 'gimbal_pan_tilt'],
  },
  {
    id: 'plane_flying_wing_twin',
    name: 'Flying Wing Twin',
    description: '2 elevons + dual motors',
    category: 'plane',
    icon: 'flying_wing_twin',
    planeTemplate: PLANE_TEMPLATES.flying_wing,
    motorTemplate: MOTOR_TEMPLATES.twin_motor,
    availableExtras: ['airbrakes', 'retract_gear', 'gripper', 'gimbal_pan_tilt'],
  },
  {
    id: 'plane_canard',
    name: 'Canard',
    description: 'Forward canards + rear ailerons + rudder',
    category: 'plane',
    icon: 'canard',
    planeTemplate: PLANE_TEMPLATES.canard,
    motorTemplate: MOTOR_TEMPLATES.single_motor,
    availableExtras: ['flaps', 'airbrakes', 'retract_gear'],
  },
  {
    id: 'plane_glider',
    name: 'Glider',
    description: 'Unpowered sailplane with conventional surfaces',
    category: 'plane',
    icon: 'glider',
    planeTemplate: PLANE_TEMPLATES.conventional,
    motorTemplate: MOTOR_TEMPLATES.no_motor,
    availableExtras: ['flaps', 'flaperons', 'airbrakes', 'retract_gear'],
  },

  // ---- COPTERS ----
  {
    id: 'copter_quad_x',
    name: 'Quad X',
    description: 'Standard quadcopter, X layout',
    category: 'copter',
    icon: 'quad_x',
    planeTemplate: null,
    motorTemplate: MOTOR_TEMPLATES.quad_x,
    availableExtras: ['parachute', 'gripper', 'gimbal_pan_tilt'],
    additionalParams: { FRAME_CLASS: 1, FRAME_TYPE: 1 },
  },
  {
    id: 'copter_quad_plus',
    name: 'Quad +',
    description: 'Quadcopter, plus layout',
    category: 'copter',
    icon: 'quad_plus',
    planeTemplate: null,
    motorTemplate: MOTOR_TEMPLATES.quad_plus,
    availableExtras: ['parachute', 'gripper', 'gimbal_pan_tilt'],
    additionalParams: { FRAME_CLASS: 1, FRAME_TYPE: 0 },
  },
  {
    id: 'copter_quad_h',
    name: 'Quad H',
    description: 'Quadcopter, H-frame (long body)',
    category: 'copter',
    icon: 'quad_h',
    planeTemplate: null,
    motorTemplate: MOTOR_TEMPLATES.quad_h,
    availableExtras: ['parachute', 'gripper', 'gimbal_pan_tilt'],
    additionalParams: { FRAME_CLASS: 1, FRAME_TYPE: 3 },
  },
  {
    id: 'copter_quad_bf',
    name: 'Quad BetaFlight X',
    description: 'BetaFlight motor numbering',
    category: 'copter',
    icon: 'quad_bf_x',
    planeTemplate: null,
    motorTemplate: MOTOR_TEMPLATES.quad_bf_x,
    availableExtras: ['parachute', 'gripper'],
    additionalParams: { FRAME_CLASS: 1, FRAME_TYPE: 12 },
  },
  {
    id: 'copter_hexa_x',
    name: 'Hexa X',
    description: 'Hexacopter, X layout',
    category: 'copter',
    icon: 'hexa_x',
    planeTemplate: null,
    motorTemplate: MOTOR_TEMPLATES.hexa_x,
    availableExtras: ['parachute', 'gripper', 'gimbal_pan_tilt'],
    additionalParams: { FRAME_CLASS: 2, FRAME_TYPE: 1 },
  },
  {
    id: 'copter_hexa_plus',
    name: 'Hexa +',
    description: 'Hexacopter, plus layout',
    category: 'copter',
    icon: 'hexa_plus',
    planeTemplate: null,
    motorTemplate: MOTOR_TEMPLATES.hexa_plus,
    availableExtras: ['parachute', 'gripper', 'gimbal_pan_tilt'],
    additionalParams: { FRAME_CLASS: 2, FRAME_TYPE: 0 },
  },
  {
    id: 'copter_octa_x',
    name: 'Octa X',
    description: 'Octocopter, X layout',
    category: 'copter',
    icon: 'octa_x',
    planeTemplate: null,
    motorTemplate: MOTOR_TEMPLATES.octa_x,
    availableExtras: ['parachute', 'gripper', 'gimbal_pan_tilt'],
    additionalParams: { FRAME_CLASS: 3, FRAME_TYPE: 1 },
  },
  {
    id: 'copter_y6',
    name: 'Y6',
    description: 'Y6 coaxial -- 3 arms, 6 motors',
    category: 'copter',
    icon: 'y6',
    planeTemplate: null,
    motorTemplate: MOTOR_TEMPLATES.y6,
    availableExtras: ['parachute', 'gripper', 'gimbal_pan_tilt'],
    additionalParams: { FRAME_CLASS: 5, FRAME_TYPE: 10 },
  },
  {
    id: 'copter_tri',
    name: 'Tricopter',
    description: '3 motors + rear yaw servo',
    category: 'copter',
    icon: 'tri',
    planeTemplate: null,
    motorTemplate: MOTOR_TEMPLATES.tri,
    availableExtras: ['yaw_servo', 'parachute', 'gripper', 'gimbal_pan_tilt'],
    additionalParams: { FRAME_CLASS: 7, FRAME_TYPE: 0 },
  },

  // ---- VTOL / QuadPlane ----
  {
    id: 'vtol_quad_conventional',
    name: 'QuadPlane',
    description: 'Conventional plane + 4 VTOL motors',
    category: 'vtol',
    icon: 'vtol_quad',
    planeTemplate: PLANE_TEMPLATES.conventional,
    motorTemplate: MOTOR_TEMPLATES.vtol_quad_x,
    availableExtras: ['flaps', 'flaperons', 'airbrakes', 'retract_gear', 'parachute', 'gimbal_pan_tilt'],
    additionalParams: { Q_ENABLE: 1, Q_FRAME_CLASS: 1, Q_FRAME_TYPE: 1 },
  },
  {
    id: 'vtol_quad_flying_wing',
    name: 'QuadPlane Flying Wing',
    description: 'Flying wing + 4 VTOL motors',
    category: 'vtol',
    icon: 'vtol_fw',
    planeTemplate: PLANE_TEMPLATES.flying_wing,
    motorTemplate: MOTOR_TEMPLATES.vtol_quad_x,
    availableExtras: ['airbrakes', 'retract_gear', 'parachute', 'gimbal_pan_tilt'],
    additionalParams: { Q_ENABLE: 1, Q_FRAME_CLASS: 1, Q_FRAME_TYPE: 1 },
  },
  {
    id: 'vtol_quad_vtail',
    name: 'QuadPlane V-Tail',
    description: 'V-tail plane + 4 VTOL motors',
    category: 'vtol',
    icon: 'vtol_vtail',
    planeTemplate: PLANE_TEMPLATES.vtail,
    motorTemplate: MOTOR_TEMPLATES.vtol_quad_x,
    availableExtras: ['flaps', 'airbrakes', 'retract_gear', 'parachute'],
    additionalParams: { Q_ENABLE: 1, Q_FRAME_CLASS: 1, Q_FRAME_TYPE: 1 },
  },
  {
    id: 'vtol_hexa_conventional',
    name: 'HexaPlane',
    description: 'Conventional plane + 6 VTOL motors',
    category: 'vtol',
    icon: 'vtol_hexa',
    planeTemplate: PLANE_TEMPLATES.conventional,
    motorTemplate: MOTOR_TEMPLATES.vtol_hexa,
    availableExtras: ['flaps', 'airbrakes', 'retract_gear', 'parachute'],
    additionalParams: { Q_ENABLE: 1, Q_FRAME_CLASS: 2, Q_FRAME_TYPE: 1 },
  },
  {
    id: 'vtol_tiltrotor_quad',
    name: 'Tiltrotor Quad',
    description: 'Conventional plane + 4 tilting motors',
    category: 'vtol',
    icon: 'vtol_tiltrotor',
    planeTemplate: PLANE_TEMPLATES.conventional,
    motorTemplate: MOTOR_TEMPLATES.vtol_tiltrotor_quad,
    availableExtras: ['flaps', 'airbrakes', 'retract_gear'],
    additionalParams: {
      Q_ENABLE: 1, Q_FRAME_CLASS: 1, Q_FRAME_TYPE: 1,
      Q_TILT_ENABLE: 1,
    },
  },
  {
    id: 'vtol_fw_tri_tilt',
    name: 'Flying Wing Tri Tilt',
    description: 'Flying wing + 3 tilting motors (2 front, 1 rear)',
    category: 'vtol',
    icon: 'vtol_fw_tri',
    planeTemplate: PLANE_TEMPLATES.flying_wing,
    motorTemplate: MOTOR_TEMPLATES.vtol_tiltrotor_tri,
    availableExtras: ['airbrakes', 'retract_gear'],
    additionalParams: {
      Q_ENABLE: 1, Q_FRAME_CLASS: 7, Q_FRAME_TYPE: 0,
      Q_TILT_ENABLE: 1,
    },
  },
  {
    id: 'vtol_conv_tri_tilt',
    name: 'Conventional Tri Tilt',
    description: 'Conventional plane + 3 tilting motors',
    category: 'vtol',
    icon: 'vtol_tri_tilt',
    planeTemplate: PLANE_TEMPLATES.conventional,
    motorTemplate: MOTOR_TEMPLATES.vtol_tiltrotor_tri,
    availableExtras: ['flaps', 'airbrakes', 'retract_gear'],
    additionalParams: {
      Q_ENABLE: 1, Q_FRAME_CLASS: 7, Q_FRAME_TYPE: 0,
      Q_TILT_ENABLE: 1,
    },
  },
  {
    id: 'vtol_tailsitter',
    name: 'Tailsitter',
    description: 'Flying wing that hovers vertically on its tail',
    category: 'vtol',
    icon: 'vtol_tailsitter',
    planeTemplate: PLANE_TEMPLATES.flying_wing,
    motorTemplate: MOTOR_TEMPLATES.vtol_tailsitter,
    availableExtras: [],
    additionalParams: {
      Q_ENABLE: 1, Q_FRAME_CLASS: 1, Q_FRAME_TYPE: 1,
      Q_TAILSIT_ENABLE: 1,
    },
  },
];

// ============================================================
// Helper: get presets by category
// ============================================================

export function getPresetsByCategory(category: 'plane' | 'copter' | 'vtol'): AirframePreset[] {
  return AIRFRAME_PRESETS.filter((p) => p.category === category);
}

/**
 * Build the full list of servo assignments for a preset + selected extras.
 * Returns a map of SERVO output (1-based) → SERVOx_FUNCTION value.
 */
export function buildServoAssignments(
  preset: AirframePreset,
  selectedExtras: string[],
  /** User overrides: slot ID → output number */
  outputOverrides?: Map<string, number>
): Map<string, number> {
  const result = new Map<string, number>(); // param name → value

  // Gather all slots
  const allSlots: ServoSlot[] = [];

  // Plane surfaces
  if (preset.planeTemplate) {
    allSlots.push(...preset.planeTemplate.surfaces);
  }

  // Forward motors
  allSlots.push(...preset.motorTemplate.forwardMotors);

  // Extras
  for (const extraId of selectedExtras) {
    const extra = EXTRA_OPTIONS[extraId];
    if (extra) allSlots.push(...extra.slots);
  }

  // Apply servo slots
  for (const slot of allSlots) {
    const output = outputOverrides?.get(slot.id) ?? slot.defaultOutput;
    result.set(`SERVO${output}_FUNCTION`, slot.function);
  }

  // VTOL motors
  for (const motor of preset.motorTemplate.vtolMotors) {
    const output = outputOverrides?.get(`vtol_motor_${motor.number}`) ?? motor.defaultOutput;
    result.set(`SERVO${output}_FUNCTION`, motor.function);
  }

  // Additional params (FRAME_CLASS, Q_ENABLE, etc.)
  if (preset.additionalParams) {
    for (const [key, value] of Object.entries(preset.additionalParams)) {
      result.set(key, value);
    }
  }

  return result;
}
