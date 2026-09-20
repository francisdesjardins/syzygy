import { type Clock, systemClock } from '../utils/clock.js';
import { createLogger } from '../utils/logger.js';
import { BootstrapError } from './errors.js';
import { type RunEvent, type EventHub, createEventHub } from './events.js';
import { compilePlan } from './plan.js';
import { type SchedulerOptions, type PreflightResult, runPreflight } from './scheduler.js';
import { type RunObserver, createRunObserver } from './run-observer.js';
import { type LiveRun, createLiveRun } from './live-run.js';
import type {
  AnyStep,
  RunData,
  BootstrapPlan,
  Outcome,
  PartialRunData,
  StepListCheck,
} from './types.js';

const runLog = createLogger('run');
const planLog = createLogger('plan');

/** Everything `createBootstrap` accepts. Only `steps` is required. */
export type BootstrapOptions<TSteps extends readonly AnyStep[]> = {
  readonly steps: TSteps;
  /** Aborts the run from outside: a navigation away, a teardown, a test. */
  readonly signal?: AbortSignal | undefined;
  /** Milliseconds the whole preflight may take. See `DEFAULT_DEADLINE_MS`. */
  readonly deadline?: number | undefined;
  /** Injectable so a test can assert on durations without reading the machine's clock. */
  readonly clock?: Clock | undefined;
  /**
   * Called for every {@link RunEvent} as the run happens.
   *
   * The push form. `events()` is the pull form over the same hub, for code that would rather write
   * `for await`.
   */
  readonly onEvent?: ((event: RunEvent) => void) | undefined;
};

/**
 * A compiled step graph: one run, and the doors onto it.
 *
 * One-shot. `run` memoises its outcome, so a second boot is a second `createBootstrap`.
 */
export type Bootstrap<TSteps extends readonly AnyStep[]> = {
  /**
   * The graph as levels, computed at construction and free to call.
   *
   * A static analysis, not a schedule. It says what the dependencies permit; `outcome.timeline`
   * says what actually happened, and the two are allowed to differ.
   *
   * `levels` answers what runs together; `nodes` carries the edges that say why, which is what
   * anything drawing or diffing the graph needs. No diagram is shipped — a format means owning its
   * identifier rules, its direction and its grouping — but the edges make one a few lines away.
   *
   * @example
   * // The graph as Mermaid, which GitHub renders inline in a README.
   * const plan = boot.plan();
   * // Mermaid node ids are identifiers and a step id is any string, so the id is sanitised and
   * // the real one becomes the label — `projects:reference` would not parse as written.
   * const key = (id: PropertyKey): string => `n${String(id).replace(/\W/g, '_')}`;
   * const diagram = [
   *   'graph LR',
   *   ...plan.nodes.map((node) => `  ${key(node.id)}["${String(node.id)}"]`),
   *   ...plan.nodes.flatMap((node) => node.needs.map((need) => `  ${key(need)} --> ${key(node.id)}`)),
   * ].join('\n');
   * @example
   * // The same shape as a golden file: a boot graph that changed without anyone meaning it to is
   * // a review comment, not a mystery three sprints later.
   * const shape = boot
   *   .plan()
   *   .nodes.map((node) => `${String(node.id)} <- ${node.needs.map(String).join(',')}`)
   *   .join('\n');
   * expect(shape).toBe(readFileSync('boot-graph.txt', 'utf8'));
   */
  plan: () => BootstrapPlan;
  /**
   * Run the preflight phase.
   *
   * **Never rejects on anything a step did.** A step that throws, times out or refuses the mount is
   * reported through `outcome.status`, because the notices and intents collected on the way to that
   * failure are the most valuable thing the run produced and a rejection would throw them away.
   * Programming mistakes — a cycle, an unknown dependency, a duplicate id — threw synchronously
   * back at `createBootstrap`, before anything ran.
   *
   * **Calling it twice returns the same outcome** and re-runs nothing. React 19 doubles effects in
   * StrictMode, so throwing on a second call would push that problem onto every binding.
   */
  run: () => Promise<Outcome<TSteps>>;
  /**
   * The live half, available once `run()` has resolved.
   *
   * Throws before that, rather than handing back an empty queue: a live run built on a run that has
   * not happened would silently forward nothing, which reads exactly like an app with no warnings.
   */
  live: () => LiveRun;
  /**
   * A live view of the run, as an async iterable.
   *
   * Open it **before** `run()`: it buffers from the moment it is created and ends at `run:settle`.
   * It reports what is happening, never what it means — whether the app may mount is the outcome's
   * answer, and a consumer that reduces these events into their own version of it will drift.
   *
   * The hosted phase is deliberately outside this stream. It belongs to the live run, which has its
   * own `subscribe`, and the two phases are separate worlds everywhere else in this package too.
   *
   * @example
   * const boot = createBootstrap({ steps });
   * const events = boot.events();
   * const running = boot.run();
   * for await (const event of events) {
   *   if (event.kind === 'step:settle') {
   *     progress.advance(event.trace.id);
   *   }
   * }
   * const outcome = await running;
   */
  events: () => AsyncIterable<RunEvent>;
  /**
   * The run as one observable snapshot, which is what a framework binding reads.
   *
   * Memoised, so every component that asks gets the same one and a bootstrap runs once however many
   * of them there are. Safe to call at any point in the run: it listens to the hub rather than
   * consuming the stream, so an observer built late is missing earlier events but still settles.
   */
  observe: () => RunObserver<TSteps>;
};

