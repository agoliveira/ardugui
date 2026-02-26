import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useConnectionStore } from '@/store/connectionStore';
import { useVehicleStore, getVisiblePages } from '@/store/vehicleStore';
import { useParameterStore } from '@/store/parameterStore';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { SetupPage } from '@/pages/Setup/SetupPage';
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
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { ExpertPage } from '@/pages/Expert/ExpertPage';
import { useDebugStore } from '@/store/debugStore';

export type PageId =
  | 'connect'
  | 'frame'
  | 'ports'
  | 'configuration'
  | 'receiver'
  | 'modes'
  | 'motors'
  | 'calibration'
  | 'pid_tuning'
  | 'navigation'
  | 'failsafes'
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

  // Detect unconfigured frame
  const isFrameUnconfigured = useMemo(() => {
    if (!vehicleType) return false;
    if (vehicleType === 'copter') {
      return (parameters.get('FRAME_CLASS')?.value ?? 0) === 0;
    }
    for (let i = 1; i <= 16; i++) {
      if ((parameters.get(`SERVO${i}_FUNCTION`)?.value ?? 0) !== 0) return false;
    }
    return true;
  }, [parameters, vehicleType]);

  useEffect(() => {
    const wasConnected =
      prevStatus.current === 'connected' ||
      prevStatus.current === 'loading' ||
      prevStatus.current === 'connecting';
    const isNowDisconnected = connectionStatus === 'disconnected';

    if (wasConnected && isNowDisconnected) {
      // If a reboot-reconnect cycle is in progress (pendingPage set),
      // stay on the current page so the user sees reboot progress.
      // Otherwise, navigate to the connect page as usual.
      const pending = useConnectionStore.getState().pendingPage;
      if (!pending) {
        setActivePage('connect');
      }
      didAutoRedirect.current = false;
      wizardDirty.current = false;
    }

    prevStatus.current = connectionStatus;
  }, [connectionStatus]);

  // Auto-redirect to frame page if unconfigured (once per connection)
  useEffect(() => {
    if (
      connectionStatus === 'connected' &&
      isFrameUnconfigured &&
      !didAutoRedirect.current &&
      !useConnectionStore.getState().pendingPage && // don't override reboot-return navigation
      parameters.size > 0
    ) {
      didAutoRedirect.current = true;
      setActivePage('frame');
    }
  }, [connectionStatus, isFrameUnconfigured, parameters.size]);

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
        didAutoRedirect.current = true; // prevent frame redirect from overriding
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

  // Expose dirty-param count to the Electron main process for window-close guard.
  // Also keep beforeunload as a fallback for browser environments.
  useEffect(() => {
    // Callable from main process via executeJavaScript
    (window as unknown as Record<string, unknown>).__getArduGUIDirtyCount = () =>
      useParameterStore.getState().dirtyParams.size;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const dirtyCount = useParameterStore.getState().dirtyParams.size;
      if (dirtyCount > 0) {
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
    if (connectionStatus !== 'connected') return ['connect'];
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
    (page: PageId) => {
      if (!visiblePages.includes(page)) return;

      // If leaving the frame page with unsaved work, confirm
      if (activePage === 'frame' && page !== 'frame' && wizardDirty.current) {
        const confirmed = window.confirm(
          'You have unsaved frame configuration. Are you sure you want to leave? Your changes will be lost.'
        );
        if (!confirmed) return;
        wizardDirty.current = false;
      }

      setActivePage(page);
    },
    [visiblePages, activePage]
  );

  const renderPage = () => {
    switch (activePage) {
      case 'connect':
        return <SetupPage />;
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
      case 'osd':
        return <OSDPage />;
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
    </div>
  );
}
