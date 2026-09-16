import type {
  DataOf,
  IntentRegistry,
  IntentType,
  NoticeRegistry,
  NoticeType,
  PayloadArgs,
  StepId,
  HostCapabilities,
} from './registry.js';

/**
 * When a step runs, and the two values are not two settings of one dial. They are two different
 * worlds with two different context types.
 *
 * `preflight` runs before anything is mounted. It has no framework, so it cannot ask a user
 * anything, and it is the only phase that may refuse the mount outright.
 *
 * `mounted` runs after a binding has taken over. It is handed a {@link HostCapabilities}, so it can open a
 * dialog and wait for the answer — and it cannot refuse the mount, because the mount already
 * happened.
 */
export type StepPhase = 'preflight' | 'hosted';

/**
 * Whether a step's work belongs to this bootstrap alone or to everything running beside it.
 *
 * `instance` is the default and means what it says: this bootstrap does it, and a second bootstrap
 * declaring the same step does it again. `shared` means the work is the same answer for everyone,
 * so the first bootstrap to reach it does it and the rest adopt the result — a token validated once,
 * a configuration fetched once, however many modules asked.
 *
 * **How far "everyone" reaches is one `globalThis`,** which is a browsing context, a worker, or a
 * Node process. Two documents do not share, and neither do a page and its worker: each has a
 * registry of its own. The word is `shared` rather than a name for that boundary because the
 * boundary is the mechanism, and the mechanism is documented where it lives — see
 * `core/shared-scope.ts`.
 *
 * **The step id is the sharing key.** Two modules that declare `session` are declaring the same
 * thing, which is the contract; a module that means something different should name it differently.
 *
 * Three consequences worth knowing before reaching for it:
 *
 * - **A shared step is attempted once, and its ending is everyone's answer** — including a refusal,
 *   a failure, and a timeout. Its `timeout` therefore belongs to all of them rather than to the
 *   module that happened to get there first, so modules sharing a step should agree on it.
 * - **Its notices and intents belong to the run that did the work.** They were emitted once, and
 *   replaying them would put the same warning on the screen once per module — which is the thing
 *   somebody noticed and the reason this exists.
 * - **Sharing outlives a bootstrap**, so a test or a demo that boots repeatedly has to call
 *   `clearSharedScope` on purpose.
 */
export type StepScope = 'instance' | 'shared';

/**
 * How the run as a whole ended.
 *
 * Precedence when several apply is `blocked > failed > degraded > ready`, with `aborted` set by an
 * external signal rather than by anything the steps did. `failed` is technical and `blocked` is a
 * decision, which is why they are not one value: the first is a bug report and the second is a
 * tag rule doing its job.
 */
export type RunStatus = 'ready' | 'degraded' | 'blocked' | 'failed' | 'aborted';

/**
 * How one step ended.
 *
 * `skipped` is the one that earns its place: a step whose dependency failed never ran, and calling
 * that `failed` would leave `errors` unable to explain why its data is missing.
 */
export type StepStatus = 'success' | 'failed' | 'timed-out' | 'skipped' | 'cancelled';

/**
 * Why a signal aborted.
 *
 * Discriminated rather than free text because the caller has to act on it: an `external` abort is a
 * user navigating away and a `step-timeout` is a slow endpoint, and retry policy and telemetry
 * classify them in opposite directions.
 */
export type AbortReasonKind = 'external' | 'step-timeout' | 'deadline' | 'blocked';

/** The reason object carried on an aborted signal. */
export type AbortReason = {
  readonly kind: AbortReasonKind;
  /** The step that caused it, for the kinds that have one. */
  readonly step?: StepId | undefined;
  readonly message: string;
};

/**
 * An error flattened to something `JSON.stringify` survives.
 *
 * The timeline is meant to be shipped to a log collector, and an `Error` serialises to `{}` while a
 * `cause` chain serialises to nothing at all.
 */
export type SerializedError = {
  readonly name: string;
  readonly message: string;
  readonly stack?: string | undefined;
  readonly cause?: SerializedError | undefined;
};

