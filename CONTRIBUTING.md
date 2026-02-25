# Contributing to ArduGUI

Thank you for your interest in contributing. ArduGUI is in early development, and the architecture is still evolving -- your help is welcome, but please coordinate before starting significant work.

## Before You Start

**Open an issue first.** Whether it's a bug report, a feature idea, or an offer to work on something, start with an issue. This project is small enough that duplicate or conflicting work is a real risk, and a quick discussion can save hours.

## Development Setup

### Requirements

- Node.js 18+
- npm 9+
- Python 3.8+ (for board database tools only)
- Git
- A flight controller running ArduPilot (for testing)

### Getting Running

```bash
git clone https://github.com/agoliveira/ardugui.git
cd ardugui
npm install

# Full Electron app (serial access, hot reload):
npm run dev
```

### Useful Commands

```bash
npm run dev              # Full Electron app with hot reload
npm run build            # Production build (renderer)
npm run build:electron   # Production build + Electron packaging
npm run typecheck        # TypeScript type checking (no emit)
npm run lint             # ESLint
npm run format           # Prettier
```

## Project Architecture

Read [ARCHITECTURE.md](ARCHITECTURE.md) for the full specification. Here's the short version:

**State management** uses Zustand with six stores:

- `connectionStore` -- serial port state, connection lifecycle
- `parameterStore` -- all FC parameters, dirty tracking, write-back
- `vehicleStore` -- detected vehicle type, firmware info, armed state
- `calibrationStore` -- accelerometer calibration state machine
- `telemetryStore` -- real-time telemetry values (attitude, GPS, battery)
- `debugStore` -- debug console message buffer

**Parameter flow:**

1. FC sends parameters over MAVLink → stored in `parameterStore.parameters`
2. User edits in the UI → stored in `parameterStore.dirtyParams`
3. User clicks "Save to FC" → dirty params written over MAVLink, moved to `parameters`
4. Effective value = `dirtyParams[name] ?? parameters[name].value`

This two-layer design lets every page show unsaved changes (amber indicators) and revert cleanly.

**Page structure:** Each sidebar tab is a self-contained page in `src/pages/`. Pages read from stores and call `setParamLocal()` to make changes. They don't talk to each other directly -- the stores are the shared state.

**Component conventions:**

- One file per component, named to match (e.g., `BoardDiagram.tsx` exports `BoardDiagram`)
- Shared aircraft silhouettes live in `AirframeIcons.tsx` and are reused across Frame Wizard, Motors, and Calibration pages
- All colors come from CSS custom properties defined in `src/styles/theme.css`
- Shared hooks go in `src/hooks/` (e.g., `useDetectedPreset.ts` for detecting the configured airframe from FC parameters)
- When reading parameters, always use effective values: `dirtyParams.get(name) ?? parameters.get(name)?.value` -- this ensures the UI reflects unsaved changes immediately

## Code Style

### TypeScript

- Strict mode is on. No `any` unless absolutely necessary, and add a comment explaining why.
- Prefer `interface` over `type` for object shapes.
- Use `const` assertions for static data (e.g., motor layouts, frame definitions).

### React

- Functional components only. No class components.
- Hooks for all state and effects.
- `useMemo` and `useCallback` for anything expensive or passed as a prop.
- Avoid `useEffect` for derived state -- compute it in render or with `useMemo`.

### CSS / Styling

- Tailwind utility classes for layout and spacing.
- Theme colors via CSS custom properties (`--color-accent`, `--color-surface-1`, etc.) -- never hardcode hex values for UI chrome.
- Diagram colors (motor CW/CCW, port/starboard) are defined in `VehicleGraphics.tsx` as the `VC` object.

### Naming

- Files: PascalCase for components (`CalibrationPage.tsx`), camelCase for utilities (`useDetectedPreset.ts`).
- Variables: camelCase. Constants: SCREAMING_SNAKE for static lookup tables.
- ArduPilot parameter names are always SCREAMING_SNAKE (e.g., `FRAME_CLASS`, `SERVO1_FUNCTION`).

## Areas Where Help Is Needed

### Board database

The board database is scraped from ArduPilot's `hwdef.dat` files, but many boards need manual metadata (friendly names, USB vendor/product IDs, physical dimensions, wiki links). If you have a board that's missing or has wrong information, a PR to `tools/generate-board-defs.py` (the `BOARD_METADATA` dictionary) is extremely valuable.

### Airframe presets

The frame wizard's preset library (`src/models/airframeTemplates.ts`) needs more aircraft configurations -- especially uncommon frame types, VTOL variants, and planes with non-standard control surface setups.

### Testing on real hardware

The single most helpful thing you can do is connect ArduGUI to a real flight controller, walk through every page, and report what's wrong. File issues with:

- What you expected to happen
- What actually happened
- Your board, firmware version, and vehicle type
- Screenshots if relevant

**Do not fly based on ArduGUI configuration without verifying in Mission Planner.**

### Documentation

Wiki pages, setup guides, video walkthroughs -- all welcome.

## Pull Request Guidelines

1. **One feature or fix per PR.** Keep them focused and reviewable.
2. **Run `npm run typecheck` before submitting.** The build must pass with zero errors.
3. **Test with a real FC if your change touches parameters.** If you don't have hardware, say so in the PR and someone else can verify.
4. **Update documentation** if your change affects the user-facing behavior or the project structure.
5. **Don't reformat unrelated code.** Keep the diff clean.

## Commit Messages

No strict convention yet, but be descriptive. Good examples:

```
fix: frame wizard not detecting Quad+ after apply
feat: add V-tail silhouette to plane servo diagram
docs: add board database contribution guide
refactor: extract preset detection into shared hook
```

## Safety-Critical Code

Any code that writes parameters to the flight controller is safety-critical. If your change modifies what gets written via `setParamLocal()` or the MAVLink write path:

- Double-check the parameter names and value ranges against the [ArduPilot parameter reference](https://ardupilot.org/copter/docs/parameters.html).
- Consider what happens if the value is wrong. A bad `SERVO_FUNCTION` mapping can cause loss of control. A bad `MOT_SPIN_ARM` can cause unexpected motor spin-up.
- Add range validation if the parameter has known bounds.
- Note the safety implications in your PR description.

## License

By contributing, you agree that your contributions will be licensed under GPLv3, consistent with the project's license.
