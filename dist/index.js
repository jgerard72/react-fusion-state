"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAsyncStorageAdapter = exports.createMemoryStorageAdapter = exports.detectBestStorageAdapter = exports.NoopStorageAdapter = exports.createLocalStorageAdapter = exports.createNoopStorageAdapter = exports.simpleDeepEqual = exports.debounce = exports.formatErrorMessage = exports.PersistenceError = exports.FusionStateError = exports.FusionStateErrorMessages = exports.useFusionStateLog = exports.useGlobalState = exports.FusionStateProvider = exports.useFusionState = void 0;
// Core hooks
var useFusionState_1 = require("@core/useFusionState");
Object.defineProperty(exports, "useFusionState", { enumerable: true, get: function () { return useFusionState_1.useFusionState; } });
var FusionStateProvider_1 = require("@core/FusionStateProvider");
Object.defineProperty(exports, "FusionStateProvider", { enumerable: true, get: function () { return FusionStateProvider_1.FusionStateProvider; } });
Object.defineProperty(exports, "useGlobalState", { enumerable: true, get: function () { return FusionStateProvider_1.useGlobalState; } });
var useFusionStateLog_1 = require("@core/useFusionStateLog");
Object.defineProperty(exports, "useFusionStateLog", { enumerable: true, get: function () { return useFusionStateLog_1.useFusionStateLog; } });
var types_1 = require("@core/types");
Object.defineProperty(exports, "FusionStateErrorMessages", { enumerable: true, get: function () { return types_1.FusionStateErrorMessages; } });
Object.defineProperty(exports, "FusionStateError", { enumerable: true, get: function () { return types_1.FusionStateError; } });
Object.defineProperty(exports, "PersistenceError", { enumerable: true, get: function () { return types_1.PersistenceError; } });
// Utilities
var utils_1 = require("@core/utils");
Object.defineProperty(exports, "formatErrorMessage", { enumerable: true, get: function () { return utils_1.formatErrorMessage; } });
Object.defineProperty(exports, "debounce", { enumerable: true, get: function () { return utils_1.debounce; } });
Object.defineProperty(exports, "simpleDeepEqual", { enumerable: true, get: function () { return utils_1.simpleDeepEqual; } });
// Persistence exports
var storageAdapters_1 = require("@storage/storageAdapters");
Object.defineProperty(exports, "createNoopStorageAdapter", { enumerable: true, get: function () { return storageAdapters_1.createNoopStorageAdapter; } });
Object.defineProperty(exports, "createLocalStorageAdapter", { enumerable: true, get: function () { return storageAdapters_1.createLocalStorageAdapter; } });
// For backward compatibility
Object.defineProperty(exports, "NoopStorageAdapter", { enumerable: true, get: function () { return storageAdapters_1.NoopStorageAdapter; } });
var autoDetect_1 = require("@storage/autoDetect");
Object.defineProperty(exports, "detectBestStorageAdapter", { enumerable: true, get: function () { return autoDetect_1.detectBestStorageAdapter; } });
Object.defineProperty(exports, "createMemoryStorageAdapter", { enumerable: true, get: function () { return autoDetect_1.createMemoryStorageAdapter; } });
var asyncStorageAdapter_1 = require("@storage/asyncStorageAdapter");
Object.defineProperty(exports, "createAsyncStorageAdapter", { enumerable: true, get: function () { return asyncStorageAdapter_1.createAsyncStorageAdapter; } });
//# sourceMappingURL=index.js.map