# Setup Wizard -- Architecture Document

**Version:** Draft 1
**Date:** 2026-02-26
**Status:** Design phase -- no implementation yet

---

## 1. Purpose

The Setup Wizard guides a user from "I just plugged in my flight controller" to
"my aircraft is configured and ready for a first flight." It replaces the need
to understand which pages to visit in which order, what parameters to set, and
what values are safe.

The wizard does NOT replace the individual pages. Power users skip the wizard
and use the pages directly. The wizard writes the same parameters those pages
write.

### Target user

Someone who has built their aircraft, installed ArduPilot firmware, and connected
to ArduGUI for the first time. They know what aircraft they have and what
hardware is on it, but they don't know ArduPilot parameters.

### What it covers

Everything needed for a safe first flight: frame, motors, receiver, GPS/compass,
flight modes, failsafes, and initial PID tune.

### What it does NOT cover

Video (OSD, FPV), LEDs, gimbal, telemetry radios, geofence, advanced modes,
firmware flashing, or anything that is not a first-flight blocker.


## 2. Design Principles

### 2.1 Exclusive mode

When the wizard is active, the full ArduGUI sidebar and header navigation are
hidden. The user sees only the wizard interface -- a vertical step indicator on
the left, content area in the center, and navigation buttons (Back / Next) at
the bottom. There is no way to visit other pages without explicitly abandoning
the wizard.

### 2.2 Transactional

All parameter changes accumulate in a local staging area (a `Record<string, number>`).
Nothing is written to the FC until the final "Apply & Reboot" step. If the user
abandons the wizard at any point, the FC is untouched.

### 2.3 All-or-nothing (with local progress save)

The wizard is not re-entrant to arbitrary steps. However, progress is saved
locally (localStorage or equivalent) so that if the user closes ArduGUI or
loses power, they can resume from where they left off. On re-entry, the wizard
asks: "Continue where you left off?" or "Start fresh."

### 2.4 Adaptive

Steps that don't apply are skipped automatically. A glider skips motor/ESC
setup. A copter skips control surface verification. The step list reflects the
actual vehicle.

### 2.5 Visually guided

Every step that involves physical action (motor test, control surface verify,
compass cal) includes visual illustrations showing the user exactly what to
expect and what to look for.


## 3. Step Sequence

### 3.1 Copter

| # | Step                  | What happens                                                        |
|---|-----------------------|---------------------------------------------------------------------|
| 1 | Frame                 | Select frame class + variant (Quad X, Hexa, Y6, etc.)              |
| 2 | Motors & ESC          | Select ESC protocol, test motor spin direction, fix reversed motors |
| 3 | Receiver              | Select RC protocol, verify channel mapping, check telemetry         |
| 4 | GPS & Compass         | Detect GPS port, verify communication, compass cal if needed        |
| 5 | Accelerometer         | 6-position accel calibration with 3D viewer                        |
| 6 | Flight Modes          | Assign Stabilize + AltHold + RTL to a 3-position switch            |
| 7 | Failsafes             | RC loss -> RTL, Battery low -> RTL, GCS loss action                 |
| 8 | Initial Tune          | Prop size + weight + cell count -> PIDs, filters, thrust expo       |
| 9 | Review & Apply        | Show all staged params, "Apply & Reboot" button                    |

### 3.2 Plane

| # | Step                  | What happens                                                        |
|---|-----------------------|---------------------------------------------------------------------|
| 1 | Frame                 | Select airframe (Conventional, Flying Wing, V-Tail, etc.)          |
| 2 | Motors & ESC          | ESC protocol, throttle direction verify (skipped for glider)        |
| 3 | Control Surfaces      | Visual guided test: aileron L/R, elevator up/down, rudder L/R       |
| 4 | Receiver              | Select RC protocol, verify channel mapping, check telemetry         |
| 5 | GPS & Compass         | Detect GPS port, verify communication, compass cal if needed        |
| 6 | Accelerometer         | 6-position accel calibration with 3D viewer                        |
| 7 | Flight Modes          | Assign Manual + FBWA + RTL to a 3-position switch                  |
| 8 | Failsafes             | RC loss -> RTL, Battery low -> RTL, GCS loss action                 |
| 9 | Initial Tune          | Conservative plane defaults, enable SERVO_AUTO_TRIM                 |
| 10| Review & Apply        | Show all staged params, "Apply & Reboot" button                    |

### 3.3 VTOL (QuadPlane)

The wizard supports multiple VTOL configurations but is primarily designed and
tested against a **tri tilt-rotor flying wing** -- the most common tilt-rotor
setup:

