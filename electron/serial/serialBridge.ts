import { ipcMain, type BrowserWindow } from 'electron';
import { SerialManager } from './serialManager';

const serialManager = new SerialManager();

export function registerSerialHandlers(
  getWindow: () => BrowserWindow | null
) {
  ipcMain.handle('serial:list-ports', async () => {
    return serialManager.listPorts();
  });

  ipcMain.handle(
    'serial:open',
    async (_event, portPath: string, baudRate: number) => {
      await serialManager.open(portPath, baudRate, {
        onData: (data) => {
          const win = getWindow();
          if (win && !win.isDestroyed()) {
            win.webContents.send('serial:data', data);
          }
        },
        onError: (error) => {
          const win = getWindow();
          if (win && !win.isDestroyed()) {
            win.webContents.send('serial:error', error);
          }
        },
        onClose: () => {
          const win = getWindow();
          if (win && !win.isDestroyed()) {
            win.webContents.send('serial:close');
          }
        },
      });
    }
  );

  ipcMain.handle('serial:close', async () => {
    await serialManager.close();
  });

  ipcMain.handle('serial:write', async (_event, data: Uint8Array) => {
    try {
      await serialManager.write(data);
    } catch {
      // Silently drop write errors -- renderer handles reconnection
    }
  });

  ipcMain.handle('serial:set-baud', async (_event, baudRate: number) => {
    await serialManager.setBaudRate(baudRate);
  });

  // Port watcher -- polls for USB changes and notifies renderer
  ipcMain.handle('serial:start-port-watch', async () => {
    serialManager.startPortWatch((ports) => {
      const win = getWindow();
      if (win && !win.isDestroyed()) {
        win.webContents.send('serial:ports-changed', ports);
      }
    });
  });

  ipcMain.handle('serial:stop-port-watch', async () => {
    serialManager.stopPortWatch();
  });

  // Passive port detector -- inotify/FSEvents on Linux/Mac, delayed scan on Windows.
  // Used after DFU flash to detect when the board finishes rebooting without
  // any USB probing that could interfere with the boot process.
  ipcMain.handle('serial:start-port-detect', async () => {
    const { startPortDetector } = await import('./portDetector');
    startPortDetector((portPath) => {
      const win = getWindow();
      if (win && !win.isDestroyed()) {
        win.webContents.send('serial:port-appeared', portPath);
      }
    });
  });

  ipcMain.handle('serial:stop-port-detect', async () => {
    const { stopPortDetector } = await import('./portDetector');
    stopPortDetector();
  });
}
