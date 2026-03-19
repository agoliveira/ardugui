/**
 * SetupWizard.tsx -- Main wizard orchestrator.
 *
 * Renders the exclusive wizard layout: minimal header, step indicator
 * on the left, current step content in the center, navigation at the
 * bottom. Replaces the normal Layout when active.
 *
 * Each step is a component that receives the wizard store and renders
 * its own UI. Steps call markComplete() when they're done and stage
 * their params into stagedParams.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { X, Wand2, Unplug, RefreshCw, Rocket, Upload, Plane, ArrowLeft, AlertTriangle, Loader2, Database } from 'lucide-react';
import { useWizardStore } from './wizardStore';
import { WizardStepper } from './WizardStepper';
import { WizardNav } from './WizardNav';
import { StepHelp } from '@/components/HelpTip';
import { PlaceholderStep } from './steps/PlaceholderStep';
import { FrameStep } from './steps/FrameStep';
import { MotorEscStep } from './steps/MotorEscStep';
import { ReceiverStep } from './steps/ReceiverStep';
import { GpsStep } from './steps/GpsStep';
import { FlightModesStep } from './steps/FlightModesStep';
import { FailsafesStep } from './steps/FailsafesStep';
import { ReviewStep } from './steps/ReviewStep';
import { CompassStep } from './steps/CompassStep';
import { AccelerometerStep } from './steps/AccelerometerStep';
import { InitialTuneStep } from './steps/InitialTuneStep';
import { ControlSurfacesStep } from './steps/ControlSurfacesStep';
import { OutputMappingStep } from './steps/OutputMappingStep';
import { TiltServosStep } from './steps/TiltServosStep';
import { TransitionsStep } from './steps/TransitionsStep';
import { InavImportDialog } from './steps/InavImportDialog';
import { useConnectionStore } from '@/store/connectionStore';
import { connectionManager } from '@/mavlink/connection';
import { runAutoBackup } from '@/utils/autoBackup';

type ResetPhase = 'confirm' | 'backup' | 'resetting' | 'rebooting' | 'reconnecting' | null;

export function SetupWizard() {
  const currentStep = useWizardStore((s) => s.currentStep());
  const currentStepIndex = useWizardStore((s) => s.currentStepIndex);
  const completedSteps = useWizardStore((s) => s.completedSteps);
  const abandon = useWizardStore((s) => s.abandon);
  const isConnected = useConnectionStore((s) => s.status === 'connected');
  const connectionStatus = useConnectionStore((s) => s.status);
  const portPath = useConnectionStore((s) => s.portPath);
  const baudRate = useConnectionStore((s) => s.baudRate);

  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const vehicleType = useWizardStore((s) => s.vehicleType);

  const [showWelcome, setShowWelcome] = useState(() => {
    return currentStepIndex === 0 && completedSteps.size === 0;
  });
  const [showInavImport, setShowInavImport] = useState(false);
  const [showVehicleChoice, setShowVehicleChoice] = useState(false);

  // Factory reset state
  const [resetPhase, setResetPhase] = useState<ResetPhase>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  // Store the vehicle choice callback so we can call it after reset completes
  const pendingVehicleAction = useRef<(() => void) | null>(null);

  const writtenParams = useWizardStore((s) => s.writtenParams);
  const initialSnapshot = useWizardStore((s) => s.initialSnapshot);
  const pendingReset = useWizardStore((s) => s.pendingReset);

  const writtenCount = Object.keys(writtenParams).length;

  const [canAdvance, setCanAdvance] = useState(true);
  const [rollingBack, setRollingBack] = useState(false);

  // Auto-trigger factory reset when pendingReset flag is set (from Layout dialog)
  const didAutoReset = useRef(false);
  useEffect(() => {
    if (pendingReset && !didAutoReset.current && isConnected) {
      didAutoReset.current = true;
      useWizardStore.setState({ pendingReset: false });
      setShowWelcome(false);
      if (vehicleType === 'plane') {
        pendingVehicleAction.current = () => setShowVehicleChoice(true);
      } else {
        pendingVehicleAction.current = () => {};
      }
      executeFactoryReset();
    }
  }, [pendingReset, isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setCanAdvance(true);
  }, [currentStep?.id]);

  const handleCanAdvanceChange = useCallback((value: boolean) => {
    setCanAdvance(value);
  }, []);

  const handleAbandon = () => {
    if (writtenCount > 0) {
      setShowAbandonConfirm(true);
    } else {
      abandon();
    }
  };

  const handleRollback = useCallback(async () => {
    setRollingBack(true);
    // Write back initial values for everything we changed
    for (const [name, newVal] of Object.entries(writtenParams)) {
      const oldVal = initialSnapshot[name];
      if (oldVal !== undefined && oldVal !== newVal) {
        await connectionManager.writeParam(name, oldVal);
      }
    }
    setRollingBack(false);
    setShowAbandonConfirm(false);
    abandon();
  }, [writtenParams, initialSnapshot, abandon]);

  /**
   * Start Fresh: show factory reset confirmation.
   * Stores a callback for what to do after reset completes
   * (either go straight to wizard or show vehicle choice for ArduPlane).
   */
  const handleStartFreshClick = () => {
    if (vehicleType === 'plane') {
      // After reset we'll need to ask airplane vs VTOL
      pendingVehicleAction.current = () => setShowVehicleChoice(true);
    } else {
      pendingVehicleAction.current = () => setShowWelcome(false);
    }
    setResetPhase('confirm');
    setResetError(null);
  };

  /**
   * Execute the factory reset sequence:
   * 1. Auto-backup current params
   * 2. MAV_CMD_PREFLIGHT_STORAGE param1=2 (reset to defaults)
   * 3. Reboot FC
   * 4. Reconnect
   * 5. Proceed to wizard
   */
  const executeFactoryReset = async () => {
    const savedPort = useConnectionStore.getState().portPath;
    const savedBaud = useConnectionStore.getState().baudRate;

    try {
      // Step 1: Backup
      setResetPhase('backup');
      try {
        await runAutoBackup();
      } catch {
        // Backup failure is not fatal -- warn but continue
      }

      // Step 2: Reset params
      setResetPhase('resetting');
      const result = await connectionManager.resetToDefaults();
      if (result !== 0 && result !== undefined) {
        throw new Error(`Factory reset command returned result ${result}`);
      }

      // Step 3: Reboot
      setResetPhase('rebooting');
      useConnectionStore.getState().setPendingPage('wizard');

      try {
        await connectionManager.rebootFlightController();
      } catch {
        // Disconnect expected -- FC is rebooting
      }

      // Wait for FC to restart
      await new Promise((r) => setTimeout(r, 5000));

      // Step 4: Reconnect
      setResetPhase('reconnecting');
      if (savedPort) {
        let portOpened = false;
        for (let attempt = 0; attempt < 6; attempt++) {
          try {
            await connectionManager.connect(savedPort, savedBaud);
            portOpened = true;
            break;
          } catch {
            await new Promise((r) => setTimeout(r, 2000));
          }
        }

        if (portOpened) {
          // Wait for full connection (params loaded)
          await new Promise<boolean>((resolve) => {
            if (useConnectionStore.getState().status === 'connected') {
              resolve(true);
              return;
            }
            const timeout = setTimeout(() => { unsub(); resolve(false); }, 30000);
            const unsub = useConnectionStore.subscribe((state) => {
              if (state.status === 'connected') {
                clearTimeout(timeout); unsub(); resolve(true);
              } else if (state.status === 'disconnected') {
                clearTimeout(timeout); unsub(); resolve(false);
              }
            });
          });
        }
      }

      useConnectionStore.getState().setPendingPage(null);
      useConnectionStore.getState().setRebootProgress(null);

      // Step 5: Proceed to wizard with clean slate
      setResetPhase(null);
      if (pendingVehicleAction.current) {
        pendingVehicleAction.current();
        pendingVehicleAction.current = null;
      }
    } catch (err) {
      setResetError(`Factory reset failed: ${err}`);
      setResetPhase(null);
      useConnectionStore.getState().setPendingPage(null);
    }
  };

  /**
   * Skip factory reset -- go straight to wizard with existing params.
   */
  const skipFactoryReset = () => {
    setResetPhase(null);
    if (pendingVehicleAction.current) {
      pendingVehicleAction.current();
      pendingVehicleAction.current = null;
    }
  };

  if (!currentStep) return null;

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Minimal header */}
      <header className="flex h-10 items-center justify-between border-b border-border bg-surface-0 px-4">
        <div className="flex items-center gap-2">
          <Wand2 size={14} className="text-accent" />
          <span className="text-sm font-bold text-foreground">Setup Wizard</span>
          {writtenCount > 0 && (
            <span className="text-[11px] text-success">
              {writtenCount} params written
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Connection indicator */}
          <div className="flex items-center gap-1.5 text-[11px]">
            {isConnected ? (
              <>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="font-mono text-subtle">{portPath}</span>
              </>
            ) : (
              <>
                <Unplug size={12} className="text-danger" />
                <span className="text-danger">Disconnected</span>
              </>
            )}
          </div>

          {/* Abandon button */}
          <button
            onClick={handleAbandon}
            className="btn btn-ghost h-6 gap-1 px-2 text-[11px] text-subtle hover:text-danger"
            title="Abandon wizard"
          >
            <X size={13} />
            Exit
          </button>
        </div>
      </header>

      {/* Main area: stepper + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: step indicator (hidden during welcome) */}
        {!showWelcome && <WizardStepper />}

        {/* Center: welcome screen OR step content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {showWelcome ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <div className="w-full max-w-xl space-y-6">

                {/* Vehicle choice sub-screen for ArduPlane firmware */}
                {showVehicleChoice ? (
                  <>
                    <div className="text-center">
                      <Plane size={36} className="mx-auto mb-3 text-accent" />
                      <h1 className="text-2xl font-bold text-foreground">What are you building?</h1>
                      <p className="mt-2 text-sm text-muted">
                        Your flight controller is running ArduPlane firmware.
                        Choose the type of aircraft you want to configure.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Airplane */}
                      <button
                        onClick={() => {
                          // vehicleType is already 'plane' from FC detection
                          setShowVehicleChoice(false);
                          setShowWelcome(false);
                        }}
                        className="group flex flex-col items-center gap-3 rounded-lg border-2 border-border bg-surface-0 p-6 text-center transition hover:border-accent/50 hover:bg-surface-1"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                          <Plane size={24} className="text-accent" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-foreground">Airplane</p>
                          <p className="mt-1 text-xs text-muted leading-relaxed">
                            Fixed-wing aircraft: planes, flying wings,
                            and other non-VTOL configurations.
                          </p>
                        </div>
                      </button>

                      {/* VTOL */}
                      <button
                        onClick={() => {
                          // Restart wizard as quadplane -- regenerates step list
                          // to include tilt servos, control surfaces, Q_ params, etc.
                          useWizardStore.getState().start('quadplane');
                          setShowVehicleChoice(false);
                          setShowWelcome(false);
                        }}
                        className="group flex flex-col items-center gap-3 rounded-lg border-2 border-border bg-surface-0 p-6 text-center transition hover:border-accent/50 hover:bg-surface-1"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                          <Rocket size={24} className="text-accent" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-foreground">VTOL</p>
                          <p className="mt-1 text-xs text-muted leading-relaxed">
                            Vertical takeoff and landing: quadplanes,
                            tiltrotors, tailsitters, and hybrid aircraft.
                          </p>
                        </div>
                      </button>
                    </div>

                    <button
                      onClick={() => setShowVehicleChoice(false)}
                      className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors mx-auto"
                    >
                      <ArrowLeft size={12} />
                      Back
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <Wand2 size={36} className="mx-auto mb-3 text-accent" />
                      <h1 className="text-2xl font-bold text-foreground">Setup Wizard</h1>
                      <p className="mt-2 text-sm text-muted">
                        This wizard will walk you through configuring your aircraft
                        step by step. How would you like to start?
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Start fresh */}
                      <button
                        onClick={handleStartFreshClick}
                        disabled={resetPhase !== null}
                        className="group flex flex-col items-center gap-3 rounded-lg border-2 border-border bg-surface-0 p-6 text-center transition hover:border-accent/50 hover:bg-surface-1"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                          <Rocket size={24} className="text-accent" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-foreground">Start Fresh</p>
                          <p className="mt-1 text-xs text-muted leading-relaxed">
                            Configure your aircraft from scratch.
                            The wizard will guide you through each setting.
                          </p>
                        </div>
                      </button>

                      {/* Import from INAV */}
                      <button
                        onClick={() => setShowInavImport(true)}
                        className="group flex flex-col items-center gap-3 rounded-lg border-2 border-border bg-surface-0 p-6 text-center transition hover:border-accent/50 hover:bg-surface-1"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
                          <Upload size={24} className="text-blue-400" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-foreground">Import from INAV</p>
                          <p className="mt-1 text-xs text-muted leading-relaxed">
                            Migrating from INAV? Paste your
                            <span className="font-mono text-foreground"> diff all </span>
                            to pre-fill the wizard with your existing config.
                          </p>
                        </div>
                      </button>
                    </div>
                  </>
                )}

              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-4">
                  <StepHelp stepId={currentStep.id} />
                </div>
                {renderStep(currentStep.id, handleCanAdvanceChange)}
              </div>

              {/* Bottom: navigation */}
              <WizardNav canAdvance={canAdvance} />
            </>
          )}
        </div>
      </div>

      {/* INAV import dialog */}
      {showInavImport && (
        <InavImportDialog
          onClose={() => setShowInavImport(false)}
          onImported={(importedVehicleType, importedParams) => {
            setShowInavImport(false);
            setShowWelcome(false);
            const store = useWizardStore.getState();
            // Start wizard with detected vehicle type (clears stagedParams)
            if (importedVehicleType) {
              store.start(importedVehicleType);
            }
            // Mark as imported so other steps don't overwrite import data
            store.setImportSource('inav');
            // Re-stage imported params after start
            if (importedParams) {
              store.stageParams(importedParams);
            }
          }}
        />
      )}

      {/* Factory reset confirmation / progress dialog */}
      {resetPhase !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded border border-border bg-surface-1 p-6 shadow-2xl">
            {resetPhase === 'confirm' ? (
              <>
                <div className="mb-4 flex items-center gap-3">
                  <AlertTriangle size={24} className="text-yellow-400" />
                  <h3 className="text-lg font-bold text-foreground">
                    Reset to Factory Defaults?
                  </h3>
                </div>
                <p className="mb-3 text-sm text-muted">
                  Starting fresh will reset all parameters on the flight controller
                  to factory defaults. This erases any existing configuration
                  including motor assignments, receiver settings, flight modes,
                  and tuning.
                </p>
                <div className="mb-4 flex items-center gap-2 rounded bg-accent/10 border border-accent/20 px-3 py-2">
                  <Database size={14} className="text-accent shrink-0" />
                  <p className="text-xs text-foreground">
                    Your current parameters will be automatically backed up
                    before the reset.
                  </p>
                </div>
                {resetError && (
                  <p className="mb-3 text-sm text-danger">{resetError}</p>
                )}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={skipFactoryReset}
                    className="btn btn-ghost text-sm"
                  >
                    Skip Reset
                  </button>
                  <button
                    onClick={() => setResetPhase(null)}
                    className="btn btn-ghost text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeFactoryReset}
                    className="btn bg-yellow-600 text-white hover:bg-yellow-500 text-sm"
                  >
                    Reset & Continue
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 py-4">
                <Loader2 size={32} className="text-accent animate-spin" />
                <div className="text-center">
                  <p className="text-base font-semibold text-foreground">
                    {resetPhase === 'backup' && 'Backing up parameters...'}
                    {resetPhase === 'resetting' && 'Resetting to defaults...'}
                    {resetPhase === 'rebooting' && 'Rebooting flight controller...'}
                    {resetPhase === 'reconnecting' && 'Reconnecting...'}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {resetPhase === 'backup' && 'Saving a backup of your current configuration'}
                    {resetPhase === 'resetting' && 'Clearing all parameters to factory defaults'}
                    {resetPhase === 'rebooting' && 'Waiting for the flight controller to restart'}
                    {resetPhase === 'reconnecting' && 'Re-establishing connection with clean configuration'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disconnection overlay -- blocks all wizard interaction */}
      {/* Hidden during factory reset since disconnect is expected */}
      {!isConnected && resetPhase === null && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm rounded border border-danger/40 bg-surface-1 p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <Unplug size={24} className="text-danger" />
              <h3 className="text-lg font-bold text-foreground">
                Connection Lost
              </h3>
            </div>
            <p className="mb-2 text-sm text-muted">
              The flight controller has disconnected. The wizard requires an
              active connection to continue.
            </p>
            {writtenCount > 0 && (
              <p className="mb-2 text-xs text-warning">
                {writtenCount} parameter{writtenCount !== 1 ? 's' : ''} were written
                to the FC during this session. They will remain on the FC if you exit.
              </p>
            )}
            {connectionStatus === 'connecting' && (
              <p className="mb-2 flex items-center gap-2 text-sm text-accent">
                <RefreshCw size={14} className="animate-spin" />
                Reconnecting...
              </p>
            )}
            <div className="mt-4 flex justify-end gap-3">
              {portPath && connectionStatus !== 'connecting' && (
                <button
                  onClick={async () => {
                    try {
                      await connectionManager.connect(portPath, baudRate);
                    } catch {
                      // Error is handled by connection store
                    }
                  }}
                  className="btn btn-ghost gap-1.5"
                >
                  <RefreshCw size={13} />
                  Reconnect
                </button>
              )}
              <button
                onClick={() => abandon()}
                className="btn bg-danger text-white hover:bg-danger/80"
              >
                Exit Wizard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Abandon confirmation dialog */}
      {showAbandonConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !rollingBack && setShowAbandonConfirm(false)}
          />
          <div className="relative w-full max-w-sm rounded border border-border bg-surface-1 p-6 shadow-2xl">
            <h3 className="mb-3 text-lg font-bold text-foreground">
              Exit Setup Wizard?
            </h3>
            <p className="mb-2 text-sm text-muted">
              {writtenCount} parameter{writtenCount !== 1 ? 's' : ''} were written
              to the flight controller during this session.
            </p>
            <p className="mb-5 text-xs text-muted">
              You can keep the changes or undo them by restoring the
              configuration from before the wizard started.
            </p>
            {rollingBack && (
              <p className="mb-3 flex items-center gap-2 text-sm text-accent">
                <Loader2 size={14} className="animate-spin" />
                Restoring previous configuration...
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAbandonConfirm(false)}
                disabled={rollingBack}
                className="btn btn-ghost"
              >
                Continue Wizard
              </button>
              <button
                onClick={handleRollback}
                disabled={rollingBack}
                className="btn btn-ghost text-warning"
              >
                Undo Changes
              </button>
              <button
                onClick={() => {
                  setShowAbandonConfirm(false);
                  abandon();
                }}
                disabled={rollingBack}
                className="btn bg-accent text-background hover:bg-accent-hover"
              >
                Keep Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Render the appropriate step component based on step ID.
 * As steps are implemented, they replace PlaceholderStep here.
 */
function renderStep(
  stepId: string,
  onCanAdvanceChange: (value: boolean) => void
): React.ReactNode {
  switch (stepId) {
    case 'frame':
      return <FrameStep onCanAdvanceChange={onCanAdvanceChange} />;
    case 'motors_esc':
      return <MotorEscStep onCanAdvanceChange={onCanAdvanceChange} />;
    case 'output_mapping':
      return <OutputMappingStep onCanAdvanceChange={onCanAdvanceChange} />;
    case 'control_surfaces':
      return <ControlSurfacesStep onCanAdvanceChange={onCanAdvanceChange} />;
    case 'tilt_servos':
      return <TiltServosStep onCanAdvanceChange={onCanAdvanceChange} />;
    case 'transitions':
      return <TransitionsStep onCanAdvanceChange={onCanAdvanceChange} />;
    case 'receiver':
      return <ReceiverStep onCanAdvanceChange={onCanAdvanceChange} />;
    case 'gps':
      return <GpsStep onCanAdvanceChange={onCanAdvanceChange} />;
    case 'flight_modes':
      return <FlightModesStep onCanAdvanceChange={onCanAdvanceChange} />;
    case 'failsafes':
      return <FailsafesStep onCanAdvanceChange={onCanAdvanceChange} />;
    case 'compass':
      return <CompassStep onCanAdvanceChange={onCanAdvanceChange} />;
    case 'accelerometer':
      return <AccelerometerStep onCanAdvanceChange={onCanAdvanceChange} />;
    case 'initial_tune':
      return <InitialTuneStep onCanAdvanceChange={onCanAdvanceChange} />;
    case 'review':
      return <ReviewStep />;
    default: {
      // Placeholder steps use the default canAdvance=true from step change reset
      const step = useWizardStore.getState().currentStep();
      if (!step) return null;
      return <PlaceholderStep step={step} />;
    }
  }
}
