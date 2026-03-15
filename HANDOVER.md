# ArduGUI -- Session Handover Document

Last updated: March 15, 2026 (write-as-you-go wizard, all steps skippable, new standalone pages, VTOL checks, BDShot toggle, battery/ESC pages, INAV import fixes)

**IMPORTANT:** Verify against the actual codebase when starting a new session.
This doc may drift from reality. When in doubt, read the source.

---

## Project Overview

ArduGUI is an Electron-based ground control station for ArduPilot flight controllers.
It aims to be a more accessible alternative to Mission Planner and QGroundControl, with
focus on guided configuration workflows. Built with Electron + React + TypeScript + Tailwind.

**Mission statement:** Make ArduPilot as easy to use and configure as INAV, or easier.
The target audience is long-range/autonomous pilots (planes, wings, GPS quads) who may
be migrating from INAV. Betaflight import is explicitly out of scope -- different audience.

Repository: GitHub (CI/CD with ubuntu/windows builds)

---

## Development Environment Notes

**No DevTools console access.** The Electron app does not expose Chrome DevTools to
the user. All `console.log()` output is invisible. Never rely on console output for
debugging feedback or verification. If something needs to be visible, it must appear
in the UI. Design all error handling and status reporting to surface in the interface.

---

## Current Visual Identity: "Forge v6"

