import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rolldown } from 'rolldown';
import type { Plugin } from 'vite';

const HERE = dirname(fileURLToPath(import.meta.url));
const SHARED_DIR = resolve(HERE, '../mfe-src');
const COPY_DIR = resolve(HERE, '../mfe-src-copy');
const LIB_ROOT = resolve(HERE, '../../src');
const PUBLIC_DIR = resolve(HERE, '../public/mfe');
const PUBLIC_PREFIX = '/mfe/';

/**
 * Frame sources as text, so the code viewer shows the bytes the browser runs.
 *
 * `public/` is mounted at `/` with no importable address, so a `?raw` import of these files either
 * warns on every dev page load or fails the build. Reading them here works.
 */
const VIRTUAL_SOURCES = 'virtual:mfe-sources';
const RESOLVED_SOURCES = `\0${VIRTUAL_SOURCES}`;

const SOURCE_FILES: Readonly<Record<string, string>> = {
  host: 'host.html',
  topbar: 'frag-topbar.js',
  nav: 'frag-nav.js',
  list: 'frag-list.js',
  trial: 'frag-trial.js',
  spaHost: '../spa/spa.html',
  spaRoot: '../spa/root-config.js',
  spaDashboard: '../spa/app-dashboard.js',
  spaReports: '../spa/app-reports.js',
};

/** Everything the host's import map names and expects to be shared. */
const SHARED_ENTRIES = [
  'antumbra',
  'antumbra-react',
  'antumbra-solid',
  'antumbra-vanilla',
  'react',
  'react-dom-client',
  'solid-js',
  'solid-js-web',
  'solid-js-h',
  'single-spa',
] as const;

/**
 * Two builds, and the second one is the point.
 *
 * The first hoists what its nine entries share into common chunks, so three fragments and the two
 * frameworks resolve to one copy of everything — the arrangement a host that deduplicates properly
 * produces, and the one umbra-style module-singleton sharing requires.
 *
 * The second builds the library again, alone, under its own name. The fourth fragment imports that,
 * so it genuinely holds a second instance: separate closures, separate module state. It still shares
 * the page's work, because the registry that holds it is keyed by `Symbol.for` on `globalThis` and
 * not by module identity. One build would prove nothing about that.
 */
export function mfeAntumbraPlugin(): Plugin {
  let cached: Map<string, string> | null = null;

  const bundle = async (): Promise<Map<string, string>> => {
    const files = new Map<string, string>();

    const shared = await rolldown({
      input: Object.fromEntries(
        SHARED_ENTRIES.map((name) => {
          return [name, resolve(SHARED_DIR, `${name}.ts`)];
        })
      ),
    });
    const sharedOutput = await shared.generate({
      format: 'esm',
      minify: true,
      entryFileNames: '[name].mjs',
      chunkFileNames: 'shared-[hash].mjs',
    });
    await shared.close();

    const copy = await rolldown({
      input: { 'antumbra-copy': resolve(COPY_DIR, 'antumbra-copy.ts') },
    });
    const copyOutput = await copy.generate({
      format: 'esm',
      minify: true,
      entryFileNames: '[name].mjs',
      // Named apart so the two builds cannot collide in one directory, which would silently make
      // the "own copy" fragment share after all and turn the demo into a lie.
      chunkFileNames: 'copy-[hash].mjs',
    });
    await copy.close();

    for (const chunk of [...sharedOutput.output, ...copyOutput.output]) {
      if (chunk.type === 'chunk') {
        files.set(chunk.fileName, chunk.code);
      }
    }
    return files;
  };

  return {
    name: 'antumbra:mfe-bundle',

    resolveId(id) {
      return id === VIRTUAL_SOURCES ? RESOLVED_SOURCES : null;
    },

    async load(id) {
      if (id !== RESOLVED_SOURCES) {
        return null;
      }
      const exports = await Promise.all(
        Object.entries(SOURCE_FILES).map(async ([name, file]) => {
          const text = await readFile(join(PUBLIC_DIR, file), 'utf8');
          // The module is virtual, so nothing else ties an edit here to the viewer in dev.
          this.addWatchFile(join(PUBLIC_DIR, file));
          return `export const ${name} = ${JSON.stringify(text)};`;
        })
      );
      return exports.join('\n');
    },

    configureServer(server) {
      // `mfe-src/` and the library too: both are outside the playground's `src/`, so nothing else
      // notices an edit and the bundle goes stale.
      for (const directory of [LIB_ROOT, SHARED_DIR, COPY_DIR]) {
        server.watcher.add(directory);
      }
      server.watcher.on('change', (file) => {
        const changed = resolve(file);
        if (
          [LIB_ROOT, SHARED_DIR, COPY_DIR].some((root) => {
            return changed.startsWith(root);
          })
        ) {
          cached = null;
        }
      });

      // oxlint-disable-next-line max-params -- Connect's handler signature, not ours: `use` calls it with three arguments, and a middleware that declares two never sees `next`
      server.middlewares.use(PUBLIC_PREFIX, (request, response, next) => {
        // Chunk names are only known after a build, so everything else falls through untouched.
        const name = (request.url ?? '').replace(/^\//, '').split('?')[0] ?? '';
        if (!name.endsWith('.mjs')) {
          next();
          return;
        }

        void (async () => {
          try {
            cached ??= await bundle();
            const code = cached.get(name);
            if (code === undefined) {
              next();
              return;
            }
            response.setHeader('Content-Type', 'text/javascript');
            response.setHeader('Cache-Control', 'no-cache');
            response.end(code);
          } catch (error: unknown) {
            next(error);
          }
        })();
      });
    },

    async generateBundle() {
      for (const [fileName, source] of await bundle()) {
        this.emitFile({ type: 'asset', fileName: `mfe/${fileName}`, source });
      }
    },
  };
}
