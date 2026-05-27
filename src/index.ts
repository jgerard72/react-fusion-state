// Core API - v1.0 Ultra Simple
import {useFusionState} from './useFusionState';
import {FusionStateProvider} from './FusionStateProvider';
import {deprecate, deprecateComponent} from './utils/deprecation';

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

/**
 * @deprecated Use {@link useFusionState} instead. Will be removed in v2.
 * Emits a one-time `console.warn` on first call (since v1.3.0).
 */
export const useSharedState = deprecate(
  useFusionState,
  'useSharedState',
  'useFusionState',
  'hook',
);
/**
 * @deprecated Use {@link useFusionState} instead. Will be removed in v2.
 * Emits a one-time `console.warn` on first call (since v1.3.0).
 */
export const usePersistentState = deprecate(
  useFusionState,
  'usePersistentState',
  'useFusionState',
  'hook',
);
/**
 * @deprecated Use {@link useFusionState} instead. Will be removed in v2.
 * Emits a one-time `console.warn` on first call (since v1.3.0).
 */
export const useAppState = deprecate(
  useFusionState,
  'useAppState',
  'useFusionState',
  'hook',
);
/**
 * @deprecated Use {@link FusionStateProvider} instead. Will be removed in v2.
 * Emits a one-time `console.warn` on first mount (since v1.3.0).
 */
export const GlobalStateProvider = deprecateComponent(
  FusionStateProvider,
  'GlobalStateProvider',
  'FusionStateProvider',
);
/**
 * @deprecated Use {@link FusionStateProvider} instead. Will be removed in v2.
 * Emits a one-time `console.warn` on first mount (since v1.3.0).
 */
export const StateProvider = deprecateComponent(
  FusionStateProvider,
  'StateProvider',
  'FusionStateProvider',
);
/**
 * @deprecated Use {@link FusionStateProvider} instead. Will be removed in v2.
 * Emits a one-time `console.warn` on first mount (since v1.3.0).
 */
export const AppStateProvider = deprecateComponent(
  FusionStateProvider,
  'AppStateProvider',
  'FusionStateProvider',
);

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

/**
 * @deprecated Use {@link createLocalStorageAdapter} instead. Will be removed in v2.
 * Emits a one-time `console.warn` on first call (since v1.3.0).
 */
export const createWebStorageAdapter = deprecate(
  createLocalStorageAdapter,
  'createWebStorageAdapter',
  'createLocalStorageAdapter',
);
/**
 * @deprecated Use {@link createAsyncStorageAdapter} instead. Will be removed in v2.
 * Emits a one-time `console.warn` on first call (since v1.3.0).
 */
export const createRNStorageAdapter = deprecate(
  createAsyncStorageAdapter,
  'createRNStorageAdapter',
  'createAsyncStorageAdapter',
);
/**
 * @deprecated Use {@link createAsyncStorageAdapter} instead. Will be removed in v2.
 * Emits a one-time `console.warn` on first call (since v1.3.0).
 */
export const createMobileStorageAdapter = deprecate(
  createAsyncStorageAdapter,
  'createMobileStorageAdapter',
  'createAsyncStorageAdapter',
);
/**
 * @deprecated Use {@link createMemoryStorageAdapter} instead. Will be removed in v2.
 * Emits a one-time `console.warn` on first call (since v1.3.0).
 */
export const createInMemoryAdapter = deprecate(
  createMemoryStorageAdapter,
  'createInMemoryAdapter',
  'createMemoryStorageAdapter',
);
/**
 * @deprecated Use {@link detectBestStorageAdapter} instead. Will be removed in v2.
 * Emits a one-time `console.warn` on first call (since v1.3.0).
 */
export const autoDetectStorage = deprecate(
  detectBestStorageAdapter,
  'autoDetectStorage',
  'detectBestStorageAdapter',
);

export type {
  StorageAdapter,
  ExtendedStorageAdapter,
} from './storage/storageAdapters';
