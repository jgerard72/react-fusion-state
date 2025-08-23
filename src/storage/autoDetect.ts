import {
  StorageAdapter,
  createNoopStorageAdapter,
  createLocalStorageAdapter,
} from './storageAdapters';
import {createAsyncStorageAdapter} from './asyncStorageAdapter';

/**
 * Detects if we are in a Server-Side Rendering environment
 * @returns true if running on server (Node.js), false if running in browser or React Native
 */
export function isSSREnvironment(): boolean {
  // React Native also has no window, but has navigator.product === 'ReactNative'
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return false;
  }
  return typeof window === 'undefined';
}

/**
 * Automatically detects the most appropriate storage adapter
 * based on the runtime environment.
 *
 * @param debug - Whether to enable debug logging
 * @returns The best available storage adapter
 */
export function detectBestStorageAdapter(debug = false): StorageAdapter {
  // 🔥 SSR Detection first (prevents server crashes)
  if (isSSREnvironment()) {
    if (debug) {
      console.info(
        '[FusionState] SSR environment detected, using memory-only mode.',
      );
    }
    return createNoopStorageAdapter();
  }

  // Detect React Native second (more reliable)
  if (isReactNativeEnvironment()) {
    // Try to auto-load AsyncStorage if available
    try {
      // Avoid static resolution by bundlers; resolve only at runtime in RN
      const req = Function(
        'try { return typeof require !== "undefined" && require; } catch(_) { return undefined; }',
      )() as unknown as undefined | ((m: string) => any);
      const modName = '@react-native-async-storage/async-storage';
      const AsyncStorage = req ? req(modName) : undefined;
      if (AsyncStorage) {
        if (debug) {
          console.info(
            '[FusionState] Using AsyncStorage adapter (auto-detected).',
          );
        }
        const asImpl = (AsyncStorage.default || AsyncStorage) as {
          getItem: (k: string) => Promise<string | null>;
          setItem: (k: string, v: string) => Promise<void>;
          removeItem: (k: string) => Promise<void>;
        };
        return createAsyncStorageAdapter(asImpl, debug);
      }
      if (debug) {
        console.info(
          '[FusionState] React Native detected but AsyncStorage not found. Falling back to memory adapter. ',
        );
      }
    } catch (e) {
      if (debug) {
        console.warn('[FusionState] Failed to load AsyncStorage adapter:', e);
      }
    }
    return createNoopStorageAdapter();
  }

  // Check if localStorage is available (browser environment)
  if (isWebEnvironment()) {
    try {
      // Test if localStorage is actually available (can be disabled)
      window.localStorage.setItem('fusion_test', 'test');
      window.localStorage.removeItem('fusion_test');
      return createLocalStorageAdapter(debug);
    } catch (e) {
      if (debug) {
        console.warn(
          '[FusionState] localStorage detected but not available:',
          e,
        );
      }
    }
  }

  // Fallback: use a no-op adapter
  if (debug) {
    console.info('[FusionState] No storage detected, using memory-only mode.');
  }
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
  try {
    return (
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined'
    );
  } catch {
    // localStorage can be disabled in some browsers
    return false;
  }
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
