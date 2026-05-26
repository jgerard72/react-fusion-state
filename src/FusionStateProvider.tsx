import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
  useMemo,
  useEffect,
  useCallback,
  memo,
} from 'react';
import {
  GlobalState,
  GlobalFusionStateContextType,
  FusionStateErrorMessages,
  PersistenceConfig,
  SimplePersistenceConfig,
} from './types';
import {
  createNoopStorageAdapter,
  ExtendedStorageAdapter,
} from './storage/storageAdapters';
import {detectBestStorageAdapter} from './storage/autoDetect';
import {debounce, formatErrorMessage, simpleDeepEqual} from './utils';
import {createDevTools, DevToolsActions, DevToolsConfig} from './devtools';
import {batch} from './utils/batch';

const GlobalStateContext = createContext<
  GlobalFusionStateContextType | undefined
>(undefined);

/**
 * Hook to access the global state context
 * @returns The global state context
 * @throws Error if used outside of a FusionStateProvider
 */
export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);

  if (!context) {
    throw new Error(FusionStateErrorMessages.PROVIDER_MISSING);
  }

  return context;
};

/**
 * Props for the FusionStateProvider component
 */
export interface FusionStateProviderProps {
  /** Child components that will have access to fusion state */
  children: ReactNode;
  /** Initial state values to set when the provider mounts */
  initialState?: GlobalState;
  /** Enable debug logging to console */
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
  /** DevTools configuration for Redux DevTools integration */
  devTools?: boolean | DevToolsConfig;
}

