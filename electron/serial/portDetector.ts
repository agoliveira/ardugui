/**
 * portDetector.ts -- Passive serial port appearance detection.
 *
 * Uses fs.watch on /dev (Linux/Mac) to detect when ttyACM/ttyUSB/cu.usbmodem
 * device files are created by the kernel. This is completely passive -- no USB
 * probing, no SerialPort.list() calls. The kernel sends inotify/FSEvents
 * notifications when device files appear, which we forward to the renderer.
 *
 * On Windows (no /dev), falls back to a single SerialPort.list() check after
 * a quiet delay.
 */

import fs from 'fs';
import path from 'path';
import { SerialPort } from 'serialport';

type PortCallback = (portPath: string) => void;

let watcher: fs.FSWatcher | null = null;
let windowsTimer: ReturnType<typeof setTimeout> | null = null;
let callback: PortCallback | null = null;

/** Patterns for serial device names per platform. */
function matchesSerialDevice(name: string): boolean {
  // Linux: ttyACM0, ttyUSB0, etc.
  if (/^ttyACM\d+$/.test(name)) return true;
  if (/^ttyUSB\d+$/.test(name)) return true;
  // macOS: cu.usbmodemXXXX
  if (/^cu\.usbmodem/.test(name)) return true;
  return false;
}

/**
 * Start watching for a serial port to appear.
 * On Linux/Mac: passive inotify/FSEvents on /dev.
 * On Windows: single delayed scan after 8 seconds.
 *
 * Calls onPortAppeared(portPath) once when a matching port is detected,
 * then auto-stops.
 */
export function startPortDetector(onPortAppeared: PortCallback): void {
  stopPortDetector();
  callback = onPortAppeared;

  if (process.platform === 'win32') {
    // Windows: no /dev, scan once after 8 seconds of USB silence
    windowsTimer = setTimeout(async () => {
      try {
        const ports = await SerialPort.list();
        const comPort = ports.find((p) => p.path.startsWith('COM'));
        if (comPort && callback) {
          const cb = callback;
          stopPortDetector();
          cb(comPort.path);
        }
      } catch { /* ignore */ }
    }, 8000);
  } else {
    // Linux/Mac: watch /dev for new device files
    const devDir = '/dev';
    try {
      watcher = fs.watch(devDir, (eventType, filename) => {
        if (eventType === 'rename' && filename && matchesSerialDevice(filename)) {
          const fullPath = path.join(devDir, filename);
          // Verify the file exists (rename fires for both create and delete)
          try {
            fs.accessSync(fullPath, fs.constants.R_OK);
          } catch {
            return; // File was deleted, not created
          }
          if (callback) {
            const cb = callback;
            stopPortDetector();
            cb(fullPath);
          }
        }
      });
    } catch (err) {
      // Fallback: if /dev watching fails, use delayed scan
      console.warn('fs.watch /dev failed, falling back to delayed scan:', err);
      windowsTimer = setTimeout(async () => {
        try {
          const ports = await SerialPort.list();
          const port = ports.find((p) =>
            p.path.includes('ttyACM') || p.path.includes('ttyUSB') || p.path.includes('cu.usbmodem')
          );
          if (port && callback) {
            const cb = callback;
            stopPortDetector();
            cb(port.path);
          }
        } catch { /* ignore */ }
      }, 8000);
    }
  }
}

/**
 * Stop watching for port appearance.
 */
export function stopPortDetector(): void {
  if (watcher) {
    watcher.close();
    watcher = null;
  }
  if (windowsTimer) {
    clearTimeout(windowsTimer);
    windowsTimer = null;
  }
  callback = null;
}
