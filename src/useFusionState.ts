import {useCallback, useEffect, useRef, useSyncExternalStore} from 'react';
import {useGlobalState} from './FusionStateProvider';
import {
  SetStateAction,
  StateUpdater,
  FusionStateErrorMessages,
  UseFusionStateOptions,
} from './types';
import {formatErrorMessage, simpleDeepEqual, shallowEqual} from './utils';
import {TypedKey, extractKeyName} from './createKey';

/**
 * Hook for global state management with automatic persistence and SSR support
 *
 * @template T - The type of the state value
 * @param key - Unique key for the state (string or TypedKey)
 * @param initialValue - Initial value for the state
 * @param options - Additional options for state management
 * @returns Tuple of [value, setValue] similar to React's useState
 *
 * @example
 * ```tsx
 * const [count, setCount] = useFusionState('counter', 0);
 * const [user, setUser] = useFusionState(userKey, null);
 * ```
 */
export function useFusionState<T>(
  key: TypedKey<T>,
  initialValue?: T,
  options?: UseFusionStateOptions,
): [T, StateUpdater<T>];

export function useFusionState<T = unknown>(
  key: string,
  initialValue?: T,
  options?: UseFusionStateOptions,
): [T, StateUpdater<T>];
export function useFusionState<T = unknown>(
  keyInput: string | TypedKey<T>,
  initialValue?: T,
  options?: UseFusionStateOptions,
): [T, StateUpdater<T>] {
  const key = extractKeyName(keyInput);
  const {
    state,
    setState,
    initializingKeys,
    subscribeKey,
    getKeySnapshot,
    getServerSnapshot,
  } = useGlobalState();
  const {shallow = false} = options || {};

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

      initializingKeys.add(key);
      setState(prev => {
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
  }, [key, initialValue, state, initializingKeys, setState]);

  const currentValue = useSyncExternalStore(
    listener => subscribeKey(key, listener),
    () => getKeySnapshot(key) as T,
    getServerSnapshot
      ? () => getServerSnapshot(key) as T
      : () => initialValue as T,
  ) as T;
  const setValue = useCallback<StateUpdater<T>>(
    newValue => {
      setState(prevState => {
        const currentValue = prevState[key] as T;
        const nextValue =
          typeof newValue === 'function'
            ? (newValue as (prev: T) => T)(currentValue)
            : newValue;

        if (Object.is(currentValue, nextValue)) {
          return prevState;
        }
        if (
          typeof nextValue === 'object' &&
          nextValue !== null &&
          typeof currentValue === 'object' &&
          currentValue !== null
        ) {
          const isEqual = shallow
            ? shallowEqual(nextValue, currentValue)
            : simpleDeepEqual(nextValue, currentValue);
          if (isEqual) {
            return prevState;
          }
        }

        return {...prevState, [key]: nextValue};
      });
    },
    [key, setState, shallow],
  );

  return [currentValue, setValue];
}
