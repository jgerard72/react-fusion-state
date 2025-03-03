import { useCallback, useEffect, useRef, useState } from 'react';
import { useGlobalState, GlobalState } from './FusionStateProvider';

type SetStateAction<T> = T | ((prevState: T) => T);
type StateUpdater<T> = (value: SetStateAction<T>) => void;

export function useFusionState<T>(
  key: string,
  initialValue?: T
): [T, StateUpdater<T>] {
  const { state, setState, initializingKeys } = useGlobalState();
  const isInitialized = useRef<boolean>(false);
  const initializing = useRef<Set<string>>(new Set());

  const initializeState = useCallback(() => {
    if (!isInitialized.current) {
      if (initialValue !== undefined && !(key in state)) {
        if (initializing.current.has(key)) {
          throw new Error(`ReactFusionState Error: Key "${key}" is already being initialized`);
        }
        initializing.current.add(key);
        setState((prev) => ({ ...prev, [key]: initialValue }));
        initializing.current.delete(key);
        isInitialized.current = true;
      } else if (!(key in state)) {
        throw new Error(`ReactFusionState Error: Key "${key}" does not exist and no initial value provided`);
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

  const setValue = useCallback<StateUpdater<T>>((newValue) => {
    setState((prevState) => ({
      ...prevState,
      [key]: typeof newValue === 'function'
        ? (newValue as (prev: T) => T)(prevState[key] as T)
        : newValue
    }));
  }, [key, setState]);

  return [localValue, setValue];
}