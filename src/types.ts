import React from 'react';
import {StorageAdapter} from '@storage/storageAdapters';

/**
 * Common types for React Fusion State.
 *
 * @packageDocumentation
 */

/**
 * Global state bag stored by {@link FusionStateProvider}.
 * Keys are arbitrary strings; values are typed per hook via the generic `T`
 * in {@link useFusionState}.
 */
export type GlobalState = Record<string, unknown>;

/**
 * Value or updater function accepted by {@link StateUpdater}.
 *
 * @template T - State value type
 */
export type SetStateAction<T> = T | ((prevState: T) => T);

/**
 * Setter returned by {@link useFusionState}. Mirrors React's `useState` setter.
 *
 * @template T - State value type
 */
export type StateUpdater<T> = (value: SetStateAction<T>) => void;

/**
 * Filter predicate for deciding which keys are persisted.
 *
 * @param key - State key being evaluated
 * @param value - Current value for the key (may be `undefined` during config normalization)
 * @returns `true` when the key should be written to storage
 */
export type PersistenceKeyFilter = (key: string, value?: unknown) => boolean;

/**
 * Accepted shapes for `persistKeys` in {@link SimplePersistenceConfig}.
 *
 * @template T - Optional schema type for typed key lists (defaults to {@link GlobalState})
 */
export type PersistenceKeys<T extends Record<string, unknown> = GlobalState> =
  keyof T extends string
    ? boolean | (keyof T)[] | PersistenceKeyFilter
    : boolean | string[] | PersistenceKeyFilter;

/**
 * Accepted shapes for `persistKeys` in {@link PersistenceConfig}.
 *
 * @template T - Optional schema type for typed key lists (defaults to {@link GlobalState})
 */
export type PersistenceKeysConfig<
  T extends Record<string, unknown> = GlobalState,
> = keyof T extends string
  ? (keyof T)[] | PersistenceKeyFilter
  : string[] | PersistenceKeyFilter;

/**
 * Accepted `persistence` prop values for {@link FusionStateProvider}.
 */
export type FusionStatePersistenceProp =
  | boolean
  | string[]
  | SimplePersistenceConfig
  | PersistenceConfig;

/**
 * React context value exposed by {@link useGlobalState}.
 */
export interface GlobalFusionStateContextType {
  /** Current global state snapshot. */
  state: GlobalState;
  /** Replace or update the full global state object. */
  setState: React.Dispatch<React.SetStateAction<GlobalState>>;
  /**
   * Keys currently being initialized. Primarily used internally to detect
   * concurrent first-mount races for the same key.
   *
   * @internal
   */
  initializingKeys: Set<string>;
}

/**
 * Simplified persistence configuration for {@link FusionStateProvider}.
 *
 * When `persistKeys` is omitted and `persistence={true}`, only keys prefixed
 * with `persist.` are saved by default.
 *
 * @template T - Optional schema type for typed `persistKeys` lists
 *
 * @example
 * ```tsx
 * <FusionStateProvider
 *   persistence={{
 *     persistKeys: ['user', 'theme'],
 *     debounce: 300,
 *     keyPrefix: 'my_app',
 *   }}
 * >
 *   <App />
 * </FusionStateProvider>
 * ```
 */
export interface SimplePersistenceConfig<
  T extends Record<string, unknown> = GlobalState,
> {
  /**
   * Keys to persist. When omitted with `persistence={true}`, defaults to keys
   * starting with `persist.`. Can be `true` (persist all), a key list, or a
   * filter function receiving `(key, value?)`.
   */
  persistKeys?: PersistenceKeys<T>;

  /**
   * Storage namespace prefix (default: `'fusion_state'`).
   * Helps avoid collisions with other libraries using the same storage backend.
   */
  keyPrefix?: string;

  /**
   * Debounce interval in milliseconds before writing to storage.
   * `0` saves immediately. Higher values reduce I/O but may lose recent
   * changes if the app closes before the debounce fires.
   */
  debounce?: number;

  /**
   * Custom storage adapter. When omitted, {@link detectBestStorageAdapter}
   * picks the best available backend for the current runtime.
   */
  adapter?: StorageAdapter;

  /**
   * Override the default save implementation. Called instead of the built-in
   * JSON serialization when provided.
   */
  customSaveCallback?: (
    state: GlobalState,
    adapter: StorageAdapter,
    keyPrefix: string,
  ) => Promise<void>;
}

/**
 * Full persistence configuration with explicit load/save toggles.
 *
 * @template T - Optional schema type for typed `persistKeys` lists
 *
 * @example
 * ```tsx
 * <FusionStateProvider
 *   persistence={{
 *     adapter: createLocalStorageAdapter(),
 *     persistKeys: (key) => key.startsWith('persist.'),
 *     loadOnInit: true,
 *     saveOnChange: true,
 *     debounceTime: 500,
 *   }}
 * >
 *   <App />
 * </FusionStateProvider>
 * ```
 */
export interface PersistenceConfig<
  T extends Record<string, unknown> = GlobalState,
> {
  /** Storage adapter that performs read/write operations. */
  adapter: StorageAdapter;

  /** Storage namespace prefix (default: `'fusion_state'`). */
  keyPrefix?: string;

  /** Keys to persist — key list or filter function `(key, value?) => boolean`. */
  persistKeys?: PersistenceKeysConfig<T>;

  /**
   * Load persisted state when the provider mounts (default: `true` when
   * normalized from simplified config).
   */
  loadOnInit?: boolean;

  /**
   * Persist state on every change (default: `true` when normalized from
   * simplified config).
   */
  saveOnChange?: boolean;

  /**
   * Debounce interval in milliseconds before writing to storage.
   * `0` saves immediately.
   */
  debounceTime?: number;
}

/**
 * Stable error message templates used across the library.
 *
 * Placeholders use `{0}`, `{1}`, … and are substituted by
 * {@link formatErrorMessage}.
 */
export enum FusionStateErrorMessages {
  PROVIDER_MISSING = 'ReactFusionState Error: useFusionState must be used within a FusionStateProvider',
  KEY_ALREADY_INITIALIZING = 'ReactFusionState Error: Key "{0}" is already being initialized. Consider checking if the key is being initialized elsewhere or if there\'s a logic error.',
  KEY_MISSING_NO_INITIAL = 'ReactFusionState Error: Key "{0}" does not exist and no initial value provided. Ensure the key is initialized with a value before use.',
  PERSISTENCE_READ_ERROR = 'ReactFusionState Error: Failed to read state from storage: {0}',
  PERSISTENCE_WRITE_ERROR = 'ReactFusionState Error: Failed to write state to storage: {0}',
  STORAGE_ADAPTER_MISSING = 'ReactFusionState Error: Storage adapter is required for persistence configuration',
}

/**
 * Per-hook options for {@link useFusionState}.
 *
 * @example
 * ```tsx
 * const [fps, setFps] = useFusionState('fps', 60, { skipLocalState: true });
 * ```
 */
export interface UseFusionStateOptions {
  /**
   * Read directly from global state instead of mirroring into local React
   * state. Can reduce synchronization overhead for high-frequency updates,
   * but may cause extra re-renders when many components subscribe to the
   * same key.
   */
  skipLocalState?: boolean;
}
