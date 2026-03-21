import { app, BrowserWindow, dialog, Menu, ipcMain, screen } from 'electron';
import path from 'path';
import fs from 'fs';
import { registerSerialHandlers } from './serial/serialBridge';
import { initDb, closeDb } from './db/parameterDb';
import { registerDbHandlers } from './db/dbBridge';

let mainWindow: BrowserWindow | null = null;

/* ------------------------------------------------------------------ */
/*  Global error safety nets                                            */
/* ------------------------------------------------------------------ */

// Prevent ENODEV and other serial errors from crashing the app when
// USB cables are yanked unexpectedly. These are non-fatal and the
// renderer-side reconnection logic handles recovery.
process.on('uncaughtException', (err) => {
  const msg = err?.message ?? '';
  if (msg.includes('ENODEV') || msg.includes('no such device') ||
      msg.includes('ENXIO') || msg.includes('EIO') ||
      msg.includes('port is not open') || msg.includes('Writing to COM')) {
    console.warn('[main] Suppressed serial error:', msg);
    return; // Swallow serial-related crashes
  }
  // Re-throw non-serial errors so they still surface
  console.error('[main] Uncaught exception:', err);
  // Show dialog so the user sees it instead of silent crash
  dialog.showErrorBox('Error', `An unexpected error occurred:\n${msg}`);
});

process.on('unhandledRejection', (reason) => {
  const msg = String(reason);
  if (msg.includes('ENODEV') || msg.includes('no such device') ||
      msg.includes('ENXIO') || msg.includes('EIO')) {
    console.warn('[main] Suppressed serial rejection:', msg);
    return;
  }
  console.error('[main] Unhandled rejection:', reason);
});

/* ------------------------------------------------------------------ */
/*  Window bounds persistence                                          */
/* ------------------------------------------------------------------ */

interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  maximized: boolean;
}

const boundsFile = () => path.join(app.getPath('userData'), 'window-bounds.json');

function loadBounds(): WindowBounds | null {
  try {
    const data = fs.readFileSync(boundsFile(), 'utf-8');
    const b = JSON.parse(data) as WindowBounds;
    // Validate bounds are on a visible display
    const displays = screen.getAllDisplays();
    const visible = displays.some((d) => {
      const area = d.workArea;
      return b.x >= area.x - 100 && b.x < area.x + area.width &&
             b.y >= area.y - 100 && b.y < area.y + area.height;
    });
    return visible ? b : null;
  } catch { return null; }
}

function saveBounds(win: BrowserWindow) {
  try {
    const maximized = win.isMaximized();
    // Save the non-maximized bounds so restoring doesn't lose the normal size
    const bounds = maximized ? (win as any).__normalBounds ?? win.getBounds() : win.getBounds();
    const data: WindowBounds = { ...bounds, maximized };
    fs.writeFileSync(boundsFile(), JSON.stringify(data));
  } catch { /* ignore */ }
}

/* ------------------------------------------------------------------ */

