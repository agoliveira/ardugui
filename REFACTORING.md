# ArduGUI -- Component Extraction Plan

Goal: Eliminate divergence between wizard steps and standalone pages by extracting
shared logic into reusable components. Each domain follows the pattern established
by RcCalibration.tsx: one core component, thin wrappers for wizard and standalone.

## Pattern

```
src/components/MotorTest.tsx      <-- core UI + logic
src/pages/SetupWizard/steps/MotorEscStep.tsx  <-- wrapper: stages params, advance gate
src/pages/Motors/MotorsPage.tsx   <-- wrapper: reads/writes FC, full-page layout
```

## Extraction Priority

### 1. Motors (WORST -- ~1850 lines, significant logic duplication)

**Shared logic to extract:**
- `useMotorLayout` hook -- resolves FRAME_CLASS/TYPE to motor positions
  from staged > dirty > FC params. Currently duplicated in both files.
- `MotorTestPanel` component -- battery gating, safety acknowledge,
  individual motor test, "test all" sequence, safety monitor integration,
  result tracking (correct/wrong/untested), throttle slider.
- `EscProtocolSelect` component -- protocol cards (DShot150/300/600, PWM),
  description, param mapping (MOT_PWM_TYPE vs Q_M_PWM_TYPE).
- `MotorTestInfo` interface and `getPositionLabel()` helper.
- ESC_PROTOCOLS constant array.

**Stays in MotorEscStep (wizard wrapper):**
- wizardStore staging (stageParams on protocol select)
- Advance gate (all motors tested)
- Import fallback motor detection from stagedParams

**Stays in MotorsPage (standalone wrapper):**
- CopterMotorOverlay (SVG motor diagram with CW/CCW arcs)
- PlaneServoOverlay (SVG servo/motor labels on airframe)
- Plane-specific servo output bar section
- Full-page layout with dual-column frame diagram + controls

**Status:** [x] Partially done. Shared: motorTestDefs.ts (types, ESC protocols, helpers),
  MotorTestPanel.tsx (useMotorTest hook + composable sub-components). MotorEscStep rewired
  (993 -> 402 lines). MotorsPage has different UX (test bench vs guided flow) -- shares types
  and safety UI but keeps its own interaction model. This is correct, not a gap.

### 2. Receiver -- NO EXTRACTION NEEDED

ReceiverPage (301 lines) is a pure telemetry viewer showing live channel bars.
ReceiverStep (909 lines) is a full configurator (protocol, port, channel order, change guard).
Different tools for different purposes. The only shared element is channel bars,
which are small and have different requirements (standalone tracks min/max, wizard
shows fixed ranges). Not worth extracting.

**Status:** [x] Reviewed -- no action needed

### 3. Flight Modes -- DEFER (extract when files grow)

ModesPage (356 lines) and FlightModesStep (423 lines) share the mode slot + range
bar UI pattern. The model layer (flightModes.ts) is already shared. The files are
small enough that extraction overhead isn't justified yet. When either grows past
~600 lines, extract shared `ModeSlotGrid` and `ModeRangeBar` components.

**Status:** [~] Deferred -- pattern established, extract when needed

### 4. Failsafes -- DEFER (extract when files grow)

FailsafesPage (216 lines) and FailsafesStep (454 lines). Model layer
(failsafeGroups.ts) already shared. Standalone page is tiny. No urgency.

**Status:** [~] Deferred -- pattern established, extract when needed

### 5. Calibration -- NO EXTRACTION NEEDED (except RC, already done)

Compass and Accelerometer wizard steps are intentionally simpler than the
standalone CalibrationPage. They talk to FC directly (calibration data, not staged).
RC Calibration is already extracted as the reference pattern.

**Status:** [x] RC done, rest reviewed -- no action needed

## Completed

- [x] **RC Calibration** -- RcCalibration.tsx is the reference pattern.
  Reusable core component used by both RcCalibrationStep and CalibrationPage.
