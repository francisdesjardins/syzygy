import type { IntentType, NoticeType, StepId } from './registry.js';
import type { BootstrapPlan, RunStatus, StepPhase, StepTrace } from './types.js';

/**
 * What the preflight reports as it happens.
 *
 * The outcome stays the single source of truth; these are for the things a snapshot cannot do —
 * a progress indicator, a live timeline, a shell that wants to say which micro-frontend is still
 * starting. Anything that decides whether the app may mount reads the outcome instead.
 */
export type RunEvent =
  | { readonly kind: 'run:start'; readonly plan: BootstrapPlan; readonly at: number }
  | {
      readonly kind: 'level:start';
      readonly level: number;
      readonly phase: StepPhase;
      readonly ids: readonly StepId[];
      readonly at: number;
    }
  | {
      readonly kind: 'step:start';
      readonly id: StepId;
      readonly level: number;
      readonly at: number;
    }
  | { readonly kind: 'step:settle'; readonly trace: StepTrace }
  | {
      readonly kind: 'notice';
      readonly type: NoticeType;
      readonly payload: unknown;
      readonly step: StepId;
      readonly at: number;
    }
  | {
      readonly kind: 'intent';
      readonly type: IntentType;
      readonly payload: unknown;
      readonly step: StepId;
      readonly at: number;
    }
  | { readonly kind: 'run:settle'; readonly status: RunStatus; readonly at: number };

export type EventHub = {
  emit: (event: RunEvent) => void;
  listen: (listener: (event: RunEvent) => void) => () => void;
  /** An async iterable that buffers from the moment it is created and ends at `run:settle`. */
  stream: () => AsyncIterable<RunEvent>;
};

/**
 * Fan-out for {@link RunEvent}, with an async-iterable view over it.
 *
 * The iterable buffers rather than dropping, which is safe here for a reason that would not hold in
 * general: a boot emits on the order of tens of events, once. A long-lived stream would need a drop
 * policy; this one is over before backpressure could mean anything.
 *
 * Call `stream()` **before** `run()`. A stream opened after the run has settled sees nothing,
 * because there is nothing left to happen and replaying a finished run is what the outcome is for.
 */
export function createEventHub(): EventHub {
  const listeners = new Set<(event: RunEvent) => void>();

  return {
    emit: (event) => {
      // A copy, not the set: `stream()` removes its own listener on `run:settle`, which happens
      // inside this very dispatch.
      for (const listener of Array.from(listeners)) {
        listener(event);
      }
    },

    listen: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    stream: () => {
      const buffer: RunEvent[] = [];
      let wake: (() => void) | undefined;
      let done = false;

      const stop = (): void => {
        done = true;
        listeners.delete(push);
        wake?.();
      };

      // Read through a call rather than the variable: `done` is set from a listener, and the
      // checker narrows a plain `let` boolean across the loop as though nothing could change it.
      const isDone = (): boolean => {
        return done;
      };

      const push = (event: RunEvent): void => {
        buffer.push(event);
        if (event.kind === 'run:settle') {
          stop();
        }
        wake?.();
      };

      listeners.add(push);

      return {
        [Symbol.asyncIterator]: async function* iterate(): AsyncGenerator<RunEvent> {
          try {
            for (;;) {
              for (const next of buffer.splice(0, buffer.length)) {
                yield next;
              }
              // Done **and** drained, in that order and both of them. A `yield` suspends the
              // generator, and anything pushed while it is suspended lands in the buffer after this
              // batch was taken — so an exit that only asked whether the run had ended would drop
              // the very event that ended it.
              if (buffer.length === 0 && isDone()) {
                return;
              }
              if (buffer.length > 0) {
                continue;
              }
              await new Promise<void>((resolve) => {
                wake = () => {
                  wake = undefined;
                  resolve();
                };
              });
            }
          } finally {
            // A consumer that breaks out of the loop unsubscribes here, which is the whole reason
            // this is a generator rather than a queue the caller drains by hand.
            stop();
          }
        },
      };
    },
  };
}
