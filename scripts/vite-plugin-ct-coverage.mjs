import { createInstrumenter } from 'istanbul-lib-instrument';
import { relative, resolve } from 'node:path';

/**
 * Istanbul instrumentation for the component run, applied to the **source** at `enforce: 'pre'`.
 * `vite-plugin-istanbul` runs `'post'`, instrumenting stripped output and remapping, which lands
 * every counter below a file's JSDoc block early and reports exercised exports as never executed.
 *
 * Failure mode: the path filter must be separator-normalised, or on Windows `relative()` answers
 * `src\core\run.ts`, nothing is instrumented, and the empty report reads as a forgotten flag.
 *
 * Wired into the playground's vite config, gated on `CT_COVERAGE=1`. It instruments the library's
 * `src/` — which the playground aliases to `../src` — and not the playground's own, because the
 * harness is the test and not the subject.
 *
 * @param {{ include?: (id: string) => boolean }} [options]
 */
export const ctCoverage = (options = {}) => {
  const root = resolve(import.meta.dirname, '..');

  const shouldInstrument =
    options.include ??
    ((id) => {
      const path = relative(root, id).replaceAll('\\', '/');
      return (
        path.startsWith('src/') &&
        /\.tsx?$/.test(path) &&
        // The harnesses are the test, not the subject.
        !path.includes('__tests__/')
      );
    });

  const instrumenter = createInstrumenter({
    esModules: true,
    coverageVariable: '__coverage__',
    // Without these Babel meets `: string`, stops, and the plugin silently instruments nothing.
    parserPlugins: ['typescript', 'jsx', 'importMeta', 'topLevelAwait'],
  });

  return {
    name: 'antumbra:ct-coverage',
    enforce: 'pre',
    transform(code, id) {
      const [path] = id.split('?');
      if (!path || !shouldInstrument(path)) {
        return null;
      }
      return {
        code: instrumenter.instrumentSync(code, path),
        map: instrumenter.lastSourceMap() ?? null,
      };
    },
  };
};