/**
 * Normalizes various persistence configuration formats into a standard PersistenceConfig
 * @param config - The persistence configuration to normalize
 * @param debug - Whether debug mode is enabled
 * @returns Normalized persistence configuration or undefined
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

    const devToolsInstance = useMemo(() => {
      if (!devTools) return null;
      const config =
        typeof devTools === 'boolean'
          ? {name: 'FusionState', devOnly: true}
          : {...devTools, devOnly: devTools.devOnly ?? true};
      return createDevTools(config);
    }, [devTools]);

    // Persistence config is captured at mount and never resynced — this is
    // the documented "frozen at mount" semantics.
    const persistenceRef = useRef(normalizedPersistence);
    const storageAdapter = useMemo(
      () => persistenceRef.current?.adapter || createNoopStorageAdapter(),
      [],
    );

    const keyPrefix = 'fusion_state';
    const shouldLoadOnInit = persistenceRef.current?.loadOnInit ?? true;
    const shouldSaveOnChange = persistenceRef.current?.saveOnChange ?? true;
    const debounceTime = persistenceRef.current?.debounceTime ?? 0;

    const syncLoadErrorRef = useRef<Error | null>(null);
    const [state, setStateRaw] = useState<GlobalState>(() => {
      if (shouldLoadOnInit && storageAdapter && typeof window !== 'undefined') {
        try {
          const extendedAdapter = storageAdapter as ExtendedStorageAdapter;
          if (extendedAdapter.getItemSync) {
            const item = extendedAdapter.getItemSync(`${keyPrefix}_all`);
            if (item) {
              const storedData = JSON.parse(item) as GlobalState;
              if (debug) {
                console.log(
                  '[FusionState] Loaded state synchronously:',
                  storedData,
                );
              }
              return {...initialState, ...storedData};
            }
          }
        } catch (error) {
          const errorObj =
            error instanceof Error ? error : new Error(String(error));
          syncLoadErrorRef.current = errorObj;
          if (debug) {
            console.warn(
              '[FusionState] Synchronous load failed, will try async:',
              error,
            );
          }
        }
      }
      return initialState;
    });

    // Whether the initial hydration step is complete. `true` immediately when
    // there's no async load to wait for; flipped to `true` once the async
    // load resolves (success or failure) for AsyncStorage / RN.
    const computeInitialHydrated = (): boolean => {
      // No persistence configured at all → nothing to hydrate.
      if (!persistenceRef.current) return true;
      if (!shouldLoadOnInit || !storageAdapter) return true;
      // Web sync path resolves inside the useState initializer above —
      // nothing to wait for. RN / async storage needs the async useEffect.
      if (typeof window !== 'undefined') {
        const extendedAdapter = storageAdapter as ExtendedStorageAdapter;
        if (extendedAdapter.getItemSync) return true;
      }
      return false;
    };
    const [isHydrated, setIsHydrated] = useState<boolean>(computeInitialHydrated);
    // Mirror of `isHydrated` for the async load callback to avoid calling
    // `setIsHydrated(true)` when already hydrated (would trigger spurious
    // act() warnings in tests for a no-op state update).
    const isHydratedRef = useRef<boolean>(isHydrated);

    useEffect(() => {
      if (devToolsInstance?.enabled) {
        devToolsInstance.init(state);
        devToolsInstance.send(DevToolsActions.INIT, state, undefined, {
          initialState,
        });
      }
      // We intentionally only initialize devtools once with the initial state.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [devToolsInstance]);

    const initializingKeys = useRef<Set<string>>(new Set());
    const isInitialLoadDone = useRef<boolean>(false);
    const prevPersistedState = useRef<GlobalState>({});
    const prevStateRef = useRef<GlobalState>(state);
    // Set when the async hydration path writes to state, so the side-effects
    // effect can skip persisting freshly-loaded data (avoids re-save loop).
    const skipPersistOnceRef = useRef<boolean>(false);

    useEffect(() => {
      if (syncLoadErrorRef.current) {
        if (debug) {
          console.error(
            formatErrorMessage(
              FusionStateErrorMessages.PERSISTENCE_READ_ERROR,
              String(syncLoadErrorRef.current),
            ),
          );
        }

        const config = persistenceRef.current as SimplePersistenceConfig;
        if (config?.onLoadError) {
          config.onLoadError(syncLoadErrorRef.current, `${keyPrefix}_all`);
        }

        syncLoadErrorRef.current = null;
      }
      // Run only once on mount — debug/keyPrefix are stable for the lifetime
      // of the provider (debug is captured into the persistence config; the
      // prefix is hardcoded).
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load state from storage on initialization (async fallback for RN / AsyncStorage).
    useEffect(() => {
      // Synchronous web hydration already ran inside `useState`'s lazy
      // initializer, and `isHydrated` started at `true` in that case — so
      // the only path that needs to flip `isHydrated` is the async one.
      const markHydrated = () => {
        isInitialLoadDone.current = true;
        if (!isHydratedRef.current) {
          isHydratedRef.current = true;
          setIsHydrated(true);
        }
      };

      if (shouldLoadOnInit && !isInitialLoadDone.current && storageAdapter) {
        const loadStateFromStorage = async () => {
          try {
            const storedDataRaw = await storageAdapter.getItem(
              `${keyPrefix}_all`,
            );

            if (storedDataRaw) {
              const storedData = JSON.parse(storedDataRaw) as GlobalState;

              // Capture the loaded state as the "last persisted" snapshot
              // BEFORE applying it, so the side-effects effect's deep-equal
              // check skips re-saving freshly-loaded data.
              prevPersistedState.current = {...storedData};
              skipPersistOnceRef.current = true;

              setStateRaw(prevState => {
                const mergedState = {...prevState, ...storedData};
                if (debug) {
                  console.log(
                    '[FusionState] Loaded state from storage (async):',
                    storedData,
                  );
                  console.log('[FusionState] Merged state:', mergedState);
                }
                return mergedState;
              });
            }

            markHydrated();

            if (debug && !storedDataRaw) {
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

            const config = persistenceRef.current as SimplePersistenceConfig;
            if (config?.onLoadError) {
              config.onLoadError(errorObj, `${keyPrefix}_all`);
            }

            markHydrated();
          }
        };

        loadStateFromStorage();
      } else {
        // No async hydration path — `isHydrated` was already initialized to
        // `true` by useState. Just record that we're done.
        isInitialLoadDone.current = true;
      }
    }, [storageAdapter, keyPrefix, shouldLoadOnInit, debug]);

    // Filter helper for persistence keys
    const filterPersistKeys = useMemo(() => {
      return (newState: GlobalState): GlobalState => {
        const persistKeys = persistenceRef.current?.persistKeys;

        if (!persistKeys) return {};

        if (persistKeys === true) return {...newState};

        const filteredState: GlobalState = {};

        if (Array.isArray(persistKeys)) {
          persistKeys.forEach(key => {
            if (key in newState) {
              filteredState[key] = newState[key];
            }
          });
        } else if (typeof persistKeys === 'function') {
          Object.keys(newState).forEach(key => {
            const filterFn = persistKeys as (
              key: string,
              value?: unknown,
            ) => boolean;
            if (filterFn(key, newState[key])) {
              filteredState[key] = newState[key];
            }
          });
        }

        return filteredState;
      };
    }, []);

    // Save helper. Stable identity so the side-effects effect doesn't re-fire
    // unnecessarily; reads "live" config off refs.
    const saveStateToStorage = useMemo(() => {
      const save = async (newState: GlobalState) => {
        if (!storageAdapter || !shouldSaveOnChange) return;

        const stateToSave = filterPersistKeys(newState);
        if (Object.keys(stateToSave).length === 0) return;

        try {
          const hasChanged = !simpleDeepEqual(
            stateToSave,
            prevPersistedState.current,
          );

          if (!hasChanged) {
            if (debug) {
              console.log('[FusionState] No changes detected, skipping save');
            }
            return;
          }

          const persistenceConfig = persistenceRef.current;

          if (persistenceConfig) {
            const customSaveCallback =
              'customSaveCallback' in persistenceConfig
                ? (persistenceConfig as any).customSaveCallback
                : undefined;

            if (
              customSaveCallback &&
              typeof customSaveCallback === 'function'
            ) {
              await customSaveCallback(stateToSave, storageAdapter, keyPrefix);
            } else {
              await storageAdapter.setItem(
                `${keyPrefix}_all`,
                JSON.stringify(stateToSave),
              );
            }
          } else {
            await storageAdapter.setItem(
              `${keyPrefix}_all`,
              JSON.stringify(stateToSave),
            );
          }

          prevPersistedState.current = {...stateToSave};

          if (debug) {
            console.log('[FusionState] Saved state to storage:', stateToSave);
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

          const config = persistenceRef.current as SimplePersistenceConfig;
          if (config?.onSaveError) {
            config.onSaveError(errorObj, stateToSave);
          }
        }
      };

      return debounceTime > 0 ? debounce(save, debounceTime) : save;
    }, [
      storageAdapter,
      keyPrefix,
      shouldSaveOnChange,
      debug,
      debounceTime,
      filterPersistKeys,
    ]);

    // Per-key subscription registry
    const keyListenersRef = useRef<Map<string, Set<() => void>>>(new Map());

    const subscribeKey = useCallback((key: string, listener: () => void) => {
      let set = keyListenersRef.current.get(key);
      if (!set) {
        set = new Set();
        keyListenersRef.current.set(key, set);
      }
      set.add(listener);
      return () => {
        set!.delete(listener);
        if (set!.size === 0) {
          keyListenersRef.current.delete(key);
        }
      };
    }, []);

    const notifyKey = useCallback((key: string) => {
      const listeners = keyListenersRef.current.get(key);
      if (listeners) {
        batch(() => {
          listeners.forEach(l => l());
        });
      }
    }, []);

    const getKeySnapshot = useCallback(
      (key: string) => {
        return key in state ? state[key] : undefined;
      },
      [state],
    );

    const getServerSnapshot = useCallback(
      (key: string) => {
        return key in initialState ? initialState[key] : undefined;
      },
      [initialState],
    );

    // Pure setState — no side effects in the updater. Listener notification,
    // persistence, debug logging and DevTools dispatch all happen in the
    // post-commit effect below.
    const setState = useCallback(
      (updater: React.SetStateAction<GlobalState>) => {
        setStateRaw(updater);
      },
      [],
    );

    // Post-commit side effects: runs once per state change (after batched
    // updates have settled). Compares the latest state against the previous
    // committed state to compute changed keys.
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

      // 1. Notify per-key subscribers (always — including hydration so
      //    useSyncExternalStore consumers see the loaded value).
      changedKeys.forEach(notifyKey);

      // 2. Debug logging
      if (debug) {
        console.log('[FusionState] State updated:', {
          previous: prev,
          next: state,
          diff: Object.fromEntries(changedKeys.map(k => [k, state[k]])),
        });
      }

      // 3. DevTools dispatch
      if (devToolsInstance?.enabled) {
        devToolsInstance.send(
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
      if (skipPersistOnceRef.current) {
        skipPersistOnceRef.current = false;
        return;
      }
      if (shouldSaveOnChange) {
        saveStateToStorage(state);
      }
    }, [
      state,
      notifyKey,
      debug,
      devToolsInstance,
      shouldSaveOnChange,
      saveStateToStorage,
    ]);

    const value = useMemo(
      () => ({
        state,
        setState,
        initializingKeys: initializingKeys.current,
        subscribeKey,
        getKeySnapshot,
        getServerSnapshot,
        isHydrated,
      }),
      [
        state,
        setState,
        subscribeKey,
        getKeySnapshot,
        getServerSnapshot,
        isHydrated,
      ],
    );

    return (
      <GlobalStateContext.Provider value={value}>
        {children}
      </GlobalStateContext.Provider>
    );
  },
);
