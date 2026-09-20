import type { Clock } from '../utils/clock.js';
import { createLogger } from '../utils/logger.js';
import { serializeError } from '../utils/serialize-error.js';
import { BlockSignal, BootstrapError } from './errors.js';
import type { EventHub } from './events.js';
import { createIntentQueue } from './intent-queue.js';
import { createNoticeLog } from './notice-log.js';
import { type Claim, claimSharedStep, type SharedResult } from './shared-scope.js';
import type { CompiledPlan, PlannedStep } from './plan.js';
import type { StepId } from './registry.js';
import { attemptStep, skippedTrace, type StepAttempt } from './run-step.js';
import { createPreflightContext } from './step-context.js';
import type {
  AbortReason,
  RunStatus,
  Intent,
  Notice,
  PreflightContext,
  SerializedError,
  StepFailure,
  StepStatus,
  StepTrace,
} from './types.js';

const log = createLogger('step');

/**
 * The console level each ending earns, exhaustive so the next status cannot be added without one.
 *
 * `blocked` and `skipped` are decisions the step made, and a warning about either would train a
 * reader to ignore warnings. Only what nobody asked for raises its voice.
 */
const STEP_LEVEL: Readonly<
  Record<StepStatus, (message: string, data?: Record<string, unknown>) => void>
> = {
  success: log,
  skipped: log,
  blocked: log,
  cancelled: log.warn,
  'timed-out': log.warn,
  failed: log.error,
};

/**
 * What a shared step's ending looks like to everyone else waiting on its key.
 *
 * Built from the status the scheduler settled on rather than from the attempt alone, because the
 * two disagree exactly where it matters: a refusal is authoritative in `blocks`, and a timeout is
 * the abort's answer rather than the body's.
 */
function sharedResultFrom(settled: {
  readonly status: StepStatus;
  readonly reason: string | undefined;
  readonly attempt: StepAttempt;
}): SharedResult {
  const { reason, attempt } = settled;
  switch (settled.status) {
    case 'success':
      return { kind: 'value', value: attempt.value };
    case 'blocked':
      return { kind: 'blocked', reason: reason ?? 'The step refused the mount.' };
    case 'skipped':
      return { kind: 'skipped', reason };
    case 'timed-out':
      return {
        kind: 'timed-out',
        error: attempt.error ?? serializeError(new Error('The shared step timed out.')),
      };
    case 'cancelled':
      return { kind: 'cancelled' };
    case 'failed':
    default:
      return {
        kind: 'failed',
        error: attempt.error ?? serializeError(new Error('Step did not succeed.')),
      };
  }
}

/**
 * Rebuild something throwable from a shared failure, so a sharer fails the way the owner did.
 *
 * The `cause` chain comes back with it: a sharer that only saw the outermost message would be
 * debugging a different failure than the owner. The stack does not, because the owner's frames
 * never ran here.
 */
function errorFrom(serialized: SerializedError): Error {
  const error =
    serialized.cause === undefined
      ? new Error(serialized.message)
      : new Error(serialized.message, { cause: errorFrom(serialized.cause) });
  error.name = serialized.name;
  return error;
}

export type SchedulerOptions = {
  readonly clock: Clock;
  readonly signal?: AbortSignal | undefined;
  /**
   * Milliseconds the whole preflight may take.
   *
   * Not optional in spirit even though it is in the type: a step that ignores the signal it was
   * handed will otherwise hang the run forever, and per-step timeouts cannot catch a step that
   * never returns from a synchronous loop either. The default is generous rather than absent.
   */
  readonly deadline?: number | undefined;
  /** Where the live view of the run goes, when someone asked for one. */
  readonly events?: EventHub | undefined;
};

export type PreflightResult = {
  readonly status: RunStatus;
  readonly data: ReadonlyMap<StepId, unknown>;
  readonly statuses: ReadonlyMap<StepId, StepStatus>;
  readonly notices: readonly Notice[];
  readonly intents: readonly Intent[];
  readonly errors: readonly StepFailure[];
  readonly timeline: readonly StepTrace[];
  readonly blockedBy?: { readonly step: StepId; readonly reason: string } | undefined;
};

