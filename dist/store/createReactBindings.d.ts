import { FC, ReactNode } from 'react';
import { GlobalState, StateUpdater, UseFusionStateOptions } from '../types';
import { TypedKey } from '../createKey';
import type { StoreShell } from './createStore';
/**
 * Build the React-binding layer for a store. Returns a `Provider` component
 * plus the three public hooks (`useFusionState`, `useFusionStore`,
 * `useFusionHydrated`) closed over the supplied {@link StoreShell}.
 *
 * The hooks below are intentionally *not* a re-implementation of the
 * module-level hooks: they are the canonical implementation, and the
 * module-level hooks (kept for 1.3.x compatibility) are thin wrappers that
 * delegate to the bindings of the nearest store in the React tree.
 *
 * @internal — invoked exactly once per store, inside {@link createStore}.
 */
export declare function createReactBindings(store: StoreShell): {
    Provider: FC<{
        children: ReactNode;
    }>;
    useFusionState: <T = unknown>(key: string | TypedKey<T>, initialValue?: T, options?: UseFusionStateOptions) => [T, StateUpdater<T>];
    useFusionStore: <T>(selector: (state: GlobalState) => T, equalityFn?: (a: T, b: T) => boolean) => T;
    useFusionHydrated: () => boolean;
};
