import {useGlobalState} from '@core/FusionStateProvider';
import {useEffect, useState, useRef, useMemo, useCallback} from 'react';
import isEqual from 'lodash.isequal';
import {simpleDeepEqual} from '@core/utils';

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
  const [selectedState, setSelectedState] = useState<SelectedState>({});

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

  // Filter state based on keys
  const filteredState = useMemo(() => {
    // If keys are the same as before, don't recalculate
    if (keys && isEqual(keys, previousKeys.current)) {
      return undefined; // Skip calculation, will handle in useEffect
    }

    // If no keys provided, use the entire state
    if (!keys || keys.length === 0) {
      return state;
    }

    // Otherwise, filter to include only the requested keys
    const result: SelectedState = {};
    keys.forEach(key => {
      if (key in state) {
        result[key] = state[key];
      }
    });

    previousKeys.current = keys;
    return result;
  }, [state, keys]);

  useEffect(() => {
    if (!filteredState) return; // Skip if no new filtered state

    // Calculate changes if needed
    let changes: SelectedState | undefined;

    if (trackChanges) {
      changes = {};
      Object.entries(filteredState).forEach(([key, value]) => {
        const prevValue = previousState.current[key];
        const hasChanged = !compareValues(value, prevValue);

        if (hasChanged) {
          changes![key] = {
            previous: prevValue,
            current: value,
          };
        }
      });

      // If no changes detected, don't update
      if (Object.keys(changes).length === 0) {
        changes = undefined;
      }
    }

    // Update selected state with filtered state
    setSelectedState(filteredState);

    // Save current state as previous for next comparison
    previousState.current = {...filteredState};

    // Log to console if enabled
    if (consoleLog && (changes || !trackChanges)) {
      const logData = formatter
        ? formatter(filteredState, changes)
        : {state: filteredState, ...(changes && {changes})};

      console.log('[FusionState Log]', logData);
    }
  }, [filteredState, trackChanges, consoleLog, formatter, compareValues]);

  return selectedState;
};
