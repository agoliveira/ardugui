/**
 * MAVLink Connection Manager
 *
 * Orchestrates the full connection lifecycle:
 *   DISCONNECTED -> CONNECTING -> LOADING -> CONNECTED
 *
 * Parameter download strategy (modeled after QGroundControl):
 *   1. Send PARAM_REQUEST_LIST to get the full burst
 *   2. Track which indices have been received
 *   3. After the burst slows down, request missing params individually
 *      via PARAM_REQUEST_READ with the specific index
 *   4. Retry missing params up to 3 times each
 *   5. Mark complete once all received (or give up on stragglers)
 */

import { MavLinkParser, type MavLinkPacket } from './parser';
import { encodePacket, resetSequence } from './encoder';
import {
  CRC_EXTRAS,
  MavType,
  MavAutopilot,
  MavState,
  MAV_MODE_FLAG_SAFETY_ARMED,
  MSG_ID_HEARTBEAT,
  MSG_ID_PARAM_VALUE,
  MSG_ID_PARAM_REQUEST_LIST,
  MSG_ID_PARAM_REQUEST_READ,
  MSG_ID_AUTOPILOT_VERSION,
  MSG_ID_STATUSTEXT,
  MSG_ID_COMMAND_ACK,
  MSG_ID_SYS_STATUS,
  MSG_ID_GPS_RAW_INT,
  MSG_ID_RC_CHANNELS,
  MSG_ID_RC_CHANNELS_RAW,
  MSG_ID_REQUEST_DATA_STREAM,
  MSG_ID_PARAM_SET,
  MSG_ID_MAG_CAL_PROGRESS,
  MSG_ID_MAG_CAL_REPORT,
  MAV_DATA_STREAM_RC_CHANNELS,
  MAV_DATA_STREAM_EXTENDED_STATUS,
  MAV_DATA_STREAM_EXTRA1,
  parseHeartbeat,
  parseParamValue,
  parseStatusText,
  parseCommandAck,
  parseMagCalProgress,
  parseMagCalReport,
  parseRcChannels,
  parseRcChannelsRaw,
  parseAutopilotVersion,
  parseSysStatus,
  parseGpsRawInt,
  encodeParamRequestList,
  encodeParamRequestRead,
  encodeRequestDataStream,
  encodeParamSet,
  MSG_ID_COMMAND_LONG,
  encodeCommandLong,
  encodeCommandAck,
  MavParamType,
  MavResult,
  MAV_CMD_PREFLIGHT_CALIBRATION,
  MAV_CMD_PREFLIGHT_STORAGE,
  MAV_CMD_PREFLIGHT_REBOOT_SHUTDOWN,
  MAV_CMD_DO_START_MAG_CAL,
  MAV_CMD_DO_ACCEPT_MAG_CAL,
  MAV_CMD_DO_CANCEL_MAG_CAL,
  MSG_NAMES,
  type Heartbeat,
} from './messages';
import { useConnectionStore } from '@/store/connectionStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { useParameterStore, type ParamType } from '@/store/parameterStore';
import { useTelemetryStore } from '@/store/telemetryStore';
import { useDebugStore } from '@/store/debugStore';
import { useCalibrationStore } from '@/store/calibrationStore';
import { detectBoardFromId } from '@/models/boardRegistry';

const HEARTBEAT_TIMEOUT_MS = 5000;
const CONNECT_TIMEOUT_MS = 10000;
const GCS_HEARTBEAT_INTERVAL_MS = 1000;

// After the initial burst, wait this long before requesting missing params
const PARAM_BURST_SETTLE_MS = 1500;
// Interval between individual param requests (don't flood)
const PARAM_SINGLE_REQUEST_INTERVAL_MS = 30;
// Max retries per missing parameter
const PARAM_MAX_RETRIES = 3;
// If a single param request gets no response, retry after this
const PARAM_SINGLE_TIMEOUT_MS = 1200;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function mavParamTypeToString(type: number): ParamType {
  const map: Record<number, ParamType> = {
    1: 'UINT8', 2: 'INT8', 3: 'UINT16', 4: 'INT16',
    5: 'UINT32', 6: 'INT32', 9: 'FLOAT',
  };
  return map[type] || 'FLOAT';
}

export class ConnectionManager {
  private parser: MavLinkParser;
  private serialCleanups: (() => void)[] = [];
  private heartbeatWatchdog: ReturnType<typeof setTimeout> | null = null;
  private connectTimer: ReturnType<typeof setTimeout> | null = null;
  private gcsHeartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private paramBurstTimer: ReturnType<typeof setTimeout> | null = null;
  private paramRetryTimer: ReturnType<typeof setTimeout> | null = null;

  private targetSystem: number = 0;
  private targetComponent: number = 0;

  // Parameter download tracking
  private paramCount: number = 0;
  private receivedIndices: Set<number> = new Set();
  private missingRetryCount: Map<number, number> = new Map(); // index -> retry count
  private requestingMissing: boolean = false;

  private statusMessages: string[] = [];
  private boardDetectedFromStatusText = false;
  private lastRcChannelsTime: number = 0;
  private postConnectDone: boolean = false;
  private streamRetryTimer: ReturnType<typeof setTimeout> | null = null;
  private seenMsgIds: Set<number> = new Set();
  private msgCounts: Map<number, number> = new Map();

  // Parameter write tracking
  private pendingWrite: {
    name: string;
    resolve: (success: boolean) => void;
    timer: ReturnType<typeof setTimeout>;
  } | null = null;

  // Command ACK callbacks -- keyed by command ID
  private commandAckCallbacks: Map<number, (result: number) => void> = new Map();

  constructor() {
    this.parser = new MavLinkParser(
      (packet) => this.handlePacket(packet),
      CRC_EXTRAS
    );
  }

  getStatusMessages(): string[] {
    return this.statusMessages;
  }

  async connect(portPath: string, baudRate: number): Promise<void> {
    const connStore = useConnectionStore.getState();
    connStore.setStatus('connecting');
    connStore.setPortPath(portPath);

    resetSequence();
    this.parser.reset();
    this.resetParamState();
    this.targetSystem = 0;
    this.targetComponent = 0;
    this.statusMessages = [];
    this.boardDetectedFromStatusText = false;
    this.lastRcChannelsTime = 0;
    this.postConnectDone = false;
    this.seenMsgIds.clear();
    this.msgCounts.clear();
    if (this.streamRetryTimer) { clearTimeout(this.streamRetryTimer); this.streamRetryTimer = null; }

    if (!window.electronAPI) {
      connStore.setError('Not running in Electron. Serial access requires the desktop app.');
      return;
    }

    try {
      await window.electronAPI.serial.open(portPath, baudRate);

      const cleanupData = window.electronAPI.serial.onData((data: Uint8Array) => {
        this.parser.push(data);
      });
      const cleanupError = window.electronAPI.serial.onError((err: string) => {
        console.error('Serial error:', err);
        this.handleDisconnect('Serial error: ' + err);
      });
      const cleanupClose = window.electronAPI.serial.onClose(() => {
        this.handleDisconnect('Serial port closed');
      });

      this.serialCleanups = [cleanupData, cleanupError, cleanupClose];

      this.connectTimer = setTimeout(() => {
        this.handleDisconnect(
          'No heartbeat received. Check that the FC is powered and the baud rate is correct.'
        );
      }, CONNECT_TIMEOUT_MS);

      this.startGcsHeartbeat();
      console.log(`Connecting to ${portPath} @ ${baudRate}...`);
    } catch (err) {
      connStore.setError(`Failed to open port: ${err}`);
    }
  }

