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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FusionStateProvider = exports.useGlobalState = void 0;
const react_1 = __importStar(require("react"));
const types_1 = require("./types");
const storageAdapters_1 = require("./storage/storageAdapters");
const autoDetect_1 = require("./storage/autoDetect");
const utils_1 = require("./utils");
const devtools_1 = require("./devtools");
const batch_1 = require("./utils/batch");
const GlobalStateContext = (0, react_1.createContext)(undefined);
/**
 * Hook to access the global state context
 * @returns The global state context
 * @throws Error if used outside of a FusionStateProvider
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
 * Normalizes various persistence configuration formats into a standard PersistenceConfig
 * @param config - The persistence configuration to normalize
 * @param debug - Whether debug mode is enabled
 * @returns Normalized persistence configuration or undefined
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
    var _a, _b, _c, _d, _e, _f;
    const normalizedPersistence = (0, react_1.useMemo)(() => normalizePersistenceConfig(persistence, debug), [persistence, debug]);
    const devToolsInstance = (0, react_1.useMemo)(() => {
        var _a;
        if (!devTools)
            return null;
        const config = typeof devTools === 'boolean'
            ? { name: 'FusionState', devOnly: true }
            : Object.assign(Object.assign({}, devTools), { devOnly: (_a = devTools.devOnly) !== null && _a !== void 0 ? _a : true });
        return (0, devtools_1.createDevTools)(config);
    }, [devTools]);
    // Persistence config is captured at mount and never resynced — this is
    // the documented "frozen at mount" semantics.
    const persistenceRef = (0, react_1.useRef)(normalizedPersistence);
    const storageAdapter = (0, react_1.useMemo)(() => { var _a; return ((_a = persistenceRef.current) === null || _a === void 0 ? void 0 : _a.adapter) || (0, storageAdapters_1.createNoopStorageAdapter)(); }, []);
    const keyPrefix = 'fusion_state';
    const shouldLoadOnInit = (_b = (_a = persistenceRef.current) === null || _a === void 0 ? void 0 : _a.loadOnInit) !== null && _b !== void 0 ? _b : true;
    const shouldSaveOnChange = (_d = (_c = persistenceRef.current) === null || _c === void 0 ? void 0 : _c.saveOnChange) !== null && _d !== void 0 ? _d : true;
    const debounceTime = (_f = (_e = persistenceRef.current) === null || _e === void 0 ? void 0 : _e.debounceTime) !== null && _f !== void 0 ? _f : 0;
    const syncLoadErrorRef = (0, react_1.useRef)(null);
    const [state, setStateRaw] = (0, react_1.useState)(() => {
        if (shouldLoadOnInit && storageAdapter && typeof window !== 'undefined') {
            try {
                const extendedAdapter = storageAdapter;
                if (extendedAdapter.getItemSync) {
                    const item = extendedAdapter.getItemSync(`${keyPrefix}_all`);
                    if (item) {
                        const storedData = JSON.parse(item);
                        if (debug) {
                            console.log('[FusionState] Loaded state synchronously:', storedData);
                        }
                        return Object.assign(Object.assign({}, initialState), storedData);
                    }
                }
            }
            catch (error) {
                const errorObj = error instanceof Error ? error : new Error(String(error));
                syncLoadErrorRef.current = errorObj;
                if (debug) {
                    console.warn('[FusionState] Synchronous load failed, will try async:', error);
                }
            }
        }
        return initialState;
    });
    // Whether the initial hydration step is complete. `true` immediately when
    // there's no async load to wait for; flipped to `true` once the async
    // load resolves (success or failure) for AsyncStorage / RN.
    const computeInitialHydrated = () => {
        // No persistence configured at all → nothing to hydrate.
        if (!persistenceRef.current)
            return true;
        if (!shouldLoadOnInit || !storageAdapter)
            return true;
        // Web sync path resolves inside the useState initializer above —
        // nothing to wait for. RN / async storage needs the async useEffect.
        if (typeof window !== 'undefined') {
            const extendedAdapter = storageAdapter;
            if (extendedAdapter.getItemSync)
                return true;
        }
        return false;
    };
    const [isHydrated, setIsHydrated] = (0, react_1.useState)(computeInitialHydrated);
    // Mirror of `isHydrated` for the async load callback to avoid calling
    // `setIsHydrated(true)` when already hydrated (would trigger spurious
    // act() warnings in tests for a no-op state update).
    const isHydratedRef = (0, react_1.useRef)(isHydrated);
    (0, react_1.useEffect)(() => {
        if (devToolsInstance === null || devToolsInstance === void 0 ? void 0 : devToolsInstance.enabled) {
            devToolsInstance.init(state);
            devToolsInstance.send(devtools_1.DevToolsActions.INIT, state, undefined, {
                initialState,
            });
        }
        // We intentionally only initialize devtools once with the initial state.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [devToolsInstance]);
    const initializingKeys = (0, react_1.useRef)(new Set());
    const isInitialLoadDone = (0, react_1.useRef)(false);
    const prevPersistedState = (0, react_1.useRef)({});
    const prevStateRef = (0, react_1.useRef)(state);
    // Set when the async hydration path writes to state, so the side-effects
    // effect can skip persisting freshly-loaded data (avoids re-save loop).
    const skipPersistOnceRef = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(() => {
        if (syncLoadErrorRef.current) {
            if (debug) {
                console.error((0, utils_1.formatErrorMessage)(types_1.FusionStateErrorMessages.PERSISTENCE_READ_ERROR, String(syncLoadErrorRef.current)));
            }
            const config = persistenceRef.current;
            if (config === null || config === void 0 ? void 0 : config.onLoadError) {
                config.onLoadError(syncLoadErrorRef.current, `${keyPrefix}_all`);
            }
            syncLoadErrorRef.current = null;
        }
        // Run only once on mount — debug/keyPrefix are stable for the lifetime
        // of the provider (debug is captured into the persistence config; the
        // prefix is hardcoded).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // Load state from storage on initialization (async fallback for RN / AsyncStorage).
    (0, react_1.useEffect)(() => {
        // Synchronous web hydration already ran inside `useState`'s lazy
        // initializer, and `isHydrated` started at `true` in that case — so
        // the only path that needs to flip `isHydrated` is the async one.
        const markHydrated = () => {
            isInitialLoadDone.current = true;
            if (!isHydratedRef.current) {
                isHydratedRef.current = true;
                setIsHydrated(true);
            }
        };
        if (shouldLoadOnInit && !isInitialLoadDone.current && storageAdapter) {
            const loadStateFromStorage = () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const storedDataRaw = yield storageAdapter.getItem(`${keyPrefix}_all`);
                    if (storedDataRaw) {
                        const storedData = JSON.parse(storedDataRaw);
                        // Capture the loaded state as the "last persisted" snapshot
                        // BEFORE applying it, so the side-effects effect's deep-equal
                        // check skips re-saving freshly-loaded data.
                        prevPersistedState.current = Object.assign({}, storedData);
                        skipPersistOnceRef.current = true;
                        setStateRaw(prevState => {
                            const mergedState = Object.assign(Object.assign({}, prevState), storedData);
                            if (debug) {
                                console.log('[FusionState] Loaded state from storage (async):', storedData);
                                console.log('[FusionState] Merged state:', mergedState);
                            }
                            return mergedState;
                        });
                    }
                    markHydrated();
                    if (debug && !storedDataRaw) {
                        console.log('[FusionState] No stored data found');
                    }
                }
                catch (error) {
                    const errorObj = error instanceof Error ? error : new Error(String(error));
                    if (debug) {
                        console.error((0, utils_1.formatErrorMessage)(types_1.FusionStateErrorMessages.PERSISTENCE_READ_ERROR, String(error)));
                    }
                    const config = persistenceRef.current;
                    if (config === null || config === void 0 ? void 0 : config.onLoadError) {
                        config.onLoadError(errorObj, `${keyPrefix}_all`);
                    }
                    markHydrated();
                }
            });
            loadStateFromStorage();
        }
        else {
            // No async hydration path — `isHydrated` was already initialized to
            // `true` by useState. Just record that we're done.
            isInitialLoadDone.current = true;
        }
    }, [storageAdapter, keyPrefix, shouldLoadOnInit, debug]);
    // Filter helper for persistence keys
    const filterPersistKeys = (0, react_1.useMemo)(() => {
        return (newState) => {
            var _a;
            const persistKeys = (_a = persistenceRef.current) === null || _a === void 0 ? void 0 : _a.persistKeys;
            if (!persistKeys)
                return {};
            if (persistKeys === true)
                return Object.assign({}, newState);
            const filteredState = {};
            if (Array.isArray(persistKeys)) {
                persistKeys.forEach(key => {
                    if (key in newState) {
                        filteredState[key] = newState[key];
                    }
                });
            }
            else if (typeof persistKeys === 'function') {
                Object.keys(newState).forEach(key => {
                    const filterFn = persistKeys;
                    if (filterFn(key, newState[key])) {
                        filteredState[key] = newState[key];
                    }
                });
            }
            return filteredState;
        };
    }, []);
    // Save helper. Stable identity so the side-effects effect doesn't re-fire
    // unnecessarily; reads "live" config off refs.
    const saveStateToStorage = (0, react_1.useMemo)(() => {
        const save = (newState) => __awaiter(void 0, void 0, void 0, function* () {
            if (!storageAdapter || !shouldSaveOnChange)
                return;
            const stateToSave = filterPersistKeys(newState);
            if (Object.keys(stateToSave).length === 0)
                return;
            try {
                const hasChanged = !(0, utils_1.simpleDeepEqual)(stateToSave, prevPersistedState.current);
                if (!hasChanged) {
                    if (debug) {
                        console.log('[FusionState] No changes detected, skipping save');
                    }
                    return;
                }
                const persistenceConfig = persistenceRef.current;
                if (persistenceConfig) {
                    const customSaveCallback = 'customSaveCallback' in persistenceConfig
                        ? persistenceConfig.customSaveCallback
                        : undefined;
                    if (customSaveCallback &&
                        typeof customSaveCallback === 'function') {
                        yield customSaveCallback(stateToSave, storageAdapter, keyPrefix);
                    }
                    else {
                        yield storageAdapter.setItem(`${keyPrefix}_all`, JSON.stringify(stateToSave));
                    }
                }
                else {
                    yield storageAdapter.setItem(`${keyPrefix}_all`, JSON.stringify(stateToSave));
                }
                prevPersistedState.current = Object.assign({}, stateToSave);
                if (debug) {
                    console.log('[FusionState] Saved state to storage:', stateToSave);
                }
            }
            catch (error) {
                const errorObj = error instanceof Error ? error : new Error(String(error));
                if (debug) {
                    console.error((0, utils_1.formatErrorMessage)(types_1.FusionStateErrorMessages.PERSISTENCE_WRITE_ERROR, String(error)));
                }
                const config = persistenceRef.current;
                if (config === null || config === void 0 ? void 0 : config.onSaveError) {
                    config.onSaveError(errorObj, stateToSave);
                }
            }
        });
        return debounceTime > 0 ? (0, utils_1.debounce)(save, debounceTime) : save;
    }, [
        storageAdapter,
        keyPrefix,
        shouldSaveOnChange,
        debug,
        debounceTime,
        filterPersistKeys,
    ]);
    // Per-key subscription registry
    const keyListenersRef = (0, react_1.useRef)(new Map());
    const subscribeKey = (0, react_1.useCallback)((key, listener) => {
        let set = keyListenersRef.current.get(key);
        if (!set) {
            set = new Set();
            keyListenersRef.current.set(key, set);
        }
        set.add(listener);
        return () => {
            set.delete(listener);
            if (set.size === 0) {
                keyListenersRef.current.delete(key);
            }
        };
    }, []);
    const notifyKey = (0, react_1.useCallback)((key) => {
        const listeners = keyListenersRef.current.get(key);
        if (listeners) {
            (0, batch_1.batch)(() => {
                listeners.forEach(l => l());
            });
        }
    }, []);
    const getKeySnapshot = (0, react_1.useCallback)((key) => {
        return key in state ? state[key] : undefined;
    }, [state]);
    const getServerSnapshot = (0, react_1.useCallback)((key) => {
        return key in initialState ? initialState[key] : undefined;
    }, [initialState]);
    // Pure setState — no side effects in the updater. Listener notification,
    // persistence, debug logging and DevTools dispatch all happen in the
    // post-commit effect below.
    const setState = (0, react_1.useCallback)((updater) => {
        setStateRaw(updater);
    }, []);
    // Post-commit side effects: runs once per state change (after batched
    // updates have settled). Compares the latest state against the previous
    // committed state to compute changed keys.
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
        // 1. Notify per-key subscribers (always — including hydration so
        //    useSyncExternalStore consumers see the loaded value).
        changedKeys.forEach(notifyKey);
        // 2. Debug logging
        if (debug) {
            console.log('[FusionState] State updated:', {
                previous: prev,
                next: state,
                diff: Object.fromEntries(changedKeys.map(k => [k, state[k]])),
            });
        }
        // 3. DevTools dispatch
        if (devToolsInstance === null || devToolsInstance === void 0 ? void 0 : devToolsInstance.enabled) {
            devToolsInstance.send(devtools_1.DevToolsActions.SET_STATE, state, changedKeys.join(', '), {
                changed: changedKeys,
                diff: Object.fromEntries(changedKeys.map(k => [k, { from: prev[k], to: state[k] }])),
            });
        }
        // 4. Persistence — skipped on the hydration tick because the freshly
        //    loaded snapshot is already what's in storage.
        if (skipPersistOnceRef.current) {
            skipPersistOnceRef.current = false;
            return;
        }
        if (shouldSaveOnChange) {
            saveStateToStorage(state);
        }
    }, [
        state,
        notifyKey,
        debug,
        devToolsInstance,
        shouldSaveOnChange,
        saveStateToStorage,
    ]);
    const value = (0, react_1.useMemo)(() => ({
        state,
        setState,
        initializingKeys: initializingKeys.current,
        subscribeKey,
        getKeySnapshot,
        getServerSnapshot,
        isHydrated,
    }), [
        state,
        setState,
        subscribeKey,
        getKeySnapshot,
        getServerSnapshot,
        isHydrated,
    ]);
    return (react_1.default.createElement(GlobalStateContext.Provider, { value: value }, children));
});
//# sourceMappingURL=FusionStateProvider.js.map