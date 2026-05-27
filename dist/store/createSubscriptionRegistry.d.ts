import { SubscriptionRegistry } from './types';
/**
 * Plain JS subscription registry — the headless equivalent of
 * `useKeySubscriptions`. Holds a `Map<key, Set<listener>>` for per-key
 * subscribers plus a flat `Set<listener>` for global subscribers (selectors).
 *
 * All notifications run through {@link batch} so any React re-renders
 * triggered downstream are coalesced into a single commit on React DOM and
 * React Native. On React 18 (auto-batching) the batch wrapper is a free no-op.
 *
 * @internal — backs `subscribe` / `subscribeKey` on every {@link Store}.
 */
export declare function createSubscriptionRegistry(): SubscriptionRegistry;
