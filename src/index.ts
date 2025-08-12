// Core hooks
export {useFusionState} from '@core/useFusionState';
export {FusionStateProvider, useGlobalState} from '@core/FusionStateProvider';
export {useFusionStateLog} from '@core/useFusionStateLog';

// Types principaux
export type {
  GlobalState,
  SetStateAction,
  StateUpdater,
  GlobalFusionStateContextType,
  PersistenceConfig,
  SimplePersistenceConfig,
  UseFusionStateOptions,
} from '@core/types';
export {
  FusionStateErrorMessages,
  FusionStateError,
  PersistenceError,
} from '@core/types';

// Utilities
export {formatErrorMessage, debounce, simpleDeepEqual} from '@core/utils';

// Persistence exports
export {
  createNoopStorageAdapter,
  createLocalStorageAdapter,
  // For backward compatibility
  NoopStorageAdapter,
} from '@storage/storageAdapters';
export {
  detectBestStorageAdapter,
  createMemoryStorageAdapter,
} from '@storage/autoDetect';
export {createAsyncStorageAdapter} from '@storage/asyncStorageAdapter';
export type {StorageAdapter} from '@storage/storageAdapters';
