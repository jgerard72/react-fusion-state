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
 * Normalize persistence configuration - simplified version
 */
function normalizePersistenceConfig(config, debug = false) {
    if (!config)
        return undefined;
    const defaultAdapter = (0, autoDetect_1.detectBestStorageAdapter)(debug);
    // Boolean: default persistence
    if (typeof config === 'boolean') {
        return {
            adapter: defaultAdapter,
            persistKeys: (key) => key.startsWith('persist.'),
            loadOnInit: true,
            saveOnChange: true,
        };
    }
    // Array: specific keys
    if (Array.isArray(config)) {
        return {
            adapter: defaultAdapter,
            persistKeys: config,
            loadOnInit: true,
            saveOnChange: true,
        };
    }
    // Complete PersistenceConfig
    if ('adapter' in config && !('keyPrefix' in config)) {
        return config;
    }
    // SimplePersistenceConfig
    const simple = config;
    return {
        adapter: simple.adapter || defaultAdapter,
        persistKeys: simple.persistKeys || ((key) => key.startsWith('persist.')),
        keyPrefix: simple.keyPrefix,
        debounceTime: simple.debounce,
        loadOnInit: true,
        saveOnChange: true,
        onLoadError: simple.onLoadError,
        onSaveError: simple.onSaveError,
    };
}
/**
 * Provider component for React Fusion State
 * Manages the global state and provides access to all child components
 */
