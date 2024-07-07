"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFusionState = void 0;
const FusionStateProvider_1 = require("./FusionStateProvider");
const react_1 = require("react");
const useFusionState = (key, initialValue) => {
    const { state, setState, initializingKeys } = (0, FusionStateProvider_1.useGlobalState)();
    const isInitialized = (0, react_1.useRef)(false);
    // Initialize the key synchronously
    if (!isInitialized.current) {
        if (initialValue !== undefined && state[key] === undefined) {
            if (initializingKeys.has(key) || state[key] !== undefined) {
                throw new Error(`ReactFusionState Error: Key "${key}" already exists.`);
            }
            initializingKeys.add(key);
            const newState = Object.assign(Object.assign({}, state), { [key]: initialValue });
            state[key] = initialValue; // Directly modify the state for synchronous initialization
            initializingKeys.delete(key);
            setState(newState); // Trigger re-render to apply the changes
            isInitialized.current = true;
        }
        else if (state[key] === undefined) {
            throw new Error(`ReactFusionState Error: Key "${key}" does not exist and no initial value provided.`);
        }
        else {
            isInitialized.current = true;
        }
    }
    const [localValue, setLocalValue] = (0, react_1.useState)(() => {
        return state[key];
    });
    (0, react_1.useEffect)(() => {
        if (state[key] !== localValue) {
            setLocalValue(state[key]);
        }
    }, [state, key, localValue]);
    const setValue = (0, react_1.useCallback)(newValue => {
        setState((prevState) => {
            const updatedValue = typeof newValue === 'function'
                ? newValue(prevState[key])
                : newValue;
            return Object.assign(Object.assign({}, prevState), { [key]: updatedValue });
        });
    }, [key, setState]);
    return [localValue, setValue];
};
exports.useFusionState = useFusionState;
