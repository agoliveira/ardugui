/**
 * Configuration page parameter groups.
 *
 * Each group defines a section on the Configuration page with
 * friendly labels, tooltips, and option mappings for enum parameters.
 */

export interface ParamOption {
  value: number;
  label: string;
}

export interface ParamField {
  /** FC parameter name */
  param: string;
  /** Display label */
  label: string;
  /** Short help text */
  description?: string;
  /** Input type */
  type: 'select' | 'number' | 'toggle';
  /** Options for select type */
  options?: ParamOption[];
  /** Min/max/step for number type */
  min?: number;
  max?: number;
  step?: number;
  /** Unit suffix displayed after number inputs */
  unit?: string;
  /** Only show this field when another param matches a condition */
  showWhen?: { param: string; min: number };
}

export interface ParamGroup {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  fields: ParamField[];
}

// --- Battery Monitor ---
const batteryGroup: ParamGroup = {
  id: 'battery',
  title: 'Battery Monitor',
  description: 'Configure battery voltage and current sensing.',
  icon: 'Battery',
  fields: [
    {
      param: 'BATT_MONITOR',
      label: 'Monitor Type',
      description: 'How battery voltage and current are measured',
      type: 'select',
      options: [
        { value: 0, label: 'Disabled' },
        { value: 3, label: 'Analog Voltage Only' },
        { value: 4, label: 'Analog Voltage and Current' },
        { value: 5, label: 'Solo' },
        { value: 6, label: 'Bebop' },
        { value: 7, label: 'SMBus - Maxell' },
        { value: 8, label: 'UAVCAN Battery' },
        { value: 9, label: 'BLHeli ESC Telemetry' },
        { value: 16, label: 'Analog Voltage Only (2nd)' },
        { value: 21, label: 'INA2xx' },
      ],
    },
    {
      param: 'BATT_CAPACITY',
      label: 'Battery Capacity',
      description: 'Total battery capacity for remaining estimation',
      type: 'number',
      min: 0,
      max: 100000,
      step: 50,
      unit: 'mAh',
      showWhen: { param: 'BATT_MONITOR', min: 1 },
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
      showWhen: { param: 'BATT_MONITOR', min: 1 },
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
      showWhen: { param: 'BATT_MONITOR', min: 1 },
    },
    {
      param: 'BATT_LOW_MAH',
      label: 'Low mAh',
      description: 'Remaining mAh for low battery warning (0 to disable)',
      type: 'number',
      min: 0,
      max: 50000,
      step: 50,
      unit: 'mAh',
      showWhen: { param: 'BATT_MONITOR', min: 4 },
    },
    {
      param: 'BATT_CRT_MAH',
      label: 'Critical mAh',
      description: 'Remaining mAh for critical battery failsafe (0 to disable)',
      type: 'number',
      min: 0,
      max: 50000,
      step: 50,
      unit: 'mAh',
      showWhen: { param: 'BATT_MONITOR', min: 4 },
    },
    {
      param: 'BATT_VOLT_MULT',
      label: 'Voltage Multiplier',
      description: 'Scaling factor for analog voltage pin',
      type: 'number',
      min: 0,
      max: 100,
      step: 0.01,
      showWhen: { param: 'BATT_MONITOR', min: 3 },
    },
    {
      param: 'BATT_AMP_PERVLT',
      label: 'Amps per Volt',
      description: 'Current sensor scaling factor',
      type: 'number',
      min: 0,
      max: 500,
      step: 0.1,
      unit: 'A/V',
      showWhen: { param: 'BATT_MONITOR', min: 4 },
    },
  ],
};

