import {
  StorageAdapter,
  createNoopStorageAdapter,
  createLocalStorageAdapter,
} from './storageAdapters';

/**
 * Automatically detects the most appropriate storage adapter
 * based on the runtime environment.
 *
 * @returns The best available storage adapter
 */
export function detectBestStorageAdapter(): StorageAdapter {
  // Detect React Native first (more reliable)
  if (isReactNativeEnvironment()) {
    console.info(
      '[FusionState] React Native environment detected. ' +
        'Use a custom AsyncStorage adapter for persistence.',
    );
    return createNoopStorageAdapter();
  }

  // Check if localStorage is available (browser environment)
  if (isWebEnvironment()) {
    try {
      // Test if localStorage is actually available (can be disabled)
      window.localStorage.setItem('fusion_test', 'test');
      window.localStorage.removeItem('fusion_test');
      return createLocalStorageAdapter();
    } catch (e) {
      console.warn('[FusionState] localStorage detected but not available:', e);
    }
  }

  // Fallback: use a no-op adapter
  console.info('[FusionState] No storage detected, using memory-only mode.');
  return createNoopStorageAdapter();
}

/**
 * Detects if we are in a React Native environment
 */
function isReactNativeEnvironment(): boolean {
  // Method 1: Check navigator.product
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return true;
  }

  // Method 2: Check existence of global without window
  if (typeof global !== 'undefined' && typeof window === 'undefined') {
    return true;
  }

  // Method 3: Check React Native specific APIs
  if (
    typeof global !== 'undefined' &&
    // @ts-ignore - Runtime check
    (global.__fbBatchedBridge || global.nativeCallSyncHook)
  ) {
    return true;
  }

  return false;
}

/**
 * Detects if we are in a web environment
 */
function isWebEnvironment(): boolean {
  return (
    typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  );
}

/**
 * Creates an in-memory storage adapter for tests or when
 * persistence is not available.
 *
 * @returns An adapter that stores data in memory
 */
export function createMemoryStorageAdapter(): StorageAdapter {
  const storage = new Map<string, string>();

  return {
    async getItem(key: string): Promise<string | null> {
      return storage.has(key) ? storage.get(key)! : null;
    },

    async setItem(key: string, value: string): Promise<void> {
      storage.set(key, value);
    },

    async removeItem(key: string): Promise<void> {
      storage.delete(key);
    },
  };
}
