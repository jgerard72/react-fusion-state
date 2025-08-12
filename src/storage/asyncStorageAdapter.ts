import {StorageAdapter} from './storageAdapters';

/**
 * Crée un adaptateur AsyncStorage pour React Native
 *
 * @param AsyncStorage - L'instance AsyncStorage importée de @react-native-async-storage/async-storage
 * @returns Un adaptateur compatible avec FusionState
 *
 * @example
 * ```typescript
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 * import { createAsyncStorageAdapter } from 'react-fusion-state';
 *
 * const asyncStorageAdapter = createAsyncStorageAdapter(AsyncStorage);
 *
 * <FusionStateProvider
 *   persistence={{ adapter: asyncStorageAdapter }}
 * >
 * ```
 */
export function createAsyncStorageAdapter(AsyncStorage: {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}): StorageAdapter {
  return {
    async getItem(key: string): Promise<string | null> {
      try {
        return await AsyncStorage.getItem(key);
      } catch (error) {
        console.error('Error reading from AsyncStorage:', error);
        return null;
      }
    },

    async setItem(key: string, value: string): Promise<void> {
      try {
        await AsyncStorage.setItem(key, value);
      } catch (error) {
        console.error('Error writing to AsyncStorage:', error);
      }
    },

    async removeItem(key: string): Promise<void> {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from AsyncStorage:', error);
      }
    },
  };
}
