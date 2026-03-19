import type { HelpEntry } from './index';

export const HELP_TUNE: Record<string, HelpEntry> = {
  INS_GYRO_FILTER: {
    tip: 'Low-pass filter on gyroscope data. Removes motor vibration noise.',
    explain: 'The gyroscope measures rotation rate but also picks up vibration from motors and propellers. This filter removes high-frequency noise so the FC only sees real aircraft movement. The correct value depends on propeller size: larger props produce lower-frequency noise and need a lower filter. Too low and the aircraft feels sluggish. Too high and vibration feeds back into the control loop, causing oscillation.',
    wikiUrl: 'https://ardupilot.org/copter/docs/common-imu-notch-filtering.html',
  },
  INS_ACCEL_FILTER: {
    tip: 'Low-pass filter on accelerometer data.',
    explain: 'Similar to the gyro filter but for the accelerometer, which measures linear acceleration and is used for altitude and position estimation. Default 20Hz works for most builds. Lower values smooth more but add latency to altitude hold.',
  },
  MOT_THST_EXPO: {
    tip: 'Linearizes the throttle-to-thrust relationship.',
    explain: 'Propellers do not produce thrust linearly with throttle -- low throttle produces very little thrust, and the relationship is curved. This parameter compensates so the FC\'s internal throttle commands produce predictable thrust. 0.65 is a good starting point for most multirotors. Getting this right improves altitude hold stability.',
    wikiUrl: 'https://ardupilot.org/copter/docs/motor-thrust-scaling.html',
  },
  initial_tune_concept: {
    tip: 'Pre-flight parameters based on your propeller size.',
    explain: 'Before the first flight, the FC needs reasonable filter and rate settings based on your hardware. Larger propellers produce lower-frequency vibration, so filters need lower cutoff frequencies. The initial tune sets gyro filter, accel filter, rate controller D-term filter, and acceleration limits to safe starting values. These are not final -- after your first flight, you should run AutoTune to optimize the PID gains for your specific aircraft.',
    wikiUrl: 'https://ardupilot.org/copter/docs/initial-tuning-flight.html',
  },
  autotune: {
    tip: 'Automatic PID tuning performed during flight.',
    explain: 'AutoTune is a flight mode where the FC automatically adjusts PID gains by commanding small twitches and measuring the response. It typically takes 5-10 minutes of hovering in calm conditions. Assign it to a flight mode switch, take off in a spacious area, activate it, and wait. The aircraft will twitch on each axis while tuning. Land and the tuned gains are saved. This is the single most important step for good flight performance.',
    wikiUrl: 'https://ardupilot.org/copter/docs/autotune.html',
  },
};
