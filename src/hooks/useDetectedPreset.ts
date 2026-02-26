/**
 * useDetectedPreset -- Detects the currently configured airframe preset
 * from FC parameters. Used by both FrameWizard (to pre-select) and
 * MotorsPage (to show correct silhouette).
 *
 * Reads EFFECTIVE values: dirtyParams first, then committed FC params.
 *
 * Copters & VTOLs: matched by additionalParams (FRAME_CLASS/TYPE).
 * Planes: matched by comparing each preset's exact output-to-function
 * mapping against current SERVO#_FUNCTION values, since many plane
 * types share the same function codes (77, 78, 70).
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

    // Planes: match by exact output-to-function mapping.
    // For each preset, check whether SERVO{defaultOutput}_FUNCTION matches
    // the expected function code. This distinguishes e.g. V-Tail (SERVO4=78)
    // from Conventional (SERVO4=79) even though both use function codes 77/78.
    if (vehicleType === 'plane') {
      let bestMatch: AirframePreset | null = null;
      let bestScore = -1;

      for (const preset of AIRFRAME_PRESETS) {
        if (preset.category !== 'plane') continue;

        // Build the expected output map for this preset: output# -> function
        const expectedOutputs = new Map<number, number>();
        if (preset.planeTemplate) {
          for (const s of preset.planeTemplate.surfaces) {
            expectedOutputs.set(s.defaultOutput, s.function);
          }
        }
        for (const m of preset.motorTemplate.forwardMotors) {
          expectedOutputs.set(m.defaultOutput, m.function);
        }

        if (expectedOutputs.size === 0) continue;

        // Count exact output-to-function matches
        let matches = 0;
        for (const [output, expectedFunc] of expectedOutputs) {
          const actualFunc = getVal(`SERVO${output}_FUNCTION`);
          if (actualFunc === expectedFunc) matches++;
        }

        // Penalize presets that leave extra non-zero outputs unexplained.
        // Prevents small presets (e.g. Flying Wing with 3 outputs) from
        // winning when a larger frame (e.g. Conventional with 5) is configured.
        let extraNonZero = 0;
        for (let i = 1; i <= 16; i++) {
          if (!expectedOutputs.has(i)) {
            const val = getVal(`SERVO${i}_FUNCTION`);
            if (val !== null && val !== 0) extraNonZero++;
          }
        }

        // Combined score: exact matches minus penalty for unexplained outputs
        const score = matches - (extraNonZero * 0.1);

        if (score > bestScore) {
          bestScore = score;
          bestMatch = preset;
        }
      }

      // Require at least 70% of the preset's outputs to match
      if (bestMatch) {
        const expectedSize = (bestMatch.planeTemplate?.surfaces.length ?? 0) +
          bestMatch.motorTemplate.forwardMotors.length;
        if (bestScore >= expectedSize * 0.7) return bestMatch;
      }
    }

    return null;
  }, [parameters, dirtyParams, vehicleType]);
}
