import {GlobalState} from '../types';
import {createSubscriptionRegistry} from './createSubscriptionRegistry';
import {createPersistenceEngine} from './persistenceEngine';
import {createDevToolsBridge} from './devtoolsBridge';
import {createReactBindings} from './createReactBindings';
import {DevToolsActions} from '../devtools';
import {CreateStoreOptions, Store} from './types';

/**
 * Create a {@link Store} — the entry point of the v1.4 multi-store API.
 *
 * The returned object exposes:
 * - a headless layer (`getState`, `setState`, `subscribe`, `subscribeKey`,
 *   `destroy`) usable anywhere — Web Workers, Node scripts, RSC, tests, etc.
 * - a React layer (`Provider`, `useFusionState`, `useFusionStore`,
 *   `useFusionHydrated`) bound to *this* store via closure.
 *
 * All configuration (`initialState`, `debug`, `persistence`, `devTools`) is
 * captured at factory time and frozen for the lifetime of the store — same
 * contract as the legacy `FusionStateProvider` props.
 *
 * Mounting two stores in the same app produces fully-isolated state and
 * subscription graphs: mutating store A never notifies any listener on
 * store B. This is the headline feature of v1.4.
 *
 * @example
 * ```tsx
 * const cartStore = createStore({ initialState: { items: [] }, persistence: ['items'] });
 *
 * // React
 * <cartStore.Provider>
 *   <Cart />
 * </cartStore.Provider>
 * function Cart() {
 *   const [items, setItems] = cartStore.useFusionState('items', []);
 *   // ...
 * }
 *
 * // Or headless
 * cartStore.getState();
 * cartStore.setState({ items: [{ id: 1 }] });
 * const unsub = cartStore.subscribe(() => console.log(cartStore.getState()));
 * ```
 */
