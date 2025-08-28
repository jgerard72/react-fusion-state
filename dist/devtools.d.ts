/**
 * React DevTools integration for React Fusion State
 */
import { GlobalState } from './types';
export interface DevToolsConfig {
    name?: string;
    trace?: boolean;
    maxAge?: number;
    devOnly?: boolean;
}
interface DevToolsAction {
    type: string;
    key?: string;
    payload?: unknown;
    timestamp: number;
}
interface DevToolsInstance {
    send: (action: DevToolsAction, state: GlobalState) => void;
    init: (state: GlobalState) => void;
    subscribe: (listener: (message: any) => void) => () => void;
}
declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION__?: {
            connect: (config: any) => DevToolsInstance;
        };
    }
}
declare class FusionStateDevTools {
    private devtools;
    private isEnabled;
    private config;
    private actionCounter;
    constructor(config?: DevToolsConfig);
    private initialize;
    private handleDevToolsMessage;
    onTimeTravel?: (payload: any) => void;
    init(state: GlobalState): void;
    send(actionType: string, state: GlobalState, key?: string, payload?: unknown): void;
    /** Vérifier si les DevTools sont actives */
    get enabled(): boolean;
    /** Obtenir les statistiques */
    get stats(): {
        enabled: boolean;
        actionCount: number;
        config: Required<DevToolsConfig>;
    };
}
/**
 * Créer ou obtenir l'instance des DevTools
 * ✅ PERFORMANCE: Singleton pattern pour éviter les instances multiples
 */
export declare function createDevTools(config?: DevToolsConfig): FusionStateDevTools;
/** Obtenir l'instance actuelle des DevTools */
export declare function getDevTools(): FusionStateDevTools | null;
/**
 * Hook React pour utiliser les DevTools dans les composants
 * ✅ PERFORMANCE: Ne fait rien en production si devOnly=true
 */
export declare function useDevTools(): {
    enabled: boolean;
    stats: {
        enabled: boolean;
        actionCount: number;
        config: Required<DevToolsConfig>;
    } | null;
    send: (actionType: string, state: GlobalState, key?: string | undefined, payload?: unknown) => void;
};
/**
 * Types d'actions pour les DevTools
 * Aide à standardiser les messages
 */
export declare const DevToolsActions: {
    readonly INIT: "INIT";
    readonly SET_STATE: "SET_STATE";
    readonly UPDATE_KEY: "UPDATE_KEY";
    readonly PERSIST_LOAD: "PERSIST_LOAD";
    readonly PERSIST_SAVE: "PERSIST_SAVE";
    readonly ERROR: "ERROR";
};
export {};
/**
 * 🎯 EXEMPLE D'UTILISATION
 *
 * // Dans votre app
 * const devtools = createDevTools({
 *   name: 'My App State',
 *   trace: true,
 *   maxAge: 100,
 * });
 *
 * // Dans un composant
 * const { enabled, stats } = useDevTools();
 * if (enabled) {
 *   console.log('DevTools actives:', stats);
 * }
 */
