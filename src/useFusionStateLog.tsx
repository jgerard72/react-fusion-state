import {useGlobalState} from './FusionStateProvider';
import {useEffect, useState, useRef, useMemo, useCallback} from 'react';
import isEqual from 'lodash.isequal';
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
   * but might miss deeply nested changes. 'deep' uses lodash.isEqual
   * for deep equality checks.
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

  // Filter state based on keys - optimized with deep comparison
  const filteredState = useMemo(() => {
    // If no keys, return all state
    if (!keys || keys.length === 0) {
      return state;
    }

    // Filter only requested keys
    const result: SelectedState = {};
    for (const key of keys) {
      if (key in state) {
        result[key] = state[key];
      }
    }
    return result;
  }, [state, keys?.join(',')]); // ✅ Stabiliser la dépendance keys

  const [selectedState, setSelectedState] =
    useState<SelectedState>(filteredState);

  // Track previous state for change detection
  const previousState = useRef<SelectedState>({});
  const previousKeys = useRef<StateKey[] | undefined>(undefined);

  // Default options
  const {
    trackChanges = false,
    changeDetection = 'reference',
    formatter = undefined,
    consoleLog = false,
  } = options;

  // Compare values based on selected change detection method
  const compareValues = useCallback(
    (a: unknown, b: unknown): boolean => {
      if (changeDetection === 'reference') {
        return a === b;
      } else if (changeDetection === 'deep') {
        return isEqual(a, b);
      } else {
        return simpleDeepEqual(a, b);
      }
    },
    [changeDetection],
  );

  useEffect(() => {
    // Calculate changes if requested
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
      // If no changes, no need to continue
      if (Object.keys(changes).length === 0) {
        changes = undefined;
      }
    }

    // Update selected state
    setSelectedState(filteredState);

    // Save for next comparison
    previousState.current = {...filteredState};

    // Log if enabled
    if (consoleLog && (changes || !trackChanges)) {
      const logData = formatter
        ? formatter(filteredState, changes)
        : {state: filteredState, ...(changes && {changes})};

      console.log('[FusionState Log]', logData);
    }
  }, [filteredState, trackChanges, consoleLog, formatter, compareValues]);

  return filteredState;
};
