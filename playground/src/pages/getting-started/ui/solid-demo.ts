import { createBootstrap } from 'antumbra';
import { BootstrapProvider, useStepData, useBootstrapContext, useIntentHost } from 'antumbra/solid';
import { createComponent, createEffect } from 'solid-js';
import { render } from 'solid-js/web';
import { type Faults, createApi } from '@/pages/getting-started/examples/fake-api.js';
import { createSteps } from '@/pages/getting-started/examples/steps.js';
import { uiPort } from '@/pages/getting-started/examples/ui-port.js';

/**
 * The Solid half of the demo, written without JSX.
 *
 * Not a limitation being worked around: one TypeScript program cannot hold two JSX factories, and
 * the React binding needs its one. `createComponent` and `createEffect` build the same tree with
 * the same reactivity, and a demo that needs no second compiler pass is a demo whose build cannot
 * drift from the library's.
 */
function line(testId: string): HTMLParagraphElement {
  const node = document.createElement('p');
  node.dataset['testid'] = testId;
  return node;
}

function Panel() {
  const snapshot = useBootstrapContext();
  const config = useStepData('config');
  const pending = useIntentHost(uiPort);

  const host = document.createElement('div');
  host.className = 'solid-readout';

  const phase = line('solid-phase');
  const data = line('solid-data');
  const queue = line('solid-intents');
  const shared = line('solid-shared');
  host.append(phase, data, queue, shared);

  // One effect per readout, each subscribing to exactly the accessor it reads. This is the whole
  // difference between the bindings: React re-renders the component, Solid re-runs the lines that
  // actually depend on what changed.
  createEffect(() => {
    const current = snapshot();
    phase.textContent = `phase: ${current.stage}${
      current.outcome === undefined ? '' : ` · ${current.outcome.status}`
    }`;
  });
  createEffect(() => {
    data.textContent = `config: ${config()?.workspaceName ?? '—'}`;
  });

  createEffect(() => {
    const adopted = [
      ...(snapshot().outcome?.timeline ?? []),
      ...(snapshot().mount?.timeline ?? []),
    ].filter((trace) => {
      return trace.shared === true;
    });
    shared.textContent = `steps adopted from the page: ${String(adopted.length)}${
      adopted.length === 0
        ? ''
        : ` (${adopted
            .map((trace) => {
              return String(trace.id);
            })
            .join(', ')})`
    }`;
  });
  createEffect(() => {
    queue.textContent = `intents forwarded here: ${String(pending().length)}`;
  });

  return host;
}

/** Mounts the Solid demo into a host element and returns the teardown. */
export function mountSolidDemo(host: HTMLElement, faults: Faults): () => void {
  const boot = createBootstrap({ steps: createSteps(createApi(faults)) });

  return render(() => {
    return createComponent(BootstrapProvider, {
      boot,
      get children() {
        return createComponent(Panel, {});
      },
    });
  }, host);
}
