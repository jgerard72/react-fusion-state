"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FusionStateProvider = exports.useGlobalState = void 0;
const react_1 = __importStar(require("react"));
// Create context with undefined default
const GlobalStateContext = (0, react_1.createContext)(undefined);
// Custom hook for accessing global state
const useGlobalState = () => {
    const context = (0, react_1.useContext)(GlobalStateContext);
    if (!context) {
        throw new Error('ReactFusionState Error: useFusionState must be used within a FusionStateProvider');
    }
    return context;
};
exports.useGlobalState = useGlobalState;
// Provider component
const FusionStateProvider = ({ children }) => {
    const [state, setState] = (0, react_1.useState)({});
    const initializingKeys = (0, react_1.useRef)(new Set());
    const value = {
        state,
        setState,
        initializingKeys: initializingKeys.current,
    };
    return (react_1.default.createElement(GlobalStateContext.Provider, { value: value }, children));
};
exports.FusionStateProvider = FusionStateProvider;
