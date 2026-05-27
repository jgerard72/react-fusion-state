import React from 'react';
/**
 * Emit the standard deprecation message exactly once per `oldName`.
 *
 * @param oldName - Name of the deprecated symbol (e.g. `'useSharedState'`).
 * @param newName - Name of the recommended replacement (e.g. `'useFusionState'`).
 * @param kind - Category label used in the message (`'hook'`, `'component'`,
 *   `'function'`, `'export'`, …). Default: `'export'`.
 */
export declare function warnDeprecated(oldName: string, newName: string, kind?: string): void;
/**
 * Reset the internal emitted-warnings set. Test-only helper, exported so
 * `__tests__/deprecation.test.tsx` can assert "fires exactly once per
 * session" without bleeding state across `it()` blocks.
 *
 * @internal — do not call from application code.
 */
export declare function __resetDeprecationWarnings(): void;
/**
 * Wrap a plain function so the first call emits the deprecation warning and
 * subsequent calls pass through unchanged.
 *
 * Preserves the function's `name` (useful in stack traces) and its `this`
 * binding (in case anyone calls it via `.call` / `.apply`).
 */
export declare function deprecate<T extends (...args: never[]) => unknown>(fn: T, oldName: string, newName: string, kind?: string): T;
/**
 * Wrap a React component so the deprecation warning fires once on first
 * mount, then renders the underlying component transparently.
 *
 * The wrapper itself is a regular FC. The wrapped `Component` is rendered
 * verbatim and keeps any optimizations it already had (e.g. `React.memo`).
 * `displayName` is set to `oldName` so React DevTools shows the alias the
 * user actually wrote.
 */
export declare function deprecateComponent<P extends object>(Component: React.ComponentType<P>, oldName: string, newName: string): React.ComponentType<P>;
/**
 * Wrap an object so any property read fires the deprecation warning.
 *
 * Implemented with a `Proxy` that intercepts only the `get` trap — iteration
 * (`Object.keys`, `for…in`) and `has` (`in` operator) stay silent so dev
 * tools introspection and shallow logging don't trigger noise. The first
 * meaningful read (`AppKeys.user`, `UserKeys.profile`, …) does fire the
 * warning, which is the case we actually care about.
 */
export declare function deprecateObject<T extends object>(obj: T, oldName: string, newName: string): T;
