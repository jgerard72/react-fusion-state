/**
 * Typed key system for React Fusion State
 * Provides automatic type inference while maintaining backward compatibility
 *
 * @template T - The type of the state value this key represents
 */
export interface TypedKey<T = unknown> {
    readonly __type: T;
    readonly key: string;
    readonly __brand: 'FusionStateKey';
}
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
export declare function createKey<T = unknown>(key: string): TypedKey<T>;
/**
 * Type guard to check if a value is a typed key
 * @param value - Value to check
 * @returns True if the value is a TypedKey
 */
export declare function isTypedKey(value: any): value is TypedKey;
/**
 * Extracts the key name from a TypedKey or returns the string directly
 * @param keyOrString - Either a string key or a TypedKey
 * @returns The string key name
 */
export declare function extractKeyName(keyOrString: string | TypedKey): string;
/**
 * Example predefined keys for common application state
 */
export declare const AppKeys: {
    readonly user: TypedKey<{
        id: number;
        name: string;
        email: string;
    } | null>;
    readonly cart: TypedKey<{
        id: number;
        quantity: number;
    }[]>;
    readonly theme: TypedKey<"light" | "dark">;
    readonly settings: TypedKey<{
        notifications: boolean;
        language: string;
    }>;
};
/**
 * Utility type to extract the type from a TypedKey
 */
export type ExtractKeyType<K> = K extends TypedKey<infer T> ? T : never;
/**
 * Creates a namespaced typed key to avoid naming collisions
 * @template T - The type of the state value
 * @param namespace - Namespace prefix for the key
 * @param key - The key name within the namespace
 * @returns A typed key with the format "namespace.key"
 */
export declare function createNamespacedKey<T = unknown>(namespace: string, key: string): TypedKey<T>;
export declare const UserKeys: {
    readonly profile: TypedKey<{
        name: string;
        avatar: string;
    }>;
    readonly preferences: TypedKey<{
        theme: string;
        lang: string;
    }>;
};
