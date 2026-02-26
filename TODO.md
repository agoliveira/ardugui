# ArduGUI -- TODO / Roadmap

Last updated: February 2026

This is the working roadmap for ArduGUI. The overarching goal is **feature completeness
before the Setup Wizard**, because the wizard is a pipeline that links every page together
into a single "zero to flyable" flow. Every page it touches needs to exist and work first.

---

## Legend

- **[ ]** Not started
- **[~]** In progress / partially done
- **[x]** Complete (or good enough for now)

---

## V1 -- Pre-Wizard: Feature Completeness

These are the building blocks the wizard will chain together. Each should be
a standalone, usable page before the wizard references it.

### Calibration

- [x] Accelerometer 6-position calibration with 3D model viewer
- [x] Level trim (separate one-click card)
- [~] Compass calibration -- works but clunky
  - [ ] 3D sphere visualization using existing GLB models
  - [ ] Color-code visited orientations (green = covered, gray = missing)
  - [ ] Show which areas still need rotation before completion
  - [ ] Progress percentage based on sphere coverage
- [ ] RC calibration (stick endpoints + trim)
  - [ ] "Move all sticks to extremes" flow (INAV-style)
  - [ ] Min/max/trim auto-capture per channel
  - [ ] Visual stick position indicator during calibration
  - [ ] Channel mapping / reorder support

### Configuration Pages

- [x] Frame Wizard -- airframe selection, servo mapping, output assignment
- [x] Motor test with safety interlocks
- [x] Motor diagram -- frame-specific SVG with correct numbering/rotation
- [x] Ports page -- serial protocol assignment with board-aware labels
- [x] Flight Modes -- INAV-style range sliders with RC binding
- [x] Receiver page -- RC input visualization
- [~] Configuration page -- grouped parameter editing (needs more groups)
- [~] PID Tuning -- parameter editing works, no graphing
- [~] Failsafes -- skeleton, needs full implementation
- [~] Navigation -- geofence/RTL skeleton
- [ ] Battery monitor setup
  - [ ] Voltage divider calibration with live voltage readout
  - [ ] Current sensor scaling with live current readout
  - [ ] Cell count detection / manual entry
  - [ ] Capacity (mAh) setting
  - [ ] Low voltage / critical voltage thresholds (ties into failsafes)
- [ ] Motor protocol selection
  - [ ] DShot150 / DShot300 / DShot600 / PWM / OneShot125 selection
  - [ ] Visual explanation of which protocol to use when
  - [ ] Warning when changing protocol on already-configured ESCs
- [ ] ESC configuration area
  - [ ] ArduPilot-side ESC parameters grouped (MOT_PWM_MIN, MOT_PWM_MAX,
    MOT_SPIN_ARM, MOT_SPIN_MIN, MOT_THST_EXPO)
  - [ ] Motor output range visualization
  - [ ] DShot direction reversal commands (if DShot selected)
  - [ ] (V2 stretch) BLHeli passthrough
- [ ] GPS page with map
  - [ ] Live position on map (Leaflet or MapLibre)
  - [ ] Satellite count, HDOP, fix type display
  - [ ] GPS protocol and baud rate configuration
  - [ ] GPS update rate setting
  - [ ] Dual-GPS support for boards with two GPS ports
- [ ] Magnetometer alignment page (INAV Configurator style)
  - [ ] Visual compass rose with live heading
  - [ ] Orientation selection (CW0, CW90, CW180, CW270, etc.)
  - [ ] Auto-detect orientation option
  - [ ] External vs internal compass selection
  - [ ] Declination setting (auto from GPS or manual)
- [ ] Arming checks configuration
  - [ ] ARMING_CHECK bitmask editor with checkboxes
  - [ ] Live pre-arm status display (parse STATUSTEXT for PreArm messages)
  - [ ] Color-coded pass/fail per check category
  - [ ] Warnings when disabling safety-critical checks
