"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFusionHydrated = useFusionHydrated;
const defaultStore_1 = require("./store/defaultStore");
/**
 * Hook to check if the initial hydration from persistence is complete.
 *
 * Returns `true` immediately when there's nothing to hydrate from storage
 * (no persistence configured, SSR fallback, or synchronous web hydration),
 * and flips to `true` once the asynchronous load resolves on platforms with
 * async storage (React Native + AsyncStorage).
 *
 * Useful for gating UI on storage hydration, e.g. avoiding a flicker
 * between default values and persisted values on first render.
 *
 * Since v1.4 the implementation delegates to the store-bound hook
 * (`store.useFusionHydrated`) for the nearest provider in the tree.
 *
 * @returns `true` when initial load from storage is complete
 *
 * @example
 * ```tsx
 * function App() {
 *   const isHydrated = useFusionHydrated();
 *
 *   if (!isHydrated) {
 *     return <LoadingSpinner />;
 *   }
 *
 *   return <MainApp />;
 * }
 * ```
 */
function useFusionHydrated() {
    const store = (0, defaultStore_1.useDefaultStore)();
    // See note in src/useFusionState.ts about the rules-of-hooks disable.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return store.useFusionHydrated();
}
//# sourceMappingURL=useFusionHydrated.js.map