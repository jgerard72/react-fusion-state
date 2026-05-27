import { DevToolsConfig } from '../devtools';
import { GlobalState } from '../types';
/**
 * Result of {@link useDevToolsBridge}.
 */
export interface DevToolsBridgeAPI {
    /** Whether the Redux DevTools extension is connected and active. */
    enabled: boolean;
    /**
     * Forward a state change to the DevTools panel. No-op if DevTools is
     * disabled, so callers don't need to gate this behind `enabled`.
     */
    send: (actionType: string, state: GlobalState, key?: string, payload?: unknown) => void;
}
/**
 * Hook that bridges the provider to the Redux DevTools browser extension.
 *
 * Creates the DevTools singleton instance on mount (only when `config` is
 * truthy) and dispatches the initial `INIT` action. After that, the returned
 * `send` method can be called from the provider's post-commit effect to log
 * each subsequent state change.
 *
 * In production, when `devOnly` is `true` (the default), the DevTools never
 * connect — `send` becomes a no-op and `enabled` stays `false`.
 *
 * @param config - DevTools configuration (`false` / `undefined` disables, `true` uses defaults).
 * @param initialState - The state used to seed the DevTools panel on mount.
 */
export declare function useDevToolsBridge(config: boolean | DevToolsConfig | undefined, initialState: GlobalState): DevToolsBridgeAPI;
