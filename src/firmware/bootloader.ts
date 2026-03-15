/**
 * ArduPilot/PX4 Bootloader Protocol
 *
 * Based on QGroundControl's Bootloader.cc and ArduPilot's bl_protocol.cpp.
 *
 * Protocol: command format is <opcode>[<data>]<EOC>
 *           response format is [<data>]<INSYNC><status>
 *
 * Flow: SYNC -> GET_DEVICE(BL_REV) -> GET_DEVICE(BOARD_ID) -> GET_DEVICE(FLASH_SIZE)
 *       -> CHIP_ERASE -> PROG_MULTI loop -> GET_CRC -> REBOOT
 */

/* ------------------------------------------------------------------ */
/*  Protocol constants (from bl_protocol.cpp)                          */
/* ------------------------------------------------------------------ */

const PROTO_INSYNC = 0x12;
const PROTO_EOC = 0x20;

const PROTO_OK = 0x10;
const PROTO_FAILED = 0x11;
const PROTO_INVALID = 0x13;
const PROTO_BAD_SILICON_REV = 0x14;

const PROTO_GET_SYNC = 0x21;
const PROTO_GET_DEVICE = 0x22;
const PROTO_CHIP_ERASE = 0x23;
const PROTO_PROG_MULTI = 0x27;
const PROTO_GET_CRC = 0x29;
const PROTO_BOOT = 0x30;

/** GET_DEVICE parameter indices (from QGC Bootloader.h) */
const INFO_BL_REV = 1;
const INFO_BOARD_ID = 2;
const INFO_BOARD_REV = 3;
const INFO_FLASH_SIZE = 4;

const PROG_MULTI_MAX = 64;

const BL_REV_MIN = 2;
const BL_REV_MAX = 5;

/** Default timeouts */
const SYNC_TIMEOUT = 1000;
const DEFAULT_TIMEOUT = 2000;
const ERASE_TIMEOUT = 20000;
const VERIFY_TIMEOUT = 10000;

/* ------------------------------------------------------------------ */
/*  CRC32 (matches AP_Math/crc.cpp)                                    */
/* ------------------------------------------------------------------ */

