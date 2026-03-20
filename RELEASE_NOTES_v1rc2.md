# ArduGUI v1.0.0-rc2 -- Fleet View, Bug Fixes

## Summary

RC2 adds the Fleet View ("My Aircraft") feature, fixes the custom APJ firmware flash
bug, and resolves the INAV migration stale vehicle type issue. The INAV CLI extraction
flow and connection stability still need hardware testing before public release.

## What's New Since RC1

### Fleet View (Phase 2)

- **"My Aircraft" replaces "Backups"** in the sidebar -- card grid of all registered aircraft
- Cards show aircraft name, vehicle type, board, firmware version, snapshot count, last-seen date
- Vehicle-type-colored left borders (amber = copter, sky blue = plane, purple = VTOL)
- Real AirframeIcon watermarks on cards resolved from stored frame preset metadata
- Connected aircraft pinned to top with green pulsing "Live" badge
- Click a card to drill into snapshot detail (same diff, restore, import/export as before)
- Disconnected aircraft are read-only (browse snapshots, export .param -- no diff or restore)
- Archive/unarchive with pill-shaped toggle, permanent delete from archived view
- Editable notes field per aircraft (free-form text, auto-saves on blur)
- Sidebar item visible when disconnected if at least one aircraft exists in the DB

### Schema Additions

- `aircraft` table gains: `notes`, `metadata`, `photo_path`, `archived_at` columns
- Backward-compatible migration via `ALTER TABLE ADD COLUMN` (idempotent)
- `metadata` stores JSON blob (presetId, boardName, vehicleType) for fleet card display
- `photo_path` reserved for future use, not wired

### Aircraft Metadata Persistence

- `detectPresetId()` resolves FRAME_CLASS/TYPE to the matching airframe preset ID
- Stored in aircraft metadata during `identifyAircraft()` and `runAutoBackup()`
- Existing aircraft populate on next connect -- generic fallback silhouettes until then

### Bug Fixes

- **Custom .apj flash "invalid image_size"** -- `parseApj` no longer rejects files with
  missing or zero `image_size` before decompression. Validates decompressed length instead.
  Custom-built APJ files that report compressed size or omit the field now flash correctly.
- **INAV migration stale vehicleType** -- hex URL was built using the stale React state
  closure value. Now uses a local variable that tracks the detected type within the
  same callback invocation. Plane boards get the correct `arduplane_with_bl.hex`.
- **Fleet view archive toggle invisible** -- `listAircraft()` always fetches all aircraft
  (including archived) so the archive count and toggle render correctly.
- **Double "v" in firmware version display** -- `fmtVersion()` strips leading "v" before
  prepending, preventing "vv4.6.3" display.

## Known Issues / Needs Testing

- **Connected flash path** (MAVLink reboot-to-bootloader pendingPage) -- code looks correct
  but untested on hardware. May have timing race.
- **INAV CLI extraction** -- completely untested on real INAV hardware. The entire migration
  flow (CLI dump, board mapping, flash guide, auto-import) needs live testing.
- **Connection instability** -- occasional "no heartbeat" after reboot cycles. Guards added
  but root cause may be deeper.
- **OSD import param names** -- code-reviewed but not hardware-verified.

## Test Hardware

- Matek F405-VTOL (ArduPlane v4.6.3)
- Matek F405-Wing
- Matek F405-TE (Xiake VTOL quadplane)
- Pixhawk 2.4.8

## How to Test

See TEST_SESSION_20260314.md for the base test script. Additional tests for RC2:

### Fleet View
1. Connect each board once to populate preset metadata
2. Verify cards show correct frame icons after reconnect
3. Test archive, unarchive, permanent delete
4. Test notes editing (add, edit, clear)
5. Test snapshot drill-down for connected aircraft (full: create, diff, restore, export)
6. Test snapshot drill-down for disconnected aircraft (read-only: browse, export)

### Custom APJ Flash
1. Obtain or build a custom .apj file
2. Flash via Firmware page -- should no longer reject on image_size

### INAV Migration
1. Plug in an INAV board -- verify USB detection triggers migration flow
2. Test full sequence: CLI dump, board mapping, firmware download, flash, reconnect
3. Verify auto-import to wizard with correct vehicle type
