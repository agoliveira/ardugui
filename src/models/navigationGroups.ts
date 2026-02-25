/**
 * Navigation page parameter definitions.
 *
 * Covers RTL, loiter, waypoint, landing, and position hold parameters.
 * Copter and Plane have very different parameter sets.
 */

import type { ParamGroup } from './configGroups';
import type { VehicleType } from '@/store/vehicleStore';

// ─── Copter Navigation ──────────────────────────────────────────────────────

const copterRtl: ParamGroup = {
  id: 'copter-rtl',
  title: 'Return to Launch (RTL)',
  description: 'Altitude, speed, and behavior when returning home.',
  icon: 'Home',
  fields: [
    {
      param: 'RTL_ALT',
      label: 'RTL Altitude',
      description: 'Target altitude for RTL (0 = maintain current altitude)',
      type: 'number',
      min: 0,
      max: 8000,
      step: 100,
      unit: 'cm',
    },
    {
      param: 'RTL_ALT_FINAL',
      label: 'RTL Final Altitude',
      description: 'Altitude to descend to before landing at home (0 = land immediately)',
      type: 'number',
      min: 0,
      max: 8000,
      step: 100,
      unit: 'cm',
    },
    {
      param: 'RTL_SPEED',
      label: 'RTL Speed',
      description: 'Horizontal speed during RTL (0 = use WPNAV_SPEED)',
      type: 'number',
      min: 0,
      max: 2000,
      step: 50,
      unit: 'cm/s',
    },
    {
      param: 'RTL_CLIMB_MIN',
      label: 'RTL Minimum Climb',
      description: 'Minimum altitude gain before heading home',
      type: 'number',
      min: 0,
      max: 3000,
      step: 100,
      unit: 'cm',
    },
    {
      param: 'RTL_LOIT_TIME',
      label: 'RTL Loiter Time',
      description: 'Time to loiter above home before descending',
      type: 'number',
      min: 0,
      max: 60000,
      step: 1000,
      unit: 'ms',
    },
    {
      param: 'RTL_CONE_SLOPE',
      label: 'RTL Cone Slope',
      description: 'Slope of altitude cone near home (0 = disabled, 3 = steep)',
      type: 'number',
      min: 0,
      max: 10,
      step: 0.5,
    },
  ],
};

const copterWpNav: ParamGroup = {
  id: 'copter-wpnav',
  title: 'Waypoint Navigation',
  description: 'Speed and accuracy settings for waypoint missions.',
  icon: 'Route',
  fields: [
    {
      param: 'WPNAV_SPEED',
      label: 'Horizontal Speed',
      description: 'Default horizontal speed between waypoints',
      type: 'number',
      min: 20,
      max: 3000,
      step: 50,
      unit: 'cm/s',
    },
    {
      param: 'WPNAV_SPEED_UP',
      label: 'Climb Speed',
      description: 'Speed when ascending between waypoints',
      type: 'number',
      min: 10,
      max: 1000,
      step: 10,
      unit: 'cm/s',
    },
    {
      param: 'WPNAV_SPEED_DN',
      label: 'Descent Speed',
      description: 'Speed when descending between waypoints',
      type: 'number',
      min: 10,
      max: 500,
      step: 10,
      unit: 'cm/s',
    },
    {
      param: 'WPNAV_RADIUS',
      label: 'Waypoint Radius',
      description: 'Distance from waypoint to consider it reached',
      type: 'number',
      min: 10,
      max: 1000,
      step: 10,
      unit: 'cm',
    },
    {
      param: 'WPNAV_ACCEL',
      label: 'Horizontal Acceleration',
      description: 'Maximum horizontal acceleration',
      type: 'number',
      min: 50,
      max: 500,
      step: 10,
      unit: 'cm/s²',
    },
    {
      param: 'WPNAV_ACCEL_Z',
      label: 'Vertical Acceleration',
      description: 'Maximum vertical acceleration',
      type: 'number',
      min: 50,
      max: 500,
      step: 10,
      unit: 'cm/s²',
    },
  ],
};

const copterLoiter: ParamGroup = {
  id: 'copter-loiter',
  title: 'Loiter / Position Hold',
  description: 'Behavior when holding position.',
  icon: 'Circle',
  fields: [
    {
      param: 'LOIT_SPEED',
      label: 'Loiter Speed',
      description: 'Maximum horizontal speed in loiter mode',
      type: 'number',
      min: 20,
      max: 3000,
      step: 50,
      unit: 'cm/s',
    },
    {
      param: 'LOIT_ACC_MAX',
      label: 'Max Acceleration',
      description: 'Maximum acceleration in loiter mode',
      type: 'number',
      min: 50,
      max: 1000,
      step: 50,
      unit: 'cm/s²',
    },
    {
      param: 'LOIT_BRK_JERK',
      label: 'Brake Jerk',
      description: 'Jerk limit when braking in loiter (higher = more abrupt)',
      type: 'number',
      min: 0.5,
      max: 50,
      step: 0.5,
      unit: 'cm/s³',
    },
    {
      param: 'LOIT_BRK_ACCEL',
      label: 'Brake Acceleration',
      description: 'Maximum deceleration when braking',
      type: 'number',
      min: 50,
      max: 1000,
      step: 50,
      unit: 'cm/s²',
    },
    {
      param: 'LOIT_BRK_DELAY',
      label: 'Brake Delay',
      description: 'Delay before braking begins after stick release',
      type: 'number',
      min: 0,
      max: 2,
      step: 0.1,
      unit: 's',
    },
  ],
};