  async disconnect(): Promise<void> {
    this.clearAllTimers();

    for (const cleanup of this.serialCleanups) {
      cleanup();
    }
    this.serialCleanups = [];

    try {
      if (window.electronAPI) {
        await window.electronAPI.serial.close();
      }
    } catch {
      // Ignore
    }

    useConnectionStore.getState().reset();
    useVehicleStore.getState().reset();
    useParameterStore.getState().reset();
    useCalibrationStore.getState().reset();
    console.log('Disconnected');
  }

  /**
   * Write a single parameter to the FC.
   * Sends PARAM_SET and waits for PARAM_VALUE echo to confirm.
   * Retries up to 3 times with 1.5s timeout per attempt.
   */
  async writeParam(name: string, value: number): Promise<boolean> {
    const paramStore = useParameterStore.getState();
    const param = paramStore.parameters.get(name);
    if (!param) {
      console.warn(`Cannot write unknown parameter: ${name}`);
      return false;
    }

    // Map our ParamType string to MAVLink param type enum
    const paramType = this.getParamTypeEnum(param.type);

    for (let attempt = 1; attempt <= 3; attempt++) {
      const success = await this.sendParamSetAndWait(name, value, paramType);
      if (success) {
        // Update the stored value and clear dirty state
        paramStore.setParameter({
          ...param,
          value,
        });
        paramStore.clearDirty(name);
        return true;
      }
      console.warn(`Param write attempt ${attempt}/3 failed for ${name}`);
    }

    console.error(`Failed to write ${name} after 3 attempts`);
    return false;
  }

  /**
   * Write all dirty parameters to the FC.
   * Params that don't exist on the FC are silently skipped and cleared from dirty.
   * Returns { success: number, failed: string[], skipped: number }
   */
  async saveAllDirty(): Promise<{ success: number; failed: string[]; skipped: number }> {
    const paramStore = useParameterStore.getState();
    const dirty = new Map(paramStore.dirtyParams);
    let success = 0;
    let skipped = 0;
    const failed: string[] = [];

    console.log(`Saving ${dirty.size} parameters to FC...`);

    for (const [name, value] of dirty) {
      // Skip params that don't exist on the FC (e.g. OSD params for unsupported elements)
      if (!paramStore.parameters.has(name)) {
        paramStore.clearDirty(name);
        skipped++;
        continue;
      }

      const ok = await this.writeParam(name, value);
      if (ok) {
        success++;
      } else {
        failed.push(name);
      }
    }

    if (failed.length === 0) {
      console.log(`All ${success} parameters saved successfully (${skipped} skipped)`);
    } else {
      console.warn(`Saved ${success}, skipped ${skipped}, failed ${failed.length}: ${failed.join(', ')}`);
    }

    return { success, failed, skipped };
  }

  private sendParamSetAndWait(
    name: string,
    value: number,
    paramType: MavParamType
  ): Promise<boolean> {
    return new Promise((resolve) => {
      // Set up the pending write callback
      const timer = setTimeout(() => {
        this.pendingWrite = null;
        resolve(false);
      }, 1500);

      this.pendingWrite = { name, resolve, timer };

      // Send PARAM_SET
      const payload = encodeParamSet({
        targetSystem: this.targetSystem,
        targetComponent: this.targetComponent,
        paramId: name,
        paramValue: value,
        paramType,
      });
      this.sendPacket(MSG_ID_PARAM_SET, payload);
    });
  }

  private getParamTypeEnum(type: string): MavParamType {
    const map: Record<string, MavParamType> = {
      'UINT8': MavParamType.UINT8,
      'INT8': MavParamType.INT8,
      'UINT16': MavParamType.UINT16,
      'INT16': MavParamType.INT16,
      'UINT32': MavParamType.UINT32,
      'INT32': MavParamType.INT32,
      'FLOAT': MavParamType.REAL32,
    };
    return map[type] || MavParamType.REAL32;
  }

  // --- Private ---

  private resetParamState() {
    this.paramCount = 0;
    this.receivedIndices.clear();
    this.missingRetryCount.clear();
    this.requestingMissing = false;
    this.vehicleTypeDetected = false;
  }

  private handleDisconnect(reason: string) {
    this.clearAllTimers();
    for (const cleanup of this.serialCleanups) {
      cleanup();
    }
    this.serialCleanups = [];

    try { window.electronAPI?.serial.close(); } catch { /* ignore */ }

    const store = useConnectionStore.getState();
    if (store.status !== 'disconnected') {
      store.setError(reason);
    }
    useVehicleStore.getState().reset();
    useParameterStore.getState().reset();
    useCalibrationStore.getState().reset();
  }

  private clearAllTimers() {
    if (this.heartbeatWatchdog) { clearTimeout(this.heartbeatWatchdog); this.heartbeatWatchdog = null; }
    if (this.connectTimer) { clearTimeout(this.connectTimer); this.connectTimer = null; }
    if (this.gcsHeartbeatTimer) { clearInterval(this.gcsHeartbeatTimer); this.gcsHeartbeatTimer = null; }
    if (this.paramBurstTimer) { clearTimeout(this.paramBurstTimer); this.paramBurstTimer = null; }
    if (this.paramRetryTimer) { clearTimeout(this.paramRetryTimer); this.paramRetryTimer = null; }
    if (this.streamRetryTimer) { clearTimeout(this.streamRetryTimer); this.streamRetryTimer = null; }
  }

  // --- GCS Heartbeat ---

  private startGcsHeartbeat() {
    this.sendGcsHeartbeat();
    this.gcsHeartbeatTimer = setInterval(() => {
      this.sendGcsHeartbeat();
    }, GCS_HEARTBEAT_INTERVAL_MS);
  }

  private async sendGcsHeartbeat() {
    const payload = new Uint8Array(9);
    payload[4] = MavType.GCS;
    payload[5] = MavAutopilot.INVALID;
    payload[6] = 0;
    payload[7] = MavState.ACTIVE;
    payload[8] = 3;
    await this.sendPacket(MSG_ID_HEARTBEAT, payload);
  }

  // --- Packet I/O ---

