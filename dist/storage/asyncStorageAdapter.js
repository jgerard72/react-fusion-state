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
exports.createAsyncStorageAdapter = void 0;
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
function createAsyncStorageAdapter(AsyncStorage, debug = false) {
    return {
        getItem(key) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    return yield AsyncStorage.getItem(key);
                }
                catch (error) {
                    if (debug) {
                        console.error('Error reading from AsyncStorage:', error);
                    }
                    return null;
                }
            });
        },
        setItem(key, value) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield AsyncStorage.setItem(key, value);
                }
                catch (error) {
                    if (debug) {
                        console.error('Error writing to AsyncStorage:', error);
                    }
                }
            });
        },
        removeItem(key) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield AsyncStorage.removeItem(key);
                }
                catch (error) {
                    if (debug) {
                        console.error('Error removing from AsyncStorage:', error);
                    }
                }
            });
        },
    };
}
exports.createAsyncStorageAdapter = createAsyncStorageAdapter;
//# sourceMappingURL=asyncStorageAdapter.js.map