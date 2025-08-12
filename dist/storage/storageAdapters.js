"use strict";
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
exports.NoopStorageAdapter = exports.createLocalStorageAdapter = exports.createNoopStorageAdapter = void 0;
/**
 * No-operation adapter for when persistence is not required
 * @returns A storage adapter that does nothing (used as fallback)
 */
const createNoopStorageAdapter = () => ({
    getItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    },
    setItem(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            // No operation
        });
    },
    removeItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            // No operation
        });
    },
});
exports.createNoopStorageAdapter = createNoopStorageAdapter;
/**
 * Create a localStorage adapter for web applications
 * @returns A storage adapter that uses browser's localStorage
 */
const createLocalStorageAdapter = () => {
    // Vérifier si localStorage est disponible
    if (typeof localStorage === 'undefined') {
        console.warn('localStorage is not available, falling back to noop adapter');
        return (0, exports.createNoopStorageAdapter)();
    }
    return {
        getItem(key) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    return localStorage.getItem(key);
                }
                catch (error) {
                    console.error('Error reading from localStorage:', error);
                    return null;
                }
            });
        },
        setItem(key, value) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    localStorage.setItem(key, value);
                }
                catch (error) {
                    console.error('Error writing to localStorage:', error);
                }
            });
        },
        removeItem(key) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    localStorage.removeItem(key);
                }
                catch (error) {
                    console.error('Error removing from localStorage:', error);
                }
            });
        },
    };
};
exports.createLocalStorageAdapter = createLocalStorageAdapter;
// For backward compatibility
exports.NoopStorageAdapter = exports.createNoopStorageAdapter;
//# sourceMappingURL=storageAdapters.js.map