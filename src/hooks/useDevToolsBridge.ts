import {useEffect, useMemo} from 'react';
import {
  createDevTools,
  DevToolsActions,
  DevToolsConfig,
} from '../devtools';
import {GlobalState} from '../types';

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
  send: (
    actionType: string,
    state: GlobalState,
    key?: string,
    payload?: unknown,
  ) => void;
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
export function useDevToolsBridge(
  config: boolean | DevToolsConfig | undefined,
  initialState: GlobalState,
): DevToolsBridgeAPI {
  const instance = useMemo(() => {
    if (!config) return null;
    const resolved =
      typeof config === 'boolean'
        ? {name: 'FusionState', devOnly: true}
        : {...config, devOnly: config.devOnly ?? true};
    return createDevTools(resolved);
  }, [config]);

  useEffect(() => {
    if (!instance?.enabled) return;
    instance.init(initialState);
    instance.send(DevToolsActions.INIT, initialState, undefined, {
      initialState,
    });
    // The init step runs exactly once for the lifetime of the DevTools instance.
    // initialState is captured at mount and never changes for that instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance]);

  const enabled = instance?.enabled ?? false;

  const send = useMemo(() => {
    if (!instance?.enabled) {
      return () => {};
    }
    return (
      actionType: string,
      state: GlobalState,
      key?: string,
      payload?: unknown,
    ) => {
      instance.send(actionType, state, key, payload);
    };
  }, [instance]);

  return {enabled, send};
}
