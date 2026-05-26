"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFusionHydrated = void 0;
const FusionStateProvider_1 = require("./FusionStateProvider");
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
    const { isHydrated } = (0, FusionStateProvider_1.useGlobalState)();
    // Default to `true` for legacy / mock contexts that don't expose this field.
    return isHydrated !== null && isHydrated !== void 0 ? isHydrated : true;
}
exports.useFusionHydrated = useFusionHydrated;
//# sourceMappingURL=useFusionHydrated.js.map