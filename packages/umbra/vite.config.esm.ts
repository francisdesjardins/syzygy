import { resolve } from 'node:path';
import { type Plugin, defineConfig } from 'vite';

/**
 * JSDoc is the published API documentation, and typedoc reads it from source. Shipping it in the
 * bundle too would put the same prose in every consumer's build output.
 */
function stripJSDoc(): Plugin {
  return {
    name: 'strip-jsdoc',
    renderChunk(code) {
      return code.replace(/\/\*\*[\s\S]*?\*\//g, '');
    },
  };
}

export default defineConfig({
  // Declarations are emitted by `tsc -p tsconfig.build.json` in the `build:esm` script rather than
  // by a Vite plugin, so the published types cannot drift from what `type-check` validated.
  plugins: [stripJSDoc()],
  build: {
    lib: {
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        react: resolve(import.meta.dirname, 'src/react.ts'),
        solid: resolve(import.meta.dirname, 'src/solid.ts'),
        plain: resolve(import.meta.dirname, 'src/plain.ts'),
      },
      formats: ['es'],
    },
    rolldownOptions: {
      // Every optional peer stays external. Bundling one would put a second copy of a framework in
      // a consumer's app, which for both React and Solid means two module-level runtimes and
      // nothing working. `react/jsx-runtime` is on the list because it is a subpath rather than a
      // package, and a bare `id === 'react'` check misses exactly that shape.
      external: (id) => {
        return (
          id === 'react' ||
          id === 'react-dom' ||
          id === 'react/jsx-runtime' ||
          id === 'solid-js' ||
          id.startsWith('solid-js/')
        );
      },
      output: {
        preserveModules: true,
        entryFileNames: (chunkInfo) => {
          return `${chunkInfo.name.replace(/^src\//, '')}.js`;
        },
        exports: 'named',
      },
    },
    outDir: 'dist/esm',
    sourcemap: false,
    target: 'es2024',
    minify: false,
  },
});
