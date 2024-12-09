"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFusionState = void 0;
const react_1 = require("react");
const FusionStateProvider_1 = require("./FusionStateProvider");
function useFusionState(key, initialValue) {
    const { state, setState, initializingKeys } = (0, FusionStateProvider_1.useGlobalState)();
    const isInitialized = (0, react_1.useRef)(false);
    const initializeState = (0, react_1.useCallback)(() => {
        if (!isInitialized.current) {
            if (initialValue !== undefined && !(key in state)) {
                if (initializingKeys.has(key)) {
                    throw new Error(`ReactFusionState Error: Key "${key}" already exists`);
                }
                initializingKeys.add(key);
                setState((prev) => (Object.assign(Object.assign({}, prev), { [key]: initialValue })));
                initializingKeys.delete(key);
                isInitialized.current = true;
            }
            else if (!(key in state)) {
                throw new Error(`ReactFusionState Error: Key "${key}" does not exist and no initial value provided`);
            }
            else {
                isInitialized.current = true;
            }
        }
    }, [initialValue, key, state, setState, initializingKeys]);
    (0, react_1.useEffect)(() => {
        initializeState();
    }, [initializeState]);
    const [localValue, setLocalValue] = (0, react_1.useState)(() => state[key]);
    (0, react_1.useEffect)(() => {
        const newValue = state[key];
        if (newValue !== localValue) {
            setLocalValue(newValue);
        }
    }, [state, key]);
    const setValue = (0, react_1.useCallback)((newValue) => {
        setState((prevState) => (Object.assign(Object.assign({}, prevState), { [key]: typeof newValue === 'function'
                ? newValue(prevState[key])
                : newValue })));
    }, [key, setState]);
    return [localValue, setValue];
}
exports.useFusionState = useFusionState;
