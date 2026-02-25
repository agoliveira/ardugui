# ArduGUI Tools

## Board Database Scraper

Two-step pipeline to populate the ArduGUI board registry from ArduPilot source:

### Step 1: Scrape hwdef files

```bash
# Full scrape — all boards (recommended first time)
python3 tools/scrape-hwdef.py --summary

# Priority boards only (faster)
python3 tools/scrape-hwdef.py --priority-only

# Specific boards only
python3 tools/scrape-hwdef.py --boards-only MatekH743,KakuteH7,SpeedyBeeF405v3

# Use an existing ArduPilot checkout (skip clone)
python3 tools/scrape-hwdef.py --local-repo ~/ardupilot
```

This clones the ArduPilot repo (sparse checkout, ~50MB) and parses every
`hwdef.dat` file into `tools/boards-scraped.json`.

### Step 2: Generate TypeScript

```bash
# Generate all boards
python3 tools/generate-board-defs.py

# Priority boards only
python3 tools/generate-board-defs.py --priority-only

# Custom paths
python3 tools/generate-board-defs.py -i tools/boards-scraped.json -o src/models/boardData.ts
```

This converts the JSON into TypeScript `ExtendedBoardDef` entries in
`src/models/boardData.ts`, ready for import into the app.

### What gets extracted

From each board's `hwdef.dat`:

| Field | Source |
|-------|--------|
| MCU type | `MCU` directive |
| APJ_BOARD_ID | `APJ_BOARD_ID` + `board_types.txt` |
| Serial ports | `SERIAL_ORDER` + pin definitions |
| PWM outputs | `PWM(n)` pin definitions |
| Timer groups | Grouped by TIM assignment → DShot/PWM capability |
| IMU sensors | `SPIDEV` entries matching known chips |
| Barometer | `SPIDEV` entries matching known chips |
| Compass | `SPIDEV` entries matching known chips |
| OSD chip | `SPIDEV` or `define HAL_OSD_TYPE_DEFAULT` |
| Flash chip | `SPIDEV` entries matching known chips |
| SD card | `SDIO`/`SDMMC` or `HAL_OS_FATFS_IO` |
| Battery ADC | `HAL_BATT_VOLT_PIN`, `HAL_BATT_CURR_PIN`, scales |
| I2C buses | `I2C_ORDER` |
| Buzzer | `BUZZER` pin or `HAL_BUZZER_PIN` define |
| LED strip | NeoPixel pin definitions |
| CAN | CAN pin definitions |
| Safety switch | `HAL_HAVE_SAFETY_SWITCH` |
| RC input | `RCIN` pin definitions |
| Default params | `defaults.parm` file |

### Adding board metadata

The generator script (`generate-board-defs.py`) contains a `BOARD_METADATA`
dictionary with human-friendly names, manufacturers, wiki URLs, USB IDs,
and dimensions that aren't in the hwdef files. Add entries there for new
boards you want to have complete metadata.

### Requirements

- Python 3.8+
- git (for sparse checkout)
- No pip packages needed (stdlib only)
