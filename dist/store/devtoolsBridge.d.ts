import { GlobalState } from '../types';
import { CreateStoreOptions } from './types';
/**
 * Headless DevTools bridge attached to a {@link Store}. The plain-JS
 * counterpart of the legacy `useDevToolsBridge` hook — no React imports, no
 * hook plumbing, just a pair of `init` / `send` methods backed by the
 * `FusionStateDevTools` singleton.
 *
 * In production builds (and when `devOnly: true`, the default), the bridge
 * stays silent: `enabled` is `false` and `send` is a no-op. Allocating the
 * bridge therefore costs ~one object regardless of build mode.
 */
export interface DevToolsBridge {
    /** `true` when the Redux DevTools extension is connected and accepting messages. */
    readonly enabled: boolean;
    /**
     * Send the initial state to the DevTools panel. Called exactly once at
     * store construction time — subsequent state changes go through {@link send}.
     */
    init: (state: GlobalState) => void;
    /**
     * Forward a state change to the DevTools panel. No-op when {@link enabled}
     * is `false`, so callers don't need to gate the call themselves.
     */
    send: (actionType: string, state: GlobalState, key?: string, payload?: unknown) => void;
}
/**
 * Build a {@link DevToolsBridge}. Pure JS. Honours the same `boolean | DevToolsConfig`
 * shape the legacy Provider accepted: `false`/`undefined` skips construction
 * entirely (cheapest possible bridge), `true` opts into defaults with
 * `devOnly: true`, an object overrides anything you pass through.
 */
export declare function createDevToolsBridge(config: CreateStoreOptions['devTools']): DevToolsBridge;
