import type { UiPort } from './registry.js';
import type { Session } from './session.js';
import type { Intent } from './types.js';

/** What a handler is given to answer one intent with. */
export type IntentControls = {
  /** The app did the thing. Releases a mounted step waiting on `ctx.awaitIntent`. */
  settle: () => void;
  /** The app will not do the thing, and this is why. */
  drop: (reason: string) => void;
};

/** One forwarded intent, with the two ways to answer it attached. */
export type ForwardedIntent = {
  readonly intent: Intent;
  readonly controls: IntentControls;
};

/** What a host needs: which intents it takes, what it does with one, and the port it lends. */
export type IntentHostOptions = {
  /**
   * Which intents this host takes. Everything else stays pending, for another host or for
   * `dispose` to record as dropped.
   */
  readonly accepts?: ((intent: Intent) => boolean) | undefined;
  /** Called once per newly forwarded intent, in queue order. */
  readonly onIntent: (intent: Intent, controls: IntentControls) => void;
  /**
   * Handed to mounted steps as `ctx.ui`.
   *
   * Required, not defaulted. A default of `{}` would satisfy an app that declared nothing and
   * silently fail one that declared a port and forgot to pass it — the second is the case worth
   * catching, and a project with an empty port writes `{}` itself at no cost.
   */
  readonly ui: UiPort;
};

/** A host that is listening. Its lifetime is the caller's to manage. */
export type AttachedIntentHost = {
  /** Resolves when the mounted phase is done. */
  readonly mounted: Promise<void>;
  /**
   * Stop listening.
   *
   * **It does not dispose the session**, and that distinction took a bug to find. A component
   * unmounting is not the application shutting down: a framework tears an effect down and rebuilds
   * it whenever its inputs change, and a `destroy` that disposed would drop every pending intent
   * each time. Dropping what nobody forwarded is `session.dispose()`, and only the app knows when
   * the page is really going away.
   */
  destroy: () => void;
};

/**
 * Connect a session's intent queue to whatever the app shows people, and run the mounted phase.
 *
 * Core rather than binding code, by the mechanical test: React, Solid and plain DOM all need this,
 * and they all need the same thing. What a binding adds is the lifetime — an effect, an
 * `onCleanup`, an explicit `destroy` — and nothing else.
 *
 * It forwards on every queue change rather than once, because the mounted phase can queue new
 * intents after the first pass: a step that decides to warn only once it has the configuration.
 */
export function attachIntentHost(session: Session, options: IntentHostOptions): AttachedIntentHost {
  const seen = new Set<string>();

  const drain = (): void => {
    for (const intent of session.forward(options.accepts)) {
      if (seen.has(intent.id)) {
        continue;
      }
      seen.add(intent.id);
      options.onIntent(intent, {
        settle: () => {
          session.settle(intent.id);
        },
        drop: (reason) => {
          session.drop(intent.id, reason);
        },
      });
    }
  };

  const unsubscribe = session.subscribe(() => {
    drain();
  });

  const mounted = session.mount(options.ui).then(() => {
    return undefined;
  });

  return {
    mounted,
    destroy: () => {
      unsubscribe();
    },
  };
}
