import { StorageAdapter } from './storageAdapters';
/**
 * Détecte automatiquement l'adaptateur de stockage le plus approprié
 * en fonction de l'environnement d'exécution.
 *
 * @returns Le meilleur adaptateur de stockage disponible
 */
export declare function detectBestStorageAdapter(): StorageAdapter;
/**
 * Crée un adaptateur de stockage en mémoire pour les tests ou lorsque
 * la persistance n'est pas disponible.
 *
 * @returns Un adaptateur qui stocke les données en mémoire
 */
export declare function createMemoryStorageAdapter(): StorageAdapter;
