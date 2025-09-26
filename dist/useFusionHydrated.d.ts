/**
 * Hook to check if the initial hydration from persistence is complete.
 * Useful for React Native with AsyncStorage or other async storage solutions
 * to show a loading state while values are being restored.
 *
 * @returns boolean - true when initial load from storage is done
 */
export declare function useFusionHydrated(): boolean;
