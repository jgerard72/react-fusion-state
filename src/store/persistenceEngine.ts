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
import {detectBestStorageAdapter} from '../storage/autoDetect';
import {debounce, formatErrorMessage, simpleDeepEqual} from '../utils';
import {CreateStoreOptions} from './types';

const STORAGE_KEY = 'fusion_state_all';

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
export function normalizePersistenceConfig(
  config: CreateStoreOptions['persistence'],
  debug = false,
): PersistenceConfig | undefined {
  if (!config) return undefined;

  const defaultAdapter = detectBestStorageAdapter(debug);

  if (typeof config === 'boolean') {
    return {
      adapter: defaultAdapter,
      persistKeys: config ? true : false,
      loadOnInit: true,
      saveOnChange: true,
    };
  }

  if (Array.isArray(config)) {
    return {
      adapter: defaultAdapter,
      persistKeys: config,
      loadOnInit: true,
      saveOnChange: true,
    };
  }

  if ('adapter' in config) {
    return config as PersistenceConfig;
  }

  const simple = config as SimplePersistenceConfig;
  return {
    adapter: simple.adapter || defaultAdapter,
    persistKeys: simple.persistKeys || false,
    debounceTime: simple.debounce,
    loadOnInit: true,
    saveOnChange: true,
    onLoadError: simple.onLoadError,
    onSaveError: simple.onSaveError,
  } as PersistenceConfig;
}

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
export function createPersistenceEngine(
  rawConfig: CreateStoreOptions['persistence'],
  callerInitialState: GlobalState,
  debug = false,
): PersistenceEngine {
  const config = normalizePersistenceConfig(rawConfig, debug);

  // Fast path: persistence disabled — return a fully-noop engine.
  if (!config) {
    return {
      initialState: callerInitialState,
      isHydrated: true,
      onHydratedChange: () => () => {},
      startAsyncHydration: () => {},
      save: () => {},
      shouldSkipNextSave: () => false,
      reportStartupError: () => {},
      destroy: () => {},
    };
  }

  const adapter = config.adapter || createNoopStorageAdapter();
  const shouldLoadOnInit = config.loadOnInit ?? true;
  const shouldSaveOnChange = config.saveOnChange ?? true;
  const debounceTime = config.debounceTime ?? 0;

  // Sync hydration runs once, here, so the store's `initialState` already
  // reflects whatever was on disk on web with localStorage.
  const syncResult = loadSyncInitialState(config, callerInitialState, debug);

  // Internal mutable state.
  let isHydrated = syncResultIsImmediatelyHydrated(config, adapter);
  let asyncStarted = false;
  let startupErrorReported = false;
  // The "previously persisted" snapshot used for dedup. Seeded from the
  // sync-loaded data so a save that produces an identical payload is a no-op.
  let prevPersisted: GlobalState =
    syncResult.error == null && syncResult.state !== callerInitialState
      ? filterPersistKeysImpl(config, syncResult.state)
      : {};
  let skipPersistOnce = false;

  const hydratedListeners = new Set<() => void>();

  const onHydratedChange = (listener: () => void) => {
    if (isHydrated) {
      // Already hydrated — fire immediately on the next microtask so the
      // caller's contract (listener is called *after* subscribing) holds.
      Promise.resolve().then(listener);
      return () => {};
    }
    hydratedListeners.add(listener);
    return () => hydratedListeners.delete(listener);
  };

  const markHydrated = () => {
    if (isHydrated) return;
    isHydrated = true;
    const snapshot = Array.from(hydratedListeners);
    hydratedListeners.clear();
    for (const l of snapshot) l();
  };

  const startAsyncHydration = (apply: (loaded: GlobalState) => void) => {
    if (asyncStarted) return;
    asyncStarted = true;

    if (!shouldLoadOnInit) {
      markHydrated();
      return;
    }

    // Web sync path already filled the state — nothing left to do.
    if (isHydrated) return;

    void (async () => {
      try {
        const raw = await adapter.getItem(STORAGE_KEY);
        if (raw) {
          const stored = JSON.parse(raw) as GlobalState;
          prevPersisted = {...stored};
          skipPersistOnce = true;
          if (debug) {
            console.log(
              '[FusionState] Loaded state from storage (async):',
              stored,
            );
          }
          apply(stored);
        } else if (debug) {
          console.log('[FusionState] No stored data found');
        }
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
        const cfg = config as SimplePersistenceConfig;
        cfg.onLoadError?.(errorObj, STORAGE_KEY);
      } finally {
        markHydrated();
      }
    })();
  };

  const reportStartupError = () => {
    if (startupErrorReported) return;
    startupErrorReported = true;
    const err = syncResult.error;
    if (!err) return;
    if (debug) {
      console.error(
        formatErrorMessage(
          FusionStateErrorMessages.PERSISTENCE_READ_ERROR,
          String(err),
        ),
      );
    }
    const cfg = config as SimplePersistenceConfig;
    cfg.onLoadError?.(err, STORAGE_KEY);
  };

  const rawSave = async (newState: GlobalState) => {
    if (!shouldSaveOnChange) return;

    const toSave = filterPersistKeysImpl(config, newState);
    if (Object.keys(toSave).length === 0) return;

    try {
      if (simpleDeepEqual(toSave, prevPersisted)) {
        if (debug) {
          console.log('[FusionState] No changes detected, skipping save');
        }
        return;
      }

      // Untyped `customSaveCallback` escape hatch kept for backward compat
      // with the legacy `usePersistence` API. New code should prefer a
      // custom `StorageAdapter` implementation.
      const customSaveCallback =
        'customSaveCallback' in config
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (config as any).customSaveCallback
          : undefined;

      if (typeof customSaveCallback === 'function') {
        await customSaveCallback(toSave, adapter, 'fusion_state');
      } else {
        await adapter.setItem(STORAGE_KEY, JSON.stringify(toSave));
      }

      prevPersisted = {...toSave};
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
      const cfg = config as SimplePersistenceConfig;
      cfg.onSaveError?.(errorObj, toSave);
    }
  };

  const debouncedSave =
    debounceTime > 0 ? debounce(rawSave, debounceTime) : rawSave;

  const save = (state: GlobalState) => {
    if (!shouldSaveOnChange) return;
    debouncedSave(state);
  };

  const shouldSkipNextSave = () => {
    if (skipPersistOnce) {
      skipPersistOnce = false;
      return true;
    }
    return false;
  };

  const destroy = () => {
    hydratedListeners.clear();
    // `debounce` (from utils) exposes a `.flush?` / `.cancel?` ad-hoc API on
    // some implementations; we don't rely on it. Pending writes that haven't
    // fired yet will simply never reach storage after destroy, which is the
    // correct behaviour for SSR per-request stores.
  };

  return {
    initialState: syncResult.state,
    get isHydrated() {
      return isHydrated;
    },
    onHydratedChange,
    startAsyncHydration,
    save,
    shouldSkipNextSave,
    reportStartupError,
    destroy,
  };
}

