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
    await serialManager.write(data);
  });
}
