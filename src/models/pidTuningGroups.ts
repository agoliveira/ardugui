/**
 * PID Tuning page parameter definitions.
 *
 * Param names verified against ArduPilot source code:
 *  - Copter: ATC_RAT_RLL/PIT/YAW_* for rate PIDs, ATC_ANG_RLL/PIT/YAW_P for angle P
 *  - Plane: RLL_RATE_* / PTCH_RATE_* for rate PIDs (modern naming, group prefix RLL/PTCH)
 *           RLL2SRV_TCONST/RMAX and PTCH2SRV_* for outer loop limits
 *           YAW2SRV_* for yaw controller, YAW_RATE_* for optional rate controller
 *  - QuadPlane: Plane sections + Q_A_RAT_RLL/PIT/YAW_* for VTOL rate PIDs
 *
 * Source: libraries/APM_Control/AP_RollController.cpp, AP_PitchController.cpp,
 *         AP_YawController.cpp, libraries/AC_AttitudeControl/AC_AttitudeControl_Multi.cpp
 */

import type { VehicleType } from '@/store/vehicleStore';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PidParam {
  param: string;
  label: string;
  description?: string;
  min: number;
  max: number;
  step: number;
}

export interface PidAxis {
  title: string;
  params: PidParam[];
}

export interface PidSection {
  id: string;
  title: string;
  description: string;
  axes?: PidAxis[];
  params?: PidParam[];
}

// ─── Copter Rate PID (ATC_RAT_xxx) ──────────────────────────────────────────

function copterRatePid(prefix: string): PidParam[] {
  return [
    { param: `${prefix}_P`, label: 'P', description: 'Proportional gain', min: 0, max: 2, step: 0.001 },
    { param: `${prefix}_I`, label: 'I', description: 'Integral gain', min: 0, max: 2, step: 0.001 },
    { param: `${prefix}_IMAX`, label: 'I Max', description: 'Integrator maximum', min: 0, max: 1, step: 0.01 },
    { param: `${prefix}_D`, label: 'D', description: 'Derivative gain', min: 0, max: 0.2, step: 0.0001 },
    { param: `${prefix}_FF`, label: 'FF', description: 'Feed-forward gain', min: 0, max: 1, step: 0.001 },
    { param: `${prefix}_FLTT`, label: 'Target Filter', description: 'Target low-pass filter frequency (Hz)', min: 0, max: 200, step: 1 },
    { param: `${prefix}_FLTD`, label: 'D-term Filter', description: 'D-term low-pass filter frequency (Hz)', min: 0, max: 200, step: 1 },
    { param: `${prefix}_FLTE`, label: 'Error Filter', description: 'Error low-pass filter frequency (Hz)', min: 0, max: 200, step: 1 },
    { param: `${prefix}_SMAX`, label: 'Slew Max', description: 'Slew rate limit for output (0 = disabled)', min: 0, max: 200, step: 1 },
  ];
}

const copterRateSection: PidSection = {
  id: 'copter-rate',
  title: 'Rate PID',
  description: 'Inner loop rate controller -- controls angular velocity.',
  axes: [
    { title: 'Roll', params: copterRatePid('ATC_RAT_RLL') },
    { title: 'Pitch', params: copterRatePid('ATC_RAT_PIT') },
    { title: 'Yaw', params: copterRatePid('ATC_RAT_YAW') },
  ],
};

const copterStabilizeSection: PidSection = {
  id: 'copter-stabilize',
  title: 'Stabilize (Angle)',
  description: 'Outer loop angle controller -- converts desired angle to rate demand.',
  axes: [
    {
      title: 'Roll',
      params: [
        { param: 'ATC_ANG_RLL_P', label: 'P', description: 'Angle P gain (rate demand per degree error)', min: 0, max: 20, step: 0.1 },
      ],
    },
    {
      title: 'Pitch',
      params: [
        { param: 'ATC_ANG_PIT_P', label: 'P', description: 'Angle P gain', min: 0, max: 20, step: 0.1 },
      ],
    },
    {
      title: 'Yaw',
      params: [
        { param: 'ATC_ANG_YAW_P', label: 'P', description: 'Angle P gain', min: 0, max: 20, step: 0.1 },
      ],
    },
  ],
};