/** What every step context offers, in both phases. */
type BaseContext<TNeeds extends readonly StepId[]> = {
  /**
   * Aborted when this step's own timeout fires, when the run's deadline passes, or when the root
   * signal aborts. `signal.reason` is an {@link AbortReason}, so a handler can tell which.
   */
  readonly signal: AbortSignal;
  /**
   * The data of a dependency, typed from its id.
   *
   * Only the ids this step declared in `needs` are reachable, which is the point of declaring them:
   * a step that reads something it did not declare has no ordering guarantee, and the type is what
   * stops that before the runtime check has to.
   */
  get<TId extends TNeeds[number]>(id: TId): DataOf<TId>;
  /**
   * Record a fact. Passive: nothing downstream is expected to act on it.
   *
   * Notices survive the failure of the step that emitted them, because the run that went wrong is
   * exactly the one whose facts matter.
   */
  notice<TType extends NoticeType>(type: TType, ...rest: PayloadArgs<TType, NoticeRegistry>): void;
  /**
   * Queue a UI intent for whoever mounts.
   *
   * This does not display anything and cannot: the core has no framework. The app decides what to
   * forward, and an intent nobody forwards is recorded as dropped rather than lost.
   */
  intent<TType extends IntentType>(type: TType, ...rest: PayloadArgs<TType, IntentRegistry>): void;
};

/**
 * The context a preflight step gets.
 *
 * No UI port, because nothing is mounted. It has `block` instead, which is
 * the only way to refuse the mount.
 */
export type PreflightContext<TNeeds extends readonly StepId[] = readonly StepId[]> =
  BaseContext<TNeeds> & {
    /**
     * Refuse the mount. Aborts the run, leaving every notice and intent emitted so far intact —
     * which is how the app explains the refusal to the user.
     *
     * Write it as `return ctx.block(reason)`. It genuinely throws, but TypeScript applies its
     * never-returning analysis only to calls on an explicitly annotated identifier, and `ctx` is
     * typed contextually here; `never` is assignable to any return type, so the `return` is what
     * makes the rest of the function unreachable in the checker's eyes too.
     */
    block(reason: string): never;
  };

/**
 * The context a mounted step gets.
 *
 * It has the {@link HostCapabilities} the binding supplied and can await an intent's resolution. It has no
 * `block`, because by the time it runs the mount has already happened.
 */
export type HostedContext<TNeeds extends readonly StepId[] = readonly StepId[]> =
  BaseContext<TNeeds> & {
    /** Whatever the host declared it can do. Empty until a project augments it. */
    readonly host: HostCapabilities;
    /**
     * Queue an intent and wait for the app to answer it.
     *
     * **It rejects if the app drops the intent instead of settling it**, because a refusal is an
     * answer and the step is the only thing that knows what to do with one. A step that treats
     * "no" as fatal lets it through and fails; a step that does not, catches. Resolving on a drop
     * would make the two indistinguishable, which is the one thing a waiting step cannot afford.
     *
     * Only reachable here, and that is the whole two-phase design in one signature: a preflight
     * step has nothing that could ever answer.
     */
    awaitIntent<TType extends IntentType>(
      type: TType,
      ...rest: PayloadArgs<TType, IntentRegistry>
    ): Promise<void>;
  };

/** The context for a given phase. */
export type StepContext<
  TNeeds extends readonly StepId[],
  TPhase extends StepPhase,
> = TPhase extends 'hosted' ? HostedContext<TNeeds> : PreflightContext<TNeeds>;

/**
 * What a step's `run` may return.
 *
 * A mounted step returns nothing on purpose. `run()` resolves at the end of preflight, so a mounted
 * step's data would arrive after the outcome was already handed over — the value would have nowhere
 * to live and `data` would have to admit it might not be there yet.
 */
export type StepReturn<TId extends StepId, TPhase extends StepPhase> = TPhase extends 'hosted'
  ? void | Promise<void>
  : DataOf<TId> | Promise<DataOf<TId>>;

/**
 * One step.
 *
 * Built through `defineStep` rather than written as a bare literal, because the two `const` type
 * parameters that keep `needs` a literal tuple only apply at an inference site.
 */
export type Step<
  TId extends StepId = StepId,
  TNeeds extends readonly StepId[] = readonly StepId[],
  TPhase extends StepPhase = StepPhase,
> = {
  readonly id: TId;
  /** Ids this step reads. The graph's edges, and the only thing that decides what runs in parallel. */
  readonly needs?: TNeeds | undefined;
  readonly phase?: TPhase | undefined;
  /** A failure here degrades the run instead of failing it, and prunes this step's dependents. */
  readonly optional?: boolean | undefined;
  /** Milliseconds, counted from the moment `run` is entered rather than from planning. */
  readonly timeout?: number | undefined;
  /** `page` shares the work with every other bootstrap on the page. See {@link StepScope}. */
  readonly scope?: StepScope | undefined;
  /**
   * Declared as a method rather than as a function property, and the difference is load-bearing:
   * method parameters are bivariant, which is what lets two steps with different `needs` tuples
   * live in one array without a cast. As a function property they would be mutually unassignable
   * and the runner could not hold them at all.
   */
  run(ctx: StepContext<TNeeds, TPhase>): StepReturn<TId, TPhase>;
};

