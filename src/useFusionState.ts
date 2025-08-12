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
export function useFusionState<T = unknown>(
  key: string,
  initialValue?: T,
  options?: UseFusionStateOptions,
): [T, StateUpdater<T>] {
  const {state, setState, initializingKeys} = useGlobalState();
  const skipLocalState = options?.skipLocalState ?? false;

  // Simplified initialization
  useEffect(() => {
    if (initialValue !== undefined && !(key in state)) {
      if (initializingKeys.has(key)) {
        throw new Error(
          formatErrorMessage(
            FusionStateErrorMessages.KEY_ALREADY_INITIALIZING,
            key,
          ),
        );
      }
      setState(prev => ({...prev, [key]: initialValue}));
    } else if (!(key in state) && initialValue === undefined) {
      throw new Error(
        formatErrorMessage(
          FusionStateErrorMessages.KEY_MISSING_NO_INITIAL,
          key,
        ),
      );
    }
  }, [key, initialValue, state, setState, initializingKeys]);

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
