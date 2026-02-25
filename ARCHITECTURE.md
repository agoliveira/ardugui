# ArduGUI - Architecture Specification

**Version:** 0.1.0
**Date:** February 2026
**License:** GPLv3
**Status:** Pre-alpha -- Active development. Architecture is implemented but evolving.

---

## 1. Project Vision

### 1.1 Problem Statement

ArduPilot is the most capable open-source autopilot firmware, but its configuration tools (Mission Planner, QGroundControl) expose the full complexity of the system, creating a steep learning curve. INAV Configurator demonstrates that a guided, workflow-oriented GUI dramatically lowers the barrier to entry, but INAV's firmware lacks ArduPilot's depth.

ArduGUI builds an INAV Configurator-style GUI for ArduPilot, bringing the approachability of INAV's interface to ArduPilot's capabilities.

### 1.2 Design Philosophy

- **Guided, not exhaustive.** The UI presents curated configuration workflows, not a flat parameter dump. Advanced users can still access raw parameters via a CLI tab.
- **Safe by default.** Parameter changes are validated, dependencies are enforced, and dangerous configurations trigger warnings before they are written to the flight controller.
- **Vehicle-aware.** The interface adapts its panels and options based on the detected vehicle type (multirotor, plane, or VTOL/QuadPlane).
- **Opinionated but escapable.** The GUI makes smart decisions about what to show and how to group things, but never prevents access to the full parameter set.

### 1.3 Supported Vehicles

| Vehicle Type | ArduPilot Firmware | MAV_TYPE Values | Status |
|---|---|---|---|
| Multirotors | ArduCopter | QUADROTOR, HEXAROTOR, OCTOROTOR, TRICOPTER, DODECAROTOR | Primary |
| Fixed-wing planes | ArduPlane | FIXED_WING | Primary |
| VTOL / QuadPlane | ArduPlane (QuadPlane) | VTOL_TAILSITTER, VTOL_TILTROTOR, VTOL_FIXEDWING, VTOL_RESERVED2-5 | Secondary |

**Explicitly excluded:** Helicopters (H_* parameter tree), Rovers/Boats (ArduRover), Submarines (ArduSub), Antenna Trackers.

---

## 2. Tech Stack

| Component | Technology | Version | Purpose |
|---|---|---|---|
| App shell | Electron | 40.x | Desktop app, native OS access |
| Language | TypeScript | 5.9 | Type safety across entire codebase |
| UI framework | React | 19.x | Component-based reactive UI |
| Build tool | Vite | 7.x | Fast dev server, HMR, bundling |
| State management | Zustand | 5.x | Lightweight reactive stores |
| Styling | Tailwind CSS | 4.x | Utility-first CSS, design consistency |
| 3D rendering | Three.js | 0.183 | Calibration viewer (GLB model loading, animated orientation) |
| Serial communication | node-serialport | 13.x | USB/Serial port access |
| MAVLink | Custom, generated from XML | MAVLink v2 | Flight controller communication |
| Icons | Lucide React | 0.575 | UI icons (consistent, tree-shakeable) |
| Charting | To be decided (recharts, uPlot, or Chart.js) | - | Real-time telemetry graphs |
| Maps | To be decided (Leaflet or MapLibre) | - | Mission planning (future) |

### 2.1 Development Environment

