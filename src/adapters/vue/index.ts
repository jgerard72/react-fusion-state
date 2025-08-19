/**
 * Vue adapter for Fusion State
 * Provides Vue-specific composables and plugin that wrap the framework-agnostic core
 */

// Core composables
export { 
  useFusionState, 
  useFusionStateValue,
  useFusionStateUpdater,
  useFusionStateManager,
  watchFusionState,
  useSharedState, 
  usePersistentState, 
  useAppState 
} from './useFusionState';

// Vue plugin
export { 
  FusionStatePlugin, 
  FusionState,
  GlobalStatePlugin,
  StatePlugin,
} from './plugin';

// Vue-specific types
export type {
  VuePersistenceConfig,
  VueFullPersistenceConfig,
  VueUseFusionStateOptions,
  VueFusionStatePluginOptions,
  VueFusionStatePlugin,
} from './types';

// Injection key (for advanced usage)
export { FUSION_STATE_MANAGER_KEY } from './types';
