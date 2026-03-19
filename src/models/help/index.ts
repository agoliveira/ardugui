/**
 * Help system types and central index.
 *
 * Help entries are organized by domain (motors, receiver, battery, etc.)
 * and re-exported here for a single import point.
 *
 * Two components consume this data:
 *   - HelpTip: (?) icon on standalone pages, tooltip + expandable panel
 *   - StepHelp: collapsible "What is this?" bar on wizard steps
 */

export interface HelpEntry {
  /** One-liner tooltip (Tier 1). Shows on hover. */
  tip: string;
  /** Plain-English explanation (Tier 2). What, why, consequences. */
  explain: string;
  /** ArduPilot wiki URL path. Full URL, vehicle-type-aware. */
  wikiUrl?: string;
}

export interface StepHelpEntry {
  /** One-line summary visible in collapsed state. */
  summary: string;
  /** Full explanation shown when expanded. 2-3 paragraphs. */
  detail: string;
  /** Wiki link for "Learn more". */
  wikiUrl?: string;
}

// Re-export all domain help
export { HELP_FRAME } from './helpFrame';
export { HELP_MOTORS } from './helpMotors';
export { HELP_RECEIVER } from './helpReceiver';
export { HELP_GPS } from './helpGps';
export { HELP_BATTERY } from './helpBattery';
export { HELP_FAILSAFES } from './helpFailsafes';
export { HELP_MODES } from './helpModes';
export { HELP_TUNE } from './helpTune';
export { HELP_ESC } from './helpEsc';
export { HELP_SURFACES } from './helpSurfaces';
export { WIZARD_STEP_HELP } from './helpWizardSteps';

/** Lookup a help entry by key across all domains. */
import { HELP_FRAME } from './helpFrame';
import { HELP_MOTORS } from './helpMotors';
import { HELP_RECEIVER } from './helpReceiver';
import { HELP_GPS } from './helpGps';
import { HELP_BATTERY } from './helpBattery';
import { HELP_FAILSAFES } from './helpFailsafes';
import { HELP_MODES } from './helpModes';
import { HELP_TUNE } from './helpTune';
import { HELP_ESC } from './helpEsc';
import { HELP_SURFACES } from './helpSurfaces';

const ALL_HELP: Record<string, HelpEntry> = {
  ...HELP_FRAME,
  ...HELP_MOTORS,
  ...HELP_RECEIVER,
  ...HELP_GPS,
  ...HELP_BATTERY,
  ...HELP_FAILSAFES,
  ...HELP_MODES,
  ...HELP_TUNE,
  ...HELP_ESC,
  ...HELP_SURFACES,
};

export function getHelp(key: string): HelpEntry | null {
  return ALL_HELP[key] ?? null;
}