- **Primary OS:** Linux (developer's desktop)
- **Repository:** GitHub (GPLv3)
- **Package manager:** npm
- **Linting:** ESLint + Prettier
- **Testing:** Vitest (unit), Playwright (E2E, future)
- **CI:** GitHub Actions (lint, type-check, build)

### 2.2 Reference Codebases

QGroundControl (GPLv3, C++/Qt/QML) is the most battle-tested open-source MAVLink GCS and serves as a primary reference for protocol-level implementation. Since both projects share the GPLv3 license, we can freely study and reimplement patterns from QGC.

**What to reference from QGC:**
- MAVLink connection handling: timeouts, retries, reconnection edge cases
- Parameter download logic: gap detection when packets are dropped, retry strategies for failed reads/writes, firmware version quirks (see `ParameterManager.cc`)
- Vehicle detection and capability discovery: vehicle type branching, QuadPlane detection via `Q_ENABLE` (see `Vehicle.cc`, `FirmwarePlugin`)
- Message throttling: avoiding FC flooding on outbound messages, acknowledgment timeout handling, data stream rate management
- Calibration wizards: compass, accelerometer, and radio calibration flows (good UX reference for our Setup page)

**What not to reference from QGC:**
- UI patterns. QGC takes the "expose everything" approach that we are deliberately avoiding. Their parameter editor is exactly the flat list we do not want.

**How to use QGC:**
Keep the QGC repo cloned locally as a reference. When implementing a feature (e.g., parameter download with gap detection), study how QGC handles it, understand the edge cases, and write a clean TypeScript implementation covering the same cases. This gives us years of bug-fix wisdom without cargo-culting code that does not fit our architecture.

ArduPilot's pymavlink and MAVProxy are also valuable references for MAVLink protocol edge cases.

---

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Electron Main Process                │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Window Mgmt  │  │ Serial Port  │  │  File System   │  │
│  │              │  │ Manager      │  │  Access        │  │
│  └──────────────┘  └──────┬───────┘  └───────────────┘  │
│                           │ IPC (contextBridge)          │
├───────────────────────────┼──────────────────────────────┤
│                     Electron Renderer Process             │
│                           │                              │
│  ┌────────────────────────▼─────────────────────────┐    │
│  │              Transport Layer                       │    │
│  │  Raw bytes ↔ MAVLink message framing              │    │
│  └────────────────────────┬─────────────────────────┘    │
│                           │                              │
│  ┌────────────────────────▼─────────────────────────┐    │
│  │              MAVLink Protocol Layer                │    │
│  │  Binary parsing ↔ Typed message objects            │    │
│  │  (Auto-generated from XML definitions)             │    │
│  └────────────────────────┬─────────────────────────┘    │
│                           │                              │
│  ┌────────────────────────▼─────────────────────────┐    │
│  │              Service Layer                         │    │
│  │  ParameterService  │ VehicleService               │    │
│  │  TelemetryService  │ FirmwareService              │    │
│  └────────────────────────┬─────────────────────────┘    │
│                           │                              │
│  ┌────────────────────────▼─────────────────────────┐    │
│  │              State Layer (Zustand)                 │    │
│  │  connectionStore │ parameterStore │ vehicleStore   │    │
│  │  calibrationStore │ telemetryStore │ debugStore    │    │
│  └────────────────────────┬─────────────────────────┘    │
│                           │                              │
│  ┌────────────────────────▼─────────────────────────┐    │
│  │              UI Layer (React + Tailwind)           │    │
│  │  Pages │ Components │ Hooks                        │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 3.1 Process Separation

Electron runs two processes:

**Main process** has full Node.js access. It manages the application window, serial port hardware access via `node-serialport`, and file system operations (saving/loading configs, firmware files). It communicates with the renderer via Electron's `contextBridge` and IPC channels.

**Renderer process** runs the React application. It has no direct access to Node.js APIs. It receives serial data and sends serial commands through the IPC bridge. All UI logic, MAVLink parsing, and state management lives here.

### 3.2 Why Parse MAVLink in the Renderer?

An alternative would be to parse MAVLink in the main process and send structured data over IPC. We chose renderer-side parsing because:

- Reduces IPC traffic to raw bytes (simple, fast)
- Keeps all application logic in one process, simplifying debugging
- Avoids duplicating MAVLink types across both processes
- The renderer already needs MAVLink encoding for outbound messages

The main process is deliberately kept thin. It is just a serial port proxy and window manager.

---

## 4. Layer Specifications

### 4.1 Transport Layer

**Responsibility:** Accept raw bytes from the IPC bridge, frame them into complete MAVLink v2 packets, and pass them to the parser. In the outbound direction, accept encoded MAVLink packets and send them as bytes through IPC.

**MAVLink v2 packet structure:**

```
Offset  | Byte | Field
--------|------|------------------
0       | 0xFD | Start marker (v2)
1       | len  | Payload length
2       | seq  | Packet sequence
3       | sys  | System ID
4       | comp | Component ID
5       | msgL | Message ID (low byte)
6       | msgM | Message ID (mid byte)
7       | msgH | Message ID (high byte)
8..8+len| ...  | Payload
-2..-1  | CRC  | CRC-16/MCRF4XX (includes CRC_EXTRA per message)
```

The transport layer implements:
- **Packet framing:** Scans byte stream for 0xFD start markers, validates length, extracts complete packets.
- **CRC validation:** Computes CRC-16 with message-specific CRC_EXTRA seed byte. Drops invalid packets.
- **Sequence tracking:** Tracks incoming sequence numbers to detect dropped packets (telemetry only, not critical for configuration).

**Not implemented at transport level:** Message signing (MAVLink v2 optional feature). Out of scope for initial release. Signing is primarily for companion computers and GCS over telemetry links, not USB configuration.

### 4.2 MAVLink Protocol Layer

**Responsibility:** Convert between raw binary payloads and strongly-typed TypeScript objects. This layer is entirely auto-generated.

#### 4.2.1 Code Generation Strategy

ArduPilot's MAVLink dialect is defined in XML files:

- `common.xml` contains standard MAVLink messages (HEARTBEAT, PARAM_*, COMMAND_*, STATUSTEXT, etc.)
- `ardupilotmega.xml` contains ArduPilot-specific extensions
- Other dialect files are imported by ardupilotmega.xml

A build-time code generator (`scripts/generate-mavlink.ts`) reads these XMLs and produces:

```
src/mavlink/generated/
├── enums.ts              # All MAVLink enums as TypeScript enums
├── messages/
│   ├── Heartbeat.ts      # Per-message: type, parser, encoder, CRC_EXTRA
│   ├── ParamValue.ts
│   ├── ParamSet.ts
│   ├── CommandLong.ts
│   ├── ...               # One file per message definition
│   └── index.ts          # Re-exports all messages
├── registry.ts           # Message ID → parser lookup table
└── types.ts              # Shared base types (MavLinkMessage, etc.)
```

Each generated message file exports:
- A TypeScript **interface** defining the message fields with correct types
- A **parse** function (Buffer → typed object)
- An **encode** function (typed object → Buffer)
- The **CRC_EXTRA** constant for that message
- The **message ID** constant

Example of what generated code looks like:

```typescript
// generated/messages/Heartbeat.ts
export const MSG_ID = 0;
export const CRC_EXTRA = 50;

export interface Heartbeat {
  customMode: number;      // uint32
  type: MavType;           // uint8 enum
  autopilot: MavAutopilot; // uint8 enum
  baseMode: number;        // uint8 bitmask
  systemStatus: MavState;  // uint8 enum
  mavlinkVersion: number;  // uint8
}

export function parse(payload: Buffer): Heartbeat { ... }
export function encode(msg: Heartbeat): Buffer { ... }
```

#### 4.2.2 Messages Used

The configurator does not need all ~300+ MAVLink messages. The core set:

**Connection and Identity:**
- `HEARTBEAT` (0): Vehicle type, firmware type, armed state
- `AUTOPILOT_VERSION` (148): Firmware version, capabilities
- `STATUSTEXT` (253): Log messages from FC

**Parameters:**
- `PARAM_REQUEST_LIST` (21): Request all parameters
- `PARAM_REQUEST_READ` (20): Request single parameter
- `PARAM_VALUE` (22): Parameter value response
- `PARAM_SET` (23): Write parameter value

**Commands:**
- `COMMAND_LONG` (76): General commands (reboot, calibrate, preflight, etc.)
- `COMMAND_ACK` (77): Command acknowledgment

**Telemetry (for real-time displays):**
- `ATTITUDE` (30): Roll, pitch, yaw
- `RAW_IMU` (27): Accelerometer, gyro, magnetometer raw data
- `GPS_RAW_INT` (24): GPS fix data
- `SYS_STATUS` (1): Battery voltage, current, remaining
- `RC_CHANNELS` (65): RC input values (for receiver page)
- `SERVO_OUTPUT_RAW` (36): Motor/servo outputs (for motor test page)
- `VFR_HUD` (74): Airspeed, groundspeed, altitude, climb rate

**Data Streams:**
- `REQUEST_DATA_STREAM` (66): Enable/disable telemetry groups
- `MESSAGE_INTERVAL` (244): Set per-message rates (preferred in newer firmware)

Additional messages can be added by re-running the generator. No structural changes needed.

#### 4.2.3 Connection State Machine

```
    ┌──────────┐
    │DISCONNECTED│
    └─────┬────┘
          │ User selects port + baud → open serial
          ▼
    ┌──────────┐
    │ CONNECTING │  Waiting for first HEARTBEAT
    └─────┬────┘   Timeout after 10s → DISCONNECTED
          │ HEARTBEAT received
          ▼
    ┌──────────┐
    │IDENTIFYING │  Request AUTOPILOT_VERSION
    └─────┬────┘   Read vehicle type, firmware version
          │ Version received
          ▼
    ┌──────────┐
    │LOADING    │  PARAM_REQUEST_LIST → receive all params
    └─────┬────┘   Progress bar: received / expected count
          │ All params received
          ▼
    ┌──────────┐
    │ CONNECTED │  Full operation, UI enabled
    └─────┬────┘
          │ Serial error / user disconnect / heartbeat timeout
          ▼
    ┌──────────┐
    │DISCONNECTED│
    └──────────┘
```

Heartbeat timeout: If no HEARTBEAT received for 5 seconds during CONNECTED state, transition to DISCONNECTED with a "connection lost" notification.

### 4.3 Service Layer

Services are singleton classes (or plain modules) that encapsulate business logic. They interact with the MAVLink layer below and the Zustand stores above.

#### 4.3.1 ParameterService

The most critical service. Manages the full lifecycle of parameters.

**Responsibilities:**
- Trigger full parameter download on connect (`PARAM_REQUEST_LIST`)
- Cache all received `PARAM_VALUE` messages in the parameter store
- Track "dirty" state: parameters modified in the UI but not yet written to the FC
- Write dirty parameters to the FC via `PARAM_SET`, with retry logic (3 attempts, 1s timeout per attempt)
- Validate proposed values against parameter metadata (min, max, type, bitmask)
- Provide a "save all" operation that writes all dirty params and verifies each was accepted
- Provide a "revert" operation that discards dirty changes and restores cached FC values

**Parameter metadata** comes from two sources:
1. **At runtime:** Each `PARAM_VALUE` message includes the parameter type (float, int32, etc.)
2. **At build time:** ArduPilot publishes parameter documentation files that include human-readable names, descriptions, valid ranges, valid values (enums), bitmask definitions, units, and which vehicle types they apply to. These are bundled as static JSON in the app. (See Section 5 for details.)

#### 4.3.2 VehicleService

**Responsibilities:**
- Parse `HEARTBEAT` to determine vehicle type and armed state
- Parse `AUTOPILOT_VERSION` to determine firmware version string
- Expose capability flags (is this a QuadPlane? Does it support mission protocol?)
- Determine which UI pages to show/hide based on vehicle type

**Vehicle detection logic:**

```
HEARTBEAT.type == FIXED_WING → check for Q_ENABLE param
  Q_ENABLE == 0 or missing → vehicle = PLANE
  Q_ENABLE >= 1            → vehicle = QUADPLANE

HEARTBEAT.type in [QUADROTOR, HEXAROTOR, OCTOROTOR, TRICOPTER, ...] → vehicle = COPTER

HEARTBEAT.type in [VTOL_*] → vehicle = QUADPLANE
```

#### 4.3.3 TelemetryService

**Responsibilities:**
- Request data streams at appropriate rates on connect
- Route incoming telemetry messages to the telemetry store
- Manage stream rates (reduce when not viewing telemetry pages, increase when viewing PID graphs)
- Provide time-series buffering for chart data (ring buffer, configurable depth)

**Stream rate strategy:**
- Idle: 1 Hz (HEARTBEAT, SYS_STATUS only)
- Receiver page active: RC_CHANNELS at 10 Hz
- PID tuning page active: ATTITUDE + RAW_IMU at 50 Hz
- Motor test page active: SERVO_OUTPUT_RAW at 10 Hz

#### 4.3.4 FirmwareService

**Responsibilities:**
- Parse firmware version from `AUTOPILOT_VERSION`
- Compare against known version compatibility ranges
- Flag deprecated or renamed parameters
- Future: firmware flashing support (out of scope for v1)

### 4.4 State Layer (Zustand Stores)

Four primary stores, each focused on a domain:

#### 4.4.1 connectionStore

```typescript
interface ConnectionState {
  status: 'disconnected' | 'connecting' | 'identifying' | 'loading' | 'connected';
  portPath: string | null;
  baudRate: number;
  availablePorts: PortInfo[];
  error: string | null;
  paramLoadProgress: { received: number; total: number } | null;

  // Actions
  connect: (port: string, baud: number) => Promise<void>;
  disconnect: () => void;
  refreshPorts: () => Promise<void>;
}
```

#### 4.4.2 parameterStore

```typescript
interface ParameterState {
  // All parameters received from FC, keyed by name
  parameters: Map<string, ParameterEntry>;

  // Parameters modified in UI but not yet written
  dirtyParams: Map<string, number | string>;

  // Actions
  setParamLocal: (name: string, value: number) => void;  // UI change only
  saveParam: (name: string) => Promise<boolean>;           // Write single to FC
  saveAll: () => Promise<SaveResult>;                      // Write all dirty
  revertAll: () => void;                                   // Discard dirty changes
  getParam: (name: string) => ParameterEntry | undefined;
}

interface ParameterEntry {
  name: string;
  value: number;
  type: ParamType;         // FLOAT, INT32, INT16, INT8, UINT32, etc.
  index: number;           // Parameter index in FC
  metadata?: ParamMeta;    // From ArduPilot definitions (see Section 5)
}

interface ParamMeta {
  displayName: string;
  description: string;
  min?: number;
  max?: number;
  units?: string;
  values?: Record<number, string>;   // For enum-type params
  bitmask?: Record<number, string>;  // For bitmask params
  vehicle: ('copter' | 'plane' | 'quadplane')[];
  rebootRequired?: boolean;
}
```

#### 4.4.3 vehicleStore

```typescript
interface VehicleState {
  type: 'copter' | 'plane' | 'quadplane' | null;
  firmwareVersion: string | null;
  firmwareType: string | null;  // 'ArduCopter', 'ArduPlane'
  armed: boolean;
  capabilities: Set<string>;

  // Derived
  visiblePages: string[];  // Which sidebar pages to show
}
```

#### 4.4.4 telemetryStore

```typescript
interface TelemetryState {
  attitude: { roll: number; pitch: number; yaw: number } | null;
  gps: { lat: number; lon: number; alt: number; fix: number; satellites: number } | null;
  battery: { voltage: number; current: number; remaining: number } | null;
  rcChannels: number[];       // 1-18 channel values
  servoOutputs: number[];     // Motor/servo PWM values
  vfrHud: { airspeed: number; groundspeed: number; altitude: number; climb: number } | null;
}
```

### 4.5 UI Layer

#### 4.5.1 Application Layout

```
┌───────────────────────────────────────────────────────────┐
│  Header Bar: Connection status │ Vehicle info │ Armed     │
├──────────┬────────────────────────────────────────────────┤
│          │                                                │
│  Sidebar │              Content Area                      │
│          │                                                │
│  Setup   │  (Active page renders here)                    │
│  Ports   │                                                │
│  Config  │                                                │
│  Receiver│                                                │
│  Modes   │                                                │
│  Motors  │                                                │
│  PIDs    │                                                │
│  Nav     │                                                │
│  Failsafe│                                                │
│  OSD     │                                                │
│  Transit*│                                                │
│  CLI     │                                                │
│          │                                                │
├──────────┴────────────────────────────────────────────────┤
│  Footer: Save/Revert buttons │ Dirty param count │ FC log │
└───────────────────────────────────────────────────────────┘

* Transitions page visible only for QuadPlane
```

#### 4.5.2 Page Definitions

Each page maps to a sidebar tab and has a defined scope of parameters and functionality.

**Setup**
- Serial port selection and baud rate
- Connect / disconnect
- Firmware version display
- Board info (if available)
- Accelerometer calibration trigger
- Compass calibration trigger

**Ports**
- Serial port protocol assignment (SERIAL1_PROTOCOL, SERIAL2_PROTOCOL, etc.)
- Baud rate per port
- Visual table showing which port is assigned to what (GPS, telemetry, ESC telemetry, etc.)

**Configuration**
- Frame type selection (with visual diagram): quad X, quad +, hex, octo, Y6, tricopter, etc. (copter) or flying wing, V-tail, normal, etc. (plane)
- Motor protocol: PWM, OneShot125, OneShot42, DShot150/300/600/1200
- Battery monitoring: voltage/current sensor configuration
- Board orientation (AHRS_ORIENTATION)
- Arming checks enable/disable

**Receiver**
- RC input type: PPM, SBUS, CRSF, SRXL2, etc.
- Channel map (RCMAP_ROLL, RCMAP_PITCH, etc.)
- Live channel preview bars (requires RC_CHANNELS telemetry)
- Channel reverse toggles
- Failsafe PWM value per channel

**Modes**
- INAV-style range slider UI
- Each flight mode (FLTMODE1-6) assigned to a channel range
- Visual display of current channel value and which mode is active
- Available modes filtered by vehicle type:
  - Copter: Stabilize, AltHold, Loiter, RTL, Auto, Acro, Sport, PosHold, Land, etc.
  - Plane: Manual, FBWA, FBWB, Cruise, Auto, RTL, Loiter, Circle, ACRO, etc.
  - QuadPlane: All plane modes + Q_Stabilize, Q_Hover, Q_Loiter, Q_Land, Q_RTL, Q_Acro, etc.

**Motors**
- Motor layout diagram (shows numbered motor positions for detected frame)
- Motor spin direction indicators
- Motor test: spin individual motors (COMMAND_LONG → MAV_CMD_DO_MOTOR_TEST)
- ESC calibration trigger
- Servo output assignment (for planes: aileron, elevator, rudder, flaps)

**PID Tuning**
- Dedicated tabs/sections for:
  - Copter: Rate roll/pitch/yaw PIDs (ATC_RAT_RLL_*, ATC_RAT_PIT_*, ATC_RAT_YAW_*)
  - Copter: Angle controller (ATC_ANG_*)
  - Plane: TECS (TECS_*), nav roll/pitch (NAV_*, LIM_*)
  - QuadPlane: Both copter and plane PID sections
- Real-time graph overlay: setpoint vs actual for roll, pitch, yaw
- Input fields with increment/decrement buttons for fine adjustment

**Navigation**
- RTL altitude and behavior (RTL_ALT, RTL_LOIT_TIME, etc.)
- Position hold parameters
- Waypoint defaults (speed, radius)
- Geofence enable/type/radius (FENCE_*)
- For planes: TKOFF_*, LAND_* parameters
- For QuadPlane: Q_RTL_MODE, Q_OPTIONS

**Failsafes**
- Radio failsafe (FS_THR_ENABLE, FS_THR_VALUE)
- Battery failsafe (BATT_FS_LOW_ACT, BATT_FS_CRT_ACT, voltage/mAh thresholds)
- GCS failsafe (FS_GCS_ENABLE)
- EKF failsafe (FS_EKF_ACTION, FS_EKF_THRESH)
- Each failsafe: visual toggle + action dropdown + threshold inputs
- Clear indication of what each action does (RTL, Land, SmartRTL, Terminate)

**OSD** - See Section 6 for full specification.

**Transitions (QuadPlane only)**
- Visible only when vehicle is QuadPlane
- Transition speed and timeout (Q_TRANSITION_MS)
- VTOL assist thresholds (Q_ASSIST_SPEED, Q_ASSIST_ALT, Q_ASSIST_ANGLE)
- Tilt rotor configuration (Q_TILT_TYPE, Q_TILT_MAX, Q_TILT_RATE_DN)
- Q_RTL_MODE selection with visual explanation of each mode
- Q_OPTIONS bitmask with clear descriptions
- Visual state diagram showing hover → transition → cruise → transition → hover

**CLI**
- Full parameter list in searchable/filterable table
- Direct parameter editing by name
- Parameter search with regex support
- Import/export full parameter file (.param format, ArduPilot standard)
- Raw MAVLink console (for debugging): show incoming/outgoing messages
- Reboot FC command

#### 4.5.3 Reusable Components

**ParamInput** is a polymorphic input component that renders differently based on parameter metadata:
- Numeric: slider or number input with min/max
- Enum: dropdown with labeled options
- Bitmask: checkbox group
- Boolean: toggle switch
- Unknown: plain number input with raw value

**ModeRangeSlider** is the INAV-style channel-to-mode assignment widget. A horizontal bar representing PWM range (1000-2000), with colored segments for each mode. Draggable dividers to adjust ranges.

**MotorDiagram** is an SVG-based motor position diagram. Shows motor numbers, spin directions, frame shape. Highlights individual motors during motor test.

**AttitudeIndicator** provides real-time roll/pitch/yaw display. Artificial horizon style or 3D model.

**RealtimeChart** is a time-series chart for PID tuning and telemetry. Must handle 50Hz data without frame drops. Ring buffer for history depth. Multiple overlay traces with legend.

**StatusBar** shows dirty param count, save/revert buttons, connection state, last status text from FC.

---

## 5. Parameter Mapping System

This is the core data model that drives the entire UI. It uses a two-layer architecture that leverages ArduPilot's own parameter metadata instead of duplicating it.

### 5.1 Layer 1: ArduPilot Parameter Definitions (Consumed, Not Authored)

ArduPilot publishes complete parameter metadata for every firmware build. This metadata includes human-readable display names, descriptions, valid ranges, enum value labels, bitmask bit labels, units, and reboot-required flags.

At build time, a script (`scripts/import-param-metadata.ts`) fetches or reads these definition files and converts them into typed JSON:

```
src/models/metadata/
├── copter-params.json     # Pulled from ArduPilot at build time
├── plane-params.json
└── merge.ts               # Merges ArduPilot metadata into a lookup map
```

This provides all the raw information needed to render any parameter correctly (types, ranges, enum labels, bitmask labels, units, descriptions) without us writing or maintaining any of it.

When ArduPilot adds new parameters, we re-run the import script. When they change ranges or add enum values, we pick that up automatically.

### 5.2 Layer 2: UI Mapping (Authored, Compact)

The only files we write and maintain are the UI mappings: which parameters appear on which page, how they are grouped, and any visual overrides or warnings we want to add beyond what ArduPilot's metadata provides.

These are written in TypeScript rather than YAML, for three reasons:

1. **Pattern helpers eliminate repetition.** A `pid('Rate Roll', 'ATC_RAT_RLL')` call expands to all 7-8 sub-parameters with correct suffixes. Similar helpers cover serial ports, RC channels, and other repeating structures.

2. **Most parameters need zero configuration.** ArduPilot's metadata already defines how to render them. The mapping file only needs the parameter name. An empty `{}` means "put this here, use defaults for everything else." Overrides are the exception.

3. **Type-checking catches errors.** Misspell a parameter name and TypeScript flags it at compile time.

```
src/models/
├── schema-helpers.ts         # page(), group(), pid(), params() helpers
├── metadata/
│   ├── copter-params.json    # From ArduPilot (Layer 1)
│   ├── plane-params.json     # From ArduPilot (Layer 1)
│   └── merge.ts              # Merges metadata into lookup map
├── copter.ts                 # Copter UI mappings
├── plane.ts                  # Plane UI mappings
├── quadplane.ts              # VTOL-specific mappings (extends plane + copter refs)
└── common.ts                 # Shared groups: GPS, battery, failsafe, OSD
```

#### 5.2.1 Mapping Example

```typescript
// models/copter.ts

import { page, group, pid, params } from './schema-helpers';

export default [
  page('configuration', [
    group('Frame', params({
      FRAME_CLASS:  { widget: 'frame-picker' },  // custom visual widget
      FRAME_TYPE:   {},                            // all metadata from ArduPilot defs
    })),
    group('Motor Protocol', params({
      MOT_PWM_TYPE: {},
      MOT_PWM_MIN:  {},
      MOT_PWM_MAX:  {},
    })),
  ]),

  page('pid_tuning', [
    // pid() helper expands to P, I, D, FF, FLTT, FLTD, FLTEF, SMAX
    pid('Rate Roll',  'ATC_RAT_RLL'),
    pid('Rate Pitch', 'ATC_RAT_PIT'),
    pid('Rate Yaw',   'ATC_RAT_YAW'),
  ]),

  page('failsafes', [
    group('Battery', params({
      BATT_FS_LOW_ACT:  { warning: { values: [5], message: 'Terminates in flight!' } },
      BATT_LOW_VOLT:    {},
      BATT_LOW_MAH:     {},
      BATT_FS_CRT_ACT:  { warning: { values: [5], message: 'Terminates in flight!' } },
      BATT_CRT_VOLT:    {},
      BATT_CRT_MAH:     {},
    })),
    group('Radio', params({
      FS_THR_ENABLE: {},
      FS_THR_VALUE:  {},
    })),
  ]),

  page('modes', [
    group('Flight Modes', params({
      FLTMODE1: {},
      FLTMODE2: {},
      FLTMODE3: {},
      FLTMODE4: {},
      FLTMODE5: {},
      FLTMODE6: {},
      FLTMODE_CH: {},
    })),
  ]),
];
```

#### 5.2.2 Dependency and Visibility Rules

Some parameters only make sense when another parameter has a specific value. Since mappings are TypeScript, dependencies are expressed naturally:

```typescript
params({
  GPS_TYPE:         {},
  GPS_AUTO_CONFIG:  { visibleWhen: { GPS_TYPE: '> 0' } },
  GPS_GNSS_MODE:   { visibleWhen: { GPS_TYPE: '> 0' } },
})

params({
  Q_TILT_TYPE:     {},
  Q_TILT_MAX:      { visibleWhen: { Q_TILT_TYPE: '> 0' } },
  Q_TILT_RATE_DN:  { visibleWhen: { Q_TILT_TYPE: '> 0' } },
})
```

#### 5.2.3 Estimated Scale

With pattern helpers handling repetitive parameters and ArduPilot metadata handling all descriptions, ranges, and enum/bitmask labels:

| File | Estimated Lines |
|---|---|
| schema-helpers.ts | ~150 |
| common.ts | ~200 |
| copter.ts | ~200-300 |
| plane.ts | ~200-300 |
| quadplane.ts | ~100-150 |
| **Total authored** | **~850-1100 lines** |

#### 5.2.4 Unmapped Parameters

Parameters not included in any UI mapping file are still accessible via the CLI tab, which shows the full parameter list in a searchable table. When ArduPilot adds new parameters, they appear immediately in the CLI tab. Adding them to a GUI page requires editing the appropriate mapping file.

---

## 6. OSD Specification

The OSD (On-Screen Display) editor is a differentiated feature of ArduGUI, designed to significantly improve on existing tools.

### 6.1 Design Goals

- **True WYSIWYG.** Render OSD elements using actual OSD fonts over a simulated camera background, not abstract labels on a wireframe.
- **HD-native.** Full support for modern digital OSD systems (DJI, HDZero, Walksnail) alongside legacy analog (MAX7456).
- **Preset-driven.** Users start from curated layouts, not a blank canvas.
- **Portable.** Layouts can be saved, loaded, and migrated across OSD backends.

### 6.2 Supported OSD Backends

| OSD Backend | OSD_TYPE Value | Grid Size | Aspect Ratio | Font Source |
|---|---|---|---|---|
| Analog MAX7456 (PAL) | 1 | 30 x 16 | 4:3 | MAX7456 bitmap |
| Analog MAX7456 (NTSC) | 1 | 30 x 13 | 4:3 | MAX7456 bitmap |
| DJI O3 / Vista (MSP DisplayPort) | 5 | 60 x 22 | 16:9 | DJI HD font |
| HDZero | 5 | 50 x 18 | 16:9 | HDZero HD font |
| Walksnail Avatar | 5 | 53 x 20 | 16:9 | Walksnail HD font |

The backend is detected from the `OSD_TYPE` parameter on connect. The canvas grid dimensions, aspect ratio, and font assets adapt accordingly.

### 6.3 Canvas-Based Editor

The OSD editor uses an HTML5 Canvas for rendering. This provides pixel-accurate font rendering from OSD bitmap character sets, smooth drag-and-drop without DOM overhead, compositing of background images, elements, and guides on a single surface, and consistent rendering across platforms.

#### 6.3.1 Canvas Layers (bottom to top)

1. **Background layer.** A dimmed FPV camera image providing spatial context. Ships with 2-3 default backgrounds (clear sky, treeline, urban). Aspect ratio matches the detected OSD backend (4:3 or 16:9).

2. **Grid layer.** Optional subtle grid lines showing character cell boundaries. Togglable.

3. **Safe zone layer.** Border indicating the typical visible area (some cameras and goggles crop edges). Configurable margin.

4. **Element layer.** OSD elements rendered in the actual OSD font at their grid positions. Selected elements show a highlight border and drag handles.

5. **Guide layer.** Alignment guides shown during drag: center lines, edge alignment with other elements, overlap warnings (red highlight when two elements collide).

#### 6.3.2 Interaction Model

- **Add elements:** Sidebar palette lists all available OSD elements organized by category (Flight Data, Battery, GPS, System, Navigation). Drag from palette onto canvas, or click to add at a default position.
- **Move elements:** Click to select, drag to reposition. Snaps to grid cells with optional free positioning. Multi-select (shift+click or drag selection box) to move groups.
- **Remove elements:** Select and press Delete, or drag back to palette, or right-click then remove.
- **Element options:** Some OSD elements have sub-parameters (e.g., altitude can be MSL or AGL). Clicking a placed element shows an options popover.

#### 6.3.3 Font Rendering

For v1, OSD elements are rendered using a clean, readable system font at the correct grid positions and proportions. The grid position accuracy (which is what matters for configuration) is correct from day one.

As a fast follow (v1.1), we add true bitmap font rendering using the actual OSD character set files. These font bitmaps are openly available in the ArduPilot and INAV font repositories. The canvas renders glyphs by blitting from a font atlas texture.

### 6.4 Multi-Screen Support

ArduPilot supports up to 4 OSD screens, typically toggled via an RC switch. The editor displays screen tabs across the top with thumbnail previews of each screen layout, allowing at-a-glance comparison of all screens without switching.

### 6.5 OSD Presets

#### 6.5.1 Bundled Starter Layouts

ArduGUI ships with curated OSD layout presets covering common use cases:

| Preset | Elements | Use Case |
|---|---|---|
| Minimal FPV | Battery voltage, RSSI, flight mode, timer | Clean screen for proximity/freestyle |
| Full Telemetry | Altitude, speed, GPS coords, sats, current, mAh, distance, heading | Long range, survey, exploration |
| Racing | Timer, battery voltage, warnings only | Maximum clean screen |
| Freestyle | Battery, flight mode, throttle, altitude | Balanced information |
| Cinematic / Long Range | GPS position, home distance/direction, altitude, battery, mAh, RSSI, link quality | Safe operation far from home |

Each preset is defined per grid size. A "Minimal FPV" preset for analog 30x16 and for DJI 60x22 has the same elements positioned appropriately for each grid's dimensions and aspect ratio.

The preset selector sits at the top of the OSD page. Pick a starting point, it populates the canvas, then tweak from there. Non-destructive: only applies when explicitly chosen.

#### 6.5.2 User Save / Load

**Export/Import as file.** Save the current OSD layout to a `.osd.json` file capturing all element positions, enabled states, backend type, and grid dimensions. Load onto another aircraft. If the backend type does not match, the migration preview (Section 6.6) handles repositioning.

**Local library.** Save named layouts within the app ("My Race Layout", "My Long Range Layout"). Stored in the app's local config directory. Quick to apply without file dialogs.

#### 6.5.3 OSD Layout Data Model

```typescript
interface OsdLayout {
  name: string;
  backend: OsdBackendType;      // 'analog_pal' | 'analog_ntsc' | 'dji' | 'hdzero' | 'walksnail'
  cols: number;
  rows: number;
  screens: OsdScreen[];
  metadata?: {
    author?: string;
    description?: string;
    vehicle?: 'copter' | 'plane' | 'quadplane';
    created?: string;
  };
}

interface OsdScreen {
  screenIndex: number;           // 1-4
  elements: OsdElement[];
}

interface OsdElement {
  id: string;                    // e.g. 'BATT_V', 'ALT', 'RSSI'
  x: number;
  y: number;
  enabled: boolean;
  options?: Record<string, number>;  // Element-specific sub-parameters
}
```

A bundled preset, a user save, and an imported file all use this same structure. The whole thing maps directly to/from `OSD_SCREEN*_*_EN`, `OSD_SCREEN*_*_X`, and `OSD_SCREEN*_*_Y` parameters.

### 6.6 Backend Migration Preview

When loading a layout saved for a different OSD backend (e.g., saved on analog, loading onto DJI), the editor:

1. Loads the layout and scales element positions proportionally to the new grid dimensions
2. Renders the result on the canvas
3. Highlights elements that overlap or fall outside the new grid boundaries in red
4. Lets the user adjust positions before committing

This is particularly valuable as pilots migrate from analog to HD systems.

### 6.7 OSD Parameter Mapping

Under the hood, each OSD element maps to three parameters per screen:

```
OSD_SCREEN{s}_{element}_EN   →  enabled (0/1)
OSD_SCREEN{s}_{element}_X    →  column position
OSD_SCREEN{s}_{element}_Y    →  row position
```

Where `{s}` is the screen number (1-4) and `{element}` is the element ID (e.g., `BAT_VOLT`, `ALTITUDE`, `RSSI`). The canvas editor reads these parameters on page load and writes them back on save. No intermediate format needed during a session.

---

## 7. Preset System

### 7.1 Parameter Presets

ArduGUI ships with curated parameter presets for common vehicle configurations. These provide safe, known-good starting points so users are not configuring everything from scratch.

#### 7.1.1 Initial Preset Set

**Copter:**
- 5" Freestyle quad: Aggressive PIDs, DShot600, typical 4S setup
- 7" Long Range quad: Conservative PIDs, GPS/RTH configured, typical 4S/6S
- 10" Cinelifter: Smooth PIDs, lower rates, typical 6S

**Plane:**
- Standard tailed plane: FBWA defaults, reasonable TECS tuning
- Flying wing: Elevon mixing, adjusted nav tuning

These presets are sourced from well-known community tunes published on the ArduPilot wiki, forums, and Discord. They are starting points, not final tunes. The app makes this clear in the UI.

#### 7.1.2 Preset Format

Presets are stored as standard ArduPilot `.param` files with additional metadata in comments:

```
# ArduGUI Preset: 5" Freestyle Quad
# Description: Aggressive tune for 5-inch freestyle builds on 4S
# Vehicle: copter
# Frame: QUAD X
# Author: Community
# Version: 1.0
ATC_RAT_RLL_P,0.135
ATC_RAT_RLL_I,0.135
ATC_RAT_RLL_D,0.003
ATC_RAT_PIT_P,0.135
...
MOT_PWM_TYPE,6
MOT_PWM_MIN,1000
MOT_PWM_MAX,2000
...
```

Using standard `.param` format means presets are compatible with Mission Planner and other tools. The metadata comments are parsed by ArduGUI but ignored by other software.

#### 7.1.3 Preset Application

When a user selects a preset:

1. The app loads the `.param` file
2. Shows a diff view: current values vs preset values for each parameter
3. User can accept all, reject all, or selectively include/exclude individual parameters
4. Accepted changes are applied as dirty parameters (not written to FC until the user explicitly saves)

#### 7.1.4 Community Contribution

Presets are stored in a `presets/` directory in the repository. Community members can contribute new presets via GitHub pull requests. Each preset must include the metadata header and should be tested on real hardware.

### 7.2 OSD Presets

See Section 6.5 for OSD-specific preset details.

---

## 8. UI Design Direction

### 8.1 Visual Identity

ArduGUI should look and feel like a modern desktop application, not a Chrome app from 2016. The goal is professional, clean, and purposeful. Every visual choice should serve usability.

**Dark-first design.** Dark theme is the default and the primary design target. This is an app for people who work under desk lamps, stare at OSD feeds, and often use it in workshops. A light theme can exist as a secondary option but it is not the priority.

**Purposeful spacing and hierarchy.** INAV crams inputs edge-to-edge with minimal visual grouping. ArduGUI uses proper padding, card-based grouping for related controls, and font weight/size to establish clear visual hierarchy. The same information becomes dramatically easier to scan when it has room to breathe.

**Subtle, functional animation.** Not decorative fluff. Smooth page transitions, parameter values that visually highlight when changed (dirty state indication), responsive progress indicators. These signal quality and make the app feel alive without slowing anyone down.

**Consistent component language.** Every toggle, dropdown, slider, and input field belongs to the same visual family. Tailwind plus a small set of custom-styled base components ensures this consistency.

### 8.2 Theme Support

For v1, theme support is minimal but architecturally sound:

- A set of 30-40 CSS custom properties defines the color palette (backgrounds, borders, text, accents, status colors)
- Dark theme ships as default
- Light theme as a secondary option, togglable in settings
- Tailwind's `dark:` class strategy handles the switching
- The architecture supports additional themes later without restructuring, but we do not invest in a theme editor or community themes for v1

### 8.3 Design References

- **Betaflight Configurator** (recent versions): Good balance between professional appearance and "this is a tool for configuring flight controllers." Target this level of polish.
- **INAV Configurator**: Functional layout and workflow to match or improve on, but not the visual style.
- **QGroundControl**: Not a UI reference (too dense, "expose everything" philosophy). Protocol and logic reference only.

---

## 9. Safety and Validation

### 9.1 Write Confirmation

Before writing parameters to the FC, the app shows a "Review Changes" dialog listing every parameter that will be modified, its current value, and the new value. Parameters flagged as `rebootRequired` are highlighted.

### 9.2 Dangerous Parameter Warnings

The parameter schema includes a `warning` field for dangerous values. The UI renders these prominently:

- **Red border** on the input when a dangerous value is set
- **Warning tooltip** explaining the risk
- **Write-time confirmation** for params that could cause fly-aways or crashes

### 9.3 Armed State Lock

When the FC is armed (detected via HEARTBEAT.base_mode), the UI disables parameter writes and shows a prominent "ARMED - Configuration Locked" banner. Parameters can be viewed but not modified.

### 9.4 Reboot Detection

When parameters requiring a reboot are written, the UI shows a "Reboot Required" prompt. The user can trigger a reboot via `MAV_CMD_PREFLIGHT_REBOOT_SHUTDOWN`. The app then waits for reconnection.

---

## 10. File System Operations

### 10.1 Parameter Files

ArduPilot's standard `.param` file format:

```
# ArduPilot parameter file
# Vehicle: QuadCopter
# Generated by ArduGUI
ATC_RAT_RLL_P,0.135
ATC_RAT_RLL_I,0.135
ATC_RAT_RLL_D,0.003
...
```

The app supports:
- **Export:** Save all current parameters (or just dirty params) to .param file
- **Import:** Load a .param file, show diff against current values, apply selectively
- **Comparison:** Load two .param files and highlight differences

### 10.2 OSD Layout Files

See Section 6.5.2. OSD layouts are saved as `.osd.json` files.

### 10.3 Application Configuration

App-level settings (window size, last connected port, preferred baud rate, theme selection, user OSD library) are stored via Electron's standard app data path (`electron-store` or similar).

---

## 11. Build and Release

### 11.1 Development Workflow

```bash
# Install dependencies
npm install

# Start dev server (Vite + Electron with hot-reload)
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint

# Run unit tests
npm run test

# Generate MAVLink types from XML
npm run generate:mavlink

# Import ArduPilot parameter metadata
npm run import:params
```

### 11.2 Production Build

```bash
# Build for current platform
npm run build

# Build for all platforms (via electron-builder)
npm run dist
```

Produces:
- Linux: AppImage, .deb
- Windows: .exe installer (NSIS)
- macOS: .dmg

### 11.3 CI Pipeline (GitHub Actions)

On every push:
1. Lint + type check
2. Unit tests
3. Build for all platforms
4. Upload artifacts

On tag (release):
1. All of the above
2. Publish GitHub Release with platform binaries

---

## 12. Directory Structure

```
ardugui/
├── electron/                    # Electron main process
│   ├── main.ts                  # App lifecycle, window management
│   ├── preload.ts               # Bridge between main & renderer
│   └── serial/                  # Serial port management
│       ├── serialManager.ts     # Port discovery, open/close
│       └── serialBridge.ts      # IPC to expose serial to renderer
│
├── src/                         # Renderer process (React app)
│   ├── app/                     # App shell, routing, layout
│   │   ├── App.tsx
│   │   ├── Layout.tsx           # Sidebar + content area
│   │   └── Header.tsx           # Connection status, save button
│   │
│   ├── mavlink/                 # MAVLink protocol layer
│   │   ├── parser.ts            # Binary message parsing
│   │   ├── encoder.ts           # Message encoding
│   │   ├── messages.ts          # Message type definitions
│   │   └── connection.ts        # Connection state machine + manager
│   │
│   ├── models/                  # Data definitions and vehicle configs
│   │   ├── airframeTemplates.ts # Aircraft presets, servo mappings, motor layouts
│   │   ├── boardData.ts         # FC board database (generated from hwdef)
│   │   ├── boardRegistry.ts     # Board detection and lookup
│   │   └── frameDefinitions.ts  # Motor positions by FRAME_CLASS/TYPE
│   │
│   ├── pages/                   # One per sidebar tab
│   │   ├── Setup/               # Board info, board diagram
│   │   ├── Ports/               # Serial protocol assignment
│   │   ├── Configuration/       # Grouped parameter editing
│   │   ├── Receiver/            # RC input visualization
│   │   ├── Modes/               # Flight mode range sliders
│   │   ├── FrameWizard/         # Guided airframe selection + servo mapping
│   │   ├── Motors/              # Motor test, frame diagram, servo table
│   │   ├── Calibration/         # Accelerometer calibration
│   │   ├── PIDTuning/           # PID parameter editing
│   │   ├── Navigation/          # Geofence, RTL
│   │   ├── Failsafes/           # Battery, RC, GCS failsafes
│   │   ├── OSD/                 # OSD layout editor
│   │   └── CLI/                 # Raw parameter search/filter/edit
│   │
│   ├── components/              # Reusable UI components
│   │   ├── AirframeIcons.tsx    # Solid aircraft silhouettes (shared across pages)
│   │   ├── BoardDiagram.tsx     # Interactive FC board pin visualization
│   │   ├── Calibration3DViewer.tsx # Three.js GLB model viewer
│   │   ├── DebugConsole.tsx     # MAVLink message inspector
│   │   ├── HealthBar.tsx        # Sensor/subsystem health indicators
│   │   ├── SaveDialog.tsx       # Parameter review + write-to-FC dialog
│   │   └── VehicleGraphics.tsx  # Motor/servo SVG diagrams
│   │
│   ├── hooks/                   # React hooks
│   │   └── useDetectedPreset.ts # Detect configured airframe from FC params
│   │
│   ├── store/                   # Global state management (Zustand)
│   │   ├── calibrationStore.ts  # Accel calibration state machine
│   │   ├── connectionStore.ts   # Serial port state, lifecycle
│   │   ├── debugStore.ts        # Debug console message buffer
│   │   ├── parameterStore.ts    # All FC params, dirty tracking
│   │   ├── telemetryStore.ts    # Real-time telemetry values
│   │   └── vehicleStore.ts      # Vehicle type, firmware, armed state
│   │
│   └── styles/                  # Theme and global styles
│       └── theme.css            # CSS custom properties for theming
│
├── public/
│   └── models/                  # 3D models (GLB) for calibration viewer
│       ├── airplane.glb         # Fixed-wing model (~630KB)
│       └── quadcopter.glb       # Quadcopter model (~190KB)
│
├── tools/                       # Build-time scripts
│   ├── scrape-hwdef.py          # ArduPilot hwdef parser
│   ├── generate-board-defs.py   # Board database generator
│   └── README.md                # Tool documentation
│
├── scripts/                     # Code generation
│   └── generate-mavlink.ts      # Generate TS types from MAVLink XML
│
├── ARCHITECTURE.md              # This file
├── CHANGELOG.md                 # Version history
├── CONTRIBUTING.md              # Developer guide
├── DISCLAIMER.md                # Safety and liability notice
├── SECURITY.md                  # Vulnerability reporting policy
├── LICENSE                      # GPLv3
├── README.md
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 13. Development Phases

### Phase 1: Foundation (Weeks 1-4)
- Project scaffold (Electron + Vite + React + Tailwind)
- MAVLink code generator from XML definitions
- Serial port IPC bridge
- Connection state machine
- Parameter download and display (raw table, CLI tab)
- Basic app shell with sidebar navigation
- Dark theme foundation with CSS custom properties

**Milestone:** Connect to a real FC over USB, download all parameters, display them in a searchable table.

### Phase 2: Core Configuration (Weeks 5-10)
- ArduPilot parameter metadata import pipeline
- TypeScript parameter mapping schema and helpers
- ParamInput component (all widget types)
- Configuration page (frame type, motor protocol)
- Receiver page with live RC preview
- Modes page with range sliders
- Failsafes page
- Save/revert workflow with review dialog
- Parameter file import/export

**Milestone:** Fully configure a multirotor from scratch using only this app (minus PID tuning and OSD).

### Phase 3: Advanced Features (Weeks 11-16)
- PID tuning page with real-time graphs
- Motor test page with visual diagram
- Navigation / geofence page
- Fixed-wing specific pages (TECS tuning, control surfaces)
- Parameter presets (bundled .param files + diff/apply UI)

**Milestone:** Full configuration capability for both copters and planes.

### Phase 4: OSD Editor (Weeks 17-20)
- Canvas-based OSD editor with dynamic grid
- HD OSD backend support (DJI, HDZero, Walksnail)
- Element palette and drag-and-drop
- Multi-screen support with thumbnail tabs
- Bundled OSD presets per backend
- User OSD layout save/load/export/import
- Backend migration preview

**Milestone:** Complete OSD editor superior to INAV Configurator.

### Phase 5: VTOL and Polish (Weeks 21-24)
- QuadPlane detection and UI adaptation
- Transitions page with visual state diagram
- True OSD bitmap font rendering (v1.1 enhancement)
- Light theme option
- Comprehensive copter + plane + QuadPlane parameter mappings
- UI polish, edge case handling, error recovery
- Documentation, README, contribution guidelines

**Milestone:** v1.0 release. Usable for multirotors, planes, and QuadPlanes.

---

## 14. Open Questions

These items need decisions but are not blocking Phase 1:

1. **Charting library:** recharts (React-native, easy) vs uPlot (fast, 50Hz capable, but lower-level API) vs Chart.js. Decision needed before Phase 3.

2. **Map library for navigation:** Leaflet (mature, simple) vs MapLibre GL (modern, vector tiles, better performance). Only needed for waypoint/geofence features.

3. **App name trademark check:** Verify "ArduGUI" does not conflict with existing projects. Brief search suggests it is clear but worth confirming.

---

## 15. Out of Scope (v1)

- Helicopter support (traditional heli, swashplate config)
- Rover / boat / submarine support
- Firmware flashing (defer to v2)
- Mission planning (waypoints, auto missions)
- Log analysis (let dedicated tools like UAV Log Viewer handle this)
- WiFi / Bluetooth / UDP connections (USB/serial only for v1)
- MAVLink message signing
- Multi-vehicle support
- Companion computer integration
- Lua scripting editor
- Localization / internationalization