const copterFiltersSection: PidSection = {
  id: 'copter-filters',
  title: 'Filters',
  description: 'Gyro and accelerometer low-pass filter frequencies.',
  params: [
    { param: 'INS_GYRO_FILTER', label: 'Gyro Filter', description: 'Primary gyro low-pass filter cutoff (Hz)', min: 1, max: 256, step: 1 },
    { param: 'INS_ACCEL_FILTER', label: 'Accel Filter', description: 'Accelerometer low-pass filter cutoff (Hz)', min: 1, max: 256, step: 1 },
    { param: 'ATC_INPUT_TC', label: 'Input Time Constant', description: 'Pilot input smoothing (lower = sharper)', min: 0, max: 1, step: 0.01 },
    { param: 'ATC_RATE_FF_ENAB', label: 'Rate FF Enable', description: 'Enable rate feed-forward', min: 0, max: 1, step: 1 },
  ],
};

// ─── Plane Rate PIDs (RLL_RATE_*, PTCH_RATE_*) ──────────────────────────────

function planeRatePid(prefix: string): PidParam[] {
  return [
    { param: `${prefix}_P`, label: 'P', description: 'Proportional gain', min: 0, max: 1, step: 0.005 },
    { param: `${prefix}_I`, label: 'I', description: 'Integral gain', min: 0, max: 1, step: 0.01 },
    { param: `${prefix}_IMAX`, label: 'I Max', description: 'Integrator maximum', min: 0, max: 1, step: 0.01 },
    { param: `${prefix}_D`, label: 'D', description: 'Derivative gain', min: 0, max: 0.2, step: 0.001 },
    { param: `${prefix}_FF`, label: 'FF', description: 'Feed-forward gain', min: 0, max: 2, step: 0.01 },
    { param: `${prefix}_FLTT`, label: 'Target Filter', description: 'Target low-pass filter frequency (Hz)', min: 0, max: 200, step: 1 },
    { param: `${prefix}_FLTD`, label: 'D-term Filter', description: 'D-term low-pass filter frequency (Hz)', min: 0, max: 200, step: 1 },
    { param: `${prefix}_FLTE`, label: 'Error Filter', description: 'Error low-pass filter frequency (Hz)', min: 0, max: 200, step: 1 },
    { param: `${prefix}_SMAX`, label: 'Slew Max', description: 'Slew rate limit (0 = disabled)', min: 0, max: 200, step: 1 },
    { param: `${prefix}_PDMX`, label: 'PD Max', description: 'PD sum maximum', min: 0, max: 1, step: 0.01 },
  ];
}

const planeRateSection: PidSection = {
  id: 'plane-rate',
  title: 'Rate PID',
  description: 'Inner loop rate controller -- primary tuning gains.',
  axes: [
    { title: 'Roll', params: planeRatePid('RLL_RATE') },
    { title: 'Pitch', params: planeRatePid('PTCH_RATE') },
  ],
};

// ─── Plane Controller Limits (RLL2SRV_*, PTCH2SRV_*) ────────────────────────

const planeLimitsSection: PidSection = {
  id: 'plane-limits',
  title: 'Controller Limits',
  description: 'Outer loop time constants and rate limits for roll/pitch servo response.',
  axes: [
    {
      title: 'Roll',
      params: [
        { param: 'RLL2SRV_TCONST', label: 'Time Const', description: 'Time constant (lower = faster response)', min: 0.1, max: 2, step: 0.01 },
        { param: 'RLL2SRV_RMAX', label: 'Max Rate', description: 'Maximum roll rate demand (deg/s, 0 = no limit)', min: 0, max: 180, step: 1 },
      ],
    },
    {
      title: 'Pitch',
      params: [
        { param: 'PTCH2SRV_TCONST', label: 'Time Const', description: 'Time constant (lower = faster response)', min: 0.1, max: 2, step: 0.01 },
        { param: 'PTCH2SRV_RMAX_UP', label: 'Max Rate Up', description: 'Maximum pitch-up rate (deg/s)', min: 0, max: 180, step: 1 },
        { param: 'PTCH2SRV_RMAX_DN', label: 'Max Rate Down', description: 'Maximum pitch-down rate (deg/s)', min: 0, max: 180, step: 1 },
        { param: 'PTCH2SRV_RLL', label: 'Roll Comp', description: 'Pitch compensation in turns (0.7–1.4)', min: 0.5, max: 2, step: 0.05 },
      ],
    },
  ],
};

