/**
 * PlaceholderStep.tsx -- Temporary placeholder for unimplemented wizard steps.
 * Shows the step name and phase. Will be replaced with real implementations.
 */

import { Construction } from 'lucide-react';
import type { WizardStep } from '../wizardStore';

interface PlaceholderStepProps {
  step: WizardStep;
}

export function PlaceholderStep({ step }: PlaceholderStepProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <Construction size={48} className="text-subtle" />
      <h2 className="text-xl font-bold text-foreground">{step.label}</h2>
      <p className="text-base text-muted">
        This step is not yet implemented.
      </p>
      <p className="text-sm text-subtle">
        Phase: {step.phase}
      </p>
    </div>
  );
}
