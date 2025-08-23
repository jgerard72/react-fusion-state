import {useCallback, useEffect, useRef, useSyncExternalStore} from 'react';
import {useGlobalState} from './FusionStateProvider';
import {
  GlobalState,
  SetStateAction,
  StateUpdater,
  FusionStateErrorMessages,
  UseFusionStateOptions,
} from './types';
import {formatErrorMessage, simpleDeepEqual} from './utils';
import {detectBestStorageAdapter} from './storage/autoDetect';
import {StorageAdapter} from './storage/storageAdapters';

/**
 * Custom hook to manage a piece of state within the global fusion state.
 *
 * @template T - The type of the state value.
 * @param {string} key - The key for the state value in the global state.
 * @param {T} [initialValue] - The initial value for the state if it is not already set.
 * @param {UseFusionStateOptions} [options] - Optional configuration including persistence.
 * @returns {[T, StateUpdater<T>]} - Returns the current state value and a function to update it.
 * @throws Will throw an error if the key is already being initialized or if the key does not exist and no initial value is provided.
 */
export function useFusionState<T = unknown>(
  key: string,
  initialValue?: T,
  options?: UseFusionStateOptions,
): [T, StateUpdater<T>] {
  const {state, setState, initializingKeys, subscribeKey, getKeySnapshot} =
    useGlobalState();

  // ✅ Persistence configuration
  const {
    persist = false,
    adapter = detectBestStorageAdapter(options?.debug),
    keyPrefix = 'fusion_persistent',
    debounceTime = 300,
    debug = false,
  } = options || {};

  const storageKey = `${keyPrefix}_${key}`;
  const isInitialized = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Save to storage function with debounce (only if persist is enabled)
  const saveToStorage = useCallback(
    (value: T) => {
      if (!persist) return;

      // Clear previous timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await adapter.setItem(storageKey, JSON.stringify(value));

          if (debug) {
            console.log(`[FusionState] Persisted ${key}:`, value);
          }
        } catch (error) {
          if (debug) {
            console.error(`[FusionState] Failed to persist ${key}:`, error);
          }
        }
      }, debounceTime);
    },
    [persist, adapter, storageKey, key, debounceTime, debug],
  );

  // ✅ Load from storage on initialization (only if persist is enabled)
  useEffect(() => {
    if (!persist || isInitialized.current) return;
    isInitialized.current = true;

    const loadFromStorage = async () => {
      try {
        const storedValue = await adapter.getItem(storageKey);
        if (storedValue !== null) {
          const parsedValue = JSON.parse(storedValue) as T;

          if (debug) {
            console.log(`[FusionState] Loaded ${key}:`, parsedValue);
          }

          // Initialize state with stored value
          setState(prev => ({
            ...prev,
            [key]: parsedValue,
          }));
          return;
        }
      } catch (error) {
        if (debug) {
          console.warn(`[FusionState] Failed to load ${key}:`, error);
        }
      }

      // Initialize with default value if no stored value or no persistence
      initializeWithDefault();
    };

    const initializeWithDefault = () => {
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
    };

    if (persist) {
      loadFromStorage();
    } else {
      initializeWithDefault();
    }
  }, [
    key,
    initialValue,
    persist,
    adapter,
    storageKey,
    debug,
    setState,
    state,
    initializingKeys,
  ]);

  // ✅ Fallback initialization for non-persistent state
  useEffect(() => {
    if (persist) return; // Skip if persistence is handling initialization

    if (initialValue !== undefined && !(key in state)) {
      if (initializingKeys.has(key)) {
        throw new Error(
          formatErrorMessage(
            FusionStateErrorMessages.KEY_ALREADY_INITIALIZING,
            key,
          ),
        );
      }

      // Mark as initializing
      initializingKeys.add(key);

      setState(prev => {
        // Double-check to avoid race conditions
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
  }, [key, initialValue, persist, state, initializingKeys, setState]);

  // ✅ useSyncExternalStore to subscribe only to this key
  const currentValue = useSyncExternalStore(
    listener => subscribeKey(key, listener),
    () => getKeySnapshot(key) as T,
    () => undefined as unknown as T,
  ) as T;

  // ✅ AUTOMATIC OPTIMIZATION: setValue with intelligent comparison
  const setValue = useCallback<StateUpdater<T>>(
    newValue => {
      setState(prevState => {
        const currentValue = prevState[key] as T;
        const nextValue =
          typeof newValue === 'function'
            ? (newValue as (prev: T) => T)(currentValue)
            : newValue;

        // ✅ OPTIMIZATION: Automatic intelligent comparison
        // - Reference first (faster)
        // - Deep equality for objects if needed
        if (nextValue === currentValue) {
          return prevState; // Same reference = no change
        }

        // If it's an object, check content
        if (
          typeof nextValue === 'object' &&
          nextValue !== null &&
          typeof currentValue === 'object' &&
          currentValue !== null
        ) {
          if (simpleDeepEqual(nextValue, currentValue)) {
            return prevState; // Same content = no change
          }
        }

        // ✅ Save to storage if persistence is enabled
        saveToStorage(nextValue);

        return {...prevState, [key]: nextValue};
      });
    },
    [key, setState, saveToStorage],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // ✅ SIMPLE: Return current value and setter
  return [currentValue, setValue];
}
