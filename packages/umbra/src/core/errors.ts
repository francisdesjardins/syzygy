import type { StepId } from './registry.js';

/**
 * Everything this package throws, so a consumer can catch the whole family at one door.
 *
 * @example
 * try {
 *   await boot.run();
 * } catch (error) {
 *   if (error instanceof BootstrapError) {
 *     report(error);
 *     return;
 *   }
 *   throw error;
 * }
 */
export class BootstrapError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'BootstrapError';
  }
}

/**
 * The graph itself is wrong: a cycle, a duplicate id, an edge to a step that does not exist, or a
 * preflight step that depends on a mounted one.
 *
 * Thrown synchronously by `createBootstrap`, never handed back through an outcome. These are
 * programming mistakes, and a status field is the wrong place to report one — the run should not
 * start at all.
 *
 * @example
 * // Two steps claiming one id: the graph cannot be compiled, so nothing runs.
 * try {
 *   createBootstrap({ steps: [session, session] });
 * } catch (error) {
 *   if (error instanceof PlanError) {
 *     console.error(error.message);
 *   }
 * }
 */
export class PlanError extends BootstrapError {
  constructor(message: string) {
    super(message);
    this.name = 'PlanError';
  }
}

/**
 * `ctx.get` was called with an id this step did not declare in `needs`.
 *
 * @example
 * // A step read an id it did not list in `needs`. The typed `ctx.get` already refuses that at
 * // compile time, so what reaches here came from an id the types could not see — and it is a
 * // programming mistake, not a runtime condition: fix the `needs`, do not retry.
 * const failed = outcome.failures.find((failure) => {
 *   return failure.error.name === 'UndeclaredDependencyError';
 * });
 */
export class UndeclaredDependencyError extends BootstrapError {
  constructor(step: StepId, dependency: StepId) {
    super(
      `Step "${String(step)}" read "${String(dependency)}" without declaring it in needs. ` +
        `An undeclared read has no ordering guarantee.`
    );
    this.name = 'UndeclaredDependencyError';
  }
}

/**
 * `ctx.get` reached a dependency that never ran, because something upstream of it did not succeed.
 *
 * @example
 * // Thrown at the read, not at the failure: the step that did not succeed is reported in the
 * // outcome, and this is what a *downstream* step sees if it reads past it.
 * const outcome = await boot.run();
 * if (outcome.status === 'failed') {
 *   console.error(outcome.failures.map((failure) => failure.id));
 * }
 */
export class StepSkippedError extends BootstrapError {
  constructor(step: StepId, dependency: StepId) {
    super(
      `Step "${String(step)}" read "${String(dependency)}", which was skipped because an upstream ` +
        `step did not succeed.`
    );
    this.name = 'StepSkippedError';
  }
}

/**
 * The sentinel `ctx.block` throws.
 *
 * Internal: the runner catches it, turns it into a `blocked` status, and it never reaches a
 * consumer. It carries the step so two concurrent refusals can be settled by plan order rather than
 * by whichever promise happened to land first.
 */
/**
 * The sentinel `ctx.skip` throws.
 *
 * Internal, like {@link BlockSignal}: the runner catches it, settles the step as `skipped`, and it
 * never reaches a consumer. Unlike a block it stops nothing — the run carries on, and the step's
 * dependents are pruned by the ordinary rule that a step runs only when its needs succeeded.
 */
export class SkipSignal extends Error {
  readonly step: StepId;
  readonly reason: string | undefined;

  constructor(step: StepId, reason?: string) {
    super(
      reason === undefined
        ? `Step "${String(step)}" does not apply.`
        : `Step "${String(step)}" does not apply: ${reason}`
    );
    this.name = 'SkipSignal';
    this.step = step;
    this.reason = reason;
  }
}

export class BlockSignal extends Error {
  readonly step: StepId;
  /** Named for what it is, not for its container: `outcome.blockedBy.reason` is the same string. */
  readonly reason: string;

  constructor(step: StepId, reason: string) {
    super(`Step "${String(step)}" blocked the mount: ${reason}`);
    this.name = 'BlockSignal';
    this.step = step;
    this.reason = reason;
  }
}
