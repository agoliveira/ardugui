# ArduGUI v1.0.0-rc1 -- Feature Complete, Pre-Testing

## Summary

V1 is feature complete. Every page in the sidebar is implemented, the Setup Wizard
covers the full zero-to-first-flight flow for copters, planes, and VTOL aircraft,
and INAV migration handles ~90% of configuration automatically. This release
candidate needs hardware testing before public release.

## What's New Since Last Push

### Architecture Changes
- **Write-as-you-go wizard** -- params written to FC on each Next click instead of
  batched at the end. Initial FC state captured for rollback if user abandons.
- **All wizard steps skippable** -- safety-critical steps show warnings at Review
  with specific consequences. Finish gated behind acknowledgment checkbox.
- **Board detection dialog** -- three options on connect: resume saved progress,
  start from beginning, or factory reset and start fresh.
- **Shared motor test infrastructure** -- useMotorTest hook + composable UI
  components used by both wizard and standalone Motors page.

### New Standalone Pages
- **GPS** -- live telemetry (fix, sats, HDOP, coordinates), constellation toggles
- **Control Surfaces** -- 3D viewer with live servo feedback, reverse buttons (plane/VTOL)
- **Transitions** -- full VTOL transition config (timeout, assist, RTL mode, failure action)
- **Battery Monitor** -- monitor type, analog calibration, cell count, failsafe thresholds
- **ESC Configuration** -- protocol selection, DShot settings, direction reversal bitmask

### Wizard Improvements
- RC Calibration step (2-phase, throttle reversal detection)
- Transitions step (VTOL)
- Tilt Servo step enhanced with active mode-switch testing
- Fresh board detection prompts wizard launch
- Motor diagram visual consistency (wizard matches standalone)

### INAV Import Fixes
- Board alignment conversion (align_board_roll/pitch decidegrees -> AHRS_TRIM radians)
- Auto cell count from live battery voltage when bat_cells=0
- OSD screen number prefix fix (OSD1_ not OSD_), auto-enables OSD_TYPE
- RC expo/rates skip with explanatory note

### UX Polish
- BDShot firmware toggle (checkbox, variants hidden from board list)
- Flash error recovery guidance
- Airplane motor spinning indicator on diagram
- Motor label overlap fix on plane diagram
- All window.confirm() replaced with in-app ConfirmDialog
- VTOL pre-flight validation (8 checks in paramValidation.ts)

### Bug Fixes
- ReceiverStep change guard (one-way state latch)
- FrameStep copter drill-down persistence
- Frame diagram after INAV import (useDetectedPreset reads stagedParams)
- Fresh board detection false positive for quadplane (checks Q_FRAME_CLASS)

## Known Issues / Needs Testing
- Connected flash path (MAVLink reboot-to-bootloader) -- untested
- OSD import param names -- code-reviewed but not hardware-verified
- VTOL live tilt servo response checks -- not yet implemented
- Custom .apj flash "invalid image_size" -- parseApj validates before decompression
- Connected flash navigates to connect page -- pendingPage not working for this flow

## Test Hardware
- Matek F405-VTOL (ArduPlane v4.6.3)
- Matek F405-Wing
- Matek F405-TE (Xiake VTOL quadplane)
- Pixhawk 2.4.8

## How to Test
See TEST_SESSION_20260314.md for a comprehensive 420-line test script covering
19 sections and ~100 individual test cases.