  private async sendPacket(messageId: number, payload: Uint8Array) {
    const crcExtra = CRC_EXTRAS.get(messageId);
    if (crcExtra === undefined) {
      console.error(`[sendPacket] No CRC_EXTRA for message ID ${messageId}! Packet NOT sent.`);
      return;
    }

    // Debug console logging (outgoing)
    const debug = useDebugStore.getState();
    if (debug.enabled) {
      debug.log({
        msgId: messageId,
        msgName: MSG_NAMES[messageId] ?? `MSG_${messageId}`,
        direction: 'out',
        length: payload.length,
        summary: `→ sys=${this.targetSystem} comp=${this.targetComponent}`,
      });
    }

    const packet = encodePacket(messageId, payload, crcExtra);
    try {
      if (window.electronAPI) {
        await window.electronAPI.serial.write(packet);
      } else {
        console.error('[sendPacket] window.electronAPI not available!');
      }
    } catch (err) {
      console.warn('Send failed:', err);
    }
  }

  private async requestParameterList() {
    console.log(`Requesting full parameter list from system ${this.targetSystem}...`);
    const payload = encodeParamRequestList({
      targetSystem: this.targetSystem,
      targetComponent: this.targetComponent,
    });
    await this.sendPacket(MSG_ID_PARAM_REQUEST_LIST, payload);
  }

  /**
   * Request a single parameter by index.
   */
  private async requestParamByIndex(index: number) {
    const payload = encodeParamRequestRead({
      targetSystem: this.targetSystem,
      targetComponent: this.targetComponent,
      paramId: '', // Empty string means use index
      paramIndex: index,
    });
    await this.sendPacket(MSG_ID_PARAM_REQUEST_READ, payload);
  }

  // --- Packet Handlers ---

  private handlePacket(packet: MavLinkPacket) {
    // Count all received message types for diagnostics
    this.msgCounts.set(packet.messageId, (this.msgCounts.get(packet.messageId) || 0) + 1);

    // Debug console logging
    const debug = useDebugStore.getState();
    if (debug.enabled) {
      debug.log({
        msgId: packet.messageId,
        msgName: MSG_NAMES[packet.messageId] ?? `MSG_${packet.messageId}`,
        direction: 'in',
        length: packet.length,
        summary: this.summarizePacket(packet),
      });
    }

    switch (packet.messageId) {
      case MSG_ID_HEARTBEAT:
        this.handleHeartbeat(packet);
        break;
      case MSG_ID_PARAM_VALUE:
        this.handleParamValue(packet);
        break;
      case MSG_ID_STATUSTEXT:
        this.handleStatusText(packet);
        break;
      case MSG_ID_COMMAND_ACK:
        this.handleCommandAck(packet);
        break;
      case MSG_ID_SYS_STATUS:
        this.handleSysStatus(packet);
        break;
      case MSG_ID_GPS_RAW_INT:
        this.handleGpsRawInt(packet);
        break;
      case MSG_ID_RC_CHANNELS:
        this.handleRcChannels(packet);
        break;
      case MSG_ID_RC_CHANNELS_RAW:
        this.handleRcChannelsRaw(packet);
        break;
      case MSG_ID_AUTOPILOT_VERSION:
        this.handleAutopilotVersion(packet);
        break;
      case MSG_ID_MAG_CAL_PROGRESS:
        this.handleMagCalProgress(packet);
        break;
      case MSG_ID_MAG_CAL_REPORT:
        this.handleMagCalReport(packet);
        break;
      default:
        // Log first occurrence of each unknown message type
        if (!this.seenMsgIds.has(packet.messageId)) {
          this.seenMsgIds.add(packet.messageId);
          console.log(`[MAVLink] New msg type: ${packet.messageId} (v${packet.version}, ${packet.length} bytes)`);
        }
        break;
    }
  }

  private handleHeartbeat(packet: MavLinkPacket) {
    const hb = parseHeartbeat(packet.payload);
    if (hb.autopilot !== MavAutopilot.ARDUPILOTMEGA) return;

    if (this.targetSystem === 0) {
      this.targetSystem = packet.systemId;
      this.targetComponent = packet.componentId;
      console.log(`FC detected: system=${this.targetSystem} component=${this.targetComponent}`);
    }

    const armed = (hb.baseMode & MAV_MODE_FLAG_SAFETY_ARMED) !== 0;
    useVehicleStore.getState().setArmed(armed);
    this.detectVehicleType(hb);
    this.resetHeartbeatWatchdog();

    const connStatus = useConnectionStore.getState().status;

    if (connStatus === 'connecting') {
      if (this.connectTimer) {
        clearTimeout(this.connectTimer);
        this.connectTimer = null;
      }
      console.log('Heartbeat received, requesting parameters...');
      useConnectionStore.getState().setStatus('loading');
      this.requestParameterList();
    }
  }

  private handleParamValue(packet: MavLinkPacket) {
    const pv = parseParamValue(packet.payload);

    if (pv.paramCount > 0 && this.paramCount === 0) {
      this.paramCount = pv.paramCount;
      console.log(`FC reports ${pv.paramCount} total parameters`);
    }

    // Check if this is a write confirmation (FC echoes PARAM_VALUE after PARAM_SET)
    if (this.pendingWrite && this.pendingWrite.name === pv.paramId) {
      clearTimeout(this.pendingWrite.timer);
      const resolve = this.pendingWrite.resolve;
      this.pendingWrite = null;
      console.log(`Param write confirmed: ${pv.paramId} = ${pv.paramValue}`);
      resolve(true);
    }

    const isNew = !this.receivedIndices.has(pv.paramIndex);
    this.receivedIndices.add(pv.paramIndex);

    useParameterStore.getState().setParameter({
      name: pv.paramId,
      value: pv.paramValue,
      type: mavParamTypeToString(pv.paramType),
      index: pv.paramIndex,
    });

    useConnectionStore.getState().setParamLoadProgress({
      received: this.receivedIndices.size,
      total: this.paramCount,
    });

    // Check if complete
    if (this.paramCount > 0 && this.receivedIndices.size >= this.paramCount) {
      this.onParamDownloadComplete();
      return;
    }

    // After each param received, reset the "burst settle" timer.
    // When the burst stops (no new params for PARAM_BURST_SETTLE_MS),
    // we start requesting missing ones individually.
    if (isNew && !this.requestingMissing) {
      this.scheduleBurstSettle();
    }
  }

  /**
   * Schedule a timer that fires when the parameter burst has settled
   * (no new parameters received for a while). At that point, start
   * requesting missing parameters individually.
   */
  private scheduleBurstSettle() {
    if (this.paramBurstTimer) clearTimeout(this.paramBurstTimer);

    this.paramBurstTimer = setTimeout(() => {
      this.paramBurstTimer = null;
      if (this.receivedIndices.size < this.paramCount) {
        const missing = this.getMissingIndices();
        console.log(
          `Burst settled. Have ${this.receivedIndices.size}/${this.paramCount}, ` +
          `missing ${missing.length} params. Requesting individually...`
        );
        this.requestMissingParams();
      }
    }, PARAM_BURST_SETTLE_MS);
  }

  /**
   * Get the list of parameter indices we haven't received yet.
   */
  private getMissingIndices(): number[] {
    const missing: number[] = [];
    for (let i = 0; i < this.paramCount; i++) {
      if (!this.receivedIndices.has(i)) {
        missing.push(i);
      }
    }
    return missing;
  }

