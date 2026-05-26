"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFusionStateLog = void 0;
const FusionStateProvider_1 = require("./FusionStateProvider");
const react_1 = require("react");
const utils_1 = require("./utils");
/**
 * Hook to observe and track changes in the global fusion state
 *
 * @param keys - Optional array of keys to watch (if undefined, watches all keys)
 * @param options - Additional configuration options
 * @returns The selected state from the global state
 */
const useFusionStateLog = (keys, options = {}) => {
    const { state } = (0, FusionStateProvider_1.useGlobalState)();
    // Stable hash for the keys array so identical key lists across renders
    // don't bust the memo (caller doesn't have to memoize the array).
    const keysHash = (0, react_1.useMemo)(() => {
        if (!keys || keys.length === 0)
            return '';
        return `${keys.length}:${keys.join('\u0001')}`;
    }, [keys]);
    // Filter state based on keys
    const filteredState = (0, react_1.useMemo)(() => {
        if (!keys || keys.length === 0) {
            return state;
        }
        const result = {};
        for (const key of keys) {
            if (key in state) {
                result[key] = state[key];
            }
        }
        return result;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, keysHash]);
    // Track previous state for change detection
    const previousState = (0, react_1.useRef)({});
    // Default options
    const { trackChanges = false, changeDetection = 'reference', formatter = undefined, consoleLog = false, } = options;
    // 'deep' and 'simple' are equivalent (simpleDeepEqual is an alias of customIsEqual).
    // Both go through the same path; 'reference' uses === for speed.
    const compareValues = (0, react_1.useCallback)((a, b) => {
        return changeDetection === 'reference' ? a === b : (0, utils_1.simpleDeepEqual)(a, b);
    }, [changeDetection]);
    (0, react_1.useEffect)(() => {
        let changes;
        if (trackChanges) {
            changes = {};
            for (const [key, value] of Object.entries(filteredState)) {
                const prevValue = previousState.current[key];
                if (!compareValues(value, prevValue)) {
                    changes[key] = {
                        previous: prevValue,
                        current: value,
                    };
                }
            }
            if (Object.keys(changes).length === 0) {
                changes = undefined;
            }
        }
        previousState.current = Object.assign({}, filteredState);
        if (consoleLog && (changes || !trackChanges)) {
            const logData = formatter
                ? formatter(filteredState, changes)
                : Object.assign({ state: filteredState }, (changes && { changes }));
            console.log('[FusionState Log]', logData);
        }
    }, [filteredState, trackChanges, consoleLog, formatter, compareValues]);
    return filteredState;
};
exports.useFusionStateLog = useFusionStateLog;
//# sourceMappingURL=useFusionStateLog.js.map