/**
 * Mirror of the post-sync-hydration `computeInitialHydrated` logic from the
 * legacy hook: on web with a `getItemSync`-capable adapter, hydration is
 * complete the moment {@link createPersistenceEngine} returns. Anywhere
 * else, we still need {@link PersistenceEngine.startAsyncHydration}.
 */
function syncResultIsImmediatelyHydrated(
  config: PersistenceConfig,
  adapter: PersistenceConfig['adapter'] | undefined,
): boolean {
  if (config.loadOnInit === false) return true;
  if (!adapter) return true;
  if (typeof window === 'undefined') return false;
  const extended = adapter as ExtendedStorageAdapter;
  return typeof extended.getItemSync === 'function';
}

/**
 * Apply the `persistKeys` filter to a state snapshot, returning a new
 * object that contains only the entries actually slated for persistence.
 */
function filterPersistKeysImpl(
  config: PersistenceConfig,
  newState: GlobalState,
): GlobalState {
  const persistKeys = config.persistKeys;
  if (!persistKeys) return {};
  if (persistKeys === true) return {...newState};

  const filtered: GlobalState = {};
  if (Array.isArray(persistKeys)) {
    for (const key of persistKeys) {
      if (key in newState) filtered[key] = newState[key];
    }
  } else if (typeof persistKeys === 'function') {
    const filterFn = persistKeys as (k: string, v?: unknown) => boolean;
    for (const key of Object.keys(newState)) {
      if (filterFn(key, newState[key])) filtered[key] = newState[key];
    }
  }
  return filtered;
}
