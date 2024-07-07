import {useGlobalState, GlobalState} from './FusionStateProvider';
import {useRef, useCallback, useEffect, useState} from 'react';

type SetValue<T> = React.Dispatch<React.SetStateAction<T>>;

export const useFusionState = <T>(
  key: string,
  initialValue?: T,
): [T, SetValue<T>] => {
  const {state, setState, initializingKeys} = useGlobalState();
  const isInitialized = useRef(false);

  if (!isInitialized.current) {
    if (initialValue !== undefined && state[key] === undefined) {
      if (initializingKeys.has(key) || state[key] !== undefined) {
        throw new Error(`ReactFusionState Error: Key "${key}" already exists.`);
      }
      initializingKeys.add(key);
      const newState = {...state, [key]: initialValue};
      state[key] = initialValue;
      initializingKeys.delete(key);
      setState(newState);
      isInitialized.current = true;
    } else if (state[key] === undefined) {
      throw new Error(
        `ReactFusionState Error: Key "${key}" does not exist and no initial value provided.`,
      );
    } else {
      isInitialized.current = true;
    }
  }

  const [localValue, setLocalValue] = useState<T>(() => {
    return state[key];
  });

  useEffect(() => {
    if (state[key] !== localValue) {
      setLocalValue(state[key]);
    }
  }, [state, key, localValue]);

  const setValue: SetValue<T> = useCallback(
    newValue => {
      setState((prevState: GlobalState) => {
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
