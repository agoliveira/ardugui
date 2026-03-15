/**
 * ArduPilot Firmware Downloader
 *
 * Downloads .apj firmware files and parses the JSON wrapper to extract
 * the binary firmware image.
 *
 * APJ format: JSON with base64-encoded, zlib-compressed firmware image.
 * See ArduPilot uploader.py:
 *   self.image = bytearray(zlib.decompress(base64.b64decode(self.desc['image'])))
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ApjFirmware {
  magic: string;
  boardId: number;
  boardRevision: number;
  imageSize: number;
  image: Uint8Array;
  summary: string;
  description: string;
  gitIdentity: string;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Download an APJ firmware file from a URL.
 */
export async function downloadFirmware(
  url: string,
  onProgress?: (loaded: number, total: number) => void,
): Promise<ApjFirmware> {
  const api = window.electronAPI;
  let text: string;

  if (api?.net?.fetch) {
    onProgress?.(0, 1);
    const result = await api.net.fetch(url);
    if (!result.ok || !result.text) {
      throw new Error(`Download failed: ${result.error || 'unknown error'}`);
    }
    text = result.text;
    onProgress?.(1, 1);
  } else {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }
    text = await response.text();
  }

  return parseApj(text);
}

/**
 * Parse an APJ file from its JSON text content.
 * Handles base64 decoding AND zlib decompression of the firmware image.
 */
export async function parseApj(jsonText: string): Promise<ApjFirmware> {
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(jsonText);
  } catch {
    throw new Error('Invalid APJ file: not valid JSON');
  }

  const magic = data.magic as string;
  if (!magic || !magic.startsWith('APJFW')) {
    throw new Error(`Invalid APJ file: bad magic "${magic}"`);
  }

  const boardId = data.board_id as number;
  if (typeof boardId !== 'number') {
    throw new Error('Invalid APJ file: missing board_id');
  }

  const imageSize = data.image_size as number;
  if (typeof imageSize !== 'number' || imageSize <= 0) {
    throw new Error('Invalid APJ file: invalid image_size');
  }

  const imageBase64 = data.image as string;
  if (typeof imageBase64 !== 'string' || imageBase64.length === 0) {
    throw new Error('Invalid APJ file: missing image data');
  }

  // Step 1: Base64 decode
  const compressed = base64ToUint8Array(imageBase64);

  // Step 2: Zlib decompress
  // APJ images: Python zlib.compress(image) -> base64.encode()
  // We reverse: base64.decode() -> zlib.decompress()
  const image = await zlibDecompress(compressed);

  // Validate decompressed size matches header
  if (image.length !== imageSize) {
    // Not fatal -- some APJ files may have slightly different reported sizes
    // But a huge mismatch suggests decompression failure
    if (Math.abs(image.length - imageSize) > 1024) {
      throw new Error(
        `APJ image size mismatch: header says ${imageSize} bytes ` +
        `but decompressed to ${image.length} bytes`
      );
    }
  }

  return {
    magic,
    boardId,
    boardRevision: (data.board_revision as number) || 0,
    imageSize: image.length,
    image,
    summary: (data.summary as string) || '',
    description: (data.description as string) || '',
    gitIdentity: (data.git_identity as string) || '',
  };
}

/**
 * Validate that a firmware image is compatible with a target board.
 */
export function validateFirmware(
  firmware: ApjFirmware,
  targetBoardId: number,
): { valid: boolean; error?: string } {
  if (firmware.boardId !== targetBoardId) {
    return {
      valid: false,
      error: `Firmware is for board_id ${firmware.boardId} but target is ${targetBoardId}`,
    };
  }

  if (firmware.imageSize === 0 || firmware.image.length === 0) {
    return { valid: false, error: 'Firmware image is empty' };
  }

  return { valid: true };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function base64ToUint8Array(base64: string): Uint8Array {
  const std = base64.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(std);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decompress zlib data using the Web Compression Streams API.
 * The 'deflate' format in the spec IS the zlib format (RFC 1950),
 * which is exactly what Python's zlib.compress() produces.
 */
async function zlibDecompress(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('deflate');
  const writer = ds.writable.getWriter();
  const reader = ds.readable.getReader();

  // Write compressed data and close
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Uint8Array<ArrayBufferLike> vs BufferSource mismatch in newer TS
  writer.write(data as any);
  writer.close();

  // Read all decompressed chunks
  const chunks: Uint8Array[] = [];
  let totalSize = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    totalSize += value.length;
  }

  // Combine chunks
  const result = new Uint8Array(totalSize);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}
