/**
 * Cross-platform batching utility for React updates
 * Maps to unstable_batchedUpdates in React DOM and React Native
 */

let batchUpdates: (fn: () => void) => void;

try {
  // Try to import from react-dom first (web environment)
  const ReactDOM = require('react-dom');
  if (ReactDOM && ReactDOM.unstable_batchedUpdates) {
    batchUpdates = ReactDOM.unstable_batchedUpdates;
  } else {
    // Fallback to react-native
    const ReactNative = require('react-native');
    if (ReactNative && ReactNative.unstable_batchedUpdates) {
      batchUpdates = ReactNative.unstable_batchedUpdates;
    } else {
      // Final fallback - just execute the function
      batchUpdates = (fn: () => void) => fn();
    }
  }
} catch {
  // If imports fail, use identity function
  batchUpdates = (fn: () => void) => fn();
}

/**
 * Batch React updates for better performance
 * Automatically detects the environment and uses the appropriate batching function
 */
export const batch = batchUpdates;
