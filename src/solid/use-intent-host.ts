import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js';
import { type ForwardedIntent, attachIntentHost } from '../core/intent-host.js';
import type { UiPort } from '../core/registry.js';
import { useBootstrapContext } from './bootstrap-provider.js';

/**
 * Take the intent queue, run the mounted phase, and hand back what the app has to show.
 *
 * **Returns an accessor**, and returns intents rather than taking an `onIntent` callback — the same
 * shape as React's, for the same reason: a callback recreated every render would tear the host down
 * and dispose the session between an intent being forwarded and the user answering it.
 *
 * One host per app, near the root.
 *
 * @example
 * const pending = useIntentHost({ confirm: (message) => dialog.ask(message) });
 * return <For each={pending()}>{(entry) => <Banner intent={entry.intent} />}</For>;
 */
export function useIntentHost(ui: UiPort): () => readonly ForwardedIntent[] {
  const snapshot = useBootstrapContext();
  const [forwarded, setForwarded] = createSignal<readonly ForwardedIntent[]>([]);

  // Derived, not read inside the effect. Reading the whole snapshot there would subscribe the
  // effect to every event and every queue change, so it would tear the host down and rebuild it
  // dozens of times during one boot — the reactive twin of listing an unstable callback in a
  // dependency array.
  const session = createMemo(() => {
    return snapshot().session;
  });

  createEffect(() => {
    const current = session();
    if (current === undefined) {
      return;
    }
    const host = attachIntentHost(current, {
      ui,
      onIntent: (intent, controls) => {
        setForwarded((previous) => {
          return [...previous, { intent, controls }];
        });
      },
    });
    onCleanup(() => {
      host.destroy();
    });
  });

  return forwarded;
}
