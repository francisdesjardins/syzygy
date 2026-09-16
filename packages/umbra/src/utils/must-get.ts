import { BootstrapError } from '../core/errors.js';

/**
 * A map read whose miss is a broken invariant rather than a case to handle.
 *
 * `noUncheckedIndexedAccess` makes every `map.get` return `T | undefined`, and the honest answer at
 * most of this package's call sites is that the key was put there by the planner two functions ago.
 * Without one place to say so, that fact gets restated as a guard in forty others.
 */
export function mustGet<TKey, TValue>(map: ReadonlyMap<TKey, TValue>, key: TKey): TValue {
  const value = map.get(key);
  if (value === undefined) {
    throw new BootstrapError(`Invariant broken: no entry for ${String(key)}.`);
  }
  return value;
}
