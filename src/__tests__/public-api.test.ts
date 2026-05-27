/**
 * Public API surface snapshot.
 *
 * Locks the exported symbols of `react-fusion-state` so that any accidental
 * removal or rename of a public export fails the test loudly. New exports
 * are allowed (the snapshot will need to be updated), but removals require
 * a deliberate decision (typically a major version bump per SemVer).
 *
 * If this test fails:
 * - Adding a new export → update the snapshot intentionally
 * - Removing/renaming an export → BREAKING change, requires a major version
 */

import * as publicApi from '../index';

describe('Public API surface', () => {
  it('exposes the expected set of named exports', () => {
    const exportedNames = Object.keys(publicApi).sort();

    expect(exportedNames).toMatchInlineSnapshot(`
      [
        "AppKeys",
        "AppStateProvider",
        "DevToolsActions",
        "FusionStateError",
        "FusionStateErrorMessages",
        "FusionStateProvider",
        "GlobalStateProvider",
        "NoopStorageAdapter",
        "PersistenceError",
        "StateProvider",
        "UserKeys",
        "autoDetectStorage",
        "createAsyncStorageAdapter",
        "createDevTools",
        "createInMemoryAdapter",
        "createKey",
        "createLocalStorageAdapter",
        "createMemoryStorageAdapter",
        "createMobileStorageAdapter",
        "createNamespacedKey",
        "createNoopStorageAdapter",
        "createRNStorageAdapter",
        "createWebStorageAdapter",
        "debounce",
        "detectBestStorageAdapter",
        "extractKeyName",
        "formatErrorMessage",
        "getDevTools",
        "isSSREnvironment",
        "isTypedKey",
        "shallow",
        "simpleDeepEqual",
        "useAppState",
        "useDevTools",
        "useFusionHydrated",
        "useFusionState",
        "useFusionStateLog",
        "useFusionStore",
        "useGlobalState",
        "usePersistentState",
        "useSharedState",
      ]
    `);
  });

  it('exposes FusionStateProvider as a callable React component', () => {
    expect(typeof publicApi.FusionStateProvider).toBe('object'); // React.memo returns object
  });

  it('exposes useFusionState as a function', () => {
    expect(typeof publicApi.useFusionState).toBe('function');
  });

  it('exposes createAsyncStorageAdapter as a function', () => {
    expect(typeof publicApi.createAsyncStorageAdapter).toBe('function');
  });

  it('exposes createKey as a function', () => {
    expect(typeof publicApi.createKey).toBe('function');
  });

  it('exposes createDevTools as a function', () => {
    expect(typeof publicApi.createDevTools).toBe('function');
  });

  it('exposes error classes', () => {
    expect(typeof publicApi.FusionStateError).toBe('function');
    expect(typeof publicApi.PersistenceError).toBe('function');
  });
});
