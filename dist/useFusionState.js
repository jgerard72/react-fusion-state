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
const createKey_1 = require("./createKey");
function useFusionState(keyInput, initialValue, options) {
    const key = (0, createKey_1.extractKeyName)(keyInput);
    const { state, setState, initializingKeys, subscribeKey, getKeySnapshot } = (0, FusionStateProvider_1.useGlobalState)();
    const { persist = false, adapter = (0, autoDetect_1.detectBestStorageAdapter)(options === null || options === void 0 ? void 0 : options.debug), keyPrefix = 'fusion_persistent', debounceTime = 300, debug = false, } = options || {};
    const storageKey = `${keyPrefix}_${key}`;
    const isInitialized = (0, react_1.useRef)(false);
    const saveTimeoutRef = (0, react_1.useRef)(null);
    const saveToStorage = (0, react_1.useCallback)((value) => {
        if (!persist)
            return;
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
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
                    setState(prev => (Object.assign(Object.assign({}, prev), { [key]: parsedValue })));
                    return;
                }
            }
            catch (error) {
                if (debug) {
                    console.warn(`[FusionState] Failed to load ${key}:`, error);
                }
            }
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
    (0, react_1.useEffect)(() => {
        if (persist)
            return;
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
    }, [key, initialValue, persist, state, initializingKeys, setState]);
    const currentValue = (0, react_1.useSyncExternalStore)(listener => subscribeKey(key, listener), () => getKeySnapshot(key), () => undefined);
    const setValue = (0, react_1.useCallback)(newValue => {
        setState(prevState => {
            const currentValue = prevState[key];
            const nextValue = typeof newValue === 'function'
                ? newValue(currentValue)
                : newValue;
            if (nextValue === currentValue) {
                return prevState;
            }
            if (typeof nextValue === 'object' &&
                nextValue !== null &&
                typeof currentValue === 'object' &&
                currentValue !== null) {
                if ((0, utils_1.simpleDeepEqual)(nextValue, currentValue)) {
                    return prevState;
                }
            }
            saveToStorage(nextValue);
            return Object.assign(Object.assign({}, prevState), { [key]: nextValue });
        });
    }, [key, setState, saveToStorage]);
    (0, react_1.useEffect)(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);
    return [currentValue, setValue];
}
exports.useFusionState = useFusionState;
//# sourceMappingURL=useFusionState.js.map