  /**
   * Request missing parameters one at a time with a small delay between each.
   * This is much more reliable than re-requesting the entire list.
   */
  private async requestMissingParams() {
    this.requestingMissing = true;

    const missing = this.getMissingIndices();
    if (missing.length === 0) {
      this.onParamDownloadComplete();
      return;
    }

    // Filter to only params we haven't exhausted retries on
    const toRequest = missing.filter((idx) => {
      const retries = this.missingRetryCount.get(idx) || 0;
      return retries < PARAM_MAX_RETRIES;
    });

    if (toRequest.length === 0) {
      // Gave up on remaining params
      console.warn(
        `Gave up on ${missing.length} missing parameters after ${PARAM_MAX_RETRIES} retries each`
      );
      this.onParamDownloadComplete();
      return;
    }

    console.log(`Requesting ${toRequest.length} missing parameters individually...`);

    let i = 0;
    const requestNext = () => {
      if (i >= toRequest.length) {
        // Done with this round. Wait a bit, then check if we're complete.
        this.paramRetryTimer = setTimeout(() => {
          this.paramRetryTimer = null;

          if (this.receivedIndices.size >= this.paramCount) {
            this.onParamDownloadComplete();
          } else {
            // Still missing some, do another round
            const stillMissing = this.getMissingIndices();
            console.log(
              `After retry round: still missing ${stillMissing.length} params`
            );
            this.requestMissingParams();
          }
        }, PARAM_SINGLE_TIMEOUT_MS);
        return;
      }

      const idx = toRequest[i];

      // Skip if we received it while waiting
      if (this.receivedIndices.has(idx)) {
        i++;
        requestNext();
        return;
      }

      // Increment retry count
      const retries = (this.missingRetryCount.get(idx) || 0) + 1;
      this.missingRetryCount.set(idx, retries);

      this.requestParamByIndex(idx);
      i++;

      // Update progress
      useConnectionStore.getState().setParamLoadProgress({
        received: this.receivedIndices.size,
        total: this.paramCount,
      });

      // Small delay before next request to avoid flooding
      this.paramRetryTimer = setTimeout(requestNext, PARAM_SINGLE_REQUEST_INTERVAL_MS);
    };

    requestNext();
  }

  private onParamDownloadComplete() {
    // Guard: writeParam echoes PARAM_VALUE which re-enters here
    if (this.postConnectDone) return;
    this.postConnectDone = true;

    if (this.paramBurstTimer) { clearTimeout(this.paramBurstTimer); this.paramBurstTimer = null; }
    if (this.paramRetryTimer) { clearTimeout(this.paramRetryTimer); this.paramRetryTimer = null; }
    this.requestingMissing = false;

    useConnectionStore.getState().setStatus('connected');
    useConnectionStore.getState().setParamLoadProgress({
      received: this.receivedIndices.size,
      total: this.paramCount,
    });
    useParameterStore.getState().setLoaded(true);

    const stats = this.parser.getStats();
    console.log(
      `Parameter download complete! ` +
      `${this.receivedIndices.size}/${this.paramCount} params loaded. ` +
      `v1=${stats.v1Packets} v2=${stats.v2Packets} crcErr=${stats.crcErrors}`
    );

    this.refineVehicleType();
    this.runPostConnectTasks();
  }

  private async runPostConnectTasks() {
    try {
      await delay(200);
      await this.requestTelemetryStreams();
      await delay(200);
      await this.requestAutopilotVersion();
      await delay(500);
      await this.maybeAutoBackup();
    } catch (err) {
      console.warn('Post-connect tasks error:', err);
    }
  }

  private async maybeAutoBackup() {
    try {
      const { getAutoBackupPref, runAutoBackup } = await import('../utils/autoBackup');
      const pref = await getAutoBackupPref();
      if (pref === 'enabled') {
        await runAutoBackup();
      }
      // 'unset' and 'disabled' -- do nothing here; UI handles the first-time prompt
    } catch (err) {
      console.warn('Auto-backup failed:', err);
    }
  }

  /**
   * Request telemetry streams from the FC.
   *
   * Three-layer approach (from studying QGC source code):
   *  1. PARAM_SET for SR*_RC_CHAN -- most reliable, proven to work on all boards
   *     (OSD saving uses PARAM_SET successfully, so we know the FC accepts it)
   *  2. REQUEST_DATA_STREAM -- what QGC/Mission Planner use, sent multiple times
   *     per QGC's sendMultiple pattern for reliability
   *  3. SET_MESSAGE_INTERVAL via COMMAND_LONG -- modern approach, may not work
   *     on all HAL combinations
   *
   * Safe to use writeParam here because postConnectDone=true prevents re-entry
   * into onParamDownloadComplete from the PARAM_VALUE echo.
   */
  private async requestTelemetryStreams() {
    console.log('[Streams] Requesting telemetry (3-layer strategy)...');

    // Layer 1: PARAM_SET for SR*_RC_CHAN
    await this.setSrStreamRateViaParamSet();
    await delay(200);

    // Layer 2: REQUEST_DATA_STREAM sent 3× like QGC's sendMultiple
    for (let i = 0; i < 3; i++) {
      await this.sendRequestDataStreamMessages();
      await delay(100);
    }

    // Layer 3: SET_MESSAGE_INTERVAL via COMMAND_LONG (belt-and-suspenders)
    await this.sendCommandLong(511, MSG_ID_RC_CHANNELS, 250000); // 4Hz
    console.log('[Streams] All 3 layers sent');

    // Schedule retry checks
    this.scheduleStreamRetry(1);
  }

  /**
   * Layer 1: Set SRx_RC_CHAN parameter directly via PARAM_SET.
   *
   * ArduPilot reads SR parameters dynamically, so changes take effect
   * immediately without reboot. We set SR0 and SR1 to cover both
   * common USB serial port assignments.
   */
  private async setSrStreamRateViaParamSet() {
    const paramStore = useParameterStore.getState();

    for (const prefix of ['SR0', 'SR1', 'SR2']) {
      const rcParam = paramStore.parameters.get(`${prefix}_RC_CHAN`);
      if (!rcParam) continue;

      if (rcParam.value === 0) {
        console.log(`[Streams] L1: Setting ${prefix}_RC_CHAN = 4 via PARAM_SET...`);
        const ok = await this.writeParam(`${prefix}_RC_CHAN`, 4);
        console.log(`[Streams] L1: ${prefix}_RC_CHAN write ${ok ? '✓ confirmed' : '✗ FAILED'}`);
      } else {
        console.log(`[Streams] L1: ${prefix}_RC_CHAN already ${rcParam.value}Hz, skipping`);
      }
      // Set all SRx prefixes that exist, not just the first one,
      // since we don't know which SERIAL port the USB connection maps to
    }
  }

