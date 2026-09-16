import { expect, test } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';

/**
 * Every component test takes its `test` from [ct-test.ts](ct-test.ts), and **two things go quiet
 * where one does not**: its counters are dropped, so the component report is wrong rather than
 * merely low, and its page may throw with nothing watching. The bindings sit on `.c8rc.json`'s
 * exclude list, so the component report is their only possible measurement.
 *
 * A test, not a lint rule, because the claim is about a *set of files* being complete.
 */

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');
const ROOTS = [resolve(REPO_ROOT, 'src'), resolve(REPO_ROOT, 'playground', 'src')];

function findComponentTests(directory: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...findComponentTests(path));
    } else if (entry.name.endsWith('.ct.ts')) {
      found.push(path);
    }
  }
  return found;
}

const componentTests = ROOTS.flatMap(findComponentTests);

test.describe('CT test wiring', () => {
  test('there are component tests to check', () => {
    // Not per root, unlike umbra's: the playground here has no component tests of its own yet, and
    // asserting one into existence would be a test about a plan rather than about the code.
    expect(componentTests.length).toBeGreaterThan(0);
  });

  test('none of them import test from the runner directly', () => {
    const unwired = componentTests
      .filter((path) => {
        return /import\s*\{[^}]*\btest\b[^}]*\}\s*from\s*'@playwright\/test'/.test(
          readFileSync(path, 'utf8')
        );
      })
      .map((path) => {
        return relative(REPO_ROOT, path);
      });

    expect(
      unwired,
      `These import \`test\` from the runner, so their coverage is discarded and nothing watches their page for an uncaught error. Import { expect, test } from the ct-test fixture instead: ${unwired.join(', ')}`
    ).toEqual([]);
  });

  test('each one reaches the fixture', () => {
    // The positive half — the check above rejects one spelling; this fails if the fixture moves and
    // the imports point nowhere, which `type-check` catches only for files it still compiles.
    const missing = componentTests
      .filter((path) => {
        return !readFileSync(path, 'utf8').includes("ct-test.js'");
      })
      .map((path) => {
        return relative(REPO_ROOT, path);
      });

    expect(missing).toEqual([]);
  });
});
