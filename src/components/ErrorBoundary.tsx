/**
 * ErrorBoundary.tsx -- Catches React render errors and displays them
 * visually on screen. Essential because Electron dev console is
 * inaccessible in this app.
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  label?: string;  // e.g. "SetupWizard" -- shown in error display
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error(`[ErrorBoundary${this.props.label ? `: ${this.props.label}` : ''}]`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      return (
        <div className="flex h-full w-full items-center justify-center bg-background p-8">
          <div className="w-full max-w-2xl rounded border-2 border-danger/50 bg-danger/5 p-6">
            <h2 className="text-lg font-bold text-danger">
              {this.props.label ? `${this.props.label} crashed` : 'Something went wrong'}
            </h2>
            <p className="mt-2 text-sm text-foreground font-mono">
              {error?.message || 'Unknown error'}
            </p>
            {error?.stack && (
              <pre className="mt-3 max-h-48 overflow-auto rounded bg-black/50 p-3 text-xs text-muted font-mono whitespace-pre-wrap">
                {error.stack}
              </pre>
            )}
            {errorInfo?.componentStack && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-subtle hover:text-muted">
                  Component stack
                </summary>
                <pre className="mt-1 max-h-32 overflow-auto rounded bg-black/50 p-3 text-xs text-muted font-mono whitespace-pre-wrap">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="btn btn-ghost mt-4 text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
