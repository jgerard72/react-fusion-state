"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoDetectStorage = exports.createInMemoryAdapter = exports.createMobileStorageAdapter = exports.createRNStorageAdapter = exports.createWebStorageAdapter = exports.isSSREnvironment = exports.createMemoryStorageAdapter = exports.detectBestStorageAdapter = exports.NoopStorageAdapter = exports.createLocalStorageAdapter = exports.createNoopStorageAdapter = exports.simpleDeepEqual = exports.debounce = exports.formatErrorMessage = exports.PersistenceError = exports.FusionStateError = exports.FusionStateErrorMessages = exports.AppStateProvider = exports.StateProvider = exports.GlobalStateProvider = exports.useAppState = exports.usePersistentState = exports.useSharedState = exports.DevToolsActions = exports.useDevTools = exports.getDevTools = exports.createDevTools = exports.UserKeys = exports.AppKeys = exports.extractKeyName = exports.isTypedKey = exports.createNamespacedKey = exports.createKey = exports.useGlobalState = exports.useFusionHydrated = exports.useFusionStateLog = exports.createAsyncStorageAdapter = exports.createStore = exports.shallow = exports.useFusionStore = exports.FusionStateProvider = exports.useFusionState = void 0;
// Core API - v1.0 Ultra Simple
const useFusionState_1 = require("./useFusionState");
Object.defineProperty(exports, "useFusionState", { enumerable: true, get: function () { return useFusionState_1.useFusionState; } });
const FusionStateProvider_1 = require("./FusionStateProvider");
Object.defineProperty(exports, "FusionStateProvider", { enumerable: true, get: function () { return FusionStateProvider_1.FusionStateProvider; } });
const deprecation_1 = require("./utils/deprecation");
// v1.2 — Cross-key selectors (Zustand-style derived state)
var useFusionStore_1 = require("./useFusionStore");
Object.defineProperty(exports, "useFusionStore", { enumerable: true, get: function () { return useFusionStore_1.useFusionStore; } });
Object.defineProperty(exports, "shallow", { enumerable: true, get: function () { return useFusionStore_1.shallow; } });
// v1.4 — Multi-store factory (headless + per-store React bindings)
var createStore_1 = require("./store/createStore");
Object.defineProperty(exports, "createStore", { enumerable: true, get: function () { return createStore_1.createStore; } });
// React Native Support
const asyncStorageAdapter_1 = require("./storage/asyncStorageAdapter");
Object.defineProperty(exports, "createAsyncStorageAdapter", { enumerable: true, get: function () { return asyncStorageAdapter_1.createAsyncStorageAdapter; } });
// Advanced/Internal (backward compatibility only)
var useFusionStateLog_1 = require("./useFusionStateLog");
Object.defineProperty(exports, "useFusionStateLog", { enumerable: true, get: function () { return useFusionStateLog_1.useFusionStateLog; } });
var useFusionHydrated_1 = require("./useFusionHydrated");
Object.defineProperty(exports, "useFusionHydrated", { enumerable: true, get: function () { return useFusionHydrated_1.useFusionHydrated; } });
var FusionStateProvider_2 = require("./FusionStateProvider");
Object.defineProperty(exports, "useGlobalState", { enumerable: true, get: function () { return FusionStateProvider_2.useGlobalState; } });
var createKey_1 = require("./createKey");
Object.defineProperty(exports, "createKey", { enumerable: true, get: function () { return createKey_1.createKey; } });
Object.defineProperty(exports, "createNamespacedKey", { enumerable: true, get: function () { return createKey_1.createNamespacedKey; } });
Object.defineProperty(exports, "isTypedKey", { enumerable: true, get: function () { return createKey_1.isTypedKey; } });
Object.defineProperty(exports, "extractKeyName", { enumerable: true, get: function () { return createKey_1.extractKeyName; } });
Object.defineProperty(exports, "AppKeys", { enumerable: true, get: function () { return createKey_1.AppKeys; } });
Object.defineProperty(exports, "UserKeys", { enumerable: true, get: function () { return createKey_1.UserKeys; } });
var devtools_1 = require("./devtools");
Object.defineProperty(exports, "createDevTools", { enumerable: true, get: function () { return devtools_1.createDevTools; } });
Object.defineProperty(exports, "getDevTools", { enumerable: true, get: function () { return devtools_1.getDevTools; } });
Object.defineProperty(exports, "useDevTools", { enumerable: true, get: function () { return devtools_1.useDevTools; } });
Object.defineProperty(exports, "DevToolsActions", { enumerable: true, get: function () { return devtools_1.DevToolsActions; } });
/**
 * @deprecated Use {@link useFusionState} instead. Will be removed in v2.
 * Emits a one-time `console.warn` on first call (since v1.3.0).
 */
exports.useSharedState = (0, deprecation_1.deprecate)(useFusionState_1.useFusionState, 'useSharedState', 'useFusionState', 'hook');
/**
 * @deprecated Use {@link useFusionState} instead. Will be removed in v2.
 * Emits a one-time `console.warn` on first call (since v1.3.0).
 */
exports.usePersistentState = (0, deprecation_1.deprecate)(useFusionState_1.useFusionState, 'usePersistentState', 'useFusionState', 'hook');
/**
 * @deprecated Use {@link useFusionState} instead. Will be removed in v2.
 * Emits a one-time `console.warn` on first call (since v1.3.0).
 */
