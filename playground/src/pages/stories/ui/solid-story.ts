import { BootstrapProvider, useStepData, useBootstrapContext, useIntentHost } from 'antumbra/solid';
import type { UiPort } from 'antumbra/solid';
import { createComponent, createEffect } from 'solid-js';
import { render } from 'solid-js/web';
import { READOUT, createScenario } from '@/pages/stories/model/scenario.js';

const port: UiPort = {
  confirm: () => {
    return Promise.resolve(true);
  },
};

function text(testId: string): HTMLParagraphElement {
  const node = document.createElement('p');
  node.dataset['testid'] = testId;
  return node;
}

function button(testId: string, label: string): HTMLButtonElement {
  const node = document.createElement('button');
  node.type = 'button';
  node.dataset['testid'] = testId;
  node.textContent = label;
  node.disabled = true;
  return node;
}

/**
 * The same readout as the React story, written without JSX for the reason the whole Solid side is:
 * one program cannot hold two JSX factories. The ids and the behaviour are identical, which is what
 * the shared component test asserts.
 */
function Readout() {
  const snapshot = useBootstrapContext();
  const config = useStepData('config');
  const pending = useIntentHost(port);

  const host = document.createElement('div');
  const stage = text(READOUT.stage);
  const status = text(READOUT.status);
  const configLine = text(READOUT.config);
  const notices = text(READOUT.notices);
  const intentStatus = text(READOUT.intentStatus);
  const settle = button(READOUT.settle, 'settle');
  const drop = button(READOUT.drop, 'drop');
  host.append(stage, status, configLine, notices, intentStatus, settle, drop);

  createEffect(() => {
    const current = snapshot();
    stage.textContent = current.stage;
    status.textContent = current.outcome?.status ?? '—';
    notices.textContent = String(current.outcome?.notices.length ?? 0);
    intentStatus.textContent = current.intents[0]?.status ?? '—';
  });

  createEffect(() => {
    configLine.textContent = config()?.workspaceName ?? '—';
  });

  createEffect(() => {
    const first = pending()[0];
    settle.disabled = first === undefined;
    drop.disabled = first === undefined;
    settle.onclick = () => {
      first?.controls.settle();
    };
    drop.onclick = () => {
      first?.controls.drop('the story said no');
    };
  });

  return host;
}

export function mountSolidStory(host: HTMLElement): () => void {
  const boot = createScenario();
  return render(() => {
    return createComponent(BootstrapProvider, {
      boot,
      get children() {
        return createComponent(Readout, {});
      },
    });
  }, host);
}
