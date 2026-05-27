import React, { ReactNode } from 'react';
import { GlobalFusionStateContextType, GlobalState, PersistenceConfig, SimplePersistenceConfig } from './types';
import { DevToolsConfig } from './devtools';
/**
 * Static (stable) slice of the provider API: only references that never
 * change for the lifetime of the provider. Consumers of this context do NOT
 * re-render on state changes — they only re-render when the provider itself
 * mounts/unmounts.
 *
 * Used internally by `useFusionStore` to subscribe to state changes via
 * `useSyncExternalStore` without paying the cost of a full context-driven
 * re-render on every state update.
 */
interface FusionStaticContextType {
    subscribeAll: (listener: () => void) => () => void;
    getStateSnapshot: () => GlobalState;
}
/**
 * Hook to access the global state context.
 *
 * @returns The global state context
 * @throws Error if used outside of a `FusionStateProvider`
 */
export declare const useGlobalState: () => GlobalFusionStateContextType;
/**
 * Internal hook that returns the static (stable) provider API for selector
 * subscriptions. Consumers of this hook do NOT re-render on state changes.
 *
 * @internal — used by `useFusionStore`; not part of the public API.
 * @throws Error if used outside of a `FusionStateProvider`
 */
export declare const useFusionStaticAPI: () => FusionStaticContextType;
/**
 * Props for the {@link FusionStateProvider} component.
 */
export interface FusionStateProviderProps {
    /** Child components that will have access to fusion state. */
    children: ReactNode;
    /** Initial state values to set when the provider mounts. */
    initialState?: GlobalState;
    /** Enable debug logging to console. */
    debug?: boolean;
    /**
     * Persistence configuration:
     * - `true`: persist ALL state keys (use with caution)
     * - `string[]`: persist only specified keys (recommended)
     * - `object`: detailed configuration
     *
     * Note: this prop is captured at mount and frozen for the lifetime of the
     * provider. Changing it after mount has no effect — unmount and remount
     * the provider to switch persistence behavior.
     */
    persistence?: boolean | string[] | SimplePersistenceConfig | PersistenceConfig;
    /** DevTools configuration for Redux DevTools integration. */
    devTools?: boolean | DevToolsConfig;
}
/**
 * Provider component for React Fusion State.
 *
 * Manages global state and provides access to all child components.
 * Supports persistence, debug logging, and Redux DevTools integration.
 *
 * Storage keys are namespaced under a fixed `fusion_state` prefix. If you
 * mount multiple `FusionStateProvider`s in the same app with persistence
 * enabled, they will share the same storage slot — typically you want a
 * single root provider.
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
