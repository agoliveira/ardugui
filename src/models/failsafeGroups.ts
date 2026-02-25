/**
 * Failsafe page parameter definitions.
 *
 * Copter and Plane have very different failsafe parameter names and actions.
 * QuadPlane shares plane failsafes plus Q_ VTOL-specific ones.
 *
 * Uses the same ParamGroup/ParamField types from configGroups.
 */

import type { ParamGroup } from './configGroups';
import type { VehicleType } from '@/store/vehicleStore';

// ─── Copter Failsafes ───────────────────────────────────────────────────────

const copterRcFailsafe: ParamGroup = {
  id: 'copter-rc-fs',
  title: 'Radio Failsafe',
  description: 'Action when RC signal is lost.',
  icon: 'Radio',
  fields: [
    {
      param: 'FS_THR_ENABLE',
      label: 'RC Failsafe',
      description: 'Action on RC signal loss',
      type: 'select',
      options: [
        { value: 0, label: 'Disabled' },
        { value: 1, label: 'RTL (or Land if no GPS)' },
        { value: 2, label: 'Continue mission in Auto' },
        { value: 3, label: 'Land immediately' },
        { value: 4, label: 'SmartRTL → RTL → Land' },
        { value: 5, label: 'SmartRTL → Land' },
      ],
    },
    {
      param: 'FS_THR_VALUE',
      label: 'Throttle PWM Threshold',
      description: 'PWM value below which failsafe triggers (typically 950–975)',
      type: 'number',
      min: 900,
      max: 1100,
      step: 1,
      unit: 'µs',
      showWhen: { param: 'FS_THR_ENABLE', min: 1 },
    },
  ],
};

const copterBatteryFailsafe: ParamGroup = {
  id: 'copter-batt-fs',
  title: 'Battery Failsafe',
  description: 'Action when battery voltage or capacity is low.',
  icon: 'Battery',
  fields: [
    {
      param: 'BATT_FS_LOW_ACT',
      label: 'Low Battery Action',
      description: 'Action when battery reaches low threshold',
      type: 'select',
      options: [
        { value: 0, label: 'None' },
        { value: 1, label: 'Land' },
        { value: 2, label: 'RTL' },
        { value: 3, label: 'SmartRTL → RTL → Land' },
        { value: 4, label: 'SmartRTL → Land' },
        { value: 5, label: 'Terminate (kill motors)' },
      ],
    },
    {
      param: 'BATT_LOW_VOLT',
      label: 'Low Voltage',
      description: 'Voltage threshold for low battery warning',
      type: 'number',
      min: 0,
      max: 60,
      step: 0.1,
      unit: 'V',
    },
    {
      param: 'BATT_LOW_MAH',
      label: 'Low mAh Remaining',
      description: 'Remaining capacity for low battery (0 = disabled)',
      type: 'number',
      min: 0,
      max: 50000,
      step: 50,
      unit: 'mAh',
    },
    {
      param: 'BATT_FS_CRT_ACT',
      label: 'Critical Battery Action',
      description: 'Action when battery reaches critical threshold',
      type: 'select',
      options: [
        { value: 0, label: 'None' },
        { value: 1, label: 'Land' },
        { value: 2, label: 'RTL' },
        { value: 3, label: 'SmartRTL → RTL → Land' },
        { value: 4, label: 'SmartRTL → Land' },
        { value: 5, label: 'Terminate (kill motors)' },
      ],
    },
    {
      param: 'BATT_CRT_VOLT',
      label: 'Critical Voltage',
      description: 'Voltage threshold for critical battery failsafe',
      type: 'number',
      min: 0,
      max: 60,
      step: 0.1,
      unit: 'V',
    },
    {
      param: 'BATT_CRT_MAH',
      label: 'Critical mAh Remaining',
      description: 'Remaining capacity for critical failsafe (0 = disabled)',
      type: 'number',
      min: 0,
      max: 50000,
      step: 50,
      unit: 'mAh',
    },
  ],
};

const copterGcsFailsafe: ParamGroup = {
  id: 'copter-gcs-fs',
  title: 'GCS Failsafe',
  description: 'Action when telemetry link to ground station is lost.',
  icon: 'MonitorSmartphone',
  fields: [
    {
      param: 'FS_GCS_ENABLE',
      label: 'GCS Failsafe',
      description: 'Action on GCS heartbeat loss',
      type: 'select',
      options: [
        { value: 0, label: 'Disabled' },
        { value: 1, label: 'RTL (or Land if no GPS)' },
        { value: 2, label: 'Continue mission in Auto' },
        { value: 3, label: 'Land immediately' },
        { value: 4, label: 'SmartRTL → RTL → Land' },
        { value: 5, label: 'SmartRTL → Land' },
      ],
    },
  ],
};

