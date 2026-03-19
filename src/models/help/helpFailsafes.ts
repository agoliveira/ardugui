import type { HelpEntry } from './index';

export const HELP_FAILSAFES: Record<string, HelpEntry> = {
  FS_THR_ENABLE: {
    tip: 'What happens when RC signal is lost.',
    explain: 'If your transmitter loses connection (out of range, interference, or transmitter off), the FC needs to do something safe. RTL (Return to Launch) is the best default -- the aircraft flies itself home using GPS. "Land" lands immediately wherever it is. "Continue" keeps flying the current mission (only useful for autonomous flights). Disabled means the aircraft does nothing and will eventually crash when the battery runs out.',
    wikiUrl: 'https://ardupilot.org/copter/docs/radio-failsafe.html',
  },
  FS_GCS_ENABLE: {
    tip: 'What happens when ground station connection is lost.',
    explain: 'If you are controlling the aircraft via a ground station (laptop with Mission Planner) and that connection drops, this failsafe triggers. RTL is recommended. Most hobby pilots fly with a transmitter, not a ground station, so this failsafe rarely triggers -- but it is good practice to set it anyway.',
    wikiUrl: 'https://ardupilot.org/copter/docs/gcs-failsafe.html',
  },
  FS_EKF_ACTION: {
    tip: 'What happens when the navigation system becomes unreliable.',
    explain: 'The EKF (Extended Kalman Filter) is ArduPilot\'s navigation brain -- it fuses GPS, accelerometer, gyro, compass, and barometer data into a position estimate. If the EKF reports poor health (typically from compass interference, GPS glitch, or vibration), this failsafe triggers. Land is the safest option because the position estimate is unreliable, so flying home (RTL) might not go where you expect.',
    wikiUrl: 'https://ardupilot.org/copter/docs/ekf-inav-failsafe.html',
  },
  failsafe_concept: {
    tip: 'Automatic safety actions when something goes wrong.',
    explain: 'Failsafes are your aircraft\'s safety net. They activate automatically when the FC detects a problem -- lost radio link, low battery, or navigation failure. Each failsafe has an action (what to do) and a threshold (when to trigger). The recommended setup for most aircraft: RC loss triggers RTL, low battery triggers RTL, critical battery triggers Land, EKF failure triggers Land. Test your failsafes on the ground before flying by turning off your transmitter and verifying the FC enters RTL mode.',
    wikiUrl: 'https://ardupilot.org/copter/docs/failsafe-landing-page.html',
  },
};
