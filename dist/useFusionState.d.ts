import { StateUpdater, UseFusionStateOptions } from './types';
import { TypedKey } from './createKey';
/**
 * Hook for global state management with automatic persistence and SSR support
 *
 * @template T - The type of the state value
 * @param key - Unique key for the state (string or TypedKey)
 * @param initialValue - Initial value for the state
 * @param options - Additional options for state management
 * @returns Tuple of [value, setValue] similar to React's useState
 *
 * @example
 * ```tsx
 * const [count, setCount] = useFusionState('counter', 0);
 * const [user, setUser] = useFusionState(userKey, null);
 * ```
 */
export declare function useFusionState<T>(key: TypedKey<T>, initialValue?: T, options?: UseFusionStateOptions): [T, StateUpdater<T>];
export declare function useFusionState<T = unknown>(key: string, initialValue?: T, options?: UseFusionStateOptions): [T, StateUpdater<T>];
