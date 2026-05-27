"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useKeySubscriptions = useKeySubscriptions;
const react_1 = require("react");
const batch_1 = require("../utils/batch");
/**
 * Hook that maintains a per-key subscription registry for the provider.
 *
 * The registry is a `Map<key, Set<listener>>`, allowing per-key fine-grained
 * notifications instead of broadcasting every change to every consumer.
 * Listeners are invoked inside a `batch()` so React batches the resulting
 * re-renders on both React DOM and React Native.
 *
 * The `state` and `initialState` are captured by reference (refs) so that the
 * returned snapshot getters always read the latest values without forcing the
 * subscription callbacks themselves to depend on those values.
 *
 * @param state - The current global state (live reference).
 * @param initialState - The initial state used as the server-side snapshot.
 */
function useKeySubscriptions(state, initialState) {
    const listenersRef = (0, react_1.useRef)(new Map());
    const globalListenersRef = (0, react_1.useRef)(new Set());
    // Live refs so the snapshot getters never close over stale values.
    const stateRef = (0, react_1.useRef)(state);
    stateRef.current = state;
    const initialStateRef = (0, react_1.useRef)(initialState);
    initialStateRef.current = initialState;
    const subscribeKey = (0, react_1.useCallback)((key, listener) => {
        let set = listenersRef.current.get(key);
        if (!set) {
            set = new Set();
            listenersRef.current.set(key, set);
        }
        set.add(listener);
        return () => {
            set.delete(listener);
            if (set.size === 0) {
                listenersRef.current.delete(key);
            }
        };
    }, []);
    const notifyKey = (0, react_1.useCallback)((key) => {
        const listeners = listenersRef.current.get(key);
        if (listeners && listeners.size > 0) {
            (0, batch_1.batch)(() => {
                listeners.forEach(l => l());
            });
        }
    }, []);
    const getKeySnapshot = (0, react_1.useCallback)((key) => {
        const current = stateRef.current;
        return key in current ? current[key] : undefined;
    }, []);
    const getServerSnapshot = (0, react_1.useCallback)((key) => {
        const initial = initialStateRef.current;
        return key in initial ? initial[key] : undefined;
    }, []);
    const subscribeAll = (0, react_1.useCallback)((listener) => {
        globalListenersRef.current.add(listener);
        return () => {
            globalListenersRef.current.delete(listener);
        };
    }, []);
    const notifyAll = (0, react_1.useCallback)(() => {
        if (globalListenersRef.current.size === 0)
            return;
        (0, batch_1.batch)(() => {
            globalListenersRef.current.forEach(l => l());
        });
    }, []);
    const getStateSnapshot = (0, react_1.useCallback)(() => stateRef.current, []);
    return {
        subscribeKey,
        notifyKey,
        getKeySnapshot,
        getServerSnapshot,
        subscribeAll,
        notifyAll,
        getStateSnapshot,
    };
}
//# sourceMappingURL=useKeySubscriptions.js.map