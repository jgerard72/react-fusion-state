"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFusionState = void 0;
const react_1 = require("react");
const FusionStateProvider_1 = require("./FusionStateProvider");
/**
 * Custom hook to manage a piece of state within the global state.
 *
 * @template T - The type of the state value.
 * @param {string} key - The key for the state value in the global state.
 * @param {T} [initialValue] - The initial value for the state if it is not already set.
 * @returns {[T, StateUpdater<T>]} - Returns the current state value and a function to update it.
 * @throws Will throw an error if the key is already being initialized or if the key does not exist and no initial value is provided.
 */
function useFusionState(key, initialValue) {
    const { state, setState, initializingKeys } = (0, FusionStateProvider_1.useGlobalState)();
    const isInitialized = (0, react_1.useRef)(false);
    const initializing = (0, react_1.useRef)(new Set());
    const initializeState = (0, react_1.useCallback)(() => {
        if (!isInitialized.current) {
            if (initialValue !== undefined && !(key in state)) {
                if (initializing.current.has(key)) {
                    throw new Error(`ReactFusionState Error: Key "${key}" is already being initialized. Consider checking if the key is being initialized elsewhere or if there's a logic error.`);
                }
                initializing.current.add(key);
                setState(prev => (Object.assign(Object.assign({}, prev), { [key]: initialValue })));
                initializing.current.delete(key);
                isInitialized.current = true;
            }
            else if (!(key in state)) {
                throw new Error(`ReactFusionState Error: Key "${key}" does not exist and no initial value provided. Ensure the key is initialized with a value before use.`);
            }
            else {
                isInitialized.current = true;
            }
        }
    }, [initialValue, key, state, setState]);
    (0, react_1.useEffect)(() => {
        initializeState();
    }, [initializeState]);
    const [localValue, setLocalValue] = (0, react_1.useState)(() => state[key]);
    (0, react_1.useEffect)(() => {
        const newValue = state[key];
        if (newValue !== localValue) {
            setLocalValue(newValue);
        }
    }, [state, key, localValue]);
    const setValue = (0, react_1.useCallback)(newValue => {
        setState(prevState => (Object.assign(Object.assign({}, prevState), { [key]: typeof newValue === 'function'
                ? newValue(prevState[key])
                : newValue })));
    }, [key, setState]);
    return [localValue, setValue];
}
exports.useFusionState = useFusionState;
