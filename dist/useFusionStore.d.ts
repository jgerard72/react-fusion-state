import { GlobalState } from './types';
/**
 * Re-exported `shallowEqual` under the `shallow` name, matching the Zustand
 * convention. Use as the second argument to {@link useFusionStore} when
 * selecting object/array slices that are recreated each call but should
 * compare equal at one level of depth.
 *
 * @example
 * ```tsx
 * const { user, isAdmin } = useFusionStore(
 *   (s) => ({ user: s.user, isAdmin: s.user?.role === 'admin' }),
 *   shallow,
 * );
 * ```
 */
export declare const shallow: (a: unknown, b: unknown) => boolean;
/**
 * Subscribe to a derived slice of the global state.
 *
 * `useFusionStore` is the cross-key selector hook: pass a `selector` function
 * that maps the full state to any derived value (computed totals, filtered
 * lists, joined fields, etc.) and the component will only re-render when
 * the *selected* value changes — never when unrelated keys change.
 *
 * The default equality is `Object.is`. For object/array selectors that
 * recreate a new reference on each call, pass {@link shallow} (or your own
 * equality function) as the second argument.
 *
 * Throws when used outside of a `FusionStateProvider` (same contract as
 * `useFusionState`).
 *
 * @example
 * ```tsx
 * // Derived value — re-renders only when the total changes
 * const total = useFusionStore((s) => (s.cart as Item[]).reduce((sum, x) => sum + x.price, 0));
 *
 * // Multi-key selector with shallow equality
 * const { user, isAdmin } = useFusionStore(
 *   (s) => ({ user: s.user, isAdmin: s.user?.role === 'admin' }),
 *   shallow,
 * );
 * ```
 *
 * @param selector - Pure function mapping `GlobalState` to the value you want.
 * @param equalityFn - Optional equality check to decide whether the selected
 *   value has changed. Defaults to `Object.is`.
 * @returns The selected value, stable across re-renders if `equalityFn` says equal.
 */
export declare function useFusionStore<T>(selector: (state: GlobalState) => T, equalityFn?: (a: T, b: T) => boolean): T;