const copterLanding: ParamGroup = {
  id: 'copter-land',
  title: 'Landing',
  description: 'Descent speed and behavior during landing.',
  icon: 'ArrowDown',
  fields: [
    {
      param: 'LAND_SPEED',
      label: 'Final Descent Speed',
      description: 'Descent speed below LAND_ALT_LOW',
      type: 'number',
      min: 10,
      max: 200,
      step: 10,
      unit: 'cm/s',
    },
    {
      param: 'LAND_SPEED_HIGH',
      label: 'Initial Descent Speed',
      description: 'Descent speed above LAND_ALT_LOW (0 = use WPNAV_SPEED_DN)',
      type: 'number',
      min: 0,
      max: 500,
      step: 10,
      unit: 'cm/s',
    },
    {
      param: 'LAND_ALT_LOW',
      label: 'Slow Down Altitude',
      description: 'Altitude at which descent slows to LAND_SPEED',
      type: 'number',
      min: 100,
      max: 5000,
      step: 100,
      unit: 'cm',
    },
    {
      param: 'LAND_REPOSITION',
      label: 'Allow Repositioning',
      description: 'Allow pilot to reposition during landing',
      type: 'select',
      options: [
        { value: 0, label: 'Disabled' },
        { value: 1, label: 'Enabled' },
      ],
    },
  ],
};

// ─── Plane Navigation ────────────────────────────────────────────────────────

const planeRtl: ParamGroup = {
  id: 'plane-rtl',
  title: 'Return to Launch (RTL)',
  description: 'Altitude and loiter behavior when returning home.',
  icon: 'Home',
  fields: [
    {
      param: 'RTL_ALTITUDE',
      label: 'RTL Altitude',
      description: 'Target altitude during RTL (cm, -1 = maintain current)',
      type: 'number',
      min: -1,
      max: 100000,
      step: 100,
      unit: 'cm',
    },
    {
      param: 'WP_LOITER_RAD',
      label: 'Loiter Radius',
      description: 'Radius for loiter circles over home (negative = counter-clockwise)',
      type: 'number',
      min: -500,
      max: 500,
      step: 5,
      unit: 'm',
    },
    {
      param: 'RTL_RADIUS',
      label: 'RTL Loiter Radius',
      description: 'Loiter radius when RTL arrives at home (0 = use WP_LOITER_RAD)',
      type: 'number',
      min: -500,
      max: 500,
      step: 5,
      unit: 'm',
    },
    {
      param: 'RTL_AUTOLAND',
      label: 'RTL Auto Land',
      description: 'Automatically begin landing sequence on RTL',
      type: 'select',
      options: [
        { value: 0, label: 'Disabled' },
        { value: 1, label: 'On RTL' },
        { value: 2, label: 'On failsafe RTL' },
      ],
    },
  ],
};

const planeWaypoints: ParamGroup = {
  id: 'plane-wp',
  title: 'Waypoint Navigation',
  description: 'Speed, radius, and L1 controller settings.',
  icon: 'Route',
  fields: [
    {
      param: 'WP_RADIUS',
      label: 'Waypoint Radius',
      description: 'Distance from waypoint to consider it reached',
      type: 'number',
      min: 1,
      max: 500,
      step: 1,
      unit: 'm',
    },
    {
      param: 'WP_MAX_RADIUS',
      label: 'Max Loiter Radius',
      description: 'Maximum radius for loiter-to-alt commands',
      type: 'number',
      min: 0,
      max: 2000,
      step: 10,
      unit: 'm',
    },
    {
      param: 'NAVL1_PERIOD',
      label: 'L1 Period',
      description: 'L1 navigation period (lower = tighter tracking)',
      type: 'number',
      min: 5,
      max: 35,
      step: 1,
      unit: 's',
    },
    {
      param: 'NAVL1_DAMPING',
      label: 'L1 Damping',
      description: 'L1 navigation damping ratio',
      type: 'number',
      min: 0.6,
      max: 1,
      step: 0.01,
    },
  ],
};

