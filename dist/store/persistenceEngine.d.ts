import { GlobalState, PersistenceConfig } from '../types';
import { CreateStoreOptions } from './types';
/**
 * Pure helper that normalizes the various accepted persistence shapes
 * (`true` | `string[]` | `SimplePersistenceConfig` | `PersistenceConfig`)
 * into a canonical {@link PersistenceConfig}. Returns `undefined` when
 * persistence is disabled.
 *
 * Behaviour preserved verbatim from the legacy `normalizePersistenceConfig`
 * that used to live inside `FusionStateProvider.tsx` so the migration to the
 * headless engine is byte-equivalent for the user.
 */
export declare function normalizePersistenceConfig(config: CreateStoreOptions['persistence'], debug?: boolean): PersistenceConfig | undefined;
/**
 * Result of the synchronous hydration attempt. On the web with a
 * `getItemSync`-capable adapter, the stored snapshot is read in a single
 * synchronous call so the very first render of any component already sees
 * the persisted value (no flicker). Everywhere else this returns the
 * unchanged `initialState` and asynchronous hydration takes over.
 */
export interface SyncLoadResult {
    state: GlobalState;
    error: Error | null;
}
/**
 * Pure helper for synchronous hydration. Used both by the headless store
 * (at construction time) and conceptually by anyone wanting to pre-load
 * state from a sync storage adapter without instantiating a full store.
 */
export declare function loadSyncInitialState(config: PersistenceConfig | undefined, initialState: GlobalState, debug?: boolean): SyncLoadResult;
/**
 * Headless persistence engine attached to a {@link Store}. Mirrors the
 * lifecycle of the legacy `usePersistence` hook but with no React imports.
 *
 * Responsibilities:
 * - Run sync hydration eagerly at construction time and expose the merged
 *   initial state via {@link PersistenceEngine.initialState}.
 * - Kick off async hydration on demand via {@link PersistenceEngine.startAsyncHydration}.
 *   The caller supplies an `apply` callback that the engine invokes with the
 *   loaded snapshot — usually wired to `store.setState` so the store updates
 *   itself once the AsyncStorage promise resolves.
 * - Debounce + filter + dedup writes on {@link PersistenceEngine.save}.
 * - Honor the `skipNextSave` flag so an async-hydration commit doesn't
 *   immediately write the freshly loaded data back to storage.
 * - Track `isHydrated` and let listeners observe its transition.
 */
export interface PersistenceEngine {
    /** Merged initial state (caller's `initialState` + sync-hydrated snapshot, if any). */
    readonly initialState: GlobalState;
    /** `true` once initial hydration has completed (sync or async). Read-only. */
    readonly isHydrated: boolean;
    /**
     * Subscribe to the one-shot `isHydrated` transition. Listener is invoked
     * the moment `isHydrated` flips from `false` to `true` (then never again).
     * Returns an unsubscribe function.
     */
    onHydratedChange: (listener: () => void) => () => void;
    /**
     * Trigger asynchronous hydration. Safe to call multiple times — runs at
     * most once. The supplied `apply` callback is invoked with the loaded
     * snapshot before `isHydrated` flips, so subscribers see the new state
     * already in place when they react to the transition.
     *
     * Implementations may use this to wire `store.setState` so the store
     * receives the async-loaded data without exposing the engine internals.
     */
    startAsyncHydration: (apply: (loaded: GlobalState) => void) => void;
    /**
     * Persist the given state. Honours `persistKeys` filtering, debouncing,
     * deep-equality dedup against the last persisted snapshot, and reports
     * errors via the user-supplied `onSaveError` callback.
     */
    save: (state: GlobalState) => void;
    /**
     * Returns `true` (and clears the flag) if the next save should be skipped.
     * Set automatically by the async-hydration path so we don't write back
     * the data we just loaded.
     */
    shouldSkipNextSave: () => boolean;
    /**
     * Report a startup load error (if any) by invoking the user-supplied
     * `onLoadError` callback exactly once. Mirrors the post-mount reporting
     * the React hook used to do inside a `useEffect` so the user always
     * receives the error even if it happened during the sync init.
     */
    reportStartupError: () => void;
    /**
     * Release all resources: cancel any pending debounced save, clear
     * hydration listeners. After `destroy()` the engine becomes a no-op.
     */
    destroy: () => void;
}
/**
 * Build a {@link PersistenceEngine}. Pure JS — never imports React.
 *
 * The engine is constructed eagerly at store-creation time, performs sync
 * hydration immediately (so `initialState` is hot), then waits for the
 * caller to invoke {@link PersistenceEngine.startAsyncHydration} for the
 * mobile / AsyncStorage path. The store calls into the engine from its
 * `setState` to persist mutations.
 */
export declare function createPersistenceEngine(rawConfig: CreateStoreOptions['persistence'], callerInitialState: GlobalState, debug?: boolean): PersistenceEngine;
