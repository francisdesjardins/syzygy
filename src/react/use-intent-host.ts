import { useEffect, useState } from 'react';
import { type ForwardedIntent, attachIntentHost } from '../core/intent-host.js';
import type { UiPort } from '../core/registry.js';
import { useBootstrapContext } from './bootstrap-provider.js';

/**
 * Take the intent queue, run the mounted phase, and hand back what the app has to show.
 *
 * **It returns intents instead of taking an `onIntent` callback**, and that shape is the point. A
 * callback prop is a fresh function on every render, so an effect depending on it would tear the
 * host down and dispose the session between an intent being forwarded and the user answering it —
 * and an effect ignoring it would need the dependency check switched off, which silences the
 * warning for the next dependency somebody adds too. Rendering the queue has neither problem: the
 * effect depends on the session and the port, and both are honestly reactive.
 *
 * `ui` must therefore be stable — module scope, or `useMemo` — for the same reason the subscribe
 * function handed to `useSyncExternalStore` must be. A fresh port every render is a fresh mounted
 * phase every render.
 *
 * One host per app, near the root. Two hosts both accepting everything would race for the same
 * intents; reach for `attachIntentHost` directly if you genuinely need two and can split them.
 *
 * @example
 * const port = useMemo(() => { return { confirm: (m: string) => dialog.ask(m) }; }, []);
 * const pending = useIntentHost(port);
 * return pending.map(({ intent, controls }) => {
 *   return <Banner key={intent.id} intent={intent} onOk={controls.settle} />;
 * });
 */
export function useIntentHost(ui: UiPort): readonly ForwardedIntent[] {
  const { session } = useBootstrapContext();
  const [forwarded, setForwarded] = useState<readonly ForwardedIntent[]>([]);

  useEffect(() => {
    if (session === undefined) {
      return;
    }
    const host = attachIntentHost(session, {
      ui,
      onIntent: (intent, controls) => {
        setForwarded((previous) => {
          return [...previous, { intent, controls }];
        });
      },
    });
    return () => {
      host.destroy();
    };
  }, [session, ui]);

  return forwarded;
}
