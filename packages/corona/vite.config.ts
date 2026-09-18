import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { ctCoverage } from 'gnomon/vite-plugin-ct-coverage';

/**
 * The component suite's page, and nothing else is served from here.
 *
 * This package ships no application — it renders inside three playgrounds — so unlike theirs this
 * config exists only for the tests. `ct/` is the root: an `index.html`, a mount and a skin.
 */
const withCoverage = process.env['CT_COVERAGE'] === '1';

/* Annotated rather than spread inline: gnomon leaves the plugin's type to the caller, so that the
   instrumenter is typed by *this* project's vite and not a second copy of it. A spread into an
   array literal gives the call no position to infer from, and the type arrives as `unknown`. */
const coveragePlugins: Plugin[] = withCoverage ? [ctCoverage({ root: import.meta.dirname })] : [];

export default defineConfig({
  root: resolve(import.meta.dirname, 'ct'),
  // A cache of its own, like the port: Vite's dep optimizer deletes and rewrites this directory at
  // startup, so two servers sharing it hand each other's open pages chunk URLs that no longer exist.
  cacheDir: withCoverage
    ? resolve(import.meta.dirname, 'node_modules/.vite-coverage')
    : resolve(import.meta.dirname, 'node_modules/.vite'),
  plugins: [...coveragePlugins, react()],
  resolve: {
    alias: {
      // The harnesses reach the package the way a consumer does, so a broken `exports` map fails
      // here rather than only at a consumer's build.
      corona: resolve(import.meta.dirname, 'src'),
    },
  },
  server: { port: 3003, strictPort: true },
  preview: { port: 4003, strictPort: true },
});
