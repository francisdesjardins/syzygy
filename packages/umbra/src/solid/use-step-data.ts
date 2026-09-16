import { readStepData } from '../core/read-data.js';
import type { DataOf, StepId } from '../core/registry.js';
import { useBootstrapContext } from './bootstrap-provider.js';

/**
 * One step's data, typed from its id, or `undefined` while the run has not produced it.
 *
 * **Returns an accessor**, unlike React's, which returns the value: the data arrives after the
 * component has rendered, and a plain value read once would stay `undefined`.
 *
 * @example
 * const config = useStepData('config');
 * return <h1>{config()?.workspaceName ?? 'Loading…'}</h1>;
 */
export function useStepData<TId extends StepId>(id: TId): () => DataOf<TId> | undefined {
  const snapshot = useBootstrapContext();
  return () => {
    return readStepData(snapshot().outcome, id);
  };
}
