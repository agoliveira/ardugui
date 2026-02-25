/**
 * MAVLink Transport Layer (v1 + v2)
 *
 * Accepts raw bytes from serial, frames them into complete MAVLink
 * packets, validates CRC, and emits parsed packets to consumers.
 *
 * Supports both MAVLink v1 (0xFE start) and v2 (0xFD start) for
 * compatibility with older flight controllers like the Pixhawk 2.4.8.
 *
 * v1 format: [0xFE] [len] [seq] [sysid] [compid] [msgid:1] [payload] [crc:2]
 * v2 format: [0xFD] [len] [incompat] [compat] [seq] [sysid] [compid] [msgid:3] [payload] [crc:2]
 */

export const MAVLINK_V1_START = 0xfe;
export const MAVLINK_V2_START = 0xfd;
export const MAVLINK_V1_HEADER_LEN = 6;
export const MAVLINK_V2_HEADER_LEN = 10;
export const MAVLINK_CRC_LEN = 2;

export interface MavLinkPacket {
  /** MAVLink version (1 or 2) */
  version: 1 | 2;
  /** Payload length */
  length: number;
  /** Packet sequence number (0-255, wraps) */
  sequence: number;
  /** System ID of sender */
  systemId: number;
  /** Component ID of sender */
  componentId: number;
  /** Message ID (8-bit for v1, 24-bit for v2) */
  messageId: number;
  /** Raw payload bytes (zero-extended to full message length for v2) */
  payload: Uint8Array;
  /** Received CRC */
  crc: number;
}

/**
 * Accumulate a single byte into a running CRC-16/MCRF4XX.
 */
export function crc16AccumulateByte(byte: number, crc: number): number {
  let tmp = (byte ^ (crc & 0xff)) & 0xff;
  tmp ^= (tmp << 4) & 0xff;
  crc = ((crc >> 8) & 0xff) ^ (tmp << 8) ^ (tmp << 3) ^ ((tmp >> 4) & 0xf);
  return crc & 0xffff;
}

/**
 * Compute CRC for a MAVLink v1 packet.
 */
function computeV1CRC(
  header: Uint8Array,
  payload: Uint8Array,
  crcExtra: number
): number {
  let crc = 0xffff;
  // CRC covers header bytes 1..5 (skip start byte): len, seq, sysid, compid, msgid
  for (let i = 1; i < MAVLINK_V1_HEADER_LEN; i++) {
    crc = crc16AccumulateByte(header[i], crc);
  }
  for (let i = 0; i < payload.length; i++) {
    crc = crc16AccumulateByte(payload[i], crc);
  }
  crc = crc16AccumulateByte(crcExtra, crc);
  return crc;
}

/**
 * Compute CRC for a MAVLink v2 packet.
 */
export function computeV2CRC(
  header: Uint8Array,
  payload: Uint8Array,
  crcExtra: number
): number {
  let crc = 0xffff;
  // CRC covers header bytes 1..9 (skip start byte)
  for (let i = 1; i < MAVLINK_V2_HEADER_LEN; i++) {
    crc = crc16AccumulateByte(header[i], crc);
  }
  for (let i = 0; i < payload.length; i++) {
    crc = crc16AccumulateByte(payload[i], crc);
  }
  crc = crc16AccumulateByte(crcExtra, crc);
  return crc;
}

export type PacketCallback = (packet: MavLinkPacket) => void;

/**
 * Stateful MAVLink packet parser supporting v1 and v2.
 * Feed it bytes via push(), it emits complete packets via the callback.
 */
export class MavLinkParser {
  private buffer: Uint8Array;
  private bufferLen: number = 0;
  private onPacket: PacketCallback;
  private crcExtraLookup: Map<number, number>;
  private stats = { v1Packets: 0, v2Packets: 0, crcErrors: 0, bytesProcessed: 0 };

  constructor(
    onPacket: PacketCallback,
    crcExtraLookup: Map<number, number> = new Map()
  ) {
    this.buffer = new Uint8Array(4096);
    this.onPacket = onPacket;
    this.crcExtraLookup = crcExtraLookup;
  }

  setCrcExtraLookup(lookup: Map<number, number>) {
    this.crcExtraLookup = lookup;
  }

  getStats() {
    return { ...this.stats };
  }

  /**
   * Feed raw bytes from the serial port.
   */
  push(data: Uint8Array) {
    this.stats.bytesProcessed += data.length;

    // Grow buffer if needed
    if (this.bufferLen + data.length > this.buffer.length) {
      const newSize = Math.max(this.buffer.length * 2, this.bufferLen + data.length);
      const newBuf = new Uint8Array(newSize);
      newBuf.set(this.buffer.subarray(0, this.bufferLen));
      this.buffer = newBuf;
    }

    this.buffer.set(data, this.bufferLen);
    this.bufferLen += data.length;

    this.parseBuffer();
  }

