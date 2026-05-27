import {GlobalState} from './types';
import {shallowEqual} from './utils';
import {useDefaultStore} from './store/defaultStore';

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
export const shallow = shallowEqual;

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
 * Since v1.4 the implementation delegates to the store-bound hook returned
 * by {@link createStore} for the nearest provider in the tree — identical
 * behaviour, just routed through the multi-store layer.
 *
 * @example
 * ```tsx
 * const total = useFusionStore((s) => (s.cart as Item[]).reduce((sum, x) => sum + x.price, 0));
 *
 * const { user, isAdmin } = useFusionStore(
 *   (s) => ({ user: s.user, isAdmin: s.user?.role === 'admin' }),
 *   shallow,
 * );
 * ```
 */
export function useFusionStore<T>(
  selector: (state: GlobalState) => T,
  equalityFn: (a: T, b: T) => boolean = Object.is,
): T {
  const store = useDefaultStore();
  // See note in src/useFusionState.ts about the rules-of-hooks disable —
  // `store.useFusionStore` is the canonical hook implementation closed over
  // the store, called here as a hook from another hook.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return store.useFusionStore<T>(selector, equalityFn);
}