exports.useAppState = (0, deprecation_1.deprecate)(useFusionState_1.useFusionState, 'useAppState', 'useFusionState', 'hook');
/**
 * @deprecated Use {@link FusionStateProvider} instead. Will be removed in v2.
 * Emits a one-time `console.warn` on first mount (since v1.3.0).
 */
exports.GlobalStateProvider = (0, deprecation_1.deprecateComponent)(FusionStateProvider_1.FusionStateProvider, 'GlobalStateProvider', 'FusionStateProvider');
/**
 * @deprecated Use {@link FusionStateProvider} instead. Will be removed in v2.
 * Emits a one-time `console.warn` on first mount (since v1.3.0).
 */
exports.StateProvider = (0, deprecation_1.deprecateComponent)(FusionStateProvider_1.FusionStateProvider, 'StateProvider', 'FusionStateProvider');
/**
 * @deprecated Use {@link FusionStateProvider} instead. Will be removed in v2.
 * Emits a one-time `console.warn` on first mount (since v1.3.0).
 */
exports.AppStateProvider = (0, deprecation_1.deprecateComponent)(FusionStateProvider_1.FusionStateProvider, 'AppStateProvider', 'FusionStateProvider');
var types_1 = require("./types");
Object.defineProperty(exports, "FusionStateErrorMessages", { enumerable: true, get: function () { return types_1.FusionStateErrorMessages; } });
Object.defineProperty(exports, "FusionStateError", { enumerable: true, get: function () { return types_1.FusionStateError; } });
Object.defineProperty(exports, "PersistenceError", { enumerable: true, get: function () { return types_1.PersistenceError; } });
var utils_1 = require("./utils");
Object.defineProperty(exports, "formatErrorMessage", { enumerable: true, get: function () { return utils_1.formatErrorMessage; } });
Object.defineProperty(exports, "debounce", { enumerable: true, get: function () { return utils_1.debounce; } });
Object.defineProperty(exports, "simpleDeepEqual", { enumerable: true, get: function () { return utils_1.simpleDeepEqual; } });
const storageAdapters_1 = require("./storage/storageAdapters");
const autoDetect_1 = require("./storage/autoDetect");
var storageAdapters_2 = require("./storage/storageAdapters");
Object.defineProperty(exports, "createNoopStorageAdapter", { enumerable: true, get: function () { return storageAdapters_2.createNoopStorageAdapter; } });
Object.defineProperty(exports, "createLocalStorageAdapter", { enumerable: true, get: function () { return storageAdapters_2.createLocalStorageAdapter; } });
Object.defineProperty(exports, "NoopStorageAdapter", { enumerable: true, get: function () { return storageAdapters_2.NoopStorageAdapter; } });
var autoDetect_2 = require("./storage/autoDetect");
Object.defineProperty(exports, "detectBestStorageAdapter", { enumerable: true, get: function () { return autoDetect_2.detectBestStorageAdapter; } });
Object.defineProperty(exports, "createMemoryStorageAdapter", { enumerable: true, get: function () { return autoDetect_2.createMemoryStorageAdapter; } });
Object.defineProperty(exports, "isSSREnvironment", { enumerable: true, get: function () { return autoDetect_2.isSSREnvironment; } });
/**
 * @deprecated Use {@link createLocalStorageAdapter} instead. Will be removed in v2.
 * Emits a one-time `console.warn` on first call (since v1.3.0).
 */
exports.createWebStorageAdapter = (0, deprecation_1.deprecate)(storageAdapters_1.createLocalStorageAdapter, 'createWebStorageAdapter', 'createLocalStorageAdapter');
/**
 * @deprecated Use {@link createAsyncStorageAdapter} instead. Will be removed in v2.
 * Emits a one-time `console.warn` on first call (since v1.3.0).
 */
exports.createRNStorageAdapter = (0, deprecation_1.deprecate)(asyncStorageAdapter_1.createAsyncStorageAdapter, 'createRNStorageAdapter', 'createAsyncStorageAdapter');
/**
 * @deprecated Use {@link createAsyncStorageAdapter} instead. Will be removed in v2.
 * Emits a one-time `console.warn` on first call (since v1.3.0).
 */
exports.createMobileStorageAdapter = (0, deprecation_1.deprecate)(asyncStorageAdapter_1.createAsyncStorageAdapter, 'createMobileStorageAdapter', 'createAsyncStorageAdapter');
/**
 * @deprecated Use {@link createMemoryStorageAdapter} instead. Will be removed in v2.
 * Emits a one-time `console.warn` on first call (since v1.3.0).
 */
exports.createInMemoryAdapter = (0, deprecation_1.deprecate)(autoDetect_1.createMemoryStorageAdapter, 'createInMemoryAdapter', 'createMemoryStorageAdapter');
/**
 * @deprecated Use {@link detectBestStorageAdapter} instead. Will be removed in v2.
 * Emits a one-time `console.warn` on first call (since v1.3.0).
 */
exports.autoDetectStorage = (0, deprecation_1.deprecate)(autoDetect_1.detectBestStorageAdapter, 'autoDetectStorage', 'detectBestStorageAdapter');
//# sourceMappingURL=index.js.map