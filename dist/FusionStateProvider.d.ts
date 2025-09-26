import React, { ReactNode } from 'react';
import { GlobalState, GlobalFusionStateContextType, PersistenceConfig, SimplePersistenceConfig } from './types';
import { DevToolsConfig } from './devtools';
/**
 * Hook to access the global state context
 * @returns The global state context
 * @throws Error if used outside of a FusionStateProvider
 */
export declare const useGlobalState: () => GlobalFusionStateContextType;
/**
 * Props for the FusionStateProvider component
 */
interface FusionStateProviderProps {
    /** Child components that will have access to fusion state */
    children: ReactNode;
    /** Initial state values to set when the provider mounts */
    initialState?: GlobalState;
    /** Enable debug logging to console */
    debug?: boolean;
    /**
     * Persistence configuration:
     * - `true`: persist ALL state keys (use with caution)
     * - `string[]`: persist only specified keys (recommended)
     * - `object`: detailed configuration
     */
    persistence?: boolean | string[] | SimplePersistenceConfig | PersistenceConfig;
    /** DevTools configuration for Redux DevTools integration */
    devTools?: boolean | DevToolsConfig;
}
/**
 * Provider component for React Fusion State
 *
 * Manages global state and provides access to all child components.
 * Supports persistence, debug logging, and Redux DevTools integration.
 *
 * @example
 * ```tsx
 * <FusionStateProvider persistence={['user', 'cart']} debug>
 *   <App />
 * </FusionStateProvider>
 * ```
 */
export declare const FusionStateProvider: React.FC<FusionStateProviderProps>;
export {};
