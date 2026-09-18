import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { createContext, useContext, useState, type ReactNode } from 'react';

import { ApiReferenceProvider } from '../slots.tsx';
import type { ApiEntryPoints, ApiSlots } from '../contract.ts';

/**
 * The host the viewer renders through, standing in for a playground.
 *
 * Every slot is deliberately plain and marked: the contract says these components are the *host's*
 * and differ between the two real ones, so a harness that reproduced either would be testing that
 * playground rather than this seam. What a test may assert is that the viewer renders *through*
 * them — the marks are how it tells.
 */
const SLOTS: ApiSlots = {
  PageLayout: ({ title, description, actions, children }) => {
    return (
      <div data-testid="slot-page-layout">
        <h1>{title}</h1>
        <p data-testid="page-description">{description}</p>
        {actions === undefined ? null : <div data-testid="page-actions">{actions}</div>}
        {children}
      </div>
    );
  },
  SurfaceCard: ({ interactive, children }) => {
    return (
      <div data-testid="slot-card" data-interactive={interactive === true ? '' : undefined}>
        {children}
      </div>
    );
  },
  CodeBlock: ({ source }) => {
    return <pre data-testid="slot-code">{source}</pre>;
  },
  AppButton: ({ onClick, className, children }) => {
    return (
      <button type="button" data-testid="slot-button" className={className} onClick={onClick}>
        {children}
      </button>
    );
  },
  ExampleSection: ({ title, description, children }) => {
    return (
      <section data-testid="slot-section">
        <h2>{title}</h2>
        {description === undefined ? null : <p>{description}</p>}
        {children}
      </section>
    );
  },
  ExampleGrid: ({ columns, children }) => {
    return (
      <div data-testid="slot-grid" data-columns={String(columns)}>
        {children}
      </div>
    );
  },
  icons: {
    ArrowBackIcon: ({ className }) => {
      return <i data-testid="icon-back" className={className} />;
    },
    ArrowForwardIcon: ({ className }) => {
      return <i data-testid="icon-forward" className={className} />;
    },
    LinkIcon: ({ className }) => {
      return <i data-testid="icon-link" className={className} />;
    },
    SearchIcon: ({ className }) => {
      return <i data-testid="icon-search" className={className} />;
    },
  },
};

/** The documented library's own doors — the only library-specific data the viewer holds. */
const ENTRY_POINTS: ApiEntryPoints = {
  doors: [
    { specifier: 'lib', name: 'createThing' },
    { specifier: 'lib/react', name: 'useDialog' },
  ],
  blurbs: {
    lib: 'What works with no framework at all.',
    'lib/react': 'The same surface, for React.',
    'lib/solid': 'And for Solid.',
  },
  labels: { lib: 'Core', 'lib/react': 'React binding', 'lib/solid': 'Solid binding' },
};

const PATHS = ['/', '/api', '/api/core', '/api/react', '/api/solid'];

/** What the root route renders, handed down past the router's own memoisation. */
const HarnessContext = createContext<ReactNode>(null);

/** Named rather than inline: a hook in an anonymous `component:` is not a component to the linter. */
function RootShell() {
  const held = useContext(HarnessContext);
  return (
    <>
      {held}
      <Outlet />
    </>
  );
}

/**
 * A router with the reference's real paths, because the viewer builds its own links and a stub
 * would let `categoryHref` agree with nothing.
 */
export function ApiHost({ at = '/api', children }: { at?: string; children: ReactNode }) {
  const [router] = useState(() => {
    const rootRoute = createRootRoute({ component: RootShell });
    const routeTree = rootRoute.addChildren(
      PATHS.map((path) => {
        return createRoute({
          getParentRoute: () => {
            return rootRoute;
          },
          path,
          component: () => {
            return null;
          },
        });
      })
    );
    return createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [at] }) });
  });

  return (
    <HarnessContext
      value={
        <ApiReferenceProvider slots={SLOTS} entryPoints={ENTRY_POINTS}>
          {children}
        </ApiReferenceProvider>
      }
    >
      <RouterProvider router={router} />
    </HarnessContext>
  );
}
