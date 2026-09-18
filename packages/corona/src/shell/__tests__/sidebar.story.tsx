import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { createContext, useContext, useState, type ReactNode } from 'react';

import { Sidebar, type NavGroup } from '../Sidebar.js';
import type { PlaygroundSlug } from '../../site/playgrounds.js';

/** A glyph the host lends. Its drawing is not this package's, so the harness lends a letter. */
const Dot = () => {
  return <i data-testid="icon" />;
};

const GROUPS: readonly NavGroup[] = [
  {
    label: 'Learn',
    items: [
      { path: '/getting-started', label: 'Getting Started', icon: Dot },
      { path: '/api', label: 'API Reference', icon: Dot },
    ],
  },
  {
    label: 'Reference',
    items: [{ path: '/apiary', label: 'Apiary', icon: Dot }],
  },
];

const PATHS = ['/', '/getting-started', '/api', '/api/tokens', '/apiary'];

/** What the root route renders, handed down past the router's own memoisation. */
const HarnessContext = createContext<ReactNode>(null);

/**
 * The root route's component.
 *
 * Named and declared here rather than inline, because a hook in an anonymous function assigned to
 * `component:` is not a component as far as the rules-of-hooks rule can tell.
 */
function RootShell() {
  // Through context, not a ref: the router owns this element and does not re-render it when the
  // parent does, so a ref would hand it the children from the first render forever — and a harness
  // with state would watch its own updates go nowhere.
  const held = useContext(HarnessContext);
  return (
    <>
      {held}
      <Outlet />
    </>
  );
}

/**
 * A router with the real paths, because the drawer reads `state.location.pathname` and lights a row
 * from it. A stub would let the active-row rule pass without ever being exercised.
 *
 * **Built once, and the children reach it through context.** Creating the router during render made
 * a new one on every state change, which remounted the tree and threw the state away — so a harness
 * with an open/closed drawer could never observe itself opening.
 */
function Hosted({ at, children }: { readonly at: string; readonly children: ReactNode }) {
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
    <HarnessContext value={children}>
      <RouterProvider router={router} />
    </HarnessContext>
  );
}

const noop = () => {
  // The wide drawer never closes.
};

/** The wide drawer, on a route that no item names. */
export function SidebarWide() {
  return (
    <Hosted at="/">
      <Sidebar groups={GROUPS} current="boot" isMobile={false} mobileOpen={false} onClose={noop} />
    </Hosted>
  );
}

/** On `/api/tokens`: a segment deeper than an item, which must still light it. */
export function SidebarDeepRoute() {
  return (
    <Hosted at="/api/tokens">
      <Sidebar groups={GROUPS} current="boot" isMobile={false} mobileOpen={false} onClose={noop} />
    </Hosted>
  );
}

/** On `/apiary`: shares four characters with `/api` and is a different page. */
export function SidebarNeighbourRoute() {
  return (
    <Hosted at="/apiary">
      <Sidebar groups={GROUPS} current="boot" isMobile={false} mobileOpen={false} onClose={noop} />
    </Hosted>
  );
}

/** Seen from the dialog playground, so the way out offers the other two. */
export function SidebarFromDialog() {
  return (
    <Hosted at="/">
      <Sidebar
        groups={GROUPS}
        current={'dialog' satisfies PlaygroundSlug}
        isMobile={false}
        mobileOpen={false}
        onClose={noop}
      />
    </Hosted>
  );
}

/**
 * The mobile drawer, with the open state the shell owns.
 *
 * Stateful on purpose: the defect this guards was an effect that closed the drawer as soon as it
 * opened, and a harness passing a frozen `mobileOpen` could never have seen it.
 */
export function SidebarMobile() {
  const [open, setOpen] = useState(false);

  return (
    <Hosted at="/">
      <button
        type="button"
        data-testid="open"
        onClick={() => {
          setOpen(true);
        }}
      >
        open
      </button>
      <span data-testid="state">{open ? 'open' : 'closed'}</span>
      <Sidebar
        groups={GROUPS}
        current="boot"
        isMobile
        mobileOpen={open}
        onClose={() => {
          setOpen(false);
        }}
      />
    </Hosted>
  );
}
