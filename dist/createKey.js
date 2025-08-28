"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserKeys = exports.createNamespacedKey = exports.AppKeys = exports.extractKeyName = exports.isTypedKey = exports.createKey = void 0;
/**
 * Creates a typed key for useFusionState with automatic type inference
 */
function createKey(key) {
    return {
        __type: undefined,
        key,
        __brand: 'FusionStateKey',
    };
}
exports.createKey = createKey;
/** Type guard to check if a value is a typed key */
function isTypedKey(value) {
    return (value &&
        typeof value === 'object' &&
        value.__brand === 'FusionStateKey' &&
        typeof value.key === 'string');
}
exports.isTypedKey = isTypedKey;
/** Extracts key name from TypedKey or returns string directly */
function extractKeyName(keyOrString) {
    return isTypedKey(keyOrString) ? keyOrString.key : keyOrString;
}
exports.extractKeyName = extractKeyName;
// Example predefined keys
exports.AppKeys = {
    user: createKey('user'),
    cart: createKey('cart'),
    theme: createKey('theme'),
    settings: createKey('settings'),
};
function createNamespacedKey(namespace, key) {
    return createKey(`${namespace}.${key}`);
}
exports.createNamespacedKey = createNamespacedKey;
exports.UserKeys = {
    profile: createNamespacedKey('user', 'profile'),
    preferences: createNamespacedKey('user', 'preferences'),
};
//# sourceMappingURL=createKey.js.map