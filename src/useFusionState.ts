import {useCallback, useEffect, useRef, useState} from 'react';
import {useGlobalState} from '@core/FusionStateProvider';
import {
  GlobalState,
  SetStateAction,
  StateUpdater,
  FusionStateErrorMessages,
  UseFusionStateOptions,
} from '@core/types';
import {formatErrorMessage} from '@core/utils';

/**
 * Custom hook to manage a piece of state within the global fusion state.
 *
 * @template T - The type of the state value.
 * @param {string} key - The key for the state value in the global state.
 * @param {T} [initialValue] - The initial value for the state if it is not already set.
 * @param {UseFusionStateOptions} [options] - Additional options for the hook.
 * @returns {[T, StateUpdater<T>]} - Returns the current state value and a function to update it.
 * @throws Will throw an error if the key is already being initialized or if the key does not exist and no initial value is provided.
 */
export function useFusionState<T>(
  key: string,
  initialValue?: T,
  options?: UseFusionStateOptions,
): [T, StateUpdater<T>] {
  const {state, setState, initializingKeys} = useGlobalState();
  const isInitialized = useRef<boolean>(false);
  const skipLocalState = options?.skipLocalState ?? false;
  // Keep a local reference to track initializing keys during the initialization process
  const initializing = useRef<Set<string>>(new Set());

  // Initialization logic for the state key
  const initializeState = useCallback(() => {
    if (!isInitialized.current) {
      if (initialValue !== undefined && !(key in state)) {
        if (initializingKeys.has(key)) {
          throw new Error(
            formatErrorMessage(
              FusionStateErrorMessages.KEY_ALREADY_INITIALIZING,
              key,
            ),
          );
        }

        // Use the local ref for tracking initialization
        initializing.current.add(key);
        setState(prev => ({...prev, [key]: initialValue}));
        initializing.current.delete(key);
        isInitialized.current = true;
      } else if (!(key in state)) {
        throw new Error(
          formatErrorMessage(
            FusionStateErrorMessages.KEY_MISSING_NO_INITIAL,
            key,
          ),
        );
      } else {
        isInitialized.current = true;
      }
    }
  }, [initialValue, key, state, setState, initializingKeys]);

  useEffect(() => {
    initializeState();
  }, [initializeState]);

  // Use local state only if not skipping it (performance optimization)
  const [localValue, setLocalValue] = useState<T>(() => state[key] as T);

  useEffect(() => {
    if (!skipLocalState) {
      const newValue = state[key] as T;
      if (newValue !== localValue) {
        setLocalValue(newValue);
      }
    }
  }, [state, key, localValue, skipLocalState]);

  // State update function with performance optimization
  const setValue = useCallback<StateUpdater<T>>(
    newValue => {
      setState(prevState => {
        const currentValue = prevState[key] as T;
        const nextValue =
          typeof newValue === 'function'
            ? (newValue as (prev: T) => T)(currentValue)
            : newValue;

        // Only update if the value has changed
        if (nextValue === currentValue) {
          return prevState;
        }

        return {...prevState, [key]: nextValue};
      });
    },
    [key, setState],
  );

  // Return either global state directly (if skipping local) or synchronized local state
  return [skipLocalState ? (state[key] as T) : localValue, setValue];
}
