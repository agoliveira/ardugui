import { FrameWizard } from './FrameWizard';

interface FrameWizardPageProps {
  onDirtyChange: (dirty: boolean) => void;
  onNavigate?: (page: string) => void;
}

export function FrameWizardPage({ onDirtyChange, onNavigate }: FrameWizardPageProps) {
  return (
    <FrameWizard
      onClose={() => {}}
      onDirtyChange={onDirtyChange}
      onNavigate={onNavigate}
    />
  );
}
