/**
 * MAVFTP -- MAVLink File Transfer Protocol implementation.
 *
 * Downloads parameters via @PARAM/param.pck (packed binary format).
 * This is dramatically faster than PARAM_REQUEST_LIST (~2s vs 10-30s).
 *
 * Format spec: https://github.com/ardupilot/ardupilot/blob/master/libraries/AP_Filesystem/README.md
 * Protocol ref: https://mavlink.io/en/services/ftp.html
 * Reference: MAVProxy/modules/mavproxy_ftp.py, MissionPlanner MAVFtp.cs
 */

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/** FTP Opcodes (client -> server) */
const FTP_OP = {
  NONE: 0,
  TERMINATE_SESSION: 1,
  RESET_SESSIONS: 2,
  LIST_DIRECTORY: 3,
  OPEN_FILE_RO: 4,
  READ_FILE: 5,
  CREATE_FILE: 6,
  WRITE_FILE: 7,
  REMOVE_FILE: 8,
  CREATE_DIRECTORY: 9,
  REMOVE_DIRECTORY: 10,
  OPEN_FILE_WO: 11,
  TRUNCATE_FILE: 12,
  RENAME: 13,
  CALC_FILE_CRC32: 14,
  BURST_READ_FILE: 15,
} as const;

/** FTP response opcodes (server -> client) */
const OP_ACK = 128;
const OP_NAK = 129;

/** NAK error codes */
const ERR_NONE = 0;
const ERR_FAIL = 1;
const ERR_FAIL_ERRNO = 2;
const ERR_INVALID_DATA_SIZE = 3;
const ERR_INVALID_SESSION = 4;
const ERR_NO_SESSIONS_AVAILABLE = 5;
const ERR_EOF = 6;
const ERR_UNKNOWN_COMMAND = 7;
const ERR_FILE_EXISTS = 8;
const ERR_FILE_PROTECTED = 9;
const ERR_FILE_NOT_FOUND = 10;

const ERR_NAMES: Record<number, string> = {
  [ERR_NONE]: 'None',
  [ERR_FAIL]: 'Fail',
  [ERR_FAIL_ERRNO]: 'FailErrno',
  [ERR_INVALID_DATA_SIZE]: 'InvalidDataSize',
  [ERR_INVALID_SESSION]: 'InvalidSession',
  [ERR_NO_SESSIONS_AVAILABLE]: 'NoSessionsAvailable',
  [ERR_EOF]: 'EOF',
  [ERR_UNKNOWN_COMMAND]: 'UnknownCommand',
  [ERR_FILE_EXISTS]: 'FileExists',
  [ERR_FILE_PROTECTED]: 'FileProtected',
  [ERR_FILE_NOT_FOUND]: 'FileNotFound',
};

/** Max data bytes per FTP payload */
const FTP_DATA_MAX = 239;

/** Read chunk size -- use less than max to keep some radios happy */
const READ_SIZE = 239;

/** Param file path on ArduPilot (packed binary format, v4.4+) */
const PARAM_FILE_PATH = '@PARAM/param.pck';

/** Legacy text param file path (older firmware) */
const PARAM_FILE_PATH_LEGACY = '@PARAM/param.parm';

/* ------------------------------------------------------------------ */
/*  FTP Payload encoding / decoding                                    */
/* ------------------------------------------------------------------ */

interface FtpPayload {
  seqNumber: number;
  session: number;
  opcode: number;
  size: number;
  reqOpcode: number;
  burstComplete: number;
  offset: number;
  data: Uint8Array;
}

/**
 * Encode an FTP payload (12-byte header + data) into a 251-byte buffer
 * for the FILE_TRANSFER_PROTOCOL message.
 */
function encodeFtpPayload(p: FtpPayload): Uint8Array {
  const buf = new Uint8Array(251);
  const dv = new DataView(buf.buffer);
  dv.setUint16(0, p.seqNumber, true);
  buf[2] = p.session;
  buf[3] = p.opcode;
  buf[4] = p.size;
  buf[5] = p.reqOpcode;
  buf[6] = p.burstComplete;
  buf[7] = 0; // padding
  dv.setUint32(8, p.offset, true);
  if (p.data.length > 0) {
    buf.set(p.data.subarray(0, Math.min(p.data.length, FTP_DATA_MAX)), 12);
  }
  return buf;
}

