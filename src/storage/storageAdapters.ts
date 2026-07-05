/**
 * Platform-agnostic persistence contract.
 *
 * Implement this interface to back {@link FusionStateProvider} persistence
 * on any storage backend (localStorage, AsyncStorage, MMKV, secure storage, …).
 *
 * @example
 * ```ts
 * const adapter: StorageAdapter = {
 *   async getItem(key) { return myStore.read(key); },
 *   async setItem(key, value) { myStore.write(key, value); },
 *   async removeItem(key) { myStore.delete(key); },
 * };
 * ```
 */
export interface StorageAdapter {
  /**
   * Read a serialized value from storage.
   * @param key - Storage key
   * @returns Stored string or `null` when missing
   */
  getItem: (key: string) => Promise<string | null>;

  /**
   * Persist a serialized value.
   * @param key - Storage key
   * @param value - Already-serialized payload (the provider uses `JSON.stringify`)
   */
  setItem: (key: string, value: string) => Promise<void>;

  /**
   * Delete a stored value.
   * @param key - Storage key
   */
  removeItem: (key: string) => Promise<void>;
}

/**
 * Fallback adapter that discards all reads/writes.
 *
 * Used automatically in SSR/test environments where no real storage exists.
 *
 * @returns No-op {@link StorageAdapter}
 */
export const createNoopStorageAdapter = (): StorageAdapter => ({
  async getItem(key: string): Promise<string | null> {
    return null;
  },

  async setItem(key: string, value: string): Promise<void> {
    // No operation
  },

  async removeItem(key: string): Promise<void> {
    // No operation
  },
});

/**
 * Web adapter backed by `localStorage`.
 *
 * @returns {@link StorageAdapter} using the browser's `localStorage` API
 *
 * @example
 * ```tsx
 * <FusionStateProvider persistence={{ adapter: createLocalStorageAdapter() }}>
 *   <App />
 * </FusionStateProvider>
 * ```
 */
export const createLocalStorageAdapter = (): StorageAdapter => ({
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
});

/**
 * @deprecated Use {@link createNoopStorageAdapter} instead.
 * Alias kept for backward compatibility.
 */
export const NoopStorageAdapter = createNoopStorageAdapter;
