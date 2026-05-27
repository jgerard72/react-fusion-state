import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react';
import {
  FusionStateErrorMessages,
  GlobalState,
  StateUpdater,
  UseFusionStateOptions,
} from '../types';
import {formatErrorMessage, simpleDeepEqual, shallowEqual} from '../utils';
import {TypedKey, extractKeyName} from '../createKey';
import {DefaultStoreContext} from './defaultStore';
import type {StoreShell} from './createStore';

/**
 * Build the React-binding layer for a store. Returns a `Provider` component
 * plus the three public hooks (`useFusionState`, `useFusionStore`,
 * `useFusionHydrated`) closed over the supplied {@link StoreShell}.
 *
 * The hooks below are intentionally *not* a re-implementation of the
 * module-level hooks: they are the canonical implementation, and the
 * module-level hooks (kept for 1.3.x compatibility) are thin wrappers that
 * delegate to the bindings of the nearest store in the React tree.
 *
 * @internal — invoked exactly once per store, inside {@link createStore}.
 */
export function createReactBindings(store: StoreShell): {
  Provider: FC<{children: ReactNode}>;
  useFusionState: <T = unknown>(
    key: string | TypedKey<T>,
    initialValue?: T,
    options?: UseFusionStateOptions,
  ) => [T, StateUpdater<T>];
  useFusionStore: <T>(
    selector: (state: GlobalState) => T,
    equalityFn?: (a: T, b: T) => boolean,
  ) => T;
  useFusionHydrated: () => boolean;
} {
  // --------------------------------------------------------------------------
  // Provider
  // --------------------------------------------------------------------------

  /**
   * Inject this store into the React tree. Module-level hooks rendered as
   * descendants will resolve to this store; nested `<store.Provider>`s
   * override their parents (standard Context semantics).
   *
   * The provider itself is `React.memo`-wrapped because it never re-renders
   * for state changes — those go through `useSyncExternalStore` inside the
   * hooks. The only props it cares about are `children`, so an identity
   * check is sufficient.
   */
  const Provider: FC<{children: ReactNode}> = React.memo(({children}) => (
    <DefaultStoreContext.Provider value={store as never}>
      {children}
    </DefaultStoreContext.Provider>
  ));
  Provider.displayName = 'FusionStoreProvider';

  // --------------------------------------------------------------------------
  // useFusionState
  // --------------------------------------------------------------------------

  function useFusionState<T = unknown>(
    keyInput: string | TypedKey<T>,
    initialValue?: T,
    options?: UseFusionStateOptions,
  ): [T, StateUpdater<T>] {
    const key = extractKeyName(keyInput);
    const {shallow = false} = options || {};

    // Lazy init: register the initial value on first mount if the key is
    // missing. `initializingKeys` is shared across all hooks of this store
    // so concurrent first-renders of the same key throw a deterministic
    // error instead of silently racing.
    useEffect(() => {
      const current = store.getState();
      if (initialValue !== undefined && !(key in current)) {
        if (store.initializingKeys.has(key)) {
          throw new Error(
            formatErrorMessage(
              FusionStateErrorMessages.KEY_ALREADY_INITIALIZING,
              key,
            ),
          );
        }
        store.initializingKeys.add(key);
        try {
          store.setState(prev =>
            key in prev ? prev : {...prev, [key]: initialValue},
          );
        } finally {
          store.initializingKeys.delete(key);
        }
      } else if (!(key in current) && initialValue === undefined) {
        throw new Error(
          formatErrorMessage(
            FusionStateErrorMessages.KEY_MISSING_NO_INITIAL,
            key,
          ),
        );
      }
      // `initialValue` is captured at first call by design — changing it on
      // subsequent renders shouldn't reseed an already-initialised key.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    // Subscribe to per-key changes. The `subscribe` and snapshot getters
    // come straight from the headless store, so they're stable across
    // renders (no `useMemo` indirection needed).
    const subscribe = useCallback(
      (listener: () => void) => store.subscribeKey(key, listener),
      [key],
    );
    const getSnapshot = useCallback(() => store.getState()[key] as T, [key]);
    const getServerSnapshot = useCallback(() => initialValue as T, [
      initialValue,
    ]);

    const currentValue = useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot,
    );

    const setValue = useCallback<StateUpdater<T>>(
      newValue => {
        store.setState(prev => {
          const current = prev[key] as T;
          const next =
            typeof newValue === 'function'
              ? (newValue as (p: T) => T)(current)
              : newValue;

          if (Object.is(current, next)) return prev;
          if (
            typeof next === 'object' &&
            next !== null &&
            typeof current === 'object' &&
            current !== null
          ) {
            const isEqual = shallow
              ? shallowEqual(next, current)
              : simpleDeepEqual(next, current);
            if (isEqual) return prev;
          }
          return {...prev, [key]: next};
        });
      },
      [key, shallow],
    );

    return [currentValue, setValue];
  }

  // --------------------------------------------------------------------------
  // useFusionStore — cross-key selector (Zustand-style)
  // --------------------------------------------------------------------------

  function useFusionStore<T>(
    selector: (state: GlobalState) => T,
    equalityFn: (a: T, b: T) => boolean = Object.is,
  ): T {
    // Live refs let inline arrow selectors / equality fns work without
    // forcing a re-subscription each render — we always invoke the freshest
    // version inside `getSnapshot`.
    const selectorRef = useRef(selector);
    selectorRef.current = selector;
    const equalityFnRef = useRef(equalityFn);
    equalityFnRef.current = equalityFn;

    // Cache the last selected value so successive `getSnapshot` calls return
    // the same reference when the equality fn says the slice is unchanged.
    // Required by `useSyncExternalStore` to avoid an infinite-loop warning.
    const cacheRef = useRef<{value: T; hasValue: boolean}>({
      value: undefined as unknown as T,
      hasValue: false,
    });

    const getSnapshot = useCallback(() => {
      const next = selectorRef.current(store.getState());
      const cache = cacheRef.current;
      if (cache.hasValue && equalityFnRef.current(cache.value, next)) {
        return cache.value;
      }
      cache.value = next;
      cache.hasValue = true;
      return next;
    }, []);

    return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
  }

  // --------------------------------------------------------------------------
  // useFusionHydrated — bridges to the persistence engine's hydration state
  // --------------------------------------------------------------------------

  function useFusionHydrated(): boolean {
    return useSyncExternalStore(
      // The engine's `onHydratedChange` fires at most once (on the
      // false→true transition) and self-unsubscribes; the
      // `useSyncExternalStore` cleanup is idempotent against that.
      listener => store.persistenceEngine.onHydratedChange(listener),
      () => store.persistenceEngine.isHydrated,
      () => store.persistenceEngine.isHydrated,
    );
  }

  return {Provider, useFusionState, useFusionStore, useFusionHydrated};
}
