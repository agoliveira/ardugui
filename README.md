# ArduGUI

A desktop configurator for [ArduPilot](https://ardupilot.org/) flight controllers. Takes your aircraft from a blank board to test flight -- either starting from scratch or migrating from INAV.

Built with Electron + React + TypeScript + Tailwind.

![License](https://img.shields.io/badge/license-GPLv3-blue)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey)
![Status](https://img.shields.io/badge/status-RC1%20%2F%20feature%20complete-orange)

---

> ## Safety Notice
>
> ArduGUI configures real aircraft that can cause injury or property damage.
>
> - **Always verify every parameter** against [Mission Planner](https://ardupilot.org/planner/) or [QGroundControl](https://qgroundcontrol.com/) before flying.
> - **Remove all propellers** during the entire configuration process.
> - **Do not fly** without completing motor direction verification, control surface checks, and failsafe testing.
> - The author(s) accept **no responsibility** for any damage, injury, or loss resulting from the use of this software. See [DISCLAIMER.md](DISCLAIMER.md).
>
> **This is a release candidate. It is feature complete but has not been fully field-tested. Treat it as an assistant, not a source of truth.**

---

## What It Does

ArduGUI is a **configurator**, not a ground control station. It handles initial setup only -- telemetry dashboards, mission planning, and in-flight tuning are left to Mission Planner and QGC.

Two paths to first flight:

1. **Start Fresh** -- flash firmware, run the setup wizard, calibrate, fly
2. **Migrate from INAV** -- import your "diff all" config, review the translation, calibrate, fly

### Key Features

| Feature | Description |
|---|---|
| **Setup Wizard** | 15-step guided flow from frame selection to first flight readiness. Write-as-you-go -- params saved on each step, rollback on abandon. |
| **INAV Migration** | Import "diff all" config. Translates frame type, motor mapping, receiver, battery, failsafes, GPS, compass, OSD layout, flight modes, and channel map. |
| **VTOL Configuration** | Full quadplane support: tilt servos, transitions, assist thresholds, Q_ parameter lifecycle. This is the key differentiator. |
| **414-Board Database** | Generated from ArduPilot hwdef files. Board-aware wiring guides with physical pad labels. |
| **MAVFTP** | Parameter download in ~300ms (vs ~15s with traditional MAVLink). |
| **Firmware Flashing** | Download from ArduPilot manifest, flash via bootloader protocol. BDShot variant toggle. |
| **3D Calibration Viewer** | Accelerometer 6-position calibration with animated Three.js model. |
| **Pre-flight Dashboard** | Sensor health, pre-arm failures, parameter validation, GPS quality, battery status. |

---

## Supported Aircraft

- **Copters** -- quad, hex, octo, tri, Y6, coaxial
- **Planes** -- conventional, flying wing, V-tail
- **VTOL** -- quadplanes, tiltrotors (the primary focus)

---

## Installation

### Download

Pre-built binaries are available on the [Releases](../../releases) page:

- **Windows** -- `.exe` installer
- **Linux** -- `.AppImage` (portable) or `.deb`
- **macOS** -- `.dmg`

### Build from Source

```bash
git clone https://github.com/user/ardugui.git
cd ardugui
npm install
npm run dev        # Development mode with hot reload
npm run build      # Production build
npm run package    # Create distributable
```

Requirements: Node.js 20+, npm 10+. Linux also needs `libudev-dev`.

---

## Quick Start

1. **Flash firmware** (if needed) -- open ArduGUI, go to Firmware page, select your board, download and flash.
2. **Connect** -- plug in USB, click Connect. Parameters download automatically.
3. **Run the Setup Wizard** -- the sidebar "Setup Wizard" button walks you through everything:
   - Frame selection
   - Output mapping (board-aware)
   - Motor direction test (with safety monitor)
   - Control surfaces (3D viewer with live servo feedback)
   - Tilt servos and transitions (VTOL)
   - Receiver protocol and RC calibration
   - GPS, compass, accelerometer calibration
   - Flight modes and failsafes
   - Initial tune (prop-size-based filter calculation)
4. **Review and reboot** -- the wizard shows what was configured and offers a reboot.
5. **Pre-flight check** -- go to the Pre-flight page, run checks, fix any issues.

Every wizard function is also accessible as a standalone sidebar page for manual configuration.

---

## INAV Migration

If you are moving from INAV to ArduPilot:

1. In INAV Configurator CLI, type `diff all` and copy the output.
2. In ArduGUI's Setup Wizard, click "Migrating from INAV?" on the Frame step.
3. Paste the text. ArduGUI translates ~80-90% of the configuration automatically.
4. Complete calibration (accel, compass, RC) -- these are hardware-specific and cannot transfer.
5. Review flight modes and failsafes -- the translation is best-effort.

**What transfers:** frame type, motor mapping, receiver protocol, serial ports, battery thresholds, GPS, compass orientation, board alignment, OSD layout, flight modes, channel map, failsafes, motor protocol.

**What doesn't:** calibration data, PID tuning, RC expo/rates (different control model).

---

## Sidebar Pages

Every page is fully implemented:

| Page | Description |
|---|---|
| Connect / Info | Board info, serial port selection, connection status |
| Firmware | Flash ArduPilot firmware, BDShot toggle |
| Setup Wizard | Guided 15-step configuration flow |
| Frame | Airframe selection with visual grid |
| Motors | Motor test, frame diagram, servo output table |
| Surfaces | 3D control surface viewer with live servo bars (plane/VTOL) |
| Wiring | Board-aware wiring guide with pad labels |
| Ports | Serial port protocol assignment |
| Receiver | Live RC channel bars |
| GPS | Live telemetry, constellation toggles |
| Calibration | Accel (3D viewer), compass, RC calibration, level trim |
| Battery | Monitor type, calibration, cell count, failsafe thresholds |
| ESC | Protocol, DShot settings, direction reversal, spin thresholds |
| Modes | 6-slot flight mode assignment with RC range visualization |
| Failsafes | RC, battery, GCS failsafe configuration |
| PID Tuning | Filter and rate parameter editing |
| Navigation | Geofence, RTL, waypoint parameters |
| Configuration | Grouped parameter editing |
| OSD | Visual OSD layout editor |
| Transitions | VTOL transition config (quadplane only) |
| Backups | Parameter backup/restore with diff view |
| Pre-flight | Readiness dashboard with sensor health and pre-arm checks |
| CLI | Raw parameter search and editing |
| Expert | Full parameter tree (debug mode) |

---

## Architecture

- **Runtime:** Electron (main + renderer)
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + custom theme ("Forge v6")
- **State:** Zustand stores
- **3D:** Three.js (calibration viewer, control surface viewer)
- **Database:** SQLite via better-sqlite3 (parameter backups)
- **MAVLink:** Custom parser + MAVFTP client
- **Board data:** 414 boards from ArduPilot hwdef, 174 INAV timer mappings

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full specification.

---

## Development

```bash
npm run dev          # Electron + Vite dev mode with hot reload
npm run typecheck    # TypeScript type checking
npm run build        # Production build (renderer + electron)
npm run package      # Build distributable packages
```

### Project Structure

```
src/
  app/               Layout, Sidebar, Header, Footer
  components/        Reusable UI (ConfirmDialog, MotorTestPanel, RcCalibration, 3D viewers)
  mavlink/           MAVLink connection, message parsing, MAVFTP, motor safety monitor
  store/             Zustand stores (connection, params, telemetry, calibration, preflight)
  models/            Data definitions (airframes, boards, INAV import, validation)
  hooks/             React hooks (useDetectedPreset, etc.)
  pages/             One directory per sidebar page + SetupWizard/
  styles/            Forge v6 theme CSS variables
  firmware/          Firmware manifest parser, APJ handler, bootloader protocol
tools/
  scrape-hwdef.py    ArduPilot hwdef board database generator
  scrape-inav-timers.py  INAV target.c timer data extractor
```

---

## Known Issues (v1.0.0-rc2)

- Connected flash path (MAVLink reboot-to-bootloader) -- needs hardware verification
- OSD import param names -- code-reviewed but not hardware-verified
- INAV CLI extraction -- untested on real INAV hardware
- Occasional "no heartbeat" after reboot cycles

See [TODO.md](TODO.md) for the full roadmap.

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) first. The architecture is documented in [ARCHITECTURE.md](ARCHITECTURE.md).

---

## License

GPLv3. See [LICENSE](LICENSE).

This project is not affiliated with, endorsed by, or supported by the ArduPilot project, Dronecode, or any flight controller manufacturer.
