/**
 * stm32dfu.ts -- STM32 DfuSe firmware flash via WebUSB.
 *
 * Implements the USB DFU 1.1 protocol with ST Microsystems' DfuSe extensions
 * for sector-based flash on STM32 F4/F7/H7 chips.
 *
 * Protocol reference:
 *   - USB DFU 1.1: https://www.usb.org/sites/default/files/DFU_1.1.pdf
 *   - AN3156: STM32 USB DfuSe protocol
 *
 * Ported from INAV Configurator's stm32usbdfu.js and modernized to
 * async/await TypeScript. Stripped of all UI dependencies -- progress
 * is reported via a callback.
 *
 * Usage:
 *   const dfu = new Stm32Dfu();
 *   await dfu.flash(hexData, { onProgress: (pct, msg) => ... });
 */

import type { ParsedHex } from './hexParser';

/* ── USB device filters for known DFU bootloaders ─────────────── */

export const DFU_DEVICE_FILTERS: USBDeviceFilter[] = [
  { vendorId: 0x0483, productId: 0xDF11 }, // STM32
  { vendorId: 0x2E3C, productId: 0xDF11 }, // GD32
  { vendorId: 0x314B, productId: 0x0106 }, // APM32
];

/* ── DFU protocol constants ───────────────────────────────────── */

const DFU_REQUEST = {
  DETACH:    0x00,
  DNLOAD:    0x01,
  UPLOAD:    0x02,
  GETSTATUS: 0x03,
  CLRSTATUS: 0x04,
  GETSTATE:  0x05,
  ABORT:     0x06,
} as const;

const DFU_STATE = {
  appIDLE:                0,
  appDETACH:              1,
  dfuIDLE:                2,
  dfuDNLOAD_SYNC:         3,
  dfuDNBUSY:              4,
  dfuDNLOAD_IDLE:         5,
  dfuMANIFEST_SYNC:       6,
  dfuMANIFEST:            7,
  dfuMANIFEST_WAIT_RESET: 8,
  dfuUPLOAD_IDLE:         9,
  dfuERROR:               10,
} as const;

/* ── Types ────────────────────────────────────────────────────── */

interface FlashSector {
  numPages: number;
  startAddress: number;
  pageSize: number;
  totalSize: number;
}

interface FlashLayout {
  type: string;
  startAddress: number;
  sectors: FlashSector[];
  totalSize: number;
}

interface ErasePage {
  sector: number;
  page: number;
}

export type DfuProgressCallback = (percent: number, message: string) => void;

export type DfuDebugCallback = (msg: string) => void;

export interface DfuFlashOptions {
  onProgress?: DfuProgressCallback;
  onDebug?: DfuDebugCallback;
  verify?: boolean; // Default true
}

/* ── Helper: sleep ────────────────────────────────────────────── */

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/* ── DFU Protocol Implementation ──────────────────────────────── */

export class Stm32Dfu {
  private device: USBDevice | null = null;
  private transferSize = 2048;
  private flashLayout: FlashLayout | null = null;
  private dbg: DfuDebugCallback = () => {};

  /**
   * Find and open a DFU device.
   * Returns true if a device was found and opened successfully.
   */
  async open(): Promise<boolean> {
    try {
      // Use getDevices() only -- never requestDevice().
      // requestDevice() triggers Chromium's select-usb-device handler which
      // opens an extra OS-level file descriptor to the device. That extra
      // handle prevents proper USB cleanup on close, leaving the STM32
      // stuck in dfuMANIFEST_WAIT_RESET. INAV only uses getDevices().
      const devices = await navigator.usb.getDevices();
      this.device = devices.find((d) =>
        DFU_DEVICE_FILTERS.some(
          (f) => d.vendorId === f.vendorId && d.productId === f.productId
        )
      ) ?? null;

      if (!this.device) return false;

      await this.device.open();
      await this.device.claimInterface(0);
      return true;
    } catch (err) {
      console.warn('DFU open failed:', err);
      return false;
    }
  }

  /**
   * Close the DFU device.
   */
  async close(): Promise<void> {
    if (!this.device) return;
    this.dbg('close: releaseInterface(0)');
    try {
      await this.device.releaseInterface(0);
    } catch (e) {
      this.dbg(`close: releaseInterface failed: ${e}`);
    }
    this.dbg('close: device.close()');
    try {
      await this.device.close();
    } catch (e) {
      this.dbg(`close: device.close failed: ${e}`);
    }
    this.device = null;
    this.dbg('close: done');
  }

