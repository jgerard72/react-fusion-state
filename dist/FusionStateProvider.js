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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FusionStateProvider = exports.useFusionStaticAPI = exports.useGlobalState = void 0;
const react_1 = __importStar(require("react"));
const types_1 = require("./types");
const autoDetect_1 = require("./storage/autoDetect");
const devtools_1 = require("./devtools");
const usePersistence_1 = require("./hooks/usePersistence");
const useKeySubscriptions_1 = require("./hooks/useKeySubscriptions");
const useDevToolsBridge_1 = require("./hooks/useDevToolsBridge");
const GlobalStateContext = (0, react_1.createContext)(undefined);
const FusionStaticContext = (0, react_1.createContext)(undefined);
/**
 * Hook to access the global state context.
 *
 * @returns The global state context
 * @throws Error if used outside of a `FusionStateProvider`
 */
const useGlobalState = () => {
    const context = (0, react_1.useContext)(GlobalStateContext);
    if (!context) {
        throw new Error(types_1.FusionStateErrorMessages.PROVIDER_MISSING);
    }
    return context;
};
exports.useGlobalState = useGlobalState;
/**
 * Internal hook that returns the static (stable) provider API for selector
 * subscriptions. Consumers of this hook do NOT re-render on state changes.
 *
 * @internal — used by `useFusionStore`; not part of the public API.
 * @throws Error if used outside of a `FusionStateProvider`
 */
const useFusionStaticAPI = () => {
    const ctx = (0, react_1.useContext)(FusionStaticContext);
    if (!ctx) {
        throw new Error(types_1.FusionStateErrorMessages.PROVIDER_MISSING);
    }
    return ctx;
};
exports.useFusionStaticAPI = useFusionStaticAPI;
/**
 * Normalizes various persistence configuration formats into a standard
 * {@link PersistenceConfig}.
 */
function normalizePersistenceConfig(config, debug = false) {
    if (!config)
        return undefined;
    const defaultAdapter = (0, autoDetect_1.detectBestStorageAdapter)(debug);
    if (typeof config === 'boolean') {
        return {
            adapter: defaultAdapter,
            persistKeys: config ? true : false,
            loadOnInit: true,
            saveOnChange: true,
        };
    }
    if (Array.isArray(config)) {
        return {
            adapter: defaultAdapter,
            persistKeys: config,
            loadOnInit: true,
            saveOnChange: true,
        };
    }
    if ('adapter' in config) {
        return config;
    }
    const simple = config;
    return {
        adapter: simple.adapter || defaultAdapter,
        persistKeys: simple.persistKeys || false,
        debounceTime: simple.debounce,
        loadOnInit: true,
        saveOnChange: true,
        onLoadError: simple.onLoadError,
        onSaveError: simple.onSaveError,
    };
}
/**
 * Provider component for React Fusion State.
 *
 * Manages global state and provides access to all child components.
 * Supports persistence, debug logging, and Redux DevTools integration.
 *
 * Storage keys are namespaced under a fixed `fusion_state` prefix. If you
 * mount multiple `FusionStateProvider`s in the same app with persistence
 * enabled, they will share the same storage slot — typically you want a
 * single root provider.
 *
 * @example
 * ```tsx
 * <FusionStateProvider persistence={['user', 'cart']} debug>
 *   <App />
 * </FusionStateProvider>
 * ```
 */
