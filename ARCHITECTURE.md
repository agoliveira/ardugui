# ArduGUI -- Architecture Guide

Last updated: March 20, 2026

---

## Stack

- **Runtime:** Electron 36 (main + renderer process)
- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS 4 + custom Forge v6 theme (src/styles/theme.css)
- **State:** Zustand stores (no Redux)
- **3D:** Three.js (calibration viewer, control surface viewer)
- **Database:** SQLite via sql.js (parameter backup system, aircraft registry)
- **MAVLink:** Custom parser (not mavlink-mappings or dronekit)
- **Node:** 22 (required by Electron 36)

### Pre-delivery checklist

Before delivering any code, always run:

```bash
npm install --ignore-scripts   # skip Electron binary if it fails
npx tsc --noEmit               # must report ZERO errors
```

The project uses `noUnusedLocals: true` and `noUnusedParameters: true` in tsconfig.
CI will reject any unused import, variable, or type. No ESLint config exists yet.

---

## Process Architecture

```
Electron Main Process (electron/main.ts)
  - Serial port access (node-serialport via serialManager.ts)
  - SQLite database (aircraft registry + parameter snapshots)
  - File system (export/import .param files)
  - Window management (bounds persistence, close guard)
  - IPC bridge to renderer (serialBridge.ts, dbBridge.ts)

Electron Preload (electron/preload.ts)
  - Context bridge exposing: serial, fs, net, db, zoom APIs
  - Types declared in src/vite-env.d.ts

Electron Renderer Process (React app in src/)
  - All UI (React + Tailwind)
  - MAVLink parsing (connection.ts runs in renderer)
  - INAV CLI communication (inavCli.ts -- raw serial, no MAVLink)
  - Zustand stores
  - Wizard logic
  - Three.js viewers
```

---

## Directory Structure

```
src/
  app/
    Layout.tsx            Main layout, page routing, wizard/naming dialogs
    Sidebar.tsx           Navigation items (vehicle-type-aware)
    Header.tsx            Connection status, aircraft name, zoom, theme toggle
    Footer.tsx            Save/revert buttons, dirty count

  components/
    AirframeIcons.tsx     All frame SVG icons (copter, plane, VTOL)
    BoardDiagram.tsx      Board pin diagram
    Calibration3DViewer.tsx  Three.js accel/compass calibration
    ConfirmDialog.tsx     In-app confirm dialog + useConfirm() hook
    ControlSurface3DViewer.tsx  Three.js control surface viewer
    HelpTip.tsx           HelpTip (tooltip), StepHelp (wizard), PageHelp (standalone)
    MotorOverlay.tsx      CopterMotorDiagram -- THE motor diagram (used everywhere)
    MotorTestPanel.tsx    Shared motor test hook + sub-components
    RcCalibration.tsx     Reusable RC calibration (standalone CalibrationPage)
    SaveDialog.tsx        Parameter write confirmation
    HealthBar.tsx         GPS/battery health indicators
    DebugConsole.tsx      MAVLink packet inspector
    VehicleGraphics.tsx   Vehicle outline SVGs for calibration

  mavlink/
    connection.ts         Serial connection, param read/write, message routing,
                          post-connect tasks (identify aircraft, auto-backup)
    messages.ts           MAVLink v1/v2 message parsing and encoding
    parser.ts             Byte-level MAVLink frame parser
    encoder.ts            MAVLink message encoding
    mavftp.ts             MAVFTP file transfer protocol
    motorSafetyMonitor.ts IMU-based safety abort for motor tests
    inavCli.ts            Raw serial CLI for INAV (enter CLI, dump all, status)

  models/
    airframeTemplates.ts  Frame presets (Quad X, Hexa, Plane, VTOL variants)
    boardData.ts          700KB auto-generated board database (414 boards)
    boardRegistry.ts      Board lookup, detection, hwdef parsing
    frameDefinitions.ts   Motor positions and rotation for each frame type
    inavImport.ts         INAV "dump all" parser -> ArduPilot parameter mapping
    inavTimerData.ts      174 INAV board timer-to-pad mappings (auto-generated)
    inavBoardMap.ts       80+ INAV target -> ArduPilot platform mappings
    paramValidation.ts    8 VTOL pre-flight validation checks
    help/                 Help text data (12 domain files + wizard + pages)
    configGroups.ts       Parameter grouping for Configuration page
    failsafeGroups.ts     Failsafe parameter definitions
    flightModes.ts        Flight mode definitions per vehicle type
    motorTestDefs.ts      Motor test shared types
    osd*.ts               OSD element definitions, fonts, presets
    serialPorts.ts        Serial port protocol definitions

  pages/
    Setup/                Connect page + INAV migration flow
    SetupWizard/          Wizard orchestrator, stepper, nav, 14 step components
    Motors/, Battery/, ESC/, GPS/, Receiver/, Calibration/, Firmware/,
    ControlSurfaces/, Transitions/, Modes/, Failsafes/, Preflight/,
    Wiring/, MyAircraft/, Ports/, Configuration/, CLI/, Expert/,
    OSD/, Navigation/, PIDTuning/, FrameWizard/

  store/
    connectionStore.ts    Connection state, port info, param progress
    vehicleStore.ts       Vehicle type, firmware, board ID, aircraft name
    parameterStore.ts     Parameters, dirty tracking, effective values
    telemetryStore.ts     Live battery, GPS, RC channels, RSSI
    calibrationStore.ts   Calibration progress
    demoStore.ts          Demo mode with intercepted connectionManager
    themeStore.ts         Dark/light theme
    zoomStore.ts          UI zoom (60-200%, Electron webFrame)
    debugStore.ts         Debug console toggle
    preflightStore.ts     Pre-arm check state

  utils/
    autoBackup.ts         Aircraft identification, naming, auto/manual snapshots

  styles/
    theme.css             Forge v6 variables, component styles, light theme

electron/
  main.ts               Window creation, bounds persistence, close guard, menus
  preload.ts            Context bridge (serial, fs, net, db, zoom)
  serial/
    serialManager.ts    SerialPort wrapper with concurrent-open/drain guards
    serialBridge.ts     IPC handlers for serial operations
  db/
    parameterDb.ts      SQLite schema, CRUD for aircraft + snapshots
    dbBridge.ts         IPC handlers for database operations
```

