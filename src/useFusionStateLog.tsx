import {useGlobalState} from './FusionStateProvider';
import {useEffect, useRef, useMemo, useCallback} from 'react';
import {simpleDeepEqual} from './utils';

type StateKey = string;
type SelectedState = Record<string, unknown>;

/**
 * Options for the useFusionStateLog hook
 */
interface FusionStateLogOptions {
  /**
   * Whether to calculate and include differences between
   * current and previous state in the returned object
   */
  trackChanges?: boolean;

  /**
   * How to track changes. Default is 'reference' which is faster
   * but might miss deeply nested changes. 'deep' and 'simple' are
   * equivalent and use a custom deep equality check.
   */
  changeDetection?: 'reference' | 'deep' | 'simple';

  /**
   * Custom formatter function for console logging
   */
  formatter?: (state: SelectedState, changes?: SelectedState) => unknown;

  /**
   * Whether to automatically log to console
   */
  consoleLog?: boolean;
}

/**
 * Hook to observe and track changes in the global fusion state
 *
 * @param keys - Optional array of keys to watch (if undefined, watches all keys)
 * @param options - Additional configuration options
 * @returns The selected state from the global state
 */
export const useFusionStateLog = (
  keys?: StateKey[],
  options: FusionStateLogOptions = {},
): SelectedState => {
  const {state} = useGlobalState();

  // Stable hash for the keys array so identical key lists across renders
  // don't bust the memo (caller doesn't have to memoize the array).
  const keysHash = useMemo(() => {
    if (!keys || keys.length === 0) return '';
    return `${keys.length}:${keys.join('\u0001')}`;
  }, [keys]);

  // Filter state based on keys
  const filteredState = useMemo(() => {
    if (!keys || keys.length === 0) {
      return state;
    }

    const result: SelectedState = {};
    for (const key of keys) {
      if (key in state) {
        result[key] = state[key];
      }
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, keysHash]);

  // Track previous state for change detection
  const previousState = useRef<SelectedState>({});

  // Default options
  const {
    trackChanges = false,
    changeDetection = 'reference',
    formatter = undefined,
    consoleLog = false,
  } = options;

  // 'deep' and 'simple' are equivalent (simpleDeepEqual is an alias of customIsEqual).
  // Both go through the same path; 'reference' uses === for speed.
  const compareValues = useCallback(
    (a: unknown, b: unknown): boolean => {
      return changeDetection === 'reference' ? a === b : simpleDeepEqual(a, b);
    },
    [changeDetection],
  );

  useEffect(() => {
    let changes: SelectedState | undefined;

    if (trackChanges) {
      changes = {};
      for (const [key, value] of Object.entries(filteredState)) {
        const prevValue = previousState.current[key];
        if (!compareValues(value, prevValue)) {
          changes[key] = {
            previous: prevValue,
            current: value,
          };
        }
      }
      if (Object.keys(changes).length === 0) {
        changes = undefined;
      }
    }

    previousState.current = {...filteredState};

    if (consoleLog && (changes || !trackChanges)) {
      const logData = formatter
        ? formatter(filteredState, changes)
        : {state: filteredState, ...(changes && {changes})};

      console.log('[FusionState Log]', logData);
    }
  }, [filteredState, trackChanges, consoleLog, formatter, compareValues]);

  return filteredState;
};
