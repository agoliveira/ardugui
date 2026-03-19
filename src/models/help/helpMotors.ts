import type { HelpEntry } from './index';

export const HELP_MOTORS: Record<string, HelpEntry> = {
  MOT_PWM_TYPE: {
    tip: 'Communication protocol between FC and ESCs.',
    explain: 'This sets how the flight controller talks to your ESCs. PWM is the oldest and most compatible but slowest. OneShot125 is faster analog. DShot is digital -- no calibration needed, supports telemetry, and allows motor direction reversal via software. DShot600 is recommended for modern builds. If your ESCs support DShot (most BLHeli_32 and BLHeli_S do), use it.',
    wikiUrl: 'https://ardupilot.org/copter/docs/common-dshot.html',
  },
  MOT_SPIN_ARM: {
    tip: 'Motor idle speed when armed but not flying.',
    explain: 'When you arm the aircraft, motors can spin slowly to confirm they work and to reduce startup latency. A value of 0.05-0.10 is typical. Set to 0 if you want motors completely still when armed (some airframes need this). Too high and the aircraft might try to lift off at idle.',
    wikiUrl: 'https://ardupilot.org/copter/docs/parameters.html#mot-spin-arm',
  },
  MOT_SPIN_MIN: {
    tip: 'Minimum motor speed during flight.',
    explain: 'The lowest throttle the FC will command during flight. This keeps motors spinning for attitude control even during descents. Default 0.15 works for most setups. Too low and motors may stall during aggressive maneuvers. Too high wastes battery and limits descent rate.',
    wikiUrl: 'https://ardupilot.org/copter/docs/parameters.html#mot-spin-min',
  },
  motor_direction: {
    tip: 'Which way each motor spins.',
    explain: 'Every motor must spin in the correct direction for the aircraft to fly. Copters alternate CW (clockwise) and CCW (counter-clockwise) motors to balance torque. If even one motor spins the wrong way, the aircraft will flip immediately on takeoff. Always verify with propellers removed. For DShot ESCs, direction can be reversed in software. For PWM ESCs, swap any two motor wires.',
    wikiUrl: 'https://ardupilot.org/copter/docs/connect-escs-and-motors.html',
  },
  motor_test: {
    tip: 'Spin individual motors to verify direction and order.',
    explain: 'Motor test spins one motor at a time at low throttle so you can confirm each motor is connected to the correct output and spinning the correct direction. Always remove propellers first. The test uses a low throttle (default 5%) for a short duration. If a motor does not spin, check the output mapping and ESC protocol.',
  },
  SERVO_FUNCTION: {
    tip: 'What each output port does (motor, servo, or disabled).',
    explain: 'Each output on the FC can be assigned a function: Motor 1-8, aileron, elevator, rudder, throttle, or disabled. The output mapping must match your physical wiring. If SERVO3_FUNCTION is set to Motor 1, then motor 1 must be physically connected to the S3 pad on the board.',
    wikiUrl: 'https://ardupilot.org/copter/docs/common-rcoutput-mapping.html',
  },
};
