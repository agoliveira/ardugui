# ArduGUI -- Handover Document

Last updated: March 20, 2026

---

## What Is ArduGUI

An Electron + React + TypeScript + Tailwind desktop application for configuring ArduPilot flight controllers. It is a **configurator only, NOT a ground station** -- no telemetry dashboards, mission planning, or PID tuning. Those belong to Mission Planner and QGroundControl.

The mission: take a user's aircraft from zero to test flight via two paths -- fresh setup or migration from INAV. VTOL configuration is the key differentiator (ArduPilot's VTOL capability is powerful but painful to configure).

Repository: https://github.com/agoliveira/ardugui (public, v1.0.0-rc2 tagged)

---

## How to Build, Run, and Test

### Prerequisites

- Node.js 22 (required by Electron 36)
- npm (comes with Node)
- Linux: `sudo apt install build-essential libudev-dev` (for serialport native module)
- macOS: Xcode Command Line Tools
- Windows: Visual Studio Build Tools (for serialport native module)

### First-time setup

```bash
git clone https://github.com/agoliveira/ardugui.git
cd ardugui
npm install
```

If `npm install` fails on the Electron binary download (common in CI or constrained environments):

```bash
npm install --ignore-scripts
```

This skips native module compilation but still installs all JS dependencies. Sufficient for type-checking.

### Development

```bash
npm run dev          # Start Vite dev server + Electron (hot reload)
```

The app opens automatically. Vite serves the renderer at localhost:5173, Electron loads it.

### Type checking (MUST pass before delivering any code)

```bash
npx tsc --noEmit     # Must report ZERO errors
```

The project uses `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`. Every unused import, variable, or type fails. This is the single most important validation step.

### Building for distribution

```bash
npm run build:electron   # Builds renderer + packages with electron-builder
```

Produces platform-specific packages in `release/` directory.

### Key scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Development with hot reload |
| `npm run typecheck` | TypeScript validation (zero errors required) |
| `npm run build` | Build renderer only (tsc + vite) |
| `npm run build:electron` | Full packaged build |
| `npm run preview` | Preview production build locally |

### CI

GitHub Actions (`.github/workflows/build.yml`): runs typecheck, then builds for Linux, Windows, and macOS. Triggered on push to main and tags.

### Debugging

**CRITICAL: No DevTools console access in the packaged app.** `console.log()` output is invisible to the user. All errors and status MUST surface in the UI. Never rely on console for debugging feedback.

In development mode (`npm run dev`), DevTools can be opened with Ctrl+Shift+I.

---

## Architecture Overview

```
Electron Main Process (electron/main.ts)
  - Serial port access (node-serialport)
  - SQLite database (parameter backups, aircraft registry)
  - File system (export/import .param files)
  - Window management (bounds persistence, close guard)
  - IPC bridge to renderer

Electron Renderer Process (React app in src/)
  - All UI (React 18 + Tailwind)
  - MAVLink parsing (connection.ts runs in renderer)
  - Zustand stores (state management, no Redux)
  - Wizard logic
  - Three.js for 3D viewers (calibration, control surfaces)
```

### Key directories

```
src/
  app/              Layout, Header, Footer, Sidebar (shell)
  components/       Shared UI: motor diagrams, calibration, help, dialogs
  firmware/         Firmware manifest, downloader, bootloader, flasher
  hooks/            Custom React hooks
  mavlink/          MAVLink parser, connection manager, INAV CLI
  models/           Data: frame templates, board registry, INAV mappings,
                    help text, flight modes, failsafes, OSD, validation
  pages/            All page components (one folder per page)
  store/            Zustand stores (connection, vehicle, params, telemetry, etc.)
  styles/           Forge v6 theme CSS
  utils/            Auto-backup, helpers

electron/
  main.ts           Electron main process
  preload.ts        Context bridge (serial, fs, db, zoom APIs)
  serial/           Serial port manager + IPC bridge
  db/               SQLite database + IPC bridge
```

### State management

All state lives in Zustand stores (src/store/):

| Store | Purpose |
|---|---|
| connectionStore | Connection status, port info, param load progress |
| vehicleStore | Vehicle type, firmware, board ID, armed, aircraft name |
| parameterStore | All FC parameters, dirty tracking |
| telemetryStore | Live telemetry (battery, GPS, RC channels, RSSI) |
| calibrationStore | Calibration progress and state |
| wizardStore | Wizard steps, staged params, completion tracking |
| themeStore | Dark/light theme toggle |
| zoomStore | UI zoom factor (60-200%) |
| demoStore | Demo mode (fake data, intercepted connections) |
| debugStore | Debug console toggle |

