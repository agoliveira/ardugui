/**
 * paramValidation.ts -- Cross-parameter validation rules for ArduPilot.
 *
 * Adapted from INAV Toolkit's param_analyzer.py check_* pattern.
 * Each check function examines related parameters and returns findings
 * with severity, description, and suggested fix.
 *
 * Used by the Pre-flight dashboard and potentially the Review step.
 */

/* ------------------------------------------------------------------ */
/*  Finding model                                                      */
/* ------------------------------------------------------------------ */

export type FindingSeverity = 'ok' | 'info' | 'warning' | 'critical';

export type FindingCategory =
  | 'safety'
  | 'motors'
  | 'filters'
  | 'battery'
  | 'gps'
  | 'rc'
  | 'calibration'
  | 'vtol'
  | 'general';

export interface Finding {
  severity: FindingSeverity;
  category: FindingCategory;
  title: string;
  description: string;
  /** ArduPilot parameter name(s) involved */
  params?: string[];
  /** Current value(s) */
  current?: string;
  /** Recommended value(s) */
  recommended?: string;
  /** Auto-fix: param -> value pairs */
  fix?: Record<string, number>;
}

export const CATEGORY_LABELS: Record<FindingCategory, string> = {
  safety: 'Safety & Failsafes',
  motors: 'Motors & ESC',
  filters: 'Filters & Tuning',
  battery: 'Battery',
  gps: 'GPS & Navigation',
  rc: 'RC Receiver',
  calibration: 'Calibration',
  vtol: 'VTOL / Transitions',
  general: 'General',
};

export const SEVERITY_ORDER: FindingSeverity[] = ['critical', 'warning', 'info', 'ok'];

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

type ParamGetter = (name: string) => number | undefined;

function getParam(get: ParamGetter, name: string, fallback: number): number {
  return get(name) ?? fallback;
}

/* ------------------------------------------------------------------ */
/*  Check: Safety & Failsafes                                          */
/* ------------------------------------------------------------------ */

function checkSafety(get: ParamGetter, vehicleType: string | null): Finding[] {
  const findings: Finding[] = [];
  const isCopter = vehicleType === 'copter' || vehicleType === 'quadplane';
  const isPlane = vehicleType === 'plane' || vehicleType === 'quadplane';

  // RC failsafe (copter)
  if (isCopter) {
    const fsThr = getParam(get, 'FS_THR_ENABLE', 0);
    if (fsThr === 0) {
      findings.push({
        severity: 'critical', category: 'safety',
        title: 'RC failsafe disabled',
        description: 'If the RC link is lost, the copter will continue flying with last stick inputs. ' +
          'This almost always results in a flyaway or crash. Enable RC failsafe with RTL action.',
        params: ['FS_THR_ENABLE'],
        current: 'Disabled (0)',
        recommended: 'RTL (2)',
        fix: { FS_THR_ENABLE: 2 },
      });
    } else if (fsThr === 1) {
      findings.push({
        severity: 'warning', category: 'safety',
        title: 'RC failsafe set to Land',
        description: 'On RC loss, the copter will land at its current position. ' +
          'RTL is usually safer for long-range -- it will fly home first.',
        params: ['FS_THR_ENABLE'],
        current: 'Land (1)',
        recommended: 'RTL (2)',
      });
    } else {
      findings.push({
        severity: 'ok', category: 'safety',
        title: 'RC failsafe enabled',
        description: `Action: ${fsThr === 2 ? 'RTL' : fsThr === 3 ? 'SmartRTL/RTL' : `mode ${fsThr}`}`,
        params: ['FS_THR_ENABLE'],
        current: String(fsThr),
      });
    }
  }

  // RC failsafe (plane)
  if (isPlane) {
    const fsLong = getParam(get, 'FS_LONG_ACTN', 0);
    if (fsLong === 0) {
      findings.push({
        severity: 'critical', category: 'safety',
        title: 'Long failsafe action disabled',
        description: 'On prolonged RC loss, the plane will continue in its current mode. ' +
          'Set to RTL (1) so the plane flies home.',
        params: ['FS_LONG_ACTN'],
        current: 'Disabled (0)',
        recommended: 'RTL (1)',
        fix: { FS_LONG_ACTN: 1 },
      });
    }
  }

  // Battery failsafe
  const battFs = getParam(get, 'BATT_FS_LOW_ACT', -1);
  if (battFs === 0 || battFs === -1) {
    findings.push({
      severity: 'warning', category: 'safety',
      title: 'Battery failsafe not configured',
      description: 'No action is set for low battery. The aircraft will fly until the battery ' +
        'is depleted, likely crashing far from home. Set to RTL (2) or Land (1).',
      params: ['BATT_FS_LOW_ACT'],
      current: 'None',
      recommended: 'RTL (2)',
      fix: { BATT_FS_LOW_ACT: 2 },
    });
  }

  // GCS failsafe (copter)
  if (isCopter) {
    const fsGcs = getParam(get, 'FS_GCS_ENABLE', 0);
    if (fsGcs === 0) {
      findings.push({
        severity: 'info', category: 'safety',
        title: 'GCS failsafe disabled',
        description: 'If using a GCS with telemetry, enabling GCS failsafe provides an ' +
          'additional safety layer. Not critical if RC failsafe is configured.',
        params: ['FS_GCS_ENABLE'],
        current: 'Disabled',
      });
    }
  }

  return findings;
}

