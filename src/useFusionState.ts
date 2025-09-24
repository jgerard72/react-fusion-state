import {useCallback, useEffect, useRef, useSyncExternalStore} from 'react';
import {useGlobalState} from './FusionStateProvider';
import {
  GlobalState,
  SetStateAction,
  StateUpdater,
  FusionStateErrorMessages,
  UseFusionStateOptions,
} from './types';
import {formatErrorMessage, simpleDeepEqual, shallowEqual} from './utils';
import {detectBestStorageAdapter} from './storage/autoDetect';
import {StorageAdapter} from './storage/storageAdapters';
import {TypedKey, extractKeyName, isTypedKey} from './createKey';

/**
 * Custom hook to manage a piece of state within the global fusion state.
 * Supports both string keys (backward compatible) and typed keys (v0.4.0+)
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
  const {state, setState, initializingKeys, subscribeKey, getKeySnapshot} =
    useGlobalState();
  const {
    persist = false,
    adapter = detectBestStorageAdapter(options?.debug),
    keyPrefix = 'fusion_persistent',
    debounceTime = 300,
    debug = false,
    shallow = false,
  } = options || {};

  const storageKey = `${keyPrefix}_${key}`;
  const isInitialized = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveToStorage = useCallback(
    (value: T) => {
      if (!persist) return;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
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

  useEffect(() => {
    if (persist) return;

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
  }, [key, initialValue, persist, state, initializingKeys, setState]);

  const currentValue = useSyncExternalStore(
    listener => subscribeKey(key, listener),
    () => getKeySnapshot(key) as T,
    () => initialValue as T,
  ) as T;
  const setValue = useCallback<StateUpdater<T>>(
    newValue => {
      setState(prevState => {
        const currentValue = prevState[key] as T;
        const nextValue =
          typeof newValue === 'function'
            ? (newValue as (prev: T) => T)(currentValue)
            : newValue;

        if (nextValue === currentValue) {
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
        saveToStorage(nextValue);

        return {...prevState, [key]: nextValue};
      });
    },
    [key, setState, saveToStorage],
  );

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return [currentValue, setValue];
}
