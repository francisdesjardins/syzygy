import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import type { ViteDevServer } from 'vite';

/**
 * Serve an assembled playground in dev the way Cloudflare serves it in production.
 *
 * Each playground is its own build, dropped into `public/playground/<capability>/` by the deploy.
 * A request for the bare directory has to reach that build's `index.html`; without this it falls
 * through to the SPA, which renders the home instead — the same silent wrong answer the
 * `_redirects` rules exist to prevent, one layer earlier.
 *
 * The names here are capabilities, not libraries: `dialog`, `boot` and `design` outlive whatever
 * the packages behind them are called. **The list has to grow with `PLAYGROUNDS` in `deploy.mjs`**
 * — a capability missing here is served the home page instead of its playground, which looks like
 * a routing bug in the playground and is not one.
 */
const playgroundRewrites = {
  name: 'playground-rewrites',
  configureServer(server: ViteDevServer): void {
    // eslint-disable-next-line max-params -- connect's middleware arity is the framework's.
    server.middlewares.use((req, _res, next) => {
      if (req.url) {
        req.url = req.url.replace(
          /^(\/playground\/(?:dialog|boot|design)\/)(\?.*)?$/,
          '$1index.html$2'
        );
      }
      next();
    });
  },
};

export default defineConfig({
  plugins: [react(), playgroundRewrites],
  build: {
    target: 'es2024',
    minify: 'oxc',
    sourcemap: false,
    rolldownOptions: {
      output: {
        manualChunks(id: string): string | undefined {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor';
          }
          return undefined;
        },
      },
    },
  },
  // Ports are assigned across the repository rather than negotiated at startup, and the table lives
  // in the root README. `strictPort` is the half that matters: without it Vite slides quietly to the
  // next free port, and a Playwright run then reuses whatever answers -- which for an SPA is a 200
  // and the wrong application.
  server: {
    port: 3000,
    strictPort: true,
    open: true,
  },
  preview: {
    port: 4000,
    strictPort: true,
  },
});
