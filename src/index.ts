// Core hooks
export {useFusionState} from './useFusionState';
export {FusionStateProvider, useGlobalState} from './FusionStateProvider';
export {useFusionStateLog} from './useFusionStateLog';

// Convenient aliases for common imports
export {useFusionState as useSharedState} from './useFusionState';
export {useFusionState as usePersistentState} from './useFusionState';
export {useFusionState as useAppState} from './useFusionState';
export {FusionStateProvider as GlobalStateProvider} from './FusionStateProvider';
export {FusionStateProvider as StateProvider} from './FusionStateProvider';
export {FusionStateProvider as AppStateProvider} from './FusionStateProvider';

// Types principaux
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

// Storage adapter aliases
export {createLocalStorageAdapter as createWebStorageAdapter} from './storage/storageAdapters';
export {createAsyncStorageAdapter as createRNStorageAdapter} from './storage/asyncStorageAdapter';
export {createAsyncStorageAdapter as createMobileStorageAdapter} from './storage/asyncStorageAdapter';
export {createMemoryStorageAdapter as createInMemoryAdapter} from './storage/autoDetect';
export {detectBestStorageAdapter as autoDetectStorage} from './storage/autoDetect';
export type {
  StorageAdapter,
  ExtendedStorageAdapter,
} from './storage/storageAdapters';
