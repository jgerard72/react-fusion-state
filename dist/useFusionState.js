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
exports.useFusionState = void 0;
const react_1 = require("react");
const FusionStateProvider_1 = require("./FusionStateProvider");
const types_1 = require("./types");
const utils_1 = require("./utils");
const autoDetect_1 = require("./storage/autoDetect");
/**
 * Custom hook to manage a piece of state within the global fusion state.
 *
 * @template T - The type of the state value.
 * @param {string} key - The key for the state value in the global state.
 * @param {T} [initialValue] - The initial value for the state if it is not already set.
 * @param {UseFusionStateOptions} [options] - Optional configuration including persistence.
 * @returns {[T, StateUpdater<T>]} - Returns the current state value and a function to update it.
 * @throws Will throw an error if the key is already being initialized or if the key does not exist and no initial value is provided.
 */
function useFusionState(key, initialValue, options) {
    const { state, setState, initializingKeys } = (0, FusionStateProvider_1.useGlobalState)();
    // ✅ Persistence configuration
    const { persist = false, adapter = (0, autoDetect_1.detectBestStorageAdapter)(options === null || options === void 0 ? void 0 : options.debug), keyPrefix = 'fusion_persistent', debounceTime = 300, debug = false, } = options || {};
    const storageKey = `${keyPrefix}_${key}`;
    const isInitialized = (0, react_1.useRef)(false);
    const saveTimeoutRef = (0, react_1.useRef)(null);
    // ✅ Save to storage function with debounce (only if persist is enabled)
    const saveToStorage = (0, react_1.useCallback)((value) => {
        if (!persist)
            return;
        // Clear previous timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        // Set new timeout
        saveTimeoutRef.current = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            try {
                yield adapter.setItem(storageKey, JSON.stringify(value));
                if (debug) {
                    console.log(`[FusionState] Persisted ${key}:`, value);
                }
            }
            catch (error) {
                if (debug) {
                    console.error(`[FusionState] Failed to persist ${key}:`, error);
                }
            }
        }), debounceTime);
    }, [persist, adapter, storageKey, key, debounceTime, debug]);
    // ✅ Load from storage on initialization (only if persist is enabled)
    (0, react_1.useEffect)(() => {
        if (!persist || isInitialized.current)
            return;
        isInitialized.current = true;
        const loadFromStorage = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const storedValue = yield adapter.getItem(storageKey);
                if (storedValue !== null) {
                    const parsedValue = JSON.parse(storedValue);
                    if (debug) {
                        console.log(`[FusionState] Loaded ${key}:`, parsedValue);
                    }
                    // Initialize state with stored value
                    setState(prev => (Object.assign(Object.assign({}, prev), { [key]: parsedValue })));
                    return;
                }
            }
            catch (error) {
                if (debug) {
                    console.warn(`[FusionState] Failed to load ${key}:`, error);
                }
            }
            // Initialize with default value if no stored value or no persistence
            initializeWithDefault();
        });
        const initializeWithDefault = () => {
            if (initialValue !== undefined && !(key in state)) {
                if (initializingKeys.has(key)) {
                    throw new Error((0, utils_1.formatErrorMessage)(types_1.FusionStateErrorMessages.KEY_ALREADY_INITIALIZING, key));
                }
                initializingKeys.add(key);
                setState(prev => {
                    if (key in prev) {
                        initializingKeys.delete(key);
                        return prev;
                    }
                    const newState = Object.assign(Object.assign({}, prev), { [key]: initialValue });
                    initializingKeys.delete(key);
                    return newState;
                });
            }
            else if (!(key in state) && initialValue === undefined) {
                throw new Error((0, utils_1.formatErrorMessage)(types_1.FusionStateErrorMessages.KEY_MISSING_NO_INITIAL, key));
            }
        };
        if (persist) {
            loadFromStorage();
        }
        else {
            initializeWithDefault();
        }
    }, [
        key,
        initialValue,
        persist,
        adapter,
        storageKey,
        debug,
        setState,
        state,
        initializingKeys,
    ]);
    // ✅ Fallback initialization for non-persistent state
    (0, react_1.useEffect)(() => {
        if (persist)
            return; // Skip if persistence is handling initialization
        if (initialValue !== undefined && !(key in state)) {
            if (initializingKeys.has(key)) {
                throw new Error((0, utils_1.formatErrorMessage)(types_1.FusionStateErrorMessages.KEY_ALREADY_INITIALIZING, key));
            }
            // Mark as initializing
            initializingKeys.add(key);
            setState(prev => {
                // Double-check to avoid race conditions
                if (key in prev) {
                    initializingKeys.delete(key);
                    return prev;
                }
                const newState = Object.assign(Object.assign({}, prev), { [key]: initialValue });
                initializingKeys.delete(key);
                return newState;
            });
        }
        else if (!(key in state) && initialValue === undefined) {
            throw new Error((0, utils_1.formatErrorMessage)(types_1.FusionStateErrorMessages.KEY_MISSING_NO_INITIAL, key));
        }
    }, [key, initialValue, persist, state, initializingKeys, setState]);
    // ✅ SIMPLE: Current state value
    const currentValue = state[key];
    // ✅ AUTOMATIC OPTIMIZATION: setValue with intelligent comparison
    const setValue = (0, react_1.useCallback)(newValue => {
        setState(prevState => {
            const currentValue = prevState[key];
            const nextValue = typeof newValue === 'function'
                ? newValue(currentValue)
                : newValue;
            // ✅ OPTIMIZATION: Automatic intelligent comparison
            // - Reference first (faster)
            // - Deep equality for objects if needed
            if (nextValue === currentValue) {
                return prevState; // Same reference = no change
            }
            // If it's an object, check content
            if (typeof nextValue === 'object' &&
                nextValue !== null &&
                typeof currentValue === 'object' &&
                currentValue !== null) {
                if ((0, utils_1.simpleDeepEqual)(nextValue, currentValue)) {
                    return prevState; // Same content = no change
                }
            }
            // ✅ Save to storage if persistence is enabled
            saveToStorage(nextValue);
            return Object.assign(Object.assign({}, prevState), { [key]: nextValue });
        });
    }, [key, setState, saveToStorage]);
    // Cleanup timeout on unmount
    (0, react_1.useEffect)(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);
    // ✅ SIMPLE: Return current value and setter
    return [currentValue, setValue];
}
exports.useFusionState = useFusionState;
//# sourceMappingURL=useFusionState.js.map