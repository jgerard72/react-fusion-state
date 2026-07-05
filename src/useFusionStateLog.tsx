import {useGlobalState} from '@core/FusionStateProvider';
import {FusionStateErrorMessages} from '@core/types';
import {useEffect, useRef, useMemo, useCallback} from 'react';
import isEqual from 'lodash.isequal';
import {simpleDeepEqual} from '@core/utils';

/** State key identifier used by {@link useFusionStateLog}. */
export type FusionStateLogKey = string;

/**
 * Snapshot of global state returned by {@link useFusionStateLog}.
 * When `keys` are provided, only those entries are included.
 */
export type FusionStateLogSnapshot = Record<string, unknown>;

/**
 * Options for {@link useFusionStateLog}.
 *
 * @example
 * ```tsx
 * const slice = useFusionStateLog(['counter', 'user'], {
 *   trackChanges: true,
 *   consoleLog: true,
 *   changeDetection: 'simple',
 * });
 * ```
 */
export interface FusionStateLogOptions {
  /**
   * Compute a `changes` object (previous vs current) for console output.
   * Does not change the returned snapshot shape.
   */
  trackChanges?: boolean;

  /**
   * Equality strategy when `trackChanges` is enabled.
   * - `'reference'` — fast `===` check (default)
   * - `'deep'` — `lodash.isequal`
   * - `'simple'` — {@link simpleDeepEqual} (JSON-based)
   */
  changeDetection?: 'reference' | 'deep' | 'simple';

  /** Transform the payload written to `console.log` when `consoleLog` is true. */
  formatter?: (
    state: FusionStateLogSnapshot,
    changes?: FusionStateLogSnapshot,
  ) => unknown;

  /** Mirror the selected snapshot (and optional changes) to `console.log`. */
  consoleLog?: boolean;
}

/**
 * Observe a slice of global state for debugging.
 *
 * @param keys - Keys to include. When omitted, the full global state is returned.
 * @param options - Change tracking and console logging options
 * @returns A snapshot of the selected keys from global state
 * @throws {@link FusionStateErrorMessages.PROVIDER_MISSING} when used outside a provider (via {@link useGlobalState})
 *
 * @example
 * ```tsx
 * function StateInspector() {
 *   const state = useFusionStateLog();
 *   return <pre>{JSON.stringify(state, null, 2)}</pre>;
 * }
 * ```
 */
export const useFusionStateLog = (
  keys?: FusionStateLogKey[],
  options: FusionStateLogOptions = {},
): FusionStateLogSnapshot => {
  const {state} = useGlobalState();

  // Track previous state for change detection
  const previousState = useRef<FusionStateLogSnapshot>({});

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
    // If no keys provided, use the entire state
    if (!keys || keys.length === 0) {
      return state;
    }

    // Otherwise, filter to include only the requested keys
    const result: FusionStateLogSnapshot = {};
    keys.forEach(key => {
      if (key in state) {
        result[key] = state[key];
      }
    });

    return result;
  }, [state, keys]);

  useEffect(() => {
    // Calculate changes if needed
    let changes: FusionStateLogSnapshot | undefined;

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

  return filteredState;
};
