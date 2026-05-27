"use strict";
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
exports.loadSyncInitialState = loadSyncInitialState;
exports.usePersistence = usePersistence;
const react_1 = require("react");
const types_1 = require("../types");
const storageAdapters_1 = require("../storage/storageAdapters");
const utils_1 = require("../utils");
const STORAGE_KEY = 'fusion_state_all';
/**
 * Pure helper for synchronous hydration on web (`localStorage.getItem` path).
 *
 * Called by the Provider inside its `useState` lazy initializer so the loaded
 * value is available on the very first render (no flicker). For RN /
 * AsyncStorage, this returns `{state: initialState, error: null}` and the
 * async load happens later inside {@link usePersistence}.
 */
function loadSyncInitialState(config, initialState, debug = false) {
    if (!config)
        return { state: initialState, error: null };
    if (config.loadOnInit === false)
        return { state: initialState, error: null };
    if (typeof window === 'undefined')
        return { state: initialState, error: null };
    const adapter = config.adapter;
    if (!(adapter === null || adapter === void 0 ? void 0 : adapter.getItemSync))
        return { state: initialState, error: null };
    try {
        const item = adapter.getItemSync(STORAGE_KEY);
        if (!item)
            return { state: initialState, error: null };
        const parsed = JSON.parse(item);
        if (debug) {
            console.log('[FusionState] Loaded state synchronously:', parsed);
        }
        return { state: Object.assign(Object.assign({}, initialState), parsed), error: null };
    }
    catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        if (debug) {
            console.warn('[FusionState] Synchronous load failed, will try async:', error);
        }
        return { state: initialState, error: errorObj };
    }
}
/**
 * Hook that handles the async portion of the persistence lifecycle: async
 * hydration on mount (RN / AsyncStorage), reporting of any sync-load error
 * to the user-supplied callback, debounced save with key filtering and
 * deep-equality dedup, and error reporting on save failures.
 *
 * The sync hydration (web `localStorage`) is performed separately by the
 * Provider via {@link loadSyncInitialState} inside its `useState` lazy
 * initializer — that has to run before any hook can fire.
 *
 * Persistence config is captured at first call and frozen for the lifetime
 * of the hook (matches the documented Provider semantics).
 *
 * @param config - Normalized persistence configuration (or `undefined` for none).
 * @param setStateRaw - The Provider's raw `setState` setter, used to apply
 *   freshly-loaded async snapshots.
 * @param syncLoadError - Error from the sync-load attempt (or `null`), to be
 *   reported via `onLoadError` after mount.
 * @param debug - Whether to emit debug logs.
 */
