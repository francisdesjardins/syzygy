import {
  type AttachedIntentHost,
  type IntentHostOptions,
  attachIntentHost,
} from '../core/intent-host.js';
import type { LiveRun } from '../core/live-run.js';

/** The same options every host takes. */
export type BindOptions = IntentHostOptions;
/** What `bindBootstrap` hands back. Its `destroy` also disposes the live run — see below. */
export type BoundBootstrap = AttachedIntentHost;

/**
 * Drive a live run from plain DOM code: no framework, no rendering, no markup of its own.
 *
 * A controller rather than a renderer. The page already has the dialog, the banner or the toast it
 * wants to show; this connects the queue to it and reports the answer back. Adding a renderer here
 * would mean shipping UI, which is the one thing this package will not do.
 *
 * The work is {@link attachIntentHost}'s, shared with the framework bindings. What this adds is the
 * lifetime: a caller with no component to hang one on calls `destroy` itself.
 *
 * @example
 * const bound = bindBootstrap(boot.live(), {
 *   host: { confirm: (message) => Promise.resolve(window.confirm(message)) },
 *   onIntent: (intent, controls) => {
 *     banner.textContent = intent.type;
 *     banner.hidden = false;
 *     controls.settle();
 *   },
 * });
 *
 * await bound.hosted;
 * // The page is going away, which is the one reading of `destroy` that disposes the live run.
 * window.addEventListener('pagehide', bound.destroy, { once: true });
 */
export function bindBootstrap(live: LiveRun, options: BindOptions): BoundBootstrap {
  const host = attachIntentHost(live, options);
  return {
    hosted: host.hosted,
    // The controller binding has no component lifetime behind it, so `destroy` here means what a
    // caller with no framework means by it: the page is done with this bootstrap. That is the one
    // place disposing the live run is the right reading of the word.
    destroy: () => {
      host.destroy();
      live.dispose();
    },
  };
}
