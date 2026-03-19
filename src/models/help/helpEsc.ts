import type { HelpEntry } from './index';

export const HELP_ESC: Record<string, HelpEntry> = {
  SERVO_BLH_AUTO: {
    tip: 'Automatically detect BLHeli ESCs on motor outputs.',
    explain: 'When enabled, the FC probes each motor output to detect if a BLHeli ESC is connected. This is needed for DShot commands like motor direction reversal and ESC telemetry. Enable this if you use BLHeli_32 or BLHeli_S ESCs with DShot.',
    wikiUrl: 'https://ardupilot.org/copter/docs/common-dshot.html',
  },
  SERVO_DSHOT_ESC: {
    tip: 'DShot ESC firmware type (BLHeli32, Kiss, etc.).',
    explain: 'Tells the FC which DShot command set to use. BLHeli32/BLHeli_S is the most common. Kiss uses a slightly different protocol. Set to None if you are not using DShot. This setting enables DShot-specific features like beeping, LED control, and direction reversal.',
  },
  SERVO_BLH_RVMASK: {
    tip: 'Which motors have reversed direction via DShot.',
    explain: 'A bitmask indicating which motor outputs have been reversed using DShot direction commands. When you toggle motor direction in the ESC page, this bitmask is updated so the FC knows which motors spin the opposite direction and can compensate for yaw. This only works with DShot protocol and BLHeli_32 or AM32 ESCs.',
    wikiUrl: 'https://ardupilot.org/copter/docs/common-dshot.html',
  },
  SERVO_DSHOT_RATE: {
    tip: 'DShot output rate multiplier.',
    explain: 'Controls how fast DShot commands are sent to ESCs, as a multiple of the main loop rate. 0 means 1x the loop rate (default, works for all setups). Higher values send commands more frequently, which can improve response on high-performance racing builds but uses more CPU. Most builds should leave this at 0.',
  },
  dshot_concept: {
    tip: 'Digital motor protocol -- no calibration, supports telemetry.',
    explain: 'DShot replaces the old analog PWM signal with a digital packet. Benefits: no ESC calibration needed (the signal is absolute, not relative), motor direction can be reversed in software, ESCs can report RPM and temperature back to the FC, and the signal is immune to electrical noise. DShot150/300/600/1200 differ only in speed. DShot600 is recommended for most builds. Requires BLHeli_32, BLHeli_S, or AM32 ESC firmware.',
    wikiUrl: 'https://ardupilot.org/copter/docs/common-dshot.html',
  },
};
