import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { apiModelPlugin } from './vite-plugins/api-model.js';
import { mfeUmbraPlugin } from './vite-plugins/mfe-umbra.js';
import { ctCoverage } from 'gnomon/vite-plugin-ct-coverage';

// Set VITE_HASH_ROUTER=true to build for file:// (no server needed)
const hashRouter = process.env['VITE_HASH_ROUTER'] === 'true';

/**
 * Component-test coverage, opt-in through `CT_COVERAGE=1` — and it lives here because this is the
 * bundler the component suite runs on. A component test's subject runs in the browser, so c8 has no
 * Node process to measure: the library source is instrumented on the way in, counters land on
 * `window.__coverage__`, and `src/__tests__/ct-test.ts` reads them back per test. Off by default;
 * the numbers are only wanted when asked for.
 */
const withCoverage = process.env['CT_COVERAGE'] === '1';

/* Annotated rather than spread inline: gnomon leaves the plugin's type to the caller, so that the
   instrumenter is typed by *this* project's vite and not a second copy of it. A spread into an
   array literal gives the call no position to infer from, and the type arrives as `unknown`. */
const coveragePlugins: Plugin[] = withCoverage
  ? [ctCoverage({ root: resolve(import.meta.dirname, '..') })]
  : [];

// The playground consumes the library through its public specifiers, aliased to source. Importing
// `../src` directly would demo a shape no consumer ever sees.
export default defineConfig({
  // Deployed under /playground/boot/ on the site, and opened straight off the disk otherwise:
  // neither has the bundle at the server root, so the asset URLs go relative with the hash router.
  base: hashRouter ? './' : '/',
  // A cache of its own, like the port: Vite's dep optimizer deletes and rewrites this directory at
  // startup, so two servers sharing it hand each other's open pages chunk URLs that no longer exist.
  cacheDir: withCoverage ? 'node_modules/.vite-coverage' : 'node_modules/.vite',
  // The instrumenter goes first: it wants the file as written, so its counters land on source lines.
  plugins: [...coveragePlugins, react(), mfeUmbraPlugin(), apiModelPlugin()],
  resolve: {
    // One React in the bundle whatever the layout of node_modules. Each workspace group is its own
    // hoisting boundary, so a shared package resolves `react` from its own position and a second
    // copy reaches the page as "Invalid hook call" at run time, not as a build error.
    dedupe: ['react', 'react-dom', '@tanstack/react-router'],
    // The router belongs on that list for the same reason and it is not obvious: a router is
    // a *value*, registered by the provider this app renders. A second copy resolves to an
    // empty one, and every hook reading it throws on null — type-checked, built, and dead on
    // the page. The smoke test is what saw it.
    // The array form, because the four entry points have to match *exactly*: as bare string keys
    // they match by prefix, so `umbra/react/__tests__/x` would resolve against `react.ts` and
    // land on a path inside a file. Anchored patterns say what each one means, and the trailing
    // rule then carries every other subpath into `src/` — which is how the playground reaches the
    // harnesses that live beside the code they exercise.
    alias: [
      // Absolute imports inside the playground, so a file that moves between layers does not drag a
      // trail of `../../..` with it.
      { find: '@', replacement: resolve(import.meta.dirname, 'src') },
      { find: /^umbra\/react$/, replacement: resolve(import.meta.dirname, '../src/react.ts') },
      { find: /^umbra\/solid$/, replacement: resolve(import.meta.dirname, '../src/solid.ts') },
      {
        find: /^umbra\/plain$/,
        replacement: resolve(import.meta.dirname, '../src/plain.ts'),
      },
      { find: /^umbra$/, replacement: resolve(import.meta.dirname, '../src/index.ts') },
      { find: /^umbra\//, replacement: `${resolve(import.meta.dirname, '../src')}/` },
    ],
  },
  // Left to itself the scanner walks `public/`, finds the fragment that imports `umbra-copy` —
  // a specifier only the frames' import map knows — and gives up on pre-bundling for the whole dev
  // server. The app's entry is the only one it needs.
  optimizeDeps: { entries: ['index.html'] },
  // Ports are assigned across the repository rather than negotiated at startup, and the table lives
  // in the root README. `strictPort` is the half that matters: without it Vite slides quietly to the
  // next free port, and a Playwright run then reuses whatever answers -- which for an SPA is a 200
  // and the wrong application.
  server: { port: 3002, strictPort: true },
  preview: { port: 4002, strictPort: true },
});
