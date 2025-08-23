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
     * but might miss deeply nested changes. 'deep' uses custom deep equality
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
export declare const useFusionStateLog: (keys?: StateKey[], options?: FusionStateLogOptions) => SelectedState;
export {};
