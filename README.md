# ArduGUI

An approachable, guided ground control station for [ArduPilot](https://ardupilot.org/) flight controllers. Built with Electron, React, and TypeScript.

ArduGUI aims to bring the usability of INAV Configurator to ArduPilot's ecosystem -- presenting curated workflows instead of a flat parameter dump, so configuring a multirotor, plane, or VTOL doesn't require reading 400 wiki pages first.

---

> ## ⚠️ IMPORTANT -- READ BEFORE USE
>
> **ArduGUI is experimental, pre-alpha software under active development.**
>
> - It has **not been field-tested** on real aircraft.
> - It **will contain bugs** that could result in incorrect configuration.
> - **Always verify every parameter** against a trusted tool like [Mission Planner](https://ardupilot.org/planner/) or [QGroundControl](https://qgroundcontrol.com/) before flying.
> - **Do not use ArduGUI as your sole configuration tool.** Treat it as an assistant, not a source of truth.
> - The author(s) accept **no responsibility** for any damage, injury, or loss resulting from the use of this software. See [DISCLAIMER.md](DISCLAIMER.md) for the full liability notice.
>
> **If a value in ArduGUI disagrees with Mission Planner, trust Mission Planner.**

---

## Current Status

**Pre-alpha / Proof of concept.** The core architecture is in place and many pages are functional over a live MAVLink connection, but nothing should be considered stable, complete, or safe for unverified use.

### What works today

| Feature | Status | Notes |
|---|---|---|
| Serial connection | ✅ Working | USB serial, auto-detect baud rate |
| Parameter download | ✅ Working | Full parameter set from FC |
| Parameter editing | ✅ Working | Local edits with dirty tracking, write-back to FC |
| Board detection | ✅ Working | Auto-detects board from USB IDs and parameters |
| Board diagram | ✅ Working | Interactive port/pin diagram for 50+ supported boards |
| Vehicle type detection | ✅ Working | Copter, Plane, QuadPlane from MAV_TYPE |
| Frame Wizard | ✅ Working | Guided airframe selection, servo mapping, output assignment. Detects and highlights currently configured frame on re-entry |
| Ports page | ✅ Working | Serial port protocol assignment with board-aware labels |
| Configuration page | ✅ Working | Grouped parameter editing for common settings |
| Flight Modes | ✅ Working | INAV-style range sliders with RC channel binding |
| Receiver page | ✅ Working | RC input visualization and protocol selection |
| Motor test | ✅ Working | Individual and sequential motor testing with safety interlocks |
| Motor diagram | ✅ Working | Frame-specific SVG diagrams matching the configured airframe (Quad X/+/H, Hex, etc.) with correct motor numbering and rotation |
| Calibration | ✅ Working | Accelerometer 6-position calibration with live 3D model viewer (GLB), smooth animated orientation transitions, separate level trim card |
| PID Tuning | 🔧 In progress | Parameter editing, no real-time graphing yet |
| OSD Editor | 🔧 In progress | Canvas-based drag-and-drop layout, element toggling |
| Navigation | 🔧 Skeleton | Geofence and RTL parameter editing |
| Failsafes | 🔧 Skeleton | Battery, RC, GCS failsafe configuration |
| CLI | ✅ Working | Full parameter search, filter, and raw editing |

### What doesn't work yet

- No mission planning or waypoint support.
- No log download or analysis.
- No firmware flashing.
- No telemetry graphing or blackbox viewer.
- Compass calibration is not implemented.
- The full Setup Wizard (guided end-to-end aircraft configuration with PID suggestions based on frame size) is planned but not started.
- Many edge cases in frame/motor configuration are untested.
- QuadPlane transitions page is a placeholder.
- No automated tests exist yet.
- No WiFi, Bluetooth, or UDP connections (USB serial only).

## Screenshots

*Coming soon -- the UI is still changing rapidly.*

## Supported Vehicles

| Type | Firmware | Frames |
|---|---|---|
| Multirotors | ArduCopter | Quad (X, +, H, BF-X), Hex (X, +), Octo X, Y6, Tri |
| Fixed-wing | ArduPlane | Conventional, flying wing, V-tail, A-tail, canard, twin-engine, glider |
| VTOL | ArduPlane (QuadPlane) | QuadPlane, hex VTOL, tilt-rotor, tailsitter |

**Not supported:** Helicopters, rovers, boats, submarines, antenna trackers.

## Supported Boards

ArduGUI ships with a database of 50+ flight controller boards scraped from ArduPilot's hardware definition files. The board database includes pin mappings, serial port labels, sensor information, and default parameters. See [tools/README.md](tools/README.md) for how the database is generated.

Currently includes detailed definitions for popular boards like Pixhawk 6X/6C, Matek H743/F405, CubeOrange/Black, Kakute H7, SpeedyBee F405, and many others.

## Getting Started

### Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later
- **Git**
- A flight controller running **ArduPilot** (ArduCopter 4.3+ or ArduPlane 4.3+)

### Install

```bash
git clone https://github.com/agoliveira/ardugui.git
cd ardugui
npm install
```

### Run in Development

```bash
npm run dev
```

This starts the Vite dev server and launches the Electron app with hot reload. The app opens automatically with serial port access.

**Browser-only preview** (no serial -- inspect UI without a flight controller):

```bash
npm run preview
```

### Build

```bash
npm run build:electron
```

Produces platform-specific packages in `release/` (AppImage/deb on Linux, NSIS on Windows, DMG on macOS).

### MAVLink Code Generation

The MAVLink protocol types are generated from upstream XML definitions:

```bash
# Clone MAVLink definitions
git clone https://github.com/mavlink/mavlink resources/mavlink-definitions

# Generate TypeScript types
npm run generate:mavlink
```

### Board Database Update

To refresh the board database from the latest ArduPilot source:

```bash
# Scrape hardware definitions
python3 tools/scrape-hwdef.py --summary

# Generate TypeScript
python3 tools/generate-board-defs.py
```

See [tools/README.md](tools/README.md) for options and details.

## Tech Stack

| Component | Technology |
|---|---|
| App shell | Electron 40 |
| Language | TypeScript 5.9 |
| UI framework | React 19 |
| Build tool | Vite 7 |
| State management | Zustand 5 |
| Styling | Tailwind CSS 4 |
| 3D rendering | Three.js 0.183 (calibration viewer) |
| Serial | node-serialport 13 |
| Protocol | MAVLink v2 (generated from XML) |
| Icons | Lucide React |

## Project Structure

```
ardugui/
├── electron/              Electron main process
│   ├── main.ts            Window management, IPC bridge
│   ├── preload.ts         Context bridge for renderer
│   └── serial/            Serial port communication layer
├── src/
│   ├── app/               App shell, layout, sidebar, header
│   ├── components/        Reusable UI components
│   │   ├── AirframeIcons.tsx    Aircraft silhouettes (shared across all pages)
│   │   ├── BoardDiagram.tsx     Interactive FC board pin visualization
│   │   ├── Calibration3DViewer.tsx  Three.js 3D orientation viewer (GLB models)
│   │   ├── DebugConsole.tsx     MAVLink message inspector
│   │   ├── HealthBar.tsx        Sensor/subsystem health indicators
│   │   ├── SaveDialog.tsx       Parameter review and write-to-FC dialog
│   │   └── VehicleGraphics.tsx  Motor/servo diagrams for motors page
│   ├── hooks/             React hooks
│   │   └── useDetectedPreset.ts  Detect configured airframe from FC params
│   ├── mavlink/           MAVLink protocol layer
│   │   ├── connection.ts  Connection manager singleton
│   │   ├── parser.ts      MAVLink v2 packet parser
│   │   ├── encoder.ts     Message encoding
│   │   └── messages.ts    Message type definitions
│   ├── models/            Data definitions
│   │   ├── airframeTemplates.ts  Aircraft presets, servo mappings, motor layouts
│   │   ├── boardData.ts          FC board database (generated from hwdef)
│   │   ├── boardRegistry.ts      Board detection and lookup
│   │   └── frameDefinitions.ts   Motor positions by frame class/type
│   ├── pages/             One directory per sidebar tab
│   │   ├── Calibration/   Accelerometer calibration with 3D viewer
│   │   ├── CLI/           Raw parameter search, filter, edit
│   │   ├── Configuration/ Grouped parameter editing
│   │   ├── Failsafes/     Battery, RC, GCS failsafe config
│   │   ├── FrameWizard/   Guided airframe selection and servo mapping
│   │   ├── Modes/         Flight mode assignment with RC range sliders
│   │   ├── Motors/        Motor test, frame diagram, servo table
│   │   ├── Navigation/    Geofence and RTL parameters
│   │   ├── OSD/           Canvas-based OSD layout editor
│   │   ├── PIDTuning/     PID parameter editing
│   │   ├── Ports/         Serial port protocol assignment
│   │   ├── Receiver/      RC input visualization
│   │   └── Setup/         Board info, connection status
│   ├── store/             Zustand state stores
│   │   ├── calibrationStore.ts   Accelerometer calibration state machine
│   │   ├── connectionStore.ts    Serial port state, connection lifecycle
│   │   ├── debugStore.ts         Debug console message buffer
│   │   ├── parameterStore.ts     All FC parameters, dirty tracking, write-back
│   │   ├── telemetryStore.ts     Real-time telemetry values
│   │   └── vehicleStore.ts       Vehicle type, firmware info, armed state
│   └── styles/            Theme CSS custom properties
├── public/
│   └── models/            3D models (GLB) for calibration viewer
├── tools/                 Build-time scripts
│   ├── scrape-hwdef.py    ArduPilot hwdef parser
│   └── generate-board-defs.py  Board database generator
├── ARCHITECTURE.md        Full architecture specification
├── CHANGELOG.md           Version history
├── CONTRIBUTING.md        Developer guide
├── DISCLAIMER.md          Safety and liability notice
└── SECURITY.md            Vulnerability reporting policy
```

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the detailed architecture specification, including the MAVLink protocol layer design, state management patterns, and page-by-page specifications.

## Contributing

Contributions are welcome, but please read [CONTRIBUTING.md](CONTRIBUTING.md) first. This project is in a very early stage and the architecture is still evolving -- coordinating before starting work will save everyone time.

## License

GPLv3. See [LICENSE](LICENSE) for the full text.

This project is not affiliated with, endorsed by, or supported by the ArduPilot project, Dronecode, or any flight controller manufacturer.
