import { expect, test } from '@playwright/test';
import { readFileSync, globSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The README's namespace table against the namespaces the code emits.
 *
 * A debugging path documented under a name nothing writes leads a reader nowhere, and one the code
 * writes but the table omits is invisible. Neither shows up in any other gate, and `setLogLevel` is
 * the only door onto them — antumbra also takes a `localStorage` key, so a reader there has a second
 * way to stumble on a name this package does not offer.
 */
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** The logger's own doc invents namespaces to show filtering; those are examples, not paths. */
const FIXTURE_SOURCES = new Set(['src/utils/logger.ts']);

/** Every `createLogger('…')` the shipped source actually emits. */
function emittedNamespaces(): Set<string> {
  const emitted = new Set<string>();
  for (const file of globSync('src/**/*.{ts,tsx}', { cwd: REPO })) {
    const path = file.split('\\').join('/');
    if (path.includes('__tests__/') || FIXTURE_SOURCES.has(path)) {
      continue;
    }
    for (const match of readFileSync(resolve(REPO, file), 'utf8').matchAll(
      /createLogger\('([^']+)'\)/g
    )) {
      emitted.add(match[1] as string);
    }
  }
  return emitted;
}

/**
 * Every namespace the README's table names, read out of its first column.
 *
 * Scoped to that one table by its own header, because the README is mostly tables and a scan of the
 * whole file would read a comparison row as a namespace.
 */
function documentedNamespaces(): Set<string> {
  const readme = readFileSync(resolve(REPO, 'README.md'), 'utf8');
  const heading = readme.indexOf('| Namespace');
  const table = heading === -1 ? '' : (readme.slice(heading).split('\n\n')[0] ?? '');
  return new Set(
    [...table.matchAll(/^\| `([a-z][a-z:-]*)`\s*\|/gm)].map((row) => {
      return row[1] as string;
    })
  );
}

test.describe('the documented log namespaces', () => {
  test('the scan finds something, so the checks below are not vacuous', () => {
    expect(emittedNamespaces().size).toBeGreaterThan(3);
    expect(documentedNamespaces().size).toBeGreaterThan(3);
  });

  test('every namespace the code emits is in the README table', () => {
    const documented = documentedNamespaces();
    const undocumented = [...emittedNamespaces()].filter((namespace) => {
      return !documented.has(namespace);
    });

    expect(
      undocumented.sort(),
      'These are switched on by `setLogLevel` and named nowhere a reader looks — add a row to the README table.'
    ).toEqual([]);
  });

  test('every namespace the README table names is one the code emits', () => {
    // The other direction: a row nobody writes to is a debugging path that answers with silence.
    const emitted = emittedNamespaces();
    const unwritten = [...documentedNamespaces()].filter((namespace) => {
      return !emitted.has(namespace);
    });

    expect(unwritten.sort(), 'These rows name no namespace the source emits.').toEqual([]);
  });
});
