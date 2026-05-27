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
exports.createPersistenceEngine = exports.loadSyncInitialState = exports.normalizePersistenceConfig = void 0;
const types_1 = require("../types");
const storageAdapters_1 = require("../storage/storageAdapters");
const autoDetect_1 = require("../storage/autoDetect");
const utils_1 = require("../utils");
const STORAGE_KEY = 'fusion_state_all';
/**
 * Pure helper that normalizes the various accepted persistence shapes
 * (`true` | `string[]` | `SimplePersistenceConfig` | `PersistenceConfig`)
 * into a canonical {@link PersistenceConfig}. Returns `undefined` when
 * persistence is disabled.
 *
 * Behaviour preserved verbatim from the legacy `normalizePersistenceConfig`
 * that used to live inside `FusionStateProvider.tsx` so the migration to the
 * headless engine is byte-equivalent for the user.
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
exports.normalizePersistenceConfig = normalizePersistenceConfig;
/**
 * Pure helper for synchronous hydration. Used both by the headless store
 * (at construction time) and conceptually by anyone wanting to pre-load
 * state from a sync storage adapter without instantiating a full store.
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
exports.loadSyncInitialState = loadSyncInitialState;
/**
 * Build a {@link PersistenceEngine}. Pure JS — never imports React.
 *
 * The engine is constructed eagerly at store-creation time, performs sync
 * hydration immediately (so `initialState` is hot), then waits for the
 * caller to invoke {@link PersistenceEngine.startAsyncHydration} for the
 * mobile / AsyncStorage path. The store calls into the engine from its
 * `setState` to persist mutations.
 */
