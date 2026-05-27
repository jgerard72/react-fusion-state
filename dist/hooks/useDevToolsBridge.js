"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDevToolsBridge = void 0;
const react_1 = require("react");
const devtools_1 = require("../devtools");
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
function useDevToolsBridge(config, initialState) {
    var _a;
    const instance = (0, react_1.useMemo)(() => {
        var _a;
        if (!config)
            return null;
        const resolved = typeof config === 'boolean'
            ? { name: 'FusionState', devOnly: true }
            : Object.assign(Object.assign({}, config), { devOnly: (_a = config.devOnly) !== null && _a !== void 0 ? _a : true });
        return (0, devtools_1.createDevTools)(resolved);
    }, [config]);
    (0, react_1.useEffect)(() => {
        if (!(instance === null || instance === void 0 ? void 0 : instance.enabled))
            return;
        instance.init(initialState);
        instance.send(devtools_1.DevToolsActions.INIT, initialState, undefined, {
            initialState,
        });
        // The init step runs exactly once for the lifetime of the DevTools instance.
        // initialState is captured at mount and never changes for that instance.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [instance]);
    const enabled = (_a = instance === null || instance === void 0 ? void 0 : instance.enabled) !== null && _a !== void 0 ? _a : false;
    const send = (0, react_1.useMemo)(() => {
        if (!(instance === null || instance === void 0 ? void 0 : instance.enabled)) {
            return () => { };
        }
        return (actionType, state, key, payload) => {
            instance.send(actionType, state, key, payload);
        };
    }, [instance]);
    return { enabled, send };
}
exports.useDevToolsBridge = useDevToolsBridge;
//# sourceMappingURL=useDevToolsBridge.js.map