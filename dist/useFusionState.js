"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFusionState = void 0;
const react_1 = require("react");
const FusionStateProvider_1 = require("./FusionStateProvider");
const types_1 = require("./types");
const utils_1 = require("./utils");
/**
 * Custom hook to manage a piece of state within the global fusion state.
 *
 * @template T - The type of the state value.
 * @param {string} key - The key for the state value in the global state.
 * @param {T} [initialValue] - The initial value for the state if it is not already set.
 * @returns {[T, StateUpdater<T>]} - Returns the current state value and a function to update it.
 * @throws Will throw an error if the key is already being initialized or if the key does not exist and no initial value is provided.
 */
function useFusionState(key, initialValue) {
    const { state, setState, initializingKeys } = (0, FusionStateProvider_1.useGlobalState)();
    // ✅ Optimized initialization with race condition handling
    (0, react_1.useEffect)(() => {
        if (initialValue !== undefined && !(key in state)) {
            if (initializingKeys.has(key)) {
                throw new Error((0, utils_1.formatErrorMessage)(types_1.FusionStateErrorMessages.KEY_ALREADY_INITIALIZING, key));
            }
            // Mark as initializing
            initializingKeys.add(key);
            setState(prev => {
                // Double-check to avoid race conditions
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
    }, [key, initialValue]); // ✅ Reduce dependencies to avoid loops
    // ✅ SIMPLE: Current state value
    const currentValue = state[key];
    // ✅ AUTOMATIC OPTIMIZATION: setValue with intelligent comparison
    const setValue = (0, react_1.useCallback)(newValue => {
        setState(prevState => {
            const currentValue = prevState[key];
            const nextValue = typeof newValue === 'function'
                ? newValue(currentValue)
                : newValue;
            // ✅ OPTIMIZATION: Automatic intelligent comparison
            // - Reference first (faster)
            // - Deep equality for objects if needed
            if (nextValue === currentValue) {
                return prevState; // Same reference = no change
            }
            // If it's an object, check content
            if (typeof nextValue === 'object' &&
                nextValue !== null &&
                typeof currentValue === 'object' &&
                currentValue !== null) {
                if ((0, utils_1.simpleDeepEqual)(nextValue, currentValue)) {
                    return prevState; // Same content = no change
                }
            }
            return Object.assign(Object.assign({}, prevState), { [key]: nextValue });
        });
    }, [key, setState]);
    // ✅ SIMPLE: Return current value and setter
    return [currentValue, setValue];
}
exports.useFusionState = useFusionState;
//# sourceMappingURL=useFusionState.js.map