// ─── Plane Yaw Controller (YAW2SRV_*) ───────────────────────────────────────

const planeYawSection: PidSection = {
  id: 'plane-yaw',
  title: 'Yaw Controller',
  description: 'Rudder coordination and yaw damping.',
  params: [
    { param: 'YAW2SRV_SLIP', label: 'Sideslip Gain', description: 'P gain for sideslip control from lateral accel', min: 0, max: 4, step: 0.25 },
    { param: 'YAW2SRV_INT', label: 'Integrator', description: 'Sideslip integrator (trims rudder for steady-state)', min: 0, max: 2, step: 0.25 },
    { param: 'YAW2SRV_DAMP', label: 'Damping', description: 'Yaw rate damping gain', min: 0, max: 2, step: 0.25 },
    { param: 'YAW2SRV_RLL', label: 'Roll Coordination', description: 'Rudder per unit roll for turn coordination (0.8–1.2)', min: 0.5, max: 2, step: 0.05 },
    { param: 'YAW2SRV_IMAX', label: 'I Max', description: 'Maximum integrator servo travel (centi-degrees)', min: 0, max: 4500, step: 100 },
  ],
};

// ─── Plane TECS (Throttle / Energy) ──────────────────────────────────────────

const planeTecsSection: PidSection = {
  id: 'plane-tecs',
  title: 'TECS (Throttle / Energy)',
  description: 'Total Energy Control System -- manages airspeed and altitude.',
  params: [
    { param: 'TECS_CLMB_MAX', label: 'Max Climb Rate', description: 'Maximum climb rate (m/s)', min: 0, max: 30, step: 0.1 },
    { param: 'TECS_SINK_MIN', label: 'Min Sink Rate', description: 'Minimum sink rate at max throttle (m/s)', min: 0, max: 15, step: 0.1 },
    { param: 'TECS_SINK_MAX', label: 'Max Sink Rate', description: 'Maximum sink rate at idle throttle (m/s)', min: 0, max: 30, step: 0.1 },
    { param: 'TECS_TIME_CONST', label: 'Time Constant', description: 'Control loop time constant (s)', min: 1, max: 15, step: 0.1 },
    { param: 'TECS_THR_DAMP', label: 'Throttle Damping', description: 'Throttle demand damping gain', min: 0, max: 2, step: 0.01 },
    { param: 'TECS_INTEG_GAIN', label: 'Integrator Gain', description: 'Integrator gain for speed/height errors', min: 0, max: 1, step: 0.01 },
    { param: 'TECS_SPDWEIGHT', label: 'Speed Weight', description: 'Speed vs height priority (0=height, 2=speed, 1=equal)', min: 0, max: 2, step: 0.1 },
    { param: 'TECS_PITCH_MAX', label: 'Max Pitch', description: 'Maximum pitch angle in auto modes (deg)', min: 0, max: 45, step: 1 },
    { param: 'TECS_PITCH_MIN', label: 'Min Pitch', description: 'Minimum pitch angle in auto modes (deg)', min: -45, max: 0, step: 1 },
  ],
};

// ─── Plane L1 Navigation ─────────────────────────────────────────────────────

const planeNavSection: PidSection = {
  id: 'plane-l1',
  title: 'L1 Navigation',
  description: 'L1 lateral guidance controller for waypoint tracking.',
  params: [
    { param: 'NAVL1_PERIOD', label: 'L1 Period', description: 'Navigation period (lower = tighter turns)', min: 5, max: 35, step: 1 },
    { param: 'NAVL1_DAMPING', label: 'L1 Damping', description: 'Navigation damping ratio', min: 0.6, max: 1, step: 0.01 },
  ],
};

