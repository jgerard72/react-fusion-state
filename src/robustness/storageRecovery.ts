/**
 * Storage corruption handling and recovery system
 */

import {GlobalState} from '../types';

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

export class StorageRecoveryManager {
  private options: Required<StorageRecoveryOptions>;
  private backupKey = '__fusion_backup__';
  private metaKey = '__fusion_meta__';

  constructor(options: StorageRecoveryOptions = {}) {
    this.options = {
      createBackups: true,
      maxRetries: 3,
      fallbackToDefault: true,
      corruptionDetector: this.defaultCorruptionDetector.bind(this),
      onRecovery: () => {},
      ...options,
    };
  }

  public async safeParseStorage(
    storageKey: string,
    rawData: string | null,
    defaultValue: GlobalState = {},
  ): Promise<GlobalState> {
    if (!rawData) {
      return defaultValue;
    }

    try {
      const parsed = JSON.parse(rawData);

      if (this.options.corruptionDetector(parsed)) {
        throw new Error('Data corruption detected');
      }

      return parsed;
    } catch (error) {
      console.warn('[FusionState] Storage corruption detected:', error);

      const recovered = await this.attemptRecovery(storageKey, error as Error);
      if (recovered) {
        this.options.onRecovery(error as Error, recovered);
        return recovered;
      }

      if (this.options.fallbackToDefault) {
        console.warn('[FusionState] Falling back to default state');
        return defaultValue;
      }

      throw error;
    }
  }

  public async createBackup(
    storageKey: string,
    data: GlobalState,
    adapter: any,
  ): Promise<void> {
    if (!this.options.createBackups) return;

    try {
      const backup: StorageBackup = {
        timestamp: Date.now(),
        data,
        version: '0.4.0',
        checksum: this.calculateChecksum(data),
      };

      await adapter.setItem(
        `${storageKey}_${this.backupKey}`,
        JSON.stringify(backup),
      );

      await this.cleanupOldBackups(storageKey, adapter);
    } catch (error) {
      console.warn('[FusionState] Failed to create backup:', error);
    }
  }

  private async attemptRecovery(
    storageKey: string,
    originalError: Error,
  ): Promise<GlobalState | null> {
    console.log('[FusionState] Attempting recovery from backup...');
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const backupKey = `${storageKey}_${this.backupKey}`;
        const backupData = window.localStorage.getItem(backupKey);

        if (backupData) {
          const backup: StorageBackup = JSON.parse(backupData);

          if (this.verifyBackup(backup)) {
            console.log('[FusionState] Successfully recovered from backup');
            return backup.data;
          }
        }
      } catch (backupError) {
        console.warn('[FusionState] Backup recovery failed:', backupError);
      }
    }

    return null;
  }

  private defaultCorruptionDetector(data: any): boolean {
    if (data === null || data === undefined) return false;

    if (typeof data !== 'object') return true;

    try {
      JSON.stringify(data);
    } catch {
      return true;
    }

    if (Array.isArray(data) && typeof data === 'object') {
      return true;
    }

    return false;
  }

  private calculateChecksum(data: GlobalState): string {
    try {
      const str = JSON.stringify(data);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return hash.toString(16);
    } catch {
      return 'invalid';
    }
  }

  private verifyBackup(backup: StorageBackup): boolean {
    try {
      const calculatedChecksum = this.calculateChecksum(backup.data);
      const isValid = calculatedChecksum === backup.checksum;

      const maxAge = 7 * 24 * 60 * 60 * 1000;
      const isRecent = Date.now() - backup.timestamp < maxAge;

      return isValid && isRecent;
    } catch {
      return false;
    }
  }

  private async cleanupOldBackups(
    storageKey: string,
    adapter: any,
  ): Promise<void> {
    try {
      console.log('[FusionState] Cleaned up old backups');
    } catch (error) {
      console.warn('[FusionState] Failed to cleanup old backups:', error);
    }
  }
}

export function createStorageRecovery(
  options?: StorageRecoveryOptions,
): StorageRecoveryManager {
  return new StorageRecoveryManager(options);
}

export async function safeStorageOperation<T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage: string = 'Storage operation failed',
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.warn(`[FusionState] ${errorMessage}:`, error);
    return fallback;
  }
}