/**
 * Decode an FTP payload from the FILE_TRANSFER_PROTOCOL message payload.
 * The FTP payload starts at offset 3 in the MAVLink payload
 * (after target_network, target_system, target_component).
 */
function decodeFtpPayload(mavPayload: Uint8Array): FtpPayload {
  // FTP payload starts at byte 3 of the MAVLink message payload
  // The incoming payload may be zero-trimmed (MAVLink v2), so we need
  // to zero-extend to at least 12 bytes (FTP header size) before parsing.
  const raw = mavPayload.subarray(3);
  const ftp = new Uint8Array(Math.max(raw.length, 12 + FTP_DATA_MAX));
  ftp.set(raw);
  const dv = new DataView(ftp.buffer, ftp.byteOffset, ftp.byteLength);
  const size = ftp[4];
  return {
    seqNumber: dv.getUint16(0, true),
    session: ftp[2],
    opcode: ftp[3],
    size,
    reqOpcode: ftp[5],
    burstComplete: ftp[6],
    offset: dv.getUint32(8, true),
    data: ftp.subarray(12, 12 + Math.min(size, FTP_DATA_MAX)),
  };
}

/**
 * Encode the full FILE_TRANSFER_PROTOCOL MAVLink message payload
 * (target_network + target_system + target_component + ftp_payload).
 *
 * IMPORTANT: Do NOT add sentinel bytes to prevent zero-trimming.
 * ArduPilot's FTP handler validates that request.size matches the
 * available data calculated from msg.len. If we force full 254 bytes
 * on wire, data_available=239 which won't match size=17. MAVLink v2
 * zero-trimming is correct here -- ArduPilot expects it.
 */
function encodeFtpMessage(
  targetSystem: number,
  targetComponent: number,
  ftpPayload: Uint8Array,
): Uint8Array {
  const buf = new Uint8Array(254); // 3 + 251
  buf[0] = 0; // target_network
  buf[1] = targetSystem;
  buf[2] = targetComponent;
  buf.set(ftpPayload, 3);
  // No sentinel -- let zero-trimming reduce the message size.
  // ArduPilot FTP checks: data_available = msg.len - 3 - 12 == request.size
  return buf;
}

/* ------------------------------------------------------------------ */
/*  Param file parser                                                  */
/* ------------------------------------------------------------------ */

export interface ParsedParam {
  name: string;
  value: number;
}

/** AP_Param type sizes */
const AP_PARAM_SIZES: Record<number, number> = {
  0: 0,  // NONE
  1: 1,  // INT8
  2: 2,  // INT16
  3: 4,  // INT32
  4: 4,  // FLOAT
};

/**
 * Parse an ArduPilot param.pck file (packed binary format).
 *
 * Format (from AP_Filesystem/README.md):
 *   Header: magic(u16) + num_params(u16) + total_params(u16)
 *   Per param: type:4|flags:4 + common_len:4|name_len:4 + name + value [+ default]
 *   Zero pad bytes between entries for block alignment.
 */
export function parseParamPck(data: Uint8Array): ParsedParam[] {
  if (data.length < 6) return [];
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);

  const magic = dv.getUint16(0, true);
  // Accept both 0x671b and 0x671c (withdefaults version)
  if ((magic & 0xFFF0) !== 0x6710) {
    console.warn(`MAVFTP: Unknown param.pck magic: 0x${magic.toString(16)}`);
    return [];
  }

  const numParams = dv.getUint16(2, true);
  const totalParams = dv.getUint16(4, true);
  console.log(`MAVFTP: param.pck header: magic=0x${magic.toString(16)} numParams=${numParams} totalParams=${totalParams}`);

  const params: ParsedParam[] = [];
  let offset = 6;
  let prevName = '';

  while (offset < data.length && params.length < numParams) {
    // Skip zero padding bytes
    while (offset < data.length && data[offset] === 0) {
      offset++;
    }
    if (offset >= data.length) break;

    // Byte 0: type(4 low) | flags(4 high)
    const typeByte = data[offset++];
    const ptype = typeByte & 0x0F;
    const flags = (typeByte >> 4) & 0x0F;
    if (offset >= data.length) break;

    // Byte 1: common_len(4 low) | name_len(4 high)
    const nameByte = data[offset++];
    const commonLen = nameByte & 0x0F;
    const nameLen = ((nameByte >> 4) & 0x0F) + 1; // stored as len-1

    // Read non-common part of name
    if (offset + nameLen > data.length) break;
    const nameSuffix = String.fromCharCode(...data.subarray(offset, offset + nameLen));
    offset += nameLen;

    // Reconstruct full name from common prefix + suffix
    const name = prevName.substring(0, commonLen) + nameSuffix;
    prevName = name;

    // Read value based on type
    const valueSize = AP_PARAM_SIZES[ptype] ?? 0;
    if (valueSize === 0 || offset + valueSize > data.length) break;

    let value: number;
    switch (ptype) {
      case 1: // INT8
        value = dv.getInt8(offset);
        break;
      case 2: // INT16
        value = dv.getInt16(offset, true);
        break;
      case 3: // INT32
        value = dv.getInt32(offset, true);
        break;
      case 4: // FLOAT
        value = dv.getFloat32(offset, true);
        break;
      default:
        value = 0;
    }
    offset += valueSize;

    // Skip optional default value if flags bit 0 is set
    if (flags & 0x01) {
      offset += valueSize;
    }

    params.push({ name, value });
  }

  return params;
}

