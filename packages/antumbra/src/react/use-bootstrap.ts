import { useEffect, useSyncExternalStore } from 'react';
import type { Bootstrap } from '../core/create-bootstrap.js';
import type { RunSnapshot } from '../core/run-observer.js';
import type { AnyStep } from '../core/types.js';

/**
 * Run a bootstrap and re-render as it progresses.
 *
 * The observer lives on the bootstrap rather than on the component, so however many components call
 * this, the bootstrap runs once and they all read the same snapshot. That is also why there is no
 * cleanup here: the observer's lifetime is the bootstrap's, and disposing it when one component
 * unmounted would blind the others.
 *
 * `start` is idempotent, which is what makes the effect safe under StrictMode's double invocation.
 *
 * @example
 * function Shell({ boot }: { boot: Bootstrap<typeof steps> }) {
 *   const { stage, outcome } = useBootstrap(boot);
 *   // `outcome` is what narrows it, not `stage`: they are two independent fields on the
 *   // snapshot, so testing the stage leaves the outcome possibly undefined.
 *   if (outcome === undefined) {
 *     return <Splash stage={stage} />;
 *   }
 *   return outcome.status === 'blocked' ? <SignIn /> : <App />;
 * }
 */
export function useBootstrap<TSteps extends readonly AnyStep[]>(
  boot: Bootstrap<TSteps>
): RunSnapshot<TSteps> {
  const observer = boot.observe();

  useEffect(() => {
    observer.start();
  }, [observer]);

  return useSyncExternalStore(observer.store.subscribe, observer.store.get, observer.store.get);
}
