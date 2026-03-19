import type { HelpEntry } from './index';

export const HELP_SURFACES: Record<string, HelpEntry> = {
  control_surfaces_concept: {
    tip: 'Movable wing and tail surfaces that steer the airplane.',
    explain: 'Ailerons (on the wings) control roll. Elevator (on the tail or trailing edge) controls pitch. Rudder (vertical tail surface) controls yaw. Each surface is driven by a servo connected to an FC output. The FC must know which output drives which surface, and the direction must be correct -- a reversed aileron will roll the opposite way, causing immediate loss of control.',
    wikiUrl: 'https://ardupilot.org/plane/docs/guide-four-channel-plane.html',
  },
  SERVO_REVERSED: {
    tip: 'Reverse the direction of this servo output.',
    explain: 'If a control surface moves the wrong way (e.g. right aileron goes up when it should go down), reverse it here. Do not reverse it on your transmitter -- that creates confusion when the FC needs to move surfaces for stabilization. Always reverse at the FC level so both manual and automatic control are correct.',
  },
  SERVO_MIN: {
    tip: 'Minimum PWM output for this servo (sets endpoint).',
    explain: 'The lowest PWM value the FC will send to this servo. Adjust to set the maximum deflection in one direction. Too low and the servo may bind against its mechanical stop, drawing excess current and potentially burning out. Set this so the surface reaches full deflection without binding.',
  },
  SERVO_MAX: {
    tip: 'Maximum PWM output for this servo (sets endpoint).',
    explain: 'The highest PWM value the FC will send to this servo. Adjust to set the maximum deflection in the other direction. Same binding risk as SERVO_MIN -- ensure the surface reaches full deflection without mechanical binding.',
  },
  SERVO_TRIM: {
    tip: 'Neutral/center PWM for this servo.',
    explain: 'The PWM value that makes the surface sit at its neutral position (no deflection). Typically 1500, but may need adjustment if the surface is not centered at 1500. Set this so the surface sits flat when the FC commands zero deflection.',
  },
  tilt_servos: {
    tip: 'Servos that tilt VTOL motors between hover and forward flight.',
    explain: 'On tiltrotor VTOL aircraft, motors physically rotate between vertical (hover) and horizontal (forward flight) positions. The tilt servos must move to the correct angle in each mode. If the tilt is wrong, the aircraft cannot transition safely. This step lets you verify the positions by switching flight modes and observing the servo movement.',
    wikiUrl: 'https://ardupilot.org/plane/docs/guide-tilt-rotor.html',
  },
  transitions: {
    tip: 'How the VTOL switches between hover and forward flight.',
    explain: 'Transition is the process of accelerating from hover to wing-borne flight (forward transition) or decelerating from wing-borne flight back to hover (back transition). Key parameters: transition timeout (how long before the FC gives up), VTOL assist (hover motors help if the wing stalls), and failure action (what to do if the transition fails). Getting this wrong can result in a stall or crash during transition.',
    wikiUrl: 'https://ardupilot.org/plane/docs/quadplane-transitions.html',
  },
};
