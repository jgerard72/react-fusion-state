import {useEffect, useState} from 'react';
import {useGlobalState} from './FusionStateProvider';

/**
 * Hook to check if the initial hydration from persistence is complete.
 * Useful for React Native with AsyncStorage or other async storage solutions
 * to show a loading state while values are being restored.
 * 
 * @returns boolean - true when initial load from storage is done
 */
export function useFusionHydrated(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);
  const {state} = useGlobalState();
  
  useEffect(() => {
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
