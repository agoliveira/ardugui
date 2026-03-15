/**
 * Firmware Flash Orchestrator
 *
 * Based on Mission Planner's UploadPX4() approach:
 * 1. If connected via MAVLink, send reboot-to-bootloader and close
 * 2. Scan ALL serial ports looking for a bootloader (30s timeout)
 * 3. On each port: open at 115200, try sync + identify
 * 4. If board_type matches firmware, proceed: erase -> program -> verify -> reboot
 *
 * This does NOT depend on knowing which port to use. The bootloader may
 * appear on a different port name after reboot.
 */

import { Bootloader, createSerialTransport } from './bootloader';
import { type ApjFirmware } from './downloader';
import { connectionManager } from '@/mavlink/connection';
import { useConnectionStore } from '@/store/connectionStore';
import { encodeCommandLong, MSG_ID_COMMAND_LONG, CRC_EXTRAS } from '@/mavlink/messages';
import { encodePacket } from '@/mavlink/encoder';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type FlashPhase =
  | 'rebooting'       // sending reboot-to-bootloader command
  | 'scanning'        // scanning ports for bootloader
  | 'identifying'     // reading board info
  | 'erasing'         // erasing flash (5-30s)
  | 'programming'     // writing firmware chunks
  | 'verifying'       // CRC verification
  | 'rebooting-app'   // rebooting into new firmware
  | 'complete'        // done
  | 'error';

export interface FlashProgress {
  phase: FlashPhase;
  progress: number;  // 0-1
  message: string;
}

export interface FlashOptions {
  /** The parsed firmware to flash */
  firmware: ApjFirmware;
  /** Progress callback */
  onProgress?: (progress: FlashProgress) => void;
}