function usePersistence(config, setStateRaw, syncLoadError, debug = false) {
    var _a, _b, _c, _d, _e, _f;
    const configRef = (0, react_1.useRef)(config);
    const storageAdapter = (0, react_1.useMemo)(() => { var _a; return ((_a = configRef.current) === null || _a === void 0 ? void 0 : _a.adapter) || (0, storageAdapters_1.createNoopStorageAdapter)(); }, []);
    const shouldLoadOnInit = (_b = (_a = configRef.current) === null || _a === void 0 ? void 0 : _a.loadOnInit) !== null && _b !== void 0 ? _b : true;
    const shouldSaveOnChange = (_d = (_c = configRef.current) === null || _c === void 0 ? void 0 : _c.saveOnChange) !== null && _d !== void 0 ? _d : true;
    const debounceTime = (_f = (_e = configRef.current) === null || _e === void 0 ? void 0 : _e.debounceTime) !== null && _f !== void 0 ? _f : 0;
    const computeInitialHydrated = () => {
        if (!configRef.current)
            return true;
        if (!shouldLoadOnInit || !storageAdapter)
            return true;
        if (typeof window !== 'undefined') {
            const extended = storageAdapter;
            if (extended.getItemSync)
                return true;
        }
        return false;
    };
    const [isHydrated, setIsHydrated] = (0, react_1.useState)(computeInitialHydrated);
    const isHydratedRef = (0, react_1.useRef)(isHydrated);
    const prevPersistedRef = (0, react_1.useRef)({});
    const skipPersistOnceRef = (0, react_1.useRef)(false);
    const isInitialLoadDoneRef = (0, react_1.useRef)(false);
    // Report the sync-load failure (if any) to the user-supplied callback
    // after mount — invisible to callbacks if reported inside the lazy
    // initializer.
    const syncErrorRef = (0, react_1.useRef)(syncLoadError);
    (0, react_1.useEffect)(() => {
        var _a;
        const err = syncErrorRef.current;
        if (!err)
            return;
        if (debug) {
            console.error((0, utils_1.formatErrorMessage)(types_1.FusionStateErrorMessages.PERSISTENCE_READ_ERROR, String(err)));
        }
        const cfg = configRef.current;
        (_a = cfg === null || cfg === void 0 ? void 0 : cfg.onLoadError) === null || _a === void 0 ? void 0 : _a.call(cfg, err, STORAGE_KEY);
        syncErrorRef.current = null;
        // Mount-only — debug captured by closure and stable for the lifetime
        // of the hook.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // Async hydration (AsyncStorage / React Native fallback). No-op on web
    // when sync hydration already succeeded inside the lazy initializer.
    (0, react_1.useEffect)(() => {
        const markHydrated = () => {
            isInitialLoadDoneRef.current = true;
            if (!isHydratedRef.current) {
                isHydratedRef.current = true;
                setIsHydrated(true);
            }
        };
        if (!shouldLoadOnInit || !storageAdapter || isInitialLoadDoneRef.current) {
            isInitialLoadDoneRef.current = true;
            return;
        }
        // On web, the sync path already handled it — mark hydrated and exit
        // (no async work needed).
        if (typeof window !== 'undefined') {
            const extended = storageAdapter;
            if (extended.getItemSync) {
                markHydrated();
                return;
            }
        }
        const load = () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const raw = yield storageAdapter.getItem(STORAGE_KEY);
                if (raw) {
                    const stored = JSON.parse(raw);
                    prevPersistedRef.current = Object.assign({}, stored);
                    skipPersistOnceRef.current = true;
                    setStateRaw(prev => {
                        const merged = Object.assign(Object.assign({}, prev), stored);
                        if (debug) {
                            console.log('[FusionState] Loaded state from storage (async):', stored);
                            console.log('[FusionState] Merged state:', merged);
                        }
                        return merged;
                    });
                }
                else if (debug) {
                    console.log('[FusionState] No stored data found');
                }
                markHydrated();
            }
            catch (error) {
                const errorObj = error instanceof Error ? error : new Error(String(error));
                if (debug) {
                    console.error((0, utils_1.formatErrorMessage)(types_1.FusionStateErrorMessages.PERSISTENCE_READ_ERROR, String(error)));
                }
                const cfg = configRef.current;
                (_a = cfg === null || cfg === void 0 ? void 0 : cfg.onLoadError) === null || _a === void 0 ? void 0 : _a.call(cfg, errorObj, STORAGE_KEY);
                markHydrated();
            }
        });
        load();
    }, [storageAdapter, shouldLoadOnInit, debug, setStateRaw]);
    // Filter the state to only the persisted keys (boolean / array / function).
    const filterPersistKeys = (0, react_1.useCallback)((newState) => {
        var _a;
        const persistKeys = (_a = configRef.current) === null || _a === void 0 ? void 0 : _a.persistKeys;
        if (!persistKeys)
            return {};
        if (persistKeys === true)
            return Object.assign({}, newState);
        const filtered = {};
        if (Array.isArray(persistKeys)) {
            persistKeys.forEach(key => {
                if (key in newState)
                    filtered[key] = newState[key];
            });
        }
        else if (typeof persistKeys === 'function') {
            const filterFn = persistKeys;
            Object.keys(newState).forEach(key => {
                if (filterFn(key, newState[key]))
                    filtered[key] = newState[key];
            });
        }
        return filtered;
    }, []);
    // Stable save callback (optionally debounced). Stable identity so the
    // orchestrator's effect doesn't re-fire on save churn.
    const save = (0, react_1.useMemo)(() => {
        const rawSave = (newState) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!storageAdapter || !shouldSaveOnChange)
                return;
            const toSave = filterPersistKeys(newState);
            if (Object.keys(toSave).length === 0)
                return;
            try {
                const changed = !(0, utils_1.simpleDeepEqual)(toSave, prevPersistedRef.current);
                if (!changed) {
                    if (debug) {
                        console.log('[FusionState] No changes detected, skipping save');
                    }
                    return;
                }
                const cfg = configRef.current;
                // Untyped `customSaveCallback` escape hatch — kept for backward
                // compatibility with the original Provider; new code should prefer
                // a custom `StorageAdapter` implementation.
                const customSaveCallback = cfg && 'customSaveCallback' in cfg
                    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        cfg.customSaveCallback
                    : undefined;
                if (typeof customSaveCallback === 'function') {
                    yield customSaveCallback(toSave, storageAdapter, 'fusion_state');
                }
                else {
                    yield storageAdapter.setItem(STORAGE_KEY, JSON.stringify(toSave));
                }
                prevPersistedRef.current = Object.assign({}, toSave);
                if (debug) {
                    console.log('[FusionState] Saved state to storage:', toSave);
                }
            }
            catch (error) {
                const errorObj = error instanceof Error ? error : new Error(String(error));
                if (debug) {
                    console.error((0, utils_1.formatErrorMessage)(types_1.FusionStateErrorMessages.PERSISTENCE_WRITE_ERROR, String(error)));
                }
                const cfg = configRef.current;
                (_a = cfg === null || cfg === void 0 ? void 0 : cfg.onSaveError) === null || _a === void 0 ? void 0 : _a.call(cfg, errorObj, toSave);
            }
        });
        return debounceTime > 0 ? (0, utils_1.debounce)(rawSave, debounceTime) : rawSave;
    }, [
        storageAdapter,
        shouldSaveOnChange,
        debounceTime,
        debug,
        filterPersistKeys,
    ]);
    const shouldSkipNextSave = (0, react_1.useCallback)(() => {
        if (skipPersistOnceRef.current) {
            skipPersistOnceRef.current = false;
            return true;
        }
        return false;
    }, []);
    return {
        isHydrated,
        save: (state) => {
            if (!shouldSaveOnChange)
                return;
            save(state);
        },
        shouldSkipNextSave,
    };
}
//# sourceMappingURL=usePersistence.js.map