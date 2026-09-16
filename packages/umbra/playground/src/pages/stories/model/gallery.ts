import { stories } from '@/pages/stories/model/registry';

let teardown: (() => void) | undefined;

function host(): HTMLElement {
  const existing = document.getElementById('root');
  if (existing !== null) {
    return existing;
  }
  const created = document.createElement('div');
  created.id = 'root';
  document.body.append(created);
  return created;
}

/**
 * The component suite's door, installed before anything of ours renders.
 *
 * It deliberately does not import the router: a test page that pulled the whole app graph would be
 * measuring the app's providers as well as the harness.
 */
export function mount(params: { story: string }): void {
  teardown?.();
  const story = stories[params.story];
  if (story === undefined) {
    host().textContent = `No story named "${params.story}".`;
    return;
  }
  const element = document.createElement('div');
  element.dataset['testid'] = 'story-host';
  host().replaceChildren(element);
  teardown = story(element);
}

export function unmount(): void {
  teardown?.();
  teardown = undefined;
  host().replaceChildren();
}
