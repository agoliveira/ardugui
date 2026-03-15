/**
 * WizardNav.tsx -- Bottom navigation bar with Back / Next / Skip buttons.
 *
 * Write-as-you-go: When the user clicks Next, any staged params that
 * haven't been written yet are committed to the FC before advancing.
 */

import { useState } from 'react';
import { ChevronLeft, ChevronRight, SkipForward, Loader2 } from 'lucide-react';
import { useWizardStore } from './wizardStore';
import { connectionManager } from '@/mavlink/connection';

interface WizardNavProps {
  canAdvance: boolean;
  onNext?: () => void;
  onSkip?: () => void;
}

export function WizardNav({ canAdvance, onNext, onSkip }: WizardNavProps) {
  const prevStep = useWizardStore((s) => s.prevStep);
  const nextStep = useWizardStore((s) => s.nextStep);
  const isFirst = useWizardStore((s) => s.isFirstStep());
  const isLast = useWizardStore((s) => s.isLastStep());
  const currentStep = useWizardStore((s) => s.currentStep());
  const markSkipped = useWizardStore((s) => s.markSkipped);
  const stagedParams = useWizardStore((s) => s.stagedParams);
  const writtenParams = useWizardStore((s) => s.writtenParams);
  const recordWritten = useWizardStore((s) => s.recordWritten);

  const [writing, setWriting] = useState(false);

  /**
   * Commit any staged params that haven't been written yet to the FC.
   * Returns true if all writes succeeded.
   */
  const commitStagedParams = async (): Promise<boolean> => {
    // Find params that are staged but not yet written (or changed since last write)
    const toWrite: Record<string, number> = {};
    for (const [name, value] of Object.entries(stagedParams)) {
      if (writtenParams[name] !== value) {
        toWrite[name] = value;
      }
    }

    if (Object.keys(toWrite).length === 0) return true;

    setWriting(true);
    let allOk = true;
    for (const [name, value] of Object.entries(toWrite)) {
      const ok = await connectionManager.writeParam(name, value);
      if (!ok) {
        allOk = false;
        // Continue writing the rest -- partial is better than nothing
      }
    }
    if (allOk) {
      recordWritten(toWrite);
    }
    setWriting(false);
    return allOk;
  };

  const handleNext = async () => {
    if (onNext) {
      onNext();
      return;
    }
    await commitStagedParams();
    nextStep();
  };

  const handleSkip = async () => {
    if (currentStep) markSkipped(currentStep.id);
    if (onSkip) {
      onSkip();
    } else {
      nextStep();
    }
  };

  return (
    <div className="flex items-center justify-between border-t border-border bg-surface-0 px-6 py-3">
      <div>
        {!isFirst && (
          <button onClick={prevStep} disabled={writing} className="btn btn-ghost gap-1">
            <ChevronLeft size={14} />
            Back
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {currentStep?.skippable && !isLast && (
          <button onClick={handleSkip} disabled={writing} className="btn btn-ghost gap-1 text-subtle">
            <SkipForward size={13} />
            Skip
          </button>
        )}

        {!isLast && (
          <button
            onClick={handleNext}
            disabled={!canAdvance || writing}
            className="btn btn-primary gap-1"
          >
            {writing ? (
              <><Loader2 size={14} className="animate-spin" /> Saving...</>
            ) : (
              <>Next <ChevronRight size={14} /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
