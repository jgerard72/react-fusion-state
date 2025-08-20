import { StateUpdater, UseFusionStateOptions } from './types';
/**
 * Custom hook to manage a piece of state within the global fusion state.
 *
 * @template T - The type of the state value.
 * @param {string} key - The key for the state value in the global state.
 * @param {T} [initialValue] - The initial value for the state if it is not already set.
 * @param {UseFusionStateOptions} [options] - Optional configuration including persistence.
 * @returns {[T, StateUpdater<T>]} - Returns the current state value and a function to update it.
 * @throws Will throw an error if the key is already being initialized or if the key does not exist and no initial value is provided.
 */
export declare function useFusionState<T = unknown>(key: string, initialValue?: T, options?: UseFusionStateOptions): [T, StateUpdater<T>];
