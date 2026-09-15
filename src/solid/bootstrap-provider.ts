import { type JSX, createComponent, createContext, useContext } from 'solid-js';
import type { Bootstrap } from '../core/create-bootstrap.js';
import type { RunSnapshot } from '../core/run-observer.js';
import type { AnyStep } from '../core/types.js';
import { useBootstrap } from './use-bootstrap.js';

const BootstrapContext = createContext<() => RunSnapshot>();

/**
 * Put one bootstrap's snapshot in context, so a component deep in the tree can read the data it
 * needs without every component between them carrying it.
 *
 * Written through `createComponent` rather than JSX, and that is the binding's one structural
 * concession: a single program cannot hold both JSX factories, and the React binding needs its one.
 * Solid's runtime builds the same component either way.
 */
export function BootstrapProvider<TSteps extends readonly AnyStep[]>(props: {
  boot: Bootstrap<TSteps>;
  children: JSX.Element;
}): JSX.Element {
  const snapshot = useBootstrap(props.boot);
  return createComponent(BootstrapContext.Provider, {
    value: snapshot,
    get children() {
      return props.children;
    },
  });
}

/**
 * The snapshot accessor from the nearest {@link BootstrapProvider}. **Do not destructure what it
 * returns.**
 *
 * Throws outside a provider rather than returning a blank snapshot: an app that renders without one
 * would otherwise look like an app whose bootstrap had not finished, forever.
 */
export function useBootstrapContext(): () => RunSnapshot {
  const snapshot = useContext(BootstrapContext);
  if (snapshot === undefined) {
    throw new Error('useBootstrapContext was called outside a <BootstrapProvider>.');
  }
  return snapshot;
}
