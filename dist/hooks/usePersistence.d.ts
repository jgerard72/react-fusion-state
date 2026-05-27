/// <reference types="react" />
import { GlobalState, PersistenceConfig } from '../types';
/**
 * Result of {@link loadSyncInitialState}.
 */
export interface SyncLoadResult {
    /** Merged initial state (storage + caller's initialState). */
    state: GlobalState;
    /** Set when the sync load attempt threw — the hook will report it post-mount. */
    error: Error | null;
}
/**
 * Pure helper for synchronous hydration on web (`localStorage.getItem` path).
 *
 * Called by the Provider inside its `useState` lazy initializer so the loaded
 * value is available on the very first render (no flicker). For RN /
 * AsyncStorage, this returns `{state: initialState, error: null}` and the
 * async load happens later inside {@link usePersistence}.
 */
export declare function loadSyncInitialState(config: PersistenceConfig | undefined, initialState: GlobalState, debug?: boolean): SyncLoadResult;
/**
 * Result of {@link usePersistence}.
 */
export interface PersistenceAPI {
    /** `true` once the initial hydration (sync or async) has completed. */
    isHydrated: boolean;
    /**
     * Save the given state to storage (filtered by `persistKeys` and debounced
     * if `debounceTime > 0`). Safe to call unconditionally — bails out early
     * when `saveOnChange` is disabled or there's nothing to persist.
     */
    save: (state: GlobalState) => void;
    /**
     * Check (and clear) the "skip next save" flag. The flag is set whenever the
     * async hydration path applies a freshly-loaded snapshot, so the orchestrator
     * doesn't immediately re-persist the same data back to storage.
     */
    shouldSkipNextSave: () => boolean;
}
/**
 * Hook that handles the async portion of the persistence lifecycle: async
 * hydration on mount (RN / AsyncStorage), reporting of any sync-load error
 * to the user-supplied callback, debounced save with key filtering and
 * deep-equality dedup, and error reporting on save failures.
 *
 * The sync hydration (web `localStorage`) is performed separately by the
 * Provider via {@link loadSyncInitialState} inside its `useState` lazy
 * initializer — that has to run before any hook can fire.
 *
 * Persistence config is captured at first call and frozen for the lifetime
 * of the hook (matches the documented Provider semantics).
 *
 * @param config - Normalized persistence configuration (or `undefined` for none).
 * @param setStateRaw - The Provider's raw `setState` setter, used to apply
 *   freshly-loaded async snapshots.
 * @param syncLoadError - Error from the sync-load attempt (or `null`), to be
 *   reported via `onLoadError` after mount.
 * @param debug - Whether to emit debug logs.
 */
export declare function usePersistence(config: PersistenceConfig | undefined, setStateRaw: React.Dispatch<React.SetStateAction<GlobalState>>, syncLoadError: Error | null, debug?: boolean): PersistenceAPI;
