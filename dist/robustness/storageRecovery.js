"use strict";
/**
 * Storage corruption handling and recovery system
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeStorageOperation = exports.createStorageRecovery = exports.StorageRecoveryManager = void 0;
class StorageRecoveryManager {
    constructor(options = {}) {
        this.backupKey = '__fusion_backup__';
        this.metaKey = '__fusion_meta__';
        this.options = Object.assign({ createBackups: true, maxRetries: 3, fallbackToDefault: true, corruptionDetector: this.defaultCorruptionDetector.bind(this), onRecovery: () => { } }, options);
    }
    safeParseStorage(storageKey, rawData, defaultValue = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!rawData) {
                return defaultValue;
            }
            try {
                const parsed = JSON.parse(rawData);
                if (this.options.corruptionDetector(parsed)) {
                    throw new Error('Data corruption detected');
                }
                return parsed;
            }
            catch (error) {
                console.warn('[FusionState] Storage corruption detected:', error);
                const recovered = yield this.attemptRecovery(storageKey, error);
                if (recovered) {
                    this.options.onRecovery(error, recovered);
                    return recovered;
                }
                if (this.options.fallbackToDefault) {
                    console.warn('[FusionState] Falling back to default state');
                    return defaultValue;
                }
                throw error;
            }
        });
    }
    createBackup(storageKey, data, adapter) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.options.createBackups)
                return;
            try {
                const backup = {
                    timestamp: Date.now(),
                    data,
                    version: '0.4.0',
                    checksum: this.calculateChecksum(data),
                };
                yield adapter.setItem(`${storageKey}_${this.backupKey}`, JSON.stringify(backup));
                yield this.cleanupOldBackups(storageKey, adapter);
            }
            catch (error) {
                console.warn('[FusionState] Failed to create backup:', error);
            }
        });
    }
    attemptRecovery(storageKey, originalError) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[FusionState] Attempting recovery from backup...');
            if (typeof window !== 'undefined' && window.localStorage) {
                try {
                    const backupKey = `${storageKey}_${this.backupKey}`;
                    const backupData = window.localStorage.getItem(backupKey);
                    if (backupData) {
                        const backup = JSON.parse(backupData);
                        if (this.verifyBackup(backup)) {
                            console.log('[FusionState] Successfully recovered from backup');
                            return backup.data;
                        }
                    }
                }
                catch (backupError) {
                    console.warn('[FusionState] Backup recovery failed:', backupError);
                }
            }
            return null;
        });
    }
    defaultCorruptionDetector(data) {
        if (data === null || data === undefined)
            return false;
        if (typeof data !== 'object')
            return true;
        try {
            JSON.stringify(data);
        }
        catch (_a) {
            return true;
        }
        if (Array.isArray(data) && typeof data === 'object') {
            return true;
        }
        return false;
    }
    calculateChecksum(data) {
        try {
            const str = JSON.stringify(data);
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = (hash << 5) - hash + char;
                hash = hash & hash;
            }
            return hash.toString(16);
        }
        catch (_a) {
            return 'invalid';
        }
    }
    verifyBackup(backup) {
        try {
            const calculatedChecksum = this.calculateChecksum(backup.data);
            const isValid = calculatedChecksum === backup.checksum;
            const maxAge = 7 * 24 * 60 * 60 * 1000;
            const isRecent = Date.now() - backup.timestamp < maxAge;
            return isValid && isRecent;
        }
        catch (_a) {
            return false;
        }
    }
    cleanupOldBackups(storageKey, adapter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('[FusionState] Cleaned up old backups');
            }
            catch (error) {
                console.warn('[FusionState] Failed to cleanup old backups:', error);
            }
        });
    }
}
exports.StorageRecoveryManager = StorageRecoveryManager;
function createStorageRecovery(options) {
    return new StorageRecoveryManager(options);
}
exports.createStorageRecovery = createStorageRecovery;
function safeStorageOperation(operation, fallback, errorMessage = 'Storage operation failed') {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield operation();
        }
        catch (error) {
            console.warn(`[FusionState] ${errorMessage}:`, error);
            return fallback;
        }
    });
}
exports.safeStorageOperation = safeStorageOperation;
//# sourceMappingURL=storageRecovery.js.map