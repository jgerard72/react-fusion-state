import { App } from 'vue';
import { FusionStateManager, CorePersistenceConfig } from '../../core';
import { 
  FUSION_STATE_MANAGER_KEY, 
  VueFusionStatePluginOptions, 
  VuePersistenceConfig,
  VueFullPersistenceConfig,
  VueFusionStatePlugin,
} from './types';
import { detectBestStorageAdapter } from '../../storage/autoDetect';

/**
 * Normalize persistence configuration for Vue
 */
function normalizeVuePersistenceConfig(
  config:
    | boolean
    | string[]
    | VuePersistenceConfig
    | VueFullPersistenceConfig
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

  // VuePersistenceConfig (simplified)
  const simple = config as VuePersistenceConfig;
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
 * Vue plugin for Fusion State
 * Provides global state management capabilities to Vue applications
 * 
 * Usage:
 * ```typescript
 * import { createApp } from 'vue';
 * import { FusionStatePlugin } from '@fusion-state/vue';
 * 
 * const app = createApp(App);
 * app.use(FusionStatePlugin, {
 *   debug: true,
 *   initialState: { count: 0 },
 *   persistence: true
 * });
 * ```
 */
export const FusionStatePlugin: VueFusionStatePlugin = {
  install(app: App, options: VueFusionStatePluginOptions = {}) {
    const { initialState = {}, debug = false, persistence } = options;

    // Create the core manager instance
    const manager = new FusionStateManager({
      debug,
      initialState,
    });

    // Configure persistence if provided
    const persistenceConfig = normalizeVuePersistenceConfig(persistence, debug);
    if (persistenceConfig) {
      manager.configurePersistence(persistenceConfig);
    }

    // Provide the manager to all components
    app.provide(FUSION_STATE_MANAGER_KEY, manager);

    // Add global properties for easier access (optional)
    app.config.globalProperties.$fusionState = manager;

    // Cleanup on app unmount
    const originalUnmount = app.unmount;
    app.unmount = function() {
      manager.dispose();
      return originalUnmount.call(this);
    };

    if (debug) {
      console.log('[FusionState] Vue plugin installed successfully');
      console.log('[FusionState] Initial state:', manager.getAllState());
    }
  },
};

/**
 * Convenient aliases for the plugin
 */
export const FusionState = FusionStatePlugin;
export const GlobalStatePlugin = FusionStatePlugin;
export const StatePlugin = FusionStatePlugin;
