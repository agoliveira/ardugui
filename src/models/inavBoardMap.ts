/**
 * inavBoardMap.ts -- Map INAV board target names to ArduPilot firmware platforms.
 *
 * Used during INAV migration to determine which ArduPilot firmware to download.
 * The key is the INAV target name (from CLI "status" or diff header).
 * The value is the ArduPilot firmware platform name (used in manifest URLs).
 *
 * Only boards that have BOTH an INAV and ArduPilot firmware are listed.
 * If a board isn't here, ArduPilot doesn't support it (or the mapping is unknown).
 */

export interface InavBoardMapping {
  /** ArduPilot firmware platform name (e.g. "MatekF405-Wing") */
  arduPlatform: string;
  /** Human-readable board name */
  displayName: string;
  /** Notes for the user (e.g. "VTOL variant") */
  notes?: string;
}

/**
 * Mapping from INAV target name -> ArduPilot platform.
 *
 * This is a curated list of the most common boards. Community contributions
 * can add more mappings over time. The INAV target name is always uppercase.
 */
export const INAV_TO_ARDUPILOT: Record<string, InavBoardMapping> = {
  // -- Matek --
  'MATEKF405': { arduPlatform: 'MatekF405', displayName: 'Matek F405-STD' },
  'MATEKF405SE': { arduPlatform: 'MatekF405-Wing', displayName: 'Matek F405-SE / Wing' },
  'MATEKF405WING': { arduPlatform: 'MatekF405-Wing', displayName: 'Matek F405-Wing' },
  'MATEKF405TE': { arduPlatform: 'MatekF405-TE', displayName: 'Matek F405-TE (VTOL)', notes: 'VTOL-capable board' },
  'MATEKF405CAN': { arduPlatform: 'MatekF405-CAN', displayName: 'Matek F405-CAN' },
  'MATEKF411': { arduPlatform: 'MatekF411', displayName: 'Matek F411' },
  'MATEKF411SE': { arduPlatform: 'MatekF411-Wing', displayName: 'Matek F411-SE / Wing' },
  'MATEKF411TE': { arduPlatform: 'MatekF411-TE', displayName: 'Matek F411-TE' },
  'MATEKF765WING': { arduPlatform: 'MatekF765-Wing', displayName: 'Matek F765-Wing' },
  'MATEKH743': { arduPlatform: 'MatekH743', displayName: 'Matek H743' },
  'MATEKH743WING': { arduPlatform: 'MatekH743-Wing', displayName: 'Matek H743-Wing' },
  'MATEKH743SLIM': { arduPlatform: 'MatekH743-Slim', displayName: 'Matek H743-Slim' },

  // -- Holybro Kakute --
  'KAKUTEF4': { arduPlatform: 'KakuteF4', displayName: 'Holybro Kakute F4' },
  'KAKUTEF7': { arduPlatform: 'KakuteF7', displayName: 'Holybro Kakute F7' },
  'KAKUTEF7MINIV3': { arduPlatform: 'KakuteF7Mini', displayName: 'Holybro Kakute F7 Mini' },
  'KAKUTEH7': { arduPlatform: 'KakuteH7', displayName: 'Holybro Kakute H7' },
  'KAKUTEH7WING': { arduPlatform: 'KakuteH7-Wing', displayName: 'Holybro Kakute H7 Wing' },
  'KAKUTEH7MINI': { arduPlatform: 'KakuteH7Mini', displayName: 'Holybro Kakute H7 Mini' },

  // -- SpeedyBee --
  'SPEEDYBEEF405V3': { arduPlatform: 'SpeedyBeeF405v3', displayName: 'SpeedyBee F405 V3' },
  'SPEEDYBEEF405V4': { arduPlatform: 'SpeedyBeeF405v4', displayName: 'SpeedyBee F405 V4' },
  'SPEEDYBEEF405WING': { arduPlatform: 'SpeedyBeeF405Wing', displayName: 'SpeedyBee F405 Wing' },
  'SPEEDYBEEF405MINI': { arduPlatform: 'SpeedyBeeF405Mini', displayName: 'SpeedyBee F405 Mini' },

  // -- Flywoo --
  'FLYWOOF405PRO': { arduPlatform: 'FlywooF405Pro', displayName: 'Flywoo F405 Pro' },
  'FLYWOOF405S_AIO': { arduPlatform: 'FlywooF405S-AIO', displayName: 'Flywoo F405S AIO' },
  'FLYWOOF745': { arduPlatform: 'FlywooF745', displayName: 'Flywoo F745' },
  'FLYWOOH743PRO': { arduPlatform: 'FlywooH743Pro', displayName: 'Flywoo H743 Pro' },

  // -- Pixhawk / CubePilot --
  'FMUV3': { arduPlatform: 'fmuv3', displayName: 'Pixhawk 2.4.8 / FMUv3' },
  'FMUV5': { arduPlatform: 'fmuv5', displayName: 'Pixhawk 4 / FMUv5' },

  // -- JHEMCU --
  'JHEMCUGSF405A': { arduPlatform: 'JHEMCU-GSF405A', displayName: 'JHEMCU GSF405A' },
  'JHEMCUH743HD': { arduPlatform: 'JHEMCU-H743HD', displayName: 'JHEMCU H743HD' },

  // -- FoxeerF405 --
  'FOXEERF405V2': { arduPlatform: 'FoxeerF405v2', displayName: 'Foxeer F405 V2' },
  'FOXEERH743V1': { arduPlatform: 'FoxeerH743v1', displayName: 'Foxeer H743 V1' },

  // -- Mamba --
  'MAMBAF405_2022A': { arduPlatform: 'MambaF405-2022', displayName: 'Diatone Mamba F405 2022' },
  'MAMBAF405US': { arduPlatform: 'MambaF405US-I2C', displayName: 'Diatone Mamba F405 US' },
  'MAMBAH743V4': { arduPlatform: 'MambaH743v4', displayName: 'Diatone Mamba H743 V4' },

  // -- BetaFPV --
  'BETAFPVF405': { arduPlatform: 'BetaFPV-F405', displayName: 'BetaFPV F405' },

  // -- iFlight --
  'IFLIGHT_BLITZ_F7_AIO': { arduPlatform: 'BlitzF745AIO', displayName: 'iFlight Blitz F7 AIO' },
  'IFLIGHT_BLITZ_H7_PRO': { arduPlatform: 'BlitzH7Pro', displayName: 'iFlight Blitz H7 Pro' },

  // -- Omnibus --
  'OMNIBUSF4': { arduPlatform: 'omnibusf4', displayName: 'Omnibus F4' },
  'OMNIBUSF4PRO': { arduPlatform: 'omnibusf4pro', displayName: 'Omnibus F4 Pro' },
  'OMNIBUSF4V3': { arduPlatform: 'omnibusf4v3', displayName: 'Omnibus F4 V3' },
  'OMNIBUSF7': { arduPlatform: 'OmnibusF7V2', displayName: 'Omnibus F7' },
};

