"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFusionState = void 0;
const react_1 = require("react");
const FusionStateProvider_1 = require("@core/FusionStateProvider");
const types_1 = require("@core/types");
const utils_1 = require("@core/utils");
/**
 * Custom hook to manage a piece of state within the global fusion state.
 *
 * @template T - The type of the state value.
 * @param {string} key - The key for the state value in the global state.
 * @param {T} [initialValue] - The initial value for the state if it is not already set.
 * @param {UseFusionStateOptions} [options] - Additional options for the hook.
 * @returns {[T, StateUpdater<T>]} - Returns the current state value and a function to update it.
 * @throws Will throw an error if the key is already being initialized or if the key does not exist and no initial value is provided.
 */
function useFusionState(key, initialValue, options) {
    var _a;
    const { state, setState, initializingKeys } = (0, FusionStateProvider_1.useGlobalState)();
    const skipLocalState = (_a = options === null || options === void 0 ? void 0 : options.skipLocalState) !== null && _a !== void 0 ? _a : false;
    // Simplified initialization
    (0, react_1.useEffect)(() => {
        if (initialValue !== undefined && !(key in state)) {
            if (initializingKeys.has(key)) {
                throw new Error((0, utils_1.formatErrorMessage)(types_1.FusionStateErrorMessages.KEY_ALREADY_INITIALIZING, key));
            }
            setState(prev => (Object.assign(Object.assign({}, prev), { [key]: initialValue })));
        }
        else if (!(key in state) && initialValue === undefined) {
            throw new Error((0, utils_1.formatErrorMessage)(types_1.FusionStateErrorMessages.KEY_MISSING_NO_INITIAL, key));
        }
    }, [key, initialValue, state, setState, initializingKeys]);
    // Use local state only if not skipping it (performance optimization)
    const [localValue, setLocalValue] = (0, react_1.useState)(() => state[key]);
    (0, react_1.useEffect)(() => {
        if (!skipLocalState) {
            const newValue = state[key];
            if (newValue !== localValue) {
                setLocalValue(newValue);
            }
        }
    }, [state, key, localValue, skipLocalState]);
    // State update function with performance optimization
    const setValue = (0, react_1.useCallback)(newValue => {
        setState(prevState => {
            const currentValue = prevState[key];
            const nextValue = typeof newValue === 'function'
                ? newValue(currentValue)
                : newValue;
            // Only update if the value has changed
            if (nextValue === currentValue) {
                return prevState;
            }
            return Object.assign(Object.assign({}, prevState), { [key]: nextValue });
        });
    }, [key, setState]);
    // Return either global state directly (if skipping local) or synchronized local state
    return [skipLocalState ? state[key] : localValue, setValue];
}
exports.useFusionState = useFusionState;
//# sourceMappingURL=useFusionState.js.map