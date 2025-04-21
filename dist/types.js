"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FusionStateErrorMessages = void 0;
/** Messages d'erreur enum pour des rapports d'erreur cohérents */
var FusionStateErrorMessages;
(function (FusionStateErrorMessages) {
    FusionStateErrorMessages["PROVIDER_MISSING"] = "ReactFusionState Error: useFusionState must be used within a FusionStateProvider";
    FusionStateErrorMessages["KEY_ALREADY_INITIALIZING"] = "ReactFusionState Error: Key \"{0}\" is already being initialized. Consider checking if the key is being initialized elsewhere or if there's a logic error.";
    FusionStateErrorMessages["KEY_MISSING_NO_INITIAL"] = "ReactFusionState Error: Key \"{0}\" does not exist and no initial value provided. Ensure the key is initialized with a value before use.";
    FusionStateErrorMessages["PERSISTENCE_READ_ERROR"] = "ReactFusionState Error: Failed to read state from storage: {0}";
    FusionStateErrorMessages["PERSISTENCE_WRITE_ERROR"] = "ReactFusionState Error: Failed to write state to storage: {0}";
    FusionStateErrorMessages["STORAGE_ADAPTER_MISSING"] = "ReactFusionState Error: Storage adapter is required for persistence configuration";
})(FusionStateErrorMessages = exports.FusionStateErrorMessages || (exports.FusionStateErrorMessages = {}));
//# sourceMappingURL=types.js.map