---

## Key Design Patterns

### Write-as-you-go wizard
Each wizard step writes parameters to the FC immediately (not staged until the end).
The ReviewStep shows a diff of everything that changed. This means:
- Steps can be revisited without losing other steps' work
- A reboot mid-wizard doesn't lose configuration
- The "what changed" diff is always accurate

### INAV import as source of truth
When importing from INAV, the `wizardStore.importSource` flag is set to `'inav'`.
Steps that would normally set defaults (like FrameStep setting SERVO_FUNCTION) check
this flag and skip overwriting imported values.

### Single motor diagram
`CopterMotorDiagram` in `MotorOverlay.tsx` is the ONLY motor rendering in the app.
Both the wizard MotorEscStep and the standalone MotorsPage use it. Never create a
second motor diagram.

### Effective value pattern
`parameterStore` tracks both FC values and local (dirty) values. The `effectiveValue()`
method returns the dirty value if one exists, otherwise the FC value. This lets the
UI show pending changes before they're written.

### Connection flow
1. User clicks Connect -> `connectionManager.connect()` opens serial port
2. GCS heartbeat starts (1Hz) -> FC responds with heartbeat
3. Parameter download begins (PARAM_REQUEST_LIST)
4. On complete -> post-connect tasks: telemetry streams, AUTOPILOT_VERSION, identifyAircraft, autoBackup
5. Status transitions: disconnected -> connecting -> loading -> connected

### INAV migration flow
1. USB descriptor identifies INAV board in port list
2. Connect button intercepts -> shows InavMigrationFlow instead of MAVLink
3. Opens serial for raw CLI (not MAVLink) -> enters CLI mode -> runs "dump all"
4. Parses board target, maps to ArduPilot platform, downloads _with_bl.hex
5. Shows flash instructions (INAV Configurator primary, dfu-util alternative)
6. User flashes manually, clicks "I've flashed it"
7. Tries MAVLink connect -> on success, stores dump in sessionStorage
8. Wizard auto-opens InavImportDialog with pre-loaded config

### Aircraft identity
Keyed by `boardId` from AUTOPILOT_VERSION MAVLink message -- unique hardware string.
Persisted in SQLite `aircraft` table with user-assigned name. Name prompted on first
connect (integrated in wizard prompt dialog, not a separate dialog).