/**
 * What `createBootstrap` takes: the options, and the proof that the list is consistent.
 *
 * Named rather than written inline at the call, because a reference is what a reader gets shown. An
 * inline intersection makes typedoc expand {@link StepListCheck} into the whole conditional, and the
 * signature of the package's most important function became forty unreadable columns of it.
 */
export type CreateBootstrapOptions<TSteps extends readonly AnyStep[]> = BootstrapOptions<TSteps> &
  StepListCheck<TSteps>;

/**
 * Compile a step graph into something runnable.
 *
 * A `needs` naming a step this list does not contain, and two steps sharing an id, are **compile**
 * errors — see {@link StepListCheck}. What is left for runtime is what a type cannot see cheaply:
 * cycles, the edge from preflight to hosted, and everything at all for a list built dynamically.
 * Those throw here, because a cycle reported through a status field would deliver a bug report as
 * data.
 *
 * @example
 * const boot = createBootstrap({
 *   steps: [session, access, config],
 * });
 *
 * const outcome = await boot.run();
 * if (outcome.status === 'blocked') {
 *   showSignIn();
 * } else {
 *   mountTheApp(outcome.data);
 * }
 */
export function createBootstrap<const TSteps extends readonly AnyStep[]>(
  options: CreateBootstrapOptions<TSteps>
): Bootstrap<TSteps> {
  const compiled = compilePlan(options.steps);
  const clock = options.clock ?? systemClock;

  // The whole argument of the library in one line: what you declared, and the parallelism that fell
  // out of it. Widths rather than ids, so a fifty-step graph stays one line.
  planLog('Plan compiled', {
    steps: compiled.plan.nodes.length,
    levels: compiled.plan.levels.length,
    widths: compiled.plan.levels.map((level) => {
      return level.ids.length;
    }),
  });

  const hub: EventHub = createEventHub();
  if (options.onEvent !== undefined) {
    hub.listen(options.onEvent);
  }

  let pending: Promise<Outcome<TSteps>> | undefined;
  let preflight: PreflightResult | undefined;
  let live: LiveRun | undefined;
  let observer: RunObserver<TSteps> | undefined;

  const execute = async (): Promise<Outcome<TSteps>> => {
    const startedElapsed = clock.elapsed();
    runLog('Run started');
    hub.emit({ kind: 'run:start', plan: compiled.plan, at: clock.wall() });
    const schedulerOptions: SchedulerOptions = {
      clock,
      events: hub,
      ...(options.signal === undefined ? {} : { signal: options.signal }),
      ...(options.deadline === undefined ? {} : { deadline: options.deadline }),
    };
    const result = await runPreflight(compiled, schedulerOptions);
    preflight = result;
    // Counts, not contents: the notice and intent payloads are the caller's data, and this is a
    // console.
    (result.status === 'ready' ? runLog : runLog.warn)(`Run ${result.status}`, {
      ms: Math.round(clock.elapsed() - startedElapsed),
      notices: result.notices.length,
      intents: result.intents.length,
      errors: result.errors.length,
      ...(result.blockedBy === undefined ? {} : { blockedBy: result.blockedBy }),
    });
    hub.emit({ kind: 'run:settle', status: result.status, at: clock.wall() });

    // The same untyped boundary as `ctx.get`: settled values live in a `Map<StepId, unknown>`
    // because a heterogeneous step list has nowhere else to hold them, and the id is what
    // re-attaches the declared type on the way out.
    const entries = Object.fromEntries(result.data);

    const base = {
      notices: result.notices,
      intents: result.intents,
      errors: result.errors,
      timeline: result.timeline,
    };

    if (result.status === 'ready') {
      return Object.freeze({
        ...base,
        status: 'ready',
        data: entries as RunData<TSteps>,
      });
    }

    return Object.freeze({
      ...base,
      status: result.status,
      data: entries as PartialRunData<TSteps>,
      ...(result.blockedBy === undefined ? {} : { blockedBy: result.blockedBy }),
    });
  };

  const api: Bootstrap<TSteps> = {
    plan: () => {
      return compiled.plan;
    },
    run: () => {
      pending ??= execute();
      return pending;
    },
    events: () => {
      return hub.stream();
    },
    observe: () => {
      observer ??= createRunObserver({
        hub,
        run: () => {
          return api.run();
        },
        live: () => {
          return api.live();
        },
      });
      return observer;
    },
    live: () => {
      if (preflight === undefined) {
        throw new BootstrapError('live() is only available after run() has resolved.');
      }
      live ??= createLiveRun({ compiled, preflight, clock });
      return live;
    },
  };

  return api;
}
