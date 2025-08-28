/**
 * Storage corruption handling and recovery system
 */
import { GlobalState } from '../types';
export interface StorageRecoveryOptions {
    createBackups?: boolean;
    maxRetries?: number;
    fallbackToDefault?: boolean;
    corruptionDetector?: (data: any) => boolean;
    onRecovery?: (error: Error, recoveredData: any) => void;
}
export interface StorageBackup {
    timestamp: number;
    data: GlobalState;
    version: string;
    checksum: string;
}
export declare class StorageRecoveryManager {
    private options;
    private backupKey;
    private metaKey;
    constructor(options?: StorageRecoveryOptions);
    safeParseStorage(storageKey: string, rawData: string | null, defaultValue?: GlobalState): Promise<GlobalState>;
    createBackup(storageKey: string, data: GlobalState, adapter: any): Promise<void>;
    private attemptRecovery;
    private defaultCorruptionDetector;
    private calculateChecksum;
    private verifyBackup;
    private cleanupOldBackups;
}
export declare function createStorageRecovery(options?: StorageRecoveryOptions): StorageRecoveryManager;
export declare function safeStorageOperation<T>(operation: () => Promise<T>, fallback: T, errorMessage?: string): Promise<T>;
