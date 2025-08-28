/**
 * Integrated error boundary for React Fusion State
 */
import React, { Component, ReactNode, ErrorInfo } from 'react';
export interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    errorId: string | null;
}
export interface FusionErrorBoundaryProps {
    children: ReactNode;
    fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    enableRecovery?: boolean;
    maxRecoveryAttempts?: number;
    errorFilter?: (error: Error) => boolean;
}
export declare class FusionErrorBoundary extends Component<FusionErrorBoundaryProps, ErrorBoundaryState> {
    private recoveryAttempts;
    private recoveryTimer;
    constructor(props: FusionErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState>;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    private logError;
    private reportError;
    private shouldAttemptRecovery;
    private attemptRecovery;
    private retry;
    componentWillUnmount(): void;
    render(): ReactNode;
}
export declare function withErrorBoundary<P extends object>(Component: React.ComponentType<P>, errorBoundaryProps?: Omit<FusionErrorBoundaryProps, 'children'>): React.ComponentType<P>;
