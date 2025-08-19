import { ref, shallowRef, inject, watchEffect, computed, Ref, ShallowRef } from 'vue';
import { FusionStateManager, StateUpdater, SetStateAction } from '../../core';
import { FUSION_STATE_MANAGER_KEY, VueUseFusionStateOptions } from './types';

/**
 * Vue composable to manage a piece of state within the global fusion state.
 * 
 * This composable uses Vue's reactivity system to automatically update components
 * when the state changes. It provides the same functionality as the React hook
 * but adapted for Vue's Composition API.
 *
 * @template T - The type of the state value.
 * @param {string} key - The key for the state value in the global state.
 * @param {T} [initialValue] - The initial value for the state if it is not already set.
 * @param {VueUseFusionStateOptions} [options] - Additional options for the composable.
 * @returns {[Ref<T> | ShallowRef<T>, StateUpdater<T>]} - Returns a reactive reference to the current state value and a function to update it.
 * @throws Will throw an error if the manager is not provided or if the key is already being initialized.
 */
export function useFusionState<T = unknown>(
  key: string,
  initialValue?: T,
  options?: VueUseFusionStateOptions,
): [Ref<T> | ShallowRef<T>, StateUpdater<T>] {
  const manager = inject<FusionStateManager>(FUSION_STATE_MANAGER_KEY);
  
  if (!manager) {
    throw new Error('useFusionState must be used within a Vue app that has the FusionState plugin installed');
  }

  const { shallow = false, skipReactivity = false } = options || {};

  // Initialize the key in the core manager if needed
  if (initialValue !== undefined && !manager.hasKey(key)) {
    manager.initializeKey(key, initialValue);
  } else if (!manager.hasKey(key) && initialValue === undefined) {
    manager.initializeKey(key, undefined); // This will throw the appropriate error
  }

  // Create reactive reference
  const createReactiveRef = () => {
    if (skipReactivity) {
      // Return a computed that always gets the latest value from manager
      return computed(() => manager.getState<T>(key) ?? (initialValue as T));
    }
    
    const initialVal = manager.getState<T>(key) ?? (initialValue as T);
    return shallow ? shallowRef(initialVal) : ref(initialVal);
  };

  const reactiveValue = createReactiveRef();

  // Set up reactivity synchronization (unless skipReactivity is true)
  if (!skipReactivity) {
    watchEffect((onInvalidate) => {
      const unsubscribe = manager.subscribe<T>(key, (newValue) => {
        (reactiveValue as Ref<T> | ShallowRef<T>).value = newValue as T;
      });

      // Cleanup subscription when effect is invalidated
      onInvalidate(() => {
        unsubscribe();
      });
    });
  }

  // State updater function that updates the core manager
  const setValue: StateUpdater<T> = (newValue: SetStateAction<T>) => {
    manager.setState<T>(key, newValue);
  };

  return [reactiveValue, setValue];
}

/**
 * Vue composable to get the current value of a state key without reactivity
 * Useful for one-time reads or when you don't want the component to re-render on changes
 * 
 * @template T - The type of the state value
 * @param {string} key - The state key to read
 * @returns {T | undefined} - The current value or undefined if not set
 */
export function useFusionStateValue<T = unknown>(key: string): T | undefined {
  const manager = inject<FusionStateManager>(FUSION_STATE_MANAGER_KEY);
  
  if (!manager) {
    throw new Error('useFusionStateValue must be used within a Vue app that has the FusionState plugin installed');
  }

  return manager.getState<T>(key);
}

/**
 * Vue composable to get a state updater function for a specific key
 * Useful when you only need to update state without reading its current value
 * 
 * @template T - The type of the state value
 * @param {string} key - The state key to update
 * @returns {StateUpdater<T>} - Function to update the state
 */
export function useFusionStateUpdater<T = unknown>(key: string): StateUpdater<T> {
  const manager = inject<FusionStateManager>(FUSION_STATE_MANAGER_KEY);
  
  if (!manager) {
    throw new Error('useFusionStateUpdater must be used within a Vue app that has the FusionState plugin installed');
  }

  return (newValue: SetStateAction<T>) => {
    manager.setState<T>(key, newValue);
  };
}

/**
 * Vue composable to access the core Fusion State manager directly
 * Useful for advanced use cases where you need direct access to the manager
 * 
 * @returns {FusionStateManager} - The core state manager instance
 */
export function useFusionStateManager(): FusionStateManager {
  const manager = inject<FusionStateManager>(FUSION_STATE_MANAGER_KEY);
  
  if (!manager) {
    throw new Error('useFusionStateManager must be used within a Vue app that has the FusionState plugin installed');
  }

  return manager;
}

/**
 * Vue composable to watch for changes to a specific state key
 * Returns an unsubscribe function that should be called on component unmount
 * 
 * @template T - The type of the state value
 * @param {string} key - The state key to watch
 * @param {(newValue: T, oldValue: T) => void} callback - Function to call when the key changes
 * @returns {() => void} - Unsubscribe function
 */
export function watchFusionState<T = unknown>(
  key: string,
  callback: (newValue: T, oldValue: T) => void,
): () => void {
  const manager = inject<FusionStateManager>(FUSION_STATE_MANAGER_KEY);
  
  if (!manager) {
    throw new Error('watchFusionState must be used within a Vue app that has the FusionState plugin installed');
  }

  return manager.subscribe<T>(key, callback);
}

/**
 * Convenient aliases for common use cases
 */
export const useSharedState = useFusionState;
export const usePersistentState = useFusionState;
export const useAppState = useFusionState;
