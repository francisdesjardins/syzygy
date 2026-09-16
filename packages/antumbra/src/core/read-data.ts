import type { DataOf, StepId } from './registry.js';
import type { Outcome } from './types.js';

/**
 * One step's data off an outcome whose step list is no longer in the type.
 *
 * The same untyped boundary as `ctx.get` and `createBootstrap`: settled values live in a map keyed
 * by step id, and the id is what re-attaches the declared type. It exists so the bindings do not
 * each grow a cast of their own — the three in this package are all this one boundary.
 *
 * @example
 * // `outcome` here is the untyped one a binding holds: the step list is long gone, and the
 * // id is what puts the declared type back.
 * const config = readStepData(outcome, 'config');
 * banner.textContent = config?.workspaceName ?? 'Loading…';
 */
export function readStepData<TId extends StepId>(
  outcome: Outcome | undefined,
  id: TId
): DataOf<TId> | undefined {
  if (outcome === undefined) {
    return undefined;
  }
  const data: Record<string, unknown> = outcome.data;
  return data[id] as DataOf<TId> | undefined;
}
