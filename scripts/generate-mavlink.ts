#!/usr/bin/env ts-node
/**
 * MAVLink Code Generator for ArduGUI
 *
 * Reads MAVLink XML dialect definitions and generates TypeScript:
 *   - Enum types for all MAVLink enums
 *   - Message interfaces with correct field types
 *   - Parse functions (Uint8Array -> typed object)
 *   - Encode functions (typed object -> Uint8Array)
 *   - CRC_EXTRA constants per message
 *   - Message registry (ID -> parser lookup)
 *
 * Usage:
 *   npm run generate:mavlink
 *
 * Prerequisites:
 *   Clone MAVLink definitions into resources/mavlink-definitions/:
 *     git clone https://github.com/mavlink/mavlink resources/mavlink-definitions
 *
 * The generator reads:
 *   resources/mavlink-definitions/message_definitions/v1.0/ardupilotmega.xml
 *   (which imports common.xml and other dialects)
 *
 * And produces:
 *   src/mavlink/generated/enums.ts
 *   src/mavlink/generated/messages/*.ts
 *   src/mavlink/generated/registry.ts
 *   src/mavlink/generated/types.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const MAVLINK_DEFS_DIR = path.join(
  __dirname,
  '..',
  'resources',
  'mavlink-definitions',
  'message_definitions',
  'v1.0'
);

const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'mavlink', 'generated');

// MAVLink type sizes in bytes
const TYPE_SIZES: Record<string, number> = {
  char: 1,
  uint8_t: 1,
  int8_t: 1,
  uint16_t: 2,
  int16_t: 2,
  uint32_t: 4,
  int32_t: 4,
  uint64_t: 8,
  int64_t: 8,
  float: 4,
  double: 8,
  uint8_t_mavlink_version: 1,
};

// Map MAVLink C types to TypeScript types
const TS_TYPES: Record<string, string> = {
  char: 'string',
  uint8_t: 'number',
  int8_t: 'number',
  uint16_t: 'number',
  int16_t: 'number',
  uint32_t: 'number',
  int32_t: 'number',
  uint64_t: 'bigint',
  int64_t: 'bigint',
  float: 'number',
  double: 'number',
  uint8_t_mavlink_version: 'number',
};

function main() {
  const ardupilotXml = path.join(MAVLINK_DEFS_DIR, 'ardupilotmega.xml');

  if (!fs.existsSync(ardupilotXml)) {
    console.error('MAVLink definitions not found!');
    console.error('');
    console.error('Please clone the MAVLink repository:');
    console.error(
      '  git clone https://github.com/mavlink/mavlink resources/mavlink-definitions'
    );
    console.error('');
    console.error(`Expected path: ${ardupilotXml}`);
    process.exit(1);
  }

  console.log('MAVLink Code Generator for ArduGUI');
  console.log('===================================');
  console.log(`Input:  ${ardupilotXml}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('');

  // Ensure output directory exists
  fs.mkdirSync(path.join(OUTPUT_DIR, 'messages'), { recursive: true });

  // TODO: Implement the full generator
  // Steps:
  // 1. Parse ardupilotmega.xml (and recursively parse included files like common.xml)
  // 2. Extract all <enum> definitions -> generate enums.ts
  // 3. Extract all <message> definitions -> generate per-message files
  //    - Compute CRC_EXTRA for each message (from field types and names)
  //    - Generate TypeScript interface
  //    - Generate parse function
  //    - Generate encode function
  // 4. Generate registry.ts (message ID -> module lookup)
  // 5. Generate types.ts (base types)

  console.log(
    'Generator stub created. Full implementation coming in Phase 1.'
  );
  console.log('');
  console.log(
    'For now, core messages are hand-coded in src/mavlink/messages.ts'
  );

  // Generate a placeholder registry that re-exports hand-coded messages
  const registryContent = `// Auto-generated MAVLink message registry
// This file will be fully generated once the XML parser is implemented.
// For now, it re-exports the hand-coded core messages.

export { CRC_EXTRAS } from '../messages';
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'registry.ts'), registryContent);
  console.log('Generated: registry.ts (placeholder)');
}

main();
