/**
 * motorTestDefs.ts -- Shared types and constants for motor testing.
 *
 * Used by both MotorEscStep (wizard) and MotorsPage (standalone).
 */

/* ------------------------------------------------------------------ */
/*  ESC Protocol definitions                                           */
/* ------------------------------------------------------------------ */

export interface EscProtocol {
  id: string;
  label: string;
  description: string;
  pwmType: number;  // MOT_PWM_TYPE / Q_M_PWM_TYPE value
  blhAuto?: boolean;
  testThrottle: number;  // % throttle for test spin
}

export const ESC_PROTOCOLS: EscProtocol[] = [
  {
    id: 'pwm',
    label: 'PWM',
    description: 'Standard PWM signal. Works with any ESC. Slowest update rate.',
    pwmType: 0,
    testThrottle: 12,
  },
  {
    id: 'oneshot',
    label: 'OneShot125',
    description: 'Faster PWM variant. Compatible with most modern ESCs.',
    pwmType: 1,
    testThrottle: 10,
  },
  {
    id: 'dshot300',
    label: 'DShot300',
    description: 'Digital protocol, 300kbit/s. Good balance of speed and reliability.',
    pwmType: 5,
    blhAuto: true,
    testThrottle: 8,
  },
  {
    id: 'dshot600',
    label: 'DShot600',
    description: 'Digital protocol, 600kbit/s. Fastest, requires clean wiring.',
    pwmType: 6,
    blhAuto: true,
    testThrottle: 8,
  },
];

/* ------------------------------------------------------------------ */
/*  Motor test info                                                    */
/* ------------------------------------------------------------------ */

export interface MotorTestInfo {
  /** Number shown in the UI (matches frame diagram) */
  displayNum: number;
  /** DO_MOTOR_TEST param1 instance (ArduPilot frame position) */
  testInstance: number;
  /** Physical SERVOx output number */
  servoOutput: number;
  /** CW/CCW rotation for copters, null for plane */
  rotation: 'CW' | 'CCW' | null;
  /** Human-readable position ("Front Right", "Rear", etc.) */
  positionLabel: string;
}

export type MotorResult = 'correct' | 'wrong' | 'untested';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export function getPositionLabel(x: number, y: number): string {
  const isForward = y > 0.2;
  const isRear = y < -0.2;
  const isLeft = x < -0.2;
  const isRight = x > 0.2;

  if (isForward && isRight) return 'Front Right';
  if (isForward && isLeft) return 'Front Left';
  if (isRear && isRight) return 'Rear Right';
  if (isRear && isLeft) return 'Rear Left';
  if (isForward) return 'Front';
  if (isRear) return 'Rear';
  if (isRight) return 'Right';
  if (isLeft) return 'Left';
  return 'Center';
}
