import { StateUpdater, UseFusionStateOptions } from './types';
import { TypedKey } from './createKey';
/**
 * Hook for global state management with automatic persistence and SSR support
 */
export declare function useFusionState<T>(key: TypedKey<T>, initialValue?: T, options?: UseFusionStateOptions): [T, StateUpdater<T>];
export declare function useFusionState<T = unknown>(key: string, initialValue?: T, options?: UseFusionStateOptions): [T, StateUpdater<T>];
