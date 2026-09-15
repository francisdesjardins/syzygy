import type { StepId } from './registry.js';

/** Everything this package throws, so a consumer can catch the whole family at one door. */
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
 */
export class PlanError extends BootstrapError {
  constructor(message: string) {
    super(message);
    this.name = 'PlanError';
  }
}

/** `ctx.get` was called with an id this step did not declare in `needs`. */
export class UndeclaredDependencyError extends BootstrapError {
  constructor(step: StepId, dependency: StepId) {
    super(
      `Step "${String(step)}" read "${String(dependency)}" without declaring it in needs. ` +
        `An undeclared read has no ordering guarantee.`
    );
    this.name = 'UndeclaredDependencyError';
  }
}

/** `ctx.get` reached a dependency that never ran, because something upstream of it did not succeed. */
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
export class BlockSignal extends Error {
  readonly step: StepId;
  readonly blockReason: string;

  constructor(step: StepId, blockReason: string) {
    super(`Step "${String(step)}" blocked the mount: ${blockReason}`);
    this.name = 'BlockSignal';
    this.step = step;
    this.blockReason = blockReason;
  }
}
