/**
 * Cross-platform batching utility for React updates
 * Maps to unstable_batchedUpdates in React DOM and React Native
 */
/**
 * Batch React updates for better performance
 * Automatically detects the environment and uses the appropriate batching function
 */
export declare const batch: (fn: () => void) => void;
