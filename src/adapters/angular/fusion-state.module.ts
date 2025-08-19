import { NgModule, ModuleWithProviders } from '@angular/core';
import { FusionStateManager, CorePersistenceConfig } from '../../core';
import { 
  FUSION_STATE_MANAGER, 
  AngularFusionStateConfig,
  AngularPersistenceConfig,
  AngularFullPersistenceConfig,
  AngularFusionStateModule,
} from './types';
import { FusionStateService } from './fusion-state.service';
import { detectBestStorageAdapter } from '../../storage/autoDetect';

/**
 * Normalize persistence configuration for Angular
 */
function normalizeAngularPersistenceConfig(
  config:
    | boolean
    | string[]
    | AngularPersistenceConfig
    | AngularFullPersistenceConfig
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

  // AngularPersistenceConfig (simplified)
  const simple = config as AngularPersistenceConfig;
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
 * Factory function to create the Fusion State manager
 */
function createFusionStateManager(config: AngularFusionStateConfig): FusionStateManager {
  const { initialState = {}, debug = false, persistence } = config;

  // Create the core manager instance
  const manager = new FusionStateManager({
    debug,
    initialState,
  });

  // Configure persistence if provided
  const persistenceConfig = normalizeAngularPersistenceConfig(persistence, debug);
  if (persistenceConfig) {
    manager.configurePersistence(persistenceConfig);
  }

  if (debug) {
    console.log('[FusionState] Angular module initialized successfully');
    console.log('[FusionState] Initial state:', manager.getAllState());
  }

  return manager;
}

/**
 * Angular module for Fusion State
 * Provides global state management capabilities to Angular applications
 * 
 * Usage:
 * ```typescript
 * import { FusionStateModule } from '@fusion-state/angular';
 * 
 * @NgModule({
 *   imports: [
 *     FusionStateModule.forRoot({
 *       debug: true,
 *       initialState: { count: 0 },
 *       persistence: true
 *     })
 *   ]
 * })
 * export class AppModule {}
 * ```
 */
@NgModule({
  providers: [FusionStateService]
})
export class FusionStateModule implements AngularFusionStateModule {
  /**
   * Configure the module for the root application
   * @param config - Configuration options
   * @returns Module with providers
   */
  static forRoot(config: AngularFusionStateConfig = {}): ModuleWithProviders<FusionStateModule> {
    return {
      ngModule: FusionStateModule,
      providers: [
        FusionStateService,
        {
          provide: FUSION_STATE_MANAGER,
          useFactory: () => createFusionStateManager(config),
        },
      ],
    };
  }

  /**
   * Configure the module for feature modules (uses the same instance as root)
   * @returns Module with providers
   */
  static forChild(): ModuleWithProviders<FusionStateModule> {
    return {
      ngModule: FusionStateModule,
      providers: [FusionStateService],
    };
  }
}

/**
 * Convenient aliases for the module
 */
export const GlobalStateModule = FusionStateModule;
export const StateModule = FusionStateModule;
