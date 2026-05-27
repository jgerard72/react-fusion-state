"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFusionStore = exports.shallow = void 0;
const react_1 = require("react");
const FusionStateProvider_1 = require("./FusionStateProvider");
const utils_1 = require("./utils");
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
exports.shallow = utils_1.shallowEqual;
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
function useFusionStore(selector, equalityFn = Object.is) {
    // Reads the STATIC context — consumers of useFusionStore do NOT re-render
    // when the regular state context updates. All re-renders are driven by
    // `useSyncExternalStore` below, gated by `equalityFn`.
    const { subscribeAll, getStateSnapshot } = (0, FusionStateProvider_1.useFusionStaticAPI)();
    // Live refs so getSnapshot reads the latest selector/equalityFn without
    // forcing a re-subscription each time the user passes inline arrows.
    const selectorRef = (0, react_1.useRef)(selector);
    selectorRef.current = selector;
    const equalityFnRef = (0, react_1.useRef)(equalityFn);
    equalityFnRef.current = equalityFn;
    // Cache the last selected value so `useSyncExternalStore` receives a stable
    // reference across calls. React calls getSnapshot multiple times per render
    // (and across renders) and requires successive calls to return the SAME
    // reference when nothing has actually changed — otherwise we'd trigger an
    // "infinite loop" warning.
    const cacheRef = (0, react_1.useRef)({
        value: undefined,
        hasValue: false,
    });
    const getSnapshot = (0, react_1.useCallback)(() => {
        const next = selectorRef.current(getStateSnapshot());
        const cache = cacheRef.current;
        if (cache.hasValue && equalityFnRef.current(cache.value, next)) {
            return cache.value;
        }
        cache.value = next;
        cache.hasValue = true;
        return next;
    }, [getStateSnapshot]);
    return (0, react_1.useSyncExternalStore)(subscribeAll, getSnapshot, getSnapshot);
}
exports.useFusionStore = useFusionStore;
//# sourceMappingURL=useFusionStore.js.map