import React from 'react';
import { StorageAdapter } from '@storage/storageAdapters';
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
    /** Subscribe to updates for a specific key. Returns an unsubscribe function. */
    subscribeKey: (key: string, listener: () => void) => () => void;
    /** Get the current snapshot (value) for a specific key. */
    getKeySnapshot: (key: string) => unknown;
    /** Optional: server snapshot getter for SSR environments. */
    getServerSnapshot?: (key: string) => unknown;
}
/** Simplified type for persistence keys */
export type PersistenceKeys = boolean | string[] | ((key: string, value: unknown) => boolean);
/**
 * Simplified configuration for persistence.
 * Used for the new simplified FusionStateProvider API.
 */
export interface SimplePersistenceConfig {
    /**
     * Keys to persist - if not provided, all state keys will be persisted
     * Can be an array of keys or a filter function
     */
    persistKeys?: PersistenceKeys;
    /**
     * Storage key prefix for namespacing (default: 'fusion_state')
     * This helps avoid collisions with other storage in the same application.
     */
    keyPrefix?: string;
    /**
     * Debounce time in ms (0 = immediate save)
     * Increasing this value reduces the number of writes but may lose recent changes
     */
    debounce?: number;
    /**
     * Custom storage adapter (optional)
     * If not specified, the best available adapter will be automatically detected
     */
    adapter?: StorageAdapter;
    /** Custom callback function to handle saving (called instead of default logic) */
    customSaveCallback?: (state: GlobalState, adapter: StorageAdapter, keyPrefix: string) => Promise<void>;
    /** Callback called on storage read error */
    onLoadError?: (error: Error, key: string) => void;
    /** Callback called on storage write error */
    onSaveError?: (error: Error, state: GlobalState) => void;
}
/**
 * Configuration for state persistence in storage.
 * Defines how state should be saved and loaded.
 */
export interface PersistenceConfig {
    /**
     * The storage adapter that handles read/write operations.
     * Implement the StorageAdapter interface for your specific platform.
     */
    adapter: StorageAdapter;
    /**
     * Storage key prefix for namespacing (default: 'fusion_state')
     * This helps avoid collisions with other storage in the same application.
     */
    keyPrefix?: string;
    /**
     * Keys to persist - if not provided, all state keys will be persisted
     * Can be an array of keys or a filter function
     */
    persistKeys?: PersistenceKeys;
    /**
     * Load state from storage on initialization
     * When true, the provider will attempt to restore state from storage on mount.
     */
    loadOnInit?: boolean;
    /**
     * Save state to storage when it changes
     * When true, state changes will be automatically persisted.
     */
    saveOnChange?: boolean;
    /**
     * Debounce time in ms for saving state changes
     * (default: 0, meaning immediate save)
     * Higher values reduce writes but may lose recent changes on app close.
     */
    debounceTime?: number;
    /** Callback called on storage read error */
    onLoadError?: (error: Error, key: string) => void;
    /** Callback called on storage write error */
    onSaveError?: (error: Error, state: GlobalState) => void;
}
/** Error messages enum for consistent error reporting */
export declare enum FusionStateErrorMessages {
    PROVIDER_MISSING = "ReactFusionState Error: useFusionState must be used within a FusionStateProvider",
    KEY_ALREADY_INITIALIZING = "ReactFusionState Error: Key \"{0}\" is already being initialized. Consider checking if the key is being initialized elsewhere or if there's a logic error.",
    KEY_MISSING_NO_INITIAL = "ReactFusionState Error: Key \"{0}\" does not exist and no initial value provided. Ensure the key is initialized with a value before use.",
    PERSISTENCE_READ_ERROR = "ReactFusionState Error: Failed to read state from storage: {0}",
    PERSISTENCE_WRITE_ERROR = "ReactFusionState Error: Failed to write state to storage: {0}",
    STORAGE_ADAPTER_MISSING = "ReactFusionState Error: Storage adapter is required for persistence configuration"
}
/** Specific error types for React Fusion State */
export declare class FusionStateError extends Error {
    readonly code: keyof typeof FusionStateErrorMessages;
    readonly context?: Record<string, unknown> | undefined;
    constructor(code: keyof typeof FusionStateErrorMessages, message: string, context?: Record<string, unknown> | undefined);
}
/** Specific error for persistence issues */
export declare class PersistenceError extends FusionStateError {
    readonly operation: 'read' | 'write';
    readonly storageKey?: string | undefined;
    constructor(message: string, operation: 'read' | 'write', storageKey?: string | undefined, context?: Record<string, unknown>);
}
/**
 * ✅ REMOVED: No more options needed, everything is optimized automatically!
 * Interface kept for backward compatibility but no longer used.
 */
export interface UseFusionStateOptions {
    /** @deprecated No longer used - automatic optimizations */
    skipLocalState?: boolean;
    /** @deprecated No longer used - automatic optimizations */
    compare?: (a: unknown, b: unknown) => boolean;
    /** Enable persistence for this specific key */
    persist?: boolean;
    /** Storage adapter to use (auto-detected if not provided) */
    adapter?: StorageAdapter;
    /** Storage key prefix (default: 'fusion_persistent') */
    keyPrefix?: string;
    /** Debounce time for saving in ms (default: 300) */
    debounceTime?: number;
    /** Enable debug logging for persistence */
    debug?: boolean;
}
