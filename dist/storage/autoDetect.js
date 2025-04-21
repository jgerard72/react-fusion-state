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
exports.createMemoryStorageAdapter = exports.detectBestStorageAdapter = void 0;
const storageAdapters_1 = require("./storageAdapters");
/**
 * Détecte automatiquement l'adaptateur de stockage le plus approprié
 * en fonction de l'environnement d'exécution.
 *
 * @returns Le meilleur adaptateur de stockage disponible
 */
function detectBestStorageAdapter() {
    // Vérifier si localStorage est disponible (environnement navigateur)
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            // Tester si localStorage est réellement disponible (peut être désactivé)
            window.localStorage.setItem('fusion_test', 'test');
            window.localStorage.removeItem('fusion_test');
            return (0, storageAdapters_1.createLocalStorageAdapter)();
        }
        catch (e) {
            console.warn('localStorage détecté mais non disponible:', e);
        }
    }
    // Si nous sommes dans un environnement React Native, essayer de détecter AsyncStorage
    // Note: Ceci est une détection heuristique car nous ne pouvons pas importer AsyncStorage directement
    if (typeof global !== 'undefined' &&
        typeof navigator !== 'undefined' &&
        navigator.product === 'ReactNative') {
        try {
            // L'utilisateur devra fournir un adaptateur personnalisé pour AsyncStorage
            console.warn('Environnement React Native détecté. ' +
                'Veuillez fournir explicitement un adaptateur pour AsyncStorage.');
        }
        catch (e) {
            // Ignorer les erreurs potentielles
        }
    }
    // Fallback: utiliser un adaptateur qui ne fait rien
    return (0, storageAdapters_1.createNoopStorageAdapter)();
}
exports.detectBestStorageAdapter = detectBestStorageAdapter;
/**
 * Crée un adaptateur de stockage en mémoire pour les tests ou lorsque
 * la persistance n'est pas disponible.
 *
 * @returns Un adaptateur qui stocke les données en mémoire
 */
function createMemoryStorageAdapter() {
    const storage = new Map();
    return {
        getItem(key) {
            return __awaiter(this, void 0, void 0, function* () {
                return storage.has(key) ? storage.get(key) : null;
            });
        },
        setItem(key, value) {
            return __awaiter(this, void 0, void 0, function* () {
                storage.set(key, value);
            });
        },
        removeItem(key) {
            return __awaiter(this, void 0, void 0, function* () {
                storage.delete(key);
            });
        },
    };
}
exports.createMemoryStorageAdapter = createMemoryStorageAdapter;
//# sourceMappingURL=autoDetect.js.map