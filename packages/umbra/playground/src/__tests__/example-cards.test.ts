import { expect, test } from '@playwright/test';
import { readFileSync, globSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The code viewer against the pages, in both directions.
 *
 * A key no sample answers opens an empty dialog, which only a reader meets. A sample no page names
 * is inlined into the bundle for nobody — six outlived the page that showed them.
 *
 * `ExampleCard`'s own rule, that a demonstration should be readable, is **not** gated here: a
 * section of switches or prose owes no source, and a first pass flagged seven of those against one
 * real gap. An exemption list longer than the findings is a list nobody maintains.
 */
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Every `codeKey` the playground's pages name. */
function named(): Set<string> {
  const keys = new Set<string>();
  for (const file of globSync('src/**/*.tsx', { cwd: REPO })) {
    const source = readFileSync(resolve(REPO, file), 'utf8');
    for (const match of source.matchAll(/codeKey="([^"]+)"/g)) {
      keys.add(match[1] as string);
    }
  }
  return keys;
}

/** The keys `code-samples.ts` can answer for. */
function registered(): Set<string> {
  const source = readFileSync(
    resolve(REPO, 'src/widgets/code-viewer/model/code-samples.ts'),
    'utf8'
  );
  return new Set(
    [...source.slice(source.indexOf('codeSamples')).matchAll(/^\s*'([^']+)':\s*\{/gm)].map(
      (row) => {
        return row[1] as string;
      }
    )
  );
}

test.describe('the code viewer and the pages agree', () => {
  test('both scans find something, so the checks below are not vacuous', () => {
    expect(named().size).toBeGreaterThan(5);
    expect(registered().size).toBeGreaterThan(5);
  });

  test('every key a page names resolves to a sample', () => {
    const samples = registered();
    const dangling = [...named()].filter((key) => {
      return !samples.has(key);
    });

    expect(dangling.sort(), 'These name a sample that code-samples.ts does not carry.').toEqual([]);
  });

  test('every sample is named by a page', () => {
    const keys = named();
    const orphans = [...registered()].filter((key) => {
      return !keys.has(key);
    });

    expect(
      orphans.sort(),
      'These are read with ?raw and inlined into the bundle, and no page can show them. Name one from a card, or drop it.'
    ).toEqual([]);
  });
});
