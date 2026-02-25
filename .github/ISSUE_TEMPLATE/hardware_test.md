---
name: Hardware Test Report
about: Report results from testing ArduGUI with real hardware
title: "[Test] Board: ... | Firmware: ..."
labels: testing, hardware
assignees: ''
---

## Hardware Under Test

- **Board:** (e.g., Matek H743-Wing v3)
- **Firmware:** (e.g., ArduCopter 4.5.7)
- **Vehicle type:** (Copter / Plane / QuadPlane)
- **Frame:** (e.g., Quad X 5-inch, conventional plane)
- **ArduGUI version:** (e.g., 0.1.0 or commit hash)
- **OS:** (e.g., Ubuntu 24.04)

## Connection

- [ ] Board detected correctly
- [ ] Board name/image displayed correctly
- [ ] All parameters downloaded successfully
- [ ] Parameter count matches Mission Planner

## Pages Tested

Check each page you tested and note any issues:

- [ ] **Setup** -- Board diagram, sensor info
- [ ] **Ports** -- Serial port labels match physical board
- [ ] **Configuration** -- Parameter groups load correctly
- [ ] **Receiver** -- RC channels display correctly
- [ ] **Modes** -- Flight mode assignment works
- [ ] **Frame Wizard** -- Correct frame detected, servo mapping applies
- [ ] **Motors** -- Diagram matches frame, motor test works
- [ ] **Calibration** -- Accelerometer calibration completes
- [ ] **PID Tuning** -- Parameters display and save
- [ ] **OSD** -- Elements display correctly
- [ ] **CLI** -- Parameter search and edit works
- [ ] **Save to FC** -- Parameters written and verified

## Issues Found

List any problems encountered, with as much detail as possible.

## Parameters Verified

Did you cross-check ArduGUI's parameter values against Mission Planner?

- [ ] Yes -- all matched
- [ ] Yes -- found discrepancies (describe below)
- [ ] No

## Overall Assessment

How usable was ArduGUI for configuring this hardware? Any general impressions.