/**
 * Fifteen seconds, which is well past the point where a user has decided the app is broken.
 *
 * @example
 * // The whole run's deadline, not one step's. Raise it for a bootstrap that legitimately
 * // waits on something slow; per-step `timeout` is the one to reach for otherwise.
 * const boot = createBootstrap({ steps, deadline: DEFAULT_DEADLINE_MS * 2 });
 */
export const DEFAULT_DEADLINE_MS = 15_000;

/**
 * Run the preflight phase.
 *
 * **Parallelism comes from the graph and nothing else.** Every step on a level has had its
 * dependencies settled, so the level goes out at once; there is no concurrency dial, because a cap
 * would make the plan a description of something other than what ran.
 *
 * **On failure the policy is drain, and it is not configurable.** The level in flight finishes and
 * its notices count; nothing further is scheduled. A required failure does not abort its siblings,
 * because a sibling halfway through a fetch still has something to say about why the boot is in
 * trouble. A refusal does abort them, because nothing is going to mount and the rest is waste.
 */
export async function runPreflight(
  compiled: CompiledPlan,
  options: SchedulerOptions
): Promise<PreflightResult> {
  const { clock, events } = options;
  const notices = createNoticeLog({
    clock,
    onEmit: (notice) => {
      events?.emit({
        kind: 'notice',
        type: notice.type,
        payload: notice.payload,
        step: notice.step,
        at: notice.at,
      });
    },
  });
  const intents = createIntentQueue({
    clock,
    onEmit: (entry) => {
      events?.emit({
        kind: 'intent',
        type: entry.type,
        payload: entry.payload,
        step: entry.step,
        at: clock.wall(),
      });
    },
  });

  const data = new Map<StepId, unknown>();
  const statuses = new Map<StepId, StepStatus>();
  const timeline: StepTrace[] = [];
  const errors: StepFailure[] = [];
  const blocks: BlockSignal[] = [];

  const controller = new AbortController();
  const external = options.signal;
  const propagate = (): void => {
    controller.abort({ kind: 'external', message: 'The caller aborted the run.' });
  };
  if (external !== undefined) {
    if (external.aborted) {
      propagate();
    } else {
      external.addEventListener('abort', propagate, { once: true });
    }
  }
  const deadlineTimer = setTimeout(() => {
    const reason: AbortReason = {
      kind: 'deadline',
      message: `The run exceeded its ${String(options.deadline ?? DEFAULT_DEADLINE_MS)}ms deadline.`,
    };
    controller.abort(reason);
  }, options.deadline ?? DEFAULT_DEADLINE_MS);

  const markSkipped = (planned: PlannedStep): void => {
    statuses.set(planned.id, 'skipped');
    const trace = skippedTrace(planned, clock.wall());
    timeline.push(trace);
    events?.emit({ kind: 'step:settle', trace });
  };

  // Which steps adopted somebody else's shared result rather than doing the work.
  const sharedIds = new Set<StepId>();

  /**
   * What a step actually calls, which for a shared step is not always its own body.
   *
   * The claim is taken **synchronously**, before any await: every step on a level claims in one
   * sweep, so two bootstraps racing for the same key cannot both decide they own it.
   *
   * A sharer adopts the owner's ending, including a refusal — a token the page has already found
   * missing must block every module, not just the one that looked. What it does not adopt are the
   * owner's notices and intents: those were emitted once, into the run that did the work, and
   * replaying them would put the same warning on the screen once per module.
   *
   * The owner publishes from its **attempt** rather than from its own `run`, and that is the whole
   * reason this is two pieces. A timeout and a cancellation are decided by the abort, outside the
   * body: settling from inside `run` cannot see them, so a step that hung left every sharer waiting
   * on a key nobody would ever settle.
   */
  const owned = new Map<StepId, Extract<Claim, { owned: true }>>();

  const invokeFor = (planned: PlannedStep, context: PreflightContext): (() => unknown) => {
    if (planned.scope !== 'shared') {
      return () => {
        return planned.step.run(context);
      };
    }

    const claim = claimSharedStep(String(planned.id));

    if (claim.owned) {
      owned.set(planned.id, claim);
      return () => {
        return planned.step.run(context);
      };
    }

    sharedIds.add(planned.id);
    return async () => {
      const result = await claim.result;
      if (result.kind === 'blocked') {
        return context.block(result.reason);
      }
      // A step that does not apply does not apply for anyone sharing it either.
      if (result.kind === 'skipped') {
        return context.skip(result.reason);
      }
      // Two endings a sharer cannot reach on its own: it waited on a promise, so nothing of its
      // own timed out and nothing of its own was stopped. It throws to end, and the status it
      // wears is put back from `adopted` below — the same shape `blocked` uses, and for the same
      // reason: the word must not depend on how the step happened to finish.
      if (result.kind === 'timed-out' || result.kind === 'cancelled') {
        adopted.set(planned.id, result.kind);
        throw result.kind === 'timed-out'
          ? errorFrom(result.error)
          : new Error('The bootstrap that owned this shared step was stopped.');
      }
      if (result.kind === 'failed') {
        throw errorFrom(result.error);
      }
      return result.value;
    };
  };

  /** Endings a sharer adopted that its own attempt had no way to produce. */
  const adopted = new Map<StepId, Extract<StepStatus, 'timed-out' | 'cancelled'>>();

  let halted = false;
  // Flipped once the levels are done. A step that outlived its own cancellation can still reach its
  // context and refuse the mount; recording that would rewrite an answer already handed out.
  let finished = false;

  for (const level of compiled.preflight) {
    if (halted || controller.signal.aborted) {
      for (const planned of level) {
        markSkipped(planned);
      }
      continue;
    }

    const runnable: PlannedStep[] = [];
    for (const planned of level) {
      const ready = planned.needs.every((need) => {
        return statuses.get(need) === 'success';
      });
      if (ready) {
        runnable.push(planned);
      } else {
        markSkipped(planned);
      }
    }

    if (runnable.length > 0) {
      events?.emit({
        kind: 'level:start',
        level: runnable[0]?.level ?? 0,
        phase: 'preflight',
        ids: runnable.map((planned) => {
          return planned.id;
        }),
        at: clock.wall(),
      });
    }

    const attempts = await Promise.all(
      runnable.map(async (planned) => {
        events?.emit({
          kind: 'step:start',
          id: planned.id,
          level: planned.level,
          at: clock.wall(),
        });
        const attempt = await attemptStep({
          planned,
          clock,
          rootSignal: controller.signal,
          withContext: (signal) => {
            const handle = createPreflightContext({
              planned,
              signal,
              notices,
              intents,
              readData: (dependency) => {
                // An invariant, not a runtime condition: a step is only attempted once every need
                // succeeded, and `ctx.get` refuses an id outside `needs` before reaching here. It
                // stays so a change to that gate is loud rather than an `undefined` read as data.
                if (statuses.get(dependency) !== 'success') {
                  throw new BootstrapError(
                    `Step "${String(planned.id)}" read "${String(dependency)}", which did not ` +
                      `succeed. A step must not be attempted with an unsatisfied need.`
                  );
                }
                return data.get(dependency);
              },
              block: (reason) => {
                const signalled = new BlockSignal(planned.id, reason);
                if (finished) {
                  throw signalled;
                }
                // Recorded before the abort, not after the throw. Aborting resolves the race in
                // `attemptStep`, which can settle this step as cancelled before its own rejection
                // is ever seen — so the refusal has to be somewhere that does not depend on who
                // wins that race.
                blocks.push(signalled);
                // Abort the siblings now rather than after the level settles: a refusal means
                // nothing is going to mount, so every request still in flight is waste.
                controller.abort({
                  kind: 'blocked',
                  step: planned.id,
                  message: signalled.message,
                });
                throw signalled;
              },
            });
            return { invoke: invokeFor(planned, handle.context), settle: handle.settle };
          },
        });
        return { planned, attempt };
      })
    );

    for (const { planned, attempt } of attempts) {
      // `blocks` decides this, not the attempt. A refusal aborts the level, and that abort can
      // settle the refusing step as `cancelled` before its own rejection is ever seen — the race
      // the `block` callback above is written around. Reading the authoritative record here is
      // what makes `blocked` mean the step that decided rather than whoever won the race.
      const refusal = blocks.find((signal) => {
        return signal.step === planned.id;
      });
      const status: StepStatus =
        refusal === undefined ? (adopted.get(planned.id) ?? attempt.status) : 'blocked';
      // Off the same authoritative record as the status, for the same reason: `attempt.reason` is
      // empty whenever the abort won that race.
      const reason = refusal === undefined ? attempt.reason : refusal.reason;

      // What everyone waiting on this key gets, published from here because this is where the
      // ending is finally known — the abort decides some of them, and the body never sees those.
      owned.get(planned.id)?.settle(sharedResultFrom({ status, reason, attempt }));

      statuses.set(planned.id, status);
      const trace: StepTrace = {
        id: planned.id,
        level: planned.level,
        phase: planned.phase,
        status,
        startedAt: attempt.startedAt,
        durationMs: attempt.durationMs,
        ...(attempt.error === undefined ? {} : { error: attempt.error }),
        ...(reason === undefined ? {} : { reason }),
        ...(sharedIds.has(planned.id) ? { shared: true } : {}),
        ...(attempt.lateWrites === 0 ? {} : { lateWrites: attempt.lateWrites }),
      };
      timeline.push(trace);
      // Beside `step:settle` and not inside `attemptStep`, because this is the first place the
      // ending is the one the outcome will report: a refusal leaves the attempt saying `cancelled`,
      // and a console disagreeing with `outcome.timeline` is worse than no console at all.
      STEP_LEVEL[status](`Step ${status}`, {
        step: planned.id,
        ms: Math.round(trace.durationMs),
        ...(reason === undefined ? {} : { reason }),
        ...(trace.error === undefined ? {} : { error: trace.error.message }),
      });
      events?.emit({ kind: 'step:settle', trace });

      if (status === 'success') {
        data.set(planned.id, attempt.value);
        continue;
      }

      // Neither of these is a failure, for two different reasons. A `cancelled` step was stopped
      // and never given the chance to fail; a `blocked` one made a decision, and `blockedBy` is
      // where that is reported. Listing either beside a real 401 would make a refused boot read as
      // a crash — and a `blocked` step reaching the line below would also halt the run twice over.
      if (status === 'cancelled' || status === 'blocked' || status === 'skipped') {
        continue;
      }

      errors.push({
        step: planned.id,
        status: status === 'timed-out' ? 'timed-out' : 'failed',
        error: attempt.error ?? serializeError(new Error('Step did not succeed.')),
        tolerated: planned.optional,
      });

      if (!planned.optional) {
        halted = true;
      }
    }
  }

  finished = true;
  clearTimeout(deadlineTimer);
  if (external !== undefined) {
    external.removeEventListener('abort', propagate);
  }

  // Plan order, not arrival order: two steps refusing in the same level must produce the same
  // answer on every run, or the telemetry and the tests both become coin flips.
  const planOrder = compiled.preflight.flat().map((planned) => {
    return planned.id;
  });
  const firstBlock = [...blocks].sort((left, right) => {
    return planOrder.indexOf(left.step) - planOrder.indexOf(right.step);
  })[0];

  const abortReason: unknown = controller.signal.reason;
  const abortKind =
    controller.signal.aborted &&
    typeof abortReason === 'object' &&
    abortReason !== null &&
    'kind' in abortReason
      ? abortReason.kind
      : undefined;

  const status = ((): RunStatus => {
    if (firstBlock !== undefined) {
      return 'blocked';
    }
    if (abortKind === 'external' || abortKind === 'deadline') {
      return 'aborted';
    }
    if (
      errors.some((failure) => {
        return !failure.tolerated;
      })
    ) {
      return 'failed';
    }
    return errors.length > 0 ? 'degraded' : 'ready';
  })();

  return {
    status,
    data,
    statuses,
    notices: notices.list(),
    intents: intents.finalize((step) => {
      return statuses.get(step) ?? 'skipped';
    }),
    errors,
    timeline,
    ...(firstBlock === undefined
      ? {}
      : { blockedBy: { step: firstBlock.step, reason: firstBlock.reason } }),
  };
}
