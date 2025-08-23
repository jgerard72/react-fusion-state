"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleDeepEqual = exports.customIsEqual = exports.deepClone = exports.debounce = exports.formatErrorMessage = void 0;
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
 * Custom lightweight deep equality check
 * Optimized for React Fusion State use cases - replaces lodash.isequal
 */
const customIsEqual = (a, b) => {
    // Same reference or primitive equality
    if (a === b)
        return true;
    // Null/undefined checks
    if (a == null || b == null)
        return a === b;
    // Different types
    if (typeof a !== typeof b)
        return false;
    // Primitives that aren't equal
    if (typeof a !== 'object')
        return false;
    // Arrays
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length)
            return false;
        for (let i = 0; i < a.length; i++) {
            if (!(0, exports.customIsEqual)(a[i], b[i]))
                return false;
        }
        return true;
    }
    // Not arrays but one is
    if (Array.isArray(b))
        return false;
    // Objects
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length)
        return false;
    for (const key of keysA) {
        if (!keysB.includes(key))
            return false;
        if (!(0, exports.customIsEqual)(a[key], b[key]))
            return false;
    }
    return true;
};
exports.customIsEqual = customIsEqual;
/**
 * Optimized deep comparison
 */
const simpleDeepEqual = (a, b) => a === b || (0, exports.customIsEqual)(a, b);
exports.simpleDeepEqual = simpleDeepEqual;
//# sourceMappingURL=utils.js.map