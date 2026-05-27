import React from 'react';
import {render, screen, act} from '@testing-library/react';
import {
  // Deprecated hooks
  useSharedState,
  usePersistentState,
  useAppState,
  // Deprecated providers
  GlobalStateProvider,
  StateProvider,
  AppStateProvider,
  // Deprecated storage factories
  createWebStorageAdapter,
  createRNStorageAdapter,
  createMobileStorageAdapter,
  createInMemoryAdapter,
  autoDetectStorage,
  NoopStorageAdapter,
  // Deprecated example key objects
  AppKeys,
  UserKeys,
  // Modern API used for assertions
  FusionStateProvider,
  useFusionState,
} from '../index';
import {__resetDeprecationWarnings} from '../utils/deprecation';

const MIGRATION_URL =
  'https://github.com/jgerard72/react-fusion-state#-migration-to-v2-preview';

/**
 * Render a hook inside a `FusionStateProvider` via a tiny consumer component
 * — necessary because the deprecated hooks are still real React hooks that
 * subscribe to context.
 */
function renderHookOnce(
  use: (key: string, initial: unknown) => unknown,
  key = 'k',
  initial: unknown = 0,
) {
  function Consumer() {
    use(key, initial);
    return <div data-testid="ready" />;
  }
  render(
    <FusionStateProvider>
      <Consumer />
    </FusionStateProvider>,
  );
  return screen.getByTestId('ready');
}

describe('Deprecation warnings (v1.3.0+)', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    __resetDeprecationWarnings();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  describe.each([
    ['useSharedState', useSharedState, 'useFusionState'],
    ['usePersistentState', usePersistentState, 'useFusionState'],
    ['useAppState', useAppState, 'useFusionState'],
  ])('deprecated hook %s', (oldName, hook, newName) => {
    it('emits a single warning on first use and stays functional', () => {
      renderHookOnce(hook as never, 'k', 1);

      expect(warnSpy).toHaveBeenCalledTimes(1);
      const msg = warnSpy.mock.calls[0][0] as string;
      expect(msg).toContain(`\`${oldName}\``);
      expect(msg).toContain(`\`${newName}\``);
      expect(msg).toContain('v2.0.0');
      expect(msg).toContain(MIGRATION_URL);
    });
  });

  it('does NOT re-emit a deprecation warning on subsequent calls of the same alias', () => {
    function App() {
      useSharedState('a', 1);
      useSharedState('b', 2);
      useSharedState('c', 3);
      return null;
    }
    render(
      <FusionStateProvider>
        <App />
      </FusionStateProvider>,
    );
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('emits one warning PER ALIAS even when they share the same target', () => {
    function App() {
      useSharedState('a', 1);
      usePersistentState('b', 2);
      useAppState('c', 3);
      return null;
    }
    render(
      <FusionStateProvider>
        <App />
      </FusionStateProvider>,
    );
    expect(warnSpy).toHaveBeenCalledTimes(3);
    const messages = warnSpy.mock.calls.map(c => c[0]).join('\n');
    expect(messages).toContain('`useSharedState`');
    expect(messages).toContain('`usePersistentState`');
    expect(messages).toContain('`useAppState`');
  });

  // ---------------------------------------------------------------------------
  // Providers
  // ---------------------------------------------------------------------------

  describe.each([
    ['GlobalStateProvider', GlobalStateProvider],
    ['StateProvider', StateProvider],
    ['AppStateProvider', AppStateProvider],
  ])('deprecated provider %s', (oldName, Provider) => {
    it('renders children and emits a single warning on mount', () => {
      function Child() {
        const [v] = useFusionState('x', 'hello');
        return <span data-testid="v">{String(v)}</span>;
      }
      render(
        <Provider>
          <Child />
        </Provider>,
      );

      expect(screen.getByTestId('v')).toHaveTextContent('hello');
      expect(warnSpy).toHaveBeenCalledTimes(1);
      const msg = warnSpy.mock.calls[0][0] as string;
      expect(msg).toContain(`\`${oldName}\``);
      expect(msg).toContain('`FusionStateProvider`');
      expect(msg).toContain('v2.0.0');
    });
  });

  it('provider warning does not re-fire on re-render', () => {
    function Counter() {
      const [n, setN] = useFusionState('n', 0);
      return (
        <button data-testid="b" onClick={() => setN(n + 1)}>
          {n}
        </button>
      );
    }
    render(
      <GlobalStateProvider>
        <Counter />
      </GlobalStateProvider>,
    );
    act(() => screen.getByTestId('b').click());
    act(() => screen.getByTestId('b').click());
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  // ---------------------------------------------------------------------------
  // Storage factories
  // ---------------------------------------------------------------------------

  describe.each([
    ['createWebStorageAdapter', createWebStorageAdapter, 'createLocalStorageAdapter'],
    ['createRNStorageAdapter', createRNStorageAdapter, 'createAsyncStorageAdapter'],
    ['createMobileStorageAdapter', createMobileStorageAdapter, 'createAsyncStorageAdapter'],
    ['createInMemoryAdapter', createInMemoryAdapter, 'createMemoryStorageAdapter'],
    ['autoDetectStorage', autoDetectStorage, 'detectBestStorageAdapter'],
    ['NoopStorageAdapter', NoopStorageAdapter, 'createNoopStorageAdapter'],
  ])('deprecated storage factory %s', (oldName, factory, newName) => {
    it('returns a usable adapter and emits a single warning', () => {
      const adapter = (factory as () => unknown)();
      expect(adapter).toBeTruthy();
      expect(typeof (adapter as {getItem?: unknown}).getItem).toBe('function');

      expect(warnSpy).toHaveBeenCalledTimes(1);
      const msg = warnSpy.mock.calls[0][0] as string;
      expect(msg).toContain(`\`${oldName}\``);
      expect(msg).toContain(`\`${newName}\``);
      expect(msg).toContain('v2.0.0');
    });
  });

  it('storage factory called multiple times only warns once', () => {
    createWebStorageAdapter();
    createWebStorageAdapter();
    createWebStorageAdapter();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  // ---------------------------------------------------------------------------
  // Example key objects (Proxy-based)
  // ---------------------------------------------------------------------------

  describe.each([
    ['AppKeys', AppKeys, 'createKey', 'user'],
    ['UserKeys', UserKeys, 'createNamespacedKey', 'profile'],
  ])('deprecated example object %s', (oldName, obj, newName, sampleProp) => {
    it('still exposes the expected key on property access', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const key = (obj as any)[sampleProp];
      expect(key).toBeTruthy();
      expect(key.__brand).toBe('FusionStateKey');
    });

    it('emits a single warning regardless of how many properties are read', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const o = obj as any;
      void o[sampleProp];
      void o[sampleProp];
      void Object.values(o); // triggers `get` on every own prop

      expect(warnSpy).toHaveBeenCalled();
      const calls = warnSpy.mock.calls.filter(c =>
        (c[0] as string).includes(`\`${oldName}\``),
      );
      expect(calls.length).toBe(1);
      const msg = calls[0][0] as string;
      expect(msg).toContain(`\`${newName}\``);
      expect(msg).toContain('v2.0.0');
    });
  });

  // ---------------------------------------------------------------------------
  // Reset helper
  // ---------------------------------------------------------------------------

  it('__resetDeprecationWarnings makes the warning fire again', () => {
    createWebStorageAdapter();
    expect(warnSpy).toHaveBeenCalledTimes(1);

    __resetDeprecationWarnings();
    warnSpy.mockClear();
    createWebStorageAdapter();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
