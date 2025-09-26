/**
 * React DevTools integration for React Fusion State
 */
import {GlobalState} from './types';
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
class FusionStateDevTools {
  private devtools: DevToolsInstance | null = null;
  private isEnabled = false;
  private config: Required<DevToolsConfig>;
  private actionCounter = 0;

  constructor(config: DevToolsConfig = {}) {
    this.config = {
      name: config.name || 'FusionState',
      trace: config.trace ?? true,
      maxAge: config.maxAge || 50,
      devOnly: config.devOnly ?? true,
    };

    this.initialize();
  }

  private initialize() {
    if (this.config.devOnly && process.env.NODE_ENV === 'production') {
      return;
    }
    if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
      try {
        this.devtools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({
          name: this.config.name,
          trace: this.config.trace,
          maxAge: this.config.maxAge,
          features: {
            pause: true,
            lock: true,
            persist: true,
            export: true,
            import: 'custom',
            jump: true,
            skip: true,
            reorder: true,
            dispatch: true,
            test: true,
          },
        });

        this.isEnabled = true;

        this.devtools.subscribe((message: any) => {
          this.handleDevToolsMessage(message);
        });
      } catch (error) {
        console.warn('[FusionState DevTools] Failed to connect:', error);
      }
    }
  }

  private handleDevToolsMessage(message: any) {
    switch (message.type) {
      case 'DISPATCH':
        switch (message.payload?.type) {
          case 'JUMP_TO_ACTION':
          case 'JUMP_TO_STATE':
            this.onTimeTravel?.(message.payload);
            break;
        }
        break;
    }
  }
  public onTimeTravel?: (payload: any) => void;

  public init(state: GlobalState) {
    if (!this.isEnabled || !this.devtools) return;
    try {
      this.devtools.init(state);
    } catch (error) {
      console.warn('[FusionState DevTools] Init failed:', error);
    }
  }
  public send(
    actionType: string,
    state: GlobalState,
    key?: string,
    payload?: unknown,
  ) {
    if (!this.isEnabled || !this.devtools) return;

    try {
      const action: DevToolsAction = {
        type: `${actionType}${key ? ` (${key})` : ''}`,
        key,
        payload,
        timestamp: Date.now(),
      };

      this.devtools.send(action, state);
      this.actionCounter++;
    } catch (error) {
      console.warn('[FusionState DevTools] Send failed:', error);
    }
  }

  /** Check if DevTools are active */
  public get enabled(): boolean {
    return this.isEnabled;
  }

  /** Obtenir les statistiques */
  public get stats() {
    return {
      enabled: this.isEnabled,
      actionCount: this.actionCounter,
      config: this.config,
    };
  }
}

/** Instance globale des DevTools (singleton) */
let devToolsInstance: FusionStateDevTools | null = null;

/**
 * Create or get DevTools instance
 * ✅ PERFORMANCE: Singleton pattern to avoid multiple instances
 */
export function createDevTools(config?: DevToolsConfig): FusionStateDevTools {
  if (!devToolsInstance) {
    devToolsInstance = new FusionStateDevTools(config);
  }
  return devToolsInstance;
}

/** Obtenir l'instance actuelle des DevTools */
export function getDevTools(): FusionStateDevTools | null {
  return devToolsInstance;
}

/**
 * Hook React pour utiliser les DevTools dans les composants
 * ✅ PERFORMANCE: Ne fait rien en production si devOnly=true
 */
export function useDevTools() {
  const devtools = getDevTools();

  return {
    enabled: devtools?.enabled ?? false,
    stats: devtools?.stats ?? null,
    send: devtools?.send.bind(devtools) ?? (() => {}),
  };
}

/**
 * Action types for DevTools
 * Helps standardize messages
 */
export const DevToolsActions = {
  INIT: 'INIT',
  SET_STATE: 'SET_STATE',
  UPDATE_KEY: 'UPDATE_KEY',
  PERSIST_LOAD: 'PERSIST_LOAD',
  PERSIST_SAVE: 'PERSIST_SAVE',
  ERROR: 'ERROR',
} as const;

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
