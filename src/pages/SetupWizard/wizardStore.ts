/**
 * wizardStore.ts -- State management for the Setup Wizard.
 *
 * Write-as-you-go model: each step's params are written to the FC when
 * the user clicks Next. An initial snapshot is captured on start for
 * rollback if the user abandons.
 *
 * stagedParams still accumulates across all steps (for cross-step reads
 * and preview). writtenParams tracks what was actually committed to FC.
 * initialSnapshot stores the FC state at wizard start for rollback.
 */

import { create } from 'zustand';
import type { VehicleType } from '@/store/vehicleStore';
import { useParameterStore } from '@/store/parameterStore';

/* ------------------------------------------------------------------ */
/*  Step & phase definitions                                          */
/* ------------------------------------------------------------------ */

export interface WizardStep {
  id: string;
  label: string;
  phase: string;
  /** Vehicle types this step applies to. Empty = all. */
  appliesTo: VehicleType[];
  /** All steps except Review are skippable */
  skippable?: boolean;
  /** If true, skipping this step has safety consequences shown at Review */
  safetyCritical?: boolean;
  /** Warning shown at Review if this step was skipped */
  skipWarning?: string;
}

/** Master step registry. Filtered per vehicle at wizard start. */
const ALL_STEPS: WizardStep[] = [
  // -- Phase: Frame & Motors --
  { id: 'frame',            label: 'Frame',             phase: 'Frame & Motors',  appliesTo: [], skippable: true,
    safetyCritical: true, skipWarning: 'No frame type selected. The FC does not know what aircraft it is controlling.' },
  { id: 'output_mapping',   label: 'Output Mapping',    phase: 'Frame & Motors',  appliesTo: [], skippable: true,
    safetyCritical: true, skipWarning: 'Servo outputs not configured. Motors and control surfaces may not respond.' },
  { id: 'motors_esc',       label: 'Motors & ESC',      phase: 'Frame & Motors',  appliesTo: [], skippable: true,
    safetyCritical: true, skipWarning: 'Motor direction was not verified. Wrong direction WILL crash on first arm.' },

  // -- Phase: Control Surfaces (plane/VTOL only) --
  { id: 'control_surfaces', label: 'Control Surfaces',  phase: 'Surfaces',        appliesTo: ['plane', 'quadplane'], skippable: true,
    safetyCritical: true, skipWarning: 'Control surface direction not verified. Reversed surfaces cause immediate loss of control.' },
  { id: 'tilt_servos',      label: 'Tilt Servos',       phase: 'Surfaces',        appliesTo: ['quadplane'], skippable: true,
    safetyCritical: true, skipWarning: 'Tilt servo positions not verified. Incorrect tilt can prevent transitions.' },
  { id: 'transitions',      label: 'Transitions',       phase: 'Surfaces',        appliesTo: ['quadplane'], skippable: true },

  // -- Phase: Sensors --
  { id: 'receiver',         label: 'Receiver',          phase: 'Sensors',         appliesTo: [], skippable: true,
    safetyCritical: true, skipWarning: 'Receiver not configured and RC endpoints not calibrated. Control response may be unpredictable.' },
  { id: 'gps',              label: 'GPS',               phase: 'Sensors',         appliesTo: [], skippable: true },
  { id: 'compass',          label: 'Compass',           phase: 'Sensors',         appliesTo: [], skippable: true,
    safetyCritical: true, skipWarning: 'Compass not calibrated. GPS-assisted modes (Loiter, RTL, Auto) will not work reliably.' },
  { id: 'accelerometer',    label: 'Accelerometer',     phase: 'Sensors',         appliesTo: [], skippable: true,
    safetyCritical: true, skipWarning: 'Accelerometer not calibrated. Attitude estimate will be inaccurate, affecting all flight modes.' },

  // -- Phase: Safety --
  { id: 'flight_modes',     label: 'Flight Modes',      phase: 'Safety',          appliesTo: [], skippable: true },
  { id: 'failsafes',        label: 'Failsafes',         phase: 'Safety',          appliesTo: [], skippable: true,
    safetyCritical: true, skipWarning: 'Failsafes not configured. The aircraft will not protect itself on signal loss or low battery.' },

  // -- Phase: Tune --
  { id: 'initial_tune',     label: 'Initial Tune',      phase: 'Tune',            appliesTo: [], skippable: true },
  { id: 'review',           label: 'Review & Finish',   phase: 'Tune',            appliesTo: [] },
];

