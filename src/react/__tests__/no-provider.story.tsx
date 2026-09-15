import { Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { useBootstrapContext } from '../bootstrap-provider.js';

/**
 * A component that reaches for the snapshot with no provider above it.
 *
 * The throw is caught by a boundary rather than a `try` around the hook: React does not render a
 * component where its JSX is constructed, so a `try` there catches nothing — and a hook inside one
 * is a conditional hook. The boundary renders what was thrown, because the claim is *what it said*
 * and not merely that something failed.
 */
class CatchRender extends Component<
  { readonly children: ReactNode },
  { readonly message: string }
> {
  override state = { message: '' };

  static getDerivedStateFromError(error: unknown): { message: string } {
    return { message: error instanceof Error ? error.message : 'not an Error' };
  }

  override render(): ReactNode {
    return this.state.message === '' ? (
      this.props.children
    ) : (
      <p data-testid="outcome">{this.state.message}</p>
    );
  }
}

function Outside() {
  useBootstrapContext();
  return <p data-testid="outcome">no throw</p>;
}

export function mountNoProviderStory(host: HTMLElement): () => void {
  const container = document.createElement('div');
  host.append(container);
  const root = createRoot(container);
  root.render(
    <CatchRender>
      <Outside />
    </CatchRender>
  );
  return () => {
    // Deferred for the same reason the bootstrap harness defers: React refuses to tear a root down
    // from inside another root's work.
    queueMicrotask(() => {
      root.unmount();
      container.remove();
    });
  };
}
