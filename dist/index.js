"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMemoryStorageAdapter = exports.detectBestStorageAdapter = exports.NoopStorageAdapter = exports.createLocalStorageAdapter = exports.createNoopStorageAdapter = exports.simpleDeepEqual = exports.debounce = exports.formatErrorMessage = exports.FusionStateErrorMessages = exports.useToggle = exports.useCounter = exports.useFormState = exports.useFrequentState = exports.usePersistentState = exports.useFusionStateLog = exports.useGlobalState = exports.FusionStateProvider = exports.useFusionState = void 0;
// Core hooks
var useFusionState_1 = require("@core/useFusionState");
Object.defineProperty(exports, "useFusionState", { enumerable: true, get: function () { return useFusionState_1.useFusionState; } });
var FusionStateProvider_1 = require("@core/FusionStateProvider");
Object.defineProperty(exports, "FusionStateProvider", { enumerable: true, get: function () { return FusionStateProvider_1.FusionStateProvider; } });
Object.defineProperty(exports, "useGlobalState", { enumerable: true, get: function () { return FusionStateProvider_1.useGlobalState; } });
var useFusionStateLog_1 = require("@core/useFusionStateLog");
Object.defineProperty(exports, "useFusionStateLog", { enumerable: true, get: function () { return useFusionStateLog_1.useFusionStateLog; } });
// Hooks composés (simplifiés)
var composedHooks_1 = require("@core/composedHooks");
Object.defineProperty(exports, "usePersistentState", { enumerable: true, get: function () { return composedHooks_1.usePersistentState; } });
Object.defineProperty(exports, "useFrequentState", { enumerable: true, get: function () { return composedHooks_1.useFrequentState; } });
Object.defineProperty(exports, "useFormState", { enumerable: true, get: function () { return composedHooks_1.useFormState; } });
Object.defineProperty(exports, "useCounter", { enumerable: true, get: function () { return composedHooks_1.useCounter; } });
Object.defineProperty(exports, "useToggle", { enumerable: true, get: function () { return composedHooks_1.useToggle; } });
var types_1 = require("@core/types");
Object.defineProperty(exports, "FusionStateErrorMessages", { enumerable: true, get: function () { return types_1.FusionStateErrorMessages; } });
// Utilitaires
var utils_1 = require("@core/utils");
Object.defineProperty(exports, "formatErrorMessage", { enumerable: true, get: function () { return utils_1.formatErrorMessage; } });
Object.defineProperty(exports, "debounce", { enumerable: true, get: function () { return utils_1.debounce; } });
Object.defineProperty(exports, "simpleDeepEqual", { enumerable: true, get: function () { return utils_1.simpleDeepEqual; } });
// Exports pour la persistance
var storageAdapters_1 = require("@storage/storageAdapters");
Object.defineProperty(exports, "createNoopStorageAdapter", { enumerable: true, get: function () { return storageAdapters_1.createNoopStorageAdapter; } });
Object.defineProperty(exports, "createLocalStorageAdapter", { enumerable: true, get: function () { return storageAdapters_1.createLocalStorageAdapter; } });
// Pour la compatibilité avec les versions précédentes
Object.defineProperty(exports, "NoopStorageAdapter", { enumerable: true, get: function () { return storageAdapters_1.NoopStorageAdapter; } });
var autoDetect_1 = require("@storage/autoDetect");
Object.defineProperty(exports, "detectBestStorageAdapter", { enumerable: true, get: function () { return autoDetect_1.detectBestStorageAdapter; } });
Object.defineProperty(exports, "createMemoryStorageAdapter", { enumerable: true, get: function () { return autoDetect_1.createMemoryStorageAdapter; } });
//# sourceMappingURL=index.js.map