export function createStore(options: CreateStoreOptions = {}): Store {
  const {
    initialState: callerInitialState = {},
    debug = false,
    persistence,
    devTools,
  } = options;

  // -----------------------------------------------------------------------
  // 1. Build the persistence engine first — sync hydration runs eagerly so
  //    `engine.initialState` is already merged with any on-disk data by the
  //    time we seed the store's state below.
  // -----------------------------------------------------------------------
  const persistenceEngine = createPersistenceEngine(
    persistence,
    callerInitialState,
    debug,
  );

  // -----------------------------------------------------------------------
  // 2. Build the DevTools bridge. Cheap when disabled (returns a noop object).
  // -----------------------------------------------------------------------
  const devToolsBridge = createDevToolsBridge(devTools);

  // -----------------------------------------------------------------------
  // 3. Allocate the subscription registry (per-key + global).
  // -----------------------------------------------------------------------
  const subscriptions = createSubscriptionRegistry();

  // -----------------------------------------------------------------------
  // 4. Mutable state. Plain JS variable — not a React hook, not a ref.
  // -----------------------------------------------------------------------
  let state: GlobalState = persistenceEngine.initialState;
  let destroyed = false;

  // Send the initial state to DevTools so the panel shows the seeded values
  // even before the first user-triggered mutation. No-op when DevTools is
  // disabled.
  devToolsBridge.init(state);

  // Tracking set used by `useFusionState` to guard against duplicate key
  // initialisations across two simultaneously-mounting consumers. Lives on
  // the store so each store has its own guard scope.
  const initializingKeys = new Set<string>();

  const getState = (): GlobalState => state;

  /**
   * Compute the changed-keys list between two state snapshots. Linear in
   * the size of the *union* of keys, with two passes to detect both
   * removals (in prev but not next) and additions/updates (in next).
   */
  const diffKeys = (
    prev: GlobalState,
    next: GlobalState,
  ): string[] => {
    const changed: string[] = [];
    const seen = new Set<string>();
    for (const k of Object.keys(prev)) {
      seen.add(k);
      if (prev[k] !== next[k]) changed.push(k);
    }
    for (const k of Object.keys(next)) {
      if (seen.has(k)) continue;
      if (prev[k] !== next[k]) changed.push(k);
    }
    return changed;
  };

  const setState = (
    updater:
      | Partial<GlobalState>
      | ((prev: GlobalState) => GlobalState),
  ): void => {
    if (destroyed) return;

    const prev = state;
    const next =
      typeof updater === 'function'
        ? (updater as (p: GlobalState) => GlobalState)(prev)
        : {...prev, ...updater};

    // Identity shortcut — common when an updater returns `prev` unchanged
    // (matches the React `useState` "bail-out" semantics that `useFusionState`
    // relies on internally for deep-equality dedup).
    if (prev === next) return;

    const changedKeys = diffKeys(prev, next);
    if (changedKeys.length === 0) return;

    state = next;

    // 1. Per-key + global listener notifications, batched.
    subscriptions.notifyKeys(changedKeys);

    // 2. Debug log.
    if (debug) {
      console.log('[FusionState] State updated:', {
        previous: prev,
        next,
        diff: Object.fromEntries(changedKeys.map(k => [k, next[k]])),
      });
    }

    // 3. DevTools dispatch.
    devToolsBridge.send(
      DevToolsActions.SET_STATE,
      next,
      changedKeys.join(', '),
      {
        changed: changedKeys,
        diff: Object.fromEntries(
          changedKeys.map(k => [k, {from: prev[k], to: next[k]}]),
        ),
      },
    );

    // 4. Persistence — skip the first save when the change comes from the
    //    async-hydration apply (we just loaded this data, don't write it
    //    straight back).
    if (persistenceEngine.shouldSkipNextSave()) return;
    persistenceEngine.save(next);
  };

  const subscribe = subscriptions.subscribe;
  const subscribeKey = subscriptions.subscribeKey;

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    subscriptions.clear();
    persistenceEngine.destroy();
  };

  // -----------------------------------------------------------------------
  // 5. Kick off async hydration. On web with localStorage this is a no-op
  //    (the engine returns immediately because `isHydrated` is already
  //    `true`). On React Native / AsyncStorage the loaded snapshot is
  //    applied via `setState` so existing subscribers see the change.
  // -----------------------------------------------------------------------
  persistenceEngine.startAsyncHydration(loaded => {
    setState(prev => ({...prev, ...loaded}));
  });

  // -----------------------------------------------------------------------
  // 6. Build the React bindings layer. The store reference passed below is
  //    closed over by every binding so calling `store.useFusionState(...)`
  //    reads from this store and nothing else.
  // -----------------------------------------------------------------------
  // Forward-declare an object that will be mutated with the bindings — lets
  // us pass the live store to `createReactBindings` while still freezing
  // the public shape via the return below.
  const storeShell = {
    getState,
    setState,
    subscribe,
    subscribeKey,
    destroy,
    get isHydrated() {
      return persistenceEngine.isHydrated;
    },
    /** @internal */
    initializingKeys,
    /** @internal */
    persistenceEngine,
    __isFusionStore: true as const,
  };

  const bindings = createReactBindings(storeShell);

  const store: Store = Object.assign(storeShell, bindings);

  // Report any sync-load failure synchronously after construction. The
  // legacy hook deferred this to a `useEffect`; doing it now means even
  // pure-JS consumers get the callback. Wrapped in a microtask so the
  // caller has a chance to attach the `onLoadError` handler between the
  // factory call and the report (in practice config is set at factory time
  // so the handler is already wired, but the microtask keeps things tidy).
  Promise.resolve().then(() => persistenceEngine.reportStartupError());

  return store;
}

/**
 * Internal shape passed to {@link createReactBindings}. Exposes the headless
 * surface plus a couple of fields needed by the bindings layer (the shared
 * `initializingKeys` set and direct access to the persistence engine for
 * the `useFusionHydrated` hook).
 *
 * Kept module-private so external code can only reach the documented
 * {@link Store} surface.
 *
 * @internal
 */
export type StoreShell = Omit<
  Store,
  'Provider' | 'useFusionState' | 'useFusionStore' | 'useFusionHydrated'
> & {
  initializingKeys: Set<string>;
  persistenceEngine: ReturnType<typeof createPersistenceEngine>;
};
