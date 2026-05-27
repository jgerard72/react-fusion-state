"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDevToolsBridge = void 0;
const devtools_1 = require("../devtools");
/**
 * Build a {@link DevToolsBridge}. Pure JS. Honours the same `boolean | DevToolsConfig`
 * shape the legacy Provider accepted: `false`/`undefined` skips construction
 * entirely (cheapest possible bridge), `true` opts into defaults with
 * `devOnly: true`, an object overrides anything you pass through.
 */
function createDevToolsBridge(config) {
    var _a;
    if (!config) {
        return {
            enabled: false,
            init: () => { },
            send: () => { },
        };
    }
    const resolved = typeof config === 'boolean'
        ? { name: 'FusionState', devOnly: true }
        : Object.assign(Object.assign({}, config), { devOnly: (_a = config.devOnly) !== null && _a !== void 0 ? _a : true });
    const instance = (0, devtools_1.createDevTools)(resolved);
    const enabled = instance.enabled;
    return {
        enabled,
        init: (state) => {
            if (!enabled)
                return;
            instance.init(state);
            instance.send(devtools_1.DevToolsActions.INIT, state, undefined, { initialState: state });
        },
        send: (actionType, state, key, payload) => {
            if (!enabled)
                return;
            instance.send(actionType, state, key, payload);
        },
    };
}
exports.createDevToolsBridge = createDevToolsBridge;
//# sourceMappingURL=devtoolsBridge.js.map