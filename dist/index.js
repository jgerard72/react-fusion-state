"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoDetectStorage = exports.createInMemoryAdapter = exports.createMobileStorageAdapter = exports.createRNStorageAdapter = exports.createWebStorageAdapter = exports.createAsyncStorageAdapter = exports.isSSREnvironment = exports.createMemoryStorageAdapter = exports.detectBestStorageAdapter = exports.NoopStorageAdapter = exports.createLocalStorageAdapter = exports.createNoopStorageAdapter = exports.simpleDeepEqual = exports.debounce = exports.formatErrorMessage = exports.PersistenceError = exports.FusionStateError = exports.FusionStateErrorMessages = exports.AppStateProvider = exports.StateProvider = exports.GlobalStateProvider = exports.useAppState = exports.usePersistentState = exports.useSharedState = exports.useFusionStateLog = exports.useGlobalState = exports.FusionStateProvider = exports.useFusionState = void 0;
// Core hooks
var useFusionState_1 = require("./useFusionState");
Object.defineProperty(exports, "useFusionState", { enumerable: true, get: function () { return useFusionState_1.useFusionState; } });
var FusionStateProvider_1 = require("./FusionStateProvider");
Object.defineProperty(exports, "FusionStateProvider", { enumerable: true, get: function () { return FusionStateProvider_1.FusionStateProvider; } });
Object.defineProperty(exports, "useGlobalState", { enumerable: true, get: function () { return FusionStateProvider_1.useGlobalState; } });
var useFusionStateLog_1 = require("./useFusionStateLog");
Object.defineProperty(exports, "useFusionStateLog", { enumerable: true, get: function () { return useFusionStateLog_1.useFusionStateLog; } });
// ✅ AUTOMATIC OPTIMIZATIONS: Built into useFusionState
// No need for separate hooks, everything is optimized automatically!
// Convenient aliases for different use cases
var useFusionState_2 = require("./useFusionState");
Object.defineProperty(exports, "useSharedState", { enumerable: true, get: function () { return useFusionState_2.useFusionState; } });
var useFusionState_3 = require("./useFusionState");
Object.defineProperty(exports, "usePersistentState", { enumerable: true, get: function () { return useFusionState_3.useFusionState; } });
var useFusionState_4 = require("./useFusionState");
Object.defineProperty(exports, "useAppState", { enumerable: true, get: function () { return useFusionState_4.useFusionState; } });
var FusionStateProvider_2 = require("./FusionStateProvider");
Object.defineProperty(exports, "GlobalStateProvider", { enumerable: true, get: function () { return FusionStateProvider_2.FusionStateProvider; } });
var FusionStateProvider_3 = require("./FusionStateProvider");
Object.defineProperty(exports, "StateProvider", { enumerable: true, get: function () { return FusionStateProvider_3.FusionStateProvider; } });
var FusionStateProvider_4 = require("./FusionStateProvider");
Object.defineProperty(exports, "AppStateProvider", { enumerable: true, get: function () { return FusionStateProvider_4.FusionStateProvider; } });
var types_1 = require("./types");
Object.defineProperty(exports, "FusionStateErrorMessages", { enumerable: true, get: function () { return types_1.FusionStateErrorMessages; } });
Object.defineProperty(exports, "FusionStateError", { enumerable: true, get: function () { return types_1.FusionStateError; } });
Object.defineProperty(exports, "PersistenceError", { enumerable: true, get: function () { return types_1.PersistenceError; } });
// Utilities
var utils_1 = require("./utils");
Object.defineProperty(exports, "formatErrorMessage", { enumerable: true, get: function () { return utils_1.formatErrorMessage; } });
Object.defineProperty(exports, "debounce", { enumerable: true, get: function () { return utils_1.debounce; } });
Object.defineProperty(exports, "simpleDeepEqual", { enumerable: true, get: function () { return utils_1.simpleDeepEqual; } });
// ✅ SIMPLE: No complex middleware
// Persistence exports
var storageAdapters_1 = require("./storage/storageAdapters");
Object.defineProperty(exports, "createNoopStorageAdapter", { enumerable: true, get: function () { return storageAdapters_1.createNoopStorageAdapter; } });
Object.defineProperty(exports, "createLocalStorageAdapter", { enumerable: true, get: function () { return storageAdapters_1.createLocalStorageAdapter; } });
// For backward compatibility
Object.defineProperty(exports, "NoopStorageAdapter", { enumerable: true, get: function () { return storageAdapters_1.NoopStorageAdapter; } });
var autoDetect_1 = require("./storage/autoDetect");
Object.defineProperty(exports, "detectBestStorageAdapter", { enumerable: true, get: function () { return autoDetect_1.detectBestStorageAdapter; } });
Object.defineProperty(exports, "createMemoryStorageAdapter", { enumerable: true, get: function () { return autoDetect_1.createMemoryStorageAdapter; } });
Object.defineProperty(exports, "isSSREnvironment", { enumerable: true, get: function () { return autoDetect_1.isSSREnvironment; } });
var asyncStorageAdapter_1 = require("./storage/asyncStorageAdapter");
Object.defineProperty(exports, "createAsyncStorageAdapter", { enumerable: true, get: function () { return asyncStorageAdapter_1.createAsyncStorageAdapter; } });
// Storage adapter aliases for convenience
var storageAdapters_2 = require("./storage/storageAdapters");
Object.defineProperty(exports, "createWebStorageAdapter", { enumerable: true, get: function () { return storageAdapters_2.createLocalStorageAdapter; } });
var asyncStorageAdapter_2 = require("./storage/asyncStorageAdapter");
Object.defineProperty(exports, "createRNStorageAdapter", { enumerable: true, get: function () { return asyncStorageAdapter_2.createAsyncStorageAdapter; } });
var asyncStorageAdapter_3 = require("./storage/asyncStorageAdapter");
Object.defineProperty(exports, "createMobileStorageAdapter", { enumerable: true, get: function () { return asyncStorageAdapter_3.createAsyncStorageAdapter; } });
var autoDetect_2 = require("./storage/autoDetect");
Object.defineProperty(exports, "createInMemoryAdapter", { enumerable: true, get: function () { return autoDetect_2.createMemoryStorageAdapter; } });
var autoDetect_3 = require("./storage/autoDetect");
Object.defineProperty(exports, "autoDetectStorage", { enumerable: true, get: function () { return autoDetect_3.detectBestStorageAdapter; } });
//# sourceMappingURL=index.js.map