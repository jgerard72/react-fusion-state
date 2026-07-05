import React, { ReactNode } from 'react';

/**
 * Interface for storage adapters that developers can implement
 * for their specific platform (web, React Native, Expo, etc.)
 */
interface StorageAdapter {
    /**
     * Get a value from storage
     * @param key Storage key
     * @returns Promise that resolves to the stored value or null if not found
     */
    getItem: (key: string) => Promise<string | null>;
    /**
     * Save a value to storage
     * @param key Storage key
     * @param value Value to store (will be JSON stringified)
     * @returns Promise that resolves when storage is complete
     */
    setItem: (key: string, value: string) => Promise<void>;
    /**
     * Remove a value from storage
     * @param key Storage key
     * @returns Promise that resolves when removal is complete
     */
    removeItem: (key: string) => Promise<void>;
}
/**
 * No-operation adapter for when persistence is not required
 * @returns A storage adapter that does nothing (used as fallback)
 */
declare const createNoopStorageAdapter: () => StorageAdapter;
/**
 * Create a localStorage adapter for web applications
 * @returns A storage adapter that uses browser's localStorage
 */
declare const createLocalStorageAdapter: () => StorageAdapter;
declare const NoopStorageAdapter: () => StorageAdapter;

/**
 * Common types for React Fusion State
 */
/** Global state storage type */
type GlobalState = Record<string, unknown>;
/** Function to update state with value or updater function */
type SetStateAction<T> = T | ((prevState: T) => T);
/** State updater function type */
type StateUpdater<T> = (value: SetStateAction<T>) => void;
/** Type for the global fusion state context */
interface GlobalFusionStateContextType {
    state: GlobalState;
    setState: React.Dispatch<React.SetStateAction<GlobalState>>;
    initializingKeys: Set<string>;
}
/**
 * Configuration simplifiée pour la persistance.
 * Utilisée pour la nouvelle API simplifiée du FusionStateProvider.
 */
interface SimplePersistenceConfig<T extends Record<string, unknown> = GlobalState> {
    /**
     * Clés à persister - si non fournies, toutes les clés d'état seront persistées
     * Peut être un tableau de clés ou une fonction de filtre
     * La fonction de filtre peut maintenant recevoir la valeur actuelle de l'état pour une prise de décision plus précise
     */
    persistKeys?: keyof T extends string ? boolean | (keyof T)[] | ((key: string, value?: unknown) => boolean) : boolean | string[] | ((key: string, value?: unknown) => boolean);
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
    customSaveCallback?: (state: GlobalState, adapter: StorageAdapter, keyPrefix: string) => Promise<void>;
}
/**
 * Configuration pour la persistance d'état en stockage.
 * Définit comment l'état doit être sauvegardé et chargé.
 */