exports.FusionStateProvider = (0, react_1.memo)(({ children, initialState = {}, debug = false, persistence }) => {
    var _a, _b, _c, _d, _e, _f, _g;
    // Normalize persistence configuration
    const normalizedPersistence = (0, react_1.useMemo)(() => normalizePersistenceConfig(persistence, debug), [persistence, debug]);
    // Initialize storage - use NoopStorage if not configured
    const persistenceRef = (0, react_1.useRef)(normalizedPersistence);
    const storageAdapter = (0, react_1.useMemo)(() => { var _a; return ((_a = persistenceRef.current) === null || _a === void 0 ? void 0 : _a.adapter) || (0, storageAdapters_1.createNoopStorageAdapter)(); }, []);
    const keyPrefix = ((_a = persistenceRef.current) === null || _a === void 0 ? void 0 : _a.keyPrefix) || 'fusion_state';
    const shouldLoadOnInit = (_c = (_b = persistenceRef.current) === null || _b === void 0 ? void 0 : _b.loadOnInit) !== null && _c !== void 0 ? _c : true; // Default: load
    const shouldSaveOnChange = (_e = (_d = persistenceRef.current) === null || _d === void 0 ? void 0 : _d.saveOnChange) !== null && _e !== void 0 ? _e : true; // Default: save
    const debounceTime = (_g = (_f = persistenceRef.current) === null || _f === void 0 ? void 0 : _f.debounceTime) !== null && _g !== void 0 ? _g : 0;
    // State management with synchronous loading
    const syncLoadErrorRef = (0, react_1.useRef)(null);
    const [state, setStateRaw] = (0, react_1.useState)(() => {
        // Try to load synchronously if possible (for localStorage)
        if (shouldLoadOnInit && storageAdapter && typeof window !== 'undefined') {
            try {
                // Check if this is an extended storage adapter with sync support
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
    const initializingKeys = (0, react_1.useRef)(new Set());
    const isInitialLoadDone = (0, react_1.useRef)(false);
    const prevPersistedState = (0, react_1.useRef)({});
    // Handle synchronous load errors
    (0, react_1.useEffect)(() => {
        if (syncLoadErrorRef.current) {
            if (debug) {
                console.error((0, utils_1.formatErrorMessage)(types_1.FusionStateErrorMessages.PERSISTENCE_READ_ERROR, String(syncLoadErrorRef.current)));
            }
            // Call error callback if provided
            const config = persistenceRef.current;
            if (config === null || config === void 0 ? void 0 : config.onLoadError) {
                config.onLoadError(syncLoadErrorRef.current, `${keyPrefix}_all`);
            }
            syncLoadErrorRef.current = null; // Clear the error after handling
        }
    }, []); // Run only once
    // Load state from storage on initialization (async fallback)
    (0, react_1.useEffect)(() => {
        if (shouldLoadOnInit && !isInitialLoadDone.current && storageAdapter) {
            const loadStateFromStorage = () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const storedDataRaw = yield storageAdapter.getItem(`${keyPrefix}_all`);
                    if (storedDataRaw) {
                        const storedData = JSON.parse(storedDataRaw);
                        // Merge with current state - stored data takes precedence
                        setStateRaw(prevState => {
                            const mergedState = Object.assign(Object.assign({}, prevState), storedData);
                            if (debug) {
                                console.log('[FusionState] Loaded state from storage (async):', storedData);
                                console.log('[FusionState] Merged state:', mergedState);
                            }
                            return mergedState;
                        });
                        // Store for comparison
                        prevPersistedState.current = Object.assign({}, storedData);
                    }
                    isInitialLoadDone.current = true;
                    if (debug && !storedDataRaw) {
                        console.log('[FusionState] No stored data found');
                    }
                }
                catch (error) {
                    const errorObj = error instanceof Error ? error : new Error(String(error));
                    if (debug) {
                        console.error((0, utils_1.formatErrorMessage)(types_1.FusionStateErrorMessages.PERSISTENCE_READ_ERROR, String(error)));
                    }
                    // Appeler le callback d'erreur si fourni
                    const config = persistenceRef.current;
                    if (config === null || config === void 0 ? void 0 : config.onLoadError) {
                        config.onLoadError(errorObj, `${keyPrefix}_all`);
                    }
                    isInitialLoadDone.current = true;
                }
            });
            loadStateFromStorage();
        }
        else {
            isInitialLoadDone.current = true;
        }
    }, [storageAdapter, keyPrefix, shouldLoadOnInit, debug]);
    // Function to filter state based on persistKeys
    const filterPersistKeys = (0, react_1.useMemo)(() => {
        return (newState) => {
            var _a;
            const persistKeys = (_a = persistenceRef.current) === null || _a === void 0 ? void 0 : _a.persistKeys;
            if (!persistKeys)
                return Object.assign({}, newState);
            const filteredState = {};
            if (Array.isArray(persistKeys)) {
                // If persistKeys is an array, only save those keys
                persistKeys.forEach(key => {
                    if (key in newState) {
                        filteredState[key] = newState[key];
                    }
                });
            }
            else if (typeof persistKeys === 'function') {
                // If persistKeys is a function, use it to filter keys
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
    // Function to save state to storage
    const saveStateToStorage = (0, react_1.useMemo)(() => {
        const save = (newState) => __awaiter(void 0, void 0, void 0, function* () {
            if (!storageAdapter || !shouldSaveOnChange)
                return;
            // Filter keys if persistence.persistKeys is defined
            const stateToSave = filterPersistKeys(newState);
            try {
                // ✅ Optimization: check if data has actually changed
                const hasChanged = !(0, utils_1.simpleDeepEqual)(stateToSave, prevPersistedState.current);
                // Only save if there are changes
                if (!hasChanged) {
                    if (debug) {
                        console.log('[FusionState] No changes detected, skipping save');
                    }
                    return;
                }
                // Check if customSaveCallback is provided in the persistence config
                // SimplePersistenceConfig peut avoir customSaveCallback, mais pas PersistenceConfig
                const persistenceConfig = persistenceRef.current;
                if (persistenceConfig) {
                    const customSaveCallback = 'customSaveCallback' in persistenceConfig
                        ? persistenceConfig.customSaveCallback
                        : undefined;
                    if (customSaveCallback &&
                        typeof customSaveCallback === 'function') {
                        // Use the custom save callback if provided
                        yield customSaveCallback(stateToSave, storageAdapter, keyPrefix);
                    }
                    else {
                        // Save all state in one key for simplicity (default behavior)
                        yield storageAdapter.setItem(`${keyPrefix}_all`, JSON.stringify(stateToSave));
                    }
                }
                else {
                    // If no persistence config, use default behavior
                    yield storageAdapter.setItem(`${keyPrefix}_all`, JSON.stringify(stateToSave));
                }
                // Update reference for future comparisons
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
                // Appeler le callback d'erreur si fourni
                const config = persistenceRef.current;
                if (config === null || config === void 0 ? void 0 : config.onSaveError) {
                    config.onSaveError(errorObj, stateToSave);
                }
            }
        });
        // Return debounced version if needed
        return debounceTime > 0 ? (0, utils_1.debounce)(save, debounceTime) : save;
    }, [
        storageAdapter,
        keyPrefix,
        shouldSaveOnChange,
        debug,
        debounceTime,
        filterPersistKeys,
    ]);
    // ✅ SIMPLE: stable setState with useCallback
    const setState = (0, react_1.useCallback)((updater) => {
        setStateRaw(prevState => {
            const nextState = typeof updater === 'function' ? updater(prevState) : updater;
            // Trigger persistence if needed
            if (shouldSaveOnChange) {
                saveStateToStorage(nextState);
            }
            // Debug logging
            if (debug) {
                console.log('[FusionState] State updated:', {
                    previous: prevState,
                    next: nextState,
                    diff: Object.fromEntries(Object.entries(nextState).filter(([key, value]) => prevState[key] !== value)),
                });
            }
            return nextState;
        });
    }, [debug, shouldSaveOnChange, saveStateToStorage]);
    const value = (0, react_1.useMemo)(() => ({
        state,
        setState,
        initializingKeys: initializingKeys.current,
    }), [state]);
    return (react_1.default.createElement(GlobalStateContext.Provider, { value: value }, children));
});
//# sourceMappingURL=FusionStateProvider.js.map