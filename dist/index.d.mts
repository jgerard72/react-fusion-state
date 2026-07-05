import React, { ReactNode } from 'react';

/**
 * Platform-agnostic persistence contract.
 *
 * Implement this interface to back {@link FusionStateProvider} persistence
 * on any storage backend (localStorage, AsyncStorage, MMKV, secure storage, …).
 *
 * @example
 * ```ts
 * const adapter: StorageAdapter = {
 *   async getItem(key) { return myStore.read(key); },
 *   async setItem(key, value) { myStore.write(key, value); },
 *   async removeItem(key) { myStore.delete(key); },
 * };
 * ```
 */
interface StorageAdapter {
    /**
     * Read a serialized value from storage.
     * @param key - Storage key
     * @returns Stored string or `null` when missing
     */
    getItem: (key: string) => Promise<string | null>;
    /**
     * Persist a serialized value.
     * @param key - Storage key
     * @param value - Already-serialized payload (the provider uses `JSON.stringify`)
     */
    setItem: (key: string, value: string) => Promise<void>;
    /**
     * Delete a stored value.
     * @param key - Storage key
     */
    removeItem: (key: string) => Promise<void>;
}
/**
 * Fallback adapter that discards all reads/writes.
 *
 * Used automatically in SSR/test environments where no real storage exists.
 *
 * @returns No-op {@link StorageAdapter}
 */
declare const createNoopStorageAdapter: () => StorageAdapter;
/**
 * Web adapter backed by `localStorage`.
 *
 * @returns {@link StorageAdapter} using the browser's `localStorage` API
 *
 * @example
 * ```tsx
 * <FusionStateProvider persistence={{ adapter: createLocalStorageAdapter() }}>
 *   <App />
 * </FusionStateProvider>
 * ```
 */
declare const createLocalStorageAdapter: () => StorageAdapter;
/**
 * @deprecated Use {@link createNoopStorageAdapter} instead.
 * Alias kept for backward compatibility.
 */
declare const NoopStorageAdapter: () => StorageAdapter;

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
type GlobalState = Record<string, unknown>;
/**
 * Value or updater function accepted by {@link StateUpdater}.
 *
 * @template T - State value type
 */
type SetStateAction<T> = T | ((prevState: T) => T);
/**
 * Setter returned by {@link useFusionState}. Mirrors React's `useState` setter.
 *
 * @template T - State value type
 */
type StateUpdater<T> = (value: SetStateAction<T>) => void;
/**
 * Filter predicate for deciding which keys are persisted.
 *
 * @param key - State key being evaluated
 * @param value - Current value for the key (may be `undefined` during config normalization)
 * @returns `true` when the key should be written to storage
 */
type PersistenceKeyFilter = (key: string, value?: unknown) => boolean;
/**
 * Accepted shapes for `persistKeys` in {@link SimplePersistenceConfig}.
 *
 * @template T - Optional schema type for typed key lists (defaults to {@link GlobalState})
 */
type PersistenceKeys<T extends Record<string, unknown> = GlobalState> = keyof T extends string ? boolean | (keyof T)[] | PersistenceKeyFilter : boolean | string[] | PersistenceKeyFilter;
/**
 * Accepted shapes for `persistKeys` in {@link PersistenceConfig}.
 *
 * @template T - Optional schema type for typed key lists (defaults to {@link GlobalState})
 */
type PersistenceKeysConfig<T extends Record<string, unknown> = GlobalState> = keyof T extends string ? (keyof T)[] | PersistenceKeyFilter : string[] | PersistenceKeyFilter;
/**
 * Accepted `persistence` prop values for {@link FusionStateProvider}.
 */
type FusionStatePersistenceProp = boolean | string[] | SimplePersistenceConfig | PersistenceConfig;
/**
 * React context value exposed by {@link useGlobalState}.
 */
