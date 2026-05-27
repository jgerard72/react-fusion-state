/**
 * Headless tests for `createStore()` — the multi-store factory introduced in
 * v1.4.0. These tests intentionally import zero React: they exercise the
 * plain-JS surface (`getState`, `setState`, `subscribe`, `subscribeKey`,
 * `destroy`) and the persistence + DevTools side effects that happen
 * regardless of any React Provider being mounted.
 *
 * The React-bound surface (Provider, hooks) is covered separately in
 * `createStore.react.test.tsx`.
 */
import {createStore} from '../store/createStore';
import {Store} from '../store/types';
import {GlobalState, StorageAdapter} from '../index';

/**
 * Build a minimal in-memory storage adapter for persistence tests. Synchronous
 * under the hood, but exposes the async `StorageAdapter` contract.
 */
function makeMemoryAdapter(initial: Record<string, string> = {}) {
  const data = {...initial};
  const calls = {get: 0, set: 0, remove: 0};
  const adapter: StorageAdapter = {
    async getItem(key) {
      calls.get++;
      return key in data ? data[key] : null;
    },
    async setItem(key, value) {
      calls.set++;
      data[key] = value;
    },
    async removeItem(key) {
      calls.remove++;
      delete data[key];
    },
  };
  return {adapter, data, calls};
}

const flushMicrotasks = () =>
  new Promise<void>(resolve => setTimeout(resolve, 0));

