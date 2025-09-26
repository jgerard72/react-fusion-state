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
export declare function useFusionHydrated(): boolean;
