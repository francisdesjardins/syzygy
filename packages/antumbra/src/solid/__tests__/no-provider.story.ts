import { ErrorBoundary, createComponent } from 'solid-js';
import { render } from 'solid-js/web';
import { useBootstrapContext } from '../bootstrap-provider.js';

/**
 * Solid's half of the same claim, and it needs its own harness rather than a parameter of the React
 * one: the two bindings reach their context through different runtimes, so a shared harness would
 * only ever prove whichever runtime it was written in.
 */
function Outside() {
  useBootstrapContext();
  const element = document.createElement('p');
  element.dataset['testid'] = 'outcome';
  element.textContent = 'no throw';
  return element;
}

function said(error: unknown): HTMLElement {
  const element = document.createElement('p');
  element.dataset['testid'] = 'outcome';
  element.textContent = error instanceof Error ? error.message : 'not an Error';
  return element;
}

export function mountNoProviderStory(host: HTMLElement): () => void {
  const container = document.createElement('div');
  host.append(container);
  const dispose = render(() => {
    return createComponent(ErrorBoundary, {
      fallback: said,
      get children() {
        return createComponent(Outside, {});
      },
    });
  }, container);
  return () => {
    dispose();
    container.remove();
  };
}
