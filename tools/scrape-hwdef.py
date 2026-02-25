#!/usr/bin/env python3
"""
ArduPilot hwdef.dat Scraper for ArduGUI Board Database
========================================================

Clones the ArduPilot hwdef directory (sparse checkout) and parses all
board definitions into structured JSON for the ArduGUI board registry.

Usage:
    python3 tools/scrape-hwdef.py [--output boards.json] [--boards-only BOARD1,BOARD2]

Requires: git (for sparse checkout), Python 3.8+

Output: A JSON file with all parsed board definitions, ready to be
converted into TypeScript BoardDef entries.
"""

import argparse
import json
import os
import re
import subprocess
import sys
import shutil
from pathlib import Path
from dataclasses import dataclass, field, asdict
from typing import Optional

# ── Configuration ───────────────────────────────────────────────────

ARDUPILOT_REPO = "https://github.com/ArduPilot/ardupilot.git"
HWDEF_BASE = "libraries/AP_HAL_ChibiOS/hwdef"
BOARD_TYPES_PATH = "Tools/AP_Bootloader/board_types.txt"

# Boards we especially care about (will be flagged as priority in output).
# We scrape ALL boards regardless, but these get extra attention.
PRIORITY_BOARDS = {
    # Existing in ArduGUI registry
    "fmuv3", "fmuv5", "fmuv6x", "fmuv6c",
    "CubeBlack", "CubeOrange", "CubeOrangePlus",
    "Pixhawk1", "Pixhawk6X", "Pixhawk6C",
    "MatekF405-Wing", "MatekH743", "MatekF405-TE",
    # Priority additions from HANDOFF.md
    "MatekH743-Mini", "MatekH743-Slim", "MatekF405-STD", "MatekF765-Wing",
    "KakuteF4", "KakuteF7", "KakuteH7", "KakuteH7Mini", "KakuteH7-Wing",
    "SpeedyBeeF405v3", "SpeedyBeeF405v4", "SpeedyBeeF405Wing", "SpeedyBeeF405Mini",
    "JHEMCU-GSF405A", "JHEMCU-GF16-F405",
    "FoxeerF745V2", "FoxeerReaperF745AIO",
    "mRoControlZeroH7",
    "BlitzF745AIO",
    "omnibusf4pro",
    # Other popular boards
    "MambaF405v2", "MambaH743v4",
    "FlywooF745", "FlywooF405S-AIO",
    "BetaFPV-F405", "BetaFPV-F745",
    "NxtPX4v2",
    "Pixhawk4",
    "mRoPixracerPro",
}

# Known sensor chip names from SPI device definitions
KNOWN_IMU_CHIPS = {
    "mpu6000", "mpu6500", "mpu9250",
    "icm20602", "icm20608", "icm20689", "icm20948",
    "icm40609", "icm42605", "icm42670", "icm42688",
    "icm45686",
    "bmi055", "bmi088", "bmi270",
    "lsm9ds1", "lsm6dsl", "lsm6dsrx",
    "adis16470", "adis16507",
    "iam20680",
    "iim42652",
    "qmc5883l",  # this is a compass not IMU, but sometimes on SPI
}

KNOWN_BARO_CHIPS = {
    "bmp280", "bmp388", "bmp390", "bmp581",
    "dps310",
    "ms5611", "ms5607",
    "spl06",
    "icp101xx", "icp201xx",
    "lps22h", "lps25h",
    "2smpb",
}

KNOWN_COMPASS_CHIPS = {
    "ist8310", "ist8308",
    "hmc5843", "hmc5883", "hmc5883l",
    "qmc5883l", "qmc5883",
    "lis3mdl",
    "ak8963", "ak09916",
    "rm3100",
    "mmc3416", "mmc5603", "mmc5983",
    "bmm150", "bmm350",
}

KNOWN_OSD_CHIPS = {
    "max7456", "at7456e", "at7456",
}

KNOWN_FLASH_CHIPS = {
    "w25q128", "w25q256", "w25q64", "w25q32", "w25q16",
    "w25n01g", "w25n02g", "w25n512g",
    "m25p16",
    "gd25q16", "gd25q32", "gd25q64",
    "at25sf161",
    "is25lp016d",
}


# ── Data Classes ────────────────────────────────────────────────────