/** The erased shape the runner stores. */
export type AnyStep = Step;

/** The ids present in a step list, which is what `data` is keyed by. */
export type IdsOf<TSteps extends readonly AnyStep[]> = TSteps[number]['id'];

/** Every id any step in the list reads. */
type NeedsOf<TSteps extends readonly AnyStep[]> = NonNullable<TSteps[number]['needs']>[number];

/** The ids a step asks for that no step in the list provides. */
type MissingNeeds<TSteps extends readonly AnyStep[]> = Exclude<NeedsOf<TSteps>, IdsOf<TSteps>>;

/**
 * Ids that appear more than once in the list.
 *
 * Every position against every other position, which is quadratic and resolves eagerly. The
 * recursive form — walk the tuple carrying what has been seen — reads better and is a recursive
 * conditional type, which TypeScript defers while it is still inferring the parameter it reads.
 *
 * A list that is not a tuple has no known positions, so this answers `never` — which is the right
 * answer, and the runtime check in `compilePlan` is what covers it.
 */
type Index<TSteps extends readonly AnyStep[]> = Extract<keyof TSteps, `${number}`>;

type DuplicateIds<TSteps extends readonly AnyStep[]> = {
  [K in Index<TSteps>]: {
    [J in Index<TSteps>]: J extends K
      ? never
      : TSteps[J]['id'] extends TSteps[K]['id']
        ? TSteps[K]['id']
        : never;
  }[Index<TSteps>];
}[Index<TSteps>];

/**
 * What a step list has to be true for, checked where it is written.
 *
 * `needs` is a list of {@link StepId}, and the id space is deliberately open — a project has to be
 * able to name a step it does not own. That openness means a typo is a perfectly valid id, and
 * until this existed it was caught only when `createBootstrap` threw.
 *
 * The check is an extra **required property** rather than a condition on `steps` itself, because a
 * conditional in that position would be an inference site TypeScript cannot read `TSteps` out of —
 * and the whole typing of `ctx.get` hangs off that inference. A list with nothing wrong with it gets
 * `unknown`, which intersects away to nothing; a list with something wrong gets a property no caller
 * can supply, and its name is the error message.
 *
 * Erased steps have a wide `StepId` and no known positions, so both halves answer `never` and this
 * asks nothing of them. `compilePlan` still checks all of it at runtime, which is what covers them,
 * along with cycles and the preflight-to-mounted edge.
 */
export type StepListCheck<TSteps extends readonly AnyStep[]> = ([MissingNeeds<TSteps>] extends [
  never,
]
  ? unknown
  : {
      readonly [
        K in `umbra: needs names a step this list does not contain: ${Extract<MissingNeeds<TSteps>, string>}`
      ]: never;
    }) &
  ([DuplicateIds<TSteps>] extends [never]
    ? unknown
    : {
        readonly [
          K in `umbra: two steps in this list share the id: ${Extract<DuplicateIds<TSteps>, string>}`
        ]: never;
      });

/**
 * The data a completed run produced, keyed by the ids that were actually declared.
 *
 * Derived from the step list rather than from {@link StepRegistry}, because a registry entry with
 * no step behind it would be a promise the run cannot keep. A mapped type rather than `Pick`, which
 * collapses to `{}` while the registry is still empty.
 */
export type RunData<TSteps extends readonly AnyStep[]> = {
  readonly [TId in IdsOf<TSteps>]: DataOf<TId>;
};

/**
 * The data a run produced when it did not finish, where a key is absent rather than `undefined`.
 *
 * Absent, not `undefined`: under `exactOptionalPropertyTypes` a key written as `undefined` is not
 * assignable to an optional one, so the runner omits instead of assigning.
 */
export type PartialRunData<TSteps extends readonly AnyStep[]> = {
  readonly [TId in IdsOf<TSteps>]?: DataOf<TId>;
};

/** A fact recorded during the run. */
export type Notice = {
  readonly type: NoticeType;
  readonly payload: unknown;
  /** The step that emitted it. */
  readonly step: StepId;
  /** Wall clock, for correlating with other logs. */
  readonly at: number;
  /** Emission order, which is the only order notices have. */
  readonly sequence: number;
};

