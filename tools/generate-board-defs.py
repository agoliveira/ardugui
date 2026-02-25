#!/usr/bin/env python3
"""
Convert scraped hwdef JSON to TypeScript BoardDef entries for ArduGUI.
=====================================================================

Takes the output of scrape-hwdef.py and generates TypeScript source code
that extends the existing boardRegistry.ts with enriched board data.

Usage:
    python3 tools/generate-board-defs.py [--input boards-scraped.json] [--output src/models/boardData.ts]
"""

import argparse
import json
import re
import sys
from pathlib import Path
from textwrap import indent


# ── Board metadata we add manually (not in hwdef) ──────────────────
# This covers things like manufacturer, human-friendly names, wiki URLs,
# USB VID/PID, physical dimensions, etc. that hwdef doesn't contain.

BOARD_METADATA = {
    # ── Matek ──
    'MatekF405-Wing': {
        'name': 'Matek F405-Wing',
        'manufacturer': 'Matek',
        'description': 'Matek F405-Wing fixed-wing controller',
        'wikiUrl': 'https://ardupilot.org/plane/docs/common-matekf405-wing.html',
        'usbVendorId': '1209', 'usbProductId': '5740',
        'dimensions': (36, 36), 'formFactor': 'standard',
    },
    'MatekF405-TE': {
        'name': 'Matek F405-TE (VTOL)',
        'manufacturer': 'Matek',
        'description': 'Matek F405-TE VTOL controller',
        'wikiUrl': 'https://ardupilot.org/plane/docs/common-matekf405-te.html',
        'usbVendorId': '1209', 'usbProductId': '5740',
        'dimensions': (36, 36), 'formFactor': 'standard',
    },
    'MatekH743': {
        'name': 'Matek H743-Wing',
        'manufacturer': 'Matek',
        'description': 'Matek H743-Wing (v1/v2)',
        'wikiUrl': 'https://ardupilot.org/copter/docs/common-matekh743-wing.html',
        'usbVendorId': '1209', 'usbProductId': '5740',
        'dimensions': (44, 29), 'formFactor': 'standard',
    },
    'MatekH743-Mini': {
        'name': 'Matek H743-Mini',
        'manufacturer': 'Matek',
        'description': 'Matek H743-Mini compact controller',
        'wikiUrl': 'https://ardupilot.org/copter/docs/common-matekh743-mini.html',
        'usbVendorId': '1209', 'usbProductId': '5740',
        'dimensions': (36, 36), 'formFactor': 'mini',
    },
    'MatekH743-Slim': {
        'name': 'Matek H743-Slim',
        'manufacturer': 'Matek',
        'description': 'Matek H743-Slim low-profile controller',
        'wikiUrl': 'https://ardupilot.org/copter/docs/common-matekh743-slim.html',
        'usbVendorId': '1209', 'usbProductId': '5740',
        'dimensions': (36, 36), 'formFactor': 'mini',
    },
    'MatekF405-STD': {
        'name': 'Matek F405-STD',
        'manufacturer': 'Matek',
        'description': 'Matek F405-STD standard controller',
        'wikiUrl': 'https://ardupilot.org/copter/docs/common-matekf405-std.html',
        'usbVendorId': '1209', 'usbProductId': '5740',
        'dimensions': (36, 36), 'formFactor': 'standard',
    },
    'MatekF765-Wing': {
        'name': 'Matek F765-Wing',
        'manufacturer': 'Matek',
        'description': 'Matek F765-Wing premium fixed-wing controller',
        'wikiUrl': 'https://ardupilot.org/plane/docs/common-matekf765-wing.html',
        'usbVendorId': '1209', 'usbProductId': '5740',
        'dimensions': (44, 29), 'formFactor': 'standard',
    },
    # ── Holybro Kakute ──
    'KakuteF4': {
        'name': 'Holybro Kakute F4',
        'manufacturer': 'Holybro',
        'description': 'Holybro Kakute F4 AIO flight controller',
        'wikiUrl': 'https://ardupilot.org/copter/docs/common-holybro-kakutef4.html',
        'usbVendorId': '1209', 'usbProductId': '5740',
        'dimensions': (35, 35), 'formFactor': 'mini',
    },
    'KakuteF7': {
        'name': 'Holybro Kakute F7',
        'manufacturer': 'Holybro',
        'description': 'Holybro Kakute F7 AIO flight controller',
        'wikiUrl': 'https://ardupilot.org/copter/docs/common-holybro-kakutef7aio.html',
        'usbVendorId': '1209', 'usbProductId': '5740',
        'dimensions': (35, 35), 'formFactor': 'mini',
    },
    'KakuteH7': {
        'name': 'Holybro Kakute H7',
        'manufacturer': 'Holybro',
        'description': 'Holybro Kakute H7 flight controller',
        'wikiUrl': 'https://ardupilot.org/copter/docs/common-holybro-kakuteh7.html',
        'usbVendorId': '1209', 'usbProductId': '5740',
        'dimensions': (35, 35), 'formFactor': 'mini',
    },
    'KakuteH7Mini': {
        'name': 'Holybro Kakute H7 Mini',
        'manufacturer': 'Holybro',
        'description': 'Holybro Kakute H7 Mini 20x20 controller',
        'wikiUrl': 'https://ardupilot.org/copter/docs/common-holybro-kakuteh7mini.html',
        'usbVendorId': '1209', 'usbProductId': '5740',
        'dimensions': (26, 26), 'formFactor': 'mini',
    },
    'KakuteH7-Wing': {
        'name': 'Holybro Kakute H7-Wing',
        'manufacturer': 'Holybro',
        'description': 'Holybro Kakute H7 Wing fixed-wing controller',
        'wikiUrl': 'https://ardupilot.org/plane/docs/common-holybro-kakuteh7wing.html',
        'usbVendorId': '1209', 'usbProductId': '5740',
        'dimensions': (44, 29), 'formFactor': 'standard',
    },
    # ── SpeedyBee ──
    'SpeedyBeeF405v3': {
        'name': 'SpeedyBee F405 V3',
        'manufacturer': 'SpeedyBee',
        'description': 'SpeedyBee F405 V3 AIO controller',
        'wikiUrl': 'https://ardupilot.org/copter/docs/common-speedybeef405v3.html',
        'usbVendorId': '1209', 'usbProductId': '5740',
        'dimensions': (33, 33), 'formFactor': 'mini',
    },
    'SpeedyBeeF405v4': {
        'name': 'SpeedyBee F405 V4',
        'manufacturer': 'SpeedyBee',
        'description': 'SpeedyBee F405 V4 AIO controller',
        'wikiUrl': 'https://ardupilot.org/copter/docs/common-speedybeef405v4.html',
        'usbVendorId': '1209', 'usbProductId': '5740',
        'dimensions': (33, 33), 'formFactor': 'mini',
    },
    'SpeedyBeeF405Wing': {
        'name': 'SpeedyBee F405 Wing',
        'manufacturer': 'SpeedyBee',
        'description': 'SpeedyBee F405 Wing fixed-wing controller',
        'wikiUrl': 'https://ardupilot.org/plane/docs/common-speedybeef405wing.html',
        'usbVendorId': '1209', 'usbProductId': '5740',
        'dimensions': (36, 36), 'formFactor': 'standard',
    },
    'SpeedyBeeF405Mini': {
        'name': 'SpeedyBee F405 Mini',
        'manufacturer': 'SpeedyBee',
        'description': 'SpeedyBee F405 Mini 20x20 controller',
        'wikiUrl': 'https://ardupilot.org/copter/docs/common-speedybeef405mini.html',
        'usbVendorId': '1209', 'usbProductId': '5740',
        'dimensions': (26, 26), 'formFactor': 'mini',
    },
    # ── Pixhawk family ──
    'fmuv3': {
        'name': 'Pixhawk 2.4.8 (FMUv3)',
        'manufacturer': '3D Robotics / mRo',
        'description': 'Classic Pixhawk 1 / FMUv3',
        'wikiUrl': 'https://ardupilot.org/copter/docs/common-pixhawk-overview.html',
        'usbVendorId': '26ac', 'usbProductId': '0011',
        'dimensions': (82, 50), 'formFactor': 'standard',
    },
    'Pixhawk1': {
        'name': 'Pixhawk 1',
        'manufacturer': '3D Robotics / mRo',
        'description': 'Pixhawk 1 (alias for FMUv3)',
        'wikiUrl': 'https://ardupilot.org/copter/docs/common-pixhawk-overview.html',
        'usbVendorId': '26ac', 'usbProductId': '0011',
        'dimensions': (82, 50), 'formFactor': 'standard',
    },
    'Pixhawk4': {
        'name': 'Holybro Pixhawk 4',
        'manufacturer': 'Holybro',
        'description': 'Holybro Pixhawk 4 (FMUv5)',
        'wikiUrl': 'https://ardupilot.org/copter/docs/common-pixhawk4.html',
        'usbVendorId': '3162', 'usbProductId': '004b',
        'dimensions': (84, 44), 'formFactor': 'standard',
    },
    'Pixhawk6X': {
        'name': 'Holybro Pixhawk 6X',
        'manufacturer': 'Holybro',
        'description': 'Holybro Pixhawk 6X (FMUv6X)',
        'wikiUrl': 'https://ardupilot.org/copter/docs/common-holybro-pixhawk6X.html',
        'usbVendorId': '3162', 'usbProductId': '0060',
        'dimensions': (84, 44), 'formFactor': 'standard',
    },
    'Pixhawk6C': {
        'name': 'Holybro Pixhawk 6C',
        'manufacturer': 'Holybro',
        'description': 'Holybro Pixhawk 6C (FMUv6C)',
        'wikiUrl': 'https://ardupilot.org/copter/docs/common-holybro-pixhawk6C.html',
        'usbVendorId': '3162', 'usbProductId': '0060',
        'dimensions': (84, 44), 'formFactor': 'standard',
    },
    # ── Cube ──
    'CubeBlack': {
        'name': 'Cube Black',
        'manufacturer': 'CubePilot / Hex',
        'description': 'CubePilot Cube Black autopilot',
        'wikiUrl': 'https://ardupilot.org/copter/docs/common-thecube-overview.html',
        'usbVendorId': '2dae', 'usbProductId': '1101',
        'dimensions': (95, 40), 'formFactor': 'cube',
    },
    'CubeOrange': {
        'name': 'Cube Orange',
        'manufacturer': 'CubePilot / Hex',
        'description': 'CubePilot Cube Orange autopilot',
        'wikiUrl': 'https://ardupilot.org/copter/docs/common-thecubeorange-overview.html',
        'usbVendorId': '2dae', 'usbProductId': '1016',
        'dimensions': (95, 40), 'formFactor': 'cube',
    },
    'CubeOrangePlus': {
        'name': 'Cube Orange+',
        'manufacturer': 'CubePilot / Hex',
        'description': 'CubePilot Cube Orange+ with upgraded sensors',
        'wikiUrl': 'https://ardupilot.org/copter/docs/common-thecubeorange-overview.html',
        'usbVendorId': '2dae', 'usbProductId': '1016',
        'dimensions': (95, 40), 'formFactor': 'cube',
    },
    # ── Others ──
    'omnibusf4pro': {
        'name': 'Omnibus F4 Pro',
        'manufacturer': 'Airbot',
        'description': 'Omnibus F4 Pro AIO (classic)',
        'wikiUrl': 'https://ardupilot.org/copter/docs/common-omnibusf4pro.html',
        'usbVendorId': '1209', 'usbProductId': '5740',
        'dimensions': (36, 36), 'formFactor': 'standard',
    },
    'mRoControlZeroH7': {
        'name': 'mRo Control Zero H7',
        'manufacturer': 'mRo',
        'description': 'mRo Control Zero H7 OEM autopilot',
        'wikiUrl': 'https://ardupilot.org/copter/docs/common-mro-control-zero-h7.html',
        'usbVendorId': '26ac', 'usbProductId': '0011',
        'dimensions': (36, 36), 'formFactor': 'mini',
    },
    'BlitzF745AIO': {
        'name': 'iFlight Blitz F745 AIO',
        'manufacturer': 'iFlight',
        'description': 'iFlight Blitz F745 AIO flight controller',
        'wikiUrl': 'https://ardupilot.org/copter/docs/common-iflight-blitzf7.html',
        'usbVendorId': '1209', 'usbProductId': '5740',
        'dimensions': (36, 36), 'formFactor': 'mini',
    },
}


