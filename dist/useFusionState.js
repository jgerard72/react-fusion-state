"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFusionState = void 0;
const FusionStateProvider_1 = require("./FusionStateProvider");
const react_1 = require("react");
const useFusionState = (key, initialValue) => {
    const { state, setState, initializingKeys } = (0, FusionStateProvider_1.useGlobalState)();
    const isInitialized = (0, react_1.useRef)(false);
    const localValue = (0, react_1.useMemo)(() => {
        if (state[key] !== undefined) {
            return state[key];
        }
        else if (initialValue !== undefined) {
            return initialValue;
        }
        else {
            return undefined;
        }
    }, [key, state, initialValue]);
    (0, react_1.useEffect)(() => {
        if (!isInitialized.current) {
            if (initialValue !== undefined) {
                if (initializingKeys.has(key) || state[key] !== undefined) {
                    throw new Error(`ReactFusionState Error : Key "${key}" already exists.`);
                }
                initializingKeys.add(key);
                setState((prevState) => {
                    const newState = Object.assign(Object.assign({}, prevState), { [key]: initialValue });
                    initializingKeys.delete(key);
                    return newState;
                });
            }
            else if (state[key] === undefined) {
                throw new Error(`ReactFusionState Error : Key "${key}" does not exist and no initial value provided.`);
            }
            isInitialized.current = true;
        }
    }, [key, state, initialValue, setState, initializingKeys]);
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
