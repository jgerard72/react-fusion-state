"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFusionHydrated = void 0;
const react_1 = require("react");
const FusionStateProvider_1 = require("./FusionStateProvider");
/**
 * Hook to check if the initial hydration from persistence is complete.
 * Useful for React Native with AsyncStorage or other async storage solutions
 * to show a loading state while values are being restored.
 *
 * @returns boolean - true when initial load from storage is done
 */
function useFusionHydrated() {
    const [isHydrated, setIsHydrated] = (0, react_1.useState)(false);
    const { state } = (0, FusionStateProvider_1.useGlobalState)();
    (0, react_1.useEffect)(() => {
        // Simple heuristic: if we have any state, consider it hydrated
        // This can be improved with a more sophisticated hydration tracking
        // mechanism in the provider if needed
        const hasState = Object.keys(state).length > 0;
        if (hasState && !isHydrated) {
            setIsHydrated(true);
        }
        // For cases where there's no persisted state, mark as hydrated after a short delay
        const timer = setTimeout(() => {
            setIsHydrated(true);
        }, 100);
        return () => clearTimeout(timer);
    }, [state, isHydrated]);
    return isHydrated;
}
exports.useFusionHydrated = useFusionHydrated;
//# sourceMappingURL=useFusionHydrated.js.map