import {useCallback, useEffect, useRef, useState} from 'react';
import {useGlobalState} from '@core/FusionStateProvider';
import {
  StateUpdater,
  FusionStateErrorMessages,
  UseFusionStateOptions,
} from '@core/types';
import {formatErrorMessage} from '@core/utils';

/**
 * Subscribe to a single global state key. API mirrors React's `useState`, but
 * the value is shared across all components under the same
 * {@link FusionStateProvider}.
 *
 * @template T - Type of the value stored at `key`
 * @param key - Unique string identifier for this slice of global state
 * @param initialValue - Seeded on first mount when `key` is not already in global state
 * @param options - Optional performance tuning (see {@link UseFusionStateOptions})
 * @returns Tuple `[value, setValue]` — same ergonomics as `useState`
 * @throws {@link FusionStateErrorMessages.KEY_ALREADY_INITIALIZING} when two components race to initialize the same key
 * @throws {@link FusionStateErrorMessages.KEY_MISSING_NO_INITIAL} when the key is missing and no `initialValue` was provided
 *
 * @example
 * ```tsx
 * function Counter() {
 *   const [count, setCount] = useFusionState('counter', 0);
 *   return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * interface User { name: string; email: string }
 * const [user, setUser] = useFusionState<User>('user', { name: '', email: '' });
 * ```
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

  // Use local state only if not skipping it (performance optimization).
  // Fall back to initialValue on first render when the key is not yet in global state
  // (global seeding runs in useEffect).
  const [localValue, setLocalValue] = useState<T>(
    () => (key in state ? state[key] : initialValue) as T,
  );

  useEffect(() => {
    if (!skipLocalState && key in state) {
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