  /**
   * Flash firmware to the device.
   * The device must already be in DFU mode and open()'d.
   */
  async flash(hex: ParsedHex, options: DfuFlashOptions = {}): Promise<void> {
    const { onProgress, onDebug, verify = true } = options;
    this.dbg = onDebug ?? (() => {});

    if (!this.device) throw new Error('DFU device not open');

    const report = (pct: number, msg: string) => onProgress?.(pct, msg);

    // Step 0: Read chip info
    report(0, 'Reading chip info...');
    await this.readChipInfo();
    if (!this.flashLayout) throw new Error('Failed to read flash layout');

    const availableSize = this.flashLayout.totalSize -
      (hex.startLinearAddress - this.flashLayout.startAddress);

    if (hex.bytesTotal > availableSize) {
      throw new Error(
        `Firmware (${(hex.bytesTotal / 1024).toFixed(1)} KB) exceeds ` +
        `available flash (${(availableSize / 1024).toFixed(1)} KB)`
      );
    }

    // Read transfer size from functional descriptor
    await this.readTransferSize();

    // Step 1: Erase required pages
    report(0, 'Erasing flash...');
    await this.clearStatus();
    const pages = this.computeErasePages(hex);
    if (pages.length === 0) throw new Error('No flash pages to erase');

    for (let i = 0; i < pages.length; i++) {
      report((i / pages.length) * 30, `Erasing sector ${i + 1} of ${pages.length}...`);
      await this.erasePage(pages[i]);
    }

    // Step 2: Write firmware
    report(30, 'Writing firmware...');
    await this.writeData(hex, (pct) => {
      report(30 + pct * 0.4, `Writing firmware... ${Math.round(pct)}%`);
    });

    // Probe state after write
    try {
      const postWrite = await this.getStatus();
      this.dbg(`post-write state=${postWrite.state} delay=${postWrite.delay} status=${postWrite.status}`);
    } catch (e) {
      this.dbg(`post-write getStatus threw: ${e}`);
    }

    // Step 3: Verify
    if (verify) {
      report(70, 'Verifying...');
      await this.verifyData(hex, (pct) => {
        report(70 + pct * 0.25, `Verifying... ${Math.round(pct)}%`);
      });

      // Probe state after verify
      try {
        const postVerify = await this.getStatus();
        this.dbg(`post-verify state=${postVerify.state} delay=${postVerify.delay} status=${postVerify.status}`);
      } catch (e) {
        this.dbg(`post-verify getStatus threw: ${e}`);
      }
    }

    // Step 4: Leave DFU mode
    report(95, 'Rebooting into firmware...');

    // Probe DFU state before leave sequence
    try {
      const preLeaveStatus = await this.getStatus();
      this.dbg(`pre-leave state=${preLeaveStatus.state} delay=${preLeaveStatus.delay} status=${preLeaveStatus.status}`);
    } catch (e) {
      this.dbg(`pre-leave getStatus threw: ${e}`);
    }

    await this.leaveDfu(hex.data[0]?.address ?? 0x08000000);

    report(100, 'Flash complete');
  }

  /* ── USB control transfer helpers ────────────────────────────── */

  private async controlIn(
    request: number, value: number, iface: number, length: number
  ): Promise<Uint8Array> {
    const result = await this.device!.controlTransferIn(
      { recipient: 'interface', requestType: 'class', request, value, index: iface },
      length
    );
    if (result.status !== 'ok') throw new Error(`DFU IN failed: ${result.status}`);
    return new Uint8Array(result.data!.buffer);
  }

  private async controlOut(
    request: number, value: number, iface: number, data?: Uint8Array
  ): Promise<void> {
    const result = await this.device!.controlTransferOut(
      { recipient: 'interface', requestType: 'class', request, value, index: iface },
      data ?? new Uint8Array(0)
    );
    if (result.status !== 'ok') throw new Error(`DFU OUT failed: ${result.status}`);
  }

  /* ── DFU status/state helpers ────────────────────────────────── */

  private async getStatus(): Promise<{ status: number; state: number; delay: number }> {
    const data = await this.controlIn(DFU_REQUEST.GETSTATUS, 0, 0, 6);
    return {
      status: data[0],
      delay: data[1] | (data[2] << 8) | (data[3] << 16),
      state: data[4],
    };
  }

