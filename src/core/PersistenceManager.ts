import {
  GlobalState,
  CorePersistenceConfig,
  StorageAdapter,
  ExtendedStorageAdapter,
  PersistenceKeys,
  FusionStateErrorMessages,
} from './types';
import { formatErrorMessage, debounce, simpleDeepEqual } from '../utils';

/**
 * Framework-agnostic persistence manager
 * Handles loading and saving state to storage
 */
export class PersistenceManager {
  private config: CorePersistenceConfig;
  private prevPersistedState: GlobalState = {};
  private debouncedSave?: ReturnType<typeof debounce>;
  private isInitialLoadDone = false;
  private debug: boolean;

  constructor(config: CorePersistenceConfig, debug = false) {
    this.config = config;
    this.debug = debug;

    // Create debounced save function if needed
    if (config.debounceTime && config.debounceTime > 0) {
      this.debouncedSave = debounce(
        this.saveStateToStorage.bind(this),
        config.debounceTime
      );
    }
  }

  /**
   * Load initial state from storage (synchronous attempt first)
   * @param currentState - Current state to merge with stored state
   * @returns Merged state with stored data
   */
  loadInitialStateSync(currentState: GlobalState): GlobalState {
    if (!this.config.loadOnInit) {
      return currentState;
    }

    const keyPrefix = this.config.keyPrefix || 'fusion_state';
    const adapter = this.config.adapter as ExtendedStorageAdapter;

    // Try synchronous load if supported (e.g., localStorage)
    if (adapter.getItemSync && typeof window !== 'undefined') {
      try {
        const item = adapter.getItemSync(`${keyPrefix}_all`);
        if (item) {
          const storedData = JSON.parse(item) as GlobalState;
          this.prevPersistedState = { ...storedData };
          
          if (this.debug) {
            console.log('[FusionState] Loaded state synchronously:', storedData);
          }
          
          return { ...currentState, ...storedData };
        }
      } catch (error) {
        if (this.debug) {
          console.warn('[FusionState] Synchronous load failed, will try async:', error);
        }
        
        if (this.config.onLoadError) {
          const errorObj = error instanceof Error ? error : new Error(String(error));
          this.config.onLoadError(errorObj, `${keyPrefix}_all`);
        }
      }
    }

    return currentState;
  }

  /**
   * Load state from storage asynchronously
   * @param currentState - Current state to merge with
   * @returns Promise that resolves to merged state
   */
  async loadInitialStateAsync(currentState: GlobalState): Promise<GlobalState> {
    if (!this.config.loadOnInit || this.isInitialLoadDone) {
      this.isInitialLoadDone = true;
      return currentState;
    }

    const keyPrefix = this.config.keyPrefix || 'fusion_state';

    try {
      const storedDataRaw = await this.config.adapter.getItem(`${keyPrefix}_all`);

      if (storedDataRaw) {
        const storedData = JSON.parse(storedDataRaw) as GlobalState;
        this.prevPersistedState = { ...storedData };

        const mergedState = { ...currentState, ...storedData };
        
        if (this.debug) {
          console.log('[FusionState] Loaded state from storage (async):', storedData);
          console.log('[FusionState] Merged state:', mergedState);
        }

        this.isInitialLoadDone = true;
        return mergedState;
      }

      if (this.debug) {
        console.log('[FusionState] No stored data found');
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      if (this.debug) {
        console.error(
          formatErrorMessage(
            FusionStateErrorMessages.PERSISTENCE_READ_ERROR,
            String(error)
          )
        );
      }

      if (this.config.onLoadError) {
        this.config.onLoadError(errorObj, `${keyPrefix}_all`);
      }
    }

    this.isInitialLoadDone = true;
    return currentState;
  }

  /**
   * Save state to storage
   * @param newState - The state to save
   */
  async saveState(newState: GlobalState): Promise<void> {
    if (!this.config.saveOnChange) {
      return;
    }

    // Use debounced save if configured
    if (this.debouncedSave) {
      this.debouncedSave(newState);
    } else {
      await this.saveStateToStorage(newState);
    }
  }

  /**
   * Internal method to save state to storage
   * @param newState - The state to save
   */
  private async saveStateToStorage(newState: GlobalState): Promise<void> {
    const keyPrefix = this.config.keyPrefix || 'fusion_state';
    
    // Filter keys based on persistKeys configuration
    const stateToSave = this.filterPersistKeys(newState);

    try {
      // Check if anything changed from previously saved state
      const hasChanged = !simpleDeepEqual(stateToSave, this.prevPersistedState);

      if (!hasChanged) {
        return;
      }

      // Use custom save callback if provided
      if (this.config.customSaveCallback) {
        await this.config.customSaveCallback(
          stateToSave,
          this.config.adapter,
          keyPrefix
        );
      } else {
        // Default behavior: save all state in one key
        await this.config.adapter.setItem(
          `${keyPrefix}_all`,
          JSON.stringify(stateToSave)
        );
      }

      // Update reference for future comparisons
      this.prevPersistedState = { ...stateToSave };

      if (this.debug) {
        console.log('[FusionState] Saved state to storage:', stateToSave);
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));

      if (this.debug) {
        console.error(
          formatErrorMessage(
            FusionStateErrorMessages.PERSISTENCE_WRITE_ERROR,
            String(error)
          )
        );
      }

      if (this.config.onSaveError) {
        this.config.onSaveError(errorObj, stateToSave);
      }
    }
  }

  /**
   * Filter state keys based on persistKeys configuration
   * @param state - The state to filter
   * @returns Filtered state containing only keys to persist
   */
  private filterPersistKeys(state: GlobalState): GlobalState {
    const persistKeys = this.config.persistKeys;

    if (!persistKeys) {
      return { ...state };
    }

    const filteredState: GlobalState = {};

    if (Array.isArray(persistKeys)) {
      // If persistKeys is an array, only save those keys
      persistKeys.forEach(key => {
        if (key in state) {
          filteredState[key] = state[key];
        }
      });
    } else if (typeof persistKeys === 'function') {
      // If persistKeys is a function, use it to filter keys
      Object.keys(state).forEach(key => {
        if (persistKeys(key, state[key])) {
          filteredState[key] = state[key];
        }
      });
    }

    return filteredState;
  }

  /**
   * Update persistence configuration
   * @param config - New persistence configuration
   */
  updateConfig(config: CorePersistenceConfig): void {
    this.config = config;

    // Recreate debounced save function if needed
    if (config.debounceTime && config.debounceTime > 0) {
      this.debouncedSave = debounce(
        this.saveStateToStorage.bind(this),
        config.debounceTime
      );
    } else {
      this.debouncedSave = undefined;
    }
  }

  /**
   * Get current persistence configuration
   * @returns Current persistence configuration
   */
  getConfig(): CorePersistenceConfig {
    return { ...this.config };
  }

  /**
   * Check if persistence is enabled
   * @returns True if persistence is configured and enabled
   */
  isPersistenceEnabled(): boolean {
    return this.config.saveOnChange || this.config.loadOnInit || false;
  }
}
