# Changelog

All notable changes to ArduGUI will be documented in this file.

This project is in **pre-alpha** and does not yet follow semantic versioning. Version numbers reflect development milestones, not stability guarantees.

---

## [0.1.0] -- 2026-02-25

**Initial public release. Pre-alpha, not field-tested.**

### Core Infrastructure
- Electron app shell with serial port access via IPC bridge
- MAVLink v2 protocol layer: packet framing, CRC validation, message parsing/encoding
- Connection state machine: auto-detect baud rate, heartbeat monitoring, parameter download
- Zustand state management: connection, parameter (with dirty tracking), vehicle, calibration, telemetry, debug stores
- Parameter write-back to FC with review dialog, dirty indicators, and revert support
- Dark theme with CSS custom properties (amber accent, high-contrast surfaces)

### Visual Identity -- "Forge" (v6)
- Complete palette: warm charcoal backgrounds (#0c0b0a family) + marigold accent (#ffaa2a)
- Utilitarian interface: flat buttons, 3-4px radii, no gradients/shadows, tight spacing
- Compact header (40px), slim footer (28px), narrow sidebar (160px) with VS Code-style active indicator
- Differentiated from ArduDeck (navy+amber), Betaflight (gray+yellow), INAV (light+green), QGC (dark+purple)
- All accent/text combinations pass WCAG AA contrast ratios for outdoor/older-user readability
- Reworked airframe icons: thin line-art copters with motor-count scaling, slimmer plane silhouettes
- Fixed H-frame motor positions (was showing as X, now correctly wider horizontal arms)
- Updated all hardcoded colors across 15+ components (SVGs, Three.js scenes, Tailwind classes, hex values)

### Board Support
- Auto-detection of 50+ flight controller boards from USB vendor/product IDs and APJ_BOARD_ID
- Interactive board diagram showing ports, pins, sensors, and peripherals
- Board database generated from ArduPilot hwdef.dat files via Python scraper pipeline
- Board-aware serial port labels (e.g., "TELEM1" instead of "SERIAL1")

### Vehicle Detection
- Automatic vehicle type detection from MAVLink HEARTBEAT (Copter, Plane, QuadPlane)
- Vehicle-adaptive UI: sidebar tabs, page content, and available options change per vehicle type
- QuadPlane detection via Q_ENABLE parameter

### Frame Wizard
- Guided airframe selection with visual silhouette grid
- Preset library: 20+ frame configurations across copter, plane, and VTOL categories
- Servo/motor output mapping with drag-and-drop reassignment
- Output conflict detection and warnings
- Extras selection (parachute, gripper, gimbal) with automatic servo assignment
- Re-entry detection: highlights currently configured frame with "Active" badge
- Correct frame detection from dirty (unsaved) parameters

### Motors Page
- Frame-specific SVG motor diagrams matching configured airframe
- Correct motor numbering, rotation direction (CW/CCW), and arm coloring (port/starboard)
- Plane servo diagram with correct silhouette per airframe type (conventional, flying wing, V-tail, etc.)
- Individual motor testing with safety interlocks (two-step acknowledge + enable)
- Sequential motor test (all motors in order)
- Full servo function table with dropdown editing

### Calibration
- Accelerometer 6-position calibration with live 3D model viewer
- GLB models: airplane (630KB, 16K vertices) and quadcopter (190KB, baked prop colors)
- Smooth animated transitions between calibration orientations (lerp at 0.06)
- Camera auto-switches between side view and top view for nose positions
- Amber ground plane with gold grid, direction chevron indicator
- 6-panel position grid showing all calibration states at a glance
- Separate level trim card with one-click calibration
- Vehicle-type-aware: loads correct model for copter vs plane

### Ports Page
- Serial port protocol assignment with board-aware labels
- Protocol dropdown with ArduPilot serial protocol options
- Visual mapping of logical serial ports to physical board connectors

### Configuration Page
- Grouped parameter editing for common settings
- Vehicle-type-adaptive parameter groups

### Receiver Page
- Live RC channel visualization with bar graphs
- RC protocol selection
- Channel mapping display

### Flight Modes Page
- INAV Configurator-style range sliders
- RC channel binding for mode switching
- Visual mode assignment with color-coded ranges

### OSD Editor
- Canvas-based drag-and-drop element positioning
- Element toggling and screen selection
- Backend-aware grid sizing (analog, DJI, HDZero, Walksnail)

### CLI Page
- Full parameter search with instant filter
- Raw parameter value editing
- Parameter metadata display (type, range, description)

### Other Pages
- **PID Tuning:** Parameter editing interface (no real-time graphing yet)
- **Navigation:** Geofence and RTL parameter editing (skeleton)
- **Failsafes:** Battery, RC, GCS failsafe configuration (skeleton)

### Developer Tools
- Board database scraper: `tools/scrape-hwdef.py` (parses ArduPilot hwdef.dat files)
- Board database generator: `tools/generate-board-defs.py` (produces TypeScript from scraped JSON)
- MAVLink code generator: `scripts/generate-mavlink.ts` (TypeScript types from MAVLink XML)
- Debug console with MAVLink message inspection

### Known Limitations
- **Not field-tested.** No aircraft has been flown using ArduGUI-only configuration.
- **Always verify parameters** in Mission Planner or QGroundControl before flight.
- No compass calibration.
- No mission planning, log analysis, or firmware flashing.
- No telemetry graphing.
- No automated tests.
- USB serial only (no WiFi/Bluetooth/UDP).
- Many edge cases in frame/motor configuration are untested.

---

*For the full safety notice, see [DISCLAIMER.md](DISCLAIMER.md).*