- Flying wing airframe (elevons, no tail surfaces)
- 3 VTOL motors in tricopter arrangement
- Two front motors tilt from vertical (hover) to horizontal (cruise) via
  individual servos. Yaw in hover is achieved by differential tilt push
  of the two front servos.
- Rear motor is fixed vertical (lift only in hover, off in cruise)
- No separate pusher -- the tilt motors provide forward thrust

Other VTOL configurations (QuadPlane conventional, tailsitter) are supported
by the wizard's generic step flow but may not have dedicated visual guidance
in v1.

| # | Step                  | What happens                                                        |
|---|-----------------------|---------------------------------------------------------------------|
| 1 | Frame                 | Select VTOL variant (Tri Tilt-Rotor FW, QP Conventional, etc.)     |
| 2 | Motors & ESC (VTOL)   | ESC protocol for VTOL motors, test spin direction (3 or 4 motors)  |
| 3 | Control Surfaces      | Elevon test (or aileron/elevator/rudder for conventional)           |
| 4 | Tilt Servo Verify     | Visual guided: tilt forward/back, differential tilt for yaw         |
| 5 | Receiver              | Select RC protocol, verify channel mapping                          |
| 6 | GPS & Compass         | Detect GPS port, verify communication, compass cal if needed        |
| 7 | Accelerometer         | 6-position accel calibration with 3D viewer                        |
| 8 | Flight Modes          | Assign QStabilize + QLoiter + RTL to a 3-position switch            |
| 9 | Failsafes             | RC loss -> RTL, Battery low -> QRTL, GCS loss action                |
| 10| Initial Tune          | VTOL PIDs (copter-style for hover) + plane defaults for cruise      |
| 11| Review & Apply        | Show all staged params, "Apply & Reboot" button                    |


## 4. Step Details

### 4.1 Frame Selection

Reuses the existing FrameWizard grid and icons. The wizard version is simplified:
no "Apply" button (params go to staging), no extras (flaps, gimbal -- those are
not first-flight items).

**Params staged:**
- Copter: `FRAME_CLASS`, `FRAME_TYPE`
- Plane: `SERVO1-16_FUNCTION` (from preset mappings)
- VTOL: `Q_ENABLE`, `Q_FRAME_CLASS`, `Q_FRAME_TYPE`, `SERVO1-16_FUNCTION`

### 4.2 Motors & ESC

#### 4.2.1 ESC Protocol Selection

Visual cards showing protocol options:

- **PWM** (legacy, any ESC) -- `MOT_PWM_TYPE=0`
- **OneShot125** (mid-range ESCs) -- `MOT_PWM_TYPE=1`
- **DShot150/300/600** (BLHeli_32/S, digital, recommended) -- `MOT_PWM_TYPE=4/5/6`

For copters, also set `SERVO_BLH_AUTO=1` if DShot is selected (enables
BLHeli passthrough for motor direction reversal). This applies equally to
planes and VTOLs with DShot-capable ESCs -- many modern planes use DShot.

Default recommendation: DShot300 if hardware supports it, PWM otherwise.

#### 4.2.2 Motor Spin Direction Test

For multirotors, the airframe diagram is displayed with all motors visible.
Each motor is tested in sequence -- the current motor highlights in accent color
while others remain dimmed. This gives the user spatial context of which
physical motor is being tested.

For each motor in sequence:
1. Airframe diagram highlights the current motor with accent color and its
   expected rotation direction (CW / CCW arrow overlay)
2. User clicks "Spin Motor N" -- sends MAV_CMD_DO_MOTOR_TEST
3. User confirms: "Correct direction" or "Reversed"
4. If reversed and DShot: stage `SERVOn_REVERSED=1`
5. If reversed and PWM: show instruction to swap two motor wires
6. Motor unhighlights (green checkmark if confirmed), next motor highlights

Safety: all motor tests require props removed. The wizard shows a prominent
"REMOVE ALL PROPELLERS" warning with a checkbox confirmation before enabling
the spin buttons. Test throttle is protocol-aware:
- DShot: 8% (good low-end resolution)
- PWM / OneShot: 12% (needs higher value to reliably spin)
Test duration: 3 seconds per motor.

#### 4.2.3 Plane Motor

Simpler: single throttle test. User confirms motor spins in the right direction
and throttle increases when stick is pushed forward. Glider skips this step
entirely.

### 4.3 Control Surface Verification (Planes only)

This is a key differentiator. The wizard walks through each primary control
surface with visual guidance.

**For each surface (aileron, elevator, rudder):**

1. Large illustration showing the aircraft from behind (or top view) with the
   surface highlighted
