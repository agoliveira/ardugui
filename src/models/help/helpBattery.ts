import type { HelpEntry } from './index';

export const HELP_BATTERY: Record<string, HelpEntry> = {
  BATT_MONITOR: {
    tip: 'How the FC reads battery voltage and current.',
    explain: 'Most flight controllers have a built-in voltage/current sensor connected to an analog pin. "Analog Voltage + Current" (type 4) is the most common and measures both voltage (for cell monitoring) and current draw (for mAh tracking and remaining capacity). Some boards use SMBus smart batteries or DroneCAN sensors instead. Disabled (type 0) means no battery monitoring at all -- not recommended.',
    wikiUrl: 'https://ardupilot.org/copter/docs/common-power-module-configuration-in-mission-planner.html',
  },
  BATT_VOLT_MULT: {
    tip: 'Voltage divider calibration multiplier.',
    explain: 'The FC reads a reduced voltage through a resistor divider and multiplies it by this value to get the real battery voltage. If the displayed voltage doesn\'t match your multimeter reading, adjust this value up or down. Most power modules ship with this set correctly (typically 11.0-11.1), but manufacturing tolerance means it may be off by 0.1-0.5V.',
    wikiUrl: 'https://ardupilot.org/copter/docs/common-power-module-configuration-in-mission-planner.html',
  },
  BATT_AMP_PERVLT: {
    tip: 'Current sensor sensitivity (amps per volt).',
    explain: 'The current sensor outputs a voltage proportional to current draw. This multiplier converts that voltage to amps. The correct value depends on your power module -- check the datasheet. Common values: 17 for 3DR/HK power modules, 39 for Matek PM modules. Wrong value means inaccurate mAh tracking and unreliable remaining-capacity failsafe.',
  },
  BATT_CAPACITY: {
    tip: 'Battery capacity in milliamp-hours (mAh).',
    explain: 'The rated capacity of your battery pack (printed on the label). Used to estimate remaining battery percentage via current integration. A 5200mAh 4S pack would be set to 5200. This must be updated whenever you change to a different battery size, or the remaining-capacity failsafe will trigger too early or too late.',
  },
  BATT_LOW_VOLT: {
    tip: 'Low battery warning voltage threshold.',
    explain: 'When pack voltage drops below this, the low-battery failsafe triggers (action set by BATT_FS_LOW_ACT). For LiPo batteries, 3.5V per cell is a common low warning -- 14.0V for 4S, 21.0V for 6S. Setting this too low risks damaging the battery. Setting it too high means nuisance failsafes during high-current maneuvers.',
    wikiUrl: 'https://ardupilot.org/copter/docs/failsafe-battery.html',
  },
  BATT_CRT_VOLT: {
    tip: 'Critical battery voltage threshold (emergency).',
    explain: 'When voltage drops below this, the critical-battery failsafe triggers. This is the "land now or crash" threshold. Typically 3.3V per cell -- 13.2V for 4S, 19.8V for 6S. Must be lower than the low-voltage threshold. The critical action should be more aggressive than the low action (e.g. Land instead of RTL).',
    wikiUrl: 'https://ardupilot.org/copter/docs/failsafe-battery.html',
  },
  BATT_FS_LOW_ACT: {
    tip: 'What to do when battery reaches "low" threshold.',
    explain: 'RTL (Return to Launch) is recommended -- the aircraft flies home while it still has enough power to do so safely. Land immediately is more aggressive but may strand the aircraft far from you. "None" means no automatic action, which risks a crash when the battery dies mid-flight.',
    wikiUrl: 'https://ardupilot.org/copter/docs/failsafe-battery.html',
  },
  BATT_FS_CRT_ACT: {
    tip: 'What to do when battery reaches "critical" threshold.',
    explain: 'Land is recommended for critical -- at this point there may not be enough power to fly home. SmartRTL (retrace path home) is a good alternative if your takeoff point is close. This action should be more urgent than the low-battery action because there is very little flight time remaining.',
    wikiUrl: 'https://ardupilot.org/copter/docs/failsafe-battery.html',
  },
  cell_count: {
    tip: 'Number of cells in series (3S, 4S, 6S, etc.).',
    explain: 'Determines voltage thresholds per cell. A 4S battery is 4 cells in series, nominal 14.8V (3.7V/cell), full at 16.8V (4.2V/cell). Cell count multiplied by per-cell voltage limits gives the pack-level thresholds for failsafe. If you change battery cell count, the voltage thresholds must be updated.',
  },
};
