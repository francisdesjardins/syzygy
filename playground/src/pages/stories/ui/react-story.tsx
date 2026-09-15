import { BootstrapProvider, useStepData, useBootstrapContext, useIntentHost } from 'antumbra/react';
import type { UiPort } from 'antumbra/react';
import { createRoot } from 'react-dom/client';
import { READOUT, createScenario } from '@/pages/stories/model/scenario.js';

/** No dialog in the harness: a story answers through buttons the test can click. */
const port: UiPort = {
  confirm: () => {
    return Promise.resolve(true);
  },
};

function Readout() {
  const snapshot = useBootstrapContext();
  const config = useStepData('config');
  const pending = useIntentHost(port);
  const first = pending[0];

  return (
    <div>
      <p data-testid={READOUT.stage}>{snapshot.stage}</p>
      <p data-testid={READOUT.status}>{snapshot.outcome?.status ?? '—'}</p>
      <p data-testid={READOUT.config}>{config?.workspaceName ?? '—'}</p>
      <p data-testid={READOUT.notices}>{String(snapshot.outcome?.notices.length ?? 0)}</p>
      <p data-testid={READOUT.intentStatus}>{snapshot.intents[0]?.status ?? '—'}</p>
      <button
        type="button"
        data-testid={READOUT.settle}
        disabled={first === undefined}
        onClick={() => {
          first?.controls.settle();
        }}
      >
        settle
      </button>
      <button
        type="button"
        data-testid={READOUT.drop}
        disabled={first === undefined}
        onClick={() => {
          first?.controls.drop('the story said no');
        }}
      >
        drop
      </button>
    </div>
  );
}

export function mountReactStory(host: HTMLElement): () => void {
  const boot = createScenario();
  // A container of its own rather than the host, because the teardown below is deferred: StrictMode
  // mounts, unmounts and mounts again, so the second root would be created on a container the first
  // one has not let go of yet.
  const container = document.createElement('div');
  host.append(container);
  const root = createRoot(container);
  root.render(
    <BootstrapProvider boot={boot}>
      <Readout />
    </BootstrapProvider>
  );
  return () => {
    // React refuses to tear a root down from inside another root's work, and a parent effect's
    // cleanup is exactly that when this story is mounted from the `/stories` route. A microtask puts
    // the teardown after the commit it would otherwise interrupt.
    queueMicrotask(() => {
      root.unmount();
      container.remove();
    });
  };
}
