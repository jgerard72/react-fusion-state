import { InjectionToken, ModuleWithProviders, Type } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  FusionStateManager, 
  GlobalState, 
  CorePersistenceConfig,
  PersistenceKeys,
  StorageAdapter,
  StateUpdater,
  SetStateAction,
} from '../../core';

/**
 * Angular-specific types for Fusion State
 */

/** Injection token for the Fusion State manager */
export const FUSION_STATE_MANAGER = new InjectionToken<FusionStateManager>('FusionStateManager');

/** Simplified configuration for Angular persistence */
export interface AngularPersistenceConfig {
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

/** Full Angular persistence configuration */
export interface AngularFullPersistenceConfig extends CorePersistenceConfig {
  /** Load state from storage on initialization */
  loadOnInit?: boolean;
  /** Save state to storage when it changes */
  saveOnChange?: boolean;
}

/** Configuration for the Angular Fusion State module */
export interface AngularFusionStateConfig {
  /** Optional initial state values */
  initialState?: GlobalState;
  /** Enable debug mode which logs state changes to console */
  debug?: boolean;
  /**
   * Persistence configuration - can be:
   * - true: enable persistence for all keys with default values
   * - string array: enable persistence only for specified keys
   * - object: detailed configuration with keys, prefix, etc.
   * - complete AngularFullPersistenceConfig object: advanced configuration
   */
  persistence?:
    | boolean
    | string[]
    | AngularPersistenceConfig
    | AngularFullPersistenceConfig;
}

/** State value with updater function */
export interface StateValue<T> {
  /** Current value */
  value: T;
  /** Function to update the value */
  update: StateUpdater<T>;
  /** Observable that emits when the value changes */
  value$: Observable<T>;
}

/** Angular module interface */
export interface AngularFusionStateModule {
  forRoot(config?: AngularFusionStateConfig): ModuleWithProviders<AngularFusionStateModule>;
  forChild(): ModuleWithProviders<AngularFusionStateModule>;
}