/* ------------------------------------------------------------------ */
/*  Check: Battery                                                     */
/* ------------------------------------------------------------------ */

function checkBattery(get: ParamGetter): Finding[] {
  const findings: Finding[] = [];

  const lowVolt = getParam(get, 'BATT_LOW_VOLT', 0);
  const crtVolt = getParam(get, 'BATT_CRT_VOLT', 0);
  const capacity = getParam(get, 'BATT_CAPACITY', 0);

  // Voltage thresholds
  if (lowVolt === 0 && crtVolt === 0) {
    findings.push({
      severity: 'warning', category: 'battery',
      title: 'No battery voltage thresholds set',
      description: 'Without voltage thresholds, the battery failsafe cannot trigger based on voltage. ' +
        'Set BATT_LOW_VOLT to your warning voltage and BATT_CRT_VOLT to your critical voltage.',
      params: ['BATT_LOW_VOLT', 'BATT_CRT_VOLT'],
      current: 'Not set',
    });
  } else if (lowVolt > 0 && crtVolt > 0 && crtVolt >= lowVolt) {
    findings.push({
      severity: 'warning', category: 'battery',
      title: 'Critical voltage >= low voltage',
      description: `BATT_CRT_VOLT (${crtVolt}V) should be lower than BATT_LOW_VOLT (${lowVolt}V). ` +
        'The warning should trigger before the critical action.',
      params: ['BATT_LOW_VOLT', 'BATT_CRT_VOLT'],
      current: `Low: ${lowVolt}V, Critical: ${crtVolt}V`,
    });
  }

  // Capacity monitoring
  if (capacity > 0) {
    findings.push({
      severity: 'ok', category: 'battery',
      title: 'Battery capacity configured',
      description: `${capacity} mAh -- capacity-based monitoring provides more accurate remaining flight time.`,
      params: ['BATT_CAPACITY'],
      current: `${capacity} mAh`,
    });
  }

  // Motor voltage compensation
  const voltMax = getParam(get, 'MOT_BAT_VOLT_MAX', 0);
  const voltMin = getParam(get, 'MOT_BAT_VOLT_MIN', 0);
  if (voltMax === 0 || voltMin === 0) {
    findings.push({
      severity: 'info', category: 'battery',
      title: 'Motor voltage compensation not set',
      description: 'MOT_BAT_VOLT_MAX and MOT_BAT_VOLT_MIN linearize thrust across battery voltage. ' +
        'Without these, tune quality degrades as the battery discharges.',
      params: ['MOT_BAT_VOLT_MAX', 'MOT_BAT_VOLT_MIN'],
      current: 'Not configured',
    });
  }

  return findings;
}

/* ------------------------------------------------------------------ */
/*  Check: Filters                                                     */
/* ------------------------------------------------------------------ */