  private async clearStatus(): Promise<void> {
    // Loop CLRSTATUS until device is in dfuIDLE.
    // Per DFU spec §6.1.2: wait bwPollTimeout BEFORE sending next request.
    for (let i = 0; i < 100; i++) {
      const st = await this.getStatus();
      this.dbg(`clearStatus[${i}]: state=${st.state} delay=${st.delay} status=${st.status}`);
      if (st.state === DFU_STATE.dfuIDLE) return;
      if (st.delay > 0) await sleep(st.delay);
      await this.controlOut(DFU_REQUEST.CLRSTATUS, 0, 0);
    }
    throw new Error('Failed to reach dfuIDLE state');
  }

  /* ── Chip info from DFU descriptors ──────────────────────────── */

  private async getString(index: number): Promise<string> {
    const result = await this.device!.controlTransferIn(
      { recipient: 'device', requestType: 'standard', request: 6, value: 0x300 | index, index: 0 },
      255
    );
    if (result.status !== 'ok') return '';
    const buf = new Uint8Array(result.data!.buffer);
    const length = buf[0];
    let str = '';
    for (let i = 2; i < length; i += 2) {
      str += String.fromCharCode(buf[i] | (buf[i + 1] << 8));
    }
    return str;
  }

  private parseFlashDescriptor(str: string): FlashLayout | null {
    // Examples:
    //   "@Internal Flash  /0x08000000/04*016Kg,01*064Kg,07*128Kg" (F4)
    //   "@Internal Flash  /0x08000000/04*032Kg,01*128Kg,03*256Kg" (F7)
    const cleaned = str.replace(/[^\x20-\x7E]+/g, '');
    const parts = cleaned.split('/');
    if (parts.length < 3 || !parts[0].startsWith('@')) return null;

    const type = parts[0].trim().replace('@', '');
    const startAddress = parseInt(parts[1]);

    // Parse sector groups
    const sectors: FlashSector[] = [];
    let totalSize = 0;
    const groups = parts[2].split(',');

    for (const group of groups) {
      const match = group.trim().match(/^(\d+)\*(\d+)(.?)(.?)$/);
      if (!match) continue;

      const numPages = parseInt(match[1]);
      let pageSize = parseInt(match[2]);
      const unit = match[3];

      if (unit === 'M') pageSize *= 1024 * 1024;
      else if (unit === 'K') pageSize *= 1024;

      sectors.push({
        numPages,
        startAddress: startAddress + totalSize,
        pageSize,
        totalSize: numPages * pageSize,
      });
      totalSize += numPages * pageSize;
    }

    return { type, startAddress, sectors, totalSize };
  }

  private async readChipInfo(): Promise<void> {
    // WebUSB exposes interface descriptor strings via alternates.
    // STM32 DFU uses alternate settings to describe memory regions.
    // The string descriptor for Internal Flash contains the sector layout.
    const iface = this.device!.configuration?.interfaces[0];
    if (!iface) throw new Error('No USB interface found');

    for (const alt of iface.alternates) {
      // Try WebUSB's interfaceName first (populated from string descriptor)
      const name = alt.interfaceName ?? '';
      if (name) {
        const layout = this.parseFlashDescriptor(name);
        if (layout && layout.type.toLowerCase().includes('internal flash')) {
          this.flashLayout = layout;
          return;
        }
      }
    }

    // Fallback: manually read string descriptors via control transfers
    // (some Electron/platform combos don't populate interfaceName)
    for (const alt of iface.alternates) {
      // Read the interface descriptor to get iInterface index
      try {
        const result = await this.device!.controlTransferIn(
          { recipient: 'device', requestType: 'standard', request: 6, value: 0x200, index: 0 },
          18 + alt.alternateSetting * 9
        );
        if (result.status === 'ok' && result.data) {
          const buf = new Uint8Array(result.data.buffer);
          const offset = 9 + alt.alternateSetting * 9;
          if (offset + 8 < buf.length) {
            const iInterface = buf[offset + 8];
            if (iInterface > 0) {
              const str = await this.getString(iInterface);
              const layout = this.parseFlashDescriptor(str);
              if (layout && layout.type.toLowerCase().includes('internal flash')) {
                this.flashLayout = layout;
                return;
              }
            }
          }
        }
      } catch {
        // Continue to next alternate
      }
    }

    // Last resort: try string descriptor indices 4-8
    for (let idx = 4; idx <= 8; idx++) {
      try {
        const str = await this.getString(idx);
        if (!str) continue;
        const layout = this.parseFlashDescriptor(str);
        if (layout && layout.type.toLowerCase().includes('internal flash')) {
          this.flashLayout = layout;
          return;
        }
      } catch {
        // Continue
      }
    }

    throw new Error('Could not find internal flash descriptor');
  }

