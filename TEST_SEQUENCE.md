# ArduGUI -- Test Sequence (March 10, 2026 Session)

Test hardware: Matek F405-Wing (ArduCopter), Matek F405-VTOL (ArduPlane/QuadPlane)

---

## 1. Firmware Flashing

### 1.1 Manifest + Board List
- [ ] Open Firmware page (sidebar, works disconnected)
- [ ] Manifest loads automatically, board list populates
- [ ] Search "F405" -- should show BOTH MatekF405-TE AND MatekF405-TE-bdshot as separate rows
- [ ] MatekF405-TE-bdshot has blue "BDShot" badge
- [ ] Search "VTOL" -- aliases from boardData should make MatekF405-TE findable
- [ ] Switch between Copter/Plane -- boards without that vehicle type are grayed out
- [ ] Switch between Stable/Beta/Latest -- firmware version updates
- [ ] Refresh button reloads manifest

### 1.2 First-time Flash Warning
- [ ] With board disconnected, select a board -- blue info box appears:
      "First time flashing ArduPilot? ...need arduXXX_with_bl.hex via DFU..."
- [ ] Connect to board -- blue info box disappears, yellow warning shows instead

### 1.3 Download Firmware
- [ ] Select MatekF405-Wing, Copter, Stable
- [ ] Click "Download Firmware"
- [ ] Progress shows "Downloading..."
- [ ] Green banner appears: "Firmware downloaded and validated"
- [ ] Image size should be ~1MB+ (NOT ~600KB -- that would mean zlib decompress failed)
- [ ] Buttons change to "Flash to FC" + "Clear"
- [ ] Change board selection -- downloaded firmware clears automatically

### 1.4 Load Custom .apj
- [ ] Click "Load Custom .apj" -- file dialog opens
- [ ] Select a valid .apj file
- [ ] Green banner shows firmware details
- [ ] Select a .apj for a DIFFERENT board_id than selected -- warning appears but loads anyway

### 1.5 Flash (Connected Path)
- [ ] Connect F405-Wing via ArduGUI Connect page
- [ ] Go to Firmware page, select MatekF405-Wing, Copter, download
- [ ] Click "Flash to FC"
- [ ] Page should NOT navigate away (pendingPage prevents it)
- [ ] Progress: "Rebooting to bootloader" -> "Scanning for bootloader" -> "Erasing" -> "Programming" -> "Verifying" -> "Complete"
- [ ] Board boots into new firmware after flash
- [ ] Reconnect and verify board is responsive

### 1.6 Flash (Disconnected Path)
- [ ] Disconnect from ArduGUI (or never connect)
- [ ] Board still plugged in via USB
- [ ] Download firmware, click Flash
- [ ] Should send raw MAVLink reboot command, then scan
- [ ] After ~3 scan attempts, message should include "unplug and re-plug USB" hint
- [ ] If reboot worked: should find bootloader and flash
- [ ] If reboot didn't work: unplug/replug board within 30s window, flash should proceed

### 1.7 Flash Error Recovery
- [ ] If flash fails mid-process, error message should include recovery guidance
- [ ] Board should still be in bootloader mode (fast blue LED)
- [ ] Clicking Flash again should find the bootloader and retry

---

## 2. Factory Reset Before Wizard

### 2.1 Start Fresh Flow
- [ ] Connect to board
- [ ] Click "Setup Wizard" in sidebar
- [ ] Welcome screen shows "Start Fresh" and "Import from INAV"
- [ ] Click "Start Fresh"
- [ ] Confirmation dialog appears: "Reset to Factory Defaults?"
- [ ] Dialog mentions auto-backup and has three buttons

### 2.2 Reset & Continue
- [ ] Click "Reset & Continue"
- [ ] Progress: "Backing up..." -> "Resetting..." -> "Rebooting..." -> "Reconnecting..."
- [ ] After reconnect, wizard opens on first step (Frame)
- [ ] Verify params are at defaults (e.g. SERVO functions all 0 except hwdef defaults)
- [ ] Check Backups page -- auto-backup snapshot should exist with pre-reset params

