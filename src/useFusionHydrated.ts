import {useEffect, useState} from 'react';
import {useGlobalState} from './FusionStateProvider';

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
export function useFusionHydrated(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);
  const {state} = useGlobalState();

  useEffect(() => {
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