/**
 * Parse a plain text .parm file (legacy format, older firmware).
 * Format: one param per line, "NAME value" separated by whitespace or comma.
 */
export function parseParamFile(text: string): ParsedParam[] {
  const params: ParsedParam[] = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(/[\s,]+/);
    if (parts.length < 2) continue;
    const name = parts[0];
    const value = parseFloat(parts[1]);
    if (isNaN(value)) continue;
    params.push({ name, value });
  }
  return params;
}

/* ------------------------------------------------------------------ */
/*  MAVFTP Client                                                      */
/* ------------------------------------------------------------------ */

export type SendPacketFn = (messageId: number, payload: Uint8Array) => Promise<void>;

export interface MavFtpOptions {
  targetSystem: number;
  targetComponent: number;
  sendPacket: SendPacketFn;
  timeout?: number;
  onProgress?: (progress: number) => void;
  log?: (msg: string) => void;
}

export class MavFtpClient {
  private targetSystem: number;
  private targetComponent: number;
  private sendPacket: SendPacketFn;
  private timeout: number;
  private onProgress?: (progress: number) => void;
  private log: (msg: string) => void;

  private seq: number = 0;
  private session: number = 0;
  private fileSize: number = 0;
  private lastNakError: string = '';

  /** Incoming FTP response handler -- set by each operation */
  private responseHandler: ((payload: FtpPayload) => void) | null = null;

  constructor(options: MavFtpOptions) {
    this.targetSystem = options.targetSystem;
    this.targetComponent = options.targetComponent;
    this.sendPacket = options.sendPacket;
    this.timeout = options.timeout ?? 5000;
    this.onProgress = options.onProgress;
    this.log = options.log ?? ((msg) => console.log(msg));
  }

  /**
   * Called by the connection manager when a FILE_TRANSFER_PROTOCOL
   * message is received. Routes it to the current operation handler.
   */
  handleFtpMessage(mavPayload: Uint8Array): void {
    const ftp = decodeFtpPayload(mavPayload);
    // Only log non-data messages (errors, NAKs, open/close) to reduce noise
    if (ftp.opcode !== OP_ACK || ftp.reqOpcode !== FTP_OP.BURST_READ_FILE) {
      this.log(`MAVFTP rx: op=${ftp.opcode} reqOp=${ftp.reqOpcode} sz=${ftp.size} sess=${ftp.session} ofs=${ftp.offset} burst=${ftp.burstComplete}`);
    }
    if (this.responseHandler) {
      this.responseHandler(ftp);
    } else {
      this.log('MAVFTP rx: no handler registered (stale response?)');
    }
  }

