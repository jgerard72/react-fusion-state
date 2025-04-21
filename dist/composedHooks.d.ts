import { StateUpdater } from '@core/types';
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
export declare function usePersistentState<T>(key: string, initialValue: T): [T, StateUpdater<T>];
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
export declare function useFrequentState<T>(key: string, initialValue: T): [T, StateUpdater<T>];
/**
 * Hook pour gérer les états de formulaire avec des fonctions helpers.
 *
 * @template T - Le type de l'objet formulaire (Record<string, any>)
 * @param {string} formKey - La clé pour le formulaire dans l'état global
 * @param {T} initialValues - Les valeurs initiales du formulaire
 * @returns {[T, (field: keyof T, value: any) => void, () => void]} -
 *   Les valeurs du formulaire, une fonction pour mettre à jour un champ, et une fonction de réinitialisation
 */
export declare function useFormState<T extends Record<string, any>>(formKey: string, initialValues: T): [T, (field: keyof T, value: any) => void, () => void];
/**
 * Hook pour gérer un compteur avec des fonctions d'incrémentation et de décrémentation.
 *
 * @param {string} key - La clé pour le compteur dans l'état global
 * @param {number} initialValue - La valeur initiale du compteur (défaut: 0)
 * @returns {[number, () => void, () => void, (value: number) => void]} -
 *   La valeur du compteur, fonction incrémenter, fonction décrémenter, fonction définir valeur
 */
export declare function useCounter(key: string, initialValue?: number): [number, () => void, () => void, (value: number) => void];
/**
 * Hook pour gérer un état booléen (toggle) avec une fonction de basculement.
 *
 * @param {string} key - La clé pour la valeur booléenne dans l'état global
 * @param {boolean} initialValue - La valeur initiale (défaut: false)
 * @returns {[boolean, () => void, (value: boolean) => void]} -
 *   La valeur booléenne, fonction de basculement, fonction setter
 */
export declare function useToggle(key: string, initialValue?: boolean): [boolean, () => void, (value: boolean) => void];
