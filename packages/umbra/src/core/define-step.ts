import type { StepId } from './registry.js';
import type { DataOf } from './registry.js';
import type { HostedContext, PreflightContext, Step, StepScope } from './types.js';

/**
 * One preflight step: work that runs before anything mounts.
 *
 * A pass-through at runtime; everything it does happens in the checker, and it has to be a function
 * call to do it. `satisfies` would verify the shape but cannot establish the correlation that
 * matters — that `ctx.get` inside `run` accepts exactly the ids this step listed in `needs`. Only an
 * inference site ties those together.
 *
 * **`const TNeeds` is the whole mechanism.** Without it `needs: ['session']` widens to `string[]`,
 * `TNeeds[number]` becomes `string`, and `ctx.get` quietly accepts anything. The failure is silent,
 * which is what makes it worth a type parameter nobody reads.
 *
 * Keep `id` first in the literal: declaration order steers inference order, and `run`'s return type
 * is checked against the data type read off `id`.
 *
 * @example
 * const session = defineStep({
 *   id: 'session',
 *   timeout: 3000,
 *   run: async (ctx) => {
 *     return validateToken(ctx.signal);
 *   },
 * });
 *
 * const config = defineStep({
 *   id: 'config',
 *   needs: ['session'],
 *   optional: true,
 *   run: async (ctx) => {
 *     return fetchConfig(ctx.get('session').userId);
 *   },
 * });
 */
export function defineStep<
  const TId extends StepId,
  const TNeeds extends readonly StepId[] = readonly [],
>(step: {
  readonly id: TId;
  readonly needs?: TNeeds | undefined;
  readonly optional?: boolean | undefined;
  readonly timeout?: number | undefined;
  readonly scope?: StepScope | undefined;
  run(ctx: PreflightContext<TNeeds>): DataOf<TId> | Promise<DataOf<TId>>;
}): Step<TId, TNeeds, 'preflight'> {
  return { ...step, phase: 'preflight' };
}

/**
 * One mounted step: work that runs after a binding has taken over, with the UI port in hand.
 *
 * A separate function rather than a `phase` field on {@link defineStep}, because the two phases get
 * two different context types and a single generic would hand every step the union of them — which
 * takes `block` away from preflight steps and `ui` away from mounted ones, in the same signature.
 *
 * Returns nothing: `run()` resolves at the end of preflight, so a value produced here would arrive
 * after the outcome was handed over.
 *
 * @example
 * const trialWarning = defineHostedStep({
 *   id: 'trial-warning',
 *   needs: ['config'],
 *   run: async (ctx) => {
 *     const { daysLeft } = ctx.get('config');
 *     if (daysLeft < 30) {
 *       await ctx.awaitIntent('warn:trial-expiring', { daysLeft });
 *     }
 *   },
 * });
 */
export function defineHostedStep<
  const TId extends StepId,
  const TNeeds extends readonly StepId[] = readonly [],
>(step: {
  readonly id: TId;
  readonly needs?: TNeeds | undefined;
  readonly optional?: boolean | undefined;
  readonly timeout?: number | undefined;
  run(ctx: HostedContext<TNeeds>): void | Promise<void>;
}): Step<TId, TNeeds, 'hosted'> {
  return { ...step, phase: 'hosted' };
}
