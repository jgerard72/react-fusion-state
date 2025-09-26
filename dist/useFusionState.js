"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFusionState = void 0;
const react_1 = require("react");
const FusionStateProvider_1 = require("./FusionStateProvider");
const types_1 = require("./types");
const utils_1 = require("./utils");
const createKey_1 = require("./createKey");
function useFusionState(keyInput, initialValue, options) {
    const key = (0, createKey_1.extractKeyName)(keyInput);
    const { state, setState, initializingKeys, subscribeKey, getKeySnapshot, getServerSnapshot, } = (0, FusionStateProvider_1.useGlobalState)();
    const { shallow = false } = options || {};
    (0, react_1.useEffect)(() => {
        if (initialValue !== undefined && !(key in state)) {
            if (initializingKeys.has(key)) {
                throw new Error((0, utils_1.formatErrorMessage)(types_1.FusionStateErrorMessages.KEY_ALREADY_INITIALIZING, key));
            }
            initializingKeys.add(key);
            setState(prev => {
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
    }, [key, initialValue, state, initializingKeys, setState]);
    const currentValue = (0, react_1.useSyncExternalStore)(listener => subscribeKey(key, listener), () => getKeySnapshot(key), getServerSnapshot
        ? () => getServerSnapshot(key)
        : () => initialValue);
    const setValue = (0, react_1.useCallback)(newValue => {
        setState(prevState => {
            const currentValue = prevState[key];
            const nextValue = typeof newValue === 'function'
                ? newValue(currentValue)
                : newValue;
            if (Object.is(currentValue, nextValue)) {
                return prevState;
            }
            if (typeof nextValue === 'object' &&
                nextValue !== null &&
                typeof currentValue === 'object' &&
                currentValue !== null) {
                const isEqual = shallow
                    ? (0, utils_1.shallowEqual)(nextValue, currentValue)
                    : (0, utils_1.simpleDeepEqual)(nextValue, currentValue);
                if (isEqual) {
                    return prevState;
                }
            }
            return Object.assign(Object.assign({}, prevState), { [key]: nextValue });
        });
    }, [key, setState, shallow]);
    return [currentValue, setValue];
}
exports.useFusionState = useFusionState;
//# sourceMappingURL=useFusionState.js.map