/**
 * ConfirmDialog.tsx -- In-app confirmation dialog.
 *
 * Replaces window.confirm() with a styled dialog matching Forge v6 design.
 * Supports customizable title, message, confirm/cancel labels, and
 * danger mode for destructive actions.
 */

import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  /** Dialog title */
  title: string;
  /** Message body (can be string or JSX) */
  message: React.ReactNode;
  /** Confirm button label */
  confirmLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** If true, confirm button uses danger styling */
  danger?: boolean;
  /** Called when user confirms */
  onConfirm: () => void;
  /** Called when user cancels or clicks backdrop */
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Focus confirm button on mount, trap Escape
  useEffect(() => {
    confirmRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm rounded border border-border bg-surface-1 p-6 shadow-2xl">
        {danger && (
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-danger" />
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
          </div>
        )}
        {!danger && (
          <h3 className="mb-3 text-lg font-bold text-foreground">{title}</h3>
        )}

        <div className="mb-5 text-sm text-muted">{message}</div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="btn btn-ghost"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`btn ${
              danger
                ? 'bg-danger text-white hover:bg-danger/80'
                : 'btn-primary'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook: useConfirm -- async wrapper for ConfirmDialog                */
/* ------------------------------------------------------------------ */

interface ConfirmOptions {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmState {
  visible: boolean;
  options: ConfirmOptions | null;
  resolve: ((value: boolean) => void) | null;
}

/**
 * Hook that provides an async confirm() function.
 *
 * Usage:
 *   const { confirm, ConfirmDialogElement } = useConfirm();
 *
 *   const ok = await confirm({
 *     title: 'Reset?',
 *     message: 'This will erase all settings.',
 *     danger: true,
 *   });
 *   if (ok) doReset();
 *
 *   // In JSX:
 *   return <>{ConfirmDialogElement}</>
 */
import { useState, useCallback } from 'react';

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    visible: false,
    options: null,
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setState({ visible: true, options, resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState({ visible: false, options: null, resolve: null });
  }, [state.resolve]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState({ visible: false, options: null, resolve: null });
  }, [state.resolve]);

  const ConfirmDialogElement = state.visible && state.options ? (
    <ConfirmDialog
      title={state.options.title}
      message={state.options.message}
      confirmLabel={state.options.confirmLabel}
      cancelLabel={state.options.cancelLabel}
      danger={state.options.danger}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return { confirm, ConfirmDialogElement };
}
