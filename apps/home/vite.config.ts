import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Serve an assembled playground in dev the way Cloudflare serves it in production.
 *
 * Each playground is its own build, dropped into `public/playground/<capability>/` by the deploy.
 * A request for the bare directory has to reach that build's `index.html`; without this it falls
 * through to the SPA, which renders the home instead — the same silent wrong answer the
 * `_redirects` rules exist to prevent, one layer earlier.
 *
 * The names here are capabilities, not libraries: `dialog` and `boot` outlive whatever the
 * packages behind them are called.
 */
const playgroundRewrites = {
  name: "playground-rewrites",
  configureServer(server: import("vite").ViteDevServer): void {
    server.middlewares.use((req, _res, next) => {
      if (req.url) {
        req.url = req.url.replace(/^(\/playground\/(?:dialog|boot)\/)(\?.*)?$/, "$1index.html$2");
      }
      next();
    });
  },
};

export default defineConfig({
  plugins: [react(), playgroundRewrites],
  build: {
    target: "es2024",
    minify: "oxc",
    sourcemap: false,
    rolldownOptions: {
      output: {
        manualChunks(id: string): string | undefined {
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) {
            return "vendor";
          }
          if (
            id.includes("node_modules/@mui/material") ||
            id.includes("node_modules/@mui/icons-material")
          ) {
            return "mui";
          }
          return undefined;
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 4173,
  },
});