  /**
   * Layer 2: Send REQUEST_DATA_STREAM messages.
   *
   * Following QGC's pattern (ArduSubFirmwarePlugin.cc):
   *   requestDataStream(MAV_DATA_STREAM_RC_CHANNELS, 2)
   *   requestDataStream(MAV_DATA_STREAM_EXTENDED_STATUS, 2)
   *   etc.
   * QGC sends with sendMultiple=true (caller sends this 3 times).
   */
  private async sendRequestDataStreamMessages() {
    const tc = this.targetComponent;

    // RC channels at 4Hz (our primary need)
    await this.sendPacket(MSG_ID_REQUEST_DATA_STREAM, encodeRequestDataStream({
      targetSystem: this.targetSystem,
      targetComponent: tc,
      reqStreamId: MAV_DATA_STREAM_RC_CHANNELS,
      reqMessageRate: 4,
      startStop: 1,
    }));
    await delay(20);

    // Extended status at 2Hz (battery, GPS fix, etc.)
    await this.sendPacket(MSG_ID_REQUEST_DATA_STREAM, encodeRequestDataStream({
      targetSystem: this.targetSystem,
      targetComponent: tc,
      reqStreamId: MAV_DATA_STREAM_EXTENDED_STATUS,
      reqMessageRate: 2,
      startStop: 1,
    }));
    await delay(20);

    // Extra1 at 4Hz (attitude)
    await this.sendPacket(MSG_ID_REQUEST_DATA_STREAM, encodeRequestDataStream({
      targetSystem: this.targetSystem,
      targetComponent: tc,
      reqStreamId: MAV_DATA_STREAM_EXTRA1,
      reqMessageRate: 4,
      startStop: 1,
    }));
  }

  private scheduleStreamRetry(attempt: number) {
    if (attempt > 6) {
      console.warn('[Streams] Gave up after 6 retries -- no RC data.');
      console.warn('[Streams] Possible causes: RC receiver not connected, USB port not mapped to any SRx, or firmware doesn\'t support runtime stream config');
      return;
    }
    const ms = 3000;
    this.streamRetryTimer = setTimeout(async () => {
      this.streamRetryTimer = null;

      // Dump diagnostic stats
      const stats = this.parser.getStats();
      const msgSummary = Array.from(this.msgCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([id, count]) => `msg${id}:${count}`)
        .join(' ');
      console.log(`[Diag] Parser: v1=${stats.v1Packets} v2=${stats.v2Packets} crcErr=${stats.crcErrors} | Msgs: ${msgSummary || '(none)'}`);
      console.log(`[Diag] RC last seen: ${this.lastRcChannelsTime > 0 ? (Date.now() - this.lastRcChannelsTime) + 'ms ago' : 'NEVER'}`);

      // Dump SR param values for debugging
      const paramStore = useParameterStore.getState();
      for (const prefix of ['SR0', 'SR1', 'SR2']) {
        const p = paramStore.parameters.get(`${prefix}_RC_CHAN`);
        if (p) console.log(`[Diag] ${prefix}_RC_CHAN = ${p.value}`);
      }

      if (this.lastRcChannelsTime > 0) {
        console.log('[Streams] ✓ RC data flowing');
        return;
      }

      console.log(`[Streams] Retry ${attempt}/6 -- re-requesting all layers...`);

      // Retry all three layers
      await this.setSrStreamRateViaParamSet();
      await delay(100);
      for (let i = 0; i < 3; i++) {
        await this.sendRequestDataStreamMessages();
        await delay(100);
      }
      await this.sendCommandLong(511, MSG_ID_RC_CHANNELS, 250000);

      this.scheduleStreamRetry(attempt + 1);
    }, ms);
  }

  private handleStatusText(packet: MavLinkPacket) {
    const st = parseStatusText(packet.payload);
    const labels = ['EMERG', 'ALERT', 'CRIT', 'ERR', 'WARN', 'NOTICE', 'INFO', 'DEBUG'];
    const label = labels[st.severity] || '???';
    const msg = `[${label}] ${st.text}`;
    console.log(`FC: ${msg}`);
    this.statusMessages.push(msg);
    if (this.statusMessages.length > 50) this.statusMessages.shift();

    // Parse firmware version from banner (e.g. "ArduCopter V4.5.7 (b28f0c3c)")
    const versionMatch = st.text.match(/(?:ArduCopter|ArduPlane|ArduRover|ArduSub)\s+V(\d+\.\d+\.\d+)/i);
    if (versionMatch) {
      const vehicleStore = useVehicleStore.getState();
      if (!vehicleStore.firmwareVersion || vehicleStore.firmwareVersion === '-') {
        vehicleStore.setFirmwareVersion(versionMatch[1]);
        console.log(`Firmware version from STATUSTEXT: ${versionMatch[1]}`);
      }
    }

    // Forward to calibration store when accel cal is active,
    // but only if the message is calibration-related. The FC also sends
    // unrelated messages during cal (e.g. "Pre-Arm: Waiting for RC")
    // which would confuse the user if shown in the calibration UI.
    const calStore = useCalibrationStore.getState();
    if (calStore.accelState !== 'idle' && calStore.accelState !== 'done') {
      const lower = st.text.toLowerCase();
      const isCalRelated =
        lower.includes('place') || lower.includes('calibrat') ||
        lower.includes('accel') || lower.includes('offsets') ||
        lower.includes('failed') || lower.includes('error') ||
        lower.includes('press any key');
      if (isCalRelated) {
        console.log(`[AccelCal] STATUSTEXT during cal (state=${calStore.accelState}): "${st.text}"`);
        calStore.handleAccelStatusText(st.text, st.severity);
      }
    }
  }

  private handleCommandAck(packet: MavLinkPacket) {
    const ack = parseCommandAck(packet.payload);
    console.log(`Command ACK: cmd=${ack.command} result=${ack.result}`);

    const calStore = useCalibrationStore.getState();
    const calActive = calStore.accelState !== 'idle';

    // Log ALL command ACKs to cal log when calibration is active
    if (calActive) {
      const resultName = ['ACCEPTED', 'TEMP_REJECTED', 'DENIED', 'UNSUPPORTED', 'FAILED', 'IN_PROGRESS', 'CANCELLED'][ack.result] ?? `unknown(${ack.result})`;
      calStore.addLogMessage(`RX COMMAND_ACK cmd=${ack.command} result=${resultName}`);
    }

    // Forward accel cal result to calibration store
    if (ack.command === MAV_CMD_PREFLIGHT_CALIBRATION) {
      if (calActive) {
        if (ack.result === MavResult.FAILED || ack.result === MavResult.DENIED) {
          calStore.setAccelState('failed');
        }
        // ACCEPTED just means the FC started the cal -- NOT completion.
        // Completion comes from STATUSTEXT "Calibration successful".
        // IN_PROGRESS is normal during sampling -- ignore.
      }
    }

    // Dispatch to pending callback if any
    const callback = this.commandAckCallbacks.get(ack.command);
    if (callback) {
      this.commandAckCallbacks.delete(ack.command);
      callback(ack.result);
    }
  }

  private handleMagCalProgress(packet: MavLinkPacket) {
    const progress = parseMagCalProgress(packet.payload);
    useCalibrationStore.getState().setMagCalProgress(progress);
  }