- Warm charcoal backgrounds (#0c0b0a, #13120f, #1a1816, #201e1a)
- Marigold accent (#ffaa2a, hover #e89520)
- Warm white/gray text (#f5f0eb, #a69a90, #7a736c)
- Utilitarian style: flat buttons, 3-4px radii, no gradients/shadows/glows
- Compact layout: header 40px, footer 36px (h-9), sidebar 160px
- VS Code-style 2px left-border active indicator in sidebar

---

## CRITICAL BUGS (Fix First in Next Session)

### BUG-1: RESOLVED -- Motors don't spin in wizard motor test

**Root cause (confirmed via Mission Planner):** Multiple issues stacked:
1. Tricopter rear motor template used function 35 (Motor 3) instead of 36 (Motor 4).
   ArduPilot's tricopter has NO Motor 3 -- it uses Motors 1, 2, 4.
2. DO_MOTOR_TEST uses frame position numbers (1, 2, 4), not sequential (1, 2, 3).
   Mission Planner confirms: buttons A=Motor1, B=Motor2, D=Motor4.
3. QuadPlane ESC protocol param is Q_M_PWM_TYPE, not MOT_PWM_TYPE (which doesn't
   exist on ArduPlane firmware).
4. Q_ENABLE=1 must be written first, then params re-read (Q_FRAME_CLASS spawns
   dynamically -- no reboot needed for this). Q_M_PWM_TYPE needs a reboot.
5. Timer groups on Matek F405-TE constrain output assignments: S1+S2 share TIM8,
   S3+S4 share TIM1, S5-S8 share TIM2. All outputs in a group must use the
   same protocol (DShot or PWM, not mixed).

**Status:** Fixed. All three motors spin on default outputs (S5, S6, S8) and on
custom S1/S2/S3 mapping. Confirmed via both Mission Planner and ArduGUI.

### BUG-2: Frame not auto-highlighted from INAV import

**Status:** Fixed via scoring system. Flying Wing Tri Tilt auto-selects correctly.

### BUG-3: Frame diagram missing in motor test (from INAV import)

**Status:** FIXED (March 13). useDetectedPreset now reads wizardStore.stagedParams
in the effective value chain (staged > dirty > FC). Q_FRAME_CLASS from import is
now visible to the Motors page diagram before it's written to FC.

### BUG-4: Auto cell count error on import

**Status:** FIXED (March 15). mapToArduPilot now accepts liveVoltage parameter,
estimates cells from battery voltage when bat_cells=0. Falls back to 4S with
prominent warning in both summary and skipped items.

### BUG-5: Factory reset before wizard

**Status:** IMPLEMENTED. Board detection dialog offers three options:
Continue / Start from beginning / Start fresh (factory reset).
"Start fresh" sets pendingReset flag, wizard auto-triggers the reset flow
(backup -> MAV_CMD_PREFLIGHT_STORAGE param1=2 -> reboot -> reconnect).
hwdef defaults (e.g. SERVO4_FUNCTION=21 on F405-TE) are expected and handled.

### BUG-6: DShot motor reversal not working (NEW)

SERVO_REVERSED does not reverse DShot motors. ArduPilot requires sending DShot
direction commands to the ESC (DSHOT_CMD_SPIN_DIRECTION_REVERSED), not setting
a SERVO param. The Reversed toggle has been removed from the wizard motor test.
A note directs users to BLHeliSuite or ESC Configurator. Native DShot reversal
is a future feature.

### BUG-7: Standalone Motors page has no motor test for custom mappings (NEW)

Motor test controls on the standalone Motors page are gated behind
`motorLayout && detectedPreset`. Custom SERVO_FUNCTION mappings that don't match
any preset result in no diagram and no test controls. The page should derive
testable motors from SERVO_FUNCTION assignments directly, like the wizard's
import fallback path.

---

## Major Architecture Changes (March 15 Session)

### Write-As-You-Go Wizard

The wizard no longer batches all param writes to a final Review step. Instead:
- Each step's params are written to the FC when the user clicks Next
- `wizardStore.writtenParams` tracks what was committed
- `wizardStore.initialSnapshot` captures FC state at wizard start
- Abandon dialog offers: Continue / Undo Changes (rollback) / Keep Changes
- Rollback writes `initialSnapshot` values back for changed params
- ReviewStep is now a summary showing what was written, not a commit step

### All Steps Skippable

Every wizard step can be skipped. Steps have `safetyCritical` and `skipWarning` fields.
ReviewStep shows a red panel listing skipped safety-critical steps with specific
consequences. Finish button is gated behind an acknowledgment checkbox.

### Standalone Pages for Every Wizard Function

Every wizard function is accessible outside the wizard via sidebar pages:
- GPS, Control Surfaces, Transitions, Battery, ESC -- all new standalone pages
- Sidebar order follows the zero-to-flight sequence
- Wizard is a thin guided wrapper, not the only way to configure

### Shared Components

- `useMotorTest` hook + `MotorTestPanel` composable sub-components
- `RcCalibration` reusable component (wizard + standalone)
- `ConfirmDialog` + `useConfirm()` hook (replaces all window.confirm)
- `motorTestDefs.ts` shared types and constants

### Board Detection Dialog

Replaces the simple "fresh board" prompt. Three options:
- Resume where you left off (if saved wizard progress exists)
- Start from the beginning (clear progress, keep FC settings)
- Start fresh (factory reset via pendingReset flag)
Detection: checks accel calibration + RC calibration + frame config.
QuadPlane now checks Q_FRAME_CLASS instead of only servo functions.

---

## ArduPilot QuadPlane Knowledge (Learned This Session)

Hard-won knowledge from debugging the motor test. Reference this before touching
any quadplane-related code.

### Parameter Lifecycle

- **Q_ENABLE=1** must be written before Q_FRAME_CLASS exists in the param table.
  After writing Q_ENABLE, re-read params (requestParamRefresh). No reboot needed.
- **Q_FRAME_CLASS** and **Q_FRAME_TYPE** spawn after Q_ENABLE. Write them after re-read.
- **Q_M_PWM_TYPE** (not MOT_PWM_TYPE!) controls VTOL motor protocol on quadplanes.
  MOT_PWM_TYPE does not exist on ArduPlane firmware. Takes effect at boot -- needs reboot.
- SERVO_FUNCTION writes take effect immediately, no reboot needed.

### Tricopter Motor Numbering

ArduPilot's tricopter (Q_FRAME_CLASS=7) uses Motors 1, 2, 4 (skipping 3):
- Motor 1: Front Right, function 33, default S5, CCW
- Motor 2: Front Left, function 34, default S6, CW
- Motor 4: Rear, function 36, default S8, CW
- Motor 7: Yaw tilt servo, function 39, default S11

There is NO Motor 3 in a tricopter. The DO_MOTOR_TEST command uses these exact
position numbers (1, 2, 4), not sequential (1, 2, 3). Mission Planner confirms
with test buttons A, B, D (skipping C).

### Timer Groups (Matek F405-TE/VTOL)

All outputs sharing a hardware timer must use the same protocol:
- Group 1 (TIM8): S1, S2 -- DShot capable
- Group 2 (TIM1): S3, S4 -- DShot capable
- Group 3 (TIM2): S5, S6, S7, S8 -- DShot capable
- Group 4 (TIM12): S9 -- NO DMA, no DShot
- Group 5 (TIM13): S10 -- NO DMA, no DShot
- Group 6 (TIM4): S11 -- NO DMA, no DShot

Mixing DShot motors and PWM servos in the same group will silently fail. The
default tricopter outputs (S5, S6, S8) are all in Group 3 -- safe for DShot.

### DShot Motor Reversal

SERVO_REVERSED does NOT reverse DShot motors. ArduPilot requires sending DShot
direction commands to the ESC. This is not currently implemented in ArduGUI.
Users must reverse motors via BLHeliSuite, ESC Configurator, or wire swap.

### Output Auto-Assignment

When SERVO_FUNCTION values are left at 0 and the FC reboots with Q_ENABLE=1 +
Q_FRAME_CLASS set, ArduPilot auto-assigns outputs:
- S1-S4: plane surfaces (aileron, elevator, throttle, etc.)
- S5+: VTOL motors in frame order
- S11: yaw tilt servo (tricopter)

The ArduPilot docs recommend NOT setting SERVO_FUNCTION manually for standard
layouts. The auto-assignment matches the board's timer groups correctly.

---

## Setup Wizard -- 15 Steps, All Vehicle Types

The wizard is the primary focus and "killer feature." It opens with a **welcome screen**
offering two paths: "Start Fresh" or "Import from INAV." The stepper and nav bar are
hidden during the welcome screen.

For ArduPlane firmware, "Start Fresh" shows a **vehicle type choice**: Airplane or VTOL.
This is necessary because ArduPlane handles both plane and quadplane configurations, and
the wizard step list differs (VTOL adds Control Surfaces, Tilt Servos, Transitions steps,
uses Q_ params). ArduCopter users skip straight to the wizard with no extra question.

### Step Details

| # | Step | Applies To | Key Detail |
|---|------|------------|------------|
| 1 | Frame | all | Template selection. Import banner when importSource='inav'. Skippable with import. |
| 2 | Output Mapping | all | Maps SERVOx_FUNCTION to physical pads. Writes to FC immediately. For quadplanes: writes Q_ENABLE first, triggers param refresh (spawns Q_FRAME_CLASS), then writes Q_FRAME_CLASS/TYPE alongside SERVO_FUNCTION. Board-specific pad labels. |
| 3 | Motors & ESC | all | Protocol selection (stages Q_M_PWM_TYPE for quadplanes, MOT_PWM_TYPE for copters) + motor spin test with position labels ("Front Right", "Rear") and ArduPilot motor number as subtitle. Battery gating. No motor reversal -- DShot reversal requires ESC configurator. |
| 4 | Control Surfaces | plane, quadplane | 3D Three.js viewer. Auto-detects views from servo functions. Per-surface reverse button and trim/travel panels. |
| 5 | Tilt Servos | quadplane | Tilt mechanism verification. Shows Q_TILT_TYPE, detected tilt servos. Skippable. |
| 6 | Receiver | all | Protocol selection, port assignment, live RC channel bars. Skippable. |
| 7 | GPS | all | Auto-detect, live satellite count/HDOP. Constellation = all on (31). Skippable. |
| 8 | Compass | all | Coverage ring visualization, direction hints. Skippable. |
| 9 | Accelerometer | all | 6-position calibration with 3D viewer, angle-based feedback. |
| 10 | Flight Modes | all | 6-slot assignment with recommended defaults per vehicle type, range bar with live RC. |
| 11 | Failsafes | all | RC/battery/GCS with recommended defaults. Battery thresholds from cell count. |
| 12 | Initial Tune | all | Prop size -> filter params from INAV Toolkit PROP_NOISE_PROFILES. AutoTune assigned to mode slot 6. Skippable. Plane gets simplified message. |
| 13 | Review & Apply | all | Grouped param diff, write to FC, in-app reboot dialog (not window.confirm). |

### Wizard Architecture

- **wizardStore.ts** -- Zustand store with step/phase system, stagedParams accumulator,
  importSource flag, localStorage persistence for resume, completion tracking
- **stagedParams pattern:** all wizard changes go to wizardStore.stagedParams. Nothing
  writes to FC until Review, EXCEPT: Output Mapping (writes SERVO_FUNCTION + Q_ params
  immediately) and calibration steps (offsets saved to FC directly).
- **importSource: 'inav' | null** -- when set, import data takes priority. FrameStep skips
  SERVO_FUNCTION staging. OutputMappingStep shows import banner. MotorEscStep reads motor
  list from stagedParams as fallback when no preset is selected.
- **Vehicle type choice:** SetupWizard.tsx shows Airplane/VTOL choice for ArduPlane firmware.
  VTOL restarts wizard with vehicleType='quadplane', regenerating step list.

### QuadPlane Q_ Parameter Flow (OutputMappingStep)

The VTOL motor subsystem requires Q_ENABLE + Q_FRAME_CLASS to be live on the FC before
motor test works. The OutputMappingStep handles this sequence:
1. Write Q_ENABLE=1 to FC
2. Call `connectionManager.requestParamRefresh()` (Q_FRAME_CLASS spawns in param table)
3. Call `connectionManager.waitForParam('Q_FRAME_CLASS')` (polls until it appears)
4. Write Q_FRAME_CLASS and Q_FRAME_TYPE to FC
5. Write all SERVO_FUNCTION values to FC

### Motor Test Numbering (MotorEscStep)

The MotorTestInfo interface separates three numbering concepts:
- **displayNum:** Frame diagram position (1, 2, 4 for tricopter) -- shown in UI
- **testInstance:** DO_MOTOR_TEST param1 -- same as displayNum (ArduPilot convention)
- **servoOutput:** Physical SERVO number -- found by scanning SERVO_FUNCTION for the
  motor's function value. Used for SERVO_REVERSED (if ever re-enabled).
- **positionLabel:** Human-readable ("Front Right", "Rear") derived from x/y coordinates.

---

## 3D Control Surface Viewer

`src/components/ControlSurface3DViewer.tsx` -- reusable Three.js component.

**Four geometry builders:**
- `buildWings(scene, params)` -- both sides visible. Mode "normal" (aileron outer + flap
  inner per side) or "elevon" (flying wing, one surface per side). Slight backward sweep.
- `buildTail(scene, params)` -- shared structure for elevator + rudder on same fuselage.
  `highlight` param dims the inactive surface (gray).
- `buildTiltTail(scene, params)` -- V-tail (tiltSign=+1) or A-tail (tiltSign=-1).

**V-tail solution (took 10+ iterations):** Build each arm exactly like a horizontal elevator
(span in X, chord in Z, deflection via rotation.x). Then apply V-angle tilt as a parent
group transform via rotation.z. The key insight: build horizontally first, tilt second.

**Six views:** Wings, Flying Wing, Elevator, Rudder, V-Tail, A-Tail.
Camera positions and instructions per view in VIEW_DEFS.

**Colors:** structure=0x2a2825, hinge=0x666666, accent=0xffaa2a (neutral),
success=0x22c55e (up/right), danger=0xef4444 (down/left).

Mockup iteration files: control-surface-3d-v1 through v15 exist in outputs for reference.

---

## INAV-to-ArduPilot Migration Assistant

### Import Pipeline

```
User pastes dump/diff
  -> parseInavDiff(text)           Parse into InavConfig struct
    -> header (board, version)
    -> timer_output_mode lines     (crucial for output mapping)
    -> mmix/smix entries           (motor/servo mixer rules)
    -> serial ports, features, settings, aux modes
    -> osd_layout lines            (element positions)
    -> channel map (TAER etc.)
    -> servo configs (min/max/trim)
  -> mapToArduPilot(config, board, cellCount)
    -> VTOL detection (allPlatformTypes has plane + MC, or transition servos)
    -> Serial port mapping (INAV port -> board pad label -> ArduPilot SERIAL index)
    -> Vehicle type, frame identity params
    -> Motor protocol, channel map, compass orient
    -> Battery thresholds, failsafes, filters, flight modes
    -> GPS constellations (Galileo/BeiDou/GLONASS -> bitmask)
    -> OSD layout (~35 elements)
    -> FW bank angle, waypoint radius, launch params
    -> Board-aware output mapping (timer data -> physical pads)
  -> Result: { params, summary, skipped, vehicleType, cellCount }
  -> SetupWizard: start(vehicleType) -> setImportSource('inav') -> stageParams(params)
```

### What Maps (implemented)

- Vehicle type: copter/plane/quadplane (dual mixer profiles detect VTOL)
- Motor/servo output mapping: board-aware via timer-to-pad data (174 boards)
- Motor protocol: DSHOT300/600/PWM -> MOT_PWM_TYPE
- Channel map: TAER -> RCMAP_ROLL=2, RCMAP_PITCH=4, RCMAP_THROTTLE=1, RCMAP_YAW=3
- Serial ports: GPS, RCIN, telemetry, ESC telem via board registry
- Receiver protocol: CRSF/SBUS/IBUS etc. -> SERIAL_PROTOCOL
- Battery: per-cell thresholds to total voltage
- Failsafe actions: RTH -> FS_THR_ENABLE, nav_rth_altitude -> RTL_ALT
- Gyro filter: gyro_main_lpf_hz -> INS_GYRO_FILTER
- Flight modes from AUX assignments -> FLTMODE1-6
- Compass orientation: align_mag -> COMPASS_ORIENT (CW270FLIP -> 14)
- GPS constellations: Galileo/BeiDou/GLONASS -> GPS_GNSS_MODE bitmask
- FW bank angle: nav_fw_bank_angle -> ROLL_LIMIT_DEG
- Waypoint radius: nav_wp_radius (cm) -> WP_RADIUS (m)
- OSD layout: ~35 INAV element IDs -> ArduPilot OSD_*_EN/_X/_Y params
- Servo travel limits: min/max/trim from servo config lines
- Motor direction: reversed -> MOT_YAW_SV_REV
- Craft name: surfaced as informational
- Arming angle: small_angle=180 surfaced as informational

### Timer-to-Pad Mapping (Board-Aware Output Assignment)

`src/models/inavTimerData.ts` -- 174 boards, auto-generated from INAV firmware target.c.
`tools/scrape-inav-timers.py` -- scraper, run against INAV firmware source.

**Algorithm:**
1. `timer_output_mode N` in dump/diff sets TIM(N+1) to MOTORS/SERVOS/LED/AUTO
2. Look up board in INAV_TIMER_DATA to find which timer each S-pad uses
3. All pads sharing a hardware timer get the same type
4. AUTO pads: remaining motors first, then remaining servos
5. Motors assigned to MOTORS pads in S-pad order
6. Servos assigned to SERVOS pads in S-pad order
7. Unused pads explicitly zeroed (prevents FC default bleedthrough)

**Verified on Xiake VTOL (Matek F405-TE):**
- TIM8=MOTORS -> S1=Motor1, S2=Motor2
- TIM1=MOTORS -> S3=Motor3, S4=unused (zeroed)
- TIM2=SERVOS -> S5=ElevonL, S6=ElevonR, S7=TiltL, S8=TiltR

Board name suffix stripping: MATEKF405TE_SD -> MATEKF405TE for both INAV_BOARD_MAP and
INAV_TIMER_DATA lookups. Strips _SD, _HD, _V2, _BT.

### Serial Port Mapping Chain

INAV uses 0-based port identifiers where identifier N = UART(N+1). Identifier 20 = USB VCP.
On Matek boards, UART N is on physical pad TXN/RXN.

Chain: INAV `serial 5 2` -> identifier 5 -> UART6 -> TX6/RX6 -> board registry uartPorts
lookup -> ArduPilot SERIAL index -> `SERIAL5_PROTOCOL = 5` (GPS).

### What's NOT Mapped (with reasons)

- PIDs: different controller architecture, unsafe to transfer
- Navigation tuning: different nav controllers, defaults are safe
- Board alignment: needs radian conversion (decidegrees), not implemented
- RC expo/rates: no direct equivalent, needs calculation
- Some OSD elements: no ArduPilot equivalent

### dump all vs diff all

dump all gives complete timer_output_mode for all outputs. diff all only shows overrides
from defaults, missing AUTO entries. UI recommends dump with a blue TIP box.

---

## March 13 Session Work

### Bug fixes
- **ReceiverStep change guard** -- root cause was `hadConfigOnMount` useRef missing
  late-arriving telemetry. Replaced with one-way state latch that catches rcChannels
  arriving after mount. Also fixed undefined `receiverConfigured` variable.
- **FrameStep copter drill-down persistence** -- `copterCategory` was a bare useState(null).
  Now auto-derived from the restored preset's FRAME_CLASS.
- **Frame diagram after import** -- `useDetectedPreset` now reads wizardStore.stagedParams
  in the effective value chain (staged > dirty > FC). Also uses `getVal('Q_ENABLE')`
  instead of only checking dirtyParams for VTOL detection.
- **Reboot loop** -- investigated with temporary diagnostic strip. Diagnosis: factory reset
  and reconnect are clean (~5.7s cycle). The observed issue may have been board-specific state.
  Diagnostic removed after testing.

### New: RC Calibration (mandatory wizard step + standalone page)
- `src/components/RcCalibration.tsx` -- reusable two-phase calibration component.
  Phase 1: capture range (live min/max tracking). Phase 2: confirm center (sticks centered,
  throttle low). Writes RCx_MIN/MAX/TRIM directly to FC. Throttle reversal detection
  blocks save with a red warning. RCMAP-aware for throttle channel detection.
- `src/pages/SetupWizard/steps/RcCalibrationStep.tsx` -- wizard wrapper. Mandatory step
  (not skippable). Placed after Receiver in Sensors phase.
- Integrated into `CalibrationPage.tsx` as standalone RcCalibrationCard.

### New: TransitionsStep (wizard, quadplane only)
- `src/pages/SetupWizard/steps/TransitionsStep.tsx` -- configures essential VTOL transition
  params for safe first flight. Three sections: forward transition (Q_TRANSITION_MS),
  RTL behavior (Q_RTL_MODE with radio cards), VTOL assist (Q_ASSIST_SPEED, Q_ASSIST_ALT).
  Each param has plain-English explanation. Warning when both assist triggers are disabled.
  Placed in Surfaces phase after Tilt Servos.

### Enhanced: TiltServosStep (active tilt test)
- Added mode-switch test buttons: "Hover position" (QStabilize, mode 17) and "Forward flight"
  (Manual, mode 0). Uses new `connectionManager.setFlightMode()` method.
- Shows current flight mode, tracks which positions have been tested, blocks test if armed.
- Safety warning about prop removal prominent at top.

### Infrastructure
- `connectionManager.setFlightMode(customMode)` -- MAV_CMD_DO_SET_MODE (176) via
  sendCommandWithAck. Uses MAV_MODE_FLAG_CUSTOM_MODE_ENABLED.
- `vehicleStore.flightMode` -- tracks current custom mode from heartbeat, updated on
  every heartbeat in connection.ts.
- `MAV_CMD_DO_SET_MODE = 176` added to messages.ts.

### Wizard step count: 15
Copter: 13 steps (frame, output mapping, motors, receiver, RC cal, GPS, compass,
  accel, flight modes, failsafes, initial tune, review).
Plane: 14 steps (adds control surfaces).
QuadPlane: 16 steps (adds control surfaces, tilt servos, transitions).

---

## New Pages (Previous Sessions)

### Pre-flight Readiness Dashboard

`src/pages/Preflight/PreflightPage.tsx` + `src/store/preflightStore.ts`

Big green/red "can I fly?" indicator. Four data layers:
1. **Sensor health** -- SYS_STATUS bitmask decoded into named sensors
2. **System checks** -- derived from params + telemetry
3. **PreArm failures** -- STATUSTEXT "PreArm:" messages captured, deduplicated, categorized
4. **Configuration validation** -- paramValidation.ts rule engine with auto-fix buttons

Auto-runs MAV_CMD_RUN_PREARM_CHECKS (401) on mount. Re-check button.
Sidebar position: after Backups, before CLI.

### Wiring Guide

`src/pages/Wiring/WiringPage.tsx`

FC center box with peripheral connection nodes (GPS=amber, Receiver=emerald, etc.).
2-column port assignment grid below. Generated from board.uartPorts + SERIAL_PROTOCOL.
Sidebar position: before Ports (reference before configuration).

### Parameter Validation Engine

`src/models/paramValidation.ts` -- pure logic module, no framework dependencies.
Takes `(paramName) => value` getter. Returns Finding[] sorted by severity.
Checks: RC failsafe, battery failsafe, filter sanity, GPS config, motor protocol,
compass offsets, calibration state, no RTL mode assigned.

---

## Sidebar Order

Connect, Wizard, Frame, Wiring, Ports, Configuration, Receiver, Modes, Motors,
Calibration, PID Tuning, Navigation, Failsafes, Pre-flight, OSD, Transitions,
Backups, CLI, Expert

---

## Board Database

### Two-tier system

**boardRegistry.ts** (legacy, 8 hand-coded boards): Rich metadata, connectors, uartPorts.
Used by most pages.

**boardData.ts** (generated, 414 boards from ArduPilot hwdef): Auto-generated by
tools/scrape-hwdef.py + tools/generate-board-defs.py. 22 confirmed, 392 unconfirmed.
Used by INAV import. Migration planned to replace boardRegistry.

**inavTimerData.ts** (generated, 174 boards from INAV target.c): Timer-to-pad mappings.
Used by INAV import for output assignment.

---

## Key Architecture Notes

- **State:** Zustand stores -- connectionStore, vehicleStore, parameterStore,
  telemetryStore, calibrationStore, debugStore, wizardStore, preflightStore
- **Effective values:** staged > dirty > FC (see ARCHITECTURE.md for details)
- **MAVLink:** Custom parser in src/mavlink/ (connection.ts, messages.ts, crc.ts)
- **Motor test:** connection.ts motorTest() sends DO_MOTOR_TEST (209) via sendCommandWithAck.
  Returns MAV_RESULT code. Uses frame position numbers as test instances (tricopter: 1, 2, 4).
  motorSafetyMonitor.ts monitors IMU during test and aborts if excessive tilt/rotation detected.
  New: requestParamRefresh() and waitForParam() for Q_ param lifecycle.
- **Airframe presets:** src/models/airframeTemplates.ts -- motor positions, servo mappings,
  frame identity params. buildServoAssignments() generates full output map.
- **Frame definitions:** src/models/frameDefinitions.ts -- FRAME_CLASS/TYPE to motor layout
  (positions, rotations) for copter diagrams.

---

## User Preferences

- **No em dashes.** Use " -- " or rewrite sentences. Never use the character in docs or code.
- **Debate before coding.** When user asks questions or "Thoughts?", discuss tradeoffs
  and give opinions BEFORE writing any code.
- **Deliver code as tarball** with root-relative paths for direct extraction into project.
- **Challenge assumptions.** User wants to be questioned, not accommodated.
- **Comprehensive data.** "Disk space is cheap" -- populate databases exhaustively.
- **Test hardware:** Pixhawk 2.4.8, Matek F405-Wing (INAV: MATEKF405SE),
  Matek F405-VTOL (Xiake VTOL, TE firmware). ArduPilot target: MatekF405-TE.
  Timer groups: S1-S2=TIM8, S3-S4=TIM1, S5-S8=TIM2, S9=TIM12, S10=TIM13, S11=TIM4.
  Default tricopter QP outputs: S5/S6/S8 motors, S11 yaw servo. DShot on Group 3.
  Board page: https://www.mateksys.com/?portfolio=f405-vtol
- **Two machines:** Desktop and notebook, synced via git.
