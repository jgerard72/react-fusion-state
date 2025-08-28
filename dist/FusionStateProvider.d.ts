import React, { ReactNode } from 'react';
import { GlobalState, GlobalFusionStateContextType, PersistenceConfig, SimplePersistenceConfig } from './types';
import { DevToolsConfig } from './devtools';
/**
 * Hook to access the global state context
 * @returns The global state context
 * @throws Error if used outside of a FusionStateProvider
 */
export declare const useGlobalState: () => GlobalFusionStateContextType;
interface FusionStateProviderProps {
    /** Child components that will have access to fusion state */
    children: ReactNode;
    /** Optional initial state values */
    initialState?: GlobalState;
    /** Enable debug mode which logs state changes to console */
    debug?: boolean;
    /**
     * Persistence configuration - can be:
     * - true: enable persistence for all keys with default values
     * - string array: enable persistence only for specified keys
     * - object: detailed configuration with keys, prefix, etc.
     * - complete PersistenceConfig object: advanced configuration (backward compatibility)
     */
    persistence?: boolean | string[] | SimplePersistenceConfig | PersistenceConfig;
    /** DevTools configuration (v0.4.0+) */
    devTools?: boolean | DevToolsConfig;
}
/**
 * Provider component for React Fusion State
 * Manages the global state and provides access to all child components
 */
export declare const FusionStateProvider: React.FC<FusionStateProviderProps>;
export {};
