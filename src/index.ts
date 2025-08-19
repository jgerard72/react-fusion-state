/**
 * React Fusion State - Multi-Framework State Management
 * 
 * This is the main entry point that maintains backward compatibility with React
 * while providing access to the new multi-framework architecture.
 * 
 * For framework-specific usage:
 * - React: Use this main export (backward compatible)
 * - Vue: Import from 'src/adapters/vue'
 * - Angular: Import from 'src/adapters/angular'
 * - Core: Import from 'src/core' for framework-agnostic usage
 */

// =============================================================================
// BACKWARD COMPATIBILITY - REACT EXPORTS (DEFAULT)
// These exports maintain full backward compatibility with existing React code
// =============================================================================

// Core React hooks and components (using new architecture but same API)
export { 
  useFusionState, 
  useSharedState, 
  usePersistentState, 
  useAppState 
} from './adapters/react/useFusionState';

export { 
  FusionStateProvider, 
  useGlobalState,
  useFusionStateManager as useReactFusionStateManager,
} from './adapters/react/FusionStateProvider';

// Legacy hook for logging (needs to be updated to use new architecture)
export { useFusionStateLog } from './useFusionStateLog';

// Convenient aliases for React components
export { 
  FusionStateProvider as GlobalStateProvider,
  FusionStateProvider as StateProvider,
  FusionStateProvider as AppStateProvider,
} from './adapters/react/FusionStateProvider';

// =============================================================================
// CORE FRAMEWORK-AGNOSTIC EXPORTS
// =============================================================================

// Core classes and functions
export { 
  FusionStateManager, 
  EventEmitter, 
  PersistenceManager 
} from './core';

// Core types
export type {
  GlobalState,
  SetStateAction,
  StateUpdater,
  StateChangeCallback,
  UnsubscribeFunction,
  CoreManagerConfig,
  CorePersistenceConfig,
  PersistenceKeys,
  StorageAdapter,
  ExtendedStorageAdapter,
} from './core';

// Core errors
export {
  FusionStateError,
  PersistenceError,
  FusionStateErrorMessages,
} from './core';

// =============================================================================
// REACT-SPECIFIC TYPES (BACKWARD COMPATIBILITY)
// =============================================================================

export type {
  ReactFusionStateContextType as GlobalFusionStateContextType, // Legacy name
  ReactPersistenceConfig as SimplePersistenceConfig, // Legacy name
  ReactFullPersistenceConfig as PersistenceConfig, // Legacy name
  ReactUseFusionStateOptions as UseFusionStateOptions, // Legacy name
} from './adapters/react/types';

// =============================================================================
// UTILITIES AND STORAGE (UNCHANGED)
// =============================================================================

// Utilities
export { formatErrorMessage, debounce, simpleDeepEqual } from './utils';

// Storage adapters
export {
  createNoopStorageAdapter,
  createLocalStorageAdapter,
  // For backward compatibility
  NoopStorageAdapter,
} from './storage/storageAdapters';

export {
  detectBestStorageAdapter,
  createMemoryStorageAdapter,
  isSSREnvironment,
} from './storage/autoDetect';

export { createAsyncStorageAdapter } from './storage/asyncStorageAdapter';

// Storage adapter aliases
export { createLocalStorageAdapter as createWebStorageAdapter } from './storage/storageAdapters';
export { createAsyncStorageAdapter as createRNStorageAdapter } from './storage/asyncStorageAdapter';
export { createAsyncStorageAdapter as createMobileStorageAdapter } from './storage/asyncStorageAdapter';
export { createMemoryStorageAdapter as createInMemoryAdapter } from './storage/autoDetect';
export { detectBestStorageAdapter as autoDetectStorage } from './storage/autoDetect';

// =============================================================================
// MULTI-FRAMEWORK EXPORTS (NEW)
// =============================================================================

// Re-export framework adapters for direct access
export * as ReactAdapter from './adapters/react';
// Note: Vue and Angular adapters are available but excluded from this build
// export * as VueAdapter from './adapters/vue';
// export * as AngularAdapter from './adapters/angular';
export * as Core from './core';

// =============================================================================
// FRAMEWORK DETECTION AND UTILITIES
// =============================================================================

/**
 * Detect the current framework environment
 * @returns The detected framework or 'unknown'
 */
export function detectFramework(): 'react' | 'vue' | 'angular' | 'unknown' {
  // Check for React
  if (typeof window !== 'undefined' && (window as any).React) {
    return 'react';
  }
  
  // Check for Vue
  if (typeof window !== 'undefined' && (window as any).Vue) {
    return 'vue';
  }
  
  // Check for Angular (zone.js is typically present)
  if (typeof window !== 'undefined' && (window as any).Zone) {
    return 'angular';
  }
  
  // Check for module imports (Node.js environment)
  try {
    require.resolve('react');
    return 'react';
  } catch {}
  
  try {
    require.resolve('vue');
    return 'vue';
  } catch {}
  
  try {
    require.resolve('@angular/core');
    return 'angular';
  } catch {}
  
  return 'unknown';
}

/**
 * Get the appropriate adapter for the current framework
 * @returns Framework adapter or core manager
 */
export function getFrameworkAdapter() {
  const framework = detectFramework();
  
  switch (framework) {
    case 'react':
      return require('./adapters/react');
    case 'vue':
      return require('./adapters/vue');
    case 'angular':
      return require('./adapters/angular');
    default:
      return require('./core');
  }
}