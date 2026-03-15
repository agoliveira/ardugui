# ArduGUI Wizard -- Session Handoff

**Date:** 2026-02-27
**Last tarball:** `ardugui-wizard-scaffold.tar.gz`
**Transcript:** `/mnt/transcripts/2026-02-26-23-50-37-expert-mode-frame-fixes-v6.txt`

---

## What was done this session

### 1. Bug fixes (shipped as v0.2.0)
- **Frame detection:** Rewrote `useDetectedPreset.ts` plane detection from
  set-based (ambiguous) to output-mapping-based (precise). Added VTOL
  detection that respects dirty Q_ENABLE before FC reboots.
- **Frame Apply:** `stageParams()` method added to parameterStore for
  unconditional dirty staging. FrameWizard Apply button uses it.
- **Expert Mode:** Full ExpertPage with factory reset, reboot, MAVLink
  inspector. Absorbed DebugConsole.
- **Plane icons:** Hybrid style (12% fill + 1.5px stroke).
- **TypeCheck fix:** `void onNavigate` suppression in FrameWizard.
- **CI/Release:** v0.2.0 tagged, GitHub Actions built and published draft.

### 2. Wizard architecture (documented, not yet coded)
- Full architecture doc at `docs/WIZARD_ARCHITECTURE.md` (in tarball)
- 11 sections covering purpose, design principles, step sequences for
  copter/plane/VTOL, detailed step specs, UI layout, state management,
  component structure, reuse mapping, risks, phasing, sidebar reorder,
  VTOL two-cycle grouping

### 3. Wizard scaffolding (coded, not yet pushed)
Files in `ardugui-wizard-scaffold.tar.gz`:

| File | What it does |
|------|-------------|
| `docs/WIZARD_ARCHITECTURE.md` | Full design doc |
| `src/app/Sidebar.tsx` | Reordered nav items to match wizard flow |
| `src/app/Layout.tsx` | Wizard active check -- renders SetupWizard exclusively |
| `src/pages/Setup/SetupPage.tsx` | "Start Wizard" button card on Information page |
| `src/pages/SetupWizard/wizardStore.ts` | Zustand store: steps, phases, staged params, persistence |
| `src/pages/SetupWizard/SetupWizard.tsx` | Main orchestrator with exclusive layout + abandon dialog |
| `src/pages/SetupWizard/WizardStepper.tsx` | Left step indicator with phase headers |
| `src/pages/SetupWizard/WizardNav.tsx` | Bottom Back/Next/Skip buttons |
| `src/pages/SetupWizard/steps/PlaceholderStep.tsx` | Temporary placeholder for unimplemented steps |
| `src/pages/SetupWizard/steps/FrameStep.tsx` | Frame selection step (copter drill-down, plane/vtol flat grid) |

---

## What's next

### Immediate (this or next session)
1. ~~**Extract and test** the scaffold tarball~~ DONE
2. ~~**FrameStep**~~ DONE -- stages params to wizard store on selection
3. **Test FrameStep** -- verify frame grid renders, selection stages params,
   Next button enables after selection, Back returns to frame with selection
   preserved

### Then (Phase 1: copter core)
4. **MotorEscStep** -- ESC protocol cards + sequential motor spin test
5. **ReceiverStep** -- protocol selection + channel mapping bars + telemetry check

### Then (Phase 2: sensors + safety)
6. **GpsCompassStep** -- port detection, communication check, compass cal
7. **AccelerometerStep** -- 6-position cal + level trim
8. **FlightModesStep** -- 3-position switch assignment
9. **FailsafeStep** -- RC loss, battery, GCS

### Then (Phase 3: tune + review)
10. **InitialTuneStep** -- PID lookup table from prop size/weight/cells
11. **ReviewStep** -- summary cards + full param list + Apply & Reboot

### Then (Phase 4: plane + VTOL)
12. **ControlSurfaceStep** -- animated surface verification
13. **TiltServoStep** -- tilt motor verification with animation
14. Extend all steps for plane-specific and VTOL-specific behavior

---

## Key design decisions (settled)

- **Exclusive mode:** Wizard replaces normal Layout entirely when active
- **Transactional:** All params staged locally, written only at Review & Apply
- **Local progress save:** localStorage persistence, resume or start fresh
- **No re-entry:** Can't jump to arbitrary steps. Forward/back within session.
- **Phase grouping:** Steps grouped by phase (Frame & Motors, Surfaces, Sensors, Safety, Tune) in stepper
- **VTOL two-cycle:** Hover setup → Cruise setup → Common → Safety → Tune
- **Sidebar reorder:** Matches wizard sequence (Frame, Motors, Ports, Receiver, Calibration, Modes, Failsafes...)
- **Prop range:** 5" to 15", battery 3S-6S for initial tune
- **Compass/Accel:** Check if already calibrated, green checkmark, optional recal
- **GPS:** Communication check only (not fix), board-aware port detection
- **Control surfaces:** Visual guided test for aileron/elevator/rudder, auto-reverse
- **Motor test throttle:** 8% DShot, 12% PWM
- **Tilt servos:** Side-view animation, hover/cruise/yaw test sequence

## Important code patterns

- `useWizardStore` is the single source of truth for wizard state
- Steps call `stageParams({...})` to add params to the staging area
- Steps call `markComplete(stepId)` when the user has verified their sub-step
- `WizardNav` controls Back/Next, `canAdvance` prop gates the Next button
- `renderStep()` in SetupWizard.tsx is the switch that maps step IDs to components
- The wizard store's `start(vehicleType)` filters ALL_STEPS by vehicle type

## Ground rules (carried forward)
1. No premature coding -- discuss architecture first
2. Deliver as tarball with root-relative paths
3. Challenge assumptions, ask before acting
4. Cater to new users over veterans
5. User dislikes em dashes -- use " -- " instead
6. Debate before coding when user asks "Thoughts?"
