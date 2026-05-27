// Core API - v1.0 Ultra Simple
import {useFusionState} from './useFusionState';
import {FusionStateProvider} from './FusionStateProvider';

export {useFusionState, FusionStateProvider};

// v1.2 — Cross-key selectors (Zustand-style derived state)
export {useFusionStore, shallow} from './useFusionStore';

// React Native Support
import {createAsyncStorageAdapter} from './storage/asyncStorageAdapter';

export {createAsyncStorageAdapter};

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

/** @deprecated Use {@link useFusionState} instead. Will be removed in v2. */
export const useSharedState = useFusionState;
/** @deprecated Use {@link useFusionState} instead. Will be removed in v2. */
export const usePersistentState = useFusionState;
/** @deprecated Use {@link useFusionState} instead. Will be removed in v2. */
export const useAppState = useFusionState;
/** @deprecated Use {@link FusionStateProvider} instead. Will be removed in v2. */
export const GlobalStateProvider: typeof FusionStateProvider = FusionStateProvider;
/** @deprecated Use {@link FusionStateProvider} instead. Will be removed in v2. */
export const StateProvider: typeof FusionStateProvider = FusionStateProvider;
/** @deprecated Use {@link FusionStateProvider} instead. Will be removed in v2. */
export const AppStateProvider: typeof FusionStateProvider = FusionStateProvider;

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

import {
  createNoopStorageAdapter,
  createLocalStorageAdapter,
} from './storage/storageAdapters';
import {
  detectBestStorageAdapter,
  createMemoryStorageAdapter,
} from './storage/autoDetect';

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

/** @deprecated Use {@link createLocalStorageAdapter} instead. Will be removed in v2. */
export const createWebStorageAdapter = createLocalStorageAdapter;
/** @deprecated Use {@link createAsyncStorageAdapter} instead. Will be removed in v2. */
export const createRNStorageAdapter = createAsyncStorageAdapter;
/** @deprecated Use {@link createAsyncStorageAdapter} instead. Will be removed in v2. */
export const createMobileStorageAdapter = createAsyncStorageAdapter;
/** @deprecated Use {@link createMemoryStorageAdapter} instead. Will be removed in v2. */
export const createInMemoryAdapter = createMemoryStorageAdapter;
/** @deprecated Use {@link detectBestStorageAdapter} instead. Will be removed in v2. */
export const autoDetectStorage = detectBestStorageAdapter;

export type {
  StorageAdapter,
  ExtendedStorageAdapter,
} from './storage/storageAdapters';
