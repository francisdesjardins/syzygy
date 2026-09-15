import { type ReactNode, createContext, use } from 'react';
import type { Bootstrap } from '../core/create-bootstrap.js';
import type { RunSnapshot } from '../core/run-observer.js';
import type { AnyStep } from '../core/types.js';
import { useBootstrap } from './use-bootstrap.js';

const BootstrapContext = createContext<RunSnapshot | undefined>(undefined);

/**
 * Put one bootstrap's snapshot in context, so a component deep in the tree can read the data it
 * needs without every component between them carrying it.
 */
export function BootstrapProvider<TSteps extends readonly AnyStep[]>(props: {
  boot: Bootstrap<TSteps>;
  children: ReactNode;
}): ReactNode {
  const snapshot = useBootstrap(props.boot);
  return <BootstrapContext value={snapshot}>{props.children}</BootstrapContext>;
}

/**
 * The snapshot from the nearest {@link BootstrapProvider}.
 *
 * Throws outside one rather than returning a blank snapshot: an app that renders without a provider
 * would otherwise look like an app whose bootstrap had not finished, forever.
 */
export function useBootstrapContext(): RunSnapshot {
  const snapshot = use(BootstrapContext);
  if (snapshot === undefined) {
    throw new Error('useBootstrapContext was called outside a <BootstrapProvider>.');
  }
  return snapshot;
}