const CRC_TAB = new Uint32Array([
  0x00000000, 0x77073096, 0xee0e612c, 0x990951ba, 0x076dc419, 0x706af48f, 0xe963a535, 0x9e6495a3,
  0x0edb8832, 0x79dcb8a4, 0xe0d5e91e, 0x97d2d988, 0x09b64c2b, 0x7eb17cbd, 0xe7b82d07, 0x90bf1d91,
  0x1db71064, 0x6ab020f2, 0xf3b97148, 0x84be41de, 0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7,
  0x136c9856, 0x646ba8c0, 0xfd62f97a, 0x8a65c9ec, 0x14015c4f, 0x63066cd9, 0xfa0f3d63, 0x8d080df5,
  0x3b6e20c8, 0x4c69105e, 0xd56041e4, 0xa2677172, 0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b,
  0x35b5a8fa, 0x42b2986c, 0xdbbbc9d6, 0xacbcf940, 0x32d86ce3, 0x45df5c75, 0xdcd60dcf, 0xabd13d59,
  0x26d930ac, 0x51de003a, 0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423, 0xcfba9599, 0xb8bda50f,
  0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924, 0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d,
  0x76dc4190, 0x01db7106, 0x98d220bc, 0xefd5102a, 0x71b18589, 0x06b6b51f, 0x9fbfe4a5, 0xe8b8d433,
  0x7807c9a2, 0x0f00f934, 0x9609a88e, 0xe10e9818, 0x7f6a0dbb, 0x086d3d2d, 0x91646c97, 0xe6635c01,
  0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e, 0x6c0695ed, 0x1b01a57b, 0x8208f4c1, 0xf50fc457,
  0x65b0d9c6, 0x12b7e950, 0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3, 0xfbd44c65,
  0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2, 0x4adfa541, 0x3dd895d7, 0xa4d1c46d, 0xd3d6f4fb,
  0x4369e96a, 0x346ed9fc, 0xad678846, 0xda60b8d0, 0x44042d73, 0x33031de5, 0xaa0a4c5f, 0xdd0d7cc9,
  0x5005713c, 0x270241aa, 0xbe0b1010, 0xc90c2086, 0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f,
  0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17, 0x2eb40d81, 0xb7bd5c3b, 0xc0ba6cad,
  0xedb88320, 0x9abfb3b6, 0x03b6e20c, 0x74b1d29a, 0xead54739, 0x9dd277af, 0x04db2615, 0x73dc1683,
  0xe3630b12, 0x94643b84, 0x0d6d6a3e, 0x7a6a5aa8, 0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1,
  0xf00f9344, 0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb, 0x196c3671, 0x6e6b06e7,
  0xfed41b76, 0x89d32be0, 0x10da7a5a, 0x67dd4acc, 0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5,
  0xd6d6a3e8, 0xa1d1937e, 0x38d8c2c4, 0x4fdff252, 0xd1bb67f1, 0xa6bc5767, 0x3fb506dd, 0x48b2364b,
  0xd80d2bda, 0xaf0a1b4c, 0x36034af6, 0x41047a60, 0xdf60efc3, 0xa867df55, 0x316e8eef, 0x4669be79,
  0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236, 0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f,
  0xc5ba3bbe, 0xb2bd0b28, 0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7, 0xb5d0cf31, 0x2cd99e8b, 0x5bdeae1d,
  0x9b64c2b0, 0xec63f226, 0x756aa39c, 0x026d930a, 0x9c0906a9, 0xeb0e363f, 0x72076785, 0x05005713,
  0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38, 0x92d28e9b, 0xe5d5be0d, 0x7cdcefb7, 0x0bdbdf21,
  0x86d3d2d4, 0xf1d4e242, 0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1, 0x18b74777,
  0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c, 0x8f659eff, 0xf862ae69, 0x616bffd3, 0x166ccf45,
  0xa00ae278, 0xd70dd2ee, 0x4e048354, 0x3903b3c2, 0xa7672661, 0xd06016f7, 0x4969474d, 0x3e6e77db,
  0xaed16a4a, 0xd9d65adc, 0x40df0b66, 0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9,
  0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6, 0xbad03605, 0xcdd70693, 0x54de5729, 0x23d967bf,
  0xb3667a2e, 0xc4614ab8, 0x5d681b02, 0x2a6f2b94, 0xb40bbe37, 0xc30c8ea1, 0x5a05df1b, 0x2d02ef8d,
]);

