"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFusionState = void 0;
const defaultStore_1 = require("./store/defaultStore");
function useFusionState(keyInput, initialValue, options) {
    const store = (0, defaultStore_1.useDefaultStore)();
    // `store.useFusionState` is the canonical implementation created in
    // `createReactBindings(store)` — a hook itself, called here as a hook from
    // another hook. The rules-of-hooks linter can't statically see that
    // `store.useFusionState` is a hook (dynamic property access), but the
    // call is always made unconditionally at the top level of `useFusionState`,
    // which satisfies the real React contract.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return store.useFusionState(keyInput, initialValue, options);
}
exports.useFusionState = useFusionState;
//# sourceMappingURL=useFusionState.js.map