  private handleMagCalReport(packet: MavLinkPacket) {
    const report = parseMagCalReport(packet.payload);
    useCalibrationStore.getState().setMagCalReport(report);
  }

  private handleSysStatus(packet: MavLinkPacket) {
    const ss = parseSysStatus(packet.payload);

    // Update sensor health bitmasks
    useTelemetryStore.getState().setSensorHealth({
      present: ss.sensorsPresent,
      enabled: ss.sensorsEnabled,
      health: ss.sensorsHealth,
      cpuLoad: ss.load,
    });

    // Update battery from SYS_STATUS (primary battery source in ArduPilot)
    if (ss.voltageBattery !== 0xFFFF) {
      useTelemetryStore.getState().setBattery({
        voltage: ss.voltageBattery / 1000,    // mV → V
        current: ss.currentBattery >= 0 ? ss.currentBattery / 100 : 0, // cA → A
        remaining: ss.batteryRemaining,
      });
    }
  }

  private handleGpsRawInt(packet: MavLinkPacket) {
    const gps = parseGpsRawInt(packet.payload);
    useTelemetryStore.getState().setGps({
      lat: gps.lat / 1e7,
      lon: gps.lon / 1e7,
      alt: gps.alt / 1000,  // mm → m
      fix: gps.fixType,
      satellites: gps.satellitesVisible,
    });
  }

  private handleRcChannels(packet: MavLinkPacket) {
    if (this.lastRcChannelsTime === 0) {
      const rc = parseRcChannels(packet.payload);
      console.log(`[RC] First RC_CHANNELS received! chancount=${rc.chancount} ch1=${rc.channels[0]} v${packet.version}`);
    }
    const rc = parseRcChannels(packet.payload);
    this.lastRcChannelsTime = Date.now();
    useTelemetryStore.getState().setRcChannels(rc.channels, rc.chancount, rc.rssi);
  }

  /**
   * Fallback handler for RC_CHANNELS_RAW (msg 35).
   * Only used if we haven't received RC_CHANNELS (msg 65) recently,
   * since msg 65 provides all 18 channels in one message.
   */
  private handleRcChannelsRaw(packet: MavLinkPacket) {
    if (this.lastRcChannelsTime === 0) {
      console.log(`[RC] First RC_CHANNELS_RAW received! v${packet.version}`);
    }
    // Skip if we're already getting the full RC_CHANNELS message
    if (this.lastRcChannelsTime && Date.now() - this.lastRcChannelsTime < 2000) return;

    const raw = parseRcChannelsRaw(packet.payload);
    // RC_CHANNELS_RAW provides 8 channels per port. Merge into 18-channel array.
    const store = useTelemetryStore.getState();
    const existing = store.rcChannels.length > 0
      ? [...store.rcChannels]
      : new Array(18).fill(0);

    const offset = raw.port * 8;
    for (let i = 0; i < 8 && offset + i < 18; i++) {
      existing[offset + i] = raw.channels[i];
    }

    const chancount = Math.max(store.rcChancount || 0, offset + 8);
    store.setRcChannels(existing, Math.min(chancount, 18), raw.rssi);
  }

  /**
   * Request a MAVLink data stream at a given rate.
   */
  async requestDataStream(streamId: number, rateHz: number, start: boolean = true) {
    if (this.targetSystem === 0) return;
    const payload = encodeRequestDataStream({
      targetSystem: this.targetSystem,
      targetComponent: this.targetComponent,
      reqStreamId: streamId,
      reqMessageRate: rateHz,
      startStop: start ? 1 : 0,
    });
    await this.sendPacket(MSG_ID_REQUEST_DATA_STREAM, payload);
  }

  // --- Command Interface ---

  /**
   * Send a COMMAND_LONG message to the FC.
   */
  async sendCommandLong(
    command: number,
    param1 = 0,
    param2 = 0,
    param3 = 0,
    param4 = 0,
    param5 = 0,
    param6 = 0,
    param7 = 0
  ): Promise<void> {
    if (this.targetSystem === 0) return;
    const payload = encodeCommandLong({
      targetSystem: this.targetSystem,
      targetComponent: this.targetComponent,
      command,
      confirmation: 0,
      param1,
      param2,
      param3,
      param4,
      param5,
      param6,
      param7,
    });
    await this.sendPacket(MSG_ID_COMMAND_LONG, payload);
  }

  /**
   * Test a single motor.
   * @param motorIndex 1-based motor number
   * @param throttlePct Throttle percentage (0-100)
   * @param durationSec Duration in seconds
   */
  async motorTest(
    motorIndex: number,
    throttlePct: number,
    durationSec: number = 3
  ): Promise<void> {
    // MAV_CMD_DO_MOTOR_TEST = 209
    // param1: motor instance (1-indexed)
    // param2: throttle type (0 = percent)
    // param3: throttle value (0-100)
    // param4: timeout seconds
    // param5: motor count (0 = just this one)
    // param6: test order (0 = default)
    await this.sendCommandLong(
      209,
      motorIndex,
      0,
      throttlePct,
      durationSec,
      0,
      0
    );
    console.log(`Motor test: motor=${motorIndex} throttle=${throttlePct}% duration=${durationSec}s`);
  }

  /**
   * Send a COMMAND_LONG and wait for the COMMAND_ACK response.
   * Returns the MAV_RESULT code, or -1 on timeout.
   */
  async sendCommandWithAck(
    command: number,
    param1 = 0, param2 = 0, param3 = 0, param4 = 0,
    param5 = 0, param6 = 0, param7 = 0,
    timeoutMs = 5000
  ): Promise<number> {
    return new Promise<number>((resolve) => {
      const timer = setTimeout(() => {
        this.commandAckCallbacks.delete(command);
        resolve(-1); // timeout
      }, timeoutMs);

      this.commandAckCallbacks.set(command, (result) => {
        clearTimeout(timer);
        resolve(result);
      });

      this.sendCommandLong(command, param1, param2, param3, param4, param5, param6, param7);
    });
  }

  // --- Calibration Commands ---

  /**
   * Start the full 6-position accelerometer calibration.
   * The FC will send STATUSTEXT messages requesting each position.
   * Call confirmAccelCalPosition() after placing the vehicle in each position.
   * Completion detected via COMMAND_ACK for MAV_CMD_PREFLIGHT_CALIBRATION.
   */
  async startAccelCalibration(): Promise<void> {
    this.calLog('Starting 6-position accel cal (PREFLIGHT_CALIBRATION param5=1)');
    // param5=1 = interactive 6-position accel cal
    // FC will send STATUSTEXT "Place vehicle level and press any key" etc.
    // Confirm each position with COMMAND_LONG cmd=42429
    await this.sendCommandLong(MAV_CMD_PREFLIGHT_CALIBRATION, 0, 0, 0, 0, 1, 0, 0);
    this.calLog('Start command sent');
  }