function checkFilters(get: ParamGetter): Finding[] {
  const findings: Finding[] = [];

  const gyroFilter = getParam(get, 'INS_GYRO_FILTER', 20);
  const accelFilter = getParam(get, 'INS_ACCEL_FILTER', 20);

  // Gyro filter sanity
  if (gyroFilter > 100) {
    findings.push({
      severity: 'info', category: 'filters',
      title: `Gyro filter at ${gyroFilter} Hz -- aggressive`,
      description: 'High gyro filter cutoff lets more noise through. Fine for small quads (3-5") ' +
        'but dangerous for larger aircraft. Verify this matches your prop size.',
      params: ['INS_GYRO_FILTER'],
      current: `${gyroFilter} Hz`,
    });
  } else if (gyroFilter < 15) {
    findings.push({
      severity: 'warning', category: 'filters',
      title: `Gyro filter at ${gyroFilter} Hz -- very low`,
      description: 'Extremely low gyro filter adds significant phase lag, reducing control authority. ' +
        'Even large props (20"+) typically use 20 Hz minimum.',
      params: ['INS_GYRO_FILTER'],
      current: `${gyroFilter} Hz`,
      recommended: '20 Hz minimum',
    });
  }

  // Accel filter
  if (accelFilter > 20) {
    findings.push({
      severity: 'info', category: 'filters',
      title: `Accel filter at ${accelFilter} Hz`,
      description: 'ArduPilot recommends 10 Hz for the accelerometer filter. Higher values may ' +
        'introduce noise into altitude hold.',
      params: ['INS_ACCEL_FILTER'],
      current: `${accelFilter} Hz`,
      recommended: '10 Hz',
    });
  }

  return findings;
}

/* ------------------------------------------------------------------ */
/*  Check: GPS                                                         */
/* ------------------------------------------------------------------ */

function checkGps(get: ParamGetter): Finding[] {
  const findings: Finding[] = [];

  const gpsType = getParam(get, 'GPS_TYPE', 1);
  if (gpsType === 0) {
    findings.push({
      severity: 'info', category: 'gps',
      title: 'GPS disabled',
      description: 'GPS_TYPE is set to None. GPS-dependent modes (RTL, Auto, Loiter) will not work.',
      params: ['GPS_TYPE'],
      current: 'None (0)',
    });
  }

  // Check GPS port has matching baud rate
  for (let i = 1; i <= 8; i++) {
    const protocol = getParam(get, `SERIAL${i}_PROTOCOL`, -1);
    if (protocol === 5) { // GPS
      const baud = getParam(get, `SERIAL${i}_BAUD`, 57);
      if (baud < 57) { // 57 = 57600
        findings.push({
          severity: 'warning', category: 'gps',
          title: `GPS port (SERIAL${i}) baud rate may be low`,
          description: `SERIAL${i}_BAUD is ${baud} (${baud * 1000} baud). Most GPS modules need 57600 or 115200. ` +
            'Low baud rate can cause position lag or missed updates.',
          params: [`SERIAL${i}_BAUD`],
          current: `${baud}`,
          recommended: '57 (57600) or 115 (115200)',
        });
      }
      break;
    }
  }

  return findings;
}

/* ------------------------------------------------------------------ */
/*  Check: RC Receiver                                                 */
/* ------------------------------------------------------------------ */

function checkRc(get: ParamGetter): Finding[] {
  const findings: Finding[] = [];

  // Check if any serial port is set to RCIN (23)
  let hasRcPort = false;
  for (let i = 0; i <= 8; i++) {
    if (getParam(get, `SERIAL${i}_PROTOCOL`, -1) === 23) {
      hasRcPort = true;
      break;
    }
  }

  // Some receivers use dedicated SBUS pin, not a serial port.
  // Hard to detect definitively since some boards have dedicated RX pins,
  // so we only flag if no serial RX port is found.
  if (!hasRcPort) {
    // Not a definitive error -- many boards have hardware SBUS input
    // that doesn't show as a serial protocol. Leave as info-level.
  }

  return findings;
}

