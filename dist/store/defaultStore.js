"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDefaultStore = exports.DefaultStoreContext = void 0;
const react_1 = require("react");
const types_1 = require("../types");
/**
 * Single React Context that holds the *nearest* {@link Store} in the tree.
 *
 * Every `Store.Provider` (returned by {@link createStore}) injects its store
 * here. The module-level hooks (`useFusionState`, `useFusionStore`, …) read
 * this context to figure out which store they belong to — preserving the
 * 1.3.x developer experience where you import a hook and use it without
 * threading any reference around.
 *
 * Nested providers follow standard React Context semantics: the innermost
 * `<store.Provider>` wins for its subtree.
 *
 * Exposed as `undefined` by default so consumers used outside any provider
 * throw the familiar `PROVIDER_MISSING` error (matches 1.3.x behaviour).
 *
 * @internal — not part of the public API. Use `createStore()` to interact
 * with stores from application code.
 */
exports.DefaultStoreContext = (0, react_1.createContext)(undefined);
/**
 * Resolve the active {@link Store} for module-level hooks. Throws the same
 * `PROVIDER_MISSING` error users have always seen when no provider is
 * mounted above the hook — message left verbatim for backward compat.
 *
 * @internal
 */
function useDefaultStore() {
    const store = (0, react_1.useContext)(exports.DefaultStoreContext);
    if (!store) {
        throw new Error(types_1.FusionStateErrorMessages.PROVIDER_MISSING);
    }
    return store;
}
exports.useDefaultStore = useDefaultStore;
//# sourceMappingURL=defaultStore.js.map