@dataclass
class OutputPin:
    """A single PWM/motor/servo output pin."""
    number: int           # PWM output number (1-based)
    timer: str            # Timer name (e.g. "TIM1")
    timer_channel: str    # Full channel (e.g. "TIM1_CH1")
    gpio: Optional[int] = None
    complementary: bool = False  # True if this is a _CHxN (complementary) output
    bidir: bool = False   # True if BIDIR keyword present (BDShot capable)
    pin: str = ""         # STM32 pin name (e.g. "PB0")

@dataclass
class OutputGroup:
    """Group of outputs sharing the same timer (= same DShot/PWM rate constraint)."""
    outputs: list         # Output numbers [1, 2, 3, 4]
    timer: str            # Timer name
    capabilities: list = field(default_factory=list)  # ['PWM', 'DShot', 'BDShot']

@dataclass
class UartDef:
    """A UART as it appears in SERIAL_ORDER."""
    serial_index: int     # ArduPilot SERIAL# index
    uart_name: str        # Hardware name (e.g. "USART1", "OTG1", "EMPTY")
    has_tx: bool = True
    has_rx: bool = True
    rx_dma: bool = False
    tx_dma: bool = False
    is_usb: bool = False
    is_empty: bool = False

@dataclass
class BatteryMonitor:
    """Battery monitoring configuration."""
    volt_pin: Optional[int] = None
    curr_pin: Optional[int] = None
    volt_mult: Optional[float] = None
    amp_per_volt: Optional[float] = None

@dataclass
class BuiltinSensors:
    """Sensors detected from SPIDEV / IMU / BARO / COMPASS definitions."""
    imu: list = field(default_factory=list)
    barometer: list = field(default_factory=list)
    compass: list = field(default_factory=list)
    osd: Optional[str] = None
    flash: Optional[str] = None
    sdcard: bool = False

@dataclass
class RcInput:
    """Default RC input configuration."""
    input_type: str = ""    # 'dedicated_sbus', 'uart', 'timer', 'ppm'
    serial_index: Optional[int] = None
    pin: str = ""
    timer: str = ""

@dataclass
class BoardData:
    """Complete parsed board definition."""
    # Identity
    folder_name: str = ""
    board_name: str = ""
    apj_board_id: Optional[int] = None
    apj_board_id_name: str = ""  # e.g. "AP_HW_MATEKH743"

    # MCU
    mcu_class: str = ""     # e.g. "STM32F4xx"
    mcu_type: str = ""      # e.g. "STM32F405xx"
    flash_kb: int = 0
    oscillator_hz: int = 0

    # Serial
    serial_order: list = field(default_factory=list)  # Raw SERIAL_ORDER tokens
    uarts: list = field(default_factory=list)          # List of UartDef

    # I2C
    i2c_order: list = field(default_factory=list)      # e.g. ["I2C1", "I2C2"]

    # Outputs
    pwm_outputs: list = field(default_factory=list)    # List of OutputPin
    output_groups: list = field(default_factory=list)  # List of OutputGroup

    # Sensors
    sensors: BuiltinSensors = field(default_factory=BuiltinSensors)
    spi_devices: list = field(default_factory=list)    # Raw SPIDEV lines parsed

    # Battery
    battery: BatteryMonitor = field(default_factory=BatteryMonitor)

    # RC Input
    rc_input: RcInput = field(default_factory=RcInput)

    # Features
    has_buzzer: bool = False
    buzzer_pin: str = ""
    has_led_strip: bool = False
    led_pin: str = ""
    has_safety_switch: bool = False

    # CAN
    can_interfaces: int = 0

    # DMA info
    dma_lines: list = field(default_factory=list)

    # Includes (for dependency tracking)
    includes: list = field(default_factory=list)

    # Raw defines (useful for additional config)
    defines: dict = field(default_factory=dict)

    # Comments at top of file (often contain useful board info)
    header_comments: str = ""

    # Is this a priority board?
    is_priority: bool = False

    # Is this a bootloader-only def? (skip these)
    is_bootloader: bool = False

    # Defaults.parm file contents (if present)
    default_params: dict = field(default_factory=dict)


# ── Parser ──────────────────────────────────────────────────────────

