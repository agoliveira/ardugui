# ArduGUI -- TODO / Roadmap

Last updated: March 13, 2026

**Mission:** Make ArduPilot as easy to configure as INAV, or easier. ArduGUI is a
configurator, not a ground station. It takes a user's craft from zero to test flight
-- either from scratch or migrating from INAV. Telemetry, mission planning, and
tuning assistance are out of scope (that's what Mission Planner and QGC are for).

Legend: [x] done, [~] partial, [ ] not started

---

## V1 Scope: Zero to Test Flight

The V1 release covers exactly one flow: user has a board, wants to fly ArduPilot.
Two entry points:

1. **Start Fresh** -- flash firmware, factory reset, wizard, calibrate, fly
2. **Migrate from INAV** -- import config, wizard pre-fills, review, calibrate, fly

Every V1 task must serve one of these paths. If it doesn't help a user get to a
test flight, it's V1.5 or V2.

---

## V1 -- Bugs (Fix Before Release)

- [x] **ReceiverStep change guard** -- fixed: one-way state latch replaces useRef.
- [x] **FrameStep selection not persisted** -- fixed: copter drill-down auto-derived from preset.
- [x] **Frame diagram missing after import** -- fixed: useDetectedPreset reads stagedParams.
- [x] **Auto cell count** -- fixed: mapToArduPilot accepts liveVoltage param, estimates
      cells from battery voltage when bat_cells=0. Flags default with warning.

---

## V1 -- Firmware Flashing (Polish)

Core flashing works. These items make it reliable for real users.

- [x] **BDShot firmware variants** -- BDShot builds hidden from board list, checkbox
      toggle in firmware details panel with explanation.
- [ ] **Test connected flash path** -- verify the MAVLink reboot-to-bootloader path
      works end-to-end when FC is connected in ArduGUI.
- [x] **First-time flash warning** -- blue info box when flashing disconnected, explains
      ArduPilot bootloader requirement and DFU fallback.
- [x] **Flash error recovery guidance** -- contextual help when flash fails mid-program,
      explains board is safe in bootloader mode.

---

## V1 -- Wizard & Calibration

### Wizard (15/15 steps functional)

- [x] Frame selection
- [x] Output Mapping (board-aware, writes to FC immediately)
- [x] Motors & ESC (battery gating, DShot, position labels)
- [x] Control Surfaces (3D viewer, live servo feedback)
- [x] Tilt Servos (quadplane, active mode-switch tilt test)
- [x] Transitions (quadplane, Q_TRANSITION_MS, Q_RTL_MODE, Q_ASSIST)
- [x] Receiver (protocol, port, RC visualization)
- [x] RC Calibration (mandatory, 2-phase, throttle reversal detection)
- [x] GPS (auto-detect, live telemetry, constellation config)
- [x] Compass (coverage ring visualization)
- [x] Accelerometer (6-position with 3D viewer)
- [x] Flight Modes (6-slot, recommended defaults)
- [x] Failsafes (RC/battery/GCS with recommended defaults)
- [x] Initial Tune (prop noise profiles, AutoTune assignment)
- [x] Review & Apply (grouped diff, write to FC, reboot)

### Calibration Gaps

- [x] **RC calibration** -- 2-phase flow in wizard + standalone CalibrationPage
- [~] **Compass calibration** -- functional but clunky UX
  - [ ] 3D sphere visualization (nice-to-have for V1, not blocking)

### INAV Import Gaps

- [x] Board alignment (align_board_roll/pitch decidegrees -> AHRS_TRIM_X/Y radians)
- [~] OSD import -- fixed screen number prefix (OSD1_ not OSD_), added OSD_TYPE=1
      and OSD1_ENABLE=1. Needs hardware verification with actual OSD display.
- [x] RC expo/rates -- skip with explanatory note (no direct equivalent)

---

## V1 -- VTOL Configuration (The Differentiator)

VTOL is where ArduPilot is powerful but configuration is painful. ArduGUI should
make this dramatically easier than Mission Planner.

The wizard handles:
- [x] VTOL frame detection from INAV import
- [x] Tilt servo configuration step with active mode-switch test
- [x] Q_ parameter lifecycle (Q_ENABLE, Q_FRAME_CLASS, Q_M_PWM_TYPE)
- [x] ArduPlane welcome: "Airplane or VTOL?" choice
- [x] Transitions step: Q_TRANSITION_MS, Q_RTL_MODE, Q_ASSIST_SPEED/ALT

Still needed:
- [x] **Standalone Transitions page** -- full version with all params
- [x] **VTOL-specific pre-flight checks** -- paramValidation.ts checkVtol()
- [ ] **VTOL-specific pre-flight: live checks** -- tilt servos responding,
      motor test in both modes (hover + forward flight)

---

## V1 -- UX Polish (Ship Quality)

- [x] **Replace system file dialogs** -- ConfirmDialog component + useConfirm hook,
      all 4 window.confirm calls replaced (CalibrationPage x2, FrameWizard, Layout).
- [x] **Airplane motor spinning indicator** -- PlaneServoOverlay shows pulsing animation.
- [x] **Plane servo/motor label overlap** -- motor labels repositioned to right edge.
- [x] **"What changed" diff** -- ReviewStep shows writtenParams vs initialSnapshot.
- [x] **BDShot firmware toggle** -- checkbox in firmware details, BDShot variants hidden from list.
- [x] **Flash error recovery** -- contextual help when flash fails mid-program.
- [x] **Motor diagram consistency** -- wizard and standalone now match (colored rings, CW/CCW labels).
- [x] **GPS standalone page** -- live telemetry, constellation toggles.
- [x] **Control Surfaces standalone page** -- 3D viewer, servo bars, reverse buttons.
- [x] **Write-as-you-go wizard** -- params written on Next, snapshot rollback on abandon.
- [x] **All steps skippable** -- safety warnings on ReviewStep with acknowledgment checkbox.
- [x] **Board detection dialog** -- resume / start fresh / start from beginning.

---

## V1 -- Infrastructure

- [x] MAVFTP parameter download (~300ms)
- [x] Firmware flashing (manifest, APJ zlib, bootloader protocol, scan-all-ports)
- [x] Factory reset before wizard (backup -> reset -> reboot -> reconnect)
- [x] Serial port auto-detection (1.5s polling, auto-select)
- [x] Electron IPC net:fetch
- [x] Parameter backup/restore (SQLite, multi-aircraft, diff, export)
- [x] 414-board database from ArduPilot hwdef
- [x] 174-board INAV timer-to-pad mapping
- [x] Pre-flight readiness dashboard
- [x] Wiring guide page
- [x] Parameter validation engine
- [x] Flight mode switching (MAV_CMD_DO_SET_MODE, flightMode in vehicleStore)

---

## V1.5 -- Post-First-Flight (After V1 Release)

These help users after their test flight, not before.

- [x] **Initial Tune wizard step** -- prop noise profiles, filter suggestions,
      AutoTune preparation. Already implemented (456 lines).
- [ ] **Post-flight tuning guide** -- notch filter setup from .bin log analysis,
      per-axis autotune sequence, magfit calibration
- [ ] **Vehicle profile persistence** -- component metadata (motor KV, prop size,
      frame weight, ESC type, battery specs) alongside backups
- [ ] **Notch filter webtool integration** -- parse .bin logs, suggest INS_HNTCH_ params
- [x] **Battery monitor setup page** -- voltage divider cal, current sensor, cell count,
      failsafe actions, live telemetry. BatteryPage.tsx fully wired.
- [x] **ESC configuration page** -- protocol selection, BLHeli passthrough,
      DShot direction reversal bitmask, spin thresholds. EscPage.tsx fully wired.
- [ ] **Change reason tracking** -- tag each param with why it was set
- [ ] **IMU temperature calibration** -- reduces "accel inconsistent" arm errors

---

## V2 -- Future

- [ ] TCP/UDP connections (SITL, MAVProxy)
- [ ] WiFi / Bluetooth connections
- [ ] Demo mode (for screenshots, README, trade shows)
- [ ] Light theme
- [ ] Localization / i18n
- [ ] App icon redesign
- [ ] Compass 3D sphere visualization
- [ ] GPS page with live map
- [ ] Magnetometer alignment page
- [ ] Arming checks bitmask editor
- [ ] OSD profile save/load and bundled presets
- [ ] Export/import .param file sequences (MC compatibility)
- [ ] Board diagram images (per-board SVG showing physical layout)
- [ ] Migrate boardRegistry.ts to boardData.ts
- [ ] INAV cross-reference scraper for pad label verification
- [ ] H-frame icon, Y6 icon, motor overlay CW/CCW arc fixes

---

## Design Principles

1. **Zero to test flight.** Every feature serves the path from unboxing to flying.
2. **Guided, not exhaustive.** Curated workflows, not flat parameter dumps.
3. **Safe by default.** Validate everything, warn about dangerous settings.
4. **Import is source of truth.** When user provides a config, trust it over defaults.
5. **VTOL made easy.** This is the differentiator. QuadPlane config should be painless.
6. **Outdoor first.** High contrast, readability, utilitarian design. No decorative elements.
7. **Surface errors in UI.** No DevTools access -- never rely on console.log.
8. **No em dashes.** Use " -- " or rewrite the sentence.
9. **Debate before coding.** Discuss tradeoffs BEFORE writing any code.
