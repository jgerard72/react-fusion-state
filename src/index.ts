// Core hooks
export {useFusionState} from './useFusionState';
export {FusionStateProvider, useGlobalState} from './FusionStateProvider';
export {useFusionStateLog} from './useFusionStateLog';

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
export type {
  StorageAdapter,
  ExtendedStorageAdapter,
} from './storage/storageAdapters';