class HwdefParser:
    """Parse an ArduPilot hwdef.dat file into a BoardData structure."""

    def __init__(self, hwdef_dir: Path, board_ids: dict):
        self.hwdef_dir = hwdef_dir
        self.board_ids = board_ids  # Maps "AP_HW_XXX" -> numeric ID
        self._include_cache: dict[str, list[str]] = {}

    def resolve_lines(self, filepath: Path, depth: int = 0) -> list[str]:
        """Read a hwdef file, resolving includes recursively."""
        if depth > 10:
            print(f"  WARNING: Include depth > 10, stopping at {filepath}", file=sys.stderr)
            return []

        cache_key = str(filepath)
        if cache_key in self._include_cache:
            return self._include_cache[cache_key]

        if not filepath.exists():
            print(f"  WARNING: File not found: {filepath}", file=sys.stderr)
            return []

        lines = []
        try:
            raw = filepath.read_text(encoding='utf-8', errors='replace')
        except Exception as e:
            print(f"  WARNING: Cannot read {filepath}: {e}", file=sys.stderr)
            return []

        for raw_line in raw.splitlines():
            stripped = raw_line.strip()

            # Skip empty lines and comments
            if not stripped or stripped.startswith('#'):
                lines.append(stripped)
                continue

            # Handle includes
            if stripped.startswith('include'):
                parts = stripped.split(None, 1)
                if len(parts) == 2:
                    inc_path = parts[1].strip()
                    # Resolve relative to current file's directory
                    if inc_path.startswith('../'):
                        resolved = (filepath.parent / inc_path).resolve()
                    else:
                        resolved = (filepath.parent / inc_path).resolve()
                    included = self.resolve_lines(resolved, depth + 1)
                    lines.extend(included)
                continue

            lines.append(stripped)

        self._include_cache[cache_key] = lines
        return lines

    def parse_board(self, board_folder: Path) -> Optional[BoardData]:
        """Parse a board folder into a BoardData."""
        hwdef_file = board_folder / "hwdef.dat"
        if not hwdef_file.exists():
            return None

        board = BoardData()
        board.folder_name = board_folder.name
        board.board_name = board_folder.name

        # Check if this is a bootloader-only definition
        if board_folder.name.endswith("-bl"):
            board.is_bootloader = True

        # Check priority
        board.is_priority = board_folder.name in PRIORITY_BOARDS

        # Parse the file with includes resolved
        lines = self.resolve_lines(hwdef_file)

        # Extract header comments (before first non-comment line)
        header = []
        for line in lines:
            if line.startswith('#'):
                header.append(line.lstrip('#').strip())
            elif line:
                break
        board.header_comments = '\n'.join(header[:10])  # First 10 comment lines

        # Track undefs
        undefs = set()

        # Process each line
        for line in lines:
            if not line or line.startswith('#'):
                continue

            # Handle undef
            if line.startswith('undef '):
                undefs.add(line.split(None, 1)[1].strip())
                continue

            parts = line.split()
            if not parts:
                continue

            self._process_line(board, parts, line, undefs)

        # Post-process
        self._compute_output_groups(board)
        self._detect_sensors(board)
        self._detect_rc_input(board, lines)
        self._parse_uart_details(board, lines)
        self._resolve_board_id(board)

        # Parse defaults.parm if present
        defaults_file = board_folder / "defaults.parm"
        if defaults_file.exists():
            board.default_params = self._parse_defaults(defaults_file)

        return board

    def _process_line(self, board: BoardData, parts: list, line: str, undefs: set):
        """Process a single hwdef line."""
        keyword = parts[0]

        # MCU
        if keyword == 'MCU' and len(parts) >= 3:
            board.mcu_class = parts[1]
            board.mcu_type = parts[2]

        # Board ID
        elif keyword == 'APJ_BOARD_ID':
            if len(parts) >= 2:
                board.apj_board_id_name = parts[1]
                # Try to parse as number directly
                try:
                    board.apj_board_id = int(parts[1])
                except ValueError:
                    # It's a symbolic name like AP_HW_MATEKH743
                    if parts[1] in self.board_ids:
                        board.apj_board_id = self.board_ids[parts[1]]

        # Flash
        elif keyword == 'FLASH_SIZE_KB' and len(parts) >= 2:
            try:
                board.flash_kb = int(parts[1])
            except ValueError:
                pass

        # Crystal
        elif keyword == 'OSCILLATOR_HZ' and len(parts) >= 2:
            try:
                board.oscillator_hz = int(parts[1])
            except ValueError:
                pass

        # Serial order
        elif keyword == 'SERIAL_ORDER':
            board.serial_order = parts[1:]
            board.uarts = []
            for i, uart_name in enumerate(parts[1:]):
                ud = UartDef(
                    serial_index=i,
                    uart_name=uart_name,
                    is_usb=(uart_name.startswith('OTG') or uart_name == 'USB'),
                    is_empty=(uart_name == 'EMPTY'),
                )
                board.uarts.append(ud)

        # I2C order
        elif keyword == 'I2C_ORDER':
            board.i2c_order = parts[1:]

        # PWM output pins
        # Format: PA0 TIM2_CH1 TIM2 PWM(1) GPIO(50) [BIDIR]
        elif len(parts) >= 4 and 'PWM(' in line:
            pin_name = parts[0]
            timer_ch = parts[1]
            timer = parts[2]

            # Extract PWM number
            pwm_match = re.search(r'PWM\((\d+)\)', line)
            gpio_match = re.search(r'GPIO\((\d+)\)', line)

            if pwm_match:
                out = OutputPin(
                    number=int(pwm_match.group(1)),
                    timer=timer,
                    timer_channel=timer_ch,
                    gpio=int(gpio_match.group(1)) if gpio_match else None,
                    complementary='N' in timer_ch.split('_')[-1] and timer_ch.split('_')[-1][-1] == 'N',
                    bidir='BIDIR' in line,
                    pin=pin_name,
                )
                board.pwm_outputs.append(out)

        # SPIDEV lines
        # Format: SPIDEV icm42688 SPI1 DEVID1 IMU1_CS MODE3 2*MHZ 16*MHZ
        elif keyword == 'SPIDEV' and len(parts) >= 4:
            board.spi_devices.append({
                'name': parts[1].lower(),
                'bus': parts[2],
                'devid': parts[3] if len(parts) > 3 else '',
                'cs': parts[4] if len(parts) > 4 else '',
            })

        # Buzzer
        elif 'BUZZER' in keyword and 'OUTPUT' in line:
            board.has_buzzer = True
            board.buzzer_pin = parts[0]
        elif keyword == 'define' and len(parts) >= 3:
            define_name = parts[1]
            define_val = ' '.join(parts[2:])

            board.defines[define_name] = define_val

            if define_name == 'HAL_BUZZER_PIN':
                board.has_buzzer = True

            # Battery defines
            if define_name == 'HAL_BATT_VOLT_PIN':
                try:
                    board.battery.volt_pin = int(define_val)
                except ValueError:
                    pass
            elif define_name == 'HAL_BATT_CURR_PIN':
                try:
                    board.battery.curr_pin = int(define_val)
                except ValueError:
                    pass
            elif define_name == 'HAL_BATT_VOLT_SCALE':
                try:
                    board.battery.volt_mult = float(define_val)
                except ValueError:
                    pass
            elif define_name == 'HAL_BATT_CURR_SCALE':
                try:
                    board.battery.amp_per_volt = float(define_val)
                except ValueError:
                    pass

            # Safety switch
            if define_name == 'HAL_HAVE_SAFETY_SWITCH' and define_val.strip() == '1':
                board.has_safety_switch = True

            # CAN
            if define_name == 'HAL_NUM_CAN_IFACES':
                try:
                    board.can_interfaces = int(define_val)
                except ValueError:
                    pass

            # Board name override
            if define_name == 'CHIBIOS_SHORT_BOARD_NAME':
                board.board_name = define_val.strip('"')

            # LED strip
            if define_name in ('HAL_LED_STRIP_PIN', 'AP_NOTIFY_NEOPIXEL_PIN'):
                board.has_led_strip = True

            # OSD from define
            if define_name == 'HAL_OSD_TYPE_DEFAULT' and define_val.strip() == '1':
                board.sensors.osd = "MAX7456"

            # SD card
            if define_name == 'HAL_OS_FATFS_IO' and define_val.strip() == '1':
                board.sensors.sdcard = True

        # SDIO / SDMMC (SD card)
        elif keyword in ('SDIO', 'SDMMC'):
            board.sensors.sdcard = True

        # CAN pins
        elif keyword.startswith('CAN') and '_RX' in keyword or '_TX' in keyword:
            if keyword not in undefs:
                # Count unique CAN interfaces
                can_num = re.search(r'CAN(\d)', keyword)
                if can_num:
                    board.can_interfaces = max(board.can_interfaces, int(can_num.group(1)))

        # DMA
        elif keyword == 'DMA_PRIORITY' or keyword == 'DMA_NOSHARE':
            board.dma_lines.append(line)

        # LED pin
        elif 'LED' in keyword and 'TIM' in line and 'PWM' not in line:
            # Could be LED strip via timer
            if 'NEOPIXEL' in line or 'LED_STRIP' in line:
                board.has_led_strip = True
                board.led_pin = parts[0]

        # Includes tracking
        elif keyword == 'include':
            board.includes.append(parts[1] if len(parts) > 1 else '')

        # ADC pins for battery
        elif 'BAT_VOLT' in line or 'BATT_VOLTAGE' in line:
            if 'ADC' in line:
                # Extract pin number from analog definition
                adc_match = re.search(r'SCALE\((\d+)\)', line)
                pin_match = re.search(r'ADC(\d)', line)

        elif 'BAT_CURR' in line or 'BATT_CURRENT' in line:
            if 'ADC' in line:
                pass  # Already handled by defines

        # NeoPixel / LED strip output
        elif len(parts) >= 2 and ('NEOPIXEL' in parts[0] or 'neopixel' in line.lower()):
            board.has_led_strip = True
            board.led_pin = parts[0]

    def _compute_output_groups(self, board: BoardData):
        """Group PWM outputs by timer to determine DShot/PWM rate groups."""
        timer_groups: dict[str, list[OutputPin]] = {}
        for out in board.pwm_outputs:
            timer_groups.setdefault(out.timer, []).append(out)

        for timer, outputs in sorted(timer_groups.items()):
            outputs.sort(key=lambda o: o.number)
            caps = ['PWM']

            # F4/F7/H7 timers that support DShot (TIM1-TIM8 on most STM32)
            timer_num_match = re.search(r'TIM(\d+)', timer)
            if timer_num_match:
                timer_num = int(timer_num_match.group(1))
                # TIM1-TIM8 are advanced/general purpose, capable of DShot
                # TIM9-TIM14 are basic/low-power, not good for DShot
                if timer_num <= 8:
                    caps.append('DShot')
                    # BDShot requires bidir on all channels in the group
                    if any(o.bidir for o in outputs):
                        caps.append('BDShot')

            group = OutputGroup(
                outputs=[o.number for o in outputs],
                timer=timer,
                capabilities=caps,
            )
            board.output_groups.append(group)

    def _detect_sensors(self, board: BoardData):
        """Detect onboard sensors from SPIDEV definitions."""
        for dev in board.spi_devices:
            name = dev['name'].lower()

            # IMU
            for chip in KNOWN_IMU_CHIPS:
                if chip in name:
                    pretty = chip.upper()
                    if pretty not in board.sensors.imu:
                        board.sensors.imu.append(pretty)
                    break

            # Barometer
            for chip in KNOWN_BARO_CHIPS:
                if chip in name:
                    pretty = chip.upper()
                    if pretty not in board.sensors.barometer:
                        board.sensors.barometer.append(pretty)
                    break

            # Compass
            for chip in KNOWN_COMPASS_CHIPS:
                if chip in name:
                    pretty = chip.upper()
                    if pretty not in board.sensors.compass:
                        board.sensors.compass.append(pretty)
                    break

            # OSD
            for chip in KNOWN_OSD_CHIPS:
                if chip in name:
                    board.sensors.osd = chip.upper()
                    break

            # Flash / Dataflash
            for chip in KNOWN_FLASH_CHIPS:
                if chip in name:
                    board.sensors.flash = chip.upper()
                    break

            # SD card detection from SPI
            if 'sdcard' in name or 'sd_card' in name:
                board.sensors.sdcard = True

    def _detect_rc_input(self, board: BoardData, lines: list[str]):
        """Detect default RC input method."""
        for line in lines:
            if not line or line.startswith('#'):
                continue

            # Dedicated RCIN pin (timer-based, typical for SBUS/PPM)
            if 'RCIN' in line and 'TIM' in line:
                parts = line.split()
                if len(parts) >= 3:
                    board.rc_input = RcInput(
                        input_type='timer',
                        pin=parts[0],
                        timer=parts[2] if len(parts) > 2 else '',
                    )
                    break

            # RCIN via UART
            if 'RCIN' in line and ('USART' in line or 'UART' in line):
                parts = line.split()
                board.rc_input = RcInput(
                    input_type='uart',
                    pin=parts[0] if parts else '',
                )
                break

        # Also check defines for RC input configuration
        if board.defines.get('HAL_SERIAL_INPUT_ENABLED', '') == '1':
            board.rc_input.input_type = 'uart'

    def _parse_uart_details(self, board: BoardData, lines: list[str]):
        """Enhance UART definitions with TX/RX pin info and DMA status."""
        # Build a map of UART names to their pin definitions
        uart_pins: dict[str, dict] = {}  # uart_name -> {tx: pin, rx: pin, tx_dma: bool, rx_dma: bool}

        for line in lines:
            if not line or line.startswith('#'):
                continue
            parts = line.split()
            if len(parts) < 2:
                continue

            pin = parts[0]
            func = parts[1]

            # Match UART TX/RX pins: PA9 USART1_TX USART1
            for uart_prefix in ['USART', 'UART', 'LPUART']:
                if func.startswith(uart_prefix) and ('_TX' in func or '_RX' in func):
                    # Extract UART name (e.g., "USART1" from "USART1_TX")
                    uart_name = func.rsplit('_', 1)[0]
                    if uart_name not in uart_pins:
                        uart_pins[uart_name] = {'tx': '', 'rx': '', 'tx_dma': False, 'rx_dma': False}

                    if '_TX' in func:
                        uart_pins[uart_name]['tx'] = pin
                    elif '_RX' in func:
                        uart_pins[uart_name]['rx'] = pin
                    break

        # Check DMA availability from DMA_PRIORITY / NODMA directives
        nodma_uarts = set()
        for line in lines:
            if not line or line.startswith('#'):
                continue
            # NODMA directives
            if 'NODMA' in line:
                parts = line.split()
                for p in parts:
                    for uart_prefix in ['USART', 'UART']:
                        if p.startswith(uart_prefix):
                            nodma_uarts.add(p)

        # Update UART definitions
        for uart in board.uarts:
            name = uart.uart_name
            if name in uart_pins:
                uart.has_tx = bool(uart_pins[name]['tx'])
                uart.has_rx = bool(uart_pins[name]['rx'])

            # Set DMA availability (default true for most, false for NODMA)
            if not uart.is_usb and not uart.is_empty:
                uart.tx_dma = True  # TX DMA is almost always available
                uart.rx_dma = name not in nodma_uarts  # RX DMA may be limited

    def _resolve_board_id(self, board: BoardData):
        """Resolve symbolic board ID to numeric."""
        if board.apj_board_id is None and board.apj_board_id_name:
            if board.apj_board_id_name in self.board_ids:
                board.apj_board_id = self.board_ids[board.apj_board_id_name]
            else:
                # Try parsing as raw number
                try:
                    board.apj_board_id = int(board.apj_board_id_name)
                except ValueError:
                    pass

    def _parse_defaults(self, filepath: Path) -> dict:
        """Parse a defaults.parm file."""
        params = {}
        try:
            for line in filepath.read_text().splitlines():
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                # Format: PARAM_NAME VALUE  or  PARAM_NAME,VALUE
                parts = re.split(r'[\s,]+', line, maxsplit=1)
                if len(parts) == 2:
                    params[parts[0]] = parts[1]
        except Exception:
            pass
        return params