// --- Motor / ESC ---
const motorGroup: ParamGroup = {
  id: 'motor',
  title: 'Motor & ESC',
  description: 'Configure motor output protocol and throttle range.',
  icon: 'Cog',
  fields: [
    {
      param: 'SERVO_BLH_AUTO',
      label: 'BLHeli Auto',
      description: 'Enable automatic BLHeli passthrough',
      type: 'toggle',
    },
    {
      param: 'THR_MIN',
      label: 'Throttle Min',
      description: 'Minimum throttle percentage in flight',
      type: 'number',
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
    },
    {
      param: 'THR_MAX',
      label: 'Throttle Max',
      description: 'Maximum throttle percentage',
      type: 'number',
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
    },
    {
      param: 'THR_SLEWRATE',
      label: 'Throttle Slew Rate',
      description: 'Maximum throttle change per second',
      type: 'number',
      min: 0,
      max: 127,
      step: 1,
      unit: '%/s',
    },
    {
      param: 'SERVO_RATE',
      label: 'Servo Update Rate',
      description: 'PWM update frequency for servos',
      type: 'select',
      options: [
        { value: 50, label: '50 Hz (Analog servos)' },
        { value: 125, label: '125 Hz' },
        { value: 250, label: '250 Hz' },
        { value: 400, label: '400 Hz (Digital servos)' },
      ],
    },
  ],
};

// --- Compass ---
const compassGroup: ParamGroup = {
  id: 'compass',
  title: 'Compass',
  description: 'Configure compass sensors and declination.',
  icon: 'Compass',
  fields: [
    {
      param: 'COMPASS_USE',
      label: 'Use Compass 1',
      description: 'Enable primary compass',
      type: 'toggle',
    },
    {
      param: 'COMPASS_USE2',
      label: 'Use Compass 2',
      description: 'Enable secondary compass',
      type: 'toggle',
    },
    {
      param: 'COMPASS_USE3',
      label: 'Use Compass 3',
      description: 'Enable tertiary compass',
      type: 'toggle',
    },
    {
      param: 'COMPASS_AUTODEC',
      label: 'Auto Declination',
      description: 'Automatically calculate magnetic declination from GPS',
      type: 'toggle',
    },
    {
      param: 'COMPASS_ORIENT',
      label: 'Orientation',
      description: 'External compass board orientation',
      type: 'select',
      options: [
        { value: 0, label: 'None' },
        { value: 1, label: 'Yaw 45°' },
        { value: 2, label: 'Yaw 90°' },
        { value: 3, label: 'Yaw 135°' },
        { value: 4, label: 'Yaw 180°' },
        { value: 5, label: 'Yaw 225°' },
        { value: 6, label: 'Yaw 270°' },
        { value: 7, label: 'Yaw 315°' },
        { value: 8, label: 'Roll 180°' },
        { value: 10, label: 'Roll 180° + Yaw 90°' },
        { value: 12, label: 'Pitch 180°' },
        { value: 38, label: 'Custom' },
      ],
    },
  ],
};

// --- GPS ---
const gpsGroup: ParamGroup = {
  id: 'gps',
  title: 'GPS',
  description: 'Configure GPS receivers.',
  icon: 'MapPin',
  fields: [
    {
      param: 'GPS_TYPE',
      label: 'GPS Type',
      description: 'Primary GPS receiver protocol',
      type: 'select',
      options: [
        { value: 0, label: 'None' },
        { value: 1, label: 'Auto' },
        { value: 2, label: 'uBlox' },
        { value: 5, label: 'NMEA' },
        { value: 6, label: 'SiRF' },
        { value: 7, label: 'HIL' },
        { value: 8, label: 'SwiftNav' },
        { value: 9, label: 'UAVCAN' },
        { value: 10, label: 'SBF' },
        { value: 11, label: 'GSOF' },
        { value: 14, label: 'ERB' },
        { value: 15, label: 'MAV' },
        { value: 16, label: 'NOVA' },
        { value: 17, label: 'HemisphereNMEA' },
      ],
    },
    {
      param: 'GPS_TYPE2',
      label: 'GPS 2 Type',
      description: 'Secondary GPS receiver protocol',
      type: 'select',
      options: [
        { value: 0, label: 'None' },
        { value: 1, label: 'Auto' },
        { value: 2, label: 'uBlox' },
        { value: 5, label: 'NMEA' },
        { value: 9, label: 'UAVCAN' },
      ],
    },
    {
      param: 'GPS_AUTO_CONFIG',
      label: 'Auto Configure',
      description: 'Automatically configure GPS on startup',
      type: 'toggle',
    },
    {
      param: 'GPS_GNSS_MODE',
      label: 'GNSS Mode',
      description: 'Which satellite systems to use',
      type: 'select',
      options: [
        { value: 0, label: 'GPS only' },
        { value: 1, label: 'GPS + SBAS' },
        { value: 3, label: 'GPS + SBAS + GLONASS' },
        { value: 67, label: 'GPS + SBAS + GLONASS + Galileo + BeiDou' },
      ],
    },
  ],
};

