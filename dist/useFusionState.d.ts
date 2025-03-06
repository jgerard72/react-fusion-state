type SetStateAction<T> = T | ((prevState: T) => T);
type StateUpdater<T> = (value: SetStateAction<T>) => void;
/**
 * Custom hook to manage a piece of state within the global state.
 *
 * @template T - The type of the state value.
 * @param {string} key - The key for the state value in the global state.
 * @param {T} [initialValue] - The initial value for the state if it is not already set.
 * @returns {[T, StateUpdater<T>]} - Returns the current state value and a function to update it.
 * @throws Will throw an error if the key is already being initialized or if the key does not exist and no initial value is provided.
 */
export declare function useFusionState<T>(key: string, initialValue?: T): [T, StateUpdater<T>];
export {};
