# ArduGUI -- Architecture Guide

Last updated: March 15, 2026

---

## Stack

- **Runtime:** Electron (main + renderer process)
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + custom Forge v6 theme (src/styles/theme.css)
- **State:** Zustand stores (no Redux)
- **3D:** Three.js (calibration viewer, control surface viewer)
- **Database:** SQLite via better-sqlite3 (parameter backup system)
- **MAVLink:** Custom parser (not mavlink-mappings or dronekit)

---

## Process Architecture

```
Electron Main Process (main.ts)
  - Serial port access (Web Serial API or node-serialport)
  - SQLite database (parameter backups)
  - File system (export/import)
  - IPC bridge to renderer

Electron Renderer Process (React app)
  - All UI
  - MAVLink parsing (connection.ts runs in renderer)
  - Zustand stores
  - Wizard logic
```

---

## Directory Structure

```
src/
  app/
    Layout.tsx            Main layout, page routing, wizard switch
    Sidebar.tsx           Navigation items
    Header.tsx            Connection status, telemetry badges
    Footer.tsx            Save/revert buttons
  
  components/
    AirframeIcons.tsx     All frame SVG icons (copter, plane, VTOL)
    BoardDiagram.tsx      Board pin diagram for Ports/Setup pages
    Calibration3DViewer.tsx  Three.js accel/compass calibration
    ConfirmDialog.tsx     In-app confirm dialog + useConfirm() async hook
    ControlSurface3DViewer.tsx  Three.js control surface viewer
    MotorTestPanel.tsx    Shared motor test hook + composable sub-components
    RcCalibration.tsx     Reusable RC transmitter calibration (2-phase)
    SaveDialog.tsx        Parameter write confirmation
    HealthBar.tsx         GPS/battery health indicators
    DebugConsole.tsx      MAVLink packet inspector

  mavlink/
    connection.ts         Serial connection, param read/write, message routing
    messages.ts           MAVLink v1/v2 message parsing and encoding
    crc.ts                MAVLink CRC calculation
    motorSafetyMonitor.ts IMU-based safety abort for motor tests

  store/
    connectionStore.ts    Connection state, port info, param progress
    vehicleStore.ts       Vehicle type, firmware, board ID, armed state
    parameterStore.ts     Parameters, dirty tracking, effective value pattern
    telemetryStore.ts     GPS, battery, attitude, RC channels, servo outputs
    calibrationStore.ts   Accel calibration state machine
    preflightStore.ts     PreArm message capture + categorization (NEW)

  models/
    airframeTemplates.ts  Preset definitions: motor positions, servo slots, extras
    frameDefinitions.ts   FRAME_CLASS/TYPE to motor layout (for copter diagrams)
    motorTestDefs.ts      Shared motor test types, ESC protocols, position helpers
    boardRegistry.ts      Legacy hand-coded board database (8 boards)
    boardData.ts          Generated board database (414 boards from ArduPilot hwdef)
    inavImport.ts         INAV dump/diff parser + ArduPilot mapper (~1850 lines)
    inavTimerData.ts      Timer-to-pad mappings for 174 INAV boards (generated)
    flightModes.ts        Mode definitions, colors, vehicle-type filtering
    failsafeGroups.ts     Failsafe param groups per vehicle type
    configGroups.ts       Configuration page param groups
    paramValidation.ts    Cross-parameter validation rules (safety, VTOL, battery, etc.)

  pages/
    Setup/SetupPage.tsx
    FrameWizard/FrameWizard.tsx   Standalone frame selection page
    Motors/MotorsPage.tsx         Motor test, frame diagram, servo table
    ControlSurfaces/ControlSurfacesPage.tsx  3D viewer + servo bars (plane/VTOL)
    Gps/GpsPage.tsx               Live telemetry + constellation config
    Battery/BatteryPage.tsx       Monitor type, calibration, failsafe thresholds
    Esc/EscPage.tsx               Protocol, DShot, direction reversal, spin thresholds
    Transitions/TransitionsPage.tsx  VTOL transition config (quadplane only)
    Ports/PortsPage.tsx
    Receiver/ReceiverPage.tsx     Live RC channel bars
    Calibration/CalibrationPage.tsx  Accel, compass, RC cal, level trim, reboot
    Modes/ModesPage.tsx
    Failsafes/FailsafesPage.tsx
    Preflight/PreflightPage.tsx   Pre-flight readiness dashboard
    Wiring/WiringPage.tsx         Board-aware wiring guide
    Backups/BackupsPage.tsx
    Firmware/FirmwarePage.tsx     Flash + BDShot toggle
    
    SetupWizard/
      SetupWizard.tsx             Orchestrator, welcome, reset flow, abandon/rollback
      WizardStepper.tsx           Left sidebar step indicator
      WizardNav.tsx               Bottom nav (Back/Next/Skip), writes params on Next
      wizardStore.ts              Zustand: steps, stagedParams, writtenParams,
                                  initialSnapshot, pendingReset, persistence
      steps/
        FrameStep.tsx
        OutputMappingStep.tsx     Output pad to function mapping
        MotorEscStep.tsx          Uses shared useMotorTest hook
        ControlSurfacesStep.tsx   3D viewer integration
        TiltServosStep.tsx        Quadplane tilt verification (mode-switch test)
        TransitionsStep.tsx       VTOL transition params
        ReceiverStep.tsx
        RcCalibrationStep.tsx     Wraps shared RcCalibration component
        GpsStep.tsx
        CompassStep.tsx
        AccelerometerStep.tsx
        FlightModesStep.tsx
        FailsafesStep.tsx
        InitialTuneStep.tsx       Prop-based filter/tune params
        ReviewStep.tsx            Summary of written params, safety warnings, reboot
        InavImportDialog.tsx      Import dialog (dump/diff), auto cell count

    (others: CLI, Config, PID, Nav, OSD, Expert)

  styles/
    theme.css             Forge v6 CSS variables + component styles

tools/
  scrape-hwdef.py         Scrapes ArduPilot hwdef for board definitions
  generate-board-defs.py  Converts scraped JSON to boardData.ts
  scrape-inav-timers.py   Scrapes INAV target.c for timer-to-pad data
```

