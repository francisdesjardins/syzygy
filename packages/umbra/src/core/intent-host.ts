import type { HostCapabilities } from './registry.js';
import type { LiveRun } from './live-run.js';
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
   * Handed to mounted steps as `ctx.host`.
   *
   * Required, not defaulted. A default of `{}` would satisfy an app that declared nothing and
   * silently fail one that declared a port and forgot to pass it — the second is the case worth
   * catching, and a project with an empty port writes `{}` itself at no cost.
   */
  readonly host: HostCapabilities;
};

/** A host that is listening. Its lifetime is the caller's to manage. */
export type AttachedIntentHost = {
  /** Resolves when the mounted phase is done. */
  readonly hosted: Promise<void>;
  /**
   * Stop listening.
   *
   * **It does not dispose the live run**, and that distinction took a bug to find. A component
   * unmounting is not the application shutting down: a framework tears an effect down and rebuilds
   * it whenever its inputs change, and a `destroy` that disposed would drop every pending intent
   * each time. Dropping what nobody forwarded is `live.dispose()`, and only the app knows when
   * the page is really going away.
   */
  destroy: () => void;
};

/**
 * Connect a live run's intent queue to whatever the app shows people, and run the hosted phase.
 *
 * Core rather than binding code, by the mechanical test: React, Solid and plain DOM all need this,
 * and they all need the same thing. What a binding adds is the lifetime — an effect, an
 * `onCleanup`, an explicit `destroy` — and nothing else.
 *
 * It forwards on every queue change rather than once, because the mounted phase can queue new
 * intents after the first pass: a step that decides to warn only once it has the configuration.
 *
 * @example
 * const host = attachIntentHost(boot.live(), {
 *   host: { confirm: (message) => showConfirmDialog(message) },
 *   onIntent: (intent, controls) => {
 *     if (intent.type === 'warn:trial-expiring') {
 *       showBanner(intent.payload);
 *       controls.settle();
 *     }
 *   },
 * });
 *
 * await host.hosted;
 */
export function attachIntentHost(live: LiveRun, options: IntentHostOptions): AttachedIntentHost {
  const seen = new Set<string>();

  const drain = (): void => {
    for (const intent of live.forward(options.accepts)) {
      if (seen.has(intent.id)) {
        continue;
      }
      seen.add(intent.id);
      options.onIntent(intent, {
        settle: () => {
          live.settle(intent.id);
        },
        drop: (reason) => {
          live.drop(intent.id, reason);
        },
      });
    }
  };

  const unsubscribe = live.subscribe(() => {
    drain();
  });

  const hosted = live.attach(options.host).then(() => {
    return undefined;
  });

  return {
    hosted,
    destroy: () => {
      unsubscribe();
    },
  };
}
