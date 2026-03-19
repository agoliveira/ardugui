import type { HelpEntry } from './index';

export const HELP_RECEIVER: Record<string, HelpEntry> = {
  rc_protocol: {
    tip: 'Communication protocol between your transmitter\'s receiver and the FC.',
    explain: 'Your radio transmitter talks to a receiver module on the aircraft, and that receiver talks to the FC using a protocol. CRSF (used by ExpressLRS and TBS Crossfire) is the most popular modern choice -- it is fast, reliable, and includes telemetry. SBUS (FrSky, Futaba) is very common and connects to a dedicated SBUS pad. PPM is legacy and limited to 8 channels. The protocol must match what your receiver outputs.',
    wikiUrl: 'https://ardupilot.org/copter/docs/common-rc-systems.html',
  },
  rc_port: {
    tip: 'Which serial port the receiver is connected to.',
    explain: 'Serial receivers (CRSF, FPort, SRXL2) need a UART serial port. The port must match your physical wiring -- if your receiver is soldered to TX6/RX6, select SERIAL6. SBUS and PPM receivers use dedicated input pads (usually labeled SBUS or PPM) and do not need a serial port assignment.',
    wikiUrl: 'https://ardupilot.org/copter/docs/common-flight-controller-wiring.html',
  },
  RCMAP: {
    tip: 'Which channel controls which axis (roll, pitch, throttle, yaw).',
    explain: 'Different radio manufacturers use different channel orders. AETR (Aileron-Elevator-Throttle-Rudder) is the most common, used by ELRS, FrSky, and Futaba. TAER (Throttle-Aileron-Elevator-Rudder) is used by Spektrum and JR. This must match your transmitter\'s channel output order. If roll and throttle are swapped, the aircraft will be uncontrollable.',
    wikiUrl: 'https://ardupilot.org/copter/docs/common-rcmap.html',
  },
  rc_calibration: {
    tip: 'Teach the FC the full range of your transmitter sticks.',
    explain: 'Every transmitter outputs slightly different PWM ranges. Calibration captures the minimum, maximum, and center values for each channel so the FC knows what "full left" and "full right" actually mean on your specific radio. Without calibration, control response may be asymmetric or not reach full deflection. Move all sticks to their extremes during capture, then center everything (throttle low) to set trim points.',
    wikiUrl: 'https://ardupilot.org/copter/docs/common-radio-control-calibration.html',
  },
  RC_MIN: {
    tip: 'Minimum PWM value for this channel (set during calibration).',
    explain: 'The lowest value the FC will receive from your transmitter on this channel. Typically 988-1000 for modern receivers. Set automatically during RC calibration. Values outside the min/max range are treated as failsafe.',
  },
  RC_MAX: {
    tip: 'Maximum PWM value for this channel (set during calibration).',
    explain: 'The highest value the FC will receive from your transmitter on this channel. Typically 2000-2012 for modern receivers. Set automatically during RC calibration.',
  },
  RC_TRIM: {
    tip: 'Center/neutral PWM value for this channel.',
    explain: 'The value your transmitter sends when the stick is centered (or throttle is at its lowest position). For roll, pitch, and yaw this should be mid-stick (~1500). For throttle, trim is set to the low-stick value. Incorrect trim causes the aircraft to drift or hover at the wrong throttle position.',
  },
};
