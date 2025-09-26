// Core API - v1.0 Ultra Simple
export {useFusionState} from './useFusionState';
export {FusionStateProvider} from './FusionStateProvider';

// React Native Support
export {createAsyncStorageAdapter} from './storage/asyncStorageAdapter';

// Advanced/Internal (backward compatibility only)
export {useFusionStateLog} from './useFusionStateLog';
export {useFusionHydrated} from './useFusionHydrated';
export {useGlobalState} from './FusionStateProvider';

export {
  createKey,
  createNamespacedKey,
  isTypedKey,
  extractKeyName,
  AppKeys,
  UserKeys,
} from './createKey';
export type {TypedKey, ExtractKeyType} from './createKey';

export {
  createDevTools,
  getDevTools,
  useDevTools,
  DevToolsActions,
} from './devtools';
export type {DevToolsConfig} from './devtools';

export {useFusionState as useSharedState} from './useFusionState';
export {useFusionState as usePersistentState} from './useFusionState';
export {useFusionState as useAppState} from './useFusionState';
export {FusionStateProvider as GlobalStateProvider} from './FusionStateProvider';
export {FusionStateProvider as StateProvider} from './FusionStateProvider';
export {FusionStateProvider as AppStateProvider} from './FusionStateProvider';

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

export {formatErrorMessage, debounce, simpleDeepEqual} from './utils';

export {
  createNoopStorageAdapter,
  createLocalStorageAdapter,
  NoopStorageAdapter,
} from './storage/storageAdapters';
export {
  detectBestStorageAdapter,
  createMemoryStorageAdapter,
  isSSREnvironment,
} from './storage/autoDetect';

export {createLocalStorageAdapter as createWebStorageAdapter} from './storage/storageAdapters';
export {createAsyncStorageAdapter as createRNStorageAdapter} from './storage/asyncStorageAdapter';
export {createAsyncStorageAdapter as createMobileStorageAdapter} from './storage/asyncStorageAdapter';
export {createMemoryStorageAdapter as createInMemoryAdapter} from './storage/autoDetect';
export {detectBestStorageAdapter as autoDetectStorage} from './storage/autoDetect';
export type {
  StorageAdapter,
  ExtendedStorageAdapter,
} from './storage/storageAdapters';