// ─── Plane Filters ───────────────────────────────────────────────────────────

const planeFiltersSection: PidSection = {
  id: 'plane-filters',
  title: 'Filters',
  description: 'Gyro and accelerometer filter settings.',
  params: [
    { param: 'INS_GYRO_FILTER', label: 'Gyro Filter', description: 'Primary gyro low-pass filter cutoff (Hz)', min: 1, max: 256, step: 1 },
    { param: 'INS_ACCEL_FILTER', label: 'Accel Filter', description: 'Accelerometer low-pass filter cutoff (Hz)', min: 1, max: 256, step: 1 },
  ],
};

// ─── QuadPlane VTOL Rate PIDs (Q_A_RAT_*) ────────────────────────────────────

function qpRatePid(prefix: string): PidParam[] {
  return [
    { param: `${prefix}_P`, label: 'P', description: 'Rate P gain', min: 0, max: 2, step: 0.001 },
    { param: `${prefix}_I`, label: 'I', description: 'Rate I gain', min: 0, max: 2, step: 0.001 },
    { param: `${prefix}_IMAX`, label: 'I Max', description: 'Integrator maximum', min: 0, max: 1, step: 0.01 },
    { param: `${prefix}_D`, label: 'D', description: 'Rate D gain', min: 0, max: 0.2, step: 0.0001 },
    { param: `${prefix}_FF`, label: 'FF', description: 'Feed-forward', min: 0, max: 1, step: 0.001 },
    { param: `${prefix}_FLTT`, label: 'Target Filter', description: 'Target low-pass filter (Hz)', min: 0, max: 200, step: 1 },
    { param: `${prefix}_FLTD`, label: 'D-term Filter', description: 'D-term low-pass filter (Hz)', min: 0, max: 200, step: 1 },
    { param: `${prefix}_FLTE`, label: 'Error Filter', description: 'Error low-pass filter (Hz)', min: 0, max: 200, step: 1 },
    { param: `${prefix}_SMAX`, label: 'Slew Max', description: 'Slew rate limit (0 = disabled)', min: 0, max: 200, step: 1 },
  ];
}

const qpRateSection: PidSection = {
  id: 'qp-rate',
  title: 'VTOL Rate PID (Q_A_RAT)',
  description: 'QuadPlane rate controller for VTOL motors.',
  axes: [
    { title: 'Roll', params: qpRatePid('Q_A_RAT_RLL') },
    { title: 'Pitch', params: qpRatePid('Q_A_RAT_PIT') },
    { title: 'Yaw', params: qpRatePid('Q_A_RAT_YAW') },
  ],
};

const qpAngleSection: PidSection = {
  id: 'qp-angle',
  title: 'VTOL Angle P',
  description: 'QuadPlane angle controller P gains for VTOL modes.',
  axes: [
    {
      title: 'Roll',
      params: [{ param: 'Q_A_ANG_RLL_P', label: 'P', description: 'Angle P gain', min: 0, max: 20, step: 0.1 }],
    },
    {
      title: 'Pitch',
      params: [{ param: 'Q_A_ANG_PIT_P', label: 'P', description: 'Angle P gain', min: 0, max: 20, step: 0.1 }],
    },
    {
      title: 'Yaw',
      params: [{ param: 'Q_A_ANG_YAW_P', label: 'P', description: 'Angle P gain', min: 0, max: 20, step: 0.1 }],
    },
  ],
};

// ─── Public API ──────────────────────────────────────────────────────────────

export function getPidSections(vehicleType: VehicleType): PidSection[] {
  switch (vehicleType) {
    case 'copter':
      return [copterRateSection, copterStabilizeSection, copterFiltersSection];
    case 'plane':
      return [planeRateSection, planeLimitsSection, planeYawSection, planeTecsSection, planeNavSection, planeFiltersSection];
    case 'quadplane':
      return [
        planeRateSection,
        planeLimitsSection,
        planeYawSection,
        planeTecsSection,
        planeNavSection,
        qpRateSection,
        qpAngleSection,
        planeFiltersSection,
      ];
    default:
      return [];
  }
}
