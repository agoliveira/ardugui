/**
 * useDetectedPreset -- Detects the currently configured airframe preset
 * from FC parameters. Used by both FrameWizard (to pre-select) and
 * MotorsPage (to show correct silhouette).
 *
 * Reads EFFECTIVE values: dirtyParams first, then committed FC params.
 */

import { useMemo } from 'react';
import { useParameterStore } from '@/store/parameterStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { AIRFRAME_PRESETS, type AirframePreset } from '@/models/airframeTemplates';

export function useDetectedPreset(): AirframePreset | null {
  const parameters = useParameterStore((s) => s.parameters);
  const dirtyParams = useParameterStore((s) => s.dirtyParams);
  const vehicleType = useVehicleStore((s) => s.type);

  return useMemo(() => {
    if (!parameters.size) return null;

    // Effective value: dirty (local edit) takes priority over FC value
    const getVal = (name: string): number | null => {
      if (dirtyParams.has(name)) return dirtyParams.get(name)!;
      return parameters.get(name)?.value ?? null;
    };

    // Copters & VTOLs: match additionalParams (FRAME_CLASS/TYPE, Q_FRAME_CLASS/TYPE)
    for (const preset of AIRFRAME_PRESETS) {
      const ap = preset.additionalParams;
      if (!ap) continue;

      const allMatch = Object.entries(ap).every(([key, val]) => getVal(key) === val);
      if (allMatch) {
        if (preset.category === 'vtol' && vehicleType !== 'quadplane') continue;
        if (preset.category === 'copter' && vehicleType !== 'copter') continue;
        return preset;
      }
    }

    // Planes (no additionalParams): match by servo function pattern
    if (vehicleType === 'plane') {
      const currentFuncs = new Set<number>();
      for (let i = 1; i <= 16; i++) {
        const val = getVal(`SERVO${i}_FUNCTION`);
        if (val !== null && val !== 0) currentFuncs.add(val);
      }

      let bestMatch: AirframePreset | null = null;
      let bestScore = 0;
      for (const preset of AIRFRAME_PRESETS) {
        if (preset.category !== 'plane') continue;
        const presetFuncs = new Set<number>();
        if (preset.planeTemplate) {
          for (const s of preset.planeTemplate.surfaces) presetFuncs.add(s.function);
        }
        for (const m of preset.motorTemplate.forwardMotors) presetFuncs.add(m.function);

        let hits = 0;
        presetFuncs.forEach((f) => { if (currentFuncs.has(f)) hits++; });
        const score = presetFuncs.size > 0 ? hits / presetFuncs.size : 0;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = preset;
        }
      }
      if (bestScore >= 0.7) return bestMatch;
    }

    return null;
  }, [parameters, dirtyParams, vehicleType]);
}
