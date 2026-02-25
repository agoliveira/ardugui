import { FrameWizard } from './FrameWizard';
import type { PageId } from '@/app/Layout';

interface FrameWizardPageProps {
  onNavigate: (page: PageId) => void;
  onDirtyChange: (dirty: boolean) => void;
}

export function FrameWizardPage({ onNavigate, onDirtyChange }: FrameWizardPageProps) {
  return (
    <FrameWizard
      onClose={() => onNavigate('motors')}
      onDirtyChange={onDirtyChange}
    />
  );
}
