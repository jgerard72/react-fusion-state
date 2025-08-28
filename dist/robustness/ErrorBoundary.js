"use strict";
/**
 * Integrated error boundary for React Fusion State
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withErrorBoundary = exports.FusionErrorBoundary = void 0;
const react_1 = __importStar(require("react"));
class FusionErrorBoundary extends react_1.Component {
    constructor(props) {
        super(props);
        this.recoveryAttempts = 0;
        this.recoveryTimer = null;
        this.retry = () => {
            this.setState({
                hasError: false,
                error: null,
                errorInfo: null,
                errorId: null,
            });
        };
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
            errorId: `fusion-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
    }
    componentDidCatch(error, errorInfo) {
        if (this.props.errorFilter && !this.props.errorFilter(error)) {
            this.setState({
                hasError: false,
                error: null,
                errorInfo: null,
                errorId: null,
            });
            return;
        }
        this.setState({ errorInfo });
        this.logError(error, errorInfo);
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
        if (this.props.enableRecovery && this.shouldAttemptRecovery()) {
            this.attemptRecovery();
        }
    }
    logError(error, errorInfo) {
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
    reportError(error, errorInfo) {
        try {
            const errorReport = {
                message: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                timestamp: new Date().toISOString(),
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
                url: typeof window !== 'undefined' ? window.location.href : 'unknown',
            };
            console.log('[FusionState] Error report prepared:', errorReport);
        }
        catch (reportingError) {
            console.warn('[FusionState] Failed to report error:', reportingError);
        }
    }
    shouldAttemptRecovery() {
        const maxAttempts = this.props.maxRecoveryAttempts || 3;
        return this.recoveryAttempts < maxAttempts;
    }
    attemptRecovery() {
        this.recoveryAttempts++;
        console.log(`[FusionState] Attempting recovery (${this.recoveryAttempts}/${this.props.maxRecoveryAttempts || 3})`);
        this.recoveryTimer = setTimeout(() => {
            this.retry();
        }, 1000 * this.recoveryAttempts);
    }
    componentWillUnmount() {
        if (this.recoveryTimer) {
            clearTimeout(this.recoveryTimer);
        }
    }
    render() {
        if (this.state.hasError && this.state.error && this.state.errorInfo) {
            if (this.props.fallback) {
                return this.props.fallback(this.state.error, this.state.errorInfo, this.retry);
            }
            return (react_1.default.createElement("div", { style: defaultErrorStyles.container },
                react_1.default.createElement("div", { style: defaultErrorStyles.content },
                    react_1.default.createElement("h2", { style: defaultErrorStyles.title }, "Something went wrong"),
                    react_1.default.createElement("p", { style: defaultErrorStyles.message }, "An error occurred in the state management system. This is likely a temporary issue."),
                    process.env.NODE_ENV === 'development' && (react_1.default.createElement("details", { style: defaultErrorStyles.details },
                        react_1.default.createElement("summary", { style: defaultErrorStyles.summary }, "Error Details (Development)"),
                        react_1.default.createElement("pre", { style: defaultErrorStyles.pre },
                            react_1.default.createElement("code", null, this.state.error.stack)),
                        react_1.default.createElement("pre", { style: defaultErrorStyles.pre },
                            react_1.default.createElement("code", null, this.state.errorInfo.componentStack)))),
                    react_1.default.createElement("div", { style: defaultErrorStyles.actions },
                        react_1.default.createElement("button", { onClick: this.retry, style: defaultErrorStyles.button }, "Try Again"),
                        react_1.default.createElement("button", { onClick: () => window.location.reload(), style: Object.assign(Object.assign({}, defaultErrorStyles.button), defaultErrorStyles.secondaryButton) }, "Reload Page")),
                    this.recoveryAttempts > 0 && (react_1.default.createElement("p", { style: defaultErrorStyles.recoveryInfo },
                        "Recovery attempts: ",
                        this.recoveryAttempts,
                        "/",
                        this.props.maxRecoveryAttempts || 3)))));
        }
        return this.props.children;
    }
}
exports.FusionErrorBoundary = FusionErrorBoundary;
const defaultErrorStyles = {
    container: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
        textAlign: 'center',
    },
};
function withErrorBoundary(Component, errorBoundaryProps) {
    const WrappedComponent = (props) => (react_1.default.createElement(FusionErrorBoundary, Object.assign({}, errorBoundaryProps),
        react_1.default.createElement(Component, Object.assign({}, props))));
    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    return WrappedComponent;
}
exports.withErrorBoundary = withErrorBoundary;
//# sourceMappingURL=ErrorBoundary.js.map