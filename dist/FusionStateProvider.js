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
exports.useGlobalState = exports.FusionStateProvider = void 0;
const react_1 = __importStar(require("react"));
const createStore_1 = require("./store/createStore");
const defaultStore_1 = require("./store/defaultStore");
/**
 * Provider component for React Fusion State.
 *
 * Since v1.4 this is a thin (~30-line) wrapper around the headless
 * {@link createStore} factory. Mounting `<FusionStateProvider {...props}>`
 * is exactly equivalent to:
 *
 * ```tsx
 * const store = useMemo(() => createStore(props), []);
 * useEffect(() => () => store.destroy(), [store]);
 * return <store.Provider>{children}</store.Provider>;
 * ```
 *
 * The store reference is exposed through the internal `DefaultStoreContext`
 * so module-level hooks (`useFusionState`, `useFusionStore`, …) can find
 * it. Storage keys are namespaced under the fixed `fusion_state` prefix —
 * mounting multiple `FusionStateProvider`s with persistence will share the
 * same storage slot. For full isolation, switch to `createStore()` and
 * pass the store explicitly.
 *
 * @example
 * ```tsx
 * <FusionStateProvider persistence={['user', 'cart']} debug>
 *   <App />
 * </FusionStateProvider>
 * ```
 */
exports.FusionStateProvider = (0, react_1.memo)(({ children, initialState = {}, debug = false, persistence, devTools = false }) => {
    // Build a fresh store on mount, sealed to the props. Captured-once on
    // purpose so that prop changes after mount don't trigger surprise
    // resets (matches the documented 1.3.x semantics).
    const store = (0, react_1.useMemo)(() => (0, createStore_1.createStore)({
        initialState,
        debug,
        persistence,
        devTools,
    }), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);
    // Release subscriptions, pending debounced writes and DevTools
    // connection when the Provider unmounts. Essential for SSR per-request
    // stores and HMR scenarios.
    (0, react_1.useEffect)(() => () => store.destroy(), [store]);
    return (react_1.default.createElement(defaultStore_1.DefaultStoreContext.Provider, { value: store }, children));
});
exports.FusionStateProvider.displayName = 'FusionStateProvider';
/**
 * Resolve the global state context for the nearest `FusionStateProvider` in
 * the React tree. Public API kept since v1.0.
 *
 * Since v1.4 the returned object is synthesized from the underlying store
 * each render — `state` is subscribed via `useSyncExternalStore` so callers
 * still re-render on every change, just like the original.
 *
 * Note on `setState`: the synthesized setter always replaces the global
 * state when called with a non-function value (matching React's
 * `Dispatch<SetStateAction<T>>` semantics), even though `store.setState`
 * shallow-merges partial objects natively. This preserves the strict 1.x
 * contract for direct `useGlobalState()` callers.
 *
 * @throws Error if used outside of a `FusionStateProvider`.
 */
const useGlobalState = () => {
    const store = (0, defaultStore_1.useDefaultStore)();
    // Subscribe to the *global* listener set so any state mutation triggers a
    // re-render — preserves the implicit "re-render on every change" contract
    // of the legacy context.
    const state = (0, react_1.useSyncExternalStore)(store.subscribe, store.getState, store.getState);
    return (0, react_1.useMemo)(() => ({
        state,
        // Wrap the headless setter so passing a plain object replaces the
        // whole state (legacy semantics) instead of merging it (the new
        // store-native behaviour).
        setState: ((value) => {
            store.setState(prev => typeof value === 'function'
                ? value(prev)
                : value);
        }),
        // Mirror the store's shared `initializingKeys` set so callers writing
        // their own hooks on top of `useGlobalState` interact with the same
        // duplicate-init guard the canonical hooks use.
        initializingKeys: store
            .initializingKeys,
        subscribeKey: store.subscribeKey,
        getKeySnapshot: (key) => store.getState()[key],
        getServerSnapshot: undefined,
        subscribeAll: store.subscribe,
        getStateSnapshot: store.getState,
        isHydrated: store.isHydrated,
    }), [state, store]);
};
exports.useGlobalState = useGlobalState;
//# sourceMappingURL=FusionStateProvider.js.map