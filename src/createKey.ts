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
export function createKey<T = unknown>(key: string): TypedKey<T> {
  return {
    __type: undefined as any as T,
    key,
    __brand: 'FusionStateKey',
  };
}

/**
 * Type guard to check if a value is a typed key
 * @param value - Value to check
 * @returns True if the value is a TypedKey
 */
export function isTypedKey(value: any): value is TypedKey {
  return (
    value &&
    typeof value === 'object' &&
    value.__brand === 'FusionStateKey' &&
    typeof value.key === 'string'
  );
}

/**
 * Extracts the key name from a TypedKey or returns the string directly
 * @param keyOrString - Either a string key or a TypedKey
 * @returns The string key name
 */
export function extractKeyName(keyOrString: string | TypedKey): string {
  return isTypedKey(keyOrString) ? keyOrString.key : keyOrString;
}

/**
 * Example predefined keys for common application state
 */
export const AppKeys = {
  user: createKey<{id: number; name: string; email: string} | null>('user'),
  cart: createKey<Array<{id: number; quantity: number}>>('cart'),
  theme: createKey<'light' | 'dark'>('theme'),
  settings: createKey<{notifications: boolean; language: string}>('settings'),
} as const;

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
export function createNamespacedKey<T = unknown>(
  namespace: string,
  key: string,
): TypedKey<T> {
  return createKey<T>(`${namespace}.${key}`);
}

export const UserKeys = {
  profile: createNamespacedKey<{name: string; avatar: string}>(
    'user',
    'profile',
  ),
  preferences: createNamespacedKey<{theme: string; lang: string}>(
    'user',
    'preferences',
  ),
} as const;
