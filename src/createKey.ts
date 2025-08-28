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
export function createKey<T = unknown>(key: string): TypedKey<T> {
  return {
    __type: undefined as any as T,
    key,
    __brand: 'FusionStateKey',
  };
}

/** Type guard to check if a value is a typed key */
export function isTypedKey(value: any): value is TypedKey {
  return (
    value &&
    typeof value === 'object' &&
    value.__brand === 'FusionStateKey' &&
    typeof value.key === 'string'
  );
}

/** Extracts key name from TypedKey or returns string directly */
export function extractKeyName(keyOrString: string | TypedKey): string {
  return isTypedKey(keyOrString) ? keyOrString.key : keyOrString;
}

// Example predefined keys
export const AppKeys = {
  user: createKey<{id: number; name: string; email: string} | null>('user'),
  cart: createKey<Array<{id: number; quantity: number}>>('cart'),
  theme: createKey<'light' | 'dark'>('theme'),
  settings: createKey<{notifications: boolean; language: string}>('settings'),
} as const;

export type ExtractKeyType<K> = K extends TypedKey<infer T> ? T : never;
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