/** Filter steps for a given vehicle type */
export function getWizardSteps(vehicleType: Exclude<VehicleType, null>): WizardStep[] {
  return ALL_STEPS.filter((step) => {
    if (step.appliesTo.length === 0) return true;
    return step.appliesTo.includes(vehicleType);
  });
}

/** Get unique phase names in order for a set of steps */
export function getPhases(steps: WizardStep[]): string[] {
  const seen = new Set<string>();
  const phases: string[] = [];
  for (const step of steps) {
    if (!seen.has(step.phase)) {
      seen.add(step.phase);
      phases.push(step.phase);
    }
  }
  return phases;
}

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

export interface WizardState {
  // Lifecycle
  active: boolean;
  vehicleType: VehicleType | null;
  steps: WizardStep[];
  currentStepIndex: number;

  // When true, wizard auto-triggers factory reset flow on mount
  pendingReset: boolean;

  // Import source -- when set, import data takes priority over template defaults
  importSource: 'inav' | null;

  // Staged parameters -- accumulated across all steps for cross-step reads
  stagedParams: Record<string, number>;

  // Written parameters -- what was actually committed to FC this wizard session
  writtenParams: Record<string, number>;

  // Initial snapshot -- FC param state at wizard start, for rollback
  initialSnapshot: Record<string, number>;

  // Per-step UI state that must survive remounts
  selectedFramePresetId: string | null;
  selectedReceiverConfig: {
    protocolId: string;
    portIndex: number | null;
    mapId: string;
  } | null;

  // Per-step completion
  completedSteps: Set<string>;  // step IDs
  skippedSteps: Set<string>;    // step IDs

  // Computed
  currentStep: () => WizardStep | null;
  currentPhase: () => string | null;
  isFirstStep: () => boolean;
  isLastStep: () => boolean;
  progress: () => number;  // 0-1

  // Actions
  start: (vehicleType: Exclude<VehicleType, null>, opts?: { pendingReset?: boolean }) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  markComplete: (stepId: string) => void;
  markSkipped: (stepId: string) => void;
  stageParam: (name: string, value: number) => void;
  stageParams: (params: Record<string, number>) => void;
  unstageParam: (name: string) => void;
  /** Record that params were written to FC (called after successful write) */
  recordWritten: (params: Record<string, number>) => void;
  setImportSource: (source: 'inav' | null) => void;
  setSelectedFramePresetId: (id: string | null) => void;
  setSelectedReceiverConfig: (config: WizardState['selectedReceiverConfig']) => void;
  abandon: () => void;

  // Persistence
  saveProgress: () => void;
  loadProgress: () => boolean;
  clearSavedProgress: () => void;
}

const STORAGE_KEY = 'ardugui-wizard-progress';

