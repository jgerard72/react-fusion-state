/**
 * Cross-platform batching utility for React updates.
 * Maps to `unstable_batchedUpdates` in React DOM and React Native.
 *
 * Resolution is lazy (on first call) so that:
 * - bundlers don't eagerly resolve `react-native` in web bundles,
 * - pure-ESM runtimes that lack `require` simply fall back to the identity
 *   function instead of crashing at module load time.
 */
type BatchFn = (fn: () => void) => void;
/**
 * Batch React updates for better performance.
 * Automatically detects the environment and uses the appropriate batching function.
 */
export declare const batch: BatchFn;
export {};
