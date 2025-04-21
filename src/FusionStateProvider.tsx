import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
  useMemo,
  useEffect,
  memo,
} from 'react';
import {
  GlobalState,
  GlobalFusionStateContextType,
  FusionStateErrorMessages,
  PersistenceConfig,
  SimplePersistenceConfig,
} from '@core/types';
import {createNoopStorageAdapter} from '@storage/storageAdapters';
import {detectBestStorageAdapter} from '@storage/autoDetect';
import {debounce, formatErrorMessage, simpleDeepEqual} from '@core/utils';

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
   * Configuration pour la persistance - peuvent être:
   * - true: active la persistance pour toutes les clés avec les valeurs par défaut
   * - tableau de chaînes: active la persistance uniquement pour les clés spécifiées
   * - objet: configuration détaillée avec clés, préfixe, etc.
   * - objet complet PersistenceConfig: configuration avancée (rétrocompatibilité)
   */
  persistence?:
    | boolean
    | string[]
    | SimplePersistenceConfig
    | PersistenceConfig;
}

/**
 * Convertit la configuration de persistance simplifiée en configuration complète
 */
function normalizePersistenceConfig(
  config:
    | boolean
    | string[]
    | SimplePersistenceConfig
    | PersistenceConfig
    | undefined,
): PersistenceConfig | undefined {
  if (!config) return undefined;

  // Créer un adaptateur de stockage par défaut
  const defaultAdapter = detectBestStorageAdapter();

  // Si c'est un boolean (true), configurer la persistance avec des valeurs par défaut
  // Par défaut, nous ne voulons persister que les clés explicitement marquées
  if (typeof config === 'boolean') {
    return {
      adapter: defaultAdapter,
      // L'interface PersistenceConfig accepte soit un tableau de clés, soit une fonction de filtre
      persistKeys: (key: string) => key.startsWith('persist.'),
      loadOnInit: true,
      saveOnChange: true,
    };
  }

  // Si c'est un tableau de chaînes, ce sont les clés à persister
  if (Array.isArray(config)) {
    return {
      adapter: defaultAdapter,
      persistKeys: config,
      loadOnInit: true,
      saveOnChange: true,
    };
  }

  // Si l'objet contient adapter mais pas de keyPrefix, c'est probablement un PersistenceConfig complet
  if ('adapter' in config && !('keyPrefix' in config)) {
    return config as PersistenceConfig;
  }

  // Sinon, c'est un SimplePersistenceConfig
  const simpleConfig = config as SimplePersistenceConfig;

  // Définir la fonction de filtre de clés - préfixe persist. par défaut si aucune clé spécifiée
  let keyFilter;
  if (simpleConfig.persistKeys) {
    if (Array.isArray(simpleConfig.persistKeys)) {
      keyFilter = simpleConfig.persistKeys;
    } else if (typeof simpleConfig.persistKeys === 'function') {
      // Utiliser la fonction de filtrage personnalisée
      keyFilter = (key: string) => {
        const filterFn = simpleConfig.persistKeys as (
          key: string,
          value: unknown,
        ) => boolean;
        // On passe null comme valeur car à ce stade on ne connaît pas encore la valeur
        // La valeur réelle sera passée plus tard lors du filtrage
        return filterFn(key, null);
      };
    }
  } else {
    keyFilter = (key: string) => key.startsWith('persist.');
  }

  return {
    adapter: simpleConfig.adapter || defaultAdapter,
    persistKeys: keyFilter,
    keyPrefix: simpleConfig.keyPrefix,
    debounceTime: simpleConfig.debounce,
    loadOnInit: true,
    saveOnChange: true,
  };
}

/**
 * Provider component for React Fusion State
 * Manages the global state and provides access to all child components
 */
export const FusionStateProvider: React.FC<FusionStateProviderProps> = memo(
  ({children, initialState = {}, debug = false, persistence}) => {
    // Normaliser la configuration de persistance
    const normalizedPersistence = useMemo(
      () => normalizePersistenceConfig(persistence),
      [persistence],
    );

    // Initialize storage - use NoopStorage if not configured
    const persistenceRef = useRef(normalizedPersistence);
    const storageAdapter = useMemo(
      () => persistenceRef.current?.adapter || createNoopStorageAdapter(),
      [],
    );

    const keyPrefix = persistenceRef.current?.keyPrefix || 'fusion_state';
    const shouldLoadOnInit = persistenceRef.current?.loadOnInit ?? true; // Défaut: charger
    const shouldSaveOnChange = persistenceRef.current?.saveOnChange ?? true; // Défaut: sauvegarder
    const debounceTime = persistenceRef.current?.debounceTime ?? 0;

    // State management
    const [state, setStateRaw] = useState<GlobalState>(initialState);
    const initializingKeys = useRef<Set<string>>(new Set());
    const isInitialLoadDone = useRef<boolean>(false);
    const prevPersistedState = useRef<GlobalState>({});

    // Load state from storage on initialization
    useEffect(() => {
      if (shouldLoadOnInit && !isInitialLoadDone.current && storageAdapter) {
        const loadStateFromStorage = async () => {
          try {
            const storedDataRaw = await storageAdapter.getItem(
              `${keyPrefix}_all`,
            );

            if (storedDataRaw) {
              const storedData = JSON.parse(storedDataRaw) as GlobalState;

              // Merge with initial state - stored data takes precedence
              setStateRaw(prevState => ({
                ...prevState,
                ...storedData,
              }));

              // Store for comparison
              prevPersistedState.current = {...storedData};
            }

            isInitialLoadDone.current = true;

            if (debug) {
              console.log(
                '[FusionState] Loaded state from storage:',
                storedDataRaw ? JSON.parse(storedDataRaw) : null,
              );
            }
          } catch (error) {
            console.error(
              formatErrorMessage(
                FusionStateErrorMessages.PERSISTENCE_READ_ERROR,
                String(error),
              ),
            );
          }
        };

        loadStateFromStorage();
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

        try {
          // Filter keys if persistence.persistKeys is defined
          const stateToSave = filterPersistKeys(newState);

          // Check if anything changed from previously saved state
          const hasChanged = !simpleDeepEqual(
            stateToSave,
            prevPersistedState.current,
          );

          // Only save if there are changes
          if (!hasChanged) return;

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
          console.error(
            formatErrorMessage(
              FusionStateErrorMessages.PERSISTENCE_WRITE_ERROR,
              String(error),
            ),
          );
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

    // Wrap setState to add debugging and persistence
    const setState = useMemo(() => {
      const setStateWithPersistence = (
        updater: React.SetStateAction<GlobalState>,
      ) => {
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

          return nextState;
        });
      };

      return setStateWithPersistence;
    }, [debug, setStateRaw, shouldSaveOnChange, saveStateToStorage]);

    const value = useMemo(
      () => ({
        state,
        setState,
        initializingKeys: initializingKeys.current,
      }),
      [state, setState],
    );

    return (
      <GlobalStateContext.Provider value={value}>
        {children}
      </GlobalStateContext.Provider>
    );
  },
);
