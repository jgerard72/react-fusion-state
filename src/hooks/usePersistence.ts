import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  GlobalState,
  PersistenceConfig,
  SimplePersistenceConfig,
  FusionStateErrorMessages,
} from '../types';
import {
  createNoopStorageAdapter,
  ExtendedStorageAdapter,
} from '../storage/storageAdapters';
import {debounce, formatErrorMessage, simpleDeepEqual} from '../utils';

const STORAGE_KEY = 'fusion_state_all';

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
export function loadSyncInitialState(
  config: PersistenceConfig | undefined,
  initialState: GlobalState,
  debug = false,
): SyncLoadResult {
  if (!config) return {state: initialState, error: null};
  if (config.loadOnInit === false) return {state: initialState, error: null};
  if (typeof window === 'undefined') return {state: initialState, error: null};

  const adapter = config.adapter as ExtendedStorageAdapter | undefined;
  if (!adapter?.getItemSync) return {state: initialState, error: null};

  try {
    const item = adapter.getItemSync(STORAGE_KEY);
    if (!item) return {state: initialState, error: null};

    const parsed = JSON.parse(item) as GlobalState;
    if (debug) {
      console.log('[FusionState] Loaded state synchronously:', parsed);
    }
    return {state: {...initialState, ...parsed}, error: null};
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    if (debug) {
      console.warn(
        '[FusionState] Synchronous load failed, will try async:',
        error,
      );
    }
    return {state: initialState, error: errorObj};
  }
}

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
export function usePersistence(
  config: PersistenceConfig | undefined,
  setStateRaw: React.Dispatch<React.SetStateAction<GlobalState>>,
  syncLoadError: Error | null,
  debug = false,
): PersistenceAPI {
  const configRef = useRef(config);
  const storageAdapter = useMemo(
    () => configRef.current?.adapter || createNoopStorageAdapter(),
    [],
  );
  const shouldLoadOnInit = configRef.current?.loadOnInit ?? true;
  const shouldSaveOnChange = configRef.current?.saveOnChange ?? true;
  const debounceTime = configRef.current?.debounceTime ?? 0;

  const computeInitialHydrated = (): boolean => {
    if (!configRef.current) return true;
    if (!shouldLoadOnInit || !storageAdapter) return true;
    if (typeof window !== 'undefined') {
      const extended = storageAdapter as ExtendedStorageAdapter;
      if (extended.getItemSync) return true;
    }
    return false;
  };
  const [isHydrated, setIsHydrated] = useState<boolean>(computeInitialHydrated);
  const isHydratedRef = useRef<boolean>(isHydrated);

  const prevPersistedRef = useRef<GlobalState>({});
  const skipPersistOnceRef = useRef<boolean>(false);
  const isInitialLoadDoneRef = useRef<boolean>(false);

  // Report the sync-load failure (if any) to the user-supplied callback
  // after mount — invisible to callbacks if reported inside the lazy
  // initializer.
  const syncErrorRef = useRef<Error | null>(syncLoadError);
  useEffect(() => {
    const err = syncErrorRef.current;
    if (!err) return;
    if (debug) {
      console.error(
        formatErrorMessage(
          FusionStateErrorMessages.PERSISTENCE_READ_ERROR,
          String(err),
        ),
      );
    }
    const cfg = configRef.current as SimplePersistenceConfig | undefined;
    cfg?.onLoadError?.(err, STORAGE_KEY);
    syncErrorRef.current = null;
    // Mount-only — debug captured by closure and stable for the lifetime
    // of the hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Async hydration (AsyncStorage / React Native fallback). No-op on web
  // when sync hydration already succeeded inside the lazy initializer.
  useEffect(() => {
    const markHydrated = () => {
      isInitialLoadDoneRef.current = true;
      if (!isHydratedRef.current) {
        isHydratedRef.current = true;
        setIsHydrated(true);
      }
    };

    if (!shouldLoadOnInit || !storageAdapter || isInitialLoadDoneRef.current) {
      isInitialLoadDoneRef.current = true;
      return;
    }

    // On web, the sync path already handled it — mark hydrated and exit
    // (no async work needed).
    if (typeof window !== 'undefined') {
      const extended = storageAdapter as ExtendedStorageAdapter;
      if (extended.getItemSync) {
        markHydrated();
        return;
      }
    }

    const load = async () => {
      try {
        const raw = await storageAdapter.getItem(STORAGE_KEY);
        if (raw) {
          const stored = JSON.parse(raw) as GlobalState;
          prevPersistedRef.current = {...stored};
          skipPersistOnceRef.current = true;

          setStateRaw(prev => {
            const merged = {...prev, ...stored};
            if (debug) {
              console.log(
                '[FusionState] Loaded state from storage (async):',
                stored,
              );
              console.log('[FusionState] Merged state:', merged);
            }
            return merged;
          });
        } else if (debug) {
          console.log('[FusionState] No stored data found');
        }
        markHydrated();
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        if (debug) {
          console.error(
            formatErrorMessage(
              FusionStateErrorMessages.PERSISTENCE_READ_ERROR,
              String(error),
            ),
          );
        }
        const cfg = configRef.current as SimplePersistenceConfig | undefined;
        cfg?.onLoadError?.(errorObj, STORAGE_KEY);
        markHydrated();
      }
    };

    load();
  }, [storageAdapter, shouldLoadOnInit, debug, setStateRaw]);

  // Filter the state to only the persisted keys (boolean / array / function).
  const filterPersistKeys = useCallback(
    (newState: GlobalState): GlobalState => {
      const persistKeys = configRef.current?.persistKeys;
      if (!persistKeys) return {};
      if (persistKeys === true) return {...newState};

      const filtered: GlobalState = {};
      if (Array.isArray(persistKeys)) {
        persistKeys.forEach(key => {
          if (key in newState) filtered[key] = newState[key];
        });
      } else if (typeof persistKeys === 'function') {
        const filterFn = persistKeys as (k: string, v?: unknown) => boolean;
        Object.keys(newState).forEach(key => {
          if (filterFn(key, newState[key])) filtered[key] = newState[key];
        });
      }
      return filtered;
    },
    [],
  );

  // Stable save callback (optionally debounced). Stable identity so the
  // orchestrator's effect doesn't re-fire on save churn.
  const save = useMemo(() => {
    const rawSave = async (newState: GlobalState) => {
      if (!storageAdapter || !shouldSaveOnChange) return;

      const toSave = filterPersistKeys(newState);
      if (Object.keys(toSave).length === 0) return;

      try {
        const changed = !simpleDeepEqual(toSave, prevPersistedRef.current);
        if (!changed) {
          if (debug) {
            console.log('[FusionState] No changes detected, skipping save');
          }
          return;
        }

        const cfg = configRef.current;
        // Untyped `customSaveCallback` escape hatch — kept for backward
        // compatibility with the original Provider; new code should prefer
        // a custom `StorageAdapter` implementation.
        const customSaveCallback =
          cfg && 'customSaveCallback' in cfg
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (cfg as any).customSaveCallback
            : undefined;

        if (typeof customSaveCallback === 'function') {
          await customSaveCallback(toSave, storageAdapter, 'fusion_state');
        } else {
          await storageAdapter.setItem(STORAGE_KEY, JSON.stringify(toSave));
        }

        prevPersistedRef.current = {...toSave};
        if (debug) {
          console.log('[FusionState] Saved state to storage:', toSave);
        }
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        if (debug) {
          console.error(
            formatErrorMessage(
              FusionStateErrorMessages.PERSISTENCE_WRITE_ERROR,
              String(error),
            ),
          );
        }
        const cfg = configRef.current as SimplePersistenceConfig | undefined;
        cfg?.onSaveError?.(errorObj, toSave);
      }
    };

    return debounceTime > 0 ? debounce(rawSave, debounceTime) : rawSave;
  }, [
    storageAdapter,
    shouldSaveOnChange,
    debounceTime,
    debug,
    filterPersistKeys,
  ]);

  const shouldSkipNextSave = useCallback(() => {
    if (skipPersistOnceRef.current) {
      skipPersistOnceRef.current = false;
      return true;
    }
    return false;
  }, []);

  return {
    isHydrated,
    save: (state: GlobalState) => {
      if (!shouldSaveOnChange) return;
      save(state);
    },
    shouldSkipNextSave,
  };
}
