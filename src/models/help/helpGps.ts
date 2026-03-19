import type { HelpEntry } from './index';

export const HELP_GPS: Record<string, HelpEntry> = {
  GPS_TYPE: {
    tip: 'GPS module protocol (Auto usually works).',
    explain: 'Most GPS modules are auto-detected. Set to 1 (Auto) unless you have a specific module that requires manual selection. If GPS is not detected after power-on, check wiring and make sure the serial port protocol is set to GPS.',
    wikiUrl: 'https://ardupilot.org/copter/docs/common-gps-overview.html',
  },
  GPS_GNSS_MODE: {
    tip: 'Which satellite constellations to use.',
    explain: 'Modern GPS modules can receive signals from multiple satellite systems: GPS (US), SBAS (augmentation), Galileo (EU), BeiDou (China), and GLONASS (Russia). Enabling all of them (value 31) gives the best accuracy and fastest fix because more satellites are visible at any time. There is no downside to enabling all -- the module automatically uses the best available signals.',
    wikiUrl: 'https://ardupilot.org/copter/docs/common-gps-overview.html',
  },
  gps_fix: {
    tip: 'Current GPS fix quality.',
    explain: 'Fix type indicates how accurately the GPS knows its position. No Fix means no satellite contact. 2D Fix has horizontal position but no altitude (not safe to fly). 3D Fix is the minimum for GPS-assisted flight modes like Loiter and RTL. RTK Fixed is centimeter-level precision (requires a base station). You need at least a 3D fix with 6+ satellites before flying any GPS mode.',
  },
  gps_hdop: {
    tip: 'Horizontal Dilution of Precision -- lower is better.',
    explain: 'HDOP measures how spread out the visible satellites are across the sky. Lower numbers mean better geometry and more accurate position. Under 1.0 is excellent, 1.0-2.0 is good, above 2.0 is marginal. ArduPilot defaults to requiring HDOP below 1.4 before arming in GPS modes. If HDOP is high, wait -- it usually improves as more satellites are acquired.',
  },
};
