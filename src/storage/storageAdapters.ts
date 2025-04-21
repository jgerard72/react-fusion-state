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
 * Create a localStorage adapter for web applications
 * @returns A storage adapter that uses browser's localStorage
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

// For backward compatibility
export const NoopStorageAdapter = createNoopStorageAdapter;
