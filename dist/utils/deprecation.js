"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deprecateObject = exports.deprecateComponent = exports.deprecate = exports.__resetDeprecationWarnings = exports.warnDeprecated = void 0;
const react_1 = __importDefault(require("react"));
/**
 * Runtime deprecation warning system for legacy aliases.
 *
 * Every `@deprecated` export in the public API routes its first call through
 * one of these wrappers, which emits a single `console.warn` per alias per
 * session. After that first warning the alias becomes silent — no log spam
 * on every render, no overhead beyond a `Set.has` lookup.
 *
 * Active in both development and production builds. Library users who
 * deploy to production with deprecated aliases need to see the warning at
 * least once, otherwise they're caught off-guard by the eventual removal.
 *
 * @internal — these helpers are not part of the public API. The wrapped
 * aliases (exposed via `src/index.ts`, `src/storage/storageAdapters.ts`
 * and `src/createKey.ts`) are the public surface.
 */
const MIGRATION_URL = 'https://github.com/jgerard72/react-fusion-state#-migration-to-v2-preview';
const emitted = new Set();
/**
 * Emit the standard deprecation message exactly once per `oldName`.
 *
 * @param oldName - Name of the deprecated symbol (e.g. `'useSharedState'`).
 * @param newName - Name of the recommended replacement (e.g. `'useFusionState'`).
 * @param kind - Category label used in the message (`'hook'`, `'component'`,
 *   `'function'`, `'export'`, …). Default: `'export'`.
 */
function warnDeprecated(oldName, newName, kind = 'export') {
    if (emitted.has(oldName))
        return;
    emitted.add(oldName);
    // Plain template literal — keeps the message tree-shake-stable and avoids
    // pulling any extra dependency. Single line so log aggregators don't split it.
    // eslint-disable-next-line no-console
    console.warn(`[FusionState] The ${kind} \`${oldName}\` is deprecated and will be removed in v2.0.0. ` +
        `Use \`${newName}\` instead — same signature, drop-in replacement. See ${MIGRATION_URL}`);
}
exports.warnDeprecated = warnDeprecated;
/**
 * Reset the internal emitted-warnings set. Test-only helper, exported so
 * `__tests__/deprecation.test.tsx` can assert "fires exactly once per
 * session" without bleeding state across `it()` blocks.
 *
 * @internal — do not call from application code.
 */
function __resetDeprecationWarnings() {
    emitted.clear();
}
exports.__resetDeprecationWarnings = __resetDeprecationWarnings;
/**
 * Wrap a plain function so the first call emits the deprecation warning and
 * subsequent calls pass through unchanged.
 *
 * Preserves the function's `name` (useful in stack traces) and its `this`
 * binding (in case anyone calls it via `.call` / `.apply`).
 */
function deprecate(fn, oldName, newName, kind = 'function') {
    const wrapped = function (...args) {
        warnDeprecated(oldName, newName, kind);
        return fn.apply(this, args);
    };
    // Force the wrapper to inherit the alias name so devtools / error stacks
    // still report `useSharedState` (the name the user wrote) instead of
    // `wrapped`.
    try {
        Object.defineProperty(wrapped, 'name', { value: oldName, configurable: true });
    }
    catch (_a) {
        // `Function.name` is non-configurable in some older runtimes — best effort.
    }
    return wrapped;
}
exports.deprecate = deprecate;
/**
 * Wrap a React component so the deprecation warning fires once on first
 * mount, then renders the underlying component transparently.
 *
 * The wrapper itself is a regular FC. The wrapped `Component` is rendered
 * verbatim and keeps any optimizations it already had (e.g. `React.memo`).
 * `displayName` is set to `oldName` so React DevTools shows the alias the
 * user actually wrote.
 */
function deprecateComponent(Component, oldName, newName) {
    const Wrapped = (props) => {
        // Fire-once is enforced inside `warnDeprecated` — the mount-only effect
        // here just guarantees we don't warn during a render that gets thrown
        // away (e.g. StrictMode double-invoke).
        react_1.default.useEffect(() => {
            warnDeprecated(oldName, newName, 'component');
        }, []);
        return react_1.default.createElement(Component, props);
    };
    Wrapped.displayName = oldName;
    return Wrapped;
}
exports.deprecateComponent = deprecateComponent;
/**
 * Wrap an object so any property read fires the deprecation warning.
 *
 * Implemented with a `Proxy` that intercepts only the `get` trap — iteration
 * (`Object.keys`, `for…in`) and `has` (`in` operator) stay silent so dev
 * tools introspection and shallow logging don't trigger noise. The first
 * meaningful read (`AppKeys.user`, `UserKeys.profile`, …) does fire the
 * warning, which is the case we actually care about.
 */
function deprecateObject(obj, oldName, newName) {
    return new Proxy(obj, {
        get(target, prop, receiver) {
            // Skip framework internals — Symbol-keyed lookups (Symbol.toPrimitive,
            // Symbol.iterator, etc.) shouldn't trigger a "you're using a
            // deprecated export!" message.
            if (typeof prop !== 'symbol') {
                warnDeprecated(oldName, newName, 'export');
            }
            return Reflect.get(target, prop, receiver);
        },
    });
}
exports.deprecateObject = deprecateObject;
//# sourceMappingURL=deprecation.js.map