const copterEkfFailsafe: ParamGroup = {
  id: 'copter-ekf-fs',
  title: 'EKF / IMU Failsafe',
  description: 'Action when navigation estimate quality degrades.',
  icon: 'AlertTriangle',
  fields: [
    {
      param: 'FS_EKF_ACTION',
      label: 'EKF Failsafe Action',
      description: 'Action on EKF variance failsafe',
      type: 'select',
      options: [
        { value: 1, label: 'Land' },
        { value: 2, label: 'AltHold' },
        { value: 3, label: 'Land (even in Stabilize)' },
      ],
    },
    {
      param: 'FS_EKF_THRESH',
      label: 'EKF Variance Threshold',
      description: 'Compass/velocity variance that triggers failsafe (0.6–1.0)',
      type: 'number',
      min: 0.1,
      max: 2,
      step: 0.1,
    },
  ],
};

const copterCrashCheck: ParamGroup = {
  id: 'copter-crash-fs',
  title: 'Crash & Safety',
  description: 'Crash detection and other safety settings.',
  icon: 'ShieldAlert',
  fields: [
    {
      param: 'FS_CRASH_CHECK',
      label: 'Crash Check',
      description: 'Disable motors if a crash is detected',
      type: 'select',
      options: [
        { value: 0, label: 'Disabled' },
        { value: 1, label: 'Enabled' },
      ],
    },
    {
      param: 'FS_OPTIONS',
      label: 'Failsafe Options',
      description: 'Bitmask for additional failsafe behavior',
      type: 'number',
      min: 0,
      max: 255,
      step: 1,
    },
  ],
};

// ─── Plane Failsafes ─────────────────────────────────────────────────────────

const planeRcFailsafe: ParamGroup = {
  id: 'plane-rc-fs',
  title: 'Radio Failsafe',
  description: 'Action when RC signal is lost.',
  icon: 'Radio',
  fields: [
    {
      param: 'THR_FAILSAFE',
      label: 'Throttle Failsafe',
      description: 'Enable RC loss detection via throttle channel',
      type: 'select',
      options: [
        { value: 0, label: 'Disabled' },
        { value: 1, label: 'Enabled' },
      ],
    },
    {
      param: 'THR_FS_VALUE',
      label: 'Throttle Failsafe PWM',
      description: 'PWM value below which RC loss is detected',
      type: 'number',
      min: 900,
      max: 1100,
      step: 1,
      unit: 'µs',
      showWhen: { param: 'THR_FAILSAFE', min: 1 },
    },
    {
      param: 'FS_SHORT_ACTN',
      label: 'Short Failsafe Action',
      description: 'Action for brief RC loss',
      type: 'select',
      options: [
        { value: 0, label: 'Continue' },
        { value: 1, label: 'Circle' },
        { value: 3, label: 'Disabled' },
      ],
    },
    {
      param: 'FS_LONG_ACTN',
      label: 'Long Failsafe Action',
      description: 'Action for prolonged RC loss',
      type: 'select',
      options: [
        { value: 0, label: 'Continue' },
        { value: 1, label: 'RTL' },
        { value: 2, label: 'Glide (FBWA)' },
        { value: 3, label: 'Deploy Parachute' },
        { value: 4, label: 'Switch to AUTO' },
        { value: 5, label: 'AUTOLAND or RTL' },
      ],
    },
    {
      param: 'FS_LONG_TIMEOUT',
      label: 'Long Timeout',
      description: 'Seconds of RC loss before long failsafe triggers',
      type: 'number',
      min: 0,
      max: 120,
      step: 1,
      unit: 's',
    },
  ],
};

const planeBatteryFailsafe: ParamGroup = {
  id: 'plane-batt-fs',
  title: 'Battery Failsafe',
  description: 'Action when battery voltage or capacity is low.',
  icon: 'Battery',
  fields: [
    {
      param: 'BATT_FS_LOW_ACT',
      label: 'Low Battery Action',
      description: 'Action when battery reaches low threshold',
      type: 'select',
      options: [
        { value: 0, label: 'None' },
        { value: 1, label: 'RTL' },
        { value: 2, label: 'Land' },
        { value: 3, label: 'Terminate (kill motors)' },
        { value: 4, label: 'QLand (QuadPlane)' },
        { value: 5, label: 'Parachute' },
      ],
    },
    {
      param: 'BATT_LOW_VOLT',
      label: 'Low Voltage',
      description: 'Voltage threshold for low battery warning',
      type: 'number',
      min: 0,
      max: 60,
      step: 0.1,
      unit: 'V',
    },
    {
      param: 'BATT_LOW_MAH',
      label: 'Low mAh Remaining',
      description: 'Remaining capacity for low battery (0 = disabled)',
      type: 'number',
      min: 0,
      max: 50000,
      step: 50,
      unit: 'mAh',
    },
    {
      param: 'BATT_FS_CRT_ACT',
      label: 'Critical Battery Action',
      description: 'Action when battery reaches critical threshold',
      type: 'select',
      options: [
        { value: 0, label: 'None' },
        { value: 1, label: 'RTL' },
        { value: 2, label: 'Land' },
        { value: 3, label: 'Terminate (kill motors)' },
        { value: 4, label: 'QLand (QuadPlane)' },
        { value: 5, label: 'Parachute' },
      ],
    },
    {
      param: 'BATT_CRT_VOLT',
      label: 'Critical Voltage',
      description: 'Voltage threshold for critical battery failsafe',
      type: 'number',
      min: 0,
      max: 60,
      step: 0.1,
      unit: 'V',
    },
    {
      param: 'BATT_CRT_MAH',
      label: 'Critical mAh Remaining',
      description: 'Remaining capacity for critical failsafe (0 = disabled)',
      type: 'number',
      min: 0,
      max: 50000,
      step: 50,
      unit: 'mAh',
    },
  ],
};

