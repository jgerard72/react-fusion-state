"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFusionState = void 0;
const FusionStateProvider_1 = require("./FusionStateProvider");
const react_1 = require("react");
const useFusionState = (key, initialValue) => {
    const { state, setState, initializingKeys } = (0, FusionStateProvider_1.useGlobalState)();
    const isInitialized = (0, react_1.useRef)(false);
    // Initialisation synchrone de la clé si elle n'existe pas encore
    if (!isInitialized.current &&
        initialValue !== undefined &&
        state[key] === undefined) {
        if (initializingKeys.has(key)) {
            throw new Error(`ReactFusionState Error: Key "${key}" already exists.`);
        }
        initializingKeys.add(key);
        state[key] = initialValue;
        setState(prevState => (Object.assign(Object.assign({}, prevState), { [key]: initialValue })));
        initializingKeys.delete(key);
        isInitialized.current = true;
    }
    if (!isInitialized.current && state[key] === undefined) {
        throw new Error(`ReactFusionState Error: Key "${key}" does not exist and no initial value provided.`);
    }
    // Utilisation de useState pour le suivi local de la valeur
    const [localValue, setLocalValue] = (0, react_1.useState)(() => state[key]);
    // Synchronisation de localValue avec l'état global
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
