#!/bin/bash
# ArduGUI v1.0.0-rc1 -- commit and tag script
# Run from the project root after extracting all tarballs.

set -e

echo "==========================================="
echo "  ArduGUI v1.0.0-rc1 -- Commit & Tag"
echo "==========================================="
echo ""

# Sanity check
if [ ! -f "package.json" ] || [ ! -d "src/app" ]; then
  echo "ERROR: Run this from the ArduGUI project root."
  exit 1
fi

# Verify version was bumped
VERSION=$(grep '"version"' package.json | head -1 | grep -oP '[\d.]+[-\w]*')
echo "package.json version: $VERSION"
if [ "$VERSION" != "1.0.0-rc1" ]; then
  echo "WARNING: Expected version 1.0.0-rc1, got $VERSION"
  echo "Continue? (y/n)"
  read -r ans
  if [ "$ans" != "y" ]; then exit 1; fi
fi

echo ""
echo "Current branch: $(git branch --show-current)"
echo ""

# Show what changed
echo "=== Changes summary ==="
git status --short | wc -l
echo "files changed"
echo ""
git status --short | head -40
if [ "$(git status --short | wc -l)" -gt 40 ]; then
  echo "... and $(( $(git status --short | wc -l) - 40 )) more"
fi
echo ""

echo "Review the changes above. Continue with commit? (y/n)"
read -r ans
if [ "$ans" != "y" ]; then
  echo "Aborted."
  exit 0
fi

# Stage everything
echo ""
echo "Staging all changes..."
git add -A

# Commit
git commit -m "feat: v1.0.0-rc1 -- feature complete, pre-testing

BREAKING: Wizard architecture changed to write-as-you-go model.
Params are written to FC on each Next click instead of batched at Review.
Initial FC state captured at wizard start for rollback on abandon.

New standalone pages:
- GPS (telemetry, constellation toggles)
- Control Surfaces (3D viewer, servo bars, reverse -- plane/VTOL)
- Transitions (VTOL: timeout, assist, RTL, failure action)
- Battery Monitor (type, calibration, cell count, failsafe thresholds)
- ESC Configuration (protocol, DShot, direction reversal, spin thresholds)

Wizard changes:
- All steps skippable (safety warnings + acknowledgment at Review)
- Board detection dialog (resume / start fresh / start from beginning)
- RC Calibration step, Transitions step, enhanced Tilt Servo step
- Motor diagram visual consistency across wizard and standalone
- Shared useMotorTest hook + composable UI components

INAV import:
- Board alignment (decidegrees to AHRS_TRIM radians)
- Auto cell count from live voltage when bat_cells=0
- OSD screen prefix fix (OSD1_ not OSD_), auto-enable OSD_TYPE
- RC expo/rates skip with explanatory note

UX polish:
- ConfirmDialog component replaces all window.confirm()
- BDShot firmware toggle, flash error recovery guidance
- Airplane motor spinning indicator, label overlap fix
- VTOL pre-flight validation (8 checks)
- Updated README, CI (macOS added), user manual

Bug fixes:
- ReceiverStep change guard, FrameStep persistence
- Frame diagram after import, fresh board detection for quadplane

Known issues (need hardware testing):
- Connected flash path, OSD import verification
- Custom .apj image_size validation order

Full details: RELEASE_NOTES_v1rc1.md
Test script: TEST_SESSION_20260314.md (420 lines, 19 sections)"

echo ""
echo "Commit created. Creating tag..."

# Tag
git tag -a v1.0.0-rc1 -m "v1.0.0-rc1 -- Feature complete release candidate

Feature complete. All sidebar pages implemented. Setup wizard covers
full zero-to-first-flight flow for copters, planes, and VTOL. INAV
migration handles ~90% of configuration automatically.

Needs hardware testing before public release.
See RELEASE_NOTES_v1rc1.md for full changelog."

echo ""
echo "==========================================="
echo "  Done! Commit and tag created."
echo "==========================================="
echo ""
echo "Push with:"
echo "  git push origin $(git branch --show-current)"
echo "  git push origin v1.0.0-rc1"
echo ""
echo "This will trigger the CI build for all platforms."
echo "The tag push creates a draft GitHub Release."
echo ""
echo "After CI passes, go to GitHub Releases to:"
echo "  1. Edit the draft release"
echo "  2. Paste the content from RELEASE_NOTES_v1rc1.md"
echo "  3. Attach the user manual (ArduGUI_User_Manual_v1.docx)"
echo "  4. Mark as pre-release"
echo "  5. Publish"
