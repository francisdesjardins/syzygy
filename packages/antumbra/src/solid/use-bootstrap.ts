import { onMount } from 'solid-js';
import type { Bootstrap } from '../core/create-bootstrap.js';
import type { RunSnapshot } from '../core/run-observer.js';
import type { AnyStep } from '../core/types.js';
import { fromStore } from './from-store.js';

/**
 * Run a bootstrap and track it in a signal.
 *
 * **Returns an accessor, so do not destructure it.** `const snapshot = useBootstrap(boot)` then
 * `snapshot().stage`; pulling `stage` out once reads the value at that instant and never again,
 * which is the one difference between this binding and React's.
 *
 * The observer lives on the bootstrap rather than on the component, so however many components call
 * this, the bootstrap runs once and they all read the same snapshot.
 *
 * @example
 * const snapshot = useBootstrap(boot);
 * return <Show when={snapshot().stage === 'settled'} fallback={<Splash />}>{...}</Show>;
 */
export function useBootstrap<TSteps extends readonly AnyStep[]>(
  boot: Bootstrap<TSteps>
): () => RunSnapshot<TSteps> {
  const observer = boot.observe();
  onMount(() => {
    observer.start();
  });
  return fromStore(observer.store);
}
