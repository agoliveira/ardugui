/**
 * RcCalibrationStep.tsx -- Wizard step wrapping the reusable RcCalibration component.
 *
 * Mandatory step -- cannot advance until calibration is complete or FC already
 * has calibrated values. Writes RC params directly to FC (calibration data,
 * not staged like configuration params).
 */

import { useCallback } from 'react';
import { RcCalibration } from '@/components/RcCalibration';
import { useWizardStore } from '../wizardStore';

interface RcCalibrationStepProps {
  onCanAdvanceChange: (canAdvance: boolean) => void;
}

export function RcCalibrationStep({ onCanAdvanceChange }: RcCalibrationStepProps) {
  const markComplete = useWizardStore((s) => s.markComplete);

  const handleComplete = useCallback(() => {
    markComplete('rc_calibration');
  }, [markComplete]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">RC Calibration</h2>
        <p className="mt-1 text-sm text-muted">
          Calibrate your transmitter so the flight controller knows the full range
          of each stick and switch.
        </p>
      </div>

      <RcCalibration
        onComplete={handleComplete}
        onCanAdvanceChange={onCanAdvanceChange}
      />
    </div>
  );
}
