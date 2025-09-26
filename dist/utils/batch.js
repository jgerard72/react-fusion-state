"use strict";
/**
 * Cross-platform batching utility for React updates
 * Maps to unstable_batchedUpdates in React DOM and React Native
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.batch = void 0;
let batchUpdates;
try {
    // Try to import from react-dom first (web environment)
    const ReactDOM = require('react-dom');
    if (ReactDOM && ReactDOM.unstable_batchedUpdates) {
        batchUpdates = ReactDOM.unstable_batchedUpdates;
    }
    else {
        // Fallback to react-native
        const ReactNative = require('react-native');
        if (ReactNative && ReactNative.unstable_batchedUpdates) {
            batchUpdates = ReactNative.unstable_batchedUpdates;
        }
        else {
            // Final fallback - just execute the function
            batchUpdates = (fn) => fn();
        }
    }
}
catch (_a) {
    // If imports fail, use identity function
    batchUpdates = (fn) => fn();
}
/**
 * Batch React updates for better performance
 * Automatically detects the environment and uses the appropriate batching function
 */
exports.batch = batchUpdates;
//# sourceMappingURL=batch.js.map