interface PersistenceConfig<T extends Record<string, unknown> = GlobalState> {
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
    persistKeys?: keyof T extends string ? (keyof T)[] | ((key: string, value?: unknown) => boolean) : string[] | ((key: string, value?: unknown) => boolean);
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
declare enum FusionStateErrorMessages {
    PROVIDER_MISSING = "ReactFusionState Error: useFusionState must be used within a FusionStateProvider",
    KEY_ALREADY_INITIALIZING = "ReactFusionState Error: Key \"{0}\" is already being initialized. Consider checking if the key is being initialized elsewhere or if there's a logic error.",
    KEY_MISSING_NO_INITIAL = "ReactFusionState Error: Key \"{0}\" does not exist and no initial value provided. Ensure the key is initialized with a value before use.",
    PERSISTENCE_READ_ERROR = "ReactFusionState Error: Failed to read state from storage: {0}",
    PERSISTENCE_WRITE_ERROR = "ReactFusionState Error: Failed to write state to storage: {0}",
    STORAGE_ADAPTER_MISSING = "ReactFusionState Error: Storage adapter is required for persistence configuration"
}
/**
 * Options pour la consommation de fusion state
 */
interface UseFusionStateOptions {
    /**
     * Sauter la synchronisation d'état local pour l'optimisation des performances
     * Lorsque vrai, le hook lira directement depuis l'état global, ce qui peut améliorer les performances
     * mais peut causer plus de re-rendus dans certains cas.
     */
    skipLocalState?: boolean;
}

/**
 * Custom hook to manage a piece of state within the global fusion state.
 *
 * @template T - The type of the state value.
 * @param {string} key - The key for the state value in the global state.
 * @param {T} [initialValue] - The initial value for the state if it is not already set.
 * @param {UseFusionStateOptions} [options] - Additional options for the hook.
 * @returns {[T, StateUpdater<T>]} - Returns the current state value and a function to update it.
 * @throws Will throw an error if the key is already being initialized or if the key does not exist and no initial value is provided.
 */
declare function useFusionState<T>(key: string, initialValue?: T, options?: UseFusionStateOptions): [T, StateUpdater<T>];

/**
 * Hook to access the global state context
 * @returns The global state context
 * @throws Error if used outside of a FusionStateProvider
 */
declare const useGlobalState: () => GlobalFusionStateContextType;
interface FusionStateProviderProps {
    /** Child components that will have access to fusion state */
    children: ReactNode;
    /** Optional initial state values */
    initialState?: GlobalState;
    /** Enable debug mode which logs state changes to console */
    debug?: boolean;
    /**
     * Configuration pour la persistance - peuvent être:
     * - true: active la persistance pour toutes les clés avec les valeurs par défaut
     * - tableau de chaînes: active la persistance uniquement pour les clés spécifiées
     * - objet: configuration détaillée avec clés, préfixe, etc.
     * - objet complet PersistenceConfig: configuration avancée (rétrocompatibilité)
     */
    persistence?: boolean | string[] | SimplePersistenceConfig | PersistenceConfig;
}
/**
 * Provider component for React Fusion State
 * Manages the global state and provides access to all child components
 */
declare const FusionStateProvider: React.FC<FusionStateProviderProps>;

type StateKey = string;
type SelectedState = Record<string, unknown>;
/**
 * Options for the useFusionStateLog hook
 */
interface FusionStateLogOptions {
    /**
     * Whether to calculate and include differences between
     * current and previous state in the returned object
     */
    trackChanges?: boolean;
    /**
     * How to track changes. Default is 'reference' which is faster
     * but might miss deeply nested changes. 'deep' uses lodash.isEqual
     * for deep equality checks.
     */
    changeDetection?: 'reference' | 'deep' | 'simple';
    /**
     * Custom formatter function for console logging
     */
    formatter?: (state: SelectedState, changes?: SelectedState) => unknown;
    /**
     * Whether to automatically log to console
     */
    consoleLog?: boolean;
}
/**
 * Hook to observe and track changes in the global fusion state
 *
 * @param keys - Optional array of keys to watch (if undefined, watches all keys)
 * @param options - Additional configuration options
 * @returns The selected state from the global state
 */
declare const useFusionStateLog: (keys?: StateKey[], options?: FusionStateLogOptions) => SelectedState;

/**
 * Hook pour les données qui doivent persister automatiquement.
 * Ce hook préfixe automatiquement la clé avec 'persist.' pour assurer
 * que les données seront sauvegardées entre les sessions avec la
 * configuration par défaut de FusionStateProvider.
 *
 * @template T - Le type de la valeur d'état
 * @param {string} key - La clé pour la valeur d'état (sera préfixée avec 'persist.')
 * @param {T} initialValue - La valeur initiale
 * @returns {[T, StateUpdater<T>]} - La valeur actuelle et une fonction pour la mettre à jour
 */
declare function usePersistentState<T>(key: string, initialValue: T): [T, StateUpdater<T>];
/**
 * Hook pour les données qui changent fréquemment, optimisé pour les performances.
 * Utilise skipLocalState: true pour éviter la synchronisation locale,
 * ce qui peut améliorer les performances mais peut entraîner plus de re-rendus.
 *
 * @template T - Le type de la valeur d'état
 * @param {string} key - La clé pour la valeur d'état
 * @param {T} initialValue - La valeur initiale
 * @returns {[T, StateUpdater<T>]} - La valeur actuelle et une fonction pour la mettre à jour
 */
declare function useFrequentState<T>(key: string, initialValue: T): [T, StateUpdater<T>];
/**
 * Hook pour gérer les états de formulaire avec des fonctions helpers.
 *
 * @template T - Le type de l'objet formulaire (Record<string, any>)
 * @param {string} formKey - La clé pour le formulaire dans l'état global
 * @param {T} initialValues - Les valeurs initiales du formulaire
 * @returns {[T, (field: keyof T, value: any) => void, () => void]} -
 *   Les valeurs du formulaire, une fonction pour mettre à jour un champ, et une fonction de réinitialisation
 */
declare function useFormState<T extends Record<string, any>>(formKey: string, initialValues: T): [T, (field: keyof T, value: any) => void, () => void];
/**
 * Hook pour gérer un compteur avec des fonctions d'incrémentation et de décrémentation.
 *
 * @param {string} key - La clé pour le compteur dans l'état global
 * @param {number} initialValue - La valeur initiale du compteur (défaut: 0)
 * @returns {[number, () => void, () => void, (value: number) => void]} -
 *   La valeur du compteur, fonction incrémenter, fonction décrémenter, fonction définir valeur
 */
declare function useCounter(key: string, initialValue?: number): [number, () => void, () => void, (value: number) => void];
/**
 * Hook pour gérer un état booléen (toggle) avec une fonction de basculement.
 *
 * @param {string} key - La clé pour la valeur booléenne dans l'état global
 * @param {boolean} initialValue - La valeur initiale (défaut: false)
 * @returns {[boolean, () => void, (value: boolean) => void]} -
 *   La valeur booléenne, fonction de basculement, fonction setter
 */
declare function useToggle(key: string, initialValue?: boolean): [boolean, () => void, (value: boolean) => void];

/**
 * Formats error messages by replacing placeholders with actual values
 * @param message - Error message template with placeholders
 * @param values - Values to replace placeholders
 * @returns Formatted error message
 */
declare const formatErrorMessage: (message: string, ...values: string[]) => string;
/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last invocation.
 *
 * @param fn - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the function
 */
declare function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void;
/**
 * Checks if two values are deeply equal using JSON stringification.
 * This is simpler than full deep equality but sufficient for many cases.
 *
 * @param a - First value
 * @param b - Second value
 * @returns True if values are deeply equal
 */
declare function simpleDeepEqual(a: unknown, b: unknown): boolean;

/**
 * Détecte automatiquement l'adaptateur de stockage le plus approprié
 * en fonction de l'environnement d'exécution.
 *
 * @returns Le meilleur adaptateur de stockage disponible
 */
declare function detectBestStorageAdapter(): StorageAdapter;
/**
 * Crée un adaptateur de stockage en mémoire pour les tests ou lorsque
 * la persistance n'est pas disponible.
 *
 * @returns Un adaptateur qui stocke les données en mémoire
 */
declare function createMemoryStorageAdapter(): StorageAdapter;

export { FusionStateErrorMessages, FusionStateProvider, type GlobalFusionStateContextType, type GlobalState, NoopStorageAdapter, type PersistenceConfig, type SetStateAction, type SimplePersistenceConfig, type StateUpdater, type StorageAdapter, type UseFusionStateOptions, createLocalStorageAdapter, createMemoryStorageAdapter, createNoopStorageAdapter, debounce, detectBestStorageAdapter, formatErrorMessage, simpleDeepEqual, useCounter, useFormState, useFrequentState, useFusionState, useFusionStateLog, useGlobalState, usePersistentState, useToggle };
