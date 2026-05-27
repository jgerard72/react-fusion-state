import React from 'react';
import {render, waitFor, act} from '@testing-library/react';
import {
  loadSyncInitialState,
  usePersistence,
} from '../../hooks/usePersistence';
import {GlobalState, PersistenceConfig} from '../../types';
import {
  ExtendedStorageAdapter,
  StorageAdapter,
} from '../../storage/storageAdapters';

const STORAGE_KEY = 'fusion_state_all';

function makeSyncAdapter(initialStore: Record<string, string> = {}): {
  adapter: ExtendedStorageAdapter;
  store: Record<string, string>;
  spies: {getItem: jest.Mock; setItem: jest.Mock; getItemSync: jest.Mock};
} {
  const store = {...initialStore};
  const spies = {
    getItem: jest.fn(async (key: string) => store[key] ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
    getItemSync: jest.fn((key: string) => store[key] ?? null),
  };

  const adapter: ExtendedStorageAdapter = {
    getItem: spies.getItem,
    setItem: spies.setItem,
    removeItem: async (key: string) => {
      delete store[key];
    },
    getItemSync: spies.getItemSync,
  };

  return {adapter, store, spies};
}

function makeAsyncOnlyAdapter(initialStore: Record<string, string> = {}): {
  adapter: StorageAdapter;
  store: Record<string, string>;
  spies: {getItem: jest.Mock; setItem: jest.Mock};
} {
  const store = {...initialStore};
  const spies = {
    getItem: jest.fn(async (key: string) => store[key] ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
  };

  const adapter: StorageAdapter = {
    getItem: spies.getItem,
    setItem: spies.setItem,
    removeItem: async (key: string) => {
      delete store[key];
    },
  };

  return {adapter, store, spies};
}

describe('loadSyncInitialState', () => {
  it('returns initialState when no config is provided', () => {
    const result = loadSyncInitialState(undefined, {a: 1}, false);
    expect(result.state).toEqual({a: 1});
    expect(result.error).toBeNull();
  });

  it('returns initialState when loadOnInit is false', () => {
    const {adapter} = makeSyncAdapter({
      [STORAGE_KEY]: JSON.stringify({a: 99}),
    });
    const config: PersistenceConfig = {adapter, loadOnInit: false};
    const result = loadSyncInitialState(config, {a: 1}, false);
    expect(result.state).toEqual({a: 1});
    expect(result.error).toBeNull();
  });

  it('returns initialState when adapter has no getItemSync (RN / async-only)', () => {
    const {adapter} = makeAsyncOnlyAdapter({
      [STORAGE_KEY]: JSON.stringify({a: 99}),
    });
    const config: PersistenceConfig = {adapter};
    const result = loadSyncInitialState(config, {a: 1}, false);
    expect(result.state).toEqual({a: 1});
    expect(result.error).toBeNull();
  });

  it('merges storage on top of initialState when sync load succeeds', () => {
    const {adapter} = makeSyncAdapter({
      [STORAGE_KEY]: JSON.stringify({a: 99, b: 'fromStorage'}),
    });
    const config: PersistenceConfig = {adapter};
    const result = loadSyncInitialState(
      config,
      {a: 1, b: 'fromInit', c: true},
      false,
    );
    expect(result.state).toEqual({a: 99, b: 'fromStorage', c: true});
    expect(result.error).toBeNull();
  });

  it('captures the error and falls back to initialState when sync load throws', () => {
    const adapter: ExtendedStorageAdapter = {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
      getItemSync: () => {
        throw new Error('boom');
      },
    };
    const config: PersistenceConfig = {adapter};

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const result = loadSyncInitialState(config, {a: 1}, true);

    expect(result.state).toEqual({a: 1});
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe('boom');
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

function Harness({
  config,
  setStateRaw,
  syncLoadError,
  debug,
  onMount,
}: {
  config: PersistenceConfig | undefined;
  setStateRaw: React.Dispatch<React.SetStateAction<GlobalState>>;
  syncLoadError: Error | null;
  debug?: boolean;
  onMount: (api: ReturnType<typeof usePersistence>) => void;
}) {
  const api = usePersistence(config, setStateRaw, syncLoadError, debug);
  React.useEffect(() => {
    onMount(api);
  }, [api, onMount]);
  return null;
}

describe('usePersistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns isHydrated=true immediately when no config is provided', () => {
    let captured: ReturnType<typeof usePersistence> | null = null;
    render(
      <Harness
        config={undefined}
        setStateRaw={() => {}}
        syncLoadError={null}
        onMount={(api) => (captured = api)}
      />,
    );
    expect(captured!.isHydrated).toBe(true);
  });

  it('returns isHydrated=true on web when the adapter supports getItemSync', () => {
    const {adapter} = makeSyncAdapter();
    const config: PersistenceConfig = {adapter, persistKeys: true};

    let captured: ReturnType<typeof usePersistence> | null = null;
    render(
      <Harness
        config={config}
        setStateRaw={() => {}}
        syncLoadError={null}
        onMount={(api) => (captured = api)}
      />,
    );
    expect(captured!.isHydrated).toBe(true);
  });

  it('starts isHydrated=false then flips to true after async load (RN path)', async () => {
    const {adapter, spies} = makeAsyncOnlyAdapter({
      [STORAGE_KEY]: JSON.stringify({fromStorage: 1}),
    });
    const config: PersistenceConfig = {adapter, persistKeys: true};

    const setStateRaw = jest.fn();
    let captured: ReturnType<typeof usePersistence> | null = null;
    const onMount = jest.fn((api) => {
      captured = api;
    });

    render(
      <Harness
        config={config}
        setStateRaw={setStateRaw}
        syncLoadError={null}
        onMount={onMount}
      />,
    );

    await waitFor(() => {
      expect(spies.getItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    await waitFor(() => {
      expect(captured!.isHydrated).toBe(true);
    });

    // setStateRaw should have been called with the loaded snapshot.
    expect(setStateRaw).toHaveBeenCalled();
    const updaterArg = setStateRaw.mock.calls[0][0];
    expect(typeof updaterArg).toBe('function');
    const merged = updaterArg({existing: 'value'});
    expect(merged).toEqual({existing: 'value', fromStorage: 1});
  });

  it('shouldSkipNextSave returns true exactly once after an async hydration apply', async () => {
    const {adapter} = makeAsyncOnlyAdapter({
      [STORAGE_KEY]: JSON.stringify({hydrated: true}),
    });
    const config: PersistenceConfig = {adapter, persistKeys: true};

    let captured: ReturnType<typeof usePersistence> | null = null;
    render(
      <Harness
        config={config}
        setStateRaw={jest.fn()}
        syncLoadError={null}
        onMount={(api) => (captured = api)}
      />,
    );

    await waitFor(() => {
      expect(captured!.isHydrated).toBe(true);
    });

    expect(captured!.shouldSkipNextSave()).toBe(true);
    expect(captured!.shouldSkipNextSave()).toBe(false);
  });

  it('save persists only the configured keys (array form)', async () => {
    const {adapter, spies} = makeSyncAdapter();
    const config: PersistenceConfig = {
      adapter,
      persistKeys: ['keep'],
    };

    let captured: ReturnType<typeof usePersistence> | null = null;
    render(
      <Harness
        config={config}
        setStateRaw={() => {}}
        syncLoadError={null}
        onMount={(api) => (captured = api)}
      />,
    );

    act(() => captured!.save({keep: 'yes', drop: 'no'}));

    await waitFor(() => {
      expect(spies.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify({keep: 'yes'}),
      );
    });
  });

  it('save persists ALL keys when persistKeys=true', async () => {
    const {adapter, spies} = makeSyncAdapter();
    const config: PersistenceConfig = {
      adapter,
      persistKeys: true,
    };

    let captured: ReturnType<typeof usePersistence> | null = null;
    render(
      <Harness
        config={config}
        setStateRaw={() => {}}
        syncLoadError={null}
        onMount={(api) => (captured = api)}
      />,
    );

    act(() => captured!.save({a: 1, b: 2}));

    await waitFor(() => {
      expect(spies.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify({a: 1, b: 2}),
      );
    });
  });

  it('save uses a function filter when persistKeys is a function', async () => {
    const {adapter, spies} = makeSyncAdapter();
    const config: PersistenceConfig = {
      adapter,
      persistKeys: (key: string) => key.startsWith('keep_'),
    };

    let captured: ReturnType<typeof usePersistence> | null = null;
    render(
      <Harness
        config={config}
        setStateRaw={() => {}}
        syncLoadError={null}
        onMount={(api) => (captured = api)}
      />,
    );

    act(() => captured!.save({keep_a: 1, keep_b: 2, drop_c: 3}));

    await waitFor(() => {
      expect(spies.setItem).toHaveBeenCalled();
      const payload = JSON.parse(spies.setItem.mock.calls[0][1]);
      expect(payload).toEqual({keep_a: 1, keep_b: 2});
    });
  });

  it('save does NOT persist when saveOnChange=false', () => {
    const {adapter, spies} = makeSyncAdapter();
    const config: PersistenceConfig = {
      adapter,
      persistKeys: true,
      saveOnChange: false,
    };

    let captured: ReturnType<typeof usePersistence> | null = null;
    render(
      <Harness
        config={config}
        setStateRaw={() => {}}
        syncLoadError={null}
        onMount={(api) => (captured = api)}
      />,
    );

    act(() => captured!.save({a: 1}));
    expect(spies.setItem).not.toHaveBeenCalled();
  });

  it('save invokes onSaveError callback when adapter.setItem throws', async () => {
    const adapter: ExtendedStorageAdapter = {
      getItem: async () => null,
      setItem: async () => {
        throw new Error('write fail');
      },
      removeItem: async () => {},
      getItemSync: () => null,
    };
    const onSaveError = jest.fn();
    const config: PersistenceConfig = {
      adapter,
      persistKeys: true,
      onSaveError,
    };

    let captured: ReturnType<typeof usePersistence> | null = null;
    render(
      <Harness
        config={config}
        setStateRaw={() => {}}
        syncLoadError={null}
        onMount={(api) => (captured = api)}
      />,
    );

    act(() => captured!.save({a: 1}));

    await waitFor(() => {
      expect(onSaveError).toHaveBeenCalled();
    });
    expect(onSaveError.mock.calls[0][0].message).toBe('write fail');
  });

  it('reports a sync-load error via onLoadError after mount', async () => {
    const onLoadError = jest.fn();
    const adapter: ExtendedStorageAdapter = {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
      getItemSync: () => null,
    };
    const config: PersistenceConfig = {
      adapter,
      persistKeys: true,
      onLoadError,
    };

    render(
      <Harness
        config={config}
        setStateRaw={() => {}}
        syncLoadError={new Error('sync boom')}
        onMount={() => {}}
      />,
    );

    await waitFor(() => {
      expect(onLoadError).toHaveBeenCalled();
    });
    expect(onLoadError.mock.calls[0][0].message).toBe('sync boom');
    expect(onLoadError.mock.calls[0][1]).toBe(STORAGE_KEY);
  });

  it('dedups consecutive saves of identical content (deep equality)', async () => {
    const {adapter, spies} = makeSyncAdapter();
    const config: PersistenceConfig = {adapter, persistKeys: true};

    let captured: ReturnType<typeof usePersistence> | null = null;
    render(
      <Harness
        config={config}
        setStateRaw={() => {}}
        syncLoadError={null}
        onMount={(api) => (captured = api)}
      />,
    );

    act(() => captured!.save({a: 1, b: 2}));
    await waitFor(() => expect(spies.setItem).toHaveBeenCalledTimes(1));

    // Same content (deep-equal) → no second write.
    act(() => captured!.save({a: 1, b: 2}));
    await new Promise((r) => setTimeout(r, 10));
    expect(spies.setItem).toHaveBeenCalledTimes(1);

    // Different content → second write fires.
    act(() => captured!.save({a: 1, b: 3}));
    await waitFor(() => expect(spies.setItem).toHaveBeenCalledTimes(2));
  });
});
