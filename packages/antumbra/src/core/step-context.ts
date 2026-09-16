import { UndeclaredDependencyError } from './errors.js';
import type { IntentSink } from './intent-queue.js';
import type { NoticeLog } from './notice-log.js';
import type { PlannedStep } from './plan.js';
import type { IntentType, NoticeType, StepId, HostCapabilities } from './registry.js';
import type { HostedContext, PreflightContext } from './types.js';

export type ContextDeps = {
  readonly planned: PlannedStep;
  readonly signal: AbortSignal;
  /** Reads a settled dependency, or throws if it never ran. */
  readonly readData: (dependency: StepId) => unknown;
  readonly notices: NoticeLog;
  readonly intents: IntentSink;
};

export type ContextHandle<TContext> = {
  readonly context: TContext;
  /**
   * Close the context and report how many writes arrived after it closed.
   *
   * Counted rather than thrown on. A late `notice` almost always comes from a `finally` in user
   * code reacting to its own abort, and making that throw would break the caller's cleanup in order
   * to report a bookkeeping detail. The count lands in the timeline, where it reads as what it is:
   * a step that outlived its own settlement.
   */
  readonly settle: () => number;
};

type Base = {
  signal: AbortSignal;
  get: (id: StepId) => unknown;
  notice: (type: NoticeType, ...rest: unknown[]) => void;
  intent: (type: IntentType, ...rest: unknown[]) => void;
};

function createBase(deps: ContextDeps): { base: Base; settle: () => number } {
  let open = true;
  let lateWrites = 0;

  const guard = (write: () => void): void => {
    if (!open) {
      lateWrites += 1;
      return;
    }
    write();
  };

  const base: Base = {
    signal: deps.signal,
    get: (id) => {
      if (!deps.planned.needs.includes(id)) {
        throw new UndeclaredDependencyError(deps.planned.id, id);
      }
      return deps.readData(id);
    },
    notice: (type, ...rest) => {
      guard(() => {
        deps.notices.emit({ type, payload: rest[0], step: deps.planned.id });
      });
    },
    intent: (type, ...rest) => {
      guard(() => {
        deps.intents.emit({ type, payload: rest[0], step: deps.planned.id });
      });
    },
  };

  return {
    base,
    settle: () => {
      open = false;
      return lateWrites;
    },
  };
}

/**
 * The preflight context, which is the one that can refuse the mount.
 *
 * The cast on `get` is the package's one untyped boundary: settled data lives in a
 * `Map<StepId, unknown>` because a heterogeneous step list has no other way to hold it, and nothing
 * carries a step's declared data type through that map. The id is what re-attaches the type, and
 * the runtime check above is what makes the id trustworthy.
 */
export function createPreflightContext(
  deps: ContextDeps & { readonly block: (reason: string) => never }
): ContextHandle<PreflightContext> {
  const { base, settle } = createBase(deps);
  const context: PreflightContext = {
    ...base,
    get: base.get as PreflightContext['get'],
    block: deps.block,
  };
  return { context, settle };
}

/** The mounted context, which has the UI port and can wait on an intent it queued. */
export function createHostedContext(
  deps: ContextDeps & {
    readonly host: HostCapabilities;
    readonly awaitIntent: (intentId: string) => Promise<void>;
  }
): ContextHandle<HostedContext> {
  const { base, settle } = createBase(deps);
  const context: HostedContext = {
    ...base,
    get: base.get as HostedContext['get'],
    host: deps.host,
    awaitIntent: (type, ...rest) => {
      const intentId = deps.intents.emit({ type, payload: rest[0], step: deps.planned.id });
      return deps.awaitIntent(intentId);
    },
  };
  return { context, settle };
}
