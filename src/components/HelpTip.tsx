/**
 * HelpTip.tsx -- (?) icon with tooltip and expandable explanation.
 *
 * Used on standalone pages next to parameter controls.
 * Tier 1: tooltip on hover (one-liner)
 * Tier 2: click to expand inline explanation
 * Tier 3: "Learn more" link to ArduPilot wiki
 */

import { useState, useRef, useEffect } from 'react';
import { HelpCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { getHelp, type HelpEntry } from '@/models/help';

interface HelpTipProps {
  /** Help entry key (e.g. 'MOT_PWM_TYPE') */
  helpKey: string;
  /** Override: pass entry directly instead of lookup */
  entry?: HelpEntry;
  /** Inline mode: render explanation below, not in a floating panel */
  inline?: boolean;
}

export function HelpTip({ helpKey, entry: directEntry, inline = false }: HelpTipProps) {
  const entry = directEntry ?? getHelp(helpKey);
  if (!entry) return null;

  const [expanded, setExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    tooltipTimer.current = setTimeout(() => setShowTooltip(true), 400);
  };
  const handleMouseLeave = () => {
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    setShowTooltip(false);
  };

  // Close on Escape
  useEffect(() => {
    if (!expanded) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [expanded]);

  return (
    <span className="relative inline-flex items-center">
      <button
        onClick={() => setExpanded(!expanded)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-flex items-center justify-center rounded-full p-0.5 text-subtle hover:text-accent transition-colors"
        title={entry.tip}
      >
        <HelpCircle size={13} />
      </button>

      {/* Tooltip (Tier 1) */}
      {showTooltip && !expanded && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-surface-3 px-2.5 py-1.5 text-[11px] text-foreground shadow-lg border border-border max-w-xs">
          {entry.tip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface-3" />
        </div>
      )}

      {/* Expanded panel (Tier 2 + 3) */}
      {expanded && !inline && (
        <div className="absolute top-full left-0 z-50 mt-1 w-72 rounded border border-border bg-surface-1 p-3 shadow-xl">
          <p className="text-xs leading-relaxed text-muted">{entry.explain}</p>
          {entry.wikiUrl && (
            <a href={entry.wikiUrl} target="_blank" rel="noopener noreferrer"
              className="mt-2 flex items-center gap-1 text-[11px] text-accent hover:underline">
              <ExternalLink size={10} /> Learn more on ArduPilot Wiki
            </a>
          )}
        </div>
      )}

      {/* Inline expanded (for use inside cards) */}
      {expanded && inline && (
        <div className="ml-2 text-xs leading-relaxed text-muted">
          {entry.explain}
          {entry.wikiUrl && (
            <a href={entry.wikiUrl} target="_blank" rel="noopener noreferrer"
              className="ml-1 inline-flex items-center gap-0.5 text-[11px] text-accent hover:underline">
              <ExternalLink size={9} /> Wiki
            </a>
          )}
        </div>
      )}
    </span>
  );
}

/**
 * StepHelp -- collapsible "What is this?" bar for wizard steps.
 *
 * Collapsed: one-line summary with [?] icon.
 * Expanded: full explanation + wiki link.
 */
interface StepHelpProps {
  stepId: string;
}

import { WIZARD_STEP_HELP } from '@/models/help';

export function StepHelp({ stepId }: StepHelpProps) {
  const entry = WIZARD_STEP_HELP[stepId];
  if (!entry) return null;

  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative rounded border border-border bg-surface-0 overflow-visible">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-surface-1"
      >
        <HelpCircle size={14} className="shrink-0 text-accent" />
        <span className="flex-1 text-sm text-muted">{entry.summary}</span>
        {expanded
          ? <ChevronUp size={14} className="shrink-0 text-subtle" />
          : <ChevronDown size={14} className="shrink-0 text-subtle" />}
      </button>
      {expanded && (
        <>
          {/* Backdrop -- click to dismiss */}
          <div className="fixed inset-0 z-30" onClick={() => setExpanded(false)} />
          {/* Overlay panel */}
          <div className="absolute left-0 right-0 top-full z-40 rounded-b border border-t-0 border-border bg-surface-1/95 backdrop-blur-sm px-4 py-3 shadow-xl space-y-2">
            {entry.detail.split('\n\n').map((para, i) => (
              <p key={i} className="text-xs leading-relaxed text-muted">{para}</p>
            ))}
            {entry.wikiUrl && (
              <a href={entry.wikiUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-accent hover:underline">
                <ExternalLink size={10} /> Learn more on ArduPilot Wiki
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}
