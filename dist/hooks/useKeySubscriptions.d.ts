import { GlobalState } from '../types';
/**
 * Result of {@link useKeySubscriptions}.
 */
export interface KeySubscriptionsAPI {
    /** Subscribe to updates for a specific key. Returns an unsubscribe function. */
    subscribeKey: (key: string, listener: () => void) => () => void;
    /** Notify all listeners subscribed to a specific key. */
    notifyKey: (key: string) => void;
    /** Read the current value for a key (client snapshot for `useSyncExternalStore`). */
    getKeySnapshot: (key: string) => unknown;
    /** Read the server-side value for a key (used during SSR hydration). */
    getServerSnapshot: (key: string) => unknown;
    /**
     * Subscribe to ANY state change. Used by {@link useFusionStore} selectors
     * that need to react to changes across multiple keys.
     */
    subscribeAll: (listener: () => void) => () => void;
    /** Notify all global listeners (called once per committed state change). */
    notifyAll: () => void;
    /** Read the full state snapshot (used by selectors). */
    getStateSnapshot: () => GlobalState;
}
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
export declare function useKeySubscriptions(state: GlobalState, initialState: GlobalState): KeySubscriptionsAPI;
