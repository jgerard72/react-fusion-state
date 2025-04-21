import React, { ReactNode } from 'react';
import { GlobalState, GlobalFusionStateContextType, PersistenceConfig, SimplePersistenceConfig } from '@core/types';
/**
 * Hook to access the global state context
 * @returns The global state context
 * @throws Error if used outside of a FusionStateProvider
 */
export declare const useGlobalState: () => GlobalFusionStateContextType;
interface FusionStateProviderProps {
    /** Child components that will have access to fusion state */
    children: ReactNode;
    /** Optional initial state values */
    initialState?: GlobalState;
    /** Enable debug mode which logs state changes to console */
    debug?: boolean;
    /**
     * Configuration pour la persistance - peuvent être:
     * - true: active la persistance pour toutes les clés avec les valeurs par défaut
     * - tableau de chaînes: active la persistance uniquement pour les clés spécifiées
     * - objet: configuration détaillée avec clés, préfixe, etc.
     * - objet complet PersistenceConfig: configuration avancée (rétrocompatibilité)
     */
    persistence?: boolean | string[] | SimplePersistenceConfig | PersistenceConfig;
}
/**
 * Provider component for React Fusion State
 * Manages the global state and provides access to all child components
 */
export declare const FusionStateProvider: React.FC<FusionStateProviderProps>;
export {};
