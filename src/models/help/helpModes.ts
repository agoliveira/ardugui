import type { HelpEntry } from './index';

export const HELP_MODES: Record<string, HelpEntry> = {
  flight_modes_concept: {
    tip: 'Different behaviors the aircraft can switch between in flight.',
    explain: 'Flight modes change how the aircraft responds to your stick inputs. Stabilize gives you direct control with self-leveling. AltHold adds altitude hold. Loiter holds position using GPS. RTL flies home automatically. You assign modes to a transmitter switch so you can change behavior mid-flight. Most pilots use 3-6 modes. Start with safe modes (Stabilize, AltHold, Loiter) and add autonomous modes (RTL, Auto) once you are confident.',
    wikiUrl: 'https://ardupilot.org/copter/docs/flight-modes.html',
  },
  FLTMODE_CH: {
    tip: 'Which transmitter channel controls mode switching.',
    explain: 'Typically channel 5 or 6, assigned to a 2-position or 3-position switch on your transmitter. The FC reads the PWM value on this channel and maps it to one of 6 flight mode slots. A 3-position switch gives 3 modes directly. A 6-position switch (or mixing two switches) gives all 6.',
    wikiUrl: 'https://ardupilot.org/copter/docs/common-rc-transmitter-flight-mode-configuration.html',
  },
  mode_stabilize: {
    tip: 'Self-leveling manual control. Best for learning.',
    explain: 'Sticks control roll and pitch angle directly. Release the sticks and the aircraft levels itself. Throttle controls climb rate directly -- you must manage altitude manually. This is the safest mode for a first flight because it has no GPS dependency and gives you full control with automatic leveling.',
  },
  mode_althold: {
    tip: 'Stabilize with automatic altitude hold.',
    explain: 'Like Stabilize, but the FC holds altitude using the barometer when you center the throttle stick. Push throttle up to climb, down to descend, center to hold. Much easier than Stabilize for hovering, but does not hold horizontal position -- wind will push the aircraft.',
  },
  mode_loiter: {
    tip: 'GPS position hold. The aircraft stays in one place.',
    explain: 'The aircraft holds both altitude and horizontal position using GPS. Stick inputs move the aircraft in that direction; release and it stops and holds. Requires a good GPS fix (3D, 6+ satellites). This is the easiest mode for general flying but depends entirely on GPS quality.',
  },
  mode_rtl: {
    tip: 'Return to Launch. Flies home and lands automatically.',
    explain: 'The aircraft climbs to a safe altitude (RTL_ALT), flies back to where it was armed, and lands. No pilot input needed. This is the primary safety mode -- assign it to an easy-to-reach switch position. RTL requires GPS. If GPS is lost, it will switch to Land instead.',
    wikiUrl: 'https://ardupilot.org/copter/docs/rtl-mode.html',
  },
  mode_auto: {
    tip: 'Follow a pre-programmed mission (waypoints).',
    explain: 'Flies a mission uploaded from a ground station (Mission Planner, QGC). The aircraft follows waypoints, executes commands (takeoff, land, loiter), and can complete an entire flight autonomously. Requires a planned mission and good GPS.',
    wikiUrl: 'https://ardupilot.org/copter/docs/auto-mode.html',
  },
  mode_land: {
    tip: 'Land at the current position.',
    explain: 'The aircraft descends vertically and lands where it is. Useful as a failsafe action or emergency mode. Does not fly home -- it lands in place. If GPS is available, it will hold position during descent. If not, it descends without position hold.',
  },
};