---

## State Management Pattern

### Zustand Stores

Each store is a standalone module with typed state + actions. Components subscribe to
specific slices via selectors: `const voltage = useTelemetryStore(s => s.battery?.voltage)`.

### Effective Value Pattern

Parameters can exist in three layers:
1. **FC values** -- parameterStore.parameters (read from flight controller)
2. **Dirty values** -- parameterStore.dirtyParams (user edits not yet written)
3. **Wizard staged values** -- wizardStore.stagedParams (accumulated during wizard)

Reading priority: staged > dirty > FC.

```typescript
// In wizard steps:
const value = stagedParams[name] ?? getEffectiveValue(paramState, name);

// In regular pages:
const value = dirtyParams.get(key) ?? parameters.get(key)?.value;
```

### Wizard stagedParams

All wizard steps accumulate changes in `wizardStore.stagedParams`. Nothing writes to the
FC until the Review step, EXCEPT:
- **Output Mapping** -- writes SERVO_FUNCTION immediately (motor test needs it)
- **Calibration steps** -- offsets saved to FC directly (physical process)

### Import Source of Truth

`wizardStore.importSource: 'inav' | null` -- when set:
- FrameStep skips SERVO_FUNCTION staging (preserves import values)
- FrameStep allows advancing without preset selection
- OutputMappingStep shows "imported from INAV" banner
- MotorEscStep reads motor list from stagedParams as fallback

---

## MAVLink Layer

Custom implementation in `src/mavlink/`. Not using any third-party MAVLink library.

### connection.ts (ConnectionManager)

Singleton `connectionManager`. Key methods:
- `connect(port, baudRate)` -- opens serial, starts heartbeat, loads params
- `writeParam(name, value)` -- PARAM_SET with echo confirmation
- `motorTest(motorIndex, throttlePct, durationSec)` -- DO_MOTOR_TEST (CMD 209)
- `sendCommandLong(cmd, p1..p7)` -- generic COMMAND_LONG
- `sendCommandWithAck(cmd, p1..p7)` -- COMMAND_LONG + wait for COMMAND_ACK
- `requestPreArmCheck()` -- MAV_CMD_RUN_PREARM_CHECKS (CMD 401)

Message routing: incoming messages are parsed in messages.ts and dispatched to stores
(telemetryStore for attitude/GPS/battery, parameterStore for PARAM_VALUE, etc.).

PreArm STATUSTEXT messages are routed to preflightStore.

### messages.ts

Parses MAVLink v1 and v2 binary frames. Extracts: HEARTBEAT, PARAM_VALUE, SYS_STATUS,
GPS_RAW_INT, ATTITUDE, RC_CHANNELS, SERVO_OUTPUT_RAW, STATUSTEXT, COMMAND_ACK, etc.

---

## Board Database (Two-Tier)

### boardRegistry.ts (Legacy, 8 boards)

