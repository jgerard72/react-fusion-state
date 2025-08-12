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
exports.createMemoryStorageAdapter = exports.detectBestStorageAdapter = void 0;
const storageAdapters_1 = require("./storageAdapters");
/**
 * Automatically detects the most appropriate storage adapter
 * based on the runtime environment.
 *
 * @returns The best available storage adapter
 */
function detectBestStorageAdapter() {
    // Detect React Native first (more reliable)
    if (isReactNativeEnvironment()) {
        console.info('[FusionState] React Native environment detected. ' +
            'Use a custom AsyncStorage adapter for persistence.');
        return (0, storageAdapters_1.createNoopStorageAdapter)();
    }
    // Check if localStorage is available (browser environment)
    if (isWebEnvironment()) {
        try {
            // Test if localStorage is actually available (can be disabled)
            window.localStorage.setItem('fusion_test', 'test');
            window.localStorage.removeItem('fusion_test');
            return (0, storageAdapters_1.createLocalStorageAdapter)();
        }
        catch (e) {
            console.warn('[FusionState] localStorage detected but not available:', e);
        }
    }
    // Fallback: use a no-op adapter
    console.info('[FusionState] No storage detected, using memory-only mode.');
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
    return (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined');
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