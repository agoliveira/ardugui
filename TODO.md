# ArduGUI -- TODO / Roadmap

Last updated: March 20, 2026 (RC2)

Legend: [x] done, [~] partial, [ ] not started

---

## V1 Scope: Zero to Test Flight

Two entry points:
1. **Start Fresh** -- connect, wizard, calibrate, fly
2. **Migrate from INAV** -- detect INAV, extract config, flash ArduPilot, import config, wizard, fly

---

## V1 -- Bugs (Fix Before Release)

- [x] ReceiverStep change guard (one-way state latch)
- [x] FrameStep selection persistence (copter drill-down auto-derived)
- [x] Frame diagram missing after import (useDetectedPreset reads stagedParams)
- [x] Auto cell count from battery voltage
- [x] Serial port drain crash on disconnect (null guard)
- [x] Concurrent connect race condition (connecting guard)
- [x] **Firmware flash 1.4**: custom .apj "invalid image_size" -- parseApj now validates after decompression
- [x] **INAV migration stale vehicleType** -- hex URL uses local variable instead of stale closure
- [ ] **Firmware flash 1.5**: connected flash path navigates to connect page (pendingPage -- needs hardware verification)
- [ ] **Connection instability**: occasional "no heartbeat" after reboot. Guards added but may need deeper investigation.

---

## V1 -- Features (Complete)

- [x] Setup Wizard (14 steps, write-as-you-go)
- [x] All standalone pages (20+ pages)
- [x] INAV import (174-board timer mapping, full dump parser)
- [x] INAV migration flow (detect, CLI dump, board mapping, flash guide, auto-import)
- [x] Firmware flashing (manifest, APJ, bootloader protocol, BDShot toggle)
- [x] Help system (3-tier: tooltip, overlay, wiki link)
- [x] Aircraft naming (integrated in wizard prompt, click-to-rename in header)
- [x] Motor diagram (unified CopterMotorDiagram, coaxial support)
- [x] RC calibration merged into Receiver step
- [x] Demo mode (intercepted connections, fake telemetry)
- [x] Light/dark theme
- [x] UI zoom (60-200%, Electron webFrame)
- [x] Window bounds persistence
- [x] Auto-backup on connect (SQLite)
- [x] Factory reset before wizard
- [x] Close window guard
- [x] GitHub CI (Linux + Windows + macOS)

---

## V1.5 -- Post-Release Polish

- [x] **Fleet view (Phase 2)**: "My Aircraft" page replacing Backups -- card grid, click for snapshots. Includes archive/unarchive, notes, metadata persistence.
- [ ] **Per-control HelpTip wiring**: component exists, only page-level bars active
- [ ] **ESC calibration for PWM**: throttle range cal
- [ ] **Servo endpoint calibration**: SERVO_MIN/MAX/TRIM workflow
- [ ] **Compass priority ordering**
- [ ] **GPS constellation toggles** on expert page (wizard sets 31)
- [ ] **Plane servo/motor label positioning** (labels overlap airframe icon)
- [ ] **Replace system file dialogs** with in-app Forge v6 dialogs
- [ ] **BDShot UI overhaul** -- toggle instead of separate list entry, manifest timestamp
- [ ] **Tooltip on disabled wizard sidebar button**

---

## V2 -- Future

- [ ] DFU automation on Linux (dfu-util integration)
- [ ] Localization / i18n
- [ ] Community board database contributions
- [ ] Telemetry logging (not live dashboard -- just recording for post-flight)
