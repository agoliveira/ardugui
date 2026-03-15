/**
 * EscPage.tsx -- ESC configuration page.
 *
 * Groups ESC-related parameters into a readable interface:
 *   - Protocol selection (PWM / OneShot / DShot)
 *   - BLHeli passthrough settings
 *   - DShot commands (beep, direction reversal)
 *   - Servo output rate
 *   - Motor spin parameters
 *
 * Key ArduPilot params:
 *   MOT_PWM_TYPE / Q_M_PWM_TYPE -- ESC protocol
 *   SERVO_BLH_AUTO  -- auto-detect BLHeli ESCs
 *   SERVO_BLH_MASK  -- bitmask of BLHeli outputs
 *   SERVO_BLH_RVMASK -- bitmask of reversed motor outputs
 *   SERVO_DSHOT_ESC  -- DShot ESC type (0=none, 1=BLHeli32, 2=Kiss)
 *   SERVO_DSHOT_RATE -- DShot output rate multiplier
 *   MOT_SPIN_ARM    -- motor spin when armed (throttle value)
 *   MOT_SPIN_MIN    -- minimum motor spin (throttle value)
 *   MOT_PWM_MIN/MAX -- PWM output range
 */

import { useMemo } from 'react';
import {
  Zap,
  RotateCcw,
  Info,
} from 'lucide-react';
import { useParameterStore, getEffectiveValue } from '@/store/parameterStore';
import { useVehicleStore } from '@/store/vehicleStore';

/* ------------------------------------------------------------------ */
/*  Protocol definitions                                               */
/* ------------------------------------------------------------------ */

const PROTOCOLS = [
  { value: 0, label: 'PWM (Normal)', description: 'Standard 50-490Hz PWM. Works with any ESC.' },
  { value: 1, label: 'OneShot', description: 'OneShot125. Faster analog protocol.' },
  { value: 2, label: 'OneShot42', description: 'OneShot42. Even faster analog, less common.' },
  { value: 3, label: 'BrushedPWM', description: 'For brushed motors (micro quads).' },
  { value: 4, label: 'DShot150', description: 'Digital, 150kbit/s. Reliable, moderate speed.' },
  { value: 5, label: 'DShot300', description: 'Digital, 300kbit/s. Good balance.' },
  { value: 6, label: 'DShot600', description: 'Digital, 600kbit/s. Fastest, requires clean wiring.' },
  { value: 7, label: 'DShot1200', description: 'Digital, 1200kbit/s. Rarely needed.' },
];

