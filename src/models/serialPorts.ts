/**
 * ArduPilot Serial Port Configuration.
 *
 * Maps SERIAL0-6 parameters to user-friendly port configuration.
 * Each port has a protocol (what it does) and baud rate.
 */

export interface SerialPortDef {
  /** Port index (0-6) */
  index: number;
  /** Display label */
  label: string;
  /** Hardware description */
  hardware: string;
  /** Protocol parameter name */
  protocolParam: string;
  /** Baud rate parameter name */
  baudParam: string;
}

/**
 * The standard serial ports on ArduPilot flight controllers.
 * SERIAL0 is always USB/console.
 */
export const SERIAL_PORTS: SerialPortDef[] = [
  {
    index: 0,
    label: 'SERIAL0',
    hardware: 'USB',
    protocolParam: 'SERIAL0_PROTOCOL',
    baudParam: 'SERIAL0_BAUD',
  },
  {
    index: 1,
    label: 'SERIAL1',
    hardware: 'TELEM1',
    protocolParam: 'SERIAL1_PROTOCOL',
    baudParam: 'SERIAL1_BAUD',
  },
  {
    index: 2,
    label: 'SERIAL2',
    hardware: 'TELEM2',
    protocolParam: 'SERIAL2_PROTOCOL',
    baudParam: 'SERIAL2_BAUD',
  },
  {
    index: 3,
    label: 'SERIAL3',
    hardware: 'GPS1',
    protocolParam: 'SERIAL3_PROTOCOL',
    baudParam: 'SERIAL3_BAUD',
  },
  {
    index: 4,
    label: 'SERIAL4',
    hardware: 'GPS2',
    protocolParam: 'SERIAL4_PROTOCOL',
    baudParam: 'SERIAL4_BAUD',
  },
  {
    index: 5,
    label: 'SERIAL5',
    hardware: 'Aux',
    protocolParam: 'SERIAL5_PROTOCOL',
    baudParam: 'SERIAL5_BAUD',
  },
  {
    index: 6,
    label: 'SERIAL6',
    hardware: 'Aux 2',
    protocolParam: 'SERIAL6_PROTOCOL',
    baudParam: 'SERIAL6_BAUD',
  },
];

/**
 * Available serial protocols in ArduPilot.
 * Value maps to SERIAL*_PROTOCOL parameter.
 *
 * Source: https://ardupilot.org/plane/docs/common-serial-options.html
 * Verified against ArduPilot 4.6.x source 2026-02-23.
 */
export const SERIAL_PROTOCOLS = [
  { value: -1, label: 'None', description: 'Port disabled' },
  { value: 1,  label: 'MAVLink 1', description: 'MAVLink v1 telemetry' },
  { value: 2,  label: 'MAVLink 2', description: 'MAVLink v2 telemetry' },
  { value: 3,  label: 'FrSky D', description: 'FrSky D-series telemetry' },
  { value: 4,  label: 'FrSky SPort', description: 'FrSky SPort telemetry' },
  { value: 5,  label: 'GPS', description: 'GPS receiver' },
  { value: 7,  label: 'Alexmos Gimbal', description: 'Alexmos gimbal serial' },
  { value: 8,  label: 'SToRM32 Gimbal', description: 'SToRM32 gimbal serial' },
  { value: 9,  label: 'Rangefinder', description: 'Serial rangefinder' },
  { value: 10, label: 'FrSky Passthru', description: 'FrSky SPort passthrough (OpenTX)' },
  { value: 11, label: 'Lidar360', description: 'Lidar proximity sensor' },
  { value: 13, label: 'Beacon', description: 'Beacon for indoor positioning' },
  { value: 14, label: 'Volz Servo', description: 'Volz serial servo' },
  { value: 15, label: 'SBus Servo', description: 'S.Bus servo output' },
  { value: 16, label: 'ESC Telemetry', description: 'ESC telemetry input' },
  { value: 17, label: 'Devo Telemetry', description: 'Devo telemetry' },
  { value: 18, label: 'OpticalFlow', description: 'Optical flow sensor' },
  { value: 19, label: 'Robotis Servo', description: 'Robotis Dynamixel servo' },
  { value: 20, label: 'NMEA Output', description: 'NMEA output from GPS' },
  { value: 21, label: 'WindVane', description: 'Wind vane sensor' },
  { value: 22, label: 'SLCAN', description: 'CAN over serial (SLCAN)' },
  { value: 23, label: 'RCIN', description: 'RC input (CRSF / ELRS / SBUS serial)' },
  { value: 24, label: 'MegaSquirt EFI', description: 'MegaSquirt engine mgmt' },
  { value: 25, label: 'LTM', description: 'Lightweight telemetry (LTM)' },
  { value: 26, label: 'RunCam', description: 'RunCam device protocol' },
  { value: 27, label: 'HoTT Telem', description: 'Graupner HoTT telemetry' },
  { value: 28, label: 'Scripting', description: 'Lua scripting serial' },
  { value: 29, label: 'Crossfire VTX', description: 'TBS Crossfire VTX control' },
  { value: 30, label: 'Generator', description: 'Generator control' },
  { value: 31, label: 'Winch', description: 'Winch control' },
  { value: 32, label: 'MSP Telemetry', description: 'MSP protocol (iNav/Betaflight)' },
  { value: 33, label: 'DJI FPV OSD', description: 'DJI FPV OSD (MSP)' },
  { value: 34, label: 'Airspeed', description: 'Serial airspeed sensor' },
  { value: 35, label: 'ADSB', description: 'Serial ADS-B receiver' },
  { value: 36, label: 'AHRS', description: 'External AHRS system' },
  { value: 37, label: 'SmartAudio', description: 'TBS SmartAudio VTX control' },
  { value: 38, label: 'FETtec OneWire', description: 'FETtec OneWire ESCs' },
  { value: 39, label: 'Torqeedo', description: 'Torqeedo motor control' },
  { value: 40, label: 'AIS', description: 'AIS receiver (boats)' },
  { value: 41, label: 'CoDevESC', description: 'CoDevESC protocol' },
  { value: 42, label: 'DisplayPort', description: 'DisplayPort OSD (MSP)' },
  { value: 43, label: 'MAVLink High Lat', description: 'MAVLink high latency mode' },
  { value: 44, label: 'IRC Tramp', description: 'IRC Tramp VTX control' },
  { value: 45, label: 'DDS XRCE', description: 'DDS/XRCE-DDS (ROS2)' },
];

/**
 * Available baud rates.
 * Value maps to SERIAL*_BAUD parameter (stored in ArduPilot as rate/1 for common rates).
 */
export const SERIAL_BAUD_RATES = [
  { value: 1,    label: '1200' },
  { value: 2,    label: '2400' },
  { value: 4,    label: '4800' },
  { value: 9,    label: '9600' },
  { value: 19,   label: '19200' },
  { value: 38,   label: '38400' },
  { value: 57,   label: '57600' },
  { value: 111,  label: '111100' },
  { value: 115,  label: '115200' },
  { value: 230,  label: '230400' },
  { value: 256,  label: '256000' },
  { value: 460,  label: '460800' },
  { value: 500,  label: '500000' },
  { value: 921,  label: '921600' },
  { value: 1500, label: '1500000' },
];
