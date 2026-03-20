import type { StepHelpEntry } from './index';

/**
 * One entry per wizard step. Keyed by step ID from wizardStore.
 *
 * summary: one line, visible in collapsed state
 * detail: detailed practical guidance, visible when expanded
 */
export const WIZARD_STEP_HELP: Record<string, StepHelpEntry> = {

  frame: {
    summary: 'Tell the FC what kind of aircraft you have.',
    detail: `The frame selection is the most fundamental setting on your flight controller. It determines how many motors the FC expects, how they are arranged, what control surfaces are used, and which mixing algorithms run internally. Getting this wrong means the FC will try to control an aircraft that doesn't match the physical hardware -- motors won't respond correctly and the aircraft will be unflyable.

For copters, the most common configuration is Quad X -- four motors arranged in an X pattern. If you have a hexacopter, octocopter, or tricopter, select the matching frame. The "X" vs "+" vs "H" variants refer to the motor rotation relative to the front of the aircraft. X is by far the most common.

For planes, "Conventional" means a standard airplane with ailerons, elevator, and rudder. "Flying Wing" has no tail -- elevons on the trailing edge of the wing handle both pitch and roll. "V-Tail" mixes rudder and elevator on two angled tail surfaces.

For VTOL (quadplane), you are combining a plane frame with vertical-lift motors. This is the most complex configuration. Select the quadplane variant that matches your motor arrangement -- most tiltrotors use "Tri Tilt" or "Quad Tilt."

If you are migrating from INAV, use the "Migrating from INAV?" link at the bottom. Paste your "dump all" output and ArduGUI will auto-detect your frame type and pre-fill most settings. This saves significant time and reduces configuration errors.`,
    wikiUrl: 'https://ardupilot.org/copter/docs/frame-type-configuration.html',
  },

  output_mapping: {
    summary: 'Assign motors and servos to physical output pads on the FC.',
    detail: `Every flight controller has numbered output pads (S1, S2, S3, etc.) where you solder motor and servo wires. Each pad needs to be told what it controls: Motor 1, Motor 2, Aileron, Elevator, Throttle, or nothing.

ArduGUI pre-fills the mapping based on your frame selection, using the recommended output assignment for your specific board. In most cases, the defaults are correct and you just need to verify that your physical wiring matches what's shown on screen.

If your wiring differs from the defaults (for example, you soldered Motor 1 to S3 instead of S1), you can change the assignment here. The diagram shows your board's actual pad labels so you can match them to your soldering.

Important constraints to be aware of: on most boards, outputs are grouped by hardware timers. All outputs sharing a timer must use the same signal type (all DShot or all PWM, not mixed). For example, on many Matek boards, S1-S4 share one timer group and S5-S8 share another. If S1 is set to DShot for a motor, S2/S3/S4 must also be DShot (or disabled). ArduGUI shows a warning if you create a conflict.

For most standard builds, the defaults work. Accept them and move on unless you know your wiring differs.`,
    wikiUrl: 'https://ardupilot.org/copter/docs/common-rcoutput-mapping.html',
  },

  motors_esc: {
    summary: 'Choose your ESC protocol and verify every motor spins correctly.',
    detail: `This step has two parts: selecting how the FC communicates with your ESCs, and then physically testing each motor.

ESC Protocol: This determines the signal format sent from the FC to your ESCs. The options from oldest to newest:
- PWM: The original analog protocol. Works with any ESC but is slow and requires ESC calibration. Use only if your ESCs don't support anything newer.
- OneShot125: Faster analog protocol. No calibration needed. A good middle ground for older ESCs.
- DShot300/600: Digital protocol. No calibration ever needed, supports motor direction reversal via software, ESC telemetry (RPM, temperature), and is immune to electrical noise. DShot600 is recommended for any modern ESC (BLHeli_32, BLHeli_S, AM32).

If you're unsure, try DShot600 first. If motors don't respond, step down to DShot300, then OneShot, then PWM.

Motor Test: After setting the protocol, test each motor individually. REMOVE ALL PROPELLERS FIRST. This is not optional -- a motor spinning the wrong direction with a propeller attached can cause serious injury or damage.

The test spins one motor at a time at low throttle. For each motor, verify:
1. The correct motor spins (Motor 1 should be the one labeled M1 in the diagram)
2. It spins in the correct direction (blue = counter-clockwise, red = clockwise in the diagram)
3. It stops cleanly after the test duration

If a motor spins the wrong direction: with DShot ESCs, you can reverse it in the ESC page. With PWM ESCs, swap any two of the three motor wires.

If the wrong motor spins (e.g. you click Motor 1 but Motor 3 responds), your output mapping doesn't match your wiring. Go back to Output Mapping and fix it, or re-solder.`,
    wikiUrl: 'https://ardupilot.org/copter/docs/connect-escs-and-motors.html',
  },

  control_surfaces: {
    summary: 'Verify ailerons, elevator, and rudder move the correct way.',
    detail: `This step uses a real-time 3D visualization to show your control surfaces responding to transmitter input. Move your sticks and watch the surfaces move on screen and on your actual aircraft simultaneously.

What to check for each surface:

Ailerons (roll): Push the right stick to the right. The right aileron should go UP and the left aileron should go DOWN. This makes the aircraft roll right. If it's backwards, the aircraft will roll the opposite direction from your input -- instant loss of control.

Elevator (pitch): Pull the right stick back (toward you). The elevator should deflect UP (trailing edge rises). This pitches the nose up. If reversed, pulling back will push the nose down.

Rudder (yaw): Push the right stick to the right. The rudder should deflect to the RIGHT. If reversed, the aircraft will yaw opposite to your input.

If any surface moves the wrong way, click the "Reverse" button for that servo. Always reverse at the FC level, never on your transmitter. Reversing on the transmitter creates problems because the FC also needs to move surfaces for stabilization and auto-flight modes -- if you reverse at the transmitter, the FC's corrections will be backwards.

For flying wings (elevons): both surfaces handle pitch and roll together. Push right stick right -- the right elevon goes up, left goes down. Pull stick back -- both elevons go up. The mixing is done by the FC.

Take your time here. Incorrect surface direction is the single most common cause of crashes on first flight for fixed-wing aircraft.`,
    wikiUrl: 'https://ardupilot.org/plane/docs/guide-four-channel-plane.html',
  },

  tilt_servos: {
    summary: 'Verify tilt motors move to correct hover and forward flight positions.',
    detail: `Tiltrotor VTOL aircraft have motors mounted on servos that physically rotate between two positions: vertical (pointing up, for hovering like a copter) and horizontal (pointing forward, for flying like a plane). Getting the tilt angle wrong in either position can be catastrophic.

This step switches the FC between flight modes to actuate the tilt servos so you can verify their positions:

Hover position: Motors should point straight up (or very close to it). In this position, the aircraft hovers like a multirotor. If the motors are tilted even 10-15 degrees forward in hover mode, the aircraft will drift forward uncontrollably when you try to hover.

Forward flight position: Motors should point straight forward (horizontal). In this position, the aircraft flies like a conventional airplane. If the motors still point partially upward during forward flight, the aircraft won't reach full speed and will be inefficient.

What to do if positions are wrong:
- If the range is correct but endpoints are swapped (hover position is forward, forward position is up), reverse the tilt servo.
- If the range is too small (motors don't tilt far enough), adjust SERVO_MIN and SERVO_MAX for the tilt output.
- If the range is offset (e.g. motor tilts from 20 degrees to 110 degrees instead of 0 to 90), adjust SERVO_TRIM.

This is a safety-critical step. An aircraft that cannot hold position in hover or cannot transition to forward flight will crash. Verify both positions carefully before attempting any flight.`,
    wikiUrl: 'https://ardupilot.org/plane/docs/guide-tilt-rotor.html',
  },

  transitions: {
    summary: 'Configure how the aircraft switches between hover and forward flight.',
    detail: `Transition is the most complex and dangerous phase of VTOL flight. The aircraft must accelerate from zero groundspeed (hovering) to flying speed (where the wing generates enough lift to support the aircraft), then shut down or tilt the hover motors. Getting transition parameters wrong can cause a stall and crash.

Forward transition timeout: How long the FC tries to accelerate before it gives up. Default 10 seconds is conservative. If the aircraft doesn't reach flying speed in this time, the transition failure action triggers. Too short and the aircraft may abort a transition that would have succeeded with a few more seconds. Too long and a genuinely stuck transition wastes altitude.

VTOL Assist: This is your safety net during forward flight. If the aircraft slows down (wind gust, steep climb, sharp turn) and the wing can't maintain lift, the hover motors automatically kick in to prevent a stall. Configure the speed, altitude, and angle thresholds:
- Speed assist: hover motors engage when airspeed drops below this value. Set to slightly above stall speed.
- Altitude assist: hover motors engage when altitude drops unexpectedly.
- Angle assist: hover motors engage when the aircraft tilts beyond a safe angle.

Enabling at least speed-based assist is strongly recommended. Without it, a gust of headwind that slows the aircraft below stall speed will cause it to drop out of the sky with no automatic recovery.

RTL behavior: When Return-to-Launch is triggered, should the aircraft fly home as a plane and then transition to hover for landing (VTOL RTL), or try to land like a plane (Plane RTL)? VTOL RTL is recommended for most setups because it doesn't require a runway.

Transition failure action: What happens if the forward transition times out. "Continue in VTOL" is the safest -- the aircraft stays in hover mode and flies home as a multirotor. "Land" descends immediately.`,
    wikiUrl: 'https://ardupilot.org/plane/docs/quadplane-transitions.html',
  },

  receiver: {
    summary: 'Set up your radio receiver and calibrate stick endpoints.',
    detail: `This step connects your radio transmitter to the flight controller. There are two parts: configuring the receiver protocol and port, then calibrating the stick endpoints.

Receiver protocol: Your transmitter talks to a small receiver module on the aircraft. The protocol must match what your receiver outputs:
- CRSF: Used by ExpressLRS and TBS Crossfire/Tracer. The most popular modern choice. Fast, reliable, bidirectional (sends telemetry back to your radio). Connects to a UART (TX/RX pair).
- SBUS: Used by FrSky, Futaba, and many others. Inverted serial, single wire. Connects to the dedicated SBUS pad on the FC (no serial port config needed).
- PPM: Legacy protocol, limited to 8 channels. Single wire, connects to the PPM pad. Only use if you have old hardware.
- DSM/Spektrum: Connects to the dedicated SBUS/DSM pad. Auto-detected.

If your receiver uses CRSF or FPort, you need to select which UART serial port it's connected to. This must match your physical wiring -- if you soldered the receiver to the TX6/RX6 pads, select SERIAL6.

Channel order (RCMAP): Different radio manufacturers use different channel orders. AETR (Aileron-Elevator-Throttle-Rudder) is used by ELRS, FrSky, and Futaba. TAER (Throttle-Aileron-Elevator-Rudder) is used by Spektrum. If this is wrong, your stick inputs will be mapped to the wrong axes.

Once channels are flowing (you'll see the bars move when you move your sticks), calibrate the endpoints. This teaches the FC the exact min/max/center values of YOUR transmitter. The calibration captures the range as you move sticks to their extremes, then records center positions when you center everything. Without calibration, control response may be asymmetric or not reach full deflection.

A note on RSSI: the signal strength percentage shown is from the receiver's signal quality report. Below 50% is marginal. If RSSI is consistently low, check your antenna placement and orientation.`,
    wikiUrl: 'https://ardupilot.org/copter/docs/common-rc-systems.html',
  },

  gps: {
    summary: 'Confirm GPS is working and configure satellite constellations.',
    detail: `GPS provides the position information that makes autonomous flight modes possible. Without GPS, you can fly in Stabilize and AltHold (manual modes), but you cannot use Loiter (position hold), RTL (return to home), Auto (waypoint missions), or any other GPS-dependent mode.

What to look for:
- Fix type: "3D Fix" is the minimum for GPS flight modes. "No Fix" or "2D Fix" means the GPS doesn't have enough satellites yet. Wait, or go outside -- GPS does not work reliably indoors.
- Satellite count: Minimum 6 for a reliable fix, 10+ is good, 14+ is excellent. More satellites = better accuracy.
- HDOP: Horizontal Dilution of Precision. Lower is better. Under 1.0 is excellent, under 1.5 is good. ArduPilot defaults to requiring HDOP below 1.4 before arming.

Constellation configuration: Modern GPS modules can receive signals from multiple satellite networks simultaneously. Enable all of them for best performance:
- GPS (US): The original system, always enable
- SBAS: Augmentation satellites that improve accuracy, always enable
- Galileo (EU): European system, adds more satellites in most locations
- BeiDou (China): Good coverage in Asia-Pacific, helpful everywhere
- GLONASS (Russia): Good coverage in high latitudes

There is no downside to enabling all constellations. The module automatically picks the best available signals. The default (all enabled, value 31) is correct for nearly everyone.

First fix after power-on can take 30-60 seconds with a cold start. Subsequent power-ons with the same GPS module in the same location will get a fix much faster (5-15 seconds) because the module remembers satellite almanac data.

If GPS never gets a fix: check wiring (TX/RX to the correct UART), verify the serial port protocol is set to GPS (protocol 5), and make sure you have a clear view of the sky.`,
    wikiUrl: 'https://ardupilot.org/copter/docs/common-gps-overview.html',
  },

  compass: {
    summary: 'Calibrate the compass so the FC knows which way is north.',
    detail: `The compass (magnetometer) is critical for knowing which direction the aircraft is pointing. Without a calibrated compass, GPS modes will not work correctly because the FC won't know which way to fly to reach a waypoint or to return home.

Why calibration is needed: The compass measures the Earth's magnetic field, but your aircraft is full of things that create their own magnetic fields -- motors, ESCs, battery wires, power distribution boards. Calibration measures these interference sources and subtracts them so only the Earth's field remains.

How to calibrate:
1. Go outdoors, away from metal structures, cars, concrete with rebar, and power lines. Magnetic interference from the environment will ruin the calibration.
2. Start the calibration process.
3. Rotate the aircraft slowly through all orientations -- imagine you're painting the inside of a sphere with the aircraft's nose. Roll it, pitch it, yaw it, hold it at various angles. The goal is to sample the magnetic field from as many directions as possible.
4. The progress indicator shows completion. Once enough samples are collected from enough orientations, calibration completes automatically.

Tips for good calibration:
- Keep motors off during calibration. Running motors create strong magnetic interference.
- Move slowly and steadily. Quick jerky movements don't help.
- If calibration fails repeatedly, you may have too much magnetic interference on the board. Consider mounting an external compass (built into most GPS modules) further from the electronics.
- If using an external compass, make sure it's mounted with the arrow pointing forward and set COMPASS_ORIENT accordingly.

After calibration, verify the compass heading makes sense: point the aircraft north and check that the heading reads approximately 0/360 degrees. Significant error (more than 15-20 degrees) suggests interference or a bad calibration.`,
    wikiUrl: 'https://ardupilot.org/copter/docs/common-compass-calibration-in-mission-planner.html',
  },

  accelerometer: {
    summary: 'Calibrate the accelerometer so the FC knows which way is level.',
    detail: `The accelerometer measures gravity to determine which way is "down" and what angle the aircraft is tilted. This is the most fundamental sensor for flight -- even the simplest stabilized flight mode depends on accurate accelerometer data.

Why calibration is needed: Manufacturing tolerances mean the sensor's axes aren't perfectly aligned with the circuit board. Calibration measures the offset on each axis so the FC can compensate.

The 6-position calibration procedure:
1. Level: Place the aircraft right-side-up on a flat, level surface. This is the most important position -- it defines what "level" means for your aircraft. Use a level surface, not a desk that might be tilted.
2. Nose down: Hold the aircraft with the nose pointing straight down.
3. Nose up: Hold the aircraft with the nose pointing straight up.
4. Left side: Roll the aircraft 90 degrees so the left side faces down.
5. Right side: Roll the aircraft 90 degrees so the right side faces down.
6. Upside down: Flip the aircraft completely inverted.

For each position, hold the aircraft as steady as possible for a few seconds while the FC collects samples. Small deviations from perfect alignment are fine -- the calibration math is designed to handle imperfect positioning.

If calibration fails: Make sure you're holding each position steady (not moving). Vibration or movement during sampling will corrupt the data. Also ensure you're getting distinct positions -- if "left side" and "right side" look too similar to the sensor, it will fail.

Level trim: After calibration, there's an optional "level trim" step. Place the aircraft on the surface where you'll actually fly from and run level trim. This adjusts for any tilt in your mounting and ensures the aircraft hovers level rather than drifting in one direction.`,
    wikiUrl: 'https://ardupilot.org/copter/docs/common-accelerometer-calibration.html',
  },

  flight_modes: {
    summary: 'Assign flight behaviors to your transmitter switch positions.',
    detail: `Flight modes change how the aircraft responds to your stick inputs. You can assign up to 6 modes to different positions on a transmitter switch (or combination of switches). The right mode selection is important for both everyday flying and emergency situations.

Recommended modes for a first flight on a copter:
- Position 1 (low): Stabilize -- Self-leveling manual control. You control roll, pitch, and yaw angles. Throttle directly controls climb/descent. No GPS needed. This is your "safe fallback" -- if anything goes wrong, switch to Stabilize and fly manually.
- Position 2 (mid): AltHold -- Like Stabilize but the FC holds altitude when you center the throttle. Much easier for hovering. No GPS needed.
- Position 3 or 4: Loiter -- Full GPS position hold. Release the sticks and the aircraft stops and holds position. Push a stick to move in that direction. Very easy to fly but requires GPS.
- Position 5 or 6: RTL -- Return to Launch. The aircraft flies itself home and lands. Your emergency "bring it back" mode. Always have this on an easy-to-reach switch position.

Recommended modes for planes:
- Manual: Direct control, no stabilization. For experienced pilots only.
- FBWA (Fly By Wire A): Self-leveling, bank angle limited. Safest manual mode for planes.
- RTL: Fly home and loiter overhead.
- Auto: Follow a pre-planned mission.

You don't need to fill all 6 slots. Many pilots use just 3 modes (Stabilize, Loiter, RTL) on a 3-position switch and it covers everything they need.

The mode channel is the transmitter channel (usually 5 or 6) connected to your mode switch. The FC reads the PWM value on that channel and maps it to the 6 mode slots based on PWM ranges.`,
    wikiUrl: 'https://ardupilot.org/copter/docs/flight-modes.html',
  },

  failsafes: {
    summary: 'Set up automatic safety actions for when things go wrong.',
    detail: `Failsafes are automatic responses that protect your aircraft (and people/property on the ground) when something goes wrong. They are arguably the most important safety configuration after correct motor direction. Configure them before every first flight.

RC Failsafe (radio link loss):
What happens when your transmitter loses connection to the receiver -- out of range, interference, transmitter battery dies, or transmitter turned off. This is the most common failsafe trigger.
- Recommended action: RTL (Return to Launch). The aircraft flies itself home using GPS.
- How to test: On the ground (props off), turn off your transmitter. The FC should report "RC failsafe" and attempt to enter RTL mode. Turn the transmitter back on to regain control.

Battery Failsafe:
Triggers when battery voltage or remaining capacity drops below thresholds.
- Low battery (first warning): RTL is recommended. The aircraft has enough power to fly home.
- Critical battery (emergency): Land is recommended. At this point there may not be enough power for the return flight.
- Thresholds: For LiPo batteries, 3.5V/cell for low warning and 3.3V/cell for critical.

GCS Failsafe (ground station link loss):
Triggers when a MAVLink ground station connection drops. Most hobby pilots fly with a transmitter (not a laptop), so this rarely triggers. RTL is a safe default.

EKF Failsafe (navigation system failure):
The EKF (Extended Kalman Filter) is ArduPilot's navigation brain. If it reports poor health (compass interference, GPS glitch, excessive vibration), this failsafe triggers.
- Recommended action: Land. The position estimate is unreliable, so RTL might not go where you expect.

Geofence (optional):
You can set a maximum altitude and distance from home. If the aircraft exceeds either limit, a failsafe triggers. Useful for keeping the aircraft in a safe area, especially while learning.`,
    wikiUrl: 'https://ardupilot.org/copter/docs/failsafe-landing-page.html',
  },

  initial_tune: {
    summary: 'Set initial filter and tune parameters based on your propeller size.',
    detail: `The flight controller runs a control loop hundreds of times per second: read sensors, calculate error, command motors. The parameters in this loop need starting values that match your hardware. The most important factor is propeller size, because propellers are the primary source of vibration.

Why propeller size matters:
- Small propellers (3-5 inch, racing quads) spin fast and produce high-frequency vibration. Filters can be set higher (80-100Hz).
- Medium propellers (7-10 inch, photography drones) produce mid-frequency vibration. Filters around 40-80Hz.
- Large propellers (12+ inch, heavy lifters) spin slowly and produce low-frequency vibration. Filters must be 20-40Hz.

What gets set:
- Gyro filter (INS_GYRO_FILTER): Removes vibration noise from the rotation measurement. Too high and vibrations cause oscillation. Too low and the aircraft feels sluggish.
- Accel filter: Affects altitude hold quality.
- D-term filter: The most vibration-sensitive part of the PID controller.
- Acceleration limits: How fast the FC can change the aircraft's attitude. Larger aircraft need lower limits.
- Thrust expo: Compensates for the non-linear throttle-to-thrust curve. 0.65 works for most builds.

These are STARTING POINTS, not final tuning. They are conservative and safe for a first flight. After your first successful hover, run AutoTune.

AutoTune is a flight mode where the FC automatically optimizes its PID gains by commanding small twitches and measuring the response. It takes 5-10 minutes of calm hovering. The wizard assigns AutoTune to one of your mode slots. The difference between default and AutoTuned performance is dramatic -- smoother, more responsive, more efficient.`,
    wikiUrl: 'https://ardupilot.org/copter/docs/initial-tuning-flight.html',
  },

  review: {
    summary: 'Review everything that was configured and finish.',
    detail: `This page shows a complete summary of every parameter written to the flight controller during the wizard, grouped by step.

What to look for:
- Step completion: Green checkmarks for completed steps, warnings for skipped steps. Safety-critical skips (motor direction, failsafes, calibration) are highlighted in red with specific consequences.
- Parameter diff: "What Changed" shows old vs new values for every modified parameter.
- Safety acknowledgment: If safety-critical steps were skipped, you must check the acknowledgment box before finishing.

After finishing the wizard, reboot the FC for all changes to take effect. Then:
1. Go to the Pre-flight page and run the readiness check.
2. Do a ground test: arm (props off), move sticks, verify motors/surfaces respond correctly.
3. First flight in an open area, away from people, in Stabilize mode.
4. After a successful hover, run AutoTune for optimized performance.

You can return to any sidebar page later to adjust settings. The wizard is the starting point, not the end.`,
  },
};
