"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubscriptionRegistry = createSubscriptionRegistry;
const batch_1 = require("../utils/batch");
/**
 * Plain JS subscription registry — the headless equivalent of
 * `useKeySubscriptions`. Holds a `Map<key, Set<listener>>` for per-key
 * subscribers plus a flat `Set<listener>` for global subscribers (selectors).
 *
 * All notifications run through {@link batch} so any React re-renders
 * triggered downstream are coalesced into a single commit on React DOM and
 * React Native. On React 18 (auto-batching) the batch wrapper is a free no-op.
 *
 * @internal — backs `subscribe` / `subscribeKey` on every {@link Store}.
 */
function createSubscriptionRegistry() {
    const perKey = new Map();
    const global = new Set();
    const subscribeKey = (key, listener) => {
        let set = perKey.get(key);
        if (!set) {
            set = new Set();
            perKey.set(key, set);
        }
        set.add(listener);
        return () => {
            const current = perKey.get(key);
            if (!current)
                return;
            current.delete(listener);
            if (current.size === 0)
                perKey.delete(key);
        };
    };
    const subscribe = (listener) => {
        global.add(listener);
        return () => {
            global.delete(listener);
        };
    };
    /**
     * Fire all listeners affected by a state mutation. Per-key listeners are
     * notified first (one set per changed key) then global listeners (one
     * notification regardless of how many keys changed). Everything wrapped in
     * a single `batch()` call so React commits once.
     */
    const notifyKeys = (changedKeys) => {
        if (changedKeys.length === 0 && global.size === 0)
            return;
        (0, batch_1.batch)(() => {
            for (const key of changedKeys) {
                const listeners = perKey.get(key);
                if (!listeners || listeners.size === 0)
                    continue;
                // Iterate over a snapshot — listeners may unsubscribe themselves
                // synchronously (a common pattern in `useEffect` cleanups).
                const snapshot = Array.from(listeners);
                for (const l of snapshot)
                    l();
            }
            if (global.size > 0) {
                const snapshot = Array.from(global);
                for (const l of snapshot)
                    l();
            }
        });
    };
    const clear = () => {
        perKey.clear();
        global.clear();
    };
    return { subscribeKey, subscribe, notifyKeys, clear };
}
//# sourceMappingURL=createSubscriptionRegistry.js.map