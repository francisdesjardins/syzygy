import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { apiModelPlugin } from './vite-plugins/api-model.js';
import { mfeAntumbraPlugin } from './vite-plugins/mfe-antumbra.js';

// Set VITE_HASH_ROUTER=true to build for file:// (no server needed)
const hashRouter = process.env['VITE_HASH_ROUTER'] === 'true';

// The playground consumes the library through its public specifiers, aliased to source. Importing
// `../src` directly would demo a shape no consumer ever sees.
export default defineConfig({
  // Deployed under /playground/antumbra/ on the site, and opened straight off the disk otherwise:
  // neither has the bundle at the server root, so the asset URLs go relative with the hash router.
  base: hashRouter ? './' : '/',
  plugins: [react(), mfeAntumbraPlugin(), apiModelPlugin()],
  resolve: {
    alias: {
      // Absolute imports inside the playground, so a file that moves between layers does not drag a
      // trail of `../../..` with it.
      '@': resolve(import.meta.dirname, 'src'),
      'antumbra/react': resolve(import.meta.dirname, '../src/react.ts'),
      'antumbra/solid': resolve(import.meta.dirname, '../src/solid.ts'),
      'antumbra/vanilla': resolve(import.meta.dirname, '../src/vanilla.ts'),
      antumbra: resolve(import.meta.dirname, '../src/index.ts'),
    },
  },
  // Left to itself the scanner walks `public/`, finds the fragment that imports `antumbra-copy` —
  // a specifier only the frames' import map knows — and gives up on pre-bundling for the whole dev
  // server. The app's entry is the only one it needs.
  optimizeDeps: { entries: ['index.html'] },
  server: { port: 3000 },
});
