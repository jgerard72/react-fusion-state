import {createContext, useContext} from 'react';
import {FusionStateErrorMessages} from '../types';
import {Store} from './types';

/**
 * Single React Context that holds the *nearest* {@link Store} in the tree.
 *
 * Every `Store.Provider` (returned by {@link createStore}) injects its store
 * here. The module-level hooks (`useFusionState`, `useFusionStore`, …) read
 * this context to figure out which store they belong to — preserving the
 * 1.3.x developer experience where you import a hook and use it without
 * threading any reference around.
 *
 * Nested providers follow standard React Context semantics: the innermost
 * `<store.Provider>` wins for its subtree.
 *
 * Exposed as `undefined` by default so consumers used outside any provider
 * throw the familiar `PROVIDER_MISSING` error (matches 1.3.x behaviour).
 *
 * @internal — not part of the public API. Use `createStore()` to interact
 * with stores from application code.
 */
export const DefaultStoreContext = createContext<Store | undefined>(undefined);

/**
 * Resolve the active {@link Store} for module-level hooks. Throws the same
 * `PROVIDER_MISSING` error users have always seen when no provider is
 * mounted above the hook — message left verbatim for backward compat.
 *
 * @internal
 */
export function useDefaultStore(): Store {
  const store = useContext(DefaultStoreContext);
  if (!store) {
    throw new Error(FusionStateErrorMessages.PROVIDER_MISSING);
  }
  return store;
}
