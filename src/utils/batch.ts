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

let resolved: BatchFn | null = null;

function resolve(): BatchFn {
  if (resolved) return resolved;

  // Avoid bundler static resolution; only attempt require at runtime.
  const safeRequire =
    typeof require !== 'undefined'
      ? (name: string) => {
          try {
            return require(name);
          } catch {
            return undefined;
          }
        }
      : null;

  if (safeRequire) {
    const ReactDOM = safeRequire('react-dom');
    if (ReactDOM && ReactDOM.unstable_batchedUpdates) {
      return (resolved = ReactDOM.unstable_batchedUpdates as BatchFn);
    }
    const ReactNative = safeRequire('react-native');
    if (ReactNative && ReactNative.unstable_batchedUpdates) {
      return (resolved = ReactNative.unstable_batchedUpdates as BatchFn);
    }
  }

  // Identity fallback — no batching available, but the call site still works.
  return (resolved = (fn: () => void) => fn());
}

/**
 * Batch React updates for better performance.
 * Automatically detects the environment and uses the appropriate batching function.
 */
export const batch: BatchFn = fn => resolve()(fn);