export interface FlashResult {
  success: boolean;
  boardType?: number;
  boardRev?: number;
  flashSize?: number;
  blRev?: number;
  error?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const BOOTLOADER_BAUD = 115200;
const SCAN_TIMEOUT_MS = 30000;
const SCAN_INTERVAL_MS = 500;

/* ------------------------------------------------------------------ */
/*  Flash orchestrator                                                 */
/* ------------------------------------------------------------------ */

export async function flashFirmware(options: FlashOptions): Promise<FlashResult> {
  const { firmware, onProgress } = options;

  const api = window.electronAPI;
  if (!api?.serial) {
    return { success: false, error: 'Electron serial API not available' };
  }

  const report = (phase: FlashPhase, progress: number, message: string) => {
    onProgress?.({ phase, progress, message });
  };

  try {
    // ---- Phase 1: Reboot to bootloader ----
    const connStore = useConnectionStore.getState();
    const wasConnected = connStore.status === 'connected';

    if (wasConnected) {
      // Connected via MAVLink -- use connectionManager to send reboot
      report('rebooting', 0, 'Sending reboot-to-bootloader...');
      connStore.setPendingPage('firmware');

      try {
        await connectionManager.sendCommandLong(246, 3);
      } catch {
        // May not get ACK if FC reboots immediately
      }

      await sleep(1000);
      connectionManager.disconnect();
      await sleep(1000);
    } else {
      // Not connected via MAVLink. Try to send a raw MAVLink reboot
      // command to any available port -- the board may be running ArduPilot
      // but the user just hasn't connected in ArduGUI.
      try { await api.serial.close(); } catch { /* ignore */ }

      const ports = await api.serial.listPorts();
      if (ports.length > 0) {
        report('rebooting', 0, 'Attempting reboot to bootloader...');
        for (const port of ports) {
          try {
            await api.serial.open(port.path, 115200);
            await sleep(200);

            // Build a raw MAVLink v2 COMMAND_LONG for
            // MAV_CMD_PREFLIGHT_REBOOT_SHUTDOWN (246) with param1=3
            const rebootPacket = buildRawRebootPacket();
            await api.serial.write(rebootPacket);

            await sleep(500);
            await api.serial.close();
            await sleep(1000);
            break; // Only need to reboot one board
          } catch {
            try { await api.serial.close(); } catch { /* ignore */ }
          }
        }
      }
    }

    // ---- Phase 2: Scan all ports for bootloader (30s loop) ----
    report('scanning', 0, 'Scanning for bootloader...');

    const deadline = Date.now() + SCAN_TIMEOUT_MS;
    let foundPort: string | null = null;
    let bl: Bootloader | null = null;
    let scanCount = 0;

    while (Date.now() < deadline) {
      const elapsed = Date.now() + SCAN_TIMEOUT_MS - deadline;
      const pct = Math.min(elapsed / SCAN_TIMEOUT_MS, 0.95);
      const remaining = Math.ceil((deadline - Date.now()) / 1000);

      scanCount++;
      if (scanCount <= 3) {
        report('scanning', pct, 'Scanning serial ports for bootloader...');
      } else {
        report('scanning', pct,
          `Scanning for bootloader... (${remaining}s remaining) ` +
          'If the board does not respond, unplug and re-plug the USB connector.');
      }

      const ports = await api.serial.listPorts();

      for (const port of ports) {
        try {
          // Open port at bootloader baud
          await api.serial.open(port.path, BOOTLOADER_BAUD);

          // Brief delay for USB settle
          await sleep(100);

          // Create transport and try to sync
          const transport = createSerialTransport();
          const candidate = new Bootloader(transport);

          const synced = await candidate.sync();
          if (!synced) {
            await api.serial.close();
            continue;
          }

          // Synced -- try to identify
          const info = await candidate.identify();

          // Check if board_type matches the firmware
          if (info.boardId !== firmware.boardId) {
            // Wrong board -- close and keep looking
            await api.serial.close();
            continue;
          }

          // Found it!
          foundPort = port.path;
          bl = candidate;
          break;
        } catch {
          // Port failed -- close and try next
          try { await api.serial.close(); } catch { /* ignore */ }
        }
      }

      if (bl) break;

      await sleep(SCAN_INTERVAL_MS);
    }

    if (!bl || !foundPort) {
      useConnectionStore.getState().setPendingPage(null);
      return {
        success: false,
        error: 'Could not find bootloader on any serial port within 30 seconds. ' +
          'Try unplugging and re-plugging the USB connector, then click Flash again.',
      };
    }

    const info = bl.deviceInfo!;
    report('identifying', 1,
      `Found bootloader on ${foundPort}: board ${info.boardId} rev ${info.boardRev} ` +
      `flash ${(info.flashSize / 1024).toFixed(0)}KB`);

    // Validate firmware fits
    if (firmware.imageSize > info.flashSize) {
      await api.serial.close();
      useConnectionStore.getState().setPendingPage(null);
      return {
        success: false,
        boardType: info.boardId,
        error: `Firmware too large: ${firmware.imageSize} bytes but flash is ${info.flashSize} bytes`,
      };
    }

    // ---- Phase 3: Erase ----
    report('erasing', 0, 'Erasing flash (this may take a while)...');
    await bl.erase((_phase, progress, detail) => {
      report('erasing', progress, detail || 'Erasing...');
    });

    // ---- Phase 4: Program ----
    report('programming', 0, 'Programming firmware...');
    await bl.program(firmware.image, (_phase, progress, detail) => {
      report('programming', progress, detail || 'Programming...');
    });

    // ---- Phase 5: Verify ----
    report('verifying', 0, 'Verifying firmware...');
    const verified = await bl.verify((_phase, progress, detail) => {
      report('verifying', progress, detail || 'Verifying...');
    });

    if (!verified) {
      await api.serial.close();
      useConnectionStore.getState().setPendingPage(null);
      return {
        success: false,
        boardType: info.boardId,
        error: 'CRC verification failed -- the firmware was not written correctly. ' +
          'The board is still in bootloader mode and is safe. ' +
          'Click Flash again to retry. If the problem persists, try a different USB cable or port.',
      };
    }

    // ---- Phase 6: Reboot ----
    report('rebooting-app', 0, 'Rebooting into new firmware...');
    await bl.reboot();
    await api.serial.close();

    // Clear pending page
    useConnectionStore.getState().setPendingPage(null);

    report('complete', 1, 'Firmware flash complete!');

    return {
      success: true,
      boardType: info.boardId,
      boardRev: info.boardRev,
      flashSize: info.flashSize,
      blRev: info.blRev,
    };
  } catch (err) {
    try { await api.serial.close(); } catch { /* ignore */ }
    useConnectionStore.getState().setPendingPage(null);
    const errMsg = String(err);
    const recovery = errMsg.includes('Timeout') || errMsg.includes('sync')
      ? ' The board may still be in bootloader mode -- try clicking Flash again, or unplug and re-plug USB.'
      : ' If the board is unresponsive, unplug and re-plug USB to return it to bootloader mode, then retry.';
    report('error', 0, `Flash failed: ${errMsg}`);
    return { success: false, error: errMsg + recovery };
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Build a raw MAVLink v2 COMMAND_LONG packet for
 * MAV_CMD_PREFLIGHT_REBOOT_SHUTDOWN (246) with param1=3 (stay in bootloader).
 * Targets system=1, component=1 (default ArduPilot FC).
 * This allows rebooting the FC without a full MAVLink connection.
 */
function buildRawRebootPacket(): Uint8Array {
  const payload = encodeCommandLong({
    targetSystem: 1,
    targetComponent: 1,
    command: 246,  // MAV_CMD_PREFLIGHT_REBOOT_SHUTDOWN
    confirmation: 0,
    param1: 3,     // Stay in bootloader
    param2: 0,
    param3: 0,
    param4: 0,
    param5: 0,
    param6: 0,
    param7: 0,
  });

  const crcExtra = CRC_EXTRAS.get(MSG_ID_COMMAND_LONG);
  if (!crcExtra) throw new Error('Missing CRC_EXTRA for COMMAND_LONG');

  return encodePacket(MSG_ID_COMMAND_LONG, payload, crcExtra);
}
