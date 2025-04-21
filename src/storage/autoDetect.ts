import {
  StorageAdapter,
  createNoopStorageAdapter,
  createLocalStorageAdapter,
} from './storageAdapters';

/**
 * Détecte automatiquement l'adaptateur de stockage le plus approprié
 * en fonction de l'environnement d'exécution.
 *
 * @returns Le meilleur adaptateur de stockage disponible
 */
export function detectBestStorageAdapter(): StorageAdapter {
  // Vérifier si localStorage est disponible (environnement navigateur)
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      // Tester si localStorage est réellement disponible (peut être désactivé)
      window.localStorage.setItem('fusion_test', 'test');
      window.localStorage.removeItem('fusion_test');
      return createLocalStorageAdapter();
    } catch (e) {
      console.warn('localStorage détecté mais non disponible:', e);
    }
  }

  // Si nous sommes dans un environnement React Native, essayer de détecter AsyncStorage
  // Note: Ceci est une détection heuristique car nous ne pouvons pas importer AsyncStorage directement
  if (
    typeof global !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    navigator.product === 'ReactNative'
  ) {
    try {
      // L'utilisateur devra fournir un adaptateur personnalisé pour AsyncStorage
      console.warn(
        'Environnement React Native détecté. ' +
          'Veuillez fournir explicitement un adaptateur pour AsyncStorage.',
      );
    } catch (e) {
      // Ignorer les erreurs potentielles
    }
  }

  // Fallback: utiliser un adaptateur qui ne fait rien
  return createNoopStorageAdapter();
}

/**
 * Crée un adaptateur de stockage en mémoire pour les tests ou lorsque
 * la persistance n'est pas disponible.
 *
 * @returns Un adaptateur qui stocke les données en mémoire
 */
export function createMemoryStorageAdapter(): StorageAdapter {
  const storage = new Map<string, string>();

  return {
    async getItem(key: string): Promise<string | null> {
      return storage.has(key) ? storage.get(key)! : null;
    },

    async setItem(key: string, value: string): Promise<void> {
      storage.set(key, value);
    },

    async removeItem(key: string): Promise<void> {
      storage.delete(key);
    },
  };
}