/* ------------------------------------------------------------------ */
/*  Check: Motors                                                      */
/* ------------------------------------------------------------------ */

function checkMotors(get: ParamGetter): Finding[] {
  const findings: Finding[] = [];

  const pwmType = getParam(get, 'MOT_PWM_TYPE', 0);
  const spinArm = getParam(get, 'MOT_SPIN_ARM', 0.1);
  const spinMin = getParam(get, 'MOT_SPIN_MIN', 0.15);

  // DShot recommendation
  if (pwmType === 0) { // Normal PWM
    findings.push({
      severity: 'info', category: 'motors',
      title: 'Using standard PWM motor protocol',
      description: 'DShot (types 4-6) provides faster response, no need for ESC calibration, ' +
        'and bidirectional support for RPM filtering. Consider upgrading if your ESCs support it.',
      params: ['MOT_PWM_TYPE'],
      current: 'Normal (0)',
    });
  }

  // Spin arm/min sanity
  if (spinMin <= spinArm) {
    findings.push({
      severity: 'warning', category: 'motors',
      title: 'MOT_SPIN_MIN <= MOT_SPIN_ARM',
      description: 'The minimum spin throttle should be higher than the arm spin throttle. ' +
        'Otherwise there is no usable throttle range between arm and minimum flight speed.',
      params: ['MOT_SPIN_ARM', 'MOT_SPIN_MIN'],
      current: `Arm: ${spinArm}, Min: ${spinMin}`,
    });
  }

  return findings;
}

/* ------------------------------------------------------------------ */
/*  Check: Calibration                                                 */
/* ------------------------------------------------------------------ */

function checkCalibration(get: ParamGetter): Finding[] {
  const findings: Finding[] = [];

  // Accel offsets
  const ax = getParam(get, 'INS_ACCOFFS_X', 0);
  const ay = getParam(get, 'INS_ACCOFFS_Y', 0);
  const az = getParam(get, 'INS_ACCOFFS_Z', 0);
  if (ax === 0 && ay === 0 && az === 0) {
    findings.push({
      severity: 'critical', category: 'calibration',
      title: 'Accelerometer not calibrated',
      description: 'All accelerometer offsets are zero. The aircraft will not hold attitude correctly. ' +
        'Run accelerometer calibration before flying.',
      params: ['INS_ACCOFFS_X', 'INS_ACCOFFS_Y', 'INS_ACCOFFS_Z'],
    });
  }

  // Compass offsets
  const compassUse = getParam(get, 'COMPASS_USE', 1);
  if (compassUse > 0) {
    const cx = getParam(get, 'COMPASS_OFS_X', 0);
    const cy = getParam(get, 'COMPASS_OFS_Y', 0);
    const cz = getParam(get, 'COMPASS_OFS_Z', 0);
    if (cx === 0 && cy === 0 && cz === 0) {
      findings.push({
        severity: 'warning', category: 'calibration',
        title: 'Compass not calibrated',
        description: 'Compass offsets are zero. Heading will be inaccurate. ' +
          'GPS modes (RTL, Loiter, Auto) may behave unpredictably.',
        params: ['COMPASS_OFS_X', 'COMPASS_OFS_Y', 'COMPASS_OFS_Z'],
      });
    }

    // Large compass offsets can indicate mounting issues
    const maxOfs = Math.max(Math.abs(cx), Math.abs(cy), Math.abs(cz));
    if (maxOfs > 600) {
      findings.push({
        severity: 'warning', category: 'calibration',
        title: `Large compass offsets (max: ${maxOfs.toFixed(0)})`,
        description: 'Compass offsets above 600 suggest the compass is too close to sources of ' +
          'magnetic interference (motors, battery wires, metal). Consider relocating the compass ' +
          'or GPS module further from interference sources.',
        params: ['COMPASS_OFS_X', 'COMPASS_OFS_Y', 'COMPASS_OFS_Z'],
        current: `[${cx.toFixed(0)}, ${cy.toFixed(0)}, ${cz.toFixed(0)}]`,
      });
    }
  }

  return findings;
}