- [ ] Initial tune / filter parameters
  - [ ] INS_GYRO_FILTER, INS_ACCEL_FILTER
  - [ ] ATC_RAT_*_FILT (rate controller filters)
  - [ ] MOT_SPIN_ARM, MOT_SPIN_MIN, MOT_THST_EXPO
  - [ ] Suggested values based on frame size (prop size -> filter freq)

### OSD

- [~] OSD editor -- canvas drag-and-drop works
- [ ] Save / load user OSD profiles
  - [ ] Export to .osd.json file
  - [ ] Import from .osd.json file
  - [ ] Bundled presets (already partially done)
  - [ ] Apply same OSD layout across multiple aircraft

### Parameter Management

- [x] Full parameter search, filter, edit (CLI page)
- [x] Dirty tracking with write-back to FC
- [x] Save dialog with review
- [x] Parameter backup / restore (SQLite-backed)
  - [x] Save full parameter set as snapshot (manual + auto on connect)
  - [x] SQLite storage with aircraft / snapshot / param tables
  - [x] Browse snapshot history per aircraft
  - [x] Diff any snapshot against current FC parameters
  - [x] Selective restore (checkbox per param, loads as dirty changes)
  - [x] Export snapshot to .param file (Mission Planner compatible)
  - [x] Import .param file as snapshot with diff view
  - [x] Auto-backup on connect (ask user first time, remember preference)
  - [x] Rename / delete snapshots
  - [x] Multi-aircraft support (each FC gets its own history)

### Pre-arm / Status

- [ ] Pre-arm check display (prominent, not buried in debug console)
  - [ ] Card on Setup page showing all pre-arm failures
  - [ ] Parse STATUSTEXT "PreArm:" messages in real-time
  - [ ] Link each failure to the relevant configuration page
  - [ ] Green all-clear indicator when ready to arm

---

## V1 -- The Setup Wizard

The killer feature. Only start this once the pages above are solid.

The wizard asks questions and configures the aircraft step by step:

1. **Aircraft type** -- Copter / Plane / VTOL (auto-detected if already connected)
2. **Frame selection** -- links to Frame Wizard (already built)
3. **Motor protocol** -- DShot / PWM / OneShot (links to Motor Protocol page)
4. **ESC configuration** -- spin-arm, spin-min, output range
5. **Receiver setup** -- protocol, channel mapping, RC calibration
6. **Flight modes** -- links to Modes page with sensible defaults
7. **GPS configuration** -- protocol, baud, update rate
8. **Compass calibration** -- 3D sphere visualization
9. **Accelerometer calibration** -- 3D model viewer (already built)
10. **Battery monitor** -- voltage/current calibration
11. **Failsafes** -- battery, RC loss, GCS loss with recommended defaults
12. **Initial tune** -- suggest PID values based on frame size / prop size / weight
13. **Pre-flight check** -- run through all pre-arm checks, show pass/fail
14. **Summary** -- review all settings, save to FC, suggest parameter backup

Design principles:
- Each step can be skipped ("I'll do this later")
- Each step links to the full page for advanced configuration
- Progress is saved -- can resume where you left off
- Suggested defaults for everything, expert overrides available
- Plain language throughout -- "How big are your propellers?" not "Set MOT_THST_EXPO"

---

## V1 -- Pre-Release Polish

