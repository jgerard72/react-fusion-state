import {useCallback, useEffect, useRef, useState} from 'react';
import {useGlobalState, GlobalState} from './FusionStateProvider';

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
export function useFusionState<T>(
  key: string,
  initialValue?: T,
): [T, StateUpdater<T>] {
  const {state, setState, initializingKeys} = useGlobalState();
  const isInitialized = useRef<boolean>(false);
  const initializing = useRef<Set<string>>(new Set());

  const initializeState = useCallback(() => {
    if (!isInitialized.current) {
      if (initialValue !== undefined && !(key in state)) {
        if (initializing.current.has(key)) {
          throw new Error(
            `ReactFusionState Error: Key "${key}" is already being initialized. Consider checking if the key is being initialized elsewhere or if there's a logic error.`,
          );
        }
        initializing.current.add(key);
        setState(prev => ({...prev, [key]: initialValue}));
        initializing.current.delete(key);
        isInitialized.current = true;
      } else if (!(key in state)) {
        throw new Error(
          `ReactFusionState Error: Key "${key}" does not exist and no initial value provided. Ensure the key is initialized with a value before use.`,
        );
      } else {
        isInitialized.current = true;
      }
    }
  }, [initialValue, key, state, setState]);

  useEffect(() => {
    initializeState();
  }, [initializeState]);

  const [localValue, setLocalValue] = useState<T>(() => state[key] as T);

  useEffect(() => {
    const newValue = state[key] as T;
    if (newValue !== localValue) {
      setLocalValue(newValue);
    }
  }, [state, key, localValue]);

  const setValue = useCallback<StateUpdater<T>>(
    newValue => {
      setState(prevState => ({
        ...prevState,
        [key]:
          typeof newValue === 'function'
            ? (newValue as (prev: T) => T)(prevState[key] as T)
            : newValue,
      }));
    },
    [key, setState],
  );

  return [localValue, setValue];
}