const DSHOT_ESC_TYPES = [
  { value: 0, label: 'None', description: 'No DShot ESC telemetry' },
  { value: 1, label: 'BLHeli32 / BLHeli_S', description: 'Most common DShot ESCs' },
  { value: 2, label: 'Kiss', description: 'Kiss ESC protocol' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EscPage() {
  const paramState = useParameterStore.getState();
  const parameters = useParameterStore((s) => s.parameters);
  const setParamLocal = useParameterStore((s) => s.setParamLocal);
  const vehicleType = useVehicleStore((s) => s.type);

  const isQuadplane = vehicleType === 'quadplane';
  const pwmParam = isQuadplane ? 'Q_M_PWM_TYPE' : 'MOT_PWM_TYPE';
  const pwmType = getEffectiveValue(paramState, pwmParam) ?? 0;
  const isDshot = pwmType >= 4 && pwmType <= 7;

  const blhAuto = getEffectiveValue(paramState, 'SERVO_BLH_AUTO') ?? 0;
  const blhRvMask = getEffectiveValue(paramState, 'SERVO_BLH_RVMASK') ?? 0;
  const dshotEsc = getEffectiveValue(paramState, 'SERVO_DSHOT_ESC') ?? 0;
  const dshotRate = getEffectiveValue(paramState, 'SERVO_DSHOT_RATE') ?? 0;
  const spinArm = getEffectiveValue(paramState, 'MOT_SPIN_ARM') ?? 0;
  const spinMin = getEffectiveValue(paramState, 'MOT_SPIN_MIN') ?? 0;

  // Detect which outputs have motor functions (33-40)
  const motorOutputs = useMemo(() => {
    const outputs: number[] = [];
    for (let i = 1; i <= 16; i++) {
      const func = getEffectiveValue(paramState, `SERVO${i}_FUNCTION`) ?? 0;
      if (func >= 33 && func <= 40) outputs.push(i);
    }
    return outputs;
  }, [paramState, parameters]);

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">ESC Configuration</h1>
        <p className="mt-1 text-lg text-muted">
          ESC protocol, DShot settings, motor direction, and spin thresholds.
        </p>
      </div>

      {/* Protocol */}
      <section className="card">
        <div className="card-header">ESC Protocol</div>
        <div className="p-4 space-y-3">
          <div className="grid gap-1.5 sm:grid-cols-2">
            {PROTOCOLS.map((p) => (
              <button key={p.value} onClick={() => setParamLocal(pwmParam, p.value)}
                className={`rounded border-2 px-3 py-2 text-left transition ${
                  pwmType === p.value
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-surface-0 hover:border-accent/40'
                }`}>
                <span className={`text-sm font-bold ${pwmType === p.value ? 'text-accent' : 'text-foreground'}`}>
                  {p.label}
                </span>
                <p className="text-xs text-muted">{p.description}</p>
              </button>
            ))}
          </div>
          <p className="text-[11px] font-mono text-subtle">{pwmParam} = {pwmType}</p>
        </div>
      </section>

      {/* DShot settings */}
      {isDshot && (
        <section className="card">
          <div className="card-header">DShot Settings</div>
          <div className="p-4 space-y-4">
            {/* BLHeli auto-detect */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={blhAuto === 1}
                onChange={(e) => setParamLocal('SERVO_BLH_AUTO', e.target.checked ? 1 : 0)}
                className="h-4 w-4 accent-[#ffaa2a] rounded" />
              <div>
                <span className="text-sm font-semibold text-foreground">Auto-detect BLHeli ESCs</span>
                <p className="text-xs text-muted">
                  Automatically detect which outputs have BLHeli ESCs. Recommended for most setups.
                </p>
              </div>
            </label>

            {/* ESC type */}
            <div className="space-y-2">
              <span className="text-sm font-semibold text-foreground">DShot ESC type</span>
              <span className="ml-2 text-[11px] font-mono text-subtle">SERVO_DSHOT_ESC</span>
              <div className="space-y-1.5">
                {DSHOT_ESC_TYPES.map((t) => (
                  <button key={t.value} onClick={() => setParamLocal('SERVO_DSHOT_ESC', t.value)}
                    className={`w-full rounded border-2 px-3 py-2 text-left transition ${
                      dshotEsc === t.value
                        ? 'border-accent bg-accent/10'
                        : 'border-border bg-surface-0 hover:border-accent/40'
                    }`}>
                    <span className={`text-sm font-bold ${dshotEsc === t.value ? 'text-accent' : 'text-foreground'}`}>
                      {t.label}
                    </span>
                    <p className="text-xs text-muted">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* DShot rate */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-foreground">DShot rate multiplier</span>
                  <span className="ml-2 text-[11px] font-mono text-subtle">SERVO_DSHOT_RATE</span>
                </div>
                <span className="text-sm font-mono font-bold text-accent">{dshotRate}x</span>
              </div>
              <input type="range" min={0} max={4} step={1} value={dshotRate}
                onChange={(e) => setParamLocal('SERVO_DSHOT_RATE', Number(e.target.value))}
                className="w-full accent-[#ffaa2a]" />
              <p className="text-[11px] text-subtle">
                0 = 1x loop rate. Higher values increase DShot output rate but use more CPU.
                Most setups work fine with 0.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Motor direction reversal (DShot only) */}
      {isDshot && motorOutputs.length > 0 && (
        <section className="card">
          <div className="card-header flex items-center gap-2">
            <RotateCcw size={14} />
            Motor Direction (DShot Reversal)
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-muted">
              Toggle motor direction via DShot commands. This is stored in the ESC firmware,
              not the FC. The bitmask below tells the FC which motors are reversed so it
              can compensate for yaw.
            </p>
            <div className="flex flex-wrap gap-2">
              {motorOutputs.map((output) => {
                const bit = 1 << (output - 1);
                const isReversed = (blhRvMask & bit) !== 0;
                return (
                  <button key={output}
                    onClick={() => {
                      const newMask = isReversed ? blhRvMask & ~bit : blhRvMask | bit;
                      setParamLocal('SERVO_BLH_RVMASK', newMask);
                    }}
                    className={`rounded border-2 px-3 py-2 text-sm font-bold transition ${
                      isReversed
                        ? 'border-warning bg-warning/10 text-warning'
                        : 'border-border bg-surface-0 text-muted hover:border-accent/40'
                    }`}>
                    S{output}: {isReversed ? 'Reversed' : 'Normal'}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] font-mono text-subtle">
              SERVO_BLH_RVMASK = {blhRvMask} (0b{blhRvMask.toString(2).padStart(16, '0')})
            </p>

            <div className="flex items-start gap-2 rounded border border-blue-500/30 bg-blue-900/15 px-3 py-2">
              <Info size={12} className="mt-0.5 shrink-0 text-blue-400" />
              <p className="text-xs text-blue-300/90">
                DShot direction reversal requires BLHeli_32 or AM32 ESCs. After changing
                direction here, the ESC firmware is updated on the next arm. Verify with
                a motor test after changing.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Motor spin thresholds */}
      <section className="card">
        <div className="card-header">Motor Spin Thresholds</div>
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-foreground">Spin when armed</span>
                <span className="ml-2 text-[11px] font-mono text-subtle">MOT_SPIN_ARM</span>
              </div>
              <span className="text-sm font-mono font-bold text-accent">{spinArm.toFixed(2)}</span>
            </div>
            <input type="range" min={0} max={0.3} step={0.01} value={spinArm}
              onChange={(e) => setParamLocal('MOT_SPIN_ARM', Number(e.target.value))}
              className="w-full accent-[#ffaa2a]" />
            <p className="text-[11px] text-subtle">
              Motor throttle when armed but not flying. Set to 0 for no spin on arm.
              Small values (0.05-0.1) help motors start reliably.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-foreground">Minimum spin</span>
                <span className="ml-2 text-[11px] font-mono text-subtle">MOT_SPIN_MIN</span>
              </div>
              <span className="text-sm font-mono font-bold text-accent">{spinMin.toFixed(2)}</span>
            </div>
            <input type="range" min={0} max={0.4} step={0.01} value={spinMin}
              onChange={(e) => setParamLocal('MOT_SPIN_MIN', Number(e.target.value))}
              className="w-full accent-[#ffaa2a]" />
            <p className="text-[11px] text-subtle">
              Minimum motor throttle during flight. Keeps motors spinning for attitude
              control. Default 0.15 works for most setups.
            </p>
          </div>
        </div>
      </section>

      {/* Output summary */}
      {motorOutputs.length > 0 && (
        <div className="flex items-start gap-2 rounded border border-border bg-surface-0 px-4 py-2.5">
          <Zap size={13} className="mt-0.5 shrink-0 text-muted" />
          <p className="text-xs text-muted">
            Motor outputs detected: {motorOutputs.map((o) => `SERVO${o}`).join(', ')}.
            Protocol: {PROTOCOLS.find((p) => p.value === pwmType)?.label ?? `Type ${pwmType}`}.
          </p>
        </div>
      )}
    </div>
  );
}