/**
 * Look up the ArduPilot platform for an INAV board target.
 * Returns null if no mapping exists (board not supported by ArduPilot).
 */
export function lookupArduPilotBoard(inavTarget: string): InavBoardMapping | null {
  // Try exact match first (uppercase)
  const upper = inavTarget.toUpperCase().replace(/[-_\s]/g, '');
  const direct = INAV_TO_ARDUPILOT[inavTarget.toUpperCase()] ?? INAV_TO_ARDUPILOT[upper];
  if (direct) return direct;

  // Fuzzy match: strip common suffixes and retry
  for (const [key, value] of Object.entries(INAV_TO_ARDUPILOT)) {
    const normalized = key.replace(/[-_\s]/g, '');
    if (normalized === upper) return value;
  }

  return null;
}

/**
 * Build the firmware download URL for a _with_bl.hex file.
 * Pattern: firmware.ardupilot.org/{VehicleType}/stable/{Platform}/ardu{type}_with_bl.hex
 */
export function buildHexUrl(
  platform: string,
  vehicleType: 'copter' | 'plane',
  version: string,
): string {
  const typeDir = vehicleType === 'copter' ? 'Copter' : 'Plane';
  const typeName = vehicleType === 'copter' ? 'arducopter' : 'arduplane';
  return `https://firmware.ardupilot.org/${typeDir}/stable-${version}/${platform}/${typeName}_with_bl.hex`;
}

/**
 * Build the firmware download URL for the latest stable.
 */
export function buildLatestHexUrl(
  platform: string,
  vehicleType: 'copter' | 'plane',
): string {
  const typeDir = vehicleType === 'copter' ? 'Copter' : 'Plane';
  const typeName = vehicleType === 'copter' ? 'arducopter' : 'arduplane';
  return `https://firmware.ardupilot.org/${typeDir}/latest/${platform}/${typeName}_with_bl.hex`;
}
