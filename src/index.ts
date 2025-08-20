// Core hooks
export {useFusionState} from './useFusionState';
export {FusionStateProvider, useGlobalState} from './FusionStateProvider';
export {useFusionStateLog} from './useFusionStateLog';

// ✅ AUTOMATIC OPTIMIZATIONS: Built into useFusionState
// No need for separate hooks, everything is optimized automatically!

// Convenient aliases for different use cases
export {useFusionState as useSharedState} from './useFusionState';
export {useFusionState as usePersistentState} from './useFusionState';
export {useFusionState as useAppState} from './useFusionState';
export {FusionStateProvider as GlobalStateProvider} from './FusionStateProvider';
export {FusionStateProvider as StateProvider} from './FusionStateProvider';
export {FusionStateProvider as AppStateProvider} from './FusionStateProvider';

// Main types
export type {
  GlobalState,
  SetStateAction,
  StateUpdater,
  GlobalFusionStateContextType,
  PersistenceConfig,
  SimplePersistenceConfig,
  UseFusionStateOptions,
} from './types';
export {
  FusionStateErrorMessages,
  FusionStateError,
  PersistenceError,
} from './types';

// Utilities
export {formatErrorMessage, debounce, simpleDeepEqual} from './utils';

// ✅ SIMPLE: No complex middleware

// Persistence exports
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
export {createAsyncStorageAdapter} from './storage/asyncStorageAdapter';

// Storage adapter aliases for convenience
export {createLocalStorageAdapter as createWebStorageAdapter} from './storage/storageAdapters';
export {createAsyncStorageAdapter as createRNStorageAdapter} from './storage/asyncStorageAdapter';
export {createAsyncStorageAdapter as createMobileStorageAdapter} from './storage/asyncStorageAdapter';
export {createMemoryStorageAdapter as createInMemoryAdapter} from './storage/autoDetect';
export {detectBestStorageAdapter as autoDetectStorage} from './storage/autoDetect';
export type {
  StorageAdapter,
  ExtendedStorageAdapter,
} from './storage/storageAdapters';
