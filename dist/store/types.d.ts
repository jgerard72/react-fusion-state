import { ReactNode, FC } from 'react';
import { GlobalState, PersistenceConfig, SimplePersistenceConfig, StateUpdater, UseFusionStateOptions } from '../types';
import { DevToolsConfig } from '../devtools';
import { TypedKey } from '../createKey';
/**
 * Options accepted by {@link createStore}. Identical shape to the legacy
 * `FusionStateProvider` props, minus `children` — every field is optional and
 * frozen at factory time (changing the value later has no effect, exactly like
 * 1.3.x Provider props).
 */
export interface CreateStoreOptions {
    /** Initial state values seeded into the store at creation time. */
    initialState?: GlobalState;
    /** Enable debug logging to console. */
    debug?: boolean;
    /**
     * Persistence configuration. Accepted shapes match the legacy Provider:
     * - `true`: persist all keys
     * - `string[]`: persist only the listed keys (recommended)
     * - `SimplePersistenceConfig` / `PersistenceConfig`: full control
     */
    persistence?: boolean | string[] | SimplePersistenceConfig | PersistenceConfig;
    /** Redux DevTools configuration (`false`/`undefined` to disable). */
    devTools?: boolean | DevToolsConfig;
}
/**
 * Props for the React Provider component exposed by every store
 * ({@link Store.Provider}). The Provider only takes children — all
 * configuration was captured at {@link createStore} factory time.
 *
 * The legacy {@link FusionStateProviderProps} adds the four config fields
 * (initialState, debug, persistence, devTools) because the legacy Provider
 * builds its own anonymous store under the hood.
 */
export interface StoreProviderProps {
    children: ReactNode;
}
/**
 * Public, framework-agnostic store contract returned by {@link createStore}.
 *
 * The store is split in two layers:
 * - **Headless layer** (`getState` / `setState` / `subscribe` / `subscribeKey`
 *   / `destroy`): plain JS, no React import touched. Safe to call from any
 *   environment — Web Workers, Node scripts, RSC, test files, init code.
 * - **React layer** (`Provider` / `useFusionState` / `useFusionStore` /
 *   `useFusionHydrated`): the same hooks the public API exposes, but bound
 *   to *this* store via closure. Use them under `<store.Provider>`.
 *
 * Both layers stay in sync — calling `store.setState(...)` from outside
 * React triggers the same per-key notifications that React components are
 * subscribed to (batched via `unstable_batchedUpdates`).
 */
export interface Store {
    /** Read the current full state snapshot. Synchronous, no React required. */
    getState(): GlobalState;
    /**
     * Apply a state update. Accepts either a partial object (merged shallowly)
     * or an updater function `(prev) => next`. Triggers per-key and global
     * listener notifications in a single batched flush.
     *
     * Skips notification when the resulting state is reference-equal to the
     * previous one (early-out on no-op updates).
     */
    setState(updater: Partial<GlobalState> | ((prev: GlobalState) => GlobalState)): void;
    /**
     * Subscribe to *any* state change. The listener is invoked once per
     * `setState` that actually mutates state, after all per-key listeners have
     * fired. Returns an unsubscribe function.
     */
    subscribe(listener: () => void): () => void;
    /**
     * Subscribe to changes on a single key. Cheaper than `subscribe` for hooks
     * that only read one slice. Returns an unsubscribe function.
     */
    subscribeKey(key: string, listener: () => void): () => void;
    /**
     * Release all resources held by the store: clear listener maps, flush any
     * pending debounced save, detach DevTools. After `destroy()` the store
     * becomes a no-op (`getState` returns the last known state, `setState` is
     * silently ignored). Useful in SSR contexts where one store is built per
     * request and must not leak between requests.
     */
    destroy(): void;
    /**
     * `true` once the initial hydration from persistence has completed (or
     * `true` immediately if no async hydration is needed). Mirrors the value
     * returned by the React hook {@link useFusionHydrated}; exposed here for
     * non-React consumers.
     */
    readonly isHydrated: boolean;
    /** React Provider component. Wrap your tree to expose this store to hooks. */
    Provider: FC<StoreProviderProps>;
    /** Store-bound version of {@link useFusionState}. Same signature, same semantics. */
    useFusionState: <T = unknown>(key: string | TypedKey<T>, initialValue?: T, options?: UseFusionStateOptions) => [T, StateUpdater<T>];
    /** Store-bound version of {@link useFusionStore}. */
    useFusionStore: <T>(selector: (state: GlobalState) => T, equalityFn?: (a: T, b: T) => boolean) => T;
    /** Store-bound version of {@link useFusionHydrated}. */
    useFusionHydrated: () => boolean;
    /**
     * Internal brand. Stable across versions, used by helpers that need to
     * distinguish a real store from an arbitrary object passed by mistake.
     * @internal
     */
    readonly __isFusionStore: true;
}
/**
 * Shape returned by the internal subscription-registry factory. Plain JS,
 * no React. Backs `subscribe` / `subscribeKey` on every {@link Store}.
 *
 * @internal
 */
export interface SubscriptionRegistry {
    subscribeKey: (key: string, listener: () => void) => () => void;
    subscribe: (listener: () => void) => () => void;
    notifyKeys: (changedKeys: readonly string[]) => void;
    clear: () => void;
}
