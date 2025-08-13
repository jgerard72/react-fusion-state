import { StorageAdapter } from './storageAdapters';
/**
 * Detects if we are in a Server-Side Rendering environment
 * @returns true if running on server (Node.js), false if running in browser
 */
export declare function isSSREnvironment(): boolean;
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
