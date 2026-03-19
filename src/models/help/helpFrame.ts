import type { HelpEntry } from './index';

export const HELP_FRAME: Record<string, HelpEntry> = {
  FRAME_CLASS: {
    tip: 'The physical shape of your aircraft (quad, hex, plane, etc.).',
    explain: 'Frame class tells the flight controller how many motors it has and how they are arranged. Getting this wrong means the FC will try to control motors that don\'t exist or ignore motors that do. For copters, this determines motor count and layout. For planes, this sets the control surface mixing. For VTOL, it defines both the hover motor arrangement and the forward flight surfaces.',
    wikiUrl: 'https://ardupilot.org/copter/docs/frame-type-configuration.html',
  },
  FRAME_TYPE: {
    tip: 'Motor layout variant (X, +, H, V, etc.).',
    explain: 'Within each frame class, the type defines the exact motor positions and rotation directions. For example, a Quad can be X (motors at 45-degree diagonals), + (motors at 0/90/180/270), or H (wider stance). The most common is X. The difference matters because the FC uses this to calculate how much throttle each motor needs for a given movement.',
    wikiUrl: 'https://ardupilot.org/copter/docs/frame-type-configuration.html',
  },
};
