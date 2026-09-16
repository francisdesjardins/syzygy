import { readStepData } from '../core/read-data.js';
import type { DataOf, StepId } from '../core/registry.js';
import { useBootstrapContext } from './bootstrap-provider.js';

/**
 * One step's data, typed from its id, or `undefined` while the run has not produced it.
 *
 * `undefined` covers three different situations on purpose — the run has not settled, the step was
 * skipped, the step failed and was optional — because a component that needs to tell them apart is
 * a component that should be reading `outcome` instead.
 *
 * @example
 * const config = useStepData('config');
 * return <h1>{config?.workspaceName ?? 'Loading…'}</h1>;
 */
export function useStepData<TId extends StepId>(id: TId): DataOf<TId> | undefined {
  return readStepData(useBootstrapContext().outcome, id);
}
