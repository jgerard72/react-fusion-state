"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserKeys = exports.createNamespacedKey = exports.AppKeys = exports.extractKeyName = exports.isTypedKey = exports.createKey = void 0;
/**
 * Creates a typed key for useFusionState with automatic type inference
 *
 * @template T - The type of the state value
 * @param key - Unique string identifier for the state
 * @returns A typed key that provides IntelliSense and type safety
 *
 * @example
 * ```tsx
 * const userKey = createKey<User | null>('user');
 * const [user, setUser] = useFusionState(userKey, null);
 * ```
 */
function createKey(key) {
    return {
        __type: undefined,
        key,
        __brand: 'FusionStateKey',
    };
}
exports.createKey = createKey;
/**
 * Type guard to check if a value is a typed key
 * @param value - Value to check
 * @returns True if the value is a TypedKey
 */
function isTypedKey(value) {
    return (value &&
        typeof value === 'object' &&
        value.__brand === 'FusionStateKey' &&
        typeof value.key === 'string');
}
exports.isTypedKey = isTypedKey;
/**
 * Extracts the key name from a TypedKey or returns the string directly
 * @param keyOrString - Either a string key or a TypedKey
 * @returns The string key name
 */
function extractKeyName(keyOrString) {
    return isTypedKey(keyOrString) ? keyOrString.key : keyOrString;
}
exports.extractKeyName = extractKeyName;
/**
 * Example predefined keys for common application state
 */
exports.AppKeys = {
    user: createKey('user'),
    cart: createKey('cart'),
    theme: createKey('theme'),
    settings: createKey('settings'),
};
/**
 * Creates a namespaced typed key to avoid naming collisions
 * @template T - The type of the state value
 * @param namespace - Namespace prefix for the key
 * @param key - The key name within the namespace
 * @returns A typed key with the format "namespace.key"
 */
function createNamespacedKey(namespace, key) {
    return createKey(`${namespace}.${key}`);
}
exports.createNamespacedKey = createNamespacedKey;
exports.UserKeys = {
    profile: createNamespacedKey('user', 'profile'),
    preferences: createNamespacedKey('user', 'preferences'),
};
//# sourceMappingURL=createKey.js.map