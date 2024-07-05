import {useGlobalState, FusionGlobalState} from './FusionStateProvider';
import {useRef, useCallback, useEffect, useState} from 'react';

type SetValue<T> = React.Dispatch<React.SetStateAction<T>>;

export const useFusionState = <T>(
  key: string,
  initialValue?: T,
): [T, SetValue<T>] => {
  const {state, setState, initializingKeys} = useGlobalState();
  const hasInitialized = useRef(false);
  const initializing = useRef(false);

  const initializeKey = useCallback(() => {
    if (initialValue !== undefined && state[key] === undefined) {
      if (initializingKeys.has(key)) {
        const errorMessage = `ReactFusionState Warning : Key "${key}" already exists.`;
        if (process.env.NODE_ENV === 'development') {
          console.warn(errorMessage);
        } else {
          throw new Error(errorMessage);
        }
        return initialValue;
      } else {
        initializing.current = true;
        initializingKeys.add(key);
        setState((prevState: FusionGlobalState) => {
          const newState = {...prevState, [key]: initialValue};
          initializingKeys.delete(key);
          initializing.current = false;
          return newState;
        });
        hasInitialized.current = true;
        return initialValue;
      }
    }
    if (state[key] !== undefined) {
      hasInitialized.current = true;
      return state[key];
    }
    const errorMessage = `ReactFusionState Error: Key "${key}" does not exist and no initial value provided.`;
    if (process.env.NODE_ENV === 'development') {
      console.warn(errorMessage);
    } else {
      throw new Error(errorMessage);
    }
    return initialValue as T;
  }, [initialValue, state, key, initializingKeys, setState]);

  const [localValue, setLocalValue] = useState<T>(() =>
    state[key] !== undefined ? state[key] : initializeKey(),
  );

  useEffect(() => {
    if (!hasInitialized.current && state[key] === undefined) {
      const value = initializeKey();
      setLocalValue(value);
    }
    if (state[key] !== undefined) {
      setLocalValue(state[key]);
      hasInitialized.current = true;
    }
  }, [key, state, initializeKey]);

  const setValue: SetValue<T> = useCallback(
    newValue => {
      setState((prevState: FusionGlobalState) => {
        const updatedValue =
          typeof newValue === 'function'
            ? (newValue as (prevState: T) => T)(prevState[key])
            : newValue;
        return {...prevState, [key]: updatedValue};
      });
    },
    [key, setState],
  );

  return [localValue as T, setValue];
};