# ── TypeScript Generation ───────────────────────────────────────────

def to_ts_id(folder_name: str) -> str:
    """Convert folder name to a valid TypeScript identifier."""
    # Replace + with Plus before stripping (e.g. CubeBlack+ → CubeBlackPlus)
    cleaned = folder_name.replace('+', 'Plus')
    # Strip any remaining characters that aren't alphanumeric, hyphen, or underscore
    cleaned = re.sub(r'[^a-zA-Z0-9\-_]', '', cleaned)
    # Remove hyphens/underscores and make camelCase
    parts = re.split(r'[-_]', cleaned)
    parts = [p for p in parts if p]  # Remove empty parts
    if not parts:
        return 'boardUnknown'
    result = parts[0].lower() + ''.join(p.capitalize() for p in parts[1:])
    # Ensure starts with lowercase letter
    if result[0].isdigit():
        result = 'board' + result
    return result


def escape_ts_string(s: str) -> str:
    """Escape a string for use in a TypeScript single-quoted string literal."""
    return s.replace('\\', '\\\\').replace("'", "\\'")


def generate_ts_board(board: dict, metadata: dict) -> str:
    """Generate a TypeScript BoardDef constant for a single board."""
    meta = metadata or {}
    folder = board['folderName']
    ts_id = to_ts_id(folder)

    name = escape_ts_string(meta.get('name', folder))
    manufacturer = escape_ts_string(meta.get('manufacturer', 'Unknown'))
    description = escape_ts_string(meta.get('description', folder))
    wiki = meta.get('wikiUrl', f'https://ardupilot.org/copter/docs/common-{folder.lower()}.html')
    vid = meta.get('usbVendorId', '')
    pid = meta.get('usbProductId', '')
    dims = meta.get('dimensions', (36, 36))
    form = meta.get('formFactor', 'standard')

    # Build the output groups
    output_groups_ts = ''
    if board.get('outputGroups'):
        groups = []
        for g in board['outputGroups']:
            caps = ', '.join(f"'{c}'" for c in g['capabilities'])
            groups.append(
                f"    {{ outputs: [{', '.join(str(o) for o in g['outputs'])}], "
                f"timer: '{g['timer']}', capabilities: [{caps}] }}"
            )
        output_groups_ts = '[\n' + ',\n'.join(groups) + '\n  ]'

    # Build sensors
    sensors = board.get('sensors', {})
    imu_ts = ', '.join(f"'{s}'" for s in sensors.get('imu', []))
    baro_ts = ', '.join(f"'{s}'" for s in sensors.get('barometer', []))
    compass_ts = ', '.join(f"'{s}'" for s in sensors.get('compass', []))
    osd_ts = f"'{sensors['osd']}'" if sensors.get('osd') else 'null'
    flash_ts = f"'{sensors['flash']}'" if sensors.get('flash') else 'null'
    sdcard_ts = 'true' if sensors.get('sdcard') else 'false'

    # Build battery
    batt = board.get('battery', {})
    batt_ts = ''
    if batt.get('voltPin') is not None or batt.get('currPin') is not None:
        parts = []
        if batt.get('voltPin') is not None:
            parts.append(f"voltPin: {batt['voltPin']}")
        if batt.get('currPin') is not None:
            parts.append(f"currPin: {batt['currPin']}")
        if batt.get('voltMult') is not None:
            parts.append(f"voltMult: {batt['voltMult']}")
        if batt.get('ampPerVolt') is not None:
            parts.append(f"ampPerVolt: {batt['ampPerVolt']}")
        batt_ts = '{ ' + ', '.join(parts) + ' }'

    # Build UART summary
    uart_map_parts = []
    for u in board.get('uarts', []):
        if not u.get('isUsb') and not u.get('isEmpty'):
            uart_map_parts.append(f"    SERIAL{u['serialIndex']}: '{u['uartName']}'")
    uart_map_ts = '{\n' + ',\n'.join(uart_map_parts) + '\n  }' if uart_map_parts else '{}'

    # Build features
    features = board.get('features', {})

    lines = [
        f"export const {ts_id}: ExtendedBoardDef = {{",
        f"  id: '{folder.lower()}',",
        f"  name: '{name}',",
        f"  description: '{description}',",
        f"  manufacturer: '{manufacturer}',",
        f"  mcu: '{board.get('mcuType', '')}',",
        f"  wikiUrl: '{wiki}',",
    ]

    if vid:
        lines.append(f"  usbVendorId: '{vid}',")
    if pid:
        lines.append(f"  usbProductId: '{pid}',")

    lines.extend([
        f"  dimensions: {{ width: {dims[0]}, height: {dims[1]} }},",
        f"  formFactor: '{form}',",
        f"  connectors: [],  // TODO: add physical connector layout",
        f"  uartMap: {uart_map_ts},",
    ])

    if board.get('apjBoardId'):
        lines.append(f"  apjBoardId: {board['apjBoardId']},")

    lines.append(f"  serialOrder: [{', '.join(repr(s) for s in board.get('serialOrder', []))}],")

    # Output groups
    if output_groups_ts:
        lines.append(f"  outputGroups: {output_groups_ts},")

    lines.append(f"  pwmOutputCount: {len(board.get('pwmOutputs', []))},")

    # Sensors
    lines.extend([
        f"  builtinSensors: {{",
        f"    imu: [{imu_ts}],",
        f"    barometer: [{baro_ts}],",
        f"    compass: [{compass_ts}],",
        f"    osd: {osd_ts},",
        f"    flash: {flash_ts},",
        f"    sdcard: {sdcard_ts},",
        f"  }},",
    ])

    # Battery
    if batt_ts:
        lines.append(f"  batteryMonitor: {batt_ts},")

    # I2C
    i2c = board.get('i2cBuses', [])
    if i2c:
        lines.append(f"  i2cBuses: {len(i2c)},")

    # Features
    if features.get('buzzer'):
        lines.append(f"  hasBuzzer: true,")
    if features.get('ledStrip'):
        led_pin = features.get('ledPin', '')
        lines.append(f"  hasLedStrip: true,")
        if led_pin:
            lines.append(f"  ledStripOutput: '{led_pin}',")
    if features.get('safetySwitch'):
        lines.append(f"  hasSafetySwitch: true,")
    if features.get('canInterfaces', 0) > 0:
        lines.append(f"  canInterfaces: {features['canInterfaces']},")

    # RC Input
    rc = board.get('rcInput', {})
    if rc.get('type'):
        rc_parts = [f"type: '{rc['type']}' as const"]
        if rc.get('serialIndex') is not None:
            rc_parts.append(f"serialIndex: {rc['serialIndex']}")
        if rc.get('pin'):
            rc_parts.append(f"padLabel: '{rc['pin']}'")
        lines.append(f"  defaultRcInput: {{ {', '.join(rc_parts)} }},")

    lines.append("};")
    return '\n'.join(lines)