  /**
   * Download parameters via MAVFTP.
   * Returns parsed parameters, or null if FTP is not supported.
   */
  async downloadParams(): Promise<ParsedParam[] | null> {
    const startTime = Date.now();

    try {
      // Clean up any stale sessions from previous attempts
      await this.resetSessions();

      // Try packed binary format first (ArduPilot v4.4+, much faster)
      let opened = await this.openFileRO(PARAM_FILE_PATH);
      if (!opened && this.lastNakError !== 'timeout') {
        // Got a real response (FileNotFound etc.) -- try legacy text format
        this.log('MAVFTP: param.pck not found, trying legacy param.parm');
        opened = await this.openFileRO(PARAM_FILE_PATH_LEGACY);
      }
      if (!opened) {
        this.log('MAVFTP: No param file available via FTP');
        return null;
      }

      this.log(`MAVFTP: Opened file, session=${this.session}, size=${this.fileSize} bytes`);

      const fileData = await this.burstReadAll();
      await this.terminateSession();

      if (!fileData || fileData.length === 0) {
        this.log('MAVFTP: No data received');
        return null;
      }

      // Parse based on format -- detect by magic header
      let params: ParsedParam[];
      const magic = fileData.length >= 2 ? (fileData[0] | (fileData[1] << 8)) : 0;
      if ((magic & 0xFFF0) === 0x6710) {
        params = parseParamPck(fileData);
      } else {
        const text = new TextDecoder('utf-8').decode(fileData);
        params = parseParamFile(text);
      }

      const elapsed = Date.now() - startTime;
      this.log(`MAVFTP: Downloaded ${params.length} params in ${elapsed}ms (${fileData.length} bytes)`);
      return params;
    } catch (err) {
      this.log(`MAVFTP: Download failed: ${err}`);
      try { await this.terminateSession(); } catch { /* ignore */ }
      return null;
    }
  }

  /* ---- Protocol operations ---- */

  private async resetSessions(): Promise<void> {
    this.seq++;
    const payload = encodeFtpPayload({
      seqNumber: this.seq,
      session: 0,
      opcode: FTP_OP.RESET_SESSIONS,
      size: 0,
      reqOpcode: 0,
      burstComplete: 0,
      offset: 0,
      data: new Uint8Array(0),
    });
    await this.sendFtp(payload);
    // Brief pause -- reset always succeeds, don't wait for response
    await delay(50);
  }

  private async openFileRO(path: string): Promise<boolean> {
    this.seq++;
    // NO null terminator. size = strlen(path).
    // MAVLink v2 zero-trims trailing zeros from the wire.
    // ArduPilot checks: data_available (msg.len - 3 - 12) == request.size
    // If we add a null, size becomes strlen+1 but the null gets trimmed,
    // so data_available = strlen, creating an off-by-one mismatch.
    // This matches MAVProxy's implementation exactly.
    const pathBytes = new TextEncoder().encode(path);
    const payload = encodeFtpPayload({
      seqNumber: this.seq,
      session: 0,
      opcode: FTP_OP.OPEN_FILE_RO,
      size: pathBytes.length,
      reqOpcode: 0,
      burstComplete: 0,
      offset: 0,
      data: pathBytes,
    });

    this.log(`MAVFTP: Opening "${path}"`);
    const response = await this.sendAndWait(payload, FTP_OP.OPEN_FILE_RO);
    if (!response) {
      this.lastNakError = 'timeout';
      this.log('MAVFTP: OpenFileRO timed out -- no response from FC');
      return false;
    }
    if (response.opcode === OP_NAK) {
      const errCode = response.data[0] ?? 0;
      this.lastNakError = ERR_NAMES[errCode] ?? String(errCode);
      this.log(`MAVFTP: OpenFileRO NAK: ${this.lastNakError}`);
      return false;
    }

    this.session = response.session;
    // File size is a uint32 in the data field
    if (response.size >= 4) {
      const dv = new DataView(response.data.buffer, response.data.byteOffset, response.data.byteLength);
      this.fileSize = dv.getUint32(0, true);
    }
    this.log(`MAVFTP: OpenFileRO success -- session=${this.session}, fileSize=${this.fileSize}`);
    return true;
  }

