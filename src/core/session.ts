import type { Clock } from '../utils/clock.js';
import { createStore } from '../store/create-store.js';
import { BootstrapError, StepSkippedError } from './errors.js';
import type { IntentEntry, IntentSink } from './intent-queue.js';
import { createNoticeLog } from './notice-log.js';
import type { CompiledPlan, PlannedStep } from './plan.js';
import type { StepId, HostCapabilities } from './registry.js';
import { attemptStep } from './run-step.js';
import type { PreflightResult } from './scheduler.js';
import { createHostedContext } from './step-context.js';
import type { Intent, Notice, StepFailure, StepStatus, StepTrace } from './types.js';

/** What the mounted phase did, since the outcome was frozen before it ran. */
export type HostReport = {
  readonly notices: readonly Notice[];
  readonly errors: readonly StepFailure[];
  readonly timeline: readonly StepTrace[];
};

/**
 * The live half of a run: the intent queue and the mounted phase.
 *
 * Reached through `boot.session()`, and only after `run()` has resolved. Everything that moves
 * lives here, which is what lets the outcome be a frozen snapshot.
 */
/**
 * What a session publishes: the queue, and the mounted phase once it is over.
 *
 * One payload rather than two subscriptions, because they are one question — "what does the app
 * have to act on?" — and a renderer that had to join two streams would be joining them wrong.
 */
export type SessionState = {
  readonly intents: readonly Intent[];
  /** Undefined until the mounted phase has run. Its timeline is the other half of the graph. */
  readonly mount: HostReport | undefined;
};

export type Session = {
  /** The queue as it stands. Always a fresh array; the records themselves are frozen. */
  list: () => readonly Intent[];
  /**
   * Hand some of the queue to the framework.
   *
   * Nothing is forwarded on its own. An app that shows a warning dialog for one intent type and
   * ignores another is the normal case, and making the library guess would be the wrong half of
   * that decision.
   */
  forward: (filter?: (intent: Intent) => boolean) => readonly Intent[];
  /** Mark one forwarded intent as acted on. This is what releases `ctx.awaitIntent`. */
  settle: (intentId: string) => void;
  /** Refuse one intent, with the reason on the record. */
  drop: (intentId: string, reason: string) => void;
  /** Called immediately with the current state, then on every change. */
  subscribe: (listener: (state: SessionState) => void) => () => void;
  /**
   * Run the mounted phase with the framework's port in hand.
   *
   * This is the half of the bootstrap that descends into the framework: a mounted step can open a
   * dialog through `ctx.host` and wait for the answer through `ctx.awaitIntent`, neither of which a
   * preflight step has any way to do.
   */
  attach: (host: HostCapabilities) => Promise<HostReport>;
  /**
   * Close the session. Every intent still pending becomes `dropped('not-forwarded')`.
   *
   * The drop happens here rather than on `forward`, so an app can forward twice — once at mount and
   * again when a mounted step queues something new — without the first call condemning the rest.
   */
  dispose: () => void;
};

export type SessionDeps = {
  readonly compiled: CompiledPlan;
  readonly preflight: PreflightResult;
  readonly clock: Clock;
};

type Waiter = { resolve: () => void; reject: (error: Error) => void };

function replace(intents: readonly Intent[], next: Intent): Intent[] {
  return intents.map((intent) => {
    return intent.id === next.id ? next : intent;
  });
}

/**
 * The live half of a run, which exists only once something has mounted.
 *
 * The outcome is a frozen snapshot on purpose, so everything that moves lives here: the queue's
 * state transitions, the waiters behind `awaitIntent`, and the mounted phase itself. An outcome
 * nobody hands to a session therefore leaks nothing, which is the property that makes the snapshot
 * safe to pass around.
 */
