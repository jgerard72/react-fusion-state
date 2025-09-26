import { StorageAdapter } from './storageAdapters';
/**
 * Creates an AsyncStorage adapter for React Native
 *
 * @param AsyncStorage - AsyncStorage instance imported from @react-native-async-storage/async-storage
 * @param debug - Whether to enable debug logging
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
export declare function createAsyncStorageAdapter(AsyncStorage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
}, debug?: boolean): StorageAdapter;