  private async burstReadAll(): Promise<Uint8Array | null> {
    // NOTE: @PARAM/param.parm is dynamically generated on ArduPilot.
    // The file size from OpenFileRO may be WRONG (QGC documents this).
    // We collect all data until EOF and ignore the reported size.
    const chunks: { offset: number; data: Uint8Array }[] = [];
    let maxOffset = 0;
    let retries = 0;
    const MAX_RETRIES = 5;

    // Queue-based message collection for burst mode
    const messageQueue: FtpPayload[] = [];
    let queueResolve: (() => void) | null = null;

    // Set up a persistent handler that queues all incoming FTP messages
    this.responseHandler = (payload) => {
      messageQueue.push(payload);
      if (queueResolve) {
        queueResolve();
        queueResolve = null;
      }
    };

    // Helper: wait for messages to arrive or timeout
    const waitForMessages = (timeoutMs: number): Promise<boolean> => {
      if (messageQueue.length > 0) return Promise.resolve(true);
      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          queueResolve = null;
          resolve(false);
        }, timeoutMs);
        queueResolve = () => {
          clearTimeout(timer);
          resolve(true);
        };
      });
    };

    // Start burst read from offset 0
    await this.sendBurstRead(0);

    let gotEof = false;

    while (retries < MAX_RETRIES && !gotEof) {
      const hasData = await waitForMessages(2000);

      if (!hasData) {
        retries++;
        if (retries < MAX_RETRIES) {
          // Re-request burst from last known offset
          await this.sendBurstRead(maxOffset);
        }
        continue;
      }

      // Process all queued messages
      while (messageQueue.length > 0) {
        const chunk = messageQueue.shift()!;

        if (chunk.opcode === OP_NAK) {
          const errCode = chunk.data[0] ?? 0;
          if (errCode === ERR_EOF) {
            gotEof = true;
            break;
          }
          this.log(`MAVFTP: NAK during burst: ${ERR_NAMES[errCode] ?? errCode}`);
          this.responseHandler = null;
          return null;
        }

        if (chunk.opcode === OP_ACK && chunk.size > 0) {
          chunks.push({
            offset: chunk.offset,
            data: new Uint8Array(chunk.data.subarray(0, chunk.size)),
          });
          const end = chunk.offset + chunk.size;
          if (end > maxOffset) maxOffset = end;
        }

        // Report progress based on data received vs reported size
        if (this.onProgress && this.fileSize > 0) {
          this.onProgress(Math.min(maxOffset / this.fileSize, 0.99));
        }

        if (chunk.burstComplete === 1 && !gotEof) {
          // Burst segment done but no EOF -- request more
          await this.sendBurstRead(maxOffset);
        }
      }
    }

    this.responseHandler = null;
    this.onProgress?.(1);

    if (chunks.length === 0) {
      this.log('MAVFTP: No data received');
      return null;
    }

    // Assemble file from chunks (may arrive out of order)
    const actualSize = maxOffset;
    const fileBuffer = new Uint8Array(actualSize);
    for (const chunk of chunks) {
      fileBuffer.set(chunk.data, chunk.offset);
    }

    this.log(`MAVFTP: Received ${chunks.length} chunks, ${actualSize} bytes (reported size was ${this.fileSize})`);
    return fileBuffer;
  }

  private async terminateSession(): Promise<void> {
    this.seq++;
    const payload = encodeFtpPayload({
      seqNumber: this.seq,
      session: this.session,
      opcode: FTP_OP.TERMINATE_SESSION,
      size: 0,
      reqOpcode: 0,
      burstComplete: 0,
      offset: 0,
      data: new Uint8Array(0),
    });
    await this.sendFtp(payload);
    // Don't wait for response
  }

  private async sendBurstRead(offset: number): Promise<void> {
    this.seq++;
    const payload = encodeFtpPayload({
      seqNumber: this.seq,
      session: this.session,
      opcode: FTP_OP.BURST_READ_FILE,
      size: READ_SIZE,
      reqOpcode: 0,
      burstComplete: 0,
      offset,
      data: new Uint8Array(0),
    });
    await this.sendFtp(payload);
  }

  /* ---- Transport helpers ---- */

  private async sendFtp(ftpPayload: Uint8Array): Promise<void> {
    const msgPayload = encodeFtpMessage(
      this.targetSystem,
      this.targetComponent,
      ftpPayload,
    );
    // MSG_ID 110 = FILE_TRANSFER_PROTOCOL
    await this.sendPacket(110, msgPayload);
  }

  private sendAndWait(ftpPayload: Uint8Array, forOpcode: number): Promise<FtpPayload | null> {
    return new Promise(async (resolve) => {
      const timer = setTimeout(() => {
        this.responseHandler = null;
        this.log(`MAVFTP: sendAndWait timeout for opcode ${forOpcode}`);
        resolve(null);
      }, this.timeout);

      this.responseHandler = (response) => {
        // Only accept ACK/NAK for our specific operation
        if (response.reqOpcode === forOpcode) {
          clearTimeout(timer);
          this.responseHandler = null;
          resolve(response);
        }
        // Ignore responses for other operations (e.g. stale resetSessions ACK)
      };

      await this.sendFtp(ftpPayload);
    });
  }

}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