const planeGcsFailsafe: ParamGroup = {
  id: 'plane-gcs-fs',
  title: 'GCS Failsafe',
  description: 'Action when telemetry link to ground station is lost.',
  icon: 'MonitorSmartphone',
  fields: [
    {
      param: 'FS_GCS_ENABL',
      label: 'GCS Failsafe',
      description: 'Action on GCS heartbeat loss',
      type: 'select',
      options: [
        { value: 0, label: 'Disabled' },
        { value: 1, label: 'RTL' },
        { value: 2, label: 'Rally point / RTL' },
      ],
    },
  ],
};

const planeGeofence: ParamGroup = {
  id: 'plane-geofence',
  title: 'Geofence',
  description: 'Boundary enforcement for flight area.',
  icon: 'MapPin',
  fields: [
    {
      param: 'FENCE_ACTION',
      label: 'Fence Action',
      description: 'Action when geofence is breached',
      type: 'select',
      options: [
        { value: 0, label: 'Report Only' },
        { value: 1, label: 'RTL' },
        { value: 6, label: 'Guided to return point' },
        { value: 7, label: 'Guided with stop at fence' },
      ],
    },
    {
      param: 'FENCE_ALT_MAX',
      label: 'Max Altitude',
      description: 'Maximum altitude above home (0 = disabled)',
      type: 'number',
      min: 0,
      max: 1000,
      step: 10,
      unit: 'm',
    },
    {
      param: 'FENCE_ALT_MIN',
      label: 'Min Altitude',
      description: 'Minimum altitude above home (negative = below home, 0 = disabled)',
      type: 'number',
      min: -100,
      max: 100,
      step: 1,
      unit: 'm',
    },
    {
      param: 'FENCE_RADIUS',
      label: 'Max Radius',
      description: 'Maximum distance from home (0 = disabled)',
      type: 'number',
      min: 0,
      max: 10000,
      step: 10,
      unit: 'm',
    },
    {
      param: 'FENCE_MARGIN',
      label: 'Margin',
      description: 'Distance from fence at which vehicle starts to turn back',
      type: 'number',
      min: 0,
      max: 100,
      step: 1,
      unit: 'm',
    },
  ],
};

// Copter also has a geofence section -- same params, different actions
const copterGeofence: ParamGroup = {
  id: 'copter-geofence',
  title: 'Geofence',
  description: 'Boundary enforcement for flight area.',
  icon: 'MapPin',
  fields: [
    {
      param: 'FENCE_ACTION',
      label: 'Fence Action',
      description: 'Action when geofence is breached',
      type: 'select',
      options: [
        { value: 0, label: 'Report Only' },
        { value: 1, label: 'RTL or Land' },
        { value: 2, label: 'Land immediately' },
        { value: 3, label: 'SmartRTL → RTL → Land' },
        { value: 4, label: 'Brake → Land' },
        { value: 5, label: 'SmartRTL → Land' },
      ],
    },
    {
      param: 'FENCE_ALT_MAX',
      label: 'Max Altitude',
      description: 'Maximum altitude above home (0 = disabled)',
      type: 'number',
      min: 0,
      max: 1000,
      step: 10,
      unit: 'm',
    },
    {
      param: 'FENCE_ALT_MIN',
      label: 'Min Altitude',
      description: 'Minimum altitude (0 = disabled)',
      type: 'number',
      min: -100,
      max: 100,
      step: 1,
      unit: 'm',
    },
    {
      param: 'FENCE_RADIUS',
      label: 'Max Radius',
      description: 'Maximum distance from home (0 = disabled)',
      type: 'number',
      min: 0,
      max: 10000,
      step: 10,
      unit: 'm',
    },
    {
      param: 'FENCE_MARGIN',
      label: 'Margin',
      description: 'Distance from fence at which vehicle starts to react',
      type: 'number',
      min: 0,
      max: 100,
      step: 1,
      unit: 'm',
    },
  ],
};

// ─── Public API ──────────────────────────────────────────────────────────────

export function getFailsafeGroups(vehicleType: VehicleType): ParamGroup[] {
  switch (vehicleType) {
    case 'copter':
      return [
        copterRcFailsafe,
        copterBatteryFailsafe,
        copterGcsFailsafe,
        copterEkfFailsafe,
        copterGeofence,
        copterCrashCheck,
      ];
    case 'plane':
      return [
        planeRcFailsafe,
        planeBatteryFailsafe,
        planeGcsFailsafe,
        planeGeofence,
      ];
    case 'quadplane':
      return [
        planeRcFailsafe,
        planeBatteryFailsafe,
        planeGcsFailsafe,
        planeGeofence,
      ];
    default:
      return [];
  }
}
