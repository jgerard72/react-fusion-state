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
exports.createMemoryStorageAdapter = exports.detectBestStorageAdapter = exports.isSSREnvironment = void 0;
const storageAdapters_1 = require("./storageAdapters");
const asyncStorageAdapter_1 = require("./asyncStorageAdapter");
/**
 * Detects if we are in a Server-Side Rendering environment
 * @returns true if running on server (Node.js), false if running in browser or React Native
 */
function isSSREnvironment() {
    // React Native also has no window, but has navigator.product === 'ReactNative'
    if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        return false;
    }
    return typeof window === 'undefined';
}
exports.isSSREnvironment = isSSREnvironment;
/**
 * Automatically detects the most appropriate storage adapter
 * based on the runtime environment.
 *
 * @param debug - Whether to enable debug logging
 * @returns The best available storage adapter
 */
function detectBestStorageAdapter(debug = false) {
    // 🔥 SSR Detection first (prevents server crashes)
    if (isSSREnvironment()) {
        if (debug) {
            console.info('[FusionState] SSR environment detected, using memory-only mode.');
        }
        return (0, storageAdapters_1.createNoopStorageAdapter)();
    }
    // Detect React Native second (more reliable)
    if (isReactNativeEnvironment()) {
        // Try to auto-load AsyncStorage if available
        try {
            // Avoid static resolution by bundlers; resolve only at runtime in RN
            const req = Function('try { return typeof require !== "undefined" && require; } catch(_) { return undefined; }')();
            const modName = '@react-native-async-storage/async-storage';
            const AsyncStorage = req ? req(modName) : undefined;
            if (AsyncStorage) {
                if (debug) {
                    console.info('[FusionState] Using AsyncStorage adapter (auto-detected).');
                }
                const asImpl = (AsyncStorage.default || AsyncStorage);
                return (0, asyncStorageAdapter_1.createAsyncStorageAdapter)(asImpl, debug);
            }
            if (debug) {
                console.info('[FusionState] React Native detected but AsyncStorage not found. Falling back to memory adapter. ');
            }
        }
        catch (e) {
            if (debug) {
                console.warn('[FusionState] Failed to load AsyncStorage adapter:', e);
            }
        }
        return (0, storageAdapters_1.createNoopStorageAdapter)();
    }
    // Check if localStorage is available (browser environment)
    if (isWebEnvironment()) {
        try {
            // Test if localStorage is actually available (can be disabled)
            window.localStorage.setItem('fusion_test', 'test');
            window.localStorage.removeItem('fusion_test');
            return (0, storageAdapters_1.createLocalStorageAdapter)(debug);
        }
        catch (e) {
            if (debug) {
                console.warn('[FusionState] localStorage detected but not available:', e);
            }
        }
    }
    // Fallback: use a no-op adapter
    if (debug) {
        console.info('[FusionState] No storage detected, using memory-only mode.');
    }
    return (0, storageAdapters_1.createNoopStorageAdapter)();
}
exports.detectBestStorageAdapter = detectBestStorageAdapter;
/**
 * Detects if we are in a React Native environment
 */
function isReactNativeEnvironment() {
    // Method 1: Check navigator.product
    if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        return true;
    }
    // Method 2: Check existence of global without window
    if (typeof global !== 'undefined' && typeof window === 'undefined') {
        return true;
    }
    // Method 3: Check React Native specific APIs
    if (typeof global !== 'undefined' &&
        // @ts-ignore - Runtime check
        (global.__fbBatchedBridge || global.nativeCallSyncHook)) {
        return true;
    }
    return false;
}
/**
 * Detects if we are in a web environment
 */
function isWebEnvironment() {
    try {
        return (typeof window !== 'undefined' &&
            typeof window.localStorage !== 'undefined');
    }
    catch (_a) {
        // localStorage can be disabled in some browsers
        return false;
    }
}
/**
 * Creates an in-memory storage adapter for tests or when
 * persistence is not available.
 *
 * @returns An adapter that stores data in memory
 */
function createMemoryStorageAdapter() {
    const storage = new Map();
    return {
        getItem(key) {
            return __awaiter(this, void 0, void 0, function* () {
                return storage.has(key) ? storage.get(key) : null;
            });
        },
        setItem(key, value) {
            return __awaiter(this, void 0, void 0, function* () {
                storage.set(key, value);
            });
        },
        removeItem(key) {
            return __awaiter(this, void 0, void 0, function* () {
                storage.delete(key);
            });
        },
    };
}
exports.createMemoryStorageAdapter = createMemoryStorageAdapter;
//# sourceMappingURL=autoDetect.js.map