interface GlobalFusionStateContextType {
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
interface SimplePersistenceConfig<T extends Record<string, unknown> = GlobalState> {
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
    customSaveCallback?: (state: GlobalState, adapter: StorageAdapter, keyPrefix: string) => Promise<void>;
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
interface PersistenceConfig<T extends Record<string, unknown> = GlobalState> {
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
declare enum FusionStateErrorMessages {
    PROVIDER_MISSING = "ReactFusionState Error: useFusionState must be used within a FusionStateProvider",
    KEY_ALREADY_INITIALIZING = "ReactFusionState Error: Key \"{0}\" is already being initialized. Consider checking if the key is being initialized elsewhere or if there's a logic error.",
    KEY_MISSING_NO_INITIAL = "ReactFusionState Error: Key \"{0}\" does not exist and no initial value provided. Ensure the key is initialized with a value before use.",
    PERSISTENCE_READ_ERROR = "ReactFusionState Error: Failed to read state from storage: {0}",
    PERSISTENCE_WRITE_ERROR = "ReactFusionState Error: Failed to write state to storage: {0}",
    STORAGE_ADAPTER_MISSING = "ReactFusionState Error: Storage adapter is required for persistence configuration"
}
/**
 * Per-hook options for {@link useFusionState}.
 *
 * @example
 * ```tsx
 * const [fps, setFps] = useFusionState('fps', 60, { skipLocalState: true });
 * ```
 */
interface UseFusionStateOptions {
    /**
     * Read directly from global state instead of mirroring into local React
     * state. Can reduce synchronization overhead for high-frequency updates,
     * but may cause extra re-renders when many components subscribe to the
     * same key.
     */
    skipLocalState?: boolean;
}

/**
 * Subscribe to a single global state key. API mirrors React's `useState`, but
 * the value is shared across all components under the same
 * {@link FusionStateProvider}.
 *
 * @template T - Type of the value stored at `key`
 * @param key - Unique string identifier for this slice of global state
 * @param initialValue - Seeded on first mount when `key` is not already in global state
 * @param options - Optional performance tuning (see {@link UseFusionStateOptions})
 * @returns Tuple `[value, setValue]` — same ergonomics as `useState`
 * @throws {@link FusionStateErrorMessages.KEY_ALREADY_INITIALIZING} when two components race to initialize the same key
 * @throws {@link FusionStateErrorMessages.KEY_MISSING_NO_INITIAL} when the key is missing and no `initialValue` was provided
 *
 * @example
 * ```tsx
 * function Counter() {
 *   const [count, setCount] = useFusionState('counter', 0);
 *   return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * interface User { name: string; email: string }
 * const [user, setUser] = useFusionState<User>('user', { name: '', email: '' });
 * ```
 */
declare function useFusionState<T>(key: string, initialValue?: T, options?: UseFusionStateOptions): [T, StateUpdater<T>];

/**
 * Access the raw global fusion state context.
 *
 * Prefer {@link useFusionState} for per-key subscriptions. This hook is
 * primarily useful for debugging, custom integrations, or reading the full
 * state object.
 *
 * @returns The global state context for the nearest {@link FusionStateProvider}
 * @throws {@link FusionStateErrorMessages.PROVIDER_MISSING} when called outside a provider
 *
 * @example
 * ```tsx
 * function DebugPanel() {
 *   const { state } = useGlobalState();
 *   return <pre>{JSON.stringify(state, null, 2)}</pre>;
 * }
 * ```
 */
declare const useGlobalState: () => GlobalFusionStateContextType;
/**
 * Props for {@link FusionStateProvider}.
 */
interface FusionStateProviderProps {
    /** Child components that will have access to fusion state. */
    children: ReactNode;
    /** Seed values merged into global state when the provider mounts. */
    initialState?: GlobalState;
    /**
     * Log state diffs and persistence activity to the console.
     * Avoid enabling in production — logs may contain user data.
     */
    debug?: boolean;
    /**
     * Persistence configuration:
     * - `true` — enable with defaults (persists keys prefixed `persist.`)
     * - `string[]` — persist only the listed keys
     * - {@link SimplePersistenceConfig} — simplified options (`debounce`, `keyPrefix`, …)
     * - {@link PersistenceConfig} — full control (`loadOnInit`, `saveOnChange`, …)
     */
    persistence?: FusionStatePersistenceProp;
}
/**
 * Root provider that owns the global fusion state tree.
 *
 * Wrap your application (or a subtree) once. All {@link useFusionState} calls
 * inside descendants share the same key namespace.
 *
 * @example
 * ```tsx
 * <FusionStateProvider initialState={{ theme: 'light' }} persistence={['user']}>
 *   <App />
 * </FusionStateProvider>
 * ```
 */
declare const FusionStateProvider: React.FC<FusionStateProviderProps>;

/** State key identifier used by {@link useFusionStateLog}. */
type FusionStateLogKey = string;
/**
 * Snapshot of global state returned by {@link useFusionStateLog}.
 * When `keys` are provided, only those entries are included.
 */
type FusionStateLogSnapshot = Record<string, unknown>;
/**
 * Options for {@link useFusionStateLog}.
 *
 * @example
 * ```tsx
 * const slice = useFusionStateLog(['counter', 'user'], {
 *   trackChanges: true,
 *   consoleLog: true,
 *   changeDetection: 'simple',
 * });
 * ```
 */
interface FusionStateLogOptions {
    /**
     * Compute a `changes` object (previous vs current) for console output.
     * Does not change the returned snapshot shape.
     */
    trackChanges?: boolean;
    /**
     * Equality strategy when `trackChanges` is enabled.
     * - `'reference'` — fast `===` check (default)
     * - `'deep'` — `lodash.isequal`
     * - `'simple'` — {@link simpleDeepEqual} (JSON-based)
     */
    changeDetection?: 'reference' | 'deep' | 'simple';
    /** Transform the payload written to `console.log` when `consoleLog` is true. */
    formatter?: (state: FusionStateLogSnapshot, changes?: FusionStateLogSnapshot) => unknown;
    /** Mirror the selected snapshot (and optional changes) to `console.log`. */
    consoleLog?: boolean;
}
/**
 * Observe a slice of global state for debugging.
 *
 * @param keys - Keys to include. When omitted, the full global state is returned.
 * @param options - Change tracking and console logging options
 * @returns A snapshot of the selected keys from global state
 * @throws {@link FusionStateErrorMessages.PROVIDER_MISSING} when used outside a provider (via {@link useGlobalState})
 *
 * @example
 * ```tsx
 * function StateInspector() {
 *   const state = useFusionStateLog();
 *   return <pre>{JSON.stringify(state, null, 2)}</pre>;
 * }
 * ```
 */
declare const useFusionStateLog: (keys?: FusionStateLogKey[], options?: FusionStateLogOptions) => FusionStateLogSnapshot;

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
declare function usePersistentState<T>(key: string, initialValue: T): [T, StateUpdater<T>];
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
declare function useFrequentState<T>(key: string, initialValue: T): [T, StateUpdater<T>];
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
declare function useFormState<T extends Record<string, any>>(formKey: string, initialValues: T): [T, (field: keyof T, value: any) => void, () => void];
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
declare function useCounter(key: string, initialValue?: number): [number, () => void, () => void, (value: number) => void];
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
 * Pick the best available {@link StorageAdapter} for the current runtime.
 *
 * Resolution order: `localStorage` (web) → noop fallback. React Native
 * environments receive a console warning — pass
 * {@link createLocalStorageAdapter} or a custom adapter explicitly.
 *
 * @returns A working {@link StorageAdapter} for the current environment
 *
 * @example
 * ```tsx
 * <FusionStateProvider persistence={{ adapter: detectBestStorageAdapter() }}>
 *   <App />
 * </FusionStateProvider>
 * ```
 */
declare function detectBestStorageAdapter(): StorageAdapter;
/**
 * In-memory {@link StorageAdapter} for tests and ephemeral sessions.
 *
 * Data is scoped to the returned adapter instance and lost on page reload.
 *
 * @returns Memory-backed {@link StorageAdapter}
 *
 * @example
 * ```ts
 * const adapter = createMemoryStorageAdapter();
 * await adapter.setItem('k', 'v');
 * ```
 */
declare function createMemoryStorageAdapter(): StorageAdapter;

export { FusionStateErrorMessages, type FusionStateLogKey, type FusionStateLogOptions, type FusionStateLogSnapshot, type FusionStatePersistenceProp, FusionStateProvider, type FusionStateProviderProps, type GlobalFusionStateContextType, type GlobalState, NoopStorageAdapter, type PersistenceConfig, type PersistenceKeyFilter, type PersistenceKeys, type PersistenceKeysConfig, type SetStateAction, type SimplePersistenceConfig, type StateUpdater, type StorageAdapter, type UseFusionStateOptions, createLocalStorageAdapter, createMemoryStorageAdapter, createNoopStorageAdapter, debounce, detectBestStorageAdapter, formatErrorMessage, simpleDeepEqual, useCounter, useFormState, useFrequentState, useFusionState, useFusionStateLog, useGlobalState, usePersistentState, useToggle };