# ── Board Types Parser ──────────────────────────────────────────────

def parse_board_types(filepath: Path) -> dict[str, int]:
    """Parse board_types.txt into a map of symbolic name -> numeric ID."""
    result = {}
    if not filepath.exists():
        print(f"WARNING: board_types.txt not found at {filepath}", file=sys.stderr)
        return result

    for line in filepath.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        parts = line.split()
        if len(parts) >= 2:
            name = parts[0]
            try:
                value = int(parts[1])
                result[name] = value
            except ValueError:
                continue

    return result


# ── Git Operations ──────────────────────────────────────────────────

def clone_hwdef(work_dir: Path) -> Path:
    """Sparse-clone just the hwdef directory from ArduPilot."""
    repo_dir = work_dir / "ardupilot"

    if repo_dir.exists():
        print(f"Using existing clone at {repo_dir}")
        # Pull latest (ignore errors on sparse checkout)
        subprocess.run(
            ["git", "-C", str(repo_dir), "pull", "--depth=1"],
            capture_output=True,
        )
        return repo_dir

    print("Sparse-cloning ArduPilot hwdef directory...")
    print("(This downloads ~50MB instead of the full 2GB+ repo)")

    # Initialize sparse checkout
    subprocess.run(
        ["git", "clone", "--depth=1", "--filter=blob:none", "--sparse",
         ARDUPILOT_REPO, str(repo_dir)],
        check=True
    )

    # Add just the hwdef and board_types directories
    subprocess.run(
        ["git", "-C", str(repo_dir), "sparse-checkout", "set",
         HWDEF_BASE, "Tools/AP_Bootloader"],
        check=True
    )

    print("Clone complete.")
    return repo_dir


