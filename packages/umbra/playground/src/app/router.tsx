import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
} from '@tanstack/react-router';
import { AppRoot } from '@/app/AppRoot';
import { RoutePending } from '@/app/RoutePending';
import { readScope } from '@/pages/microfrontends/model/scope';

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

const gettingStartedRoute = createRoute({
  getParentRoute: () => {
    return rootRoute;
  },
  path: '/getting-started',
  component: lazyRouteComponent(() => {
    return import('@/pages/getting-started');
  }, 'GettingStartedPage'),
});

const microfrontendsRoute = createRoute({
  getParentRoute: () => {
    return rootRoute;
  },
  path: '/microfrontends',
  // The scope control is a pair of links rather than state, so the setting has to survive in the
  // address: the page carries a link of its own, inside the frame, next to the number it changes.
  // Two controls for one setting disagree the moment either is used.
  validateSearch: readScope,
  component: lazyRouteComponent(() => {
    return import('@/pages/microfrontends');
  }, 'MicrofrontendsPage'),
});

const singleSpaRoute = createRoute({
  getParentRoute: () => {
    return rootRoute;
  },
  path: '/single-spa',
  component: lazyRouteComponent(() => {
    return import('@/pages/single-spa');
  }, 'SingleSpaPage'),
});

const designSystemRoute = createRoute({
  getParentRoute: () => {
    return rootRoute;
  },
  path: '/skin',
  component: lazyRouteComponent(() => {
    return import('@/pages/skin');
  }, 'SkinPage'),
});

const apiRoute = createRoute({
  getParentRoute: () => {
    return rootRoute;
  },
  path: '/api',
  component: lazyRouteComponent(() => {
    return import('@/pages/api');
  }, 'ApiIndexPage'),
});

// One page per chapter — `/api` itself is the map, not a seventy-symbol list.
const apiCategoryRoute = createRoute({
  getParentRoute: () => {
    return rootRoute;
  },
  path: '/api/$category',
  component: lazyRouteComponent(() => {
    return import('@/pages/api');
  }, 'ApiCategoryPage'),
});

const storiesRoute = createRoute({
  getParentRoute: () => {
    return rootRoute;
  },
  path: '/stories',
  // The one route with a search parameter of its own, because the component suite addresses a
  // harness by id.
  validateSearch: (search: Record<string, unknown>): { story?: string } => {
    return typeof search['story'] === 'string' ? { story: search['story'] } : {};
  },
  component: lazyRouteComponent(() => {
    return import('@/pages/stories');
  }, 'StoriesPage'),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  gettingStartedRoute,
  microfrontendsRoute,
  singleSpaRoute,
  designSystemRoute,
  apiRoute,
  apiCategoryRoute,
  storiesRoute,
]);

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