export const useWizardStore = create<WizardState>((set, get) => ({
  // -- Initial state --
  active: false,
  vehicleType: null,
  importSource: null,
  pendingReset: false,
  steps: [],
  currentStepIndex: 0,
  stagedParams: {},
  writtenParams: {},
  initialSnapshot: {},
  selectedFramePresetId: null,
  selectedReceiverConfig: null,
  completedSteps: new Set(),
  skippedSteps: new Set(),

  // -- Computed --
  currentStep: () => {
    const { steps, currentStepIndex } = get();
    return steps[currentStepIndex] ?? null;
  },

  currentPhase: () => {
    const step = get().currentStep();
    return step?.phase ?? null;
  },

  isFirstStep: () => get().currentStepIndex === 0,

  isLastStep: () => {
    const { steps, currentStepIndex } = get();
    return currentStepIndex === steps.length - 1;
  },

  progress: () => {
    const { steps, completedSteps, skippedSteps } = get();
    if (steps.length === 0) return 0;
    return (completedSteps.size + skippedSteps.size) / steps.length;
  },

  // -- Actions --
  start: (vehicleType, opts) => {
    const steps = getWizardSteps(vehicleType);

    // Capture FC state for rollback
    const snapshot: Record<string, number> = {};
    const params = useParameterStore.getState().parameters;
    for (const [name, param] of params) {
      snapshot[name] = param.value;
    }

    set({
      active: true,
      vehicleType,
      importSource: null,
      pendingReset: opts?.pendingReset ?? false,
      steps,
      currentStepIndex: 0,
      stagedParams: {},
      writtenParams: {},
      initialSnapshot: snapshot,
      selectedFramePresetId: null,
      selectedReceiverConfig: null,
      completedSteps: new Set(),
      skippedSteps: new Set(),
    });
  },

  nextStep: () => {
    const { steps, currentStepIndex } = get();
    if (currentStepIndex < steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
      get().saveProgress();
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
      get().saveProgress();
    }
  },

  goToStep: (index) => {
    const { steps } = get();
    if (index >= 0 && index < steps.length) {
      set({ currentStepIndex: index });
      get().saveProgress();
    }
  },

  markComplete: (stepId) => {
    set((state) => {
      const completed = new Set(state.completedSteps);
      completed.add(stepId);
      const skipped = new Set(state.skippedSteps);
      skipped.delete(stepId);
      return { completedSteps: completed, skippedSteps: skipped };
    });
    get().saveProgress();
  },

  markSkipped: (stepId) => {
    set((state) => {
      const skipped = new Set(state.skippedSteps);
      skipped.add(stepId);
      const completed = new Set(state.completedSteps);
      completed.delete(stepId);
      return { skippedSteps: skipped, completedSteps: completed };
    });
  },

  stageParam: (name, value) => {
    set((state) => ({
      stagedParams: { ...state.stagedParams, [name]: value },
    }));
  },

  stageParams: (params) => {
    set((state) => ({
      stagedParams: { ...state.stagedParams, ...params },
    }));
  },

  unstageParam: (name) => {
    set((state) => {
      const next = { ...state.stagedParams };
      delete next[name];
      return { stagedParams: next };
    });
  },

  recordWritten: (params) => {
    set((state) => ({
      writtenParams: { ...state.writtenParams, ...params },
    }));
  },

  setImportSource: (source) => {
    set({ importSource: source });
  },

  setSelectedFramePresetId: (id) => {
    set({ selectedFramePresetId: id });
  },

  setSelectedReceiverConfig: (config) => {
    set({ selectedReceiverConfig: config });
  },

  abandon: () => {
    get().clearSavedProgress();
    set({
      active: false,
      vehicleType: null,
      importSource: null,
      pendingReset: false,
      steps: [],
      currentStepIndex: 0,
      stagedParams: {},
      writtenParams: {},
      initialSnapshot: {},
      selectedFramePresetId: null,
      selectedReceiverConfig: null,
      completedSteps: new Set(),
      skippedSteps: new Set(),
    });
  },

  // -- Persistence --
  saveProgress: () => {
    const { vehicleType, currentStepIndex, stagedParams, writtenParams,
      completedSteps, skippedSteps, selectedFramePresetId,
      selectedReceiverConfig, importSource } = get();
    try {
      const data = {
        vehicleType,
        currentStepIndex,
        stagedParams,
        writtenParams,
        selectedFramePresetId,
        selectedReceiverConfig,
        importSource,
        completedSteps: Array.from(completedSteps),
        skippedSteps: Array.from(skippedSteps),
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // localStorage not available -- silently ignore
    }
  },

  loadProgress: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data.vehicleType || data.vehicleType === null) return false;

      const steps = getWizardSteps(data.vehicleType);
      set({
        active: true,
        vehicleType: data.vehicleType,
        importSource: data.importSource ?? null,
        steps,
        currentStepIndex: Math.min(data.currentStepIndex ?? 0, steps.length - 1),
        stagedParams: data.stagedParams ?? {},
        writtenParams: data.writtenParams ?? {},
        selectedFramePresetId: data.selectedFramePresetId ?? null,
        selectedReceiverConfig: data.selectedReceiverConfig ?? null,
        completedSteps: new Set(data.completedSteps ?? []),
        skippedSteps: new Set(data.skippedSteps ?? []),
      });
      return true;
    } catch {
      return false;
    }
  },

  clearSavedProgress: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  },
}));
