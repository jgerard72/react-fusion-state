import {useGlobalState, GlobalState} from './FusionStateProvider';
import {useRef, useCallback, useEffect, useState, useMemo} from 'react';

type SetValue<T> = React.Dispatch<React.SetStateAction<T>>;

export const useFusionState = <T>(
  key: string,
  initialValue?: T,
): [T, SetValue<T>] => {
  const {state, setState, initializingKeys} = useGlobalState();
  const isInitialized = useRef(false);

  const localValue = useMemo(() => {
    if (state[key] !== undefined) {
      return state[key];
    } else if (initialValue !== undefined) {
      return initialValue;
    } else {
      return undefined;
    }
  }, [key, state, initialValue]);

  useEffect(() => {
    if (!isInitialized.current) {
      if (initialValue !== undefined) {
        if (initializingKeys.has(key) || state[key] !== undefined) {
          throw new Error(
            `ReactFusionState Error : Key "${key}" already exists.`,
          );
        }
        initializingKeys.add(key);
        setState((prevState: GlobalState) => {
          const newState = {...prevState, [key]: initialValue};
          initializingKeys.delete(key);
          return newState;
        });
      } else if (state[key] === undefined) {
        throw new Error(
          `ReactFusionState Error : Key "${key}" does not exist and no initial value provided.`,
        );
      }
      isInitialized.current = true;
    }
  }, [key, state, initialValue, setState, initializingKeys]);

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
