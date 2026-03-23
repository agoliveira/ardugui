/**
 * hexParser.ts -- Intel HEX file parser.
 *
 * Parses the standard Intel HEX format used by ArduPilot _with_bl.hex
 * firmware files. Handles all record types needed for STM32 flashing:
 *   - 0x00: Data
 *   - 0x01: End of file
 *   - 0x02: Extended segment address
 *   - 0x04: Extended linear address
 *   - 0x05: Start linear address
 *
 * Ported from INAV Configurator's hex_parser.js and adapted to TypeScript.
 */

export interface HexBlock {
  address: number;
  bytes: number;
  data: number[];
}

export interface ParsedHex {
  data: HexBlock[];
  bytesTotal: number;
  startLinearAddress: number;
}

/**
 * Parse an Intel HEX string into binary data blocks.
 * Returns null if the file is invalid (bad checksum, missing EOF).
 */
export function parseIntelHex(hexString: string): ParsedHex | null {
  const lines = hexString.split('\n');

  // Remove trailing empty line
  if (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }

  const result: ParsedHex = {
    data: [],
    bytesTotal: 0,
    startLinearAddress: 0,
  };

  let extendedLinearAddress = 0;
  let nextAddress = 0;
  let endOfFile = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.length === 0) continue;
    if (!line.startsWith(':')) continue;

    const byteCount = parseInt(line.substring(1, 3), 16);
    const address = parseInt(line.substring(3, 7), 16);
    const recordType = parseInt(line.substring(7, 9), 16);
    const content = line.substring(9, 9 + byteCount * 2);
    const checksum = parseInt(line.substring(9 + byteCount * 2, 11 + byteCount * 2), 16);

    switch (recordType) {
      case 0x00: {
        // Data record
        if (address !== nextAddress || nextAddress === 0) {
          result.data.push({
            address: extendedLinearAddress + address,
            bytes: 0,
            data: [],
          });
        }

        nextAddress = address + byteCount;

        // Process data bytes and compute checksum
        let crc = byteCount
          + parseInt(line.substring(3, 5), 16)
          + parseInt(line.substring(5, 7), 16)
          + recordType;

        const block = result.data[result.data.length - 1];
        for (let n = 0; n < byteCount * 2; n += 2) {
          const num = parseInt(content.substring(n, n + 2), 16);
          block.data.push(num);
          block.bytes++;
          crc += num;
          result.bytesTotal++;
        }

        // Verify checksum (2's complement)
        crc = (~crc + 1) & 0xFF;
        if (crc !== checksum) {
          return null; // Invalid HEX file
        }
        break;
      }

      case 0x01:
        // End of file
        endOfFile = true;
        break;

      case 0x02:
        // Extended segment address (shift left 4 bits)
        extendedLinearAddress = parseInt(content, 16) << 4;
        break;

      case 0x04:
        // Extended linear address (upper 16 bits)
        extendedLinearAddress =
          (parseInt(content.substring(0, 2), 16) << 24) |
          (parseInt(content.substring(2, 4), 16) << 16);
        break;

      case 0x05:
        // Start linear address
        result.startLinearAddress = parseInt(content, 16);
        break;
    }
  }

  if (!endOfFile) {
    return null;
  }

  return result;
}