  /**
   * Confirm the vehicle is in the requested position during accel calibration.
   *
   * Protocol (from QGroundControl & MAVProxy source):
   * The param5=1 calibration runs a blocking loop in the FC that watches
   * a `command_ack_counter`. ANY incoming COMMAND_ACK message (msg ID 77)
   * increments that counter and causes the loop to proceed with sampling.
   *
   * QGC sends: mavlink_msg_command_ack_pack(sysid, compid, &msg, 0, 1, ...)
   * i.e. COMMAND_ACK with command=0, result=1.
   *
   * Our earlier attempts sent COMMAND_LONG cmd=42429 which the FC's
   * handle_command_accelcal_vehicle_pos() accepted (returned ACCEPTED)
   * but that handler is for the param5=4 protocol -- the blocking loop
   * never saw it because it only watches command_ack_counter.
   *
   * @param _position unused -- the FC tracks positions internally
   */
  async confirmAccelCalPosition(_position: number): Promise<void> {
    this.calLog(`Confirming position via COMMAND_ACK (msg 77) -- QGC protocol`);

    if (this.targetSystem === 0) {
      this.calLog('ERROR: targetSystem=0, not connected?');
      return;
    }

    // Send COMMAND_ACK (msg 77) with command=0, result=1
    // This is exactly what QGC does in nextClicked()
    const payload = encodeCommandAck(
      0,                     // command = 0 (matches QGC)
      1,                     // result = 1
      this.targetSystem,     // target system = FC
      this.targetComponent,  // target component = FC
    );

    this.calLog('TX: COMMAND_ACK command=0 result=1');
    await this.sendPacket(MSG_ID_COMMAND_ACK, payload);
    this.calLog('TX OK -- FC command_ack_counter should increment');
  }

  /** Push a message to the calibration log visible in the UI */
  private calLog(text: string) {
    console.log(`[AccelCal] ${text}`);
    useCalibrationStore.getState().addLogMessage(text);
  }

  /**
   * Calibrate level (trim accelerometers for current orientation).
   */
  async calibrateLevel(): Promise<number> {
    // param5=76 is "calibrate level" for accel in ArduPilot
    return this.sendCommandWithAck(MAV_CMD_PREFLIGHT_CALIBRATION, 0, 0, 0, 0, 76, 0, 0, 10000);
  }

  /**
   * Start compass calibration on all enabled compasses.
   * The FC will send MAG_CAL_PROGRESS at ~10Hz per compass, then MAG_CAL_REPORT when done.
   */
  async startCompassCalibration(): Promise<number> {
    // MAV_CMD_DO_START_MAG_CAL (42424)
    // param1: compass bitmask (0 = all enabled)
    // param2: retry on failure (1 = yes)
    // param3: autosave (1 = auto-save on success)
    // param4: delay between retries (seconds)
    // param5: attempt count (0 = default)
    return this.sendCommandWithAck(MAV_CMD_DO_START_MAG_CAL, 0, 1, 1, 0, 0, 0, 0, 10000);
  }

  /**
   * Accept the current compass calibration results and save.
   */
  async acceptCompassCalibration(): Promise<number> {
    // param1: compass bitmask (0 = all)
    return this.sendCommandWithAck(MAV_CMD_DO_ACCEPT_MAG_CAL, 0, 0, 0, 0, 0, 0, 0, 5000);
  }

  /**
   * Cancel any running compass calibration.
   */
  async cancelCompassCalibration(): Promise<number> {
    // param1: compass bitmask (0 = all)
    return this.sendCommandWithAck(MAV_CMD_DO_CANCEL_MAG_CAL, 0, 0, 0, 0, 0, 0, 0, 5000);
  }

  /**
   * Send a preflight reboot command to the FC.
   * param1: 1 = reboot autopilot, 0 = do nothing
   * param2: 1 = reboot companion computer, 0 = do nothing
   */
  async rebootFlightController(): Promise<number> {
    return this.sendCommandWithAck(MAV_CMD_PREFLIGHT_REBOOT_SHUTDOWN, 1, 0, 0, 0, 0, 0, 0, 5000);
  }

  /**
   * Reset all parameters to firmware defaults.
   * MAV_CMD_PREFLIGHT_STORAGE param1=2 tells the FC to reset params.
   * The FC should be rebooted after this to pick up the defaults.
   */
  async resetToDefaults(): Promise<number> {
    return this.sendCommandWithAck(MAV_CMD_PREFLIGHT_STORAGE, 2, 0, 0, 0, 0, 0, 0, 10000);
  }

  // --- Vehicle Detection ---

  private vehicleTypeDetected: boolean = false;

  private detectVehicleType(hb: Heartbeat) {
    // Only detect once per connection. Prevents flicker from
    // inconsistent heartbeat type values during FC boot.
    if (this.vehicleTypeDetected) return;

    const vehicleStore = useVehicleStore.getState();

    const copterTypes = [
      MavType.QUADROTOR, MavType.COAXIAL, MavType.HEXAROTOR,
      MavType.OCTOROTOR, MavType.TRICOPTER, MavType.DODECAROTOR,
    ];
    const vtolTypes = [
      MavType.VTOL_TAILSITTER_DUOROTOR, MavType.VTOL_TAILSITTER_QUADROTOR,
      MavType.VTOL_TILTROTOR, MavType.VTOL_FIXEDWING,
      MavType.VTOL_TAILSITTER, MavType.VTOL_RESERVED4, MavType.VTOL_RESERVED5,
    ];

    let vehicleType: 'copter' | 'plane' | 'quadplane' | null = null;
    let firmwareType: string | null = null;

    if (copterTypes.includes(hb.type)) {
      vehicleType = 'copter';
      firmwareType = 'ArduCopter';
    } else if (vtolTypes.includes(hb.type)) {
      vehicleType = 'quadplane';
      firmwareType = 'ArduPlane';
    } else if (hb.type === MavType.FIXED_WING) {
      vehicleType = 'plane';
      firmwareType = 'ArduPlane';
    }

    if (vehicleType) {
      vehicleStore.setVehicle(vehicleType, firmwareType);
      this.vehicleTypeDetected = true;
      console.log(`Vehicle type locked: ${vehicleType} (${firmwareType})`);
    }
  }

  private refineVehicleType() {
    const vehicleStore = useVehicleStore.getState();
    const paramStore = useParameterStore.getState();

    if (vehicleStore.type === 'plane') {
      const qEnable = paramStore.parameters.get('Q_ENABLE');
      if (qEnable && qEnable.value >= 1) {
        vehicleStore.setVehicle('quadplane', 'ArduPlane');
        console.log('QuadPlane detected (Q_ENABLE >= 1)');
      }
    }
  }

