import { readFileSync } from 'node:fs';
import { dirname, posix, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Both quote styles, because a pattern that knows only one matches nothing the day a formatter
// changes its mind — and a walker that resolves nothing makes every assertion below pass. The
// package's own `verify:package` shipped exactly that bug until a `mustReach` assertion caught it.
const IMPORT_PATTERN = /(?:^|\n)\s*(?:import|export)[\s\S]*?from\s+["']([^"']+)["']/g;

/**
 * Comments go before the scan, because `[\s\S]*?` above crosses anything.
 *
 * An `export` with no `from` of its own pairs with the next one in the file, and a JSDoc `@example`
 * showing how to import this package is exactly that — one phantom edge from the package to itself,
 * asserted against a list that cannot contain it.
 */
function withoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:"'`])\/\/[^\n]*/g, '$1');
}

/** Every module the given entry can reach, as paths relative to `src`, and every package. */
function graphFrom(entry: string): { files: Set<string>; packages: Set<string> } {
  const files = new Set<string>();
  const packages = new Set<string>();
  const queue = [resolve(SRC, entry)];

  while (queue.length > 0) {
    const file = queue.pop();
    if (file === undefined || files.has(file)) {
      continue;
    }
    files.add(file);
    const source = withoutComments(readSource(file));
    for (const match of source.matchAll(IMPORT_PATTERN)) {
      const specifier = match[1] ?? '';
      if (!specifier.startsWith('.')) {
        packages.add(specifier.startsWith('solid-js/') ? 'solid-js' : specifier);
        continue;
      }
      // Shipped source carries `.js` on every relative import, which is what `tsc` copies into the
      // declarations; the file on disk is the `.ts` or `.tsx` beside it.
      queue.push(resolve(dirname(file), specifier.replace(/\.js$/, '')));
    }
  }

  return {
    files: new Set(
      [...files].map((file) => {
        return relative(SRC, file).split('\\').join(posix.sep);
      })
    ),
    packages,
  };
}

/** The extension is not in the specifier, so it is found here. */
function readSource(pathWithoutExtension: string): string {
  for (const candidate of [
    pathWithoutExtension,
    `${pathWithoutExtension}.ts`,
    `${pathWithoutExtension}.tsx`,
  ]) {
    try {
      return readFileSync(candidate, 'utf8');
    } catch {
      continue;
    }
  }
  return '';
}

/**
 * What each entry may reach, and what it must.
 *
 * The root's empty `packages` is the promise the whole package is built on. The `mustReach` half is
 * what stops that assertion from passing on a walker that resolved nothing at all — the way this
 * test fails silently if the resolution above ever breaks.
 */
const ENTRIES = [
  { entry: 'index.ts', packages: [] as string[], mustReach: 'core/create-bootstrap' },
  { entry: 'react.ts', packages: ['react'], mustReach: 'react/use-bootstrap' },
  { entry: 'solid.ts', packages: ['solid-js'], mustReach: 'solid/use-bootstrap' },
  { entry: 'plain.ts', packages: [] as string[], mustReach: 'plain/bind-bootstrap' },
];

for (const { entry, packages, mustReach } of ENTRIES) {
  test(`${entry} reaches only what it is allowed to`, () => {
    const graph = graphFrom(entry);

    expect([...graph.packages].sort()).toEqual([...packages].sort());
    expect(
      [...graph.files].some((file) => {
        return file.startsWith(mustReach);
      })
    ).toBe(true);
  });
}

test('the root reaches no binding', () => {
  const { files } = graphFrom('index.ts');
  expect(
    [...files].filter((file) => {
      return /^(react|solid|plain)\//.test(file);
    })
  ).toEqual([]);
});

test('no binding reaches another binding', () => {
  for (const binding of ['react', 'solid', 'plain']) {
    const { files } = graphFrom(`${binding}.ts`);
    const foreign = [...files].filter((file) => {
      return /^(react|solid|plain)\//.test(file) && !file.startsWith(`${binding}/`);
    });
    expect(foreign, `${binding}.ts reaches another binding`).toEqual([]);
  }
});