  private async readTransferSize(): Promise<void> {
    try {
      const result = await this.device!.controlTransferIn(
        { recipient: 'interface', requestType: 'standard', request: 6, value: 0x2100, index: 0 },
        255
      );
      if (result.status === 'ok' && result.data && result.data.byteLength >= 7) {
        const buf = new Uint8Array(result.data.buffer);
        const wTransferSize = buf[5] | (buf[6] << 8);
        if (wTransferSize > 0) {
          this.transferSize = wTransferSize;
        }
      }
    } catch {
      // Use default 2048
    }
  }

  /* ── DfuSe address command ──────────────────────────────────── */

  private async loadAddress(address: number): Promise<void> {
    const cmd = new Uint8Array([
      0x21,
      address & 0xFF,
      (address >> 8) & 0xFF,
      (address >> 16) & 0xFF,
      (address >> 24) & 0xFF,
    ]);
    await this.controlOut(DFU_REQUEST.DNLOAD, 0, 0, cmd);

    const st = await this.getStatus();
    this.dbg(`loadAddress(0x${address.toString(16)}): state=${st.state} delay=${st.delay} status=${st.status}`);
    if (st.state === DFU_STATE.dfuDNBUSY) {
      await sleep(st.delay);
      const st2 = await this.getStatus();
      this.dbg(`loadAddress post-wait: state=${st2.state} delay=${st2.delay} status=${st2.status}`);
      if (st2.state !== DFU_STATE.dfuDNLOAD_IDLE) {
        throw new Error(`Failed to set address: post-wait state ${st2.state}`);
      }
    } else if (st.state !== DFU_STATE.dfuDNLOAD_IDLE) {
      // dfuDNLOAD_IDLE means the command completed instantly (no delay needed).
      // Anything else (dfuERROR, etc.) is an error -- abort with cleanup.
      throw new Error(`Failed to request address load: state ${st.state}`);
    }
  }

  /* ── Erase ──────────────────────────────────────────────────── */

  private computeErasePages(hex: ParsedHex): ErasePage[] {
    if (!this.flashLayout) return [];

    const pages: ErasePage[] = [];

    for (let si = 0; si < this.flashLayout.sectors.length; si++) {
      const sector = this.flashLayout.sectors[si];
      for (let pi = 0; pi < sector.numPages; pi++) {
        const pageStart = sector.startAddress + pi * sector.pageSize;
        const pageEnd = pageStart + sector.pageSize - 1;

        for (const block of hex.data) {
          const blockEnd = block.address + block.bytes - 1;
          const overlaps =
            (block.address >= pageStart && block.address <= pageEnd) ||
            (blockEnd >= pageStart && blockEnd <= pageEnd) ||
            (block.address < pageStart && blockEnd > pageEnd);
          if (overlaps) {
            if (!pages.some((p) => p.sector === si && p.page === pi)) {
              pages.push({ sector: si, page: pi });
            }
          }
        }
      }
    }

    return pages;
  }

  private async erasePage(ep: ErasePage): Promise<void> {
    if (!this.flashLayout) throw new Error('No flash layout');

    const sector = this.flashLayout.sectors[ep.sector];
    const pageAddr = sector.startAddress + ep.page * sector.pageSize;

    const cmd = new Uint8Array([
      0x41,
      pageAddr & 0xFF,
      (pageAddr >> 8) & 0xFF,
      (pageAddr >> 16) & 0xFF,
      (pageAddr >> 24) & 0xFF,
    ]);

    await this.controlOut(DFU_REQUEST.DNLOAD, 0, 0, cmd);

    const st = await this.getStatus();
    if (st.state !== DFU_STATE.dfuDNBUSY) {
      throw new Error(`Erase failed at 0x${pageAddr.toString(16)}: unexpected state ${st.state}`);
    }

    await sleep(st.delay);
    const st2 = await this.getStatus();

    if (st2.state === DFU_STATE.dfuDNBUSY) {
      // H743 Rev.V workaround: clear status to get to dfuIDLE.
      // clearStatus() already verifies dfuIDLE -- no redundant check needed.
      await this.clearStatus();
    } else if (st2.state !== DFU_STATE.dfuDNLOAD_IDLE) {
      throw new Error(`Erase failed at 0x${pageAddr.toString(16)}: state ${st2.state}`);
    }
  }