export function crc32(data: Uint8Array, state = 0): number {
  for (let i = 0; i < data.length; i++) {
    const index = (state ^ data[i]) & 0xff;
    state = (CRC_TAB[index] ^ (state >>> 8)) >>> 0;
  }
  return state >>> 0;
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface BootloaderDeviceInfo {
  blRev: number;
  boardId: number;
  boardRev: number;
  flashSize: number;
}

export type FlashProgressCallback = (phase: string, progress: number, detail?: string) => void;

/** Serial transport interface */
export interface BootloaderTransport {
  write(data: Uint8Array): Promise<void>;
  read(n: number, timeoutMs: number): Promise<Uint8Array | null>;
  flush(): void;
}

/* ------------------------------------------------------------------ */
/*  Bootloader client (modeled on QGC's Bootloader.cc)                 */
/* ------------------------------------------------------------------ */

export class Bootloader {
  private transport: BootloaderTransport;
  public deviceInfo: BootloaderDeviceInfo | null = null;
  private _imageCRC = 0;

  constructor(transport: BootloaderTransport) {
    this.transport = transport;
  }

  /* ---- Low-level I/O ---- */

  private async write(data: Uint8Array): Promise<void> {
    await this.transport.write(data);
  }

  private async writeByte(b: number): Promise<void> {
    await this.write(new Uint8Array([b]));
  }

  private async read(n: number, timeoutMs = DEFAULT_TIMEOUT): Promise<Uint8Array> {
    const result = await this.transport.read(n, timeoutMs);
    if (!result || result.length < n) {
      throw new Error(`Timeout: expected ${n} bytes, got ${result?.length ?? 0}`);
    }
    return result;
  }

  private async readUint32(timeoutMs = DEFAULT_TIMEOUT): Promise<number> {
    const d = await this.read(4, timeoutMs);
    return (d[0] | (d[1] << 8) | (d[2] << 16) | (d[3] << 24)) >>> 0;
  }

  /**
   * Read INSYNC + status response.
   * Matches QGC's _getCommandResponse().
   */
  private async getCommandResponse(timeoutMs = DEFAULT_TIMEOUT): Promise<void> {
    const resp = await this.read(2, timeoutMs);
    if (resp[0] !== PROTO_INSYNC) {
      throw new Error(`Invalid sync response: 0x${resp[0].toString(16)} 0x${resp[1].toString(16)}`);
    }
    if (resp[1] === PROTO_OK) return;
    if (resp[1] === PROTO_FAILED) throw new Error('Command failed (PROTO_FAILED)');
    if (resp[1] === PROTO_INVALID) throw new Error('Command invalid (PROTO_INVALID)');
    if (resp[1] === PROTO_BAD_SILICON_REV) throw new Error('Bad silicon revision');
    throw new Error(`Unknown response: 0x${resp[1].toString(16)}`);
  }

  /**
   * Send a simple command (opcode + EOC) and wait for INSYNC+OK.
   * Matches QGC's _sendCommand().
   */
  private async sendCommand(cmd: number, responseTimeout = DEFAULT_TIMEOUT): Promise<void> {
    await this.write(new Uint8Array([cmd, PROTO_EOC]));
    await this.getCommandResponse(responseTimeout);
  }

  /**
   * GET_DEVICE with parameter -- returns one uint32.
   * Matches QGC's _protoGetDevice().
   * Sends: GET_DEVICE + param + EOC
   * Reads: uint32 + INSYNC + OK
   */
  private async protoGetDevice(param: number): Promise<number> {
    await this.write(new Uint8Array([PROTO_GET_DEVICE, param, PROTO_EOC]));
    const value = await this.readUint32();
    await this.getCommandResponse();
    return value;
  }

  /* ---- High-level commands ---- */

  /**
   * Sync with bootloader. Matches QGC's _sync():
   * flush input, then try GET_SYNC up to 3 times.
   */
  async sync(): Promise<boolean> {
    this.transport.flush();

    for (let i = 0; i < 3; i++) {
      try {
        await this.sendCommand(PROTO_GET_SYNC, SYNC_TIMEOUT);
        return true;
      } catch {
        // Retry
        this.transport.flush();
        await sleep(100);
      }
    }
    return false;
  }

  /**
   * Get board info from bootloader. Matches QGC's getBoardInfo():
   * sync -> getDevice(BL_REV) -> getDevice(BOARD_ID) -> getDevice(FLASH_SIZE)
   */
  async identify(): Promise<BootloaderDeviceInfo> {
    if (!await this.sync()) {
      throw new Error('Failed to sync with bootloader');
    }

    const blRev = await this.protoGetDevice(INFO_BL_REV);
    if (blRev < BL_REV_MIN || blRev > BL_REV_MAX) {
      throw new Error(`Unsupported bootloader version: ${blRev}`);
    }

    const boardId = await this.protoGetDevice(INFO_BOARD_ID);
    const flashSize = await this.protoGetDevice(INFO_FLASH_SIZE);

    // Try to get board_rev (may not be supported on all bootloaders)
    let boardRev = 0;
    try {
      boardRev = await this.protoGetDevice(INFO_BOARD_REV);
    } catch {
      // Not supported -- that's fine
    }

    this.deviceInfo = { blRev, boardId, boardRev, flashSize };
    return this.deviceInfo;
  }

  /**
   * Erase flash. Can take 5-20+ seconds.
   * Matches QGC's erase().
   */
  async erase(onProgress?: FlashProgressCallback): Promise<void> {
    onProgress?.('erase', 0, 'Erasing flash...');

    let timeout = ERASE_TIMEOUT;
    // Increase timeout for large flash (QGC: +4s per MB over 2MB)
    if (this.deviceInfo && this.deviceInfo.flashSize > 2000 * 1024) {
      timeout += (this.deviceInfo.flashSize / 1e6) * 4000;
    }

    await this.sendCommand(PROTO_CHIP_ERASE, timeout);
    onProgress?.('erase', 1, 'Erase complete');
  }

  /**
   * Program firmware. Matches QGC's _binProgram():
   * sends PROG_MULTI chunks, calculates CRC as it goes.
   */
  async program(image: Uint8Array, onProgress?: FlashProgressCallback): Promise<void> {
    // Pad to 4-byte boundary
    const padLen = (4 - (image.length % 4)) % 4;
    let padded: Uint8Array;
    if (padLen > 0) {
      padded = new Uint8Array(image.length + padLen);
      padded.set(image);
      padded.fill(0xff, image.length);
    } else {
      padded = image;
    }

    const imageSize = padded.length;
    let bytesSent = 0;
    this._imageCRC = 0;

    while (bytesSent < imageSize) {
      let bytesToSend = imageSize - bytesSent;
      if (bytesToSend > PROG_MULTI_MAX) bytesToSend = PROG_MULTI_MAX;

      const chunk = padded.slice(bytesSent, bytesSent + bytesToSend);

      // PROG_MULTI + count + data + EOC (matches QGC's write sequence)
      await this.writeByte(PROTO_PROG_MULTI);
      await this.writeByte(bytesToSend);
      await this.write(chunk);
      await this.writeByte(PROTO_EOC);
      await this.getCommandResponse();

      // CRC as we go (matches QGC)
      this._imageCRC = crc32(chunk, this._imageCRC);

      bytesSent += bytesToSend;
      onProgress?.('program', bytesSent / imageSize,
        `Programming ${Math.round((bytesSent / imageSize) * 100)}%`);
    }

    // Pad CRC to full flash size with 0xFF (matches QGC)
    if (this.deviceInfo) {
      let remaining = this.deviceInfo.flashSize - bytesSent;
      while (remaining > 0) {
        const fillByte = new Uint8Array([0xff]);
        this._imageCRC = crc32(fillByte, this._imageCRC);
        remaining--;
      }
    }
  }

  /**
   * Verify flash via CRC. Matches QGC's _verifyCRC().
   * Sends GET_CRC, reads uint32 CRC, compares with computed.
   */
  async verify(onProgress?: FlashProgressCallback): Promise<boolean> {
    onProgress?.('verify', 0, 'Verifying CRC...');

    await this.write(new Uint8Array([PROTO_GET_CRC, PROTO_EOC]));

    const flashCRC = await this.readUint32(VERIFY_TIMEOUT);
    await this.getCommandResponse();

    const match = flashCRC === this._imageCRC;
    onProgress?.('verify', 1,
      match
        ? `CRC verified: 0x${flashCRC.toString(16)}`
        : `CRC MISMATCH: board 0x${flashCRC.toString(16)} vs file 0x${this._imageCRC.toString(16)}`);

    return match;
  }

  /** Reboot into application. Matches QGC's reboot(). */
  async reboot(): Promise<void> {
    await this.writeByte(PROTO_BOOT);
    await this.writeByte(PROTO_EOC);
    // Don't wait for response -- board reboots immediately
  }
}

/* ------------------------------------------------------------------ */
/*  Serial transport adapter                                           */
/* ------------------------------------------------------------------ */

/**
 * Creates a BootloaderTransport from the Electron serial IPC.
 * Buffers incoming data and provides blocking read with timeout.
 */
export function createSerialTransport(): BootloaderTransport {
  const api = window.electronAPI;
  if (!api?.serial) throw new Error('Electron serial API not available');

  let buffer = new Uint8Array(0);
  let dataResolver: ((data: Uint8Array) => void) | null = null;
  let cleanup: (() => void) | null = null;

  function startListening() {
    if (cleanup) return;
    cleanup = api.serial.onData((data) => {
      const newBuf = new Uint8Array(buffer.length + data.length);
      newBuf.set(buffer);
      newBuf.set(data, buffer.length);
      buffer = newBuf;

      if (dataResolver) {
        const r = dataResolver;
        dataResolver = null;
        r(buffer);
      }
    });
  }

  startListening();

  return {
    async write(data: Uint8Array): Promise<void> {
      await api.serial.write(data);
    },

    async read(n: number, timeoutMs: number): Promise<Uint8Array | null> {
      const deadline = Date.now() + timeoutMs;

      while (buffer.length < n) {
        const remaining = deadline - Date.now();
        if (remaining <= 0) return null;

        await new Promise<Uint8Array>((resolve) => {
          dataResolver = resolve;
          setTimeout(() => {
            if (dataResolver === resolve) {
              dataResolver = null;
              resolve(buffer);
            }
          }, remaining);
        });
      }

      const result = buffer.slice(0, n);
      buffer = buffer.slice(n);
      return result;
    },

    flush(): void {
      buffer = new Uint8Array(0);
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
