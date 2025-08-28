/**
 * Integrated error boundary for React Fusion State
 */

import React, {Component, ReactNode, ErrorInfo} from 'react';
import {GlobalState} from '../types';

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export interface FusionErrorBoundaryProps {
  children: ReactNode;

  fallback?: (
    error: Error,
    errorInfo: ErrorInfo,
    retry: () => void,
  ) => ReactNode;

  onError?: (error: Error, errorInfo: ErrorInfo) => void;

  enableRecovery?: boolean;

  maxRecoveryAttempts?: number;

  errorFilter?: (error: Error) => boolean;
}

export class FusionErrorBoundary extends Component<
  FusionErrorBoundaryProps,
  ErrorBoundaryState
> {
  private recoveryAttempts = 0;
  private recoveryTimer: NodeJS.Timeout | null = null;

  constructor(props: FusionErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `fusion-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.errorFilter && !this.props.errorFilter(error)) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
      });
      return;
    }

    this.setState({errorInfo});

    this.logError(error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    if (this.props.enableRecovery && this.shouldAttemptRecovery()) {
      this.attemptRecovery();
    }
  }

  private logError(error: Error, errorInfo: ErrorInfo): void {
    console.group('🚨 [FusionState] Error Boundary Caught Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error Stack:', error.stack);
    console.groupEnd();

    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  private reportError(error: Error, errorInfo: ErrorInfo): void {
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent:
          typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      };

      console.log('[FusionState] Error report prepared:', errorReport);
    } catch (reportingError) {
      console.warn('[FusionState] Failed to report error:', reportingError);
    }
  }

  private shouldAttemptRecovery(): boolean {
    const maxAttempts = this.props.maxRecoveryAttempts || 3;
    return this.recoveryAttempts < maxAttempts;
  }

  private attemptRecovery(): void {
    this.recoveryAttempts++;

    console.log(
      `[FusionState] Attempting recovery (${this.recoveryAttempts}/${this.props.maxRecoveryAttempts || 3})`,
    );

    this.recoveryTimer = setTimeout(() => {
      this.retry();
    }, 1000 * this.recoveryAttempts);
  }

  private retry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  componentWillUnmount(): void {
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
    }
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.state.errorInfo,
          this.retry,
        );
      }

      return (
        <div style={defaultErrorStyles.container}>
          <div style={defaultErrorStyles.content}>
            <h2 style={defaultErrorStyles.title}>Something went wrong</h2>
            <p style={defaultErrorStyles.message}>
              An error occurred in the state management system. This is likely a
              temporary issue.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details style={defaultErrorStyles.details}>
                <summary style={defaultErrorStyles.summary}>
                  Error Details (Development)
                </summary>
                <pre style={defaultErrorStyles.pre}>
                  <code>{this.state.error.stack}</code>
                </pre>
                <pre style={defaultErrorStyles.pre}>
                  <code>{this.state.errorInfo.componentStack}</code>
                </pre>
              </details>
            )}

            <div style={defaultErrorStyles.actions}>
              <button onClick={this.retry} style={defaultErrorStyles.button}>
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                style={{
                  ...defaultErrorStyles.button,
                  ...defaultErrorStyles.secondaryButton,
                }}>
                Reload Page
              </button>
            </div>

            {this.recoveryAttempts > 0 && (
              <p style={defaultErrorStyles.recoveryInfo}>
                Recovery attempts: {this.recoveryAttempts}/
                {this.props.maxRecoveryAttempts || 3}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const defaultErrorStyles = {
  container: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '500px',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '20px',
    fontWeight: 600,
    color: '#d73a49',
  },
  message: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#586069',
  },
  details: {
    margin: '16px 0',
    fontSize: '12px',
  },
  summary: {
    cursor: 'pointer',
    fontWeight: 600,
    marginBottom: '8px',
  },
  pre: {
    backgroundColor: '#f6f8fa',
    border: '1px solid #e1e4e8',
    borderRadius: '4px',
    padding: '12px',
    overflow: 'auto',
    fontSize: '11px',
    lineHeight: '1.4',
    margin: '8px 0',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: '20px',
  },
  button: {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    backgroundColor: '#0366d6',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: '#6a737d',
  },
  recoveryInfo: {
    fontSize: '12px',
    color: '#6a737d',
    marginTop: '12px',
    textAlign: 'center' as const,
  },
};

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<FusionErrorBoundaryProps, 'children'>,
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <FusionErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </FusionErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
