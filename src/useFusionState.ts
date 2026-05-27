import {StateUpdater, UseFusionStateOptions} from './types';
import {TypedKey} from './createKey';
import {useDefaultStore} from './store/defaultStore';

/**
 * Hook for global state management with automatic persistence and SSR support.
 *
 * Signature, semantics and error contracts are unchanged since v1.0. Since
 * v1.4 the implementation is a thin delegation to the store-bound hook
 * (`store.useFusionState`) returned by {@link createStore}, resolved through
 * the nearest `FusionStateProvider` / `store.Provider` in the React tree.
 *
 * @template T - The type of the state value
 * @param key - Unique string key for the state (or a `TypedKey<T>` from `createKey`)
 * @param initialValue - Initial value for the state
 * @param options - Additional options for state management
 * @returns Tuple of `[value, setValue]` similar to React's `useState`
 *
 * @example
 * ```tsx
 * const [count, setCount] = useFusionState('counter', 0);
 * const [user, setUser] = useFusionState('user', null);
 * ```
 */
export function useFusionState<T = unknown>(
  key: string,
  initialValue?: T,
  options?: UseFusionStateOptions,
): [T, StateUpdater<T>];
export function useFusionState<T>(
  key: TypedKey<T>,
  initialValue?: T,
  options?: UseFusionStateOptions,
): [T, StateUpdater<T>];
export function useFusionState<T = unknown>(
  keyInput: string | TypedKey<T>,
  initialValue?: T,
  options?: UseFusionStateOptions,
): [T, StateUpdater<T>] {
  const store = useDefaultStore();
  // `store.useFusionState` is the canonical implementation created in
  // `createReactBindings(store)` — a hook itself, called here as a hook from
  // another hook. The rules-of-hooks linter can't statically see that
  // `store.useFusionState` is a hook (dynamic property access), but the
  // call is always made unconditionally at the top level of `useFusionState`,
  // which satisfies the real React contract.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return store.useFusionState<T>(keyInput as never, initialValue, options);
}