# ── Serialization ───────────────────────────────────────────────────

def board_to_dict(board: BoardData) -> dict:
    """Convert a BoardData to a clean JSON-serializable dict."""
    d = {
        'folderName': board.folder_name,
        'boardName': board.board_name,
        'apjBoardId': board.apj_board_id,
        'apjBoardIdName': board.apj_board_id_name,
        'mcuClass': board.mcu_class,
        'mcuType': board.mcu_type,
        'flashKb': board.flash_kb,
        'serialOrder': board.serial_order,
        'uarts': [
            {
                'serialIndex': u.serial_index,
                'uartName': u.uart_name,
                'hasTx': u.has_tx,
                'hasRx': u.has_rx,
                'rxDma': u.rx_dma,
                'txDma': u.tx_dma,
                'isUsb': u.is_usb,
                'isEmpty': u.is_empty,
            }
            for u in board.uarts
        ],
        'i2cBuses': board.i2c_order,
        'pwmOutputs': [
            {
                'number': o.number,
                'timer': o.timer,
                'timerChannel': o.timer_channel,
                'gpio': o.gpio,
                'complementary': o.complementary,
                'bidir': o.bidir,
                'pin': o.pin,
            }
            for o in board.pwm_outputs
        ],
        'outputGroups': [
            {
                'outputs': g.outputs,
                'timer': g.timer,
                'capabilities': g.capabilities,
            }
            for g in board.output_groups
        ],
        'sensors': {
            'imu': board.sensors.imu,
            'barometer': board.sensors.barometer,
            'compass': board.sensors.compass,
            'osd': board.sensors.osd,
            'flash': board.sensors.flash,
            'sdcard': board.sensors.sdcard,
        },
        'battery': {
            'voltPin': board.battery.volt_pin,
            'currPin': board.battery.curr_pin,
            'voltMult': board.battery.volt_mult,
            'ampPerVolt': board.battery.amp_per_volt,
        },
        'rcInput': {
            'type': board.rc_input.input_type,
            'serialIndex': board.rc_input.serial_index,
            'pin': board.rc_input.pin,
            'timer': board.rc_input.timer,
        },
        'features': {
            'buzzer': board.has_buzzer,
            'buzzerPin': board.buzzer_pin,
            'ledStrip': board.has_led_strip,
            'ledPin': board.led_pin,
            'safetySwitch': board.has_safety_switch,
            'canInterfaces': board.can_interfaces,
            'sdcard': board.sensors.sdcard,
        },
        'defaultParams': board.default_params if board.default_params else None,
        'headerComments': board.header_comments,
        'isPriority': board.is_priority,
        'includes': board.includes,
    }

    # Strip None values for cleaner output
    return {k: v for k, v in d.items() if v is not None}