exports.FusionStateProvider = (0, react_1.memo)(({ children, initialState = {}, debug = false, persistence, devTools = false, }) => {
    var _a, _b;
    const normalizedPersistence = (0, react_1.useMemo)(() => normalizePersistenceConfig(persistence, debug), [persistence, debug]);
    // Sync hydration on web runs INSIDE the lazy initializer of the next
    // `useState` call so the persisted value is available on the very first
    // render. The error (if any) is captured here and reported post-mount
    // by `usePersistence`.
    const syncLoadResultRef = (0, react_1.useRef)(null);
    const [state, setStateRaw] = (0, react_1.useState)(() => {
        const result = (0, usePersistence_1.loadSyncInitialState)(normalizedPersistence, initialState, debug);
        syncLoadResultRef.current = result;
        return result.state;
    });
    const persistenceAPI = (0, usePersistence_1.usePersistence)(normalizedPersistence, setStateRaw, (_b = (_a = syncLoadResultRef.current) === null || _a === void 0 ? void 0 : _a.error) !== null && _b !== void 0 ? _b : null, debug);
    const subscriptions = (0, useKeySubscriptions_1.useKeySubscriptions)(state, initialState);
    const devToolsAPI = (0, useDevToolsBridge_1.useDevToolsBridge)(devTools, initialState);
    // Pure setState — no side effects in the updater. Listener notification,
    // persistence, debug logging and DevTools dispatch all run in the
    // post-commit effect below (StrictMode-safe).
    const setState = (0, react_1.useCallback)((updater) => {
        setStateRaw(updater);
    }, []);
    // `initializingKeys` is mutated by `useFusionState` during its init
    // effect to detect duplicate registrations of the same key.
    const initializingKeysRef = (0, react_1.useRef)(new Set());
    // Post-commit orchestration: runs once per committed state change.
    // Diffs the previous state against the new one and dispatches the four
    // possible side effects (notify / log / devtools / persist).
    const prevStateRef = (0, react_1.useRef)(state);
    (0, react_1.useEffect)(() => {
        const prev = prevStateRef.current;
        if (prev === state)
            return;
        prevStateRef.current = state;
        const seen = new Set();
        const changedKeys = [];
        for (const k of Object.keys(prev)) {
            seen.add(k);
            if (prev[k] !== state[k])
                changedKeys.push(k);
        }
        for (const k of Object.keys(state)) {
            if (seen.has(k))
                continue;
            if (prev[k] !== state[k])
                changedKeys.push(k);
        }
        if (changedKeys.length === 0)
            return;
        // 1. Notify per-key subscribers, then all global selector subscribers.
        changedKeys.forEach(subscriptions.notifyKey);
        subscriptions.notifyAll();
        // 2. Debug logging.
        if (debug) {
            console.log('[FusionState] State updated:', {
                previous: prev,
                next: state,
                diff: Object.fromEntries(changedKeys.map(k => [k, state[k]])),
            });
        }
        // 3. DevTools dispatch.
        if (devToolsAPI.enabled) {
            devToolsAPI.send(devtools_1.DevToolsActions.SET_STATE, state, changedKeys.join(', '), {
                changed: changedKeys,
                diff: Object.fromEntries(changedKeys.map(k => [k, { from: prev[k], to: state[k] }])),
            });
        }
        // 4. Persistence — skipped on the hydration tick because the freshly
        //    loaded snapshot is already what's in storage.
        if (persistenceAPI.shouldSkipNextSave())
            return;
        persistenceAPI.save(state);
    }, [state, subscriptions, debug, devToolsAPI, persistenceAPI]);
    const value = (0, react_1.useMemo)(() => ({
        state,
        setState,
        initializingKeys: initializingKeysRef.current,
        subscribeKey: subscriptions.subscribeKey,
        getKeySnapshot: subscriptions.getKeySnapshot,
        getServerSnapshot: subscriptions.getServerSnapshot,
        subscribeAll: subscriptions.subscribeAll,
        getStateSnapshot: subscriptions.getStateSnapshot,
        isHydrated: persistenceAPI.isHydrated,
    }), [
        state,
        setState,
        subscriptions.subscribeKey,
        subscriptions.getKeySnapshot,
        subscriptions.getServerSnapshot,
        subscriptions.subscribeAll,
        subscriptions.getStateSnapshot,
        persistenceAPI.isHydrated,
    ]);
    // Static value: only references that never change. Consumers of this
    // context never re-render on state changes — they only see the stable
    // subscribe/snapshot fns and drive their own re-renders via
    // `useSyncExternalStore`. Crucial for `useFusionStore` performance.
    const staticValue = (0, react_1.useMemo)(() => ({
        subscribeAll: subscriptions.subscribeAll,
        getStateSnapshot: subscriptions.getStateSnapshot,
    }), [subscriptions.subscribeAll, subscriptions.getStateSnapshot]);
    return (react_1.default.createElement(FusionStaticContext.Provider, { value: staticValue },
        react_1.default.createElement(GlobalStateContext.Provider, { value: value }, children)));
});
//# sourceMappingURL=FusionStateProvider.js.map