// --- Airspeed (Plane-specific) ---
const airspeedGroup: ParamGroup = {
  id: 'airspeed',
  title: 'Airspeed',
  description: 'Configure airspeed sensor.',
  icon: 'Wind',
  fields: [
    {
      param: 'ARSPD_TYPE',
      label: 'Sensor Type',
      description: 'Airspeed sensor type',
      type: 'select',
      options: [
        { value: 0, label: 'None' },
        { value: 1, label: 'I2C MS4525DO' },
        { value: 2, label: 'Analog' },
        { value: 3, label: 'I2C MS5525' },
        { value: 4, label: 'I2C MS5525 (alt)' },
        { value: 5, label: 'I2C SDP3X' },
        { value: 6, label: 'DLVR' },
        { value: 7, label: 'UAVCAN' },
        { value: 11, label: 'DroneCAN' },
      ],
    },
    {
      param: 'ARSPD_USE',
      label: 'Use Airspeed',
      description: 'Enable airspeed sensor for flight control',
      type: 'toggle',
      showWhen: { param: 'ARSPD_TYPE', min: 1 },
    },
    {
      param: 'ARSPD_RATIO',
      label: 'Ratio',
      description: 'Airspeed calibration ratio',
      type: 'number',
      min: 0,
      max: 5,
      step: 0.01,
      showWhen: { param: 'ARSPD_TYPE', min: 1 },
    },
    {
      param: 'ARSPD_AUTOCAL',
      label: 'Auto Calibrate',
      description: 'Enable automatic airspeed ratio calibration in flight',
      type: 'toggle',
      showWhen: { param: 'ARSPD_TYPE', min: 1 },
    },
  ],
};

// --- Board / General ---
const boardGroup: ParamGroup = {
  id: 'board',
  title: 'Board & General',
  description: 'General flight controller settings.',
  icon: 'Cpu',
  fields: [
    {
      param: 'BRD_SAFETY_DEFLT',
      label: 'Safety Switch Default',
      description: 'Default state of the safety switch',
      type: 'select',
      options: [
        { value: 0, label: 'Disabled (no safety switch)' },
        { value: 1, label: 'Enabled (must press to arm)' },
      ],
    },
    {
      param: 'ARMING_CHECK',
      label: 'Arming Checks',
      description: 'Which pre-arm checks to perform',
      type: 'select',
      options: [
        { value: 0, label: 'Disabled (skip all checks)' },
        { value: 1, label: 'All checks enabled' },
      ],
    },
    {
      param: 'LOG_BITMASK',
      label: 'Log Bitmask',
      description: 'Which data to log to flash',
      type: 'number',
      min: 0,
      max: 65535,
      step: 1,
    },
    {
      param: 'SCHED_LOOP_RATE',
      label: 'Loop Rate',
      description: 'Main control loop frequency',
      type: 'select',
      options: [
        { value: 50, label: '50 Hz' },
        { value: 100, label: '100 Hz' },
        { value: 200, label: '200 Hz' },
        { value: 300, label: '300 Hz' },
        { value: 400, label: '400 Hz' },
      ],
    },
  ],
};

/**
 * Get configuration groups for a vehicle type.
 */
export function getConfigGroups(
  vehicleType: 'copter' | 'plane' | 'quadplane' | null
): ParamGroup[] {
  const common = [batteryGroup, compassGroup, gpsGroup, boardGroup];

  switch (vehicleType) {
    case 'plane':
    case 'quadplane':
      return [batteryGroup, motorGroup, airspeedGroup, compassGroup, gpsGroup, boardGroup];
    case 'copter':
      return [batteryGroup, motorGroup, compassGroup, gpsGroup, boardGroup];
    default:
      return common;
  }
}