describe('createStore (headless API)', () => {
  describe('basic state surface', () => {
    it('returns a store branded `__isFusionStore: true`', () => {
      const store = createStore();
      expect(store.__isFusionStore).toBe(true);
    });

    it('seeds state with `initialState`', () => {
      const store = createStore({initialState: {count: 0, name: 'Jacques'}});
      expect(store.getState()).toEqual({count: 0, name: 'Jacques'});
    });

    it('starts with an empty state when no `initialState` is given', () => {
      const store = createStore();
      expect(store.getState()).toEqual({});
    });

    it('updates state with a plain partial object (shallow merge)', () => {
      const store = createStore({initialState: {a: 1, b: 2}});
      store.setState({b: 20, c: 3});
      expect(store.getState()).toEqual({a: 1, b: 20, c: 3});
    });

    it('updates state with an updater function', () => {
      const store = createStore({initialState: {count: 0}});
      store.setState(prev => ({...prev, count: (prev.count as number) + 1}));
      store.setState(prev => ({...prev, count: (prev.count as number) + 1}));
      expect(store.getState()).toEqual({count: 2});
    });

    it('returns the new state on subsequent `getState` calls', () => {
      const store = createStore();
      expect(store.getState()).toEqual({});
      store.setState({hello: 'world'});
      expect(store.getState()).toEqual({hello: 'world'});
    });

    it('treats reference-equal `setState` as a no-op', () => {
      const store = createStore({initialState: {n: 1}});
      const listener = jest.fn();
      store.subscribe(listener);
      store.setState(prev => prev);
      expect(listener).not.toHaveBeenCalled();
    });

    it('skips notification when partial merge changes nothing', () => {
      const store = createStore({initialState: {n: 1}});
      const listener = jest.fn();
      store.subscribe(listener);
      // Same value for `n`, no new keys — `diffKeys` returns [] → no notify.
      store.setState({n: 1});
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('subscribe (global listener)', () => {
    it('fires the listener on every state change', () => {
      const store = createStore({initialState: {n: 0}});
      const listener = jest.fn();
      store.subscribe(listener);
      store.setState({n: 1});
      store.setState({n: 2});
      store.setState({n: 3});
      expect(listener).toHaveBeenCalledTimes(3);
    });

    it('returns an unsubscribe function that stops further notifications', () => {
      const store = createStore({initialState: {n: 0}});
      const listener = jest.fn();
      const unsub = store.subscribe(listener);
      store.setState({n: 1});
      unsub();
      store.setState({n: 2});
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('supports multiple listeners', () => {
      const store = createStore();
      const a = jest.fn();
      const b = jest.fn();
      const c = jest.fn();
      store.subscribe(a);
      store.subscribe(b);
      store.subscribe(c);
      store.setState({x: 1});
      expect(a).toHaveBeenCalledTimes(1);
      expect(b).toHaveBeenCalledTimes(1);
      expect(c).toHaveBeenCalledTimes(1);
    });
  });

  describe('subscribeKey (per-key listener)', () => {
    it('only fires when the given key changes', () => {
      const store = createStore({initialState: {a: 1, b: 1}});
      const aListener = jest.fn();
      const bListener = jest.fn();
      store.subscribeKey('a', aListener);
      store.subscribeKey('b', bListener);

      store.setState({a: 2});
      expect(aListener).toHaveBeenCalledTimes(1);
      expect(bListener).not.toHaveBeenCalled();

      store.setState({b: 2});
      expect(aListener).toHaveBeenCalledTimes(1);
      expect(bListener).toHaveBeenCalledTimes(1);
    });

    it('fires both listeners when both keys change in one setState', () => {
      const store = createStore({initialState: {a: 1, b: 1}});
      const aListener = jest.fn();
      const bListener = jest.fn();
      store.subscribeKey('a', aListener);
      store.subscribeKey('b', bListener);
      store.setState({a: 2, b: 2});
      expect(aListener).toHaveBeenCalledTimes(1);
      expect(bListener).toHaveBeenCalledTimes(1);
    });

    it('unsubscribes cleanly without affecting other listeners on the same key', () => {
      const store = createStore({initialState: {a: 1}});
      const l1 = jest.fn();
      const l2 = jest.fn();
      const unsub1 = store.subscribeKey('a', l1);
      store.subscribeKey('a', l2);
      unsub1();
      store.setState({a: 2});
      expect(l1).not.toHaveBeenCalled();
      expect(l2).toHaveBeenCalledTimes(1);
    });
  });

  describe('multi-store isolation', () => {
    it('two stores never cross-notify even with identical keys', () => {
      const storeA = createStore({initialState: {x: 0}});
      const storeB = createStore({initialState: {x: 0}});
      const listenerA = jest.fn();
      const listenerB = jest.fn();
      storeA.subscribe(listenerA);
      storeB.subscribe(listenerB);

      storeA.setState({x: 1});
      expect(listenerA).toHaveBeenCalledTimes(1);
      expect(listenerB).not.toHaveBeenCalled();

      storeB.setState({x: 99});
      expect(listenerA).toHaveBeenCalledTimes(1);
      expect(listenerB).toHaveBeenCalledTimes(1);

      expect(storeA.getState()).toEqual({x: 1});
      expect(storeB.getState()).toEqual({x: 99});
    });

    it('per-key subscriptions are isolated across stores', () => {
      const storeA = createStore();
      const storeB = createStore();
      const aOnA = jest.fn();
      const aOnB = jest.fn();
      storeA.subscribeKey('foo', aOnA);
      storeB.subscribeKey('foo', aOnB);
      storeA.setState({foo: 1});
      expect(aOnA).toHaveBeenCalledTimes(1);
      expect(aOnB).not.toHaveBeenCalled();
    });
  });

  describe('persistence engine integration', () => {
    it('persists state on setState when `persistence: true`', async () => {
      const {adapter, data} = makeMemoryAdapter();
      const store = createStore({
        initialState: {count: 0},
        persistence: {adapter, persistKeys: true, loadOnInit: false},
      });
      store.setState({count: 5});
      // Save is fire-and-forget — wait for the microtask.
      await flushMicrotasks();
      expect(JSON.parse(data.fusion_state_all)).toEqual({count: 5});
    });

    it('persists only the keys in a `string[]` whitelist', async () => {
      const {adapter, data} = makeMemoryAdapter();
      const store = createStore({
        initialState: {keep: 1, drop: 1},
        persistence: {adapter, persistKeys: ['keep'], loadOnInit: false},
      });
      store.setState({keep: 2, drop: 99});
      await flushMicrotasks();
      expect(JSON.parse(data.fusion_state_all)).toEqual({keep: 2});
    });

    it('hydrates from async storage and notifies subscribers', async () => {
      const {adapter} = makeMemoryAdapter({
        fusion_state_all: JSON.stringify({restored: 'yes'}),
      });
      const store = createStore({
        initialState: {restored: 'no'},
        persistence: {adapter, persistKeys: true, loadOnInit: true},
      });
      const listener = jest.fn();
      store.subscribe(listener);
      // Wait for the async hydration to flush.
      await flushMicrotasks();
      expect(store.getState()).toEqual({restored: 'yes'});
      expect(listener).toHaveBeenCalled();
    });

    it('does NOT write back the freshly-loaded snapshot to storage', async () => {
      const {adapter, calls} = makeMemoryAdapter({
        fusion_state_all: JSON.stringify({restored: 'yes'}),
      });
      createStore({
        initialState: {restored: 'no'},
        persistence: {adapter, persistKeys: true, loadOnInit: true},
      });
      await flushMicrotasks();
      // Hydration triggered a setState that should have been skipped by the
      // engine's `shouldSkipNextSave` flag.
      expect(calls.set).toBe(0);
    });

    it('reports load errors via `onLoadError` callback', async () => {
      const adapter: StorageAdapter = {
        async getItem() {
          throw new Error('boom');
        },
        async setItem() {},
        async removeItem() {},
      };
      const onLoadError = jest.fn();
      createStore({
        persistence: {
          adapter,
          persistKeys: true,
          loadOnInit: true,
          onLoadError,
        },
      });
      await flushMicrotasks();
      expect(onLoadError).toHaveBeenCalledTimes(1);
      expect(onLoadError.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(onLoadError.mock.calls[0][1]).toBe('fusion_state_all');
    });

    it('reports save errors via `onSaveError` callback', async () => {
      const adapter: StorageAdapter = {
        async getItem() {
          return null;
        },
        async setItem() {
          throw new Error('disk full');
        },
        async removeItem() {},
      };
      const onSaveError = jest.fn();
      const store = createStore({
        initialState: {n: 0},
        persistence: {
          adapter,
          persistKeys: true,
          loadOnInit: false,
          onSaveError,
        },
      });
      store.setState({n: 1});
      await flushMicrotasks();
      expect(onSaveError).toHaveBeenCalledTimes(1);
      expect(onSaveError.mock.calls[0][0]).toBeInstanceOf(Error);
    });

    it('isHydrated flips from false to true after async hydration', async () => {
      const {adapter} = makeMemoryAdapter({
        fusion_state_all: JSON.stringify({hello: 'world'}),
      });
      // Force an async-only adapter by deleting any `getItemSync` field —
      // ensures `isHydrated` starts false in JSDOM where `window` exists.
      const store = createStore({
        persistence: {adapter, persistKeys: true, loadOnInit: true},
      });
      // We can't reliably assert false here because the engine snapshots
      // `isHydrated` synchronously based on adapter capabilities; JSDOM has
      // no `getItemSync` on this adapter so it should start false.
      expect(store.isHydrated).toBe(false);
      await flushMicrotasks();
      expect(store.isHydrated).toBe(true);
    });

    it('isHydrated is true immediately when persistence is disabled', () => {
      const store = createStore({initialState: {n: 0}});
      expect(store.isHydrated).toBe(true);
    });
  });

  describe('destroy', () => {
    it('clears all listeners', () => {
      const store = createStore({initialState: {n: 0}});
      const a = jest.fn();
      const b = jest.fn();
      store.subscribe(a);
      store.subscribeKey('n', b);
      store.destroy();
      store.setState({n: 1});
      expect(a).not.toHaveBeenCalled();
      expect(b).not.toHaveBeenCalled();
    });

    it('turns setState into a silent no-op', () => {
      const store = createStore({initialState: {n: 0}});
      store.destroy();
      store.setState({n: 999});
      expect(store.getState()).toEqual({n: 0});
    });

    it('is idempotent', () => {
      const store = createStore();
      expect(() => {
        store.destroy();
        store.destroy();
        store.destroy();
      }).not.toThrow();
    });
  });

  describe('typing / inference', () => {
    it('accepts an updater that returns the same reference (bail-out)', () => {
      const store: Store = createStore({initialState: {n: 0}});
      const listener = jest.fn();
      store.subscribe(listener);
      store.setState((prev: GlobalState) => prev);
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
