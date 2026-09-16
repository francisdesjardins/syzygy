import { createInstrumenter } from 'istanbul-lib-instrument';
import { relative } from 'node:path';

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
 * `root` is the library package's directory, and the caller passes it because only the caller can
 * know it: this file lives in a package of its own, so its own location says nothing about whose
 * sources are being measured. A wrong root is the quiet failure — the filter matches nothing and
 * the empty report reads as a forgotten flag.
 *
 * @param {{ root: string; include?: (id: string) => boolean }} options
 */
export const ctCoverage = (options) => {
  const { root } = options;
  if (typeof root !== 'string') {
    throw new TypeError('ctCoverage({ root }) needs the library package directory.');
  }

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
    name: 'gnomon:ct-coverage',
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
