#!/bin/bash
# ArduGUI v1.0.0-rc1 commit script
# Run this from the project root after extracting all tarballs

set -e

echo "=== ArduGUI v1.0.0-rc1 commit ==="
echo ""

# Check we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src/app" ]; then
  echo "ERROR: Run this from the ArduGUI project root."
  exit 1
fi

# Check git status
echo "Current branch:"
git branch --show-current
echo ""

echo "Staged/unstaged changes:"
git status --short | head -30
echo ""

# Stage everything
echo "Staging all changes..."
git add -A

echo ""
echo "Files to be committed:"
git diff --cached --stat | tail -5
echo ""

# Commit
git commit -m "feat: v1.0.0-rc1 -- feature complete, pre-testing

Architecture:
- Write-as-you-go wizard (params written on Next, snapshot rollback)
- All wizard steps skippable with safety warnings + acknowledgment
- Board detection dialog (resume / start fresh / start from beginning)
- Shared motor test hook + composable UI components

New standalone pages:
- GPS (live telemetry, constellation toggles)
- Control Surfaces (3D viewer, live servo bars, reverse)
- Transitions (VTOL: timeout, assist, RTL mode, failure action)
- Battery Monitor (type, calibration, cell count, failsafe thresholds)
- ESC Configuration (protocol, DShot, direction reversal, spin thresholds)
- ConfirmDialog component (replaces all window.confirm)

Wizard improvements:
- RC Calibration step (2-phase, throttle reversal detection)
- Transitions step (VTOL)
- Tilt Servo step with active mode-switch testing
- Fresh board detection prompts wizard
- Motor diagram visual consistency (wizard matches standalone)

INAV import fixes:
- Board alignment (decidegrees -> AHRS_TRIM radians)
- Auto cell count from live voltage when bat_cells=0
- OSD screen prefix fix (OSD1_ not OSD_), auto-enable OSD_TYPE
- RC expo/rates skip with explanatory note

UX polish:
- BDShot firmware toggle (checkbox, variants hidden from list)
- Flash error recovery guidance
- Airplane motor spinning indicator + label overlap fix
- VTOL pre-flight validation (8 checks)

Bug fixes:
- ReceiverStep change guard (one-way state latch)
- FrameStep copter drill-down persistence
- Frame diagram after import (stagedParams in value chain)
- Fresh board detection false positive for quadplane

Known issues needing hardware testing:
- Connected flash path (MAVLink reboot-to-bootloader)
- OSD import param names (code-reviewed, not hardware-verified)
- Custom .apj flash invalid image_size
- Connected flash navigates to connect page

See RELEASE_NOTES_v1rc1.md and TEST_SESSION_20260314.md for details."

echo ""
echo "Commit done. Push with:"
echo "  git push origin $(git branch --show-current)"
