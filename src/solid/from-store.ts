import { createSignal, onCleanup } from 'solid-js';
import type { ReadableStore } from '../store/create-store.js';

/**
 * A core store as a Solid accessor.
 *
 * The one adapter Solid needs and React does not: React has `useSyncExternalStore` for exactly this
 * shape, and Solid has signals, so the bridge is written once here rather than in every hook.
 *
 * `equals: false` because the store hands back a new snapshot object on every change and Solid's
 * default referential check would be doing work that the store already did.
 */
export function fromStore<TValue>(store: ReadableStore<TValue>): () => TValue {
  const [value, setValue] = createSignal(store.get(), { equals: false });
  const unsubscribe = store.subscribe((next) => {
    setValue(() => {
      return next;
    });
  });
  onCleanup(unsubscribe);
  return value;
}
