import type { StepHelpEntry } from './index';

/**
 * Help entries for standalone sidebar pages.
 * Same format as wizard step help -- summary + detail + wiki link.
 * Keyed by page ID from Layout.tsx.
 */
export const PAGE_HELP: Record<string, StepHelpEntry> = {

  motors: {
    summary: 'Test motors and verify the output mapping matches your wiring.',
    detail: `This page shows how your flight controller's output pads map to motors and servos. The diagram displays motor positions, rotation directions, and numbering for your frame type.

Use the motor test section to spin individual motors and verify:
1. The correct motor responds to each test button
2. Each motor spins in the correct direction (blue = CCW, red = CW)
3. Motors stop cleanly after the test

ALWAYS REMOVE PROPELLERS before testing. The servo table below the diagram lets you change output function assignments if your wiring doesn't match the default mapping.

If you need to change the ESC protocol (PWM, DShot, etc.), use the ESC page in the sidebar.`,
    wikiUrl: 'https://ardupilot.org/copter/docs/connect-escs-and-motors.html',
  },

  receiver: {
    summary: 'View live RC channel data and configure your radio receiver.',
    detail: `This page shows real-time data from your radio receiver. The channel bars display the PWM value for each channel as you move your transmitter sticks and switches.

What to look for:
- All 4 primary channels (Roll, Pitch, Throttle, Yaw) should respond smoothly to stick movement
- Values should range from approximately 1000 to 2000, with center at 1500 (except throttle which centers at low)
- RSSI (signal strength) should be above 50% for reliable operation
- Channel count should match what your receiver supports

If no channels appear, verify the receiver protocol, serial port assignment, and wiring. CRSF receivers need a UART with the correct baud rate. SBUS receivers connect to the dedicated SBUS pad.

RC calibration can be done through the Setup Wizard's Receiver step.`,
    wikiUrl: 'https://ardupilot.org/copter/docs/common-rc-systems.html',
  },

  gps: {
    summary: 'Live GPS status, satellite data, and constellation configuration.',
    detail: `This page shows real-time GPS telemetry from your GPS module. The key indicators are:

Fix type: "3D Fix" is required for GPS flight modes (Loiter, RTL, Auto). "No Fix" means the module doesn't have enough satellites -- go outdoors and wait 30-60 seconds for a cold start.

Satellite count: 6 is the minimum for flight, 10+ is good, 14+ is excellent. More satellites means better position accuracy.

HDOP (Horizontal Dilution of Precision): Lower is better. Under 1.0 is excellent, 1.0-1.5 is good. ArduPilot requires HDOP below 1.4 to arm in GPS modes.

Constellation toggles let you enable or disable satellite systems. Enabling all (GPS, SBAS, Galileo, BeiDou, GLONASS) is recommended -- there is no downside and it provides the best coverage everywhere.

If GPS never gets a fix: check that the serial port protocol is set to 5 (GPS), verify TX/RX wiring, and ensure the module has a clear view of the sky.`,
    wikiUrl: 'https://ardupilot.org/copter/docs/common-gps-overview.html',
  },

  battery: {
    summary: 'Configure battery monitoring, voltage thresholds, and failsafe actions.',
    detail: `Battery monitoring is essential for safe flight. This page configures how the FC reads battery voltage and current, and what happens when the battery gets low.

Monitor type: Most boards use "Analog Voltage + Current" which reads through a built-in power module. If the voltage reading doesn't match your multimeter, adjust the voltage multiplier.

Cell count: Select your battery's cell count (3S, 4S, 6S, etc.) and ArduGUI calculates appropriate voltage thresholds automatically:
- Low warning: 3.5V per cell (triggers first failsafe, typically RTL)
- Critical: 3.3V per cell (triggers emergency action, typically Land)

Failsafe actions determine what the aircraft does when thresholds are reached:
- RTL (Return to Launch): Best for low battery -- flies home while there's still power
- Land: Best for critical battery -- lands immediately wherever it is
- None: Not recommended -- the aircraft will fly until the battery is completely dead

If you have a current sensor, also set the battery capacity (mAh from the battery label). This enables remaining-capacity tracking which is more reliable than voltage alone, especially under load.`,
    wikiUrl: 'https://ardupilot.org/copter/docs/common-power-module-configuration-in-mission-planner.html',
  },

  esc: {
    summary: 'ESC protocol, DShot settings, motor direction reversal, and spin thresholds.',
    detail: `This page configures the communication between your flight controller and ESCs (Electronic Speed Controllers).

Protocol: DShot600 is recommended for modern ESCs (BLHeli_32, BLHeli_S, AM32). It's digital, requires no calibration, supports direction reversal via software, and is immune to electrical noise. If your ESCs don't support DShot, use OneShot125 or PWM.

DShot settings (only visible with DShot protocol):
- BLHeli auto-detect: Enable this so the FC knows which outputs have BLHeli ESCs
- ESC type: Select BLHeli32/BLHeli_S for most modern ESCs
- Rate multiplier: Leave at 0 (1x loop rate) unless you have a specific reason to increase it

Motor direction reversal: With DShot, you can reverse motor direction in software instead of swapping wires. The bitmask shows which outputs are reversed. Toggle each motor as needed after verifying direction with a motor test.

Spin thresholds: "Spin when armed" is the idle motor speed when armed but not flying (0.05-0.10 typical). "Minimum spin" is the lowest throttle during flight to keep motors spinning for attitude control (0.15 default).`,
    wikiUrl: 'https://ardupilot.org/copter/docs/common-dshot.html',
  },

  control_surfaces: {
    summary: 'View and adjust control surface assignments, direction, and endpoints.',
    detail: `This page shows your airplane's control surfaces with real-time servo feedback. The 3D viewer displays aileron, elevator, and rudder deflection as you move your transmitter sticks.

Verify each surface:
- Right stick right: right aileron UP, left aileron DOWN
- Right stick back: elevator UP (trailing edge rises)
- Right stick right: rudder deflects RIGHT

If any surface moves the wrong way, use the Reverse button for that servo. Always reverse at the FC level, not on your transmitter -- reversing on the transmitter causes the FC's stabilization to work backwards.

The servo output bars show live PWM values being sent to each servo. Use these to verify endpoints -- the full stick deflection should reach SERVO_MIN and SERVO_MAX without the servo binding mechanically.

For flying wings, the elevon mixing is handled by the FC. Both surfaces respond to both pitch and roll inputs.`,
    wikiUrl: 'https://ardupilot.org/plane/docs/guide-four-channel-plane.html',
  },

  transitions: {
    summary: 'VTOL transition settings: timeout, assist, RTL mode, failure action.',
    detail: `This page configures how your VTOL aircraft transitions between hover and forward flight. These settings are critical for safe VTOL operation.

Forward transition timeout: How many seconds the FC tries to accelerate from hover to wing-borne flight. Default 10 seconds is conservative. If the aircraft doesn't reach flying speed in this time, the failure action triggers.

VTOL Assist: Your safety net in forward flight. If airspeed drops below the assist threshold (due to wind, steep climb, or sharp turn), the hover motors automatically engage to prevent a stall. Enable speed-based assist at minimum -- without it, a gust of headwind can cause a stall with no automatic recovery.

RTL mode: When Return-to-Launch triggers, should the aircraft land as a VTOL (hover down vertically) or as a plane (fly an approach)? VTOL RTL is recommended because it doesn't need a runway.

Transition failure: What happens if the forward transition times out. "Continue in VTOL" is safest -- the aircraft stays in hover mode. "Land" descends immediately.`,
    wikiUrl: 'https://ardupilot.org/plane/docs/quadplane-transitions.html',
  },

  calibration: {
    summary: 'Accelerometer, compass, and level trim calibration.',
    detail: `This page handles hardware sensor calibration. Each sensor needs calibration to account for manufacturing tolerances and magnetic interference.

Accelerometer (6-position): Place the aircraft in 6 orientations (level, nose down, nose up, left, right, inverted). Hold each position steady for a few seconds. The "level" position is most important -- use a truly flat surface. Bad accel calibration causes drift in all flight modes.

Compass: Rotate the aircraft slowly through all orientations while outdoors, away from metal and electronics. The compass measures Earth's magnetic field, so nearby interference (motors, power wires, metal structures) corrupts the calibration. If using an external compass (built into most GPS modules), it should be mounted away from the power system.

Level trim: After accel calibration, place the aircraft on the surface you'll fly from and run level trim. This compensates for any mounting tilt so the aircraft hovers truly level.

Reboot: Some calibration changes require a reboot to take effect. Use the reboot button at the bottom of the page.`,
    wikiUrl: 'https://ardupilot.org/copter/docs/common-accelerometer-calibration.html',
  },

  modes: {
    summary: 'Assign up to 6 flight modes to your transmitter switch positions.',
    detail: `Flight modes change how the aircraft behaves in response to your stick inputs. Assign them to switch positions on your transmitter so you can change behavior mid-flight.

Essential copter modes:
- Stabilize: Self-leveling manual control. Your safe fallback mode.
- AltHold: Like Stabilize but holds altitude automatically.
- Loiter: GPS position hold. Release sticks and the aircraft stops.
- RTL: Return to Launch. Emergency "bring it back" mode.

Essential plane modes:
- Manual: Direct control, no stabilization.
- FBWA: Self-leveling with bank angle limits. Safest manual mode.
- RTL: Fly home and loiter overhead.

The mode channel (usually channel 5 or 6) is connected to a switch on your transmitter. The FC maps PWM ranges to the 6 mode slots. A 3-position switch gives 3 modes; a 6-position switch or mixed switches give all 6.

Tip: You don't need all 6 slots filled. Most pilots use Stabilize + Loiter + RTL on a 3-position switch and it covers everything.`,
    wikiUrl: 'https://ardupilot.org/copter/docs/flight-modes.html',
  },

  failsafes: {
    summary: 'Configure automatic safety actions for radio loss, low battery, and navigation failure.',
    detail: `Failsafes protect your aircraft and people on the ground when something goes wrong. They trigger automatically -- no pilot input needed.

RC Failsafe: Triggers when the transmitter loses connection. Set to RTL (Return to Launch) so the aircraft flies home. Test this on the ground (props off) by turning off your transmitter.

Battery Failsafe: Triggers when voltage or remaining mAh drops below thresholds. Two levels:
- Low: RTL recommended (fly home while power remains)
- Critical: Land recommended (not enough power to fly home)

GCS Failsafe: Triggers when ground station connection drops. RTL is a safe default. Most hobby pilots fly with a transmitter, so this rarely triggers.

EKF Failsafe: Triggers when the navigation system reports poor health (compass interference, GPS glitch, vibration). Land is recommended because the position estimate is unreliable.

Geofence: Optional altitude and distance limits. If exceeded, a failsafe triggers. Good for keeping the aircraft in a safe area while learning.

Always configure failsafes before first flight. They are your most important safety feature after correct motor direction.`,
    wikiUrl: 'https://ardupilot.org/copter/docs/failsafe-landing-page.html',
  },

  preflight: {
    summary: 'Readiness dashboard -- sensor health, pre-arm checks, and parameter validation.',
    detail: `The pre-flight page answers one question: "Can I fly safely?"

It checks three things:
1. Sensor health: Are the gyro, accelerometer, compass, barometer, GPS, and RC receiver all reporting healthy? A red indicator means the sensor has a problem that must be fixed before flight.

2. Pre-arm checks: ArduPilot runs its own internal checks before allowing arming. Common failures include: compass not calibrated, GPS no fix, RC not calibrated, battery voltage too low, and EKF not ready. Each failure is shown with a description.

3. Parameter validation: ArduGUI checks your configuration for common mistakes -- missing failsafes, unconfigured battery monitor, VTOL parameters inconsistent, etc. Critical issues should be fixed. Warnings are advisory.

Fix all critical items before attempting to fly. Warnings are important but may not prevent flight. Run this check every time you go to the field, especially after making configuration changes.`,
    wikiUrl: 'https://ardupilot.org/copter/docs/common-prearm-safety-checks.html',
  },

  firmware: {
    summary: 'Download and flash ArduPilot firmware to your flight controller.',
    detail: `This page lets you install or update ArduPilot firmware on your board. You can flash while disconnected (board in bootloader mode) or while connected (the FC reboots into bootloader automatically).

Steps:
1. Select your board from the list (use the search to filter)
2. Choose vehicle type (Copter or Plane) and release channel (Stable recommended)
3. Click Download Firmware to fetch from the ArduPilot server
4. Click Flash to FC to write it to the board

BDShot: If your ESCs support bidirectional DShot (BLHeli_32 or AM32), check the BDShot toggle before downloading. This enables RPM-based filtering for smoother flight.

Custom firmware: Use "Load Custom .apj" if you have a locally built firmware file.

First-time boards: If your board is running INAV or Betaflight firmware, it doesn't have the ArduPilot bootloader. You need to flash the _with_bl.hex file via DFU mode first using STM32CubeProgrammer or Betaflight Configurator.

If flashing fails mid-write, the board is safely in bootloader mode. Disconnect and reconnect USB, then try again.`,
    wikiUrl: 'https://ardupilot.org/copter/docs/common-loading-firmware-onto-chibios-only-boards.html',
  },

  wiring: {
    summary: 'Board-aware wiring guide showing physical pad assignments.',
    detail: `This page shows a wiring diagram specific to your flight controller board. Each output pad (S1, S2, etc.), UART (TX/RX pairs), and peripheral connector is labeled with its assigned function based on your current configuration.

Use this as a reference when soldering or connecting peripherals. The diagram updates when you change output assignments, serial port protocols, or peripheral connections.

Common connections:
- Motors: Soldered to the S-pads (S1-S8 typically)
- ESC signal and ground wires to each motor pad
- Receiver: CRSF/ELRS to a TX/RX UART pair; SBUS to the dedicated SBUS pad
- GPS: TX/RX to a UART pair (check which UART is set to GPS protocol)
- Battery monitor: Usually built-in via the power input pads
- Buzzer: Dedicated buzzer pad (if available)

The pad labels match what's printed on your physical board, so you can match the diagram directly to your soldering.`,
  },

  my_aircraft: {
    summary: 'Browse your registered aircraft, manage parameter snapshots, and track configuration history.',
    detail: `This page shows all aircraft that have been connected to ArduGUI. Each card displays the aircraft name, vehicle type, board, firmware version, and how many parameter snapshots exist.

Click a card to drill into its snapshot history. From there you can create new snapshots, compare snapshots against live FC parameters, selectively restore individual parameters, and import or export .param files.

Connected aircraft appear at the top with a green "Live" badge. Only the connected aircraft supports creating snapshots, diffing against current values, and restoring parameters. Disconnected aircraft are read-only -- you can browse snapshots and export .param files but not create or restore.

Aircraft you no longer fly can be archived to keep the fleet view clean. Archived aircraft and their snapshots are preserved and can be restored at any time. Permanent deletion is available from the archived view.

Auto-backup (enabled per aircraft) saves a snapshot every time you connect, giving you a rolling history of your configuration over time.`,
  },
};
