import React, { ReactNode } from 'react';
import { GlobalFusionStateContextType, GlobalState, PersistenceConfig, SimplePersistenceConfig } from './types';
import { DevToolsConfig } from './devtools';
/**
 * Props for the {@link FusionStateProvider} component. Backward-compatible
 * with every 1.x release: the four config fields below are captured at
 * mount and frozen for the lifetime of the Provider — changing them later
 * has no effect (remount the Provider to switch behaviour).
 *
 * Under the hood (since v1.4) the Provider just builds an anonymous
 * {@link Store} via `createStore({...props})` and renders the store's own
 * `Provider`. Users wanting access to the headless store API should call
 * `createStore()` directly.
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
     * Captured at mount and frozen for the lifetime of the provider.
     */
    persistence?: boolean | string[] | SimplePersistenceConfig | PersistenceConfig;
    /** DevTools configuration for Redux DevTools integration. */
    devTools?: boolean | DevToolsConfig;
}
/**
 * Provider component for React Fusion State.
 *
 * Since v1.4 this is a thin (~30-line) wrapper around the headless
 * {@link createStore} factory. Mounting `<FusionStateProvider {...props}>`
 * is exactly equivalent to:
 *
 * ```tsx
 * const store = useMemo(() => createStore(props), []);
 * useEffect(() => () => store.destroy(), [store]);
 * return <store.Provider>{children}</store.Provider>;
 * ```
 *
 * The store reference is exposed through the internal `DefaultStoreContext`
 * so module-level hooks (`useFusionState`, `useFusionStore`, …) can find
 * it. Storage keys are namespaced under the fixed `fusion_state` prefix —
 * mounting multiple `FusionStateProvider`s with persistence will share the
 * same storage slot. For full isolation, switch to `createStore()` and
 * pass the store explicitly.
 *
 * @example
 * ```tsx
 * <FusionStateProvider persistence={['user', 'cart']} debug>
 *   <App />
 * </FusionStateProvider>
 * ```
 */
export declare const FusionStateProvider: React.FC<FusionStateProviderProps>;
/**
 * Resolve the global state context for the nearest `FusionStateProvider` in
 * the React tree. Public API kept since v1.0.
 *
 * Since v1.4 the returned object is synthesized from the underlying store
 * each render — `state` is subscribed via `useSyncExternalStore` so callers
 * still re-render on every change, just like the original.
 *
 * Note on `setState`: the synthesized setter always replaces the global
 * state when called with a non-function value (matching React's
 * `Dispatch<SetStateAction<T>>` semantics), even though `store.setState`
 * shallow-merges partial objects natively. This preserves the strict 1.x
 * contract for direct `useGlobalState()` callers.
 *
 * @throws Error if used outside of a `FusionStateProvider`.
 */
export declare const useGlobalState: () => GlobalFusionStateContextType;
