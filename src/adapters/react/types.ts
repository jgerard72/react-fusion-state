import React from 'react';
import { 
  GlobalState, 
  CorePersistenceConfig,
  PersistenceKeys,
  StorageAdapter,
} from '../../core';

/**
 * React-specific types for Fusion State
 */

/** Type for the React context */
export interface ReactFusionStateContextType {
  state: GlobalState;
  setState: React.Dispatch<React.SetStateAction<GlobalState>>;
  initializingKeys: Set<string>;
}

/** Simplified configuration for React persistence */
export interface ReactPersistenceConfig {
  /**
   * Keys to persist - if not provided, all state keys will be persisted
   */
  persistKeys?: PersistenceKeys;
  
  /**
   * Storage key prefix for namespacing (default: 'fusion_state')
   */
  keyPrefix?: string;
  
  /**
   * Debounce time in ms (0 = immediate save)
   */
  debounce?: number;
  
  /**
   * Custom storage adapter (optional)
   */
  adapter?: StorageAdapter;
  
  /** Custom callback function to handle saving */
  customSaveCallback?: (
    state: GlobalState,
    adapter: StorageAdapter,
    keyPrefix: string,
  ) => Promise<void>;
  
  /** Callback called on storage read error */
  onLoadError?: (error: Error, key: string) => void;
  
  /** Callback called on storage write error */
  onSaveError?: (error: Error, state: GlobalState) => void;
}

/** Full React persistence configuration (backward compatibility) */
export interface ReactFullPersistenceConfig extends CorePersistenceConfig {
  /** Load state from storage on initialization */
  loadOnInit?: boolean;
  /** Save state to storage when it changes */
  saveOnChange?: boolean;
}

/** Options for React fusion state hook */
export interface ReactUseFusionStateOptions {
  /**
   * Skip local state synchronization for performance optimization
   */
  skipLocalState?: boolean;
}

/** Props for the React FusionStateProvider */
export interface ReactFusionStateProviderProps {
  /** Child components that will have access to fusion state */
  children: React.ReactNode;
  /** Optional initial state values */
  initialState?: GlobalState;
  /** Enable debug mode which logs state changes to console */
  debug?: boolean;
  /**
   * Persistence configuration - can be:
   * - true: enable persistence for all keys with default values
   * - string array: enable persistence only for specified keys
   * - object: detailed configuration with keys, prefix, etc.
   * - complete ReactFullPersistenceConfig object: advanced configuration (backward compatibility)
   */
  persistence?:
    | boolean
    | string[]
    | ReactPersistenceConfig
    | ReactFullPersistenceConfig;
}
