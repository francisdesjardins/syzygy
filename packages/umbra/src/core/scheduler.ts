import type { Clock } from '../utils/clock.js';
import { normalizeError } from '../utils/normalize-error.js';
import { BlockSignal, StepSkippedError } from './errors.js';
import type { EventHub } from './events.js';
import { createIntentQueue } from './intent-queue.js';
import { createNoticeLog } from './notice-log.js';
import { claimSharedStep } from './shared-scope.js';
import type { CompiledPlan, PlannedStep } from './plan.js';
import type { StepId } from './registry.js';
import { attemptStep } from './run-step.js';
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

/** Rebuild something throwable from a shared failure, so a sharer fails the way the owner did. */
function errorFrom(serialized: SerializedError): Error {
  const error = new Error(serialized.message);
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
    const trace: StepTrace = {
      id: planned.id,
      level: planned.level,
      phase: planned.phase,
      status: 'skipped',
      startedAt: clock.wall(),
      durationMs: 0,
    };
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
   */
  const invokeFor = (planned: PlannedStep, context: PreflightContext): (() => unknown) => {
    if (planned.scope !== 'shared') {
      return () => {
        return planned.step.run(context);
      };
    }

    const claim = claimSharedStep(String(planned.id));

    if (!claim.owned) {
      sharedIds.add(planned.id);
      return async () => {
        const result = await claim.result;
        if (result.kind === 'blocked') {
          return context.block(result.reason);
        }
        if (result.kind === 'failed') {
          throw errorFrom(result.error);
        }
        return result.value;
      };
    }

    return async () => {
      try {
        const value: unknown = await planned.step.run(context);
        claim.settle({ kind: 'value', value });
        return value;
      } catch (error: unknown) {
        // Settled on the way out, so a sharer waiting on this key learns the answer instead of
        // waiting for its own deadline to notice nothing is coming.
        claim.settle(
          error instanceof BlockSignal
            ? { kind: 'blocked', reason: error.blockReason }
            : { kind: 'failed', error: normalizeError(error) }
        );
        throw error;
      }
    };
  };

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
                if (statuses.get(dependency) !== 'success') {
                  throw new StepSkippedError(planned.id, dependency);
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
      statuses.set(planned.id, attempt.status);
      const trace: StepTrace = {
        id: planned.id,
        level: planned.level,
        phase: planned.phase,
        status: attempt.status,
        startedAt: attempt.startedAt,
        durationMs: attempt.durationMs,
        ...(attempt.error === undefined ? {} : { error: attempt.error }),
        ...(sharedIds.has(planned.id) ? { shared: true } : {}),
        ...(attempt.lateWrites === 0 ? {} : { lateWrites: attempt.lateWrites }),
      };
      timeline.push(trace);
      events?.emit({ kind: 'step:settle', trace });

      if (attempt.status === 'success') {
        data.set(planned.id, attempt.value);
        continue;
      }

      // A cancelled step is not a failure: it was stopped, not given the chance to fail. Listing it
      // beside a real 401 would make every refused boot read as a crash.
      if (attempt.status === 'cancelled') {
        continue;
      }

      errors.push({
        step: planned.id,
        status: attempt.status === 'timed-out' ? 'timed-out' : 'failed',
        error: attempt.error ?? normalizeError(new Error('Step did not succeed.')),
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
      : { blockedBy: { step: firstBlock.step, reason: firstBlock.blockReason } }),
  };
}
