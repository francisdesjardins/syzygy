import { type ReadableStore, createStore } from '../store/create-store.js';
import type { RunEvent, EventHub } from './events.js';
import type { HostReport, Session } from './session.js';
import type { AnyStep, Intent, Outcome } from './types.js';

/**
 * Where a run is, from a renderer's point of view.
 *
 * Deliberately not called a phase: a step's `phase` is `preflight` or `mounted`, and one word for
 * two axes is how `snapshot.phase` and `step.phase` came to look like the same question.
 */
export type RunStage = 'idle' | 'running' | 'settled';

/** A run reduced to one value a renderer can read, from before it starts to after it settles. */
export type RunSnapshot<TSteps extends readonly AnyStep[] = readonly []> = {
  readonly stage: RunStage;
  /** Everything the run has reported so far. Grows while `stage` is `running`. */
  readonly events: readonly RunEvent[];
  readonly outcome: Outcome<TSteps> | undefined;
  /** Live: the queue as the session currently holds it, empty until the run settles. */
  readonly intents: readonly Intent[];
  /**
   * What the mounted phase did, once it has run.
   *
   * Here rather than only on `session.attach()`'s promise, because a graph drawn from the timeline
   * is missing its last column without it — the mounted step showed as permanently unresolved, and
   * somebody noticed.
   */
  readonly hosted: HostReport | undefined;
  readonly session: Session | undefined;
};

/** The observable view of one bootstrap, memoised on it so a page full of components runs it once. */
export type RunObserver<TSteps extends readonly AnyStep[] = readonly []> = {
  readonly store: ReadableStore<RunSnapshot<TSteps>>;
  /**
   * Run the bootstrap.
   *
   * Idempotent, which is what makes it safe to call from an effect: React 19 doubles effects in
   * StrictMode, and a binding should not have to defend against its own framework.
   */
  start: () => void;
  /** Stop listening. The session is left alone: the app may still be draining intents. */
  dispose: () => void;
};

export type ObserverDeps<TSteps extends readonly AnyStep[]> = {
  readonly hub: EventHub;
  readonly run: () => Promise<Outcome<TSteps>>;
  readonly session: () => Session;
};

/**
 * A run, reduced to one observable snapshot a renderer can read.
 *
 * Core rather than binding code, by the mechanical test: React and Solid would both need it, and
 * they would need exactly the same thing. What is left in each binding is the subscription
 * primitive their framework happens to spell differently.
 *
 * **It listens to the hub rather than consuming `events()`**, and that is not a detail. The async
 * iterable ends at `run:settle`, so an observer built after the run had already settled would wait
 * for an event that will never come and sit on `running` forever. Listening also removes the lag:
 * the hub dispatches synchronously, so by the time `run()` resolves every event has already landed.
 */
export function createRunObserver<TSteps extends readonly AnyStep[]>(
  deps: ObserverDeps<TSteps>
): RunObserver<TSteps> {
  const store = createStore<RunSnapshot<TSteps>>({
    stage: 'idle',
    events: [],
    outcome: undefined,
    intents: [],
    hosted: undefined,
    session: undefined,
  });

  let started = false;
  let live = true;
  let unsubscribeEvents: (() => void) | undefined;
  let unsubscribeIntents: (() => void) | undefined;

  unsubscribeEvents = deps.hub.listen((event) => {
    if (!live) {
      return;
    }
    store.set({ ...store.get(), events: [...store.get().events, event] });
  });

  return {
    store,

    start: () => {
      if (started) {
        return;
      }
      started = true;
      store.set({ ...store.get(), stage: 'running' });

      void deps.run().then((outcome) => {
        if (!live) {
          return;
        }
        const session = deps.session();
        // Subscribed rather than read once: the mounted phase queues intents of its own, and a
        // snapshot taken here would show the queue as it was before any of them existed.
        unsubscribeIntents = session.subscribe((state) => {
          store.set({ ...store.get(), intents: state.intents, hosted: state.hosted });
        });
        store.set({ ...store.get(), stage: 'settled', outcome, session });
      });
    },

    dispose: () => {
      live = false;
      unsubscribeEvents?.();
      unsubscribeEvents = undefined;
      unsubscribeIntents?.();
      unsubscribeIntents = undefined;
    },
  };
}
