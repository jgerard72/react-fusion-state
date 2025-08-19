/**
 * React adapter for Fusion State
 * Provides React-specific hooks and components that wrap the framework-agnostic core
 */

// Core hooks and components
export { useFusionState, useSharedState, usePersistentState, useAppState } from './useFusionState';
export { FusionStateProvider, useFusionStateManager, useGlobalState } from './FusionStateProvider';

// Convenient aliases for the provider
export { FusionStateProvider as GlobalStateProvider } from './FusionStateProvider';
export { FusionStateProvider as StateProvider } from './FusionStateProvider';
export { FusionStateProvider as AppStateProvider } from './FusionStateProvider';

// React-specific types
export type {
  ReactFusionStateContextType,
  ReactPersistenceConfig,
  ReactFullPersistenceConfig,
  ReactUseFusionStateOptions,
  ReactFusionStateProviderProps,
} from './types';
