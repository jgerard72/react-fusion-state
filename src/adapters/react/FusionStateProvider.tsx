import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useMemo,
  useEffect,
  memo,
} from 'react';
import { 
  FusionStateManager, 
  CorePersistenceConfig,
  GlobalState,
} from '../../core';
import { 
  ReactFusionStateContextType,
  ReactFusionStateProviderProps,
  ReactPersistenceConfig,
  ReactFullPersistenceConfig,
} from './types';
import { detectBestStorageAdapter } from '../../storage/autoDetect';
import { formatErrorMessage } from '../../utils';

// Create React context for the core manager
const FusionStateManagerContext = createContext<FusionStateManager | undefined>(undefined);

// Legacy context for backward compatibility
const GlobalStateContext = createContext<ReactFusionStateContextType | undefined>(undefined);

/**
 * Hook to access the core fusion state manager
 * @returns The core state manager instance
 * @throws Error if used outside of a FusionStateProvider
 */
export const useFusionStateManager = (): FusionStateManager => {
  const manager = useContext(FusionStateManagerContext);
  
  if (!manager) {
    throw new Error('useFusionStateManager must be used within a FusionStateProvider');
  }
  
  return manager;
};

/**
 * Legacy hook to access the global state context (for backward compatibility)
 * @returns The global state context
 * @throws Error if used outside of a FusionStateProvider
 */
export const useGlobalState = (): ReactFusionStateContextType => {
  const context = useContext(GlobalStateContext);
  
  if (!context) {
    throw new Error('useGlobalState must be used within a FusionStateProvider');
  }
  
  return context;
};

/**
 * Normalize persistence configuration for React
 */
function normalizeReactPersistenceConfig(
  config:
    | boolean
    | string[]
    | ReactPersistenceConfig
    | ReactFullPersistenceConfig
    | undefined,
  debug = false,
): CorePersistenceConfig | undefined {
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

  // Check if it's a full persistence config (has adapter property and loadOnInit/saveOnChange)
  if ('adapter' in config && ('loadOnInit' in config || 'saveOnChange' in config)) {
    return config as CorePersistenceConfig;
  }

  // ReactPersistenceConfig (simplified)
  const simple = config as ReactPersistenceConfig;
  return {
    adapter: simple.adapter || defaultAdapter,
    persistKeys: simple.persistKeys || ((key: string) => key.startsWith('persist.')),
    keyPrefix: simple.keyPrefix,
    debounceTime: simple.debounce,
    loadOnInit: true,
    saveOnChange: true,
    onLoadError: simple.onLoadError,
    onSaveError: simple.onSaveError,
    customSaveCallback: simple.customSaveCallback,
  };
}

/**
 * Provider component for React Fusion State
 * Manages the core state manager and provides access to all child components
 */
export const FusionStateProvider: React.FC<ReactFusionStateProviderProps> = memo(
  ({ children, initialState = {}, debug = false, persistence }) => {
    // Create the core manager instance
    const managerRef = useRef<FusionStateManager>();
    
    if (!managerRef.current) {
      managerRef.current = new FusionStateManager({
        debug,
        initialState,
      });
    }

    const manager = managerRef.current;

    // Configure persistence if provided
    const persistenceConfig = useMemo(
      () => normalizeReactPersistenceConfig(persistence, debug),
      [persistence, debug]
    );

    useEffect(() => {
      if (persistenceConfig) {
        manager.configurePersistence(persistenceConfig);
      }
    }, [manager, persistenceConfig]);

    // Legacy state management for backward compatibility
    const [legacyState, setLegacyState] = useState<GlobalState>(() => 
      manager.getAllState()
    );
    const initializingKeysRef = useRef<Set<string>>(new Set());

    // Keep legacy state in sync with core manager
    useEffect(() => {
      const unsubscribeAll = manager.subscribeToAll((newValue, oldValue, key) => {
        setLegacyState(currentState => ({
          ...currentState,
          [key]: newValue,
        }));
      });

      // Initial sync
      setLegacyState(manager.getAllState());

      return unsubscribeAll;
    }, [manager]);

    // Legacy setState function that updates the core manager
    const legacySetState = useMemo(() => {
      return (updater: React.SetStateAction<GlobalState>) => {
        const currentState = manager.getAllState();
        const nextState = typeof updater === 'function' ? updater(currentState) : updater;
        
        // Apply batch update to core manager
        const updates: Partial<GlobalState> = {};
        Object.keys(nextState).forEach(key => {
          if (nextState[key] !== currentState[key]) {
            updates[key] = nextState[key];
          }
        });
        
        if (Object.keys(updates).length > 0) {
          manager.batchUpdate(updates);
        }
      };
    }, [manager]);

    // Legacy context value for backward compatibility
    const legacyContextValue = useMemo(
      () => ({
        state: legacyState,
        setState: legacySetState,
        initializingKeys: initializingKeysRef.current,
      }),
      [legacyState, legacySetState]
    );

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (managerRef.current) {
          managerRef.current.dispose();
        }
      };
    }, []);

    return (
      <FusionStateManagerContext.Provider value={manager}>
        <GlobalStateContext.Provider value={legacyContextValue}>
          {children}
        </GlobalStateContext.Provider>
      </FusionStateManagerContext.Provider>
    );
  }
);

FusionStateProvider.displayName = 'FusionStateProvider';
