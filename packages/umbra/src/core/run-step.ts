import type { Clock } from '../utils/clock.js';
import { serializeError } from '../utils/serialize-error.js';
import { BlockSignal } from './errors.js';
import type { PlannedStep } from './plan.js';
import type { AbortReason, SerializedError, StepStatus } from './types.js';

export type StepAttempt = {
  readonly status: StepStatus;
  readonly value?: unknown;
  readonly error?: SerializedError | undefined;
  /** Set when the step refused the mount, so the scheduler can report who and why. */
  readonly block?: BlockSignal | undefined;
  readonly startedAt: number;
  readonly durationMs: number;
  readonly lateWrites: number;
};

export type AttemptArgs = {
  readonly planned: PlannedStep;
  readonly clock: Clock;
  /** The run's signal. A step's own timeout is composed onto it here, not by the caller. */
  readonly rootSignal: AbortSignal;
  /** Builds the context and returns both it and the call that closes it. */
  readonly withContext: (signal: AbortSignal) => {
    readonly invoke: () => unknown;
    readonly settle: () => number;
  };
};

function isAbortReason(value: unknown): value is AbortReason {
  return typeof value === 'object' && value !== null && 'kind' in value;
}

/**
 * Run one step, bounded by its timeout and the run's signal.
 *
 * **The timeout starts here**, at the moment the step is actually entered, rather than when the
 * plan was computed. A step that waits behind a dependency has not spent any of its own budget, and
 * measuring from planning would expire steps that never ran.
 *
 * **Nothing in here ever rejects an unawaited promise.** The step's work is folded into a promise
 * that resolves with either branch, and the abort side resolves rather than rejects, so a step that
 * loses the race and fails a second later cannot take the process down with an unhandled rejection
 * — which is the failure mode that turns a red test into a dead test runner.
 */
export async function attemptStep(args: AttemptArgs): Promise<StepAttempt> {
  const { planned, clock, rootSignal } = args;
  const controller = new AbortController();
  const startedAt = clock.wall();
  const startedElapsed = clock.elapsed();

  const propagate = (): void => {
    const reason: unknown = rootSignal.reason;
    controller.abort(
      isAbortReason(reason) ? reason : { kind: 'external', message: 'The run signal aborted.' }
    );
  };

  if (rootSignal.aborted) {
    propagate();
  } else {
    rootSignal.addEventListener('abort', propagate, { once: true });
  }

  const timer =
    planned.timeout === undefined
      ? undefined
      : setTimeout(() => {
          const reason: AbortReason = {
            kind: 'step-timeout',
            step: planned.id,
            message: `Step "${String(planned.id)}" exceeded ${String(planned.timeout)}ms.`,
          };
          controller.abort(reason);
        }, planned.timeout);

  const { invoke, settle } = args.withContext(controller.signal);

  // Resolves with either branch, so this promise is incapable of rejecting. That is what makes it
  // safe to lose the race below.
  const work = Promise.resolve()
    .then(() => {
      return invoke();
    })
    .then(
      (value: unknown) => {
        return { kind: 'value', value } as const;
      },
      (error: unknown) => {
        return { kind: 'error', error } as const;
      }
    );

  let onAbort: (() => void) | undefined;
  const aborted = new Promise<{ readonly kind: 'abort' }>((resolve) => {
    if (controller.signal.aborted) {
      resolve({ kind: 'abort' });
      return;
    }
    onAbort = () => {
      resolve({ kind: 'abort' });
    };
    controller.signal.addEventListener('abort', onAbort, { once: true });
  });

  const finish = (attempt: StepAttempt): StepAttempt => {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    rootSignal.removeEventListener('abort', propagate);
    if (onAbort !== undefined) {
      controller.signal.removeEventListener('abort', onAbort);
    }
    return attempt;
  };

  const raced = await Promise.race([work, aborted]);
  const base = {
    startedAt,
    durationMs: clock.elapsed() - startedElapsed,
  };

  if (raced.kind === 'abort') {
    const lateWrites = settle();
    const reason: unknown = controller.signal.reason;
    const kind = isAbortReason(reason) ? reason.kind : 'external';
    return finish({
      ...base,
      lateWrites,
      status: kind === 'step-timeout' ? 'timed-out' : 'cancelled',
      error: serializeError(
        new Error(isAbortReason(reason) ? reason.message : 'The run signal aborted.')
      ),
    });
  }

  const lateWrites = settle();

  if (raced.kind === 'value') {
    return finish({ ...base, lateWrites, status: 'success', value: raced.value });
  }

  if (raced.error instanceof BlockSignal) {
    return finish({ ...base, lateWrites, status: 'blocked', block: raced.error });
  }

  return finish({
    ...base,
    lateWrites,
    status: 'failed',
    error: serializeError(raced.error),
  });
}