  /**
   * Request AUTOPILOT_VERSION from FC using multiple command variants.
   * Try both MAV_CMD_REQUEST_AUTOPILOT_CAPABILITIES (520, older) and
   * MAV_CMD_REQUEST_MESSAGE (512, newer) since firmware support varies.
   */
  private async requestAutopilotVersion() {
    // First check STATUSTEXT messages collected during param download
    this.detectBoardFromStatusMessages();

    // If already detected, skip the command requests
    if (useVehicleStore.getState().boardId) return;

    // Try older command first (more widely supported)
    console.log('Requesting AUTOPILOT_VERSION via MAV_CMD 520...');
    await this.sendCommandLong(520, 1); // MAV_CMD_REQUEST_AUTOPILOT_CAPABILITIES, param1=1
    await delay(200);

    // Try newer command as well
    console.log('Requesting AUTOPILOT_VERSION via MAV_CMD 512...');
    await this.sendCommandLong(512, MSG_ID_AUTOPILOT_VERSION); // MAV_CMD_REQUEST_MESSAGE
  }

  /**
   * Try to detect board from STATUSTEXT messages collected during connection.
   * ArduPilot sends banner text including the board target on boot and
   * sometimes when a new GCS connection is established.
   */
  private detectBoardFromStatusMessages() {
    const BOARD_PATTERNS: [RegExp, string][] = [
      [/MatekF405[_-]?Wing/i, 'matekf405wing'],
      [/MatekF405[_-]?TE/i, 'matekf405te'],
      [/MatekF405/i, 'matekf405te'],  // Generic F405 → TE (more common modern board)
      [/MatekH743[_-]?Wing/i, 'matekh743wing'],
      [/MatekH743/i, 'matekh743wing'],
      [/CubeOrange/i, 'cubeorange'],
      [/CubeBlack/i, 'cubeblack'],
      [/Pixhawk6X/i, 'pixhawk6x'],
      [/Pixhawk6C/i, 'pixhawk6c'],
      [/fmuv2/i, 'pixhawk1'],
      [/fmuv3/i, 'pixhawk1'],
    ];

    for (const msg of this.statusMessages) {
      for (const [pattern, boardId] of BOARD_PATTERNS) {
        if (pattern.test(msg)) {
          const vehicleStore = useVehicleStore.getState();
          if (vehicleStore.boardId !== boardId) {
            console.log(`Board detected from STATUSTEXT: ${boardId} (from: ${msg})`);
            vehicleStore.setBoardId(boardId);
          }
          this.boardDetectedFromStatusText = true;
          return;
        }
      }
    }
  }

  private handleAutopilotVersion(packet: MavLinkPacket) {
    const av = parseAutopilotVersion(packet.payload);
    console.log(`AUTOPILOT_VERSION: boardVersion=${av.boardVersion} vendor=${av.vendorId} product=${av.productId} flightSw=0x${av.flightSwVersion.toString(16)}`);

    // Extract firmware version from flightSwVersion (encoded as major.minor.patch.type)
    const vehicleStore = useVehicleStore.getState();
    if (!vehicleStore.firmwareVersion && av.flightSwVersion > 0) {
      const major = (av.flightSwVersion >> 24) & 0xFF;
      const minor = (av.flightSwVersion >> 16) & 0xFF;
      const patch = (av.flightSwVersion >> 8) & 0xFF;
      const versionStr = `${major}.${minor}.${patch}`;
      vehicleStore.setFirmwareVersion(versionStr);
      console.log(`Firmware version from AUTOPILOT_VERSION: ${versionStr}`);
    }

    // STATUSTEXT contains the actual firmware target name (e.g. "MatekF405-TE-bdshot")
    // and is more reliable than board_version, which can be inherited from a parent hwdef.
    // Don't override a STATUSTEXT-based detection.
    if (this.boardDetectedFromStatusText) {
      console.log('Board already identified from STATUSTEXT -- skipping AUTOPILOT_VERSION override');
      return;
    }

    const board = detectBoardFromId(av.boardVersion);
    if (board) {
      const vehicleStore = useVehicleStore.getState();
      if (vehicleStore.boardId !== board.id) {
        console.log(`Board identified: ${board.name} (APJ_BOARD_ID=${av.boardVersion})`);
        vehicleStore.setBoardId(board.id);
      }
    } else {
      console.log(`Unknown board ID: ${av.boardVersion}`);
    }
  }

  // --- Debug summary for each packet type ---

  private summarizePacket(packet: MavLinkPacket): string {
    try {
      const p = packet.payload;
      switch (packet.messageId) {
        case MSG_ID_HEARTBEAT: {
          const hb = parseHeartbeat(p);
          const armed = (hb.baseMode & MAV_MODE_FLAG_SAFETY_ARMED) !== 0;
          return `type=${hb.type} autopilot=${hb.autopilot} armed=${armed}`;
        }
        case MSG_ID_PARAM_VALUE: {
          const pv = parseParamValue(p);
          return `${pv.paramId}=${pv.paramValue} (${pv.paramIndex}/${pv.paramCount})`;
        }
        case MSG_ID_STATUSTEXT: {
          const st = parseStatusText(p);
          return `[sev${st.severity}] ${st.text}`;
        }
        case MSG_ID_COMMAND_ACK: {
          const ack = parseCommandAck(p);
          return `cmd=${ack.command} result=${ack.result}`;
        }
        case MSG_ID_SYS_STATUS: {
          const ss = parseSysStatus(p);
          return `health=0x${ss.sensorsHealth.toString(16)} bat=${ss.voltageBattery}mV cpu=${ss.load}‰`;
        }
        case MSG_ID_GPS_RAW_INT: {
          const gps = parseGpsRawInt(p);
          return `fix=${gps.fixType} sats=${gps.satellitesVisible} hdop=${gps.hdop}`;
        }
        case MSG_ID_RC_CHANNELS: {
          const rc = parseRcChannels(p);
          const ch1_4 = rc.channels.slice(0, 4).join(',');
          return `chancount=${rc.chancount} ch1-4=[${ch1_4}] rssi=${rc.rssi}`;
        }
        case MSG_ID_RC_CHANNELS_RAW: {
          const rc = parseRcChannelsRaw(p);
          const ch1_4 = rc.channels.slice(0, 4).join(',');
          return `port=${rc.port} ch1-4=[${ch1_4}] rssi=${rc.rssi}`;
        }
        case MSG_ID_MAG_CAL_PROGRESS: {
          const mc = parseMagCalProgress(p);
          return `compass=${mc.compassId} status=${mc.calStatus} pct=${mc.completionPct}%`;
        }
        case MSG_ID_MAG_CAL_REPORT: {
          const mr = parseMagCalReport(p);
          return `compass=${mr.compassId} status=${mr.calStatus} fitness=${mr.fitness.toFixed(1)}`;
        }
        default:
          return `${packet.length} bytes`;
      }
    } catch {
      return `${packet.length} bytes (parse error)`;
    }
  }

  private resetHeartbeatWatchdog() {
    if (this.heartbeatWatchdog) clearTimeout(this.heartbeatWatchdog);
    this.heartbeatWatchdog = setTimeout(() => {
      const status = useConnectionStore.getState().status;
      if (status === 'connected' || status === 'loading') {
        this.handleDisconnect('Connection lost: no heartbeat received');
      }
    }, HEARTBEAT_TIMEOUT_MS);
  }
}

export const connectionManager = new ConnectionManager();