  private parseBuffer() {
    while (this.bufferLen > 0) {
      // Find a start marker (v1: 0xFE, v2: 0xFD)
      const startIdx = this.findStartMarker();
      if (startIdx < 0) {
        this.bufferLen = 0;
        return;
      }

      // Discard bytes before the start marker
      if (startIdx > 0) {
        this.buffer.copyWithin(0, startIdx, this.bufferLen);
        this.bufferLen -= startIdx;
      }

      const startByte = this.buffer[0];

      if (startByte === MAVLINK_V2_START) {
        if (!this.tryParseV2()) return;
      } else if (startByte === MAVLINK_V1_START) {
        if (!this.tryParseV1()) return;
      } else {
        // Skip this byte
        this.buffer.copyWithin(0, 1, this.bufferLen);
        this.bufferLen -= 1;
      }
    }
  }

  /**
   * Try to parse a v2 packet at the start of the buffer.
   * Returns true if a packet was consumed (valid or invalid), false if more data needed.
   */
  private tryParseV2(): boolean {
    if (this.bufferLen < MAVLINK_V2_HEADER_LEN) return false;

    const payloadLen = this.buffer[1];
    const totalLen = MAVLINK_V2_HEADER_LEN + payloadLen + MAVLINK_CRC_LEN;

    if (this.bufferLen < totalLen) return false;

    const header = this.buffer.slice(0, MAVLINK_V2_HEADER_LEN);
    const payload = this.buffer.slice(MAVLINK_V2_HEADER_LEN, MAVLINK_V2_HEADER_LEN + payloadLen);
    const crcLo = this.buffer[MAVLINK_V2_HEADER_LEN + payloadLen];
    const crcHi = this.buffer[MAVLINK_V2_HEADER_LEN + payloadLen + 1];
    const receivedCrc = crcLo | (crcHi << 8);

    const messageId = header[7] | (header[8] << 8) | (header[9] << 16);

    // Validate CRC
    const crcExtra = this.crcExtraLookup.get(messageId);
    if (crcExtra !== undefined) {
      const expectedCrc = computeV2CRC(header, payload, crcExtra);
      if (receivedCrc !== expectedCrc) {
        this.stats.crcErrors++;
        if (this.stats.crcErrors <= 20) {
          console.warn(`[Parser] CRC FAIL v2 msgId=${messageId} len=${payloadLen} expected=0x${expectedCrc.toString(16)} got=0x${receivedCrc.toString(16)}`);
        }
        // Skip this start byte
        this.buffer.copyWithin(0, 1, this.bufferLen);
        this.bufferLen -= 1;
        return true;
      }
    }

    // Valid packet
    const packet: MavLinkPacket = {
      version: 2,
      length: payloadLen,
      sequence: header[4],
      systemId: header[5],
      componentId: header[6],
      messageId,
      payload: new Uint8Array(payload),
      crc: receivedCrc,
    };

    this.stats.v2Packets++;
    this.onPacket(packet);

    this.buffer.copyWithin(0, totalLen, this.bufferLen);
    this.bufferLen -= totalLen;
    return true;
  }

  /**
   * Try to parse a v1 packet at the start of the buffer.
   */
  private tryParseV1(): boolean {
    if (this.bufferLen < MAVLINK_V1_HEADER_LEN) return false;

    const payloadLen = this.buffer[1];
    const totalLen = MAVLINK_V1_HEADER_LEN + payloadLen + MAVLINK_CRC_LEN;

    if (this.bufferLen < totalLen) return false;

    const header = this.buffer.slice(0, MAVLINK_V1_HEADER_LEN);
    const payload = this.buffer.slice(MAVLINK_V1_HEADER_LEN, MAVLINK_V1_HEADER_LEN + payloadLen);
    const crcLo = this.buffer[MAVLINK_V1_HEADER_LEN + payloadLen];
    const crcHi = this.buffer[MAVLINK_V1_HEADER_LEN + payloadLen + 1];
    const receivedCrc = crcLo | (crcHi << 8);

    const messageId = header[5]; // v1: single byte message ID

    // Validate CRC
    const crcExtra = this.crcExtraLookup.get(messageId);
    if (crcExtra !== undefined) {
      const expectedCrc = computeV1CRC(header, payload, crcExtra);
      if (receivedCrc !== expectedCrc) {
        this.stats.crcErrors++;
        this.buffer.copyWithin(0, 1, this.bufferLen);
        this.bufferLen -= 1;
        return true;
      }
    }

    // Valid packet
    const packet: MavLinkPacket = {
      version: 1,
      length: payloadLen,
      sequence: header[2],
      systemId: header[3],
      componentId: header[4],
      messageId,
      payload: new Uint8Array(payload),
      crc: receivedCrc,
    };

    this.stats.v1Packets++;
    this.onPacket(packet);

    this.buffer.copyWithin(0, totalLen, this.bufferLen);
    this.bufferLen -= totalLen;
    return true;
  }

  private findStartMarker(): number {
    for (let i = 0; i < this.bufferLen; i++) {
      if (this.buffer[i] === MAVLINK_V2_START || this.buffer[i] === MAVLINK_V1_START) {
        return i;
      }
    }
    return -1;
  }

  reset() {
    this.bufferLen = 0;
    this.stats = { v1Packets: 0, v2Packets: 0, crcErrors: 0, bytesProcessed: 0 };
  }
}
