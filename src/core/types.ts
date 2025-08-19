/**
 * Core types for framework-agnostic state management
 */

/** Global state storage type */
export type GlobalState = Record<string, unknown>;

/** Function to update state with value or updater function */
export type SetStateAction<T> = T | ((prevState: T) => T);

/** State updater function type */
export type StateUpdater<T> = (value: SetStateAction<T>) => void;

/** State change callback function */
export type StateChangeCallback<T = unknown> = (newValue: T, oldValue: T, key: string) => void;

/** Unsubscribe function returned by subscriptions */
export type UnsubscribeFunction = () => void;

/** Subscriber information */
export interface Subscriber<T = unknown> {
  id: string;
  key: string;
  callback: StateChangeCallback<T>;
}

/** Core state manager configuration */
export interface CoreManagerConfig {
  /** Enable debug logging */
  debug?: boolean;
  /** Initial state values */
  initialState?: GlobalState;
}

/** Simplified type for persistence keys */
export type PersistenceKeys =
  | boolean
  | string[]
  | ((key: string, value: unknown) => boolean);

/** Core persistence configuration (framework-agnostic) */
export interface CorePersistenceConfig {
  /** Storage adapter for persistence */
  adapter: StorageAdapter;
  /** Storage key prefix for namespacing */
  keyPrefix?: string;
  /** Keys to persist */
  persistKeys?: PersistenceKeys;
  /** Load state from storage on initialization */
  loadOnInit?: boolean;
  /** Save state to storage when it changes */
  saveOnChange?: boolean;
  /** Debounce time in ms for saving state changes */
  debounceTime?: number;
  /** Callback called on storage read error */
  onLoadError?: (error: Error, key: string) => void;
  /** Callback called on storage write error */
  onSaveError?: (error: Error, state: GlobalState) => void;
  /** Custom callback function to handle saving */
  customSaveCallback?: (
    state: GlobalState,
    adapter: StorageAdapter,
    keyPrefix: string,
  ) => Promise<void>;
}

/** Storage adapter interface (same as existing) */
export interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

/** Extended storage adapter with sync support */
export interface ExtendedStorageAdapter extends StorageAdapter {
  getItemSync?: (key: string) => string | null;
}

/** Error messages enum for consistent error reporting */
export enum FusionStateErrorMessages {
  PROVIDER_MISSING = 'ReactFusionState Error: useFusionState must be used within a FusionStateProvider',
  KEY_ALREADY_INITIALIZING = 'FusionState Error: Key "{0}" is already being initialized. Consider checking if the key is being initialized elsewhere or if there\'s a logic error.',
  KEY_MISSING_NO_INITIAL = 'FusionState Error: Key "{0}" does not exist and no initial value provided. Ensure the key is initialized with a value before use.',
  PERSISTENCE_READ_ERROR = 'FusionState Error: Failed to read state from storage: {0}',
  PERSISTENCE_WRITE_ERROR = 'FusionState Error: Failed to write state to storage: {0}',
  STORAGE_ADAPTER_MISSING = 'FusionState Error: Storage adapter is required for persistence configuration',
  MANAGER_NOT_INITIALIZED = 'FusionState Error: State manager is not initialized. Ensure you have set up the provider correctly.',
}

/** Specific error types for Fusion State */
export class FusionStateError extends Error {
  constructor(
    public readonly code: keyof typeof FusionStateErrorMessages,
    message: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'FusionStateError';
  }
}

/** Specific error for persistence issues */
export class PersistenceError extends FusionStateError {
  constructor(
    message: string,
    public readonly operation: 'read' | 'write',
    public readonly storageKey?: string,
    context?: Record<string, unknown>,
  ) {
    super(
      operation === 'read'
        ? 'PERSISTENCE_READ_ERROR'
        : 'PERSISTENCE_WRITE_ERROR',
      message,
      context,
    );
    this.name = 'PersistenceError';
  }
}