const planeSpeeds: ParamGroup = {
  id: 'plane-speeds',
  title: 'Airspeed Limits',
  description: 'Cruise, min, and max airspeed settings.',
  icon: 'Gauge',
  fields: [
    {
      param: 'AIRSPEED_CRUISE',
      label: 'Cruise Airspeed',
      description: 'Target airspeed in auto modes',
      type: 'number',
      min: 0,
      max: 100,
      step: 1,
      unit: 'm/s',
    },
    {
      param: 'AIRSPEED_MIN',
      label: 'Min Airspeed',
      description: 'Minimum airspeed in FBWB and auto modes',
      type: 'number',
      min: 0,
      max: 100,
      step: 1,
      unit: 'm/s',
    },
    {
      param: 'AIRSPEED_MAX',
      label: 'Max Airspeed',
      description: 'Maximum airspeed in FBWB and auto modes',
      type: 'number',
      min: 0,
      max: 100,
      step: 1,
      unit: 'm/s',
    },
  ],
};

const planeLanding: ParamGroup = {
  id: 'plane-land',
  title: 'Auto Landing',
  description: 'Approach and flare settings for automatic landing.',
  icon: 'ArrowDown',
  fields: [
    {
      param: 'TECS_LAND_ARSPD',
      label: 'Approach Airspeed',
      description: 'Target airspeed during landing approach (-1 = disabled)',
      type: 'number',
      min: -1,
      max: 100,
      step: 1,
      unit: 'm/s',
    },
    {
      param: 'TECS_LAND_SPDWGT',
      label: 'Landing Speed Weight',
      description: 'Speed vs height priority during landing approach',
      type: 'number',
      min: 0,
      max: 2,
      step: 0.1,
    },
    {
      param: 'LAND_FLARE_ALT',
      label: 'Flare Altitude',
      description: 'Height at which the plane starts to flare',
      type: 'number',
      min: 0,
      max: 30,
      step: 0.5,
      unit: 'm',
    },
    {
      param: 'LAND_FLARE_SEC',
      label: 'Flare Time',
      description: 'Seconds before touchdown to begin flare (time-based trigger)',
      type: 'number',
      min: 0,
      max: 10,
      step: 0.1,
      unit: 's',
    },
    {
      param: 'LAND_PITCH_CD',
      label: 'Landing Pitch',
      description: 'Pitch angle during final flare (centidegrees)',
      type: 'number',
      min: -500,
      max: 2000,
      step: 100,
      unit: 'cdeg',
    },
  ],
};

// ─── QuadPlane VTOL Navigation ───────────────────────────────────────────────

const qpVtolNav: ParamGroup = {
  id: 'qp-vtol-nav',
  title: 'VTOL Navigation',
  description: 'QuadPlane VTOL-specific navigation settings.',
  icon: 'ArrowRightLeft',
  fields: [
    {
      param: 'Q_RTL_ALT',
      label: 'VTOL RTL Altitude',
      description: 'Altitude for QRTL mode (cm)',
      type: 'number',
      min: 0,
      max: 8000,
      step: 100,
      unit: 'cm',
    },
    {
      param: 'Q_RTL_MODE',
      label: 'VTOL RTL Mode',
      description: 'How QuadPlane returns home',
      type: 'select',
      options: [
        { value: 0, label: 'Fly as plane then VTOL land' },
        { value: 1, label: 'VTOL the entire way' },
        { value: 2, label: 'Fly as plane, VTOL to land' },
        { value: 3, label: 'Closest of 0 or 1' },
      ],
    },
    {
      param: 'Q_WP_SPEED',
      label: 'VTOL WP Speed',
      description: 'Horizontal speed in VTOL waypoint navigation (cm/s)',
      type: 'number',
      min: 0,
      max: 2000,
      step: 50,
      unit: 'cm/s',
    },
    {
      param: 'Q_WP_SPEED_UP',
      label: 'VTOL Climb Speed',
      description: 'Vertical climb speed in VTOL modes (cm/s)',
      type: 'number',
      min: 0,
      max: 500,
      step: 10,
      unit: 'cm/s',
    },
    {
      param: 'Q_WP_SPEED_DN',
      label: 'VTOL Descent Speed',
      description: 'Vertical descent speed in VTOL modes (cm/s)',
      type: 'number',
      min: 0,
      max: 500,
      step: 10,
      unit: 'cm/s',
    },
    {
      param: 'Q_LAND_SPEED',
      label: 'VTOL Land Speed',
      description: 'Final descent speed during VTOL landing (cm/s)',
      type: 'number',
      min: 10,
      max: 200,
      step: 10,
      unit: 'cm/s',
    },
  ],
};

// ─── Public API ──────────────────────────────────────────────────────────────

export function getNavigationGroups(vehicleType: VehicleType): ParamGroup[] {
  switch (vehicleType) {
    case 'copter':
      return [copterRtl, copterWpNav, copterLoiter, copterLanding];
    case 'plane':
      return [planeRtl, planeWaypoints, planeSpeeds, planeLanding];
    case 'quadplane':
      return [planeRtl, planeWaypoints, planeSpeeds, planeLanding, qpVtolNav];
    default:
      return [];
  }
}
