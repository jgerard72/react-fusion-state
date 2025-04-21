import React from 'react';
import {StorageAdapter} from '@storage/storageAdapters';

/**
 * Common types for React Fusion State
 */

/** Global state storage type */
export type GlobalState = Record<string, unknown>;

/** Function to update state with value or updater function */
export type SetStateAction<T> = T | ((prevState: T) => T);

/** State updater function type */
export type StateUpdater<T> = (value: SetStateAction<T>) => void;

/** Type for the global fusion state context */
export interface GlobalFusionStateContextType {
  state: GlobalState;
  setState: React.Dispatch<React.SetStateAction<GlobalState>>;
  initializingKeys: Set<string>;
}

/**
 * Configuration simplifiée pour la persistance.
 * Utilisée pour la nouvelle API simplifiée du FusionStateProvider.
 */
export interface SimplePersistenceConfig<
  T extends Record<string, unknown> = GlobalState,
> {
  /**
   * Clés à persister - si non fournies, toutes les clés d'état seront persistées
   * Peut être un tableau de clés ou une fonction de filtre
   * La fonction de filtre peut maintenant recevoir la valeur actuelle de l'état pour une prise de décision plus précise
   */
  persistKeys?: keyof T extends string
    ? boolean | (keyof T)[] | ((key: string, value?: unknown) => boolean)
    : boolean | string[] | ((key: string, value?: unknown) => boolean);

  /**
   * Préfixe de clé de stockage pour l'espace de noms (défaut: 'fusion_state')
   * Cela aide à éviter les collisions avec d'autres stockages dans la même application.
   */
  keyPrefix?: string;

  /**
   * Temps de debounce en ms (0 = sauvegarde immédiate)
   * Augmenter cette valeur réduit le nombre d'écritures mais peut perdre les changements récents
   */
  debounce?: number;

  /**
   * Adaptateur de stockage personnalisé (facultatif)
   * Si non spécifié, le meilleur adaptateur disponible sera automatiquement détecté
   */
  adapter?: StorageAdapter;

  /** Fonction de callback personnalisée pour gérer la sauvegarde (appelée à la place de la logique par défaut) */
  customSaveCallback?: (
    state: GlobalState,
    adapter: StorageAdapter,
    keyPrefix: string,
  ) => Promise<void>;
}

/**
 * Configuration pour la persistance d'état en stockage.
 * Définit comment l'état doit être sauvegardé et chargé.
 */
export interface PersistenceConfig<
  T extends Record<string, unknown> = GlobalState,
> {
  /**
   * L'adaptateur de stockage qui gère les opérations de lecture/écriture.
   * Implémentez l'interface StorageAdapter pour votre plateforme spécifique.
   */
  adapter: StorageAdapter;

  /**
   * Préfixe de clé de stockage pour l'espace de noms (défaut: 'fusion_state')
   * Cela aide à éviter les collisions avec d'autres stockages dans la même application.
   */
  keyPrefix?: string;

  /**
   * Clés à persister - si non fournies, toutes les clés d'état seront persistées
   * Peut être un tableau de clés ou une fonction de filtre
   * La fonction de filtre peut maintenant recevoir la valeur actuelle de l'état pour une prise de décision plus précise
   */
  persistKeys?: keyof T extends string
    ? (keyof T)[] | ((key: string, value?: unknown) => boolean)
    : string[] | ((key: string, value?: unknown) => boolean);

  /**
   * Charger l'état depuis le stockage à l'initialisation
   * Lorsque vrai, le provider tentera de restaurer l'état depuis le stockage à son montage.
   */
  loadOnInit?: boolean;

  /**
   * Sauvegarder l'état dans le stockage quand il change
   * Lorsque vrai, les changements à l'état seront automatiquement persistés.
   */
  saveOnChange?: boolean;

  /**
   * Temps de debounce en ms pour sauvegarder les changements d'état
   * (défaut: 0, signifiant sauvegarde immédiate)
   * Des valeurs plus élevées réduisent les écritures mais peuvent perdre des changements récents à la fermeture de l'app.
   */
  debounceTime?: number;
}

/** Messages d'erreur enum pour des rapports d'erreur cohérents */
export enum FusionStateErrorMessages {
  PROVIDER_MISSING = 'ReactFusionState Error: useFusionState must be used within a FusionStateProvider',
  KEY_ALREADY_INITIALIZING = 'ReactFusionState Error: Key "{0}" is already being initialized. Consider checking if the key is being initialized elsewhere or if there\'s a logic error.',
  KEY_MISSING_NO_INITIAL = 'ReactFusionState Error: Key "{0}" does not exist and no initial value provided. Ensure the key is initialized with a value before use.',
  PERSISTENCE_READ_ERROR = 'ReactFusionState Error: Failed to read state from storage: {0}',
  PERSISTENCE_WRITE_ERROR = 'ReactFusionState Error: Failed to write state to storage: {0}',
  STORAGE_ADAPTER_MISSING = 'ReactFusionState Error: Storage adapter is required for persistence configuration',
}

/**
 * Options pour la consommation de fusion state
 */
export interface UseFusionStateOptions {
  /**
   * Sauter la synchronisation d'état local pour l'optimisation des performances
   * Lorsque vrai, le hook lira directement depuis l'état global, ce qui peut améliorer les performances
   * mais peut causer plus de re-rendus dans certains cas.
   */
  skipLocalState?: boolean;
}