2. Instruction: "Move your ROLL stick RIGHT"
3. Animated illustration showing the expected surface deflection
4. Live servo position bar showing actual movement from RC input
5. User confirms: "Moves correctly" or "Moves wrong direction"
6. If wrong: stage `SERVOn_REVERSED=1` for that output

**Surfaces tested:**
- Aileron: stick right -> right aileron up, left aileron down
- Elevator: stick back -> elevator up
- Rudder: stick right -> rudder deflects right

**Surfaces NOT tested in wizard:**
Flaps, airbrakes, retract gear, differential spoilers. These are optional
equipment configured via the individual pages later.

**For Flying Wing:**
- Elevon test replaces separate aileron/elevator tests
- Stick right -> right elevon up, left elevon down (roll)
- Stick back -> both elevons up (pitch)

### 4.3b Tilt Servo Verification (Tilt-rotor VTOL only)

This step verifies the tilt mechanism works correctly. Incorrect tilt direction
or range will cause a crash during transition.

**Visual approach:** Side-view illustration of the flying wing showing the two
front motor nacelles. The illustration animates to show expected tilt position
as the user commands it.

**Test sequence:**

1. **Full vertical (hover position)**
   - Instruction: "Command tilt to hover position"
   - Illustration: side view showing both nacelles pointing straight up
   - Live servo position bars showing actual tilt servo PWM
   - User confirms: "Motors are pointing up"

2. **Full forward (cruise position)**
   - Instruction: "Command tilt to cruise position"
   - Illustration: nacelles rotate to horizontal, aligned with wing
   - User confirms: "Motors are pointing forward"
   - If reversed: stage `SERVOn_REVERSED=1` for the tilt servo(s)

3. **Differential tilt (yaw verification)**
   - Instruction: "Command yaw left"
   - Illustration: left nacelle tilts slightly more forward than right,
     showing the differential push that creates yaw torque
   - User confirms: "Left motor tilted more forward" or "Wrong direction"
   - If wrong: indicates motor assignment or servo direction issue

**Params verified/staged:**
- `SERVOn_FUNCTION=41` (Motor Tilt) for the two tilt servos
- `SERVOn_MIN`, `SERVOn_MAX`, `SERVOn_TRIM` for tilt range
- `SERVOn_REVERSED` if direction is wrong
- `Q_TILT_MASK` identifying which motors tilt
- `Q_TILT_TYPE` (continuous tilt for this configuration)

**For non-tilt VTOLs (QuadPlane conventional):** This step is skipped entirely.

### 4.4 Receiver Setup

#### 4.4.1 Protocol Selection

Cards for common protocols:
- **SBUS** (most common, Futaba/FrSky) -- `SERIAL7_PROTOCOL=23`, `RC_PROTOCOLS=1`
- **CRSF / ELRS** (Crossfire/ExpressLRS, growing fast) -- `SERIAL7_PROTOCOL=23`, `RC_PROTOCOLS=512`
- **PPM** (legacy) -- `RC_PROTOCOLS=1`
- **DSM/DSMX** (Spektrum) -- `SERIAL7_PROTOCOL=23`, `RC_PROTOCOLS=2`

Note: the serial port for RC depends on the board. The wizard reads the board
registry to determine which SERIAL port is labeled "RCIN" or "RX" and sets the
correct SERIALn_PROTOCOL.

#### 4.4.2 Channel Mapping Verification

Live RC channel bars (reuse existing Receiver page component). The wizard asks
the user to:
1. Move the RIGHT stick left/right -- verify channel 1 (Roll) responds
2. Move the RIGHT stick up/down -- verify channel 2 (Pitch) responds
3. Move the LEFT stick up/down -- verify channel 3 (Throttle) responds
4. Move the LEFT stick left/right -- verify channel 4 (Yaw) responds
5. Toggle the 3-position switch -- verify channel 5 (or assigned) responds

If channels are swapped, the wizard offers to remap via `RCMAP_ROLL`,
`RCMAP_PITCH`, `RCMAP_THROTTLE`, `RCMAP_YAW`.

#### 4.4.3 Telemetry Verification

For protocols that support bidirectional telemetry (CRSF/ELRS), the wizard
checks if telemetry data is flowing back to the transmitter:
- Read RSSI and link quality values from the telemetry store
- If non-zero: green checkmark, "Receiver telemetry active"
- If zero: warning, "No telemetry detected -- check wiring or TX settings"

For protocols without bidirectional telemetry (SBUS, PPM), this sub-step is
skipped. For FrSky SBUS with separate telemetry (S.Port), the wizard notes
that a separate telemetry wire may be needed but does not attempt to configure
it (not a first-flight blocker).

### 4.5 GPS & Compass

GPS and compass are often on the same physical module but are independent
sensors with independent configuration. The wizard treats them separately.

