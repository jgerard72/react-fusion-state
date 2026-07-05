import {
  StorageAdapter,
  createNoopStorageAdapter,
  createLocalStorageAdapter,
} from './storageAdapters';

/**
 * Pick the best available {@link StorageAdapter} for the current runtime.
 *
 * Resolution order: `localStorage` (web) → noop fallback. React Native
 * environments receive a console warning — pass
 * {@link createLocalStorageAdapter} or a custom adapter explicitly.
 *
 * @returns A working {@link StorageAdapter} for the current environment
 *
 * @example
 * ```tsx
 * <FusionStateProvider persistence={{ adapter: detectBestStorageAdapter() }}>
 *   <App />
 * </FusionStateProvider>
 * ```
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
 * In-memory {@link StorageAdapter} for tests and ephemeral sessions.
 *
 * Data is scoped to the returned adapter instance and lost on page reload.
 *
 * @returns Memory-backed {@link StorageAdapter}
 *
 * @example
 * ```ts
 * const adapter = createMemoryStorageAdapter();
 * await adapter.setItem('k', 'v');
 * ```
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
