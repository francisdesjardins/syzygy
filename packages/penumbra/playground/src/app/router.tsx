import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
} from '@tanstack/react-router';

import { AppRoot } from '@/app/AppRoot';
import { RoutePending } from '@/app/RoutePending';

const rootRoute = createRootRoute({ component: AppRoot });

// One `const` per route rather than a helper that builds them. A helper widens the path to `string`
// in the route tree, and the tree is what types `Link`, `useParams` and `useSearch` — so every
// caller loses its types and the errors land on the callers rather than on the helper.

const indexRoute = createRoute({
  getParentRoute: () => {
    return rootRoute;
  },
  path: '/',
  component: lazyRouteComponent(() => {
    return import('@/pages/home');
  }, 'HomePage'),
});

const tokensRoute = createRoute({
  getParentRoute: () => {
    return rootRoute;
  },
  path: '/tokens',
  component: lazyRouteComponent(() => {
    return import('@/pages/tokens');
  }, 'TokensPage'),
});

const skinsRoute = createRoute({
  getParentRoute: () => {
    return rootRoute;
  },
  path: '/skins',
  component: lazyRouteComponent(() => {
    return import('@/pages/skins');
  }, 'SkinsPage'),
});

const rulesRoute = createRoute({
  getParentRoute: () => {
    return rootRoute;
  },
  path: '/rules',
  component: lazyRouteComponent(() => {
    return import('@/pages/rules');
  }, 'RulesPage'),
});

const routeTree = rootRoute.addChildren([indexRoute, tokensRoute, skinsRoute, rulesRoute]);

// A build meant to be opened from a file, or served by a host that rewrites nothing, has no server
// to map a path onto the bundle — so the whole route moves into the hash.
const history = import.meta.env['VITE_HASH_ROUTER'] === 'true' ? createHashHistory() : undefined;

export const router = createRouter({
  routeTree,
  // Route components are lazy, so without `intent` the chunk's round trip sits between the click and
  // the first paint. The delay stops a pointer sweeping the sidebar from pulling every page.
  defaultPreload: 'intent',
  defaultPreloadDelay: 50,
  // For what preloading cannot cover — keyboard, touch, a cold link — the default is to hold the
  // previous page with nothing saying the click registered.
  defaultPendingComponent: RoutePending,
  defaultPendingMs: 150,
  ...(history === undefined ? {} : { history }),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
