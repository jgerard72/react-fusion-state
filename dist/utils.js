"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleDeepEqual = exports.deepClone = exports.debounce = exports.formatErrorMessage = void 0;
const lodash_isequal_1 = __importDefault(require("lodash.isequal"));
/**
 * Format error messages - simplified version
 */
const formatErrorMessage = (message, ...values) => {
    return values.reduce((msg, value, index) => msg.replace(`{${index}}`, value), message);
};
exports.formatErrorMessage = formatErrorMessage;
/**
 * Simplified debounce function
 */
function debounce(fn, delay) {
    let timer = null;
    return (...args) => {
        if (timer)
            clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
exports.debounce = debounce;
/**
 * Simplified deep clone
 */
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));
exports.deepClone = deepClone;
/**
 * Optimized deep comparison
 */
const simpleDeepEqual = (a, b) => a === b || (0, lodash_isequal_1.default)(a, b);
exports.simpleDeepEqual = simpleDeepEqual;
//# sourceMappingURL=utils.js.map