import React, {
  createContext,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FusionStateErrorMessages,
  GlobalFusionStateContextType,
  GlobalState,
  PersistenceConfig,
  SimplePersistenceConfig,
} from './types';
import {detectBestStorageAdapter} from './storage/autoDetect';
import {DevToolsActions, DevToolsConfig} from './devtools';
import {
  loadSyncInitialState,
  usePersistence,
} from './hooks/usePersistence';
import {useKeySubscriptions} from './hooks/useKeySubscriptions';
import {useDevToolsBridge} from './hooks/useDevToolsBridge';

const GlobalStateContext = createContext<
  GlobalFusionStateContextType | undefined
>(undefined);

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

const FusionStaticContext = createContext<FusionStaticContextType | undefined>(
  undefined,
);

/**
 * Hook to access the global state context.
 *
 * @returns The global state context
 * @throws Error if used outside of a `FusionStateProvider`
 */
export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error(FusionStateErrorMessages.PROVIDER_MISSING);
  }
  return context;
};

/**
 * Internal hook that returns the static (stable) provider API for selector
 * subscriptions. Consumers of this hook do NOT re-render on state changes.
 *
 * @internal — used by `useFusionStore`; not part of the public API.
 * @throws Error if used outside of a `FusionStateProvider`
 */
export const useFusionStaticAPI = (): FusionStaticContextType => {
  const ctx = useContext(FusionStaticContext);
  if (!ctx) {
    throw new Error(FusionStateErrorMessages.PROVIDER_MISSING);
  }
  return ctx;
};

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
  persistence?:
    | boolean
    | string[]
    | SimplePersistenceConfig
    | PersistenceConfig;
  /** DevTools configuration for Redux DevTools integration. */
  devTools?: boolean | DevToolsConfig;
}

/**
 * Normalizes various persistence configuration formats into a standard
 * {@link PersistenceConfig}.
 */
function normalizePersistenceConfig(
  config:
    | boolean
    | string[]
    | SimplePersistenceConfig
    | PersistenceConfig
    | undefined,
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
export const FusionStateProvider: React.FC<FusionStateProviderProps> = memo(
  ({
    children,
    initialState = {},
    debug = false,
    persistence,
    devTools = false,
  }) => {
    const normalizedPersistence = useMemo(
      () => normalizePersistenceConfig(persistence, debug),
      [persistence, debug],
    );

    // Sync hydration on web runs INSIDE the lazy initializer of the next
    // `useState` call so the persisted value is available on the very first
    // render. The error (if any) is captured here and reported post-mount
    // by `usePersistence`.
    const syncLoadResultRef = useRef<{
      state: GlobalState;
      error: Error | null;
    } | null>(null);
    const [state, setStateRaw] = useState<GlobalState>(() => {
      const result = loadSyncInitialState(
        normalizedPersistence,
        initialState,
        debug,
      );
      syncLoadResultRef.current = result;
      return result.state;
    });

    const persistenceAPI = usePersistence(
      normalizedPersistence,
      setStateRaw,
      syncLoadResultRef.current?.error ?? null,
      debug,
    );

    const subscriptions = useKeySubscriptions(state, initialState);
    const devToolsAPI = useDevToolsBridge(devTools, initialState);

    // Pure setState — no side effects in the updater. Listener notification,
    // persistence, debug logging and DevTools dispatch all run in the
    // post-commit effect below (StrictMode-safe).
    const setState = useCallback(
      (updater: React.SetStateAction<GlobalState>) => {
        setStateRaw(updater);
      },
      [],
    );

    // `initializingKeys` is mutated by `useFusionState` during its init
    // effect to detect duplicate registrations of the same key.
    const initializingKeysRef = useRef<Set<string>>(new Set());

    // Post-commit orchestration: runs once per committed state change.
    // Diffs the previous state against the new one and dispatches the four
    // possible side effects (notify / log / devtools / persist).
    const prevStateRef = useRef<GlobalState>(state);
    useEffect(() => {
      const prev = prevStateRef.current;
      if (prev === state) return;
      prevStateRef.current = state;

      const seen = new Set<string>();
      const changedKeys: string[] = [];
      for (const k of Object.keys(prev)) {
        seen.add(k);
        if (prev[k] !== state[k]) changedKeys.push(k);
      }
      for (const k of Object.keys(state)) {
        if (seen.has(k)) continue;
        if (prev[k] !== state[k]) changedKeys.push(k);
      }

      if (changedKeys.length === 0) return;

      // 1. Notify per-key subscribers, then all global selector subscribers.
      changedKeys.forEach(subscriptions.notifyKey);
      subscriptions.notifyAll();

      // 2. Debug logging.
      if (debug) {
        console.log('[FusionState] State updated:', {
          previous: prev,
          next: state,
          diff: Object.fromEntries(changedKeys.map(k => [k, state[k]])),
        });
      }

      // 3. DevTools dispatch.
      if (devToolsAPI.enabled) {
        devToolsAPI.send(
          DevToolsActions.SET_STATE,
          state,
          changedKeys.join(', '),
          {
            changed: changedKeys,
            diff: Object.fromEntries(
              changedKeys.map(k => [k, {from: prev[k], to: state[k]}]),
            ),
          },
        );
      }

      // 4. Persistence — skipped on the hydration tick because the freshly
      //    loaded snapshot is already what's in storage.
      if (persistenceAPI.shouldSkipNextSave()) return;
      persistenceAPI.save(state);
    }, [state, subscriptions, debug, devToolsAPI, persistenceAPI]);

    const value = useMemo(
      () => ({
        state,
        setState,
        initializingKeys: initializingKeysRef.current,
        subscribeKey: subscriptions.subscribeKey,
        getKeySnapshot: subscriptions.getKeySnapshot,
        getServerSnapshot: subscriptions.getServerSnapshot,
        subscribeAll: subscriptions.subscribeAll,
        getStateSnapshot: subscriptions.getStateSnapshot,
        isHydrated: persistenceAPI.isHydrated,
      }),
      [
        state,
        setState,
        subscriptions.subscribeKey,
        subscriptions.getKeySnapshot,
        subscriptions.getServerSnapshot,
        subscriptions.subscribeAll,
        subscriptions.getStateSnapshot,
        persistenceAPI.isHydrated,
      ],
    );

    // Static value: only references that never change. Consumers of this
    // context never re-render on state changes — they only see the stable
    // subscribe/snapshot fns and drive their own re-renders via
    // `useSyncExternalStore`. Crucial for `useFusionStore` performance.
    const staticValue = useMemo<FusionStaticContextType>(
      () => ({
        subscribeAll: subscriptions.subscribeAll,
        getStateSnapshot: subscriptions.getStateSnapshot,
      }),
      [subscriptions.subscribeAll, subscriptions.getStateSnapshot],
    );

    return (
      <FusionStaticContext.Provider value={staticValue}>
        <GlobalStateContext.Provider value={value}>
          {children}
        </GlobalStateContext.Provider>
      </FusionStaticContext.Provider>
    );
  },
);
