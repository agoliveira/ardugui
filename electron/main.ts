import { app, BrowserWindow, dialog, Menu, ipcMain } from 'electron';
import path from 'path';
import { registerSerialHandlers } from './serial/serialBridge';
import { initDb, closeDb } from './db/parameterDb';
import { registerDbHandlers } from './db/dbBridge';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
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
    if (forceClose) return;

    e.preventDefault();

    mainWindow!.webContents
      .executeJavaScript(
        'window.__getArduGUIDirtyCount ? window.__getArduGUIDirtyCount() : 0'
      )
      .then((dirtyCount: number) => {
        if (dirtyCount > 0) {
          const choice = dialog.showMessageBoxSync(mainWindow!, {
            type: 'question',
            buttons: ['Discard Changes', 'Cancel'],
            defaultId: 1,
            title: 'Unsaved Changes',
            message: `You have ${dirtyCount} unsaved parameter change${dirtyCount > 1 ? 's' : ''}.`,
            detail:
              'If you close now, your changes will be lost. Save to FC first, or discard and close.',
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