def generate_ts_file(boards: list, metadata: dict) -> str:
    """Generate the complete TypeScript file."""
    header = '''/**
 * Extended Board Data — Auto-generated from ArduPilot hwdef files
 *
 * DO NOT EDIT MANUALLY — regenerate with:
 *   python3 tools/scrape-hwdef.py
 *   python3 tools/generate-board-defs.py
 *
 * This file extends the base BoardDef interface with hardware-specific
 * data needed by the setup wizard: output groups, sensors, battery
 * monitoring, RC input, and feature flags.
 */

import type { BoardDef } from './boardRegistry';

// ── Extended Interface ─────────────────────────────────────────────

export interface OutputGroupDef {
  outputs: number[];
  timer: string;
  capabilities: ('PWM' | 'DShot' | 'BDShot')[];
}

export interface BuiltinSensorsDef {
  imu: string[];
  barometer: string[];
  compass: string[];
  osd: string | null;
  flash: string | null;
  sdcard: boolean;
}

export interface BatteryMonitorDef {
  voltPin?: number;
  currPin?: number;
  voltMult?: number;
  ampPerVolt?: number;
}

export interface DefaultRcInputDef {
  type: 'dedicated_sbus' | 'uart' | 'timer' | 'ppm';
  serialIndex?: number;
  padLabel?: string;
}

export interface ExtendedBoardDef extends BoardDef {
  /** APJ_BOARD_ID from firmware */
  apjBoardId?: number;

  /** Raw SERIAL_ORDER from hwdef */
  serialOrder?: string[];

  /** Output groups sharing DShot/PWM rate constraints */
  outputGroups?: OutputGroupDef[];

  /** Total PWM output count */
  pwmOutputCount?: number;

  /** Built-in sensors detected from SPIDEV definitions */
  builtinSensors?: BuiltinSensorsDef;

  /** Battery monitoring ADC configuration */
  batteryMonitor?: BatteryMonitorDef;

  /** Number of I2C buses */
  i2cBuses?: number;

  /** Has buzzer output */
  hasBuzzer?: boolean;

  /** Has addressable LED strip output */
  hasLedStrip?: boolean;
  /** LED strip output pad label */
  ledStripOutput?: string;

  /** Has hardware safety switch */
  hasSafetySwitch?: boolean;

  /** Number of CAN interfaces */
  canInterfaces?: number;

  /** Default RC input configuration */
  defaultRcInput?: DefaultRcInputDef;
}

// ── Board Definitions ──────────────────────────────────────────────
'''

    board_blocks = []
    generated_ids = []

    for board in boards:
        folder = board['folderName']
        meta = metadata.get(folder, {})
        try:
            ts = generate_ts_board(board, meta)
            board_blocks.append(ts)
            generated_ids.append((to_ts_id(folder), board.get('apjBoardId')))
        except Exception as e:
            print(f"  WARNING: Failed to generate TS for {folder}: {e}", file=sys.stderr)

    # Board ID map
    id_map_entries = []
    for ts_id, apj_id in generated_ids:
        if apj_id:
            id_map_entries.append(f"  [{apj_id}, {ts_id}]")

    id_map_body = ',\n'.join(id_map_entries)
    all_boards_body = ',\n  '.join(ts_id for ts_id, _ in generated_ids)

    id_map = f"""
// ── Board ID Map ───────────────────────────────────────────────────

export const EXTENDED_BOARD_ID_MAP: Map<number, ExtendedBoardDef> = new Map([
{id_map_body}
]);

// ── All Extended Boards ────────────────────────────────────────────

export const ALL_EXTENDED_BOARDS: ExtendedBoardDef[] = [
  {all_boards_body}
];

/**
 * Find an extended board definition by APJ_BOARD_ID.
 */
export function getExtendedBoard(apjBoardId: number): ExtendedBoardDef | null {{
  return EXTENDED_BOARD_ID_MAP.get(apjBoardId) ?? null;
}}

/**
 * Find an extended board definition by folder name.
 */
export function getExtendedBoardByName(name: string): ExtendedBoardDef | null {{
  return ALL_EXTENDED_BOARDS.find(b => b.id === name.toLowerCase()) ?? null;
}}
"""

    return header + '\n\n'.join(board_blocks) + '\n' + id_map


# ── Main ────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Convert scraped hwdef JSON to TypeScript board definitions"
    )
    parser.add_argument(
        '--input', '-i',
        default='tools/boards-scraped.json',
        help='Input JSON file from scrape-hwdef.py'
    )
    parser.add_argument(
        '--output', '-o',
        default='src/models/boardData.ts',
        help='Output TypeScript file'
    )
    parser.add_argument(
        '--priority-only',
        action='store_true',
        help='Only generate priority boards'
    )
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"ERROR: Input file not found: {input_path}", file=sys.stderr)
        print("Run scrape-hwdef.py first.", file=sys.stderr)
        sys.exit(1)

    data = json.loads(input_path.read_text())
    boards = data['boards']

    if args.priority_only:
        boards = [b for b in boards if b.get('isPriority')]

    print(f"Generating TypeScript for {len(boards)} boards...")

    ts_content = generate_ts_file(boards, BOARD_METADATA)

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(ts_content)

    print(f"Written to {output_path}")
    print(f"  {len(boards)} board definitions generated")
    print(f"  {sum(1 for b in boards if b.get('apjBoardId'))} boards with APJ_BOARD_ID")


if __name__ == '__main__':
    main()
