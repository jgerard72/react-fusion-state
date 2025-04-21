"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleDeepEqual = exports.deepClone = exports.debounce = exports.formatErrorMessage = void 0;
/**
 * Formats error messages by replacing placeholders with actual values
 * @param message - Error message template with placeholders
 * @param values - Values to replace placeholders
 * @returns Formatted error message
 */
const formatErrorMessage = (message, ...values) => {
    return values.reduce((msg, value, index) => {
        return msg.replace(`{${index}}`, value);
    }, message);
};
exports.formatErrorMessage = formatErrorMessage;
/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last invocation.
 *
 * @param fn - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the function
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
 * Creates a deep copy of an object using JSON serialization.
 * Note: This will lose functions and other non-serializable values.
 *
 * @param obj - The object to clone
 * @returns A deep copy of the object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
exports.deepClone = deepClone;
/**
 * Checks if two values are deeply equal using JSON stringification.
 * This is simpler than full deep equality but sufficient for many cases.
 *
 * @param a - First value
 * @param b - Second value
 * @returns True if values are deeply equal
 */
function simpleDeepEqual(a, b) {
    if (a === b)
        return true;
    return JSON.stringify(a) === JSON.stringify(b);
}
exports.simpleDeepEqual = simpleDeepEqual;
//# sourceMappingURL=utils.js.map