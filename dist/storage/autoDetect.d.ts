import { StorageAdapter } from './storageAdapters';
/**
 * Automatically detects the most appropriate storage adapter
 * based on the runtime environment.
 *
 * @returns The best available storage adapter
 */
export declare function detectBestStorageAdapter(): StorageAdapter;
/**
 * Creates an in-memory storage adapter for tests or when
 * persistence is not available.
 *
 * @returns An adapter that stores data in memory
 */
export declare function createMemoryStorageAdapter(): StorageAdapter;
