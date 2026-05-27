import React, {
  memo,
  ReactNode,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';
import {
  GlobalFusionStateContextType,
  GlobalState,
  PersistenceConfig,
  SimplePersistenceConfig,
} from './types';
import {DevToolsConfig} from './devtools';
import {createStore} from './store/createStore';
import {DefaultStoreContext, useDefaultStore} from './store/defaultStore';

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
  persistence?:
    | boolean
    | string[]
    | SimplePersistenceConfig
    | PersistenceConfig;
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
export const FusionStateProvider: React.FC<FusionStateProviderProps> = memo(
  ({children, initialState = {}, debug = false, persistence, devTools = false}) => {
    // Build a fresh store on mount, sealed to the props. Captured-once on
    // purpose so that prop changes after mount don't trigger surprise
    // resets (matches the documented 1.3.x semantics).
    const store = useMemo(
      () =>
        createStore({
          initialState,
          debug,
          persistence,
          devTools,
        }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

    // Release subscriptions, pending debounced writes and DevTools
    // connection when the Provider unmounts. Essential for SSR per-request
    // stores and HMR scenarios.
    useEffect(() => () => store.destroy(), [store]);

    return (
      <DefaultStoreContext.Provider value={store}>
        {children}
      </DefaultStoreContext.Provider>
    );
  },
);
FusionStateProvider.displayName = 'FusionStateProvider';

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
export const useGlobalState = (): GlobalFusionStateContextType => {
  const store = useDefaultStore();

  // Subscribe to the *global* listener set so any state mutation triggers a
  // re-render — preserves the implicit "re-render on every change" contract
  // of the legacy context.
  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  );

  return useMemo(
    () => ({
      state,
      // Wrap the headless setter so passing a plain object replaces the
      // whole state (legacy semantics) instead of merging it (the new
      // store-native behaviour).
      setState: ((value: GlobalState | ((prev: GlobalState) => GlobalState)) => {
        store.setState(prev =>
          typeof value === 'function'
            ? (value as (p: GlobalState) => GlobalState)(prev)
            : value,
        );
      }) as React.Dispatch<React.SetStateAction<GlobalState>>,
      // Mirror the store's shared `initializingKeys` set so callers writing
      // their own hooks on top of `useGlobalState` interact with the same
      // duplicate-init guard the canonical hooks use.
      initializingKeys: (store as unknown as {initializingKeys: Set<string>})
        .initializingKeys,
      subscribeKey: store.subscribeKey,
      getKeySnapshot: (key: string) => store.getState()[key],
      getServerSnapshot: undefined,
      subscribeAll: store.subscribe,
      getStateSnapshot: store.getState,
      isHydrated: store.isHydrated,
    }),
    [state, store],
  );
};