/**
 * Where an intent is in its life.
 *
 * `dropped` is a real ending and not a failure: an app that decides a warning is not worth
 * showing has answered the intent, and the record of that decision is what stops the queue from
 * being a place things silently vanish.
 */
export type IntentStatus = 'pending' | 'forwarded' | 'handled' | 'dropped';

/** A UI intent queued for whoever mounts. */
export type Intent = {
  readonly id: string;
  readonly type: IntentType;
  readonly payload: unknown;
  /**
   * Which step asked, and how that step ended.
   *
   * Both halves, because an intent emitted by a step that then failed is the common case rather
   * than the odd one, and the app's forwarding decision usually turns on it.
   */
  readonly origin: {
    readonly step: StepId;
    readonly stepStatus: StepStatus;
  };
  readonly at: number;
  readonly sequence: number;
  /**
   * How many emissions this record stands for.
   *
   * Two intents of the same type collapse into one, first write wins, and this counts the rest.
   * Deduplication is by type alone because there is no second key to scope it by: a type that
   * needs to queue twice with different payloads is a type that is describing two things.
   */
  readonly occurrences: number;
  readonly status: IntentStatus;
  readonly droppedReason?: string | undefined;
};

/** One line of the run's history. */
export type StepTrace = {
  readonly id: StepId;
  /** The topological level the planner put it on. */
  readonly level: number;
  readonly phase: StepPhase;
  readonly status: StepStatus;
  /** Wall clock at entry, or at the moment it was marked skipped. */
  readonly startedAt: number;
  readonly durationMs: number;
  readonly error?: SerializedError | undefined;
  /** True when this step adopted a shared result somebody else had already produced. */
  readonly shared?: boolean | undefined;
  /**
   * Writes attempted after the step settled.
   *
   * Counted rather than thrown on: a late `notice` usually comes from a `finally` in user code, and
   * making that throw would break the caller's cleanup to report a bookkeeping detail.
   */
  readonly lateWrites?: number | undefined;
};

/**
 * A step that did not succeed.
 *
 * Cancellation is deliberately not here. A step the run stopped did not fail; it was never given
 * the chance to, and listing it beside a real 401 would make every refused boot look like a crash.
 * The timeline records the cancellation.
 */
export type StepFailure = {
  readonly step: StepId;
  readonly status: Extract<StepStatus, 'failed' | 'timed-out'>;
  readonly error: SerializedError;
  /** True when the step was `optional`, which is why the run only degraded. */
  readonly tolerated: boolean;
};

/** What every outcome carries, whatever the status. */
type OutcomeBase = {
  readonly notices: readonly Notice[];
  /**
   * The intents as they stood when preflight ended, frozen.
   *
   * The live queue — forward, drop, subscribe, settle — belongs to the session. Keeping it off the
   * outcome is what makes the outcome a snapshot worth serialising, and what means an outcome
   * nobody passes to a session leaks nothing.
   */
  readonly intents: readonly Intent[];
  readonly errors: readonly StepFailure[];
  readonly timeline: readonly StepTrace[];
};

/**
 * What the run produced.
 *
 * Discriminated on `status` rather than handing back one partial shape: `ready` is the case the app
 * spends its life in, and forcing it to narrow every key there would defeat the point of declaring
 * them.
 *
 * **The default type argument is the empty list, not `readonly AnyStep[]`.** A bare `Outcome` means
 * an outcome whose step list is no longer in the type, and its data is therefore opaque —
 * `readStepData` is how you get a value back out of one. The other default would claim every key in
 * {@link StepRegistry}, which is a promise no particular run makes.
 */
export type Outcome<TSteps extends readonly AnyStep[] = readonly []> =
  | (OutcomeBase & {
      readonly status: 'ready';
      readonly data: RunData<TSteps>;
    })
  | (OutcomeBase & {
      readonly status: Exclude<RunStatus, 'ready'>;
      readonly data: PartialRunData<TSteps>;
      /** Set when `status` is `blocked`: which step refused, and why. */
      readonly blockedBy?: { readonly step: StepId; readonly reason: string } | undefined;
    });

/** One topological level of the plan: the steps whose dependencies are all on earlier levels. */
export type PlanLevel = {
  readonly level: number;
  readonly phase: StepPhase;
  readonly ids: readonly StepId[];
};

/**
 * The static analysis of the step graph.
 *
 * Levels, not waves. The runner is free to overlap them and the timeline is the record of what it
 * actually did; this is what the graph permits, computed before anything runs.
 */
export type BootstrapPlan = {
  readonly levels: readonly PlanLevel[];
};