export function createSession(deps: SessionDeps): Session {
  const store = createStore<SessionState>({ intents: deps.preflight.intents, mount: undefined });
  const waiters = new Map<string, Waiter>();
  // An answer that arrived before anyone was waiting for it.
  //
  // `awaitIntent` emits first and registers second, and emitting notifies subscribers
  // synchronously — so a host that settles or drops inside its own handler answers before the
  // waiter exists. Without this the step would wait forever on a question already answered.
  const early = new Map<string, Error | undefined>();
  let disposed = false;
  let mounting: Promise<HostReport> | undefined;

  const find = (intentId: string): Intent => {
    const intent = store.get().intents.find((candidate) => {
      return candidate.id === intentId;
    });
    if (intent === undefined) {
      throw new BootstrapError(`No intent with id "${intentId}".`);
    }
    return intent;
  };

  const release = (intentId: string, error?: Error): void => {
    const waiter = waiters.get(intentId);
    if (waiter === undefined) {
      early.set(intentId, error);
      return;
    }
    waiters.delete(intentId);
    if (error === undefined) {
      waiter.resolve();
    } else {
      waiter.reject(error);
    }
  };

  const awaitIntent = (intentId: string): Promise<void> => {
    if (early.has(intentId)) {
      const error = early.get(intentId);
      early.delete(intentId);
      return error === undefined ? Promise.resolve() : Promise.reject(error);
    }
    return new Promise<void>((resolve, reject) => {
      waiters.set(intentId, { resolve, reject });
    });
  };

  const setIntents = (intents: readonly Intent[]): void => {
    store.set({ ...store.get(), intents });
  };

  const liveSink: IntentSink = {
    emit: (entry: IntentEntry) => {
      const current = store.get().intents;
      const existing = current.find((candidate) => {
        return candidate.type === entry.type;
      });
      if (existing !== undefined) {
        setIntents(
          replace(current, Object.freeze({ ...existing, occurrences: existing.occurrences + 1 }))
        );
        return existing.id;
      }
      const id = `intent-mounted-${String(current.length)}-${String(entry.type)}`;
      const record: Intent = Object.freeze({
        id,
        type: entry.type,
        payload: entry.payload,
        origin: { step: entry.step, stepStatus: 'success' },
        at: deps.clock.wall(),
        sequence: current.length,
        occurrences: 1,
        status: 'pending',
      });
      setIntents([...current, record]);
      return id;
    },
  };

  const transition = (intentId: string, next: Partial<Intent>): void => {
    const current = find(intentId);
    setIntents(replace(store.get().intents, Object.freeze({ ...current, ...next })));
  };

  const session: Session = {
    list: () => {
      return store.get().intents;
    },

    forward: (filter) => {
      const forwarded = store.get().intents.filter((intent) => {
        return intent.status === 'pending' && (filter === undefined || filter(intent));
      });
      for (const intent of forwarded) {
        transition(intent.id, { status: 'forwarded' });
      }
      return forwarded.map((intent) => {
        return find(intent.id);
      });
    },

    settle: (intentId) => {
      transition(intentId, { status: 'handled' });
      release(intentId);
    },

    drop: (intentId, reason) => {
      transition(intentId, { status: 'dropped', droppedReason: reason });
      release(intentId, new BootstrapError(`Intent "${intentId}" was dropped: ${reason}`));
    },

    subscribe: (listener) => {
      return store.subscribe(listener);
    },

    attach: (host) => {
      // A rejected promise rather than a synchronous throw: this door returns a promise, and a
      // caller that only wrote `.catch` would otherwise see the error blow past it.
      if (disposed) {
        return Promise.reject(new BootstrapError('The session was disposed.'));
      }
      // Memoised for the same reason `run()` is. A framework re-attaches its host more often than
      // an author expects — StrictMode doubles effects, and a reactive effect re-runs whenever
      // anything it read changed — and a mounted phase that ran twice would ask the user the same
      // question twice.
      mounting ??= runHosted({ deps, host, sink: liveSink, awaitIntent }).then((report) => {
        // Published, not just returned: the graph a binding draws needs the mounted half too, and
        // only the caller that happened to await `mount` would otherwise ever see it.
        store.set({ ...store.get(), mount: report });
        return report;
      });
      return mounting;
    },

    dispose: () => {
      disposed = true;
      for (const intent of store.get().intents) {
        if (intent.status === 'pending') {
          session.drop(intent.id, 'not-forwarded');
        }
      }
    },
  };

  return session;
}

type MountArgs = {
  readonly deps: SessionDeps;
  readonly host: HostCapabilities;
  readonly sink: IntentSink;
  readonly awaitIntent: (intentId: string) => Promise<void>;
};

async function runHosted(args: MountArgs): Promise<HostReport> {
  const { deps, host, sink, awaitIntent } = args;
  const notices = createNoticeLog({ clock: deps.clock });
  const timeline: StepTrace[] = [];
  const errors: StepFailure[] = [];
  const statuses = new Map<StepId, StepStatus>(deps.preflight.statuses);
  const controller = new AbortController();

  const readData = (planned: PlannedStep) => {
    return (dependency: StepId): unknown => {
      if (statuses.get(dependency) !== 'success') {
        throw new StepSkippedError(planned.id, dependency);
      }
      return deps.preflight.data.get(dependency);
    };
  };

  for (const level of deps.compiled.mounted) {
    const runnable = level.filter((planned) => {
      return planned.needs.every((need) => {
        return statuses.get(need) === 'success';
      });
    });
    for (const planned of level) {
      if (!runnable.includes(planned)) {
        statuses.set(planned.id, 'skipped');
        timeline.push({
          id: planned.id,
          level: planned.level,
          phase: 'hosted',
          status: 'skipped',
          startedAt: deps.clock.wall(),
          durationMs: 0,
        });
      }
    }

    const attempts = await Promise.all(
      runnable.map(async (planned) => {
        const attempt = await attemptStep({
          planned,
          clock: deps.clock,
          rootSignal: controller.signal,
          withContext: (signal) => {
            const handle = createHostedContext({
              planned,
              signal,
              notices,
              intents: sink,
              host,
              readData: readData(planned),
              awaitIntent,
            });
            return {
              invoke: () => {
                return planned.step.run(handle.context);
              },
              settle: handle.settle,
            };
          },
        });
        return { planned, attempt };
      })
    );

    for (const { planned, attempt } of attempts) {
      statuses.set(planned.id, attempt.status);
      timeline.push({
        id: planned.id,
        level: planned.level,
        phase: 'hosted',
        status: attempt.status,
        startedAt: attempt.startedAt,
        durationMs: attempt.durationMs,
        ...(attempt.error === undefined ? {} : { error: attempt.error }),
        ...(attempt.lateWrites === 0 ? {} : { lateWrites: attempt.lateWrites }),
      });
      if (attempt.status === 'failed' || attempt.status === 'timed-out') {
        errors.push({
          step: planned.id,
          status: attempt.status,
          error: attempt.error ?? { name: 'Error', message: 'Step did not succeed.' },
          tolerated: planned.optional,
        });
      }
    }
  }

  return { notices: notices.list(), errors, timeline };
}
