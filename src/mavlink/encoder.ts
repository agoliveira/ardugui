/**
 * MAVLink v2 Packet Encoder
 *
 * Takes typed message payloads and encodes them into wire-format
 * MAVLink v2 packets ready for serial transmission.
 */

import { MAVLINK_V2_START, MAVLINK_V2_HEADER_LEN, computeV2CRC } from './parser';

let sequenceCounter = 0;

export interface EncodeOptions {
  systemId?: number;
  componentId?: number;
}

const DEFAULT_SYSTEM_ID = 255; // GCS convention
const DEFAULT_COMPONENT_ID = 190; // MAV_COMP_ID_MISSIONPLANNER (common for GCS)

/**
 * Encode a MAVLink v2 packet from a message ID, payload, and CRC_EXTRA.
 */
export function encodePacket(
  messageId: number,
  payload: Uint8Array,
  crcExtra: number,
  options: EncodeOptions = {}
): Uint8Array {
  const systemId = options.systemId ?? DEFAULT_SYSTEM_ID;
  const componentId = options.componentId ?? DEFAULT_COMPONENT_ID;

  // Trim trailing zeros from payload (MAVLink v2 zero-extension)
  let payloadLen = payload.length;
  while (payloadLen > 0 && payload[payloadLen - 1] === 0) {
    payloadLen--;
  }
  // Must send at least 1 byte
  if (payloadLen === 0) payloadLen = 1;

  const trimmedPayload = payload.subarray(0, payloadLen);

  // Build header
  const header = new Uint8Array(MAVLINK_V2_HEADER_LEN);
  header[0] = MAVLINK_V2_START;
  header[1] = trimmedPayload.length;
  header[2] = 0; // incompat_flags
  header[3] = 0; // compat_flags
  header[4] = sequenceCounter & 0xff;
  header[5] = systemId;
  header[6] = componentId;
  header[7] = messageId & 0xff;
  header[8] = (messageId >> 8) & 0xff;
  header[9] = (messageId >> 16) & 0xff;

  sequenceCounter = (sequenceCounter + 1) & 0xff;

  // Compute CRC over full payload length (before trimming) for CRC calc,
  // but actually the CRC is computed on the trimmed payload with zero-fill
  // happening at the receiver side. The CRC covers the trimmed bytes.
  // Actually, re-reading the spec: CRC is computed on the actual transmitted
  // bytes (the trimmed payload), and the receiver zero-extends before parsing.
  const fullHeader = new Uint8Array(MAVLINK_V2_HEADER_LEN);
  fullHeader.set(header);
  // For CRC computation, we need to use the ORIGINAL payload length in header byte 1
  // No wait: header[1] is the actual transmitted payload length (trimmed).
  // The receiver uses the message definition to know the full struct size.

  const crc = computeV2CRC(fullHeader, trimmedPayload, crcExtra);

  // Assemble full packet
  const packet = new Uint8Array(
    MAVLINK_V2_HEADER_LEN + trimmedPayload.length + 2
  );
  packet.set(header, 0);
  packet.set(trimmedPayload, MAVLINK_V2_HEADER_LEN);
  packet[MAVLINK_V2_HEADER_LEN + trimmedPayload.length] = crc & 0xff;
  packet[MAVLINK_V2_HEADER_LEN + trimmedPayload.length + 1] =
    (crc >> 8) & 0xff;

  return packet;
}

/**
 * Reset the sequence counter (e.g., on new connection).
 */
export function resetSequence() {
  sequenceCounter = 0;
}
