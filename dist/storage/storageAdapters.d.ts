/**
 * Interface for storage adapters that developers can implement
 * for their specific platform (web, React Native, Expo, etc.)
 */
export interface StorageAdapter {
    /**
     * Get a value from storage
     * @param key Storage key
     * @returns Promise that resolves to the stored value or null if not found
     */
    getItem: (key: string) => Promise<string | null>;
    /**
     * Save a value to storage
     * @param key Storage key
     * @param value Value to store (will be JSON stringified)
     * @returns Promise that resolves when storage is complete
     */
    setItem: (key: string, value: string) => Promise<void>;
    /**
     * Remove a value from storage
     * @param key Storage key
     * @returns Promise that resolves when removal is complete
     */
    removeItem: (key: string) => Promise<void>;
}
/**
 * No-operation adapter for when persistence is not required
 * @returns A storage adapter that does nothing (used as fallback)
 */
export declare const createNoopStorageAdapter: () => StorageAdapter;
/**
 * Create a localStorage adapter for web applications
 * @returns A storage adapter that uses browser's localStorage
 */
export declare const createLocalStorageAdapter: () => StorageAdapter;
export declare const NoopStorageAdapter: () => StorageAdapter;
