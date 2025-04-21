// Core hooks
export {useFusionState} from '@core/useFusionState';
export {FusionStateProvider, useGlobalState} from '@core/FusionStateProvider';
export {useFusionStateLog} from '@core/useFusionStateLog';

// Hooks composés (simplifiés)
export {
  usePersistentState,
  useFrequentState,
  useFormState,
  useCounter,
  useToggle,
} from '@core/composedHooks';

// Types principaux
export type {
  GlobalState,
  SetStateAction,
  StateUpdater,
  GlobalFusionStateContextType,
  PersistenceConfig,
  SimplePersistenceConfig,
  UseFusionStateOptions,
} from '@core/types';
export {FusionStateErrorMessages} from '@core/types';

// Utilitaires
export {formatErrorMessage, debounce, simpleDeepEqual} from '@core/utils';

// Exports pour la persistance
export {
  createNoopStorageAdapter,
  createLocalStorageAdapter,
  // Pour la compatibilité avec les versions précédentes
  NoopStorageAdapter,
} from '@storage/storageAdapters';
export {
  detectBestStorageAdapter,
  createMemoryStorageAdapter,
} from '@storage/autoDetect';
export type {StorageAdapter} from '@storage/storageAdapters';
