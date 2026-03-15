# ArduGUI -- Test Script (March 14, 2026 Session)

Test hardware: any ArduPilot board (Copter or Plane/QuadPlane)
All tests require a connected board unless noted otherwise.

---

## 1. Fresh Board Detection

### 1.1 Fresh board prompt
- [ ] Flash a board to factory defaults (or use one that's never been configured)
- [ ] Connect in ArduGUI
- [ ] After params load, a dialog should appear: "New board detected"
- [ ] Dialog has "Skip" and "Start Setup Wizard" buttons
- [ ] Click "Skip" -- dialog dismisses, normal UI shown
- [ ] Disconnect and reconnect -- prompt appears again (once per connection)

### 1.2 Configured board -- no prompt
- [ ] Connect a board that has been through any setup (accel calibrated, or RC calibrated, or frame set)
- [ ] No "New board detected" dialog should appear
- [ ] Verify: even if only ONE of the three signals (accel/RC/frame) has been touched, no prompt

### 1.3 Prompt -> Wizard
- [ ] Connect fresh board, click "Start Setup Wizard"
- [ ] Wizard opens on welcome screen
- [ ] Complete one step and abandon -- prompt should NOT reappear (didAutoRedirect guards)

---

## 2. Setup Wizard -- General Flow

### 2.1 Start Fresh (Copter)
- [ ] Connect copter board
- [ ] Open wizard, click "Start Fresh"
- [ ] Factory reset dialog appears
- [ ] Click "Reset & Continue"
- [ ] Progress: Backing up -> Resetting -> Rebooting -> Reconnecting
- [ ] After reconnect, wizard opens on Frame step
- [ ] Stepper shows correct step count for copter (13 steps)

### 2.2 Start Fresh (QuadPlane)
- [ ] Connect ArduPlane board
- [ ] Open wizard, "Start Fresh", reset, after reconnect
- [ ] Vehicle choice screen: "Airplane or VTOL"
- [ ] Select VTOL
- [ ] Stepper shows correct step count for quadplane (16 steps, includes Control Surfaces, Tilt Servos, Transitions)

### 2.3 Skip Reset
- [ ] Open wizard, click "Start Fresh", click "Skip Reset"
- [ ] Wizard opens directly on Frame step (no crash, no errors)
- [ ] This tests the FrameStep temporal dead zone fix

---

## 3. Frame Step

### 3.1 Copter drill-down persistence
- [ ] Select a frame (e.g. Quad X)
- [ ] Note the copter category is drilled into (showing Quad variants)
- [ ] Click Next, then Back
- [ ] Quad category should still be drilled into, Quad X still highlighted
- [ ] Abandon wizard, re-enter wizard
- [ ] If localStorage progress was saved, drill-down should restore

### 3.2 Frame diagram after import
- [ ] Do an INAV import for a quadplane
- [ ] Navigate to Motors standalone page (sidebar)
- [ ] Frame diagram should show (Q_FRAME_CLASS from stagedParams is now visible)
- [ ] Motor layout should be correct for the imported frame type

---

## 4. Motor Test -- Visual Consistency

### 4.1 Wizard motor diagram
- [ ] In wizard, select a copter frame (Quad X), select ESC protocol
- [ ] Motor diagram should show: colored rings (blue=CCW, pink=CW), CW/CCW labels below each motor, green FRONT marker, filled number discs
- [ ] Compare visually with the standalone Motors page diagram -- should match

### 4.2 Standalone motor diagram
- [ ] Navigate to Motors page in sidebar
- [ ] Motor layout diagram should show same visual style as wizard
- [ ] Colors, labels, FRONT marker all consistent

### 4.3 Motor test execution (wizard)
- [ ] Connect battery
- [ ] Acknowledge safety warning
- [ ] Spin Motor 1 -- number disc turns amber, pulse animation plays
- [ ] After spin, "Confirm" and "Wrong" buttons appear
- [ ] Click Confirm -- ring turns green, checkmark appears
- [ ] Repeat for all motors
- [ ] "Test All Motors" button appears after all confirmed

### 4.4 Motor test execution (standalone)
- [ ] Enable test on Motors page
- [ ] Click motor in diagram or M1/M2/M3/M4 buttons
- [ ] Motor spins at selected throttle for selected duration
- [ ] Verify same motors spin in both wizard and standalone

---

## 5. Receiver Step -- Change Guard

### 5.1 Guard fires when receiver is configured
- [ ] Connect board with receiver already configured (CRSF/SBUS working)
- [ ] Enter wizard, navigate to Receiver step
- [ ] Green "Receiver configured and working" banner should show
- [ ] Click a different protocol -- warning dialog should appear
- [ ] Click "Keep Current" -- selection unchanged
- [ ] Click protocol again, then "Modify" -- selection changes, no more warnings

### 5.2 Guard does NOT fire on fresh setup
- [ ] Connect board with no receiver configured
- [ ] Navigate to Receiver step
- [ ] Blue info banner: "Select your receiver protocol"
- [ ] Click CRSF -- selects immediately, no warning dialog

### 5.3 Late telemetry detection
- [ ] If receiver is on SBUS (no SERIAL RCIN), the guard should still fire
      once RC channel data starts flowing (even if it wasn't available at mount)

---

## 6. RC Calibration (NEW)

### 6.1 Wizard step
- [ ] Navigate to RC Calibration step (after Receiver)
- [ ] If no RC signal: red "No RC signal" banner, no controls
- [ ] Power on transmitter
- [ ] "Start calibration" button appears with live channel preview
- [ ] Click Start -- Phase 1: "Move all sticks to extremes"
- [ ] Move sticks -- min/max range fills in real time (amber shaded region)
- [ ] Counter shows channels with good range (>300us)
- [ ] Click "Next: confirm center"
- [ ] Phase 2: "Center all sticks, throttle low"
- [ ] Verify channel bars show live positions
- [ ] Click "Save calibration" -- params write to FC
- [ ] Green "RC calibration saved" banner with summary table
- [ ] Next button is now enabled

### 6.2 Throttle reversal detection
- [ ] In Phase 2 (centering), if throttle value is closer to max than min
- [ ] Red warning: "Throttle channel appears reversed"
- [ ] Save button is DISABLED until throttle is fixed

### 6.3 Already calibrated
- [ ] Enter RC Calibration step on a board with existing calibration
- [ ] Green "RC already calibrated" banner
- [ ] Next button is enabled without recalibrating
- [ ] "Start calibration" still available to redo

### 6.4 Standalone (CalibrationPage)
- [ ] Navigate to Calibration in sidebar
- [ ] RC Calibration card should appear at the top
- [ ] Same calibration flow as wizard
- [ ] Verify params written to FC (RC1_MIN, RC1_MAX, RC1_TRIM, etc.)

### 6.5 RCMAP awareness
- [ ] If RCMAP_THROTTLE is not 3 (e.g. TAER mapping where throttle=Ch1)
- [ ] Throttle reversal check should use the correct channel
- [ ] Throttle trim should be set to min of the correct channel

---

## 7. Tilt Servos Step (VTOL only, ENHANCED)

### 7.1 No tilt configured
- [ ] QuadPlane without tilt (Q_TILT_TYPE=0)
- [ ] Step shows "No tilt mechanism detected" with skip info
- [ ] Next button enabled (skippable)

### 7.2 Tilt test buttons
- [ ] QuadPlane with tilt configured (Q_TILT_TYPE > 0, tilt servos assigned)
- [ ] "Hover position" and "Forward flight" buttons visible
- [ ] Current flight mode shown in config summary
- [ ] Click "Hover position" -- FC switches to QStabilize (mode 17)
- [ ] Tilt servos should physically move to vertical position
- [ ] Button highlights, "tested" checkmark appears
- [ ] Click "Forward flight" -- FC switches to Manual (mode 0)
- [ ] Tilt servos should physically move to horizontal position
- [ ] Both tested: green "Both positions tested" banner
- [ ] If FC is armed, buttons are disabled with warning

### 7.3 Servo output bars
- [ ] Live servo output bars should update as tilt servos move
- [ ] Values shown in microseconds

---

## 8. Transitions Step (VTOL only, NEW)

### 8.1 Wizard step
- [ ] QuadPlane wizard includes Transitions step (in Surfaces phase, after Tilt Servos)
- [ ] Three sections: Forward transition, RTL behavior, VTOL assist
- [ ] Transition timeout slider: 5s - 30s, default 10s
- [ ] RTL mode cards: Fixed-wing, VTOL (recommended), Hybrid
- [ ] VTOL assist speed and altitude sliders
- [ ] If both assist disabled: yellow warning
- [ ] No airspeed sensor: blue info about timer-based transition
- [ ] All params staged (verify in Review step)

### 8.2 Standalone page
- [ ] Navigate to Transitions in sidebar (only visible for quadplane)
- [ ] Full version with additional params:
  - Forward transition (timeout, ARSPD_FBW_MIN, tilt rates)
  - Back transition (tilt rates)
  - VTOL assist (speed, altitude, angle)
  - Failure handling (Q_TRANS_FAIL_ACT, Q_RTL_MODE)
- [ ] Param names shown alongside labels
- [ ] Changes go to dirty params (save via footer)

---

## 9. Refactored Motor Components

### 9.1 ESC Protocol constants
- [ ] Wizard shows 4 protocols: PWM, OneShot125, DShot300, DShot600
- [ ] Verify descriptions and throttle values match between wizard and any other reference

### 9.2 Shared hook behavior
- [ ] Motor test in wizard uses shared useMotorTest hook
- [ ] Safety monitor still works (tilt/rotation aborts test)
- [ ] Battery gating still works (no battery = test disabled)
- [ ] Results tracking (correct/wrong per motor) still works
- [ ] "Test all" sequence still works after all confirmed

---

## 10. Code Cleanup Verification

### 10.1 No crashes on any page
- [ ] Navigate through ALL sidebar pages -- no crashes
- [ ] Wizard: step through all steps for copter -- no crashes
- [ ] Wizard: step through all steps for quadplane -- no crashes

### 10.2 No stale UI
- [ ] No "useCallback not defined" or similar import errors
- [ ] Transitions page is NOT a placeholder anymore (should show real params)
- [ ] Motor diagram in wizard is NOT grey/dim (should be colored)

---

## 11. Quick Smoke Tests

- [ ] App starts without errors
- [ ] Connect to board -- MAVFTP downloads params
- [ ] Wizard accessible when connected
- [ ] Abandon wizard -- returns to normal layout
- [ ] Disconnect overlay in wizard when USB pulled
- [ ] Footer save/revert buttons work on standalone pages
- [ ] Firmware page accessible disconnected

---

## 12. Write-As-You-Go Wizard

### 12.1 Params written on Next
- [ ] Start wizard, select frame, click Next
- [ ] Connect to Expert page or use CLI -- verify FRAME_CLASS was written to FC
- [ ] Continue through a few more steps -- each step's params should be on the FC

### 12.2 Abandon with rollback
- [ ] Start wizard, complete 2-3 steps
- [ ] Click X to abandon
- [ ] Dialog shows "N parameters were written" with three options
- [ ] Click "Undo Changes" -- verify params revert to pre-wizard values
- [ ] Reconnect or check Expert page to confirm rollback

### 12.3 Abandon keep changes
- [ ] Start wizard, complete 2-3 steps, abandon
- [ ] Click "Keep Changes" -- params stay on FC
- [ ] Wizard closes normally

### 12.4 Saving spinner
- [ ] On slow connection or many params, Next button shows "Saving..." with spinner
- [ ] Back/Skip buttons disabled during write

---

## 13. All Steps Skippable + Safety Warnings

### 13.1 Skip every step
- [ ] Start wizard, click Skip on every single step
- [ ] All steps should be skippable (no blocked Next buttons for missing hardware)
- [ ] Arrive at ReviewStep

### 13.2 Safety warnings on Review
- [ ] ReviewStep shows red panel listing every skipped safety-critical step
- [ ] Each warning has specific consequence text (e.g. "Motor direction not verified")
- [ ] Finish button is disabled

### 13.3 Safety acknowledgment
- [ ] Check the "I understand..." checkbox
- [ ] Finish button becomes enabled
- [ ] If no safety steps were skipped, checkbox doesn't appear

---

## 14. Board Detection Dialog

### 14.1 Fresh board
- [ ] Connect unconfigured board
- [ ] Dialog appears with "Start from the beginning" and "Start fresh" options
- [ ] "Continue where I left off" only appears if saved progress exists

### 14.2 Saved progress
- [ ] Start wizard, advance a few steps, close app
- [ ] Reopen, connect same board
- [ ] Dialog shows "Continue where I left off" as top option
- [ ] Click it -- resumes at the correct step

### 14.3 Start fresh
- [ ] Click "Start fresh (factory reset)"
- [ ] Wizard opens and auto-triggers reset flow (backup -> reset -> reboot -> reconnect)
- [ ] After reconnect, wizard is at Frame step with clean params

---

## 15. New Standalone Pages

### 15.1 GPS page
- [ ] Navigate to GPS in sidebar
- [ ] Shows live telemetry (fix, sats, HDOP, lat/lon) when GPS connected
- [ ] "No GPS data" when no GPS
- [ ] Constellation toggles (GPS, SBAS, Galileo, BeiDou, GLONASS)
- [ ] Toggle changes GPS_GNSS_MODE bitmask
- [ ] Serial port and GPS type shown

### 15.2 Control Surfaces page (plane/VTOL only)
- [ ] Navigate to Surfaces in sidebar (only visible for plane/quadplane)
- [ ] 3D viewer shows detected surfaces
- [ ] Live servo bars with microsecond values
- [ ] Reverse button toggles SERVO_REVERSED
- [ ] Move sticks -- 3D surfaces respond

### 15.3 Battery page
- [ ] Navigate to Battery in sidebar
- [ ] Monitor type cards (Disabled, Analog V, Analog V+I, etc.)
- [ ] Cell count picker with auto-threshold calculation
- [ ] Live voltage/current/per-cell display when battery connected
- [ ] Failsafe action cards (None, Land, RTL, SmartRTL)
- [ ] Warning when critical voltage >= low voltage

### 15.4 ESC page
- [ ] Navigate to ESC in sidebar
- [ ] Protocol grid (PWM, OneShot, DShot150/300/600/1200)
- [ ] DShot settings section appears only for DShot protocols
- [ ] Motor direction reversal bitmask toggles per-output
- [ ] Spin thresholds (MOT_SPIN_ARM, MOT_SPIN_MIN) sliders

### 15.5 Transitions page (VTOL only)
- [ ] Navigate to Transitions in sidebar (only visible for quadplane)
- [ ] Forward/back transition params
- [ ] VTOL assist sliders
- [ ] Failure handling cards

---

## 16. Firmware Page Polish

### 16.1 BDShot toggle
- [ ] Select a board that has a BDShot variant
- [ ] BDShot checkbox appears in firmware details
- [ ] Check it -- selectedPlatform switches to BDShot variant
- [ ] Uncheck -- switches back to normal variant
- [ ] BDShot boards NOT shown as separate entries in the board list

### 16.2 Flash error recovery
- [ ] If flash fails, error message includes recovery guidance
- [ ] "Board is safe in bootloader mode, disconnect and reconnect USB"

---

## 17. Confirm Dialogs (No more system popups)

- [ ] CalibrationPage: re-calibrate accel shows styled dialog, not system popup
- [ ] CalibrationPage: reboot FC shows styled danger dialog
- [ ] FrameWizard: switching frames shows styled dialog
- [ ] Layout: leaving frame page with unsaved work shows styled dialog
- [ ] All dialogs: Escape key dismisses, backdrop click dismisses

---

## 18. INAV Import Fixes

### 18.1 Board alignment
- [ ] Import INAV config with non-zero align_board_roll or align_board_pitch
- [ ] Summary shows "Board roll/pitch trim" with decidegree -> radian conversion
- [ ] AHRS_TRIM_X and/or AHRS_TRIM_Y are set on the FC

### 18.2 Auto cell count
- [ ] Import INAV config with bat_cells=0 (auto), battery connected
- [ ] Cell count estimated from voltage (summary shows "estimated from voltage")
- [ ] Import same config without battery
- [ ] Summary shows "defaulted -- verify!" warning, skipped section has explanation
- [ ] Voltage thresholds default to 4S values

### 18.3 OSD layout
- [ ] Import INAV config with OSD elements
- [ ] Summary shows "N elements mapped to screen 1"
- [ ] OSD_TYPE=1 and OSD1_ENABLE=1 are set
- [ ] Param names use OSD1_ prefix (not OSD_)

### 18.4 RC expo/rates
- [ ] Import INAV config with custom rc_expo or roll_rate
- [ ] Skipped section shows "RC expo & rates" with explanation

---

## 19. VTOL Pre-flight Checks

- [ ] Connect quadplane board
- [ ] Navigate to Pre-flight page
- [ ] Run checks -- VTOL section appears
- [ ] Q_ENABLE=0: critical "VTOL mode not enabled"
- [ ] Q_FRAME_CLASS=0: critical "frame class not set"
- [ ] No VTOL motors assigned: critical
- [ ] All assist disabled: warning
- [ ] Q_RTL_MODE=0: info about plane RTL
- [ ] All good: green "VTOL configuration looks good"
