import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useConnectionStore } from '@/store/connectionStore';
import { useVehicleStore, getVisiblePages } from '@/store/vehicleStore';
import { useParameterStore } from '@/store/parameterStore';
import { Loader2, CheckCircle2, Wand2 } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { SetupPage } from '@/pages/Setup/SetupPage';
import { PreflightPage } from '@/pages/Preflight/PreflightPage';
import { WiringPage } from '@/pages/Wiring/WiringPage';
import { CLIPage } from '@/pages/CLI/CLIPage';
import { ModesPage } from '@/pages/Modes/ModesPage';
import { ConfigurationPage } from '@/pages/Configuration/ConfigurationPage';
import { PortsPage } from '@/pages/Ports/PortsPage';
import { ReceiverPage } from '@/pages/Receiver/ReceiverPage';
import { MotorsPage } from '@/pages/Motors/MotorsPage';
import { FrameWizardPage } from '@/pages/FrameWizard/FrameWizardPage';
import { PIDTuningPage } from '@/pages/PIDTuning/PIDTuningPage';
import { NavigationPage } from '@/pages/Navigation/NavigationPage';
import { FailsafesPage } from '@/pages/Failsafes/FailsafesPage';
import { OSDPage } from '@/pages/OSD/OSDPage';
import { CalibrationPage } from '@/pages/Calibration/CalibrationPage';
import { BackupsPage } from '@/pages/Backups/BackupsPage';
import { TransitionsPage } from '@/pages/Transitions/TransitionsPage';
import { GpsPage } from '@/pages/Gps/GpsPage';
import { ControlSurfacesPage } from '@/pages/ControlSurfaces/ControlSurfacesPage';
import { BatteryPage } from '@/pages/Battery/BatteryPage';
import { EscPage } from '@/pages/Esc/EscPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { ExpertPage } from '@/pages/Expert/ExpertPage';
import { FirmwarePage } from '@/pages/Firmware/FirmwarePage';
import { SetupWizard } from '@/pages/SetupWizard/SetupWizard';
import { useWizardStore } from '@/pages/SetupWizard/wizardStore';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useConfirm } from '@/components/ConfirmDialog';
import { useDebugStore } from '@/store/debugStore';

export type PageId =
  | 'connect'
  | 'firmware'
  | 'wizard'
  | 'preflight'
  | 'wiring'
  | 'frame'
  | 'ports'
  | 'configuration'
  | 'receiver'
  | 'gps'
  | 'control_surfaces'
  | 'modes'
  | 'motors'
  | 'calibration'
  | 'pid_tuning'
  | 'navigation'
  | 'failsafes'
  | 'battery'
  | 'esc'
  | 'osd'
  | 'transitions'
  | 'backups'
  | 'cli'
  | 'expert';