### Visual Identity Refresh
- [x] Study ArduDeck's visual language, identify where ArduGUI overlaps
- [x] Redesign areas that feel too similar (sidebar, cards, headers, spacing)
- [x] Chose "Forge" identity: warm charcoal backgrounds + marigold accent (#ffaa2a)
- [x] Distinct from ArduDeck (navy+amber), Betaflight (gray+yellow), INAV (light+green)
- [x] WCAG AA contrast ratios verified for outdoor/older-user readability
- [x] Utilitarian interface: flat buttons, 3-4px radii, no gradients/shadows
- [x] Compact header (40px), slim footer (28px), narrow sidebar (160px)
- [x] VS Code-style left-border active indicator in sidebar
- [x] Updated all hardcoded colors across components (SVGs, Three.js, Tailwind classes)
- [x] Reworked airframe icons: thin line-art copters, motor-count scaling, slim planes
- [x] Fixed H-frame motor positions (was identical to X, now wider horizontal arms)
- [ ] App icon redesign to match marigold identity (currently uses Electron default)

### Demo Mode (INAV-style)
- [ ] "Demo" button on the Connect page (like INAV Configurator)
- [ ] Embedded realistic parameter set (export from real aircraft via backup system)
- [ ] Fake connection handler that populates stores and sets status to 'connected'
- [ ] All pages browsable with static but realistic data
- [ ] Writes go to dirty params as usual but never flush to hardware
- [ ] Telemetry values static (no live RC, attitude, etc.)
- [ ] Clear "DEMO MODE" indicator in header/footer so user knows it's not real
- [ ] Useful for: README screenshots, GitHub visitors, trying the UI without hardware

---

## V2 -- Post-Wizard Enhancements

Features that are valuable but not required for the core "zero to flyable" flow.

### Firmware Flashing
- [ ] Board detection via USB VID/PID and bootloader
- [ ] Download firmware from firmware.ardupilot.org
- [ ] Flash ArduCopter / ArduPlane / ArduRover
- [ ] Firmware version selection (stable / beta / dev)
- [ ] Progress tracking during flash
- [ ] Requires internet connection -- clear messaging about this
- [ ] (Complex: DFU mode, STM32 bootloader protocols, board-specific quirks)

### Connectivity
- [ ] TCP connection (for SITL -- useful for dev/testing)
- [ ] UDP connection (for MAVProxy / telemetry bridges)
- [ ] WiFi connections to telemetry-equipped FCs
- [ ] Bluetooth serial (some FCs support this)
- [ ] Multi-vehicle support (probably never, but noting it)

### Telemetry & Monitoring
- [ ] Real-time telemetry dashboard (attitude, altitude, speed)
- [ ] PID tuning with live graphing (oscillation detection)
- [ ] Blackbox / dataflash log viewer
- [ ] In-flight HUD overlay

### UI / Polish
- [ ] Light theme (after iconography and design are finalized)
- [ ] App icon (needed for proper packaging -- currently uses Electron default)
- [ ] Screenshot gallery for README
- [ ] Localization / i18n (probably V3)

### Mission Planning
- [ ] Waypoint editor with map
- [ ] Rally points
- [ ] Geofence drawing
- [ ] (ArduDeck and QGC already do this well -- low priority for ArduGUI)

---

## Bug Fixes / Known Issues

Track these separately. File as GitHub Issues when found.

- [ ] Frame "Active" badge needs testing across all preset types
- [ ] Compass calibration UX is clunky (covered above in 3D sphere plan)
- [ ] Some board definitions may have incorrect port labels
- [ ] QuadPlane transitions page is a placeholder
- [ ] Backups page UI polish
  - [ ] Confirm before deleting snapshots
  - [ ] Better empty state when no aircraft history yet
  - [ ] Show snapshot count badge on sidebar Backups icon
  - [ ] Handle DB errors gracefully in UI (toast or inline message)
- [ ] Frame page wiring diagram improvements
  - [ ] Use correct plane silhouette per frame type (currently shows conventional for all)
  - [ ] Better label positioning to avoid overlapping dots and text
  - [ ] Show tail surface labels closer to tail area, not overlapping fuselage
  - [ ] Scale diagram to accommodate different frame complexities

---

## Design Principles (for all features)

1. **Guided, not exhaustive.** Curated workflows, not flat parameter dumps.
2. **Safe by default.** Validate everything, warn about dangerous settings.
3. **Verify externally.** Always remind users to check in Mission Planner.
4. **One icon set.** AirframeIcons shapes everywhere -- consistency matters.
5. **Effective values.** Always read dirtyParams first, then FC params.
6. **No em dashes.** Use " -- " or rewrite the sentence.