  /* ── Write ──────────────────────────────────────────────────── */

  private async writeData(hex: ParsedHex, onProgress: (pct: number) => void): Promise<void> {
    let bytesWritten = 0;

    for (let bi = 0; bi < hex.data.length; bi++) {
      const block = hex.data[bi];
      let address = block.address;
      let blockOffset = 0;
      let wBlockNum = 2; // DFU block numbering starts at 2

      await this.loadAddress(address);

      while (blockOffset < block.bytes) {
        const chunkSize = Math.min(this.transferSize, block.bytes - blockOffset);
        const chunk = new Uint8Array(block.data.slice(blockOffset, blockOffset + chunkSize));

        await this.controlOut(DFU_REQUEST.DNLOAD, wBlockNum++, 0, chunk);

        const st = await this.getStatus();
        if (st.state !== DFU_STATE.dfuDNBUSY) {
          throw new Error(`Write failed at 0x${address.toString(16)}: state ${st.state}`);
        }

        await sleep(st.delay);
        const st2 = await this.getStatus();
        if (st2.state !== DFU_STATE.dfuDNLOAD_IDLE) {
          throw new Error(`Write failed at 0x${address.toString(16)}: post-write state ${st2.state}`);
        }

        address += chunkSize;
        blockOffset += chunkSize;
        bytesWritten += chunkSize;

        onProgress((bytesWritten / hex.bytesTotal) * 100);
      }
    }
  }

  /* ── Verify ─────────────────────────────────────────────────── */

  private async verifyData(hex: ParsedHex, onProgress: (pct: number) => void): Promise<void> {
    let bytesVerified = 0;

    for (let bi = 0; bi < hex.data.length; bi++) {
      const block = hex.data[bi];
      let blockOffset = 0;
      let wBlockNum = 2;

      await this.clearStatus();
      await this.loadAddress(block.address);
      await this.clearStatus();

      while (blockOffset < block.bytes) {
        const chunkSize = Math.min(this.transferSize, block.bytes - blockOffset);

        const readData = await this.controlIn(DFU_REQUEST.UPLOAD, wBlockNum++, 0, chunkSize);

        // Compare
        for (let i = 0; i < chunkSize; i++) {
          if (readData[i] !== block.data[blockOffset + i]) {
            const addr = block.address + blockOffset + i;
            throw new Error(
              `Verification failed at 0x${addr.toString(16)}: ` +
              `expected 0x${block.data[blockOffset + i].toString(16)}, ` +
              `got 0x${readData[i].toString(16)}`
            );
          }
        }

        blockOffset += chunkSize;
        bytesVerified += chunkSize;

        onProgress((bytesVerified / hex.bytesTotal) * 100);
      }
    }
  }

  /* ── Leave DFU mode ─────────────────────────────────────────── */

  private async leaveDfu(startAddress: number): Promise<void> {
    const d = this.dbg;
    d(`leaveDfu: startAddress=0x${startAddress.toString(16)}`);

    try {
      d('leaveDfu: clearStatus');
      await this.clearStatus();

      d(`leaveDfu: loadAddress(0x${startAddress.toString(16)})`);
      await this.loadAddress(startAddress);

      d('leaveDfu: DNLOAD(wValue=0, 0 bytes)');
      await this.controlOut(DFU_REQUEST.DNLOAD, 0, 0);

      d('leaveDfu: GETSTATUS (trigger manifest)');
      try {
        const st = await this.getStatus();
        d(`leaveDfu: GETSTATUS returned state=${st.state} delay=${st.delay} status=${st.status}`);
      } catch (e) {
        d(`leaveDfu: GETSTATUS threw (expected during reset): ${e}`);
      }
    } finally {
      // Match INAV's exact cleanup pattern:
      //   self.releaseInterface(0)  -- fire-and-forget
      //     .then(() => self.closeDevice())  -- close in microtask after release
      //   self.usbDevice = null  -- nulled immediately, before close completes
      d('leaveDfu: cleanup (INAV pattern: release -> then -> close, fire-and-forget)');
      const dev = this.device;
      this.device = null;
      if (dev) {
        dev.releaseInterface(0)
          .then(() => dev.close())
          .then(() => d('leaveDfu: close OK'))
          .catch((e: any) => d(`leaveDfu: cleanup: ${e}`));
      }
      d('leaveDfu: done');
    }
  }
}
