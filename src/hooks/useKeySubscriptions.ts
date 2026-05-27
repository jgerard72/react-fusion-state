import {useCallback, useRef} from 'react';
import {GlobalState} from '../types';
import {batch} from '../utils/batch';

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
export function useKeySubscriptions(
  state: GlobalState,
  initialState: GlobalState,
): KeySubscriptionsAPI {
  const listenersRef = useRef<Map<string, Set<() => void>>>(new Map());
  const globalListenersRef = useRef<Set<() => void>>(new Set());

  // Live refs so the snapshot getters never close over stale values.
  const stateRef = useRef(state);
  stateRef.current = state;
  const initialStateRef = useRef(initialState);
  initialStateRef.current = initialState;

  const subscribeKey = useCallback((key: string, listener: () => void) => {
    let set = listenersRef.current.get(key);
    if (!set) {
      set = new Set();
      listenersRef.current.set(key, set);
    }
    set.add(listener);
    return () => {
      set!.delete(listener);
      if (set!.size === 0) {
        listenersRef.current.delete(key);
      }
    };
  }, []);

  const notifyKey = useCallback((key: string) => {
    const listeners = listenersRef.current.get(key);
    if (listeners && listeners.size > 0) {
      batch(() => {
        listeners.forEach(l => l());
      });
    }
  }, []);

  const getKeySnapshot = useCallback((key: string) => {
    const current = stateRef.current;
    return key in current ? current[key] : undefined;
  }, []);

  const getServerSnapshot = useCallback((key: string) => {
    const initial = initialStateRef.current;
    return key in initial ? initial[key] : undefined;
  }, []);

  const subscribeAll = useCallback((listener: () => void) => {
    globalListenersRef.current.add(listener);
    return () => {
      globalListenersRef.current.delete(listener);
    };
  }, []);

  const notifyAll = useCallback(() => {
    if (globalListenersRef.current.size === 0) return;
    batch(() => {
      globalListenersRef.current.forEach(l => l());
    });
  }, []);

  const getStateSnapshot = useCallback(() => stateRef.current, []);

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
