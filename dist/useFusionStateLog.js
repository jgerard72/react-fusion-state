"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFusionStateLog = void 0;
const FusionStateProvider_1 = require("@core/FusionStateProvider");
const react_1 = require("react");
const lodash_isequal_1 = __importDefault(require("lodash.isequal"));
const utils_1 = require("@core/utils");
/**
 * Hook to observe and track changes in the global fusion state
 *
 * @param keys - Optional array of keys to watch (if undefined, watches all keys)
 * @param options - Additional configuration options
 * @returns The selected state from the global state
 */
const useFusionStateLog = (keys, options = {}) => {
    const { state } = (0, FusionStateProvider_1.useGlobalState)();
    const [selectedState, setSelectedState] = (0, react_1.useState)({});
    // Track previous state for change detection
    const previousState = (0, react_1.useRef)({});
    const previousKeys = (0, react_1.useRef)(undefined);
    // Default options
    const { trackChanges = false, changeDetection = 'reference', formatter = undefined, consoleLog = false, } = options;
    // Compare values based on selected change detection method
    const compareValues = (0, react_1.useCallback)((a, b) => {
        if (changeDetection === 'reference') {
            return a === b;
        }
        else if (changeDetection === 'deep') {
            return (0, lodash_isequal_1.default)(a, b);
        }
        else {
            return (0, utils_1.simpleDeepEqual)(a, b);
        }
    }, [changeDetection]);
    // Filter state based on keys
    const filteredState = (0, react_1.useMemo)(() => {
        // If keys are the same as before, don't recalculate
        if (keys && (0, lodash_isequal_1.default)(keys, previousKeys.current)) {
            return undefined; // Skip calculation, will handle in useEffect
        }
        // If no keys provided, use the entire state
        if (!keys || keys.length === 0) {
            return state;
        }
        // Otherwise, filter to include only the requested keys
        const result = {};
        keys.forEach(key => {
            if (key in state) {
                result[key] = state[key];
            }
        });
        previousKeys.current = keys;
        return result;
    }, [state, keys]);
    (0, react_1.useEffect)(() => {
        if (!filteredState)
            return; // Skip if no new filtered state
        // Calculate changes if needed
        let changes;
        if (trackChanges) {
            changes = {};
            Object.entries(filteredState).forEach(([key, value]) => {
                const prevValue = previousState.current[key];
                const hasChanged = !compareValues(value, prevValue);
                if (hasChanged) {
                    changes[key] = {
                        previous: prevValue,
                        current: value,
                    };
                }
            });
            // If no changes detected, don't update
            if (Object.keys(changes).length === 0) {
                changes = undefined;
            }
        }
        // Update selected state with filtered state
        setSelectedState(filteredState);
        // Save current state as previous for next comparison
        previousState.current = Object.assign({}, filteredState);
        // Log to console if enabled
        if (consoleLog && (changes || !trackChanges)) {
            const logData = formatter
                ? formatter(filteredState, changes)
                : Object.assign({ state: filteredState }, (changes && { changes }));
            console.log('[FusionState Log]', logData);
        }
    }, [filteredState, trackChanges, consoleLog, formatter, compareValues]);
    return selectedState;
};
exports.useFusionStateLog = useFusionStateLog;
//# sourceMappingURL=useFusionStateLog.js.map