/* ------------------------------------------------------------------ */
/*  Check: General                                                     */
/* ------------------------------------------------------------------ */

function checkGeneral(get: ParamGetter): Finding[] {
  const findings: Finding[] = [];

  // Flight modes -- at least one should be a safe recovery mode
  let hasRtl = false;
  for (let i = 1; i <= 6; i++) {
    const mode = getParam(get, `FLTMODE${i}`, -1);
    if (mode === 6 || mode === 11) hasRtl = true; // 6=RTL, 11=SmartRTL
  }
  if (!hasRtl) {
    findings.push({
      severity: 'warning', category: 'general',
      title: 'No RTL mode assigned',
      description: 'None of your 6 flight mode slots has RTL or SmartRTL. ' +
        'Having a quick way to trigger return-to-launch is essential for safety.',
      params: ['FLTMODE1', 'FLTMODE2', 'FLTMODE3', 'FLTMODE4', 'FLTMODE5', 'FLTMODE6'],
    });
  }

  return findings;
}

/* ------------------------------------------------------------------ */
/*  Check: VTOL / Transitions (quadplane only)                         */
/* ------------------------------------------------------------------ */

function checkVtol(get: ParamGetter, vehicleType: string | null): Finding[] {
  if (vehicleType !== 'quadplane') return [];
  const findings: Finding[] = [];

  // Q_ENABLE must be 1
  const qEnable = getParam(get, 'Q_ENABLE', 0);
  if (qEnable !== 1) {
    findings.push({
      severity: 'critical', category: 'vtol',
      title: 'VTOL mode not enabled',
      description: 'Q_ENABLE must be 1 for quadplane operation. Without it, VTOL motors will not function.',
      params: ['Q_ENABLE'],
      current: String(qEnable),
      recommended: '1',
      fix: { Q_ENABLE: 1 },
    });
    return findings; // No point checking other Q_ params
  }

  // Q_FRAME_CLASS must be set
  const qFrameClass = getParam(get, 'Q_FRAME_CLASS', 0);
  if (qFrameClass === 0) {
    findings.push({
      severity: 'critical', category: 'vtol',
      title: 'VTOL frame class not set',
      description: 'Q_FRAME_CLASS is 0 (undefined). Set it to match your VTOL motor layout (e.g. 1=Quad, 2=Hexa).',
      params: ['Q_FRAME_CLASS'],
      current: '0',
    });
  }

  // VTOL motors assigned -- at least one SERVOx_FUNCTION in 33-40 range
  let hasVtolMotor = false;
  for (let i = 1; i <= 16; i++) {
    const func = getParam(get, `SERVO${i}_FUNCTION`, 0);
    if (func >= 33 && func <= 40) { hasVtolMotor = true; break; }
  }
  if (!hasVtolMotor) {
    findings.push({
      severity: 'critical', category: 'vtol',
      title: 'No VTOL motors assigned',
      description: 'No servo outputs are assigned to VTOL motor functions (33-40). ' +
        'The aircraft will not be able to hover or perform vertical takeoff.',
      params: [],
    });
  }

  // Transition timeout -- must be reasonable
  const transMs = getParam(get, 'Q_TRANSITION_MS', 0);
  if (transMs > 0 && transMs < 3000) {
    findings.push({
      severity: 'warning', category: 'vtol',
      title: 'Transition timeout very short',
      description: `Q_TRANSITION_MS is ${transMs}ms (${(transMs / 1000).toFixed(1)}s). ` +
        'Most aircraft need at least 5 seconds to transition. A timeout that is too short ' +
        'will trigger the transition failure action before the aircraft has reached flying speed.',
      params: ['Q_TRANSITION_MS'],
      current: `${transMs}ms`,
      recommended: '10000ms (10s)',
    });
  }

  // VTOL assist -- at least one trigger should be enabled
  const assistSpeed = getParam(get, 'Q_ASSIST_SPEED', 0);
  const assistAlt = getParam(get, 'Q_ASSIST_ALT', 0);
  const assistAngle = getParam(get, 'Q_ASSIST_ANGLE', 0);
  if (assistSpeed === 0 && assistAlt === 0 && assistAngle === 0) {
    findings.push({
      severity: 'warning', category: 'vtol',
      title: 'All VTOL assist triggers disabled',
      description: 'Q_ASSIST_SPEED, Q_ASSIST_ALT, and Q_ASSIST_ANGLE are all 0. ' +
        'Without assist, the VTOL motors will never activate automatically during ' +
        'forward flight to prevent a stall. Enable at least Q_ASSIST_SPEED.',
      params: ['Q_ASSIST_SPEED', 'Q_ASSIST_ALT', 'Q_ASSIST_ANGLE'],
      current: 'All disabled',
      recommended: 'Q_ASSIST_SPEED = 5-10 m/s',
    });
  }

  // Q_RTL_MODE -- warn if set to 0 (plane RTL, no VTOL landing)
  const qRtlMode = getParam(get, 'Q_RTL_MODE', 0);
  if (qRtlMode === 0) {
    findings.push({
      severity: 'info', category: 'vtol',
      title: 'RTL uses fixed-wing mode',
      description: 'Q_RTL_MODE is 0 (plane RTL). The aircraft will return as a plane and circle, ' +
        'but will not perform a VTOL landing. Set to 1 (VTOL RTL) or 3 (hybrid) for automatic VTOL landing.',
      params: ['Q_RTL_MODE'],
      current: '0 (Plane RTL)',
      recommended: '1 (VTOL RTL)',
    });
  }

  // Transition failure action -- warn if set to Continue
  const transFailAct = getParam(get, 'Q_TRANS_FAIL_ACT', 0);
  if (transFailAct === 0) {
    findings.push({
      severity: 'warning', category: 'vtol',
      title: 'Transition failure action is Continue',
      description: 'If the forward transition fails to complete, the aircraft will keep trying ' +
        'indefinitely. Set to QRTL (1) or QLand (2) for a safer abort.',
      params: ['Q_TRANS_FAIL_ACT'],
      current: '0 (Continue)',
      recommended: '1 (QRTL)',
    });
  }

  // Tilt configuration consistency
  const tiltType = getParam(get, 'Q_TILT_TYPE', 0);
  if (tiltType > 0) {
    const tiltMask = getParam(get, 'Q_TILT_MASK', 0);
    if (tiltMask === 0) {
      findings.push({
        severity: 'critical', category: 'vtol',
        title: 'Tilt type set but no tilt mask',
        description: 'Q_TILT_TYPE is configured but Q_TILT_MASK is 0 (no motors tilting). ' +
          'Set Q_TILT_MASK to the bitmask of motor outputs that tilt.',
        params: ['Q_TILT_TYPE', 'Q_TILT_MASK'],
        current: `Type=${tiltType}, Mask=0`,
      });
    }
  }

  // If all good
  if (findings.length === 0) {
    findings.push({
      severity: 'ok', category: 'vtol',
      title: 'VTOL configuration looks good',
      description: 'Q_ENABLE, frame class, motor outputs, transitions, and assist are configured.',
      params: ['Q_ENABLE', 'Q_FRAME_CLASS'],
    });
  }

  return findings;
}

/* ------------------------------------------------------------------ */
/*  Main validation function                                           */
/* ------------------------------------------------------------------ */

/**
 * Run all parameter validation checks.
 *
 * @param get - Function to retrieve a parameter value by name
 * @param vehicleType - 'copter', 'plane', 'quadplane', or null
 * @returns Array of findings sorted by severity
 */
export function validateParameters(
  get: ParamGetter,
  vehicleType: string | null,
): Finding[] {
  const findings = [
    ...checkSafety(get, vehicleType),
    ...checkBattery(get),
    ...checkFilters(get),
    ...checkGps(get),
    ...checkRc(get),
    ...checkMotors(get),
    ...checkCalibration(get),
    ...checkVtol(get, vehicleType),
    ...checkGeneral(get),
  ];

  // Sort by severity (critical first)
  findings.sort((a, b) =>
    SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );

  return findings;
}
