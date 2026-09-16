import { BootstrapProvider, useStepData, useBootstrapContext, useIntentHost } from 'umbra/solid';
import type { HostCapabilities } from 'umbra/solid';
import { createComponent, createEffect } from 'solid-js';
import { render } from 'solid-js/web';
import { READOUT, createScenario } from '@/pages/stories/model/scenario.js';
import styles from '@/pages/stories/ui/story-readout.module.css';

const port: HostCapabilities = {
  confirm: () => {
    return Promise.resolve(true);
  },
};

/**
 * A labelled value, returned as the `<p>` a spec reads so every caller below is unchanged; the
 * row it is wrapped in goes into `rows`, which the host appends.
 */
function text(testId: string, label: string): { value: HTMLParagraphElement; row: HTMLElement } {
  const value = document.createElement('p');
  value.dataset['testid'] = testId;
  value.className = styles['value'] ?? '';

  const caption = document.createElement('span');
  caption.className = styles['label'] ?? '';
  caption.textContent = label;

  const row = document.createElement('div');
  row.className = styles['row'] ?? '';
  row.append(caption, value);

  return { value, row };
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
  host.className = styles['readout'] ?? '';
  const stageRow = text(READOUT.stage, 'Stage');
  const statusRow = text(READOUT.status, 'Outcome');
  const configRow = text(READOUT.config, 'Config');
  const noticesRow = text(READOUT.notices, 'Notices');
  const intentRow = text(READOUT.intentStatus, 'Intent');
  const stage = stageRow.value;
  const status = statusRow.value;
  const configLine = configRow.value;
  const notices = noticesRow.value;
  const intentStatus = intentRow.value;
  const settle = button(READOUT.settle, 'settle');
  const drop = button(READOUT.drop, 'drop');
  const actions = document.createElement('div');
  actions.className = styles['actions'] ?? '';
  actions.append(settle, drop);
  host.append(stageRow.row, statusRow.row, configRow.row, noticesRow.row, intentRow.row, actions);

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
