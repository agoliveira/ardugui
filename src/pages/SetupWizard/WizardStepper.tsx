/**
 * WizardStepper.tsx -- Left sidebar step indicator with phase grouping.
 *
 * Shows phases as headers with steps nested beneath. Completed steps
 * show a green checkmark, current step is highlighted, future steps
 * are dimmed. Skipped steps show a dash.
 */

import { Check, Minus } from 'lucide-react';
import { useWizardStore, getPhases } from './wizardStore';

export function WizardStepper() {
  const steps = useWizardStore((s) => s.steps);
  const currentStepIndex = useWizardStore((s) => s.currentStepIndex);
  const completedSteps = useWizardStore((s) => s.completedSteps);
  const skippedSteps = useWizardStore((s) => s.skippedSteps);

  const phases = getPhases(steps);

  return (
    <nav className="flex w-52 flex-col gap-1 overflow-y-auto border-r border-border bg-surface-0 px-3 py-4">
      {phases.map((phase) => {
        const phaseSteps = steps.filter((s) => s.phase === phase);
        const phaseStartIndex = steps.indexOf(phaseSteps[0]);
        const phaseEndIndex = steps.indexOf(phaseSteps[phaseSteps.length - 1]);
        const isActivePhase = currentStepIndex >= phaseStartIndex && currentStepIndex <= phaseEndIndex;
        const isCompletedPhase = phaseSteps.every(
          (s) => completedSteps.has(s.id) || skippedSteps.has(s.id)
        );

        return (
          <div key={phase} className="mb-1">
            {/* Phase header */}
            <div className={`
              px-2 py-1 text-[10px] font-bold uppercase tracking-wider
              ${isActivePhase ? 'text-accent' : isCompletedPhase ? 'text-success' : 'text-subtle'}
            `}>
              {phase}
            </div>

            {/* Steps in this phase */}
            {phaseSteps.map((step) => {
              const stepIndex = steps.indexOf(step);
              const isCurrent = stepIndex === currentStepIndex;
              const isCompleted = completedSteps.has(step.id);
              const isSkipped = skippedSteps.has(step.id);
              const isFuture = !isCurrent && !isCompleted && !isSkipped;

              return (
                <div
                  key={step.id}
                  className={`
                    flex items-center gap-2 rounded px-2 py-1.5 text-[12px]
                    ${isCurrent
                      ? 'bg-accent/10 font-semibold text-accent'
                      : isCompleted
                        ? 'text-success'
                        : isSkipped
                          ? 'text-subtle'
                          : 'text-muted/40'
                    }
                  `}
                >
                  {/* Status icon */}
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {isCompleted && <Check size={12} className="text-success" />}
                    {isSkipped && <Minus size={12} className="text-subtle" />}
                    {isCurrent && (
                      <span className="h-2 w-2 rounded-full bg-accent" />
                    )}
                    {isFuture && (
                      <span className="h-1.5 w-1.5 rounded-full bg-muted/30" />
                    )}
                  </span>

                  <span className={isFuture ? 'opacity-40' : ''}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
