import {useCallback, useEffect, useRef, useState} from 'react';
import {useGlobalState} from './FusionStateProvider';
import {
  GlobalState,
  SetStateAction,
  StateUpdater,
  FusionStateErrorMessages,
  UseFusionStateOptions,
} from './types';
import {formatErrorMessage, simpleDeepEqual} from './utils';

/**
 * Custom hook to manage a piece of state within the global fusion state.
 *
 * @template T - The type of the state value.
 * @param {string} key - The key for the state value in the global state.
 * @param {T} [initialValue] - The initial value for the state if it is not already set.
 * @returns {[T, StateUpdater<T>]} - Returns the current state value and a function to update it.
 * @throws Will throw an error if the key is already being initialized or if the key does not exist and no initial value is provided.
 */
export function useFusionState<T = unknown>(
  key: string,
  initialValue?: T,
): [T, StateUpdater<T>] {
  const {state, setState, initializingKeys} = useGlobalState();

  // ✅ Optimized initialization with race condition handling
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

      // Mark as initializing
      initializingKeys.add(key);

      setState(prev => {
        // Double-check to avoid race conditions
        if (key in prev) {
          initializingKeys.delete(key);
          return prev;
        }

        const newState = {...prev, [key]: initialValue};
        initializingKeys.delete(key);
        return newState;
      });
    } else if (!(key in state) && initialValue === undefined) {
      throw new Error(
        formatErrorMessage(
          FusionStateErrorMessages.KEY_MISSING_NO_INITIAL,
          key,
        ),
      );
    }
  }, [key, initialValue]); // ✅ Reduce dependencies to avoid loops

  // ✅ SIMPLE: Current state value
  const currentValue = state[key] as T;

  // ✅ AUTOMATIC OPTIMIZATION: setValue with intelligent comparison
  const setValue = useCallback<StateUpdater<T>>(
    newValue => {
      setState(prevState => {
        const currentValue = prevState[key] as T;
        const nextValue =
          typeof newValue === 'function'
            ? (newValue as (prev: T) => T)(currentValue)
            : newValue;

        // ✅ OPTIMIZATION: Automatic intelligent comparison
        // - Reference first (faster)
        // - Deep equality for objects if needed
        if (nextValue === currentValue) {
          return prevState; // Same reference = no change
        }

        // If it's an object, check content
        if (
          typeof nextValue === 'object' &&
          nextValue !== null &&
          typeof currentValue === 'object' &&
          currentValue !== null
        ) {
          if (simpleDeepEqual(nextValue, currentValue)) {
            return prevState; // Same content = no change
          }
        }

        return {...prevState, [key]: nextValue};
      });
    },
    [key, setState],
  );

  // ✅ SIMPLE: Return current value and setter
  return [currentValue, setValue];
}
