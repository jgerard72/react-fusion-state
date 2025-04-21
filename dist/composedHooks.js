"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useToggle = exports.useCounter = exports.useFormState = exports.useFrequentState = exports.usePersistentState = void 0;
const useFusionState_1 = require("@core/useFusionState");
const react_1 = require("react");
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
function usePersistentState(key, initialValue) {
    // Préfixer la clé avec 'persist.' si elle ne commence pas déjà par ce préfixe
    const persistKey = key.startsWith('persist.') ? key : `persist.${key}`;
    // Ce hook utilise useFusionState standard avec la clé préfixée
    return (0, useFusionState_1.useFusionState)(persistKey, initialValue);
}
exports.usePersistentState = usePersistentState;
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
function useFrequentState(key, initialValue) {
    return (0, useFusionState_1.useFusionState)(key, initialValue, { skipLocalState: true });
}
exports.useFrequentState = useFrequentState;
/**
 * Hook pour gérer les états de formulaire avec des fonctions helpers.
 *
 * @template T - Le type de l'objet formulaire (Record<string, any>)
 * @param {string} formKey - La clé pour le formulaire dans l'état global
 * @param {T} initialValues - Les valeurs initiales du formulaire
 * @returns {[T, (field: keyof T, value: any) => void, () => void]} -
 *   Les valeurs du formulaire, une fonction pour mettre à jour un champ, et une fonction de réinitialisation
 */
function useFormState(formKey, initialValues) {
    const [formData, setFormData] = (0, useFusionState_1.useFusionState)(formKey, initialValues);
    // Fonction pour mettre à jour un champ spécifique
    const updateField = (0, react_1.useCallback)((field, value) => {
        setFormData(prev => (Object.assign(Object.assign({}, prev), { [field]: value })));
    }, [setFormData]);
    // Fonction pour réinitialiser le formulaire
    const resetForm = (0, react_1.useCallback)(() => {
        setFormData(initialValues);
    }, [setFormData, initialValues]);
    return [formData, updateField, resetForm];
}
exports.useFormState = useFormState;
/**
 * Hook pour gérer un compteur avec des fonctions d'incrémentation et de décrémentation.
 *
 * @param {string} key - La clé pour le compteur dans l'état global
 * @param {number} initialValue - La valeur initiale du compteur (défaut: 0)
 * @returns {[number, () => void, () => void, (value: number) => void]} -
 *   La valeur du compteur, fonction incrémenter, fonction décrémenter, fonction définir valeur
 */
function useCounter(key, initialValue = 0) {
    const [count, setCount] = (0, useFusionState_1.useFusionState)(key, initialValue);
    const increment = (0, react_1.useCallback)(() => {
        setCount(prev => prev + 1);
    }, [setCount]);
    const decrement = (0, react_1.useCallback)(() => {
        setCount(prev => prev - 1);
    }, [setCount]);
    const setValue = (0, react_1.useCallback)((value) => {
        setCount(value);
    }, [setCount]);
    return [count, increment, decrement, setValue];
}
exports.useCounter = useCounter;
/**
 * Hook pour gérer un état booléen (toggle) avec une fonction de basculement.
 *
 * @param {string} key - La clé pour la valeur booléenne dans l'état global
 * @param {boolean} initialValue - La valeur initiale (défaut: false)
 * @returns {[boolean, () => void, (value: boolean) => void]} -
 *   La valeur booléenne, fonction de basculement, fonction setter
 */
function useToggle(key, initialValue = false) {
    const [value, setValue] = (0, useFusionState_1.useFusionState)(key, initialValue);
    const toggle = (0, react_1.useCallback)(() => {
        setValue(prev => !prev);
    }, [setValue]);
    return [value, toggle, setValue];
}
exports.useToggle = useToggle;
//# sourceMappingURL=composedHooks.js.map