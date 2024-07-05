"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFusionState = void 0;
const FusionStateProvider_1 = require("./FusionStateProvider");
const react_1 = require("react");
const useFusionState = (key, initialValue) => {
    const { state, setState, initializingKeys } = (0, FusionStateProvider_1.useGlobalState)();
    const hasInitialized = (0, react_1.useRef)(false);
    const initializing = (0, react_1.useRef)(false);
    const initializeKey = (0, react_1.useCallback)(() => {
        if (initialValue !== undefined && state[key] === undefined) {
            console.log('process.env.NODE_ENV', process.env.NODE_ENV);
            console.log('key', key, 'initializingKeys.has(key)', initializingKeys.has(key));
            if (initializingKeys.has(key)) {
                const errorMessage = `ReactFusionState Warning : Key "${key}" already exists.`;
                if (process.env.NODE_ENV === 'development') {
                    console.warn(errorMessage);
                }
                else {
                    throw new Error(errorMessage);
                }
                return initialValue;
            }
            else {
                console.log('initializing Key', key, 'initialValue', initialValue);
                initializing.current = true;
                initializingKeys.add(key);
                setState((prevState) => {
                    const newState = Object.assign(Object.assign({}, prevState), { [key]: initialValue });
                    initializingKeys.delete(key);
                    initializing.current = false;
                    return newState;
                });
                hasInitialized.current = true;
                return initialValue;
            }
        }
        if (state[key] !== undefined) {
            hasInitialized.current = true;
            return state[key];
        }
        const errorMessage = `ReactFusionState Error: Key "${key}" does not exist and no initial value provided.`;
        if (process.env.NODE_ENV === 'development') {
            console.warn(errorMessage);
        }
        else {
            throw new Error(errorMessage);
        }
        return initialValue;
    }, [initialValue, state, key, initializingKeys, setState]);
    const [localValue, setLocalValue] = (0, react_1.useState)(() => state[key] !== undefined ? state[key] : initializeKey());
    (0, react_1.useEffect)(() => {
        if (!hasInitialized.current && state[key] === undefined) {
            const value = initializeKey();
            setLocalValue(value);
        }
        if (state[key] !== undefined) {
            setLocalValue(state[key]);
            hasInitialized.current = true;
        }
    }, [key, state, initializeKey]);
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
