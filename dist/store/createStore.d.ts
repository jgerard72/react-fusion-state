import { createPersistenceEngine } from './persistenceEngine';
import { CreateStoreOptions, Store } from './types';
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
export declare function createStore(options?: CreateStoreOptions): Store;
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
export type StoreShell = Omit<Store, 'Provider' | 'useFusionState' | 'useFusionStore' | 'useFusionHydrated'> & {
    initializingKeys: Set<string>;
    persistenceEngine: ReturnType<typeof createPersistenceEngine>;
};
