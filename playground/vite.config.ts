import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { apiModelPlugin } from './vite-plugins/api-model.js';
import { mfeAntumbraPlugin } from './vite-plugins/mfe-antumbra.js';
import { ctCoverage } from '../scripts/vite-plugin-ct-coverage.mjs';

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

// The playground consumes the library through its public specifiers, aliased to source. Importing
// `../src` directly would demo a shape no consumer ever sees.
export default defineConfig({
  // Deployed under /playground/antumbra/ on the site, and opened straight off the disk otherwise:
  // neither has the bundle at the server root, so the asset URLs go relative with the hash router.
  base: hashRouter ? './' : '/',
  // A cache of its own, like the port: Vite's dep optimizer deletes and rewrites this directory at
  // startup, so two servers sharing it hand each other's open pages chunk URLs that no longer exist.
  cacheDir: withCoverage ? 'node_modules/.vite-coverage' : 'node_modules/.vite',
  // The instrumenter goes first: it wants the file as written, so its counters land on source lines.
  plugins: [
    ...(withCoverage ? [ctCoverage()] : []),
    react(),
    mfeAntumbraPlugin(),
    apiModelPlugin(),
  ],
  resolve: {
    // The array form, because the four entry points have to match *exactly*: as bare string keys
    // they match by prefix, so `antumbra/react/__tests__/x` would resolve against `react.ts` and
    // land on a path inside a file. Anchored patterns say what each one means, and the trailing
    // rule then carries every other subpath into `src/` — which is how the playground reaches the
    // harnesses that live beside the code they exercise.
    alias: [
      // Absolute imports inside the playground, so a file that moves between layers does not drag a
      // trail of `../../..` with it.
      { find: '@', replacement: resolve(import.meta.dirname, 'src') },
      { find: /^antumbra\/react$/, replacement: resolve(import.meta.dirname, '../src/react.ts') },
      { find: /^antumbra\/solid$/, replacement: resolve(import.meta.dirname, '../src/solid.ts') },
      {
        find: /^antumbra\/plain$/,
        replacement: resolve(import.meta.dirname, '../src/plain.ts'),
      },
      { find: /^antumbra$/, replacement: resolve(import.meta.dirname, '../src/index.ts') },
      { find: /^antumbra\//, replacement: `${resolve(import.meta.dirname, '../src')}/` },
    ],
  },
  // Left to itself the scanner walks `public/`, finds the fragment that imports `antumbra-copy` —
  // a specifier only the frames' import map knows — and gives up on pre-bundling for the whole dev
  // server. The app's entry is the only one it needs.
  optimizeDeps: { entries: ['index.html'] },
  server: { port: 3000 },
});
