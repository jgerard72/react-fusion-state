import {
  GlobalState,
  SetStateAction,
  StateUpdater,
  UnsubscribeFunction,
  StateChangeCallback,
  CoreManagerConfig,
  CorePersistenceConfig,
  FusionStateErrorMessages,
} from './types';
import { EventEmitter } from './EventEmitter';
import { PersistenceManager } from './PersistenceManager';
import { formatErrorMessage } from '../utils';

/**
 * Framework-agnostic state manager
 * Core logic for managing global state without framework dependencies
 */
export class FusionStateManager {
  private state: GlobalState = {};
  private eventEmitter: EventEmitter;
  private persistenceManager?: PersistenceManager;
  private initializingKeys = new Set<string>();
  private debug: boolean;

  constructor(config: CoreManagerConfig = {}) {
    this.debug = config.debug || false;
    this.eventEmitter = new EventEmitter();
    
    // Initialize with provided initial state
    if (config.initialState) {
      this.state = { ...config.initialState };
    }

    if (this.debug) {
      console.log('[FusionState] Core manager initialized with state:', this.state);
    }
  }

  /**
   * Configure persistence for the state manager
   * @param config - Persistence configuration
   */
  configurePersistence(config: CorePersistenceConfig): void {
    this.persistenceManager = new PersistenceManager(config, this.debug);

    // Load initial state synchronously if possible
    const syncLoadedState = this.persistenceManager.loadInitialStateSync(this.state);
    if (syncLoadedState !== this.state) {
      this.state = syncLoadedState;
      if (this.debug) {
        console.log('[FusionState] State updated from sync persistence load:', this.state);
      }
    }

    // Load initial state asynchronously as fallback
    this.persistenceManager.loadInitialStateAsync(this.state).then(loadedState => {
      if (loadedState !== this.state) {
        const oldState = { ...this.state };
        this.state = loadedState;
        
        // Notify subscribers of all changed keys
        Object.keys(loadedState).forEach(key => {
          if (oldState[key] !== loadedState[key]) {
            this.eventEmitter.emit(key, loadedState[key], oldState[key]);
          }
        });

        if (this.debug) {
          console.log('[FusionState] State updated from async persistence load:', this.state);
        }
      }
    });
  }

  /**
   * Get the current value for a state key
   * @param key - The state key
   * @returns The current value or undefined if not set
   */
  getState<T = unknown>(key: string): T | undefined {
    return this.state[key] as T;
  }

  /**
   * Get all current state
   * @returns Copy of the entire state object
   */
  getAllState(): GlobalState {
    return { ...this.state };
  }

  /**
   * Check if a key exists in the state
   * @param key - The state key to check
   * @returns True if the key exists
   */
  hasKey(key: string): boolean {
    return key in this.state;
  }

  /**
   * Set the value for a state key
   * @param key - The state key
   * @param value - The new value or updater function
   */
  setState<T = unknown>(key: string, value: SetStateAction<T>): void {
    const currentValue = this.state[key] as T;
    
    // Handle updater function
    const nextValue = typeof value === 'function' 
      ? (value as (prev: T) => T)(currentValue)
      : value;

    // Only update if the value has changed (reference equality check)
    if (nextValue === currentValue) {
      return;
    }

    const oldValue = currentValue;
    this.state = { ...this.state, [key]: nextValue };

    // Emit change event
    this.eventEmitter.emit(key, nextValue, oldValue);

    // Persist if configured
    if (this.persistenceManager) {
      this.persistenceManager.saveState(this.state);
    }

    if (this.debug) {
      console.log(`[FusionState] State updated - ${key}:`, {
        old: oldValue,
        new: nextValue,
      });
    }
  }

  /**
   * Initialize a state key with a value if it doesn't exist
   * @param key - The state key
   * @param initialValue - The initial value
   * @throws Error if key is already being initialized or exists without initial value
   */
  initializeKey<T = unknown>(key: string, initialValue?: T): void {
    // Check if key is already being initialized
    if (this.initializingKeys.has(key)) {
      throw new Error(
        formatErrorMessage(
          FusionStateErrorMessages.KEY_ALREADY_INITIALIZING,
          key
        )
      );
    }

    // If key already exists, no need to initialize
    if (this.hasKey(key)) {
      return;
    }

    // If key doesn't exist and no initial value provided, throw error
    if (initialValue === undefined) {
      throw new Error(
        formatErrorMessage(
          FusionStateErrorMessages.KEY_MISSING_NO_INITIAL,
          key
        )
      );
    }

    // Mark as initializing
    this.initializingKeys.add(key);

    try {
      // Set the initial value
      this.setState(key, initialValue);
    } finally {
      // Always remove from initializing set
      this.initializingKeys.delete(key);
    }
  }