#### 4.5.1 GPS Port Detection

The wizard scans all `SERIALn_PROTOCOL` values looking for one set to GPS
(protocol 5). Three outcomes:

- **Found:** Show which port is configured, e.g. "GPS detected on SERIAL3
  (GPS port)." Proceed to communication check.
- **Not found:** Show a port picker using the board registry's UART labels.
  "Which port is your GPS connected to?" with board-aware labels like
  "TELEM1", "GPS", "UART4". User picks, wizard stages
  `SERIALn_PROTOCOL=5` and `SERIALn_BAUD=57` (or 115 depending on GPS).
- **Multiple GPS:** If two ports are set to protocol 5, show both and let
  the user confirm. Multi-GPS setups (blending) are not configured by the
  wizard but are not blocked either.

#### 4.5.2 GPS Communication Check

Once the port is identified, verify the GPS module is communicating:
- Check if `GPS_STATUS` telemetry reports any value other than NO_GPS
- Show satellite count (even if 0 -- that's fine indoors)
- Show GPS module type if reported

The wizard does NOT require a 3D fix. Indoor testing is the norm and a GPS
that is communicating but has 0 satellites is perfectly valid for setup.

If no GPS communication is detected after a few seconds, warn the user:
"GPS not responding. Check wiring and ensure the correct port is selected."
Allow retry or skip with a warning that navigation modes won't work.

#### 4.5.3 Compass Status

Check `COMPASS_USE`, `COMPASS_OFS_X/Y/Z`. If offsets are all zero or
`COMPASS_USE=0`, compass is not calibrated.

- If already calibrated: show green checkmark, "Compass calibrated" with
  offset values. Offer optional "Recalibrate" button.
- If not calibrated: show the 3D calibration viewer (reuse existing
  CalibrationPage component). User performs the rotation dance inline
  within the wizard.
- If user cannot calibrate now (e.g. aircraft too large to rotate): allow
  skipping with a warning that RTL and Loiter will use GPS-only heading
  which is less accurate.

### 4.5b Accelerometer Calibration

6-position accelerometer calibration using the existing 3D viewer with the
vehicle model. This is mandatory for a safe first flight -- bad accel
calibration means unstable hover or incorrect attitude estimation.

The wizard reuses the existing CalibrationPage's accel calibration flow:
1. Place vehicle level -- click "Calibrate"
2. Place vehicle nose down -- click when ready
3. Place vehicle nose up -- click when ready
4. Place vehicle on left side -- click when ready
5. Place vehicle on right side -- click when ready
6. Place vehicle upside down -- click when ready

The 3D model animates to show the expected orientation for each position.
The 6-panel position grid shows completion status at a glance.

**Level trim:** After the 6-position cal, offer a one-click level trim
calibration (with the vehicle on a flat surface). This sets the reference
for "level" and is critical for stable hover.

If already calibrated (offsets are non-zero and reasonable): show green
checkmark, offer optional "Recalibrate" button. Do not force re-calibration
on every wizard run.

### 4.6 Flight Modes

#### 4.6.1 Switch Assignment

The wizard assumes a 3-position switch on a channel (default: channel 5). Show
the three positions with recommended modes:

**Copter:**
| Position | Mode       | Purpose                        |
|----------|------------|--------------------------------|
| Low      | Stabilize  | Manual with self-level         |
| Mid      | AltHold    | Altitude hold, manual position |
| High     | RTL        | Return to launch               |

**Plane:**
| Position | Mode       | Purpose                        |
|----------|------------|--------------------------------|
| Low      | Manual     | Full manual control            |
| Mid      | FBWA       | Fly-by-wire with self-level    |
| High     | RTL        | Return to launch               |

**VTOL:**
| Position | Mode       | Purpose                        |
|----------|------------|--------------------------------|
| Low      | QStabilize | VTOL manual with self-level    |
| Mid      | QLoiter    | VTOL position hold             |
| High     | RTL        | Return to launch (auto-transitions) |

**Params staged:**
- `FLTMODE_CH` (which RC channel)
- `FLTMODE1` through `FLTMODE6` (PWM ranges to mode mapping)

#### 4.6.2 Verification

Show live mode indicator as user flips the switch. The wizard reads the current
flight mode from telemetry and highlights which position is active.

### 4.7 Failsafes

Simplified failsafe configuration with opinionated safe defaults:

#### 4.7.1 RC Loss (Radio Failsafe)
- **Action:** RTL (copter: `FS_THR_ENABLE=3` RTL, plane: `THR_FAILSAFE=1`, `FS_SHORT_ACTN=0`, `FS_LONG_ACTN=1`)
- **Throttle value:** Below `FS_THR_VALUE` (typically 975). Wizard reads the
  user's current throttle-low value and sets threshold 50 PWM below it.
- Visual: "If your radio disconnects, the aircraft will automatically return home."

#### 4.7.2 Battery Failsafe
- **Action:** RTL on low, Land on critical
- **Copter:** `BATT_FS_LOW_ACT=2` (RTL), `BATT_FS_CRT_ACT=1` (Land)
- **Plane:** `BATT_FS_LOW_ACT=2` (RTL), `BATT_FS_CRT_ACT=1` (Land)
- **Voltage thresholds:** Ask cell count, calculate:
  - Low: 3.5V per cell (e.g. 14.0V for 4S)
  - Critical: 3.3V per cell (e.g. 13.2V for 4S)
- `BATT_LOW_VOLT`, `BATT_CRT_VOLT`

#### 4.7.3 GCS Failsafe (if applicable)
- If telemetry link is configured: `FS_GCS_ENABLE=1` (RTL on GCS loss)
- If no GCS: skip this sub-step

### 4.8 Initial Tune

The "killer feature." Different approaches for copter vs. plane.

#### 4.8.1 Copter Initial Tune

**User inputs:**
- Propeller diameter (inches): dropdown or text input (5" to 15")
- All-up weight (grams): text input with common range guidance
- Battery cell count: 3S / 4S / 5S / 6S

**Parameters generated:**

The algorithm uses the same approach as Mission Planner's Initial Tune and the
INAV Toolkit's `--setup` mode. The core insight is that larger, heavier aircraft
need lower PID gains and lower filter frequencies.

**Prop-size-based lookup table (copter):**

| Prop (in) | ATC_RAT_RLL_P | ATC_RAT_RLL_D | ATC_RAT_PIT_P | ATC_RAT_PIT_D | INS_GYRO_FILTER | MOT_THST_EXPO |
|-----------|---------------|---------------|---------------|---------------|-----------------|---------------|
| 5         | 0.135         | 0.0036        | 0.135         | 0.0036        | 20              | 0.55          |
| 7         | 0.100         | 0.0030        | 0.105         | 0.0030        | 15              | 0.60          |
| 10        | 0.075         | 0.0020        | 0.080         | 0.0020        | 10              | 0.65          |
| 12        | 0.060         | 0.0015        | 0.065         | 0.0015        | 10              | 0.70          |
| 15        | 0.050         | 0.0012        | 0.055         | 0.0012        | 10              | 0.73          |

- I values set to P (1:1 ratio as recommended by ArduPilot tuning guide)
- Higher voltage (6S) scales P and D down by ~15% vs 4S values
- `INS_ACCEL_FILTER` follows gyro filter at roughly 2x the value
- Yaw P/I/D set to roughly 60-70% of roll/pitch values

**Additional params staged:**
- `ATC_INPUT_TC`: 0.15 (smooths pilot input)
- `ATC_ANG_RLL_P` and `ATC_ANG_PIT_P`: 4.5 (default, conservative)
- `MOT_SPIN_ARM`: 0.10
- `MOT_SPIN_MIN`: 0.15

**Important note:** These values are intentionally conservative starting points.
The wizard should display a clear message: "These are safe initial values. After
your first successful flight, use AutoTune for optimized performance."

#### 4.8.2 Plane Initial Tune

Plane tuning is less prop-dependent and more about flight characteristics. The
wizard sets conservative defaults:

- `RLL2SRV_TCONST`: 0.5 (time constant for roll, conservative)
- `PTCH2SRV_TCONST`: 0.5 (time constant for pitch, conservative)
- `SERVO_AUTO_TRIM`: 1 (enable auto-trim -- critical for planes)
- `NAVL1_PERIOD`: 17 (conservative L1 navigation)
- `TRIM_THROTTLE`: 45 (will need adjustment after first flight)
- `ARSPD_FBW_MIN`: sensible default based on aircraft type
- `ARSPD_FBW_MAX`: sensible default based on aircraft type

The wizard explicitly tells the user: "After your first flight in FBWA mode,
use AUTOTUNE mode to automatically optimize roll and pitch gains."

#### 4.8.3 VTOL Initial Tune

Combination: copter PID table for Q_ params (Q_A_RAT_RLL_P, etc.) using the
same prop-size lookup, plus plane defaults for fixed-wing params. Additional
VTOL-specific params:

- `Q_ASSIST_SPEED`: minimum airspeed for VTOL motor assist in fixed-wing mode
- `Q_TRANSITION_MS`: transition time (default 5000ms, conservative)
- `Q_TILT_MAX`: maximum tilt angle in VTOL modes
- `Q_TILT_RATE_DN`: tilt rate for transition back to hover (deg/s, conservative)
- `Q_TILT_RATE_UP`: tilt rate for transition to cruise (deg/s)

For tri tilt-rotor: the rear fixed motor only operates in hover. The wizard
stages `Q_FRAME_CLASS=7` (Tri) and configures the tilt mask for motors 1-2.


### 4.9 Review & Apply

The final step shows:

1. **Summary cards** -- one per step, showing what was configured:
   - Frame: "Quad X" with icon
   - Motors: "DShot300, 4 motors verified"
   - Receiver: "ELRS on SERIAL7, telemetry active"
   - GPS: "Communicating on SERIAL3, module detected"
   - Compass: "Calibrated, offsets [x, y, z]"
   - Accelerometer: "Calibrated, level trim set"
   - Modes: "Stabilize / AltHold / RTL on Ch5"
   - Failsafes: "RC loss -> RTL, Low battery 14.0V -> RTL"
   - Tune: "10-inch props, 2500g, 4S -> PIDs applied"

2. **Full parameter list** -- expandable, showing every param that will be
   written, with old value -> new value

3. **Apply & Reboot button** -- writes all params transactionally, then reboots.
   Uses the existing reboot overlay with progress indication.

4. **Save for later** -- saves the staged params to a local file (JSON) that
   can be loaded later. For users who want to review before committing.


## 5. UI Architecture

### 5.1 Layout

```
+------------------------------------------------------------------+
| ArduGUI  [header -- minimal, no nav buttons, just connection]    |
+--------+---------------------------------------------------------+
|        |                                                         |
| Step 1 |                                                         |
| Step 2 |              [Main content area]                        |
| Step 3 |                                                         |
| Step 4 |    Current step's UI renders here.                      |
| Step 5 |    Full width, no sidebar nav distractions.             |
| Step 6 |                                                         |
| Step 7 |                                                         |
| Step 8 |                                                         |
|        |                                                         |
+--------+-----------+-------------------+-------------------------+
|                    |  [< Back]         |  [Next >]               |
+------------------------------------------------------------------+
```

The step list on the left shows:
- Completed steps: green checkmark
- Current step: highlighted, accent color
- Future steps: dimmed
- Skipped steps: hidden entirely (not grayed, just absent)

### 5.2 Component Structure

```
src/pages/SetupWizard/
  SetupWizard.tsx          -- Main wizard container, step orchestration
  WizardLayout.tsx         -- Exclusive layout (replaces normal Layout)
  WizardStepper.tsx        -- Left step indicator
  WizardNav.tsx            -- Bottom Back/Next buttons
  wizardStore.ts           -- Zustand store for wizard state + staged params
  steps/
    FrameStep.tsx           -- Simplified frame selection (reuses AirframeIcons)
    MotorEscStep.tsx        -- ESC protocol + motor direction test
    ControlSurfaceStep.tsx  -- Plane-only surface verification with animation
    TiltServoStep.tsx       -- Tilt-rotor VTOL tilt verification with animation
    ReceiverStep.tsx        -- Protocol + channel mapping
    GpsCompassStep.tsx      -- GPS port detect + communication check + compass cal
    AccelerometerStep.tsx   -- 6-position accel cal + level trim (reuses 3D viewer)
    FlightModesStep.tsx     -- 3-mode switch assignment
    FailsafeStep.tsx        -- RC loss, battery, GCS failsafe
    InitialTuneStep.tsx     -- Prop/weight/cells -> PID generator
    ReviewStep.tsx          -- Summary + param list + apply
  data/
    copterTuneTable.ts      -- Prop-size PID lookup tables
    planeTuneDefaults.ts    -- Conservative plane starting params
    vtolTuneDefaults.ts     -- VTOL-specific params
    escProtocols.ts         -- ESC protocol definitions and param mappings
    failsafeDefaults.ts     -- Default failsafe param sets
```

### 5.3 State Management

```typescript
interface WizardState {
  // Lifecycle
  active: boolean;                    // Is wizard mode on?
  currentStep: number;                // 0-indexed
  steps: WizardStep[];                // Filtered list for this vehicle

  // Staged parameters -- accumulated across all steps
  stagedParams: Record<string, number>;

  // Per-step completion status
  completedSteps: Set<number>;

  // Step-specific state (user selections persisted for back navigation)
  frameSelection: AirframePreset | null;
  escProtocol: string | null;
  motorTestResults: Record<number, 'correct' | 'reversed' | 'untested'>;
  surfaceTestResults: Record<string, 'correct' | 'reversed' | 'untested'>;
  tiltTestResults: Record<string, 'correct' | 'reversed' | 'untested'>;
  rcProtocol: string | null;
  channelMap: Record<string, number>;
  compassCalibrated: boolean;
  accelCalibrated: boolean;
  gpsPort: string | null;                // e.g. 'SERIAL3'
  rcTelemetryActive: boolean;
  modeAssignments: { low: number; mid: number; high: number };
  failsafeConfig: { rcLoss: string; battLow: number; battCrit: number };
  tuneInputs: { propSize: number; weight: number; cells: number } | null;

  // Actions
  stageParam: (name: string, value: number) => void;
  stageParams: (params: Record<string, number>) => void;
  nextStep: () => void;
  prevStep: () => void;
  markStepComplete: (step: number) => void;
  reset: () => void;
  saveProgress: () => void;      // Persist to localStorage
  loadProgress: () => boolean;   // Restore from localStorage, returns success
}
```

### 5.4 Entry and Exit

**Entry:**
- A "Setup Wizard" button on the Connect/Information page (visible after
  connection + param load)
- On first-ever connection (no previous params modified), auto-prompt:
  "Would you like to run the Setup Wizard?"

**Exit:**
- "Abandon Wizard" button (always visible, top-right). Confirms: "All wizard
  progress will be lost. The flight controller has not been modified. Exit?"
- Successful "Apply & Reboot" at the end -- wizard closes, ArduGUI reconnects
  normally

**When wizard is active:**
- Layout renders WizardLayout instead of normal Layout
- Sidebar is hidden
- Header is minimal (connection status only)
- Footer shows staged param count but no Save button (only the wizard's own
  Apply step can write)


## 6. Data Requirements

### 6.1 PID Lookup Tables

Need to build/validate:
- Copter prop-size-to-PID table (5" through 20"+, 4S/6S/8S/12S voltage scaling)
- Sources: ArduPilot Initial Tune code (Mission Planner), INAV Toolkit frame
  profiles, ArduPilot wiki tuning guide, community forum data
- These should be conservative -- they are starting points, not optimal tunes

### 6.2 ESC Protocol Compatibility

Need a mapping of ESC protocol to required params, plus any board-specific
constraints (e.g. some boards don't support DShot on all outputs).

### 6.3 Failsafe Param Matrix

Different params for copter vs. plane vs. VTOL failsafe configuration. The
existing failsafeGroups.ts model has most of this.

### 6.4 RC Protocol to Serial Config

Mapping from user-friendly protocol name to the correct SERIALn_PROTOCOL value,
accounting for which serial port on the detected board is the RC input.


## 7. Risk and Open Questions

### 7.1 Compass and accelerometer calibration UX

Both calibrations are physically demanding -- compass requires rotating the
aircraft in all orientations (30-60 seconds), accel requires placing it in
6 positions. Inside an all-or-nothing wizard, this could be frustrating if it
fails. Mitigations: allow retry, allow skip-with-warning for compass (accel
is harder to skip since it's critical for stability), check if already
calibrated and show green checkmark to avoid forcing re-cal.

### 7.2 Motor test safety

Spinning motors inside a wizard is inherently dangerous. Mitigations: props-off
checkbox, low throttle (5%), short duration (2 seconds), prominent warnings,
two-step confirm (same pattern as existing motor test page).

### 7.3 PID accuracy

The lookup table approach gives approximate starting values. For unusual builds
(heavy payload, unusual prop/motor combo), the values may be too aggressive or
too conservative. Mitigation: always label as "initial values," always recommend
AutoTune after first flight.

### 7.4 Board-specific serial port mapping

Different boards have different serial ports for RC input and GPS. The wizard
needs the board registry to resolve "which SERIALn is the RC port?" and "which
SERIALn is GPS?" The board registry already has UART port data but may need
enrichment for RC and GPS-specific port identification. For GPS, the wizard
also needs to handle the case where no port is configured yet (fresh firmware)
by presenting a board-aware port picker.

### 7.5 VTOL complexity

VTOLs have the most complex setup: tilt servos, multiple motor roles, control
surfaces, and transition parameters. The wizard v1 is designed and tested
primarily against the **tri tilt-rotor flying wing** configuration (two tilting
front motors + one fixed rear motor). QuadPlane conventional is supported
through the generic step flow but without dedicated tilt verification visuals.
Exotic setups (tailsitter, bi-copter tilt) are deferred to manual configuration.

### 7.6 Local progress persistence

Electron apps can use localStorage, but the wizard state includes references
to presets and test results that need to be serializable. Need to ensure the
state shape is JSON-safe.


## 8. Implementation Phasing

### Phase 1 -- Core flow (copter only)
Steps 1-3 (Frame, Motors/ESC, Receiver) plus Review & Apply.
This alone is useful: a user can configure their copter frame, verify motors
spin correctly, and set up their receiver in one guided flow.

### Phase 2 -- Navigation and safety
Add steps 4-7 (GPS/Compass, Accelerometer, Flight Modes, Failsafes).
Now the aircraft is safe to fly with calibrated sensors, RTL, and failsafe
protection.

### Phase 3 -- Initial tune
Add step 7 (PID/filter/expo generation from prop size).
This is the differentiator. Requires building and validating the lookup tables.

### Phase 4 -- Plane and VTOL
Extend all steps for plane (add control surface verification) and VTOL.

### Phase 5 -- Polish
Local progress save/restore, first-connection auto-prompt, "what changed"
summary on reconnect after reboot.


## 9. Reuse from Existing Code

| Existing component            | Wizard reuse                                       |
|-------------------------------|----------------------------------------------------|
| AirframeIcons + presets       | Frame step (grid of airframe cards)                |
| Motor test (MotorsPage)       | Motor spin direction test                          |
| Receiver bars (ReceiverPage)  | Channel mapping verification                       |
| Calibration3DViewer           | Compass calibration + accel calibration inline     |
| SaveDialog param list         | Review step param display                          |
| parameterStore.stageParams    | All steps stage params into wizard store            |
| connectionManager.reboot      | Apply & Reboot final step                          |
| boardRegistry                 | Resolve serial ports for RC/GPS, port picker UI    |
| useDetectedPreset             | Pre-populate frame step if FC already configured   |

## 10. Sidebar Reorder

The normal-mode sidebar should follow the same logical sequence as the wizard,
so users who graduate from the wizard to the individual pages find things where
they expect them.

**Current order:** Connect, Frame, Ports, Configuration, Receiver, Modes,
Motors, Calibration, PID Tuning, Navigation, Failsafes, OSD, ...

**Proposed order:**

| #  | Page          | Rationale                                      |
|----|---------------|------------------------------------------------|
| 1  | Connect       | Always first                                   |
| 2  | Frame         | What aircraft is this?                         |
| 3  | Motors        | Configure and verify motors/ESC                |
| 4  | Ports         | Serial port wiring (fix issues found above)    |
| 5  | Receiver      | RC input and channel mapping                   |
| 6  | Calibration   | Compass, accel, level trim                     |
| 7  | Modes         | Flight mode switch assignments                 |
| 8  | Failsafes     | Safety: RC loss, battery, GCS                  |
| 9  | PID Tuning    | Rate and stabilize gains                       |
| 10 | Navigation    | RTH altitude, speed, fence                     |
| 11 | Configuration | General settings (not first-flight critical)   |
| 12 | OSD           | On-screen display (optional)                   |
| 13 | Transitions   | VTOL-only transition params                    |
| 14 | Backups       | Save/restore configurations                    |
| 15 | CLI           | Direct command line                            |
| 16 | Expert        | Hidden unless expert mode enabled              |

This groups items by workflow phase: "build it" (Frame, Motors, Ports),
"connect it" (Receiver), "calibrate it" (Calibration), "configure behavior"
(Modes, Failsafes, PID, Navigation), "customize" (Configuration, OSD),
"maintain" (Backups, CLI, Expert).


## 11. VTOL Step Grouping

For VTOL aircraft, the wizard has the most steps (11). To manage cognitive
load, the wizard uses a **two-cycle flow**:

**Cycle 1 -- Multirotor setup:**
- Frame selection (VTOL variant)
- VTOL motor ESC protocol + spin direction test (3 motors)

**Cycle 2 -- Airplane setup:**
- Control surfaces (elevon verification)
- Tilt servo verification (hover/cruise/yaw)

**Common (once):**
- Receiver (protocol, channel mapping, telemetry)
- GPS & Compass (port detection, communication check, compass cal)
- Accelerometer (6-position cal + level trim)

**Safety & Tune:**
- Flight modes (QStabilize / QLoiter / RTL)
- Failsafes (RC loss, battery, GCS)
- Initial tune (hover PIDs + cruise defaults + tilt params)
- Review & Apply

The step indicator on the left shows phase headers ("Hover Setup",
"Cruise Setup", "Sensors", "Safety", "Tune") that collapse as each phase
completes. This communicates context about why the user is configuring
motors twice (once for hover, once for cruise) without requiring them
to understand the underlying parameter structure.

This two-cycle grouping also applies (with fewer phases) to copter
("Motors", "Sensors", "Safety", "Tune") and plane ("Frame & Motors",
"Surfaces", "Sensors", "Safety", "Tune") for visual consistency.

---

*This document will be updated as design decisions are refined.*