function createWindow() {
  const saved = loadBounds();

  mainWindow = new BrowserWindow({
    x: saved?.x,
    y: saved?.y,
    width: saved?.width ?? 1920,
    height: saved?.height ?? 1080,
    minWidth: 1280,
    minHeight: 720,
    title: 'ArduGUI',
    backgroundColor: '#0a0e17',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: true,
    },
  });

  if (saved?.maximized) {
    mainWindow.maximize();
  }

  // Track normal (non-maximized) bounds for persistence
  mainWindow.on('resize', () => {
    if (mainWindow && !mainWindow.isMaximized()) {
      (mainWindow as any).__normalBounds = mainWindow.getBounds();
    }
  });
  mainWindow.on('move', () => {
    if (mainWindow && !mainWindow.isMaximized()) {
      (mainWindow as any).__normalBounds = mainWindow.getBounds();
    }
  });

  // In development, Vite serves the renderer
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Intercept window close to check for unsaved parameters.
  let forceClose = false;

  mainWindow.on('close', (e) => {
    if (mainWindow) saveBounds(mainWindow);
    if (forceClose) return;

    e.preventDefault();

    mainWindow!.webContents
      .executeJavaScript(
        'window.__getArduGUIDirtyCount ? window.__getArduGUIDirtyCount() : 0'
      )
      .then((stateCode: number) => {
        if (stateCode !== 0) {
          let message: string;
          let detail: string;
          if (stateCode > 0) {
            message = `You have ${stateCode} unsaved parameter change${stateCode > 1 ? 's' : ''}.`;
            detail = 'If you close now, your changes will be lost. Save to FC first, or discard and close.';
          } else if (stateCode === -2) {
            message = 'The Setup Wizard is still running.';
            detail = 'Closing now will abandon the wizard. Any parameters already written to the FC will remain.';
          } else {
            message = 'A flight controller is connected.';
            detail = 'Closing will disconnect from the FC. Any unsaved changes in the UI will be lost.';
          }
          const choice = dialog.showMessageBoxSync(mainWindow!, {
            type: 'question',
            buttons: ['Close', 'Cancel'],
            defaultId: 1,
            title: 'Close ArduGUI?',
            message,
            detail,
          });
          if (choice === 0) {
            // Use destroy() to bypass the renderer's beforeunload handler,
            // which would otherwise veto the close and cause a deadlock.
            mainWindow!.destroy();
          }
        } else {
          forceClose = true;
          mainWindow!.close();
        }
      })
      .catch(() => {
        mainWindow!.destroy();
      });
  });

  // Build application menu with DevTools access
  const menuTemplate: Electron.MenuItemConstructorOptions[] = [
    { role: 'fileMenu' },
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            mainWindow?.webContents.toggleDevTools();
          },
        },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    { role: 'windowMenu' },
    {
      label: 'Help',
      submenu: [
        {
          label: 'ArduPilot Wiki',
          click: () => {
            require('electron').shell.openExternal(
              'https://ardupilot.org'
            );
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Robust DevTools shortcut -- catches F12 and Ctrl+Shift+I directly
  // Menu accelerators can be unreliable for F12 in Electron
  mainWindow.webContents.on('before-input-event', (_event, input) => {
    if (input.type !== 'keyDown') return;
    const toggleDevTools =
      input.key === 'F12' ||
      (input.control && input.shift && input.key === 'I') ||
      (input.meta && input.shift && input.key === 'I'); // macOS
    if (toggleDevTools) {
      mainWindow?.webContents.toggleDevTools();
    }
  });
}

// Register serial port IPC handlers
registerSerialHandlers(() => mainWindow);

// Register parameter database IPC handlers
registerDbHandlers();

// IPC: toggle DevTools from renderer
ipcMain.handle('toggle-devtools', () => {
  mainWindow?.webContents.toggleDevTools();
});

// IPC: save file via native dialog
ipcMain.handle('fs:save-file', async (_event, defaultName: string, content: string) => {
  if (!mainWindow) return null;
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'TSV Files', extensions: ['tsv'] },
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Parameter Files', extensions: ['param'] },
    ],
  });
  if (canceled || !filePath) return null;
  const fs = await import('fs/promises');
  await fs.writeFile(filePath, content, 'utf-8');
  return filePath;
});

// IPC: open file via native dialog
ipcMain.handle('fs:open-file', async (_event, filters: { name: string; extensions: string[] }[]) => {
  if (!mainWindow) return null;
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    filters,
    properties: ['openFile'],
  });
  if (canceled || filePaths.length === 0) return null;
  const fs = await import('fs/promises');
  const content = await fs.readFile(filePaths[0], 'utf-8');
  return { path: filePaths[0], content };
});

// IPC: fetch URL from main process (bypasses renderer CSP/CORS restrictions)
ipcMain.handle('net:fetch', async (_event, url: string) => {
  const { net } = await import('electron');
  try {
    const response = await net.fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    return { ok: true, text };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});

app.whenReady().then(async () => {
  await initDb();
  createWindow();
});

app.on('will-quit', () => {
  closeDb();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
