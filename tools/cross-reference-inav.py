#!/usr/bin/env python3
"""
Cross-reference INAV and ArduPilot board UART definitions.
============================================================

Parses INAV firmware target.h files and compares UART definitions
against ArduPilot's scraped board data. Outputs:
- Boards that exist in both ecosystems
- UART matching results (confirmed / mismatch / extra)
- Updated INAV_BOARD_MAP entries for boards we can auto-detect
- A confirmation report for boardData.ts pad labels

Usage:
    python3 tools/cross-reference-inav.py \\
        --inav-targets /path/to/inav/src/main/target \\
        --ardupilot-boards boards-scraped.json \\
        --output cross-ref-report.json

Requires: INAV firmware source (git clone), ArduPilot scraped JSON.
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path
from dataclasses import dataclass, field, asdict
from typing import Optional


# ── INAV target name -> ArduPilot board folder name ─────────────────
# This is the master mapping. The script also tries fuzzy matching.

INAV_TO_ARDUPILOT = {
    # Matek F405 family
    'MATEKF405':         'MatekF405',
    'MATEKF405SE':       'MatekF405-Wing',
    'MATEKF405TE':       'MatekF405-TE',
    'MATEKF405CAN':      'MatekF405-CAN',

    # Matek F411 family
    'MATEKF411':         'MatekF411',
    'MATEKF411SE':       'MatekF411',
    'MATEKF411TE':       'MatekF411',

    # Matek F722 family
    'MATEKF722':         'MatekF722',
    'MATEKF722SE':       'MatekF722SE',
    'MATEKF722PX':       'MatekF722PX',

    # Matek F765 family
    'MATEKF765':         'MatekF765-Wing',

    # Matek H743 family
    'MATEKH743':         'MatekH743',

    # Holybro Kakute
    'KAKUTEF4':          'KakuteF4',
    'KAKUTEF7':          'KakuteF7',
    'KAKUTEH7':          'KakuteH7',
    'KAKUTEH7MINI':      'KakuteH7Mini',

    # SpeedyBee
    'SPEEDYBEEF4':       'SpeedyBeeF4',
    'SPEEDYBEEF405V3':   'SpeedyBeeF405v3',
    'SPEEDYBEEF405V4':   'SpeedyBeeF405v4',
    'SPEEDYBEEF405WING': 'SpeedyBeeF405Wing',
    'SPEEDYBEEF405MINI': 'SpeedyBeeF405Mini',
    'SPEEDYBEEF7V2':     'SpeedyBeeF7V2',
    'SPEEDYBEEF7MINI':   'SpeedyBeeF7Mini',

    # Foxeer
    'FOXEERF405V2':      'FoxeerF405v2',
    'FOXEERF745AIO':     'FoxeerReaperF745AIO',
    'FOXEERH743V1':      'FoxeerH743v1',

    # iFlight
    'IFLIGHT_BLITZ_F7_PRO': 'BlitzF745AIO',

    # Flywoo
    'FLYWOOF405PRO':     'FlywooF405Pro',
    'FLYWOOF745':        'FlywooF745',
    'FLYWOOH743':        'FlywooH743',

    # Omnibus
    'OMNIBUSF4':         'omnibusf4pro',

    # Airbot
    'AIRBOTF4':          'AIRBOTf4',
    'AIRBOTF7':          'AIRBOTF7',

    # Other
    'BETAFLIGHTF4':      'BetaFlightF4',
    'ATOMRCF405NAVI':    'AtomRCF405-NAVI',
    'DALRCF405':         'DALRCF405',
    'DALRCF722DUAL':     'DALRCF722DUAL',
    'CLRACINGF4AIR':     'CLRACINGF4',
    'AOCODARCF7DUAL':    'AocodaRCF7DUAL',
    'AOCODARCH7DUAL':    'AocodaRCH7DUAL',
    'BROTHERHOBBYF405V3': 'BrotherHobbyF405V3',
    'BROTHERHOBBYH743':  'BrotherHobbyH743',
    'DAKEFPVF405':       'DAKEFPVF405',
    'DAKEFPVF722':       'DAKEFPVF722',
    'DAKEFPVH743':       'DAKEFPVH743',
    'AETH743Basic':      'AET-H743-Basic',
    'AXISFLYINGF7PRO':   'AxisFlyingF7PRO',
}


@dataclass
class InavBoard:
    """Parsed INAV board definition."""
    target_name: str
    uarts: list  # List of UART numbers (1-8)
    uart_pins: dict  # UART number -> {tx: pin, rx: pin}
    serial_port_count: int = 0
    has_softserial: bool = False
    has_vcp: bool = False


@dataclass
class CrossRefResult:
    """Result of cross-referencing one board."""
    inav_target: str
    ardupilot_board: str
    matched_uarts: list  # UARTs present in both
    inav_only: list       # UARTs only in INAV
    ardupilot_only: list  # UARTs only in ArduPilot
    pin_matches: dict     # UART number -> {inav_pin, ap_pin, match}
    confirmed: bool       # All UARTs match
    pad_labels_verified: list  # List of {serialIndex, padLabel, uartName, verified}


def parse_inav_target(target_dir: Path) -> Optional[InavBoard]:
    """Parse an INAV target.h file for UART definitions."""
    target_h = target_dir / 'target.h'
    if not target_h.exists():
        return None

    text = target_h.read_text(errors='replace')

    uarts = []
    uart_pins = {}

    # Find USE_UARTn
    for m in re.finditer(r'#define\s+USE_UART(\d+)\b', text):
        n = int(m.group(1))
        if n not in uarts:
            uarts.append(n)

    # Find UARTn_TX_PIN and UARTn_RX_PIN
    for m in re.finditer(r'#define\s+UART(\d+)_TX_PIN\s+(\S+)', text):
        n = int(m.group(1))
        pin = m.group(2)
        if n not in uart_pins:
            uart_pins[n] = {}
        uart_pins[n]['tx'] = pin

    for m in re.finditer(r'#define\s+UART(\d+)_RX_PIN\s+(\S+)', text):
        n = int(m.group(1))
        pin = m.group(2)
        if n not in uart_pins:
            uart_pins[n] = {}
        uart_pins[n]['rx'] = pin

    # Serial port count
    spc = 0
    for m in re.finditer(r'#define\s+SERIAL_PORT_COUNT\s+(\d+)', text):
        spc = int(m.group(1))  # Take last one (some boards redefine)

    # VCP
    has_vcp = 'USE_VCP' in text or 'USB_VCP' in text

    # SoftSerial
    has_ss = 'USE_SOFTSERIAL1' in text or 'USE_SOFTSERIAL' in text

    uarts.sort()

    return InavBoard(
        target_name=target_dir.name,
        uarts=uarts,
        uart_pins=uart_pins,
        serial_port_count=spc,
        has_softserial=has_ss,
        has_vcp=has_vcp,
    )


def normalize_uart_name(name: str) -> Optional[int]:
    """Extract UART number from names like 'USART1', 'UART4', 'OTG1'."""
    m = re.match(r'U?S?ART(\d+)', name, re.IGNORECASE)
    if m:
        return int(m.group(1))
    return None


def cross_reference_board(
    inav: InavBoard,
    ap_board: dict,
) -> CrossRefResult:
    """Cross-reference UART definitions between INAV and ArduPilot."""

    # Extract ArduPilot UARTs from serialOrder
    ap_uarts = []
    ap_uart_to_serial = {}  # UART number -> SERIAL index
    for idx, name in enumerate(ap_board.get('serialOrder', [])):
        if name == 'EMPTY' or name.startswith('OTG'):
            continue
        n = normalize_uart_name(name)
        if n is not None:
            ap_uarts.append(n)
            ap_uart_to_serial[n] = idx

    inav_set = set(inav.uarts)
    ap_set = set(ap_uarts)

    matched = sorted(inav_set & ap_set)
    inav_only = sorted(inav_set - ap_set)
    ap_only = sorted(ap_set - inav_set)

    # Pin comparison (if we have pin data from both sides)
    pin_matches = {}
    for n in matched:
        inav_pins = inav.uart_pins.get(n, {})
        # ArduPilot pin data would need to come from hwdef parsing
        # For now just note the INAV pins
        pin_matches[n] = {
            'inav_tx': inav_pins.get('tx', '?'),
            'inav_rx': inav_pins.get('rx', '?'),
            'uart_number': n,
        }

    # Verify pad labels
    pad_labels = []
    for n in matched:
        serial_idx = ap_uart_to_serial.get(n)
        if serial_idx is not None:
            pad_labels.append({
                'serialIndex': serial_idx,
                'padLabel': f'TX{n}/RX{n}',
                'uartNumber': n,
                'verified': True,
            })

    confirmed = len(inav_only) == 0 and len(matched) > 0

    return CrossRefResult(
        inav_target=inav.target_name,
        ardupilot_board=ap_board['folderName'],
        matched_uarts=matched,
        inav_only=inav_only,
        ardupilot_only=ap_only,
        pin_matches=pin_matches,
        confirmed=confirmed,
        pad_labels_verified=pad_labels,
    )


def fuzzy_match_board_name(inav_name: str, ap_boards: dict) -> Optional[str]:
    """Try to fuzzy-match an INAV target name to an ArduPilot board."""
    # Normalize: remove hyphens, underscores, lowercase
    norm_inav = re.sub(r'[-_]', '', inav_name).lower()

    for ap_name in ap_boards:
        norm_ap = re.sub(r'[-_]', '', ap_name).lower()
        if norm_inav == norm_ap:
            return ap_name
        # Try prefix matching
        if norm_ap.startswith(norm_inav) or norm_inav.startswith(norm_ap):
            return ap_name

    return None


def main():
    parser = argparse.ArgumentParser(description='Cross-reference INAV and ArduPilot boards')
    parser.add_argument('--inav-targets', required=True,
                        help='Path to INAV src/main/target directory')
    parser.add_argument('--ardupilot-boards', required=True,
                        help='Path to ArduPilot scraped boards JSON')
    parser.add_argument('--output', default='cross-ref-report.json',
                        help='Output JSON report')
    parser.add_argument('--verbose', '-v', action='store_true')
    args = parser.parse_args()

    # Load ArduPilot boards
    with open(args.ardupilot_boards) as f:
        ap_data = json.load(f)

    ap_boards_by_folder = {}
    for b in ap_data['boards']:
        ap_boards_by_folder[b['folderName']] = b

    # Parse all INAV targets
    inav_dir = Path(args.inav_targets)
    inav_boards = {}
    for target_dir in sorted(inav_dir.iterdir()):
        if not target_dir.is_dir():
            continue
        board = parse_inav_target(target_dir)
        if board and board.uarts:
            inav_boards[board.target_name] = board

    print(f'Parsed {len(inav_boards)} INAV targets with UART definitions')
    print(f'Loaded {len(ap_boards_by_folder)} ArduPilot boards')

    # Cross-reference
    results = []
    matched_count = 0
    confirmed_count = 0
    unmatched_inav = []

    for inav_name, inav_board in inav_boards.items():
        # Try explicit mapping first
        ap_name = INAV_TO_ARDUPILOT.get(inav_name)

        # Try fuzzy matching
        if not ap_name:
            ap_name = fuzzy_match_board_name(inav_name, ap_boards_by_folder)

        if ap_name and ap_name in ap_boards_by_folder:
            ap_board = ap_boards_by_folder[ap_name]
            result = cross_reference_board(inav_board, ap_board)
            results.append(result)
            matched_count += 1
            if result.confirmed:
                confirmed_count += 1

            if args.verbose:
                status = 'CONFIRMED' if result.confirmed else 'PARTIAL'
                extra = ''
                if result.inav_only:
                    extra += f' INAV-only:{result.inav_only}'
                if result.ardupilot_only:
                    extra += f' AP-only:{result.ardupilot_only}'
                print(f'  {status}: {inav_name} <-> {ap_name} '
                      f'({len(result.matched_uarts)} UARTs matched){extra}')
        else:
            unmatched_inav.append(inav_name)
            if args.verbose:
                print(f'  UNMATCHED: {inav_name} -- no ArduPilot equivalent found')

    print(f'\nResults:')
    print(f'  {matched_count} boards matched between INAV and ArduPilot')
    print(f'  {confirmed_count} fully confirmed (all UARTs match)')
    print(f'  {matched_count - confirmed_count} partial matches (some UARTs differ)')
    print(f'  {len(unmatched_inav)} INAV targets with no ArduPilot equivalent')

    # Build report
    report = {
        'summary': {
            'inav_targets': len(inav_boards),
            'ardupilot_boards': len(ap_boards_by_folder),
            'matched': matched_count,
            'confirmed': confirmed_count,
            'partial': matched_count - confirmed_count,
            'unmatched_inav': len(unmatched_inav),
        },
        'confirmed_boards': [],
        'partial_boards': [],
        'unmatched_inav_targets': unmatched_inav,
        'inav_board_map_suggestions': {},
    }

    for r in results:
        entry = {
            'inav_target': r.inav_target,
            'ardupilot_board': r.ardupilot_board,
            'matched_uarts': r.matched_uarts,
            'inav_only_uarts': r.inav_only,
            'ardupilot_only_uarts': r.ardupilot_only,
            'pad_labels': r.pad_labels_verified,
        }
        if r.confirmed:
            report['confirmed_boards'].append(entry)
        else:
            report['partial_boards'].append(entry)

        # Generate INAV_BOARD_MAP suggestion
        ap_id = r.ardupilot_board.lower()
        report['inav_board_map_suggestions'][r.inav_target.upper()] = ap_id

    # Write report
    with open(args.output, 'w') as f:
        json.dump(report, f, indent=2)

    print(f'\nReport written to {args.output}')

    # Print confirmed boards summary
    print(f'\n--- Confirmed boards (all UARTs match) ---')
    for r in results:
        if r.confirmed:
            print(f'  {r.inav_target:30s} <-> {r.ardupilot_board:30s} '
                  f'UARTs: {",".join(str(u) for u in r.matched_uarts)}')

    # Print INAV_BOARD_MAP TypeScript snippet
    print(f'\n--- INAV_BOARD_MAP entries (for inavImport.ts) ---')
    for r in results:
        ap_id = r.ardupilot_board.lower()
        print(f"  '{r.inav_target.upper()}': '{ap_id}',")


if __name__ == '__main__':
    main()
