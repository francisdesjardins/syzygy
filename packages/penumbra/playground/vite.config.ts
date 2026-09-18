import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Set VITE_HASH_ROUTER=true to build for file:// (no server needed)
const hashRouter = process.env['VITE_HASH_ROUTER'] === 'true';

export default defineConfig({
  // Deployed under /playground/design/ on the site, and opened straight off the disk otherwise:
  // neither has the bundle at the server root, so the asset URLs go relative with the hash router.
  base: hashRouter ? './' : '/',
  plugins: [react()],
  resolve: {
    // One React in the bundle whatever the layout of node_modules. Each workspace group is its own
    // hoisting boundary, so a shared package resolves `react` from its own position and a second
    // copy reaches the page as "Invalid hook call" at run time, not as a build error. The router
    // belongs on the list for the same reason and it is not obvious: it is a *value*, registered by
    // the provider this app renders, and a second copy resolves to an empty one.
    dedupe: ['react', 'react-dom', '@tanstack/react-router'],
    alias: [
      // Absolute imports inside the playground, so a file that moves between layers does not drag a
      // trail of `../../..` with it.
      { find: '@', replacement: resolve(import.meta.dirname, 'src') },
    ],
  },
  // Ports are assigned across the repository rather than negotiated at startup, and the table lives
  // in the root README. `strictPort` is the half that matters: without it Vite slides quietly to the
  // next free port, and a run then reuses whatever answers — which for an SPA is a 200 and the
  // wrong application.
  server: { port: 3004, strictPort: true },
  preview: { port: 4004, strictPort: true },
});
