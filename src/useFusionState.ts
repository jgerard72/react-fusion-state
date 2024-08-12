import {useGlobalState, GlobalState} from './FusionStateProvider';
import {useRef, useEffect, useState, useCallback} from 'react';

type SetValue<T> = React.Dispatch<React.SetStateAction<T>>;

export const useFusionState = <T>(
  key: string,
  initialValue?: T,
): [T, SetValue<T>] => {
  const {state, setState, initializingKeys} = useGlobalState();
  const isInitialized = useRef(false);

  if (
    !isInitialized.current &&
    initialValue !== undefined &&
    state[key] === undefined
  ) {
    if (initializingKeys.has(key)) {
      throw new Error(`ReactFusionState Error: Key "${key}" already exists.`);
    }
    initializingKeys.add(key);
    state[key] = initialValue;
    setState(prevState => ({...prevState, [key]: initialValue}));
    initializingKeys.delete(key);
    isInitialized.current = true;
  }

  if (!isInitialized.current && state[key] === undefined) {
    throw new Error(
      `ReactFusionState Error: Key "${key}" does not exist and no initial value provided.`,
    );
  }

  const [localValue, setLocalValue] = useState<T>(() => state[key]);

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