  /**
   * Subscribe to changes for a specific state key
   * @param key - The state key to watch
   * @param callback - Function to call when the key changes
   * @returns Unsubscribe function
   */
  subscribe<T = unknown>(
    key: string,
    callback: StateChangeCallback<T>
  ): UnsubscribeFunction {
    return this.eventEmitter.subscribe(key, callback);
  }

  /**
   * Subscribe to all state changes
   * @param callback - Function to call when any key changes
   * @returns Unsubscribe function
   */
  subscribeToAll(callback: StateChangeCallback): UnsubscribeFunction {
    const unsubscribeFunctions: UnsubscribeFunction[] = [];
    
    // Subscribe to all existing keys
    Object.keys(this.state).forEach(key => {
      unsubscribeFunctions.push(this.eventEmitter.subscribe(key, callback));
    });

    // TODO: Handle new keys being added (would need a global subscription mechanism)
    // For now, this covers existing keys only

    return () => {
      unsubscribeFunctions.forEach(unsub => unsub());
    };
  }

  /**
   * Remove a key from the state
   * @param key - The state key to remove
   */
  removeKey(key: string): void {
    if (!this.hasKey(key)) {
      return;
    }

    const oldValue = this.state[key];
    const { [key]: removed, ...newState } = this.state;
    this.state = newState;

    // Emit change event with undefined as new value
    this.eventEmitter.emit(key, undefined, oldValue);

    // Persist if configured
    if (this.persistenceManager) {
      this.persistenceManager.saveState(this.state);
    }

    if (this.debug) {
      console.log(`[FusionState] Key removed: ${key}`);
    }
  }

  /**
   * Clear all state
   */
  clear(): void {
    const oldState = { ...this.state };
    this.state = {};

    // Emit change events for all cleared keys
    Object.keys(oldState).forEach(key => {
      this.eventEmitter.emit(key, undefined, oldState[key]);
    });

    // Persist if configured
    if (this.persistenceManager) {
      this.persistenceManager.saveState(this.state);
    }

    if (this.debug) {
      console.log('[FusionState] All state cleared');
    }
  }

  /**
   * Get debug information about the manager
   * @returns Debug information object
   */
  getDebugInfo() {
    return {
      state: { ...this.state },
      keyCount: Object.keys(this.state).length,
      subscriberCount: this.eventEmitter.getTotalSubscriberCount(),
      subscribedKeys: this.eventEmitter.getSubscribedKeys(),
      initializingKeys: Array.from(this.initializingKeys),
      persistenceEnabled: this.persistenceManager?.isPersistenceEnabled() || false,
    };
  }

  /**
   * Create a state updater function for a specific key
   * @param key - The state key
   * @returns State updater function
   */
  createStateUpdater<T = unknown>(key: string): StateUpdater<T> {
    return (value: SetStateAction<T>) => {
      this.setState(key, value);
    };
  }

  /**
   * Batch multiple state updates
   * @param updates - Object with key-value pairs to update
   */
  batchUpdate(updates: Partial<GlobalState>): void {
    const oldState = { ...this.state };
    
    // Apply all updates
    this.state = { ...this.state, ...updates };

    // Emit change events for all changed keys
    Object.keys(updates).forEach(key => {
      const newValue = updates[key];
      const oldValue = oldState[key];
      
      if (newValue !== oldValue) {
        this.eventEmitter.emit(key, newValue, oldValue);
      }
    });

    // Persist if configured (single persistence call for all changes)
    if (this.persistenceManager) {
      this.persistenceManager.saveState(this.state);
    }

    if (this.debug) {
      console.log('[FusionState] Batch update applied:', updates);
    }
  }

  /**
   * Dispose of the manager and clean up resources
   */
  dispose(): void {
    this.eventEmitter.clear();
    this.initializingKeys.clear();
    this.state = {};
    
    if (this.debug) {
      console.log('[FusionState] Manager disposed');
    }
  }
}
