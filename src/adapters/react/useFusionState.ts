import { useCallback, useEffect, useState } from 'react';
import { StateUpdater, SetStateAction } from '../../core';
import { useFusionStateManager } from './FusionStateProvider';
import { ReactUseFusionStateOptions } from './types';

/**
 * React hook to manage a piece of state within the global fusion state.
 * 
 * This is the new implementation that uses the framework-agnostic core manager.
 * It maintains the same API as the original hook for full backward compatibility.
 *
 * @template T - The type of the state value.
 * @param {string} key - The key for the state value in the global state.
 * @param {T} [initialValue] - The initial value for the state if it is not already set.
 * @param {ReactUseFusionStateOptions} [options] - Additional options for the hook.
 * @returns {[T, StateUpdater<T>]} - Returns the current state value and a function to update it.
 * @throws Will throw an error if the key is already being initialized or if the key does not exist and no initial value is provided.
 */
export function useFusionState<T = unknown>(
  key: string,
  initialValue?: T,
  options?: ReactUseFusionStateOptions,
): [T, StateUpdater<T>] {
  const manager = useFusionStateManager();
  const skipLocalState = options?.skipLocalState ?? false;

  // Initialize the key in the core manager if needed
  useEffect(() => {
    if (initialValue !== undefined && !manager.hasKey(key)) {
      manager.initializeKey(key, initialValue);
    } else if (!manager.hasKey(key) && initialValue === undefined) {
      manager.initializeKey(key, undefined); // This will throw the appropriate error
    }
  }, [manager, key, initialValue]);

  // Local state for React re-rendering (unless skipped for performance)
  const [localValue, setLocalValue] = useState<T>(() => 
    manager.getState<T>(key) ?? (initialValue as T)
  );

  // Subscribe to changes from the core manager
  useEffect(() => {
    if (skipLocalState) {
      return; // No need to sync local state if we're skipping it
    }

    const unsubscribe = manager.subscribe<T>(key, (newValue) => {
      setLocalValue(newValue as T);
    });

    // Sync initial value
    const currentValue = manager.getState<T>(key);
    if (currentValue !== localValue) {
      setLocalValue(currentValue as T);
    }

    return unsubscribe;
  }, [manager, key, skipLocalState, localValue]);

  // State updater function that updates the core manager
  const setValue = useCallback<StateUpdater<T>>(
    (newValue: SetStateAction<T>) => {
      manager.setState<T>(key, newValue);
    },
    [manager, key]
  );

  // Return either the core manager value directly (if skipping local state) or the synced local value
  const currentValue = skipLocalState 
    ? (manager.getState<T>(key) ?? (initialValue as T))
    : localValue;

  return [currentValue, setValue];
}

/**
 * Convenient aliases for common use cases
 */
export const useSharedState = useFusionState;
export const usePersistentState = useFusionState;
export const useAppState = useFusionState;