export function Layout() {
  const [activePage, setActivePage] = useState<PageId>('connect');
  const connectionStatus = useConnectionStore((s) => s.status);
  const vehicleType = useVehicleStore((s) => s.type);
  const parameters = useParameterStore((s) => s.parameters);

  const prevStatus = useRef(connectionStatus);
  const didAutoRedirect = useRef(false);

  // Track whether the frame page has unsaved work
  const wizardDirty = useRef(false);
  const handleWizardDirtyChange = useCallback((dirty: boolean) => {
    wizardDirty.current = dirty;
  }, []);
  const { confirm, ConfirmDialogElement } = useConfirm();

  // Detect board configuration state and saved wizard progress
  const hasSavedWizardProgress = useMemo(() => {
    try {
      const raw = localStorage.getItem('ardugui-wizard-progress');
      if (!raw) return false;
      const data = JSON.parse(raw);
      return data.vehicleType != null && (data.currentStepIndex ?? 0) > 0;
    } catch { return false; }
  }, [connectionStatus, parameters.size]); // re-check on reconnect

  const isFreshBoard = useMemo(() => {
    if (!vehicleType || parameters.size === 0) return false;
    const accX = parameters.get('INS_ACCOFFS_X')?.value ?? 0;
    const accY = parameters.get('INS_ACCOFFS_Y')?.value ?? 0;
    const accZ = parameters.get('INS_ACCOFFS_Z')?.value ?? 0;
    const accelUncalibrated = accX === 0 && accY === 0 && accZ === 0;
    const rc1Min = parameters.get('RC1_MIN')?.value ?? 1100;
    const rc1Max = parameters.get('RC1_MAX')?.value ?? 1900;
    const rcUncalibrated = rc1Min === 1100 && rc1Max === 1900;
    // Frame: check FRAME_CLASS for copter, Q_FRAME_CLASS for VTOL, servo functions for plane
    let frameUnconfigured = false;
    if (vehicleType === 'copter') {
      frameUnconfigured = (parameters.get('FRAME_CLASS')?.value ?? 0) === 0;
    } else if (vehicleType === 'quadplane') {
      frameUnconfigured = (parameters.get('Q_FRAME_CLASS')?.value ?? 0) === 0;
    } else {
      // Plane: check if any servo has a non-zero function
      frameUnconfigured = true;
      for (let i = 1; i <= 16; i++) {
        if ((parameters.get(`SERVO${i}_FUNCTION`)?.value ?? 0) !== 0) {
          frameUnconfigured = false;
          break;
        }
      }
    }
    return accelUncalibrated && rcUncalibrated && frameUnconfigured;
  }, [parameters, vehicleType]);

  const [showFreshBoardPrompt, setShowFreshBoardPrompt] = useState(false);

  useEffect(() => {
    const wasConnected =
      prevStatus.current === 'connected' ||
      prevStatus.current === 'loading' ||
      prevStatus.current === 'connecting';
    const isNowDisconnected = connectionStatus === 'disconnected';

    if (wasConnected && isNowDisconnected) {
      const pending = useConnectionStore.getState().pendingPage;
      if (!pending) {
        setActivePage('connect');
      }
      didAutoRedirect.current = false;
      wizardDirty.current = false;
      setShowFreshBoardPrompt(false);
    }

    prevStatus.current = connectionStatus;
  }, [connectionStatus]);

  // Show wizard prompt when saved progress exists or fresh board detected
  useEffect(() => {
    if (
      connectionStatus === 'connected' &&
      (isFreshBoard || hasSavedWizardProgress) &&
      !didAutoRedirect.current &&
      !useConnectionStore.getState().pendingPage &&
      !useWizardStore.getState().active &&
      parameters.size > 0
    ) {
      didAutoRedirect.current = true;
      setShowFreshBoardPrompt(true);
    }
  }, [connectionStatus, isFreshBoard, hasSavedWizardProgress, parameters.size]);

  // Navigate to pending page after reconnection (e.g. after calibration reboot).
  // Uses a direct Zustand subscription instead of useEffect to avoid React
  // effect batching/timing issues. Fires synchronously when store state changes.
  useEffect(() => {
    const unsub = useConnectionStore.subscribe((state, prev) => {
      // Trigger when connection reaches 'connected' and a pending page exists
      if (
        state.status === 'connected' &&
        state.pendingPage &&
        useParameterStore.getState().parameters.size > 0
      ) {
        const page = state.pendingPage as PageId;
        console.log(`[Layout] pendingPage navigation: → ${page}`);
        setActivePage(page);
        state.setPendingPage(null);
        didAutoRedirect.current = true; // prevent fresh-board prompt from overriding
      }
      // Also check when params finish loading (status may already be connected)
      if (
        prev.status === 'connected' &&
        state.status === 'connected' &&
        state.pendingPage &&
        useParameterStore.getState().loaded
      ) {
        const page = state.pendingPage as PageId;
        console.log(`[Layout] pendingPage navigation (params loaded): → ${page}`);
        setActivePage(page);
        state.setPendingPage(null);
        didAutoRedirect.current = true;
      }
    });
    // Also subscribe to parameterStore for the case where params finish loading
    // after connection status already changed
    const unsubParams = useParameterStore.subscribe((state) => {
      const conn = useConnectionStore.getState();
      if (
        conn.status === 'connected' &&
        conn.pendingPage &&
        state.loaded
      ) {
        const page = conn.pendingPage as PageId;
        console.log(`[Layout] pendingPage navigation (from paramStore): → ${page}`);
        setActivePage(page);
        conn.setPendingPage(null);
        didAutoRedirect.current = true;
      }
    });
    return () => { unsub(); unsubParams(); };
  }, []);

  // Expose app state to the Electron main process for window-close guard.
  // Returns an object with dirty count, connection state, and wizard state.
  // Also keep beforeunload as a fallback for browser environments.
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__getArduGUIDirtyCount = () => {
      const dirty = useParameterStore.getState().dirtyParams.size;
      const connected = useConnectionStore.getState().status === 'connected';
      const wizardActive = useWizardStore.getState().active;
      // Return a number for backward compat: dirty count, or -1 if connected/wizard
      if (dirty > 0) return dirty;
      if (wizardActive) return -2;
      if (connected) return -1;
      return 0;
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const dirtyCount = useParameterStore.getState().dirtyParams.size;
      const connected = useConnectionStore.getState().status === 'connected';
      if (dirtyCount > 0 || connected) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const paramsLoaded = useParameterStore((s) => s.loaded);
  const debugEnabled = useDebugStore((s) => s.enabled);
  const visiblePages = useMemo(() => {
    // Only show full nav after params are loaded (status === 'connected')
    if (connectionStatus !== 'connected') return ['connect', 'firmware'];
    const params = useParameterStore.getState().parameters;
    const hasOsd = params.has('OSD_TYPE');
    return getVisiblePages(vehicleType, { hasOsd, expertMode: debugEnabled });
  }, [vehicleType, paramsLoaded, connectionStatus, debugEnabled]);

  // Redirect if the active page is no longer visible (e.g. expert mode toggled off)
  useEffect(() => {
    if (visiblePages.length > 0 && !visiblePages.includes(activePage)) {
      setActivePage('connect');
    }
  }, [visiblePages, activePage]);

  // Navigation with dirty guard -- warns if leaving frame page with unsaved work
  const handlePageChange = useCallback(
    async (page: PageId) => {
      if (!visiblePages.includes(page)) return;

      // Wizard sidebar entry -- start or resume the wizard
      if (page === 'wizard') {
        if (vehicleType) {
          const store = useWizardStore.getState();
          const resumed = store.loadProgress();
          if (!resumed) {
            store.start(vehicleType);
          }
        }
        return;
      }

      // If leaving the frame page with unsaved work, confirm
      if (activePage === 'frame' && page !== 'frame' && wizardDirty.current) {
        const ok = await confirm({
          title: 'Leave frame configuration?',
          message: 'You have unsaved frame configuration. Your changes will be lost.',
          confirmLabel: 'Leave',
          cancelLabel: 'Stay',
          danger: true,
        });
        if (!ok) return;
        wizardDirty.current = false;
      }

      setActivePage(page);
    },
    [visiblePages, activePage, vehicleType, confirm]
  );

  const renderPage = () => {
    switch (activePage) {
      case 'connect':
        return <SetupPage />;
      case 'firmware':
        return <FirmwarePage />;
      case 'preflight':
        return <PreflightPage />;
      case 'wiring':
        return <WiringPage />;
      case 'frame':
        return (
          <FrameWizardPage
            onDirtyChange={handleWizardDirtyChange}
            onNavigate={(page) => handlePageChange(page as PageId)}
          />
        );
      case 'ports':
        return <PortsPage />;
      case 'configuration':
        return <ConfigurationPage />;
      case 'modes':
        return <ModesPage />;
      case 'receiver':
        return <ReceiverPage />;
      case 'gps':
        return <GpsPage />;
      case 'control_surfaces':
        return <ControlSurfacesPage />;
      case 'motors':
        return <MotorsPage />;
      case 'calibration':
        return <CalibrationPage />;
      case 'pid_tuning':
        return <PIDTuningPage />;
      case 'navigation':
        return <NavigationPage />;
      case 'failsafes':
        return <FailsafesPage />;
      case 'battery':
        return <BatteryPage />;
      case 'esc':
        return <EscPage />;
      case 'osd':
        return <OSDPage />;
      case 'transitions':
        return <TransitionsPage />;
      case 'cli':
        return <CLIPage />;
      case 'backups':
        return <BackupsPage />;
      case 'expert':
        return <ExpertPage />;
      default:
        return <PlaceholderPage pageId={activePage} />;
    }
  };

  const rebootProgress = useConnectionStore((s) => s.rebootProgress);
  const wizardActive = useWizardStore((s) => s.active);

  // When wizard is active, render exclusive wizard layout
  if (wizardActive) {
    return (
      <div className="flex h-screen w-screen flex-col overflow-hidden">
        <div className="h-[2px] shrink-0 bg-accent" />
        <ErrorBoundary label="SetupWizard">
          <SetupWizard />
        </ErrorBoundary>

        {/* Reboot overlay persists even in wizard mode */}
        {rebootProgress && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 rounded bg-surface border border-border px-10 py-8 shadow-2xl max-w-sm text-center">
              {rebootProgress.phase === 'countdown' ? (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle2 size={28} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">Rebooting</p>
                    <p className="mt-1.5 text-sm text-muted">
                      Rebooting flight controller in{' '}
                      <span className="text-foreground font-semibold">{rebootProgress.countdown}s</span>...
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                    <Loader2 size={28} className="text-accent animate-spin" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      {rebootProgress.phase === 'rebooting' ? 'Rebooting...' : 'Reconnecting...'}
                    </p>
                    <p className="mt-1.5 text-sm text-muted">
                      {rebootProgress.phase === 'rebooting'
                        ? 'Waiting for flight controller to restart'
                        : 'Re-establishing connection'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      {/* Top accent stripe -- ArduGUI signature */}
      <div className="h-[2px] shrink-0 bg-accent" />
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activePage={activePage}
          visiblePages={visiblePages}
          onPageChange={handlePageChange}
          isConnected={connectionStatus === 'connected'}
        />
        <main className="flex-1 overflow-y-auto bg-background px-4 py-3">
          {renderPage()}
        </main>
      </div>
      <Footer />

      {/* Board detected -- wizard prompt */}
      {showFreshBoardPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowFreshBoardPrompt(false)}
          />
          <div className="relative w-full max-w-md rounded border border-accent/40 bg-surface-1 p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <Wand2 size={20} className="text-accent" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {hasSavedWizardProgress ? 'Resume Setup?' : 'Setup Wizard'}
                </h3>
                <p className="text-xs text-muted">
                  {hasSavedWizardProgress
                    ? 'You have a previous wizard session in progress.'
                    : isFreshBoard
                      ? 'This flight controller appears unconfigured.'
                      : 'Would you like to configure this board?'}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              {hasSavedWizardProgress && (
                <button
                  onClick={() => {
                    setShowFreshBoardPrompt(false);
                    const store = useWizardStore.getState();
                    store.loadProgress();
                  }}
                  className="w-full rounded border-2 border-accent bg-accent/10 p-3 text-left transition hover:bg-accent/20"
                >
                  <p className="text-sm font-bold text-accent">Continue where I left off</p>
                  <p className="text-xs text-muted mt-0.5">
                    Resume the wizard from your last step.
                  </p>
                </button>
              )}

              <button
                onClick={() => {
                  setShowFreshBoardPrompt(false);
                  if (vehicleType) {
                    const store = useWizardStore.getState();
                    store.clearSavedProgress();
                    store.start(vehicleType);
                  }
                }}
                className={`w-full rounded border-2 p-3 text-left transition ${
                  hasSavedWizardProgress
                    ? 'border-border bg-surface-0 hover:border-accent/40'
                    : 'border-accent bg-accent/10 hover:bg-accent/20'
                }`}
              >
                <p className={`text-sm font-bold ${hasSavedWizardProgress ? 'text-foreground' : 'text-accent'}`}>
                  Start from the beginning
                </p>
                <p className="text-xs text-muted mt-0.5">
                  Go through every step from Frame selection. Existing FC settings are kept
                  unless you change them.
                </p>
              </button>

              <button
                onClick={() => {
                  setShowFreshBoardPrompt(false);
                  if (vehicleType) {
                    const store = useWizardStore.getState();
                    store.clearSavedProgress();
                    store.start(vehicleType, { pendingReset: true });
                  }
                }}
                className="w-full rounded border-2 border-border bg-surface-0 p-3 text-left transition hover:border-accent/40"
              >
                <p className="text-sm font-bold text-foreground">Start fresh (factory reset)</p>
                <p className="text-xs text-muted mt-0.5">
                  Reset the flight controller to factory defaults, then start the wizard
                  on a clean slate.
                </p>
              </button>
            </div>

            <button
              onClick={() => setShowFreshBoardPrompt(false)}
              className="w-full text-center text-xs text-subtle hover:text-muted py-1"
            >
              Not now -- I'll configure manually
            </button>
          </div>
        </div>
      )}

      {/* Reboot-reconnect overlay -- lives in Layout so it persists across page changes */}
      {rebootProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded bg-surface border border-border px-10 py-8 shadow-2xl max-w-sm text-center">
            {rebootProgress.phase === 'countdown' ? (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 size={28} className="text-green-400" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">Calibration Successful!</p>
                  <p className="mt-1.5 text-sm text-muted">
                    Rebooting flight controller in{' '}
                    <span className="text-foreground font-semibold">{rebootProgress.countdown}s</span>…
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                  <Loader2 size={28} className="text-accent animate-spin" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {rebootProgress.phase === 'rebooting' ? 'Rebooting…' : 'Reconnecting…'}
                  </p>
                  <p className="mt-1.5 text-sm text-muted">
                    {rebootProgress.phase === 'rebooting'
                      ? 'Waiting for flight controller to restart'
                      : 'Re-establishing connection'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {ConfirmDialogElement}
    </div>
  );
}
