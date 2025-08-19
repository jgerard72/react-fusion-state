import { App, InjectionKey } from 'vue';
import { 
  FusionStateManager, 
  GlobalState, 
  CorePersistenceConfig,
  PersistenceKeys,
  StorageAdapter,
} from '../../core';

/**
 * Vue-specific types for Fusion State
 */

/** Injection key for the Fusion State manager */
export const FUSION_STATE_MANAGER_KEY: InjectionKey<FusionStateManager> = Symbol('FusionStateManager');

/** Simplified configuration for Vue persistence */
export interface VuePersistenceConfig {
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

/** Full Vue persistence configuration */
export interface VueFullPersistenceConfig extends CorePersistenceConfig {
  /** Load state from storage on initialization */
  loadOnInit?: boolean;
  /** Save state to storage when it changes */
  saveOnChange?: boolean;
}

/** Options for Vue fusion state composable */
export interface VueUseFusionStateOptions {
  /**
   * Use shallow ref instead of ref for better performance with objects
   * Only use this if you're sure you won't be mutating nested properties
   */
  shallow?: boolean;
  
  /**
   * Skip reactivity wrapper - returns raw values (advanced usage)
   * Use with caution as this bypasses Vue's reactivity system
   */
  skipReactivity?: boolean;
}

/** Configuration for the Vue Fusion State plugin */
export interface VueFusionStatePluginOptions {
  /** Optional initial state values */
  initialState?: GlobalState;
  /** Enable debug mode which logs state changes to console */
  debug?: boolean;
  /**
   * Persistence configuration - can be:
   * - true: enable persistence for all keys with default values
   * - string array: enable persistence only for specified keys
   * - object: detailed configuration with keys, prefix, etc.
   * - complete VueFullPersistenceConfig object: advanced configuration
   */
  persistence?:
    | boolean
    | string[]
    | VuePersistenceConfig
    | VueFullPersistenceConfig;
}

/** Vue plugin interface */
export interface VueFusionStatePlugin {
  install(app: App, options?: VueFusionStatePluginOptions): void;
}
