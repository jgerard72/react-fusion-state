import { useFusionState } from './useFusionState';
import { FusionStateProvider } from './FusionStateProvider';
export { useFusionState, FusionStateProvider };
export { useFusionStore, shallow } from './useFusionStore';
import { createAsyncStorageAdapter } from './storage/asyncStorageAdapter';
export { createAsyncStorageAdapter };
export { useFusionStateLog } from './useFusionStateLog';
export { useFusionHydrated } from './useFusionHydrated';
export { useGlobalState } from './FusionStateProvider';
export { createKey, createNamespacedKey, isTypedKey, extractKeyName, AppKeys, UserKeys, } from './createKey';
export type { TypedKey, ExtractKeyType } from './createKey';
export { createDevTools, getDevTools, useDevTools, DevToolsActions, } from './devtools';
export type { DevToolsConfig } from './devtools';
/** @deprecated Use {@link useFusionState} instead. Will be removed in v2. */
export declare const useSharedState: typeof useFusionState;
/** @deprecated Use {@link useFusionState} instead. Will be removed in v2. */
export declare const usePersistentState: typeof useFusionState;
/** @deprecated Use {@link useFusionState} instead. Will be removed in v2. */
export declare const useAppState: typeof useFusionState;
/** @deprecated Use {@link FusionStateProvider} instead. Will be removed in v2. */
export declare const GlobalStateProvider: typeof FusionStateProvider;
/** @deprecated Use {@link FusionStateProvider} instead. Will be removed in v2. */
export declare const StateProvider: typeof FusionStateProvider;
/** @deprecated Use {@link FusionStateProvider} instead. Will be removed in v2. */
export declare const AppStateProvider: typeof FusionStateProvider;
export type { GlobalState, SetStateAction, StateUpdater, GlobalFusionStateContextType, PersistenceConfig, SimplePersistenceConfig, UseFusionStateOptions, } from './types';
export { FusionStateErrorMessages, FusionStateError, PersistenceError, } from './types';
export { formatErrorMessage, debounce, simpleDeepEqual } from './utils';
import { detectBestStorageAdapter, createMemoryStorageAdapter } from './storage/autoDetect';
export { createNoopStorageAdapter, createLocalStorageAdapter, NoopStorageAdapter, } from './storage/storageAdapters';
export { detectBestStorageAdapter, createMemoryStorageAdapter, isSSREnvironment, } from './storage/autoDetect';
/** @deprecated Use {@link createLocalStorageAdapter} instead. Will be removed in v2. */
export declare const createWebStorageAdapter: (debug?: boolean) => import("./storage/storageAdapters").ExtendedStorageAdapter;
/** @deprecated Use {@link createAsyncStorageAdapter} instead. Will be removed in v2. */
export declare const createRNStorageAdapter: typeof createAsyncStorageAdapter;
/** @deprecated Use {@link createAsyncStorageAdapter} instead. Will be removed in v2. */
export declare const createMobileStorageAdapter: typeof createAsyncStorageAdapter;
/** @deprecated Use {@link createMemoryStorageAdapter} instead. Will be removed in v2. */
export declare const createInMemoryAdapter: typeof createMemoryStorageAdapter;
/** @deprecated Use {@link detectBestStorageAdapter} instead. Will be removed in v2. */
export declare const autoDetectStorage: typeof detectBestStorageAdapter;
export type { StorageAdapter, ExtendedStorageAdapter, } from './storage/storageAdapters';
