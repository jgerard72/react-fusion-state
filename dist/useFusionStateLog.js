"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFusionStateLog = void 0;
const FusionStateProvider_1 = require("./FusionStateProvider");
const react_1 = require("react");
const lodash_isequal_1 = __importDefault(require("lodash.isequal"));
const useFusionStateLog = (keys) => {
    const { state } = (0, FusionStateProvider_1.useGlobalState)();
    const [selectedState, setSelectedState] = (0, react_1.useState)({});
    const previousKeys = (0, react_1.useRef)(undefined);
    (0, react_1.useEffect)(() => {
        if (!keys || (0, lodash_isequal_1.default)(keys, previousKeys.current)) {
            setSelectedState(state);
        }
        else {
            const result = {};
            keys.forEach(key => {
                if (state.hasOwnProperty(key)) {
                    result[key] = state[key];
                }
            });
            setSelectedState(result);
        }
        previousKeys.current = keys;
    }, [state]);
    return selectedState;
};
exports.useFusionStateLog = useFusionStateLog;
