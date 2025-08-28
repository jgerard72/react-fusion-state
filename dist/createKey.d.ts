/**
 * Typed key system for React Fusion State v0.4.0+
 * Provides automatic type inference while maintaining backward compatibility
 */
export interface TypedKey<T = unknown> {
    readonly __type: T;
    readonly key: string;
    readonly __brand: 'FusionStateKey';
}
/**
 * Creates a typed key for useFusionState with automatic type inference
 */
export declare function createKey<T = unknown>(key: string): TypedKey<T>;
/** Type guard to check if a value is a typed key */
export declare function isTypedKey(value: any): value is TypedKey;
/** Extracts key name from TypedKey or returns string directly */
export declare function extractKeyName(keyOrString: string | TypedKey): string;
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
export type ExtractKeyType<K> = K extends TypedKey<infer T> ? T : never;
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
