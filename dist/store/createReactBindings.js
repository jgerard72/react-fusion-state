"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReactBindings = createReactBindings;
const react_1 = __importStar(require("react"));
const types_1 = require("../types");
const utils_1 = require("../utils");
const createKey_1 = require("../createKey");
const defaultStore_1 = require("./defaultStore");
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
function createReactBindings(store) {
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
    const Provider = react_1.default.memo(({ children }) => (react_1.default.createElement(defaultStore_1.DefaultStoreContext.Provider, { value: store }, children)));
    Provider.displayName = 'FusionStoreProvider';
    // --------------------------------------------------------------------------
    // useFusionState
    // --------------------------------------------------------------------------
    function useFusionState(keyInput, initialValue, options) {
        const key = (0, createKey_1.extractKeyName)(keyInput);
        const { shallow = false } = options || {};
        // Lazy init: register the initial value on first mount if the key is
        // missing. `initializingKeys` is shared across all hooks of this store
        // so concurrent first-renders of the same key throw a deterministic
        // error instead of silently racing.
        (0, react_1.useEffect)(() => {
            const current = store.getState();
            if (initialValue !== undefined && !(key in current)) {
                if (store.initializingKeys.has(key)) {
                    throw new Error((0, utils_1.formatErrorMessage)(types_1.FusionStateErrorMessages.KEY_ALREADY_INITIALIZING, key));
                }
                store.initializingKeys.add(key);
                try {
                    store.setState(prev => key in prev ? prev : Object.assign(Object.assign({}, prev), { [key]: initialValue }));
                }
                finally {
                    store.initializingKeys.delete(key);
                }
            }
            else if (!(key in current) && initialValue === undefined) {
                throw new Error((0, utils_1.formatErrorMessage)(types_1.FusionStateErrorMessages.KEY_MISSING_NO_INITIAL, key));
            }
            // `initialValue` is captured at first call by design — changing it on
            // subsequent renders shouldn't reseed an already-initialised key.
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [key]);
        // Subscribe to per-key changes. The `subscribe` and snapshot getters
        // come straight from the headless store, so they're stable across
        // renders (no `useMemo` indirection needed).
        const subscribe = (0, react_1.useCallback)((listener) => store.subscribeKey(key, listener), [key]);
        const getSnapshot = (0, react_1.useCallback)(() => store.getState()[key], [key]);
        const getServerSnapshot = (0, react_1.useCallback)(() => initialValue, [
            initialValue,
        ]);
        const currentValue = (0, react_1.useSyncExternalStore)(subscribe, getSnapshot, getServerSnapshot);
        const setValue = (0, react_1.useCallback)(newValue => {
            store.setState(prev => {
                const current = prev[key];
                const next = typeof newValue === 'function'
                    ? newValue(current)
                    : newValue;
                if (Object.is(current, next))
                    return prev;
                if (typeof next === 'object' &&
                    next !== null &&
                    typeof current === 'object' &&
                    current !== null) {
                    const isEqual = shallow
                        ? (0, utils_1.shallowEqual)(next, current)
                        : (0, utils_1.simpleDeepEqual)(next, current);
                    if (isEqual)
                        return prev;
                }
                return Object.assign(Object.assign({}, prev), { [key]: next });
            });
        }, [key, shallow]);
        return [currentValue, setValue];
    }
    // --------------------------------------------------------------------------
    // useFusionStore — cross-key selector (Zustand-style)
    // --------------------------------------------------------------------------
    function useFusionStore(selector, equalityFn = Object.is) {
        // Live refs let inline arrow selectors / equality fns work without
        // forcing a re-subscription each render — we always invoke the freshest
        // version inside `getSnapshot`.
        const selectorRef = (0, react_1.useRef)(selector);
        selectorRef.current = selector;
        const equalityFnRef = (0, react_1.useRef)(equalityFn);
        equalityFnRef.current = equalityFn;
        // Cache the last selected value so successive `getSnapshot` calls return
        // the same reference when the equality fn says the slice is unchanged.
        // Required by `useSyncExternalStore` to avoid an infinite-loop warning.
        const cacheRef = (0, react_1.useRef)({
            value: undefined,
            hasValue: false,
        });
        const getSnapshot = (0, react_1.useCallback)(() => {
            const next = selectorRef.current(store.getState());
            const cache = cacheRef.current;
            if (cache.hasValue && equalityFnRef.current(cache.value, next)) {
                return cache.value;
            }
            cache.value = next;
            cache.hasValue = true;
            return next;
        }, []);
        return (0, react_1.useSyncExternalStore)(store.subscribe, getSnapshot, getSnapshot);
    }
    // --------------------------------------------------------------------------
    // useFusionHydrated — bridges to the persistence engine's hydration state
    // --------------------------------------------------------------------------
    function useFusionHydrated() {
        return (0, react_1.useSyncExternalStore)(
        // The engine's `onHydratedChange` fires at most once (on the
        // false→true transition) and self-unsubscribes; the
        // `useSyncExternalStore` cleanup is idempotent against that.
        listener => store.persistenceEngine.onHydratedChange(listener), () => store.persistenceEngine.isHydrated, () => store.persistenceEngine.isHydrated);
    }
    return { Provider, useFusionState, useFusionStore, useFusionHydrated };
}
//# sourceMappingURL=createReactBindings.js.map