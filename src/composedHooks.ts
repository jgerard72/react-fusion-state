import {useFusionState} from '@core/useFusionState';
import {StateUpdater} from '@core/types';
import {useCallback} from 'react';

/**
 * Convenience wrapper around {@link useFusionState} that auto-prefixes keys
 * with `persist.` so they match the default filter when
 * `persistence={true}` on {@link FusionStateProvider}.
 *
 * @template T - Type of the stored value
 * @param key - Logical key (prefixed with `persist.` unless already present)
 * @param initialValue - Initial value seeded on first mount
 * @returns `[value, setValue]` tuple identical to {@link useFusionState}
 *
 * @example
 * ```tsx
 * const [token, setToken] = usePersistentState('auth.token', '');
 * // Stored under global key "persist.auth.token"
 * ```
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T,
): [T, StateUpdater<T>] {
  // Préfixer la clé avec 'persist.' si elle ne commence pas déjà par ce préfixe
  const persistKey = key.startsWith('persist.') ? key : `persist.${key}`;

  // Ce hook utilise useFusionState standard avec la clé préfixée
  return useFusionState<T>(persistKey, initialValue);
}

/**
 * High-frequency variant of {@link useFusionState} with `skipLocalState: true`.
 *
 * @template T - Type of the stored value
 * @param key - Global state key
 * @param initialValue - Initial value seeded on first mount
 * @returns `[value, setValue]` tuple identical to {@link useFusionState}
 *
 * @example
 * ```tsx
 * const [mouse, setMouse] = useFrequentState('pointer', { x: 0, y: 0 });
 * ```
 */
export function useFrequentState<T>(
  key: string,
  initialValue: T,
): [T, StateUpdater<T>] {
  return useFusionState<T>(key, initialValue, {skipLocalState: true});
}

/**
 * Form state helper built on {@link useFusionState}.
 *
 * @template T - Form shape (`Record<string, unknown>` fields)
 * @param formKey - Global key holding the form object
 * @param initialValues - Default field values (also used by `resetForm`)
 * @returns `[values, updateField, resetForm]`
 *
 * @example
 * ```tsx
 * const [form, updateField, reset] = useFormState('signup', { email: '', name: '' });
 * updateField('email', 'a@b.com');
 * ```
 */
export function useFormState<T extends Record<string, any>>(
  formKey: string,
  initialValues: T,
): [T, (field: keyof T, value: any) => void, () => void] {
  const [formData, setFormData] = useFusionState<T>(formKey, initialValues);

  // Fonction pour mettre à jour un champ spécifique
  const updateField = useCallback(
    (field: keyof T, value: any) => {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    },
    [setFormData],
  );

  // Fonction pour réinitialiser le formulaire
  const resetForm = useCallback(() => {
    setFormData(initialValues);
  }, [setFormData, initialValues]);

  return [formData, updateField, resetForm];
}

/**
 * Counter helper with increment, decrement, and direct set.
 *
 * @param key - Global state key for the counter
 * @param initialValue - Starting count (default: `0`)
 * @returns `[count, increment, decrement, setValue]`
 *
 * @example
 * ```tsx
 * const [count, inc, dec] = useCounter('likes', 0);
 * ```
 */
export function useCounter(
  key: string,
  initialValue: number = 0,
): [number, () => void, () => void, (value: number) => void] {
  const [count, setCount] = useFusionState<number>(key, initialValue);

  const increment = useCallback(() => {
    setCount(prev => prev + 1);
  }, [setCount]);

  const decrement = useCallback(() => {
    setCount(prev => prev - 1);
  }, [setCount]);

  const setValue = useCallback(
    (value: number) => {
      setCount(value);
    },
    [setCount],
  );

  return [count, increment, decrement, setValue];
}

/**
 * Boolean toggle helper with explicit setter.
 *
 * @param key - Global state key for the flag
 * @param initialValue - Starting value (default: `false`)
 * @returns `[value, toggle, setValue]`
 *
 * @example
 * ```tsx
 * const [open, toggle, setOpen] = useToggle('sidebar.open');
 * ```
 */
export function useToggle(
  key: string,
  initialValue: boolean = false,
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useFusionState<boolean>(key, initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, [setValue]);

  return [value, toggle, setValue];
}
