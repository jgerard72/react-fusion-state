import { StateUpdater, UseFusionStateOptions } from './types';
import { TypedKey } from './createKey';
/**
 * Custom hook to manage a piece of state within the global fusion state.
 * Supports both string keys (backward compatible) and typed keys (v0.4.0+)
 */
export declare function useFusionState<T>(key: TypedKey<T>, initialValue?: T, options?: UseFusionStateOptions): [T, StateUpdater<T>];
export declare function useFusionState<T = unknown>(key: string, initialValue?: T, options?: UseFusionStateOptions): [T, StateUpdater<T>];
