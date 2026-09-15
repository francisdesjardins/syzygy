/**
 * The half a reader needs.
 *
 * Split from {@link Store} because it is what a binding is handed, and because `set` is what makes
 * a store invariant in its value: with it in the public shape, a `Bootstrap<MySteps>` could not be
 * held in a variable typed as a plain `Bootstrap`, which is a papercut nobody should have to
 * diagnose.
 */
export type ReadableStore<TValue> = {
  get: () => TValue;
  /**
   * Subscribe, and receive the current value immediately.
   *
   * The immediate call is the whole reason this is not a bare event emitter. A binding subscribes
   * when it mounts, which is after the queue already has entries in it; without the replay every
   * intent queued during preflight would reach a listener that started listening too late.
   */
  subscribe: (listener: (value: TValue) => void) => () => void;
};

/** A readable store plus the write, which only the code that owns the cell should hold. */
export type Store<TValue> = ReadableStore<TValue> & {
  set: (next: TValue) => void;
};

/**
 * One reactive cell: a value, a listener set, and nothing else.
 *
 * Hand-rolled and thirty lines, so the package keeps its promise of no runtime dependencies. It is
 * also the single place the engine would be swapped if that promise ever changed.
 */
export function createStore<TValue>(initial: TValue): Store<TValue> {
  let value = initial;
  const listeners = new Set<(value: TValue) => void>();

  return {
    get: () => {
      return value;
    },
    set: (next) => {
      value = next;
      // A copy, not the set: a listener that unsubscribes while being notified would otherwise
      // mutate the collection this loop is walking.
      for (const listener of Array.from(listeners)) {
        listener(value);
      }
    },
    subscribe: (listener) => {
      listeners.add(listener);
      listener(value);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
