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

interface FusionStateProviderProps {
  /** Child components that will have access to fusion state */
  children: ReactNode;
  /** Optional initial state values */
  initialState?: GlobalState;
  /** Enable debug mode which logs state changes to console */
  debug?: boolean;
  /**
   * Persistence configuration - can be:
   * - true: enable persistence for all keys with default values
   * - string array: enable persistence only for specified keys
   * - object: detailed configuration with keys, prefix, etc.
   * - complete PersistenceConfig object: advanced configuration (backward compatibility)
   */
  persistence?:
    | boolean
    | string[]
    | SimplePersistenceConfig
    | PersistenceConfig;
  /** DevTools configuration (v0.4.0+) */
  devTools?: boolean | DevToolsConfig;
}

/**
 * Normalize persistence configuration - simplified version
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

  // Boolean: default persistence
  if (typeof config === 'boolean') {
    return {
      adapter: defaultAdapter,
      persistKeys: (key: string) => key.startsWith('persist.'),
      loadOnInit: true,
      saveOnChange: true,
    };
  }

  // Array: specific keys
  if (Array.isArray(config)) {
    return {
      adapter: defaultAdapter,
      persistKeys: config,
      loadOnInit: true,
      saveOnChange: true,
    };
  }

  // Complete PersistenceConfig
  if ('adapter' in config && !('keyPrefix' in config)) {
    return config as PersistenceConfig;
  }

  // SimplePersistenceConfig
  const simple = config as SimplePersistenceConfig;
  return {
    adapter: simple.adapter || defaultAdapter,
    persistKeys:
      simple.persistKeys || ((key: string) => key.startsWith('persist.')),
    keyPrefix: simple.keyPrefix,
    debounceTime: simple.debounce,
    loadOnInit: true,
    saveOnChange: true,
    onLoadError: simple.onLoadError,
    onSaveError: simple.onSaveError,
  } as PersistenceConfig;
}

/**
 * Provider component for React Fusion State
 * Manages the global state and provides access to all child components
 */