### 2.3 Skip Reset
- [ ] Click "Start Fresh" again
- [ ] Click "Skip Reset"
- [ ] Wizard opens directly with existing params intact

### 2.4 Cancel
- [ ] Click "Start Fresh"
- [ ] Click "Cancel"
- [ ] Back to welcome screen

### 2.5 ArduPlane Vehicle Choice
- [ ] Connect to ArduPlane board (F405-VTOL)
- [ ] Start wizard, click "Start Fresh", complete reset
- [ ] After reconnect: "What are you building?" screen with Airplane / VTOL choice
- [ ] Select VTOL -- wizard should include tilt servo and transitions steps

---

## 3. Bug Fixes

### 3.1 ReceiverStep Change Guard
- [ ] Connect board, start wizard, navigate to Receiver step
- [ ] If receiver is already configured and receiving channels:
  - [ ] Click a different protocol -- warning dialog should appear
  - [ ] Click "Cancel" -- selection unchanged
  - [ ] Click "Confirm" -- selection changes, warning won't show again
- [ ] If receiver is NOT configured:
  - [ ] Click a protocol -- no warning, selects immediately

### 3.2 FrameStep Selection Persistence
- [ ] Start wizard, go to Frame step
- [ ] Select a frame preset (e.g. "Quad X")
- [ ] Note the highlight and selected frame
- [ ] Click "Next" to advance to Output Mapping
- [ ] Click "Back" to return to Frame step
- [ ] Frame preset should still be highlighted (not lost)
- [ ] Kill and restart the app, re-enter wizard
- [ ] Frame preset should restore from localStorage

### 3.3 Frame Diagram After Import
- [ ] Do an INAV import for a quadplane (VTOL)
- [ ] Navigate to Motors page (standalone, not wizard)
- [ ] Frame diagram should show the correct layout (e.g. tricopter motors)
- [ ] Q_FRAME_CLASS from stagedParams should be used even before it's written to FC

### 3.4 Cell Count in Initial Tune
- [ ] Start wizard for a copter, navigate to Initial Tune step
- [ ] Select a prop size (e.g. 5")
- [ ] Battery cell count picker (3S/4S/5S/6S) should appear
- [ ] If INAV import set BATT_LOW_VOLT: should show "Detected XS from battery voltage"
- [ ] Click a different cell count -- MOT_BAT_VOLT_MAX/MIN update in preview
- [ ] If no battery info available: yellow prompt "Select your battery cell count"

---

## 4. Serial Port Auto-Detection

- [ ] Start app with NO board plugged in -- port dropdown empty
- [ ] Plug in a board -- within ~2 seconds, port appears and auto-selects
- [ ] Plug in a SECOND board -- both ports visible, new one auto-selects
- [ ] Unplug the selected board -- dropdown falls back to remaining port
- [ ] Unplug all boards -- dropdown empties
- [ ] Manual refresh button still works

---

## 5. "What Changed" Diff

### 5.1 After Wizard Write
- [ ] Complete wizard with several steps configured
- [ ] On Review step: "Write to FC" button
- [ ] After write completes: collapsible "What Changed" section appears
- [ ] Click to expand -- shows grouped params with old -> new values
- [ ] Modified params show strikethrough old value + arrow + new value
- [ ] New params (not previously on FC) show "(new)"
- [ ] If any params failed to write, they show in red

---

## 6. Quick Smoke Tests

- [ ] App starts without errors
- [ ] Connect page shows port dropdown (auto-detected)
- [ ] Connect to board -- MAVFTP downloads params in <1 second
- [ ] Navigate all sidebar pages -- no crashes
- [ ] Firmware page accessible both connected and disconnected
- [ ] Wizard accessible when connected
- [ ] Disconnect overlay appears in wizard when USB pulled mid-wizard
- [ ] Abandon wizard -- returns to normal layout
