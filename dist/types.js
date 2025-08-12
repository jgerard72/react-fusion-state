"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistenceError = exports.FusionStateError = exports.FusionStateErrorMessages = void 0;
/** Error messages enum for consistent error reporting */
var FusionStateErrorMessages;
(function (FusionStateErrorMessages) {
    FusionStateErrorMessages["PROVIDER_MISSING"] = "ReactFusionState Error: useFusionState must be used within a FusionStateProvider";
    FusionStateErrorMessages["KEY_ALREADY_INITIALIZING"] = "ReactFusionState Error: Key \"{0}\" is already being initialized. Consider checking if the key is being initialized elsewhere or if there's a logic error.";
    FusionStateErrorMessages["KEY_MISSING_NO_INITIAL"] = "ReactFusionState Error: Key \"{0}\" does not exist and no initial value provided. Ensure the key is initialized with a value before use.";
    FusionStateErrorMessages["PERSISTENCE_READ_ERROR"] = "ReactFusionState Error: Failed to read state from storage: {0}";
    FusionStateErrorMessages["PERSISTENCE_WRITE_ERROR"] = "ReactFusionState Error: Failed to write state to storage: {0}";
    FusionStateErrorMessages["STORAGE_ADAPTER_MISSING"] = "ReactFusionState Error: Storage adapter is required for persistence configuration";
})(FusionStateErrorMessages = exports.FusionStateErrorMessages || (exports.FusionStateErrorMessages = {}));
/** Specific error types for React Fusion State */
class FusionStateError extends Error {
    constructor(code, message, context) {
        super(message);
        this.code = code;
        this.context = context;
        this.name = 'FusionStateError';
    }
}
exports.FusionStateError = FusionStateError;
/** Specific error for persistence issues */
class PersistenceError extends FusionStateError {
    constructor(message, operation, storageKey, context) {
        super(operation === 'read'
            ? 'PERSISTENCE_READ_ERROR'
            : 'PERSISTENCE_WRITE_ERROR', message, context);
        this.operation = operation;
        this.storageKey = storageKey;
        this.name = 'PersistenceError';
    }
}
exports.PersistenceError = PersistenceError;
//# sourceMappingURL=types.js.map