Hand-coded BoardDef objects with rich metadata: connectors, uartPorts with pad labels,
dimensions, form factor. Used by most pages (Ports, Setup, Motors).

### boardData.ts (Generated, 414 boards)

Auto-generated from ArduPilot hwdef files by tools/scrape-hwdef.py + generate-board-defs.py.
Every board has: uartPorts, serialOrder, outputGroups, builtinSensors, batteryMonitor.
22 confirmed from BOARD_METADATA, 392 unconfirmed.

Used by INAV import for serial port resolution. Migration planned to replace boardRegistry.

### inavTimerData.ts (Generated, 174 boards)

Auto-generated from INAV firmware target.c by tools/scrape-inav-timers.py.
Maps hardware timer numbers to physical output pads (S1, S2, etc.).
Used by INAV import for motor/servo output assignment.

---

## Airframe Templates

`src/models/airframeTemplates.ts` defines presets for all supported airframes.

Each preset has:
- `motorTemplate` -- forwardMotors (with positions, rotation) + vtolMotors
- `planeTemplate` -- control surface ServoSlots (function, defaultOutput, category)
- `additionalParams` -- FRAME_CLASS, FRAME_TYPE, Q_ENABLE, etc.
- `category` -- 'copter' | 'plane' | 'vtol'

`buildServoAssignments()` builds the complete SERVO output map from a preset + user overrides.

---

## INAV Import Pipeline

```
User pastes dump/diff
  -> parseInavDiff(text)         Parse into InavConfig struct
    -> header (board, version)
    -> timer_output_mode lines
    -> mmix/smix (motor/servo mixers)
    -> serial ports, features, settings, aux modes
    -> osd_layout lines
    -> channel map
  -> mapToArduPilot(config, board, cellCount, liveVoltage)
    -> VTOL detection (dual platform types or transition servos)
    -> Serial port mapping (INAV port -> board pad -> ArduPilot SERIAL)
    -> Vehicle type, frame params
    -> Motor protocol
    -> Battery thresholds (auto cell count from voltage if bat_cells=0)
    -> Failsafes, filters, flight modes
    -> Compass orient, board alignment (decideg -> radians)
    -> GPS constellations
    -> Channel map (TAER -> RCMAP_*)
    -> OSD layout (~35 elements, OSD1_ prefix)
    -> RC expo/rates (skipped with note)
    -> Board-aware output mapping (timer data -> physical pads)
  -> Result: { params, summary, skipped, vehicleType, cellCount }
  -> SetupWizard: start(vehicleType) -> setImportSource('inav') -> stageParams(params)
```

---

## Wizard Architecture: Write-As-You-Go

```
                   wizardStore
                  +-------------------+
  start() ------->| initialSnapshot   |  FC params captured at wizard start
                  | stagedParams      |  Accumulated across steps (for cross-step reads)
                  | writtenParams     |  What was actually committed to FC
                  | pendingReset      |  Auto-trigger factory reset on mount
                  +-------------------+

  Step flow:
    User configures -> step calls stageParams()
    User clicks Next -> WizardNav.commitStagedParams()
      -> for each staged param not yet written:
           connectionManager.writeParam(name, value)
      -> recordWritten(toWrite)
      -> nextStep()

  Abandon flow:
    User clicks X -> dialog with 3 options:
      Continue Wizard -> dismiss
      Keep Changes   -> abandon(), params stay on FC
      Undo Changes   -> for each writtenParam where old != new:
                          connectionManager.writeParam(name, initialSnapshot[name])
                        abandon()

  ReviewStep:
    Summary of writtenParams vs initialSnapshot (what changed)
    Safety warnings for skipped critical steps + acknowledgment checkbox
    Finish -> reboot dialog -> reboot or skip -> abandon()
```

All wizard steps are skippable. Steps with `safetyCritical: true` show warnings
at Review with specific consequences. Finish is gated behind an acknowledgment
checkbox when safety-critical steps were skipped.

---

## Visual Identity: Forge v6

CSS variables in theme.css:
- Backgrounds: --bg-base (#0c0b0a), --bg-surface-0 (#13120f), --bg-surface-1 (#1a1816)
- Accent: --color-accent (#ffaa2a), hover (#e89520)
- Text: --color-foreground (#f5f0eb), --color-muted (#a69a90), --color-subtle (#7a736c)
- Status: --color-success (#22c55e), --color-danger (#ef4444), --color-warning (#f59e0b)

Compact layout: header 40px, footer 36px, sidebar 160px.
VS Code-style 2px left-border active indicator in sidebar.
No gradients, no shadows, no glows. Flat buttons, 3-4px border radius.