export const FusionStateProvider: React.FC<FusionStateProviderProps> = memo(
  ({
    children,
    initialState = {},
    debug = false,
    persistence,
    devTools = false,
  }) => {
    // Normalize persistence configuration
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

    // Initialize storage - use NoopStorage if not configured
    const persistenceRef = useRef(normalizedPersistence);
    const storageAdapter = useMemo(
      () => persistenceRef.current?.adapter || createNoopStorageAdapter(),
      [],
    );

    const keyPrefix = persistenceRef.current?.keyPrefix || 'fusion_state';
    const shouldLoadOnInit = persistenceRef.current?.loadOnInit ?? true; // Default: load
    const shouldSaveOnChange = persistenceRef.current?.saveOnChange ?? true; // Default: save
    const debounceTime = persistenceRef.current?.debounceTime ?? 0;

    // State management with synchronous loading
    const syncLoadErrorRef = useRef<Error | null>(null);
    const [state, setStateRaw] = useState<GlobalState>(() => {
      // Try to load synchronously if possible (for localStorage)
      if (shouldLoadOnInit && storageAdapter && typeof window !== 'undefined') {
        try {
          // Check if this is an extended storage adapter with sync support
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

    useEffect(() => {
      if (devToolsInstance?.enabled) {
        devToolsInstance.init(state);
        devToolsInstance.send(DevToolsActions.INIT, state, undefined, {
          initialState,
        });
      }
    }, [devToolsInstance]);

    const initializingKeys = useRef<Set<string>>(new Set());
    const isInitialLoadDone = useRef<boolean>(false);
    const prevPersistedState = useRef<GlobalState>({});

    // Handle synchronous load errors
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

        // Call error callback if provided
        const config = persistenceRef.current as SimplePersistenceConfig;
        if (config?.onLoadError) {
          config.onLoadError(syncLoadErrorRef.current, `${keyPrefix}_all`);
        }

        syncLoadErrorRef.current = null; // Clear the error after handling
      }
    }, []); // Run only once

    // Load state from storage on initialization (async fallback)
    useEffect(() => {
      if (shouldLoadOnInit && !isInitialLoadDone.current && storageAdapter) {
        const loadStateFromStorage = async () => {
          try {
            const storedDataRaw = await storageAdapter.getItem(
              `${keyPrefix}_all`,
            );

            if (storedDataRaw) {
              const storedData = JSON.parse(storedDataRaw) as GlobalState;

              // Merge with current state - stored data takes precedence
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

              // Store for comparison
              prevPersistedState.current = {...storedData};
            }

            isInitialLoadDone.current = true;

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

            // Appeler le callback d'erreur si fourni
            const config = persistenceRef.current as SimplePersistenceConfig;
            if (config?.onLoadError) {
              config.onLoadError(errorObj, `${keyPrefix}_all`);
            }

            isInitialLoadDone.current = true;
          }
        };

        loadStateFromStorage();
      } else {
        isInitialLoadDone.current = true;
      }
    }, [storageAdapter, keyPrefix, shouldLoadOnInit, debug]);

    // Function to filter state based on persistKeys
    const filterPersistKeys = useMemo(() => {
      return (newState: GlobalState): GlobalState => {
        const persistKeys = persistenceRef.current?.persistKeys;

        if (!persistKeys) return {...newState};

        const filteredState: GlobalState = {};

        if (Array.isArray(persistKeys)) {
          // If persistKeys is an array, only save those keys
          persistKeys.forEach(key => {
            if (key in newState) {
              filteredState[key] = newState[key];
            }
          });
        } else if (typeof persistKeys === 'function') {
          // If persistKeys is a function, use it to filter keys
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

    // Function to save state to storage
    const saveStateToStorage = useMemo(() => {
      const save = async (newState: GlobalState) => {
        if (!storageAdapter || !shouldSaveOnChange) return;

        // Filter keys if persistence.persistKeys is defined
        const stateToSave = filterPersistKeys(newState);

        try {
          // ✅ Optimization: check if data has actually changed
          const hasChanged = !simpleDeepEqual(
            stateToSave,
            prevPersistedState.current,
          );

          // Only save if there are changes
          if (!hasChanged) {
            if (debug) {
              console.log('[FusionState] No changes detected, skipping save');
            }
            return;
          }

          // Check if customSaveCallback is provided in the persistence config
          // SimplePersistenceConfig peut avoir customSaveCallback, mais pas PersistenceConfig
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
              // Use the custom save callback if provided
              await customSaveCallback(stateToSave, storageAdapter, keyPrefix);
            } else {
              // Save all state in one key for simplicity (default behavior)
              await storageAdapter.setItem(
                `${keyPrefix}_all`,
                JSON.stringify(stateToSave),
              );
            }
          } else {
            // If no persistence config, use default behavior
            await storageAdapter.setItem(
              `${keyPrefix}_all`,
              JSON.stringify(stateToSave),
            );
          }

          // Update reference for future comparisons
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

          // Appeler le callback d'erreur si fourni
          const config = persistenceRef.current as SimplePersistenceConfig;
          if (config?.onSaveError) {
            config.onSaveError(errorObj, stateToSave);
          }
        }
      };

      // Return debounced version if needed
      return debounceTime > 0 ? debounce(save, debounceTime) : save;
    }, [
      storageAdapter,
      keyPrefix,
      shouldSaveOnChange,
      debug,
      debounceTime,
      filterPersistKeys,
    ]);

    // ✅ SIMPLE: stable setState with useCallback
    const setState = useCallback(
      (updater: React.SetStateAction<GlobalState>) => {
        setStateRaw(prevState => {
          const nextState =
            typeof updater === 'function' ? updater(prevState) : updater;

          // Trigger persistence if needed
          if (shouldSaveOnChange) {
            saveStateToStorage(nextState);
          }

          // Debug logging
          if (debug) {
            console.log('[FusionState] State updated:', {
              previous: prevState,
              next: nextState,
              diff: Object.fromEntries(
                Object.entries(nextState).filter(
                  ([key, value]) => prevState[key] !== value,
                ),
              ),
            });
          }

          if (devToolsInstance?.enabled) {
            const changedKeys = Object.keys(nextState).filter(
              key => prevState[key] !== nextState[key],
            );
            if (changedKeys.length > 0) {
              devToolsInstance.send(
                DevToolsActions.SET_STATE,
                nextState,
                changedKeys.join(', '),
                {
                  changed: changedKeys,
                  diff: Object.fromEntries(
                    changedKeys.map(key => [
                      key,
                      {from: prevState[key], to: nextState[key]},
                    ]),
                  ),
                },
              );
            }
          }

          return nextState;
        });
      },
      [debug, shouldSaveOnChange, saveStateToStorage, devToolsInstance],
    );

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
        listeners.forEach(l => l());
      }
    }, []);

    const getKeySnapshot = useCallback(
      (key: string) => {
        return key in state ? state[key] : undefined;
      },
      [state],
    );

    // Wrap setState to notify only affected keys
    const setStateAndNotify = useCallback(
      (updater: React.SetStateAction<GlobalState>) => {
        setState(prev => {
          const next =
            typeof updater === 'function' ? (updater as any)(prev) : updater;
          // Determine changed keys and notify
          Object.keys(next).forEach(k => {
            if (prev[k] !== next[k]) notifyKey(k);
          });
          return next;
        });
      },
      [setState, notifyKey],
    );

    const value = useMemo(
      () => ({
        state,
        setState: setStateAndNotify,
        initializingKeys: initializingKeys.current,
        subscribeKey,
        getKeySnapshot,
        getServerSnapshot: undefined,
      }),
      [state, setStateAndNotify, subscribeKey, getKeySnapshot],
    );

    return (
      <GlobalStateContext.Provider value={value}>
        {children}
      </GlobalStateContext.Provider>
    );
  },
);
