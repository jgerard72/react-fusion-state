"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFusionHydrated = void 0;
const react_1 = require("react");
const FusionStateProvider_1 = require("./FusionStateProvider");
/**
 * Hook to check if the initial hydration from persistence is complete
 *
 * Useful for React Native with AsyncStorage or other async storage solutions
 * to show a loading state while values are being restored.
 *
 * @returns `true` when initial load from storage is complete, `false` during loading
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
    const [isHydrated, setIsHydrated] = (0, react_1.useState)(false);
    const { state } = (0, FusionStateProvider_1.useGlobalState)();
    (0, react_1.useEffect)(() => {
        const hasState = Object.keys(state).length > 0;
        if (hasState && !isHydrated) {
            setIsHydrated(true);
        }
        const timer = setTimeout(() => {
            setIsHydrated(true);
        }, 100);
        return () => clearTimeout(timer);
    }, [state, isHydrated]);
    return isHydrated;
}
exports.useFusionHydrated = useFusionHydrated;
//# sourceMappingURL=useFusionHydrated.js.map