function createPersistenceEngine(rawConfig, callerInitialState, debug = false) {
    var _a, _b, _c;
    const config = normalizePersistenceConfig(rawConfig, debug);
    // Fast path: persistence disabled — return a fully-noop engine.
    if (!config) {
        return {
            initialState: callerInitialState,
            isHydrated: true,
            onHydratedChange: () => () => { },
            startAsyncHydration: () => { },
            save: () => { },
            shouldSkipNextSave: () => false,
            reportStartupError: () => { },
            destroy: () => { },
        };
    }
    const adapter = config.adapter || (0, storageAdapters_1.createNoopStorageAdapter)();
    const shouldLoadOnInit = (_a = config.loadOnInit) !== null && _a !== void 0 ? _a : true;
    const shouldSaveOnChange = (_b = config.saveOnChange) !== null && _b !== void 0 ? _b : true;
    const debounceTime = (_c = config.debounceTime) !== null && _c !== void 0 ? _c : 0;
    // Sync hydration runs once, here, so the store's `initialState` already
    // reflects whatever was on disk on web with localStorage.
    const syncResult = loadSyncInitialState(config, callerInitialState, debug);
    // Internal mutable state.
    let isHydrated = syncResultIsImmediatelyHydrated(config, adapter);
    let asyncStarted = false;
    let startupErrorReported = false;
    // The "previously persisted" snapshot used for dedup. Seeded from the
    // sync-loaded data so a save that produces an identical payload is a no-op.
    let prevPersisted = syncResult.error == null && syncResult.state !== callerInitialState
        ? filterPersistKeysImpl(config, syncResult.state)
        : {};
    let skipPersistOnce = false;
    const hydratedListeners = new Set();
    const onHydratedChange = (listener) => {
        if (isHydrated) {
            // Already hydrated — fire immediately on the next microtask so the
            // caller's contract (listener is called *after* subscribing) holds.
            Promise.resolve().then(listener);
            return () => { };
        }
        hydratedListeners.add(listener);
        return () => hydratedListeners.delete(listener);
    };
    const markHydrated = () => {
        if (isHydrated)
            return;
        isHydrated = true;
        const snapshot = Array.from(hydratedListeners);
        hydratedListeners.clear();
        for (const l of snapshot)
            l();
    };
    const startAsyncHydration = (apply) => {
        if (asyncStarted)
            return;
        asyncStarted = true;
        if (!shouldLoadOnInit) {
            markHydrated();
            return;
        }
        // Web sync path already filled the state — nothing left to do.
        if (isHydrated)
            return;
        void (() => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const raw = yield adapter.getItem(STORAGE_KEY);
                if (raw) {
                    const stored = JSON.parse(raw);
                    prevPersisted = Object.assign({}, stored);
                    skipPersistOnce = true;
                    if (debug) {
                        console.log('[FusionState] Loaded state from storage (async):', stored);
                    }
                    apply(stored);
                }
                else if (debug) {
                    console.log('[FusionState] No stored data found');
                }
            }
            catch (error) {
                const errorObj = error instanceof Error ? error : new Error(String(error));
                if (debug) {
                    console.error((0, utils_1.formatErrorMessage)(types_1.FusionStateErrorMessages.PERSISTENCE_READ_ERROR, String(error)));
                }
                const cfg = config;
                (_a = cfg.onLoadError) === null || _a === void 0 ? void 0 : _a.call(cfg, errorObj, STORAGE_KEY);
            }
            finally {
                markHydrated();
            }
        }))();
    };
    const reportStartupError = () => {
        var _a;
        if (startupErrorReported)
            return;
        startupErrorReported = true;
        const err = syncResult.error;
        if (!err)
            return;
        if (debug) {
            console.error((0, utils_1.formatErrorMessage)(types_1.FusionStateErrorMessages.PERSISTENCE_READ_ERROR, String(err)));
        }
        const cfg = config;
        (_a = cfg.onLoadError) === null || _a === void 0 ? void 0 : _a.call(cfg, err, STORAGE_KEY);
    };
    const rawSave = (newState) => __awaiter(this, void 0, void 0, function* () {
        var _d;
        if (!shouldSaveOnChange)
            return;
        const toSave = filterPersistKeysImpl(config, newState);
        if (Object.keys(toSave).length === 0)
            return;
        try {
            if ((0, utils_1.simpleDeepEqual)(toSave, prevPersisted)) {
                if (debug) {
                    console.log('[FusionState] No changes detected, skipping save');
                }
                return;
            }
            // Untyped `customSaveCallback` escape hatch kept for backward compat
            // with the legacy `usePersistence` API. New code should prefer a
            // custom `StorageAdapter` implementation.
            const customSaveCallback = 'customSaveCallback' in config
                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    config.customSaveCallback
                : undefined;
            if (typeof customSaveCallback === 'function') {
                yield customSaveCallback(toSave, adapter, 'fusion_state');
            }
            else {
                yield adapter.setItem(STORAGE_KEY, JSON.stringify(toSave));
            }
            prevPersisted = Object.assign({}, toSave);
            if (debug) {
                console.log('[FusionState] Saved state to storage:', toSave);
            }
        }
        catch (error) {
            const errorObj = error instanceof Error ? error : new Error(String(error));
            if (debug) {
                console.error((0, utils_1.formatErrorMessage)(types_1.FusionStateErrorMessages.PERSISTENCE_WRITE_ERROR, String(error)));
            }
            const cfg = config;
            (_d = cfg.onSaveError) === null || _d === void 0 ? void 0 : _d.call(cfg, errorObj, toSave);
        }
    });
    const debouncedSave = debounceTime > 0 ? (0, utils_1.debounce)(rawSave, debounceTime) : rawSave;
    const save = (state) => {
        if (!shouldSaveOnChange)
            return;
        debouncedSave(state);
    };
    const shouldSkipNextSave = () => {
        if (skipPersistOnce) {
            skipPersistOnce = false;
            return true;
        }
        return false;
    };
    const destroy = () => {
        hydratedListeners.clear();
        // `debounce` (from utils) exposes a `.flush?` / `.cancel?` ad-hoc API on
        // some implementations; we don't rely on it. Pending writes that haven't
        // fired yet will simply never reach storage after destroy, which is the
        // correct behaviour for SSR per-request stores.
    };
    return {
        initialState: syncResult.state,
        get isHydrated() {
            return isHydrated;
        },
        onHydratedChange,
        startAsyncHydration,
        save,
        shouldSkipNextSave,
        reportStartupError,
        destroy,
    };
}
exports.createPersistenceEngine = createPersistenceEngine;
/**
 * Mirror of the post-sync-hydration `computeInitialHydrated` logic from the
 * legacy hook: on web with a `getItemSync`-capable adapter, hydration is
 * complete the moment {@link createPersistenceEngine} returns. Anywhere
 * else, we still need {@link PersistenceEngine.startAsyncHydration}.
 */
function syncResultIsImmediatelyHydrated(config, adapter) {
    if (config.loadOnInit === false)
        return true;
    if (!adapter)
        return true;
    if (typeof window === 'undefined')
        return false;
    const extended = adapter;
    return typeof extended.getItemSync === 'function';
}
/**
 * Apply the `persistKeys` filter to a state snapshot, returning a new
 * object that contains only the entries actually slated for persistence.
 */
function filterPersistKeysImpl(config, newState) {
    const persistKeys = config.persistKeys;
    if (!persistKeys)
        return {};
    if (persistKeys === true)
        return Object.assign({}, newState);
    const filtered = {};
    if (Array.isArray(persistKeys)) {
        for (const key of persistKeys) {
            if (key in newState)
                filtered[key] = newState[key];
        }
    }
    else if (typeof persistKeys === 'function') {
        const filterFn = persistKeys;
        for (const key of Object.keys(newState)) {
            if (filterFn(key, newState[key]))
                filtered[key] = newState[key];
        }
    }
    return filtered;
}
//# sourceMappingURL=persistenceEngine.js.map