# ── Main ────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Scrape ArduPilot hwdef files into JSON for ArduGUI"
    )
    parser.add_argument(
        '--output', '-o',
        default='tools/boards-scraped.json',
        help='Output JSON file path (default: tools/boards-scraped.json)'
    )
    parser.add_argument(
        '--boards-only',
        help='Comma-separated list of board folder names to parse (default: all)'
    )
    parser.add_argument(
        '--work-dir',
        default='/tmp/ardugui-scrape',
        help='Working directory for git clone (default: /tmp/ardugui-scrape)'
    )
    parser.add_argument(
        '--priority-only',
        action='store_true',
        help='Only parse priority boards'
    )
    parser.add_argument(
        '--local-repo',
        help='Path to existing ArduPilot repo (skip clone)'
    )
    parser.add_argument(
        '--clean',
        action='store_true',
        help='Remove existing clone and start fresh'
    )
    parser.add_argument(
        '--summary',
        action='store_true',
        help='Print a summary table of parsed boards'
    )
    args = parser.parse_args()

    work_dir = Path(args.work_dir)
    work_dir.mkdir(parents=True, exist_ok=True)

    # Clean existing clone if requested
    if args.clean:
        clone_dir = work_dir / "ardupilot"
        if clone_dir.exists():
            print(f"Removing existing clone at {clone_dir}...")
            shutil.rmtree(clone_dir)

    # Get ArduPilot source
    if args.local_repo:
        repo_dir = Path(args.local_repo)
        if not repo_dir.exists():
            print(f"ERROR: Local repo not found: {repo_dir}", file=sys.stderr)
            sys.exit(1)
    else:
        repo_dir = clone_hwdef(work_dir)

    hwdef_root = repo_dir / HWDEF_BASE
    board_types_file = repo_dir / BOARD_TYPES_PATH

    if not hwdef_root.exists():
        print(f"ERROR: hwdef directory not found at {hwdef_root}", file=sys.stderr)
        sys.exit(1)

    # Parse board_types.txt
    print("Parsing board_types.txt...")
    board_ids = parse_board_types(board_types_file)
    print(f"  Found {len(board_ids)} board ID definitions")

    # Enumerate board directories
    all_folders = sorted([
        d for d in hwdef_root.iterdir()
        if d.is_dir() and (d / 'hwdef.dat').exists()
    ])

    # Filter
    if args.boards_only:
        requested = set(args.boards_only.split(','))
        all_folders = [d for d in all_folders if d.name in requested]
    elif args.priority_only:
        all_folders = [d for d in all_folders if d.name in PRIORITY_BOARDS]

    print(f"Found {len(all_folders)} board directories to parse")

    # Parse all boards
    hwdef_parser = HwdefParser(hwdef_root, board_ids)
    results = []
    errors = []
    skipped_bl = 0

    for folder in all_folders:
        try:
            board = hwdef_parser.parse_board(folder)
            if board is None:
                continue
            if board.is_bootloader:
                skipped_bl += 1
                continue
            # Skip boards with no SERIAL_ORDER (usually fragments or shared configs)
            if not board.serial_order:
                continue
            results.append(board)
        except Exception as e:
            errors.append((folder.name, str(e)))
            print(f"  ERROR parsing {folder.name}: {e}", file=sys.stderr)

    print(f"\nParsed {len(results)} boards successfully")
    if skipped_bl:
        print(f"Skipped {skipped_bl} bootloader-only definitions")
    if errors:
        print(f"Errors: {len(errors)}")
        for name, err in errors:
            print(f"  {name}: {err}")

    # Sort: priority boards first, then alphabetical
    results.sort(key=lambda b: (not b.is_priority, b.folder_name.lower()))

    # Serialize
    output = {
        'scraped_at': subprocess.run(
            ['date', '-u', '+%Y-%m-%dT%H:%M:%SZ'],
            capture_output=True, text=True
        ).stdout.strip(),
        'ardupilot_commit': subprocess.run(
            ['git', '-C', str(repo_dir), 'rev-parse', '--short', 'HEAD'],
            capture_output=True, text=True
        ).stdout.strip(),
        'total_boards': len(results),
        'priority_boards': sum(1 for b in results if b.is_priority),
        'boards': [board_to_dict(b) for b in results],
    }

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(output, indent=2))
    print(f"\nWritten to {output_path}")

    # Summary table
    if args.summary or True:  # Always print summary
        print(f"\n{'='*100}")
        print(f"{'Board':<35} {'MCU':<15} {'ID':>5} {'UARTs':>5} {'PWM':>4} {'IMU':<25} {'OSD':>4} {'SD':>3}")
        print(f"{'='*100}")
        for b in results:
            priority_marker = '★ ' if b.is_priority else '  '
            imu_str = ', '.join(b.sensors.imu[:3]) if b.sensors.imu else '-'
            osd_str = '✓' if b.sensors.osd else '-'
            sd_str = '✓' if b.sensors.sdcard else '-'
            uart_count = len([u for u in b.uarts if not u.is_usb and not u.is_empty])
            print(
                f"{priority_marker}{b.folder_name:<33} "
                f"{b.mcu_type:<15} "
                f"{b.apj_board_id or '?':>5} "
                f"{uart_count:>5} "
                f"{len(b.pwm_outputs):>4} "
                f"{imu_str:<25} "
                f"{osd_str:>4} "
                f"{sd_str:>3}"
            )
        print(f"{'='*100}")
        print(f"Total: {len(results)} boards ({sum(1 for b in results if b.is_priority)} priority)")


if __name__ == '__main__':
    main()