### Visual identity: "Forge v6"

- Warm charcoal backgrounds (#0c0b0a, #13120f, #1a1816, #201e1a)
- Marigold accent (#ffaa2a, hover #e89520)
- Warm white/gray text (#f5f0eb, #a69a90, #7a736c)
- Base font: 18px. Compact layout: header 40px, footer 36px, sidebar 160px
- Light theme available (toggle in header)
- Zoom control in header (Ctrl+Plus/Minus/Zero)

---

## Feature Status

### Complete and Working

- **Setup Wizard** (14 steps): Frame, Output Mapping, Motors & ESC, Control Surfaces, Tilt Servos, Transitions, Receiver (with inline RC calibration), GPS, Compass, Accelerometer, Flight Modes, Failsafes, Initial Tune, Review
- **Standalone pages**: Connect, Motors, Receiver, GPS, Battery, ESC, Control Surfaces, Transitions, Calibration, Flight Modes, Failsafes, Pre-flight, Firmware, Wiring, Backups, Ports, Configuration, CLI, Expert
- **INAV import**: 174-board timer-to-pad mapping, full "dump all" parser, channel map, OSD, GPS constellations, compass orientation, VTOL detection
- **INAV migration flow**: USB detection, CLI config extraction, board-to-ArduPilot mapping (80+ boards), firmware download, flash instructions (INAV Configurator primary, dfu-util alternative), auto-import after flash
- **Firmware flashing**: Manifest download, APJ flash via MAVLink bootloader, BDShot toggle
- **Help system**: 3-tier (tooltip, overlay explanation, wiki link), 70+ param entries, 14 wizard step entries, 12 page entries
- **Motor diagram**: Unified CopterMotorDiagram shared by wizard and standalone page, coaxial support
- **Aircraft naming**: Prompted on first connect (integrated in wizard dialog), click-to-rename in header, persisted to SQLite
- **Demo mode**: Fake telemetry, intercepted serial calls, activatable from header
- **Light/dark theme**, **UI zoom** (60-200%), **window bounds persistence**
- **Auto-backup** on connect (SQLite snapshots), manual snapshots, diff viewer, selective restore
- **Fleet view** ("My Aircraft"): card grid of all aircraft, archive/unarchive, notes, drill-down to snapshots
- **Factory reset** before wizard with auto-backup
- **Close window guard** (warns for unsaved params, active wizard, or connected FC)

### Known Bugs

- **Firmware flash 1.5**: connected flash path navigates to connect page (pendingPage not working) -- code reviewed, looks correct, needs hardware verification
- **Connection instability**: occasional "no heartbeat" after reboot cycles. Guards added (concurrent connect prevention, drain null-check, USB polling) but may need deeper investigation
- **INAV CLI extraction**: untested on real INAV hardware -- needs live testing with an actual INAV board

### Planned but Not Built

- **DFU automation on Linux**: dfu-util integration for fully automated INAV migration. Discussed, deferred to post-V1.
- **ESC calibration for PWM**: throttle range calibration for non-DShot ESCs
- **Servo endpoint calibration**: guided SERVO_MIN/MAX/TRIM workflow
- **Per-control HelpTip wiring**: HelpTip component exists but only page-level help bars are wired in. Individual parameter tooltips need wiring.
- **Localization**: i18n infrastructure for community translations
- **Compass priority ordering**: moved to V1.5

---

## Hardware Test Fleet

- Pixhawk 2.4.8
- Matek F405-Wing
- Matek F405-VTOL
- Matek F405-TE (Xiake VTOL quadplane -- primary VTOL test aircraft)

---

## Working Conventions

These are Adilson's explicit preferences for how AI assistants should work with him:

- **Debate before coding.** Always discuss tradeoffs, challenge assumptions, and give opinions before any implementation. Never start coding until Adilson explicitly says to.
- **Challenge Adilson's judgment.** He wants to be questioned. Ask before acting on anything uncertain.
- **Deliver as tarball** with root-relative paths so files can be extracted directly into the project root. Prefix packages with "ardugui-" for identification.
- **Always run `npx tsc --noEmit`** before delivering code. Zero errors required.
- **UI-first feedback.** No reliance on console output. All errors and status must be visible in the app.
- **Utilitarian design.** No decorative elements, high contrast, readable outdoors.
- **Never use em dashes.** Use " -- " (space-dash-dash-space) or rewrite the sentence.
- **Never use the unicode em dash character** anywhere.
- **ArduGUI scope is firm.** When a feature feels like GCS territory (telemetry dashboards, mission planning, PID tuning), cut it.

---

## Session History

| Date | Focus |
|---|---|
| March 13 | Bug fixes, RC calibration, VTOL transitions, tilt servo testing, fresh board detection |
| March 14 | Write-as-you-go wizard, standalone pages (GPS, Surfaces, Transitions), VTOL validation, BDShot, motor diagrams |
| March 15 | V1 feature completion (Battery, ESC, ConfirmDialog), CI fixes (6 rounds of TypeScript), GitHub release prep, README, user manual, light theme, demo mode |
| March 20 | Help system, zoom control, motor diagram unification, aircraft naming, INAV migration flow, connection stability, RC cal merge, window bounds persistence |
| March 20 (RC2) | Fleet view ("My Aircraft"), custom APJ flash fix, INAV migration stale vehicleType fix, release prep |

Transcripts of all sessions are stored in `/mnt/transcripts/` (read incrementally, they are large).

---

## What's Next (Priority Order)

1. **INAV migration live test** -- The CLI extraction flow (inavCli.ts) is untested on real INAV hardware. Adilson has INAV boards. This is the highest-priority test.

2. **Connection stability** -- Still seeing occasional "no heartbeat" and multiple "Serial port opened" logs after reboots. Guards were added (concurrent connect, drain null-check, USB polling) but the root cause may be deeper. Needs investigation with serial port logging.

3. **Connected flash pendingPage** -- Code reviewed and logic looks correct, but reported as buggy. Needs hardware verification. If it still fails, add logging around Layout disconnect handler timing.

4. **Per-control HelpTip wiring** -- The `HelpTip` component exists and works, but only page-level help bars (`PageHelp`, `StepHelp`) are wired in. Individual parameter controls on standalone pages don't have (?) icons yet. The help data files already have entries for most parameters.

---

## How to Create the Handover Package for the Next Session

At the end of each session, create a self-contained tarball that the next chat can use to continue. The package must include updated docs + full source. Here's the exact procedure:

### 1. Update the three docs

- **HANDOVER.md**: Update "Last updated" date. Add a section for what was built this session. Update "Known Open Issues", "Feature Status", "What's Next", and "Session History". The handover must be self-contained -- a new session with zero context reads this first.
- **TODO.md**: Update checklist status. Move completed items to [x]. Add any new bugs or planned features discovered during the session.
- **ARCHITECTURE.md**: Update if any new directories, stores, components, or patterns were added. Keep the directory structure listing current.

### 2. Verify the code compiles

```bash
cd /path/to/ardugui
npx tsc --noEmit
```

Must report zero errors. Do not package if there are TypeScript errors.

### 3. Create the tarball

```bash
cd /path/to/ardugui
tar czf /mnt/user-data/outputs/ardugui-full-source-YYYY-MM-DD.tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=dist-electron \
  --exclude=release \
  --exclude=.git \
  --exclude='*.bak' \
  --exclude='*.map' \
  .
```

### 4. Verify the package

```bash
# Check size (should be ~800KB-1MB)
du -h /mnt/user-data/outputs/ardugui-full-source-YYYY-MM-DD.tar.gz

# Check file count (should be ~220+)
tar tzf /mnt/user-data/outputs/ardugui-full-source-YYYY-MM-DD.tar.gz | wc -l

# Verify key files are present
tar tzf /mnt/user-data/outputs/ardugui-full-source-YYYY-MM-DD.tar.gz | grep -E "HANDOVER|TODO|ARCHITECTURE|package.json|tsconfig"

# Verify doc dates are current
tar xzf /mnt/user-data/outputs/ardugui-full-source-YYYY-MM-DD.tar.gz -O ./HANDOVER.md | head -3
```

### 5. Update memory edits

Use the `memory_user_edits` tool to update the session summary entry with what was done and what's next. Keep it under 500 characters.

### 6. What the next session does with the package

Tell the next chat:

> Uncompress this tarball and read all .md files starting with HANDOVER.md. I'm an experienced FPV/drone pilot familiar with both INAV and ArduPilot. Skip the basics, challenge my ideas, and don't code until I say go.

The new session should:
1. Extract the tarball to its working directory
2. Read HANDOVER.md (full context, priorities, conventions)
3. Read TODO.md (what's done, what's pending)
4. Read ARCHITECTURE.md (code navigation, patterns)
5. Run `npm install --ignore-scripts` + `npx tsc --noEmit` to verify clean state
6. Be ready to work
